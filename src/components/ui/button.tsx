import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0', {
  variants: {
    variant: {
      default: 'bg-primary text-white hover:bg-primary/90 dark:text-background',
      outline: 'border border-border bg-card text-foreground hover:bg-muted',
      ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
      secondary: 'bg-primary/10 text-primary hover:bg-primary/15',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
    },
    size: { default: 'h-11 px-5', sm: 'h-9 px-3 text-xs', lg: 'h-12 px-7', icon: 'size-10' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

export function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Component = asChild ? Slot : 'button'
  return <Component className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
