import { searchBooks } from '../services/openLibrary.service.js';

// GET /api/books/search?q=<title, author or keyword>
// The answer is the same for everyone, so the reader's browser may reuse it for an hour.
// It stays private because the route needs a signed-in reader.
export async function search(request, response) {
  const result = await searchBooks(request.query.q);
  response.set('Cache-Control', 'private, max-age=3600');
  response.json(result);
}
