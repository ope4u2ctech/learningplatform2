import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return <input type={type} className={cn('flex h-12 w-full rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />
}
