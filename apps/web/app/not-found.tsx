import { ErrorScene } from '@/components/error/error-scene';

export default function NotFoundPage() {
  return (
    <ErrorScene
      variant="not-found"
      showBack
      showHome
      showExplore
    />
  );
}
