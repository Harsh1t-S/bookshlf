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

- Browse a local catalog of twelve books, add books manually, or load sample
  books. Goodreads sync and image recognition are unavailable in this preview.
- Choose from the included shelf themes and preview the resulting bookshelf.
- Browser routes support direct links and refresh: `/`, `/login`, `/signup`,
  `/themes`, `/books`, `/shelf`, and `/demo`.
- The landing page's demo opens a sample shelf without changing the books in
  the current draft.
- The preview profile and bookshelf draft are saved in local storage for this
  browser. Signing out clears the local profile and keeps the shelf draft.
- Login and signup create only a local preview identity. There is no server
  authentication, and passwords or tokens are never stored. Google sign-in,
  payments, and publishing are not connected to a backend.

## Structure

- `frontend/src/main.jsx`: React entry point.
- `frontend/src/App.jsx`: route handling, local profile, and bookshelf flow.
- `frontend/src/hooks/useBrowserRouter.js`: native History API navigation.
- `frontend/src/lib/browserStorage.js`: validated local profile and draft storage.
- `frontend/src/data/`: local book catalog and theme definitions.
- `frontend/src/pages/`: landing, auth preview, and bookshelf preview screens.
- `frontend/src/features/themes/`: theme picker and previews.
- `frontend/src/features/books/`: local catalog, add/edit flow, and collection.
- `frontend/src/shared/`: site header, book cover, and decorative illustrations.
- `frontend/src/styles/index.css`: font imports, Tailwind theme, and global styles.
- `frontend/vite.config.js`: React and Tailwind build integration.
