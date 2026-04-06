import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@trpy/database';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],

  providers: [
    // ── Google OAuth ──────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // ── Apple OAuth ───────────────────────────────────────
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // ── Email / Password ──────────────────────────────────
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user?.password) {
          // User doesn't exist or signed up via OAuth (no password)
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  // ── Session strategy ──────────────────────────────────
  // Use JWT for credentials (PrismaAdapter doesn't create sessions for credentials)
  // Use database sessions for OAuth
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ── JWT config ────────────────────────────────────────
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ── Pages ─────────────────────────────────────────────
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // ── Callbacks ─────────────────────────────────────────
  callbacks: {
    async jwt({ token, user, account }) {
      // First sign in: attach user id
      if (user) {
        token.id = user.id;
      }

      // OAuth first sign in: ensure user exists in DB
      if (account && account.type !== 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      // Allow all OAuth sign-ins
      if (account?.type !== 'credentials') {
        return true;
      }

      // For credentials, check the user exists
      if (!user?.email) return false;

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      return !!dbUser?.password;
    },
  },

  // ── Security ──────────────────────────────────────────
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Suppress debug logs in production
  debug: process.env.NODE_ENV === 'development',
};
