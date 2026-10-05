import { art } from './content.jsx';

export default function WhySection() {
  return (
    <section className="why">
      <h2 className="h2" style={{ width: '100%' }} data-reveal>Why I am building this?</h2>
      <div className="wb" data-reveal style={{ '--d': 1 }}>
        <div className="bk">
          <img src={art('why-book.webp')} alt="" style={{ inset: '.55% 11.68% 11.14% 11.58%', width: '76.74%', height: '88.31%' }} />
          <div className="txt">
            <p>We all have things that say a little something about us. For me, books are one of them.</p><p />
            <p>So I wanted to make a simple place where you can bring your bookshelf online, make it your own, and let people see a small piece of who you are.</p><p />
            <p>And being a designer, I thought, why not make building our online library a little more fun and exciting? </p><p />
            <p>Setup your library today!</p>
          </div>
          <img src={art('cffcc.svg')} alt="" style={{ inset: '.55% 77.86% 11.14% 11.58%', width: '10.56%', height: '88.31%' }} />
          <img src={art('2a93c.svg')} alt="" style={{ inset: '78.38% 11.69% .66% 11.57%', width: '76.74%', height: '20.96%' }} />
          <img src={art('cd50d.svg')} alt="" style={{ inset: '83.32% 14.61% 5.59% 17.16%', width: '68.23%', height: '11.09%' }} />
          <div className="bar" />
        </div>
        <div className="tab">My Bookshelf</div>
      </div>
    </section>
  );
}
