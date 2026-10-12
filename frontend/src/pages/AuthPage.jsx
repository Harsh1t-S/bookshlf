import usePageTitle from '../app/usePageTitle.js';
import AuthForm from '../features/auth/AuthForm.jsx';

// /signup and /login.
export default function AuthPage({ app }) {
  const isLogin = app.pathname === '/login';
  usePageTitle(isLogin ? 'Sign in' : 'Create your account');
  return (
    <AuthForm
      key={app.pathname}
      mode={isLogin ? 'login' : 'signup'}
      onModeChange={mode => app.navigate(mode === 'login' ? '/login' : '/signup')}
      onSubmit={isLogin ? app.logIn : app.signUp}
      onGoogle={app.continueWithGoogle}
    />
  );
}
