// Delivers password-reset links. No email service is connected yet, so during
// development the link is printed in the dev server's terminal instead.
// To go live, send the email here (e.g. with Resend or SMTP) using the same arguments.
export async function sendPasswordReset({ email, link }) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(`Password reset requested for ${email}, but no email service is configured.`);
    return;
  }
  console.info(`\n[dev] Password reset link for ${email}:\n${link}\n`);
}
