import { motion } from 'framer-motion';

const AppLoader = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0F14]">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center"
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 font-display text-xl font-bold text-[#1a1206] shadow-glow">
        IS
        <motion.span
          className="absolute inset-0 rounded-2xl border border-amber-400"
          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
      </div>
      <p className="mt-5 font-display text-lg font-semibold text-white">IntelliStock</p>
      <p className="mt-1 text-xs text-white/50">Initializing inventory intelligence…</p>

      <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-amber-500"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  </div>
);

export default AppLoader;
