import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-ink-faint">
      <Compass className="h-7 w-7" />
    </div>
    <h1 className="font-display text-2xl font-semibold text-ink">Page not found</h1>
    <p className="mt-2 max-w-sm text-sm text-ink-muted">The page you're looking for doesn't exist or may have been moved.</p>
    <Link to="/" className="mt-6">
      <Button variant="accent">Back to dashboard</Button>
    </Link>
  </div>
);

export default NotFoundPage;
