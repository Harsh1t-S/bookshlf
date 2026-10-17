// Reads the books in a shelf photo with Google's Gemini API (image understanding with a
// JSON answer). Needs GEMINI_API_KEY from Google AI Studio. On the free tier Google may use
// the photos to improve its products, which the privacy policy tells readers.
import { HttpError } from '../utils/HttpError.js';

const MODEL = 'gemini-3.5-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 25_000; // For both tries together.
const RETRY_IF_LEFT_MS = 10_000;
export const MAX_BOOKS_PER_PHOTO = 40; // A full shelf; past this, photograph it in parts.

const PROMPT = `This photo shows books, usually on a shelf or in a stack. List every book whose title you can read on its spine or cover, from left to right and top to bottom.
- title: the main title as printed, without any subtitle. Use normal capitalisation, even if the spine is in capitals.
- author: the author's name as printed. If no name is printed but you are sure who wrote the book, give that author. Otherwise leave it empty.
List each book once, even if there are several copies. Skip anything that isn't a book, such as magazines, notebooks, films and games. Skip any book whose title you can't read clearly, and never invent books. If you can't read any titles, return an empty list.`;

// The answer's shape, in the OpenAPI-style schema generateContent takes as responseSchema.
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    books: {
      type: 'ARRAY',
      maxItems: MAX_BOOKS_PER_PHOTO,
      items: {
        type: 'OBJECT',
        properties: { title: { type: 'STRING' }, author: { type: 'STRING' } },
        required: ['title', 'author'],
      },
    },
  },
  required: ['books'],
};

const FAILED = 'We couldn’t read that photo right now. Try again in a minute.';

const clean = value => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, 200) : '');

// Titles and authors from Gemini's answer: trimmed, without repeats, and with placeholder
// authors ("Unknown") left blank.
function toFound(answer) {
  const seen = new Set();
  const found = [];
  for (const item of Array.isArray(answer?.books) ? answer.books : []) {
    const title = clean(item?.title);
    const author = clean(item?.author).replace(/^(unknown( author)?|n\/?a|none|-+)$/i, '');
    const key = `${title}\u0000${author}`.toLowerCase();
    if (!title || seen.has(key)) continue;
    seen.add(key);
    found.push({ title, author });
    if (found.length === MAX_BOOKS_PER_PHOTO) break;
  }
  return found;
}

// [{ title, author }] for the books Gemini can read in a base64 JPEG. author may be '' when
// it isn't printed and Gemini doesn't know it.
export async function readShelfPhoto(photo) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new HttpError(503, 'Photo scanning isn’t set up on this server yet.');

  const body = JSON.stringify({
    contents: [{ parts: [{ inlineData: { mimeType: 'image/jpeg', data: photo } }, { text: PROMPT }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: SCHEMA,
      mediaResolution: 'MEDIA_RESOLUTION_HIGH', // Spine lettering is small.
      // Reading spines needs no reasoning; MINIMAL answered about 1.5 s sooner than LOW with the same results.
      thinkingConfig: { thinkingLevel: 'MINIMAL' },
    },
  });
  const deadline = Date.now() + TIMEOUT_MS;
  let response;
  // Gemini is sometimes briefly overloaded (500 or 503), and a second try usually gets through.
  for (let attempt = 1; ; attempt += 1) {
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body,
        signal: AbortSignal.timeout(deadline - Date.now()),
      });
    } catch {
      throw new HttpError(504, 'Reading your photo took too long. Try again.');
    }
    if (attempt === 2 || ![500, 503].includes(response.status) || deadline - Date.now() < RETRY_IF_LEFT_MS) break;
    await response.body?.cancel(); // Frees the connection for the second try.
  }
  if (response.status === 429) {
    // The free tier has per-minute and per-day quotas; only the first passes quickly.
    const { error } = await response.json().catch(() => ({}));
    const daily = (error?.details ?? []).some(detail => detail.violations?.some(violation => /PerDay/i.test(violation.quotaId ?? '')));
    throw new HttpError(503, daily
      ? 'Photo scanning has reached today’s limit. Try again tomorrow, or add your books from the library for now.'
      : 'Photo scanning is busy right now. Try again in a minute.');
  }
  if (!response.ok) {
    const detail = await response.json().then(answer => answer.error?.message, () => '');
    console.warn(`Gemini answered ${response.status}: ${detail}`);
    throw new HttpError(502, FAILED);
  }

  const data = await response.json().catch(() => ({}));
  const reply = (data.candidates?.[0]?.content?.parts ?? []).filter(part => !part.thought).map(part => part.text ?? '').join('');
  if (!reply.trim()) return []; // Nothing readable, or Gemini declined the photo.
  try {
    return toFound(JSON.parse(reply));
  } catch {
    console.warn(`Gemini's answer wasn't JSON: ${reply.slice(0, 200)}`);
    throw new HttpError(502, FAILED);
  }
}
