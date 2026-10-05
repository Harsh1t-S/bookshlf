import { useEffect, useState } from 'react';

const presetColors = [
  '#b33939',
  '#218c74',
  '#2c2c54',
  '#d35400',
  '#474787',
  '#227093',
  '#57606f',
];

function isValidCover(value) {
  if (!value) return true;
  if (/\s/.test(value)) return false;
  if (/^\/assets\/[\w./-]+$/.test(value) && !value.split('/').some((part) => part === '.' || part === '..')) {
    return true;
  }

  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export default function BookEditor({ book, onSave, onCancel, onRemove }) {
  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [cover, setCover] = useState(book?.cover ?? '');
  const [color, setColor] = useState(book?.color ?? '#b33939');
  const [rating, setRating] = useState(book?.rating ?? 5);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(book?.title ?? '');
    setAuthor(book?.author ?? '');
    setCover(book?.cover ?? '');
    setColor(book?.color ?? '#b33939');
    setRating(book?.rating ?? 5);
    setError('');
  }, [book]);

  function submit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();

    if (!cleanTitle || !cleanAuthor) {
      setError('Enter both a book title and an author.');
      return;
    }

    const cleanCover = cover.trim();
    if (!isValidCover(cleanCover)) {
      setError('Enter a valid HTTP or HTTPS cover URL, or keep a local /assets/... cover path.');
      return;
    }

    const result = onSave({
      ...book,
      title: cleanTitle,
      author: cleanAuthor,
      cover: cleanCover,
      color,
      spineBg: color,
      rating,
    });
    if (typeof result === 'string' && result) {
      setError(result);
      return;
    }
    setError('');
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl border border-[#e5ddd1] bg-[#fffdfa] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-black/5 pb-3">
        <h4 className="font-serif text-base font-bold text-[#2d241d]">
          {book ? 'Edit book details' : 'Add a book manually'}
        </h4>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="book-editor-title" className="block text-xs font-semibold text-[#544b42]">
            Book title
          </label>
          <input
            id="book-editor-title"
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Sapiens"
            aria-invalid={Boolean(error) && !title.trim()}
            aria-describedby={error ? 'book-editor-error' : undefined}
            className="mt-1 h-10 w-full rounded-lg border border-[#d6cec2] bg-white px-3 text-sm text-[#34291f] outline-none focus:border-[#e13a00] focus:ring-1 focus:ring-[#e13a00]"
          />
        </div>

        <div>
          <label htmlFor="book-editor-author" className="block text-xs font-semibold text-[#544b42]">
            Author
          </label>
          <input
            id="book-editor-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="e.g. Yuval Noah Harari"
            aria-invalid={Boolean(error) && !author.trim()}
            aria-describedby={error ? 'book-editor-error' : undefined}
            className="mt-1 h-10 w-full rounded-lg border border-[#d6cec2] bg-white px-3 text-sm text-[#34291f] outline-none focus:border-[#e13a00] focus:ring-1 focus:ring-[#e13a00]"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="book-editor-cover" className="block text-xs font-semibold text-[#544b42]">
            Cover image URL <span className="font-normal text-[#81776d]">(optional)</span>
          </label>
          <input
            id="book-editor-cover"
            type="text"
            inputMode="url"
            value={cover}
            onChange={(event) => setCover(event.target.value)}
            placeholder="https://example.com/cover.jpg"
            aria-invalid={error.startsWith('Enter a valid cover URL')}
            aria-describedby={error.startsWith('Enter a valid cover URL') ? 'book-editor-error' : undefined}
            className="mt-1 h-10 w-full rounded-lg border border-[#d6cec2] bg-white px-3 text-sm text-[#34291f] outline-none focus:border-[#e13a00] focus:ring-1 focus:ring-[#e13a00]"
          />
        </div>

        <fieldset>
          <legend className="block text-xs font-semibold text-[#544b42]">Cover color</legend>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {presetColors.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                className={`h-7 w-7 rounded-full transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e13a00] ${
                  color === preset ? 'scale-110 ring-2 ring-black/40 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: preset }}
                aria-label={`Use cover color ${preset}`}
                aria-pressed={color === preset}
              />
            ))}
            <label htmlFor="book-editor-color" className="sr-only">Custom cover color</label>
            <input
              id="book-editor-color"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent p-0"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="block text-xs font-semibold text-[#544b42]">Your rating</legend>
          <div className="mt-1 flex items-center gap-1" role="group" aria-label="Rate this book">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`rounded-sm text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#e13a00] ${
                  star <= rating ? 'text-amber-500' : 'text-gray-300'
                }`}
                aria-label={`Set rating to ${star} ${star === 1 ? 'star' : 'stars'}`}
                aria-pressed={rating === star}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {error && (
        <p id="book-editor-error" role="alert" className="mt-4 text-sm text-[#a34222]">
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-black/5 pt-3">
        {book && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(book)}
            className="mr-auto rounded-lg px-4 py-2 text-xs font-semibold text-[#a34222] hover:bg-[#fbeee8]"
          >
            Remove from shelf
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-xs font-medium text-[#6d6257] hover:bg-[#f3eee7]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-[#e13a00] px-5 py-2 text-xs font-semibold text-white hover:bg-[#c93200]"
        >
          {book ? 'Save changes' : 'Add to shelf'}
        </button>
      </div>
    </form>
  );
}
