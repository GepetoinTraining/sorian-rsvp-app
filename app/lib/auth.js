// src/lib/auth.js
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs'; 

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Email e Senha',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@sorian-rsvp.com' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // 1. Check if user exists
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // 2. Check if password exists (it might be null if user registered via OAuth in future)
        if (!user || !user.passwordHash) {
          return null;
        }

        // 3. Validate password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (isPasswordValid) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Add user ID to the session so we can link events to the user
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/login', // We will build this custom page later
  },
  secret: process.env.NEXTAUTH_SECRET,
};