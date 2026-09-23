import { cn } from '../../utils/cn';

const Skeleton = ({ className }) => <div className={cn('skeleton rounded-lg', className)} />;

export const SkeletonRow = ({ cols = 5 }) => (
  <div className="flex items-center gap-4 px-4 py-3.5">
    {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-4 flex-1" />)}
  </div>
);

export const SkeletonCard = () => (
  <div className="rounded-2xl border border-border bg-surface p-5">
    <Skeleton className="h-4 w-24 mb-4" />
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export default Skeleton;
