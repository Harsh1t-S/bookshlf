// Creates the indexes the app relies on (unique emails, usernames and Google ids, and
// auto-expiring reset tokens). Safe to re-run. Usage: npm run db:setup  (reads backend/.env)
import { closeDb, collection } from './client.js';

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is missing. Add it to backend/.env.');
  process.exit(1);
}

const users = collection('users');
await users.createIndex({ email: 1 }, { unique: true });
await users.createIndex({ google_sub: 1 }, { unique: true, partialFilterExpression: { google_sub: { $type: 'string' } } });
await users.createIndex({ username: 1 }, { unique: true, partialFilterExpression: { username: { $type: 'string' } } });
// MongoDB deletes each reset token once its expires_at has passed.
await collection('password_resets').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

console.log('Database "bookshelf" ready: users, shelves and password_resets are indexed.');
await closeDb();
