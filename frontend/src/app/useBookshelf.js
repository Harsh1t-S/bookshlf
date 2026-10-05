import { useEffect, useState } from 'react';
import { getTheme, isThemeUnlocked, themes } from '../data/themes.js';
import { clearProfile, readDraft, readProfile, saveDraft, saveProfile } from '../lib/browserStorage.js';
import useBrowserRouter from './useBrowserRouter.js';
import useRouteScroll from './useRouteScroll.js';

const SIGNED_IN_ONLY = ['/themes', '/books', '/purchase', '/shelf'];

function normalizePath(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

// Everything the pages share: where we are, who is signed in, the shelf being
// built (books, look, purchased looks) and the steps that move between pages.
export default function useBookshelf() {
  const router = useBrowserRouter();
  const { navigate } = router;
  const pathname = normalizePath(router.pathname);
  const [user, setUser] = useState(readProfile);
  const [draft, setDraft] = useState(readDraft);
  const { books, themeId, purchasedThemeIds } = draft;
  const theme = getTheme(themeId);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useRouteScroll(pathname);

  // The setup steps and the owner's shelf need a signed-in reader.
  const needsSignIn = !user && SIGNED_IN_ONLY.includes(pathname);
  useEffect(() => {
    if (needsSignIn) navigate('/signup', { replace: true });
  }, [needsSignIn, navigate]);

  function updateDraft(changes) {
    setDraft(current => ({ ...current, ...changes }));
  }

  return {
    // Signed-out visitors see the sign-up page right away while the URL catches up.
    pathname: needsSignIn ? '/signup' : pathname,
    navigate,
    user,
    books,
    theme,
    purchasedThemeIds,

    searchParam: name => new URLSearchParams(window.location.search).get(name),
    isUnlocked: chosen => isThemeUnlocked(chosen, purchasedThemeIds),
    setBooks: nextBooks => updateDraft({ books: nextBooks }),
    selectTheme: chosen => updateDraft({ themeId: chosen.id }),

    startSetup() {
      navigate(user ? (books.length ? '/shelf' : '/themes') : '/signup');
    },

    signIn({ email, name }) {
      const profile = saveProfile({ email, name, since: readProfile()?.since ?? new Date().getFullYear() });
      if (!profile) return;
      setUser(profile);
      // A different reader on this browser gets an empty shelf, not the previous reader's books and purchases.
      const owner = profile.email.toLowerCase();
      const keepsShelf = !draft.owner || draft.owner === owner;
      setDraft(keepsShelf ? { ...draft, owner } : { books: [], themeId: themes[0].id, purchasedThemeIds: [], owner });
      navigate(keepsShelf && books.length ? '/shelf' : '/themes');
    },

    signOut() {
      clearProfile();
      setUser(null);
      navigate('/');
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
