// ═══════════════════════════════════════════════════════════════════════════
// Base local de destinos — usada na estratégia de busca híbrida para reduzir
// chamadas à Google Places API. Cobre as cidades/países/regiões mais buscados
// e responde em <1ms sem custo de API externa.
//
// Cobertura alvo: top destinos turísticos globais + principais cidades
// brasileiras. Se o match local atingir pelo menos 1 resultado relevante,
// dispensamos a chamada ao Google Places.
// ═══════════════════════════════════════════════════════════════════════════

export interface LocalDestination {
  /** Identificador estável (prefixo `local_`) — diferente dos place_ids do Google */
  place_id: string;
  /** Nome principal — "Paris", "Rio de Janeiro" */
  main: string;
  /** Contexto — país, ou cidade + país */
  secondary: string;
  /** Texto completo para slug e exibição */
  description: string;
  /** Aliases adicionais (acentos, nomes nativos, abreviações) */
  aliases?: string[];
  types: string[];
}

// Helpers para normalização accent-insensitive.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const D = (
  place_id: string,
  main: string,
  secondary: string,
  types: string[] = ['locality'],
  aliases?: string[],
): LocalDestination => ({
  place_id,
  main,
  secondary,
  description: `${main}, ${secondary}`,
  types,
  aliases,
});

// ─── Pool de destinos ────────────────────────────────────────────────────────

export const LOCAL_DESTINATIONS: LocalDestination[] = [
  // Brasil — capitais e grandes cidades
  D('local_sao_paulo',       'São Paulo',          'Brasil', ['locality'], ['sp', 'sampa']),
  D('local_rio',              'Rio de Janeiro',     'Brasil', ['locality'], ['rj']),
  D('local_brasilia',         'Brasília',           'Brasil'),
  D('local_salvador',         'Salvador',           'Brasil'),
  D('local_fortaleza',        'Fortaleza',          'Brasil'),
  D('local_belo_horizonte',   'Belo Horizonte',     'Brasil', ['locality'], ['bh']),
  D('local_recife',           'Recife',             'Brasil'),
  D('local_porto_alegre',     'Porto Alegre',       'Brasil'),
  D('local_curitiba',         'Curitiba',           'Brasil'),
  D('local_manaus',           'Manaus',             'Brasil'),
  D('local_belem',            'Belém',              'Brasil'),
  D('local_natal',            'Natal',              'Brasil'),
  D('local_joao_pessoa',      'João Pessoa',        'Brasil'),
  D('local_maceio',           'Maceió',             'Brasil'),
  D('local_florianopolis',    'Florianópolis',      'Brasil', ['locality'], ['floripa']),
  D('local_vitoria',          'Vitória',            'Brasil'),
  D('local_goiania',          'Goiânia',            'Brasil'),
  D('local_sao_luis',         'São Luís',           'Brasil'),
  D('local_teresina',         'Teresina',           'Brasil'),
  D('local_cuiaba',            'Cuiabá',             'Brasil'),
  D('local_campo_grande',     'Campo Grande',       'Brasil'),
  D('local_aracaju',          'Aracaju',            'Brasil'),

  // Brasil — destinos turísticos
  D('local_gramado',          'Gramado',            'Rio Grande do Sul, Brasil'),
  D('local_bonito',           'Bonito',             'Mato Grosso do Sul, Brasil'),
  D('local_ouro_preto',       'Ouro Preto',         'Minas Gerais, Brasil'),
  D('local_paraty',           'Paraty',             'Rio de Janeiro, Brasil'),
  D('local_buzios',           'Búzios',             'Rio de Janeiro, Brasil'),
  D('local_angra',            'Angra dos Reis',     'Rio de Janeiro, Brasil'),
  D('local_campos_jordao',    'Campos do Jordão',   'São Paulo, Brasil'),
  D('local_ilhabela',         'Ilhabela',           'São Paulo, Brasil'),
  D('local_ubatuba',          'Ubatuba',            'São Paulo, Brasil'),
  D('local_noronha',          'Fernando de Noronha','Pernambuco, Brasil'),
  D('local_porto_galinhas',   'Porto de Galinhas',  'Pernambuco, Brasil'),
  D('local_jericoacoara',     'Jericoacoara',       'Ceará, Brasil', ['locality'], ['jeri']),
  D('local_pipa',             'Pipa',               'Rio Grande do Norte, Brasil'),
  D('local_maragogi',         'Maragogi',           'Alagoas, Brasil'),
  D('local_chapada_diamantina','Chapada Diamantina','Bahia, Brasil'),
  D('local_chapada_veadeiros','Chapada dos Veadeiros','Goiás, Brasil'),
  D('local_lencois',          'Lençóis Maranhenses','Maranhão, Brasil'),
  D('local_foz',              'Foz do Iguaçu',      'Paraná, Brasil'),
  D('local_morretes',         'Morretes',           'Paraná, Brasil'),
  D('local_trancoso',         'Trancoso',           'Bahia, Brasil'),
  D('local_arraial_ajuda',    'Arraial d\'Ajuda',   'Bahia, Brasil'),
  D('local_morro_sp',         'Morro de São Paulo', 'Bahia, Brasil'),
  D('local_ilha_grande',      'Ilha Grande',        'Rio de Janeiro, Brasil'),
  D('local_petropolis',       'Petrópolis',         'Rio de Janeiro, Brasil'),
  D('local_monte_verde',      'Monte Verde',        'Minas Gerais, Brasil'),
  D('local_tiradentes',       'Tiradentes',         'Minas Gerais, Brasil'),
  D('local_sao_joao_batista', 'São João del Rei',   'Minas Gerais, Brasil'),
  D('local_pantanal',         'Pantanal',           'Mato Grosso, Brasil'),
  D('local_alter_chao',       'Alter do Chão',      'Pará, Brasil'),
  D('local_jalapao',          'Jalapão',            'Tocantins, Brasil'),
  D('local_bombinhas',        'Bombinhas',          'Santa Catarina, Brasil'),
  D('local_balneario_camboriu','Balneário Camboriú','Santa Catarina, Brasil'),
  D('local_cambara',          'Cambará do Sul',     'Rio Grande do Sul, Brasil'),

  // Europa — top cidades
  D('local_paris',            'Paris',              'França'),
  D('local_londres',          'Londres',            'Reino Unido', ['locality'], ['london']),
  D('local_roma',             'Roma',               'Itália', ['locality'], ['rome']),
  D('local_milao',            'Milão',              'Itália', ['locality'], ['milan', 'milano']),
  D('local_veneza',           'Veneza',             'Itália', ['locality'], ['venice', 'venezia']),
  D('local_florenca',         'Florença',           'Itália', ['locality'], ['florence', 'firenze']),
  D('local_napoles',          'Nápoles',            'Itália', ['locality'], ['naples', 'napoli']),
  D('local_barcelona',        'Barcelona',          'Espanha'),
  D('local_madri',            'Madri',              'Espanha', ['locality'], ['madrid']),
  D('local_sevilha',          'Sevilha',            'Espanha', ['locality'], ['seville', 'sevilla']),
  D('local_valencia',         'Valência',           'Espanha', ['locality'], ['valencia']),
  D('local_lisboa',           'Lisboa',             'Portugal', ['locality'], ['lisbon']),
  D('local_porto',            'Porto',              'Portugal'),
  D('local_madeira',          'Madeira',            'Portugal'),
  D('local_acores',           'Açores',             'Portugal', ['locality'], ['azores']),
  D('local_algarve',           'Algarve',            'Portugal'),
  D('local_berlim',           'Berlim',             'Alemanha', ['locality'], ['berlin']),
  D('local_munique',          'Munique',            'Alemanha', ['locality'], ['munich', 'munchen']),
  D('local_hamburgo',         'Hamburgo',           'Alemanha', ['locality'], ['hamburg']),
  D('local_amsterda',         'Amsterdã',           'Holanda', ['locality'], ['amsterdam']),
  D('local_bruxelas',         'Bruxelas',           'Bélgica', ['locality'], ['brussels']),
  D('local_viena',            'Viena',              'Áustria', ['locality'], ['vienna', 'wien']),
  D('local_praga',            'Praga',              'República Tcheca', ['locality'], ['prague']),
  D('local_budapeste',        'Budapeste',          'Hungria', ['locality'], ['budapest']),
  D('local_varsovia',         'Varsóvia',           'Polônia', ['locality'], ['warsaw']),
  D('local_cracovia',         'Cracóvia',           'Polônia', ['locality'], ['krakow']),
  D('local_atenas',            'Atenas',             'Grécia', ['locality'], ['athens']),
  D('local_santorini',        'Santorini',          'Grécia'),
  D('local_mykonos',          'Mykonos',            'Grécia'),
  D('local_creta',            'Creta',              'Grécia', ['locality'], ['crete']),
  D('local_istambul',         'Istambul',           'Turquia', ['locality'], ['istanbul']),
  D('local_capadocia',        'Capadócia',          'Turquia', ['locality'], ['cappadocia']),
  D('local_dublin',           'Dublin',             'Irlanda'),
  D('local_edimburgo',        'Edimburgo',          'Escócia', ['locality'], ['edinburgh']),
  D('local_copenhagen',       'Copenhague',         'Dinamarca', ['locality'], ['copenhagen']),
  D('local_estocolmo',        'Estocolmo',          'Suécia', ['locality'], ['stockholm']),
  D('local_oslo',             'Oslo',               'Noruega'),
  D('local_helsinki',         'Helsinki',           'Finlândia'),
  D('local_reykjavik',        'Reykjavík',          'Islândia', ['locality'], ['reykjavik']),
  D('local_zurique',          'Zurique',            'Suíça', ['locality'], ['zurich']),
  D('local_genebra',          'Genebra',            'Suíça', ['locality'], ['geneva']),
  D('local_interlaken',       'Interlaken',         'Suíça'),
  D('local_dubrovnik',        'Dubrovnik',          'Croácia'),
  D('local_split',            'Split',              'Croácia'),
  D('local_zagreb',           'Zagreb',             'Croácia'),

  // América do Norte
  D('local_nova_york',        'Nova York',          'EUA', ['locality'], ['new york', 'nyc', 'ny']),
  D('local_los_angeles',      'Los Angeles',        'EUA', ['locality'], ['la']),
  D('local_san_francisco',    'San Francisco',      'EUA'),
  D('local_miami',            'Miami',              'EUA'),
  D('local_orlando',          'Orlando',            'EUA'),
  D('local_las_vegas',        'Las Vegas',          'EUA'),
  D('local_chicago',          'Chicago',            'EUA'),
  D('local_washington',       'Washington',         'EUA'),
  D('local_boston',           'Boston',             'EUA'),
  D('local_seattle',          'Seattle',            'EUA'),
  D('local_havai',            'Havaí',              'EUA', ['locality'], ['hawaii']),
  D('local_toronto',          'Toronto',            'Canadá'),
  D('local_vancouver',        'Vancouver',          'Canadá'),
  D('local_montreal',         'Montreal',           'Canadá'),
  D('local_cidade_mexico',    'Cidade do México',   'México', ['locality'], ['mexico city', 'cdmx']),
  D('local_cancun',           'Cancún',             'México'),
  D('local_tulum',            'Tulum',              'México'),
  D('local_playa_carmen',     'Playa del Carmen',   'México'),

  // América do Sul
  D('local_buenos_aires',     'Buenos Aires',       'Argentina'),
  D('local_bariloche',        'Bariloche',          'Argentina'),
  D('local_mendoza',          'Mendoza',            'Argentina'),
  D('local_santiago',         'Santiago',           'Chile'),
  D('local_atacama',          'Atacama',            'Chile'),
  D('local_patagonia',        'Patagônia',          'Chile/Argentina'),
  D('local_torres_paine',     'Torres del Paine',   'Chile'),
  D('local_lima',             'Lima',               'Peru'),
  D('local_cusco',            'Cusco',              'Peru'),
  D('local_machu_picchu',     'Machu Picchu',       'Peru'),
  D('local_cartagena',        'Cartagena',          'Colômbia'),
  D('local_medellin',         'Medellín',           'Colômbia'),
  D('local_bogota',           'Bogotá',             'Colômbia'),
  D('local_montevideo',       'Montevidéu',         'Uruguai', ['locality'], ['montevideo']),
  D('local_punta_del_este',   'Punta del Este',     'Uruguai'),
  D('local_quito',            'Quito',              'Equador'),
  D('local_galapagos',        'Galápagos',          'Equador'),
  D('local_la_paz',           'La Paz',             'Bolívia'),
  D('local_uyuni',            'Salar de Uyuni',     'Bolívia'),
  D('local_assuncao',         'Assunção',           'Paraguai', ['locality'], ['asuncion']),
  D('local_caracas',          'Caracas',            'Venezuela'),

  // Ásia
  D('local_toquio',           'Tóquio',             'Japão', ['locality'], ['tokyo']),
  D('local_kyoto',            'Kyoto',              'Japão', ['locality'], ['kioto']),
  D('local_osaka',            'Osaka',              'Japão'),
  D('local_hokkaido',         'Hokkaido',           'Japão'),
  D('local_seoul',            'Seul',               'Coreia do Sul', ['locality'], ['seoul']),
  D('local_pequim',           'Pequim',             'China', ['locality'], ['beijing']),
  D('local_xangai',           'Xangai',             'China', ['locality'], ['shanghai']),
  D('local_hong_kong',        'Hong Kong',          'China'),
  D('local_taipei',           'Taipei',             'Taiwan'),
  D('local_bangkok',          'Bangkok',            'Tailândia'),
  D('local_phuket',           'Phuket',             'Tailândia'),
  D('local_krabi',            'Krabi',              'Tailândia'),
  D('local_chiang_mai',       'Chiang Mai',         'Tailândia'),
  D('local_bali',             'Bali',               'Indonésia'),
  D('local_jacarta',          'Jacarta',            'Indonésia', ['locality'], ['jakarta']),
  D('local_singapura',        'Singapura',          'Singapura', ['locality'], ['singapore']),
  D('local_kuala_lumpur',     'Kuala Lumpur',       'Malásia'),
  D('local_manila',           'Manila',             'Filipinas'),
  D('local_boracay',          'Boracay',            'Filipinas'),
  D('local_hanoi',            'Hanoi',              'Vietnã'),
  D('local_ho_chi_minh',      'Ho Chi Minh',        'Vietnã', ['locality'], ['saigon', 'saigão']),
  D('local_siem_reap',        'Siem Reap',          'Camboja'),
  D('local_deli',             'Nova Déli',          'Índia', ['locality'], ['new delhi', 'delhi']),
  D('local_mumbai',           'Mumbai',             'Índia'),
  D('local_goa',              'Goa',                'Índia'),
  D('local_jaipur',            'Jaipur',             'Índia'),
  D('local_colombo',          'Colombo',            'Sri Lanka'),
  D('local_maldivas',         'Maldivas',           'Maldivas', ['locality'], ['maldives']),
  D('local_nepal',            'Katmandu',           'Nepal', ['locality'], ['kathmandu']),

  // Oriente Médio
  D('local_dubai',            'Dubai',              'Emirados Árabes'),
  D('local_abu_dhabi',        'Abu Dhabi',          'Emirados Árabes'),
  D('local_doha',             'Doha',               'Catar'),
  D('local_riad',             'Riade',              'Arábia Saudita', ['locality'], ['riyadh']),
  D('local_jerusalem',        'Jerusalém',          'Israel', ['locality'], ['jerusalem']),
  D('local_tel_aviv',         'Tel Aviv',           'Israel'),
  D('local_petra',            'Petra',              'Jordânia'),
  D('local_amman',            'Amã',                'Jordânia', ['locality'], ['amman']),
  D('local_beirute',          'Beirute',            'Líbano', ['locality'], ['beirut']),

  // África
  D('local_cairo',            'Cairo',              'Egito'),
  D('local_luxor',            'Luxor',              'Egito'),
  D('local_marrakech',        'Marrakech',          'Marrocos', ['locality'], ['marrakesh']),
  D('local_casablanca',       'Casablanca',          'Marrocos'),
  D('local_fez',              'Fez',                'Marrocos'),
  D('local_cidade_cabo',      'Cidade do Cabo',     'África do Sul', ['locality'], ['cape town']),
  D('local_joanesburgo',      'Joanesburgo',        'África do Sul', ['locality'], ['johannesburg']),
  D('local_nairobi',          'Nairóbi',            'Quênia', ['locality'], ['nairobi']),
  D('local_zanzibar',         'Zanzibar',           'Tanzânia'),
  D('local_maurice',          'Ilhas Maurício',     'Maurício', ['locality'], ['mauritius']),
  D('local_seychelles',       'Seychelles',         'Seychelles'),

  // Oceania
  D('local_sydney',           'Sydney',             'Austrália'),
  D('local_melbourne',        'Melbourne',          'Austrália'),
  D('local_brisbane',         'Brisbane',           'Austrália'),
  D('local_gold_coast',       'Gold Coast',         'Austrália'),
  D('local_auckland',         'Auckland',           'Nova Zelândia'),
  D('local_queenstown',       'Queenstown',         'Nova Zelândia'),
  D('local_fiji',             'Fiji',               'Fiji'),
  D('local_tahiti',            'Tahiti',             'Polinésia Francesa'),
  D('local_bora_bora',        'Bora Bora',          'Polinésia Francesa'),

  // Países (para queries genéricas como "frança", "japão")
  D('local_country_br',       'Brasil',             'América do Sul',       ['country']),
  D('local_country_fr',       'França',             'Europa',               ['country'], ['france']),
  D('local_country_it',       'Itália',             'Europa',               ['country'], ['italy', 'italia']),
  D('local_country_es',       'Espanha',            'Europa',               ['country'], ['spain']),
  D('local_country_pt',       'Portugal',           'Europa',               ['country']),
  D('local_country_uk',       'Reino Unido',        'Europa',               ['country'], ['uk', 'united kingdom', 'inglaterra', 'england']),
  D('local_country_de',       'Alemanha',           'Europa',               ['country'], ['germany']),
  D('local_country_nl',       'Holanda',            'Europa',               ['country'], ['netherlands']),
  D('local_country_gr',       'Grécia',             'Europa',               ['country'], ['greece']),
  D('local_country_us',       'Estados Unidos',     'América do Norte',     ['country'], ['eua', 'usa', 'united states']),
  D('local_country_ca',       'Canadá',             'América do Norte',     ['country'], ['canada']),
  D('local_country_mx',       'México',             'América do Norte',     ['country'], ['mexico']),
  D('local_country_ar',       'Argentina',          'América do Sul',       ['country']),
  D('local_country_cl',       'Chile',              'América do Sul',       ['country']),
  D('local_country_pe',       'Peru',               'América do Sul',       ['country']),
  D('local_country_co',       'Colômbia',           'América do Sul',       ['country'], ['colombia']),
  D('local_country_uy',       'Uruguai',            'América do Sul',       ['country'], ['uruguay']),
  D('local_country_jp',       'Japão',              'Ásia',                 ['country'], ['japan']),
  D('local_country_cn',       'China',              'Ásia',                 ['country']),
  D('local_country_th',       'Tailândia',          'Ásia',                 ['country'], ['thailand']),
  D('local_country_id',       'Indonésia',          'Ásia',                 ['country'], ['indonesia']),
  D('local_country_in',       'Índia',              'Ásia',                 ['country'], ['india']),
  D('local_country_vn',       'Vietnã',             'Ásia',                 ['country'], ['vietnam']),
  D('local_country_kr',       'Coreia do Sul',      'Ásia',                 ['country'], ['south korea', 'korea']),
  D('local_country_ae',       'Emirados Árabes',    'Oriente Médio',        ['country'], ['uae']),
  D('local_country_tr',       'Turquia',            'Europa/Ásia',          ['country'], ['turkey']),
  D('local_country_eg',       'Egito',              'África',               ['country'], ['egypt']),
  D('local_country_ma',       'Marrocos',           'África',               ['country'], ['morocco']),
  D('local_country_za',       'África do Sul',      'África',               ['country'], ['south africa']),
  D('local_country_au',       'Austrália',          'Oceania',              ['country'], ['australia']),
  D('local_country_nz',       'Nova Zelândia',      'Oceania',              ['country'], ['new zealand']),
];

// ─── Índice pré-computado ────────────────────────────────────────────────────
// Pré-normaliza tudo uma vez (no module load) para que a busca em runtime seja
// O(n) de comparação de strings normalizadas, sem custo de normalização por query.

interface IndexedDestination {
  dest: LocalDestination;
  normalizedMain: string;
  normalizedSecondary: string;
  normalizedAliases: string[];
}

const INDEX: IndexedDestination[] = LOCAL_DESTINATIONS.map((dest) => ({
  dest,
  normalizedMain: normalize(dest.main),
  normalizedSecondary: normalize(dest.secondary),
  normalizedAliases: (dest.aliases ?? []).map(normalize),
}));

// ─── Busca ────────────────────────────────────────────────────────────────────

export interface LocalSearchOptions {
  limit?: number;
  /** Código ISO do país do usuário — boost para destinos do mesmo país */
  userCountry?: string;
}

/**
 * Busca na base local com ranking por qualidade de match:
 *   score 100: prefix match no main
 *   score  80: prefix match em alias
 *   score  60: contains match no main
 *   score  40: contains match em alias/secondary
 *   + boost   : destino no país do usuário
 *
 * Retorna array ordenado por score descrescente.
 */
export function searchLocal(
  query: string,
  opts: LocalSearchOptions = {},
): LocalDestination[] {
  const { limit = 6, userCountry } = opts;
  const q = normalize(query);
  if (q.length === 0) return [];

  const scored: Array<{ dest: LocalDestination; score: number }> = [];

  for (const { dest, normalizedMain, normalizedSecondary, normalizedAliases } of INDEX) {
    let score = 0;

    if (normalizedMain.startsWith(q)) {
      score = 100;
    } else if (normalizedAliases.some((a) => a.startsWith(q))) {
      score = 80;
    } else if (normalizedMain.includes(q)) {
      score = 60;
    } else if (
      normalizedAliases.some((a) => a.includes(q)) ||
      normalizedSecondary.includes(q)
    ) {
      score = 40;
    }

    if (score === 0) continue;

    // Boost: destino do mesmo país do usuário aparece antes
    if (userCountry && dest.secondary.toLowerCase().includes(countryNameFromCode(userCountry).toLowerCase())) {
      score += 15;
    }

    // Penalidade leve para países puros vs cidades (cidades são mais acionáveis)
    if (dest.types.includes('country')) score -= 5;

    scored.push({ dest, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.dest);
}

// Mapeamento mínimo ISO → nome em PT para matching geográfico no boost.
function countryNameFromCode(code: string): string {
  const map: Record<string, string> = {
    BR: 'Brasil', US: 'EUA', PT: 'Portugal', FR: 'França', IT: 'Itália',
    ES: 'Espanha', DE: 'Alemanha', UK: 'Reino Unido', GB: 'Reino Unido',
    JP: 'Japão', CN: 'China', TH: 'Tailândia', AR: 'Argentina', CL: 'Chile',
    PE: 'Peru', CO: 'Colômbia', MX: 'México', CA: 'Canadá', AU: 'Austrália',
    NZ: 'Nova Zelândia', NL: 'Holanda', GR: 'Grécia', TR: 'Turquia',
  };
  return map[code.toUpperCase()] ?? '';
}
