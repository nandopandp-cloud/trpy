import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Get the current authenticated session (server-side).
 * Use in API routes, server components, and server actions.
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Get the current user ID from the session.
 * Returns null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

/**
 * Require authentication — throws if no session.
 * Use in API routes that must be protected.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user;
}
