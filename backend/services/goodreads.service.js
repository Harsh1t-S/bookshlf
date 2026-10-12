// Reads a reader's public Goodreads shelves through Goodreads' per-shelf RSS feeds.
// Goodreads closed its API to new keys in 2020, but these feeds stay public for
// public profiles. Browsers can't read them directly (no CORS), so this runs server-side.
import { HttpError } from '../utils/HttpError.js';

const ORIGIN = 'https://www.goodreads.com';
const SHELVES = ['read', 'currently-reading'];
const PAGE_SIZE = 100; // Goodreads returns at most 100 items per feed page.
const MAX_PAGES = 10; // Per shelf, so a single import stays under ~2,000 books.
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; Bookshelf.cv importer)' };

// Accepts a numeric id, a profile URL (/user/show/123-name or /review/list/123) or a
// vanity name / URL (goodreads.com/hollandmckay). Only goodreads.com is ever fetched.
export async function resolveUserId(input) {
  const value = String(input ?? '').trim();
  if (!value) throw new HttpError(400, 'Paste your Goodreads profile link or user ID.');
  const numeric = value.match(/^(\d{1,12})(?:-[\w-]*)?$/) ?? value.match(/goodreads\.com\/(?:user\/show|review\/list(?:_rss)?)\/(\d{1,12})/i);
  if (numeric) return numeric[1];

  const vanity = value.replace(/^https?:\/\/(www\.)?goodreads\.com\//i, '').replace(/[/?#].*$/, '');
  if (!/^[A-Za-z0-9_.-]{2,40}$/.test(vanity)) throw new HttpError(400, 'That doesn’t look like a Goodreads profile link or user ID.');
  const response = await fetch(`${ORIGIN}/${encodeURIComponent(vanity)}`, { headers: HEADERS, redirect: 'follow' });
  const id = response.url.match(/\/user\/show\/(\d+)/)?.[1]
    ?? (await response.text()).match(/user\/show\/(\d+)/)?.[1];
  if (!response.ok || !id) throw new HttpError(404, `We couldn’t find a Goodreads profile called “${vanity}”.`);
  return id;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function decode(text = '') {
  return text
    .trim()
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1')
    .replace(/&(#x?[\da-f]+|\w+);/gi, (match, code) => {
      if (code[0] !== '#') return ENTITIES[code] ?? match;
      return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
    })
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Some titles carry zero-width spaces.
    .replace(/\s+/g, ' ')
    .trim();
}

function field(item, name) {
  return decode(item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]);
}

// "A Kingdom of Flesh and Fire (Blood and Ash, #2)" -> title + series.
function splitSeries(fullTitle) {
  const match = fullTitle.match(/^(.*\S)\s*\(([^()]*#\s*[\d.]+)\)$/);
  return match ? { title: match[1], series: match[2] } : { title: fullTitle, series: null };
}

function parseItems(xml, shelf) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const { title, series } = splitSeries(field(item, 'title'));
    const rating = Number(field(item, 'user_rating'));
    const year = Number(field(item, 'book_published'));
    return {
      goodreadsId: field(item, 'book_id'),
      title,
      series,
      author: field(item, 'author_name'),
      isbn: field(item, 'isbn') || null,
      cover: field(item, 'book_large_image_url') || field(item, 'book_image_url') || null,
      rating: rating >= 1 && rating <= 5 ? rating : null, // 0 means the reader didn't rate it.
      year: Number.isInteger(year) && year > 0 ? year : null,
      readAt: field(item, 'user_read_at') || null,
      shelf,
    };
  });
}

async function fetchShelf(userId, shelf) {
  const books = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await fetch(`${ORIGIN}/review/list_rss/${userId}?shelf=${shelf}&page=${page}`, { headers: HEADERS });
    // Goodreads answers 401 ("Sorry, that person's shelf is private") for private shelves.
    if (response.status === 401 || response.status === 403) throw new HttpError(403, 'This Goodreads profile is private. Set it to public in Goodreads (Settings › Privacy), then try again.');
    if (response.status === 404) throw new HttpError(404, 'We couldn’t find that Goodreads profile. Check the link or user ID.');
    if (!response.ok) {
      console.warn(`Goodreads answered ${response.status} for user ${userId} (${shelf}, page ${page}).`);
      throw new HttpError(502, 'Goodreads didn’t respond. Try again in a minute.');
    }
    const items = parseItems(await response.text(), shelf);
    books.push(...items);
    if (items.length < PAGE_SIZE) break;
  }
  return books;
}

// Returns { userId, profileUrl, counts, books } with books de-duplicated across shelves.
export async function importGoodreads(profile) {
  const userId = await resolveUserId(profile);
  const shelves = await Promise.all(SHELVES.map(shelf => fetchShelf(userId, shelf)));
  const seen = new Set();
  const books = shelves.flat().filter(book => {
    const key = book.goodreadsId || `${book.title}|${book.author}`.toLowerCase();
    if (!book.title || !book.author || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    userId,
    profileUrl: `${ORIGIN}/user/show/${userId}`,
    counts: Object.fromEntries(SHELVES.map((shelf, index) => [shelf, shelves[index].length])),
    books,
  };
}
