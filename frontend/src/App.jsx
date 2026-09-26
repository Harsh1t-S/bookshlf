import { useEffect, useState } from 'react';
import AddBooksPage from './features/books/AddBooksPage.jsx';
import ThemePicker from './features/themes/ThemePicker.jsx';
import AuthPage from './pages/AuthPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ShelfPreview from './pages/ShelfPreview.jsx';
import { getTheme } from './data/themes.js';
import catalog from './data/books.js';
import useBrowserRouter from './hooks/useBrowserRouter.js';
import { clearProfile, readDraft, readProfile, saveDraft, saveProfile } from './lib/browserStorage.js';
import BookDecorations from './shared/BookDecorations.jsx';
import SiteHeader from './shared/SiteHeader.jsx';

function normalizePath(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

export default function App() {
  const { pathname: currentPath, navigate } = useBrowserRouter();
  const pathname = normalizePath(currentPath);
  const [user, setUser] = useState(readProfile);
  const [draft, setDraft] = useState(readDraft);
  const { books, themeId } = draft;
  const theme = getTheme(themeId);
  const isDemo = pathname === '/demo';

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const target = document.querySelector('main h1, main h2, main') ?? document.body;
    target.setAttribute?.('tabindex', '-1');
    target.focus?.({ preventScroll: true });
  }, [pathname]);

  function selectTheme(nextTheme) {
    setDraft(current => ({ ...current, themeId: getTheme(nextTheme).id }));
  }

  function finishAuth({ email, name } = {}) {
    const profile = saveProfile({ email, name });
    if (!profile) return;
    setUser(profile);
    navigate(books.length ? '/shelf' : '/themes');
  }

  function signOut() {
    clearProfile();
    setUser(null);
    navigate('/');
  }

  const headers = {
    currentPath: pathname,
    user,
    navigate,
    onSignOut: signOut,
  };

  if (!['/', '/login', '/signup', '/themes', '/books', '/shelf', '/demo'].includes(pathname)) {
    return (
      <div className="min-h-screen bg-[#faf7f2] text-[#27221e]">
        <SiteHeader {...headers} />
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="font-heading text-4xl">Page not found</h1>
          <p className="mt-3 text-[#706a61]">That Bookshelf.cv page doesn’t exist.</p>
          <a href="/" className="mt-6 inline-block font-semibold text-[#e13a00] underline">Return home</a>
        </main>
      </div>
    );
  }

  const activePath = pathname === '/' ? 'landing'
    : pathname === '/login' || pathname === '/signup' ? 'auth'
      : pathname.slice(1);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf7f2] text-[#27221e]">
      <BookDecorations variant={activePath === 'landing' ? 'landing' : activePath === 'shelf' || isDemo ? 'none' : 'setup'} />
      <div className="relative z-10">
        <SiteHeader {...headers} />
        {pathname === '/' && (
          <LandingPage
            onStart={() => navigate(user ? (books.length ? '/shelf' : '/themes') : '/signup')}
            onDemo={() => navigate('/demo')}
          />
        )}
        {(pathname === '/login' || pathname === '/signup') && (
          <AuthPage
            key={pathname}
            mode={pathname === '/login' ? 'login' : 'signup'}
            onModeChange={mode => navigate(mode === 'login' || mode === 'signin' ? '/login' : '/signup')}
            onContinue={finishAuth}
          />
        )}
        {pathname === '/themes' && (
          <ThemePicker
            selectedTheme={theme}
            books={books.length ? books : catalog}
            onSelect={selectTheme}
            onBack={() => navigate(user ? (books.length ? '/shelf' : '/') : '/')}
            onContinue={() => navigate('/books')}
          />
        )}
        {pathname === '/books' && (
          <AddBooksPage
            books={books}
            catalog={catalog}
            onBooksChange={nextBooks => setDraft(current => ({ ...current, books: nextBooks }))}
            onBack={() => navigate('/themes')}
            onContinue={() => navigate('/shelf')}
          />
        )}
        {(pathname === '/shelf' || isDemo) && (
          <ShelfPreview
            books={isDemo ? catalog : books}
            theme={theme}
            name={isDemo ? 'Sarah' : user?.name || 'Your'}
            navigate={navigate}
            onEdit={() => navigate('/books')}
            onThemes={() => navigate('/themes')}
          />
        )}
      </div>
    </div>
  );
}
