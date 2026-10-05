import FlowShell from '../components/FlowShell.jsx';
import catalog from '../data/books.js';
import AuthNavLink from '../features/auth/AuthNavLink.jsx';
import ThemePicker from '../features/themes/ThemePicker.jsx';

// /themes — step 1 of setup: choose a look (paid looks go through checkout).
export default function ThemesPage({ app }) {
  return (
    <FlowShell navRight={<AuthNavLink app={app} />}>
      <ThemePicker
        selectedTheme={app.theme}
        books={app.books.length ? app.books : catalog}
        purchasedThemeIds={app.purchasedThemeIds}
        onSelect={app.selectTheme}
        onBuy={chosen => app.navigate(`/purchase?theme=${chosen.id}`)}
        onContinue={app.continueFromThemes}
      />
    </FlowShell>
  );
}
