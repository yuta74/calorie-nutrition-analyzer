import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// QA環境では認証を完全にスキップ
if (process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development') {
  // ダミーのNextAuth設定（実際には使用されない）
  module.exports = (req, res) => {
    res.status(200).json({ message: 'Auth disabled for QA environment' })
  }
} else {
  export default NextAuth({
    debug: process.env.NODE_ENV === 'development',
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || 'dummy',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
      }),
    ],
    callbacks: {
      async session({ session, token, user }) {
        if (session.user) {
          session.user.id = user.id
        }
        return session
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  })
}