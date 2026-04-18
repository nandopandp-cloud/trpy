'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'trpy_onboarding_completed';

export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY) === 'true';
      if (!done) setShow(true);
    } catch {
      // localStorage unavailable (SSR or private mode)
    }
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
    setShow(true);
  }

  return { show, complete, reset };
}
