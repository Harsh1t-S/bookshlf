import usePageTitle from '../app/usePageTitle.js';
import FlowShell from '../components/FlowShell.jsx';
import LegalFooter from '../components/LegalFooter.jsx';
import AuthNavLink from '../features/auth/AuthNavLink.jsx';
import { LAST_UPDATED, policies } from '../features/legal/policies.jsx';

// /privacy, /terms and /refunds.
export default function LegalPage({ app }) {
  const { title, intro, sections } = policies[app.pathname];
  usePageTitle(title);
  return (
    <FlowShell navRight={<AuthNavLink app={app} />} footer={<footer><LegalFooter /></footer>}>
      <article className="legal">
        <header className="fg-head">
          <h1>{title}</h1>
          <p>Last updated {LAST_UPDATED}</p>
        </header>
        <p className="legal__intro">{intro}</p>
        {sections.map(([heading, body], index) => (
          <section key={heading}>
            <h2>{index + 1}. {heading}</h2>
            {body}
          </section>
        ))}
      </article>
    </FlowShell>
  );
}
