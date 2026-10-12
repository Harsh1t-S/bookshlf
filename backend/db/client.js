import { MongoClient } from 'mongodb';
import { HttpError } from '../utils/HttpError.js';

let client;

// One shared MongoDB connection, from MONGODB_URI (mongodb+srv://user:password@cluster/...).
// On Vercel the module stays warm between requests, so the connection is reused.
export function collection(name) {
  if (!process.env.MONGODB_URI) throw new HttpError(503, 'Accounts aren’t set up on this server yet.');
  client ??= new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 });
  return client.db('bookshelf').collection(name);
}

export const isDuplicate = error => error?.code === 11000;

// For tests and scripts: lets the process exit.
export async function closeDb() {
  await client?.close();
  client = undefined;
}
