export type MealId = 'kahvalti' | 'ogle' | 'aksam' | 'ara' | 'tatli'

export interface Meal {
  id: MealId
  label: string
  emoji: string
  description: string
}

export interface Recipe {
  id: string
  title: string
  emoji: string
  meal: MealId
  prepTime: number // dakika
  cookTime: number // dakika
  servings: number
  difficulty: 'Kolay' | 'Orta' | 'Zor'
  usedIngredients: string[]
  missingIngredients: string[]
  steps: string[]
  summary: string
}

export interface RecipeSuggestion {
  main: Recipe
  alternatives: Recipe[]
  note?: string
}

export interface HistoryEntry {
  id: string
  recipe: Recipe
  meal: MealId
  ingredients: string[]
  createdAt: number
}
