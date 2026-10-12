// Shape of a shelf (books, chosen look, bought looks). Everything the server stores
// passes through cleanShelf, so the browser can never save malformed data.

export const MAX_BOOKS = 2000;
const MAX_TEXT = 300;

function text(value, max = MAX_TEXT) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function cleanBook(book) {
  if (!book || typeof book !== 'object'
    || !text(book.id, 80) || !text(book.title) || !text(book.author)
    || !(book.cover === null || typeof book.cover === 'string')) return null;

  const cover = text(book.cover, 1000);
  const clean = {
    id: text(book.id, 80),
    title: text(book.title),
    author: text(book.author),
    // Only real image addresses survive: blob: URLs die with the tab, and nothing script-like is stored.
    cover: /^(https?:\/\/|\/)/i.test(cover) ? cover : null,
  };
  for (const key of ['color', 'spineBg', 'source']) {
    if (typeof book[key] === 'string') clean[key] = text(book[key], 40);
  }
  if (Number.isInteger(book.rating) && book.rating >= 0 && book.rating <= 5) clean.rating = book.rating;
  if (Number.isInteger(book.year) && book.year > 0 && book.year <= 2100) clean.year = book.year;
  return clean;
}

export function cleanShelf(shelf) {
  const themeId = text(shelf?.themeId, 40) || text(shelf?.theme?.id, 40) || 'light-grid';
  const purchasedThemeIds = Array.isArray(shelf?.purchasedThemeIds)
    ? [...new Set(shelf.purchasedThemeIds.map(id => text(id, 40)).filter(Boolean))]
    : [];
  const books = [];
  const seenIds = new Set();
  for (const book of Array.isArray(shelf?.books) ? shelf.books : []) {
    const clean = cleanBook(book);
    if (!clean || seenIds.has(clean.id)) continue;
    seenIds.add(clean.id);
    books.push(clean);
    if (books.length === MAX_BOOKS) break;
  }
  return { books, themeId, purchasedThemeIds };
}
