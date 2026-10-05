# Bookshelf.cv

Bookshelf.cv is a React app for choosing a bookshelf theme, adding books, and
previewing a personal shelf. It uses Vite, Tailwind CSS v4, and locally bundled
Syne and Lora fonts.

## Development

Run commands from the `frontend/` directory:

```sh
cd frontend
npm install
npm run dev
```

## Production build

From `frontend/`:

```sh
npm run build
npm test
npm run preview
```

## Features and limits

- Flow from the Figma file: landing → sign up → choose a look → (checkout for
  premium looks) → add books → your shelf.
- Six shelf looks: Light, Gradient and Dark Grid (free), Digital Shelf, Spine
  Shelf and MacOS (premium, ₹749 / ₹1,249 / ₹1,749 + 18% GST).
- Add books by Goodreads, shelf photo or the local catalog, or manually.
  Goodreads sync and photo recognition are simulated with catalog titles.
- Browser routes support direct links and refresh: `/`, `/login`, `/signup`,
  `/themes`, `/purchase?theme=<id>`, `/books`, `/shelf`, and `/demo?theme=<id>`.
- The preview profile, shelf draft and purchased looks are saved in local
  storage for this browser. Login and signup create only a local preview
  identity; passwords are never stored. Google sign-in is not connected.

## Razorpay (test mode)

Premium looks are paid through Razorpay Checkout in test mode. Copy
`frontend/.env.example` to `frontend/.env.local`, set `VITE_RAZORPAY_KEY_ID` to
your `rzp_test_…` key id, and restart `npm run dev`. On Vercel, add the same
variable to the project's environment variables and redeploy.

Pay with Razorpay's test cards or the UPI id `success@razorpay`. There is no
server yet, so payments are created without an order and are not signature
verified; Razorpay refunds such payments automatically. Live keys are refused
until an order-creation and verification endpoint is added.

## Structure

All source lives in `frontend/src/`:

- `main.jsx`: React entry point.
- `App.jsx`: the route table — maps each URL to its page, nothing else.
- `app/`: app-wide state and navigation.
  - `useBookshelf.js`: signed-in reader, the shelf being built (books, look, purchased looks) and the steps between pages.
  - `useBrowserRouter.js`: History API navigation for plain `<a href>` links.
  - `useRouteScroll.js`: scroll-to-top, `#section` landing and heading focus on page change.
- `pages/`: one thin file per route (`LandingPage`, `AuthPage`, `ThemesPage`, `BooksPage`, `CheckoutPage`, `ShelfPage`, `DemoPage`, `NotFoundPage`). Each reads what it needs from `app` and renders a feature.
- `sections/landing/`: the landing page, one file per section, with all copy and Figma artwork in `content.jsx`.
- `features/`: the actual screens and their logic.
  - `auth/`: sign-up / sign-in form and the nav sign-in link.
  - `themes/`: the look picker.
  - `books/`: Goodreads, photo and library import, manual book editor.
  - `checkout/`: dark checkout page and the Razorpay loader (test mode).
  - `shelf/`: the six shelf looks, scaled previews, shelf page layout and the book-opening reading card.
- `components/`: shared building blocks — setup-flow shell with nav and corner books, book cover, modal.
- `hooks/useReveal.js`: fade-in-on-scroll for landing sections.
- `data/`: book catalog, theme definitions and Figma asset paths.
- `lib/browserStorage.js`: validated local profile and draft storage (with tests).
- `styles/`: `index.css` (fonts, Tailwind, globals), `motion.css` (all animations), and one stylesheet per screen.
- `frontend/vite.config.js`: React and Tailwind build integration.
