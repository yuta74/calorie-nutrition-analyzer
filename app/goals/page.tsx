'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Goal {
  id?: string
  title: string
  description: string
  reason: string
  targetDate: string
  beforeImage?: string
  reward: string
  isActive: boolean
}

export default function Goals() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentGoal, setCurrentGoal] = useState<Goal>({
    title: '',
    description: '',
    reason: '',
    targetDate: '',
    reward: '',
    isActive: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // 開発環境またはプレビュー環境でのみ認証スキップ
    const shouldSkipAuth = (process.env.NODE_ENV === 'development' ||
                           (typeof window !== 'undefined' && 
                            (window.location.hostname.includes('qa-') || 
                             window.location.hostname === 'localhost'))) &&
                           process.env.SKIP_AUTH === 'true'
    
    if (shouldSkipAuth) {
      // 認証スキップ時はダミーデータで初期化
      fetchGoals()
      return
    }
    
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }
    
    if (session?.user?.id) {
      fetchGoals()
    }
  }, [session, status, router])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentGoal({...currentGoal, beforeImage: data.url})
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentGoal),
      })

      if (response.ok) {
        setMessage('目標が保存されました！')
        setShowForm(false)
        setCurrentGoal({
          title: '',
          description: '',
          reason: '',
          targetDate: '',
          reward: '',
          isActive: true,
        })
        fetchGoals()
      } else {
        throw new Error('保存に失敗しました')
      }
    } catch (error) {
      setMessage('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleGoalStatus = async (goalId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        fetchGoals()
      }
    } catch (error) {
      console.error('Error updating goal status:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors mr-4"
            >
              ← 戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">目標設定</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {showForm ? 'キャンセル' : '新しい目標を追加'}
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('エラー') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">新しい目標を作成</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目標タイトル
                </label>
                <input
                  type="text"
                  value={currentGoal.title}
                  onChange={(e) => setCurrentGoal({...currentGoal, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="例: 3ヶ月で5kg減量する"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目標の詳細
                </label>
                <textarea
                  value={currentGoal.description}
                  onChange={(e) => setCurrentGoal({...currentGoal, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="具体的な目標内容を記入してください"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  なぜこの目標を達成したいのですか？
                </label>
                <textarea
                  value={currentGoal.reason}
                  onChange={(e) => setCurrentGoal({...currentGoal, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="例: 健康的な体型になって自信を持ちたい、結婚式でドレスを美しく着たい、など"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目標達成日
                </label>
                <input
                  type="date"
                  value={currentGoal.targetDate}
                  onChange={(e) => setCurrentGoal({...currentGoal, targetDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ビフォー写真（任意）
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {currentGoal.beforeImage && (
                  <div className="mt-2">
                    <img 
                      src={currentGoal.beforeImage} 
                      alt="ビフォー写真" 
                      className="max-w-xs max-h-40 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目標達成時のご褒美
                </label>
                <input
                  type="text"
                  value={currentGoal.reward}
                  onChange={(e) => setCurrentGoal({...currentGoal, reward: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="例: 新しい服を買う、旅行に行く、好きなレストランで食事する"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {isSaving ? '保存中...' : '目標を保存'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {goals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-600 text-lg">まだ目標が設定されていません。</p>
              <p className="text-gray-500 mt-2">「新しい目標を追加」ボタンから目標を作成しましょう！</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className={`bg-white rounded-lg shadow-lg p-6 ${goal.isActive ? '' : 'opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{goal.title}</h3>
                  <button
                    onClick={() => toggleGoalStatus(goal.id!, !goal.isActive)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      goal.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {goal.isActive ? 'アクティブ' : '非アクティブ'}
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4">{goal.description}</p>
                
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-yellow-800 mb-2">目標の理由</h4>
                  <p className="text-yellow-700">{goal.reason}</p>
                </div>

                {goal.beforeImage && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">ビフォー写真</h4>
                    <img 
                      src={goal.beforeImage} 
                      alt="ビフォー写真" 
                      className="max-w-xs max-h-40 rounded-lg"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>目標日: {goal.targetDate || '未設定'}</span>
                  {goal.reward && <span>ご褒美: {goal.reward}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}