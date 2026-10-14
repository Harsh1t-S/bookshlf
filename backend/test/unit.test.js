import assert from 'node:assert/strict';
import { before, mock, test } from 'node:test';
import { rateLimit } from '../middleware/rateLimit.middleware.js';
import { importGoodreads } from '../services/goodreads.service.js';
import { searchBooks, toBooks } from '../services/openLibrary.service.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { readSession, startSession } from '../utils/session.js';
import { passwordProblem } from '../validators/password.validator.js';
import { MAX_BOOKS, cleanShelf } from '../validators/shelf.validator.js';
import { suggestUsername, usernameProblem } from '../validators/username.validator.js';

before(() => {
  process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-for-hmac-signing';
});

test('passwords hash with a salt and only verify with the right password', async () => {
  const first = await hashPassword('correct horse');
  const second = await hashPassword('correct horse');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('correct horse', first), true);
  assert.equal(await verifyPassword('wrong horse', first), false);
  assert.equal(await verifyPassword('anything', 'not-a-hash'), false);
  assert.match(passwordProblem('short'), /8 characters/);
  assert.equal(passwordProblem('long enough'), '');
});

function cookieFrom(user) {
  let header = '';
  startSession({ secure: false }, { setHeader: (name, value) => { header = value; } }, user);
  return header.split(';')[0];
}

test('session cookies round-trip and reject tampering', () => {
  const cookie = cookieFrom({ id: 'user-1', session_version: 2 });
  const session = readSession({ headers: { cookie } });
  assert.equal(session.uid, 'user-1');
  assert.equal(session.v, 2);

  const [name, value] = cookie.split('=');
  const [payload, signature] = value.split('.');
  const forged = Buffer.from(JSON.stringify({ uid: 'someone-else', v: 2, exp: Date.now() + 1e6 })).toString('base64url');
  assert.equal(readSession({ headers: { cookie: `${name}=${forged}.${signature}` } }), null);
  assert.equal(readSession({ headers: { cookie: `${name}=${payload}.${signature}x` } }), null);
  assert.equal(readSession({ headers: {} }), null);
});

test('shelf cleaning drops malformed and duplicate books and unsafe covers', () => {
  assert.deepEqual(cleanShelf({
    themeId: 'sunny-shelf',
    books: [
      { id: 'one', title: ' Keats ', author: ' John Keats ', cover: 'blob:http://localhost/session', rating: 8 },
      { id: 'one', title: 'Duplicate', author: 'Someone', cover: null },
      { id: 'bad', title: '  ', author: 'Unknown', cover: null },
      { id: 'js', title: 'Trick', author: 'Someone', cover: 'javascript:alert(1)' },
      { id: 'web', title: 'Web', author: 'Someone', cover: 'https://example.com/c.jpg', year: 2020, rating: 4 },
    ],
  }), {
    themeId: 'sunny-shelf',
    purchasedThemeIds: [],
    books: [
      { id: 'one', title: 'Keats', author: 'John Keats', cover: null },
      { id: 'js', title: 'Trick', author: 'Someone', cover: null },
      { id: 'web', title: 'Web', author: 'Someone', cover: 'https://example.com/c.jpg', rating: 4, year: 2020 },
    ],
  });
});

test('shelf cleaning caps the number of books and dedupes purchases', () => {
  const books = Array.from({ length: MAX_BOOKS + 5 }, (_, index) => ({ id: `b${index}`, title: 'T', author: 'A', cover: null }));
  const clean = cleanShelf({ books, purchasedThemeIds: ['macos', 'macos', '', 7, 'spine-shelf'] });
  assert.equal(clean.books.length, MAX_BOOKS);
  assert.deepEqual(clean.purchasedThemeIds, ['macos', 'spine-shelf']);
});

test('usernames: valid, reserved and malformed names, and suggestions', () => {
  assert.equal(usernameProblem('holland-mckay'), '');
  assert.match(usernameProblem('themes'), /reserved/);
  assert.match(usernameProblem('refunds'), /reserved/);
  assert.match(usernameProblem('ab'), /3–30/);
  assert.match(usernameProblem('-bad-'), /dashes/);
  assert.match(usernameProblem('has space'), /letters/);
  assert.equal(suggestUsername('Holland McKay'), 'holland-mckay');
  assert.equal(suggestUsername('jo@example.com'), 'jo-shelf');
  assert.equal(usernameProblem(suggestUsername('Zoë Ünal')), '');
});

test('Goodreads: private shelves (401) and unknown ids (404) get clear errors', async () => {
  for (const [status, expected] of [[401, { status: 403, message: /private/ }], [404, { status: 404, message: /couldn’t find/ }], [500, { status: 502, message: /didn’t respond/ }]]) {
    const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('', { status }));
    const warn = mock.method(console, 'warn', () => {});
    await assert.rejects(importGoodreads('12345'), expected);
    fetchMock.mock.restore();
    warn.mock.restore();
  }
});

test('Open Library: results become shelf books with covers, first authors and no repeats', () => {
  assert.deepEqual(toBooks([
    { key: '/works/OL17930368W', title: 'Atomic Habits', author_name: ['James Clear'], cover_i: 12539702, first_publish_year: 2016 },
    { key: '/works/OL2W', title: 'atomic habits', author_name: ['James Clear', 'Someone Else'] },
    { key: '/works/OL3W', title: 'Good Omens', author_name: ['Terry Pratchett', 'Neil Gaiman'], cover_i: -1 },
    { key: '/works/OL4W', title: 'No Author' },
    { key: '/works/OL5W', title: '  ', author_name: ['Nobody'] },
  ]), [
    { openLibraryId: 'OL17930368W', title: 'Atomic Habits', author: 'James Clear', cover: 'https://covers.openlibrary.org/b/id/12539702-L.jpg', year: 2016 },
    { openLibraryId: 'OL3W', title: 'Good Omens', author: 'Terry Pratchett', cover: null, year: null },
  ]);
});

test('Open Library: short queries are refused and busy or failing answers get clear errors', async () => {
  await assert.rejects(searchBooks(' a '), { status: 400, message: /at least 2/ });
  for (const [status, expected] of [[429, { status: 503, message: /busy/ }], [500, { status: 502, message: /didn’t respond/ }]]) {
    const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('', { status }));
    const warn = mock.method(console, 'warn', () => {});
    await assert.rejects(searchBooks('dune'), expected);
    fetchMock.mock.restore();
    warn.mock.restore();
  }
});

test('Open Library: the same search, typed differently or at the same time, makes one call', async () => {
  const doc = { key: '/works/OL1W', title: 'Cache Test', author_name: ['A. Writer'] };
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({ docs: [doc] }));
  const [first, second] = await Promise.all([searchBooks('cache  test'), searchBooks('Cache Test')]);
  const third = await searchBooks('CACHE TEST');
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(first, second);
  assert.equal(first, third);
  assert.equal(first.books[0].title, 'Cache Test');
  fetchMock.mock.restore();
});

test('rate limit: each reader gets their own allowance, then 429 with Retry-After', () => {
  const limit = rateLimit({ limit: 2, windowMs: 60_000 });
  const headers = {};
  const response = { set: (name, value) => { headers[name] = value; } };
  const next = mock.fn();
  limit({ user: { id: 'reader-1' } }, response, next);
  limit({ user: { id: 'reader-1' } }, response, next);
  assert.throws(() => limit({ user: { id: 'reader-1' } }, response, next), { status: 429 });
  assert.equal(headers['Retry-After'], '60');
  limit({ user: { id: 'reader-2' } }, response, next);
  assert.equal(next.mock.callCount(), 3);
});
