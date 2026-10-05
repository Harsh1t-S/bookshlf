import { useEffect } from 'react';

const SITE = 'Bookshelf.cv';

// Gives each page its own browser-tab title ("Choose your look · Bookshelf.cv").
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} — Make your shelf your own`;
  }, [title]);
}
