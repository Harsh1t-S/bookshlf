import { useEffect, useRef, useState } from 'react';
import BookEditor from './BookEditor.jsx';
import Modal from '../../shared/Modal.jsx';

const SYNC_DELAY = 1800;

const methods = [
  { id: 'goodreads', icon: '📖', title: 'Connect Goodreads', sub: 'Import your read shelves', link: 'Connect account →' },
  { id: 'photo', icon: '📷', title: 'Photograph your shelves', sub: 'We read the spines for you', link: 'Upload a photo →' },
  { id: 'library', icon: '🔍', title: 'Browse our library', sub: 'Search and pick titles', link: 'Search books →' },
];

function bookKey(book) {
  const normalize = (value = '') => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  return `${normalize(book.title)}\u0000${normalize(book.author)}`;
}

function newBookId() {
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function BookCard({ book, action, onAction, selected }) {
  return (
    <div className="fg-book" data-selected={selected || undefined}>
      <div className="fg-book__cover">
        {book.cover && /^(https?:\/\/|\/)/.test(book.cover)
          ? <img src={book.cover} alt="" loading="lazy" />
          : <span style={{ background: book.color || '#7d3c1c' }}>{book.title}</span>}
      </div>
      <div className="fg-book__text">
        <span className="fg-book__title">{book.title}</span>
        <span className="fg-book__author">{book.author}</span>
        <button type="button" className="fg-book__action" onClick={onAction} aria-label={`${action}: ${book.title}`}>{action}</button>
      </div>
    </div>
  );
}

function Alert({ tone, children }) {
  return (
    <div className="fg-alert" data-tone={tone} role="status">
      {tone === 'success' ? <span aria-hidden="true">✅</span> : <i className="fg-alert__spinner" aria-hidden="true" />}
      <span>{children}</span>
    </div>
  );
}

export default function AddBooksPage({ books = [], catalog = [], onBooksChange, onContinue }) {
  const [mode, setMode] = useState('goodreads');
  const [goodreadsId, setGoodreadsId] = useState('');
  const [goodreadsError, setGoodreadsError] = useState('');
  const [goodreadsPhase, setGoodreadsPhase] = useState('idle');
  const [photoPhase, setPhotoPhase] = useState('idle');
  const [photoError, setPhotoError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [query, setQuery] = useState('');
  const [resultsOpen, setResultsOpen] = useState(false);
  const [editor, setEditor] = useState(null);
  const timers = useRef([]);
  const searchRef = useRef(null);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  useEffect(() => {
    if (!resultsOpen) return undefined;
    function close(event) {
      if (!searchRef.current?.contains(event.target)) setResultsOpen(false);
    }
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [resultsOpen]);

  function later(callback) {
    timers.current.push(window.setTimeout(callback, SYNC_DELAY));
  }

  // Goodreads and photo recognition are simulated with titles from the local catalog.
  function importBooks(source, picks) {
    const keys = new Set(books.map(bookKey));
    const added = picks.filter(book => !keys.has(bookKey(book))).map(book => ({ ...book, source }));
    onBooksChange([...books, ...added]);
  }

  function fetchGoodreads(event) {
    event.preventDefault();
    if (!goodreadsId.trim()) {
      setGoodreadsError('Paste your Goodreads username or profile ID first.');
      return;
    }
    setGoodreadsError('');
    setGoodreadsPhase('syncing');
    later(() => {
      importBooks('goodreads', catalog.slice(0, 6));
      setGoodreadsPhase('done');
    });
  }

  function readPhoto(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file (JPG, PNG or HEIC) of your bookshelf.');
      return;
    }
    setPhotoError('');
    setPhotoPhase('analyzing');
    later(() => {
      importBooks('photo', catalog.slice(6, 12));
      setPhotoPhase('done');
    });
  }

  function toggleLibraryBook(book) {
    const existing = books.find(item => bookKey(item) === bookKey(book));
    if (existing) onBooksChange(books.filter(item => item.id !== existing.id));
    else onBooksChange([...books, { ...book, source: 'library' }]);
  }

  function removeBook(book) {
    onBooksChange(books.filter(item => item.id !== book.id));
    setEditor(null);
  }

  function saveBook(book) {
    const clash = books.some(item => item.id !== book.id && bookKey(item) === bookKey(book));
    if (clash) return `${book.title} by ${book.author} is already on your shelf.`;
    if (book.id) onBooksChange(books.map(item => (item.id === book.id ? { ...item, ...book } : item)));
    else onBooksChange([...books, { ...book, id: newBookId(), source: editor.source }]);
    setEditor(null);
    return true;
  }

  const fromSource = source => books.filter(book => (source === 'library' ? !book.source || book.source === 'library' : book.source === source));
  const goodreadsBooks = fromSource('goodreads');
  const photoBooks = fromSource('photo');
  const libraryBooks = fromSource('library');
  const needle = query.trim().toLocaleLowerCase();
  const results = needle ? catalog.filter(book => `${book.title} ${book.author}`.toLocaleLowerCase().includes(needle)) : [];
  const shelfKeys = new Set(books.map(bookKey));

  const listHead = (title, source) => (
    <div className="fg-list-head">
      <h3>{title}</h3>
      <button type="button" className="fg-outline" onClick={() => setEditor({ source })}>Add Book Manually</button>
    </div>
  );

  const editableGrid = list => (
    <div className="fg-book-grid">
      {list.map(book => <BookCard key={book.id} book={book} action="Edit Details" onAction={() => setEditor({ book })} />)}
    </div>
  );

  return (
    <div className="fg-books">
      <div className="fg-head">
        <h1>Add your books</h1>
        <p>Choose how you'd like to populate your bookshelf.</p>
      </div>

      <div className="fg-methods" role="group" aria-label="Ways to add books">
        {methods.map(method => (
          <button key={method.id} type="button" className="fg-method" aria-pressed={mode === method.id} onClick={() => setMode(method.id)}>
            <span className="fg-method__icon" aria-hidden="true">{method.icon}</span>
            <span className="fg-method__title">{method.title}</span>
            <span className="fg-method__sub">{method.sub}</span>
            <span className="fg-method__link">{method.link}</span>
          </button>
        ))}
      </div>

      {mode === 'goodreads' && (
        <section className="fg-panel" aria-label="Connect Goodreads">
          {goodreadsPhase === 'idle' && (
            <form onSubmit={fetchGoodreads} noValidate>
              <h2>Sync with Goodreads</h2>
              <p className="fg-panel__desc">Enter your Goodreads username or profile ID. We will extract your ‘Currently Reading’ and ‘Read’ Shelves.</p>
              <label className="fg-panel__label" htmlFor="goodreads-id">Paste your Goodreads ID here</label>
              <div className="fg-sync">
                <input
                  id="goodreads-id"
                  className="fg-input"
                  value={goodreadsId}
                  onChange={event => setGoodreadsId(event.target.value)}
                  placeholder="Paste here"
                  autoComplete="off"
                  aria-describedby={goodreadsError ? 'goodreads-error' : undefined}
                />
                <button type="submit" className="fg-cta">Fetch My Goodreads Shelf</button>
              </div>
              {goodreadsError && <p id="goodreads-error" className="fg-field-error" role="alert">{goodreadsError}</p>}
            </form>
          )}
          {goodreadsPhase === 'syncing' && <Alert>Trying to connect with Goodreads, and syncing your books...</Alert>}
          {goodreadsPhase === 'done' && (
            <>
              <Alert tone="success">Connection with Goodreads Verified!</Alert>
              {listHead(`Imported books from Goodreads (${goodreadsBooks.length})`, 'goodreads')}
              {editableGrid(goodreadsBooks)}
            </>
          )}
        </section>
      )}

      {mode === 'photo' && (
        <section className="fg-panel" aria-label="Photograph your shelves">
          {photoPhase === 'idle' && (
            <>
              <h2>Scan Your Physical Bookshelf Photo</h2>
              <p className="fg-panel__desc">Upload a clear photo of your bookshelf or book stack. Our Gemini vision engine reads the spines and populates your virtual bookshelf.</p>
              <label
                className="fg-drop"
                data-over={dragOver}
                onDragOver={event => { event.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={event => { event.preventDefault(); setDragOver(false); readPhoto(event.dataTransfer.files?.[0]); }}
              >
                Click to select or drag and drop a bookshelf photo
                <input type="file" accept="image/*" className="sr-only" onChange={event => { readPhoto(event.target.files?.[0]); event.target.value = ''; }} />
              </label>
              {photoError && <p className="fg-field-error" role="alert">{photoError}</p>}
            </>
          )}
          {photoPhase === 'analyzing' && <Alert>Analyzing bookshelf image with Gemini Vision to extract book titles &amp; authors...</Alert>}
          {photoPhase === 'done' && (
            <>
              <Alert tone="success">Recognized {photoBooks.length} {photoBooks.length === 1 ? 'book' : 'books'} from the photo.</Alert>
              {listHead(`Recognized Books (${photoBooks.length})`, 'photo')}
              {editableGrid(photoBooks)}
            </>
          )}
        </section>
      )}

      {mode === 'library' && (
        <section className="fg-panel" aria-label="Browse our library">
          <h2><label htmlFor="library-search">Book Library</label></h2>
          <div className="fg-search" ref={searchRef}>
            <input
              id="library-search"
              className="fg-input"
              type="search"
              value={query}
              data-open={resultsOpen && Boolean(needle)}
              onChange={event => { setQuery(event.target.value); setResultsOpen(true); }}
              onFocus={() => setResultsOpen(true)}
              onKeyDown={event => { if (event.key === 'Escape') setResultsOpen(false); }}
              placeholder="Search books by title, author or keyword"
              autoComplete="off"
              aria-controls="library-results"
              aria-expanded={resultsOpen && Boolean(needle)}
            />
            {resultsOpen && needle && (
              <div className="fg-results" id="library-results">
                {results.length ? (
                  <div className="fg-book-grid">
                    {results.map(book => {
                      const picked = shelfKeys.has(bookKey(book));
                      return <BookCard key={book.id} book={book} selected={picked} action={picked ? 'Selected' : 'Select'} onAction={() => toggleLibraryBook(book)} />;
                    })}
                  </div>
                ) : <p className="fg-results__empty">No books match “{query.trim()}”. Try another title or author, or add it manually below.</p>}
              </div>
            )}
          </div>
          {listHead(`Selected Books (${libraryBooks.length})`, 'library')}
          {libraryBooks.length > 0 && (
            <div className="fg-book-grid">
              {libraryBooks.map(book => <BookCard key={book.id} book={book} action="Remove" onAction={() => removeBook(book)} />)}
            </div>
          )}
        </section>
      )}

      {books.length > 0 && <button type="button" className="fg-cta" onClick={onContinue}>Continue Creating Shelf</button>}

      {editor && (
        <Modal onClose={() => setEditor(null)} labelledBy="book-editor-heading" className="fg-edit-dialog">
          <h2 id="book-editor-heading" className="sr-only">{editor.book ? 'Edit book details' : 'Add a book manually'}</h2>
          <BookEditor book={editor.book} onSave={saveBook} onCancel={() => setEditor(null)} onRemove={removeBook} />
        </Modal>
      )}
    </div>
  );
}
