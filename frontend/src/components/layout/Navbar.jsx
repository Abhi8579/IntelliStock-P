import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, Plus, LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { initials } from '../../utils/format';
import * as notificationsApi from '../../api/notifications';
import NotificationPanel from './NotificationPanel';
import GlobalSearchModal from './GlobalSearchModal';
import QuickActionMenu from './QuickActionMenu';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = () => notificationsApi.getNotifications().then((res) => setUnreadCount(res.meta?.unreadCount || 0)).catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass px-4 md:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-2 text-ink-muted hover:bg-surface-2 md:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={() => setSearchOpen(true)}
        className="flex h-10 w-full max-w-sm items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 text-sm text-ink-faint transition-colors hover:border-ink-faint/50 focus-ring"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search products, customers, orders…</span>
        <span className="sm:hidden">Search…</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-faint sm:flex">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="relative">
          <button onClick={() => setQuickOpen((v) => !v)} className="hidden h-9 items-center gap-1.5 rounded-lg bg-amber-500 px-3 text-sm font-medium text-[#1a1206] shadow-glow transition-transform active:scale-95 sm:flex">
            <Plus className="h-4 w-4" /> Quick Add
          </button>
          <QuickActionMenu open={quickOpen} onClose={() => setQuickOpen(false)} />
        </div>

        <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink focus-ring">
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <div className="relative">
          <button onClick={() => setNotifOpen((v) => !v)} className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink focus-ring">
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-danger ring-2 ring-surface" />
            )}
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} onCountChange={setUnreadCount} />
        </div>

        <div className="relative ml-1">
          <button onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-surface-2 focus-ring">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/15 text-xs font-semibold text-teal-700 dark:text-teal-300">
              {initials(user?.name)}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold leading-tight text-ink">{user?.name}</p>
              <p className="text-[10px] capitalize leading-tight text-ink-faint">{user?.role?.toLowerCase()}</p>
            </div>
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-soft-lg"
                >
                  <div className="border-b border-border px-3.5 py-3">
                    <p className="text-sm font-medium text-ink">{user?.name}</p>
                    <p className="truncate text-xs text-ink-faint">{user?.email}</p>
                  </div>
                  <button onClick={() => { setUserMenuOpen(false); navigate('/settings'); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-muted hover:bg-surface-2 hover:text-ink">
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); navigate('/settings'); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-muted hover:bg-surface-2 hover:text-ink">
                    <SettingsIcon className="h-4 w-4" /> Settings
                  </button>
                  <button onClick={() => { logout(); navigate('/login'); }} className="flex w-full items-center gap-2.5 border-t border-border px-3.5 py-2.5 text-sm text-danger hover:bg-danger-100">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Navbar;
