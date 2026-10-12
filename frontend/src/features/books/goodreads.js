import { api } from '../../lib/api.js';

// Client side of the Goodreads import: asks the backend (backend/services/goodreads.service.js)
// for a reader's public "read" and "currently-reading" shelves.
export async function importFromGoodreads(profile) {
  const { books } = await api(`/goodreads?profile=${encodeURIComponent(profile.trim())}`);
  if (!books?.length) throw new Error('No books found on this profile’s Read or Currently Reading shelves.');

  return books.map(book => ({
    id: `gr-${book.goodreadsId}`,
    title: book.title,
    author: book.author,
    cover: book.cover,
    ...(book.rating ? { rating: book.rating } : {}),
    ...(book.year ? { year: book.year } : {}),
  }));
}
