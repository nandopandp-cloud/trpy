// Trpy brand mark for onboarding welcome — animated SVG icon

export function TrpyBrandMark() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bm-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338ca" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="bm-trail" x1="12" y1="56" x2="68" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity="0.5" />
        </linearGradient>
        <filter id="bm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background rounded square */}
      <rect width="80" height="80" rx="22" fill="url(#bm-bg)" />

      {/* Subtle inner highlight */}
      <rect x="1" y="1" width="78" height="38" rx="21" fill="white" opacity="0.06" />

      {/* Dotted arc trail — destination path */}
      <path
        d="M 18 58 Q 20 30 52 22"
        stroke="white"
        strokeWidth="1.5"
        strokeDasharray="2.5 3.5"
        strokeLinecap="round"
        opacity="0.35"
        fill="none"
      />

      {/* Gradient trail glow */}
      <path
        d="M 18 58 Q 20 30 52 22"
        stroke="url(#bm-trail)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Destination pin — landing point */}
      <circle cx="54" cy="21" r="5" fill="white" opacity="0.9" />
      <circle cx="54" cy="21" r="2.5" fill="#4338ca" />
      {/* Pin drop shadow */}
      <ellipse cx="54" cy="27" rx="4" ry="1.5" fill="white" opacity="0.15" />

      {/* Takeoff plane — bottom left, angled toward pin */}
      {/* Wing */}
      <path d="M16 60 l6-10 4 2 -5 9z" fill="white" opacity="0.95" />
      {/* Body */}
      <path d="M18 62 l10-14 5 3 -10 14z" fill="white" />
      {/* Tail fin */}
      <path d="M18 62 l-2-4 5-2z" fill="white" opacity="0.7" />

      {/* Origin dot */}
      <circle cx="16" cy="63" r="3" fill="white" opacity="0.4" />
      <circle cx="16" cy="63" r="1.5" fill="white" opacity="0.7" />
    </svg>
  );
}
