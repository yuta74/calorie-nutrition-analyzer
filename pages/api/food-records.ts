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
      const { startDate, endDate } = req.query

      let whereCondition: any = { userId: user.id }

      if (startDate && endDate) {
        whereCondition.recordedAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        }
      }

      const foodRecords = await prisma.foodRecord.findMany({
        where: whereCondition,
        orderBy: { recordedAt: 'desc' },
        take: 100, // Limit to recent 100 records for performance
      })

      return res.status(200).json(foodRecords)
    } catch (error) {
      console.error('Error fetching food records:', error)
      return res.status(500).json({ error: 'Failed to fetch food records' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}