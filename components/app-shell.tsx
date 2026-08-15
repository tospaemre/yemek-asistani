'use client'

import { useCallback, useState } from 'react'
import { ChefHat } from 'lucide-react'
import { BottomNav, type Tab } from '@/components/bottom-nav'
import { HomeScreen } from '@/components/screens/home-screen'
import { SearchScreen } from '@/components/screens/search-screen'
import { FavoritesScreen } from '@/components/screens/favorites-screen'
import { HistoryScreen } from '@/components/screens/history-screen'
import { SettingsScreen } from '@/components/screens/settings-screen'
import { useFavorites, useHistory } from '@/lib/storage'
import type { MealId, Recipe } from '@/lib/types'

export function AppShell() {
  const [tab, setTab] = useState<Tab>('home')
  const { favorites, isFavorite, toggleFavorite, persist } = useFavorites()
  const { history, addHistory, clearHistory } = useHistory()

  const handleAddHistory = useCallback(
    (recipe: Recipe, meal: MealId, ingredients: string[]) => {
      addHistory({
        id: `h-${Date.now()}`,
        recipe,
        meal,
        ingredients,
        createdAt: Date.now(),
      })
    },
    [addHistory],
  )

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
          <ChefHat className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <h1 className="font-display text-lg font-extrabold">Ne Pişirsem?</h1>
          <p className="text-xs text-muted-foreground">Elindekilerle ne pişirebilirsin?</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-5">
        {tab === 'home' && (
          <HomeScreen
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onAddHistory={handleAddHistory}
          />
        )}
        {tab === 'search' && (
          <SearchScreen isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
        )}
        {tab === 'favorites' && (
          <FavoritesScreen
            favorites={favorites}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onGoHome={() => setTab('home')}
          />
        )}
        {tab === 'history' && (
          <HistoryScreen
            history={history}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onClear={clearHistory}
            onGoHome={() => setTab('home')}
          />
        )}
        {tab === 'settings' && (
          <SettingsScreen
            favCount={favorites.length}
            historyCount={history.length}
            onClearHistory={clearHistory}
            onClearFavorites={() => persist([])}
          />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} favCount={favorites.length} />
    </div>
  )
}
