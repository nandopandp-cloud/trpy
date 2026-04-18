// Pixel-faithful SVG illustrations of real Trpy UI — mobile onboarding only
// No bottom nav rendered (it breaks the illustrations at small sizes)

// ── Shared topbar ──────────────────────────────────────────────────────────────
function Topbar() {
  return (
    <>
      <rect x="0" y="0" width="360" height="46" fill="#18181b" />
      <rect x="0" y="45" width="360" height="1" fill="#27272a" />
      {/* Trpy logo mark */}
      <rect x="14" y="12" width="22" height="22" rx="7" fill="#6366f1" />
      <rect x="20" y="17" width="10" height="2.5" rx="1.25" fill="white" />
      <rect x="23.75" y="19.5" width="2.5" height="10" rx="1.25" fill="white" />
      {/* Page title */}
      <rect x="46" y="18" width="75" height="9" rx="4.5" fill="#3f3f46" />
      {/* Avatar */}
      <circle cx="338" cy="23" r="13" fill="#27272a" />
      <circle cx="338" cy="20" r="5" fill="#3f3f46" />
      <ellipse cx="338" cy="30" rx="8" ry="5" fill="#3f3f46" />
    </>
  );
}

// ── STEP 1: Nova Viagem ────────────────────────────────────────────────────────
export function StepImageNewTrip() {
  return (
    <svg viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="nt-glow" cx="50%" cy="55%" r="45%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="360" height="160" fill="#09090b" />
      <ellipse cx="180" cy="105" rx="150" ry="55" fill="url(#nt-glow)" />

      <Topbar />

      {/* Welcome heading */}
      <rect x="16" y="58" width="145" height="10" rx="5" fill="#3f3f46" />
      <rect x="16" y="73" width="100" height="7" rx="3.5" fill="#27272a" />

      {/* Outer pulse ring */}
      <rect x="40" y="92" width="280" height="54" rx="24" fill="none" stroke="#4f46e5" strokeWidth="0.8" opacity="0.3" />
      <rect x="48" y="97" width="264" height="44" rx="20" fill="none" stroke="#6366f1" strokeWidth="1.3" opacity="0.55" />

      {/* Button body */}
      <rect x="56" y="101" width="248" height="36" rx="17" fill="#18181b" />
      <rect x="56" y="101" width="248" height="36" rx="17" fill="none" stroke="#4f46e5" strokeWidth="1.6" strokeOpacity="0.75" />

      {/* + icon */}
      <rect x="102" y="117.5" width="16" height="3" rx="1.5" fill="#6366f1" />
      <rect x="108.5" y="111" width="3" height="16" rx="1.5" fill="#6366f1" />

      {/* "Nova viagem" text */}
      <rect x="130" y="114" width="112" height="10" rx="5" fill="#d4d4d8" />
    </svg>
  );
}

// ── STEP 2: Viagens ────────────────────────────────────────────────────────────
export function StepImageTrips() {
  return (
    <svg viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="tr-active" x1="16" y1="70" x2="344" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e1b4b" stopOpacity="0.95" />
          <stop offset="1" stopColor="#1e1b4b" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <rect width="360" height="160" fill="#09090b" />
      <Topbar />

      {/* Section header */}
      <rect x="16" y="55" width="110" height="8" rx="4" fill="#52525b" />
      <rect x="264" y="56" width="80" height="7" rx="3.5" fill="#4f46e5" opacity="0.55" />

      {/* ── Active trip card ── */}
      <rect x="16" y="70" width="328" height="42" rx="14" fill="url(#tr-active)" />
      <rect x="16" y="70" width="328" height="42" rx="14" fill="none" stroke="#6366f1" strokeWidth="1.3" strokeOpacity="0.6" />

      {/* Pencil thumbnail */}
      <rect x="27" y="78" width="32" height="26" rx="9" fill="#312e81" opacity="0.85" />
      <path d="M36 96 l4-13 7 3 -4 12z" fill="#a5b4fc" opacity="0.9" />
      <path d="M40 83 l3-4 4 3" fill="#c7d2fe" opacity="0.7" />
      <path d="M36 96 l3-1 0 3z" fill="#818cf8" />

      {/* Name + date */}
      <rect x="70" y="79" width="165" height="8" rx="4" fill="#e4e4e7" />
      <rect x="70" y="91" width="105" height="6" rx="3" fill="#6366f1" opacity="0.45" />

      {/* Status badge */}
      <rect x="258" y="81" width="74" height="16" rx="8" fill="#312e81" opacity="0.7" />
      <rect x="266" y="87" width="58" height="5" rx="2.5" fill="#a5b4fc" />

      {/* ── Second trip card ── */}
      <rect x="16" y="120" width="328" height="36" rx="14" fill="#18181b" />
      <rect x="16" y="120" width="328" height="36" rx="14" fill="none" stroke="#27272a" strokeWidth="1" />
      <rect x="27" y="128" width="28" height="20" rx="8" fill="#27272a" />
      <rect x="65" y="130" width="125" height="7" rx="3.5" fill="#52525b" />
      <rect x="65" y="141" width="90" height="5" rx="2.5" fill="#3f3f46" />
      <rect x="264" y="132" width="68" height="13" rx="6.5" fill="#27272a" />
      <rect x="270" y="137" width="56" height="4" rx="2" fill="#3f3f46" />
    </svg>
  );
}

// ── STEP 3: Finanças ───────────────────────────────────────────────────────────
export function StepImageBudget() {
  return (
    <svg viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bg-bar" x1="28" y1="0" x2="336" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <rect width="360" height="160" fill="#09090b" />
      <Topbar />

      {/* Hero budget card */}
      <rect x="16" y="54" width="328" height="58" rx="15" fill="#18181b" />
      <rect x="16" y="54" width="328" height="58" rx="15" fill="none" stroke="#27272a" strokeWidth="1" />

      {/* "Orçamento total" */}
      <rect x="28" y="63" width="85" height="7" rx="3.5" fill="#52525b" />
      {/* Big amount */}
      <rect x="28" y="74" width="160" height="14" rx="7" fill="#e4e4e7" />

      {/* Progress track */}
      <rect x="28" y="96" width="308" height="7" rx="3.5" fill="#27272a" />
      {/* Progress fill 62% */}
      <rect x="28" y="96" width="191" height="7" rx="3.5" fill="url(#bg-bar)" />

      {/* Mini stat cards */}
      <rect x="16" y="120" width="164" height="36" rx="13" fill="#18181b" />
      <rect x="16" y="120" width="164" height="36" rx="13" fill="none" stroke="#27272a" strokeWidth="1" />
      <circle cx="36" cy="138" r="7" fill="#22c55e" opacity="0.2" />
      <circle cx="36" cy="138" r="4" fill="#22c55e" opacity="0.75" />
      <rect x="50" y="131" width="55" height="6" rx="3" fill="#52525b" />
      <rect x="50" y="141" width="90" height="7" rx="3.5" fill="#d4d4d8" />

      <rect x="188" y="120" width="156" height="36" rx="13" fill="#18181b" />
      <rect x="188" y="120" width="156" height="36" rx="13" fill="none" stroke="#27272a" strokeWidth="1" />
      <circle cx="207" cy="138" r="7" fill="#f59e0b" opacity="0.2" />
      <circle cx="207" cy="138" r="4" fill="#f59e0b" opacity="0.75" />
      <rect x="221" y="131" width="50" height="6" rx="3" fill="#52525b" />
      <rect x="221" y="141" width="85" height="7" rx="3.5" fill="#d4d4d8" />
    </svg>
  );
}

// ── STEP 4: Favoritos ─────────────────────────────────────────────────────────
export function StepImageFavorites() {
  return (
    <svg viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="fav-g1" x1="16" y1="55" x2="16" y2="155" gradientUnits="userSpaceOnUse">
          <stop stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.82" />
        </linearGradient>
        <linearGradient id="fav-g2" x1="188" y1="55" x2="188" y2="155" gradientUnits="userSpaceOnUse">
          <stop stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.82" />
        </linearGradient>
        <linearGradient id="fav-ocean" x1="16" y1="55" x2="172" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e3a5f" />
          <stop offset="1" stopColor="#0c1a2e" />
        </linearGradient>
        <linearGradient id="fav-mtn" x1="188" y1="55" x2="344" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1c2a1a" />
          <stop offset="1" stopColor="#0d1a0c" />
        </linearGradient>
        <clipPath id="fav-c1"><rect x="16" y="54" width="156" height="101" rx="16" /></clipPath>
        <clipPath id="fav-c2"><rect x="188" y="54" width="156" height="101" rx="16" /></clipPath>
      </defs>

      <rect width="360" height="160" fill="#09090b" />
      <Topbar />

      {/* Card 1 — Ocean */}
      <rect x="16" y="54" width="156" height="101" rx="16" fill="#0c1a2e" />
      <g clipPath="url(#fav-c1)">
        <rect x="16" y="54" width="156" height="101" fill="url(#fav-ocean)" />
        <path d="M16 112 Q46 104 76 113 Q106 122 140 110 Q158 104 172 112 L172 155 L16 155 Z" fill="#0e3460" opacity="0.9" />
        <path d="M16 120 Q48 113 78 122 Q108 131 142 118 L172 122 L172 155 L16 155 Z" fill="#0a2540" />
        <rect x="16" y="54" width="156" height="101" fill="url(#fav-g1)" />
      </g>
      <rect x="16" y="54" width="156" height="101" rx="16" fill="none" stroke="#1e3a5f" strokeWidth="1" />
      <circle cx="157" cy="70" r="13" fill="#09090b" opacity="0.6" />
      <path d="M157 74.5 c0 0-5-3.5-5-6.5 a2.8 2.8 0 0 1 5 0 a2.8 2.8 0 0 1 5 0 c0 3-5 6.5-5 6.5z" fill="#f43f5e" />
      <rect x="26" y="128" width="82" height="8" rx="4" fill="#f4f4f5" opacity="0.95" />
      <rect x="26" y="140" width="58" height="6" rx="3" fill="#a1a1aa" opacity="0.7" />

      {/* Card 2 — Mountain */}
      <rect x="188" y="54" width="156" height="101" rx="16" fill="#0d1a0c" />
      <g clipPath="url(#fav-c2)">
        <rect x="188" y="54" width="156" height="101" fill="url(#fav-mtn)" />
        <path d="M188 120 L215 88 L244 108 L268 78 L295 100 L344 86 L344 155 L188 155 Z" fill="#0d1207" opacity="0.95" />
        <path d="M215 88 l-5 13 8-5 8 5-5-13z" fill="#e5e7eb" opacity="0.45" />
        <path d="M268 78 l-4 11 6-4 6 4-4-11z" fill="#e5e7eb" opacity="0.35" />
        <rect x="188" y="54" width="156" height="101" fill="url(#fav-g2)" />
      </g>
      <rect x="188" y="54" width="156" height="101" rx="16" fill="none" stroke="#1c2a1a" strokeWidth="1" />
      <circle cx="329" cy="70" r="13" fill="#09090b" opacity="0.6" />
      <path d="M329 74.5 c0 0-5-3.5-5-6.5 a2.8 2.8 0 0 1 5 0 a2.8 2.8 0 0 1 5 0 c0 3-5 6.5-5 6.5z" fill="#f43f5e" />
      <rect x="198" y="128" width="82" height="8" rx="4" fill="#f4f4f5" opacity="0.95" />
      <rect x="198" y="140" width="58" height="6" rx="3" fill="#a1a1aa" opacity="0.7" />
    </svg>
  );
}

// ── STEP 5: Configurações ─────────────────────────────────────────────────────
export function StepImageSettings() {
  return (
    <svg viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="360" height="160" fill="#09090b" />
      <Topbar />

      {/* Profile card */}
      <rect x="16" y="54" width="328" height="46" rx="15" fill="#18181b" />
      <rect x="16" y="54" width="328" height="46" rx="15" fill="none" stroke="#27272a" strokeWidth="1" />
      <circle cx="50" cy="77" r="16" fill="#27272a" />
      <circle cx="50" cy="74" r="6" fill="#3f3f46" />
      <ellipse cx="50" cy="85" rx="10" ry="6" fill="#3f3f46" />
      <rect x="76" y="67" width="100" height="9" rx="4.5" fill="#e4e4e7" />
      <rect x="76" y="81" width="150" height="7" rx="3.5" fill="#52525b" />

      {/* Settings row */}
      <rect x="16" y="108" width="328" height="46" rx="15" fill="#18181b" />
      <rect x="16" y="108" width="328" height="46" rx="15" fill="none" stroke="#27272a" strokeWidth="1" />
      <circle cx="51" cy="131" r="18" fill="#27272a" />
      {/* Gear */}
      <circle cx="51" cy="131" r="7" fill="none" stroke="#71717a" strokeWidth="2" />
      <circle cx="51" cy="131" r="2.5" fill="#71717a" />
      <rect x="49.5" y="120" width="3" height="4.5" rx="1.5" fill="#71717a" />
      <rect x="49.5" y="137.5" width="3" height="4.5" rx="1.5" fill="#71717a" />
      <rect x="39.5" y="129.5" width="4.5" height="3" rx="1.5" fill="#71717a" />
      <rect x="58" y="129.5" width="4.5" height="3" rx="1.5" fill="#71717a" />
      <rect x="42.5" y="122.5" width="3.5" height="3.5" rx="1.5" fill="#71717a" transform="rotate(45 44.25 124.25)" />
      <rect x="56.5" y="136.5" width="3.5" height="3.5" rx="1.5" fill="#71717a" transform="rotate(45 58.25 138.25)" />
      <rect x="56" y="122.5" width="3.5" height="3.5" rx="1.5" fill="#71717a" transform="rotate(-45 57.75 124.25)" />
      <rect x="42" y="136.5" width="3.5" height="3.5" rx="1.5" fill="#71717a" transform="rotate(-45 43.75 138.25)" />
      <rect x="80" y="120" width="110" height="9" rx="4.5" fill="#e4e4e7" />
      <rect x="80" y="134" width="165" height="7" rx="3.5" fill="#52525b" />
      <path d="M328 125 l7 6-7 6" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
