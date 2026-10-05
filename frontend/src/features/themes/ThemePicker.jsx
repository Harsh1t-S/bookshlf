import { useState } from 'react';
import { getTheme, isThemeUnlocked, themes } from '../../data/themes.js';
import { ThemePreview } from '../shelf/ShelfView.jsx';
import Modal from '../../components/Modal.jsx';

function badge(theme) {
  return theme.paid ? `PREMIUM - $${theme.usd}` : 'FREE';
}

export default function ThemePicker({ selectedTheme, books, purchasedThemeIds = [], onSelect, onBuy, onContinue }) {
  const [previewId, setPreviewId] = useState(null);
  const selectedId = getTheme(selectedTheme).id;
  const previewTheme = previewId ? getTheme(previewId) : null;

  function choose(theme) {
    if (isThemeUnlocked(theme, purchasedThemeIds)) onSelect(theme);
    else onBuy(theme);
  }

  function actionLabel(theme) {
    if (theme.id === selectedId && isThemeUnlocked(theme, purchasedThemeIds)) return 'Selected';
    return isThemeUnlocked(theme, purchasedThemeIds) ? 'Select' : 'Select & Buy';
  }

  return (
    <div className="fg-themes">
      <div className="fg-head">
        <h1>Choose your look</h1>
        <p>Pick a display style for your bookshelf. You can change it anytime.</p>
      </div>

      <div className="fg-theme-grid">
        {themes.map(theme => {
          const selected = theme.id === selectedId && isThemeUnlocked(theme, purchasedThemeIds);
          return (
            <article key={theme.id} className="fg-theme-card" data-selected={selected}>
              <div className="fg-theme-card__badge" data-paid={theme.paid}>{badge(theme)}</div>
              <div className="fg-theme-card__thumb"><ThemePreview theme={theme} books={books} /></div>
              <div className="fg-theme-card__body">
                <div className="fg-theme-card__row">
                  <h2>{theme.name}</h2>
                  <button type="button" onClick={() => setPreviewId(theme.id)} aria-label={`Preview ${theme.name}`}>Preview</button>
                </div>
                <button type="button" className="fg-pick" aria-pressed={selected} onClick={() => choose(theme)}>{actionLabel(theme)}</button>
              </div>
            </article>
          );
        })}
      </div>

      <button type="button" className="fg-cta" onClick={onContinue}>Continue Fetching Books</button>

      {previewTheme && (
        <Modal onClose={() => setPreviewId(null)} labelledBy="theme-preview-title" className="fg-preview-dialog">
          <header>
            <h2 id="theme-preview-title">{previewTheme.name}</h2>
            <button type="button" onClick={() => setPreviewId(null)} aria-label="Close preview">×</button>
          </header>
          <div className="fg-preview-dialog__frame"><ThemePreview theme={previewTheme} books={books} stageWidth={1440} /></div>
          <footer>
            <button
              type="button"
              className="fg-pick"
              aria-pressed={previewTheme.id === selectedId && isThemeUnlocked(previewTheme, purchasedThemeIds)}
              onClick={() => { choose(previewTheme); setPreviewId(null); }}
            >
              {actionLabel(previewTheme)}{previewTheme.paid && !isThemeUnlocked(previewTheme, purchasedThemeIds) ? ` · ₹${previewTheme.inr}` : ''}
            </button>
          </footer>
        </Modal>
      )}
    </div>
  );
}
