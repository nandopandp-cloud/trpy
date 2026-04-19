import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LandingContent from './_components/landing-content';

// Server Component — valida a sessão via cookie HTTP-only antes de
// servir qualquer HTML. Usuário autenticado nunca vê a landing.
export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect('/dashboard');
  }

  return <LandingContent />;
}
