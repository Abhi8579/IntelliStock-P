import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, PackageX, ShoppingBag, TruckIcon, ClipboardEdit, Info, CheckCheck, KeyRound } from 'lucide-react';
import * as notificationsApi from '../../api/notifications';
import { formatRelativeTime } from '../../utils/format';
import { cn } from '../../utils/cn';

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

const NotificationPanel = ({ open, onClose, onCountChange }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationsApi.getNotifications()
      .then((res) => { setItems(res.data); onCountChange?.(res.meta?.unreadCount || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (open) load(); }, [open]);

  const markAllRead = async () => {
    await notificationsApi.markAllAsRead();
    load();
  };

  const markRead = async (id) => {
    await notificationsApi.markAsRead(id);
    load();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-20 mt-2 w-[22rem] overflow-hidden rounded-xl border border-border bg-surface shadow-soft-lg"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            </div>
            <div className="max-h-[26rem] overflow-y-auto">
              {loading && <div className="p-4 text-center text-xs text-ink-faint">Loading…</div>}
              {!loading && items.length === 0 && <div className="p-8 text-center text-sm text-ink-faint">You're all caught up.</div>}
              {!loading && items.map((n) => {
                const cfg = ICONS[n.type] || ICONS.SYSTEM;
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn('flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface-2', !n.isRead && 'bg-amber-50/40 dark:bg-amber-900/10')}
                  >
                    <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cfg.tone)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{n.message}</p>
                      <p className="mt-1 text-[10px] text-ink-faint">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
