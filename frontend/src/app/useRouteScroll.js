import { useEffect } from 'react';

// On every page change: land on a #section if the URL names one, otherwise start
// at the top and move focus to the page heading for screen-reader users.
export default function useRouteScroll(pathname) {
  useEffect(() => {
    const anchor = window.location.hash && document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (anchor) {
      // Images and fonts above the section shift it while loading, so land again once they settle.
      const land = () => anchor.scrollIntoView({ behavior: 'instant', block: 'start' });
      land();
      document.fonts?.ready.then(land);
      if (document.readyState !== 'complete') window.addEventListener('load', land, { once: true });
      return () => window.removeEventListener('load', land);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    const heading = document.querySelector('main h1, h1, main') ?? document.body;
    heading.setAttribute?.('tabindex', '-1');
    heading.focus?.({ preventScroll: true });
    return undefined;
  }, [pathname]);
}
