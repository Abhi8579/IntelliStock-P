import { cn } from '../../utils/cn';

const tones = {
  neutral: 'bg-surface-2 text-ink-muted border-border',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50',
  teal: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800/50',
  success: 'bg-success-100 text-success-700 border-success/20 dark:bg-success/10 dark:text-success',
  danger: 'bg-danger-100 text-danger-700 border-danger/20 dark:bg-danger/10 dark:text-danger',
};

const Badge = ({ tone = 'neutral', className, children, dot }) => (
  <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', tones[tone], className)}>
    {dot && <span className={cn('h-1.5 w-1.5 rounded-full', tone === 'success' ? 'bg-success' : tone === 'danger' ? 'bg-danger' : tone === 'amber' ? 'bg-amber-500' : tone === 'teal' ? 'bg-teal-500' : 'bg-ink-faint')} />}
    {children}
  </span>
);

export default Badge;
