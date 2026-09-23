import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ page, totalPages, onChange, total, limit }) => {
  if (!totalPages || totalPages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-xs text-ink-faint">Showing <span className="font-medium text-ink-muted">{start}-{end}</span> of <span className="font-medium text-ink-muted">{total}</span></p>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2 text-xs text-ink-muted">Page {page} of {totalPages}</span>
        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
