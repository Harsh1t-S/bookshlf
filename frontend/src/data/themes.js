// The six shelf looks from the Figma "Choose your look" screen. Cards show the
// USD badge from the design; checkout charges the INR price plus GST.
export const GST_RATE = 0.18;

export const themes = [
  { id: 'light-grid', name: 'Light Grid', view: 'grid', variant: 'light', paid: false },
  { id: 'gradient-grid', name: 'Gradient Grid', view: 'grid', variant: 'gradient', paid: false },
  { id: 'dark-grid', name: 'Dark Grid', view: 'grid', variant: 'dark', paid: false },
  { id: 'digital-shelf', name: 'Digital Shelf', view: 'shelf', variant: 'gradient', paid: true, usd: 9, inr: 749 },
  { id: 'spine-shelf', name: 'Spine Shelf', view: 'spine', variant: 'board', paid: true, usd: 15, inr: 1249 },
  { id: 'macos', name: 'MacOS', view: 'macos', variant: 'light', paid: true, usd: 21, inr: 1749 },
];

export function getTheme(theme) {
  const id = typeof theme === 'string' ? theme : theme?.id;
  return themes.find(item => item.id === id) || themes[0];
}

export function isThemeUnlocked(theme, purchasedThemeIds = []) {
  const chosen = getTheme(theme);
  return !chosen.paid || purchasedThemeIds.includes(chosen.id);
}

export function themePrice(theme) {
  const chosen = getTheme(theme);
  const subtotal = chosen.inr || 0;
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  return { subtotal, gst, total: Math.round((subtotal + gst) * 100) / 100 };
}
