import useBookshelf from './app/useBookshelf.js';
import AuthPage from './pages/AuthPage.jsx';
import BooksPage from './pages/BooksPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import DemoPage from './pages/DemoPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ShelfPage from './pages/ShelfPage.jsx';
import ThemesPage from './pages/ThemesPage.jsx';

const pages = {
  '/': LandingPage,
  '/signup': AuthPage,
  '/login': AuthPage,
  '/themes': ThemesPage,
  '/purchase': CheckoutPage,
  '/books': BooksPage,
  '/shelf': ShelfPage,
  '/demo': DemoPage,
};

export default function App() {
  const app = useBookshelf();
  const Page = pages[app.pathname] ?? NotFoundPage;
  return <Page app={app} />;
}
