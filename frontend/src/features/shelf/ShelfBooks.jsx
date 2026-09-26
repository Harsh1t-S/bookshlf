import BookGrid from './BookGrid.jsx';
import CoverShelf from './CoverShelf.jsx';
import SpineShelf from './SpineShelf.jsx';

export default function ShelfBooks({ books = [], theme, onBookSelect }) {
  const layout = theme?.layout ?? 'grid';
  const shelf = layout === 'spine'
    ? <SpineShelf books={books} theme={theme} onBookSelect={onBookSelect} />
    : layout === 'floating' || layout === 'wood'
      ? <CoverShelf books={books} theme={theme} onBookSelect={onBookSelect} />
      : <BookGrid books={books} onBookSelect={onBookSelect} />;

  return <div data-shelf-layout={layout}>{shelf}</div>;
}
