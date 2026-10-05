import catalog from '../data/books.js';
import { themes } from '../data/themes.js';
import ShelfLayout from '../features/shelf/ShelfLayout.jsx';
import usePageTitle from '../app/usePageTitle.js';

// /demo?theme=… — a sample shelf in any look, linked from the landing page.
export default function DemoPage({ app }) {
  usePageTitle('Sarah’s Reading Life (demo)');
  return (
    <ShelfLayout
      isDemo
      books={catalog}
      theme={themes.find(item => item.id === app.searchParam('theme')) ?? themes[0]}
      title="Sarah’s Reading Life"
      since={2019}
      onStart={app.startSetup}
    />
  );
}
