import { art, heroBooks } from './content.jsx';

function Rotated({ item }) {
  return (
    <div className="rw" style={{ left: item.l, top: item.t, width: item.w, height: item.h }}>
      <div style={{ width: item.iw, height: item.ih, transform: `rotate(${item.rot}deg)` }}>
        <div style={{ inset: item.inset }}>
          <img src={art(item.src)} alt="" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
}

function HeroBooks() {
  const groups = [];
  const singles = [];
  heroBooks.forEach(item => {
    if (!item.group) {
      singles.push(item);
      return;
    }
    const key = item.group.join(',');
    let entry = groups.find(g => g.key === key);
    if (!entry) {
      entry = { key, box: item.group, items: [] };
      groups.push(entry);
    }
    entry.items.push(item);
  });
  return (
    <div className="bg" aria-hidden="true">
      <img className="abs" src={art('97cd7.svg')} alt="" style={{ left: 558.13, top: 458.63, width: 74.165, height: 62.755, opacity: 0.8 }} />
      {groups.map(g => (
        <div key={g.key} className="abs" style={{ left: g.box[0], top: g.box[1], width: g.box[2], height: g.box[3] }}>
          {g.items.map(item => <Rotated key={item.src} item={item} />)}
        </div>
      ))}
      {singles.map(item => <Rotated key={item.src} item={item} />)}
    </div>
  );
}

export default function HeroSection({ onStart, onDemo }) {
  return (
    <section className="hero">
      <h1>Turn your physical bookshelf into a beautiful digital one, <span>in just 5 minutes.</span></h1>
      <div className="perks"><span>✅ No Coding Required. </span><i className="dot" /><span>😍 Free Forever</span><i className="dot" /><span>😮‍💨 No Hosting. </span></div>
      <div className="btns">
        <button type="button" className="btn s av" onClick={onStart}>Create your bookshelf -  It’s Free</button>
        <button type="button" className="btn o av" onClick={onDemo}>See Demo below</button>
      </div>
      <HeroBooks />
    </section>
  );
}
