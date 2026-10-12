import { HttpError } from '../utils/HttpError.js';

// API answers are never cached, and changes must be sent as JSON. A plain HTML form on
// another site can't send JSON, which (with the SameSite=Lax cookie) stops other sites
// acting as the signed-in reader.
export function jsonOnly(request, response, next) {
  response.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(request.method) && !request.is('application/json')) {
    throw new HttpError(415, 'Send requests as JSON.');
  }
  next();
}
