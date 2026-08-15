'use client'

import type { Recipe } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Clock, Flame, Gauge, Heart, Users, Check, ShoppingCart } from 'lucide-react'

interface RecipeViewProps {
  recipe: Recipe
  isFavorite: boolean
  onToggleFavorite: () => void
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-muted px-2 py-3 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-display text-base font-bold leading-none">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

export function RecipeView({ recipe, isFavorite, onToggleFavorite }: RecipeViewProps) {
  const total = recipe.prepTime + recipe.cookTime

  return (
    <article className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-4xl leading-none" aria-hidden="true">
            {recipe.emoji}
          </span>
          <div>
            <h2 className="text-balance font-display text-2xl font-extrabold leading-tight">
              {recipe.title}
            </h2>
            {recipe.summary && (
              <p className="mt-1 text-sm text-muted-foreground">{recipe.summary}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          aria-pressed={isFavorite}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90',
            isFavorite
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-border bg-card text-muted-foreground',
          )}
        >
          <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
        </button>
      </header>

      <div className="grid grid-cols-4 gap-2">
        <MetaItem icon={<Clock className="h-4 w-4" />} label="Hazırlık" value={`${recipe.prepTime}dk`} />
        <MetaItem icon={<Flame className="h-4 w-4" />} label="Pişirme" value={`${recipe.cookTime}dk`} />
        <MetaItem icon={<Gauge className="h-4 w-4" />} label="Zorluk" value={recipe.difficulty} />
        <MetaItem icon={<Users className="h-4 w-4" />} label="Kişilik" value={`${recipe.servings}`} />
      </div>

      <p className="text-center text-sm font-semibold text-primary">
        Toplam süre yaklaşık {total} dakika
      </p>

      <section className="rounded-3xl border border-border bg-card p-4">
        <h3 className="mb-3 font-display text-lg font-bold">Kullanacağın Malzemeler</h3>
        {/* Ada göre aramada elde/eksik ayrımı yok; malzemeler düz liste gösterilir. */}
        {recipe.usedIngredients.length === 0 &&
          recipe.missingIngredients.length === 0 &&
          recipe.ingredients && (
            <ul className="flex flex-col gap-1.5">
              {recipe.ingredients.map((ing) => (
                <li key={ing} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {ing}
                </li>
              ))}
            </ul>
          )}
        {recipe.usedIngredients.length > 0 && (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Elindekiler
            </p>
            <ul className="mb-4 flex flex-col gap-1.5">
              {recipe.usedIngredients.map((ing) => (
                <li key={ing} className="flex items-center gap-2 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {ing}
                </li>
              ))}
            </ul>
          </>
        )}
        {recipe.missingIngredients.length > 0 && (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Eksik malzemeler
            </p>
            <ul className="flex flex-wrap gap-2">
              {recipe.missingIngredients.map((ing) => (
                <li
                  key={ing}
                  className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {ing}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-bold">Hazırlanışı</h3>
        <ol className="flex flex-col gap-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <p className="pt-0.5 text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </article>
  )
}
