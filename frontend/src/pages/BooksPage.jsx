import FlowShell from '../components/FlowShell.jsx';
import catalog from '../data/books.js';
import AuthNavLink from '../features/auth/AuthNavLink.jsx';
import AddBooks from '../features/books/AddBooks.jsx';

// /books — step 2 of setup: Goodreads, a shelf photo or the library.
export default function BooksPage({ app }) {
  return (
    <FlowShell navRight={<AuthNavLink app={app} />}>
      <AddBooks books={app.books} catalog={catalog} onBooksChange={app.setBooks} onContinue={() => app.navigate('/shelf')} />
    </FlowShell>
  );
}
