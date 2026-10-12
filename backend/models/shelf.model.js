// The shelves collection: one document per reader (_id = their user id) with their
// books, chosen look and bought looks. A reader without a document has an empty shelf.
import { collection } from '../db/client.js';
import { cleanShelf } from '../validators/shelf.validator.js';

const shelves = () => collection('shelves');

export async function get(userId) {
  return cleanShelf(await shelves().findOne({ _id: userId }));
}

export async function save(userId, shelf) {
  const clean = cleanShelf(shelf);
  await shelves().updateOne({ _id: userId }, { $set: { ...clean, updated_at: new Date() } }, { upsert: true });
  return clean;
}

export async function remove(userId) {
  await shelves().deleteOne({ _id: userId });
}
