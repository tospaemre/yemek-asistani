import type { Meal, MealId } from './types'

export const MEALS: Meal[] = [
  {
    id: 'kahvalti',
    label: 'Kahvaltı',
    emoji: '🍳',
    description: 'Güne enerjik başla',
  },
  {
    id: 'ogle',
    label: 'Öğle Yemeği',
    emoji: '🍲',
    description: 'Doyurucu ve pratik',
  },
  {
    id: 'aksam',
    label: 'Akşam Yemeği',
    emoji: '🍽️',
    description: 'Sofraya yakışır',
  },
  {
    id: 'ara',
    label: 'Ara Öğün',
    emoji: '🥪',
    description: 'Hafif atıştırmalık',
  },
  {
    id: 'tatli',
    label: 'Tatlı',
    emoji: '🍰',
    description: 'Tatlı bir mola',
  },
]

export function getMeal(id: MealId): Meal {
  return MEALS.find((m) => m.id === id) ?? MEALS[0]
}
