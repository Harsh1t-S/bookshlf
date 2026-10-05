import { useEffect } from 'react';
import { getTheme } from '../data/themes.js';
import Checkout from '../features/checkout/Checkout.jsx';

// /purchase?theme=… — Razorpay checkout for a paid look.
export default function CheckoutPage({ app }) {
  const theme = getTheme(app.searchParam('theme'));
  const alreadyOwned = app.isUnlocked(theme);
  const { navigate } = app;

  // Free or already-bought looks have nothing to pay for.
  useEffect(() => {
    if (alreadyOwned) navigate('/themes', { replace: true });
  }, [alreadyOwned, navigate]);

  return (
    <Checkout
      key={theme.id}
      theme={theme}
      name={app.user?.name ?? ''}
      email={app.user?.email ?? ''}
      onBack={() => navigate('/themes')}
      onPaid={({ themeId }) => app.completePurchase(themeId)}
    />
  );
}
