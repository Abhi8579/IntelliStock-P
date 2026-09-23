import { cn } from '../../utils/cn';

export const Table = ({ children, className }) => (
  <div className="overflow-x-auto">
    <table className={cn('w-full text-left text-sm', className)}>{children}</table>
  </div>
);

export const THead = ({ children }) => (
  <thead>
    <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">{children}</tr>
  </thead>
);

export const Th = ({ children, className }) => (
  <th className={cn('whitespace-nowrap px-4 py-3 font-medium', className)}>{children}</th>
);

export const TBody = ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>;

export const Tr = ({ children, className, ...props }) => (
  <tr className={cn('transition-colors hover:bg-surface-2/60', className)} {...props}>{children}</tr>
);

export const Td = ({ children, className }) => (
  <td className={cn('whitespace-nowrap px-4 py-3.5 text-ink', className)}>{children}</td>
);
