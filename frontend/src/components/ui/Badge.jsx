import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/12 text-primary dark:text-brand-cyan-fg',
        success: 'bg-success/15 text-success-fg',
        warning: 'bg-amber-400/15 text-warning-fg',
        danger: 'bg-error/15 text-error-fg',
        outline: 'border border-border text-muted-foreground',
        glass: 'glass text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
