'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOnboarding } from './use-onboarding';
import { OnboardingWelcome } from './onboarding-welcome';
import { OnboardingTooltip } from './onboarding-tooltip';
import { OnboardingComplete } from './onboarding-complete';
import { ONBOARDING_STEPS } from './onboarding-steps';

type Screen = 'welcome' | 'tour' | 'complete';

export function OnboardingTour() {
  const { show, complete } = useOnboarding();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [step, setStep] = useState(0);

  if (!show) return null;

  function handleStart() { setScreen('tour'); }
  function handleSkip() { complete(); }
  function handleNext() {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setScreen('complete');
    }
  }
  function handlePrevious() { setStep((s) => Math.max(0, s - 1)); }
  function handleDone() { complete(); }

  return (
    <AnimatePresence mode="wait">
      {screen === 'welcome' && (
        <OnboardingWelcome key="welcome" onStart={handleStart} onSkip={handleSkip} />
      )}
      {screen === 'tour' && (
        <OnboardingTooltip
          key={`step-${step}`}
          step={ONBOARDING_STEPS[step]}
          currentIndex={step}
          totalSteps={ONBOARDING_STEPS.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
        />
      )}
      {screen === 'complete' && (
        <OnboardingComplete key="complete" onDone={handleDone} />
      )}
    </AnimatePresence>
  );
}
