// Pixel-faithful SVG illustrations of real Trpy UI — mobile onboarding only

// ── Shared topbar used across all steps ────────────────────────────────────────
function Topbar({ title }: { title?: string }) {
  return (
    <>
      {/* Bar background */}
      <rect x="0" y="0" width="360" height="46" fill="#18181b" />
      <rect x="0" y="45" width="360" height="1" fill="#27272a" />
      {/* Trpy logo mark — square with T shape */}
      <rect x="14" y="12" width="22" height="22" rx="7" fill="#6366f1" />
      <rect x="20" y="17" width="10" height="2.5" rx="1.25" fill="white" />
      <rect x="23.75" y="19.5" width="2.5" height="10" rx="1.25" fill="white" />
      {/* Page title placeholder */}
      {title && <rect x="44" y="18" width={title === 'long' ? 90 : 70} height="9" rx="4.5" fill="#3f3f46" />}
      {/* Avatar circle */}
      <circle cx="338" cy="23" r="13" fill="#27272a" />
      <circle cx="338" cy="20" r="5" fill="#3f3f46" />
      <ellipse cx="338" cy="30" rx="8" ry="5" fill="#3f3f46" />
    </>
  );
}

// ── Bottom nav ─────────────────────────────────────────────────────────────────
function BottomNav({ active }: { active: 'home' | 'trips' | 'budget' | 'favorites' }) {
  return (
    <>
      <rect x="0" y="158" width="360" height="1" fill="#27272a" />
      <rect x="0" y="159" width="360" height="21" fill="#18181b" />

      {/* HOME */}
      <g opacity={active === 'home' ? 1 : 0.4}>
        <rect x="14" y="160" width="72" height="18" rx="9" fill={active === 'home' ? '#312e81' : 'transparent'} opacity={active === 'home' ? 0.5 : 0} />
        {/* House */}
        <path d="M42 174 v-7 h6 v7" stroke={active === 'home' ? '#818cf8' : '#52525b'} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
        <path d="M37 169 l8 -6 8 6" stroke={active === 'home' ? '#818cf8' : '#52525b'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="35" y="161" width="30" height="6" rx="3" fill={active === 'home' ? '#818cf8' : '#3f3f46'} opacity="0.7" />
      </g>

      {/* VIAGENS */}
      <g opacity={active === 'trips' ? 1 : 0.4}>
        {/* Takeoff plane */}
        <path d="M106 171 l6-7 3 2 -5 6z" stroke={active === 'trips' ? '#818cf8' : '#52525b'} strokeWidth="1.3" fill={active === 'trips' ? '#818cf8' : 'none'} opacity="0.9" />
        <path d="M106 171 l10 1" stroke={active === 'trips' ? '#818cf8' : '#52525b'} strokeWidth="1.3" strokeLinecap="round" />
        <rect x="94" y="162" width="32" height="6" rx="3" fill={active === 'trips' ? '#818cf8' : '#3f3f46'} opacity="0.7" />
      </g>

      {/* FINANÇAS */}
      <g opacity={active === 'budget' ? 1 : 0.4}>
        {/* Wallet */}
        <rect x="172" y="163" width="16" height="12" rx="3" fill="none" stroke={active === 'budget' ? '#818cf8' : '#52525b'} strokeWidth="1.4" />
        <rect x="175" y="167" width="8" height="2" rx="1" fill={active === 'budget' ? '#818cf8' : '#52525b'} opacity="0.8" />
        <rect x="164" y="162" width="32" height="6" rx="3" fill={active === 'budget' ? '#818cf8' : '#3f3f46'} opacity="0.7" />
      </g>

      {/* FAVORITOS */}
      <g opacity={active === 'favorites' ? 1 : 0.4}>
        {/* Heart */}
        <path d="M248 172 c0 0 -5-4 -5-7 a3 3 0 0 1 5 0 a3 3 0 0 1 5 0 c0 3 -5 7 -5 7z"
          fill={active === 'favorites' ? '#818cf8' : 'none'}
          stroke={active === 'favorites' ? '#818cf8' : '#52525b'}
          strokeWidth="1.4" />
        <rect x="234" y="162" width="28" height="6" rx="3" fill={active === 'favorites' ? '#818cf8' : '#3f3f46'} opacity="0.7" />
      </g>
    </>
  );
}

// ── STEP 1: Nova Viagem ─────────────────────────────────────────────────────────
export function StepImageNewTrip() {
  return (
    <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="nt-glow" cx="50%" cy="60%" r="40%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nt-btn" x1="70" y1="0" x2="290" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e1b4b" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="360" height="180" fill="#09090b" />
      {/* Ambient glow */}
      <ellipse cx="180" cy="115" rx="130" ry="50" fill="url(#nt-glow)" />

      <Topbar title="home" />

      {/* Welcome text block */}
      <rect x="16" y="58" width="140" height="10" rx="5" fill="#3f3f46" />
      <rect x="16" y="73" width="100" height="7" rx="3.5" fill="#27272a" />

      {/* Outer pulse ring — double ring effect */}
      <rect x="44" y="92" width="272" height="50" rx="22" fill="none" stroke="#4f46e5" strokeWidth="0.8" opacity="0.3" />
      <rect x="52" y="96" width="256" height="42" rx="19" fill="none" stroke="#6366f1" strokeWidth="1.2" opacity="0.55" />

      {/* Button body — dark pill */}
      <rect x="60" y="100" width="240" height="34" rx="16" fill="#18181b" />
      <rect x="60" y="100" width="240" height="34" rx="16" fill="none" stroke="#4f46e5" strokeWidth="1.5" strokeOpacity="0.7" />

      {/* + icon — precise cross */}
      <rect x="103" y="115.5" width="14" height="2.5" rx="1.25" fill="#6366f1" />
      <rect x="108.75" y="109.75" width="2.5" height="14" rx="1.25" fill="#6366f1" />

      {/* "Nova viagem" text sim */}
      <rect x="126" y="113" width="108" height="9" rx="4.5" fill="#d4d4d8" />

      {/* Destination bubbles row below button */}
      <circle cx="54" cy="156" r="16" fill="#27272a" />
      <circle cx="54" cy="152" r="6" fill="#3f3f46" />
      <ellipse cx="54" cy="163" rx="9" ry="6" fill="#3f3f46" />

      <circle cx="90" cy="156" r="16" fill="#27272a" />
      <circle cx="90" cy="152" r="6" fill="#3f3f46" />
      <ellipse cx="90" cy="163" rx="9" ry="6" fill="#3f3f46" />

      <circle cx="126" cy="156" r="16" fill="#27272a" />
      <circle cx="126" cy="152" r="6" fill="#3f3f46" />
      <ellipse cx="126" cy="163" rx="9" ry="6" fill="#3f3f46" />

      <circle cx="162" cy="156" r="16" fill="#27272a" />
      <circle cx="162" cy="152" r="6" fill="#3f3f46" />
      <ellipse cx="162" cy="163" rx="9" ry="6" fill="#3f3f46" />

      {/* "Destinos sugeridos" label */}
      <rect x="196" y="149" width="95" height="7" rx="3.5" fill="#3f3f46" />
      <rect x="196" y="160" width="70" height="6" rx="3" fill="#27272a" />

      <BottomNav active="home" />
    </svg>
  );
}

// ── STEP 2: Viagens ─────────────────────────────────────────────────────────────
export function StepImageTrips() {
  return (
    <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="tr-active-card" x1="16" y1="74" x2="344" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e1b4b" stopOpacity="0.9" />
          <stop offset="1" stopColor="#1e1b4b" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <rect width="360" height="180" fill="#09090b" />
      <Topbar title="short" />

      {/* Section header */}
      <rect x="16" y="55" width="110" height="8" rx="4" fill="#52525b" />
      <rect x="268" y="56" width="76" height="7" rx="3.5" fill="#4f46e5" opacity="0.55" />

      {/* ── Active trip card (indigo glow) ── */}
      <rect x="16" y="70" width="328" height="46" rx="14" fill="url(#tr-active-card)" />
      <rect x="16" y="70" width="328" height="46" rx="14" fill="none" stroke="#6366f1" strokeWidth="1.3" strokeOpacity="0.6" />

      {/* Thumbnail — pencil/edit icon (matches print: edit icon in card) */}
      <rect x="27" y="78" width="34" height="30" rx="9" fill="#312e81" opacity="0.85" />
      {/* Pencil shape */}
      <path d="M37 99 l3-10 8 3 -3 10z" fill="#a5b4fc" opacity="0.9" />
      <path d="M40 89 l4-4 4 4" fill="#c7d2fe" opacity="0.7" />
      <path d="M37 99 l3-1 0 3z" fill="#818cf8" />

      {/* Trip name — long white bar */}
      <rect x="71" y="79" width="165" height="8" rx="4" fill="#e4e4e7" />
      {/* Date / subtitle */}
      <rect x="71" y="92" width="110" height="6" rx="3" fill="#6366f1" opacity="0.45" />

      {/* Status badge — "Em andamento" */}
      <rect x="260" y="81" width="72" height="16" rx="8" fill="#312e81" opacity="0.7" />
      <rect x="268" y="87" width="56" height="5" rx="2.5" fill="#a5b4fc" />

      {/* ── Second trip card (inactive) ── */}
      <rect x="16" y="124" width="328" height="40" rx="14" fill="#18181b" />
      <rect x="16" y="124" width="328" height="40" rx="14" fill="none" stroke="#27272a" strokeWidth="1" />

      {/* Thumbnail placeholder */}
      <rect x="27" y="132" width="30" height="24" rx="8" fill="#27272a" />

      {/* Trip name */}
      <rect x="67" y="134" width="130" height="7" rx="3.5" fill="#52525b" />
      {/* Date */}
      <rect x="67" y="145" width="90" height="6" rx="3" fill="#3f3f46" />

      {/* Status badge muted */}
      <rect x="264" y="136" width="68" height="14" rx="7" fill="#27272a" />
      <rect x="270" y="141" width="56" height="4" rx="2" fill="#3f3f46" />

      <BottomNav active="trips" />
    </svg>
  );
}

// ── STEP 3: Finanças/Budget ─────────────────────────────────────────────────────
export function StepImageBudget() {
  return (
    <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bg-progress" x1="16" y1="0" x2="344" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <rect width="360" height="180" fill="#09090b" />
      <Topbar title="short" />

      {/* ── Hero budget card ── */}
      <rect x="16" y="54" width="328" height="60" rx="15" fill="#18181b" />
      <rect x="16" y="54" width="328" height="60" rx="15" fill="none" stroke="#27272a" strokeWidth="1" />

      {/* "Orçamento total" label */}
      <rect x="28" y="63" width="85" height="7" rx="3.5" fill="#52525b" />
      {/* Big amount — wide white pill (like "R$ 12.500") */}
      <rect x="28" y="74" width="160" height="14" rx="7" fill="#e4e4e7" />

      {/* Progress bar track */}
      <rect x="28" y="96" width="308" height="7" rx="3.5" fill="#27272a" />
      {/* Progress fill — 62% indigo→purple gradient */}
      <rect x="28" y="96" width="191" height="7" rx="3.5" fill="url(#bg-progress)" />
      {/* Percentage label on right */}
      <rect x="308" y="62" width="28" height="7" rx="3.5" fill="#6366f1" opacity="0.4" />

      {/* ── Two stat mini cards ── */}
      {/* Green — spent */}
      <rect x="16" y="122" width="166" height="40" rx="14" fill="#18181b" />
      <rect x="16" y="122" width="166" height="40" rx="14" fill="none" stroke="#27272a" strokeWidth="1" />
      <circle cx="36" cy="142" r="7" fill="#22c55e" opacity="0.25" />
      <circle cx="36" cy="142" r="4" fill="#22c55e" opacity="0.7" />
      <rect x="50" y="135" width="60" height="6" rx="3" fill="#52525b" />
      <rect x="50" y="145" width="95" height="8" rx="4" fill="#d4d4d8" />

      {/* Amber — remaining */}
      <rect x="190" y="122" width="154" height="40" rx="14" fill="#18181b" />
      <rect x="190" y="122" width="154" height="40" rx="14" fill="none" stroke="#27272a" strokeWidth="1" />
      <circle cx="208" cy="142" r="7" fill="#f59e0b" opacity="0.25" />
      <circle cx="208" cy="142" r="4" fill="#f59e0b" opacity="0.7" />
      <rect x="222" y="135" width="55" height="6" rx="3" fill="#52525b" />
      <rect x="222" y="145" width="90" height="8" rx="4" fill="#d4d4d8" />

      <BottomNav active="budget" />
    </svg>
  );
}

// ── STEP 4: Favoritos ──────────────────────────────────────────────────────────
export function StepImageFavorites() {
  return (
    <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="fav-g1" x1="16" y1="60" x2="16" y2="155" gradientUnits="userSpaceOnUse">
          <stop stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="fav-g2" x1="188" y1="60" x2="188" y2="155" gradientUnits="userSpaceOnUse">
          <stop stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="fav-sky1" x1="16" y1="60" x2="172" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e3a5f" />
          <stop offset="1" stopColor="#0c1a2e" />
        </linearGradient>
        <linearGradient id="fav-sky2" x1="188" y1="60" x2="344" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#292524" />
          <stop offset="1" stopColor="#1c1917" />
        </linearGradient>
        <clipPath id="fav-clip1">
          <rect x="16" y="60" width="156" height="95" rx="16" />
        </clipPath>
        <clipPath id="fav-clip2">
          <rect x="188" y="60" width="156" height="95" rx="16" />
        </clipPath>
      </defs>

      <rect width="360" height="180" fill="#09090b" />
      <Topbar title="short" />

      {/* ── Card 1 — Ocean/Beach ── */}
      <rect x="16" y="60" width="156" height="95" rx="16" fill="#0c1a2e" />
      <g clipPath="url(#fav-clip1)">
        {/* Sky gradient */}
        <rect x="16" y="60" width="156" height="95" fill="url(#fav-sky1)" />
        {/* Water waves */}
        <path d="M16 115 Q50 108 80 115 Q110 122 140 112 Q158 106 172 115 L172 155 L16 155 Z" fill="#0e3460" opacity="0.9" />
        <path d="M16 120 Q45 114 75 121 Q105 128 135 118 L172 120 L172 155 L16 155 Z" fill="#0a2540" />
        {/* Horizon line */}
        <line x1="16" y1="112" x2="172" y2="108" stroke="#1e5f8a" strokeWidth="0.8" opacity="0.5" />
        {/* Bottom gradient overlay */}
        <rect x="16" y="60" width="156" height="95" fill="url(#fav-g1)" />
      </g>
      {/* Card border */}
      <rect x="16" y="60" width="156" height="95" rx="16" fill="none" stroke="#1e3a5f" strokeWidth="1" />
      {/* Heart badge */}
      <circle cx="158" cy="76" r="13" fill="#09090b" opacity="0.6" />
      <path d="M158 80.5 c0 0 -5-3.5 -5-6.5 a2.8 2.8 0 0 1 5 0 a2.8 2.8 0 0 1 5 0 c0 3 -5 6.5 -5 6.5z" fill="#f43f5e" />
      {/* Destination name */}
      <rect x="26" y="134" width="80" height="8" rx="4" fill="#f4f4f5" opacity="0.95" />
      <rect x="26" y="146" width="55" height="6" rx="3" fill="#a1a1aa" opacity="0.7" />

      {/* ── Card 2 — Mountain/Forest ── */}
      <rect x="188" y="60" width="156" height="95" rx="16" fill="#1c1917" />
      <g clipPath="url(#fav-clip2)">
        <rect x="188" y="60" width="156" height="95" fill="url(#fav-sky2)" />
        {/* Mountain silhouette */}
        <path d="M188 125 L218 90 L245 110 L270 80 L295 100 L344 88 L344 155 L188 155 Z" fill="#0d1117" opacity="0.95" />
        <path d="M188 130 L220 100 L250 118 L275 95 L300 110 L344 100 L344 155 L188 155 Z" fill="#111827" />
        {/* Snow caps */}
        <path d="M218 90 l-5 12 8-4 8 4 -5-12z" fill="#e5e7eb" opacity="0.5" />
        <path d="M270 80 l-4 10 6-3 6 3 -4-10z" fill="#e5e7eb" opacity="0.4" />
        {/* Bottom gradient */}
        <rect x="188" y="60" width="156" height="95" fill="url(#fav-g2)" />
      </g>
      <rect x="188" y="60" width="156" height="95" rx="16" fill="none" stroke="#292524" strokeWidth="1" />
      {/* Heart badge */}
      <circle cx="330" cy="76" r="13" fill="#09090b" opacity="0.6" />
      <path d="M330 80.5 c0 0 -5-3.5 -5-6.5 a2.8 2.8 0 0 1 5 0 a2.8 2.8 0 0 1 5 0 c0 3 -5 6.5 -5 6.5z" fill="#f43f5e" />
      {/* Destination name */}
      <rect x="198" y="134" width="80" height="8" rx="4" fill="#f4f4f5" opacity="0.95" />
      <rect x="198" y="146" width="55" height="6" rx="3" fill="#a1a1aa" opacity="0.7" />

      <BottomNav active="favorites" />
    </svg>
  );
}

// ── STEP 5: Configurações ──────────────────────────────────────────────────────
export function StepImageSettings() {
  return (
    <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="360" height="180" fill="#09090b" />
      <Topbar title="short" />

      {/* ── Profile card ── */}
      <rect x="16" y="54" width="328" height="46" rx="15" fill="#18181b" />
      <rect x="16" y="54" width="328" height="46" rx="15" fill="none" stroke="#27272a" strokeWidth="1" />
      {/* Avatar */}
      <circle cx="50" cy="77" r="16" fill="#27272a" />
      <circle cx="50" cy="74" r="6" fill="#3f3f46" />
      <ellipse cx="50" cy="85" rx="10" ry="6" fill="#3f3f46" />
      {/* Name */}
      <rect x="76" y="67" width="100" height="9" rx="4.5" fill="#e4e4e7" />
      {/* Email */}
      <rect x="76" y="81" width="150" height="7" rx="3.5" fill="#52525b" />

      {/* ── Settings row — exact to screenshot ── */}
      <rect x="16" y="108" width="328" height="48" rx="15" fill="#18181b" />
      <rect x="16" y="108" width="328" height="48" rx="15" fill="none" stroke="#27272a" strokeWidth="1" />

      {/* Gear icon in circle bg */}
      <circle cx="51" cy="132" r="18" fill="#27272a" />
      {/* Gear outer ring */}
      <circle cx="51" cy="132" r="7.5" fill="none" stroke="#71717a" strokeWidth="2" />
      {/* Gear center */}
      <circle cx="51" cy="132" r="2.5" fill="#71717a" />
      {/* Gear teeth — 8 teeth */}
      <rect x="49.5" y="121" width="3" height="4.5" rx="1.5" fill="#71717a" />
      <rect x="49.5" y="138.5" width="3" height="4.5" rx="1.5" fill="#71717a" />
      <rect x="40" y="130.5" width="4.5" height="3" rx="1.5" fill="#71717a" />
      <rect x="58.5" y="130.5" width="4.5" height="3" rx="1.5" fill="#71717a" />
      <rect x="42.5" y="123.5" width="3.5" height="3.5" rx="1.5" fill="#71717a" transform="rotate(45 44.25 125.25)" />
      <rect x="56.5" y="137.5" width="3.5" height="3.5" rx="1.5" fill="#71717a" transform="rotate(45 58.25 139.25)" />
      <rect x="56" y="123.5" width="3.5" height="3.5" rx="1.5" fill="#71717a" transform="rotate(-45 57.75 125.25)" />
      <rect x="42" y="137.5" width="3.5" height="3.5" rx="1.5" fill="#71717a" transform="rotate(-45 43.75 139.25)" />

      {/* "Configurações" text */}
      <rect x="80" y="121" width="110" height="9" rx="4.5" fill="#e4e4e7" />
      {/* "Tema, idioma e segurança" */}
      <rect x="80" y="135" width="165" height="7" rx="3.5" fill="#52525b" />

      {/* Chevron right */}
      <path d="M328 126 l7 6 -7 6" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
