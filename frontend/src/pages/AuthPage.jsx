import AuthForm from '../features/auth/AuthForm.jsx';

// /signup and /login.
export default function AuthPage({ app }) {
  return (
    <AuthForm
      key={app.pathname}
      mode={app.pathname === '/login' ? 'login' : 'signup'}
      onModeChange={mode => app.navigate(mode === 'login' ? '/login' : '/signup')}
      onContinue={app.signIn}
    />
  );
}
