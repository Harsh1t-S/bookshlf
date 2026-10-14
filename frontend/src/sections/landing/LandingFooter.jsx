import LegalFooter from '../../components/LegalFooter.jsx';

export default function LandingFooter() {
  return (
    <footer>
      <div className="foot">
        <a href="#contact">Partner with Us</a><i className="dot" />
        <a href="#stories">Blogs</a><i className="dot" />
        <a href="#themes">Other Usecases</a><i className="dot" />
        <a href="#contact">Contact Us</a><i className="dot" />
        <a href="#roadmap">What is coming up? (Roadmap)</a>
      </div>
      <LegalFooter />
    </footer>
  );
}
