# Bookshelf

React JavaScript application using Vite and Tailwind CSS v4.

## Development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

## Structure

- `src/main.jsx`: React entry point.
- `src/App.jsx`: screen flow and in-session state.
- `src/pages/`: landing, account, and bookshelf preview screens.
- `src/features/themes/`: theme picker and CSS shelf previews.
- `src/features/books/`: book import choices, local library, collection, and editor.
- `src/shared/`: site header and book illustrations.
- `src/styles/index.css`: Tailwind import and global resets.
- `vite.config.js`: React and Tailwind build integration.

The UI is a front-end preview. Account creation, external Goodreads import,
paid themes, and publishing do not connect to a backend. Books added during a
session are held in browser memory.
