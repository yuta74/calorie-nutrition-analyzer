'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  height?: number
  weight?: number
  age?: number
  gender?: string
  dailyCalorieGoal?: number
  goalType?: string
  activityLevel?: string
}

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateBMR = () => {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender) {
      return 0
    }

    let bmr = 0
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age)
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age)
    }

    const activityMultiplier = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }

    return Math.round(bmr * (activityMultiplier[profile.activityLevel as keyof typeof activityMultiplier] || 1.2))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        setMessage('プロファイルが保存されました！')
      } else {
        throw new Error('保存に失敗しました')
      }
    } catch (error) {
      setMessage('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const recommendedCalories = calculateBMR()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors mr-4"
          >
            ← 戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">プロファイル設定</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  身長 (cm)
                </label>
                <input
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => setProfile({...profile, height: parseFloat(e.target.value) || undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="170"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  体重 (kg)
                </label>
                <input
                  type="number"
                  value={profile.weight || ''}
                  onChange={(e) => setProfile({...profile, weight: parseFloat(e.target.value) || undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="65"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年齢
                </label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性別
                </label>
                <select
                  value={profile.gender || ''}
                  onChange={(e) => setProfile({...profile, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活動レベル
              </label>
              <select
                value={profile.activityLevel || ''}
                onChange={(e) => setProfile({...profile, activityLevel: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                <option value="sedentary">座りがち（ほとんど運動しない）</option>
                <option value="light">軽い活動（週1-3回の軽い運動）</option>
                <option value="moderate">普通の活動（週3-5回の中程度の運動）</option>
                <option value="active">活発（週6-7回の激しい運動）</option>
                <option value="very_active">非常に活発（1日2回の運動、激しい肉体労働）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目標タイプ
              </label>
              <select
                value={profile.goalType || ''}
                onChange={(e) => setProfile({...profile, goalType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                <option value="weight_loss">減量</option>
                <option value="weight_gain">増量</option>
                <option value="maintain">体重維持</option>
              </select>
            </div>

            {recommendedCalories > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">推奨カロリー</h3>
                <p className="text-blue-700">
                  あなたの基礎代謝と活動レベルから、1日の推奨カロリーは約 <strong>{recommendedCalories} kcal</strong> です。
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1日の目標カロリー (kcal)
              </label>
              <input
                type="number"
                value={profile.dailyCalorieGoal || ''}
                onChange={(e) => setProfile({...profile, dailyCalorieGoal: parseInt(e.target.value) || undefined})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={recommendedCalories > 0 ? recommendedCalories.toString() : "2000"}
              />
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${message.includes('エラー') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {isSaving ? '保存中...' : 'プロファイルを保存'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}