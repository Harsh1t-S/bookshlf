import { AUTH_BASE, asset } from '../data/figmaAssets.js';
import '../styles/figma-flow.css';

const a = name => asset(AUTH_BASE, name);

// Corner books shared by the sign-up, theme and add-books frames. Positions are
// the Figma coordinates inside the 1440px frame.
const decor = [
  ['524a3.svg', -26.75, 688.27, 235.408, 221.225, -24.27, 186.787, 158.454, '-20.51% -28.11% -45.75% -28.11%'],
  ['c8a4b.svg', -70, 675, 235.408, 221.225, -24.27, 186.787, 158.454, '-.63% -.54%'],
  ['6dab0.svg', -68.65, 105.63, 280.692, 263.78, -24.27, 222.717, 188.934, '-1.32% -1.12%'],
  ['31dbe.svg', 1272.35, 778, 194.052, 176.455, 14.94, 163.771, 138.929, '-.36% -.31%'],
  ['72ce6.svg', 1231.2, 794.83, 194.052, 176.455, 14.94, 163.771, 138.929, '-.72% -.61%'],
  ['8c1f8.svg', 1268.44, 145.39, 228.374, 214.615, -24.27, 181.205, 153.719, '-.33% -.28%'],
  ['a7572.svg', 1277.98, 102, 228.374, 214.615, -24.27, 181.205, 153.719, '-.65% -.55%'],
];

function DecorPiece({ item: [src, l, t, w, h, rot, iw, ih, inset], dx = 0, dy = 0 }) {
  return (
    <div className="fg-rw" style={{ left: l + dx, top: t + dy, width: w, height: h }}>
      <div style={{ width: iw, height: ih, transform: `rotate(${rot}deg)` }}>
        <div style={{ inset }}><img src={a(src)} alt="" style={{ width: '100%', height: '100%' }} /></div>
      </div>
    </div>
  );
}

// A corner pair re-used at a smaller scale, e.g. in the shelf header.
export function DecorPair({ corner, className = '' }) {
  const pair = corner === 'left' ? [decor[0], decor[1]] : [decor[5], decor[6]];
  const dx = -Math.min(pair[0][1], pair[1][1]);
  const dy = -Math.min(pair[0][2], pair[1][2]);
  return <div className={className} aria-hidden="true">{pair.map(item => <DecorPiece key={item[0]} item={item} dx={dx} dy={dy} />)}</div>;
}

export function FlowDecor() {
  return (
    <div className="fg-decor" aria-hidden="true">
      <img className="fg-abs" src={a('97cd7.svg')} alt="" style={{ left: 527.88, top: 432.63, width: 74.165, height: 62.755 }} />
      {decor.map(item => <DecorPiece key={item[0]} item={item} />)}
    </div>
  );
}

export function FlowNav({ left, right }) {
  return (
    <header className="fg-nav">
      <div className="fg-nav__side">
        <a className="fg-logo" href="/">Bookshelf.cv</a>
        {left}
      </div>
      <div className="fg-nav__side">{right}</div>
    </header>
  );
}

export default function FlowShell({ navRight, children, className = '' }) {
  return (
    <div className={`fg-flow ${className}`}>
      <FlowDecor />
      <FlowNav right={navRight} />
      <main className="fg-flow__main">{children}</main>
    </div>
  );
}
