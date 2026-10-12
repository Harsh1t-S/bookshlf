// The password_resets collection: the emailed token is random and only its hash is stored
// (as _id). A TTL index (db/setup.js) deletes tokens once they expire.
import { createHash, randomBytes } from 'node:crypto';
import { collection } from '../db/client.js';
import { HttpError } from '../utils/HttpError.js';
import * as User from './user.model.js';

const RESET_MINUTES = 60;

const resets = () => collection('password_resets');
const sha256 = value => createHash('sha256').update(value).digest('hex');

// Returns the token to put in the emailed link.
export async function create(userId) {
  const token = randomBytes(32).toString('base64url');
  await resets().insertOne({
    _id: sha256(token),
    user_id: userId,
    expires_at: new Date(Date.now() + RESET_MINUTES * 60_000),
    used_at: null,
  });
  return token;
}

// Uses the token (once only: marking it used is a single atomic update) to set the new
// password, and returns the reader.
export async function consume(token, passwordHash) {
  const reset = await resets().findOneAndUpdate(
    { _id: sha256(String(token)), used_at: null, expires_at: { $gt: new Date() } },
    { $set: { used_at: new Date() } },
  );
  if (!reset) throw new HttpError(400, 'This reset link has expired or was already used.');
  await User.replacePassword(reset.user_id, passwordHash);
  return User.findById(reset.user_id);
}
