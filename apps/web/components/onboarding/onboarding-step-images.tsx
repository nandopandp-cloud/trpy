// SVG illustrations for each onboarding step — mobile only

export function StepImageNewTrip() {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* App background */}
      <rect width="320" height="160" fill="#18181b" rx="0" />

      {/* Top bar */}
      <rect x="0" y="0" width="320" height="36" fill="#27272a" />
      <circle cx="24" cy="18" r="8" fill="#3f3f46" />
      <rect x="40" y="14" width="60" height="8" rx="4" fill="#3f3f46" />
      <circle cx="296" cy="18" r="10" fill="#4f46e5" opacity="0.3" />
      <circle cx="296" cy="18" r="6" fill="#4f46e5" />

      {/* Welcome heading */}
      <rect x="16" y="50" width="120" height="10" rx="5" fill="#52525b" />
      <rect x="16" y="66" width="80" height="7" rx="3.5" fill="#3f3f46" />

      {/* "Nova viagem" button — highlighted */}
      <rect x="16" y="84" width="138" height="40" rx="12" fill="#4f46e5" />
      <rect x="36" y="100" width="10" height="10" rx="5" fill="white" opacity="0.9" />
      <rect x="52" y="102" width="60" height="6" rx="3" fill="white" opacity="0.9" />
      {/* Pulse ring */}
      <rect x="8" y="76" width="154" height="56" rx="16" fill="none" stroke="#6366f1" strokeWidth="2.5" opacity="0.7" />

      {/* Recent trips row */}
      <rect x="172" y="84" width="62" height="40" rx="10" fill="#27272a" />
      <rect x="180" y="97" width="46" height="5" rx="2.5" fill="#52525b" />
      <rect x="180" y="107" width="30" height="4" rx="2" fill="#3f3f46" />

      <rect x="244" y="84" width="62" height="40" rx="10" fill="#27272a" />
      <rect x="252" y="97" width="46" height="5" rx="2.5" fill="#52525b" />
      <rect x="252" y="107" width="30" height="4" rx="2" fill="#3f3f46" />

      {/* Bottom nav */}
      <rect x="0" y="132" width="320" height="28" fill="#27272a" />
      <rect x="30" y="140" width="16" height="12" rx="3" fill="#4f46e5" opacity="0.4" />
      <rect x="100" y="140" width="16" height="12" rx="3" fill="#3f3f46" />
      <rect x="172" y="140" width="16" height="12" rx="3" fill="#3f3f46" />
      <rect x="244" y="140" width="16" height="12" rx="3" fill="#3f3f46" />
    </svg>
  );
}

export function StepImageTrips() {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="320" height="160" fill="#18181b" />

      {/* Top bar */}
      <rect x="0" y="0" width="320" height="36" fill="#27272a" />
      <rect x="16" y="14" width="70" height="8" rx="4" fill="#52525b" />
      <circle cx="296" cy="18" r="10" fill="#4f46e5" opacity="0.3" />
      <circle cx="296" cy="18" r="6" fill="#4f46e5" />

      {/* Section heading */}
      <rect x="16" y="46" width="90" height="9" rx="4.5" fill="#52525b" />
      <rect x="252" y="47" width="52" height="7" rx="3.5" fill="#4f46e5" opacity="0.6" />

      {/* Trip card 1 — highlighted */}
      <rect x="16" y="62" width="288" height="38" rx="12" fill="#27272a" />
      <rect x="16" y="62" width="288" height="38" rx="12" fill="none" stroke="#4f46e5" strokeWidth="1.5" opacity="0.5" />
      <rect x="28" y="72" width="28" height="18" rx="6" fill="#4f46e5" opacity="0.25" />
      <path d="M34 81 l4-4 4 4 4-4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <rect x="66" y="72" width="80" height="6" rx="3" fill="#e4e4e7" />
      <rect x="66" y="82" width="55" height="5" rx="2.5" fill="#52525b" />
      <rect x="248" y="74" width="44" height="14" rx="7" fill="#4f46e5" opacity="0.2" />
      <rect x="254" y="79" width="32" height="4" rx="2" fill="#6366f1" />

      {/* Trip card 2 */}
      <rect x="16" y="108" width="288" height="38" rx="12" fill="#27272a" />
      <rect x="28" y="118" width="28" height="18" rx="6" fill="#3f3f46" />
      <rect x="66" y="118" width="70" height="6" rx="3" fill="#52525b" />
      <rect x="66" y="128" width="50" height="5" rx="2.5" fill="#3f3f46" />
      <rect x="248" y="120" width="44" height="14" rx="7" fill="#3f3f46" />

      {/* Bottom nav — trips highlighted */}
      <rect x="0" y="148" width="320" height="12" fill="#27272a" />
      <rect x="100" y="150" width="16" height="8" rx="2" fill="#4f46e5" opacity="0.7" />
    </svg>
  );
}

export function StepImageBudget() {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="320" height="160" fill="#18181b" />

      {/* Top bar */}
      <rect x="0" y="0" width="320" height="36" fill="#27272a" />
      <rect x="16" y="14" width="70" height="8" rx="4" fill="#52525b" />

      {/* Budget summary card */}
      <rect x="16" y="44" width="288" height="56" rx="14" fill="#1e1e2e" />
      <rect x="16" y="44" width="288" height="56" rx="14" fill="none" stroke="#4f46e5" strokeWidth="1" opacity="0.4" />
      <rect x="28" y="54" width="60" height="6" rx="3" fill="#52525b" />
      <rect x="28" y="64" width="110" height="14" rx="7" fill="#e4e4e7" />
      {/* Progress bar */}
      <rect x="28" y="84" width="264" height="8" rx="4" fill="#3f3f46" />
      <rect x="28" y="84" width="160" height="8" rx="4" fill="#4f46e5" />

      {/* Expense items */}
      <rect x="16" y="108" width="138" height="38" rx="12" fill="#27272a" />
      <rect x="28" y="118" width="24" height="8" rx="4" fill="#22c55e" opacity="0.3" />
      <rect x="28" y="130" width="60" height="5" rx="2.5" fill="#52525b" />
      <rect x="100" y="118" width="40" height="8" rx="4" fill="#52525b" />

      <rect x="166" y="108" width="138" height="38" rx="12" fill="#27272a" />
      <rect x="178" y="118" width="24" height="8" rx="4" fill="#f59e0b" opacity="0.3" />
      <rect x="178" y="130" width="60" height="5" rx="2.5" fill="#52525b" />
      <rect x="250" y="118" width="40" height="8" rx="4" fill="#52525b" />

      {/* Bottom nav — budget highlighted */}
      <rect x="0" y="148" width="320" height="12" fill="#27272a" />
      <rect x="172" y="150" width="16" height="8" rx="2" fill="#4f46e5" opacity="0.7" />
    </svg>
  );
}

export function StepImageFavorites() {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="320" height="160" fill="#18181b" />

      {/* Top bar */}
      <rect x="0" y="0" width="320" height="36" fill="#27272a" />
      <rect x="16" y="14" width="80" height="8" rx="4" fill="#52525b" />

      {/* Grid of favorites — 2 cols */}
      {/* Card 1 */}
      <rect x="16" y="44" width="138" height="90" rx="14" fill="#27272a" />
      <rect x="16" y="44" width="138" height="55" rx="14" fill="#3f3f46" />
      <rect x="16" y="85" width="138" height="14" fill="#3f3f46" />
      {/* Gradient overlay sim */}
      <rect x="16" y="44" width="138" height="55" rx="14" fill="url(#g1)" opacity="0.5" />
      {/* Heart icon */}
      <circle cx="140" cy="58" r="10" fill="#18181b" opacity="0.6" />
      <path d="M140 62 c0 0 -6-4 -6-7.5 a3 3 0 0 1 6 0 a3 3 0 0 1 6 0 c0 3.5 -6 7.5 -6 7.5z" fill="#f43f5e" />
      <rect x="24" y="104" width="70" height="6" rx="3" fill="#e4e4e7" />
      <rect x="24" y="114" width="50" height="5" rx="2.5" fill="#52525b" />

      {/* Card 2 */}
      <rect x="166" y="44" width="138" height="90" rx="14" fill="#27272a" />
      <rect x="166" y="44" width="138" height="55" rx="14" fill="#3f3f46" />
      <rect x="166" y="85" width="138" height="14" fill="#3f3f46" />
      <circle cx="290" cy="58" r="10" fill="#18181b" opacity="0.6" />
      <path d="M290 62 c0 0 -6-4 -6-7.5 a3 3 0 0 1 6 0 a3 3 0 0 1 6 0 c0 3.5 -6 7.5 -6 7.5z" fill="#f43f5e" />
      <rect x="174" y="104" width="70" height="6" rx="3" fill="#e4e4e7" />
      <rect x="174" y="114" width="50" height="5" rx="2.5" fill="#52525b" />

      {/* Bottom nav — favorites highlighted */}
      <rect x="0" y="148" width="320" height="12" fill="#27272a" />
      <rect x="244" y="150" width="16" height="8" rx="2" fill="#4f46e5" opacity="0.7" />

      <defs>
        <linearGradient id="g1" x1="16" y1="44" x2="16" y2="99" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" stopOpacity="0" />
          <stop offset="1" stopColor="#4f46e5" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function StepImageSettings() {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="320" height="160" fill="#18181b" />

      {/* Top bar */}
      <rect x="0" y="0" width="320" height="36" fill="#27272a" />
      <rect x="16" y="14" width="80" height="8" rx="4" fill="#52525b" />

      {/* Profile card */}
      <rect x="16" y="44" width="288" height="42" rx="14" fill="#27272a" />
      <circle cx="44" cy="65" r="12" fill="#4f46e5" opacity="0.4" />
      <circle cx="44" cy="65" r="8" fill="#4f46e5" opacity="0.6" />
      <rect x="64" y="58" width="80" height="7" rx="3.5" fill="#e4e4e7" />
      <rect x="64" y="70" width="120" height="5" rx="2.5" fill="#52525b" />

      {/* Preferences card */}
      <rect x="16" y="94" width="288" height="56" rx="14" fill="#27272a" />
      {/* Theme row */}
      <rect x="28" y="104" width="22" height="14" rx="5" fill="#3f3f46" />
      <rect x="58" y="106" width="60" height="5" rx="2.5" fill="#e4e4e7" />
      <rect x="58" y="114" width="80" height="4" rx="2" fill="#52525b" />
      {/* Toggle */}
      <rect x="250" y="107" width="40" height="12" rx="6" fill="#4f46e5" opacity="0.6" />
      <circle cx="282" cy="113" r="5" fill="white" />
      {/* Divider */}
      <rect x="28" y="122" width="264" height="1" fill="#3f3f46" />
      {/* Language row */}
      <rect x="28" y="127" width="22" height="14" rx="5" fill="#3f3f46" />
      <rect x="58" y="129" width="50" height="5" rx="2.5" fill="#e4e4e7" />
      <rect x="58" y="137" width="40" height="4" rx="2" fill="#52525b" />
      <rect x="250" y="130" width="44" height="8" rx="4" fill="#3f3f46" />
    </svg>
  );
}
