// "Sign in with Google" in a popup via Google Identity Services. The browser only
// receives a short-lived access token; the backend checks it with Google (and that it
// was issued to our client id) before signing anyone in.
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

let script = null;

// Load early (when the sign-in page opens) so the popup can open straight from the click.
export function preloadGoogle() {
  if (!clientId) return Promise.resolve(null);
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google);
  script ??= new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = SCRIPT_SRC;
    tag.async = true;
    tag.onload = () => resolve(window.google);
    tag.onerror = () => {
      script = null;
      tag.remove();
      reject(new Error('Couldn’t reach Google. Check your connection and try again.'));
    };
    document.head.appendChild(tag);
  });
  return script;
}

export async function requestGoogleAccessToken() {
  if (!clientId) throw new Error('Google sign-in isn’t set up yet. Use your email and password for now.');
  const google = await preloadGoogle();
  return new Promise((resolve, reject) => {
    google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: response => (response.error
        ? reject(new Error('Google sign-in was cancelled.'))
        : resolve(response.access_token)),
      error_callback: error => reject(new Error(error?.type === 'popup_closed'
        ? 'Google sign-in was closed before it finished.'
        : 'Google sign-in couldn’t open. Allow pop-ups for this site and try again.')),
    }).requestAccessToken();
  });
}
