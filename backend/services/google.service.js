import { HttpError } from '../utils/HttpError.js';

// Checks an access token from Google's "Sign in with Google" popup and returns the
// verified Google profile. The token must have been issued to *our* client id, or a
// token from another site could be replayed here to sign in as someone else.
export async function verifyGoogleAccessToken(accessToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new HttpError(503, 'Google sign-in isn’t set up on this server yet.');
  if (typeof accessToken !== 'string' || !accessToken) throw new HttpError(400, 'Google sign-in didn’t complete. Try again.');

  const info = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
  const token = await info.json().catch(() => ({}));
  if (!info.ok || token.aud !== clientId || !(Number(token.expires_in) > 0)) {
    throw new HttpError(401, 'Google sign-in couldn’t be verified. Try again.');
  }

  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
  const profile = await response.json().catch(() => ({}));
  if (!response.ok || !profile.sub || !profile.email) throw new HttpError(401, 'Google didn’t share your email address. Try again.');
  if (profile.email_verified !== true) throw new HttpError(403, 'Verify your email with Google first, then try again.');
  return { sub: String(profile.sub), email: profile.email.toLowerCase(), name: profile.name || '', picture: profile.picture || null };
}
