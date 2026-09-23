import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ className, label, error, icon: Icon, hint, ...props }, ref) => (
  <label className="block">
    {label && <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>}
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />}
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-lg border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus-ring',
          Icon && 'pl-9',
          error ? 'border-danger' : 'border-border focus:border-ink-faint',
          className
        )}
        {...props}
      />
    </div>
    {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    {hint && !error && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
  </label>
));
Input.displayName = 'Input';
export default Input;
