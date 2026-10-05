// "Sign out" for signed-in readers, "Sign in" for everyone else.
export default function AuthNavLink({ app }) {
  return app.user
    ? <button type="button" className="fg-nav-link" onClick={app.signOut}>Sign out</button>
    : <a className="fg-nav-link" href="/login">Sign in</a>;
}
