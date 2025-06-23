import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { AnalysisResult, FoodItem } from '@/types'

export const config = {
  api: {
    bodyParser: false,
  },
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
}

function parseApiResponse(apiResponse: string): FoodItem[] {
  try {
    const jsonMatch = apiResponse.match(/```json\n([\s\S]*?)\n```/) || apiResponse.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0]
      return JSON.parse(jsonStr)
    }
    return JSON.parse(apiResponse)
  } catch (error) {
    console.error('JSON解析エラー:', error)
    return []
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AnalysisResult>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'POST method only' })
  }

  try {
    const form = new IncomingForm()
    const [fields, files] = await form.parse(req)
    
    const file = Array.isArray(files.image) ? files.image[0] : files.image
    if (!file) {
      return res.status(400).json({ success: false, error: 'No image file provided' })
    }

    const imageBuffer = fs.readFileSync(file.filepath)
    const base64Image = imageBuffer.toString('base64')

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `この画像に写っている食べ物を分析して、以下のJSON形式で栄養情報を返してください。複数の食べ物がある場合は、それぞれの食べ物について情報を提供してください。

JSON形式:
[
  {
    "name": "食べ物名",
    "calories": カロリー(kcal),
    "protein": タンパク質(g),
    "carbs": 炭水化物(g),
    "fat": 脂質(g),
    "fiber": 食物繊維(g),
    "sugar": 糖質(g),
    "sodium": ナトリウム(mg),
    "confidence": 0.0-1.0の信頼度
  }
]

注意:
- 可能な限り正確な栄養情報を提供してください
- 一般的な1人前の分量を基準にしてください
- 見た目から判断して、量も考慮してください
- 信頼度は0.0から1.0の間で設定してください`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return res.status(500).json({ success: false, error: 'AI分析結果が空です' })
    }

    const foods = parseApiResponse(content)
    if (!foods.length) {
      return res.status(500).json({ success: false, error: '食べ物を認識できませんでした' })
    }

    const nutritionData = {
      totalCalories: foods.reduce((sum, food) => sum + food.calories, 0),
      totalProtein: foods.reduce((sum, food) => sum + food.protein, 0),
      totalCarbs: foods.reduce((sum, food) => sum + food.carbs, 0),
      totalFat: foods.reduce((sum, food) => sum + food.fat, 0),
      totalFiber: foods.reduce((sum, food) => sum + food.fiber, 0),
      totalSugar: foods.reduce((sum, food) => sum + food.sugar, 0),
      totalSodium: foods.reduce((sum, food) => sum + food.sodium, 0),
      foods
    }

    // Save to database if user is authenticated
    const session = await getServerSession(req, res, authOptions)
    if (session?.user?.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        })

        if (user) {
          // Save image to a simple storage (in production, use cloud storage)
          const imageUrl = `data:image/jpeg;base64,${base64Image}`

          await prisma.foodRecord.create({
            data: {
              userId: user.id,
              imageUrl,
              totalCalories: nutritionData.totalCalories,
              totalProtein: nutritionData.totalProtein,
              totalCarbs: nutritionData.totalCarbs,
              totalFat: nutritionData.totalFat,
              totalFiber: nutritionData.totalFiber,
              totalSugar: nutritionData.totalSugar,
              totalSodium: nutritionData.totalSodium,
              foods: JSON.stringify(foods),
            },
          })
        }
      } catch (dbError) {
        console.error('Database save error:', dbError)
        // Continue with response even if database save fails
      }
    }

    res.status(200).json({ success: true, data: nutritionData })

  } catch (error) {
    console.error('Food analysis error:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '分析中にエラーが発生しました' 
    })
  }
}