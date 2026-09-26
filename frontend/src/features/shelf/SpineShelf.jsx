import { useEffect, useState } from 'react';

const fallbackSpineColors = ['#355f4b', '#7a493c', '#9a6f31', '#3d5872', '#695074', '#596b3e'];

function hashText(value = '') {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function parseHexColor(color) {
  if (typeof color !== 'string' || !/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color)) return null;
  const hex = color.length === 4
    ? color.slice(1).split('').map(character => character + character).join('')
    : color.slice(1);
  return [0, 2, 4].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
}

function relativeLuminance(rgb) {
  const [red, green, blue] = rgb.map(channel => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground, background) {
  const foregroundRgb = parseHexColor(foreground);
  const backgroundRgb = parseHexColor(background);
  if (!foregroundRgb || !backgroundRgb) return 0;
  const luminances = [relativeLuminance(foregroundRgb), relativeLuminance(backgroundRgb)].sort((a, b) => b - a);
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

function readableTextColor(color, preferred) {
  if (preferred && contrastRatio(preferred, color) >= 4.5) return preferred;
  const dark = '#30261c';
  const light = '#fff8e9';
  return contrastRatio(light, color) > contrastRatio(dark, color) ? light : dark;
}

function groupBooks(books, perRow) {
  const rows = [];
  for (let index = 0; index < books.length; index += perRow) {
    rows.push(books.slice(index, index + perRow));
  }
  return rows;
}

function getViewportSize() {
  if (typeof window === 'undefined') return 'desktop';
  if (window.innerWidth < 640) return 'compact';
  if (window.innerWidth < 1024) return 'medium';
  return 'desktop';
}

export default function SpineShelf({ books = [], theme, onBookSelect }) {
  const [viewportSize, setViewportSize] = useState(getViewportSize);

  useEffect(() => {
    const updateWidth = () => setViewportSize(getViewportSize());
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const booksPerRow = viewportSize === 'compact' ? 6 : viewportSize === 'medium' ? 9 : 12;
  const rows = groupBooks(books, booksPerRow);

  if (!books.length) {
    return <p className="py-12 text-center text-sm text-[#d8e1db]">Your shelf is empty.</p>;
  }

  return (
    <section aria-label={`${theme?.name || 'Spine'} bookshelf`} className="mx-auto w-full max-w-[1170px] overflow-hidden rounded-xl bg-[#0d1f16] px-2 py-7 sm:px-6 sm:py-10">
      <div className="space-y-8 sm:space-y-12">
        {rows.map((row, rowIndex) => (
          <div key={`shelf-row-${rowIndex}`} className="relative">
            <div className="flex min-h-[165px] items-end justify-center gap-1 px-1 sm:min-h-[250px] sm:gap-2 sm:px-3">
              {row.map((book, bookIndex) => {
                const title = String(book.title ?? '');
                const seed = hashText(String(book.id ?? title));
                const background = book.spineBg || book.color || fallbackSpineColors[seed % fallbackSpineColors.length];
                const foreground = readableTextColor(background, book.spineText);
                const width = viewportSize === 'compact'
                  ? 30 + (seed % 11)
                  : viewportSize === 'medium'
                    ? 36 + (seed % 13)
                    : 42 + (seed % 17);
                const height = viewportSize === 'compact'
                  ? 124 + (seed % 47)
                  : viewportSize === 'medium'
                    ? 142 + (seed % 58)
                    : 160 + (seed % 76);

                return (
                  <button
                    key={book.id ?? `${title}-${rowIndex}-${bookIndex}`}
                    type="button"
                    aria-label={title ? `View ${title}` : 'View book'}
                    title={title || undefined}
                    onClick={() => onBookSelect?.(book)}
                    className="shelf-spine group relative flex shrink-0 flex-col items-center justify-between overflow-hidden rounded-t-[3px] border-x border-t border-white/20 px-0.5 pb-2 pt-2 shadow-[2px_0_4px_rgba(0,0,0,.32)] focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f3ce73]"
                    style={{ width: `${width}px`, height: `${height}px`, backgroundColor: background, color: foreground }}
                  >
                    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-white/30 to-transparent" />
                    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l from-black/25 to-transparent" />
                    <span aria-hidden="true" className="h-[3px] w-2/3 rounded-full bg-amber-200/70 shadow-sm" />
                    <span className="my-auto max-h-[78%] overflow-hidden text-[10px] font-semibold leading-tight tracking-[.035em] sm:text-xs" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textOrientation: 'mixed' }}>
                      {title}
                    </span>
                    <span className="max-h-[22%] overflow-hidden text-[8px] leading-tight opacity-80 sm:text-[9px]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textOrientation: 'mixed' }}>
                      {book.author || ''}
                    </span>
                  </button>
                );
              })}
            </div>
            <div aria-hidden="true" className="mt-1 h-[8px] rounded-b-sm border-t border-[#53725e] bg-gradient-to-b from-[#274733] to-[#172e20] shadow-[0_6px_12px_rgba(0,0,0,.42)] sm:h-[10px]" />
          </div>
        ))}
      </div>
    </section>
  );
}
