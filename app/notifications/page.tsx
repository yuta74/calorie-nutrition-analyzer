'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface NotificationSettings {
  mealReminders: boolean
  mealReminderTimes: string[]
  goalAchievementNotifications: boolean
  weeklyReports: boolean
  lowCalorieWarnings: boolean
  highCalorieWarnings: boolean
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<NotificationSettings>({
    mealReminders: false,
    mealReminderTimes: ['08:00', '12:00', '18:00'],
    goalAchievementNotifications: true,
    weeklyReports: false,
    lowCalorieWarnings: true,
    highCalorieWarnings: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user?.id) {
      fetchNotificationSettings()
      checkNotificationPermission()
    }
  }, [session, status, router])

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        setMessage('通知が許可されました！')
        // テスト通知を送信
        new Notification('カロリー分析アプリ', {
          body: '通知設定が完了しました！',
          icon: '/favicon.ico',
          tag: 'test-notification'
        })
      } else {
        setMessage('通知が拒否されました。ブラウザの設定から通知を許可してください。')
      }
    }
  }

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage('通知設定が保存されました！')
        if (settings.mealReminders && notificationPermission === 'granted') {
          scheduleNotifications()
        }
      } else {
        throw new Error('保存に失敗しました')
      }
    } catch (error) {
      setMessage('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSaving(false)
    }
  }

  const scheduleNotifications = () => {
    // Service Workerを使った通知スケジューリングはより複雑なので、
    // 現在はブラウザが開いている間のみの簡易実装
    settings.mealReminderTimes.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number)
      const now = new Date()
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)
      
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }
      
      const timeUntilNotification = scheduledTime.getTime() - now.getTime()
      
      setTimeout(() => {
        if (notificationPermission === 'granted') {
          new Notification('食事の時間です！', {
            body: '今日の食事を記録しましょう',
            icon: '/favicon.ico',
            tag: `meal-reminder-${time}`,
            actions: [
              { action: 'record', title: '記録する' },
              { action: 'snooze', title: '後で' }
            ]
          })
        }
      }, timeUntilNotification)
    })
  }

  const addReminderTime = () => {
    setSettings({
      ...settings,
      mealReminderTimes: [...settings.mealReminderTimes, '12:00']
    })
  }

  const removeReminderTime = (index: number) => {
    const newTimes = settings.mealReminderTimes.filter((_, i) => i !== index)
    setSettings({
      ...settings,
      mealReminderTimes: newTimes
    })
  }

  const updateReminderTime = (index: number, time: string) => {
    const newTimes = [...settings.mealReminderTimes]
    newTimes[index] = time
    setSettings({
      ...settings,
      mealReminderTimes: newTimes
    })
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
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors mr-4"
          >
            ← 戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">通知設定</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 通知許可状態 */}
          <div className="mb-6 p-4 rounded-lg bg-blue-50">
            <h3 className="font-medium text-blue-800 mb-2">通知許可状態</h3>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">
                現在の状態: {
                  notificationPermission === 'granted' ? '✅ 許可済み' :
                  notificationPermission === 'denied' ? '❌ 拒否済み' : '⚠️ 未設定'
                }
              </span>
              {notificationPermission !== 'granted' && (
                <button
                  onClick={requestNotificationPermission}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  通知を許可する
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 食事リマインダー */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.mealReminders}
                    onChange={(e) => setSettings({...settings, mealReminders: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="font-medium text-gray-700">食事リマインダー</span>
                </label>
              </div>
              
              {settings.mealReminders && (
                <div className="ml-6 space-y-2">
                  <p className="text-sm text-gray-600 mb-3">通知時間を設定してください：</p>
                  {settings.mealReminderTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateReminderTime(index, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {settings.mealReminderTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeReminderTime(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addReminderTime}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    + 時間を追加
                  </button>
                </div>
              )}
            </div>

            {/* 目標達成通知 */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.goalAchievementNotifications}
                  onChange={(e) => setSettings({...settings, goalAchievementNotifications: e.target.checked})}
                  className="mr-2"
                />
                <span className="font-medium text-gray-700">目標達成通知</span>
              </label>
              <p className="text-sm text-gray-600 ml-6">日々のカロリー目標を達成した時に通知します</p>
            </div>

            {/* カロリー警告 */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.lowCalorieWarnings}
                  onChange={(e) => setSettings({...settings, lowCalorieWarnings: e.target.checked})}
                  className="mr-2"
                />
                <span className="font-medium text-gray-700">カロリー不足警告</span>
              </label>
              <p className="text-sm text-gray-600 ml-6">目標より大幅にカロリーが不足している時に通知します</p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.highCalorieWarnings}
                  onChange={(e) => setSettings({...settings, highCalorieWarnings: e.target.checked})}
                  className="mr-2"
                />
                <span className="font-medium text-gray-700">カロリー過剰警告</span>
              </label>
              <p className="text-sm text-gray-600 ml-6">目標より大幅にカロリーが超過している時に通知します</p>
            </div>

            {/* 週次レポート */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => setSettings({...settings, weeklyReports: e.target.checked})}
                  className="mr-2"
                />
                <span className="font-medium text-gray-700">週次レポート</span>
              </label>
              <p className="text-sm text-gray-600 ml-6">週1回、摂取カロリーや目標達成率のサマリーを通知します</p>
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
              {isSaving ? '保存中...' : '設定を保存'}
            </button>
          </form>

          {/* 注意事項 */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ 注意事項</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 通知を受け取るには、ブラウザで通知を許可する必要があります</li>
              <li>• ブラウザを閉じている間は通知されません</li>
              <li>• PWA（ホーム画面に追加）として利用すると、より確実に通知されます</li>
              <li>• モバイルデバイスでは省電力モードで通知が制限される場合があります</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}