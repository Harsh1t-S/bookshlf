import { useEffect, useRef, useState } from 'react';
import BookList from '../BookList.jsx';
import ImportStatus from '../ImportStatus.jsx';
import { scanShelfPhoto } from '../photo.js';

const count = number => `${number} ${number === 1 ? 'book' : 'books'}`;

// "Photograph your shelves": Gemini reads the spines in a photo (through our API) and each
// book is matched on Open Library. Readers can scan one shelf after another.
export default function PhotoPanel({ hidden, books, onImport, onEdit, onAddManually }) {
  const [phase, setPhase] = useState(() => (books.length ? 'done' : 'idle'));
  const [found, setFound] = useState(null); // Books in the latest photo; null until one is scanned here.
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const scan = useRef(null);

  // Leaving the page cancels a scan that is still running.
  useEffect(() => () => scan.current?.abort(), []);

  async function readPhoto(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file (JPG, PNG or HEIC) of your bookshelf.');
      return;
    }
    setError('');
    setPhase('reading');
    scan.current = new AbortController();
    try {
      const recognized = await scanShelfPhoto(file, { signal: scan.current.signal });
      onImport(recognized);
      setFound(recognized.length);
      setPhase('done');
    } catch (failure) {
      if (failure.name === 'AbortError') return;
      setError(failure.message);
      setPhase('idle');
    }
  }

  return (
    <section className="fg-panel" aria-label="Photograph your shelves" hidden={hidden}>
      {phase === 'idle' && (
        <>
          <h2>Scan Your Physical Bookshelf Photo</h2>
          <p className="fg-panel__desc">Upload a clear photo of your bookshelf or book stack. Our Gemini vision engine reads the spines and populates your virtual bookshelf. For best results, photograph one shelf at a time, close enough to read the spines.</p>
        </>
      )}
      {phase === 'reading' && <ImportStatus>Reading the spines with Gemini Vision and looking up each book. This can take up to 30 seconds...</ImportStatus>}
      {phase === 'done' && (
        <ImportStatus tone="success">
          {found === null ? `Recognized ${count(books.length)} from your photos.` : `Found ${count(found)} in your photo.`}
        </ImportStatus>
      )}
      {phase !== 'reading' && (
        <label
          className="fg-drop"
          data-over={dragOver}
          onDragOver={event => { event.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={event => { event.preventDefault(); setDragOver(false); readPhoto(event.dataTransfer.files?.[0]); }}
        >
          {phase === 'done' ? 'More shelves? Click to select or drag and drop another photo' : 'Click to select or drag and drop a bookshelf photo'}
          <input type="file" accept="image/*" className="sr-only" onChange={event => { readPhoto(event.target.files?.[0]); event.target.value = ''; }} />
        </label>
      )}
      {error && <p className="fg-field-error" role="alert">{error}</p>}
      {(phase === 'done' || books.length > 0) && (
        <BookList title={`Recognized Books (${books.length})`} books={books} action="Edit Details" onAction={onEdit} onAddManually={onAddManually} />
      )}
    </section>
  );
}
