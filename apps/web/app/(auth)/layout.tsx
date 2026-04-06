import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="w-full px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8">
            <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none">
              <circle cx="12" cy="12" r="9.5" stroke="#6366f1" strokeWidth="1.5" opacity="0.6" />
              <path d="M 12 3.5 L 13.2 8.5 L 12 12 Z" fill="#6366f1" />
              <path d="M 20.5 12 L 15.5 13.2 L 12 12 Z" fill="#6366f1" />
              <path d="M 12 20.5 L 10.8 15.5 L 12 12 Z" fill="#6366f1" />
              <path d="M 3.5 12 L 8.5 10.8 L 12 12 Z" fill="#6366f1" />
              <circle cx="12" cy="12" r="1.5" fill="#6366f1" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">TRPY</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </main>
    </div>
  );
}
