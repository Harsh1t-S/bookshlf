import { api } from '../../lib/api.js';

// Longest edge in pixels and JPEG quality, tried in order until the photo is small enough.
const SIZES = [[1600, 0.82], [1280, 0.75], [1024, 0.7]];
const MAX_PHOTO_CHARS = 1_000_000; // Base64 characters; same cap as backend/validators/photo.validator.js.

// Shrinks a photo to a base64 JPEG the API accepts. Re-encoding also drops the photo's
// metadata, such as where it was taken.
async function shrinkPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode().catch(() => { throw new Error('That photo couldn’t be opened. Try a JPG or PNG.'); });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    for (const [edge, quality] of SIZES) {
      const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      context.fillStyle = '#fff'; // Transparent PNGs would otherwise turn black.
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL('image/jpeg', quality).split(',')[1];
      if (photo.length <= MAX_PHOTO_CHARS) return photo;
    }
    throw new Error('That photo is too large to send. Try a smaller one.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Client side of the shelf scan: sends a shrunk copy of the photo to the backend
// (backend/controllers/books.controller.js), where Gemini reads the spines and each book is
// matched on Open Library. Books it couldn't match come back without a cover.
export async function scanShelfPhoto(file, { signal } = {}) {
  const photo = await shrinkPhoto(file);
  const { books } = await api('/books/scan', { method: 'POST', body: { photo }, signal });
  if (!books?.length) throw new Error('We couldn’t read any book titles in that photo. Try a closer, well-lit shot of the spines.');

  const stamp = Date.now();
  return books.map((book, index) => ({
    id: book.openLibraryId ? `ol-${book.openLibraryId}` : `photo-${stamp}-${index}`,
    title: book.title,
    author: book.author,
    cover: book.cover,
    ...(book.year ? { year: book.year } : {}),
  }));
}
