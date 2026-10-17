import assert from 'node:assert/strict';
import { before, mock, test } from 'node:test';
import { scan } from '../controllers/books.controller.js';
import { rateLimit } from '../middleware/rateLimit.middleware.js';
import { MAX_BOOKS_PER_PHOTO, readShelfPhoto } from '../services/gemini.service.js';
import { importGoodreads } from '../services/goodreads.service.js';
import { matchBooks, searchBooks, toBooks } from '../services/openLibrary.service.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { readSession, startSession } from '../utils/session.js';
import { passwordProblem } from '../validators/password.validator.js';
import { MAX_PHOTO_CHARS, cleanPhoto } from '../validators/photo.validator.js';
import { MAX_BOOKS, cleanShelf } from '../validators/shelf.validator.js';
import { suggestUsername, usernameProblem } from '../validators/username.validator.js';

before(() => {
  process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-for-hmac-signing';
  delete process.env.GEMINI_API_KEY; // Tests set a fake key; they never call the real Gemini API.
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
    { key: '/works/OL6W', title: 'The Alchemist', author_name: ['Paulo Coelho (Author)'] },
  ]), [
    { openLibraryId: 'OL17930368W', title: 'Atomic Habits', author: 'James Clear', cover: 'https://covers.openlibrary.org/b/id/12539702-L.jpg', year: 2016 },
    { openLibraryId: 'OL3W', title: 'Good Omens', author: 'Terry Pratchett', cover: null, year: null },
    { openLibraryId: 'OL6W', title: 'The Alchemist', author: 'Paulo Coelho', cover: null, year: null },
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

test('Open Library matching: exact titles win, wrong authors are refused, unmatched books keep what was read', async () => {
  const docs = {
    'Match Test One writer': [
      { key: '/works/OL10W', title: 'Match Test One: The Sequel', author_name: ['J. K. Writer'] },
      { key: '/works/OL11W', title: 'Match Test One', author_name: ['J. K. Writer'], cover_i: 7, first_publish_year: 1999 },
    ],
    'Match Test Two author': [{ key: '/works/OL12W', title: 'Match Test Two', author_name: ['Someone Else'] }],
    'Match Test Three': [{ key: '/works/OL13W', title: 'Match Test Three: With a Subtitle', author_name: ['Real Author'] }],
    'Match Test Five author': [{ key: '/works/OL14W', title: 'Match Test Fifty', author_name: ['Ann Author'] }],
    'Match Test Six author': [
      { key: '/works/OL15W', title: 'Match Test Six and Other Essays', author_name: ['Ann Author'] },
      { key: '/works/OL16W', title: 'Match Test Six (adaptation)', author_name: ['Someone Else'] },
    ],
  };
  const fetchMock = mock.method(globalThis, 'fetch', async url => Response.json({ docs: docs[new URL(url).searchParams.get('q')] ?? [] }));
  assert.deepEqual(await matchBooks([
    { title: 'Match Test One', author: 'J.K. Writer' },
    { title: 'Match Test Two', author: 'Ann Author' },
    { title: 'Match Test Three', author: '' },
    { title: 'Match Test Four', author: '' },
    { title: 'Match Test One', author: 'J. K. Writer' },
    { title: 'Match Test Five', author: 'Ann Author' },
    { title: 'Match Test Six', author: 'Ann Author' },
  ]), [
    { openLibraryId: 'OL11W', title: 'Match Test One', author: 'J. K. Writer', cover: 'https://covers.openlibrary.org/b/id/7-L.jpg', year: 1999 },
    { openLibraryId: null, title: 'Match Test Two', author: 'Ann Author', cover: null, year: null },
    { openLibraryId: 'OL13W', title: 'Match Test Three: With a Subtitle', author: 'Real Author', cover: null, year: null },
    { openLibraryId: null, title: 'Match Test Five', author: 'Ann Author', cover: null, year: null },
    { openLibraryId: null, title: 'Match Test Six', author: 'Ann Author', cover: null, year: null },
  ]);
  fetchMock.mock.restore();
});

test('photos must be base64 JPEGs within the size cap', () => {
  assert.equal(cleanPhoto('/9j/4AAQSkZJRg=='), '/9j/4AAQSkZJRg==');
  assert.throws(() => cleanPhoto(undefined), { status: 400, message: /Choose a photo/ });
  assert.throws(() => cleanPhoto('iVBORw0KGgo='), { status: 400, message: /JPEG/ }); // A PNG.
  assert.throws(() => cleanPhoto('/9j/<script>'), { status: 400 });
  assert.throws(() => cleanPhoto(`/9j/${'A'.repeat(MAX_PHOTO_CHARS)}`), { status: 413 });
});

function geminiReply(answer) {
  return Response.json({ candidates: [{ content: { parts: [{ text: typeof answer === 'string' ? answer : JSON.stringify(answer) }] } }] });
}

test('Gemini: sends the photo with the key in a header and cleans the answer', async () => {
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  let sent;
  const many = Array.from({ length: 40 }, (_, index) => ({ title: `Book ${index}`, author: `Writer ${index}` }));
  const fetchMock = mock.method(globalThis, 'fetch', async (url, options) => {
    sent = { url, options };
    return geminiReply({ books: [
      { title: '  Dune  ', author: 'Frank   Herbert' },
      { title: 'dune', author: 'frank herbert' },
      { title: '', author: 'Nobody' },
      { title: 'Mystery Spine', author: 'Unknown' },
      ...many,
    ] });
  });
  const found = await readShelfPhoto('/9j/AAAA');
  assert.equal(found.length, MAX_BOOKS_PER_PHOTO);
  assert.deepEqual(found.slice(0, 3), [
    { title: 'Dune', author: 'Frank Herbert' },
    { title: 'Mystery Spine', author: '' },
    { title: 'Book 0', author: 'Writer 0' },
  ]);
  assert.match(sent.url, /models\/gemini-[\w.-]+:generateContent$/);
  assert.equal(sent.options.headers['x-goog-api-key'], 'test-gemini-key');
  const body = JSON.parse(sent.options.body);
  assert.equal(body.contents[0].parts[0].inlineData.data, '/9j/AAAA');
  assert.equal(body.generationConfig.responseMimeType, 'application/json');
  fetchMock.mock.restore();
  delete process.env.GEMINI_API_KEY;
});

test('Gemini: missing key, busy, failing and unreadable answers get clear errors', async () => {
  await assert.rejects(readShelfPhoto('/9j/AAAA'), { status: 503, message: /isn’t set up/ });
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  const warn = mock.method(console, 'warn', () => {});
  for (const [reply, expected] of [
    [() => new Response('', { status: 429 }), { status: 503, message: /busy/ }],
    [() => Response.json({ error: { message: 'boom' } }, { status: 500 }), { status: 502 }],
    [() => geminiReply('not json'), { status: 502 }],
    [() => { throw new TypeError('fetch failed'); }, { status: 504, message: /too long/ }],
  ]) {
    const fetchMock = mock.method(globalThis, 'fetch', async () => reply());
    await assert.rejects(readShelfPhoto('/9j/AAAA'), expected);
    fetchMock.mock.restore();
  }
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({ candidates: [] }));
  assert.deepEqual(await readShelfPhoto('/9j/AAAA'), []);
  fetchMock.mock.restore();
  warn.mock.restore();
  delete process.env.GEMINI_API_KEY;
});

test('scan: a photo becomes matched shelf books', async () => {
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  const fetchMock = mock.method(globalThis, 'fetch', async url => (String(url).includes('generativelanguage')
    ? geminiReply({ books: [{ title: 'Scan Test Book', author: 'Pat Writer' }] })
    : Response.json({ docs: [{ key: '/works/OL20W', title: 'Scan Test Book', author_name: ['Pat Writer'], cover_i: 9, first_publish_year: 2001 }] })));
  const json = mock.fn();
  await scan({ body: { photo: '/9j/AAAAAAAA' } }, { json });
  assert.deepEqual(json.mock.calls[0].arguments[0], {
    books: [{ openLibraryId: 'OL20W', title: 'Scan Test Book', author: 'Pat Writer', cover: 'https://covers.openlibrary.org/b/id/9-L.jpg', year: 2001 }],
  });
  fetchMock.mock.restore();
  delete process.env.GEMINI_API_KEY;
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
