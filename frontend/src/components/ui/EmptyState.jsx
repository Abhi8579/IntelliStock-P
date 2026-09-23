import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction, secondaryLabel, onSecondary }) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-faint">
        <Icon className="h-6 w-6" />
      </div>
    )}
    <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>}
    {(actionLabel || secondaryLabel) && (
      <div className="mt-5 flex gap-2">
        {secondaryLabel && <Button variant="secondary" size="sm" onClick={onSecondary}>{secondaryLabel}</Button>}
        {actionLabel && <Button variant="accent" size="sm" onClick={onAction}>{actionLabel}</Button>}
      </div>
    )}
  </div>
);

export default EmptyState;
