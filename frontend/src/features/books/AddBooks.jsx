import { useState } from 'react';
import BookEditor from './BookEditor.jsx';
import { bookKey } from './bookKey.js';
import GoodreadsPanel from './panels/GoodreadsPanel.jsx';
import LibraryPanel from './panels/LibraryPanel.jsx';
import PhotoPanel from './panels/PhotoPanel.jsx';
import Modal from '../../components/Modal.jsx';

const methods = [
  { id: 'goodreads', icon: '📖', title: 'Connect Goodreads', sub: 'Import your read shelves', link: 'Connect account →' },
  { id: 'photo', icon: '📷', title: 'Photograph your shelves', sub: 'We read the spines for you', link: 'Upload a photo →' },
  { id: 'library', icon: '🔍', title: 'Browse our library', sub: 'Search and pick titles', link: 'Search books →' },
];

function newBookId() {
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// "Add your books" step: pick a source (Goodreads, photo, library), then edit or add
// books by hand. Every panel stays mounted, so switching tabs never loses a running import.
export default function AddBooks({ books = [], onBooksChange, onContinue }) {
  const fromSource = source => books.filter(book => (source === 'library' ? !book.source || book.source === 'library' : book.source === source));
  // Coming back to this page (Back, refresh, "Add book") shows what is already on the shelf.
  const [mode, setMode] = useState(() => (fromSource('goodreads').length ? 'goodreads' : fromSource('photo').length ? 'photo' : books.length ? 'library' : 'goodreads'));
  const [editor, setEditor] = useState(null);

  // Imports finish after a wait, so they merge into the shelf as it is by then: books picked
  // or removed in another tab meanwhile are kept.
  function importBooks(source, picks) {
    onBooksChange(current => {
      const keys = new Set(current.map(bookKey));
      const added = picks.filter(book => !keys.has(bookKey(book))).map(book => ({ ...book, source }));
      return [...current, ...added];
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

  const editBook = book => setEditor({ book });
  const addManually = source => () => setEditor({ source });

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

      <GoodreadsPanel
        hidden={mode !== 'goodreads'}
        books={fromSource('goodreads')}
        onImport={picks => importBooks('goodreads', picks)}
        onEdit={editBook}
        onAddManually={addManually('goodreads')}
      />
      <PhotoPanel
        hidden={mode !== 'photo'}
        books={fromSource('photo')}
        onImport={picks => importBooks('photo', picks)}
        onEdit={editBook}
        onAddManually={addManually('photo')}
      />
      <LibraryPanel
        hidden={mode !== 'library'}
        books={fromSource('library')}
        shelf={books}
        onToggle={toggleLibraryBook}
        onRemove={removeBook}
        onAddManually={addManually('library')}
      />

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
