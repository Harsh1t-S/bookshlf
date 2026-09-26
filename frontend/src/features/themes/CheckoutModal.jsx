import Modal from '../../shared/Modal';

export default function CheckoutModal({ theme, onClose }) {
  return (
    <Modal onClose={onClose} labelledBy="premium-notice-title" className="w-full max-w-[380px] rounded-2xl bg-white p-6 text-center shadow-2xl">
        <h2 id="premium-notice-title" className="text-lg font-bold text-[#292522]">{theme.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#70665d]">This premium theme is available to preview. Checkout is not connected yet.</p>
        <button type="button" onClick={onClose} className="mt-5 h-10 w-full rounded-full bg-[#e43d00] text-sm font-semibold text-white hover:bg-[#cc3700]">Got it</button>
    </Modal>
  );
}
