import { useEffect, useRef, useState } from 'react';
import { getTheme, isThemeUnlocked } from '../data/themes.js';
import { api } from '../lib/api.js';
import { clearDraft, readDraft, saveDraft } from '../lib/browserStorage.js';
import { requestGoogleAccessToken } from '../features/auth/google.js';
import useBrowserRouter from './useBrowserRouter.js';
import useRouteScroll from './useRouteScroll.js';

const SIGNED_IN_ONLY = ['/themes', '/books', '/purchase', '/shelf'];
const EMPTY_SHELF = { books: [], themeId: 'light-grid', purchasedThemeIds: [] };
const SAVE_DELAY = 600;

function normalizePath(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

// Everything the pages share: where we are, the signed-in reader (from the backend),
// the shelf being built (books, look, purchased looks) and the steps between pages.
// The shelf saves to the server a moment after each change and is cached in the browser.
export default function useBookshelf() {
  const router = useBrowserRouter();
  const { navigate } = router;
  const pathname = normalizePath(router.pathname);
  const [user, setUser] = useState(undefined); // undefined while we ask the server who is signed in
  const [draft, setDraft] = useState(readDraft);
  const [saveError, setSaveError] = useState('');
  const savedShelf = useRef(null); // JSON of the last shelf the server confirmed
  const { books, themeId, purchasedThemeIds } = draft;
  const theme = getTheme(themeId);
  const ready = user !== undefined;

  function acceptSession({ user: nextUser, shelf }) {
    setUser(nextUser ?? null);
    const nextShelf = nextUser ? shelf ?? EMPTY_SHELF : EMPTY_SHELF;
    savedShelf.current = JSON.stringify(nextShelf);
    setDraft(nextShelf);
    if (nextUser) saveDraft(nextShelf);
    else clearDraft();
    return nextShelf;
  }

  useEffect(() => {
    let live = true;
    api('/me')
      .then(data => live && acceptSession(data))
      .catch(() => live && setUser(null));
    return () => { live = false; };
  }, []);

  // Save shelf changes to the server shortly after they happen; flush on tab close.
  useEffect(() => {
    if (!user) return undefined;
    saveDraft(draft);
    const body = JSON.stringify(draft);
    if (body === savedShelf.current) return undefined;
    const save = () => api('/me/shelf', { method: 'PUT', body: draft })
      .then(({ shelf }) => { savedShelf.current = JSON.stringify(shelf); setSaveError(''); })
      .catch(error => setSaveError(`Your latest changes aren’t saved yet: ${error.message}`));
    const timer = window.setTimeout(save, SAVE_DELAY);
    const flush = () => fetch('/api/me/shelf', { method: 'PUT', keepalive: true, headers: { 'Content-Type': 'application/json' }, body });
    window.addEventListener('pagehide', flush);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pagehide', flush);
    };
  }, [draft, user]);

  useRouteScroll(ready ? pathname : null);

  // The setup steps and the owner's shelf need a signed-in reader.
  const needsSignIn = ready && !user && SIGNED_IN_ONLY.includes(pathname);
  useEffect(() => {
    if (needsSignIn) navigate('/signup', { replace: true });
  }, [needsSignIn, navigate]);

  function updateDraft(changes) {
    setDraft(current => ({ ...current, ...changes }));
  }

  // After any sign-in: straight to the shelf if it has books, else start setup.
  function signedIn(data) {
    const shelf = acceptSession(data);
    navigate(shelf.books.length ? '/shelf' : '/themes');
  }

  return {
    ready,
    // Signed-out visitors see the sign-up page right away while the URL catches up.
    pathname: needsSignIn ? '/signup' : pathname,
    navigate,
    user,
    books,
    theme,
    purchasedThemeIds,
    saveError,

    searchParam: name => new URLSearchParams(window.location.search).get(name),
    isUnlocked: chosen => isThemeUnlocked(chosen, purchasedThemeIds),
    setBooks: nextBooks => updateDraft({ books: nextBooks }),
    selectTheme: chosen => updateDraft({ themeId: chosen.id }),

    startSetup() {
      navigate(user ? (books.length ? '/shelf' : '/themes') : '/signup');
    },

    async signUp({ email, password }) {
      signedIn(await api('/auth/signup', { method: 'POST', body: { email, password } }));
    },

    async logIn({ email, password }) {
      signedIn(await api('/auth/login', { method: 'POST', body: { email, password } }));
    },

    async continueWithGoogle() {
      const accessToken = await requestGoogleAccessToken();
      signedIn(await api('/auth/google', { method: 'POST', body: { accessToken } }));
    },

    requestPasswordReset: email => api('/auth/forgot', { method: 'POST', body: { email } }),

    async resetPassword(token, password) {
      signedIn(await api('/auth/reset', { method: 'POST', body: { token, password } }));
    },

    async signOut() {
      await api('/auth/logout', { method: 'POST', body: {} }).catch(() => {});
      acceptSession({ user: null });
      navigate('/');
    },

    checkUsername: name => api(`/usernames/${encodeURIComponent(name)}`),

    async claimUsername(name) {
      const data = await api('/me/username', { method: 'PUT', body: { username: name } });
      setUser(data.user);
      return data.user;
    },

    // Free or already-bought looks go straight to adding books; others go to checkout first.
    continueFromThemes() {
      navigate(isThemeUnlocked(theme, purchasedThemeIds) ? '/books' : `/purchase?theme=${theme.id}`);
    },

    completePurchase(paidThemeId) {
      updateDraft({ themeId: paidThemeId, purchasedThemeIds: [...new Set([...purchasedThemeIds, paidThemeId])] });
      navigate('/themes');
    },
  };
}
