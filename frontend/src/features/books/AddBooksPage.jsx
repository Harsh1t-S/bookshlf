import { useEffect, useState } from 'react';
import BookCollection from './BookCollection';
import BookEditor from './BookEditor';
import BookCover from '../../shared/BookCover';

const options = [
  {
    id: 'goodreads',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm6 8h-2v-4c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v-6h2v1.1c.4-.7 1.2-1.1 2-1.1 1.66 0 3 1.34 3 3v3z" />
      </svg>
    ),
    title: 'Connect Goodreads',
    description: 'Bring your reading shelves along.',
    link: 'Import unavailable',
  },
  {
    id: 'photo',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Photograph your shelves',
    description: 'Start with a photo of your books.',
    link: 'Choose a photo →',
  },
  {
    id: 'browse',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Browse our library',
    description: 'Find books and add them one by one.',
    link: 'Search books →',
  },
];

const inputClass =
  'w-full rounded-xl border border-[#d6cec2] bg-white px-4 py-3 text-sm text-[#34291f] outline-none transition focus:border-[#e13a00] focus:ring-1 focus:ring-[#e13a00]';

function bookKey(book) {
  const normalize = (value = '') => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  return `${normalize(book.title)}\u0000${normalize(book.author)}`;
}

export default function AddBooksPage({
  books = [],
  onBooksChange = () => {},
  onContinue,
  onBack,
  catalog = [],
}) {
  const [mode, setMode] = useState('goodreads');
  const [photoMessage, setPhotoMessage] = useState('');
  const [query, setQuery] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [removedBook, setRemovedBook] = useState(null);

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  function addBook(book) {
    const id = book.id ?? `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duplicate = books.some((item) => item.id === id || bookKey(item) === bookKey(book));
    if (duplicate) {
      const message = `${book.title} by ${book.author} is already on your shelf.`;
      setStatusMessage(message);
      return message;
    }
    onBooksChange([...books, { ...book, id }]);
    setStatusMessage(`${book.title} was added to your shelf.`);
    setRemovedBook(null);
    return true;
  }

  function saveBook(book) {
    if (editing) {
      const duplicate = books.some((item) =>
        item.id !== editing.id && bookKey(item) === bookKey(book)
      );
      if (duplicate) {
        return `${book.title} by ${book.author} is already on your shelf.`;
      }
      onBooksChange(books.map((item) => (item.id === editing.id ? { ...item, ...book } : item)));
      setStatusMessage(`${book.title} details were updated.`);
    } else {
      const result = addBook(book);
      if (result !== true) return result;
    }
    setEditing(null);
    setManualOpen(false);
    return true;
  }

  function removeBook(id) {
    const index = books.findIndex((book) => book.id === id);
    if (index < 0) return;
    const [book] = books.slice(index, index + 1);
    setRemovedBook({ book, index });
    onBooksChange(books.filter((item) => item.id !== id));
    if (editing?.id === id) setEditing(null);
    setStatusMessage(`${book.title} was removed from your shelf.`);
  }

  function undoRemove() {
    if (!removedBook) return;
    if (books.some((book) => bookKey(book) === bookKey(removedBook.book))) {
      setStatusMessage('That book is already on your shelf, so it could not be restored.');
      setRemovedBook(null);
      return;
    }
    const nextBooks = [...books];
    nextBooks.splice(Math.min(removedBook.index, nextBooks.length), 0, removedBook.book);
    onBooksChange(nextBooks);
    setStatusMessage(`${removedBook.book.title} was restored to your shelf.`);
    setRemovedBook(null);
  }

  const library = catalog.map((book, index) => ({
    ...book,
    id: book.id ?? `catalog-${index}`,
  }));

  const filtered = library.filter((book) =>
    `${book.title} ${book.author}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const loadSamples = () => {
    const keys = new Set(books.map(bookKey));
    const ids = new Set(books.map((book) => book.id));
    const samples = library.slice(0, 6).filter((item) => {
      const key = bookKey(item);
      if (keys.has(key) || ids.has(item.id)) return false;
      keys.add(key);
      ids.add(item.id);
      return true;
    });
    onBooksChange([...books, ...samples]);
    setStatusMessage(samples.length
      ? `Added ${samples.length} sample books from the local catalog.`
      : 'All local sample books are already on your shelf.');
    setRemovedBook(null);
  };

  function selectPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoUrl('');
      setPhotoMessage('Choose an image file to preview your bookshelf photo.');
      return;
    }
    setPhotoMessage('');
    setPhotoUrl(URL.createObjectURL(file));
  }

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-16 pt-6 sm:px-8">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center text-sm font-medium text-[#734021] hover:underline"
        >
          ← Back
        </button>
      )}

      <header className="text-center">
        <h1 className="font-heading text-[32px] font-bold leading-tight tracking-[-0.035em] text-[#2c231c] sm:text-[40px]">
          Add your books
        </h1>
        <p className="mt-2 text-base text-[#776e65]">
          Choose how you’d like to populate your bookshelf.
        </p>
      </header>

      {/* 3 Top Method Cards matching Figma */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {options.map((item) => {
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              aria-pressed={active}
              className={`flex flex-col justify-between rounded-[16px] border bg-white p-6 text-left transition ${
                active
                  ? 'border-[#784322] border-l-[6px] shadow-[0_4px_16px_rgba(85,54,29,0.08)]'
                  : 'border-[#e8e2d8] hover:border-[#cdb9a5]'
              }`}
            >
              <div>
                <span className={`inline-block ${active ? 'text-[#e13a00]' : 'text-[#81776d]'}`}>
                  {item.icon}
                </span>
                <h2 className="mt-4 font-serif text-[20px] font-bold text-[#2d241c]">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs text-[#81776d] leading-relaxed">
                  {item.description}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center text-xs font-bold text-[#e13a00]">
                {item.link}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Method Panel */}
      <section className="mt-5 rounded-[18px] border border-[#e8e2d8] bg-white p-6 shadow-xs">
        {mode === 'goodreads' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2d241c]">Goodreads import</h3>
                <p className="mt-1 text-xs text-[#81776d]">
                  Goodreads import is unavailable in this browser preview. Browse the local catalog instead.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMode('browse')}
                className="rounded-full border border-[#e13a00] px-4 py-1.5 text-xs font-semibold text-[#e13a00] hover:bg-[#fff5f0]"
              >
                Browse local books
              </button>
            </div>

            <p className="mt-3 text-xs text-[#81776d]">No Goodreads account details or password are requested.</p>
          </div>
        )}

        {mode === 'photo' && (
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2d241c]">Photograph your shelves</h3>
            <p className="mt-1 text-xs text-[#81776d]">
              Upload a bookshelf photo for reference, then add the titles manually.
            </p>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d6cec2] bg-[#fffdfa] p-6 text-center hover:border-[#e13a00]">
              <svg className="h-8 w-8 text-[#9b8d7e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="mt-2 text-sm font-semibold text-[#2d241c]">Choose a bookshelf photo</span>
              <span className="mt-0.5 text-xs text-[#81776d]">Image files only</span>
              <input aria-label="Choose a bookshelf photo" type="file" accept="image/*" className="sr-only" onChange={selectPhoto} />
            </label>

            {photoMessage && <p role="alert" className="mt-3 text-xs text-[#a34222]">{photoMessage}</p>}

            {photoUrl && (
              <div className="mt-4 flex flex-col items-center sm:flex-row sm:gap-6">
                <img src={photoUrl} alt="Bookshelf capture" className="h-36 rounded-lg object-cover shadow-sm" />
                <div className="mt-3 sm:mt-0">
                  <p className="text-xs font-semibold text-[#2d241c]">Photo preview ready. Book recognition is unavailable.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setManualOpen(true);
                      window.setTimeout(() => document.getElementById('manual-book-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
                    }}
                    className="mt-2 rounded-xl bg-[#e13a00] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#c93200]"
                  >
                    Add book details manually
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'browse' && (
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2d241c]">Browse library</h3>
            <p className="mt-1 text-xs text-[#81776d]">
              Search titles and authors in the local catalog, then add books to your shelf.
            </p>

            <label htmlFor="catalog-search" className="mt-4 block text-xs font-semibold text-[#544b42]">
              Search by title or author
            </label>
            <div className="mt-1">
              <input
                id="catalog-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or author"
                className={inputClass}
              />
            </div>

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-2 text-xs font-semibold text-[#e13a00] underline-offset-2 hover:underline"
              >
                Clear search
              </button>
            )}

            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {filtered.map((book) => {
                const isAdded = books.some((item) => bookKey(item) === bookKey(book));
                return (
                  <div
                    key={book.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#f0eae1] bg-[#fffdfa] p-2.5 transition hover:border-[#e13a00]/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-[34px] shrink-0">
                        <BookCover book={book} className="aspect-[1/1.5] w-full" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#2d241c]">{book.title}</p>
                        <p className="truncate text-xs text-[#81776d]">{book.author}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addBook(book)}
                      disabled={isAdded}
                      className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-[#e13a00] text-white hover:bg-[#c93200]'
                      }`}
                    >
                      {isAdded ? '✓ Added' : '+ Add'}
                    </button>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-[#81776d]" role="status">
                  {library.length === 0
                    ? 'The local catalog has no books yet.'
                    : query.trim()
                      ? `No books match “${query.trim()}”. Try a different title or author.`
                      : 'No books are available in the local catalog yet.'}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Bookshelf Collection */}
      <section className="mt-6 rounded-[18px] border border-[#e8e2d8] bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
          <div>
            <h2 className="font-serif text-[22px] font-bold text-[#2d241c]">
              Your bookshelf ({books.length})
            </h2>
            <p className="text-xs text-[#81776d]">
              {books.length === 0
                ? 'Your shelf is currently empty. Add books above.'
                : 'Books on your shelf.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setManualOpen(true);
            }}
            className="rounded-full border border-[#e13a00] px-4 py-2 text-xs font-semibold text-[#e13a00] hover:bg-[#fff5f0]"
          >
            + Add manually
          </button>
        </div>

        {manualOpen && (
          <div id="manual-book-editor">
            <BookEditor onSave={saveBook} onCancel={() => setManualOpen(false)} />
          </div>
        )}

        {statusMessage && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#6e5845]" role="status" aria-live="polite">
            <span>{statusMessage}</span>
            {removedBook && (
              <button type="button" onClick={undoRemove} className="font-semibold text-[#e13a00] underline-offset-2 hover:underline">
                Undo
              </button>
            )}
          </div>
        )}

        {books.length > 0 ? (
          <BookCollection
            books={books}
            editing={editing}
            onEdit={(b) => {
              setManualOpen(false);
              setEditing(b);
            }}
            onRemove={removeBook}
            onSave={saveBook}
            onCancel={() => setEditing(null)}
          />
        ) : (
          !manualOpen && (
            <div className="py-12 text-center text-sm text-[#81776d]">
              <p>No books added yet.</p>
              <button
                type="button"
                onClick={loadSamples}
                className="mt-2 text-xs font-semibold text-[#e13a00] hover:underline"
              >
                Click here to load sample reading shelf
              </button>
            </div>
          )
        )}
      </section>

      {/* Continue CTA */}
      <button
        type="button"
        disabled={books.length === 0}
        onClick={onContinue}
        className="mt-8 h-14 w-full rounded-xl bg-[#e13a00] text-base font-semibold text-white shadow-[0_4px_14px_rgba(225,58,0,0.25)] transition hover:bg-[#c93200] disabled:cursor-not-allowed disabled:bg-[#d8c8ba] disabled:shadow-none"
      >
        Continue to Shelf Preview
      </button>
    </main>
  );
}
