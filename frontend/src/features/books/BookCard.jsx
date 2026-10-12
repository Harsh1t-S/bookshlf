// One book in an import list: cover (or a coloured stand-in), title, author and one action.
export default function BookCard({ book, action, onAction, selected }) {
  return (
    <div className="fg-book" data-selected={selected || undefined}>
      <div className="fg-book__cover">
        {book.cover && /^(https?:\/\/|\/)/.test(book.cover)
          ? <img src={book.cover} alt="" loading="lazy" />
          : <span style={{ background: book.color || '#7d3c1c' }}>{book.title}</span>}
      </div>
      <div className="fg-book__text">
        <span className="fg-book__title">{book.title}</span>
        <span className="fg-book__author">{book.author}</span>
        <button type="button" className="fg-book__action" onClick={onAction} aria-label={`${action}: ${book.title}`}>{action}</button>
      </div>
    </div>
  );
}
