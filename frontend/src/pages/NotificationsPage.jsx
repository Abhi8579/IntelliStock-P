import { useEffect, useState } from 'react';
import { AlertTriangle, PackageX, ShoppingBag, TruckIcon, ClipboardEdit, Info, CheckCheck, Bell, KeyRound } from 'lucide-react';
import * as notificationsApi from '../api/notifications';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import { formatDateTime } from '../utils/format';
import { cn } from '../utils/cn';

const ICONS = {
  LOW_STOCK: { icon: AlertTriangle, tone: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' },
  OUT_OF_STOCK: { icon: PackageX, tone: 'text-danger bg-danger-100' },
  NEW_SALE: { icon: ShoppingBag, tone: 'text-teal-600 bg-teal-50 dark:bg-teal-900/30' },
  PURCHASE_RECEIVED: { icon: TruckIcon, tone: 'text-teal-600 bg-teal-50 dark:bg-teal-900/30' },
  LARGE_ORDER: { icon: ShoppingBag, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  STOCK_ADJUSTMENT: { icon: ClipboardEdit, tone: 'text-ink-muted bg-surface-2' },
  PASSWORD_RESET: { icon: KeyRound, tone: 'text-danger bg-danger-100' },
  SYSTEM: { icon: Info, tone: 'text-ink-muted bg-surface-2' },
};

const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    notificationsApi.getNotifications().then((res) => setItems(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id) => { await notificationsApi.markAsRead(id); load(); };
  const markAllRead = async () => { await notificationsApi.markAllAsRead(); load(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Notifications</h1>
          <p className="text-sm text-ink-muted">Stay on top of stock levels, sales, and system events.</p>
        </div>
        <Button variant="secondary" onClick={markAllRead}><CheckCheck className="h-4 w-4" /> Mark all read</Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        {error && <ErrorState onRetry={load} />}
        {!error && loading && <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-2" />)}</div>}
        {!error && !loading && items.length === 0 && <EmptyState icon={Bell} title="No notifications" description="You're all caught up. New alerts will appear here." />}
        {!error && !loading && items.map((n) => {
          const cfg = ICONS[n.type] || ICONS.SYSTEM;
          const Icon = cfg.icon;
          return (
            <button key={n.id} onClick={() => markRead(n.id)} className={cn('flex w-full items-start gap-3 border-b border-border px-5 py-4 text-left transition-colors last:border-0 hover:bg-surface-2', !n.isRead && 'bg-amber-50/40 dark:bg-amber-900/10')}>
              <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', cfg.tone)}><Icon className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{n.title}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{n.message}</p>
                <p className="mt-1.5 text-xs text-ink-faint">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;
