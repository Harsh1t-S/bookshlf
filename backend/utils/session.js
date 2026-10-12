import { createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError } from './HttpError.js';

// Sessions are a signed, HttpOnly cookie carrying the user id and their session version.
const COOKIE = 'bs_session';
const SESSION_DAYS = 30;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new HttpError(503, 'Accounts aren’t set up on this server yet.');
  return value;
}

function sign(payload) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

// Behind a proxy (Vercel, Render) Express reports https via `trust proxy`; locally it's plain http.
function secure(request) {
  return request.secure || process.env.NODE_ENV === 'production';
}

function cookies(request) {
  return Object.fromEntries(String(request.headers.cookie ?? '').split(';')
    .map(part => part.trim().split('='))
    .filter(([key, value]) => key && value !== undefined)
    .map(([key, ...rest]) => [key, decodeURIComponent(rest.join('='))]));
}

export function startSession(request, response, user) {
  const payload = Buffer.from(JSON.stringify({
    uid: user.id,
    v: user.session_version,
    exp: Date.now() + SESSION_DAYS * 864e5,
  })).toString('base64url');
  response.setHeader('Set-Cookie', [
    `${COOKIE}=${payload}.${sign(payload)}`,
    'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${SESSION_DAYS * 86400}`,
    ...(secure(request) ? ['Secure'] : []),
  ].join('; '));
}

export function endSession(request, response) {
  response.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure(request) ? '; Secure' : ''}`);
}

// Returns { uid, v } from a valid, unexpired session cookie, or null.
export function readSession(request) {
  const [payload, signature] = String(cookies(request)[COOKIE] ?? '').split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}
