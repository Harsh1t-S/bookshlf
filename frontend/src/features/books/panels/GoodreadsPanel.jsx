import { useState } from 'react';
import BookList from '../BookList.jsx';
import ImportStatus from '../ImportStatus.jsx';
import { importFromGoodreads } from '../goodreads.js';

// "Connect Goodreads": paste a profile link, import the Read and Currently Reading shelves.
export default function GoodreadsPanel({ hidden, books, onImport, onEdit, onAddManually }) {
  const [profile, setProfile] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState(() => (books.length ? 'done' : 'idle'));

  async function fetchShelf(event) {
    event.preventDefault();
    if (!profile.trim()) {
      setError('Paste your Goodreads profile link or user ID first.');
      return;
    }
    setError('');
    setPhase('syncing');
    try {
      onImport(await importFromGoodreads(profile));
      setPhase('done');
    } catch (failure) {
      setError(failure.message);
      setPhase('idle');
    }
  }

  return (
    <section className="fg-panel" aria-label="Connect Goodreads" hidden={hidden}>
      {phase === 'idle' && (
        <form onSubmit={fetchShelf} noValidate>
          <h2>Sync with Goodreads</h2>
          <p className="fg-panel__desc">Enter your Goodreads username or profile ID. We will extract your ‘Currently Reading’ and ‘Read’ Shelves.</p>
          <label className="fg-panel__label" htmlFor="goodreads-id">Paste your Goodreads ID here</label>
          <div className="fg-sync">
            <input
              id="goodreads-id"
              className="fg-input"
              value={profile}
              onChange={event => setProfile(event.target.value)}
              placeholder="goodreads.com/yourname or your user ID"
              autoComplete="off"
              aria-describedby={error ? 'goodreads-error' : undefined}
            />
            <button type="submit" className="fg-cta">Fetch My Goodreads Shelf</button>
          </div>
          {error && <p id="goodreads-error" className="fg-field-error" role="alert">{error}</p>}
        </form>
      )}
      {phase === 'syncing' && <ImportStatus>Trying to connect with Goodreads, and syncing your books...</ImportStatus>}
      {phase === 'done' && (
        <>
          <ImportStatus tone="success">Connection with Goodreads Verified!</ImportStatus>
          <BookList title={`Imported books from Goodreads (${books.length})`} books={books} action="Edit Details" onAction={onEdit} onAddManually={onAddManually} />
        </>
      )}
    </section>
  );
}
