import { PlusCircle, PlaneTakeoff, Wallet, Heart, Settings } from 'lucide-react';

export type OnboardingStep = {
  id: number;
  target: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position: 'bottom' | 'top' | 'right' | 'left';
  mobileImageKey: 'new-trip' | 'trips' | 'budget' | 'favorites' | 'settings';
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    target: '#onboarding-new-trip',
    title: 'Crie sua primeira viagem',
    description: 'Toque aqui para começar a planejar um roteiro do zero. É rápido e fácil!',
    icon: PlusCircle,
    position: 'bottom',
    mobileImageKey: 'new-trip',
  },
  {
    id: 2,
    target: '#onboarding-nav-trips',
    title: 'Suas viagens em um só lugar',
    description: 'Acesse todas as suas viagens, veja detalhes, roteiros e status de cada aventura.',
    icon: PlaneTakeoff,
    position: 'right',
    mobileImageKey: 'trips',
  },
  {
    id: 3,
    target: '#onboarding-nav-budget',
    title: 'Controle seus gastos',
    description: 'Acompanhe quanto já gastou e quanto tem disponível. Sem surpresas na conta!',
    icon: Wallet,
    position: 'right',
    mobileImageKey: 'budget',
  },
  {
    id: 4,
    target: '#onboarding-nav-favorites',
    title: 'Salve seus lugares favoritos',
    description: 'Encontrou um restaurante ou hotel incrível? Favorite e acesse sempre que quiser.',
    icon: Heart,
    position: 'right',
    mobileImageKey: 'favorites',
  },
  {
    id: 5,
    target: '#onboarding-nav-settings',
    title: 'Personalize sua experiência',
    description: 'Ajuste seu perfil, idioma e preferências. A Trpy é do seu jeito.',
    icon: Settings,
    position: 'right',
    mobileImageKey: 'settings',
  },
];
