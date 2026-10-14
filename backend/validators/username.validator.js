// Rules for bookshelf.cv/<username>. The claim form checks names live through
// GET /api/usernames/:name, so these rules live only here.

// App pages and paths a username must never shadow.
const RESERVED = new Set([
  'signup', 'login', 'logout', 'forgot', 'reset', 'themes', 'books', 'purchase', 'shelf', 'demo',
  'api', 'assets', 'figma', 'admin', 'settings', 'account', 'help', 'support', 'about', 'blog', 'blogs',
  'terms', 'privacy', 'refunds', 'pricing', 'contact', 'roadmap', 'www', 'app', 'static', 'index', 'null', 'undefined',
]);

export const USERNAME_HINT = '3–30 letters, numbers or dashes';

export function normalizeUsername(value) {
  return String(value ?? '').trim().toLowerCase();
}

// Returns a reason the name can't be used, or '' if it is valid.
export function usernameProblem(value) {
  const name = normalizeUsername(value);
  if (name.length < 3 || name.length > 30) return `Use ${USERNAME_HINT}.`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) return 'Use only letters, numbers and single dashes (not at the start or end).';
  if (RESERVED.has(name)) return 'That name is reserved. Try another.';
  return '';
}

// A first suggestion from the reader's name or email: "Holland McKay" -> "holland-mckay".
export function suggestUsername(nameOrEmail = '') {
  const base = String(nameOrEmail).split('@')[0].toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30).replace(/-+$/, '');
  return base.length >= 3 && !RESERVED.has(base) ? base : `${base || 'reader'}-shelf`.slice(0, 30);
}
