import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import BookCover from '../../shared/BookCover.jsx';
import Modal from '../../shared/Modal.jsx';
import '../../styles/reading-book.css';

function ReadingBook({ book, onClose }) {
  const [turned, setTurned] = useState(false);
  const [marked, setMarked] = useState(false);
  const titleId = `book-details-${String(book.id ?? 'selected').replace(/[^a-z\d_-]/gi, '-')}`;
  const hasRating = Number.isFinite(book.rating);
  const stars = hasRating ? Math.min(5, Math.max(0, Math.round(book.rating))) : 0;

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="reading-dialog">
      <div className="reading-dialog__topline">
        <span>A MOMENT BETWEEN THE COVERS</span>
        <button type="button" onClick={onClose} aria-label="Close book details" className="reading-dialog__close">×</button>
      </div>
      <h2 id={titleId} className="sr-only">{book.title} — book details</h2>
      <div className="reading-spread" style={{ '--binding-color': book.spineBg || book.color || '#6f4935' }}>
        <div className="reading-jacket">
          <span className="reading-jacket__label">FROM THE BOOKSHELF</span>
          <div className="reading-jacket__cover"><BookCover book={book} interactive={false} loading="eager" /></div>
          <span className="reading-jacket__caption">A whole world, bound in paper.</span>
        </div>
        <div className="reading-pages">
          <button type="button" className="reading-ribbon" aria-label={marked ? 'Remove bookmark' : 'Mark this page'} aria-pressed={marked} onClick={() => setMarked(value => !value)}>
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true"><path d="M3 2h8v14l-4-3-4 3V2Z" stroke="currentColor" strokeWidth="1.2" /><path className="reading-ribbon__check" d="m4.5 7 1.7 1.7L10 5" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
          <div className="reading-leaf" data-turned={turned}>
            <div className="reading-leaf__face reading-leaf__front" aria-hidden={turned}>
              <p className="reading-page__eyebrow">THE TITLE PAGE</p>
              <div className="reading-title-block">
                <span className="reading-flourish" aria-hidden="true">❧</span>
                <p className="reading-title">{book.title}</p>
                <span className="reading-byline">by</span>
                <p className="reading-author">{book.author || 'Unknown author'}</p>
                {book.year && <p className="reading-year">First published {book.year}</p>}
              </div>
              <span className="reading-page-number">— &nbsp; 01 &nbsp; —</span>
            </div>
            <div className="reading-leaf__face reading-leaf__back" aria-hidden={!turned}>
              <p className="reading-page__eyebrow">EX LIBRIS · BOOKSHELF.CV</p>
              <p className="library-card__heading">Library card</p>
              <dl className="library-card__entries">
                <div><dt>Title</dt><dd>{book.title}</dd></div>
                <div><dt>Author</dt><dd>{book.author || 'Unknown author'}</dd></div>
                {book.year && <div><dt>Published</dt><dd>{book.year}</dd></div>}
                <div><dt>Reader’s rating</dt><dd>{hasRating ? <span aria-label={`${book.rating} out of 5 stars`} className="library-card__stars">{'★'.repeat(stars)}<span aria-hidden="true">{'☆'.repeat(5 - stars)}</span></span> : 'A story yet to be rated'}</dd></div>
              </dl>
              <span className="library-card__stamp">WELL READ<br /><small>& WELL LOVED</small></span>
              <span className="reading-page-number">— &nbsp; 02 &nbsp; —</span>
            </div>
          </div>
          <button type="button" className="reading-page-turn" aria-label={turned ? 'Return to title page' : 'Turn to library card'} onClick={() => setTurned(value => !value)}>
            <span>{turned ? '← Back to title page' : 'Turn to library card →'}</span>
            <span className="reading-page-turn__corner" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="reading-dialog__footnote" aria-live="polite">{marked ? 'Your place is saved while this book is open.' : 'A quiet moment. Just you and a good book.'}</p>
    </Modal>
  );
}

const BOOK_W = 220;
const BOOK_H = 330;
const LIFT_EASE = 'cubic-bezier(.2, .8, .2, 1)';
const OPEN_EASE = 'cubic-bezier(.45, .05, .2, 1)';

// Lifts the chosen book off the shelf, turns it to face the reader and swings the
// cover open; the reading card takes over once the cover is open. A click skips ahead.
function BookOpening({ book, origin, onOpened, onDone, onCancel }) {
  const overlayRef = useRef(null);
  const bookRef = useRef(null);
  const coverRef = useRef(null);
  const handlers = useRef({ onOpened, onDone, onCancel });
  const { rect, spine, cloth, ink } = origin;
  const thickness = spine ? Math.min(44, Math.max(18, rect.width * BOOK_H / rect.height)) : 26;

  useEffect(() => {
    handlers.current = { onOpened, onDone, onCancel };
  });

  useEffect(() => {
    const onKeyDown = event => { if (event.key === 'Escape') handlers.current.onCancel(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useLayoutEffect(() => {
    const scale = spine ? rect.height / BOOK_H : rect.width / BOOK_W;
    const dx = rect.left + rect.width / 2 - window.innerWidth / 2;
    const dy = rect.top + rect.height / 2 - window.innerHeight / 2;
    const turn = spine ? 90 : 0;
    const front = `translateZ(${thickness / 2}px)`;
    const running = [];
    const play = (element, keyframes, options) => {
      const animation = element.animate(keyframes, { fill: 'both', ...options });
      running.push(animation);
      return animation.finished;
    };

    play(bookRef.current, [
      { transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotateY(${turn}deg)` },
      { transform: `translate(${dx * .4}px, ${dy * .4 - 70}px) scale(${(scale + 1) / 2}) rotateX(12deg) rotateY(${turn * .35}deg)`, offset: .55 },
      { transform: 'translate(0, 0) scale(1) rotateX(0deg) rotateY(0deg)' },
    ], { duration: 760, easing: LIFT_EASE })
      .then(() => Promise.all([
        play(coverRef.current, [{ transform: `${front} rotateY(0deg)` }, { transform: `${front} rotateY(-168deg)` }], { duration: 820, easing: OPEN_EASE }),
        play(bookRef.current, [{ translate: '0 0' }, { translate: `${BOOK_W / 2}px 0` }], { duration: 820, easing: OPEN_EASE }),
      ]))
      .then(() => {
        handlers.current.onOpened();
        return play(overlayRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease' });
      })
      .then(() => handlers.current.onDone())
      .catch(() => {});
    return () => running.forEach(animation => animation.cancel());
  }, [rect, spine, thickness]);

  function skip() {
    handlers.current.onOpened();
    handlers.current.onDone();
  }

  return (
    <div ref={overlayRef} className="bo" role="presentation" onClick={skip}>
      <p className="sr-only" role="status">Opening {book.title}</p>
      <div ref={bookRef} className="bo-book" aria-hidden="true" style={{ '--t': `${thickness}px`, '--cloth': cloth || book.spineBg || book.color || '#6f4935', '--ink': ink || book.spineText || '#fff8e9' }}>
        <div className="bo-back" />
        <div className="bo-edge" />
        <div className="bo-spine"><span>{book.title}</span></div>
        <div className="bo-page">
          <span className="bo-page__eyebrow">EX LIBRIS</span>
          <span className="bo-page__flourish">❧</span>
          <strong>{book.title}</strong>
          <em>by {book.author || 'Unknown author'}</em>
        </div>
        <div ref={coverRef} className="bo-cover">
          <div className="bo-cover__front"><BookCover book={book} interactive={false} loading="eager" /></div>
          <div className="bo-cover__inside"><p className="bo-plate"><span>This book belongs to</span><b>Bookshelf.cv</b></p></div>
        </div>
      </div>
    </div>
  );
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function BookDetails({ book, origin, onClose }) {
  const animate = Boolean(origin?.rect) && !prefersReducedMotion();
  const [opening, setOpening] = useState(animate);
  const [cardShown, setCardShown] = useState(!animate);

  return (
    <>
      {cardShown && <ReadingBook book={book} onClose={onClose} />}
      {opening && (
        <BookOpening
          book={book}
          origin={origin}
          onOpened={() => setCardShown(true)}
          onDone={() => setOpening(false)}
          onCancel={onClose}
        />
      )}
    </>
  );
}

export default function BookDetailsModal({ book, origin, onClose }) {
  return book ? <BookDetails key={book.id ?? book.title} book={book} origin={origin} onClose={onClose} /> : null;
}
