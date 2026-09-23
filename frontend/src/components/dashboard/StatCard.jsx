import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { cn } from '../../utils/cn';

const StatCard = ({ icon: Icon, label, value, change, changeLabel = 'vs last month', sparkline, tone = 'ink', index = 0 }) => {
  const positive = change >= 0;
  const toneClasses = {
    ink: 'bg-surface-2 text-ink',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    danger: 'bg-danger-100 text-danger',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg"
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        {sparkline && (
          <div className="h-8 w-16 opacity-70">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline}>
                <Line type="monotone" dataKey="v" stroke="currentColor" strokeWidth={1.75} dot={false} className={positive ? 'text-success' : 'text-danger'} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-xs text-ink-muted">{label}</p>
        {change !== undefined && (
          <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', positive ? 'text-success' : 'text-danger')}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
