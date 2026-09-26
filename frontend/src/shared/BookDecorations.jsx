function OpenBook({ className = '', left = '#f2c62b', right = '#38b6df', outline = '#178eb5', rotate = 0 }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 120"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18 28c24-7 45-2 62 13v62c-18-15-39-20-62-13V28Z" fill={left} stroke={outline} strokeWidth="2" strokeLinejoin="round" />
      <path d="M80 41c18-15 39-20 62-13v62c-23-7-44-2-62 13V41Z" fill={right} stroke={outline} strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 28c24-7 45-2 62 13v62c-18-15-39-20-62-13V28Zm124 0c-24-7-45-2-62 13v62c18-15 39-20 62-13V28Z" stroke={outline} strokeWidth="2" strokeLinejoin="round" />
      <path d="M27 42c17-4 33 0 44 8m-44 5c17-4 33 0 44 8m0-21c-17-13-36-17-55-13m117 13c-17-4-33 0-44 8m44-3c-17-4-33 0-44 8m0-21c17-13 36-17 55-13" stroke="white" strokeOpacity=".72" strokeWidth="2" strokeLinecap="round" />
      <path d="M80 41v62" stroke={outline} strokeOpacity=".8" strokeWidth="2" />
    </svg>
  );
}

function WireframeBook({ className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 70c25-15 55-12 60 12 5-24 35-27 60-12l-5-40c-25-15-50-12-55 12-5-24-35-27-60-12l-5 40Z" stroke="#b8b0a5" strokeWidth="2" strokeLinejoin="round" />
      <path d="M80 42v40M28 42c20-10 42-10 50 10M28 52c20-10 42-10 50 10m54-20c-20-10-42-10-50 10m50 0c-20-10-42-10-50 10" stroke="#b8b0a5" strokeWidth="1.5" strokeOpacity=".65" strokeLinecap="round" />
    </svg>
  );
}

export default function BookDecorations({ variant = 'landing' }) {
  if (variant === 'none') return null;

  const isLanding = variant === 'landing' || variant === 'all';
  const topPosition = variant === 'shelf' ? 'top-[72px] sm:top-[80px]' : 'top-[118px] sm:top-[140px]';
  const edgeBook = `absolute hidden ${topPosition} w-[145px] opacity-90 sm:block`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      {isLanding ? (
        <>
          <WireframeBook className="absolute -left-7 top-7 w-[112px] opacity-65 sm:-left-4 sm:top-10 sm:w-[155px]" />
          <OpenBook className="absolute -right-6 top-10 w-[116px] opacity-90 sm:-right-3 sm:top-12 sm:w-[160px]" rotate={4} />
          <OpenBook className="absolute -left-6 bottom-10 w-[112px] opacity-90 sm:-left-3 sm:bottom-14 sm:w-[150px]" left="#f6c927" right="#f4d34e" outline="#d7a713" rotate={-4} />
          <OpenBook className="absolute -right-7 bottom-9 w-[112px] opacity-90 sm:-right-4 sm:bottom-14 sm:w-[150px]" left="#f27b59" right="#ed6847" outline="#ca5438" rotate={4} />
        </>
      ) : (
        <>
          <OpenBook className={`${edgeBook} -left-5 sm:-left-5`} left="#f4c72a" right="#f8d84f" outline="#d7a713" rotate={-5} />
          <OpenBook className={`${edgeBook} -right-5 sm:-right-5`} left="#34b5dc" right="#4ac3e6" outline="#198eaf" rotate={5} />
        </>
      )}
    </div>
  );
}
