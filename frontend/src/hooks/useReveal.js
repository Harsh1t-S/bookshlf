import { useLayoutEffect } from 'react';

// Fades [data-reveal] elements in as they scroll into view. Nothing is hidden
// when the visitor prefers reduced motion or the browser lacks IntersectionObserver.
export default function useReveal() {
  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = document.documentElement;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(element => observer.observe(element));
    root.classList.add('reveal-on');
    return () => {
      observer.disconnect();
      root.classList.remove('reveal-on');
    };
  }, []);
}
