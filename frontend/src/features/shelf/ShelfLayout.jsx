import { useEffect, useRef, useState } from 'react';
import { getTheme } from '../../data/themes.js';
import BookDetailsModal from './BookDetailsModal.jsx';
import ShelfView from './ShelfView.jsx';
import { DecorPair, FlowNav } from '../../components/FlowShell.jsx';
import '../../styles/shelf-page.css';

const icons = {
  x: <path fill="currentColor" d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" />,
  linkedin: <path fill="currentColor" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />,
  instagram: <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></g>,
  facebook: <path fill="currentColor" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.23 2.69.23v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z" />,
  whatsapp: <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3.2 20.8l1.3-4.3a8.6 8.6 0 1 1 3.2 3.1z" /><path d="M9 7.8c-.4 0-.9.5-.9 1.3 0 2.6 3.4 6 6 6 .8 0 1.3-.5 1.3-.9l-.2-.8-1.9-.9-.9.9c-1.1-.4-2.2-1.5-2.6-2.6l.9-.9-.9-1.9z" /></g>,
};

function ShareButton({ kind, label, href, onClick }) {
  const content = (
    <>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">{icons[kind]}</svg>
      {label}
    </>
  );
  return href
    ? <a className="sp-share" data-kind={kind} href={href} target="_blank" rel="noreferrer">{content}</a>
    : <button type="button" className="sp-share" data-kind={kind} onClick={onClick}>{content}</button>;
}

export default function ShelfLayout({ books = [], theme, title, since, isDemo, onSignOut, onModify, onAddBook, onStart }) {
  const [status, setStatus] = useState('');
  const [selection, setSelection] = useState(null);
  const timer = useRef(0);
  const selected = getTheme(theme);
  const shelfUrl = window.location.href.split('#')[0];
  const shownUrl = shelfUrl.replace(/^https?:\/\//, '');

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function flash(message) {
    setStatus(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus(''), 2400);
  }

  async function copyLink(message = 'Link copied') {
    try {
      await navigator.clipboard.writeText(shelfUrl);
      flash(message);
    } catch {
      flash('Copy unavailable — select the link and copy it manually');
    }
  }

  const encodedUrl = encodeURIComponent(shelfUrl);
  const encodedText = encodeURIComponent(title);

  return (
    <div className="sp-page">
      {isDemo ? (
        <FlowNav right={<button type="button" className="sp-btn sp-btn--solid" onClick={onStart}>Create your bookshelf</button>} />
      ) : (
        <FlowNav
          left={<button type="button" className="fg-nav-link fg-nav-link--brand" onClick={onSignOut}>Sign Out</button>}
          right={(
            <>
              <button type="button" className="sp-btn" onClick={onModify}>Modify Shelf</button>
              <button type="button" className="sp-btn sp-btn--solid" onClick={onAddBook}>Add book</button>
            </>
          )}
        />
      )}

      <header className="sp-hero">
        <div className="sp-hero__decor" aria-hidden="true">
          <DecorPair corner="left" className="sp-hero__pair sp-hero__pair--left" />
          <DecorPair corner="right" className="sp-hero__pair sp-hero__pair--right" />
        </div>
        <p className="sp-eyebrow">BOOKSHELF.CV/</p>
        <h1 className="sp-title">{title}</h1>
        <p className="sp-meta">{books.length} {books.length === 1 ? 'book' : 'books'} · reading since {since}</p>
        <div className="sp-link">
          <i aria-hidden="true" />
          <span title={shelfUrl}>{shownUrl}</span>
          <button type="button" onClick={() => copyLink()}>Copy link</button>
        </div>
        <div className="sp-shares">
          <ShareButton kind="x" label="Twitter / X" href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} />
          <ShareButton kind="linkedin" label="LinkedIn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} />
          <ShareButton kind="instagram" label="Instagram" onClick={() => copyLink('Link copied — paste it into your Instagram bio or story')} />
          <ShareButton kind="facebook" label="Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} />
          <ShareButton kind="whatsapp" label="WhatsApp" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${shelfUrl}`)}`} />
        </div>
        <p className="sp-status" role="status" aria-live="polite">{status}</p>
      </header>

      <main>
        <ShelfView
          theme={selected}
          books={books}
          onBookSelect={(book, origin) => setSelection({ book, origin })}
          empty={(
            <div className="sp-empty">
              <p>Your shelf is empty.</p>
              <button type="button" className="sp-btn sp-btn--solid" onClick={onAddBook}>Add books</button>
            </div>
          )}
        />
      </main>
      <BookDetailsModal book={selection?.book} origin={selection?.origin} onClose={() => setSelection(null)} />
    </div>
  );
}
