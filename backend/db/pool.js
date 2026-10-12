import mysql from 'mysql2/promise';
import { HttpError } from '../utils/HttpError.js';

let pool;

// One shared MySQL pool, from DATABASE_URL (mysql://user:password@host:3306/bookshelf).
export function db() {
  if (!process.env.DATABASE_URL) throw new HttpError(503, 'Accounts aren’t set up on this server yet.');
  pool ??= mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5, timezone: 'Z' });
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await db().execute(sql, params);
  return rows;
}

// For tests and graceful shutdown: lets the process exit.
export async function closeDb() {
  await pool?.end();
  pool = undefined;
}
