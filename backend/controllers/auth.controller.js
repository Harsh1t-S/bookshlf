// /api/auth/* — email + password accounts, Google sign-in, sign-out and password reset.
import * as PasswordReset from '../models/passwordReset.model.js';
import * as Shelf from '../models/shelf.model.js';
import * as User from '../models/user.model.js';
import { verifyGoogleAccessToken } from '../services/google.service.js';
import { sendPasswordReset } from '../services/mail.service.js';
import { HttpError } from '../utils/HttpError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { endSession, startSession } from '../utils/session.js';
import { cleanEmail } from '../validators/email.validator.js';
import { passwordProblem } from '../validators/password.validator.js';
import { accountView } from '../views/user.view.js';

const GOOGLE_ONLY = 'This email signs in with Google. Use “Continue with Google”.';

function checkPassword(password) {
  const problem = passwordProblem(password);
  if (problem) throw new HttpError(400, problem);
}

// "holland.mckay@example.com" -> "Holland Mckay", for accounts created without a name.
function nameFromEmail(email) {
  return email.split('@')[0].split(/[._-]+/).filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || email;
}

async function signIn(request, response, user) {
  startSession(request, response, user);
  response.json(accountView(user, await Shelf.get(user.id)));
}

export async function signup(request, response) {
  const email = cleanEmail(request.body.email);
  checkPassword(request.body.password);
  const existing = await User.findByEmail(email);
  if (existing) throw new HttpError(409, existing.password_hash ? 'An account with this email already exists. Sign in instead.' : GOOGLE_ONLY);
  const name = String(request.body.name ?? '').trim() || nameFromEmail(email);
  const user = await User.create({ email, name, passwordHash: await hashPassword(request.body.password) });
  await signIn(request, response, user);
}

export async function login(request, response) {
  const email = cleanEmail(request.body.email);
  const password = String(request.body.password ?? '');
  const user = await User.findByEmail(email);
  if (user && User.isLocked(user)) throw new HttpError(429, 'Too many wrong passwords. Try again in 15 minutes, or reset your password.');
  if (!user?.password_hash) throw new HttpError(401, user ? GOOGLE_ONLY : 'Email or password is incorrect.');
  if (!await verifyPassword(password, user.password_hash)) {
    await User.recordFailedLogin(user);
    throw new HttpError(401, 'Email or password is incorrect.');
  }
  await User.clearFailedLogins(user);
  await signIn(request, response, user);
}

// With Google, signing up and signing in are one step: find the account, link it, or create it.
export async function google(request, response) {
  const profile = await verifyGoogleAccessToken(request.body.accessToken);
  let user = await User.findByGoogleSub(profile.sub);
  if (!user) {
    const sameEmail = await User.findByEmail(profile.email);
    user = sameEmail
      ? await User.linkGoogle(sameEmail.id, profile) // Google has verified this email, so it is the same reader.
      : await User.create({ email: profile.email, name: profile.name || nameFromEmail(profile.email), googleSub: profile.sub, picture: profile.picture });
  }
  await signIn(request, response, user);
}

export function logout(request, response) {
  endSession(request, response);
  response.json({ ok: true });
}

// Always answers the same way, so it can't be used to find out who has an account.
export async function forgotPassword(request, response) {
  const email = cleanEmail(request.body.email);
  const user = await User.findByEmail(email);
  if (user) {
    const token = await PasswordReset.create(user.id);
    const origin = process.env.APP_ORIGIN || 'http://localhost:5173';
    await sendPasswordReset({ email, link: `${origin}/reset?token=${encodeURIComponent(token)}` });
  }
  response.json({ ok: true });
}

export async function resetPassword(request, response) {
  checkPassword(request.body.password);
  const user = await PasswordReset.consume(request.body.token, await hashPassword(request.body.password));
  await signIn(request, response, user);
}
