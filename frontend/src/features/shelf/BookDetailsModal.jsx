import { useState } from 'react';
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

export default function BookDetailsModal({ book, onClose }) {
  return book ? <ReadingBook key={book.id ?? book.title} book={book} onClose={onClose} /> : null;
}
