import { useEffect, useRef, useState } from 'react';
import '../../styles/spine-shelf.css';

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

function groupBooks(volumes, availableWidth, gap) {
  const rows = [];
  let row = [];
  let rowWidth = 0;
  for (const volume of volumes) {
    const addedWidth = volume.width + (row.length ? gap : 0);
    if (row.length && rowWidth + addedWidth > availableWidth) {
      rows.push(row);
      row = [];
      rowWidth = 0;
    }
    rowWidth += volume.width + (row.length ? gap : 0);
    row.push(volume);
  }
  if (row.length) rows.push(row);
  return rows;
}

export default function SpineShelf({ books = [], theme, onBookSelect }) {
  const shelfRef = useRef(null);
  const [shelfWidth, setShelfWidth] = useState(() => (
    typeof window === 'undefined' ? 1122 : Math.max(180, Math.min(1122, window.innerWidth - 104))
  ));

  useEffect(() => {
    if (!shelfRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setShelfWidth(Math.max(1, entry.contentRect.width)));
    observer.observe(shelfRef.current);
    return () => observer.disconnect();
  }, [books.length > 0]);

  const scale = Math.min(1, Math.max(.74, shelfWidth / 880));
  const gap = shelfWidth < 600 ? 4 : 7;
  const titleSize = 12 * scale;
  const volumes = books.map(book => {
    const title = String(book.title ?? '');
    const seed = hashText(String(book.id ?? title));
    const height = Math.round((190 + hashText(`${seed}-height`) % 110) * scale);
    const textHeight = height - 36 * scale;
    const titleColumns = Math.min(3, Math.max(1, Math.ceil(title.length * titleSize * .62 / textHeight)));
    const minimumWidth = (titleColumns * 15 + 36) * scale;
    const width = Math.round(Math.max(minimumWidth, (40 + hashText(`${seed}-thickness`) % 43) * scale));
    return { book, title, seed, width, height };
  });
  const rows = groupBooks(volumes, shelfWidth, gap);

  if (!books.length) {
    return <p className="py-12 text-center text-sm text-[#d8e1db]">Your shelf is empty.</p>;
  }

  return (
    <section ref={shelfRef} aria-label={`${theme?.name || 'Spine'} bookshelf`} className="mx-auto w-full max-w-[1170px] overflow-hidden rounded-xl bg-[#0d1f16] px-2 py-7 sm:px-6 sm:py-10">
      <div className="space-y-8 sm:space-y-12">
        {rows.map((row, rowIndex) => (
          <div key={`shelf-row-${rowIndex}`} className="relative">
            <div className="shelf-spine-row" style={{ gap, minHeight: Math.max(...row.map(volume => volume.height)) + 24 }}>
              {row.map(({ book, title, seed, width, height }, bookIndex) => {
                const background = book.spineBg || book.color || fallbackSpineColors[seed % fallbackSpineColors.length];
                const foreground = readableTextColor(background, book.spineText);
                return (
                  <button
                    key={book.id ?? `${title}-${rowIndex}-${bookIndex}`}
                    type="button"
                    aria-label={title ? `View ${title}${book.author ? ` by ${book.author}` : ''}` : 'View book'}
                    title={[title, book.author].filter(Boolean).join(' — ') || undefined}
                    onClick={() => onBookSelect?.(book)}
                    className="shelf-spine group relative shrink-0 overflow-hidden rounded-t-[3px] border-x border-t border-white/20 shadow-[2px_0_4px_rgba(0,0,0,.32)] focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f3ce73]"
                    style={{ width, height, backgroundColor: background, color: foreground, '--spine-scale': scale, '--spine-title-size': `${titleSize}px` }}
                  >
                    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-white/30 to-transparent" />
                    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l from-black/25 to-transparent" />
                    <span aria-hidden="true" className="shelf-spine__rule" />
                    <span className="shelf-spine__lettering" aria-hidden="true">
                      <span className="shelf-spine__title">{title}</span>
                      {book.author && <span className="shelf-spine__author">{book.author}</span>}
                    </span>
                    <span aria-hidden="true" className="shelf-spine__rule shelf-spine__rule--bottom" />
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
