import { useState } from 'react';
import BookCover from '../shared/BookCover';
import { getTheme, themes } from '../data/themes';

export default function ShelfPreview({
  books = [],
  theme: initialTheme,
  onEdit,
  name: initialName = 'Sarah',
  since = 2019,
}) {
  const [activeTheme, setActiveTheme] = useState(initialTheme);
  const [name, setName] = useState(initialName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [hoveredBook, setHoveredBook] = useState(null);

  const selected = getTheme(activeTheme);
  const colors = selected.colors;
  const username = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'reader';
  const shelfUrl = `https://bookshelf.cv/${username}`;
  const shareText = `Explore ${name}’s Reading Life on Bookshelf.cv`;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(shelfUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  // Split books into shelves for realistic multi-tier rendering
  const shelfCapacity = 5;
  const shelves = [];
  for (let i = 0; i < books.length; i += shelfCapacity) {
    shelves.push(books.slice(i, i + shelfCapacity));
  }
  if (shelves.length === 0) shelves.push([]);

  return (
    <main
      style={{
        background: colors.page,
        color: colors.ink,
      }}
      className="min-h-screen transition-colors duration-500 pb-24"
    >
      {/* Top Shelf Controls Bar */}
      <section className="border-b border-black/10 bg-white/70 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
          {/* Quick Theme Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-black/50">
              Theme:
            </span>
            <div className="flex gap-1.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTheme(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selected.id === t.id
                      ? 'bg-[#e13a00] text-white shadow-xs'
                      : 'bg-black/5 text-black/70 hover:bg-black/10'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-black/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-black/80 hover:bg-black/5"
            >
              Edit Books
            </button>
            <button
              type="button"
              onClick={() => setPublishModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#16834c] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#116d3e]"
            >
              <span>🚀</span>
              <span>Publish Shelf</span>
            </button>
          </div>
        </div>
      </section>

      {/* Showcase Profile Header */}
      <header className="px-5 pt-10 pb-8 text-center sm:pt-14 sm:pb-12">
        <div className="mx-auto max-w-[700px]">
          <span className="inline-block text-[11px] font-bold tracking-[0.25em] text-[#e13a00]">
            BOOKSHELF.CV
          </span>

          <div className="mt-2 flex items-center justify-center gap-2">
            {isEditingName ? (
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="font-serif text-3xl sm:text-5xl font-bold italic tracking-tight text-center bg-white/80 rounded-lg border border-black/20 px-2 py-0.5 outline-none"
              />
            ) : (
              <h1
                onClick={() => setIsEditingName(true)}
                title="Click to edit name"
                className="group cursor-pointer font-serif text-3xl sm:text-5xl font-bold italic tracking-tight"
              >
                {name}’s Reading Life
                <span className="ml-2 text-xs font-sans not-italic text-black/40 opacity-0 group-hover:opacity-100 transition">
                  ✎ edit
                </span>
              </h1>
            )}
          </div>

          <p className="mt-2 text-sm text-current opacity-70">
            {books.length} {books.length === 1 ? 'book' : 'books'} <span className="px-1.5">•</span> reading since {since}
          </p>

          {/* Shareable Link Box */}
          <div className="mx-auto mt-6 flex max-w-[440px] items-center gap-2 rounded-xl border border-black/10 bg-white/90 p-1.5 shadow-sm">
            <span className="flex-1 truncate px-3 text-left font-mono text-xs text-black/70">
              {shelfUrl}
            </span>
            <button
              type="button"
              onClick={copyUrl}
              className="rounded-lg bg-[#e13a00] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#c93200]"
            >
              {copied ? '✓ Copied!' : 'Copy URL'}
            </button>
          </div>

          {/* Social Share Badges */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shelfUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/15 bg-white/80 px-3 py-1 text-[11px] font-medium text-current/80 hover:bg-white"
            >
              Share on X
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shelfUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/15 bg-white/80 px-3 py-1 text-[11px] font-medium text-current/80 hover:bg-white"
            >
              Facebook
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shelfUrl)}`}
              className="rounded-full border border-black/15 bg-white/80 px-3 py-1 text-[11px] font-medium text-current/80 hover:bg-white"
            >
              Email
            </a>
            <button
              type="button"
              onClick={() => setPublishModalOpen(true)}
              className="rounded-full border border-black/15 bg-white/80 px-3 py-1 text-[11px] font-medium text-current/80 hover:bg-white"
            >
              &lt;/&gt; Embed
            </button>
          </div>
        </div>
      </header>

      {/* Main Bookshelf Display Section */}
      <section className="mx-auto max-w-[1140px] px-5 sm:px-8">
        {books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/20 p-12 text-center">
            <p className="text-base text-current/70">Your bookshelf has no books yet.</p>
            <button
              type="button"
              onClick={onEdit}
              className="mt-4 rounded-xl bg-[#e13a00] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#c93200]"
            >
              + Add Books to Shelf
            </button>
          </div>
        ) : (
          <div>
            {/* THEME 1: CLASSIC WOODEN SHELVES (as in figma-00.png) */}
            {selected.layout === 'wood' && (
              <div className="space-y-16 py-6">
                {shelves.map((shelfBooks, shelfIndex) => (
                  <div key={shelfIndex} className="relative">
                    {/* Books on the wooden shelf */}
                    <div className="relative z-10 flex items-end justify-center gap-4 sm:gap-8 px-4 pb-0">
                      {shelfBooks.map((book) => (
                        <div
                          key={book.id}
                          className="group relative w-[100px] sm:w-[145px] lg:w-[170px] transition-transform duration-300 hover:-translate-y-3 cursor-pointer"
                        >
                          <BookCover book={book} className="w-full drop-shadow-xl" />
                          <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[11px] text-white">
                            {book.title}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 3D Realistic Wooden Shelf Plank with drop shadow */}
                    <div className="relative z-20 mt-[-2px]">
                      {/* Top shelf face with light wood grain */}
                      <div className="h-[14px] w-full rounded-xs bg-gradient-to-r from-[#d99f5d] via-[#e5b375] to-[#c98e4f] shadow-inner" />
                      {/* Front beveled wooden edge */}
                      <div className="h-[22px] w-full rounded-b-sm bg-gradient-to-b from-[#8f5926] via-[#754417] to-[#54300e] shadow-[0_12px_24px_rgba(0,0,0,0.6),0_4px_8px_rgba(0,0,0,0.4)] flex items-center justify-between px-6">
                        <div className="h-[1px] w-full bg-white/20 -mt-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* THEME 2: SPINE BOOKSHELF (as in figma-02.png / Yaren's Bookshelf / middle Figma board) */}
            {selected.layout === 'spine' && (
              <div className="rounded-2xl border border-[#1c382a] bg-[#0d1f16] p-6 sm:p-10 shadow-2xl">
                <div className="mb-6 flex items-center justify-between border-b border-[#1c382a] pb-3 text-emerald-400 text-xs font-mono">
                  <span>LIBRARY CATALOG SPINE VIEW</span>
                  <span>{books.length} VOLUMES</span>
                </div>

                <div className="space-y-12">
                  {shelves.map((shelfBooks, shelfIndex) => (
                    <div key={shelfIndex} className="relative">
                      {/* Vertical Spines lined up standing */}
                      <div className="relative z-10 flex items-end justify-center overflow-x-auto px-4 pb-0 scrollbar-none">
                        {shelfBooks.map((book, bIdx) => {
                          const heightPct = book.height || (85 + (bIdx % 4) * 5);
                          const spineWidth = 32 + (book.title.length % 5) * 4;

                          return (
                            <div
                              key={book.id}
                              onMouseEnter={() => setHoveredBook(book)}
                              onMouseLeave={() => setHoveredBook(null)}
                              className="group relative flex flex-col justify-between rounded-t-sm transition-all duration-200 hover:-translate-y-4 hover:z-30 cursor-pointer shadow-md select-none"
                              style={{
                                height: `${heightPct * 2.6}px`,
                                width: `${spineWidth}px`,
                                backgroundColor: book.spineBg || book.color || '#2d4a3e',
                                color: book.spineText || '#ffffff',
                                borderRight: '1px solid rgba(0,0,0,0.25)',
                                borderLeft: '1px solid rgba(255,255,255,0.15)',
                              }}
                            >
                              {/* Top publisher / series icon */}
                              <div className="pt-2 text-center">
                                <span className="block text-[8px] opacity-70 tracking-widest uppercase">
                                  ♦
                                </span>
                              </div>

                              {/* Vertical Title & Author */}
                              <div className="flex flex-1 items-center justify-center overflow-hidden py-2">
                                <span
                                  className="writing-mode-vertical whitespace-nowrap text-xs font-bold tracking-tight uppercase"
                                  style={{
                                    writingMode: 'vertical-rl',
                                    transform: 'rotate(180deg)',
                                  }}
                                >
                                  {book.title}
                                </span>
                              </div>

                              {/* Bottom Author / Catalog mark */}
                              <div className="pb-2 text-center">
                                <span
                                  className="writing-mode-vertical block text-[9px] opacity-70 uppercase truncate max-h-16"
                                  style={{
                                    writingMode: 'vertical-rl',
                                    transform: 'rotate(180deg)',
                                  }}
                                >
                                  {book.author.split(' ').pop()}
                                </span>
                              </div>

                              {/* Ribbon or gold accent line on spine */}
                              <div className="h-[3px] w-full bg-amber-400/80" />
                            </div>
                          );
                        })}
                      </div>

                      {/* Shelf plank */}
                      <div className="relative z-20 h-[14px] w-full rounded-sm bg-gradient-to-b from-[#244b36] to-[#12281d] shadow-[0_8px_16px_rgba(0,0,0,0.7)]" />
                    </div>
                  ))}
                </div>

                {/* Hover Details Card */}
                {hoveredBook && (
                  <div className="mt-6 flex items-center justify-center">
                    <div className="flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-[#122a1e] p-3 text-white shadow-xl">
                      <div className="w-10">
                        <BookCover book={hoveredBook} className="aspect-[1/1.5] w-full" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-white">
                          {hoveredBook.title}
                        </h4>
                        <p className="text-xs text-emerald-300/80">{hoveredBook.author}</p>
                      </div>
                      {hoveredBook.rating && (
                        <span className="text-sm text-amber-400">
                          {'★'.repeat(hoveredBook.rating)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* THEME 3: MINIMAL WHITE FLOATING SHELF (as in figma-01.png Jeremy Brand) */}
            {selected.layout === 'floating' && (
              <div className="space-y-16 py-8">
                {shelves.map((shelfBooks, shelfIndex) => (
                  <div key={shelfIndex} className="relative">
                    {/* Books on white ledge with review stars below */}
                    <div className="relative z-10 flex items-end justify-center gap-6 sm:gap-12 px-4 pb-0">
                      {shelfBooks.map((book) => (
                        <div
                          key={book.id}
                          className="group relative flex flex-col items-center w-[110px] sm:w-[155px] lg:w-[185px] transition-transform duration-300 hover:-translate-y-2 cursor-pointer"
                        >
                          <BookCover book={book} className="w-full drop-shadow-md" />
                          <h4 className="mt-3 line-clamp-1 text-center font-serif text-xs font-bold text-black/90">
                            {book.title}
                          </h4>
                          <div className="mt-1 flex text-xs text-amber-500">
                            {'★'.repeat(book.rating || 5)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Floating White Shelf Ledge */}
                    <div className="relative z-20 mt-2 h-[6px] w-full rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.06)] border border-black/5" />
                  </div>
                ))}
              </div>
            )}

            {/* THEME 4, 5, 6: GRID THEMES (Simple Grid, Sunny Shelf, Midnight Library) */}
            {selected.layout === 'grid' && (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-7 lg:grid-cols-4">
                {books.map((book) => (
                  <article
                    key={book.id}
                    className="group relative flex flex-col items-center rounded-xl p-4 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                    style={{
                      backgroundColor: colors.cardBg,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div className="w-full max-w-[190px]">
                      <BookCover book={book} className="w-full" />
                    </div>

                    <h3 className="mt-4 line-clamp-2 w-full text-center font-serif text-sm font-bold leading-snug">
                      {book.title}
                    </h3>

                    {book.author && (
                      <p className="mt-1 line-clamp-1 w-full text-center text-xs opacity-75">
                        {book.author}
                      </p>
                    )}

                    {book.rating && (
                      <div className="mt-2 flex text-xs text-amber-500">
                        {'★'.repeat(book.rating)}
                        {'☆'.repeat(5 - book.rating)}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Publish Celebration Modal */}
      {publishModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white p-6 shadow-2xl text-left text-[#27221e]">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <h3 className="font-serif text-xl font-bold">Your Bookshelf is Live!</h3>
              </div>
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <p className="mt-4 text-sm text-[#555] leading-relaxed">
              Anyone with this link can now view your custom virtual reading bookshelf with all current books and themes.
            </p>

            <div className="mt-5 rounded-xl border border-black/10 bg-[#faf7f2] p-3">
              <span className="block text-xs font-semibold text-[#888]">PUBLIC SHARE LINK</span>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate font-mono text-xs font-medium text-[#e13a00]">
                  {shelfUrl}
                </span>
                <button
                  type="button"
                  onClick={copyUrl}
                  className="rounded-lg bg-[#e13a00] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c93200]"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-black/10 bg-[#faf7f2] p-3">
              <span className="block text-xs font-semibold text-[#888]">EMBED WIDGET CODE</span>
              <code className="mt-1 block truncate font-mono text-[11px] text-[#444] bg-white p-2 rounded border border-black/5">
                {`<iframe src="${shelfUrl}?embed=true" width="100%" height="450"></iframe>`}
              </code>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="rounded-xl bg-[#16834c] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#116d3e]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
