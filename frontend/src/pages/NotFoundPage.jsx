import FlowShell from '../components/FlowShell.jsx';
import AuthNavLink from '../features/auth/AuthNavLink.jsx';
import usePageTitle from '../app/usePageTitle.js';

export default function NotFoundPage({ app }) {
  usePageTitle('Page not found');
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
