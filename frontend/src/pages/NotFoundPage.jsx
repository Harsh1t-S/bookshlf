import FlowShell from '../components/FlowShell.jsx';
import AuthNavLink from '../features/auth/AuthNavLink.jsx';

export default function NotFoundPage({ app }) {
  return (
    <FlowShell navRight={<AuthNavLink app={app} />}>
      <div className="fg-themes fg-head">
        <h1>Page not found</h1>
        <p>That Bookshelf.cv page doesn’t exist.</p>
        <a className="fg-nav-link" href="/" style={{ marginTop: 16 }}>Return home</a>
      </div>
    </FlowShell>
  );
}
