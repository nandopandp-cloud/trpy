'use client';

import { useEffect } from 'react';
import { ErrorScene } from '@/components/error/error-scene';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[TRPY] Unhandled error:', error);
  }, [error]);

  return (
    <ErrorScene
      variant="server-error"
      onRetry={reset}
      showBack
      showHome
      showExplore
    />
  );
}
