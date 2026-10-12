import * as Shelf from '../models/shelf.model.js';
import * as User from '../models/user.model.js';
import { HttpError } from '../utils/HttpError.js';
import { publicShelfView } from '../views/shelf.view.js';

// GET /api/shelves/:username — what bookshelf.cv/<username> shows. Works signed out.
export async function getPublicShelf(request, response) {
  const owner = await User.findByUsername(request.params.username);
  if (!owner) throw new HttpError(404, 'No bookshelf lives at this link yet.');
  response.json(publicShelfView(owner, await Shelf.get(owner.id)));
}
