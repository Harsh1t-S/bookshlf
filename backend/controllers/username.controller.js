import * as User from '../models/user.model.js';

// GET /api/usernames/:name — live check while a reader picks their link.
// Their own current name counts as available.
export async function checkUsername(request, response) {
  response.json(await User.usernameAvailability(request.params.name, request.user?.id));
}
