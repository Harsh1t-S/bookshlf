import { useEffect, useState } from 'react';
import { getTheme, isThemeUnlocked } from '../data/themes.js';
import { clearProfile, readDraft, readProfile, saveDraft, saveProfile } from '../lib/browserStorage.js';
import useBrowserRouter from './useBrowserRouter.js';
import useRouteScroll from './useRouteScroll.js';

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

  function updateDraft(changes) {
    setDraft(current => ({ ...current, ...changes }));
  }

  return {
    pathname,
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
      navigate(books.length ? '/shelf' : '/themes');
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
