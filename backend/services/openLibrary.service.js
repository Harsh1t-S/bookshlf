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

async function fetchBooks(query) {
  await takeTurn();
  const url = `${SEARCH_URL}?${new URLSearchParams({ q: query, fields: FIELDS, limit: String(LIMIT) })}`;
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
  return { books: toBooks(docs) };
}

export function searchBooks(input) {
  const query = String(input ?? '').trim().replace(/\s+/g, ' ');
  if (query.length < 2) return Promise.reject(new HttpError(400, 'Type at least 2 characters to search.'));
  if (query.length > 100) return Promise.reject(new HttpError(400, 'Keep your search under 100 characters.'));

  const key = query.toLowerCase();
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.result;

  const result = fetchBooks(query);
  cache.set(key, { expires: Date.now() + CACHE_MS, result });
  // Failures aren't kept, so the next reader tries again.
  result.catch(() => { if (cache.get(key)?.result === result) cache.delete(key); });
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value); // Oldest first.
  return result;
}

// Matching books read off a shelf photo (services/gemini.service.js) to Open Library.
const LOOKUPS_AT_ONCE = 3; // With the spacing above, enough to keep Open Library busy without hogging it.
const MATCH_BUDGET_MS = 10_000;

// Lower-case words without accents or punctuation, so "J.K. Rowling" equals "J. K. Rowling".
function words(value = '') {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

// The family name: the last word, skipping Jr., Sr. and roman numerals.
function surname(author) {
  return words(author).split(' ').filter(part => !/^(jr|sr|ii|iii|iv)$/.test(part)).at(-1) ?? '';
}

// True when either name contains the other's surname, so initials and co-authors still match.
function sameAuthor(a, b) {
  return ` ${words(a)} `.includes(` ${surname(b)} `) || ` ${words(b)} `.includes(` ${surname(a)} `);
}

// 2 for the same title, 1 when only a subtitle after ":", ";" or "(" differs ("Sapiens" /
// "Sapiens: A Brief History of Humankind"), else 0. A leading article doesn't count. Merely
// starting the same way isn't enough: "1984" is not "'1984' i esse raznykh let".
function titleScore(read, listed) {
  const plain = title => words(title).replace(/^(the|a|an) /, '');
  const main = title => plain(title.split(/[:;(]/)[0]);
  const [x, y] = [plain(read), plain(listed)];
  if (!x || !y) return 0;
  if (x === y) return 2;
  return main(read) && main(read) === main(listed) ? 1 : 0;
}

// The Open Library book for a title and author read off a photo, or null. The title must
// match, and so must the author when one was read; an exact title beats Open Library's ranking.
async function findBook({ title, author }) {
  const { books } = await searchBooks(`${title} ${surname(author)}`.trim().slice(0, 100));
  let best = null;
  let bestScore = 0;
  for (const book of books) {
    const score = titleScore(title, book.title);
    if (score > bestScore && (!author || sameAuthor(author, book.author))) [best, bestScore] = [book, score];
  }
  return best;
}

// Shelf books for books read off a photo. Each is looked up on Open Library for its cover
// and catalogue title, a few at a time and for at most MATCH_BUDGET_MS in all; one that isn't
// found keeps the title and author as read, without a cover. Books still without an author
// are dropped (a shelf book needs one), and so are repeats.
export async function matchBooks(found) {
  const matches = [];
  let next = 0;
  let open = true;
  async function lookUp() {
    while (open && next < found.length) {
      const index = next++;
      matches[index] = await findBook(found[index]).catch(() => null);
    }
  }
  let timer;
  const timeUp = new Promise(resolve => { timer = setTimeout(resolve, MATCH_BUDGET_MS); });
  await Promise.race([Promise.all(Array.from({ length: LOOKUPS_AT_ONCE }, lookUp)), timeUp]);
  clearTimeout(timer);
  open = false;

  const seen = new Set();
  return found.flatMap((read, index) => {
    const book = matches[index] ?? { openLibraryId: null, title: read.title, author: read.author, cover: null, year: null };
    const keys = [book.openLibraryId, `${book.title}\u0000${book.author}`.toLowerCase()].filter(Boolean);
    if (!book.author || keys.some(key => seen.has(key))) return [];
    keys.forEach(key => seen.add(key));
    return [book];
  });
}
