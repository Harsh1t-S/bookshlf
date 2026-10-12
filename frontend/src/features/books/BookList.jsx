import BookCard from './BookCard.jsx';

// Heading with "Add Book Manually", then the books already added from one source.
export default function BookList({ title, books, action, onAction, onAddManually }) {
  return (
    <>
      <div className="fg-list-head">
        <h3>{title}</h3>
        <button type="button" className="fg-outline" onClick={onAddManually}>Add Book Manually</button>
      </div>
      {books.length > 0 && (
        <div className="fg-book-grid">
          {books.map(book => <BookCard key={book.id} book={book} action={action} onAction={() => onAction(book)} />)}
        </div>
      )}
    </>
  );
}
