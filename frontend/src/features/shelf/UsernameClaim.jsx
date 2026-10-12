import { useEffect, useRef, useState } from 'react';

const CHECK_DELAY = 350;

// "Claim your link" box on the owner's shelf: pick bookshelf.cv/<username>, checked live.
export default function UsernameClaim({ initial = '', current = null, onCheck, onClaim, onDone, onCancel }) {
  const [value, setValue] = useState(initial);
  const [check, setCheck] = useState({ state: 'idle', message: '' });
  const [saving, setSaving] = useState(false);
  const latest = useRef(0);
  const name = value.trim().toLowerCase();

  useEffect(() => {
    const request = ++latest.current;
    if (!name || name === current) {
      setCheck({ state: 'idle', message: '' });
      return undefined;
    }
    setCheck({ state: 'checking', message: 'Checking…' });
    const timer = window.setTimeout(() => {
      onCheck(name)
        .then(result => {
          if (request !== latest.current) return;
          setCheck(result.available ? { state: 'ok', message: 'Available' } : { state: 'bad', message: result.problem });
        })
        .catch(error => request === latest.current && setCheck({ state: 'bad', message: error.message }));
    }, CHECK_DELAY);
    return () => window.clearTimeout(timer);
  }, [name, current, onCheck]);

  async function submit(event) {
    event.preventDefault();
    if (check.state !== 'ok') return;
    setSaving(true);
    try {
      await onClaim(name);
      onDone?.();
    } catch (error) {
      setCheck({ state: 'bad', message: error.message });
      setSaving(false);
    }
  }

  return (
    <form className="sp-claim" onSubmit={submit} noValidate>
      <label htmlFor="claim-username">{current ? 'Change your link' : 'Claim your link to share your shelf'}</label>
      <div className="sp-link">
        <i aria-hidden="true" data-state={check.state} />
        <span className="sp-claim__host">{window.location.host}/</span>
        <input
          id="claim-username"
          value={value}
          onChange={event => setValue(event.target.value)}
          maxLength={30}
          autoComplete="off"
          spellCheck="false"
          aria-describedby="claim-status"
          aria-invalid={check.state === 'bad'}
        />
        <button type="submit" disabled={check.state !== 'ok' || saving}>{saving ? 'Saving…' : current ? 'Save' : 'Claim'}</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
      <p id="claim-status" className="sp-claim__status" data-state={check.state} aria-live="polite">{check.message}</p>
    </form>
  );
}
