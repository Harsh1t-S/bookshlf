import { themePrice, themes } from '../../data/themes.js';

// Copy for the legal pages. Premium looks are one-time digital purchases with no
// refunds, returns or cancellations; keep the three documents consistent on that.
export const CONTACT_EMAIL = 'support@bookfolio.live';
export const LAST_UPDATED = '14 October 2026';

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const freeLooks = themes.filter(theme => !theme.paid).map(theme => theme.name).join(', ');
const premiumLooks = themes.filter(theme => theme.paid);

const privacy = {
  title: 'Privacy Policy',
  intro: <>This policy explains what Bookfolio (“we”, “us”) collects when you use bookfolio.live, why we collect it, and the choices you have.</>,
  sections: [
    ['Information we collect', <>
      <ul>
        <li><strong>Account details.</strong> Your name and email address. If you sign up with a password, we store only a scrypt hash of it, never the password itself. If you continue with Google, Google shares your name, email address, profile picture and Google account ID with us.</li>
        <li><strong>Your shelf.</strong> The books you add, the look you choose, the looks you have bought and the username you claim.</li>
        <li><strong>Goodreads imports.</strong> The Goodreads profile link or ID you enter. We read only that profile’s public “Read” and “Currently Reading” shelves.</li>
        <li><strong>Shelf photos.</strong> A photo you upload is used only to recognise the books in it. We do not keep it on our servers.</li>
        <li><strong>Checkout details.</strong> When you buy a premium look you enter your name, email, phone number (optional), billing address and, for businesses, your GSTIN. Your card, UPI or bank details are entered on Razorpay’s checkout and handled by Razorpay. We never see or store them.</li>
        <li><strong>Security records.</strong> Failed sign-in attempts, temporary account locks and password-reset tokens. Reset tokens are stored only as a hash and expire after 60 minutes.</li>
      </ul>
    </>],
    ['How we use it', <>
      <ul>
        <li>To create your account, keep it secure and keep you signed in.</li>
        <li>To save your shelf and show it at bookfolio.live/&lt;username&gt;.</li>
        <li>To take payments, issue receipts and GST invoices, and unlock the looks you buy.</li>
        <li>To send service emails, such as password-reset links.</li>
        <li>To prevent fraud and abuse, and to meet our legal obligations.</li>
      </ul>
      <p>We do not sell your personal information, and we do not use it for advertising.</p>
    </>],
    ['What other people can see', <p>Once you claim a username, anyone with the link bookfolio.live/&lt;username&gt; can see your name, profile picture, the year you joined, your books and your chosen look. Your email address is never shown.</p>],
    ['Cookies and browser storage', <p>We use one essential cookie: a signed, HttpOnly session cookie that keeps you signed in. We also keep a copy of your shelf in your browser’s local storage so pages load quickly. We do not use advertising or tracking cookies. Google sign-in and Razorpay checkout load their own scripts, which may set cookies under their own policies.</p>],
    ['Who we share it with', <>
      <ul>
        <li><strong>Google</strong>, to verify your sign-in when you choose “Continue with Google”.</li>
        <li><strong>Razorpay</strong>, to process your payment.</li>
        <li><strong>Our hosting and database providers</strong>, which store and serve our data on our behalf.</li>
        <li><strong>Government or law-enforcement authorities</strong>, when the law requires it.</li>
      </ul>
    </>],
    ['How long we keep it', <p>We keep your account and shelf for as long as your account is open. Payment and invoice records are kept for as long as Indian tax and accounting laws require, even after an account is deleted.</p>],
    ['Security', <p>The site runs over HTTPS, passwords are hashed with scrypt, and an account locks for 15 minutes after five wrong passwords. No system is perfectly secure, so please use a strong password that you don’t use anywhere else.</p>],
    ['Your choices and rights', <p>You can view and edit your shelf at any time. To get a copy of your data, correct it or delete your account, email {mail}. We reply within 30 days. Deleting your account removes your shelf and your public page; it does not make a purchase refundable (see our <a href="/refunds">Refund &amp; Cancellation Policy</a>). You may also have rights under Indian law, including the Digital Personal Data Protection Act, 2023.</p>],
    ['Children', <p>If you are under 18, use Bookfolio only with the consent and supervision of a parent or guardian.</p>],
    ['Changes to this policy', <p>We may update this policy from time to time. We will post the new version on this page with a new “last updated” date.</p>],
    ['Contact us', <p>For questions or complaints about your privacy, email {mail}.</p>],
  ],
};

const terms = {
  title: 'Terms & Conditions',
  intro: <>These terms govern your use of bookfolio.live. By creating an account or using the site, you agree to them. If you do not agree, please don’t use Bookfolio.</>,
  sections: [
    ['The service', <p>Bookfolio lets you build a virtual bookshelf by importing books from Goodreads, a photo of your shelf, our library or by hand; choose a look for it; and share it at bookfolio.live/&lt;username&gt;.</p>],
    ['Your account', <p>Give accurate details, keep your password safe and tell us at once if you think someone else has used your account. You are responsible for what happens under your account. If you are under 18, you may use Bookfolio only with a parent’s or guardian’s consent.</p>],
    ['Usernames', <p>Usernames are given on a first-come basis. We may reclaim or refuse a username that impersonates someone, infringes a trademark, is offensive, or clashes with a page of the site.</p>],
    ['Your content', <p>The shelf you build stays yours. You allow us to store it and to show it publicly at your link. Don’t add anything unlawful, offensive or that infringes someone else’s rights. Book titles and covers belong to their authors and publishers and are shown only to identify the books.</p>],
    ['Acceptable use', <p>Don’t misuse the service: no hacking, probing or overloading our systems, no scraping or automated account creation, no reselling access, and nothing that breaks the law.</p>],
    ['Looks, prices and payment', <>
      <p>The {freeLooks} looks are free. These premium looks are one-time purchases:</p>
      <ul>
        {premiumLooks.map(theme => <li key={theme.id}>{theme.name}: {inr.format(theme.inr)} + 18% GST ({inr.format(themePrice(theme).total)} in total)</li>)}
      </ul>
      <p>Prices are in Indian rupees and the amount you pay is shown at checkout. Payments are processed by Razorpay. A premium look unlocks on your account as soon as the payment succeeds, and you can use it for as long as your account and the service exist. Purchases are tied to your account and cannot be transferred. We may change prices for future purchases.</p>
      <p><strong>All purchases are final. There are no refunds, returns or cancellations</strong>, as explained in our <a href="/refunds">Refund &amp; Cancellation Policy</a>.</p>
    </>],
    ['Third-party services', <p>Sign-in with Google, Goodreads imports and Razorpay payments are provided by those companies under their own terms. Bookfolio is not affiliated with or endorsed by Goodreads, and we are not responsible for third-party services.</p>],
    ['Our intellectual property', <p>The Bookfolio name, site, looks, artwork and code belong to us or our licensors. Buying a look gives you a personal licence to use it on your shelf, not ownership of the design.</p>],
    ['Changes and availability', <p>We may add, change or remove features. We work to keep the site running, but we can’t promise it will always be available or error-free.</p>],
    ['Ending your account', <p>You can stop using Bookfolio at any time and ask us to delete your account. We may suspend or close an account that breaks these terms, without a refund.</p>],
    ['Disclaimer and liability', <p>Bookfolio is provided “as is”. To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability to you is limited to the amount you paid us in the 12 months before the claim.</p>],
    ['Governing law', <p>These terms are governed by the laws of India, and the courts of India have jurisdiction over any dispute.</p>],
    ['Changes to these terms', <p>We may update these terms. We will post the new version on this page with a new “last updated” date, and continuing to use the site means you accept it.</p>],
    ['Contact us', <p>Questions about these terms? Email {mail}.</p>],
  ],
};

const refunds = {
  title: 'Refund & Cancellation Policy',
  intro: <>Bookfolio is free to use. The only paid items are premium shelf looks, which are digital products delivered instantly. Please read this policy before you buy.</>,
  sections: [
    ['No refunds', <p>All purchases are final. A premium look unlocks on your account the moment your payment succeeds, so we do not offer full or partial refunds for any reason, including a change of mind, not using the look, switching to another look or deleting your account.</p>],
    ['No cancellations', <p>A purchase cannot be cancelled once the payment is complete. Until then you can close the Razorpay checkout without paying, and you will not be charged.</p>],
    ['No returns or exchanges', <p>Premium looks are delivered digitally to your account. Nothing is shipped, so there is nothing to return or exchange.</p>],
    ['Try before you buy', <p>You can preview every look with sample books from the <a href="/themes">Choose your look</a> page before paying. Please make sure a look is right for you before you buy it.</p>],
    ['Payment problems', <p>If money left your account but the look did not unlock, or you were charged more than once for the same look, email {mail} within 7 days with your Razorpay payment ID. We will check with Razorpay and either unlock the look or return the extra or failed charge to your original payment method, usually within 5–7 working days. This covers payment errors only; it does not make a completed purchase refundable.</p>],
    ['Contact us', <p>For any question about a payment, email {mail}.</p>],
  ],
};

export const policies = { '/privacy': privacy, '/terms': terms, '/refunds': refunds };

// Footer order.
export const legalLinks = Object.entries(policies).map(([path, { title }]) => ({ path, title }));
