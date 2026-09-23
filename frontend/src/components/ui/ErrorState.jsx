import { AlertCircle } from 'lucide-react';
import Button from './Button';

const ErrorState = ({ message = "Something didn't load correctly.", onRetry }) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-100 text-danger">
      <AlertCircle className="h-6 w-6" />
    </div>
    <h3 className="font-display text-sm font-semibold text-ink">We hit a snag</h3>
    <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{message}</p>
    {onRetry && <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>Try again</Button>}
  </div>
);

export default ErrorState;
