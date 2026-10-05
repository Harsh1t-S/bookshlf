import { art } from './content.jsx';
import { stepCards } from './content.jsx';

export default function StepsSection() {
  return (
    <section className="steps">
      <div className="hd" data-reveal>
        <h2 className="h2">Your shelf in 3 steps</h2>
        <div className="sub"><span>Sign Up Free</span><i className="dot" /><span>Choose Shelf Theme</span><i className="dot" /><span>Make It Live.</span></div>
      </div>
      <div className="shelfwrap">
        <div className="cards">
          {stepCards.map((card, index) => (
            <div key={card.title} className="card" data-reveal style={{ '--d': index + 1, backgroundColor: card.color, filter: `drop-shadow(8px 0 0 ${card.color})`, height: card.fixed ? 300 : undefined }}>
              <div className="ic"><img src={art(card.icon)} alt="" /></div>
              <div className="tx"><h3>{card.title}</h3>{card.body}</div>
            </div>
          ))}
        </div>
        <div className="shelf" />
      </div>
    </section>
  );
}
