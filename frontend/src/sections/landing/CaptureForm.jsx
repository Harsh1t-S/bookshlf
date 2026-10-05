import { useRef, useState } from 'react';

// Email / question capture used by the roadmap and contact panels (not sent anywhere yet).
export default function CaptureForm({ placeholder, label, emptyMessage }) {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);
  const input = useRef(null);

  function submit(event) {
    event.preventDefault();
    if (!value.trim()) {
      // Blank or spaces only: show the browser's own field message instead of doing nothing.
      input.current.setCustomValidity(emptyMessage);
      input.current.reportValidity();
      return;
    }
    setSent(true);
    setValue('');
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <input
        ref={input}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={event => { event.target.setCustomValidity(''); setValue(event.target.value); setSent(false); }}
      />
      <button type="submit">{sent ? 'Thanks!' : 'Submit'}</button>
    </form>
  );
}
