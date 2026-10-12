// Creates the database named in DATABASE_URL (if missing) and its tables.
// Usage: npm run db:setup   (reads backend/.env)
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is missing. Add it to backend/.env, e.g. mysql://root:PASSWORD@localhost:3306/bookshelf');
  process.exit(1);
}

const target = new URL(url);
const database = decodeURIComponent(target.pathname.slice(1));
if (!/^\w+$/.test(database)) {
  console.error('DATABASE_URL must end with a database name made of letters, numbers or underscores, e.g. /bookshelf');
  process.exit(1);
}
target.pathname = '/';

const server = await mysql.createConnection({ uri: target.toString(), multipleStatements: true });
await server.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await server.query(`USE \`${database}\``);
await server.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
const [tables] = await server.query('SHOW TABLES');
console.log(`Database "${database}" ready with tables: ${tables.map(row => Object.values(row)[0]).join(', ')}`);
await server.end();
