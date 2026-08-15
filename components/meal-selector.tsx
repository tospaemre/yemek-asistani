'use client'

import { MEALS } from '@/lib/meals'
import type { MealId } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface MealSelectorProps {
  selected: MealId | null
  onSelect: (id: MealId) => void
}

export function MealSelector({ selected, onSelect }: MealSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MEALS.map((meal, index) => {
        const isActive = selected === meal.id
        const isLast = index === MEALS.length - 1
        return (
          <button
            key={meal.id}
            type="button"
            onClick={() => onSelect(meal.id)}
            aria-pressed={isActive}
            className={cn(
              'relative flex min-h-[104px] flex-col items-start gap-1 rounded-3xl border p-4 text-left transition-all duration-200 active:scale-[0.97]',
              isLast && 'col-span-2',
              isActive
                ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'border-border bg-card text-card-foreground shadow-sm hover:border-primary/40',
            )}
          >
            {isActive && (
              <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20">
                <Check className="h-4 w-4" />
              </span>
            )}
            <span className="text-3xl leading-none" aria-hidden="true">
              {meal.emoji}
            </span>
            <span className="mt-1 font-display text-lg font-bold leading-tight">
              {meal.label}
            </span>
            <span
              className={cn(
                'text-xs',
                isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
              )}
            >
              {meal.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
