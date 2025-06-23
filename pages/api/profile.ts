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
    return res.status(200).json({
      height: user.height,
      weight: user.weight,
      age: user.age,
      gender: user.gender,
      dailyCalorieGoal: user.dailyCalorieGoal,
      goalType: user.goalType,
      activityLevel: user.activityLevel,
    })
  }

  if (req.method === 'POST') {
    const {
      height,
      weight,
      age,
      gender,
      dailyCalorieGoal,
      goalType,
      activityLevel,
    } = req.body

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          age: age ? parseInt(age) : null,
          gender: gender || null,
          dailyCalorieGoal: dailyCalorieGoal ? parseInt(dailyCalorieGoal) : null,
          goalType: goalType || null,
          activityLevel: activityLevel || null,
        },
      })

      return res.status(200).json({ message: 'Profile updated successfully' })
    } catch (error) {
      console.error('Error updating profile:', error)
      return res.status(500).json({ error: 'Failed to update profile' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}