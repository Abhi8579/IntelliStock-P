import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Truck, Users, Users2 } from 'lucide-react';

const ACTIONS = [
  { label: 'New Product', to: '/products?new=1', icon: Package },
  { label: 'New Sale', to: '/sales?new=1', icon: ShoppingCart },
  { label: 'New Purchase Order', to: '/purchases?new=1', icon: Truck },
  { label: 'New Customer', to: '/customers?new=1', icon: Users },
  { label: 'New Supplier', to: '/suppliers?new=1', icon: Users2 },
];

const QuickActionMenu = ({ open, onClose }) => {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-soft-lg"
          >
            {ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => { onClose(); navigate(a.to); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-muted hover:bg-surface-2 hover:text-ink"
              >
                <a.icon className="h-4 w-4" /> {a.label}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickActionMenu;
