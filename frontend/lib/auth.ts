import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Demo users — no database required
const DEMO_USERS = [
  { id: '1', email: 'admin@tanko.mx', password: 'tanko2024', name: 'Admin Tanko', role: 'ADMIN' as const },
  { id: '2', email: 'conductor@tanko.mx', password: 'tanko2024', name: 'Conductor Demo', role: 'CONDUCTOR' as const },
]

declare module 'next-auth' {
  interface Session {
    user: { id: string; email: string; name: string; role: 'ADMIN' | 'CONDUCTOR' }
  }
}

declare module 'next-auth/jwt' {
  interface JWT { id: string; role: 'ADMIN' | 'CONDUCTOR' }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = DEMO_USERS.find(
          u => u.email === credentials?.email && u.password === credentials?.password
        )
        if (!user) throw new Error('Invalid credentials')
        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role }
      return token
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id; session.user.role = token.role }
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET || 'tanko-demo-secret',
}

export default authOptions
