export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  confidence: number;
}

export interface NutritionAnalysis {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  foods: FoodItem[];
}

export interface AnalysisResult {
  success: boolean;
  data?: NutritionAnalysis;
  error?: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  dailyCalorieGoal?: number;
  goalType?: string;
  activityLevel?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  reason?: string;
  targetDate?: Date;
  beforeImage?: string;
  afterImage?: string;
  reward?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodRecord {
  id: string;
  userId: string;
  imageUrl?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  foods: string; // JSON string of FoodItem[]
  recordedAt: Date;
}