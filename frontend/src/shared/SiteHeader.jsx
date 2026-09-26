import { useEffect, useRef, useState } from 'react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Themes', href: '/themes' },
  { label: 'Add books', href: '/books' },
  { label: 'My shelf', href: '/shelf' },
];

function normalizePath(path = '/') {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

export default function SiteHeader({
  title = 'Bookshelf.cv',
  currentPath = typeof window === 'undefined' ? '/' : window.location.pathname,
  user,
  onSignOut,
  navigate,
  action,
  onAction,
  onHome,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const activePath = normalizePath(currentPath);

  useEffect(() => setMenuOpen(false), [activePath]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  function handleAnchor(event, href) {
    const plainLeftClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    const link = event.currentTarget;
    if (!plainLeftClick || link.target || link.hasAttribute('download')) return;

    if (!(href === '/' && onHome) && !navigate) return;

    event.preventDefault();
    setMenuOpen(false);
    if (href === '/' && onHome) onHome();
    else navigate?.(href);
  }

  function renderNav(className = '') {
    return navItems.map(item => {
      const active = activePath === item.href || (item.href !== '/' && activePath.startsWith(`${item.href}/`));
      return (
        <a
          key={item.href}
          href={item.href}
          onClick={event => handleAnchor(event, item.href)}
          aria-current={active ? 'page' : undefined}
          className={`rounded-md px-2.5 py-2 text-sm font-medium text-[#5d5044] transition-colors hover:bg-[#efe8dc] hover:text-[#34281e] active:bg-[#e7ddcf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df3900] ${active ? 'bg-[#efe8dc] text-[#34281e]' : ''} ${className}`}
        >
          {item.label}
        </a>
      );
    });
  }

  const legacyAction = action && !/^(sign\s?in|login|create account)$/i.test(action) ? (
    <button type="button" onClick={onAction} className="rounded-md px-2.5 py-2 text-sm font-medium text-[#734021] transition-colors hover:bg-[#efe8dc] active:bg-[#e7ddcf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df3900]">{action}</button>
  ) : null;
  const userLabel = typeof user === 'string' ? user : user?.name || user?.displayName || user?.username || user?.email || 'Signed in';

  return (
    <header className="relative z-20 h-[70px] border-b border-[#e8e0d4] bg-[#faf7f2]/95 px-4 sm:px-8">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-3">
        <a href="/" onClick={event => handleAnchor(event, '/')} className="shrink-0 rounded-sm font-serif text-[21px] italic tracking-[-0.03em] text-[#362820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df3900]">{title}</a>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">{renderNav()}</nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="max-w-[140px] truncate px-2 text-xs text-[#6f6256]">{userLabel}</span>
              <button type="button" onClick={onSignOut} className="rounded-md px-2.5 py-2 text-sm font-medium text-[#734021] transition-colors hover:bg-[#efe8dc] active:bg-[#e7ddcf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df3900]">Sign out</button>
              {legacyAction}
            </>
          ) : (
            <>
              <a href="/login" onClick={event => handleAnchor(event, '/login')} className="rounded-md px-2.5 py-2 text-sm font-medium text-[#734021] transition-colors hover:bg-[#efe8dc] active:bg-[#e7ddcf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df3900]">Sign in</a>
              <a href="/signup" onClick={event => handleAnchor(event, '/signup')} className="rounded-md bg-[#e43d00] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c93200] active:bg-[#ae2d05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df3900]">Create account</a>
              {legacyAction}
            </>
          )}
        </div>

        <button ref={menuButtonRef} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(open => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#4c4035] transition-colors hover:bg-[#efe8dc] active:bg-[#e7ddcf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df3900] md:hidden">
          <span aria-hidden="true" className="text-xl leading-none">{menuOpen ? '×' : '☰'}</span>
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-navigation" className="absolute inset-x-0 top-[69px] z-30 border-b border-[#e8e0d4] bg-[#faf7f2] px-4 pb-4 pt-2 shadow-lg md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">{renderNav('w-full')}</nav>
          <div className="mt-2 border-t border-[#e8e0d4] pt-2">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-xs text-[#6f6256]">{userLabel}</span>
                <button type="button" onClick={() => { setMenuOpen(false); onSignOut?.(); }} className="rounded-md px-2.5 py-2 text-sm font-medium text-[#734021] hover:bg-[#efe8dc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#df3900]">Sign out</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <a href="/login" onClick={event => handleAnchor(event, '/login')} className="flex-1 rounded-md px-2.5 py-2 text-center text-sm font-medium text-[#734021] hover:bg-[#efe8dc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#df3900]">Sign in</a>
                <a href="/signup" onClick={event => handleAnchor(event, '/signup')} className="flex-1 rounded-md bg-[#e43d00] px-2.5 py-2 text-center text-sm font-semibold text-white hover:bg-[#c93200] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#df3900]">Create account</a>
              </div>
            )}
            {legacyAction && <div className="mt-1">{legacyAction}</div>}
          </div>
        </div>
      )}
    </header>
  );
}
