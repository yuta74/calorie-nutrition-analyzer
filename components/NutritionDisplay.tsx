'use client'

import React from 'react'
import { NutritionAnalysis } from '@/types'

interface NutritionDisplayProps {
  data: NutritionAnalysis
}

export default function NutritionDisplay({ data }: NutritionDisplayProps) {
  const {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    totalSugar,
    totalSodium,
    foods
  } = data

  const getDailyValuePercentage = (nutrient: string, value: number) => {
    const dailyValues: { [key: string]: number } = {
      protein: 50,
      carbs: 300,
      fat: 65,
      fiber: 25,
      sodium: 2300
    }
    
    const dv = dailyValues[nutrient]
    return dv ? Math.round((value / dv) * 100) : 0
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">栄養分析結果</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{totalCalories}</div>
            <div className="text-sm text-gray-600">kcal</div>
            <div className="text-xs text-gray-500">カロリー</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalProtein.toFixed(1)}</div>
            <div className="text-sm text-gray-600">g</div>
            <div className="text-xs text-gray-500">タンパク質</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{totalCarbs.toFixed(1)}</div>
            <div className="text-sm text-gray-600">g</div>
            <div className="text-xs text-gray-500">炭水化物</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{totalFat.toFixed(1)}</div>
            <div className="text-sm text-gray-600">g</div>
            <div className="text-xs text-gray-500">脂質</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">食物繊維</span>
            <div className="text-right">
              <span className="font-semibold">{totalFiber.toFixed(1)}g</span>
              <span className="text-sm text-gray-500 ml-2">
                ({getDailyValuePercentage('fiber', totalFiber)}% DV)
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">糖質</span>
            <div className="text-right">
              <span className="font-semibold">{totalSugar.toFixed(1)}g</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">ナトリウム</span>
            <div className="text-right">
              <span className="font-semibold">{totalSodium.toFixed(0)}mg</span>
              <span className="text-sm text-gray-500 ml-2">
                ({getDailyValuePercentage('sodium', totalSodium)}% DV)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">認識された食べ物</h3>
        <div className="space-y-3">
          {foods.map((food, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg text-gray-800">{food.name}</h4>
                <div className="text-sm text-gray-500">
                  信頼度: {Math.round(food.confidence * 100)}%
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{food.calories}</div>
                  <div className="text-xs text-gray-600">kcal</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{food.protein.toFixed(1)}g</div>
                  <div className="text-xs text-gray-600">タンパク質</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{food.carbs.toFixed(1)}g</div>
                  <div className="text-xs text-gray-600">炭水化物</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{food.fat.toFixed(1)}g</div>
                  <div className="text-xs text-gray-600">脂質</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">栄養バランス評価</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>タンパク質</span>
              <span>{getDailyValuePercentage('protein', totalProtein)}% / 推奨量</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${Math.min(getDailyValuePercentage('protein', totalProtein), 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>炭水化物</span>
              <span>{getDailyValuePercentage('carbs', totalCarbs)}% / 推奨量</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${Math.min(getDailyValuePercentage('carbs', totalCarbs), 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>脂質</span>
              <span>{getDailyValuePercentage('fat', totalFat)}% / 推奨量</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${Math.min(getDailyValuePercentage('fat', totalFat), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}