'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'trpy_onboarding_completed';
const RESET_EVENT = 'trpy:onboarding-reset';

export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY) === 'true';
      if (!done) setShow(true);
    } catch {
      // localStorage unavailable (SSR or private mode)
    }

    function onReset() { setShow(true); }
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, []);

  function complete() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
    setShow(false);
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    window.dispatchEvent(new CustomEvent(RESET_EVENT));
  }

  return { show, complete, reset };
}
