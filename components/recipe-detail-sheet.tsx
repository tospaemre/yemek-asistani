'use client'

import { useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { Recipe } from '@/lib/types'
import { RecipeView } from '@/components/recipe-view'

interface RecipeDetailSheetProps {
  recipe: Recipe
  isFavorite: boolean
  onToggleFavorite: () => void
  onClose: () => void
}

export function RecipeDetailSheet({
  recipe,
  isFavorite,
  onToggleFavorite,
  onClose,
}: RecipeDetailSheetProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background animate-in fade-in slide-in-from-bottom-4 duration-200">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-sm font-semibold text-muted-foreground active:opacity-70"
        >
          <ChevronLeft className="h-5 w-5" />
          Geri
        </button>
        <span className="font-display font-bold">Tarif</span>
      </header>
      <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-4 py-5 pb-10">
        <RecipeView
          recipe={recipe}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </div>
  )
}
