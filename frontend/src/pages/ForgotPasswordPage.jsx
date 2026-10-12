import usePageTitle from '../app/usePageTitle.js';
import { ForgotPasswordForm } from '../features/auth/PasswordResetForms.jsx';

// /forgot — request a password-reset email.
export default function ForgotPasswordPage({ app }) {
  usePageTitle('Reset your password');
  return <ForgotPasswordForm onRequest={app.requestPasswordReset} />;
}
