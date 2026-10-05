const PROFILE_KEY = 'bookshelf.cv.profile.v1';
const DRAFT_KEY = 'bookshelf.cv.draft.v1';
const MIGRATED_KEY = 'bookshelf.cv.session-draft-migrated.v1';
const LEGACY_SESSION_KEY = 'bookshelf.cv.draft.v1';

function cleanBook(book) {
  if (!book || typeof book !== 'object'
    || typeof book.id !== 'string' || !book.id.trim()
    || typeof book.title !== 'string' || !book.title.trim()
    || typeof book.author !== 'string' || !book.author.trim()
    || !(book.cover === null || typeof book.cover === 'string')) return null;

  const clean = {
    id: book.id.trim(),
    title: book.title.trim(),
    author: book.author.trim(),
    cover: typeof book.cover === 'string' && /^blob:/i.test(book.cover) ? null : book.cover,
  };
  for (const key of ['color', 'spineBg', 'source']) {
    if (typeof book[key] === 'string') clean[key] = book[key];
  }
  if (Number.isInteger(book.rating) && book.rating >= 0 && book.rating <= 5) clean.rating = book.rating;
  return clean;
}

function cleanDraft(draft) {
  const themeId = typeof draft?.themeId === 'string'
    ? draft.themeId
    : typeof draft?.theme?.id === 'string' ? draft.theme.id : 'light-grid';
  const purchasedThemeIds = Array.isArray(draft?.purchasedThemeIds)
    ? [...new Set(draft.purchasedThemeIds.filter(id => typeof id === 'string' && id.trim()))]
    : [];
  const books = Array.isArray(draft?.books) ? draft.books.map(cleanBook).filter(Boolean) : [];
  const uniqueBooks = [];
  const seenIds = new Set();
  for (const book of books) {
    if (seenIds.has(book.id)) continue;
    seenIds.add(book.id);
    uniqueBooks.push(book);
  }
  const clean = { books: uniqueBooks, themeId, purchasedThemeIds };
  // Email of the reader this shelf belongs to, so the next person to sign in on this browser starts fresh.
  if (typeof draft?.owner === 'string' && draft.owner.trim()) clean.owner = draft.owner.trim().toLowerCase();
  return clean;
}

function parseDraft(raw) {
  try {
    return cleanDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function readDraft() {
  let savedDraft = null;
  try {
    savedDraft = window.localStorage.getItem(DRAFT_KEY);
  } catch { /* Continue to the legacy session draft if local storage is blocked. */ }
  if (savedDraft) return parseDraft(savedDraft) ?? cleanDraft(null);

  try {
    if (window.localStorage.getItem(MIGRATED_KEY)) return cleanDraft(null);
    const legacy = parseDraft(window.sessionStorage.getItem(LEGACY_SESSION_KEY));
    window.localStorage.setItem(MIGRATED_KEY, '1');
    return legacy ?? cleanDraft(null);
  } catch {
    return cleanDraft(null);
  }
}

export function saveDraft(draft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(cleanDraft(draft)));
  } catch {
    // Storage can be disabled or full; the app remains usable without persistence.
  }
}

function cleanProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  const email = typeof profile.email === 'string' ? profile.email.trim() : '';
  const name = typeof profile.name === 'string' ? profile.name.trim() : '';
  if (!email) return null;
  const clean = { email, name: name || email.split('@')[0] || 'Reader' };
  if (Number.isInteger(profile.since) && profile.since >= 1900 && profile.since <= 2100) clean.since = profile.since;
  return clean;
}

export function readProfile() {
  try {
    return cleanProfile(JSON.parse(window.localStorage.getItem(PROFILE_KEY) || 'null'));
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  const clean = cleanProfile(profile);
  if (!clean) return null;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(clean));
    return clean;
  } catch {
    return clean;
  }
}

export function clearProfile() {
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    // Sign out still updates the in-memory view when storage is unavailable.
  }
}
