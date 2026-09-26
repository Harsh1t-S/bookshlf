import BookCover from '../../shared/BookCover';
import BookEditor from './BookEditor';

export default function BookCollection({ books, onEdit, onRemove, editing, onSave, onCancel }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <article
          key={book.id}
          className="min-w-0 rounded-[14px] border border-[#eee6da] bg-[#fffaf3] p-3 shadow-xs transition hover:shadow-sm"
        >
          <div className="flex gap-3">
            <div className="w-[52px] shrink-0" aria-hidden="true">
              <BookCover book={book} className="aspect-[1/1.5] w-full" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug text-[#2f2720]">
                {book.title}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-[#7e7367]">
                {book.author}
              </p>

              {book.rating && (
                <div className="mt-1 flex text-xs text-amber-500">
                  {'★'.repeat(book.rating)}
                  {'☆'.repeat(5 - book.rating)}
                </div>
              )}

              <div className="mt-2.5 flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => onEdit(book)}
                  aria-label={`Edit details for ${book.title}`}
                  className="font-semibold text-[#e13a00] hover:underline"
                >
                  Edit details
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(book.id)}
                  aria-label={`Remove ${book.title} from your shelf`}
                  className="text-[#968c81] hover:text-[#d32f2f] hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          {editing?.id === book.id && (
            <div className="mt-3 border-t border-[#eee6da] pt-3">
              <BookEditor book={editing} onSave={onSave} onCancel={onCancel} />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
