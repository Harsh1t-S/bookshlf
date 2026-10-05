export default function CtaSection({ onStart }) {
  return (
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
  );
}
