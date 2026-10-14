// Book search through Open Library (https://openlibrary.org/dev/docs/api/search).
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
// and dropping untitled, authorless and repeated title + author pairs.
export function toBooks(docs = []) {
  const seen = new Set();
  return docs.flatMap(doc => {
    const id = String(doc.key ?? '').split('/').pop();
    const title = doc.title?.trim();
    const author = doc.author_name?.[0]?.trim();
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
