// The users collection: accounts, sign-in lockout and usernames (bookshelf.cv/<username>).
// Documents use _id = a UUID; the rest of the app sees it as user.id.
import { randomUUID } from 'node:crypto';
import { collection, isDuplicate } from '../db/client.js';
import { HttpError } from '../utils/HttpError.js';
import { normalizeUsername, usernameProblem } from '../validators/username.validator.js';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const TAKEN = 'That link is taken. Try another.';

const users = () => collection('users');
const toUser = doc => (doc ? { ...doc, id: doc._id } : null);

export async function findById(id) {
  return toUser(await users().findOne({ _id: id }));
}

export async function findByEmail(email) {
  return toUser(await users().findOne({ email: email.toLowerCase() }));
}

export async function findByGoogleSub(sub) {
  return toUser(await users().findOne({ google_sub: sub }));
}

export async function findByUsername(value) {
  const username = normalizeUsername(value);
  if (usernameProblem(username)) return null;
  return toUser(await users().findOne({ username }));
}

// A new reader starts with an empty shelf (see shelf.model.js), so only the user is stored here.
export async function create({ email, name, passwordHash = null, googleSub = null, picture = null }) {
  const doc = {
    _id: randomUUID(),
    email: email.toLowerCase(),
    name: name.slice(0, 120),
    picture,
    password_hash: passwordHash,
    google_sub: googleSub,
    username: null,
    session_version: 0,
    failed_logins: 0,
    locked_until: null,
    created_at: new Date(),
  };
  try {
    await users().insertOne(doc);
  } catch (error) {
    if (isDuplicate(error)) throw new HttpError(409, 'An account with this email already exists. Sign in instead.');
    throw error;
  }
  return toUser(doc);
}

export async function linkGoogle(userId, { sub, picture }) {
  const user = await findById(userId);
  await users().updateOne({ _id: userId }, { $set: { google_sub: sub, picture: user?.picture ?? picture } });
  return findById(userId);
}

// Sets a new password and signs out every device (their sessions carry the old session_version).
export async function replacePassword(userId, passwordHash) {
  await users().updateOne(
    { _id: userId },
    { $set: { password_hash: passwordHash, failed_logins: 0, locked_until: null }, $inc: { session_version: 1 } },
  );
}

// --- Sign-in attempts: lock the account for a while after repeated wrong passwords. ---

export function isLocked(user) {
  return user.locked_until && new Date(user.locked_until) > new Date();
}

export async function recordFailedLogin(user) {
  const failures = user.failed_logins + 1;
  const update = failures >= MAX_FAILED_LOGINS
    ? { failed_logins: 0, locked_until: new Date(Date.now() + LOCK_MINUTES * 60_000) }
    : { failed_logins: failures };
  await users().updateOne({ _id: user.id }, { $set: update });
}

export async function clearFailedLogins(user) {
  if (user.failed_logins || user.locked_until) await users().updateOne({ _id: user.id }, { $set: { failed_logins: 0, locked_until: null } });
}

// --- Usernames ---

export async function usernameAvailability(value, userId = null) {
  const username = normalizeUsername(value);
  const problem = usernameProblem(username);
  if (problem) return { username, available: false, problem };
  const taken = await users().findOne({ username, _id: { $ne: userId ?? '' } }, { projection: { _id: 1 } });
  return { username, available: !taken, problem: taken ? TAKEN : '' };
}

export async function claimUsername(userId, value) {
  const { username, available, problem } = await usernameAvailability(value, userId);
  if (!available) throw new HttpError(problem === TAKEN ? 409 : 400, problem);
  try {
    await users().updateOne({ _id: userId }, { $set: { username } });
  } catch (error) {
    if (isDuplicate(error)) throw new HttpError(409, TAKEN);
    throw error;
  }
  return findById(userId);
}
