import { useEffect, useRef, useState } from 'react';
import BookCard from '../BookCard.jsx';
import BookList from '../BookList.jsx';
import { bookKey } from '../bookKey.js';

// "Browse our library": search the local catalog and pick titles.
export default function LibraryPanel({ hidden, books, shelf, catalog, onToggle, onRemove, onAddManually }) {
  const [query, setQuery] = useState('');
  const [resultsOpen, setResultsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!resultsOpen) return undefined;
    function close(event) {
      if (!searchRef.current?.contains(event.target)) setResultsOpen(false);
    }
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [resultsOpen]);

  const needle = query.trim().toLocaleLowerCase();
  const results = needle ? catalog.filter(book => `${book.title} ${book.author}`.toLocaleLowerCase().includes(needle)) : [];
  const shelfKeys = new Set(shelf.map(bookKey));
  const open = resultsOpen && Boolean(needle);

  return (
    <section className="fg-panel" aria-label="Browse our library" hidden={hidden}>
      <h2><label htmlFor="library-search">Book Library</label></h2>
      <div className="fg-search" ref={searchRef}>
        <input
          id="library-search"
          className="fg-input"
          type="search"
          value={query}
          data-open={open}
          onChange={event => { setQuery(event.target.value); setResultsOpen(true); }}
          onFocus={() => setResultsOpen(true)}
          onKeyDown={event => { if (event.key === 'Escape') setResultsOpen(false); }}
          placeholder="Search books by title, author or keyword"
          autoComplete="off"
          aria-controls="library-results"
          aria-expanded={open}
        />
        {open && (
          <div className="fg-results" id="library-results">
            {results.length ? (
              <div className="fg-book-grid">
                {results.map(book => {
                  const picked = shelfKeys.has(bookKey(book));
                  return <BookCard key={book.id} book={book} selected={picked} action={picked ? 'Selected' : 'Select'} onAction={() => onToggle(book)} />;
                })}
              </div>
            ) : <p className="fg-results__empty">No books match “{query.trim()}”. Try another title or author, or add it manually below.</p>}
          </div>
        )}
      </div>
      <BookList title={`Selected Books (${books.length})`} books={books} action="Remove" onAction={onRemove} onAddManually={onAddManually} />
    </section>
  );
}
