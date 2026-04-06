import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

// Protect all /dashboard and /api routes (except auth endpoints)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/trips/:path*',
    '/api/favorites/:path*',
    '/api/expenses/:path*',
    '/api/itinerary-items/:path*',
    '/api/recommendations/:path*',
  ],
};
