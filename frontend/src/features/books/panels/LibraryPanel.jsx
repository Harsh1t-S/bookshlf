import { useEffect, useRef, useState } from 'react';
import BookCard from '../BookCard.jsx';
import BookList from '../BookList.jsx';
import { bookKey } from '../bookKey.js';
import { MIN_QUERY, searchLibrary } from '../library.js';

const TYPING_PAUSE = 350;

// "Browse our library": search Open Library (through our API) and pick titles.
export default function LibraryPanel({ hidden, books, shelf, onToggle, onRemove, onAddManually }) {
  const [query, setQuery] = useState('');
  const [resultsOpen, setResultsOpen] = useState(false);
  // The last finished search; results for an older query are never shown for a newer one.
  const [search, setSearch] = useState({ query: '', books: [], error: '' });
  const searchRef = useRef(null);

  useEffect(() => {
    if (!resultsOpen) return undefined;
    function close(event) {
      if (!searchRef.current?.contains(event.target)) setResultsOpen(false);
    }
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [resultsOpen]);

  const needle = query.trim().replace(/\s+/g, ' ');
  const searchable = needle.length >= MIN_QUERY;

  // Search once typing pauses, and cancel a request the reader has typed past.
  useEffect(() => {
    if (!searchable) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      searchLibrary(needle, { signal: controller.signal })
        .then(found => setSearch({ query: needle, books: found, error: '' }))
        .catch(error => {
          if (error.name !== 'AbortError') setSearch({ query: needle, books: [], error: error.message });
        });
    }, TYPING_PAUSE);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [needle, searchable]);

  const done = search.query === needle;
  const shelfKeys = new Set(shelf.map(bookKey));
  const open = resultsOpen && Boolean(needle);

  function resultsBody() {
    if (!searchable) return <p className="fg-results__empty">Keep typing: enter at least {MIN_QUERY} characters.</p>;
    if (!done) return <p className="fg-results__empty" role="status">Searching the library…</p>;
    if (search.error) return <p className="fg-results__empty" role="alert">{search.error}</p>;
    if (!search.books.length) return <p className="fg-results__empty">No books match “{needle}”. Try another title or author, or add it manually below.</p>;
    return (
      <div className="fg-book-grid">
        {search.books.map(book => {
          const picked = shelfKeys.has(bookKey(book));
          return <BookCard key={book.id} book={book} selected={picked} action={picked ? 'Selected' : 'Select'} onAction={() => onToggle(book)} />;
        })}
      </div>
    );
  }

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
        {open && <div className="fg-results" id="library-results">{resultsBody()}</div>}
      </div>
      <BookList title={`Selected Books (${books.length})`} books={books} action="Remove" onAction={onRemove} onAddManually={onAddManually} />
    </section>
  );
}
