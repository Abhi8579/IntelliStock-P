import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const ChartCard = ({ title, subtitle, actions, children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={cn('rounded-2xl border border-border bg-surface p-5 shadow-soft', className)}
  >
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>}
      </div>
      {actions}
    </div>
    {children}
  </motion.div>
);

export default ChartCard;
