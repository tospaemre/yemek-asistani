'use client'

import { Moon, Sun, Trash2, Heart, Clock } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

interface SettingsScreenProps {
  favCount: number
  historyCount: number
  onClearHistory: () => void
  onClearFavorites: () => void
}

export function SettingsScreen({
  favCount,
  historyCount,
  onClearHistory,
  onClearFavorites,
}: SettingsScreenProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold">Ayarlar</h2>
        <p className="text-sm text-muted-foreground">Uygulamayı kişiselleştir</p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </span>
            <div>
              <p className="font-display font-bold">Karanlık Mod</p>
              <p className="text-xs text-muted-foreground">
                {isDark ? 'Açık' : 'Kapalı'}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Karanlık modu değiştir"
            onClick={toggleTheme}
            className={cn(
              'relative h-7 w-12 shrink-0 rounded-full transition-colors',
              isDark ? 'bg-primary' : 'bg-input',
            )}
          >
            {/* left-1 şart: yoksa topuzun yatay çıpası tanımsız kalıyor ve
                tarayıcı onu düğmenin ortasına yerleştiriyor */}
            <span
              className={cn(
                'absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/10 transition-transform',
                isDark ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Heart className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display font-bold">Favoriler</p>
              <p className="text-xs text-muted-foreground">{favCount} tarif kayıtlı</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearFavorites}
            disabled={favCount === 0}
            className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-semibold text-destructive disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Sil
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display font-bold">Geçmiş</p>
              <p className="text-xs text-muted-foreground">{historyCount} kayıt</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearHistory}
            disabled={historyCount === 0}
            className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-semibold text-destructive disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Sil
          </button>
        </div>
      </section>
    </div>
  )
}
