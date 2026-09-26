import { useState } from 'react';
import BookCover from '../../shared/BookCover';
import { themes, getTheme } from '../../data/themes';
import CheckoutModal from './CheckoutModal';

function ThemeThumbnail({ theme, books }) {
  const sampleBooks = books?.length ? books.slice(0, 4) : [];

  if (theme.layout === 'wood') {
    return (
      <div className="relative flex h-[126px] flex-col justify-end overflow-hidden bg-gradient-to-b from-[#8f857b] to-[#7d736a] px-3 pb-3">
        {/* Books on shelf */}
        <div className="relative z-10 flex items-end justify-center gap-1.5 pb-0.5">
          {sampleBooks.slice(0, 4).map((book, i) => (
            <div key={i} className="w-[24px] drop-shadow-md">
              <BookCover book={book} className="aspect-[1/1.5] w-full" />
            </div>
          ))}
        </div>
        {/* 3D Wood shelf plank */}
        <div className="relative h-[8px] w-full rounded-sm bg-gradient-to-b from-[#b8864e] to-[#784d1a] shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
          <div className="h-[2px] w-full bg-white/20" />
        </div>
      </div>
    );
  }

  if (theme.layout === 'spine') {
    return (
      <div className="relative flex h-[126px] flex-col justify-end overflow-hidden bg-[#0d1f16] px-3 pb-3">
        {/* Vertical Spines */}
        <div className="relative z-10 flex items-end justify-center gap-[3px] pb-0.5">
          {sampleBooks.slice(0, 5).map((book, i) => (
            <div
              key={i}
              className="flex w-[18px] items-center justify-center rounded-t-sm shadow-sm"
              style={{
                height: `${42 + (i % 3) * 8}px`,
                backgroundColor: book.spineBg || book.color || '#2d4a3e',
                color: book.spineText || '#ffffff',
              }}
            >
              <span className="truncate text-[7px] font-bold uppercase tracking-tight -rotate-90">
                {book.title.slice(0, 5)}
              </span>
            </div>
          ))}
        </div>
        {/* Shelf plank */}
        <div className="h-[6px] w-full rounded-sm bg-[#1b3a2a] shadow-[0_3px_6px_rgba(0,0,0,0.6)]" />
      </div>
    );
  }

  if (theme.layout === 'floating') {
    return (
      <div className="relative flex h-[126px] flex-col justify-end overflow-hidden bg-[#fafafa] px-3 pb-3">
        {/* Books + Stars */}
        <div className="relative z-10 flex items-end justify-center gap-2 pb-1">
          {sampleBooks.slice(0, 3).map((book, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-[28px] drop-shadow-md">
                <BookCover book={book} className="aspect-[1/1.5] w-full" />
              </div>
              <span className="text-[7px] text-amber-500">★★★★★</span>
            </div>
          ))}
        </div>
        {/* Minimal white floating shelf */}
        <div className="h-[4px] w-full rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12)] border-t border-black/5" />
      </div>
    );
  }

  // Grid themes (Simple Grid, Sunny Shelf, Midnight Library)
  return (
    <div
      className="flex h-[126px] items-center justify-center overflow-hidden p-2.5"
      style={{ background: theme.colors.page }}
    >
      <div className="grid grid-cols-4 gap-1.5 w-full max-w-[150px]">
        {sampleBooks.slice(0, 4).map((book, i) => (
          <div key={i} className="w-full drop-shadow-sm">
            <BookCover book={book} className="aspect-[1/1.5] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ThemePicker({
  selectedTheme,
  books = [],
  onSelect = () => {},
  onContinue,
  onBack,
}) {
  const [preview, setPreview] = useState(null);
  const [purchasingTheme, setPurchasingTheme] = useState(null);
  const [unlockedThemes, setUnlockedThemes] = useState(['simple-grid', 'sunny-shelf', 'midnight-library']);

  const selectedId = typeof selectedTheme === 'string' ? selectedTheme : selectedTheme?.id;

  function choose(theme) {
    if (theme.paid && !unlockedThemes.includes(theme.id)) {
      setPurchasingTheme(theme);
      return;
    }
    onSelect(theme);
  }

  function handlePurchaseSuccess(theme) {
    setUnlockedThemes((prev) => [...prev, theme.id]);
    onSelect(theme);
    setPurchasingTheme(null);
  }

  const previewTheme = preview && getTheme(preview);

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

      <header className="mb-8 text-center">
        <h1 className="font-heading text-[32px] font-bold leading-tight tracking-[-0.035em] text-[#2c231c] sm:text-[40px]">
          Choose your look
        </h1>
        <p className="mt-2 text-base text-[#776e65]">
          Pick a display style for your bookshelf. You can change it anytime.
        </p>
      </header>

      {/* 3-Column Theme Grid matching Figma */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const active = selectedId === theme.id;
          const isUnlocked = !theme.paid || unlockedThemes.includes(theme.id);

          return (
            <article
              key={theme.id}
              className={`group flex flex-col overflow-hidden rounded-[14px] border bg-white shadow-[0_2px_10px_rgba(48,35,21,0.06)] transition hover:shadow-lg ${
                active
                  ? 'border-[#e13a00] ring-2 ring-[#e13a00]'
                  : 'border-[#e8e2d8] hover:border-[#cfc5b8]'
              }`}
            >
              {/* Badge */}
              <div
                className={`flex h-7 items-center justify-center text-[11px] font-bold tracking-[0.08em] text-white ${
                  theme.paid ? 'bg-[#da00ec]' : 'bg-[#16834c]'
                }`}
              >
                {theme.paid
                  ? isUnlocked
                    ? `PREMIUM · UNLOCKED`
                    : `PREMIUM · $${theme.price}`
                  : 'FREE'}
              </div>

              {/* Theme Preview Thumbnail */}
              <ThemeThumbnail theme={theme} books={books} />

              {/* Theme Info & Action */}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h2 className="truncate font-serif text-[17px] font-bold text-[#292522]">
                      {theme.name}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setPreview(theme.id)}
                      className="shrink-0 text-xs font-semibold text-[#e13a00] hover:underline"
                    >
                      Preview
                    </button>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-[#81776d]">
                    {theme.description}
                  </p>
                </div>

                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => choose(theme)}
                  className={`mt-4 h-9 w-full rounded-full border text-xs font-semibold transition ${
                    active
                      ? 'border-[#e13a00] bg-[#fff5f0] text-[#e13a00]'
                      : theme.paid && !isUnlocked
                      ? 'border-[#da00ec] bg-white text-[#da00ec] hover:bg-[#faf0fb]'
                      : 'border-[#e13a00] text-[#e13a00] hover:bg-[#fff5f0]'
                  }`}
                >
                  {active
                    ? 'Selected'
                    : theme.paid && !isUnlocked
                    ? `Select & Buy · $${theme.price}`
                    : 'Select'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Continue CTA */}
      <button
        type="button"
        disabled={!selectedId}
        onClick={onContinue}
        className="mt-8 h-14 w-full rounded-xl bg-[#e13a00] text-base font-semibold text-white shadow-[0_4px_14px_rgba(225,58,0,0.25)] transition hover:bg-[#c93200] disabled:cursor-not-allowed disabled:bg-[#d8c8ba] disabled:shadow-none"
      >
        Continue to Books
      </button>

      {/* Theme Full Preview Modal */}
      {previewTheme && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreview(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-preview-title"
            className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
              <h3 id="theme-preview-title" className="font-serif text-xl font-bold text-[#292522]">
                {previewTheme.name}
              </h3>
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Close preview"
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <ThemeThumbnail theme={previewTheme} books={books} />
              <p className="mt-4 text-center text-xs text-[#81776d]">
                {previewTheme.description}
              </p>
            </div>

            <div className="border-t border-black/5 bg-[#faf7f2] p-4">
              <button
                type="button"
                onClick={() => {
                  choose(previewTheme);
                  setPreview(null);
                }}
                className="h-11 w-full rounded-xl bg-[#e13a00] text-sm font-semibold text-white hover:bg-[#c93200]"
              >
                {selectedId === previewTheme.id
                  ? 'Currently Selected'
                  : previewTheme.paid && !unlockedThemes.includes(previewTheme.id)
                  ? `Select & Buy · $${previewTheme.price}`
                  : 'Select this Theme'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Payment Modal for Paid Themes */}
      {purchasingTheme && (
        <CheckoutModal
          theme={purchasingTheme}
          onClose={() => setPurchasingTheme(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </main>
  );
}
