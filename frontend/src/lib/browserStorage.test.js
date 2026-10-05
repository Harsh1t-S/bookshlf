import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { clearProfile, readDraft, readProfile, saveDraft, saveProfile } from './browserStorage.js';

class MemoryStorage {
  values = new Map();

  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const previousWindow = globalThis.window;

function setupStorage() {
  const localStorage = new MemoryStorage();
  const sessionStorage = new MemoryStorage();
  globalThis.window = { localStorage, sessionStorage };
  return { localStorage, sessionStorage };
}

afterEach(() => {
  if (previousWindow === undefined) delete globalThis.window;
  else globalThis.window = previousWindow;
});

test('draft validation removes malformed and duplicate books and clears blob URLs', () => {
  const { localStorage } = setupStorage();
  localStorage.setItem('bookshelf.cv.draft.v1', JSON.stringify({
    themeId: 'sunny-shelf',
    books: [
      { id: 'one', title: ' Keats ', author: ' John Keats ', cover: 'blob:http://localhost/session', rating: 8 },
      { id: 'one', title: 'Duplicate', author: 'Someone', cover: null },
      { id: 'bad', title: '  ', author: 'Unknown', cover: null },
    ],
  }));

  assert.deepEqual(readDraft(), {
    themeId: 'sunny-shelf',
    books: [{ id: 'one', title: 'Keats', author: 'John Keats', cover: null }],
    purchasedThemeIds: [],
  });
});

test('profile persistence keeps only the local preview identity fields', () => {
  const { localStorage } = setupStorage();

  assert.deepEqual(saveProfile({ email: 'reader@example.com', name: 'Reader', password: 'private' }), {
    email: 'reader@example.com', name: 'Reader',
  });
  assert.deepEqual(readProfile(), { email: 'reader@example.com', name: 'Reader' });
  assert.deepEqual(JSON.parse(localStorage.getItem('bookshelf.cv.profile.v1')), {
    email: 'reader@example.com', name: 'Reader',
  });
  assert.equal(localStorage.getItem('bookshelf.cv.profile.v1').includes('private'), false);
});

test('session draft migrates once and remains after signing out', () => {
  const { localStorage, sessionStorage } = setupStorage();
  sessionStorage.setItem('bookshelf.cv.draft.v1', JSON.stringify({
    theme: { id: 'midnight-library' },
    books: [{ id: 'book', title: 'Book', author: 'Author', cover: null }],
  }));

  const migrated = readDraft();
  assert.deepEqual(migrated, {
    themeId: 'midnight-library',
    books: [{ id: 'book', title: 'Book', author: 'Author', cover: null }],
    purchasedThemeIds: [],
  });
  saveDraft(migrated);
  saveProfile({ email: 'reader@example.com', name: 'Reader' });
  clearProfile();

  assert.equal(readProfile(), null);
  assert.deepEqual(readDraft(), migrated);
  assert.equal(localStorage.getItem('bookshelf.cv.session-draft-migrated.v1'), '1');
});

test('purchased themes survive storage and drop invalid or repeated ids', () => {
  setupStorage();
  saveDraft({ themeId: 'macos', books: [], purchasedThemeIds: ['macos', 'macos', '', 7, 'spine-shelf'] });

  assert.deepEqual(readDraft().purchasedThemeIds, ['macos', 'spine-shelf']);
});

test('the shelf owner is kept, trimmed and lowercased, and dropped when blank', () => {
  setupStorage();
  saveDraft({ books: [], themeId: 'light-grid', owner: '  Sarah@Example.com ' });
  assert.equal(readDraft().owner, 'sarah@example.com');
  saveDraft({ books: [], themeId: 'light-grid', owner: '   ' });
  assert.equal('owner' in readDraft(), false);
});
