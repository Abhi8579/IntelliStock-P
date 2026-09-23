import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Tooltip = ({ label, children, side = 'right' }) => {
  const [show, setShow] = useState(false);
  const pos = side === 'right' ? 'left-full ml-2 top-1/2 -translate-y-1/2' : 'top-full mt-2 left-1/2 -translate-x-1/2';

  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && label && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={cn('pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-canvas shadow-lg', pos)}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
