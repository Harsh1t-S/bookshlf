// Progress (spinner) or success banner shown while and after books are imported.
export default function ImportStatus({ tone, children }) {
  return (
    <div className="fg-alert" data-tone={tone} role="status">
      {tone === 'success' ? <span aria-hidden="true">✅</span> : <i className="fg-alert__spinner" aria-hidden="true" />}
      <span>{children}</span>
    </div>
  );
}
