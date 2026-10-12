import assert from 'node:assert/strict';
import { before, mock, test } from 'node:test';
import { importGoodreads } from '../services/goodreads.service.js';
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
