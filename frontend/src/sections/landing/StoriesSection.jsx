import CaptureForm from './CaptureForm.jsx';
import { art, faqCards } from './content.jsx';
import Reviews from './Reviews.jsx';

// "We are an open book!": FAQ cards, the question form and reader reviews (#stories, #contact).
export default function StoriesSection({ onStart }) {
  return (
    <section className="open" id="stories">
      <div className="pic"><img src={art('open-book-bg.jpg')} alt="" /></div>
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
        <div className="panel" id="contact" data-reveal>
          <div className="t">If you have a question, do share it. You will get an answer within 24 hours. No AI replies.</div>
          <CaptureForm label="Your question" placeholder="Share your questions." emptyMessage="Type your question first." />
        </div>
      </div>
      <Reviews />
      <button type="button" className="btn s av" data-reveal onClick={onStart} style={{ padding: '16px 120px', position: 'relative' }}>Create your bookshelf -  It’s Free</button>
    </section>
  );
}
