// Book search through Open Library (https://openlibrary.org/dev/docs/api/search), for the
// library panel and for matching books read off shelf photos.
// Free and keyless, but limited to 3 requests a second for identified callers, so the
// User-Agent names the app and a contact address as Open Library asks, calls are spaced
// out, and answers are cached.
import { HttpError } from '../utils/HttpError.js';

const SEARCH_URL = 'https://openlibrary.org/search.json';
const COVERS = 'https://covers.openlibrary.org/b/id';
const HEADERS = { 'User-Agent': 'Bookfolio/1.0 (support@bookfolio.live)' };
const FIELDS = 'key,title,author_name,first_publish_year,cover_i';
const LIMIT = 20;
const TIMEOUT_MS = 8000;
const MIN_GAP_MS = 350; // Just under 3 calls a second.
const MAX_WAIT_MS = 5000; // Past this, say "busy" instead of queueing.
const CACHE_MS = 60 * 60 * 1000;
const CACHE_SIZE = 500;

const BUSY = 'Book search is busy right now. Try again in a few seconds.';

// Lower-cased query -> { expires, result } where result is the (possibly still pending)
// search, so readers typing the same thing at once share one Open Library call.
const cache = new Map();
let nextSlot = 0;

// Waits for this call's turn so calls start at least MIN_GAP_MS apart.
async function takeTurn() {
  const now = Date.now();
  const start = Math.max(now, nextSlot);
  if (start - now > MAX_WAIT_MS) throw new HttpError(503, BUSY);
  nextSlot = start + MIN_GAP_MS;
  if (start > now) await new Promise(resolve => setTimeout(resolve, start - now));
}

// Open Library documents -> shelf books, keeping the first author (as Goodreads does)
// and dropping untitled, authorless and repeated title + author pairs. Some imported
// records name the author "Paulo Coelho (Author)"; the role is dropped.
export function toBooks(docs = []) {
  const seen = new Set();
  return docs.flatMap(doc => {
    const id = String(doc.key ?? '').split('/').pop();
    const title = doc.title?.trim();
    const author = doc.author_name?.[0]?.replace(/\s*\((?:author|editor|illustrator|translator)\)$/i, '').trim();
    const key = `${title}\u0000${author}`.toLowerCase();
    if (!id || !title || !author || seen.has(key)) return [];
    seen.add(key);
    return [{
      openLibraryId: id,
      title,
      author,
      cover: Number.isInteger(doc.cover_i) && doc.cover_i > 0 ? `${COVERS}/${doc.cover_i}-L.jpg` : null,
      year: Number.isInteger(doc.first_publish_year) ? doc.first_publish_year : null,
    }];
  });
}

async function fetchDocs(query, limit) {
  await takeTurn();
  const url = `${SEARCH_URL}?${new URLSearchParams({ q: query, fields: FIELDS, limit: String(limit) })}`;
  let response;
  try {
    response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new HttpError(504, 'The book library took too long to answer. Try again.');
  }
  if (response.status === 429) throw new HttpError(503, BUSY);
  if (!response.ok) {
    console.warn(`Open Library answered ${response.status} for "${query}".`);
    throw new HttpError(502, 'The book library didn’t respond. Try again in a minute.');
  }
  const { docs } = await response.json();
  return docs ?? [];
}

export function searchBooks(input) {
  const query = String(input ?? '').trim().replace(/\s+/g, ' ');
  if (query.length < 2) return Promise.reject(new HttpError(400, 'Type at least 2 characters to search.'));
  if (query.length > 100) return Promise.reject(new HttpError(400, 'Keep your search under 100 characters.'));

  const key = query.toLowerCase();
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.result;

  const result = fetchDocs(query, LIMIT).then(docs => ({ books: toBooks(docs) }));
  cache.set(key, { expires: Date.now() + CACHE_MS, result });
  // Failures aren't kept, so the next reader tries again.
  result.catch(() => { if (cache.get(key)?.result === result) cache.delete(key); });
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value); // Oldest first.
  return result;
}

// Matching books read off a shelf photo (services/gemini.service.js) to Open Library. Five
// books share one query, so a 40-book shelf takes eight calls rather than forty.
const BATCH_SIZE = 5; // Each book's work still ranks near the top of the combined answer.
const BATCH_LIMIT = 100;
const MATCH_BUDGET_MS = 8_000;

// Lower-case words without accents or punctuation, so "J.K. Rowling" equals "J. K. Rowling".
// Only Latin accents go; Devanagari vowel signs and the like are part of the letters.
function words(value = '') {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim();
}

// Text for a quoted Open Library term. It finds "anos" but not "años", and "philosopher's"
// but not "philosopher s", so accents are folded and apostrophes kept (and straightened).
function term(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[‘’`]/g, "'").replace(/["\\]/g, ' ').replace(/\s+/g, ' ').trim();
}

// The title before any subtitle: "Sapiens: A Brief History of Humankind" -> "Sapiens".
const mainTitle = title => title.split(/[:;(]/)[0];

// The family name as written: the last word, skipping Jr., Sr. and roman numerals.
function surname(author) {
  return author.split(/[\s,]+/).filter(part => words(part) && !/^(jr|sr|ii|iii|iv)$/.test(words(part))).at(-1) ?? '';
}

// True when either name contains the other's surname, so initials and co-authors still match.
function sameAuthor(a, b) {
  return ` ${words(a)} `.includes(` ${words(surname(b))} `) || ` ${words(b)} `.includes(` ${words(surname(a))} `);
}

// 2 for the same title, 1 when only a subtitle after ":", ";" or "(" differs ("Sapiens" /
// "Sapiens: A Brief History of Humankind"), else 0. A leading article doesn't count. Merely
// starting the same way isn't enough: "1984" is not "'1984' i esse raznykh let".
function titleScore(read, listed) {
  const plain = title => words(title).replace(/^(the|a|an) /, '');
  const [x, y] = [plain(read), plain(listed)];
  if (!x || !y) return 0;
  if (x === y) return 2;
  const main = plain(mainTitle(read));
  return main && main === plain(mainTitle(listed)) ? 1 : 0;
}

// The Open Library document for a title and author read off a photo, or null. The title
// must match, and so must one of the work's authors. Classics often have several records
// (English editions apart from the original, many without covers), so a record with a cover
// wins, then an exact title, then Open Library's ranking.
function bestMatch(docs, { title, author }) {
  let best = null;
  let bestRank = 0;
  for (const doc of docs) {
    const score = titleScore(title, doc.title ?? '');
    const rank = score && score + (doc.cover_i > 0 ? 2 : 0);
    if (rank > bestRank && sameAuthor(author, (doc.author_name ?? []).join(', '))) [best, bestRank] = [doc, rank];
  }
  return best;
}

// Shelf books for books read off a photo. Each is looked up on Open Library for its cover,
// year and id, for at most MATCH_BUDGET_MS in all, but keeps the title and author as read:
// Gemini writes them as the spine does, while records say "Thinking, fast and slow" or
// "Lev Nikolaevič Tolstoy". Books without an author are dropped: a shelf book needs one, and
// a title alone too often matches the wrong book (a notebook read as "Notes"). Repeats are
// dropped too.
export async function matchBooks(found) {
  const reads = found.filter(book => book.author);
  const matches = new Map();
  const lookUps = [];
  const queryable = reads.filter(book => words(mainTitle(book.title)));
  for (let start = 0; start < queryable.length; start += BATCH_SIZE) {
    const batch = queryable.slice(start, start + BATCH_SIZE);
    const query = batch.map(({ title, author }) => `(title:"${term(mainTitle(title))}" AND author:"${term(surname(author))}")`).join(' OR ');
    lookUps.push(fetchDocs(query, BATCH_LIMIT).then(
      docs => batch.forEach(read => matches.set(read, bestMatch(docs, read))),
      () => {}, // Its books keep what was read.
    ));
  }
  let timer;
  const timeUp = new Promise(resolve => { timer = setTimeout(resolve, MATCH_BUDGET_MS); });
  await Promise.race([Promise.all(lookUps), timeUp]);
  clearTimeout(timer);

  const seen = new Set();
  return reads.flatMap(read => {
    const listed = matches.get(read) ? toBooks([matches.get(read)])[0] : null;
    const book = { openLibraryId: null, cover: null, year: null, ...listed, title: read.title, author: read.author };
    const keys = [book.openLibraryId, `${book.title}\u0000${book.author}`.toLowerCase()].filter(Boolean);
    if (keys.some(key => seen.has(key))) return [];
    keys.forEach(key => seen.add(key));
    return [book];
  });
}

