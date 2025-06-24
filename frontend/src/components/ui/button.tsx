
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-md border border-white/20 dark:border-white/10 hover:scale-105 hover:shadow-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-primary-foreground hover:from-blue-700/90 hover:to-purple-700/90 shadow-lg",
        destructive:
          "bg-destructive/80 text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 hover:text-accent-foreground backdrop-blur-md",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary/90",
        ghost: "hover:bg-white/20 dark:hover:bg-white/10 hover:text-accent-foreground backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
