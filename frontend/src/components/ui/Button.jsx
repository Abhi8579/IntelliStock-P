import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-ink text-canvas hover:bg-ink/90 dark:bg-amber-500 dark:text-[#1a1206] dark:hover:bg-amber-400',
  accent: 'bg-amber-500 text-[#1a1206] hover:bg-amber-400 shadow-glow',
  secondary: 'bg-surface-2 text-ink border border-border hover:bg-border/40',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface-2',
  danger: 'bg-danger text-white hover:bg-danger/90',
  outline: 'border border-border text-ink hover:bg-surface-2',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9',
};

const Button = forwardRef(({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-ring whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
export default Button;
