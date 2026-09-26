import { useState } from 'react';

export default function AuthPage({ onContinue, mode = 'signup', onModeChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleMessage, setGoogleMessage] = useState(false);

  const isSignup = mode === 'signup' || mode === 'sign-up';
  const title = isSignup ? 'Create your account' : 'Sign in';

  function handleSubmit(event) {
    event.preventDefault();
    onContinue?.({ email });
  }

  return (
    <section className="mx-auto w-full max-w-[540px] px-5 pb-10 pt-16 sm:px-0 sm:pt-[108px]">
      <header className="mb-8 text-center">
        <h1 className="font-heading text-[32px] leading-tight text-[#25221f] sm:text-[40px]">
          {title}
        </h1>
        <p className="mt-3 text-base leading-6 text-[#77736f]">
          {isSignup
            ? 'Set up your virtual bookshelf in minutes'
            : 'Welcome back to your virtual bookshelf'}
        </p>
      </header>

      <button
        type="button"
        onClick={() => setGoogleMessage(true)}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-[10px] border border-[#333] bg-white text-[15px] font-medium text-[#292521] transition hover:bg-[#fffdfa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e13a00]"
      >
        <span aria-hidden="true" className="text-[19px] font-bold leading-none">
          <span className="text-[#4285f4]">G</span>
        </span>
        Continue with Google
      </button>
      {googleMessage && (
        <p role="status" className="mt-3 text-center text-sm leading-5 text-[#77736f]">
          Google sign-in is not connected in this preview. Use the form below to explore the setup.
        </p>
      )}

      <div className="my-7 flex items-center gap-4 text-sm text-[#88837e]" aria-hidden="true">
        <span className="h-px flex-1 bg-[#dedbd7]" />
        <span>or</span>
        <span className="h-px flex-1 bg-[#dedbd7]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="auth-email" className="mb-2 block text-sm font-medium text-[#312d29]">
            Email address
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-[52px] w-full rounded-[10px] border border-[#bdb8b1] bg-[#fffdf9] px-4 text-base text-[#292521] shadow-[0_2px_5px_rgba(36,28,20,0.05)] outline-none transition placeholder:text-[#a29d97] focus:border-[#e13a00] focus:ring-2 focus:ring-[#e13a00]/15"
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="mb-2 block text-sm font-medium text-[#312d29]">
            Password
          </label>
          <div className="relative">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              className="h-[52px] w-full rounded-[10px] border border-[#bdb8b1] bg-[#fffdf9] px-4 pr-14 text-base text-[#292521] shadow-[0_2px_5px_rgba(36,28,20,0.05)] outline-none transition placeholder:text-[#a29d97] focus:border-[#e13a00] focus:ring-2 focus:ring-[#e13a00]/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-3 grid place-items-center rounded-lg px-2 text-[#77736f] hover:text-[#292521] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#df3900]"
            >
              {showPassword ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7" strokeLinecap="round" />
                  <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.5 5 9 7-.2.8-1 2.1-2.3 3.4M6.2 6.3C3.8 7.8 2.3 10.3 2 12c.5 2 3.8 7 10 7 1 0 2-.2 2.8-.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <p className="-mt-1 text-center text-xs text-[#827d77]">
          Preview mode — no account is created.
        </p>
        <button
          type="submit"
          className="flex h-14 w-full items-center justify-center rounded-[14px] bg-[#e13a00] px-5 text-base font-semibold text-white transition hover:bg-[#c93200] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f2a00] active:translate-y-px"
        >
          {isSignup ? 'Continue Bookshelf Setup' : 'Sign in'}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#6f6a65]">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => onModeChange?.(isSignup ? 'signin' : 'signup')}
          className="font-semibold text-[#c93400] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df3900]"
        >
          {isSignup ? 'Sign in' : 'Create account'}
        </button>
      </p>
    </section>
  );
}
