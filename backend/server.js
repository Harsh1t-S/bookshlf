import app from './app.js';

const port = Number(process.env.PORT) || 4000;
const missing = ['DATABASE_URL', 'SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GEMINI_API_KEY'].filter(name => !process.env[name]);
if (missing.length) console.warn(`Missing in backend/.env: ${missing.join(', ')}. Features that need them will answer 503.`);

app.listen(port, () => {
  console.log(`Bookshelf.cv API on http://localhost:${port}/api`);
});
