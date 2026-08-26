import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-glow-blue-sm hover:shadow-glow-blue hover:scale-[1.01]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border border-white/10 bg-transparent text-foreground hover:bg-white/[0.05] hover:border-white/20',
        ghost:
          'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]',
        destructive:
          'bg-destructive/80 text-destructive-foreground hover:bg-destructive',
        'gradient-violet':
          'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-glow-violet-sm hover:shadow-glow-violet hover:scale-[1.01]',
        'gradient-emerald':
          'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-[1.01]',
        glass:
          'glass text-foreground hover:bg-white/[0.08] border border-white/[0.08]',
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto font-normal',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-10 px-5 py-2',
        lg: 'h-12 px-7 text-base',
        xl: 'h-14 px-9 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
