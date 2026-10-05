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

- `frontend/src/main.jsx`: React entry point.
- `frontend/src/App.jsx`: route handling, local profile, and bookshelf flow.
- `frontend/src/hooks/useBrowserRouter.js`: native History API navigation.
- `frontend/src/lib/browserStorage.js`: validated local profile and draft storage.
- `frontend/src/data/`: local book catalog and theme definitions.
- `frontend/src/pages/`: landing, auth, checkout and shelf screens.
- `frontend/src/features/themes/`: theme picker.
- `frontend/src/features/shelf/`: the six shelf looks, scaled previews and book details.
- `frontend/src/lib/razorpay.js`: Razorpay Checkout loader (test mode).
- `frontend/src/features/books/`: local catalog, add/edit flow, and collection.
- `frontend/src/shared/`: page shell with nav and corner books, book cover, modal.
- `frontend/src/styles/index.css`: font imports, Tailwind theme, and global styles.
- `frontend/vite.config.js`: React and Tailwind build integration.
