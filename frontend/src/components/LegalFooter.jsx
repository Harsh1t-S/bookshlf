import { legalLinks } from '../features/legal/policies.jsx';
import '../styles/legal.css';

// Policy links and studio credit, shared by the landing page and the legal pages.
export default function LegalFooter() {
  return (
    <div className="legal-foot">
      <nav aria-label="Legal">
        {legalLinks.map(({ path, title }) => <a key={path} href={path}>{title}</a>)}
      </nav>
      <p>© {new Date().getFullYear()} Bookshelf.cv · Designed and developed by <strong>Trusting Brains</strong></p>
    </div>
  );
}
