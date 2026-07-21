import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-glow hover:shadow-glow-lg hover:brightness-110',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark shadow-card',
        outline: 'border border-border bg-transparent hover:bg-foreground/5 text-foreground',
        ghost: 'bg-transparent hover:bg-foreground/5 text-foreground',
        glass: 'glass text-foreground hover:bg-white/70 dark:hover:bg-white/10',
        destructive: 'bg-error text-white hover:brightness-110 shadow-card',
        link: 'text-primary underline-offset-4 hover:underline px-0',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        default: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

const Button = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = 'Button';

export { Button, buttonVariants };
