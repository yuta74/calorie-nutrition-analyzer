import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          notificationSettings: true
        }
      })

      if (!user || !user.notificationSettings) {
        // デフォルト設定を返す
        return res.status(200).json({
          mealReminders: false,
          mealReminderTimes: ['08:00', '12:00', '18:00'],
          goalAchievementNotifications: true,
          weeklyReports: false,
          lowCalorieWarnings: true,
          highCalorieWarnings: true
        })
      }

      return res.status(200).json(JSON.parse(user.notificationSettings))
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        mealReminders,
        mealReminderTimes,
        goalAchievementNotifications,
        weeklyReports,
        lowCalorieWarnings,
        highCalorieWarnings
      } = req.body

      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const notificationSettings = {
        mealReminders: Boolean(mealReminders),
        mealReminderTimes: mealReminderTimes || ['08:00', '12:00', '18:00'],
        goalAchievementNotifications: Boolean(goalAchievementNotifications),
        weeklyReports: Boolean(weeklyReports),
        lowCalorieWarnings: Boolean(lowCalorieWarnings),
        highCalorieWarnings: Boolean(highCalorieWarnings)
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          notificationSettings: JSON.stringify(notificationSettings)
        }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error saving notification settings:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}