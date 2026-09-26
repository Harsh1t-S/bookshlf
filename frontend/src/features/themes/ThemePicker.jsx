import { useState } from 'react';
import { themes, getTheme } from '../../data/themes';
import Modal from '../../shared/Modal';

const thumbnailAssets = {
  'simple-grid': '/assets/figma-12.png',
  'sunny-shelf': '/assets/figma-10.png',
  'midnight-library': '/assets/figma-09.png',
  'minimal-shelf': '/assets/figma-01.png',
  'wooden-shelf': '/assets/figma-00.png',
  'spine-view': '/assets/figma-02.png',
};

function ThemeThumbnail({ theme }) {
  return (
    <img src={thumbnailAssets[theme.id]} alt={`${theme.name} bookshelf theme`} className="h-[122px] w-full object-cover" />
  );
}

export default function ThemePicker({ selectedTheme, onSelect = () => {}, onContinue, onBack }) {
  const [preview, setPreview] = useState(null);
  const selectedId = typeof selectedTheme === 'string' ? selectedTheme : selectedTheme?.id;
  const previewTheme = preview ? getTheme(preview) : null;

  function choose(theme) {
    onSelect(theme);
  }

  return (
    <main className="mx-auto w-full max-w-[680px] px-4 pb-10 pt-4 sm:px-0">
      {onBack && <button type="button" onClick={onBack} className="mb-3 text-sm text-[#8b4b27] hover:underline">← Back</button>}
      <header className="mb-5 text-center">
        <h1 className="font-heading text-[36px] font-bold leading-none tracking-[-.035em] text-[#292522] sm:text-[48px]">Choose your look</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {themes.map(theme => {
          const active = selectedId === theme.id;
          return (
            <article key={theme.id} className={`h-[245px] overflow-hidden rounded-[9px] border bg-white ${active ? 'border-[#e43d00] ring-1 ring-[#e43d00]' : 'border-[#e8e3d8]'}`}>
              <div className={`flex h-7 items-center justify-center text-[11px] font-bold tracking-[.07em] text-white ${theme.paid ? 'bg-[#da00ec]' : 'bg-[#5a9b63]'}`}>
                {theme.paid ? 'PREMIUM' : 'FREE'}
              </div>
              <ThemeThumbnail theme={theme} />
              <div className="px-3 pb-3 pt-2 sm:px-3.5">
                <div className="flex h-7 items-center justify-between gap-1">
                  <h2 className="truncate font-serif text-[17px] font-normal text-[#292522]">{theme.name}</h2>
                  <button type="button" onClick={() => setPreview(theme.id)} className="shrink-0 text-xs font-medium text-[#e45a24] hover:underline">Preview</button>
                </div>
                <button type="button" aria-pressed={active} onClick={() => choose(theme)} className={`mt-2 h-7 w-full rounded-full border text-[11px] font-semibold ${active ? 'border-[#e43d00] bg-[#fff6f1] text-[#c7390c]' : 'border-[#e49b79] text-[#cf4b1b] hover:bg-[#fff7f3]'}`}>
                  {active ? 'Selected' : 'Select'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <button type="button" disabled={!selectedId} onClick={onContinue} className="mt-5 h-14 w-full rounded-[14px] bg-[#e43d00] font-semibold text-white shadow-[0_5px_14px_rgba(173,69,25,.2)] hover:bg-[#cc3700] disabled:cursor-not-allowed disabled:bg-[#d8c8ba]">Continue</button>

      {previewTheme && (
        <Modal onClose={() => setPreview(null)} labelledBy="theme-preview-title" className="w-full max-w-[430px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 id="theme-preview-title" className="text-lg font-bold text-[#292522]">{previewTheme.name} preview</h2>
              <button type="button" onClick={() => setPreview(null)} aria-label="Close preview" className="rounded-full px-2 py-1 text-xl leading-none text-[#70665d] hover:bg-[#f4f0ea]">×</button>
            </div>
            <ThemeThumbnail theme={previewTheme} />
            <p className="px-5 py-4 text-center text-xs text-[#81776d]">Previewing this look does not select it.</p>
            <div className="px-5 pb-5"><button type="button" onClick={() => { choose(previewTheme); setPreview(null); }} className="h-10 w-full rounded-full border border-[#e49b79] text-sm font-semibold text-[#cf4b1b]">{selectedId === previewTheme.id ? 'Selected' : 'Select'}</button></div>
        </Modal>
      )}

    </main>
  );
}
