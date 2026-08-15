'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { RecipeCard } from '@/components/recipe-card'
import { RecipeDetailSheet } from '@/components/recipe-detail-sheet'
import { EmptyState } from '@/components/empty-state'
import { searchRecipes } from '@/lib/ai-service'
import { getMeal } from '@/lib/meals'
import type { Recipe } from '@/lib/types'

interface SearchScreenProps {
  isFavorite: (title: string) => boolean
  onToggleFavorite: (recipe: Recipe) => void
}

export function SearchScreen({ isFavorite, onToggleFavorite }: SearchScreenProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Recipe[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState<Recipe | null>(null)
  // Yazarken her tuşta arama yapmamak için son isteği takip ediyoruz.
  const requestId = useRef(0)

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) {
      setResults(null)
      setBusy(false)
      return
    }
    const id = ++requestId.current
    setBusy(true)
    const timer = setTimeout(() => {
      searchRecipes(term)
        .then((found) => {
          if (id === requestId.current) setResults(found)
        })
        .catch(() => {
          if (id === requestId.current) setResults([])
        })
        .finally(() => {
          if (id === requestId.current) setBusy(false)
        })
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold">Tarif Ara</h2>
        <p className="text-sm text-muted-foreground">Adını yaz, 5.000 tarifin içinden bulalım</p>
      </div>

      <div className="flex items-center gap-2 rounded-3xl border border-border bg-card px-4 py-3 shadow-sm focus-within:border-primary/50">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Örn: mercimek çorbası, karnıyarık, sütlaç"
          aria-label="Tarif adı ara"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        {busy && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
        {query && !busy && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Aramayı temizle"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-90"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {results === null && (
        <EmptyState
          emoji="🔎"
          title="Ne arıyorsun?"
          description="Tarif adının en az iki harfini yaz. Türkçe karakter kullanmasan da bulur — 'kofte' yazsan da Köfte çıkar."
        />
      )}

      {results !== null && results.length === 0 && !busy && (
        <EmptyState
          emoji="🤔"
          title="Sonuç bulunamadı"
          description={`"${query.trim()}" için tarif yok. Daha kısa bir kelime deneyebilirsin.`}
        />
      )}

      {results !== null && results.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">{results.length} tarif bulundu</p>
          <ul className="flex flex-col gap-3">
            {results.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  onClick={() => setSelected(recipe)}
                  isFavorite={isFavorite(recipe.title)}
                  onToggleFavorite={() => onToggleFavorite(recipe)}
                  meta={`${getMeal(recipe.meal).label} · ${recipe.prepTime + recipe.cookTime} dk · ${recipe.difficulty}`}
                />
              </li>
            ))}
          </ul>
        </>
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
