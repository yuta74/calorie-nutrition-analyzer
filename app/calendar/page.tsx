'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Calendar from 'react-calendar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface FoodRecord {
  id: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  recordedAt: string
  imageUrl?: string
  foods: string
}

interface DailySummary {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  recordCount: number
}

type CalendarValue = Date | Date[] | null

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dailySummaries, setDailySummaries] = useState<Map<string, DailySummary>>(new Map())
  const [userGoal, setUserGoal] = useState<number>(2000)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user?.id) {
      fetchFoodRecords()
      fetchUserProfile()
    }
  }, [session, status, router])

  const fetchFoodRecords = async () => {
    try {
      const response = await fetch('/api/food-records')
      if (response.ok) {
        const data = await response.json()
        setFoodRecords(data)
        processDailySummaries(data)
      }
    } catch (error) {
      console.error('Error fetching food records:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.dailyCalorieGoal) {
          setUserGoal(data.dailyCalorieGoal)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const processDailySummaries = (records: FoodRecord[]) => {
    const summaries = new Map<string, DailySummary>()
    
    records.forEach(record => {
      const date = new Date(record.recordedAt).toDateString()
      const existing = summaries.get(date) || {
        date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        recordCount: 0
      }
      
      summaries.set(date, {
        date,
        calories: existing.calories + record.totalCalories,
        protein: existing.protein + record.totalProtein,
        carbs: existing.carbs + record.totalCarbs,
        fat: existing.fat + record.totalFat,
        recordCount: existing.recordCount + 1
      })
    })
    
    setDailySummaries(summaries)
  }

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toDateString()
      const summary = dailySummaries.get(dateStr)
      
      if (summary) {
        const percentage = (summary.calories / userGoal) * 100
        let colorClass = 'bg-gray-200'
        
        if (percentage >= 90 && percentage <= 110) {
          colorClass = 'bg-green-500'
        } else if (percentage >= 70 && percentage < 90) {
          colorClass = 'bg-yellow-500'
        } else if (percentage > 110) {
          colorClass = 'bg-red-500'
        } else if (percentage > 0) {
          colorClass = 'bg-blue-400'
        }
        
        return (
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${colorClass} mb-1`}></div>
            <div className="text-xs text-gray-600">{Math.round(summary.calories)}</div>
          </div>
        )
      }
    }
    return null
  }

  const getSelectedDateRecords = () => {
    const selectedDateStr = selectedDate.toDateString()
    return foodRecords.filter(record => 
      new Date(record.recordedAt).toDateString() === selectedDateStr
    )
  }

  const getWeeklyData = () => {
    const weekData = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toDateString()
      const summary = dailySummaries.get(dateStr)
      
      weekData.push({
        day: date.toLocaleDateString('ja-JP', { weekday: 'short' }),
        calories: summary ? Math.round(summary.calories) : 0,
        goal: userGoal
      })
    }
    
    return weekData
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const selectedDateSummary = dailySummaries.get(selectedDate.toDateString())
  const selectedDateRecords = getSelectedDateRecords()
  const weeklyData = getWeeklyData()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors mr-4"
          >
            ← 戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">カロリーカレンダー</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">月間カレンダー</h2>
            <div className="mb-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>目標達成</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>目標近い</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span>記録あり</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>目標超過</span>
                </div>
              </div>
            </div>
            <Calendar
              onChange={(value: any) => {
                if (value && value instanceof Date) {
                  setSelectedDate(value)
                }
              }}
              value={selectedDate}
              tileContent={getTileContent}
              className="react-calendar"
              locale="ja-JP"
            />
          </div>

          {/* Daily Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedDate.toLocaleDateString('ja-JP')} の記録
            </h2>
            
            {selectedDateSummary ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">1日の合計</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">カロリー:</span>
                      <span className="font-bold ml-2">{Math.round(selectedDateSummary.calories)} kcal</span>
                      <span className="text-gray-500 ml-2">/ {userGoal} kcal</span>
                    </div>
                    <div>
                      <span className="text-blue-600">記録数:</span>
                      <span className="font-bold ml-2">{selectedDateSummary.recordCount}回</span>
                    </div>
                    <div>
                      <span className="text-blue-600">タンパク質:</span>
                      <span className="font-bold ml-2">{Math.round(selectedDateSummary.protein)}g</span>
                    </div>
                    <div>
                      <span className="text-blue-600">炭水化物:</span>
                      <span className="font-bold ml-2">{Math.round(selectedDateSummary.carbs)}g</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedDateSummary.calories / userGoal > 1 ? 'bg-red-500' :
                          selectedDateSummary.calories / userGoal > 0.9 ? 'bg-green-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((selectedDateSummary.calories / userGoal) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      目標達成率: {Math.round((selectedDateSummary.calories / userGoal) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <h3 className="font-medium text-gray-800">食事記録</h3>
                  {selectedDateRecords.map((record, index) => (
                    <div key={record.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{Math.round(record.totalCalories)} kcal</span>
                        <span className="text-sm text-gray-500">
                          {new Date(record.recordedAt).toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {record.imageUrl && (
                        <img 
                          src={record.imageUrl} 
                          alt="食事画像" 
                          className="w-16 h-16 object-cover rounded mt-2"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>この日の記録はありません</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">週間カロリー推移</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calories" fill="#3B82F6" name="摂取カロリー" />
                <Bar dataKey="goal" fill="#EF4444" fillOpacity={0.3} name="目標カロリー" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  )
}