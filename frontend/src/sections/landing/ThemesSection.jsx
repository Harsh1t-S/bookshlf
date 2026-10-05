import { useState } from 'react';
import catalog from '../../data/books.js';
import { themes } from '../../data/themes.js';
import { ThemePreview } from '../../features/shelf/ShelfView.jsx';
import CaptureForm from './CaptureForm.jsx';
import { art } from './content.jsx';

const themeRows = [themes.slice(0, 3), themes.slice(3)];

// Laptop mockup from Figma with the chosen look rendered live on its screen.
function ThemeShowcase({ theme }) {
  return (
    <div className="showcase">
      <img src={art('laptop.webp')} alt="" />
      <div className="showcase__screen" role="img" aria-label={`${theme.name} View bookshelf preview`}>
        <div key={theme.id} className="showcase__swap">
          <ThemePreview theme={theme} books={catalog} stageWidth={1440}>
            <div className="showcase__head">
              <p>BOOKSHELF.CV/</p>
              <h3>Sarah’s Reading Life</h3>
              <span>12 books · reading since 2019</span>
            </div>
          </ThemePreview>
        </div>
      </div>
    </div>
  );
}

export default function ThemesSection() {
  const [activeTheme, setActiveTheme] = useState(themes[0]);
  return (
    <section className="themes" id="themes">
      <div className="hd" data-reveal>
        <h2 className="h2">Available Themes</h2>
        <p>Currently, we have 6 themes available. But, there is more to come...stay with us</p>
      </div>
      <div className="tcol" data-reveal>
        <ThemeShowcase theme={activeTheme} />
        <div className="pills" role="group" aria-label="Preview a theme">
          {themeRows.map((row, rowIndex) => (
            <div className="pr" key={rowIndex}>
              {row.map(theme => (
                <button
                  type="button"
                  key={theme.id}
                  className={theme.id === activeTheme.id ? 'pill on' : 'pill'}
                  aria-pressed={theme.id === activeTheme.id}
                  onClick={() => setActiveTheme(theme)}
                >
                  {theme.name} View
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="panel" id="roadmap" data-reveal>
        <div className="top">
          <div className="row"><span className="t">New themes are in progress....</span><a className="u" href="/themes">Explore Future Themes here</a></div>
          <div><p>Share your email address or any social links which we can use to tell you when the new themes are available.</p><p>Don’t worry, we won’t sell or spam you. Pinky Promise!!</p></div>
        </div>
        <CaptureForm label="Email or social handle" placeholder="Share email or any social handle" />
      </div>
    </section>
  );
}
