import BookCover from '../../shared/BookCover.jsx';

export default function BookGrid({ books = [], onBookSelect }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
      {books.map((book, index) => (
        <article key={book.id ?? `${book.title}-${index}`} className="shelf-arrival flex h-[320px] items-center justify-center rounded-xl sm:h-[345px]" style={{ backgroundColor: 'var(--shelf-tile)', '--book-order': Math.min(index, 11) }}>
          <button type="button" onClick={() => onBookSelect?.(book)} aria-label={`View ${book.title}`} className="shelf-book grid h-full w-full place-items-center rounded-lg pb-7 pt-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--shelf-accent)]">
            <div className="w-full max-w-[180px] px-2 sm:px-0">
              <BookCover book={book} className="w-full aspect-[.7]" />
            </div>
            <span className="shelf-book__caption" aria-hidden="true">A closer look <span>↗</span></span>
          </button>
        </article>
      ))}
    </div>
  );
}
