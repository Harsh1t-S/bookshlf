// The password_resets table: the emailed token is random and only its hash is stored.
import { createHash, randomBytes } from 'node:crypto';
import { db, query } from '../db/pool.js';
import { HttpError } from '../utils/HttpError.js';
import * as User from './user.model.js';

const RESET_MINUTES = 60;

const sha256 = value => createHash('sha256').update(value).digest('hex');

// Returns the token to put in the emailed link.
export async function create(userId) {
  const token = randomBytes(32).toString('base64url');
  await query(
    'INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE))',
    [sha256(token), userId, RESET_MINUTES],
  );
  return token;
}

// Uses the token (once only) to set the new password, and returns the reader.
export async function consume(token, passwordHash) {
  const tokenHash = sha256(String(token));
  const connection = await db().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      'SELECT user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > UTC_TIMESTAMP() FOR UPDATE',
      [tokenHash],
    );
    if (!rows.length) throw new HttpError(400, 'This reset link has expired or was already used.');
    const userId = rows[0].user_id;
    await connection.execute('UPDATE password_resets SET used_at = UTC_TIMESTAMP() WHERE token_hash = ?', [tokenHash]);
    await User.replacePassword(connection, userId, passwordHash);
    await connection.commit();
    return User.findById(userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
