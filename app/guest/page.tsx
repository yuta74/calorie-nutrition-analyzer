'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'
import NutritionDisplay from '@/components/NutritionDisplay'
import { AnalysisResult, NutritionAnalysis } from '@/types'

export default function GuestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<NutritionAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              🍽️ カロリー・栄養バランス分析
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              ゲストモードでお試し中
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-800 mb-2">⚠️ ゲストモードの制限</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 食事記録の保存はできません</li>
                <li>• カレンダー機能は利用できません</li>
                <li>• プロファイル設定は保存されません</li>
                <li>• 完全な機能を利用するにはログインが必要です</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
            >
              ログインページに戻る
            </Link>
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
    </main>
  )
}