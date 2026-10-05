import { LANDING_BASE, asset } from '../../data/figmaAssets.js';

// Copy and Figma artwork for the landing page sections.
export const art = name => asset(LANDING_BASE, name);

export const heroBooks = [
  { src: '954b2.svg', group: [-103.75, 529.01, 343, 288.64], l: 53.24, t: 16.34, w: 289.763, h: 272.305, rot: -24.27, iw: 229.915, ih: 195.04, inset: '-16.66% -22.83% -37.17% -22.83%' },
  { src: '1563b.svg', group: [-103.75, 529.01, 343, 288.64], l: 0, t: 0, w: 289.763, h: 272.305, rot: -24.27, iw: 229.915, ih: 195.04, inset: '-.51% -.43%' },
  { src: '30f91.svg', l: -166.58, t: 16, w: 454.816, h: 427.414, rot: -24.27, iw: 360.878, ih: 306.138, inset: '-.82% -.69%' },
  { src: '63ee2.svg', group: [1173.84, 617, 220.25, 181], l: 38.53, t: 0, w: 181.715, h: 165.237, rot: 14.94, iw: 153.359, ih: 130.096, inset: '-.38% -.33%' },
  { src: '549d2.svg', group: [1173.84, 617, 220.25, 181], l: 0, t: 15.77, w: 181.715, h: 165.237, rot: 14.94, iw: 153.359, ih: 130.096, inset: '-.77% -.65%' },
  { src: 'a7d82.svg', group: [1179.25, 17.98, 347.33, 376.66], l: 0, t: 63.34, w: 333.405, h: 313.317, rot: -24.27, iw: 264.543, ih: 224.415, inset: '-.22% -.19%' },
  { src: 'ca79c.svg', group: [1179.25, 17.98, 347.33, 376.66], l: 13.92, t: 0, w: 333.405, h: 313.317, rot: -24.27, iw: 264.543, ih: 224.415, inset: '-.45% -.38%' },
];

export const readerRows = [
  [['55bdd.svg', '61ced.svg'], ['74f91.svg', '2b2ef.svg'], ['28b72.svg', 'f52db.svg'], ['55bdd.svg', '61ced.svg']],
  [['89684.svg', 'd8116.svg'], ['efb74.svg', 'f1cf6.svg'], ['5eac7.svg', 'e4eb1.svg']],
];

export const stepCards = [
  { color: '#0fb5a5', icon: '5ec9e.svg', title: 'Sign Up Free', fixed: true, body: <p>Create your account in 30 seconds. No credit card, no commitments. Just your email.</p> },
  { color: '#fcca3c', icon: '67153.svg', title: 'Add Your Books', body: <ul><li>Import from Goodreads, </li><li>Snap your shelf, or</li><li>Search our library of 20M+ titles. Easy.</li></ul> },
  { color: '#f9916c', icon: '6221c.svg', title: 'Go Live Instantly', fixed: true, body: <p>Hit publish and get your bookshelf.cv/yourname link. Share it everywhere you live online.</p> },
];

export const faqCards = [
  {
    color: '#fcca3c',
    title: 'Is bookshelf.cv free foreever?',
    body: <><p><b>100% free forever. </b></p><p>No credit card required, no trial period, no hidden fees. </p><p /><p>You will get a full digital bookshelf with a custom url, and sharable links. </p></>,
  },
  {
    color: '#df79e7',
    title: 'How long does it take to set up?',
    body: <><p><b>Not more than 5 minutes. </b></p><ul><li>Sign up. </li><li>Connect your goodreads or capture a photo or add manually. </li><li>Pick a them, and it is done. </li></ul><p /><p>If you face any tech issues, always ready to help.</p></>,
  },
  {
    color: '#e17274',
    title: 'How can i add books?',
    body: <><p>Currently, there are three ways to add books,</p><p /><ul><li>Import from Goodreads. </li><li>Capture a photo and let us do the work. </li><li>Add Manually. </li></ul></>,
  },
];
