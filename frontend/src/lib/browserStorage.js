// Browser cache of the signed-in reader's shelf, so pages render before the server answers.
// The server copy (GET /api/me) is the source of truth and validates everything it stores.
const DRAFT_KEY = 'bookshelf.cv.draft.v1';
const EMPTY = { books: [], themeId: 'light-grid', purchasedThemeIds: [] };

export function readDraft() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || 'null');
    return {
      books: Array.isArray(saved?.books) ? saved.books.filter(book => book && typeof book.id === 'string' && typeof book.title === 'string') : [],
      themeId: typeof saved?.themeId === 'string' ? saved.themeId : EMPTY.themeId,
      purchasedThemeIds: Array.isArray(saved?.purchasedThemeIds) ? saved.purchasedThemeIds.filter(id => typeof id === 'string') : [],
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveDraft(draft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage can be disabled or full; the server copy still has the shelf.
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch { /* Nothing to clear when storage is blocked. */ }
}
