'use client'

import { Home, Heart, Clock, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tab = 'home' | 'favorites' | 'history' | 'settings'

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'favorites', label: 'Favoriler', icon: Heart },
  { id: 'history', label: 'Geçmiş', icon: Clock },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
]

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
  favCount: number
}

export function BottomNav({ active, onChange, favCount }: BottomNavProps) {
  return (
    <nav
      aria-label="Ana menü"
      className="sticky bottom-0 z-20 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          const Icon = tab.icon
          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-2 transition-colors active:scale-95',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span className="relative">
                  <Icon
                    className={cn('h-6 w-6', isActive && 'fill-primary/15')}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                  {tab.id === 'favorites' && favCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                      {favCount}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-semibold">{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
