import useBookshelf from './app/useBookshelf.js';
import AuthPage from './pages/AuthPage.jsx';
import BooksPage from './pages/BooksPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import DemoPage from './pages/DemoPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PublicShelfPage from './pages/PublicShelfPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ShelfPage from './pages/ShelfPage.jsx';
import ThemesPage from './pages/ThemesPage.jsx';

const pages = {
  '/': LandingPage,
  '/signup': AuthPage,
  '/login': AuthPage,
  '/forgot': ForgotPasswordPage,
  '/reset': ResetPasswordPage,
  '/themes': ThemesPage,
  '/purchase': CheckoutPage,
  '/books': BooksPage,
  '/shelf': ShelfPage,
  '/demo': DemoPage,
};

// Any other single-segment path is a reader's public shelf: bookshelf.cv/<username>.
const USERNAME_PATH = /^\/[a-z0-9-]{3,30}$/i;

export default function App() {
  const app = useBookshelf();
  if (!app.ready) return null;
  const Page = pages[app.pathname] ?? (USERNAME_PATH.test(app.pathname) ? PublicShelfPage : NotFoundPage);
  return <Page app={app} />;
}
