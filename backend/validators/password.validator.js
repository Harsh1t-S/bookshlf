// Returns a reason the password can't be used, or '' if it is fine.
export function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 8) return 'Use a password with at least 8 characters.';
  if (password.length > 200) return 'Use a password under 200 characters.';
  return '';
}
