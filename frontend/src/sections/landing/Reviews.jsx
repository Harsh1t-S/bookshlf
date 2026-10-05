import { themes } from '../../data/themes.js';
import { art, readerRows } from './content.jsx';

function Testimonial({ right, left, theme, hidden }) {
  return (
    <div className="tc" aria-hidden={hidden || undefined}>
      <div className="v" style={{ left: '50%', right: 0 }}><div><img src={art(right)} alt="" /></div></div>
      <p className="q">"Setup took 2 minutes. Literally timed it. Now I have a portfolio that actually represents my work professionally."</p>
      <div className="v" style={{ left: 0, right: '50%' }}><div><img src={art(left)} alt="" /></div></div>
      <div className="pr2">
        <div>
          <div className="av2"><img src={art('reader-avatar.jpg')} alt="" /></div>
          <div className="nm"><b>Aman Gupta</b><span>Simple Themes</span></div>
        </div>
        <a className="lk" href={`/demo?theme=${theme}`} tabIndex={hidden ? -1 : undefined}><img src={art('4606f.svg')} alt="" />View Bookshelf</a>
      </div>
    </div>
  );
}

// Two rows of reader quotes drifting sideways in opposite directions.
export default function Reviews() {
  return (
    <div className="say">
      <h2 className="h2" style={{ width: '100%' }} data-reveal>What book readers are saying...</h2>
      <div className="rows">
        {readerRows.map((row, index) => (
          <div className={index ? 'r r2' : 'r'} key={index} data-reveal style={{ '--d': index }}>
            {/* Cards repeat once so the loop scrolls seamlessly; the copy is hidden from assistive tech. */}
            <div className="mq">
              {[false, true].flatMap(hidden => row.map(([right, left], cardIndex) => (
                <Testimonial key={`${hidden}-${cardIndex}`} hidden={hidden} right={right} left={left} theme={themes[(index * 4 + cardIndex) % themes.length].id} />
              )))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
