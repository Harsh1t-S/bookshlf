import { HttpError } from '../utils/HttpError.js';

// The browser shrinks shelf photos to a JPEG of at most this many base64 characters (about
// 730 KB), which keeps the request inside app.js's 1 MB body limit.
// See frontend/src/features/books/photo.js.
export const MAX_PHOTO_CHARS = 1_000_000;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

// A base64 JPEG ready to send to Gemini, or a 400 the photo panel can show as-is.
export function cleanPhoto(value) {
  if (typeof value !== 'string' || !value) throw new HttpError(400, 'Choose a photo of your bookshelf first.');
  if (value.length > MAX_PHOTO_CHARS) throw new HttpError(413, 'That photo is too large. Try a smaller one.');
  // Every JPEG starts with the bytes FF D8 FF, which is "/9j/" in base64.
  if (!value.startsWith('/9j/') || value.length % 4 || !BASE64.test(value)) {
    throw new HttpError(400, 'Send the photo as a base64 JPEG.');
  }
  return value;
}
