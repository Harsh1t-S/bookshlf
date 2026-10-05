import { useState } from 'react';
import { getTheme, themePrice } from '../data/themes.js';
import { payWithRazorpay, razorpayConfigError } from '../lib/razorpay.js';
import '../styles/purchase.css';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });

export default function PurchasePage({ theme, name = '', email = '', onBack, onPaid }) {
  const chosen = getTheme(theme);
  const { subtotal, gst, total } = themePrice(chosen);
  const [form, setForm] = useState({ name, email, phone: '', country: 'India', address: '', city: '', state: '', postal: '', business: false, gstin: '' });
  const [manualAddress, setManualAddress] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discount, setDiscount] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const configError = razorpayConfigError();

  const update = field => event => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm(current => ({ ...current, [field]: value }));
  };

  function validate() {
    if (!form.name.trim()) return 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Enter a valid email address for your receipt.';
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s+/g, ''))) return 'Enter a 10-digit phone number, or leave it empty.';
    if (!form.address.trim()) return 'Enter your billing address.';
    if (form.business && !form.gstin.trim()) return 'Enter your GSTIN to purchase as a business.';
    return '';
  }

  async function pay(event) {
    event.preventDefault();
    const problem = configError || validate();
    setError(problem);
    if (problem) return;

    setPaying(true);
    try {
      const { paymentId } = await payWithRazorpay({
        amountPaise: Math.round(total * 100),
        description: `${chosen.name} theme`,
        prefill: { name: form.name.trim(), email: form.email.trim(), ...(form.phone ? { contact: `+91${form.phone.replace(/\s+/g, '')}` } : {}) },
        notes: { theme_id: chosen.id, billing_country: form.country, ...(form.business ? { gstin: form.gstin.trim() } : {}) },
        onOpen: () => setPaying(false),
      });
      onPaid({ themeId: chosen.id, paymentId });
    } catch (paymentError) {
      setError(paymentError.message);
      setPaying(false);
    }
  }

  return (
    <div className="pp">
      <aside className="pp-summary">
        <div className="pp-summary__inner">
          <div className="pp-merchant">
            <span className="pp-merchant__logo" aria-hidden="true">B</span>
            <span>Bookshelf.cv</span>
            <span className="pp-pill">Pay in INR</span>
          </div>
          <p className="pp-product">{chosen.name} theme</p>
          <p className="pp-price">{inr.format(subtotal)}</p>

          <div className="pp-discount">
            {discountOpen ? (
              <form className="pp-discount__form" onSubmit={event => { event.preventDefault(); setDiscountMessage(discount.trim() ? 'This code is not valid.' : 'Enter a discount code.'); }}>
                <input aria-label="Discount code" value={discount} onChange={event => { setDiscount(event.target.value); setDiscountMessage(''); }} placeholder="Discount code" />
                <button type="submit" className="pp-ghost">Apply</button>
              </form>
            ) : (
              <>
                <span>Have a discount code?</span>
                <button type="button" className="pp-ghost" onClick={() => setDiscountOpen(true)}>Apply discount code</button>
              </>
            )}
          </div>
          {discountMessage && <p className="pp-discount__msg" role="status">{discountMessage}</p>}

          <dl className="pp-totals">
            <div><dt>Subtotal</dt><dd>{inr.format(subtotal)}</dd></div>
            <div><dt>GST (18%)</dt><dd>{inr.format(gst)}</dd></div>
            <div className="pp-totals__total"><dt>Total</dt><dd>{inr.format(total)}</dd></div>
          </dl>
          <button type="button" className="pp-back" onClick={onBack}>← Back to themes</button>
        </div>
      </aside>

      <main className="pp-form">
        <form className="pp-form__inner" onSubmit={pay} noValidate>
          <h1>Contact Information</h1>
          <label className="pp-field">
            <span>Full Name <b>*</b></span>
            <input value={form.name} onChange={update('name')} autoComplete="name" placeholder="Your full name" />
          </label>
          <div className="pp-row">
            <label className="pp-field">
              <span>Email <b>*</b></span>
              <input type="email" value={form.email} onChange={update('email')} autoComplete="email" placeholder="you@example.com" />
            </label>
            <label className="pp-field">
              <span>Phone (optional)</span>
              <span className="pp-phone">
                <span className="pp-phone__code" aria-hidden="true">
                  <svg viewBox="0 0 18 12" width="18" height="12"><rect width="18" height="4" fill="#ff9933" /><rect y="4" width="18" height="4" fill="#fff" /><rect y="8" width="18" height="4" fill="#138808" /><circle cx="9" cy="6" r="1.4" fill="none" stroke="#000080" strokeWidth=".5" /></svg>
                  <small>▾</small>
                </span>
                <span className="pp-phone__prefix">+91</span>
                <input type="tel" inputMode="numeric" value={form.phone} onChange={update('phone')} autoComplete="tel-national" aria-label="Phone number" />
              </span>
            </label>
          </div>

          <fieldset className="pp-billing">
            <legend>Billing address <b>*</b></legend>
            <div className="pp-stack">
              <select value={form.country} onChange={update('country')} aria-label="Country">
                <option>India</option>
              </select>
              <input value={form.address} onChange={update('address')} autoComplete="street-address" placeholder="Address Line" aria-label="Address line" />
              {manualAddress && (
                <div className="pp-stack__row">
                  <input value={form.city} onChange={update('city')} autoComplete="address-level2" placeholder="City" aria-label="City" />
                  <input value={form.state} onChange={update('state')} autoComplete="address-level1" placeholder="State" aria-label="State" />
                  <input value={form.postal} onChange={update('postal')} autoComplete="postal-code" inputMode="numeric" placeholder="PIN code" aria-label="PIN code" />
                </div>
              )}
            </div>
            <button type="button" className="pp-link" onClick={() => setManualAddress(value => !value)}>
              {manualAddress ? 'Hide address details' : 'Enter address manually'}
            </button>
          </fieldset>

          <label className="pp-check">
            <input type="checkbox" checked={form.business} onChange={update('business')} />
            <span>Purchasing as a business</span>
          </label>
          {form.business && (
            <label className="pp-field">
              <span>GSTIN <b>*</b></span>
              <input value={form.gstin} onChange={update('gstin')} placeholder="22AAAAA0000A1Z5" />
            </label>
          )}

          {error && <p className="pp-error" role="alert">{error}</p>}

          <button type="submit" className="pp-pay" disabled={paying}>{paying ? 'Opening Razorpay…' : 'Continue to Payment'}</button>

          <p className="pp-legal">Payments are processed securely by Razorpay. This checkout runs in <strong>test mode</strong> — use Razorpay test cards or UPI <code>success@razorpay</code>; no real money is charged.</p>
          <p className="pp-brand">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="#3395ff" d="M8.2 2 6.6 8.1l9.2-6.1zm7.9 3.5L9.7 22h4.4l6.3-16.5z" /></svg>
            <span>Razorpay</span>
            <a href="https://razorpay.com/privacy/" target="_blank" rel="noreferrer">Privacy</a>
            <a href="https://razorpay.com/terms/" target="_blank" rel="noreferrer">Terms</a>
          </p>
        </form>
      </main>
    </div>
  );
}
