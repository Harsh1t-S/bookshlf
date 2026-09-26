import { useState } from 'react';
import catalog from '../../data/books.js';
import BookCover from '../../shared/BookCover.jsx';
import BookDetailsModal from './BookDetailsModal.jsx';
import '../../styles/discovery-shelf.css';

const picks = [catalog[0], catalog[5], catalog[4], catalog[7], catalog[1], catalog[3], catalog[9]];

export default function DiscoveryShelf() {
  const [active, setActive] = useState(3);
  const [selectedBook, setSelectedBook] = useState(null);

  return (
    <section className="discovery" aria-label="Explore a little bookshelf">
      <div className="discovery__aside" aria-hidden="true">
        <span>Go on, judge<br />a book by its cover.</span>
        <svg viewBox="0 0 70 50" fill="none"><path d="M4 5c-1 29 24 33 52 20m-13-3 14 2-5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div className="discovery__books" onPointerLeave={() => setActive(null)}>
        {picks.map((book, index) => (
          <button
            key={book.id}
            type="button"
            className="discovery__volume"
            data-open={active === index}
            aria-label={`Open ${book.title} by ${book.author}`}
            onPointerEnter={event => { if (event.pointerType !== 'touch') setActive(index); }}
            onFocus={() => setActive(index)}
            onBlur={event => { if (!event.currentTarget.parentElement.contains(event.relatedTarget)) setActive(null); }}
            onClick={() => setSelectedBook(book)}
            style={{ '--cloth': book.spineBg, '--volume-height': `${88 + index % 3 * 6}%`, '--volume-index': index }}
          >
            <span className="discovery__spine" aria-hidden="true">
              <span className="discovery__spine-ornament">✦</span>
              <span className="discovery__spine-title">{book.title}</span>
              <span className="discovery__spine-number">0{index + 1}</span>
            </span>
            <span className="discovery__jacket" aria-hidden="true">
              <BookCover book={book} interactive={false} loading="eager" className="h-full w-full aspect-auto" />
            </span>
          </button>
        ))}
      </div>
      <div className="discovery__ledge" aria-hidden="true"><span>THE READER’S EDIT</span></div>
      <p className="discovery__caption">
        <span className="discovery__caption-desktop">Run your cursor along the spines. </span>
        Open a book. Stay a little.
      </p>
      <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </section>
  );
}
