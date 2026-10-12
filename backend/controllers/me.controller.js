// /api/me — the signed-in reader, their shelf and their username.
import * as Shelf from '../models/shelf.model.js';
import * as User from '../models/user.model.js';
import { accountView, userView } from '../views/user.view.js';

// Answers { user: null } when signed out, so the app can tell "signed out" from an error.
export async function getAccount(request, response) {
  const { user } = request;
  response.json(user ? accountView(user, await Shelf.get(user.id)) : { user: null });
}

export async function saveShelf(request, response) {
  response.json({ shelf: await Shelf.save(request.user.id, request.body) });
}

export async function claimUsername(request, response) {
  const user = await User.claimUsername(request.user.id, request.body.username);
  response.json({ user: userView(user) });
}
