import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// NextAuth設定オプション
export const authOptions = {
  debug: process.env.NODE_ENV === 'development',
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    }),
  ],
  callbacks: {
    async session({ session, token, user }: any) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// QA環境では認証を完全にスキップ
const isQAEnvironment = process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development'

const authHandler = isQAEnvironment 
  ? (req: any, res: any) => {
      res.status(200).json({ message: 'Auth disabled for QA environment' })
    }
  : NextAuth(authOptions)

export default authHandler