import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const authPrisma = new PrismaClient()

const authOptions = {
  adapter: PrismaAdapter(authPrisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid goal ID' })
  }

  if (req.method === 'PATCH') {
    const { isActive } = req.body

    try {
      const goal = await prisma.goal.updateMany({
        where: {
          id,
          userId: user.id,
        },
        data: {
          isActive,
        },
      })

      if (goal.count === 0) {
        return res.status(404).json({ error: 'Goal not found' })
      }

      return res.status(200).json({ message: 'Goal updated successfully' })
    } catch (error) {
      console.error('Error updating goal:', error)
      return res.status(500).json({ error: 'Failed to update goal' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const goal = await prisma.goal.deleteMany({
        where: {
          id,
          userId: user.id,
        },
      })

      if (goal.count === 0) {
        return res.status(404).json({ error: 'Goal not found' })
      }

      return res.status(200).json({ message: 'Goal deleted successfully' })
    } catch (error) {
      console.error('Error deleting goal:', error)
      return res.status(500).json({ error: 'Failed to delete goal' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}