import AuthForm from '../features/auth/AuthForm.jsx';
import usePageTitle from '../app/usePageTitle.js';

// /signup and /login.
export default function AuthPage({ app }) {
  usePageTitle(app.pathname === '/login' ? 'Sign in' : 'Create your account');
  return (
    <AuthForm
      key={app.pathname}
      mode={app.pathname === '/login' ? 'login' : 'signup'}
      onModeChange={mode => app.navigate(mode === 'login' ? '/login' : '/signup')}
      onContinue={app.signIn}
    />
  );
}
