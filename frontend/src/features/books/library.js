import { api } from '../../lib/api.js';

export const MIN_QUERY = 2;

// Client side of the library search: asks the backend (backend/services/openLibrary.service.js)
// for books matching a title, author or keyword.
export async function searchLibrary(query, { signal } = {}) {
  const { books } = await api(`/books/search?q=${encodeURIComponent(query)}`, { signal });
  return books.map(book => ({
    id: `ol-${book.openLibraryId}`,
    title: book.title,
    author: book.author,
    cover: book.cover,
    ...(book.year ? { year: book.year } : {}),
  }));
}
