import { useState } from 'react';
import catalog from '../data/books.js';
import { LANDING_BASE, asset } from '../data/figmaAssets.js';
import { themes } from '../data/themes.js';
import { ThemePreview } from '../features/shelf/ShelfView.jsx';
import useReveal from '../hooks/useReveal.js';

const a = name => asset(LANDING_BASE, name);

const heroBooks = [
  { src: '954b2.svg', group: [-103.75, 529.01, 343, 288.64], l: 53.24, t: 16.34, w: 289.763, h: 272.305, rot: -24.27, iw: 229.915, ih: 195.04, inset: '-16.66% -22.83% -37.17% -22.83%' },
  { src: '1563b.svg', group: [-103.75, 529.01, 343, 288.64], l: 0, t: 0, w: 289.763, h: 272.305, rot: -24.27, iw: 229.915, ih: 195.04, inset: '-.51% -.43%' },
  { src: '30f91.svg', l: -166.58, t: 16, w: 454.816, h: 427.414, rot: -24.27, iw: 360.878, ih: 306.138, inset: '-.82% -.69%' },
  { src: '63ee2.svg', group: [1173.84, 617, 220.25, 181], l: 38.53, t: 0, w: 181.715, h: 165.237, rot: 14.94, iw: 153.359, ih: 130.096, inset: '-.38% -.33%' },
  { src: '549d2.svg', group: [1173.84, 617, 220.25, 181], l: 0, t: 15.77, w: 181.715, h: 165.237, rot: 14.94, iw: 153.359, ih: 130.096, inset: '-.77% -.65%' },
  { src: 'a7d82.svg', group: [1179.25, 17.98, 347.33, 376.66], l: 0, t: 63.34, w: 333.405, h: 313.317, rot: -24.27, iw: 264.543, ih: 224.415, inset: '-.22% -.19%' },
  { src: 'ca79c.svg', group: [1179.25, 17.98, 347.33, 376.66], l: 13.92, t: 0, w: 333.405, h: 313.317, rot: -24.27, iw: 264.543, ih: 224.415, inset: '-.45% -.38%' },
];

function Rotated({ item }) {
  return (
    <div className="rw" style={{ left: item.l, top: item.t, width: item.w, height: item.h }}>
      <div style={{ width: item.iw, height: item.ih, transform: `rotate(${item.rot}deg)` }}>
        <div style={{ inset: item.inset }}>
          <img src={a(item.src)} alt="" style={{ width: '100%', height: '100%' }} />
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
      <img className="abs" src={a('97cd7.svg')} alt="" style={{ left: 558.13, top: 458.63, width: 74.165, height: 62.755, opacity: 0.8 }} />
      {groups.map(g => (
        <div key={g.key} className="abs" style={{ left: g.box[0], top: g.box[1], width: g.box[2], height: g.box[3] }}>
          {g.items.map(item => <Rotated key={item.src} item={item} />)}
        </div>
      ))}
      {singles.map(item => <Rotated key={item.src} item={item} />)}
    </div>
  );
}

const stepCards = [
  { color: '#0fb5a5', icon: '5ec9e.svg', title: 'Sign Up Free', fixed: true, body: <p>Create your account in 30 seconds. No credit card, no commitments. Just your email.</p> },
  { color: '#fcca3c', icon: '67153.svg', title: 'Add Your Books', body: <ul><li>Import from Goodreads, </li><li>Snap your shelf, or</li><li>Search our library of 20M+ titles. Easy.</li></ul> },
  { color: '#f9916c', icon: '6221c.svg', title: 'Go Live Instantly', fixed: true, body: <p>Hit publish and get your bookshelf.cv/yourname link. Share it everywhere you live online.</p> },
];

const themeRows = [themes.slice(0, 3), themes.slice(3)];

// Laptop mockup from Figma with the chosen look rendered live on its screen.
function ThemeShowcase({ theme }) {
  return (
    <div className="showcase">
      <img src={a('laptop.webp')} alt="" />
      <div className="showcase__screen" role="img" aria-label={`${theme.name} View bookshelf preview`}>
        <div key={theme.id} className="showcase__swap">
          <ThemePreview theme={theme} books={catalog} stageWidth={1440}>
            <div className="showcase__head">
              <p>BOOKSHELF.CV/</p>
              <h3>Sarah’s Reading Life</h3>
              <span>12 books · reading since 2019</span>
            </div>
          </ThemePreview>
        </div>
      </div>
    </div>
  );
}

const faqCards = [
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

const readerRows = [
  [['55bdd.svg', '61ced.svg'], ['74f91.svg', '2b2ef.svg'], ['28b72.svg', 'f52db.svg'], ['55bdd.svg', '61ced.svg']],
  [['89684.svg', 'd8116.svg'], ['efb74.svg', 'f1cf6.svg'], ['5eac7.svg', 'e4eb1.svg']],
];

function Testimonial({ right, left, theme, order }) {
  return (
    <div className="tc" data-reveal style={{ '--d': order }}>
      <div className="v" style={{ left: '50%', right: 0 }}><div><img src={a(right)} alt="" /></div></div>
      <p className="q">"Setup took 2 minutes. Literally timed it. Now I have a portfolio that actually represents my work professionally."</p>
      <div className="v" style={{ left: 0, right: '50%' }}><div><img src={a(left)} alt="" /></div></div>
      <div className="pr2">
        <div>
          <div className="av2"><img src={a('reader-avatar.jpg')} alt="" /></div>
          <div className="nm"><b>Aman Gupta</b><span>Simple Themes</span></div>
        </div>
        <a className="lk" href={`/demo?theme=${theme}`}><img src={a('4606f.svg')} alt="" />View Bookshelf</a>
      </div>
    </div>
  );
}

function CaptureForm({ placeholder, label }) {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <form
      className="form"
      onSubmit={event => {
        event.preventDefault();
        if (!value.trim()) return;
        setSent(true);
        setValue('');
      }}
    >
      <input aria-label={label} placeholder={placeholder} value={value} onChange={event => { setValue(event.target.value); setSent(false); }} />
      <button type="submit">{sent ? 'Thanks!' : 'Submit'}</button>
    </form>
  );
}

export default function LandingPage({ onStart }) {
  const [activeTheme, setActiveTheme] = useState(themes[0]);
  useReveal();

  function showDemo() {
    document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="fg-landing">
      <div className="nav">
        <a className="logo" href="/">Bookshelf.cv</a>
        <a className="bl" href="#stories">Blogs</a>
      </div>
      <main>
        <section className="hero">
          <h1>Turn your physical bookshelf into a beautiful digital one, <span>in just 5 minutes.</span></h1>
          <div className="perks"><span>✅ No Coding Required. </span><i className="dot" /><span>😍 Free Forever</span><i className="dot" /><span>😮‍💨 No Hosting. </span></div>
          <div className="btns">
            <button type="button" className="btn s av" onClick={onStart}>Create your bookshelf -  It’s Free</button>
            <button type="button" className="btn o av" onClick={showDemo}>See Demo below</button>
          </div>
          <HeroBooks />
        </section>

        <section className="steps">
          <div className="hd" data-reveal>
            <h2 className="h2">Your shelf in 3 steps</h2>
            <div className="sub"><span>Sign Up Free</span><i className="dot" /><span>Choose Shelf Theme</span><i className="dot" /><span>Make It Live.</span></div>
          </div>
          <div className="shelfwrap">
            <div className="cards">
              {stepCards.map((card, index) => (
                <div key={card.title} className="card" data-reveal style={{ '--d': index + 1, backgroundColor: card.color, filter: `drop-shadow(8px 0 0 ${card.color})`, height: card.fixed ? 300 : undefined }}>
                  <div className="ic"><img src={a(card.icon)} alt="" /></div>
                  <div className="tx"><h3>{card.title}</h3>{card.body}</div>
                </div>
              ))}
            </div>
            <div className="shelf" />
          </div>
        </section>

        <section className="themes" id="themes">
          <div className="hd" data-reveal>
            <h2 className="h2">Available Themes</h2>
            <p>Currently, we have 6 themes available. But, there is more to come...stay with us</p>
          </div>
          <div className="tcol" data-reveal>
            <ThemeShowcase theme={activeTheme} />
            <div className="pills" role="group" aria-label="Preview a theme">
              {themeRows.map((row, rowIndex) => (
                <div className="pr" key={rowIndex}>
                  {row.map(theme => (
                    <button
                      type="button"
                      key={theme.id}
                      className={theme.id === activeTheme.id ? 'pill on' : 'pill'}
                      aria-pressed={theme.id === activeTheme.id}
                      onClick={() => setActiveTheme(theme)}
                    >
                      {theme.name} View
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="panel" data-reveal>
            <div className="top">
              <div className="row"><span className="t">New themes are in progress....</span><a className="u" href="/themes">Explore Future Themes here</a></div>
              <div><p>Share your email address or any social links which we can use to tell you when the new themes are available.</p><p>Don’t worry, we won’t sell or spam you. Pinky Promise!!</p></div>
            </div>
            <CaptureForm label="Email or social handle" placeholder="Share email or any social handle" />
          </div>
        </section>

        <section className="why">
          <h2 className="h2" style={{ width: '100%' }} data-reveal>Why I am building this?</h2>
          <div className="wb" data-reveal style={{ '--d': 1 }}>
            <div className="bk">
              <img src={a('why-book.webp')} alt="" style={{ inset: '.55% 11.68% 11.14% 11.58%', width: '76.74%', height: '88.31%' }} />
              <div className="txt">
                <p>We all have things that say a little something about us. For me, books are one of them.</p><p />
                <p>So I wanted to make a simple place where you can bring your bookshelf online, make it your own, and let people see a small piece of who you are.</p><p />
                <p>And being a designer, I thought, why not make building our online library a little more fun and exciting? </p><p />
                <p>Setup your library today!</p>
              </div>
              <img src={a('cffcc.svg')} alt="" style={{ inset: '.55% 77.86% 11.14% 11.58%', width: '10.56%', height: '88.31%' }} />
              <img src={a('2a93c.svg')} alt="" style={{ inset: '78.38% 11.69% .66% 11.57%', width: '76.74%', height: '20.96%' }} />
              <img src={a('cd50d.svg')} alt="" style={{ inset: '83.32% 14.61% 5.59% 17.16%', width: '68.23%', height: '11.09%' }} />
              <div className="bar" />
            </div>
            <div className="tab">My Bookshelf</div>
          </div>
        </section>

        <section className="open" id="stories">
          <div className="pic"><img src={a('open-book-bg.jpg')} alt="" /></div>
          <div className="oc">
            <div className="hd" data-reveal><h2 className="h2" style={{ whiteSpace: 'normal' }}>We are an open book!</h2><p>Everything you need to know about bookshelf.cv</p></div>
            <div className="hcs">
              {faqCards.map((card, index) => (
                <div className="hc" key={card.title} data-reveal style={{ '--d': index + 1 }}>
                  <div className="in"><h4>{card.title}</h4><div className="b">{card.body}</div></div>
                  <div className="sp" style={{ background: card.color }} />
                </div>
              ))}
            </div>
            <div className="panel" data-reveal>
              <div className="t">If you get a question., Do share it. You will get an answer within 24 hours. No AI replies.</div>
              <CaptureForm label="Your question" placeholder="Share your questions." />
            </div>
          </div>
          <div className="say">
            <h2 className="h2" style={{ width: '100%' }} data-reveal>What book readers are saying...</h2>
            <div className="rows">
              {readerRows.map((row, index) => (
                <div className={index ? 'r r2' : 'r'} key={index}>
                  {row.map(([right, left], cardIndex) => <Testimonial key={cardIndex} right={right} left={left} theme={themes[(index * 4 + cardIndex) % themes.length].id} order={cardIndex} />)}
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="btn s av" data-reveal onClick={onStart} style={{ padding: '16px 120px', position: 'relative' }}>Create your bookshelf -  It’s Free</button>
        </section>

        <section className="cta2">
          <div className="m">
            <div className="c" data-reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <h2 className="h2" style={{ color: '#faf3e1', width: 672 }}>Your shelf is waiting for you.</h2>
                <p className="l">It takes 5 minutes and it's free. Every book you've ever loved deserves a home this beautiful.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <button type="button" className="bt" onClick={onStart}>Setup My Bookshelf — Free →</button>
                <small>No credit card. No commitment. Cancel anytime.</small>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="foot"><a href="/">Partner with Us</a><i className="dot" /><a href="#stories">Blogs</a><i className="dot" /><a href="/">Other Usecases</a><i className="dot" /><a href="/">Contact Us</a><i className="dot" /><a href="/">What is coming up? (Roadmap)</a></div>
    </div>
  );
}
