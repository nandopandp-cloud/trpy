import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <span className="text-5xl font-bold text-gradient">Trpy</span>
          <ThemeToggle />
        </div>
        <p className="text-muted-foreground text-lg max-w-md">
          Super-app de viagens com gestão financeira integrada.
        </p>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-muted">Next.js 14</span>
          <span className="px-3 py-1 rounded-full bg-muted">Tailwind CSS</span>
          <span className="px-3 py-1 rounded-full bg-muted">Dark mode ✓</span>
        </div>
      </div>
    </main>
  );
}
