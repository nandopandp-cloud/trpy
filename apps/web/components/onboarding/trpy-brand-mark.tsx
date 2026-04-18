// Trpy brand mark for onboarding welcome — plane + route arc + destination pin

export function TrpyBrandMark() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bm-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338ca" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="bm-trail" x1="20" y1="60" x2="62" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1" />
          <stop offset="1" stopColor="white" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="80" height="80" rx="20" fill="url(#bm-bg)" />
      {/* Top gloss */}
      <rect x="0" y="0" width="80" height="36" rx="20" fill="white" opacity="0.07" />

      {/* Arc trail — dashed route */}
      <path
        d="M 22 60 Q 26 32 58 20"
        stroke="white"
        strokeWidth="1.8"
        strokeDasharray="3 4"
        strokeLinecap="round"
        opacity="0.3"
        fill="none"
      />
      {/* Gradient solid trail on top */}
      <path
        d="M 22 60 Q 26 32 58 20"
        stroke="url(#bm-trail)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Destination pin at top-right */}
      <circle cx="60" cy="19" r="6.5" fill="white" opacity="0.95" />
      <circle cx="60" cy="19" r="3" fill="#4338ca" />
      <ellipse cx="60" cy="26.5" rx="4" ry="1.5" fill="white" opacity="0.18" />

      {/* Plane — centered bottom-left, tilted ~45° toward pin */}
      {/* Body — long diagonal */}
      <path
        d="M 18 57 L 38 37"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Nose tip */}
      <circle cx="39" cy="36" r="3" fill="white" />
      {/* Left wing */}
      <path
        d="M 25 50 L 16 42 L 22 40 L 31 46 Z"
        fill="white"
        opacity="0.9"
      />
      {/* Tail fin */}
      <path
        d="M 20 55 L 14 52 L 16 48 L 22 52 Z"
        fill="white"
        opacity="0.75"
      />

      {/* Origin dot */}
      <circle cx="17" cy="60" r="3.5" fill="white" opacity="0.25" />
      <circle cx="17" cy="60" r="1.8" fill="white" opacity="0.5" />
    </svg>
  );
}
