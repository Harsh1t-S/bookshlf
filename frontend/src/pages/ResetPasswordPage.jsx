import usePageTitle from '../app/usePageTitle.js';
import { ResetPasswordForm } from '../features/auth/PasswordResetForms.jsx';

// /reset?token=… — the link from the reset email.
export default function ResetPasswordPage({ app }) {
  usePageTitle('Choose a new password');
  return <ResetPasswordForm token={app.searchParam('token') ?? ''} onReset={app.resetPassword} />;
}
