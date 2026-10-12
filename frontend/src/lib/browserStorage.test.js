import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { clearDraft, readDraft, saveDraft } from './browserStorage.js';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const previousWindow = globalThis.window;
afterEach(() => {
  if (previousWindow === undefined) delete globalThis.window;
  else globalThis.window = previousWindow;
});

test('the shelf cache round-trips, ignores junk and clears', () => {
  const storage = new MemoryStorage();
  globalThis.window = { localStorage: storage };

  saveDraft({ themeId: 'macos', purchasedThemeIds: ['macos'], books: [{ id: 'x', title: 'X', author: 'Y', cover: null }, null, { id: 7 }] });
  assert.deepEqual(readDraft(), { themeId: 'macos', purchasedThemeIds: ['macos'], books: [{ id: 'x', title: 'X', author: 'Y', cover: null }] });

  storage.setItem('bookshelf.cv.draft.v1', '{bad json');
  assert.deepEqual(readDraft(), { books: [], themeId: 'light-grid', purchasedThemeIds: [] });

  clearDraft();
  assert.equal(storage.getItem('bookshelf.cv.draft.v1'), null);
});
