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
  /** Kullanıcının elinde olanlar. Ada göre aramada boş kalır. */
  usedIngredients: string[]
  /** Kullanıcıda olmayanlar. Ada göre aramada boş kalır. */
  missingIngredients: string[]
  /**
   * Tarifin bütün malzemeleri. Ada göre arama sonuçlarında bunu düz liste
   * olarak gösteriyoruz; orada "eksik malzeme" demek anlamsız olurdu.
   * Eski kayıtlarda bulunmayabilir, o yüzden isteğe bağlı.
   */
  ingredients?: string[]
  steps: string[]
  /** Kısa tanıtım. Tarif verisinde her zaman bulunmadığı için isteğe bağlı. */
  summary?: string
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
