// The users table: accounts, sign-in lockout and usernames (bookshelf.cv/<username>).
import { randomUUID } from 'node:crypto';
import { db, query } from '../db/pool.js';
import { HttpError } from '../utils/HttpError.js';
import { normalizeUsername, usernameProblem } from '../validators/username.validator.js';
import * as Shelf from './shelf.model.js';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const TAKEN = 'That link is taken. Try another.';

const isDuplicate = error => error?.code === 'ER_DUP_ENTRY';

export async function findById(id) {
  return (await query('SELECT * FROM users WHERE id = ?', [id]))[0] ?? null;
}

export async function findByEmail(email) {
  return (await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]))[0] ?? null;
}

export async function findByGoogleSub(sub) {
  return (await query('SELECT * FROM users WHERE google_sub = ?', [sub]))[0] ?? null;
}

export async function findByUsername(value) {
  const username = normalizeUsername(value);
  if (usernameProblem(username)) return null;
  return (await query('SELECT * FROM users WHERE username = ?', [username]))[0] ?? null;
}

// Creates the reader and their empty shelf together.
export async function create({ email, name, passwordHash = null, googleSub = null, picture = null }) {
  const id = randomUUID();
  const connection = await db().getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      'INSERT INTO users (id, email, name, picture, password_hash, google_sub) VALUES (?, ?, ?, ?, ?, ?)',
      [id, email.toLowerCase(), name.slice(0, 120), picture, passwordHash, googleSub],
    );
    await Shelf.insertEmpty(connection, id);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    if (isDuplicate(error)) throw new HttpError(409, 'An account with this email already exists. Sign in instead.');
    throw error;
  } finally {
    connection.release();
  }
  return findById(id);
}

export async function linkGoogle(userId, { sub, picture }) {
  await query('UPDATE users SET google_sub = ?, picture = COALESCE(picture, ?) WHERE id = ?', [sub, picture, userId]);
  return findById(userId);
}

// Sets a new password and signs out every device (their sessions carry the old session_version).
// Runs inside the password-reset transaction (see passwordReset.model.js).
export async function replacePassword(connection, userId, passwordHash) {
  await connection.execute(
    'UPDATE users SET password_hash = ?, session_version = session_version + 1, failed_logins = 0, locked_until = NULL WHERE id = ?',
    [passwordHash, userId],
  );
}

// --- Sign-in attempts: lock the account for a while after repeated wrong passwords. ---

export function isLocked(user) {
  return user.locked_until && new Date(user.locked_until) > new Date();
}

export async function recordFailedLogin(user) {
  const failures = user.failed_logins + 1;
  if (failures >= MAX_FAILED_LOGINS) {
    await query('UPDATE users SET failed_logins = 0, locked_until = DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE) WHERE id = ?', [LOCK_MINUTES, user.id]);
  } else {
    await query('UPDATE users SET failed_logins = ? WHERE id = ?', [failures, user.id]);
  }
}

export async function clearFailedLogins(user) {
  if (user.failed_logins || user.locked_until) await query('UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = ?', [user.id]);
}

// --- Usernames ---

export async function usernameAvailability(value, userId = null) {
  const username = normalizeUsername(value);
  const problem = usernameProblem(username);
  if (problem) return { username, available: false, problem };
  const taken = await query('SELECT id FROM users WHERE username = ? AND id <> ?', [username, userId ?? '']);
  return { username, available: !taken.length, problem: taken.length ? TAKEN : '' };
}

export async function claimUsername(userId, value) {
  const { username, available, problem } = await usernameAvailability(value, userId);
  if (!available) throw new HttpError(problem === TAKEN ? 409 : 400, problem);
  try {
    await query('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
  } catch (error) {
    if (isDuplicate(error)) throw new HttpError(409, TAKEN);
    throw error;
  }
  return findById(userId);
}
