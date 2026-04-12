import { ErrorScene } from '@/components/error/error-scene';

export default function DashboardNotFound() {
  return (
    <ErrorScene
      variant="not-found"
      showBack
      showHome
      showExplore
    />
  );
}
