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

  if (req.method === 'GET') {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json(goals)
    } catch (error) {
      console.error('Error fetching goals:', error)
      return res.status(500).json({ error: 'Failed to fetch goals' })
    }
  }

  if (req.method === 'POST') {
    const {
      title,
      description,
      reason,
      targetDate,
      beforeImage,
      reward,
      isActive = true
    } = req.body

    if (!title || !description || !reason) {
      return res.status(400).json({ error: 'Title, description, and reason are required' })
    }

    try {
      const goal = await prisma.goal.create({
        data: {
          userId: user.id,
          title,
          description,
          reason,
          targetDate: targetDate ? new Date(targetDate) : null,
          beforeImage: beforeImage || null,
          reward: reward || null,
          isActive,
        },
      })

      return res.status(201).json(goal)
    } catch (error) {
      console.error('Error creating goal:', error)
      return res.status(500).json({ error: 'Failed to create goal' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}