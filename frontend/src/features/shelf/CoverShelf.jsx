import BookCover from '../../shared/BookCover';

function ShelfPlank({ wooden, colors }) {
  if (wooden) {
    return (
      <div aria-hidden="true" className="pointer-events-none relative z-10 h-7 w-full shrink-0">
        <div className="absolute inset-x-0 top-0 h-2 rounded-t-[2px] border-t border-[#f5d7a2]/80 bg-gradient-to-b from-[#e3c28e] to-[#b37a43] shadow-[0_2px_4px_rgba(38,20,8,.45)]" />
        <div
          className="absolute inset-x-0 top-2 h-5 border-b border-[#462913]/70 shadow-[0_9px_11px_rgba(31,18,8,.4)]"
          style={{
            backgroundImage: 'linear-gradient(180deg, rgba(255,218,157,.35), rgba(92,50,22,.12) 24%, rgba(52,28,13,.35)), repeating-linear-gradient(2deg, rgba(255,223,170,.1) 0 1px, transparent 1px 7px, rgba(57,29,12,.11) 8px 10px)',
            backgroundColor: '#966134',
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none relative z-10 h-4 w-full shrink-0">
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-sm shadow-[0_1px_2px_rgba(0,0,0,.12)]"
        style={{ backgroundColor: colors.cardBg ?? '#ffffff' }}
      />
      <div
        className="absolute inset-x-0 top-1 h-3 border-b shadow-[0_8px_12px_rgba(30,26,20,.12)]"
        style={{
          backgroundImage: `linear-gradient(180deg, ${colors.cardBg ?? '#f5f5f3'}, ${colors.shelfBorder ?? '#e1e0dc'})`,
          borderColor: colors.shelfBorder ?? '#d8d7d3',
        }}
      />
    </div>
  );
}

export default function CoverShelf({ books = [], theme, onBookSelect }) {
  const wooden = theme?.layout === 'wood';
  const colors = theme?.colors ?? {};

  return (
    <section
      aria-label="Books on your shelf"
      className="mx-auto w-full max-w-[1170px] px-2 sm:px-0"
      style={{ color: colors.ink ?? (wooden ? '#ffffff' : '#302a24') }}
    >
      {books.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-0 gap-y-10 sm:grid-cols-4 sm:gap-y-14">
          {books.map((book, index) => (
            <article key={book.id ?? `${book.title}-${index}`} className="shelf-arrival flex min-w-0 flex-col items-center" style={{ '--book-order': Math.min(index, 11) }}>
              <button
                type="button"
                onClick={() => onBookSelect?.(book)}
                aria-label={`View ${book.title}`}
                className="group relative z-10 flex min-w-0 max-w-full justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e13a00]"
              >
                <span className="relative block max-w-full" style={{ width: 'clamp(110px, 18vw, 160px)' }}>
                  <BookCover
                    book={book}
                    className="w-full rounded-sm"
                    style={{
                      boxShadow: wooden
                        ? '4px 8px 14px rgba(24, 13, 7, .45), 1px 1px 3px rgba(0,0,0,.35)'
                        : '3px 6px 13px rgba(37, 31, 23, .2), 1px 1px 3px rgba(0,0,0,.12)',
                    }}
                  />
                  {book.rating && (
                    <span
                      className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold shadow-sm ${
                        wooden ? 'bg-[#3f2918]/80 text-[#ffe3a5]' : 'bg-white/90'
                      }`}
                      role="img"
                      aria-label={`${book.rating} out of 5 stars`}
                      style={{ color: wooden ? '#ffe3a5' : colors.accent ?? '#9b651f' }}
                    >
                      <span aria-hidden="true">★ {book.rating}</span>
                    </span>
                  )}
                </span>
              </button>

              <ShelfPlank wooden={wooden} colors={colors} />

              <div className="flex h-16 w-full flex-col items-center px-2 pt-2 text-center">
                <h2 className="line-clamp-2 w-full text-sm font-semibold leading-snug">
                  {book.title}
                </h2>
                <p className="mt-1 line-clamp-1 w-full text-xs" style={{ color: colors.muted ?? (wooden ? 'rgba(255,255,255,.75)' : '#716960') }}>
                  {book.author}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm" style={{ color: colors.muted ?? (wooden ? 'rgba(255,255,255,.75)' : '#716960') }}>
          Your shelf is empty.
        </p>
      )}
    </section>
  );
}
