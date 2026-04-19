// ═══════════════════════════════════════════════════════════════════════════
// Curadoria de destinos "Em alta" — pool global com destinos locais de
// dezenas de países, permitindo que o sistema recomende destinos nacionais
// ao usuário de acordo com o país de acesso detectado pelo Vercel.
// ═══════════════════════════════════════════════════════════════════════════

export type TrendingRegion =
  | 'BR_NORDESTE' | 'BR_SUL' | 'BR_SUDESTE' | 'BR_NORTE' | 'BR_CENTRO_OESTE'
  | 'AMERICAS' | 'EUROPA' | 'ASIA' | 'AFRICA' | 'OCEANIA' | 'ORIENTE_MEDIO';

export interface TrendingEntry {
  name: string;
  /** Nome do país em português (para exibição) */
  country: string;
  /** ISO 3166-1 alpha-2 (BR, US, PT, JP...) — usado para filtro por país */
  countryCode: string;
  region: TrendingRegion;
  emoji: string;
  gradient: string;
  tag: string;
  rating: number;
  query: string;
}

// ─── Pool principal ──────────────────────────────────────────────────────────
// Organizado por país para facilitar manutenção e garantir que cada país
// tenha variedade de estilos (praia, cultura, aventura, natureza, urbano).

export const TRENDING_POOL: TrendingEntry[] = [
  // ═══ BRASIL ════════════════════════════════════════════════════════════════
  // Nordeste
  { name: 'Fernando de Noronha', country: 'Brasil', countryCode: 'BR', region: 'BR_NORDESTE', emoji: '🐬', gradient: 'from-cyan-500 to-blue-600', tag: 'Praia', rating: 4.9, query: 'Fernando de Noronha beach Brazil' },
  { name: 'Jericoacoara', country: 'Brasil', countryCode: 'BR', region: 'BR_NORDESTE', emoji: '🏖️', gradient: 'from-amber-400 to-orange-500', tag: 'Praia', rating: 4.8, query: 'Jericoacoara Ceara dunes beach' },
  { name: 'Porto de Galinhas', country: 'Brasil', countryCode: 'BR', region: 'BR_NORDESTE', emoji: '🐠', gradient: 'from-sky-400 to-teal-500', tag: 'Praia', rating: 4.7, query: 'Porto de Galinhas Pernambuco natural pools' },
  { name: 'Chapada Diamantina', country: 'Brasil', countryCode: 'BR', region: 'BR_NORDESTE', emoji: '🏞️', gradient: 'from-emerald-600 to-teal-700', tag: 'Aventura', rating: 4.9, query: 'Chapada Diamantina Bahia waterfall' },
  { name: 'Salvador', country: 'Brasil', countryCode: 'BR', region: 'BR_NORDESTE', emoji: '🎭', gradient: 'from-amber-500 to-red-600', tag: 'Cultura', rating: 4.6, query: 'Salvador Bahia Pelourinho colonial' },
  { name: 'Lençóis Maranhenses', country: 'Brasil', countryCode: 'BR', region: 'BR_NORDESTE', emoji: '🏜️', gradient: 'from-sky-300 to-amber-200', tag: 'Natureza', rating: 4.9, query: 'Lencois Maranhenses dunes lagoons' },
  { name: 'Maragogi', country: 'Brasil', countryCode: 'BR', region: 'BR_NORDESTE', emoji: '🤿', gradient: 'from-teal-400 to-cyan-600', tag: 'Praia', rating: 4.8, query: 'Maragogi Alagoas caribbean beach' },
  { name: 'Pipa', country: 'Brasil', countryCode: 'BR', region: 'BR_NORDESTE', emoji: '🐢', gradient: 'from-orange-400 to-red-500', tag: 'Praia', rating: 4.7, query: 'Praia da Pipa Rio Grande do Norte cliffs' },
  // Sul
  { name: 'Florianópolis', country: 'Brasil', countryCode: 'BR', region: 'BR_SUL', emoji: '🏄', gradient: 'from-blue-500 to-indigo-600', tag: 'Praia', rating: 4.7, query: 'Florianopolis Santa Catarina island beach' },
  { name: 'Gramado', country: 'Brasil', countryCode: 'BR', region: 'BR_SUL', emoji: '🌲', gradient: 'from-emerald-600 to-green-800', tag: 'Romance', rating: 4.8, query: 'Gramado Rio Grande do Sul winter' },
  { name: 'Bombinhas', country: 'Brasil', countryCode: 'BR', region: 'BR_SUL', emoji: '🐟', gradient: 'from-teal-500 to-blue-600', tag: 'Praia', rating: 4.7, query: 'Bombinhas Santa Catarina diving beach' },
  { name: 'Foz do Iguaçu', country: 'Brasil', countryCode: 'BR', region: 'BR_SUL', emoji: '💦', gradient: 'from-emerald-500 to-teal-700', tag: 'Natureza', rating: 4.9, query: 'Iguaçu falls Brazil Parana' },
  { name: 'Cambará do Sul', country: 'Brasil', countryCode: 'BR', region: 'BR_SUL', emoji: '🏔️', gradient: 'from-slate-500 to-emerald-700', tag: 'Aventura', rating: 4.8, query: 'Cambara do Sul canyons Itaimbezinho' },
  // Sudeste
  { name: 'Rio de Janeiro', country: 'Brasil', countryCode: 'BR', region: 'BR_SUDESTE', emoji: '🌅', gradient: 'from-amber-400 to-rose-600', tag: 'Urbano', rating: 4.8, query: 'Rio de Janeiro Christ Redeemer beach' },
  { name: 'Paraty', country: 'Brasil', countryCode: 'BR', region: 'BR_SUDESTE', emoji: '⛵', gradient: 'from-indigo-500 to-blue-700', tag: 'História', rating: 4.8, query: 'Paraty colonial town boats' },
  { name: 'Ilhabela', country: 'Brasil', countryCode: 'BR', region: 'BR_SUDESTE', emoji: '🌴', gradient: 'from-emerald-400 to-teal-600', tag: 'Praia', rating: 4.7, query: 'Ilhabela Sao Paulo beach forest' },
  { name: 'Ouro Preto', country: 'Brasil', countryCode: 'BR', region: 'BR_SUDESTE', emoji: '⛪', gradient: 'from-amber-600 to-yellow-700', tag: 'História', rating: 4.8, query: 'Ouro Preto Minas Gerais colonial' },
  { name: 'Campos do Jordão', country: 'Brasil', countryCode: 'BR', region: 'BR_SUDESTE', emoji: '🎿', gradient: 'from-slate-400 to-indigo-600', tag: 'Romance', rating: 4.6, query: 'Campos do Jordao mountain winter' },
  { name: 'Ilha Grande', country: 'Brasil', countryCode: 'BR', region: 'BR_SUDESTE', emoji: '🏝️', gradient: 'from-teal-500 to-emerald-700', tag: 'Praia', rating: 4.8, query: 'Ilha Grande Angra dos Reis Brazil' },
  // Norte
  { name: 'Manaus', country: 'Brasil', countryCode: 'BR', region: 'BR_NORTE', emoji: '🌿', gradient: 'from-green-600 to-emerald-800', tag: 'Natureza', rating: 4.6, query: 'Manaus Amazon rainforest meeting waters' },
  { name: 'Alter do Chão', country: 'Brasil', countryCode: 'BR', region: 'BR_NORTE', emoji: '🏞️', gradient: 'from-sky-400 to-teal-500', tag: 'Natureza', rating: 4.8, query: 'Alter do Chao Para beach river' },
  { name: 'Jalapão', country: 'Brasil', countryCode: 'BR', region: 'BR_NORTE', emoji: '💧', gradient: 'from-amber-500 to-orange-600', tag: 'Aventura', rating: 4.9, query: 'Jalapao Tocantins dunes waterfall' },
  // Centro-Oeste
  { name: 'Bonito', country: 'Brasil', countryCode: 'BR', region: 'BR_CENTRO_OESTE', emoji: '🐟', gradient: 'from-cyan-400 to-teal-600', tag: 'Natureza', rating: 4.9, query: 'Bonito Mato Grosso do Sul crystal river' },
  { name: 'Pantanal', country: 'Brasil', countryCode: 'BR', region: 'BR_CENTRO_OESTE', emoji: '🦜', gradient: 'from-emerald-600 to-green-800', tag: 'Natureza', rating: 4.8, query: 'Pantanal wetlands wildlife Brazil' },
  { name: 'Chapada dos Veadeiros', country: 'Brasil', countryCode: 'BR', region: 'BR_CENTRO_OESTE', emoji: '🏔️', gradient: 'from-amber-500 to-red-700', tag: 'Aventura', rating: 4.8, query: 'Chapada dos Veadeiros Goias waterfall' },

  // ═══ EUA ═══════════════════════════════════════════════════════════════════
  { name: 'Nova York', country: 'EUA', countryCode: 'US', region: 'AMERICAS', emoji: '🗽', gradient: 'from-sky-600 to-blue-700', tag: 'Urbano', rating: 4.8, query: 'New York City lights' },
  { name: 'Los Angeles', country: 'EUA', countryCode: 'US', region: 'AMERICAS', emoji: '🌴', gradient: 'from-amber-400 to-rose-500', tag: 'Urbano', rating: 4.6, query: 'Los Angeles California beach' },
  { name: 'São Francisco', country: 'EUA', countryCode: 'US', region: 'AMERICAS', emoji: '🌉', gradient: 'from-orange-500 to-red-700', tag: 'Urbano', rating: 4.8, query: 'San Francisco Golden Gate' },
  { name: 'Miami', country: 'EUA', countryCode: 'US', region: 'AMERICAS', emoji: '🏖️', gradient: 'from-pink-400 to-cyan-500', tag: 'Praia', rating: 4.5, query: 'Miami Beach Florida' },
  { name: 'Grand Canyon', country: 'EUA', countryCode: 'US', region: 'AMERICAS', emoji: '🏜️', gradient: 'from-amber-600 to-red-800', tag: 'Natureza', rating: 4.9, query: 'Grand Canyon Arizona landscape' },
  { name: 'Havaí', country: 'EUA', countryCode: 'US', region: 'AMERICAS', emoji: '🌺', gradient: 'from-emerald-500 to-teal-700', tag: 'Praia', rating: 4.9, query: 'Hawaii beach volcano' },
  { name: 'Las Vegas', country: 'EUA', countryCode: 'US', region: 'AMERICAS', emoji: '🎰', gradient: 'from-amber-500 to-red-600', tag: 'Urbano', rating: 4.5, query: 'Las Vegas strip lights' },
  { name: 'Yellowstone', country: 'EUA', countryCode: 'US', region: 'AMERICAS', emoji: '🦬', gradient: 'from-emerald-600 to-amber-700', tag: 'Natureza', rating: 4.9, query: 'Yellowstone National Park geyser' },
  { name: 'Nova Orleans', country: 'EUA', countryCode: 'US', region: 'AMERICAS', emoji: '🎷', gradient: 'from-purple-500 to-rose-600', tag: 'Cultura', rating: 4.7, query: 'New Orleans French Quarter jazz' },

  // ═══ CANADÁ ════════════════════════════════════════════════════════════════
  { name: 'Banff', country: 'Canadá', countryCode: 'CA', region: 'AMERICAS', emoji: '🏔️', gradient: 'from-teal-500 to-blue-700', tag: 'Natureza', rating: 4.9, query: 'Banff Canada lake mountains' },
  { name: 'Toronto', country: 'Canadá', countryCode: 'CA', region: 'AMERICAS', emoji: '🏙️', gradient: 'from-sky-500 to-indigo-700', tag: 'Urbano', rating: 4.6, query: 'Toronto skyline CN Tower' },
  { name: 'Vancouver', country: 'Canadá', countryCode: 'CA', region: 'AMERICAS', emoji: '🌲', gradient: 'from-emerald-500 to-teal-700', tag: 'Urbano', rating: 4.8, query: 'Vancouver British Columbia mountains' },
  { name: 'Quebec', country: 'Canadá', countryCode: 'CA', region: 'AMERICAS', emoji: '🏰', gradient: 'from-indigo-600 to-slate-800', tag: 'História', rating: 4.8, query: 'Quebec City old town' },
  { name: 'Niágara', country: 'Canadá', countryCode: 'CA', region: 'AMERICAS', emoji: '💦', gradient: 'from-blue-500 to-teal-700', tag: 'Natureza', rating: 4.8, query: 'Niagara Falls Canada' },

  // ═══ MÉXICO ════════════════════════════════════════════════════════════════
  { name: 'Cidade do México', country: 'México', countryCode: 'MX', region: 'AMERICAS', emoji: '🌵', gradient: 'from-rose-500 to-amber-600', tag: 'Cultura', rating: 4.7, query: 'Mexico City cathedral colorful' },
  { name: 'Cancún', country: 'México', countryCode: 'MX', region: 'AMERICAS', emoji: '🏖️', gradient: 'from-cyan-400 to-teal-600', tag: 'Praia', rating: 4.7, query: 'Cancun Mexico beach caribbean' },
  { name: 'Tulum', country: 'México', countryCode: 'MX', region: 'AMERICAS', emoji: '🏛️', gradient: 'from-teal-500 to-emerald-700', tag: 'História', rating: 4.8, query: 'Tulum ruins Mexico beach' },
  { name: 'Oaxaca', country: 'México', countryCode: 'MX', region: 'AMERICAS', emoji: '🌶️', gradient: 'from-amber-500 to-red-700', tag: 'Cultura', rating: 4.8, query: 'Oaxaca Mexico colorful market' },
  { name: 'Chichén Itzá', country: 'México', countryCode: 'MX', region: 'AMERICAS', emoji: '🏛️', gradient: 'from-amber-600 to-orange-700', tag: 'História', rating: 4.9, query: 'Chichen Itza Mayan pyramid' },

  // ═══ ARGENTINA ═════════════════════════════════════════════════════════════
  { name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', region: 'AMERICAS', emoji: '💃', gradient: 'from-sky-500 to-blue-700', tag: 'Cultura', rating: 4.7, query: 'Buenos Aires tango architecture' },
  { name: 'Patagônia', country: 'Argentina', countryCode: 'AR', region: 'AMERICAS', emoji: '🏔️', gradient: 'from-slate-500 to-slate-700', tag: 'Aventura', rating: 4.9, query: 'Patagonia Argentina mountains' },
  { name: 'Bariloche', country: 'Argentina', countryCode: 'AR', region: 'AMERICAS', emoji: '🎿', gradient: 'from-blue-500 to-indigo-700', tag: 'Aventura', rating: 4.8, query: 'Bariloche Argentina lake mountains' },
  { name: 'Mendoza', country: 'Argentina', countryCode: 'AR', region: 'AMERICAS', emoji: '🍷', gradient: 'from-rose-600 to-red-800', tag: 'Gastronomia', rating: 4.8, query: 'Mendoza Argentina wine vineyard' },
  { name: 'Ushuaia', country: 'Argentina', countryCode: 'AR', region: 'AMERICAS', emoji: '🐧', gradient: 'from-slate-500 to-indigo-700', tag: 'Aventura', rating: 4.8, query: 'Ushuaia end of the world' },

  // ═══ CHILE ═════════════════════════════════════════════════════════════════
  { name: 'Santiago', country: 'Chile', countryCode: 'CL', region: 'AMERICAS', emoji: '🏙️', gradient: 'from-sky-500 to-indigo-600', tag: 'Urbano', rating: 4.5, query: 'Santiago Chile Andes skyline' },
  { name: 'Atacama', country: 'Chile', countryCode: 'CL', region: 'AMERICAS', emoji: '🏜️', gradient: 'from-amber-500 to-red-700', tag: 'Natureza', rating: 4.9, query: 'Atacama desert Chile' },
  { name: 'Torres del Paine', country: 'Chile', countryCode: 'CL', region: 'AMERICAS', emoji: '🏔️', gradient: 'from-slate-500 to-teal-700', tag: 'Aventura', rating: 4.9, query: 'Torres del Paine Patagonia Chile' },
  { name: 'Valparaíso', country: 'Chile', countryCode: 'CL', region: 'AMERICAS', emoji: '🎨', gradient: 'from-rose-500 to-amber-500', tag: 'Cultura', rating: 4.7, query: 'Valparaiso colorful hills Chile' },

  // ═══ PERU ══════════════════════════════════════════════════════════════════
  { name: 'Cusco', country: 'Peru', countryCode: 'PE', region: 'AMERICAS', emoji: '🏛️', gradient: 'from-amber-600 to-red-700', tag: 'História', rating: 4.9, query: 'Cusco Machu Picchu Peru' },
  { name: 'Lima', country: 'Peru', countryCode: 'PE', region: 'AMERICAS', emoji: '🍽️', gradient: 'from-amber-500 to-orange-600', tag: 'Gastronomia', rating: 4.7, query: 'Lima Peru Miraflores coast' },
  { name: 'Machu Picchu', country: 'Peru', countryCode: 'PE', region: 'AMERICAS', emoji: '⛰️', gradient: 'from-emerald-500 to-slate-700', tag: 'História', rating: 5.0, query: 'Machu Picchu ancient ruins' },
  { name: 'Arequipa', country: 'Peru', countryCode: 'PE', region: 'AMERICAS', emoji: '🌋', gradient: 'from-amber-500 to-red-600', tag: 'Cultura', rating: 4.7, query: 'Arequipa Peru white city volcano' },

  // ═══ COLÔMBIA ══════════════════════════════════════════════════════════════
  { name: 'Cartagena', country: 'Colômbia', countryCode: 'CO', region: 'AMERICAS', emoji: '🌺', gradient: 'from-pink-500 to-orange-500', tag: 'Romance', rating: 4.8, query: 'Cartagena Colombia colonial colorful' },
  { name: 'Medellín', country: 'Colômbia', countryCode: 'CO', region: 'AMERICAS', emoji: '🏙️', gradient: 'from-emerald-500 to-teal-700', tag: 'Urbano', rating: 4.7, query: 'Medellin Colombia eternal spring' },
  { name: 'Bogotá', country: 'Colômbia', countryCode: 'CO', region: 'AMERICAS', emoji: '🎨', gradient: 'from-amber-500 to-red-600', tag: 'Cultura', rating: 4.5, query: 'Bogota Colombia street art' },
  { name: 'Eixo Cafeeiro', country: 'Colômbia', countryCode: 'CO', region: 'AMERICAS', emoji: '☕', gradient: 'from-emerald-600 to-green-800', tag: 'Natureza', rating: 4.8, query: 'Colombia coffee region Quindio' },

  // ═══ CUBA ══════════════════════════════════════════════════════════════════
  { name: 'Havana', country: 'Cuba', countryCode: 'CU', region: 'AMERICAS', emoji: '🚗', gradient: 'from-amber-500 to-red-600', tag: 'Cultura', rating: 4.7, query: 'Havana Cuba classic cars colorful' },
  { name: 'Varadero', country: 'Cuba', countryCode: 'CU', region: 'AMERICAS', emoji: '🏖️', gradient: 'from-cyan-400 to-teal-600', tag: 'Praia', rating: 4.7, query: 'Varadero Cuba beach caribbean' },

  // ═══ PORTUGAL ══════════════════════════════════════════════════════════════
  { name: 'Lisboa', country: 'Portugal', countryCode: 'PT', region: 'EUROPA', emoji: '🚋', gradient: 'from-amber-400 to-orange-600', tag: 'Cultura', rating: 4.7, query: 'Lisbon Portugal tram tiles' },
  { name: 'Porto', country: 'Portugal', countryCode: 'PT', region: 'EUROPA', emoji: '🍷', gradient: 'from-rose-500 to-red-700', tag: 'Gastronomia', rating: 4.8, query: 'Porto Portugal Douro wine' },
  { name: 'Madeira', country: 'Portugal', countryCode: 'PT', region: 'EUROPA', emoji: '🌺', gradient: 'from-emerald-500 to-teal-700', tag: 'Natureza', rating: 4.9, query: 'Madeira island Portugal cliffs' },
  { name: 'Algarve', country: 'Portugal', countryCode: 'PT', region: 'EUROPA', emoji: '🏖️', gradient: 'from-amber-400 to-orange-500', tag: 'Praia', rating: 4.8, query: 'Algarve Portugal beach cliffs' },
  { name: 'Sintra', country: 'Portugal', countryCode: 'PT', region: 'EUROPA', emoji: '🏰', gradient: 'from-rose-500 to-amber-600', tag: 'História', rating: 4.9, query: 'Sintra Portugal palace Pena' },
  { name: 'Açores', country: 'Portugal', countryCode: 'PT', region: 'EUROPA', emoji: '🌋', gradient: 'from-emerald-500 to-blue-700', tag: 'Natureza', rating: 4.9, query: 'Azores islands Portugal volcano' },
  { name: 'Coimbra', country: 'Portugal', countryCode: 'PT', region: 'EUROPA', emoji: '🎓', gradient: 'from-amber-500 to-red-600', tag: 'História', rating: 4.7, query: 'Coimbra Portugal university old town' },

  // ═══ ESPANHA ═══════════════════════════════════════════════════════════════
  { name: 'Barcelona', country: 'Espanha', countryCode: 'ES', region: 'EUROPA', emoji: '🎨', gradient: 'from-red-500 to-yellow-500', tag: 'Arquitetura', rating: 4.8, query: 'Barcelona Gaudi city' },
  { name: 'Madrid', country: 'Espanha', countryCode: 'ES', region: 'EUROPA', emoji: '🎭', gradient: 'from-amber-500 to-red-600', tag: 'Cultura', rating: 4.7, query: 'Madrid Spain plaza architecture' },
  { name: 'Sevilha', country: 'Espanha', countryCode: 'ES', region: 'EUROPA', emoji: '💃', gradient: 'from-amber-400 to-orange-600', tag: 'Cultura', rating: 4.8, query: 'Seville Spain Alcazar flamenco' },
  { name: 'Granada', country: 'Espanha', countryCode: 'ES', region: 'EUROPA', emoji: '🕌', gradient: 'from-amber-500 to-red-700', tag: 'História', rating: 4.9, query: 'Granada Alhambra Spain' },
  { name: 'Ibiza', country: 'Espanha', countryCode: 'ES', region: 'EUROPA', emoji: '🎉', gradient: 'from-pink-500 to-purple-600', tag: 'Praia', rating: 4.6, query: 'Ibiza Spain beach nightlife' },
  { name: 'Maiorca', country: 'Espanha', countryCode: 'ES', region: 'EUROPA', emoji: '🏝️', gradient: 'from-cyan-500 to-teal-700', tag: 'Praia', rating: 4.8, query: 'Mallorca Spain beach coast' },
  { name: 'Bilbao', country: 'Espanha', countryCode: 'ES', region: 'EUROPA', emoji: '🏛️', gradient: 'from-slate-500 to-indigo-700', tag: 'Arquitetura', rating: 4.7, query: 'Bilbao Guggenheim museum' },

  // ═══ FRANÇA ════════════════════════════════════════════════════════════════
  { name: 'Paris', country: 'França', countryCode: 'FR', region: 'EUROPA', emoji: '🗼', gradient: 'from-sky-500 to-indigo-600', tag: 'Cultura', rating: 4.8, query: 'Paris city skyline' },
  { name: 'Nice', country: 'França', countryCode: 'FR', region: 'EUROPA', emoji: '🏖️', gradient: 'from-cyan-500 to-blue-700', tag: 'Praia', rating: 4.7, query: 'Nice French Riviera beach' },
  { name: 'Provence', country: 'França', countryCode: 'FR', region: 'EUROPA', emoji: '💜', gradient: 'from-purple-500 to-fuchsia-700', tag: 'Romance', rating: 4.9, query: 'Provence lavender fields France' },
  { name: 'Mont Saint-Michel', country: 'França', countryCode: 'FR', region: 'EUROPA', emoji: '🏰', gradient: 'from-slate-500 to-indigo-700', tag: 'História', rating: 4.9, query: 'Mont Saint Michel France' },
  { name: 'Bordeaux', country: 'França', countryCode: 'FR', region: 'EUROPA', emoji: '🍷', gradient: 'from-rose-600 to-red-800', tag: 'Gastronomia', rating: 4.7, query: 'Bordeaux France wine vineyard' },
  { name: 'Lyon', country: 'França', countryCode: 'FR', region: 'EUROPA', emoji: '🍴', gradient: 'from-amber-500 to-red-600', tag: 'Gastronomia', rating: 4.7, query: 'Lyon France old town' },

  // ═══ ITÁLIA ════════════════════════════════════════════════════════════════
  { name: 'Roma', country: 'Itália', countryCode: 'IT', region: 'EUROPA', emoji: '🏛️', gradient: 'from-amber-600 to-red-700', tag: 'História', rating: 4.8, query: 'Rome Colosseum ancient' },
  { name: 'Veneza', country: 'Itália', countryCode: 'IT', region: 'EUROPA', emoji: '🚤', gradient: 'from-teal-500 to-blue-700', tag: 'Romance', rating: 4.9, query: 'Venice Italy canals gondola' },
  { name: 'Florença', country: 'Itália', countryCode: 'IT', region: 'EUROPA', emoji: '🎨', gradient: 'from-amber-500 to-red-700', tag: 'Cultura', rating: 4.9, query: 'Florence Italy Duomo Renaissance' },
  { name: 'Amalfi', country: 'Itália', countryCode: 'IT', region: 'EUROPA', emoji: '🍋', gradient: 'from-amber-400 to-blue-500', tag: 'Romance', rating: 4.9, query: 'Amalfi coast Italy cliffs' },
  { name: 'Toscana', country: 'Itália', countryCode: 'IT', region: 'EUROPA', emoji: '🌻', gradient: 'from-amber-400 to-emerald-600', tag: 'Natureza', rating: 4.9, query: 'Tuscany Italy vineyard hills' },
  { name: 'Cinque Terre', country: 'Itália', countryCode: 'IT', region: 'EUROPA', emoji: '🏘️', gradient: 'from-rose-500 to-amber-600', tag: 'Natureza', rating: 4.9, query: 'Cinque Terre Italy colorful cliffs' },
  { name: 'Milão', country: 'Itália', countryCode: 'IT', region: 'EUROPA', emoji: '👗', gradient: 'from-rose-600 to-slate-700', tag: 'Urbano', rating: 4.6, query: 'Milan Italy fashion duomo' },
  { name: 'Sicília', country: 'Itália', countryCode: 'IT', region: 'EUROPA', emoji: '🌋', gradient: 'from-amber-500 to-red-700', tag: 'Cultura', rating: 4.8, query: 'Sicily Italy Etna coast' },

  // ═══ REINO UNIDO ═══════════════════════════════════════════════════════════
  { name: 'Londres', country: 'Reino Unido', countryCode: 'GB', region: 'EUROPA', emoji: '🎡', gradient: 'from-red-500 to-slate-700', tag: 'Urbano', rating: 4.8, query: 'London Big Ben Thames' },
  { name: 'Edimburgo', country: 'Reino Unido', countryCode: 'GB', region: 'EUROPA', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', gradient: 'from-slate-600 to-indigo-800', tag: 'História', rating: 4.8, query: 'Edinburgh Scotland castle' },
  { name: 'Oxford', country: 'Reino Unido', countryCode: 'GB', region: 'EUROPA', emoji: '🎓', gradient: 'from-amber-500 to-slate-600', tag: 'História', rating: 4.8, query: 'Oxford England university gothic' },
  { name: 'Bath', country: 'Reino Unido', countryCode: 'GB', region: 'EUROPA', emoji: '♨️', gradient: 'from-amber-400 to-stone-600', tag: 'História', rating: 4.7, query: 'Bath England Roman baths' },
  { name: 'Highlands', country: 'Reino Unido', countryCode: 'GB', region: 'EUROPA', emoji: '🏞️', gradient: 'from-emerald-600 to-indigo-800', tag: 'Natureza', rating: 4.9, query: 'Scottish Highlands lochs' },

  // ═══ IRLANDA ═══════════════════════════════════════════════════════════════
  { name: 'Dublin', country: 'Irlanda', countryCode: 'IE', region: 'EUROPA', emoji: '🍀', gradient: 'from-emerald-500 to-green-700', tag: 'Cultura', rating: 4.6, query: 'Dublin Ireland pubs Temple Bar' },
  { name: 'Cliffs of Moher', country: 'Irlanda', countryCode: 'IE', region: 'EUROPA', emoji: '🌊', gradient: 'from-slate-500 to-emerald-700', tag: 'Natureza', rating: 4.9, query: 'Cliffs of Moher Ireland' },
  { name: 'Galway', country: 'Irlanda', countryCode: 'IE', region: 'EUROPA', emoji: '🍻', gradient: 'from-emerald-500 to-teal-700', tag: 'Cultura', rating: 4.7, query: 'Galway Ireland coastal' },

  // ═══ ALEMANHA ══════════════════════════════════════════════════════════════
  { name: 'Berlim', country: 'Alemanha', countryCode: 'DE', region: 'EUROPA', emoji: '🎭', gradient: 'from-slate-500 to-indigo-700', tag: 'Cultura', rating: 4.7, query: 'Berlin Germany wall Brandenburg' },
  { name: 'Munique', country: 'Alemanha', countryCode: 'DE', region: 'EUROPA', emoji: '🍺', gradient: 'from-amber-500 to-blue-700', tag: 'Cultura', rating: 4.7, query: 'Munich Germany Oktoberfest' },
  { name: 'Neuschwanstein', country: 'Alemanha', countryCode: 'DE', region: 'EUROPA', emoji: '🏰', gradient: 'from-slate-500 to-indigo-700', tag: 'História', rating: 4.9, query: 'Neuschwanstein castle Bavaria' },
  { name: 'Heidelberg', country: 'Alemanha', countryCode: 'DE', region: 'EUROPA', emoji: '🏰', gradient: 'from-amber-500 to-red-700', tag: 'História', rating: 4.8, query: 'Heidelberg Germany castle river' },
  { name: 'Selva Negra', country: 'Alemanha', countryCode: 'DE', region: 'EUROPA', emoji: '🌲', gradient: 'from-emerald-600 to-slate-800', tag: 'Natureza', rating: 4.8, query: 'Black Forest Germany' },

  // ═══ PAÍSES BAIXOS ═════════════════════════════════════════════════════════
  { name: 'Amsterdã', country: 'Países Baixos', countryCode: 'NL', region: 'EUROPA', emoji: '🚲', gradient: 'from-orange-500 to-red-600', tag: 'Urbano', rating: 4.7, query: 'Amsterdam canals Netherlands' },
  { name: 'Keukenhof', country: 'Países Baixos', countryCode: 'NL', region: 'EUROPA', emoji: '🌷', gradient: 'from-rose-400 to-amber-500', tag: 'Natureza', rating: 4.8, query: 'Keukenhof Netherlands tulips' },
  { name: 'Roterdã', country: 'Países Baixos', countryCode: 'NL', region: 'EUROPA', emoji: '🏙️', gradient: 'from-sky-500 to-indigo-700', tag: 'Arquitetura', rating: 4.7, query: 'Rotterdam Netherlands modern architecture' },

  // ═══ GRÉCIA ════════════════════════════════════════════════════════════════
  { name: 'Santorini', country: 'Grécia', countryCode: 'GR', region: 'EUROPA', emoji: '🏝️', gradient: 'from-blue-500 to-cyan-600', tag: 'Romance', rating: 4.7, query: 'Santorini Greece blue domes' },
  { name: 'Atenas', country: 'Grécia', countryCode: 'GR', region: 'EUROPA', emoji: '🏛️', gradient: 'from-amber-500 to-blue-600', tag: 'História', rating: 4.8, query: 'Athens Greece Parthenon Acropolis' },
  { name: 'Mykonos', country: 'Grécia', countryCode: 'GR', region: 'EUROPA', emoji: '🎉', gradient: 'from-cyan-400 to-indigo-600', tag: 'Praia', rating: 4.7, query: 'Mykonos Greece island beach' },
  { name: 'Creta', country: 'Grécia', countryCode: 'GR', region: 'EUROPA', emoji: '🏝️', gradient: 'from-teal-500 to-blue-700', tag: 'Praia', rating: 4.8, query: 'Crete Greece beach' },

  // ═══ SUÍÇA ═════════════════════════════════════════════════════════════════
  { name: 'Zurique', country: 'Suíça', countryCode: 'CH', region: 'EUROPA', emoji: '🏦', gradient: 'from-blue-500 to-slate-700', tag: 'Urbano', rating: 4.7, query: 'Zurich Switzerland lake' },
  { name: 'Interlaken', country: 'Suíça', countryCode: 'CH', region: 'EUROPA', emoji: '🏔️', gradient: 'from-teal-500 to-indigo-700', tag: 'Aventura', rating: 4.9, query: 'Interlaken Swiss Alps lake' },
  { name: 'Lucerna', country: 'Suíça', countryCode: 'CH', region: 'EUROPA', emoji: '🌉', gradient: 'from-emerald-500 to-blue-700', tag: 'Romance', rating: 4.9, query: 'Lucerne Switzerland lake bridge' },
  { name: 'Zermatt', country: 'Suíça', countryCode: 'CH', region: 'EUROPA', emoji: '⛷️', gradient: 'from-slate-400 to-indigo-700', tag: 'Aventura', rating: 4.9, query: 'Zermatt Matterhorn Switzerland' },

  // ═══ OUTROS EUROPA ═════════════════════════════════════════════════════════
  { name: 'Islândia', country: 'Islândia', countryCode: 'IS', region: 'EUROPA', emoji: '🌋', gradient: 'from-indigo-600 to-violet-700', tag: 'Natureza', rating: 4.9, query: 'Iceland waterfall glacier' },
  { name: 'Praga', country: 'República Tcheca', countryCode: 'CZ', region: 'EUROPA', emoji: '🏰', gradient: 'from-red-600 to-rose-700', tag: 'História', rating: 4.8, query: 'Prague castle old town' },
  { name: 'Viena', country: 'Áustria', countryCode: 'AT', region: 'EUROPA', emoji: '🎼', gradient: 'from-amber-500 to-red-600', tag: 'Cultura', rating: 4.8, query: 'Vienna Austria palace' },
  { name: 'Salzburg', country: 'Áustria', countryCode: 'AT', region: 'EUROPA', emoji: '🎵', gradient: 'from-emerald-500 to-slate-700', tag: 'Cultura', rating: 4.8, query: 'Salzburg Austria Mozart mountains' },
  { name: 'Budapeste', country: 'Hungria', countryCode: 'HU', region: 'EUROPA', emoji: '♨️', gradient: 'from-amber-500 to-rose-700', tag: 'Cultura', rating: 4.8, query: 'Budapest Hungary parliament baths' },
  { name: 'Dubrovnik', country: 'Croácia', countryCode: 'HR', region: 'EUROPA', emoji: '🏰', gradient: 'from-orange-500 to-red-700', tag: 'História', rating: 4.8, query: 'Dubrovnik Croatia old city walls' },
  { name: 'Plitvice', country: 'Croácia', countryCode: 'HR', region: 'EUROPA', emoji: '💧', gradient: 'from-teal-400 to-emerald-700', tag: 'Natureza', rating: 4.9, query: 'Plitvice lakes Croatia waterfall' },
  { name: 'Copenhague', country: 'Dinamarca', countryCode: 'DK', region: 'EUROPA', emoji: '🚲', gradient: 'from-rose-500 to-sky-600', tag: 'Urbano', rating: 4.7, query: 'Copenhagen Denmark Nyhavn' },
  { name: 'Estocolmo', country: 'Suécia', countryCode: 'SE', region: 'EUROPA', emoji: '🌉', gradient: 'from-sky-500 to-indigo-700', tag: 'Urbano', rating: 4.7, query: 'Stockholm Sweden old town' },
  { name: 'Oslo', country: 'Noruega', countryCode: 'NO', region: 'EUROPA', emoji: '⛴️', gradient: 'from-sky-500 to-indigo-700', tag: 'Natureza', rating: 4.6, query: 'Oslo Norway fjord' },
  { name: 'Fiordes Noruegueses', country: 'Noruega', countryCode: 'NO', region: 'EUROPA', emoji: '🏔️', gradient: 'from-slate-500 to-teal-700', tag: 'Natureza', rating: 4.9, query: 'Norway fjords Geiranger' },
  { name: 'Helsinque', country: 'Finlândia', countryCode: 'FI', region: 'EUROPA', emoji: '🧖', gradient: 'from-slate-500 to-blue-700', tag: 'Cultura', rating: 4.5, query: 'Helsinki Finland cathedral' },
  { name: 'Lapônia', country: 'Finlândia', countryCode: 'FI', region: 'EUROPA', emoji: '🦌', gradient: 'from-slate-400 to-indigo-800', tag: 'Natureza', rating: 4.9, query: 'Lapland Finland aurora borealis' },

  // ═══ JAPÃO ═════════════════════════════════════════════════════════════════
  { name: 'Tóquio', country: 'Japão', countryCode: 'JP', region: 'ASIA', emoji: '🎌', gradient: 'from-rose-500 to-pink-600', tag: 'Urbano', rating: 4.8, query: 'Tokyo city night' },
  { name: 'Kyoto', country: 'Japão', countryCode: 'JP', region: 'ASIA', emoji: '⛩️', gradient: 'from-pink-500 to-red-600', tag: 'Cultura', rating: 4.9, query: 'Kyoto temple cherry blossom' },
  { name: 'Osaka', country: 'Japão', countryCode: 'JP', region: 'ASIA', emoji: '🍣', gradient: 'from-amber-500 to-red-600', tag: 'Gastronomia', rating: 4.7, query: 'Osaka Japan castle food' },
  { name: 'Hokkaido', country: 'Japão', countryCode: 'JP', region: 'ASIA', emoji: '❄️', gradient: 'from-sky-400 to-indigo-700', tag: 'Aventura', rating: 4.8, query: 'Hokkaido Japan snow mountains' },
  { name: 'Hiroshima', country: 'Japão', countryCode: 'JP', region: 'ASIA', emoji: '🕊️', gradient: 'from-emerald-500 to-slate-700', tag: 'História', rating: 4.8, query: 'Hiroshima Japan peace memorial' },
  { name: 'Monte Fuji', country: 'Japão', countryCode: 'JP', region: 'ASIA', emoji: '🗻', gradient: 'from-slate-400 to-blue-700', tag: 'Natureza', rating: 4.9, query: 'Mount Fuji Japan cherry blossom' },

  // ═══ CHINA ═════════════════════════════════════════════════════════════════
  { name: 'Pequim', country: 'China', countryCode: 'CN', region: 'ASIA', emoji: '🏯', gradient: 'from-red-600 to-amber-700', tag: 'História', rating: 4.8, query: 'Beijing China Great Wall Forbidden City' },
  { name: 'Xangai', country: 'China', countryCode: 'CN', region: 'ASIA', emoji: '🌆', gradient: 'from-sky-500 to-indigo-800', tag: 'Urbano', rating: 4.7, query: 'Shanghai China skyline Bund' },
  { name: 'Zhangjiajie', country: 'China', countryCode: 'CN', region: 'ASIA', emoji: '⛰️', gradient: 'from-emerald-600 to-slate-700', tag: 'Natureza', rating: 4.9, query: 'Zhangjiajie China Avatar mountains' },

  // ═══ CORÉIA DO SUL ═════════════════════════════════════════════════════════
  { name: 'Seul', country: 'Coreia do Sul', countryCode: 'KR', region: 'ASIA', emoji: '🏙️', gradient: 'from-indigo-500 to-fuchsia-700', tag: 'Urbano', rating: 4.7, query: 'Seoul South Korea night' },
  { name: 'Jeju', country: 'Coreia do Sul', countryCode: 'KR', region: 'ASIA', emoji: '🌋', gradient: 'from-emerald-500 to-teal-700', tag: 'Natureza', rating: 4.7, query: 'Jeju Island South Korea volcano' },
  { name: 'Busan', country: 'Coreia do Sul', countryCode: 'KR', region: 'ASIA', emoji: '🏖️', gradient: 'from-cyan-500 to-indigo-700', tag: 'Praia', rating: 4.6, query: 'Busan South Korea beach city' },

  // ═══ TAILÂNDIA ═════════════════════════════════════════════════════════════
  { name: 'Bangkok', country: 'Tailândia', countryCode: 'TH', region: 'ASIA', emoji: '🛕', gradient: 'from-amber-500 to-red-600', tag: 'Cultura', rating: 4.7, query: 'Bangkok Thailand temple' },
  { name: 'Phuket', country: 'Tailândia', countryCode: 'TH', region: 'ASIA', emoji: '🏖️', gradient: 'from-cyan-500 to-teal-700', tag: 'Praia', rating: 4.6, query: 'Phuket Thailand beach' },
  { name: 'Chiang Mai', country: 'Tailândia', countryCode: 'TH', region: 'ASIA', emoji: '🐘', gradient: 'from-emerald-500 to-green-700', tag: 'Cultura', rating: 4.8, query: 'Chiang Mai Thailand temples' },
  { name: 'Krabi', country: 'Tailândia', countryCode: 'TH', region: 'ASIA', emoji: '🛶', gradient: 'from-teal-500 to-emerald-700', tag: 'Aventura', rating: 4.8, query: 'Krabi Thailand beach cliffs' },

  // ═══ VIETNÃ ════════════════════════════════════════════════════════════════
  { name: 'Hanói', country: 'Vietnã', countryCode: 'VN', region: 'ASIA', emoji: '🏮', gradient: 'from-amber-500 to-red-700', tag: 'Cultura', rating: 4.7, query: 'Hanoi Vietnam old quarter' },
  { name: 'Halong Bay', country: 'Vietnã', countryCode: 'VN', region: 'ASIA', emoji: '🛶', gradient: 'from-emerald-500 to-green-700', tag: 'Natureza', rating: 4.8, query: 'Ha Long Bay Vietnam boat' },
  { name: 'Hoi An', country: 'Vietnã', countryCode: 'VN', region: 'ASIA', emoji: '🏮', gradient: 'from-amber-400 to-orange-600', tag: 'História', rating: 4.9, query: 'Hoi An Vietnam lanterns old town' },

  // ═══ INDONÉSIA ═════════════════════════════════════════════════════════════
  { name: 'Bali', country: 'Indonésia', countryCode: 'ID', region: 'ASIA', emoji: '🌊', gradient: 'from-emerald-500 to-teal-600', tag: 'Natureza', rating: 4.9, query: 'Bali travel landscape' },
  { name: 'Lombok', country: 'Indonésia', countryCode: 'ID', region: 'ASIA', emoji: '🏄', gradient: 'from-cyan-500 to-teal-700', tag: 'Praia', rating: 4.7, query: 'Lombok Indonesia beach' },
  { name: 'Komodo', country: 'Indonésia', countryCode: 'ID', region: 'ASIA', emoji: '🦎', gradient: 'from-amber-500 to-orange-700', tag: 'Aventura', rating: 4.9, query: 'Komodo Island dragon Indonesia' },

  // ═══ ÍNDIA ═════════════════════════════════════════════════════════════════
  { name: 'Taj Mahal', country: 'Índia', countryCode: 'IN', region: 'ASIA', emoji: '🕌', gradient: 'from-rose-400 to-amber-500', tag: 'História', rating: 5.0, query: 'Taj Mahal Agra India' },
  { name: 'Jaipur', country: 'Índia', countryCode: 'IN', region: 'ASIA', emoji: '🐘', gradient: 'from-rose-500 to-red-700', tag: 'Cultura', rating: 4.7, query: 'Jaipur India pink city' },
  { name: 'Goa', country: 'Índia', countryCode: 'IN', region: 'ASIA', emoji: '🏖️', gradient: 'from-amber-400 to-orange-600', tag: 'Praia', rating: 4.5, query: 'Goa India beach' },
  { name: 'Kerala', country: 'Índia', countryCode: 'IN', region: 'ASIA', emoji: '🛶', gradient: 'from-emerald-500 to-teal-700', tag: 'Natureza', rating: 4.8, query: 'Kerala India backwaters' },

  // ═══ OUTROS ÁSIA ═══════════════════════════════════════════════════════════
  { name: 'Singapura', country: 'Singapura', countryCode: 'SG', region: 'ASIA', emoji: '🌆', gradient: 'from-teal-500 to-blue-700', tag: 'Urbano', rating: 4.7, query: 'Singapore skyline gardens' },
  { name: 'Malé', country: 'Maldivas', countryCode: 'MV', region: 'ASIA', emoji: '🏝️', gradient: 'from-cyan-500 to-blue-600', tag: 'Praia', rating: 4.9, query: 'Maldives resort tropical' },
  { name: 'Katmandu', country: 'Nepal', countryCode: 'NP', region: 'ASIA', emoji: '🏔️', gradient: 'from-slate-500 to-indigo-700', tag: 'Aventura', rating: 4.8, query: 'Nepal Himalaya mountains' },
  { name: 'Angkor Wat', country: 'Camboja', countryCode: 'KH', region: 'ASIA', emoji: '🛕', gradient: 'from-amber-500 to-emerald-700', tag: 'História', rating: 4.9, query: 'Angkor Wat Cambodia temple' },
  { name: 'Manila', country: 'Filipinas', countryCode: 'PH', region: 'ASIA', emoji: '🏝️', gradient: 'from-cyan-500 to-teal-700', tag: 'Praia', rating: 4.6, query: 'Philippines islands Palawan' },

  // ═══ ÁFRICA DO SUL ═════════════════════════════════════════════════════════
  { name: 'Cidade do Cabo', country: 'África do Sul', countryCode: 'ZA', region: 'AFRICA', emoji: '🦁', gradient: 'from-amber-500 to-red-700', tag: 'Aventura', rating: 4.8, query: 'Cape Town Table Mountain' },
  { name: 'Kruger', country: 'África do Sul', countryCode: 'ZA', region: 'AFRICA', emoji: '🦁', gradient: 'from-amber-600 to-orange-800', tag: 'Aventura', rating: 4.9, query: 'Kruger Park safari South Africa' },
  { name: 'Joanesburgo', country: 'África do Sul', countryCode: 'ZA', region: 'AFRICA', emoji: '🏙️', gradient: 'from-amber-500 to-red-700', tag: 'Urbano', rating: 4.4, query: 'Johannesburg South Africa' },

  // ═══ OUTROS ÁFRICA ═════════════════════════════════════════════════════════
  { name: 'Marrakech', country: 'Marrocos', countryCode: 'MA', region: 'AFRICA', emoji: '🕌', gradient: 'from-amber-600 to-orange-700', tag: 'Cultura', rating: 4.7, query: 'Morocco Marrakech medina' },
  { name: 'Fez', country: 'Marrocos', countryCode: 'MA', region: 'AFRICA', emoji: '🐪', gradient: 'from-amber-500 to-red-700', tag: 'Cultura', rating: 4.7, query: 'Fez Morocco medina' },
  { name: 'Chefchaouen', country: 'Marrocos', countryCode: 'MA', region: 'AFRICA', emoji: '🏘️', gradient: 'from-blue-500 to-indigo-700', tag: 'Cultura', rating: 4.8, query: 'Chefchaouen Morocco blue city' },
  { name: 'Zanzibar', country: 'Tanzânia', countryCode: 'TZ', region: 'AFRICA', emoji: '🐚', gradient: 'from-teal-400 to-cyan-600', tag: 'Praia', rating: 4.7, query: 'Zanzibar beach Tanzania' },
  { name: 'Serengeti', country: 'Tanzânia', countryCode: 'TZ', region: 'AFRICA', emoji: '🦒', gradient: 'from-amber-500 to-orange-700', tag: 'Aventura', rating: 4.9, query: 'Serengeti safari wildlife' },
  { name: 'Kilimanjaro', country: 'Tanzânia', countryCode: 'TZ', region: 'AFRICA', emoji: '🏔️', gradient: 'from-slate-500 to-amber-600', tag: 'Aventura', rating: 4.9, query: 'Kilimanjaro Tanzania snow peak' },
  { name: 'Pirâmides', country: 'Egito', countryCode: 'EG', region: 'AFRICA', emoji: '🐪', gradient: 'from-amber-400 to-yellow-700', tag: 'História', rating: 4.8, query: 'Egypt pyramids Giza' },
  { name: 'Luxor', country: 'Egito', countryCode: 'EG', region: 'AFRICA', emoji: '⚱️', gradient: 'from-amber-500 to-red-700', tag: 'História', rating: 4.8, query: 'Luxor Egypt temple' },
  { name: 'Nairóbi', country: 'Quênia', countryCode: 'KE', region: 'AFRICA', emoji: '🦓', gradient: 'from-amber-500 to-emerald-700', tag: 'Aventura', rating: 4.6, query: 'Nairobi Kenya safari' },
  { name: 'Maasai Mara', country: 'Quênia', countryCode: 'KE', region: 'AFRICA', emoji: '🦓', gradient: 'from-amber-500 to-red-700', tag: 'Aventura', rating: 4.9, query: 'Maasai Mara Kenya safari' },

  // ═══ AUSTRÁLIA ═════════════════════════════════════════════════════════════
  { name: 'Sydney', country: 'Austrália', countryCode: 'AU', region: 'OCEANIA', emoji: '🦘', gradient: 'from-blue-500 to-indigo-700', tag: 'Urbano', rating: 4.8, query: 'Sydney opera house harbour' },
  { name: 'Melbourne', country: 'Austrália', countryCode: 'AU', region: 'OCEANIA', emoji: '☕', gradient: 'from-rose-500 to-slate-700', tag: 'Urbano', rating: 4.7, query: 'Melbourne Australia street art' },
  { name: 'Great Barrier Reef', country: 'Austrália', countryCode: 'AU', region: 'OCEANIA', emoji: '🐠', gradient: 'from-cyan-400 to-teal-700', tag: 'Natureza', rating: 4.9, query: 'Great Barrier Reef Australia' },
  { name: 'Uluru', country: 'Austrália', countryCode: 'AU', region: 'OCEANIA', emoji: '🏜️', gradient: 'from-amber-500 to-red-700', tag: 'Natureza', rating: 4.9, query: 'Uluru Ayers Rock Australia' },
  { name: 'Gold Coast', country: 'Austrália', countryCode: 'AU', region: 'OCEANIA', emoji: '🏄', gradient: 'from-cyan-500 to-amber-500', tag: 'Praia', rating: 4.6, query: 'Gold Coast Australia beach' },

  // ═══ NOVA ZELÂNDIA ═════════════════════════════════════════════════════════
  { name: 'Queenstown', country: 'Nova Zelândia', countryCode: 'NZ', region: 'OCEANIA', emoji: '🪂', gradient: 'from-teal-600 to-indigo-800', tag: 'Aventura', rating: 4.9, query: 'Queenstown New Zealand mountains lake' },
  { name: 'Auckland', country: 'Nova Zelândia', countryCode: 'NZ', region: 'OCEANIA', emoji: '⛵', gradient: 'from-sky-500 to-indigo-700', tag: 'Urbano', rating: 4.6, query: 'Auckland New Zealand harbour' },
  { name: 'Milford Sound', country: 'Nova Zelândia', countryCode: 'NZ', region: 'OCEANIA', emoji: '🏔️', gradient: 'from-emerald-600 to-slate-800', tag: 'Natureza', rating: 5.0, query: 'Milford Sound New Zealand fjord' },
  { name: 'Rotorua', country: 'Nova Zelândia', countryCode: 'NZ', region: 'OCEANIA', emoji: '♨️', gradient: 'from-amber-500 to-emerald-700', tag: 'Natureza', rating: 4.7, query: 'Rotorua New Zealand geothermal' },

  // ═══ POLINÉSIA ═════════════════════════════════════════════════════════════
  { name: 'Bora Bora', country: 'Polinésia Francesa', countryCode: 'PF', region: 'OCEANIA', emoji: '🏝️', gradient: 'from-cyan-400 to-blue-700', tag: 'Praia', rating: 4.9, query: 'Bora Bora overwater bungalows' },
  { name: 'Taiti', country: 'Polinésia Francesa', countryCode: 'PF', region: 'OCEANIA', emoji: '🌺', gradient: 'from-cyan-500 to-teal-700', tag: 'Praia', rating: 4.8, query: 'Tahiti French Polynesia beach' },

  // ═══ ORIENTE MÉDIO ═════════════════════════════════════════════════════════
  { name: 'Dubai', country: 'Emirados Árabes', countryCode: 'AE', region: 'ORIENTE_MEDIO', emoji: '🏙️', gradient: 'from-amber-400 to-yellow-600', tag: 'Luxo', rating: 4.6, query: 'Dubai skyline desert' },
  { name: 'Abu Dhabi', country: 'Emirados Árabes', countryCode: 'AE', region: 'ORIENTE_MEDIO', emoji: '🕌', gradient: 'from-amber-500 to-orange-700', tag: 'Cultura', rating: 4.7, query: 'Abu Dhabi grand mosque' },
  { name: 'Petra', country: 'Jordânia', countryCode: 'JO', region: 'ORIENTE_MEDIO', emoji: '🏜️', gradient: 'from-rose-600 to-amber-700', tag: 'História', rating: 4.9, query: 'Petra Jordan ancient city' },
  { name: 'Wadi Rum', country: 'Jordânia', countryCode: 'JO', region: 'ORIENTE_MEDIO', emoji: '🏜️', gradient: 'from-amber-500 to-red-700', tag: 'Aventura', rating: 4.9, query: 'Wadi Rum Jordan desert' },
  { name: 'Capadócia', country: 'Turquia', countryCode: 'TR', region: 'ORIENTE_MEDIO', emoji: '🎈', gradient: 'from-rose-500 to-amber-600', tag: 'Aventura', rating: 4.9, query: 'Cappadocia hot air balloons' },
  { name: 'Istambul', country: 'Turquia', countryCode: 'TR', region: 'ORIENTE_MEDIO', emoji: '🕌', gradient: 'from-indigo-500 to-rose-600', tag: 'Cultura', rating: 4.8, query: 'Istanbul Turkey mosque bosphorus' },
  { name: 'Jerusalém', country: 'Israel', countryCode: 'IL', region: 'ORIENTE_MEDIO', emoji: '🕍', gradient: 'from-amber-500 to-stone-700', tag: 'História', rating: 4.8, query: 'Jerusalem Israel old city' },
  { name: 'Tel Aviv', country: 'Israel', countryCode: 'IL', region: 'ORIENTE_MEDIO', emoji: '🏖️', gradient: 'from-cyan-500 to-indigo-700', tag: 'Urbano', rating: 4.6, query: 'Tel Aviv Israel beach' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retorna o nome do país em português para um countryCode ISO (ou undefined). */
export function getCountryNameFromCode(code: string): string | undefined {
  const entry = TRENDING_POOL.find((e) => e.countryCode === code.toUpperCase());
  return entry?.country;
}

/** Mapeamento de países que não estão no pool mas devem ter nome exibível. */
const COUNTRY_NAMES_FALLBACK: Record<string, string> = {
  AR: 'Argentina', AT: 'Áustria', AU: 'Austrália', BE: 'Bélgica', BR: 'Brasil',
  CA: 'Canadá', CH: 'Suíça', CL: 'Chile', CN: 'China', CO: 'Colômbia',
  CR: 'Costa Rica', CU: 'Cuba', CZ: 'República Tcheca', DE: 'Alemanha',
  DK: 'Dinamarca', EC: 'Equador', EG: 'Egito', ES: 'Espanha', FI: 'Finlândia',
  FR: 'França', GB: 'Reino Unido', GR: 'Grécia', HR: 'Croácia', HU: 'Hungria',
  ID: 'Indonésia', IE: 'Irlanda', IL: 'Israel', IN: 'Índia', IS: 'Islândia',
  IT: 'Itália', JO: 'Jordânia', JP: 'Japão', KE: 'Quênia', KH: 'Camboja',
  KR: 'Coreia do Sul', MA: 'Marrocos', MV: 'Maldivas', MX: 'México',
  NL: 'Países Baixos', NO: 'Noruega', NP: 'Nepal', NZ: 'Nova Zelândia',
  PE: 'Peru', PF: 'Polinésia', PH: 'Filipinas', PT: 'Portugal', RU: 'Rússia',
  SE: 'Suécia', SG: 'Singapura', TH: 'Tailândia', TR: 'Turquia', TZ: 'Tanzânia',
  UA: 'Ucrânia', US: 'EUA', UY: 'Uruguai', VN: 'Vietnã', ZA: 'África do Sul',
  AE: 'Emirados Árabes',
};

export function resolveCountryName(code: string): string {
  const upper = code.toUpperCase();
  return COUNTRY_NAMES_FALLBACK[upper] ?? getCountryNameFromCode(upper) ?? upper;
}

// ─── Shuffle helper ──────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ─── Seleção balanceada ──────────────────────────────────────────────────────

export type TrendingFilter = 'all' | 'local' | 'international';

export interface GetTrendingOptions {
  /** País de acesso do usuário em ISO 3166-1 alpha-2 (BR, US, PT...). */
  userCountry?: string;
  /** Filtro ativo escolhido pelo usuário. */
  filter?: TrendingFilter;
  /** Quantidade de itens a retornar (default: 12). */
  count?: number;
}

/**
 * Amostragem principal de destinos "Em alta".
 *
 * Comportamento conforme o filtro:
 * - 'all' → mix balanceado: ~35-45% locais (país do usuário), resto mundo,
 *   com máximo de 2 destinos por região para garantir diversidade geográfica.
 * - 'local' → somente destinos do país do usuário.
 * - 'international' → somente destinos fora do país do usuário.
 *
 * Se o país do usuário não tem destinos no pool, 'all' e 'international' viram
 * equivalentes (mostra só mundo) e 'local' retorna vazio.
 */
export function getTrendingDestinations(opts: GetTrendingOptions = {}): TrendingEntry[] {
  const { userCountry, filter = 'all', count = 12 } = opts;
  const userCC = (userCountry ?? '').toUpperCase();

  const localPool = userCC ? TRENDING_POOL.filter((e) => e.countryCode === userCC) : [];
  const worldPool = userCC ? TRENDING_POOL.filter((e) => e.countryCode !== userCC) : [...TRENDING_POOL];

  // Filtros explícitos
  if (filter === 'local') {
    return shuffle(localPool).slice(0, count);
  }
  if (filter === 'international') {
    return pickBalancedFromWorld(worldPool, count);
  }

  // 'all' → mix local + mundo
  if (localPool.length === 0) {
    return pickBalancedFromWorld(worldPool, count);
  }

  // Cota dinâmica: 4 ou 5 locais (ou tudo que existir, se pool pequeno)
  const LOCAL_TARGET = Math.min(4 + Math.floor(Math.random() * 2), localPool.length);
  const WORLD_TARGET = count - LOCAL_TARGET;

  const localPicks = shuffle(localPool).slice(0, LOCAL_TARGET);
  const worldPicks = pickBalancedFromWorld(worldPool, WORLD_TARGET);

  // Intercala locais e internacionais para mix aparecer logo no topo
  const result: TrendingEntry[] = [];
  const maxLen = Math.max(localPicks.length, worldPicks.length);
  for (let i = 0; i < maxLen; i++) {
    if (localPicks[i]) result.push(localPicks[i]);
    if (worldPicks[i]) result.push(worldPicks[i]);
  }

  // Preenche remanescentes se alguma cota ficou curta
  if (result.length < count) {
    const used = new Set(result.map((r) => r.name));
    const remaining = shuffle(TRENDING_POOL.filter((e) => !used.has(e.name)));
    for (const extra of remaining) {
      if (result.length >= count) break;
      result.push(extra);
    }
  }

  return result.slice(0, count);
}

/**
 * Seleciona destinos do mundo equilibrando por região (continente).
 * Evita que 12 slots virem 12 europeus.
 */
function pickBalancedFromWorld(pool: TrendingEntry[], count: number): TrendingEntry[] {
  if (pool.length === 0) return [];
  if (count <= 0) return [];

  const byRegion = new Map<TrendingRegion, TrendingEntry[]>();
  for (const entry of pool) {
    if (!byRegion.has(entry.region)) byRegion.set(entry.region, []);
    byRegion.get(entry.region)!.push(entry);
  }
  byRegion.forEach((entries, region) => byRegion.set(region, shuffle(entries)));

  const regions = Array.from(byRegion.keys());
  const shuffledRegions = shuffle(regions);

  // Cap por região: distribui igualmente para evitar concentração
  const perRegionCap = Math.max(1, Math.ceil(count / Math.max(shuffledRegions.length, 1)) + 1);
  const countByRegion = new Map<TrendingRegion, number>();
  const picked: TrendingEntry[] = [];

  // Round-robin por região
  let i = 0;
  while (picked.length < count && i < shuffledRegions.length * perRegionCap) {
    const region = shuffledRegions[i % shuffledRegions.length];
    const used = countByRegion.get(region) ?? 0;
    if (used < perRegionCap) {
      const regionPool = byRegion.get(region) ?? [];
      if (regionPool[used]) {
        picked.push(regionPool[used]);
        countByRegion.set(region, used + 1);
      }
    }
    i++;
  }

  // Fallback: preenche com qualquer coisa do pool se ficou curto
  if (picked.length < count) {
    const used = new Set(picked.map((p) => p.name));
    const leftovers = pool.filter((e) => !used.has(e.name));
    picked.push(...shuffle(leftovers).slice(0, count - picked.length));
  }

  return picked.slice(0, count);
}
