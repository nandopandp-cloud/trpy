// Pixel-faithful SVG illustrations of real Trpy UI — mobile onboarding only

export function StepImageNewTrip() {
  return (
    <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="nt-glow" x1="180" y1="60" x2="180" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <filter id="nt-blur">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="360" height="180" fill="#09090b" />

      {/* Subtle glow behind button */}
      <ellipse cx="180" cy="110" rx="120" ry="40" fill="#6366f1" opacity="0.12" filter="url(#nt-blur)" />

      {/* Topbar */}
      <rect width="360" height="48" fill="#18181b" />
      {/* Logo mark */}
      <rect x="16" y="16" width="20" height="20" rx="6" fill="#6366f1" opacity="0.9" />
      <rect x="22" y="21" width="8" height="3" rx="1.5" fill="white" />
      <rect x="22" y="27" width="5" height="3" rx="1.5" fill="white" opacity="0.7" />
      {/* Page title */}
      <rect x="46" y="19" width="55" height="10" rx="5" fill="#3f3f46" />
      {/* Avatar */}
      <circle cx="336" cy="24" r="14" fill="#27272a" />
      <circle cx="336" cy="22" r="5" fill="#52525b" />
      <ellipse cx="336" cy="32" rx="8" ry="5" fill="#52525b" />

      {/* "Nova viagem" button — exact match to screenshot */}
      {/* Outer pulse ring */}
      <rect x="52" y="68" width="256" height="56" rx="22" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
      {/* Button body */}
      <rect x="60" y="75" width="240" height="42" rx="18" fill="#18181b" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.6" />
      {/* + icon */}
      <rect x="104" y="93" width="14" height="2.5" rx="1.25" fill="#6366f1" />
      <rect x="109.75" y="87.25" width="2.5" height="14" rx="1.25" fill="#6366f1" />
      {/* "Nova viagem" text */}
      <rect x="128" y="90" width="104" height="10" rx="5" fill="#e4e4e7" />

      {/* Bottom nav bar */}
      <rect x="0" y="148" width="360" height="32" fill="#18181b" />
      <rect x="0" y="148" width="360" height="1" fill="#27272a" />

      {/* Home tab — active */}
      <rect x="12" y="152" width="70" height="24" rx="10" fill="#3730a3" opacity="0.35" />
      {/* Home icon */}
      <path d="M40 168 l0-8 7 0 0 8" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M34 163 l13-9 13 9" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Início label */}
      <rect x="31" y="172" width="26" height="5" rx="2.5" fill="#6366f1" opacity="0.8" />

      {/* Viagens tab */}
      <path d="M102 165 q6-6 12-2 l10-8" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="98" y="172" width="28" height="5" rx="2.5" fill="#3f3f46" />

      {/* Finanças tab */}
      <rect x="177" y="158" width="16" height="13" rx="3" fill="none" stroke="#52525b" strokeWidth="1.5" />
      <rect x="180" y="162" width="10" height="2" rx="1" fill="#52525b" />
      <rect x="175" y="172" width="30" height="5" rx="2.5" fill="#3f3f46" />

      {/* Favoritos tab */}
      <path d="M258 163 c0 0 -5-3.5 -5-6.5 a2.8 2.8 0 0 1 5 0 a2.8 2.8 0 0 1 5 0 c0 3 -5 6.5 -5 6.5z" fill="none" stroke="#52525b" strokeWidth="1.5" />
      <rect x="247" y="172" width="32" height="5" rx="2.5" fill="#3f3f46" />
    </svg>
  );
}

export function StepImageTrips() {
  return (
    <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="tr-card1" x1="18" y1="82" x2="342" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#312e81" stopOpacity="0.4" />
          <stop offset="1" stopColor="#1e1b4b" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <rect width="360" height="180" fill="#09090b" />

      {/* Topbar */}
      <rect width="360" height="48" fill="#18181b" />
      <rect x="16" y="16" width="20" height="20" rx="6" fill="#6366f1" opacity="0.9" />
      <rect x="22" y="21" width="8" height="3" rx="1.5" fill="white" />
      <rect x="22" y="27" width="5" height="3" rx="1.5" fill="white" opacity="0.7" />
      <rect x="46" y="19" width="55" height="10" rx="5" fill="#3f3f46" />
      <circle cx="336" cy="24" r="14" fill="#27272a" />
      <circle cx="336" cy="22" r="5" fill="#52525b" />
      <ellipse cx="336" cy="32" rx="8" ry="5" fill="#52525b" />

      {/* Section label */}
      <rect x="18" y="60" width="90" height="8" rx="4" fill="#52525b" />
      {/* "Ver todas" */}
      <rect x="280" y="61" width="62" height="7" rx="3.5" fill="#4f46e5" opacity="0.5" />

      {/* Trip card 1 — active with indigo accent */}
      <rect x="18" y="76" width="324" height="44" rx="14" fill="#18181b" />
      <rect x="18" y="76" width="324" height="44" rx="14" fill="url(#tr-card1)" />
      <rect x="18" y="76" width="324" height="44" rx="14" fill="none" stroke="#4f46e5" strokeWidth="1.2" strokeOpacity="0.5" />
      {/* Thumbnail */}
      <rect x="30" y="84" width="32" height="28" rx="8" fill="#312e81" opacity="0.8" />
      {/* Plane icon in thumbnail */}
      <path d="M38 98 l6-8 3 3 -5 7z" fill="#a5b4fc" opacity="0.9" />
      <path d="M44 90 l4 2 -2 3z" fill="#a5b4fc" opacity="0.7" />
      {/* Trip name */}
      <rect x="72" y="85" width="120" height="8" rx="4" fill="#e4e4e7" />
      {/* Dates */}
      <rect x="72" y="97" width="85" height="6" rx="3" fill="#52525b" />
      {/* Status badge */}
      <rect x="266" y="88" width="58" height="18" rx="9" fill="#312e81" opacity="0.6" />
      <rect x="274" y="94" width="42" height="6" rx="3" fill="#a5b4fc" />

      {/* Trip card 2 */}
      <rect x="18" y="130" width="324" height="38" rx="14" fill="#18181b" />
      <rect x="18" y="130" width="324" height="38" rx="14" fill="none" stroke="#27272a" strokeWidth="1" />
      <rect x="30" y="138" width="28" height="22" rx="7" fill="#27272a" />
      <rect x="68" y="140" width="100" height="7" rx="3.5" fill="#52525b" />
      <rect x="68" y="151" width="70" height="5" rx="2.5" fill="#3f3f46" />
      <rect x="270" y="142" width="54" height="16" rx="8" fill="#27272a" />

      {/* Bottom nav — Viagens active */}
      <rect x="0" y="172" width="360" height="8" fill="#18181b" />
      <rect x="0" y="172" width="360" height="1" fill="#27272a" />
      <rect x="82" y="173" width="10" height="5" rx="2" fill="#6366f1" opacity="0.8" />
    </svg>
  );
}

export function StepImageBudget() {
  return (
    <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bg-bar" x1="26" y1="0" x2="334" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <rect width="360" height="180" fill="#09090b" />

      {/* Topbar */}
      <rect width="360" height="48" fill="#18181b" />
      <rect x="16" y="16" width="20" height="20" rx="6" fill="#6366f1" opacity="0.9" />
      <rect x="22" y="21" width="8" height="3" rx="1.5" fill="white" />
      <rect x="22" y="27" width="5" height="3" rx="1.5" fill="white" opacity="0.7" />
      <rect x="46" y="19" width="55" height="10" rx="5" fill="#3f3f46" />
      <circle cx="336" cy="24" r="14" fill="#27272a" />
      <circle cx="336" cy="22" r="5" fill="#52525b" />
      <ellipse cx="336" cy="32" rx="8" ry="5" fill="#52525b" />

      {/* Budget hero card */}
      <rect x="16" y="56" width="328" height="66" rx="16" fill="#18181b" />
      <rect x="16" y="56" width="328" height="66" rx="16" fill="none" stroke="#27272a" strokeWidth="1" />
      {/* Label */}
      <rect x="28" y="66" width="70" height="6" rx="3" fill="#52525b" />
      {/* Big amount */}
      <rect x="28" y="76" width="140" height="16" rx="8" fill="#e4e4e7" />
      {/* Progress track */}
      <rect x="28" y="100" width="308" height="8" rx="4" fill="#27272a" />
      {/* Progress fill — 62% */}
      <rect x="28" y="100" width="191" height="8" rx="4" fill="url(#bg-bar)" />

      {/* Mini stat cards */}
      <rect x="16" y="132" width="156" height="38" rx="14" fill="#18181b" />
      <rect x="16" y="132" width="156" height="38" rx="14" fill="none" stroke="#27272a" strokeWidth="1" />
      {/* Green dot */}
      <circle cx="34" cy="151" r="5" fill="#22c55e" opacity="0.7" />
      <rect x="44" y="146" width="50" height="6" rx="3" fill="#52525b" />
      <rect x="44" y="156" width="80" height="7" rx="3.5" fill="#e4e4e7" />

      <rect x="182" y="132" width="162" height="38" rx="14" fill="#18181b" />
      <rect x="182" y="132" width="162" height="38" rx="14" fill="none" stroke="#27272a" strokeWidth="1" />
      {/* Amber dot */}
      <circle cx="200" cy="151" r="5" fill="#f59e0b" opacity="0.7" />
      <rect x="210" y="146" width="50" height="6" rx="3" fill="#52525b" />
      <rect x="210" y="156" width="70" height="7" rx="3.5" fill="#e4e4e7" />

      {/* Bottom nav — Finanças active */}
      <rect x="0" y="172" width="360" height="8" fill="#18181b" />
      <rect x="0" y="172" width="360" height="1" fill="#27272a" />
      <rect x="172" y="173" width="10" height="5" rx="2" fill="#6366f1" opacity="0.8" />
    </svg>
  );
}

export function StepImageFavorites() {
  return (
    <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="fav-grad1" x1="18" y1="76" x2="18" y2="148" gradientUnits="userSpaceOnUse">
          <stop stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="fav-grad2" x1="190" y1="76" x2="190" y2="148" gradientUnits="userSpaceOnUse">
          <stop stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      <rect width="360" height="180" fill="#09090b" />

      {/* Topbar */}
      <rect width="360" height="48" fill="#18181b" />
      <rect x="16" y="16" width="20" height="20" rx="6" fill="#6366f1" opacity="0.9" />
      <rect x="22" y="21" width="8" height="3" rx="1.5" fill="white" />
      <rect x="22" y="27" width="5" height="3" rx="1.5" fill="white" opacity="0.7" />
      <rect x="46" y="19" width="55" height="10" rx="5" fill="#3f3f46" />
      <circle cx="336" cy="24" r="14" fill="#27272a" />
      <circle cx="336" cy="22" r="5" fill="#52525b" />
      <ellipse cx="336" cy="32" rx="8" ry="5" fill="#52525b" />

      {/* Section label */}
      <rect x="18" y="58" width="80" height="8" rx="4" fill="#52525b" />

      {/* Card 1 */}
      <rect x="18" y="72" width="158" height="90" rx="16" fill="#1c1917" />
      {/* Photo area */}
      <rect x="18" y="72" width="158" height="55" rx="16" fill="#292524" />
      {/* Mountain silhouette sim */}
      <path d="M18 118 L60 90 L90 108 L120 85 L176 118 Z" fill="#1c1917" opacity="0.8" />
      {/* Gradient overlay */}
      <rect x="18" y="72" width="158" height="90" rx="16" fill="url(#fav-grad1)" />
      {/* Heart badge */}
      <circle cx="158" cy="88" r="13" fill="#09090b" opacity="0.65" />
      <path d="M158 92.5 c0 0 -5-3.5 -5-6.5 a2.8 2.8 0 0 1 5 0 a2.8 2.8 0 0 1 5 0 c0 3 -5 6.5 -5 6.5z" fill="#f43f5e" />
      {/* Text at bottom */}
      <rect x="28" y="134" width="90" height="7" rx="3.5" fill="#f4f4f5" />
      <rect x="28" y="145" width="65" height="6" rx="3" fill="#71717a" />

      {/* Card 2 */}
      <rect x="184" y="72" width="158" height="90" rx="16" fill="#1c1917" />
      <rect x="184" y="72" width="158" height="55" rx="16" fill="#1e293b" />
      {/* Water/ocean sim */}
      <path d="M184 115 Q210 105 240 115 Q270 125 310 110 L342 115 L342 127 L184 127 Z" fill="#1e3a5f" opacity="0.7" />
      <rect x="184" y="72" width="158" height="90" rx="16" fill="url(#fav-grad2)" />
      <circle cx="324" cy="88" r="13" fill="#09090b" opacity="0.65" />
      <path d="M324 92.5 c0 0 -5-3.5 -5-6.5 a2.8 2.8 0 0 1 5 0 a2.8 2.8 0 0 1 5 0 c0 3 -5 6.5 -5 6.5z" fill="#f43f5e" />
      <rect x="194" y="134" width="90" height="7" rx="3.5" fill="#f4f4f5" />
      <rect x="194" y="145" width="65" height="6" rx="3" fill="#71717a" />

      {/* Bottom nav — Favoritos active */}
      <rect x="0" y="172" width="360" height="8" fill="#18181b" />
      <rect x="0" y="172" width="360" height="1" fill="#27272a" />
      <rect x="254" y="173" width="10" height="5" rx="2" fill="#6366f1" opacity="0.8" />
    </svg>
  );
}

export function StepImageSettings() {
  return (
    <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="360" height="180" fill="#09090b" />

      {/* Topbar */}
      <rect width="360" height="48" fill="#18181b" />
      <rect x="16" y="16" width="20" height="20" rx="6" fill="#6366f1" opacity="0.9" />
      <rect x="22" y="21" width="8" height="3" rx="1.5" fill="white" />
      <rect x="22" y="27" width="5" height="3" rx="1.5" fill="white" opacity="0.7" />
      <rect x="46" y="19" width="55" height="10" rx="5" fill="#3f3f46" />
      <circle cx="336" cy="24" r="14" fill="#27272a" />
      <circle cx="336" cy="22" r="5" fill="#52525b" />
      <ellipse cx="336" cy="32" rx="8" ry="5" fill="#52525b" />

      {/* Profile card */}
      <rect x="16" y="56" width="328" height="48" rx="16" fill="#18181b" />
      <rect x="16" y="56" width="328" height="48" rx="16" fill="none" stroke="#27272a" strokeWidth="1" />
      <circle cx="50" cy="80" r="16" fill="#27272a" />
      <circle cx="50" cy="77" r="6" fill="#3f3f46" />
      <ellipse cx="50" cy="89" rx="10" ry="6" fill="#3f3f46" />
      <rect x="76" y="70" width="90" height="8" rx="4" fill="#e4e4e7" />
      <rect x="76" y="82" width="140" height="7" rx="3.5" fill="#52525b" />

      {/* Settings row — exact match to screenshot */}
      <rect x="16" y="114" width="328" height="50" rx="16" fill="#18181b" />
      <rect x="16" y="114" width="328" height="50" rx="16" fill="none" stroke="#27272a" strokeWidth="1" />
      {/* Gear icon bg */}
      <circle cx="50" cy="139" r="18" fill="#27272a" />
      {/* Gear icon */}
      <circle cx="50" cy="139" r="5.5" fill="none" stroke="#71717a" strokeWidth="2" />
      <circle cx="50" cy="139" r="2" fill="#71717a" />
      {/* Gear teeth */}
      <rect x="48.5" y="129" width="3" height="4" rx="1.5" fill="#71717a" />
      <rect x="48.5" y="146" width="3" height="4" rx="1.5" fill="#71717a" />
      <rect x="40" y="137.5" width="4" height="3" rx="1.5" fill="#71717a" />
      <rect x="56" y="137.5" width="4" height="3" rx="1.5" fill="#71717a" />
      {/* "Configurações" text */}
      <rect x="76" y="130" width="100" height="8" rx="4" fill="#e4e4e7" />
      {/* "Tema, idioma e segurança" */}
      <rect x="76" y="142" width="155" height="7" rx="3.5" fill="#52525b" />
      {/* Chevron right */}
      <path d="M326 134 l6 5 -6 5" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
