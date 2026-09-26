import { useState } from 'react';

export default function CheckoutModal({ theme, onClose, onSuccess }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  function formatCardNumber(val) {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function formatExpiry(val) {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length > 2) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    return clean;
  }

  function handlePay(e) {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setTimeout(() => {
        onSuccess(theme);
      }, 1000);
    }, 1200);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div className="relative flex w-full max-w-[800px] flex-col overflow-hidden rounded-2xl bg-[#18181b] text-white shadow-2xl md:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close checkout"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
        >
          ✕
        </button>

        {/* Left: Summary */}
        <div className="flex flex-col justify-between border-b border-white/10 bg-[#121215] p-6 sm:p-8 md:w-[45%] md:border-b-0 md:border-r">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif italic text-[#e13a00] text-lg font-bold">Bookshelf.cv</span>
              <span className="rounded bg-[#da00ec]/20 px-2 py-0.5 text-[10px] font-bold text-[#da00ec]">
                PREMIUM
              </span>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-white/50">Purchasing Theme</p>
              <h3 id="checkout-title" className="mt-1 font-serif text-2xl font-bold text-white">
                {theme.name}
              </h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                {theme.description || 'Unlock this premium visual theme with unlimited shelf customization and lifetime access.'}
              </p>
            </div>

            <div className="mt-8 rounded-xl bg-white/5 p-4">
              <div className="flex justify-between text-sm text-white/70">
                <span>Theme License</span>
                <span>${theme.price}.00</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-white/70">
                <span>Estimated Tax</span>
                <span>$0.00</span>
              </div>
              <div className="my-3 border-t border-white/10" />
              <div className="flex justify-between text-base font-semibold text-white">
                <span>Total Due</span>
                <span className="text-xl text-[#34d399]">${theme.price}.00</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-white/40">
            <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            <span>Guaranteed 256-bit encrypted checkout</span>
          </div>
        </div>

        {/* Right: Payment Fields */}
        <div className="flex-1 p-6 sm:p-8">
          <h4 className="text-base font-semibold text-white">Pay with Card</h4>
          <p className="mt-1 text-xs text-white/50">Instant activation for your bookshelf</p>

          {isDone ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h5 className="mt-4 text-lg font-bold text-white">Payment Successful!</h5>
              <p className="mt-1 text-xs text-white/60">Unlocked {theme.name}. Activating your look...</p>
            </div>
          ) : (
            <form onSubmit={handlePay} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70">Card number</label>
                <div className="mt-1.5 flex h-11 items-center rounded-lg border border-white/15 bg-white/5 px-3.5 focus-within:border-[#e13a00]">
                  <input
                    type="text"
                    required
                    placeholder="4242 •••• •••• 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  />
                  <div className="flex gap-1 text-[11px] text-white/40">
                    <span>VISA</span>
                    <span>MC</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70">Expiration</label>
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#e13a00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70">CVC</label>
                  <input
                    type="password"
                    required
                    placeholder="CVC"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#e13a00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70">Postal / ZIP code</label>
                <input
                  type="text"
                  required
                  placeholder="90210"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#e13a00]"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#e13a00] text-sm font-semibold text-white shadow-lg transition hover:bg-[#c93200] disabled:opacity-50"
              >
                {isProcessing ? 'Processing Payment...' : `Pay $${theme.price}.00 & Activate`}
              </button>

              <p className="mt-2 text-center text-[11px] text-white/40">
                Simulated checkout for preview. No real charge will occur.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
