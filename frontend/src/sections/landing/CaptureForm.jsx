import { useState } from 'react';

// Email / question capture used by the roadmap and contact panels (not sent anywhere yet).
export default function CaptureForm({ placeholder, label }) {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <form
      className="form"
      onSubmit={event => {
        event.preventDefault();
        if (!value.trim()) return;
        setSent(true);
        setValue('');
      }}
    >
      <input aria-label={label} placeholder={placeholder} value={value} onChange={event => { setValue(event.target.value); setSent(false); }} />
      <button type="submit">{sent ? 'Thanks!' : 'Submit'}</button>
    </form>
  );
}
