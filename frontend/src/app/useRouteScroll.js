import { useEffect } from 'react';

const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

// On every page change: land on a #section if the URL names one, otherwise start
// at the top and move focus to the page heading for screen-reader users.
export default function useRouteScroll(pathname) {
  useEffect(() => {
    const anchor = window.location.hash && document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (anchor) {
      // Images and fonts above the section keep shifting it while they load, so stay on the
      // section through layout changes until the reader scrolls themselves (or 3 seconds pass).
      const land = () => anchor.scrollIntoView({ behavior: 'instant', block: 'start' });
      const follow = new ResizeObserver(land);
      const stop = () => {
        follow.disconnect();
        window.clearTimeout(timer);
        USER_SCROLL_EVENTS.forEach(type => window.removeEventListener(type, stop));
      };
      const timer = window.setTimeout(stop, 3000);
      land();
      follow.observe(document.body);
      USER_SCROLL_EVENTS.forEach(type => window.addEventListener(type, stop, { passive: true }));
      return stop;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    const heading = document.querySelector('main h1, h1, main') ?? document.body;
    heading.setAttribute?.('tabindex', '-1');
    heading.focus?.({ preventScroll: true });
    return undefined;
  }, [pathname]);
}
