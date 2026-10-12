import { useState } from 'react';
import FlowShell from '../../components/FlowShell.jsx';

function useSubmit(action) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(...args) {
    setError('');
    setBusy(true);
    try {
      await action(...args);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  }
  return { error, setError, busy, submit };
}

// /forgot — ask for a reset link. The answer never reveals whether the email has an account.
export function ForgotPasswordForm({ onRequest }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { error, setError, busy, submit } = useSubmit(async value => {
    await onRequest(value);
    setSent(true);
  });

  function handleSubmit(event) {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter the email address you signed up with.');
      return;
    }
    submit(value);
  }

  return (
    <FlowShell navRight={<a className="fg-nav-link" href="/login">Sign in</a>}>
      <form className="fg-auth" onSubmit={handleSubmit} noValidate>
        <div className="fg-head">
          <h1>Reset your password</h1>
          <p>We’ll email you a link to choose a new one.</p>
        </div>
        {sent ? (
          <p role="status" className="fg-auth__note">
            If <b>{email.trim()}</b> has a Bookshelf.cv account, a reset link is on its way. It works once and expires in an hour.
          </p>
        ) : (
          <>
            <div>
              <label className="lbl" htmlFor="forgot-email">Email address</label>
              <input id="forgot-email" className="fg-input" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
            </div>
            {error && <p role="alert" className="err">{error}</p>}
            <button type="submit" className="fg-cta" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
          </>
        )}
        <div className="acc"><span>Remembered it?</span><a href="/login">Back to sign in</a></div>
      </form>
    </FlowShell>
  );
}

// /reset?token=… — choose a new password from the emailed link.
export function ResetPasswordForm({ token, onReset }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { error, setError, busy, submit } = useSubmit(() => onReset(token, password));

  function handleSubmit(event) {
    event.preventDefault();
    if (password.length < 8) return setError('Choose a password with at least 8 characters.');
    if (password !== confirm) return setError('The two passwords don’t match.');
    return submit();
  }

  return (
    <FlowShell navRight={<a className="fg-nav-link" href="/login">Sign in</a>}>
      <form className="fg-auth" onSubmit={handleSubmit} noValidate>
        <div className="fg-head">
          <h1>Choose a new password</h1>
          <p>You’ll be signed in, and signed out everywhere else.</p>
        </div>
        {!token ? (
          <p role="alert" className="err">This reset link is incomplete. <a href="/forgot">Ask for a new one.</a></p>
        ) : (
          <>
            <div className="fields">
              <div>
                <label className="lbl" htmlFor="reset-password">New password</label>
                <input id="reset-password" className="fg-input" type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Minimum 8 characters" />
              </div>
              <div>
                <label className="lbl" htmlFor="reset-confirm">Repeat new password</label>
                <input id="reset-confirm" className="fg-input" type="password" autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} />
              </div>
            </div>
            {error && <p role="alert" className="err">{error} {error.includes('expired') && <a href="/forgot">Ask for a new link.</a>}</p>}
            <button type="submit" className="fg-cta" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
          </>
        )}
      </form>
    </FlowShell>
  );
}
