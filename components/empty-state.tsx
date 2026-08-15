interface EmptyStateProps {
  emoji: string
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-4xl">
        {emoji}
      </span>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="max-w-xs text-balance text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
