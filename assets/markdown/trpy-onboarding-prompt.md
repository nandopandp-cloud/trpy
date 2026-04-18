# 🎯 ONBOARDING INTERATIVO TRPY - Especificação Completa

> **Objetivo**: Criar um sistema de onboarding interativo de primeira classe para a plataforma TRPY, seguindo rigorosamente o design system da marca e proporcionando uma experiência memorável ao usuário.

---

## 📋 CONTEXTO DO PRODUTO

A **TRPY** é uma plataforma de planejamento de viagens colaborativo que permite aos usuários:
- Organizar roteiros detalhados dia a dia
- Gerenciar orçamentos e controlar gastos
- Adicionar atividades, restaurantes e pontos turísticos
- Colaborar com outros viajantes em tempo real
- Centralizar documentos e reservas

**Site oficial**: www.trpy.com.br

---

## 🎨 DESIGN SYSTEM - DIRETRIZES OBRIGATÓRIAS

### Paleta de Cores
Usar **EXATAMENTE** estas variáveis CSS (já definidas no design system):

```css
:root {
  /* Cores principais */
  --trpy-primary: #18181b;
  --trpy-secondary: #3f3f46;
  --trpy-accent: #6366f1;           /* Índigo - cor principal da marca */
  --trpy-accent-warm: #f59e0b;      /* Âmbar - para destaques */
  
  /* Escala de neutros (zinc) */
  --trpy-neutral-50: #fafafa;
  --trpy-neutral-100: #f4f4f5;
  --trpy-neutral-200: #e4e4e7;
  --trpy-neutral-300: #d4d4d8;
  --trpy-neutral-400: #a1a1aa;
  --trpy-neutral-500: #71717a;
  --trpy-neutral-600: #52525b;
  --trpy-neutral-700: #3f3f46;
  --trpy-neutral-800: #27272a;
  --trpy-neutral-900: #18181b;
  --trpy-neutral-950: #09090b;
  
  /* Cores semânticas */
  --trpy-success: #10b981;
  --trpy-warning: #f59e0b;
  --trpy-error: #ef4444;
  --trpy-info: #3b82f6;
}
```

**Classes Tailwind equivalentes:**
- Primário: `bg-zinc-900`, `text-zinc-900`
- Accent: `bg-indigo-500`, `text-indigo-500`
- Neutros: `bg-zinc-50` até `bg-zinc-950`

### Tipografia

**Famílias de fonte** (importar do Google Fonts):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
```

**Uso:**
- **Display/Headers**: `font-family: 'Inter'` com `font-weight: 600-800`
- **Body/Texto corrido**: `font-family: 'Inter'` com `font-weight: 400-500`
- **Mono (valores numéricos)**: `font-family: 'Space Mono'`
- **Accent (destaques)**: `font-family: 'Space Grotesk'`

**Escalas de tamanho:**
- Títulos grandes: `text-2xl` ou `text-3xl` (24-30px)
- Títulos médios: `text-lg` ou `text-xl` (18-20px)
- Body: `text-sm` ou `text-base` (14-16px)
- Small: `text-xs` (12px)

### Componentes e Padrões Visuais

#### 1. Botões
```html
<!-- Botão Primário -->
<button class="px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all duration-300">
  Texto do Botão
</button>

<!-- Botão Secundário -->
<button class="px-6 py-3 border border-zinc-200 text-zinc-900 rounded-xl font-medium hover:bg-zinc-50 transition-all duration-300">
  Texto do Botão
</button>

<!-- Botão Ghost -->
<button class="text-zinc-500 hover:text-zinc-900 transition-colors text-sm">
  Pular
</button>
```

#### 2. Cards
```html
<div class="bg-white border border-zinc-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
  <!-- Conteúdo -->
</div>

<!-- Card com efeito flashlight (cursor hover) -->
<div class="flashlight-card relative bg-white border border-zinc-100 rounded-2xl p-6">
  <!-- Conteúdo -->
</div>
```

**CSS para efeito flashlight:**
```css
.flashlight-card {
  background: rgba(255, 255, 255, 0.02);
  position: relative;
}

.flashlight-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    600px circle at var(--mouse-x) var(--mouse-y),
    rgba(99, 102, 241, 0.06),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
  z-index: 2;
  border-radius: inherit;
}

.flashlight-card:hover::before {
  opacity: 1;
}
```

#### 3. Ícones
**Usar exclusivamente Lucide Icons:**
```html
<i class="w-5 h-5 text-indigo-500" data-lucide="plus-circle"></i>
```

Principais ícones para o onboarding:
- `plus-circle` - Criar viagem
- `calendar-days` - Roteiro
- `wallet` - Orçamento
- `users` - Colaboração
- `file-text` - Documentos
- `map` - Mapa
- `bell` - Notificações

#### 4. Espaçamentos Padrão
- Padding interno de cards: `p-6` ou `p-8`
- Gaps entre elementos: `gap-4` (16px) ou `gap-6` (24px)
- Bordas arredondadas: `rounded-2xl` (containers), `rounded-xl` (elementos menores)
- Margens entre seções: `mb-6`, `mb-8`, `mb-12`

### Animações

**Animações pré-definidas no design system:**
```css
@keyframes animationIn {
  0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(1deg); }
  66% { transform: translateY(5px) rotate(-1deg); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.2); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.4), 0 0 80px rgba(99, 102, 241, 0.1); }
}

@keyframes clip-reveal {
  0% { clip-path: inset(100% 0 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}
```

**Classes Tailwind úteis:**
- Transições suaves: `transition-all duration-300` ou `duration-500`
- Fade in: `opacity-0` → `opacity-100` com transition
- Scale on hover: `hover:scale-105 transform transition-transform`

### Tom de Voz e Copywriting

**Princípios:**
- ✅ **Casual e acolhedor**: como um amigo experiente dando dicas
- ✅ **Direto e prático**: frases curtas, evitar enrolação
- ✅ **Empolgante**: verbos de ação, linguagem positiva
- ❌ **Evitar**: jargões técnicos, formalidade excessiva, termos complicados

**Exemplos aprovados:**
- "Planeje sua próxima aventura"
- "Tudo que você precisa em um só lugar"
- "Monte seu roteiro perfeito"
- "Gerencie gastos sem dor de cabeça"

**Exemplos a evitar:**
- "Sistema de gerenciamento de itinerários"
- "Interface de controle orçamentário"
- "Módulo de colaboração multiusuário"

---

## 🎯 ESPECIFICAÇÃO DO ONBOARDING

### Estrutura Geral

O onboarding será um **modal overlay de tour guiado** composto por:

1. **Tela de Boas-vindas** - Introdução amigável
2. **Tour por Tooltips** - 5-7 steps destacando áreas da interface
3. **Tela de Conclusão** - Motivação e CTA final

**Comportamento:**
- Exibir automaticamente na primeira visita
- Pode ser pulado a qualquer momento
- Navegação fluida entre steps
- Salvar preferência no localStorage

---

### 1. TELA DE BOAS-VINDAS

**Layout:**
```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/70 backdrop-blur-sm">
  <div class="bg-white rounded-3xl p-8 md:p-12 max-w-lg mx-4 text-center shadow-2xl">
    
    <!-- Ícone/Ilustração -->
    <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <i class="w-10 h-10 text-white" data-lucide="sparkles"></i>
    </div>
    
    <!-- Título -->
    <h1 class="text-3xl font-bold text-zinc-900 mb-3">
      Bem-vindo à TRPY! 🌍
    </h1>
    
    <!-- Subtítulo -->
    <p class="text-zinc-500 text-base mb-8 leading-relaxed">
      Vamos te mostrar como planejar viagens incríveis de forma simples e colaborativa
    </p>
    
    <!-- CTAs -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <button class="px-8 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all duration-300">
        Começar o tour
      </button>
      <button class="px-8 py-3 text-zinc-500 hover:text-zinc-900 transition-colors">
        Pular tutorial
      </button>
    </div>
    
  </div>
</div>
```

**Animação de entrada:**
- Fade in do overlay: `0.3s`
- Scale in do card: `0.5s` com ease-out (de 0.95 → 1)

---

### 2. TOUR POR TOOLTIPS

**Conceito visual:**
- Overlay escuro (`bg-zinc-900/70`) cobrindo toda a tela
- Elemento alvo destacado com "spotlight" (sem escurecer)
- Tooltip posicionado próximo ao elemento com seta indicativa
- Navegação por botões Anterior/Próximo

#### Steps do Tour

##### **Step 1: Criação de Viagens**
```javascript
{
  id: 1,
  target: '#create-trip-button',  // ou '.create-trip-section'
  title: 'Crie sua primeira viagem',
  description: 'Comece planejando um roteiro do zero ou use um de nossos templates prontos',
  icon: 'plus-circle',
  position: 'bottom'  // posição do tooltip em relação ao target
}
```

##### **Step 2: Roteiro Diário**
```javascript
{
  id: 2,
  target: '#timeline-section',  // ou '.itinerary-timeline'
  title: 'Monte seu roteiro dia a dia',
  description: 'Adicione atividades, restaurantes e pontos turísticos para cada dia da viagem',
  icon: 'calendar-days',
  position: 'right'
}
```

##### **Step 3: Controle de Orçamento**
```javascript
{
  id: 3,
  target: '#budget-panel',  // ou '.budget-tracker'
  title: 'Controle seus gastos',
  description: 'Acompanhe quanto já gastou e quanto ainda tem disponível em tempo real',
  icon: 'wallet',
  position: 'left'
}
```

##### **Step 4: Colaboração**
```javascript
{
  id: 4,
  target: '#collaborators-section',  // ou '.travelers-list'
  title: 'Planeje junto com seus amigos',
  description: 'Convide pessoas para editar e colaborar no planejamento da viagem',
  icon: 'users',
  position: 'bottom'
}
```

##### **Step 5: Documentos e Anexos**
```javascript
{
  id: 5,
  target: '#documents-area',  // ou '.upload-section'
  title: 'Tenha tudo em um só lugar',
  description: 'Faça upload de reservas, passagens e documentos importantes',
  icon: 'file-text',
  position: 'top'
}
```

##### **Step 6: Mapa Interativo** *(opcional)*
```javascript
{
  id: 6,
  target: '#map-view',
  title: 'Visualize sua rota',
  description: 'Veja todos os pontos da viagem no mapa interativo',
  icon: 'map',
  position: 'right'
}
```

##### **Step 7: Notificações** *(step final)*
```javascript
{
  id: 7,
  target: '#notifications-bell',
  title: 'Fique por dentro de tudo',
  description: 'Receba atualizações sobre mudanças no roteiro e lembretes importantes',
  icon: 'bell',
  position: 'bottom'
}
```

#### Componente de Tooltip

**HTML Structure:**
```html
<div class="tooltip-wrapper fixed inset-0 z-50">
  
  <!-- Overlay escuro com blur -->
  <div class="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm"></div>
  
  <!-- Spotlight no elemento alvo -->
  <div 
    class="spotlight-target absolute"
    style="
      top: [calculated];
      left: [calculated];
      width: [target-width];
      height: [target-height];
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.7);
      border-radius: 12px;
      pointer-events: none;
    "
  ></div>
  
  <!-- Card do Tooltip -->
  <div 
    class="tooltip-card absolute bg-white rounded-2xl p-6 shadow-2xl border border-zinc-100 max-w-sm"
    style="[posicionamento calculado dinamicamente]"
  >
    
    <!-- Seta indicativa (opcional) -->
    <div class="tooltip-arrow absolute w-4 h-4 bg-white border-l border-t border-zinc-100 rotate-45" 
         style="[posição baseada em 'position']">
    </div>
    
    <!-- Ícone do step -->
    <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
      <i class="w-6 h-6 text-indigo-500" data-lucide="[icon]"></i>
    </div>
    
    <!-- Conteúdo textual -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-zinc-900 mb-2">
        [title]
      </h3>
      <p class="text-sm text-zinc-500 leading-relaxed">
        [description]
      </p>
    </div>
    
    <!-- Footer: Progresso e navegação -->
    <div class="flex items-center justify-between">
      
      <!-- Indicadores de progresso -->
      <div class="flex gap-1.5">
        <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
        <span class="w-2 h-2 rounded-full bg-zinc-200"></span>
        <span class="w-2 h-2 rounded-full bg-zinc-200"></span>
        <!-- Repetir para cada step, destacar o ativo -->
      </div>
      
      <!-- Botões de navegação -->
      <div class="flex gap-3 items-center">
        <button class="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">
          Pular
        </button>
        
        <!-- Botão Anterior (mostrar apenas se não for o primeiro step) -->
        <button class="px-4 py-2 text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors">
          Anterior
        </button>
        
        <!-- Botão Próximo / Concluir -->
        <button class="px-5 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all duration-300">
          Próximo
        </button>
      </div>
      
    </div>
  </div>
  
</div>
```

**Lógica de posicionamento do tooltip:**
```javascript
// Pseudo-código para calcular posição
function calculateTooltipPosition(targetElement, position) {
  const rect = targetElement.getBoundingClientRect();
  const tooltipWidth = 384; // max-w-sm = 24rem = 384px
  const tooltipHeight = 280; // altura aproximada
  const offset = 20; // distância do elemento
  
  let top, left;
  
  switch(position) {
    case 'bottom':
      top = rect.bottom + offset;
      left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      break;
    case 'top':
      top = rect.top - tooltipHeight - offset;
      left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      break;
    case 'right':
      top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
      left = rect.right + offset;
      break;
    case 'left':
      top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
      left = rect.left - tooltipWidth - offset;
      break;
  }
  
  // Ajustar para não sair da viewport
  top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
  left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));
  
  return { top, left };
}
```

---

### 3. TELA DE CONCLUSÃO

**Layout:**
```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/70 backdrop-blur-sm">
  <div class="bg-white rounded-3xl p-8 md:p-12 max-w-lg mx-4 text-center shadow-2xl relative overflow-hidden">
    
    <!-- Confetti animation canvas (opcional) -->
    <canvas id="confetti-canvas" class="absolute inset-0 pointer-events-none"></canvas>
    
    <!-- Ícone de sucesso -->
    <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
      <i class="w-10 h-10 text-white" data-lucide="check"></i>
    </div>
    
    <!-- Título -->
    <h2 class="text-3xl font-bold text-zinc-900 mb-3">
      Você está pronto! 🎉
    </h2>
    
    <!-- Mensagem -->
    <p class="text-zinc-500 text-base mb-8 leading-relaxed">
      Agora é só começar a planejar suas próximas aventuras. Vamos lá!
    </p>
    
    <!-- CTA Principal -->
    <button class="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all duration-300 mb-6">
      Criar minha primeira viagem
    </button>
    
    <!-- Checkbox "Não mostrar novamente" -->
    <label class="flex items-center justify-center gap-2 text-xs text-zinc-400 cursor-pointer hover:text-zinc-600 transition-colors">
      <input type="checkbox" class="w-4 h-4 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500">
      <span>Não mostrar este tutorial novamente</span>
    </label>
    
  </div>
</div>
```

**Efeito confetti (opcional):**
Usar biblioteca `canvas-confetti`:
```javascript
import confetti from 'canvas-confetti';

confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#6366f1', '#f59e0b', '#10b981']
});
```

---

## 🛠️ IMPLEMENTAÇÃO TÉCNICA

### Stack Tecnológica

**Obrigatório:**
- **React** (versão 18+)
- **Tailwind CSS** (configurado com cores TRPY)
- **Lucide React** para ícones

**Opcional mas recomendado:**
- `canvas-confetti` - Animação de confetti
- `framer-motion` - Animações mais sofisticadas
- `react-hot-toast` - Feedback ao usuário

### Estrutura de Arquivos

```
src/
├── components/
│   ├── Onboarding/
│   │   ├── OnboardingTour.jsx          # Componente principal
│   │   ├── WelcomeScreen.jsx           # Tela de boas-vindas
│   │   ├── TooltipStep.jsx             # Tooltip individual
│   │   ├── CompletionScreen.jsx        # Tela final
│   │   ├── ProgressDots.jsx            # Indicadores de progresso
│   │   └── onboardingSteps.js          # Dados dos steps
│   └── ...
├── hooks/
│   └── useOnboarding.js                # Hook customizado
├── styles/
│   └── onboarding.css                  # Estilos específicos
└── utils/
    └── localStorage.js                 # Helper para localStorage
```

### Componente Principal - OnboardingTour.jsx

```jsx
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './WelcomeScreen';
import TooltipStep from './TooltipStep';
import CompletionScreen from './CompletionScreen';
import { onboardingSteps } from './onboardingSteps';
import { hasCompletedOnboarding, setOnboardingCompleted } from '@/utils/localStorage';

export default function OnboardingTour({ onComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome' | 'tour' | 'complete'
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Verificar se já completou o onboarding
    if (!hasCompletedOnboarding()) {
      setIsVisible(true);
    }
  }, []);

  const handleStart = () => {
    setCurrentScreen('tour');
  };

  const handleSkip = () => {
    setIsVisible(false);
    setOnboardingCompleted(true);
    onComplete?.();
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentScreen('complete');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (dontShowAgain) => {
    if (dontShowAgain) {
      setOnboardingCompleted(true);
    }
    setIsVisible(false);
    onComplete?.();
  };

  // Adicionar listener de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'Escape':
          handleSkip();
          break;
        case 'ArrowRight':
          if (currentScreen === 'tour') handleNext();
          break;
        case 'ArrowLeft':
          if (currentScreen === 'tour') handlePrevious();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentScreen, currentStep]);

  if (!isVisible) return null;

  return (
    <>
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={handleStart} onSkip={handleSkip} />
      )}

      {currentScreen === 'tour' && (
        <TooltipStep
          step={onboardingSteps[currentStep]}
          currentIndex={currentStep}
          totalSteps={onboardingSteps.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
        />
      )}

      {currentScreen === 'complete' && (
        <CompletionScreen onComplete={handleComplete} />
      )}
    </>
  );
}
```

### Hook Customizado - useOnboarding.js

```javascript
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'trpy_onboarding_completed';

export function useOnboarding() {
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY) === 'true';
    setHasCompleted(completed);
  }, []);

  const markAsCompleted = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasCompleted(true);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasCompleted(false);
  };

  return {
    hasCompleted,
    markAsCompleted,
    reset
  };
}
```

### Dados dos Steps - onboardingSteps.js

```javascript
export const onboardingSteps = [
  {
    id: 1,
    target: '#create-trip-button',
    title: 'Crie sua primeira viagem',
    description: 'Comece planejando um roteiro do zero ou use um de nossos templates prontos',
    icon: 'PlusCircle',
    position: 'bottom'
  },
  {
    id: 2,
    target: '#timeline-section',
    title: 'Monte seu roteiro dia a dia',
    description: 'Adicione atividades, restaurantes e pontos turísticos para cada dia da viagem',
    icon: 'CalendarDays',
    position: 'right'
  },
  {
    id: 3,
    target: '#budget-panel',
    title: 'Controle seus gastos',
    description: 'Acompanhe quanto já gastou e quanto ainda tem disponível em tempo real',
    icon: 'Wallet',
    position: 'left'
  },
  {
    id: 4,
    target: '#collaborators-section',
    title: 'Planeje junto com seus amigos',
    description: 'Convide pessoas para editar e colaborar no planejamento da viagem',
    icon: 'Users',
    position: 'bottom'
  },
  {
    id: 5,
    target: '#documents-area',
    title: 'Tenha tudo em um só lugar',
    description: 'Faça upload de reservas, passagens e documentos importantes',
    icon: 'FileText',
    position: 'top'
  },
  {
    id: 6,
    target: '#map-view',
    title: 'Visualize sua rota',
    description: 'Veja todos os pontos da viagem no mapa interativo',
    icon: 'Map',
    position: 'right'
  },
  {
    id: 7,
    target: '#notifications-bell',
    title: 'Fique por dentro de tudo',
    description: 'Receba atualizações sobre mudanças no roteiro e lembretes importantes',
    icon: 'Bell',
    position: 'bottom'
  }
];
```

### Configuração do Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trpy: {
          primary: '#18181b',
          secondary: '#3f3f46',
          accent: '#6366f1',
          'accent-warm': '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        accent: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.4), 0 0 80px rgba(99, 102, 241, 0.1)' },
        }
      }
    },
  },
  plugins: [],
}
```

---

## 📱 RESPONSIVIDADE

### Breakpoints Tailwind
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm - lg)
- **Desktop**: > 1024px (lg+)

### Adaptações Mobile

**Tooltips em mobile:**
```jsx
// Forçar posição bottom-center em mobile
const isMobile = window.innerWidth < 768;

const tooltipPosition = isMobile 
  ? { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
  : calculateTooltipPosition(target, position);
```

**Classes responsivas:**
```html
<!-- Card do tooltip -->
<div class="
  max-w-sm        <!-- Desktop -->
  w-[calc(100vw-2rem)]  <!-- Mobile: quase tela cheia -->
  mx-4            <!-- Margin lateral em mobile -->
">
```

**Touch targets:**
```html
<!-- Botões com altura mínima de 44px para touch -->
<button class="px-6 py-3 min-h-[44px] ...">
```

**Reduzir blur em mobile (performance):**
```jsx
<div className={`
  backdrop-blur-sm      <!-- Mobile -->
  md:backdrop-blur-md   <!-- Desktop -->
`}>
```

---

## ✨ FEATURES EXTRAS (Nice to Have)

### 1. Progress Bar no Topo
```jsx
<div className="fixed top-0 left-0 right-0 h-1 bg-zinc-200 z-[60]">
  <div 
    className="h-full bg-indigo-500 transition-all duration-500"
    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
  />
</div>
```

### 2. Confetti Animation na Conclusão
```bash
npm install canvas-confetti
```

```jsx
import confetti from 'canvas-confetti';

useEffect(() => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#6366f1', '#f59e0b', '#10b981']
  });
}, []);
```

### 3. Micro-interactions nos Botões
```jsx
<button 
  className="group relative overflow-hidden ..."
  onMouseEnter={(e) => {
    // Ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'absolute inset-0 bg-white/20 rounded-full animate-ping';
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }}
>
```

### 4. Sound Effects (Opcional)
```jsx
const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.3;
  audio.play();
};

// Ao avançar step
playSound('click');

// Ao completar
playSound('success');
```

### 5. Analytics Tracking
```jsx
// Rastrear progresso do onboarding
useEffect(() => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'onboarding_step', {
      step_number: currentStep + 1,
      step_name: onboardingSteps[currentStep].title
    });
  }
}, [currentStep]);
```

---

## ♿ ACESSIBILIDADE

### Requisitos Obrigatórios

#### 1. Focus Trap
```jsx
import { useEffect, useRef } from 'react';

function useFocusTrap(isActive) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [isActive]);

  return containerRef;
}
```

#### 2. ARIA Labels
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="onboarding-title"
  aria-describedby="onboarding-description"
>
  <h2 id="onboarding-title">Bem-vindo à TRPY!</h2>
  <p id="onboarding-description">Vamos te mostrar como planejar viagens...</p>
</div>
```

#### 3. Navegação por Teclado
- **ESC**: Fechar/pular onboarding
- **Arrow Right**: Próximo step
- **Arrow Left**: Step anterior
- **Tab**: Navegar entre elementos focáveis
- **Enter/Space**: Ativar botões

#### 4. Screen Reader Support
```jsx
<button aria-label={`Passo ${currentStep + 1} de ${totalSteps}: ${step.title}`}>
  Próximo
</button>

<div 
  role="progressbar" 
  aria-valuenow={currentStep + 1} 
  aria-valuemin="1" 
  aria-valuemax={totalSteps}
>
```

---

## 🧪 TESTES E VALIDAÇÃO

### Checklist de Testes

**Funcionalidade:**
- [ ] Onboarding aparece apenas na primeira visita
- [ ] Todos os steps navegam corretamente (Próximo/Anterior)
- [ ] Botão "Pular" funciona em todas as telas
- [ ] localStorage salva preferência corretamente
- [ ] Checkbox "Não mostrar novamente" funciona
- [ ] Teclas de atalho funcionam (ESC, arrows)

**Visual:**
- [ ] Spotlight destaca corretamente cada elemento
- [ ] Tooltips posicionam-se corretamente (não saem da tela)
- [ ] Animações são suaves (60fps)
- [ ] Cores seguem exatamente o design system
- [ ] Tipografia usa as fontes corretas
- [ ] Ícones carregam corretamente

**Responsividade:**
- [ ] Mobile (< 640px): tooltips adaptam posição
- [ ] Tablet (640-1024px): layout ajusta-se
- [ ] Desktop (> 1024px): experiência completa
- [ ] Touch targets têm mínimo 44px em mobile
- [ ] Texto é legível em todas as resoluções

**Acessibilidade:**
- [ ] Focus trap funciona
- [ ] Navegação por teclado completa
- [ ] Screen reader anuncia corretamente
- [ ] Contraste de cores adequado (WCAG AA)
- [ ] ARIA labels presentes

**Performance:**
- [ ] Animações rodam a 60fps
- [ ] Sem jank ao scrollar
- [ ] Imagens/assets otimizados
- [ ] Bundle size razoável (< 50kb gzipped)

---

## 📦 DELIVERABLES

### Arquivos Esperados

1. **`OnboardingTour.jsx`** - Componente principal orquestrador
2. **`WelcomeScreen.jsx`** - Tela de boas-vindas
3. **`TooltipStep.jsx`** - Componente de tooltip
4. **`CompletionScreen.jsx`** - Tela de conclusão
5. **`ProgressDots.jsx`** - Indicadores de progresso
6. **`onboardingSteps.js`** - Dados dos steps
7. **`useOnboarding.js`** - Hook customizado
8. **`localStorage.js`** - Utility para storage
9. **`onboarding.css`** - Estilos específicos
10. **`README.md`** - Documentação de uso

### README.md - Estrutura

```markdown
# TRPY Onboarding Tour

Sistema de onboarding interativo para a plataforma TRPY.

## Instalação

\`\`\`bash
npm install lucide-react canvas-confetti
\`\`\`

## Uso Básico

\`\`\`jsx
import OnboardingTour from '@/components/Onboarding/OnboardingTour';

function App() {
  return (
    <>
      <OnboardingTour onComplete={() => console.log('Onboarding completo!')} />
      {/* Resto da aplicação */}
    </>
  );
}
\`\`\`

## Customização

### Alterar Steps

Edite o arquivo \`onboardingSteps.js\`...

### Reset Onboarding

\`\`\`javascript
localStorage.removeItem('trpy_onboarding_completed');
\`\`\`

## Dependências

- React 18+
- Tailwind CSS
- Lucide React
- canvas-confetti (opcional)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
\`\`\`

### Demo Page

Criar uma página HTML standalone demonstrando o onboarding:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TRPY Onboarding Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    /* Incluir estilos do onboarding */
  </style>
</head>
<body class="bg-zinc-50">
  
  <!-- Mockup da interface TRPY -->
  <div id="app-container" class="max-w-7xl mx-auto p-6">
    
    <!-- Header -->
    <header class="bg-white border-b border-zinc-200 p-4 rounded-t-xl flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
        <span class="font-bold text-zinc-900">TRPY</span>
      </div>
      <button id="notifications-bell" class="p-2 hover:bg-zinc-50 rounded-lg">
        <i data-lucide="bell" class="w-5 h-5 text-zinc-600"></i>
      </button>
    </header>
    
    <!-- Main Content -->
    <div class="grid grid-cols-3 gap-6 mt-6">
      
      <!-- Sidebar -->
      <div class="col-span-1 space-y-4">
        <button id="create-trip-button" class="w-full px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium">
          + Nova Viagem
        </button>
        
        <div id="budget-panel" class="bg-white border border-zinc-100 rounded-xl p-6">
          <h3 class="font-semibold mb-2">Orçamento</h3>
          <p class="text-2xl font-bold">R$ 15.000</p>
        </div>
      </div>
      
      <!-- Timeline -->
      <div id="timeline-section" class="col-span-2 bg-white border border-zinc-100 rounded-xl p-6">
        <h3 class="font-semibold mb-4">Roteiro</h3>
        <div class="space-y-3">
          <div class="p-4 bg-zinc-50 rounded-lg">Dia 1 - Chegada</div>
          <div class="p-4 bg-zinc-50 rounded-lg">Dia 2 - Passeios</div>
        </div>
      </div>
    </div>
    
    <!-- Footer com outras áreas -->
    <div class="grid grid-cols-2 gap-6 mt-6">
      <div id="collaborators-section" class="bg-white border border-zinc-100 rounded-xl p-6">
        <h3 class="font-semibold mb-2">Viajantes</h3>
      </div>
      <div id="documents-area" class="bg-white border border-zinc-100 rounded-xl p-6">
        <h3 class="font-semibold mb-2">Documentos</h3>
      </div>
    </div>
    
    <div id="map-view" class="mt-6 bg-white border border-zinc-100 rounded-xl p-6 h-64">
      <h3 class="font-semibold mb-2">Mapa</h3>
    </div>
    
  </div>
  
  <!-- Onboarding Component será injetado aqui -->
  <div id="onboarding-root"></div>
  
  <script>
    lucide.createIcons();
    // Script do onboarding aqui
  </script>
  
</body>
</html>
```

---

## ⚠️ REGRAS CRÍTICAS - NÃO VIOLAR

### ❌ PROIBIDO

1. **Usar cores fora da paleta TRPY**
   - Qualquer cor não definida nas variáveis CSS é uma violação
   
2. **Usar outras fontes**
   - Apenas Inter, Space Mono e Space Grotesk
   
3. **Criar componentes genéricos/sem personalidade**
   - Evitar UI "padrão Bootstrap/Material"
   - Seguir rigorosamente o estilo TRPY
   
4. **Tom de voz corporativo/formal**
   - Nada de "Por favor, configure o sistema..."
   - Sempre casual: "Vamos começar?"

5. **Ignorar responsividade**
   - Testar em mobile é obrigatório
   
6. **Tooltips que saem da tela**
   - Sempre ajustar posição dinamicamente

### ✅ OBRIGATÓRIO

1. **Seguir 100% o design system**
   - Cores, fontes, espaçamentos, bordas
   
2. **Testar em diferentes dispositivos**
   - Mobile, tablet, desktop
   
3. **Comentar código complexo**
   - Facilitar manutenção futura
   
4. **Performance em primeiro lugar**
   - Animações a 60fps, sem jank
   
5. **Acessibilidade completa**
   - Teclado, screen reader, ARIA
   
6. **Código limpo e bem estruturado**
   - Componentes pequenos e reutilizáveis
   - Lógica separada de apresentação

---

## 🎓 REFERÊNCIAS E INSPIRAÇÕES

### Bons Exemplos de Onboarding

1. **Asana** - Tour guiado por tooltips
   - Spotlight claro no elemento
   - Copy direto e amigável
   - Navegação fluida

2. **Notion** - Onboarding progressivo
   - Steps curtos e visuais
   - CTAs claros
   - Permite pular facilmente

3. **Miro** - First-time experience
   - Interativo e hands-on
   - Feedback visual imediato
   - Celebração ao completar

4. **Linear** - Product tour
   - Design minimalista
   - Animações suaves
   - Foco em funcionalidades-chave

### Recursos Úteis

- **Tailwind UI**: https://tailwindui.com/components
- **Lucide Icons**: https://lucide.dev/icons
- **React Docs**: https://react.dev
- **Web Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/

---

## 🎯 META-INSTRUÇÃO FINAL

Este é um projeto de **alta qualidade** que representa a **primeira impressão** do usuário com a plataforma TRPY.

**Mindset esperado:**
- Você é um **designer de produto que também programa**
- Cada detalhe importa: animações, copy, espaçamentos
- O resultado deve parecer um **produto premium**, não um protótipo
- Pense na experiência do usuário em cada decisão técnica

**Critérios de excelência:**
- ✨ Polimento visual impecável
- 🎨 Fidelidade total ao design system
- 🚀 Performance otimizada
- ♿ Acessibilidade completa
- 📱 Responsividade perfeita
- 💬 Copy amigável e motivador

**O usuário que vê este onboarding deve pensar:**
_"Wow, esse produto parece muito bem feito e profissional!"_

---

**Boa sorte e capriche! 🚀✨**
