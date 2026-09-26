export default function BookDecorations({ variant = 'all' }) {
  if (variant === 'none') return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      {/* Top Left: Wireframe sketch open book */}
      <svg
        viewBox="0 0 160 120"
        className="absolute -left-6 top-8 w-28 opacity-70 sm:-left-4 sm:top-12 sm:w-44 lg:w-48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 70 C45 55, 75 58, 80 82 C85 58, 115 55, 140 70 L135 30 C110 15, 85 18, 80 42 C75 18, 50 15, 25 30 Z"
          stroke="#b8b0a5"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path d="M80 42 L80 82" stroke="#b8b0a5" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M28 42 C50 30, 72 32, 78 52" stroke="#b8b0a5" strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M28 52 C50 40, 72 42, 78 62" stroke="#b8b0a5" strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M132 42 C110 30, 88 32, 82 52" stroke="#b8b0a5" strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M132 52 C110 40, 88 42, 82 62" stroke="#b8b0a5" strokeWidth="1.5" strokeOpacity="0.6" />
      </svg>

      {/* Top Right: Sky Blue angled hardcover book with golden bookmark ribbon */}
      <div className="absolute -right-5 top-12 sm:-right-4 sm:top-14 lg:top-16">
        <svg
          viewBox="0 0 140 140"
          className="w-24 sm:w-36 lg:w-40 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pages block */}
          <path
            d="M48 24 L108 52 L88 122 L28 94 Z"
            fill="#f5efe6"
          />
          {/* Book front cover */}
          <path
            d="M45 20 L107 48 C110 50, 112 53, 110 57 L88 125 C87 128, 84 130, 80 128 L20 100 C17 98, 15 95, 17 91 L38 23 C40 20, 42 19, 45 20 Z"
            fill="#38b6ff"
          />
          {/* Book spine line */}
          <path
            d="M20 100 L38 23"
            stroke="#1d8cd7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Book crease */}
          <path
            d="M26 97 L44 26"
            stroke="#1b7fc4"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          {/* Gold ribbon bookmark */}
          <path
            d="M72 40 L76 72 L82 66 L88 74 L84 45"
            fill="#fbb03b"
          />
        </svg>
      </div>

      {/* Bottom Left: Golden Yellow open book with curved pages */}
      <div className="absolute -left-5 bottom-12 sm:-left-3 sm:bottom-16 lg:bottom-20">
        <svg
          viewBox="0 0 160 140"
          className="w-28 sm:w-40 lg:w-44 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back cover */}
          <path
            d="M18 102 C45 88, 75 92, 80 114 C85 92, 115 88, 142 102 L146 54 C118 40, 86 44, 80 66 C74 44, 42 40, 14 54 Z"
            fill="#e29b00"
          />
          {/* Pages */}
          <path
            d="M20 96 C46 83, 74 87, 79 108 C84 87, 112 83, 138 96 L142 50 C116 38, 86 42, 80 62 C74 42, 44 38, 18 50 Z"
            fill="#fcfaf4"
          />
          {/* Spine fold */}
          <path d="M80 64 L80 112" stroke="#d48b00" strokeWidth="2.5" />
          {/* Top cover flaps */}
          <path
            d="M14 54 C42 40, 74 44, 80 66 L78 64 C72 42, 42 38, 16 52 Z"
            fill="#f5b300"
          />
          <path
            d="M80 66 C86 44, 118 40, 146 54 L144 52 C116 38, 86 42, 80 64 Z"
            fill="#f5b300"
          />
        </svg>
      </div>

      {/* Bottom Right: Terracotta / Coral angled book */}
      <div className="absolute -right-6 bottom-10 sm:-right-4 sm:bottom-14 lg:bottom-16">
        <svg
          viewBox="0 0 150 140"
          className="w-26 sm:w-38 lg:w-42 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Page body */}
          <path
            d="M32 46 L95 24 L124 94 L61 116 Z"
            fill="#f8f4ec"
          />
          {/* Cover */}
          <path
            d="M28 44 C29 40, 33 38, 37 39 L100 61 C104 62, 106 66, 105 70 L83 128 C82 132, 78 134, 74 133 L11 111 C7 110, 5 106, 6 102 Z"
            fill="#f16a42"
          />
          {/* Spine edge */}
          <path
            d="M6 102 L28 44"
            stroke="#d44b24"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Embossed stripe */}
          <path
            d="M20 98 L38 52"
            stroke="#e0582f"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
        </svg>
      </div>
    </div>
  );
}
