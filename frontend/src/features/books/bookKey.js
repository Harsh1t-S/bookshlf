// Same title + author (ignoring case and spacing) means the same book, whatever its source.
export function bookKey(book) {
  const normalize = (value = '') => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  return `${normalize(book.title)}\u0000${normalize(book.author)}`;
}
