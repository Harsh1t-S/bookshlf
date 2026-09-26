import { useEffect, useState } from 'react';

const presetColors = [
  '#b33939', '#218c74', '#2c2c54', '#d35400',
  '#474787', '#227093', '#b33939', '#57606f',
];

export default function BookEditor({ book, onSave, onCancel }) {
  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [cover, setCover] = useState(book?.cover ?? '');
  const [color, setColor] = useState(book?.color ?? '#b33939');
  const [rating, setRating] = useState(book?.rating ?? 5);

  useEffect(() => {
    setTitle(book?.title ?? '');
    setAuthor(book?.author ?? '');
    setCover(book?.cover ?? '');
    setColor(book?.color ?? '#b33939');
    setRating(book?.rating ?? 5);
  }, [book]);

  function submit(event) {
    event.preventDefault();
    if (!title.trim() || !author.trim()) return;
    onSave({
      ...book,
      title: title.trim(),
      author: author.trim(),
      cover: cover.trim(),
      color,
      spineBg: color,
      rating,
    });
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 rounded-xl border border-[#e5ddd1] bg-[#fffdfa] p-5 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-black/5 pb-3">
        <h4 className="font-serif text-base font-bold text-[#2d241d]">
          {book ? 'Edit Book Details' : 'Add Book Manually'}
        </h4>
        <span className="text-xs text-[#81776d]">Custom book specs</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-[#544b42]">Book Title</label>
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sapiens"
            className="mt-1 h-10 w-full rounded-lg border border-[#d6cec2] bg-white px-3 text-sm text-[#34291f] outline-none focus:border-[#e13a00]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#544b42]">Author Name</label>
          <input
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. Yuval Noah Harari"
            className="mt-1 h-10 w-full rounded-lg border border-[#d6cec2] bg-white px-3 text-sm text-[#34291f] outline-none focus:border-[#e13a00]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#544b42]">Cover Image URL</label>
          <input
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="https://... (Optional, fallback book cover generated if empty)"
            className="mt-1 h-10 w-full rounded-lg border border-[#d6cec2] bg-white px-3 text-sm text-[#34291f] outline-none focus:border-[#e13a00]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#544b42]">Cover / Spine Color</label>
          <div className="mt-2 flex items-center gap-2">
            {presetColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-black/40 ring-offset-1' : ''
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
              title="Custom color"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#544b42]">Your Rating</label>
          <div className="mt-1 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-xl transition ${star <= rating ? 'text-amber-500' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-black/5 pt-3">
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
          {book ? 'Update Book' : 'Add to Shelf'}
        </button>
      </div>
    </form>
  );
}
