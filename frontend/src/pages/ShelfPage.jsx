import { themes } from '../data/themes.js';
import ShelfLayout from '../features/shelf/ShelfLayout.jsx';
import usePageTitle from '../app/usePageTitle.js';

function firstName(name = '') {
  const first = name.trim().split(/\s+/)[0] || '';
  return first ? `${first.charAt(0).toLocaleUpperCase()}${first.slice(1)}` : '';
}

// /shelf — the reader's own published shelf.
export default function ShelfPage({ app }) {
  const owner = firstName(app.user?.name);
  const title = owner ? `${owner}’s Reading Life` : 'Your Reading Life';
  usePageTitle(title);
  return (
    <ShelfLayout
      books={app.books}
      theme={app.isUnlocked(app.theme) ? app.theme : themes[0]}
      title={title}
      since={app.user?.since ?? new Date().getFullYear()}
      onSignOut={app.signOut}
      onModify={() => app.navigate('/themes')}
      onAddBook={() => app.navigate('/books')}
    />
  );
}
