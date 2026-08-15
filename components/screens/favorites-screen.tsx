'use client'

import { useState } from 'react'
import type { Recipe } from '@/lib/types'
import { RecipeCard } from '@/components/recipe-card'
import { RecipeDetailSheet } from '@/components/recipe-detail-sheet'
import { EmptyState } from '@/components/empty-state'
import { getMeal } from '@/lib/meals'

interface FavoritesScreenProps {
  favorites: Recipe[]
  isFavorite: (title: string) => boolean
  onToggleFavorite: (recipe: Recipe) => void
  onGoHome: () => void
}

export function FavoritesScreen({
  favorites,
  isFavorite,
  onToggleFavorite,
  onGoHome,
}: FavoritesScreenProps) {
  const [selected, setSelected] = useState<Recipe | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold">Favoriler</h2>
        <p className="text-sm text-muted-foreground">
          Beğendiğin tarifler cihazında saklanır
        </p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          emoji="❤️"
          title="Henüz favori yok"
          description="Beğendiğin tarifleri kalp simgesine dokunarak buraya ekleyebilirsin."
          action={
            <button
              type="button"
              onClick={onGoHome}
              className="rounded-2xl bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground active:scale-95"
            >
              Tarif Oluştur
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {favorites.map((recipe) => (
            <li key={recipe.title}>
              <RecipeCard
                recipe={recipe}
                onClick={() => setSelected(recipe)}
                isFavorite={isFavorite(recipe.title)}
                onToggleFavorite={() => onToggleFavorite(recipe)}
                meta={`${getMeal(recipe.meal).label} · ${recipe.prepTime + recipe.cookTime} dk`}
              />
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <RecipeDetailSheet
          recipe={selected}
          isFavorite={isFavorite(selected.title)}
          onToggleFavorite={() => onToggleFavorite(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
