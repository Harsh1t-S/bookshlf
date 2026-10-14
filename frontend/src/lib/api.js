// Calls the Bookshelf.cv API (../backend). Throws an Error carrying the server's
// message, so forms can show it as-is.
export async function api(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw Object.assign(new Error('Can’t reach Bookshelf.cv right now. Check your connection and try again.'), { status: 0 });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error || (response.status >= 500 ? 'Our server isn’t responding. Try again in a moment.' : 'That didn’t work. Try again.');
    throw Object.assign(new Error(message), { status: response.status });
  }
  return data;
}
