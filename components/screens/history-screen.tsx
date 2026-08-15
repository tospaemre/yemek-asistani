'use client'

import { useState } from 'react'
import { Clock, Trash2 } from 'lucide-react'
import type { HistoryEntry, Recipe } from '@/lib/types'
import { RecipeDetailSheet } from '@/components/recipe-detail-sheet'
import { EmptyState } from '@/components/empty-state'
import { getMeal } from '@/lib/meals'

interface HistoryScreenProps {
  history: HistoryEntry[]
  isFavorite: (title: string) => boolean
  onToggleFavorite: (recipe: Recipe) => void
  onClear: () => void
  onGoHome: () => void
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HistoryScreen({
  history,
  isFavorite,
  onToggleFavorite,
  onClear,
  onGoHome,
}: HistoryScreenProps) {
  const [selected, setSelected] = useState<Recipe | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-extrabold">Geçmiş</h2>
          <p className="text-sm text-muted-foreground">Daha önce oluşturduğun tarifler</p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-semibold text-destructive active:opacity-70"
          >
            <Trash2 className="h-4 w-4" />
            Temizle
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState
          emoji="🕘"
          title="Geçmiş boş"
          description="Oluşturduğun tarifler burada listelenir. Hadi ilk tarifini oluştur!"
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
          {history.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => setSelected(entry.recipe)}
                className="w-full rounded-3xl border border-border bg-card p-4 text-left shadow-sm active:opacity-70"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-2xl">
                    {entry.recipe.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-bold">
                      {entry.recipe.title}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-0.5 font-semibold">
                        {getMeal(entry.meal).label}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(entry.createdAt)}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Malzemeler: </span>
                  {entry.ingredients.join(', ')}
                </p>
              </button>
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
