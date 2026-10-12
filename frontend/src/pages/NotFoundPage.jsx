import usePageTitle from '../app/usePageTitle.js';
import FlowShell from '../components/FlowShell.jsx';
import AuthNavLink from '../features/auth/AuthNavLink.jsx';

export default function NotFoundPage({ app, title = 'Page not found', message = 'That Bookshelf.cv page doesn’t exist.' }) {
  usePageTitle(title);
  return (
    <FlowShell navRight={<AuthNavLink app={app} />}>
      <div className="fg-themes fg-head">
        <h1>{title}</h1>
        <p>{message}</p>
        <a className="fg-nav-link" href="/" style={{ marginTop: 16 }}>Return home</a>
      </div>
    </FlowShell>
  );
}
