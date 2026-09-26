import { useEffect, useRef } from 'react';

const focusableSelector = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function Modal({ onClose, labelledBy, children, className = '' }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    const firstFocusable = dialog?.querySelector(focusableSelector);
    (firstFocusable || dialog)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeRef.current?.();
      return;
    }

    if (event.key !== 'Tab') return;
    const items = Array.from(dialogRef.current?.querySelectorAll(focusableSelector) || []);
    if (!items.length) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.(); }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} onKeyDown={handleKeyDown} className={`max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain ${className}`}>
        {children}
      </section>
    </div>
  );
}
