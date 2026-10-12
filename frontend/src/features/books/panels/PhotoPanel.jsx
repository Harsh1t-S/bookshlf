import { useEffect, useRef, useState } from 'react';
import BookList from '../BookList.jsx';
import ImportStatus from '../ImportStatus.jsx';

const ANALYZE_DELAY = 1800;

// "Photograph your shelves". Recognition is still simulated with titles from the local catalog.
export default function PhotoPanel({ hidden, books, catalog, onImport, onEdit, onAddManually }) {
  const [phase, setPhase] = useState(() => (books.length ? 'done' : 'idle'));
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function readPhoto(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file (JPG, PNG or HEIC) of your bookshelf.');
      return;
    }
    setError('');
    setPhase('analyzing');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      onImport(catalog.slice(6, 12));
      setPhase('done');
    }, ANALYZE_DELAY);
  }

  return (
    <section className="fg-panel" aria-label="Photograph your shelves" hidden={hidden}>
      {phase === 'idle' && (
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
          {error && <p className="fg-field-error" role="alert">{error}</p>}
        </>
      )}
      {phase === 'analyzing' && <ImportStatus>Analyzing bookshelf image with Gemini Vision to extract book titles &amp; authors...</ImportStatus>}
      {phase === 'done' && (
        <>
          <ImportStatus tone="success">Recognized {books.length} {books.length === 1 ? 'book' : 'books'} from the photo.</ImportStatus>
          <BookList title={`Recognized Books (${books.length})`} books={books} action="Edit Details" onAction={onEdit} onAddManually={onAddManually} />
        </>
      )}
    </section>
  );
}
