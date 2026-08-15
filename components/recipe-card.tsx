'use client'

import type { Recipe } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Clock, Heart, ChevronRight } from 'lucide-react'

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  meta?: string
}

export function RecipeCard({
  recipe,
  onClick,
  isFavorite,
  onToggleFavorite,
  meta,
}: RecipeCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3 shadow-sm transition-colors">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 items-center gap-3 text-left active:opacity-70"
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-2xl"
          aria-hidden="true"
        >
          {recipe.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-base font-bold">
            {recipe.title}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {meta ?? `${recipe.prepTime + recipe.cookTime} dk · ${recipe.difficulty}`}
          </span>
        </span>
      </button>
      {onToggleFavorite ? (
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          aria-pressed={isFavorite}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-90',
            isFavorite ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
        </button>
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}
    </div>
  )
}
