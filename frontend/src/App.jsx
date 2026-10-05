import { useEffect, useState } from 'react';
import AddBooksPage from './features/books/AddBooksPage.jsx';
import ThemePicker from './features/themes/ThemePicker.jsx';
import AuthPage from './pages/AuthPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PurchasePage from './pages/PurchasePage.jsx';
import ShelfPreview from './pages/ShelfPreview.jsx';
import catalog from './data/books.js';
import { getTheme, isThemeUnlocked, themes } from './data/themes.js';
import useBrowserRouter from './hooks/useBrowserRouter.js';
import { clearProfile, readDraft, readProfile, saveDraft, saveProfile } from './lib/browserStorage.js';
import FlowShell from './shared/FlowShell.jsx';

const ROUTES = ['/', '/login', '/signup', '/themes', '/purchase', '/books', '/shelf', '/demo'];

function normalizePath(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

function searchParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function firstName(name = '') {
  const first = name.trim().split(/\s+/)[0] || '';
  return first ? `${first.charAt(0).toLocaleUpperCase()}${first.slice(1)}` : '';
}

export default function App() {
  const { pathname: currentPath, navigate } = useBrowserRouter();
  const pathname = normalizePath(currentPath);
  const [user, setUser] = useState(readProfile);
  const [draft, setDraft] = useState(readDraft);
  const { books, themeId, purchasedThemeIds } = draft;
  const theme = getTheme(themeId);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const target = document.querySelector('main h1, h1, main') ?? document.body;
    target.setAttribute?.('tabindex', '-1');
    target.focus?.({ preventScroll: true });
  }, [pathname]);

  const purchaseTheme = getTheme(searchParam('theme'));
  const needsPurchase = pathname === '/purchase' && isThemeUnlocked(purchaseTheme, purchasedThemeIds);
  useEffect(() => {
    if (needsPurchase) navigate('/themes', { replace: true });
  }, [needsPurchase, navigate]);

  function updateDraft(changes) {
    setDraft(current => ({ ...current, ...changes }));
  }

  function startSetup() {
    navigate(user ? (books.length ? '/shelf' : '/themes') : '/signup');
  }

  function finishAuth({ email, name }) {
    const profile = saveProfile({ email, name, since: readProfile()?.since ?? new Date().getFullYear() });
    if (!profile) return;
    setUser(profile);
    navigate(books.length ? '/shelf' : '/themes');
  }

  function signOut() {
    clearProfile();
    setUser(null);
    navigate('/');
  }

  function continueFromThemes() {
    if (isThemeUnlocked(theme, purchasedThemeIds)) navigate('/books');
    else navigate(`/purchase?theme=${theme.id}`);
  }

  function completePurchase({ themeId: paidThemeId }) {
    updateDraft({ themeId: paidThemeId, purchasedThemeIds: [...new Set([...purchasedThemeIds, paidThemeId])] });
    navigate('/themes');
  }

  const authLink = user
    ? <button type="button" className="fg-nav-link" onClick={signOut}>Sign out</button>
    : <a className="fg-nav-link" href="/login">Sign in</a>;

  if (!ROUTES.includes(pathname)) {
    return (
      <FlowShell navRight={authLink}>
        <div className="fg-themes fg-head">
          <h1>Page not found</h1>
          <p>That Bookshelf.cv page doesn’t exist.</p>
          <a className="fg-nav-link" href="/" style={{ marginTop: 16 }}>Return home</a>
        </div>
      </FlowShell>
    );
  }

  if (pathname === '/') return <LandingPage onStart={startSetup} />;

  if (pathname === '/login' || pathname === '/signup') {
    return (
      <AuthPage
        key={pathname}
        mode={pathname === '/login' ? 'login' : 'signup'}
        onModeChange={mode => navigate(mode === 'login' ? '/login' : '/signup')}
        onContinue={finishAuth}
      />
    );
  }

  if (pathname === '/themes') {
    return (
      <FlowShell navRight={authLink}>
        <ThemePicker
          selectedTheme={theme}
          books={books.length ? books : catalog}
          purchasedThemeIds={purchasedThemeIds}
          onSelect={chosen => updateDraft({ themeId: chosen.id })}
          onBuy={chosen => navigate(`/purchase?theme=${chosen.id}`)}
          onContinue={continueFromThemes}
        />
      </FlowShell>
    );
  }

  if (pathname === '/purchase') {
    return (
      <PurchasePage
        key={purchaseTheme.id}
        theme={purchaseTheme}
        name={user?.name ?? ''}
        email={user?.email ?? ''}
        onBack={() => navigate('/themes')}
        onPaid={completePurchase}
      />
    );
  }

  if (pathname === '/books') {
    return (
      <FlowShell navRight={authLink}>
        <AddBooksPage
          books={books}
          catalog={catalog}
          onBooksChange={nextBooks => updateDraft({ books: nextBooks })}
          onContinue={() => navigate('/shelf')}
        />
      </FlowShell>
    );
  }

  if (pathname === '/demo') {
    return (
      <ShelfPreview
        isDemo
        books={catalog}
        theme={themes.find(item => item.id === searchParam('theme')) ?? themes[0]}
        title="Sarah’s Reading Life"
        since={2019}
        onStart={startSetup}
      />
    );
  }

  const owner = firstName(user?.name);
  return (
    <ShelfPreview
      books={books}
      theme={isThemeUnlocked(theme, purchasedThemeIds) ? theme : themes[0]}
      title={owner ? `${owner}’s Reading Life` : 'Your Reading Life'}
      since={user?.since ?? new Date().getFullYear()}
      onSignOut={signOut}
      onModify={() => navigate('/themes')}
      onAddBook={() => navigate('/books')}
    />
  );
}
