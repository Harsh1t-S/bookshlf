import { useEffect, useRef, useState } from 'react';
import { AUTH_BASE, asset } from '../../data/figmaAssets.js';
import FlowShell from '../../components/FlowShell.jsx';
import { preloadGoogle } from './google.js';

// Sign-up and sign-in screen (Figma "Auth"). onSubmit and onGoogle are async and throw
// an Error whose message is shown to the reader.
export default function AuthForm({ mode = 'signup', onModeChange, onSubmit, onGoogle }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(''); // 'form' | 'google' while a request is running
  const emailInput = useRef(null);
  const passwordInput = useRef(null);
  const isSignup = mode === 'signup';

  useEffect(() => {
    preloadGoogle().catch(() => {});
  }, []);

  async function run(kind, action) {
    setError('');
    setBusy(kind);
    try {
      await action();
    } catch (problem) {
      setError(problem.message);
      setBusy('');
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError(normalizedEmail ? 'Enter a valid email address, such as name@example.com.' : 'Enter your email address to continue.');
      emailInput.current?.focus();
      return;
    }
    if (password.length < 8) {
      setError(isSignup ? 'Choose a password with at least 8 characters.' : 'Enter your password (at least 8 characters).');
      passwordInput.current?.focus();
      return;
    }
    run('form', () => onSubmit({ email: normalizedEmail, password }));
  }

  function switchMode() {
    setPassword('');
    setError('');
    onModeChange?.(isSignup ? 'login' : 'signup');
  }

  return (
    <FlowShell navRight={<a className="fg-nav-link" href={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign in' : 'Sign up'}</a>}>
      <form className="fg-auth" onSubmit={handleSubmit} noValidate aria-busy={Boolean(busy)}>
        <div className="fg-head">
          <h1>{isSignup ? 'Create your account' : 'Sign in'}</h1>
          <p>{isSignup ? 'Set up your virtual bookshelf in minutes' : 'Welcome back to your virtual bookshelf'}</p>
        </div>

        <button type="button" className="g" disabled={Boolean(busy)} onClick={() => run('google', onGoogle)}>
          <img src={asset(AUTH_BASE, '147c6.svg')} alt="" />
          <span>{busy === 'google' ? 'Waiting for Google…' : 'Continue with Google'}</span>
        </button>

        <div className="or" aria-hidden="true"><span>or</span></div>

        <div className="fields">
          <div>
            <label className="lbl" htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              ref={emailInput}
              className="fg-input"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-describedby={error ? 'auth-error' : undefined}
            />
          </div>
          <div>
            <label className="lbl" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              ref={passwordInput}
              className="fg-input"
              name="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={8}
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              aria-describedby={error ? 'auth-error' : undefined}
            />
            {!isSignup && <a className="fg-auth__forgot" href="/forgot">Forgot password?</a>}
          </div>
        </div>

        {error && <p id="auth-error" role="alert" className="err">{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <button type="submit" className="fg-cta" disabled={Boolean(busy)}>
            {busy === 'form' ? 'Please wait…' : isSignup ? 'Continue Bookshelf Setup' : 'Sign in'}
          </button>
          <div className="acc">
            <span>{isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
            <button type="button" onClick={switchMode}>{isSignup ? 'Sign in' : 'Create account'}</button>
          </div>
        </div>
      </form>
    </FlowShell>
  );
}
