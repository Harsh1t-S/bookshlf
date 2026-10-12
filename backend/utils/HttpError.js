// An error that becomes a JSON reply ({ error: message } with this status).
// Throw it from anywhere in a request; middleware/error.middleware.js sends it.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
