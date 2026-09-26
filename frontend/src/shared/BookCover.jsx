import { useState } from 'react';

const fallbackGradients = [
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
  'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
  'linear-gradient(135deg, #16a085 0%, #2ecc71 100%)',
  'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
];

export default function BookCover({ book = {}, className = '', style = {}, showSpineShadow = true, ...props }) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = !imgError && book.cover ? book.cover : null;

  return (
    <div
      className={`group relative aspect-[1/1.5] w-full overflow-hidden rounded-r-[5px] rounded-l-[2px] transition-transform duration-300 ${className}`}
      style={{
        boxShadow: '3px 4px 14px rgba(0, 0, 0, 0.22), 1px 1px 3px rgba(0,0,0,0.15)',
        ...style,
      }}
      aria-label={`${book.title || 'Book'} by ${book.author || 'Author'}`}
      {...props}
    >
      {/* Cover Image or Fallback */}
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={book.title || 'Book cover'}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col justify-between p-3.5 text-white"
          style={{
            background: book.color || fallbackGradients[0],
          }}
        >
          <div className="border border-white/25 p-2 h-full flex flex-col justify-between">
            <div className="pt-2">
              <span className="block text-[9px] uppercase tracking-[0.2em] text-white/70">
                Bookshelf
              </span>
              <h4 className="mt-1 font-serif text-sm font-bold leading-snug line-clamp-3">
                {book.title || 'Untitled'}
              </h4>
            </div>
            <p className="text-[11px] font-medium text-white/80 line-clamp-1 pb-1">
              {book.author || 'Unknown Author'}
            </p>
          </div>
        </div>
      )}

      {/* Book spine highlight & 3D crease shadow */}
      {showSpineShadow && (
        <>
          {/* Left spine highlight */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
          {/* Left crease depth shadow */}
          <div className="pointer-events-none absolute inset-y-0 left-[4px] w-[8px] bg-gradient-to-r from-black/40 via-black/15 to-transparent" />
          {/* Right page edge subtle sheen */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[2px] bg-gradient-to-l from-white/20 to-transparent" />
        </>
      )}
    </div>
  );
}
