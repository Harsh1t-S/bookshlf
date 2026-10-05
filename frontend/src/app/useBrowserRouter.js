import { useCallback, useEffect, useState } from 'react';

function currentPath() {
  return window.location.pathname || '/';
}

export default function useBrowserRouter() {
  const [pathname, setPathname] = useState(currentPath);

  useEffect(() => {
    function syncPath() {
      setPathname(currentPath());
    }

    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  const navigate = useCallback((path, { replace = false } = {}) => {
    if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return;
    if (path === currentPath()) return;
    window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    setPathname(currentPath());
  }, []);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest?.('a[href]');
      if (!link || link.target || link.hasAttribute('target') || link.hasAttribute('download')) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.hash) return;

      event.preventDefault();
      navigate(`${destination.pathname}${destination.search}${destination.hash}`);
    }

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [navigate]);

  return { pathname, navigate };
}
