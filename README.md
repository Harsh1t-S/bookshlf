# Bookshelf.cv

Bookshelf.cv lets a reader sign up, pick a bookshelf look, add their books (from
Goodreads, a shelf photo, the built-in library or by hand) and share their shelf at
`bookshelf.cv/<username>`.

The repo has two apps:

- `frontend/`: React 19 + Vite + Tailwind CSS v4.
- `backend/`: Node 22 + Express 5 + MySQL, organised as MVC.

## Development

You need Node 22+ and a local MySQL server.

**Backend** on http://localhost:4000:

```sh
cd backend
npm install
cp .env.example .env      # then fill it in (see "Environment variables")
npm run db:setup          # creates the MySQL database and tables (safe to re-run)
npm run dev
```

**Frontend** on http://localhost:5173. The dev server forwards `/api` to the backend.

```sh
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

From the repo root, `npm run dev`, `npm run dev:backend`, `npm run build` and `npm test`
run the same scripts. The backend's database tests run only when `DATABASE_URL` is set.

## Environment variables

Real values go in `backend/.env` and `frontend/.env.local`. Git ignores both files, so
never commit them. Only the `.env.example` files are committed.

| File | Variable | What it is |
| --- | --- | --- |
| `backend/.env` | `DATABASE_URL` | `mysql://USER:PASSWORD@localhost:3306/bookshelf` |
| `backend/.env` | `SESSION_SECRET` | Long random string that signs session cookies |
| `backend/.env` | `GOOGLE_CLIENT_ID` | Google OAuth **client ID** (see below) |
| `backend/.env` | `APP_ORIGIN` | Site address used in password-reset links |
| `frontend/.env.local` | `VITE_GOOGLE_CLIENT_ID` | The same Google client ID |
| `frontend/.env.local` | `VITE_RAZORPAY_KEY_ID` | Razorpay test key id (`rzp_test_…`) |

### Google sign-in

1. In Google Cloud Console, go to Google Auth Platform > Clients and create a **Web
   application** client.
2. Under Authorized JavaScript origins, add `http://localhost:5173`, plus the production
   domain when you deploy. You don't need a redirect URI.
3. Put the client ID in both `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID`
   (frontend), then restart both dev servers.

The **client secret is not used**. The browser gets a short-lived access token from
Google's popup, and the backend checks with Google that the token was issued to this
client ID. Keep the secret out of the repo, and never put it in a `VITE_` variable:
Vite builds those into the public JavaScript.

## Accounts

- Readers sign up with an email and password, or with "Continue with Google". Passwords
  are hashed with scrypt. Five wrong passwords lock the account for 15 minutes.
- A session is a signed, HttpOnly cookie. Resetting the password signs out every other
  device.
- Password-reset emails aren't sent yet. In development, the reset link is printed in
  the backend's terminal. To go live, connect an email service in
  `backend/services/mail.service.js`.
- Each reader claims `bookshelf.cv/<username>` from their shelf page, and anyone can
  open that link.

## Features and limits

- The flow follows the Figma file: landing → sign up → choose a look → checkout (for
  premium looks) → add books → your shelf.
- There are six shelf looks. Light, Gradient and Dark Grid are free. Digital Shelf,
  Spine Shelf and MacOS are premium (₹749 / ₹1,249 / ₹1,749 + 18% GST).
- The Goodreads import is real: the backend reads the reader's public "Read" and
  "Currently Reading" shelves. Photo recognition is still simulated with catalog titles.
- The shelf is saved on the server. The browser keeps a copy so pages render before the
  server answers.
- Routes: `/`, `/signup`, `/login`, `/forgot`, `/reset?token=…`, `/themes`,
  `/purchase?theme=<id>`, `/books`, `/shelf`, `/demo?theme=<id>`, and `/<username>` for
  public shelves. Direct links and refreshes work on all of them.

## Razorpay (test mode)

Premium looks are paid through Razorpay Checkout in test mode. Set
`VITE_RAZORPAY_KEY_ID` in `frontend/.env.local` to your `rzp_test_…` key id and restart
`npm run dev`. On Vercel, add the same variable to the project and redeploy.

Pay with Razorpay's test cards or the UPI id `success@razorpay`. The backend doesn't
create orders or verify payment signatures yet, so payments aren't verified and Razorpay
refunds them automatically. Live keys are refused until that endpoint exists.

## Deployment

- **Frontend**: Vercel, with `frontend/` as the root directory. `frontend/vercel.json`
  sends every non-API path to the app so deep links work.
- **Backend**: any Node 22 host with MySQL. Set the variables from `backend/.env.example`
  and `NODE_ENV=production`, and run `npm run db:setup` once.
- The frontend calls `/api` on its own domain. Once the backend is hosted, add a Vercel
  rewrite from `/api/:path*` to the backend's URL so the session cookie stays
  first-party. Until then, sign-in and saving work only locally.

## Structure

### `backend/` (MVC)

- `server.js`: starts the API and warns about missing environment variables.
- `app.js`: the Express app: JSON body parsing, the JSON-only guard, routes and the
  error handler.
- `routes/`: maps URLs to controllers, one file per resource (`auth`, `me`,
  `usernames`, `shelves`, `goodreads`). `index.js` mounts them all under `/api`.
- `controllers/`: request handlers. They read the request, call models and services,
  and answer with a view.
- `models/`: all SQL, one file per table (`user`, `shelf`, `passwordReset`).
- `views/`: the JSON shapes sent to the browser (`user.view.js`, `shelf.view.js`). Raw
  database rows never leave the server.
- `middleware/`: `auth` (loads the signed-in reader, guards private routes), `jsonOnly`
  (no-store + JSON-only writes) and `error` (404 and error responses).
- `services/`: outside systems: Google token checks, the Goodreads import, and email.
- `validators/`: input rules for email, password, shelf data and usernames.
- `utils/`: `HttpError`, password hashing and session cookies.
- `db/`: `schema.sql`, the connection pool and the `db:setup` script.
- `test/`: API tests (`api.test.js`) and unit tests (`unit.test.js`).

### `frontend/src/`

- `main.jsx`: React entry point.
- `App.jsx`: the route table. It maps each URL to its page and does nothing else.
- `app/`: app-wide state and navigation.
  - `useBookshelf.js`: the signed-in reader, their shelf, and the steps between pages.
  - `useBrowserRouter.js`: History API navigation for plain `<a href>` links.
  - `useRouteScroll.js`: scroll-to-top, `#section` landing and heading focus on page change.
  - `usePageTitle.js`: a browser-tab title for each page.
- `pages/`: one thin file per route. Each reads what it needs from `app` and renders a
  feature.
- `sections/landing/`: the landing page, one file per section, with all copy and Figma
  artwork in `content.jsx`.
- `features/`: the screens and their logic.
  - `auth/`: sign-up / sign-in form, password reset forms, Google popup and the nav
    sign-in link.
  - `themes/`: the look picker.
  - `books/`: the "Add your books" step. `AddBooks.jsx` holds the shared shelf edits,
    `panels/` has one panel per source (Goodreads, photo, library), and `BookEditor.jsx`
    handles manual entry.
  - `checkout/`: the checkout page and the Razorpay loader (test mode).
  - `shelf/`: the six shelf looks, scaled previews, the shelf page layout, the username
    claim and the book-opening reading card.
- `components/`: shared building blocks: the setup-flow shell, book cover and modal.
- `hooks/useReveal.js`: fade-in-on-scroll for landing sections.
- `data/`: book catalog, theme definitions and Figma asset paths.
- `lib/`: the API client (`api.js`), the browser shelf cache (`browserStorage.js`, with
  tests) and name helpers.
- `styles/`: `index.css` (fonts, Tailwind, globals), `motion.css` (all animations) and
  one stylesheet per screen.
