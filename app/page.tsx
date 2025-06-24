'use client'

import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'
import NutritionDisplay from '@/components/NutritionDisplay'
import PWAInstaller from '@/components/PWAInstaller'
import { AnalysisResult, NutritionAnalysis } from '@/types'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<NutritionAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [shouldSkipAuth, setShouldSkipAuth] = useState(false)

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return
    
    // 開発環境またはプレビュー環境でのみ認証スキップ
    const skipAuth = (process.env.NODE_ENV === 'development' ||
                     (window.location.hostname.includes('qa-') || 
                      window.location.hostname === 'localhost')) &&
                     process.env.SKIP_AUTH === 'true'
    setShouldSkipAuth(skipAuth)
  }, [])

  const handleImageUpload = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)

      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        body: formData,
      })

      const data: AnalysisResult = await response.json()

      if (data.success && data.data) {
        setResult(data.data)
      } else {
        setError(data.error || '分析に失敗しました')
      }
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。')
      console.error('Upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const resetAnalysis = () => {
    setResult(null)
    setError(null)
    setUploadedImage(null)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session && !shouldSkipAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🍽️ カロリー・栄養バランス分析
          </h1>
          <p className="text-gray-600 mb-6">
            食事記録と健康管理を始めるには
            <br />
            ログインが必要です
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/api/auth/signin'}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              ログインする
            </button>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">または</p>
              <Link
                href="/guest"
                className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                ゲストとして試す
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              🍽️ カロリー・栄養バランス分析
            </h1>
            <p className="text-lg text-gray-600">
              {session?.user?.name ? `こんにちは、${session.user.name}さん！` : 
               shouldSkipAuth ? `認証スキップモード (Host: ${typeof window !== 'undefined' ? window.location.hostname : 'SSR'})` :
               'ログインが必要です'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 md:gap-4">
            <Link
              href="/profile"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
            >
              プロファイル
            </Link>
            <Link
              href="/goals"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
            >
              目標設定
            </Link>
            <Link
              href="/calendar"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
            >
              カレンダー
            </Link>
            <Link
              href="/notifications"
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
            >
              通知設定
            </Link>
            {session && (
              <button
                onClick={() => signOut()}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
              >
                ログアウト
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <ImageUpload onImageUpload={handleImageUpload} isLoading={isLoading} />
          
          {isLoading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="mt-2 text-gray-600">AI が画像を分析中...</p>
            </div>
          )}

          {uploadedImage && !isLoading && (
            <div className="mt-6 text-center">
              <img 
                src={uploadedImage} 
                alt="アップロードされた画像" 
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
              <button
                onClick={resetAnalysis}
                className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                もう一度試す
              </button>
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-6">
            <NutritionDisplay data={result} />
            
            <div className="text-center">
              <button
                onClick={resetAnalysis}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                別の画像を分析する
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            ※ 栄養成分の値は推定値です。正確な栄養情報については、製品のラベルや専門家にご相談ください。
          </p>
        </div>
      </div>
      <PWAInstaller />
    </main>
  )
}