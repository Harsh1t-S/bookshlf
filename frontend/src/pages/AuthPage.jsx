import { useRef, useState } from 'react';
import { AUTH_BASE, asset } from '../data/figmaAssets.js';
import FlowShell from '../shared/FlowShell.jsx';

export default function AuthPage({ onContinue, mode = 'signup', onModeChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleMessage, setGoogleMessage] = useState('');
  const [error, setError] = useState('');
  const emailInput = useRef(null);
  const passwordInput = useRef(null);
  const isSignup = mode === 'signup';

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const localPart = normalizedEmail.split('@')[0] ?? '';

    if (!normalizedEmail) {
      setError('Enter your email address to continue.');
      emailInput.current?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address, such as name@example.com.');
      emailInput.current?.focus();
      return;
    }
    if (password.length < 8) {
      setError('Enter a password with at least 8 characters. Your password will not be saved.');
      passwordInput.current?.focus();
      return;
    }

    setError('');
    setPassword('');
    onContinue?.({
      email: normalizedEmail,
      name: localPart.split(/[._-]+/).filter(Boolean)
        .map(word => word.charAt(0).toLocaleUpperCase() + word.slice(1)).join(' ') || normalizedEmail,
    });
  }

  function switchMode() {
    setPassword('');
    setError('');
    setGoogleMessage('');
    onModeChange?.(isSignup ? 'login' : 'signup');
  }

  return (
    <FlowShell navRight={<a className="fg-nav-link" href={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign in' : 'Sign up'}</a>}>
      <form className="fg-auth" onSubmit={handleSubmit} noValidate>
        <div className="fg-head">
          <h1>{isSignup ? 'Create your account' : 'Sign in'}</h1>
          <p>{isSignup ? 'Set up your virtual bookshelf in minutes' : 'Welcome back to your virtual bookshelf'}</p>
        </div>

        <button
          type="button"
          className="g"
          onClick={() => setGoogleMessage('Google sign-in is not connected in this preview. Use the form below to continue.')}
        >
          <img src={asset(AUTH_BASE, '147c6.svg')} alt="" />
          <span>Continue with Google</span>
        </button>
        {googleMessage && <p role="status" className="status">{googleMessage}</p>}

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
          </div>
        </div>

        {error && <p id="auth-error" role="alert" className="err">{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <button type="submit" className="fg-cta">{isSignup ? 'Continue Bookshelf Setup' : 'Sign in'}</button>
          <div className="acc">
            <span>{isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
            <button type="button" onClick={switchMode}>{isSignup ? 'Sign in' : 'Create account'}</button>
          </div>
        </div>
      </form>
    </FlowShell>
  );
}
