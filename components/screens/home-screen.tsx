'use client'

import { useRef, useState } from 'react'
import { Sparkles, AlertCircle, RotateCcw, ChevronLeft, Info } from 'lucide-react'
import { MealSelector } from '@/components/meal-selector'
import { IngredientInput } from '@/components/ingredient-input'
import { LoadingRecipes } from '@/components/loading-recipes'
import { RecipeView } from '@/components/recipe-view'
import { RecipeCard } from '@/components/recipe-card'
import { generateRecipeSuggestion } from '@/lib/ai-service'
import { getMeal } from '@/lib/meals'
import type { MealId, Recipe, RecipeSuggestion } from '@/lib/types'

interface HomeScreenProps {
  isFavorite: (title: string) => boolean
  onToggleFavorite: (recipe: Recipe) => void
  onAddHistory: (recipe: Recipe, meal: MealId, ingredients: string[]) => void
}

type Step = 'input' | 'loading' | 'result'

export function HomeScreen({ isFavorite, onToggleFavorite, onAddHistory }: HomeScreenProps) {
  const [step, setStep] = useState<Step>('input')
  const [meal, setMeal] = useState<MealId | null>(null)
  const [ingredients, setIngredients] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<RecipeSuggestion | null>(null)
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const scrollTop = () =>
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const handleSuggest = async () => {
    if (!meal) {
      setError('Lütfen önce bir öğün seç.')
      return
    }
    if (ingredients.length === 0) {
      setError('Lütfen en az bir malzeme ekle.')
      return
    }
    setError(null)
    setStep('loading')
    try {
      const result = await generateRecipeSuggestion(meal, ingredients)
      setSuggestion(result)
      setActiveRecipe(result.main)
      onAddHistory(result.main, meal, ingredients)
      setStep('result')
    } catch {
      setError('Bir şeyler ters gitti. Lütfen tekrar dene.')
      setStep('input')
    }
  }

  const reset = () => {
    setStep('input')
    setSuggestion(null)
    setActiveRecipe(null)
    setError(null)
    scrollTop()
  }

  const openRecipe = (recipe: Recipe) => {
    setActiveRecipe(recipe)
    scrollTop()
  }

  if (step === 'loading') {
    return <LoadingRecipes />
  }

  if (step === 'result' && suggestion && activeRecipe) {
    const others = [suggestion.main, ...suggestion.alternatives].filter(
      (r) => r.id !== activeRecipe.id,
    )
    const fav = isFavorite(activeRecipe.title)
    return (
      <div ref={topRef} className="flex flex-col gap-6">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 self-start text-sm font-semibold text-muted-foreground active:opacity-70"
        >
          <ChevronLeft className="h-4 w-4" />
          Yeni tarif oluştur
        </button>

        {suggestion.note && (
          <div className="flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>{suggestion.note}</p>
          </div>
        )}

        <RecipeView
          recipe={activeRecipe}
          isFavorite={fav}
          onToggleFavorite={() => onToggleFavorite(activeRecipe)}
        />

        {others.length > 0 && (
          <section className="flex flex-col gap-3">
            <div>
              <h3 className="font-display text-lg font-bold">Başka ne yapabilirim?</h3>
              <p className="text-sm text-muted-foreground">
                Aynı malzemelerle deneyebileceğin diğer tarifler
              </p>
            </div>
            {others.map((r) => (
              <RecipeCard key={r.id} recipe={r} onClick={() => openRecipe(r)} />
            ))}
          </section>
        )}

        <button
          type="button"
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 font-display font-bold active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          Baştan Başla
        </button>
      </div>
    )
  }

  const selectedMeal = meal ? getMeal(meal) : null

  return (
    <div ref={topRef} className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-extrabold">Önce öğününü seç</h2>
        <p className="text-sm text-muted-foreground">Sana en uygun tarifi bulalım</p>
      </div>

      <MealSelector
        selected={meal}
        onSelect={(id) => {
          setMeal(id)
          setError(null)
        }}
      />

      {meal && (
        <div className="flex animate-in fade-in slide-in-from-bottom-3 flex-col gap-4 duration-300">
          <div>
            <h2 className="font-display text-xl font-extrabold">
              {selectedMeal?.emoji} {selectedMeal?.label} için ne var?
            </h2>
            <p className="text-sm text-muted-foreground">
              Elindeki malzemeleri ekle, gerisini bize bırak
            </p>
          </div>

          <IngredientInput ingredients={ingredients} onChange={setIngredients} />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSuggest}
        disabled={!meal}
        className="mt-2 flex items-center justify-center gap-2 rounded-3xl bg-primary py-4 font-display text-lg font-extrabold text-primary-foreground shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
      >
        <Sparkles className="h-5 w-5" />
        Bana Yemek Öner
      </button>
    </div>
  )
}
