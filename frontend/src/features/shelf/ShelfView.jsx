import { useLayoutEffect, useRef, useState } from 'react';
import BookCover from '../../components/BookCover.jsx';
import '../../styles/shelf-views.css';

const SPINE_COLORS = [
  ['#2a9a9b', '#fff'], ['#e2336f', '#fff'], ['#f5b71b', '#2b2112'], ['#1f1f1f', '#fff'],
  ['#f2f0ec', '#2b2112'], ['#7c2d10', '#fff'], ['#8e2fb8', '#fff'], ['#1597d2', '#fff'], ['#25584a', '#fff'],
];
const SPINE_HEIGHTS = [224, 263, 176];
const SPINE_MAX = 300;
// Padding, the gilt bands and their gaps take this much of every spine.
const SPINE_CHROME = 64;

// Bold 14px Inter runs up to about 7.8px per character; spines grow to fit the title and
// wrap onto a second line only past SPINE_MAX.
function spineSize(title, seed) {
  const needed = Math.ceil(title.length * 7.8) + SPINE_CHROME;
  return {
    height: Math.max(SPINE_HEIGHTS[seed % SPINE_HEIGHTS.length], Math.min(needed, SPINE_MAX)),
    wrap: needed > SPINE_MAX,
  };
}

function hash(value = '') {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) result = ((result << 5) - result + value.charCodeAt(index)) | 0;
  return Math.abs(result);
}

function chunk(items, size) {
  const rows = [];
  for (let index = 0; index < items.length; index += size) rows.push(items.slice(index, index + size));
  return rows;
}

function bookLabel(book) {
  return `Open ${book.title}${book.author ? ` by ${book.author}` : ''}`;
}

// Where the book sits on screen, so the reading view can lift it off the shelf.
// A spine counts as a cover once it has turned (hover or focus) to show its jacket.
function bookOrigin(button) {
  const cover = button.querySelector('.book-cover')?.getBoundingClientRect();
  if (cover && cover.width / cover.height > .45) return { rect: cover, spine: false };
  return {
    rect: button.getBoundingClientRect(),
    spine: button.classList.contains('sv-spine'),
    cloth: button.style.getPropertyValue('--cloth'),
    ink: button.style.color,
  };
}

function selectBook(onBookSelect, book) {
  return event => onBookSelect?.(book, bookOrigin(event.currentTarget));
}

function GridView({ books, onBookSelect }) {
  return (
    <div className="sv-grid">
      {books.map((book, index) => (
        <button key={book.id ?? index} type="button" className="sv-tile" style={{ '--i': index }} aria-label={bookLabel(book)} onClick={selectBook(onBookSelect, book)}>
          <BookCover book={book} className="sv-tile__cover" />
        </button>
      ))}
    </div>
  );
}

function DigitalShelfView({ books, onBookSelect }) {
  return (
    <div className="sv-planks">
      {chunk(books, 5).map((row, rowIndex) => (
        <div key={rowIndex} className="sv-plank-row">
          <div className="sv-plank-row__books">
            {row.map((book, index) => (
              <button key={book.id ?? index} type="button" className="sv-dbook" style={{ '--i': rowIndex * 5 + index }} aria-label={bookLabel(book)} onClick={selectBook(onBookSelect, book)}>
                <BookCover book={book} className="sv-dbook__cover" />
              </button>
            ))}
          </div>
          <div className="sv-plank" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function SpineView({ books, onBookSelect }) {
  return (
    <div className="sv-spines">
      {chunk(books, 12).map((row, rowIndex) => (
        <div key={rowIndex} className="sv-spine-row">
          <div className="sv-spine-row__books">
            {row.map((book, index) => {
              const seed = hash(String(book.id ?? book.title));
              const [background, color] = SPINE_COLORS[(rowIndex * 12 + index + seed) % SPINE_COLORS.length];
              const title = book.title ?? '';
              const { height, wrap } = spineSize(title, seed);
              return (
                <button
                  key={book.id ?? index}
                  type="button"
                  className="sv-spine"
                  data-wrap={wrap || undefined}
                  aria-label={bookLabel(book)}
                  title={[book.title, book.author].filter(Boolean).join(' — ')}
                  onClick={selectBook(onBookSelect, book)}
                  style={{ height, color, '--cloth': background, '--cover-w': `${Math.round(height * .68)}px`, '--i': rowIndex * 12 + index }}
                >
                  <span className="sv-spine__face" aria-hidden="true">
                    <i className="sv-spine__band" />
                    <span className="sv-spine__title">{title}</span>
                    <i className="sv-spine__band" />
                  </span>
                  <span className="sv-spine__jacket" aria-hidden="true">
                    <BookCover book={book} interactive={false} className="sv-spine__cover" />
                  </span>
                </button>
              );
            })}
          </div>
          <div className="sv-plank sv-plank--thin" aria-hidden="true" />
        </div>
      ))}
      <div className="sv-lamp" aria-hidden="true"><i /><b /></div>
    </div>
  );
}

function MacView({ books, onBookSelect }) {
  return (
    <div className="sv-mac">
      {books.map((book, index) => (
        <button key={book.id ?? index} type="button" className="sv-mac__item" style={{ '--i': index }} aria-label={bookLabel(book)} onClick={selectBook(onBookSelect, book)}>
          <span className="sv-mac__book" style={{ '--book-edge': book.spineBg || book.color || '#555' }}>
            <BookCover book={book} interactive={false} showSpineShadow={false} className="sv-mac__cover" />
          </span>
          <span className="sv-mac__caption">{book.title}</span>
        </button>
      ))}
    </div>
  );
}

export default function ShelfView({ theme, books = [], onBookSelect, empty }) {
  const view = theme?.view ?? 'grid';
  const content = !books.length ? empty
    : view === 'shelf' ? <DigitalShelfView books={books} onBookSelect={onBookSelect} />
      : view === 'spine' ? <SpineView books={books} onBookSelect={onBookSelect} />
        : view === 'macos' ? <MacView books={books} onBookSelect={onBookSelect} />
          : <GridView books={books} onBookSelect={onBookSelect} />;

  return (
    <section className="sv" data-view={view} data-variant={theme?.variant ?? 'light'} aria-label={`${theme?.name ?? 'Bookshelf'} books`}>
      {content}
    </section>
  );
}

// Live, scaled-down render of a shelf look, used for theme cards and previews.
const PREVIEW_STAGE = { grid: 1280, shelf: 1280, spine: 1080, macos: 820 };

export function ThemePreview({ theme, books, stageWidth: requestedWidth, className = '', children }) {
  const stageWidth = requestedWidth ?? PREVIEW_STAGE[theme?.view] ?? 1280;
  const frameRef = useRef(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    const update = () => setScale(frame.clientWidth / stageWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [stageWidth]);

  return (
    <div ref={frameRef} className={`sv-preview ${className}`} aria-hidden="true" inert>
      <div className="sv-preview__stage" style={{ width: stageWidth, transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }}>
        {children}
        <ShelfView theme={theme} books={books} />
      </div>
    </div>
  );
}
