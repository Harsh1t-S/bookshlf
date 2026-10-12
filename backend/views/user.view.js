// JSON the browser may see about the signed-in reader. Raw rows (password hash,
// lockout state, session version) never leave the server.
import { suggestUsername } from '../validators/username.validator.js';

export function userView(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    picture: row.picture,
    username: row.username,
    since: new Date(row.created_at).getUTCFullYear(),
    hasPassword: Boolean(row.password_hash),
    hasGoogle: Boolean(row.google_sub),
    suggestedUsername: row.username ? null : suggestUsername(row.name || row.email),
  };
}

// What sign-up, sign-in and GET /api/me answer: the reader and their shelf.
export function accountView(row, shelf) {
  return { user: userView(row), shelf };
}
