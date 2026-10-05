import usePageTitle from '../app/usePageTitle.js';
import useReveal from '../hooks/useReveal.js';
import CtaSection from '../sections/landing/CtaSection.jsx';
import HeroSection from '../sections/landing/HeroSection.jsx';
import LandingFooter from '../sections/landing/LandingFooter.jsx';
import LandingNav from '../sections/landing/LandingNav.jsx';
import StepsSection from '../sections/landing/StepsSection.jsx';
import StoriesSection from '../sections/landing/StoriesSection.jsx';
import ThemesSection from '../sections/landing/ThemesSection.jsx';
import WhySection from '../sections/landing/WhySection.jsx';
import '../styles/figma-landing.css';

function showDemo() {
  document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// / — marketing page, top to bottom as in the Figma "Website" frame.
export default function LandingPage({ app }) {
  useReveal();
  usePageTitle();
  return (
    <div className="fg-landing">
      <LandingNav />
      <main>
        <HeroSection onStart={app.startSetup} onDemo={showDemo} />
        <StepsSection />
        <ThemesSection />
        <WhySection />
        <StoriesSection onStart={app.startSetup} />
        <CtaSection onStart={app.startSetup} />
      </main>
      <LandingFooter />
    </div>
  );
}
