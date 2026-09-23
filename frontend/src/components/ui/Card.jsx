import { cn } from '../../utils/cn';

const Card = ({ className, children, ...props }) => (
  <div className={cn('rounded-2xl border border-border bg-surface shadow-soft', className)} {...props}>
    {children}
  </div>
);

export default Card;
