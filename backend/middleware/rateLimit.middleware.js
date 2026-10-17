import { HttpError } from '../utils/HttpError.js';

// Allows each signed-in reader `limit` requests per `windowMs`, then answers 429 with
// Retry-After. Use it after requireUser. Readers are counted by account, not by IP:
// requests reach the API through Vercel's proxy, so many readers share an IP address.
// Counts live in this process's memory (the API runs as one long-lived Node process).
export function rateLimit({ limit, windowMs }) {
  const windows = new Map(); // user id -> { count, resetAt }

  return function limitRate(request, response, next) {
    const now = Date.now();
    if (windows.size > 1000) {
      for (const [id, window] of windows) if (window.resetAt <= now) windows.delete(id);
    }
    let window = windows.get(request.user.id);
    if (!window || window.resetAt <= now) {
      window = { count: 0, resetAt: now + windowMs };
      windows.set(request.user.id, window);
    }
    window.count += 1;
    if (window.count > limit) {
      const wait = Math.ceil((window.resetAt - now) / 1000);
      response.set('Retry-After', String(wait));
      throw new HttpError(429, wait > 90
        ? `You’ve done that a lot. Try again in ${Math.ceil(wait / 60)} minutes.`
        : 'You’re going a bit fast. Wait a few seconds and try again.');
    }
    next();
  };
}
