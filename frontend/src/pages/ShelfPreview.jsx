import { useState } from 'react';
import { getTheme } from '../data/themes';
import BookDecorations from '../shared/BookDecorations';
import ShelfBooks from '../features/shelf/ShelfBooks.jsx';
import BookDetailsModal from '../features/shelf/BookDetailsModal.jsx';

export default function ShelfPreview({ books = [], theme, name = 'Sarah', since = 2019 }) {
  const [copyStatus, setCopyStatus] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const selected = getTheme(theme);
  const shelfBackground = selected.id === 'simple-grid' ? '#f1eadd' : selected.colors.page;
  const shelfTitle = name === 'Your' ? 'Your Reading Life' : `${name}’s Reading Life`;
  const tileBackground = selected.id === 'simple-grid'
    ? '#faf7f2'
    : selected.colors.cardBg === 'transparent'
      ? 'rgba(250, 247, 242, 0.16)'
      : selected.colors.cardBg;
  const shelfUrl = typeof window === 'undefined' ? '' : window.location.href;
  const shareText = shelfTitle;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(shelfUrl);
      setCopyStatus('Copied!');
      window.setTimeout(() => setCopyStatus(''), 1800);
    } catch {
      setCopyStatus('Copy unavailable');
      window.setTimeout(() => setCopyStatus(''), 2500);
    }
  }

  const socialLinks = [
    { label: 'X', icon: '𝕏', color: '#202020', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shelfUrl)}` },
    { label: 'LinkedIn', icon: 'in', color: '#0a66c2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shelfUrl)}` },
    { label: 'Instagram', icon: '◎', color: '#d63384', href: 'https://www.instagram.com/' },
    { label: 'Facebook', icon: 'f', color: '#1877f2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shelfUrl)}` },
    { label: 'WhatsApp', icon: '◉', color: '#25d366', href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shelfUrl}`)}` },
  ];

  return (
    <>
    <main className="min-h-[calc(100vh-70px)]" style={{ background: shelfBackground, color: selected.colors.ink, '--shelf-accent': selected.colors.accent, '--shelf-tile': tileBackground }}>
      <section className="relative h-auto px-5 pb-8 pt-10 text-center sm:h-[320px] sm:px-8 sm:pt-9" style={{ backgroundColor: selected.colors.headerBg, color: selected.colors.ink }}>
        <BookDecorations variant="shelf" />
        <div className="relative z-10">
          <p className="text-[11px] font-semibold tracking-[.2em]" style={{ color: selected.colors.muted }}>BOOKSHELF.CV</p>
          <h1 className="mt-3 font-serif text-[30px] font-bold italic leading-none tracking-[-.025em] sm:text-[32px]">{shelfTitle}</h1>
          <p className="mt-3 text-xs" style={{ color: selected.colors.muted }}>{books.length} books <span className="px-1">•</span> reading since {since}</p>
          <div className="mx-auto mt-5 flex h-12 max-w-[600px] items-center rounded-lg border border-[#e5ddd1] bg-white px-4">
            <div className="min-w-0 flex-1 truncate text-left text-xs text-[#82776a]" title={shelfUrl}>{shelfUrl}</div>
            <button type="button" onClick={copyUrl} className="ml-3 shrink-0 text-xs font-semibold text-[#785b3c] hover:underline">{copyStatus || 'Copy URL'}</button>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {socialLinks.map(link => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={`Share on ${link.label}`} className="flex items-center gap-1.5 rounded-full border bg-white/80 px-3 py-1.5 text-[11px] font-medium hover:bg-white" style={{ color: link.color, borderColor: `${link.color}55` }}><span aria-hidden="true" className="text-xs font-bold">{link.icon}</span>{link.label}</a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 pt-10 sm:px-8 sm:pt-12">
        <div className="mx-auto max-w-[1170px]">
          {books.length > 0 && <p className="shelf-invitation">Pick a book. There’s more between the covers.</p>}
          {books.length ? (
            <ShelfBooks books={books} theme={selected} onBookSelect={setSelectedBook} />
          ) : (
            <div className="py-12 text-center text-sm text-current/75">
              <p>Your shelf is empty.</p>
              <div className="mt-3 flex justify-center gap-4">
                <a href="/books" className="font-semibold text-[var(--shelf-accent,#df3900)] underline underline-offset-2 hover:opacity-80">Add books</a>
                <a href="/themes" className="font-semibold text-[var(--shelf-accent,#df3900)] underline underline-offset-2 hover:opacity-80">Browse themes</a>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
    <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </>
  );
}
