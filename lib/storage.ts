'use client'

import { useCallback, useEffect, useState } from 'react'
import type { HistoryEntry, Recipe } from './types'

const FAV_KEY = 'nps-favorites'
const HISTORY_KEY = 'nps-history'

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sessizce yoksay (ör. private mode kotası)
  }
}

/** Favori tarifleri cihazda kalıcı olarak yönetir. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setFavorites(read<Recipe[]>(FAV_KEY, []))
    setReady(true)
  }, [])

  const persist = useCallback((next: Recipe[]) => {
    setFavorites(next)
    write(FAV_KEY, next)
  }, [])

  const isFavorite = useCallback(
    (title: string) => favorites.some((f) => f.title === title),
    [favorites],
  )

  const toggleFavorite = useCallback(
    (recipe: Recipe) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.title === recipe.title)
        const next = exists
          ? prev.filter((f) => f.title !== recipe.title)
          : [{ ...recipe }, ...prev]
        write(FAV_KEY, next)
        return next
      })
    },
    [],
  )

  const removeFavorite = useCallback((title: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.title !== title)
      write(FAV_KEY, next)
      return next
    })
  }, [])

  return { favorites, isFavorite, toggleFavorite, removeFavorite, persist, ready }
}

/** Oluşturulan tarifleri geçmiş olarak cihazda saklar. */
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setHistory(read<HistoryEntry[]>(HISTORY_KEY, []))
    setReady(true)
  }, [])

  const addHistory = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 50)
      write(HISTORY_KEY, next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    write(HISTORY_KEY, [])
  }, [])

  return { history, addHistory, clearHistory, ready }
}
