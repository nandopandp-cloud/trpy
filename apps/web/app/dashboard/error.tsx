'use client';

import { useEffect } from 'react';
import { ErrorScene } from '@/components/error/error-scene';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[TRPY] Dashboard error:', error);
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
