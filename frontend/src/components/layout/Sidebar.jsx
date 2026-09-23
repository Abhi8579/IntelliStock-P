import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Package, Boxes, ShoppingCart, Truck, Users2, Users,
  BarChart3, Bell, ScrollText, Settings, ChevronsLeft, ChevronsRight, UserCog,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import Tooltip from '../ui/Tooltip';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/sales', label: 'Sales', icon: ShoppingCart },
  { to: '/purchases', label: 'Purchases', icon: Truck },
  { to: '/suppliers', label: 'Suppliers', icon: Users2 },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/activity-logs', label: 'Activity Logs', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const ADMIN_NAV = { to: '/user-management', label: 'User Management', icon: UserCog };

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { can } = useAuth();
  const navItems = can('ADMIN') ? [...NAV.slice(0, -1), ADMIN_NAV, NAV[NAV.length - 1]] : NAV;

  const content = (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-4', collapsed && 'justify-center px-0')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-sm font-bold text-canvas dark:bg-amber-500 dark:text-[#1a1206]">
          IS
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold leading-tight text-ink">IntelliStock</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">Pro</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-4">
        {navItems.map((item) => {
          const linkEl = (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen?.(false)}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-ring',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-ink text-canvas dark:bg-amber-500 dark:text-[#1a1206]'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed && (
                    <motion.span layoutId="active-pill" className="absolute inset-0 rounded-lg bg-ink dark:bg-amber-500 -z-10" transition={{ duration: 0.2 }} />
                  )}
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
          return collapsed ? <Tooltip key={item.to} label={item.label}>{linkEl}</Tooltip> : linkEl;
        })}
      </nav>

      <div className="border-t border-border p-2.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('hidden md:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink focus-ring', collapsed && 'justify-center px-0')}
        >
          {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <><ChevronsLeft className="h-[18px] w-[18px]" /><span>Collapse</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={cn('sticky top-0 hidden h-screen shrink-0 border-r border-border bg-surface transition-all duration-200 md:flex', collapsed ? 'w-[76px]' : 'w-64')}>
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.2 }}
            className="relative z-10 h-full w-64 border-r border-border bg-surface"
          >
            {content}
          </motion.aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
