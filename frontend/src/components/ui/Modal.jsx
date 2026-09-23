import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../utils/cn';

const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

const Modal = ({ open, onClose, title, description, children, size = 'md', footer }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn('relative z-10 w-full rounded-2xl border border-border bg-surface shadow-soft-lg max-h-[88vh] flex flex-col', sizeMap[size])}
          >
            <div className="flex items-start justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
                {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-surface-2 hover:text-ink focus-ring">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
