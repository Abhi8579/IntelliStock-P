import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const Select = forwardRef(({ className, label, error, children, ...props }, ref) => (
  <label className="block">
    {label && <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>}
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-10 w-full appearance-none rounded-lg border bg-surface px-3 pr-9 text-sm text-ink transition-colors focus-ring',
          error ? 'border-danger' : 'border-border focus:border-ink-faint',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
    </div>
    {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
  </label>
));
Select.displayName = 'Select';
export default Select;
