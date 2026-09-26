export default function SiteHeader({ title = 'Bookshelf.cv', action, onAction, onHome }) {
  return (
    <header className="relative z-20 flex h-[70px] items-center justify-between border-b border-[#e8e0d4] bg-[#faf7f2]/90 px-6 sm:px-8">
      <button type="button" onClick={onHome} className="font-serif text-[21px] italic tracking-[-0.03em] text-[#362820]">{title}</button>
      {action && <button type="button" onClick={onAction} className="rounded-lg px-3 py-2 text-sm text-[#734021] transition hover:bg-[#efe8dc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#df3900]">{action}</button>}
    </header>
  );
}
