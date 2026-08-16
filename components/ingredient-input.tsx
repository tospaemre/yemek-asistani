'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { MEAL_SUGGESTIONS } from '@/lib/meal-suggestions'
import type { MealId } from '@/lib/types'
import { cn } from '@/lib/utils'

interface IngredientInputProps {
  ingredients: string[]
  onChange: (next: string[]) => void
  /** Hızlı ekle önerileri seçilen öğüne göre değişir. */
  meal: MealId
}

export function IngredientInput({ ingredients, onChange, meal }: IngredientInputProps) {
  const suggestions = MEAL_SUGGESTIONS[meal]
  const [value, setValue] = useState('')

  const addTokens = (raw: string) => {
    const parts = raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const existing = new Set(ingredients.map((i) => i.toLocaleLowerCase('tr')))
    const additions: string[] = []
    for (const p of parts) {
      const key = p.toLocaleLowerCase('tr')
      if (!existing.has(key)) {
        existing.add(key)
        additions.push(p)
      }
    }
    if (additions.length) onChange([...ingredients, ...additions])
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTokens(value)
    } else if (e.key === 'Backspace' && value === '' && ingredients.length) {
      onChange(ingredients.slice(0, -1))
    }
  }

  const remove = (item: string) => {
    onChange(ingredients.filter((i) => i !== item))
  }

  const quickAdd = (item: string) => {
    if (ingredients.some((i) => i.toLocaleLowerCase('tr') === item.toLocaleLowerCase('tr'))) {
      remove(item)
    } else {
      onChange([...ingredients, item])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-border bg-card p-3 shadow-sm">
        {ingredients.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-2">
            {ingredients.map((item) => (
              <li key={item}>
                <span className="flex items-center gap-1.5 rounded-full bg-accent py-1.5 pl-3.5 pr-1.5 text-sm font-semibold text-accent-foreground">
                  {item}
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    aria-label={`${item} malzemesini kaldır`}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-foreground/15 transition-colors hover:bg-accent-foreground/30"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={ingredients.length ? 1 : 2}
            placeholder={`Elindeki malzemeleri yaz...\nÖrn: ${suggestions
              .slice(0, 4)
              .map((s) => s.toLocaleLowerCase('tr'))
              .join(', ')}`}
            className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-base leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => addTokens(value)}
            disabled={!value.trim()}
            aria-label="Malzeme ekle"
            className={cn(
              'flex h-11 shrink-0 items-center gap-1 rounded-2xl px-3.5 text-sm font-bold transition-all active:scale-95',
              value.trim()
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <Plus className="h-4 w-4" />
            Ekle
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Hızlı ekle
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => {
            const active = ingredients.some(
              (i) => i.toLocaleLowerCase('tr') === s.toLocaleLowerCase('tr'),
            )
            return (
              <button
                key={s}
                type="button"
                onClick={() => quickAdd(s)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-95',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40',
                )}
              >
                {active ? '✓ ' : '+ '}
                {s}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
