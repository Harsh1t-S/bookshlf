import { useState } from 'react';
import usePageTitle from '../app/usePageTitle.js';
import { themes } from '../data/themes.js';
import ShelfLayout from '../features/shelf/ShelfLayout.jsx';
import UsernameClaim from '../features/shelf/UsernameClaim.jsx';
import { shelfTitle } from '../lib/names.js';

// /shelf — the reader's own shelf. Its public address is /<username> once claimed.
export default function ShelfPage({ app }) {
  const { user } = app;
  const [editingLink, setEditingLink] = useState(false);
  const title = shelfTitle(user?.name);
  const publicUrl = user?.username ? `${window.location.origin}/${user.username}` : null;
  usePageTitle(title);

  const linkEditor = (!publicUrl || editingLink) ? (
    <UsernameClaim
      initial={user?.username ?? user?.suggestedUsername ?? ''}
      current={user?.username ?? null}
      onCheck={app.checkUsername}
      onClaim={app.claimUsername}
      onDone={() => setEditingLink(false)}
      onCancel={publicUrl ? () => setEditingLink(false) : undefined}
    />
  ) : null;

  return (
    <ShelfLayout
      books={app.books}
      theme={app.isUnlocked(app.theme) ? app.theme : themes[0]}
      title={title}
      since={user?.since ?? new Date().getFullYear()}
      shareUrl={publicUrl}
      linkEditor={linkEditor}
      onEditLink={() => setEditingLink(true)}
      notice={app.saveError}
      onSignOut={app.signOut}
      onModify={() => app.navigate('/themes')}
      onAddBook={() => app.navigate('/books')}
    />
  );
}
