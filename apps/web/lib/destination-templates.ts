export interface DestinationTemplate {
  id: string;
  label: string;
  emoji: string;
  suggestedTitle: string;
  description: string;
  durationDays: number;
  suggestedBudget: number;
  currency: string;
}

export const DESTINATION_TEMPLATES: DestinationTemplate[] = [
  {
    id: 'paris',
    label: 'Paris',
    emoji: '🗼',
    suggestedTitle: 'Uma semana em Paris',
    description: 'Explore a Cidade Luz com seus pontos turísticos icônicos, museus de classe mundial e culinária excepcional.',
    durationDays: 7,
    suggestedBudget: 3500,
    currency: 'BRL',
  },
  {
    id: 'bali',
    emoji: '🌊',
    label: 'Bali',
    suggestedTitle: 'Férias em Bali',
    description: 'Relaxe em praias paradisíacas, templos antigos e vilas tradicionais balinesas. Perfeito para meditação e aventura.',
    durationDays: 10,
    suggestedBudget: 4500,
    currency: 'BRL',
  },
  {
    id: 'patagonia',
    emoji: '🏔️',
    label: 'Patagônia',
    suggestedTitle: 'Aventura na Patagônia',
    description: 'Trekking em montanhas espetaculares, glaciares azuis e paisagens selvagens entre Chile e Argentina.',
    durationDays: 14,
    suggestedBudget: 5000,
    currency: 'BRL',
  },
  {
    id: 'tokyo',
    emoji: '🎌',
    label: 'Tóquio',
    suggestedTitle: 'Descobrindo Tóquio',
    description: 'Mergulhe na modernidade futurista e tradição milenar, anime, gastronomia única e tecnologia de ponta.',
    durationDays: 10,
    suggestedBudget: 4000,
    currency: 'BRL',
  },
  {
    id: 'maldives',
    emoji: '🏝️',
    label: 'Maldivas',
    suggestedTitle: 'Paraíso nas Maldivas',
    description: 'Resort sobre a água, mergulho em corais coloridos, águas cristalinas e total desconexão do mundo.',
    durationDays: 7,
    suggestedBudget: 7000,
    currency: 'BRL',
  },
  {
    id: 'newyork',
    emoji: '🌆',
    label: 'Nova York',
    suggestedTitle: 'Nova York, Nova York',
    description: 'A cidade que nunca dorme: arranha-céus, Broadway, museus, parques e energia contagiante 24/7.',
    durationDays: 5,
    suggestedBudget: 3000,
    currency: 'BRL',
  },
  {
    id: 'barcelona',
    emoji: '🏖️',
    label: 'Barcelona',
    suggestedTitle: 'Verão em Barcelona',
    description: 'Arquitetura de Gaudí, praias do Mediterrâneo, tapas deliciosas e vibrante vida noturna.',
    durationDays: 6,
    suggestedBudget: 3200,
    currency: 'BRL',
  },
  {
    id: 'dubai',
    emoji: '🏙️',
    label: 'Dubai',
    suggestedTitle: 'Luxo em Dubai',
    description: 'Deserto dourado, shopping de luxo, praias artificiais e arquitetura futurista no coração do Golfo Pérsico.',
    durationDays: 5,
    suggestedBudget: 4500,
    currency: 'BRL',
  },
  {
    id: 'buenosaires',
    emoji: '💃',
    label: 'Buenos Aires',
    suggestedTitle: 'Tango em Buenos Aires',
    description: 'A Paris sul-americana com arquitetura elegante, tango ao vivo, vinhos argentinosde qualidade e carne suculenta.',
    durationDays: 6,
    suggestedBudget: 2800,
    currency: 'BRL',
  },
  {
    id: 'veneza',
    emoji: '🚤',
    label: 'Veneza',
    suggestedTitle: 'Roteiro Veneza',
    description: 'Canais pitorescos, gôndolas românticas, basílica de São Marcos e a magia das ruas medievais água.',
    durationDays: 4,
    suggestedBudget: 2500,
    currency: 'BRL',
  },
  {
    id: 'tailandia',
    emoji: '🏯',
    label: 'Tailândia',
    suggestedTitle: 'Exploração na Tailândia',
    description: 'Templos dourados, ilhas tropicais, Bangkok vibrante, gastronomia picante e povo caloroso.',
    durationDays: 10,
    suggestedBudget: 3500,
    currency: 'BRL',
  },
  {
    id: 'iceland',
    emoji: '🌋',
    label: 'Islândia',
    suggestedTitle: 'Maravilhas da Islândia',
    description: 'Cachoeiras espetaculares, geleiras, auroras boreais, fontes geotermais e paisagem lunar.',
    durationDays: 8,
    suggestedBudget: 5500,
    currency: 'BRL',
  },
];

/**
 * Get N random unique destination templates (without repetition in session)
 */
export function getRandomDestinations(count: number = 6, exclude: string[] = []): DestinationTemplate[] {
  const available = DESTINATION_TEMPLATES.filter(d => !exclude.includes(d.id));
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, available.length));
}
