'use client'

import { useEffect, useState } from 'react'
import { ChefHat } from 'lucide-react'

const MESSAGES = [
  'Malzemelerin analiz ediliyor...',
  'Senin için en uygun tarif hazırlanıyor...',
  'Alternatif yemekler bulunuyor...',
]

export function LoadingRecipes() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((p) => (p + 1) % MESSAGES.length)
    }, 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <span className="absolute inset-2 rounded-full bg-primary/10" />
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <ChefHat className="h-8 w-8 animate-pulse" />
        </span>
      </div>
      <p
        key={index}
        className="animate-in fade-in slide-in-from-bottom-2 text-balance font-display text-lg font-bold"
      >
        {MESSAGES[index]}
      </p>
      <p className="text-sm text-muted-foreground">Bu birkaç saniye sürebilir</p>
    </div>
  )
}
