// HTTP tests against the real Express app. The "with database" suite runs only when
// DATABASE_URL is set (backend/.env) and uses throwaway accounts it deletes afterwards.
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { createApp } from '../app.js';
import { closeDb, query } from '../db/pool.js';

let server;
let base;

before(async () => {
  process.env.SESSION_SECRET ||= 'test-secret-that-is-long-enough-for-hmac-signing';
  server = createApp().listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server.close();
  await closeDb();
});

function call(path, { method = 'GET', body, cookie, type = 'application/json' } = {}) {
  return fetch(`${base}${path}`, {
    method,
    headers: { ...(body !== undefined ? { 'Content-Type': type } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  }).then(async response => ({ status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] }));
}

describe('without a database', () => {
  test('signed-out /me answers user: null', async () => {
    assert.deepEqual(await call('/me'), { status: 200, body: { user: null }, cookie: undefined });
  });

  test('changes must be JSON (blocks cross-site form posts)', async () => {
    const result = await call('/auth/logout', { method: 'POST', body: 'x=1', type: 'application/x-www-form-urlencoded' });
    assert.equal(result.status, 415);
  });

  test('unknown API paths are a JSON 404', async () => {
    assert.equal((await call('/nope')).status, 404);
  });

  test('protected routes need a session', async () => {
    assert.equal((await call('/me/shelf', { method: 'PUT', body: { books: [] } })).status, 401);
  });

  test('bad sign-up input is rejected before touching the database', async () => {
    assert.equal((await call('/auth/signup', { method: 'POST', body: { email: 'nope', password: 'longenough' } })).status, 400);
    assert.equal((await call('/auth/signup', { method: 'POST', body: { email: 'a@b.co', password: 'short' } })).status, 400);
  });

  test('Goodreads import validates its input', async () => {
    assert.equal((await call('/goodreads?profile=')).status, 400);
  });
});

describe('with database', { skip: !process.env.DATABASE_URL && 'DATABASE_URL not set' }, () => {
  const stamp = `${process.pid}${Math.floor(performance.now())}`;
  const email = `test-${stamp}@example.com`;
  const username = `test-${stamp}`;
  let cookie;

  after(async () => {
    await query('DELETE FROM users WHERE email LIKE ?', [`test-${stamp}%`]);
  });

  test('sign up signs the reader in with an empty shelf', async () => {
    const result = await call('/auth/signup', { method: 'POST', body: { email, password: 'first-password', name: 'Test Reader' } });
    assert.equal(result.status, 200);
    assert.equal(result.body.user.email, email);
    assert.equal(result.body.user.hasPassword, true);
    assert.deepEqual(result.body.shelf, { books: [], themeId: 'light-grid', purchasedThemeIds: [] });
    cookie = result.cookie;
    assert.equal((await call('/me', { cookie })).body.user.email, email);
  });

  test('the same email cannot sign up twice', async () => {
    assert.equal((await call('/auth/signup', { method: 'POST', body: { email, password: 'other-password' } })).status, 409);
  });

  test('the shelf saves and comes back cleaned', async () => {
    const books = [{ id: 'b1', title: 'Dune', author: 'Frank Herbert', cover: 'https://example.com/d.jpg', rating: 5 }];
    const saved = await call('/me/shelf', { method: 'PUT', cookie, body: { books, themeId: 'macos', purchasedThemeIds: ['macos'] } });
    assert.equal(saved.status, 200);
    assert.deepEqual((await call('/me', { cookie })).body.shelf, { books, themeId: 'macos', purchasedThemeIds: ['macos'] });
  });

  test('a username is checked, claimed and then serves the public shelf', async () => {
    assert.equal((await call(`/usernames/${username}`)).body.available, true);
    assert.equal((await call('/usernames/themes')).body.available, false);
    const claimed = await call('/me/username', { method: 'PUT', cookie, body: { username: username.toUpperCase() } });
    assert.equal(claimed.body.user.username, username);
    assert.equal((await call(`/usernames/${username}`)).body.available, false);

    const shelf = await call(`/shelves/${username}`);
    assert.equal(shelf.status, 200);
    assert.equal(shelf.body.owner.name, 'Test Reader');
    assert.equal(shelf.body.shelf.books[0].title, 'Dune');
    assert.equal(shelf.body.owner.email, undefined);
    assert.equal((await call('/shelves/nobody-lives-here-xyz')).status, 404);
  });

  test('login checks the password and locks after repeated failures', async () => {
    assert.equal((await call('/auth/login', { method: 'POST', body: { email, password: 'first-password' } })).status, 200);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      assert.equal((await call('/auth/login', { method: 'POST', body: { email, password: 'wrong-password' } })).status, 401);
    }
    assert.equal((await call('/auth/login', { method: 'POST', body: { email, password: 'first-password' } })).status, 429);
  });

  test('password reset uses a one-time link and signs out old sessions', async () => {
    const logged = [];
    const original = console.info;
    console.info = message => logged.push(String(message));
    try {
      assert.deepEqual((await call('/auth/forgot', { method: 'POST', body: { email } })).body, { ok: true });
      assert.deepEqual((await call('/auth/forgot', { method: 'POST', body: { email: `nobody-${stamp}@example.com` } })).body, { ok: true });
    } finally {
      console.info = original;
    }
    const token = decodeURIComponent(logged.join('\n').match(/token=([^\s]+)/)[1]);

    const reset = await call('/auth/reset', { method: 'POST', body: { token, password: 'second-password' } });
    assert.equal(reset.status, 200);
    assert.equal((await call('/me', { cookie })).body.user, null, 'old session should be signed out');
    assert.equal((await call('/me', { cookie: reset.cookie })).body.user.email, email);
    assert.equal((await call('/auth/reset', { method: 'POST', body: { token, password: 'third-password' } })).status, 400, 'link is single-use');
    assert.equal((await call('/auth/login', { method: 'POST', body: { email, password: 'second-password' } })).status, 200, 'reset also clears the lock');
  });
});
