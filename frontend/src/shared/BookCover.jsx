import { useEffect, useRef, useState } from 'react';
import '../styles/book-cover.css';

const fallbackGradients = [
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
  'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
  'linear-gradient(135deg, #16a085 0%, #2ecc71 100%)',
  'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
];

const defaultBookShadow = '3px 4px 14px rgba(0, 0, 0, 0.22), 1px 1px 3px rgba(0,0,0,0.15)';

export default function BookCover({
  book = {},
  className = '',
  style = {},
  showSpineShadow = true,
  interactive = true,
  loading = 'lazy',
  onPointerMove,
  onPointerLeave,
  ...props
}) {
  const [imgError, setImgError] = useState(false);
  const { boxShadow = defaultBookShadow, ...restStyle } = style;
  const coverRef = useRef(null);
  const animationFrameRef = useRef(null);
  const pointerPositionRef = useRef(null);
  const coverValue = book.cover;
  const coverUrl = typeof coverValue === 'string' && /^(https?:\/\/|\/|\.\/|\.\.\/|data:image\/)/i.test(coverValue)
    ? coverValue
    : null;

  useEffect(() => {
    setImgError(false);
  }, [coverUrl]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const canUsePointerMotion = (event) => (
    interactive
    && event.pointerType !== 'touch'
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const clearPointerMotion = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    pointerPositionRef.current = null;
    const face = coverRef.current;
    if (face) {
      face.style.setProperty('--book-rotate-x', '0deg');
      face.style.setProperty('--book-rotate-y', '0deg');
      face.style.setProperty('--book-light-x', '50%');
      face.style.setProperty('--book-light-y', '50%');
    }
  };

  const handlePointerMove = (event) => {
    onPointerMove?.(event);
    if (!canUsePointerMotion(event)) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerPositionRef.current = {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    };

    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      const position = pointerPositionRef.current;
      const face = coverRef.current;
      if (!position || !face) return;
      face.style.setProperty('--book-rotate-x', `${(0.5 - position.y) * 10}deg`);
      face.style.setProperty('--book-rotate-y', `${(position.x - 0.5) * 18}deg`);
      face.style.setProperty('--book-light-x', `${position.x * 100}%`);
      face.style.setProperty('--book-light-y', `${position.y * 100}%`);
    });
  };

  const handlePointerLeave = (event) => {
    clearPointerMotion();
    onPointerLeave?.(event);
  };

  const imageUrl = coverUrl && !imgError ? coverUrl : null;
  const fallbackBackground = typeof coverValue === 'string' && /^#[\da-f]{3,8}$/i.test(coverValue)
    ? coverValue
    : book.color || fallbackGradients[0];

  return (
    <div
      ref={coverRef}
      className={`book-cover group relative aspect-[1/1.5] w-full rounded-r-[5px] rounded-l-[2px] ${className}`}
      data-interactive={interactive ? 'true' : 'false'}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        ...restStyle,
        '--book-shadow': boxShadow,
      }}
      aria-label={`${book.title || 'Book'} by ${book.author || 'Author'}`}
      {...props}
    >
      <div className="book-cover__object">
        <div className="book-cover__pages" aria-hidden="true" />
        <div className="book-cover__inside" aria-hidden="true" />
        <div className="book-cover__face">
          <div className="book-cover__body">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={book.title || 'Book cover'}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
                loading={loading}
              />
            ) : (
              <div
                className="flex h-full w-full flex-col justify-between p-3.5 text-white"
                style={{ background: fallbackBackground }}
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

            {showSpineShadow && (
              <>
                <div className="book-cover__spine-highlight" aria-hidden="true" />
                <div className="book-cover__spine-shadow" aria-hidden="true" />
                <div className="book-cover__edge-sheen" aria-hidden="true" />
              </>
            )}
            <div className="book-cover__hinge" aria-hidden="true" />
          </div>
        </div>
        <div className="book-cover__sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
