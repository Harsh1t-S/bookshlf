import { useEffect, useState } from 'react';
import AddBooksPage from './features/books/AddBooksPage.jsx';
import ThemePicker from './features/themes/ThemePicker.jsx';
import AuthPage from './pages/AuthPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import BookDecorations from './shared/BookDecorations.jsx';
import SiteHeader from './shared/SiteHeader.jsx';
import ShelfPreview from './pages/ShelfPreview.jsx';
import catalog from './data/books.js';

import { getTheme, themes } from './data/themes.js';

const DRAFT_KEY = 'bookshelf.cv.draft.v1';
const defaultTheme = themes[0];

function isBook(value) {
  return value && typeof value === 'object'
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.author === 'string'
    && (value.cover === null || typeof value.cover === 'string');
}

function readDraft() {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return { books: [], theme: defaultTheme };
    const draft = JSON.parse(raw);
    const books = Array.isArray(draft?.books) ? draft.books.filter(isBook) : [];
    const theme = getTheme(draft?.theme);
    return { books, theme };
  } catch {
    return { books: [], theme: defaultTheme };
  }
}

export default function App() {
  const [page, setPage] = useState('landing');
  const [authMode, setAuthMode] = useState('signup');
  const [draft, setDraft] = useState(readDraft);
  const [demoPreview, setDemoPreview] = useState(false);
  const { books, theme } = draft;

  function setBooks(nextBooks) {
    setDraft(current => ({ ...current, books: nextBooks }));
  }

  function setTheme(nextTheme) {
    setDraft(current => ({ ...current, theme: nextTheme }));
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ books, theme }));
    } catch {
      // Draft persistence is optional when storage is unavailable or full.
    }
  }, [books, theme]);

  const headers = {
    landing: { title: 'Bookshelf.cv', action: 'Sign in', onAction: () => { setAuthMode('signin'); setPage('auth'); } },
    auth: {
      title: 'Bookshelf.cv',
      action: authMode === 'signup' ? 'Sign in' : 'Create account',
      onAction: () => setAuthMode(authMode === 'signup' ? 'signin' : 'signup'),
    },
    themes: { title: 'Bookshelf.cv' },
    books: { title: 'Bookshelf.cv' },
    preview: { title: 'Bookshelf.cv', action: 'Edit books', onAction: () => { setDemoPreview(false); setPage('books'); } },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf7f2] text-[#27221e]">
      <BookDecorations variant={page === 'landing' ? 'landing' : page === 'preview' ? 'shelf' : 'setup'} />
      <div className="relative z-10">
        <SiteHeader {...headers[page]} onHome={() => setPage('landing')} />
        {page === 'landing' && (
          <LandingPage
            onStart={() => { setAuthMode('signup'); setPage('auth'); }}
            onDemo={() => { setDemoPreview(true); setPage('preview'); }}
          />
        )}
        {page === 'auth' && (
          <AuthPage
            mode={authMode}
            onModeChange={setAuthMode}
            onContinue={() => setPage('themes')}
          />
        )}
        {page === 'themes' && (
          <ThemePicker
            selectedTheme={theme}
            books={catalog}
            onSelect={setTheme}
            onBack={() => setPage('auth')}
            onContinue={() => setPage('books')}
          />
        )}
        {page === 'books' && (
          <AddBooksPage
            books={books}
            catalog={catalog}
            onBooksChange={setBooks}
            onBack={() => setPage('themes')}
            onContinue={() => { setDemoPreview(false); setPage('preview'); }}
          />
        )}
        {page === 'preview' && (
          <ShelfPreview
            books={demoPreview || books.length === 0 ? catalog : books}
            theme={theme}
            onEdit={() => { setDemoPreview(false); setPage('books'); }}
          />
        )}
      </div>
    </div>
  );
}
