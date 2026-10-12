import { importGoodreads } from '../services/goodreads.service.js';

// GET /api/goodreads?profile=<profile link, vanity name or user id>
export async function importShelves(request, response) {
  response.json(await importGoodreads(request.query.profile));
}
