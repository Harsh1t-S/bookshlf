import { MAX_BOOKS_PER_PHOTO, readShelfPhoto } from '../services/gemini.service.js';
import { matchBooks, searchBooks } from '../services/openLibrary.service.js';
import { cleanPhoto } from '../validators/photo.validator.js';

// GET /api/books/search?q=<title, author or keyword>
// The answer is the same for everyone, so the reader's browser may reuse it for an hour.
// It stays private because the route needs a signed-in reader.
export async function search(request, response) {
  const result = await searchBooks(request.query.q);
  response.set('Cache-Control', 'private, max-age=3600');
  response.json(result);
}

// POST /api/books/scan { photo: <base64 JPEG> }
// Gemini reads the titles and authors in a shelf photo, then each book is matched on Open
// Library for its cover. The photo is never stored. capped means Gemini stopped at its limit,
// so the shelf probably holds more books than were read.
export async function scan(request, response) {
  const found = await readShelfPhoto(cleanPhoto(request.body?.photo));
  response.json({ books: await matchBooks(found), capped: found.length >= MAX_BOOKS_PER_PHOTO });
}
