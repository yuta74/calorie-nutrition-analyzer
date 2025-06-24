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

// 認証スキップ環境の判定
const shouldSkipAuth = process.env.VERCEL_ENV === 'preview' || 
                       process.env.NODE_ENV === 'development' ||
                       process.env.SKIP_AUTH === 'true' ||
                       !process.env.GOOGLE_CLIENT_ID ||
                       process.env.GOOGLE_CLIENT_ID === 'dummy'

const authHandler = shouldSkipAuth 
  ? (req: any, res: any) => {
      res.status(200).json({ message: 'Auth disabled for environment' })
    }
  : NextAuth(authOptions)

export default authHandler