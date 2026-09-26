const steps = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    iconClass: 'bg-[#087f8c] text-white',
    title: 'Sign Up Free',
    description:
      'Create your account in 30 seconds. No credit card, no commitments. Just your email.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    iconClass: 'bg-[#e13a00] text-white',
    title: 'Add Your Books',
    description:
      'Import from Goodreads, snap your shelf, or search our library of 20M+ titles. Easy.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    ),
    iconClass: 'bg-[#e7b51b] text-white',
    title: 'Go Live Instantly',
    description:
      'Hit publish and get your bookshelf.cv/yourname link. Share it anywhere you live online.',
  },
];

export default function LandingPage({ onStart, onDemo }) {
  return (
    <main className="w-full px-5 pb-24 text-center sm:px-8">
      {/* Hero Section */}
      <section className="mx-auto max-w-[860px] pt-14 sm:pt-24">
        <h1 className="font-heading text-[34px] leading-[1.1] sm:text-[52px] text-[#27221e]">
          <span className="block">Your library, beautifully</span>
          <span className="block mt-1">
            displayed live in <span className="text-[#e13a00]">5 minutes</span>
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-[700px] font-serif text-[18px] sm:text-[21px] leading-relaxed text-[#514d46]">
          Create a stunning virtual bookshelf that shows the
          <br className="hidden sm:block" /> world what you’ve been reading.
        </p>

        <p className="mt-4 text-[15px] font-medium text-[#706a61] sm:text-[17px]">
          No Coding Required. <span className="px-1.5 text-[#e13a00] font-bold">•</span> Free Forever{' '}
          <span className="px-1.5 text-[#e13a00] font-bold">•</span> No Hosting.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={onStart}
            className="h-[56px] w-full rounded-xl bg-[#e13a00] px-7 text-[17px] font-semibold text-white shadow-[0_4px_14px_rgba(225,58,0,0.25)] transition hover:bg-[#c93200] sm:w-auto sm:min-w-[320px]"
          >
            Create your bookshelf - It’s Free
          </button>
          <button
            type="button"
            onClick={onDemo}
            className="h-[56px] w-full rounded-xl border border-[#e13a00] bg-white px-7 text-[17px] font-semibold text-[#27221e] shadow-xs transition hover:bg-[#fff9f5] sm:w-auto sm:min-w-[190px]"
          >
            See Demo View
          </button>
        </div>
      </section>

      {/* 3-Step Feature Cards Section */}
      <section className="mx-auto mt-24 max-w-[960px] sm:mt-32">
        <h2 className="font-heading text-[28px] sm:text-[40px] text-[#27221e]">
          Your shelf in 3 steps
        </h2>
        <p className="mt-2 text-[14px] sm:text-[16px] text-[#6b645b]">
          Sign Up Free <span className="px-1.5 text-[#e13a00] font-bold">•</span> Choose Shelf Theme{' '}
          <span className="px-1.5 text-[#e13a00] font-bold">•</span> Make It Live.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-3 sm:gap-6">
          {steps.map((step) => (
            <article
              key={step.title}
              className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-black/5 bg-[#ece7df] p-6 sm:p-7 shadow-xs"
            >
              <div>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs ${step.iconClass}`}
                  aria-hidden="true"
                >
                  {step.icon}
                </span>
                <h3 className="mt-5 font-serif text-[20px] font-bold text-[#292722]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#55514c]">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-8 h-14 rounded-xl bg-[#16834c] px-9 text-[16px] font-semibold text-white shadow-[0_4px_12px_rgba(22,131,76,0.25)] transition hover:bg-[#116d3e]"
        >
          Create your bookshelf
        </button>
      </section>
    </main>
  );
}
