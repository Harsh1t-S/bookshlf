// The shelves table: one row per reader with their books, chosen look and bought looks.
import { query } from '../db/pool.js';
import { cleanShelf } from '../validators/shelf.validator.js';

// Runs inside the transaction that creates the reader (see user.model.js).
export async function insertEmpty(connection, userId) {
  await connection.execute(
    "INSERT INTO shelves (user_id, theme_id, purchased_theme_ids, books) VALUES (?, 'light-grid', JSON_ARRAY(), JSON_ARRAY())",
    [userId],
  );
}

export async function get(userId) {
  const row = (await query('SELECT * FROM shelves WHERE user_id = ?', [userId]))[0];
  return cleanShelf(row && { themeId: row.theme_id, purchasedThemeIds: row.purchased_theme_ids, books: row.books });
}

export async function save(userId, shelf) {
  const clean = cleanShelf(shelf);
  await query(
    'UPDATE shelves SET theme_id = ?, purchased_theme_ids = ?, books = ? WHERE user_id = ?',
    [clean.themeId, JSON.stringify(clean.purchasedThemeIds), JSON.stringify(clean.books), userId],
  );
  return clean;
}
