import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Package, Users2, Users, Receipt, Loader2 } from 'lucide-react';
import * as searchApi from '../../api/search';
import { formatFullCurrency } from '../../utils/format';

const GlobalSearchModal = ({ open, onClose }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) { setQ(''); setResults(null); }
  }, [open]);

  useEffect(() => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    const t = setTimeout(() => {
      searchApi.globalSearch(q).then((res) => setResults(res.data)).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const go = (path) => { onClose(); navigate(path); };

  const hasResults = results && (results.products.length || results.customers.length || results.suppliers.length || results.sales.length);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-soft-lg"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Search className="h-4 w-4 text-ink-faint" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products, customers, suppliers, invoices…"
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />}
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-ink-faint">Esc</kbd>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {!q && <p className="px-3 py-8 text-center text-sm text-ink-faint">Start typing to search across your business.</p>}
              {q && !loading && !hasResults && <p className="px-3 py-8 text-center text-sm text-ink-faint">No results for "{q}".</p>}

              {results?.products?.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Products</p>
                  {results.products.map((p) => (
                    <button key={p.id} onClick={() => go(`/products/${p.id}`)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
                      <Package className="h-4 w-4 text-ink-faint" />
                      <span className="flex-1 truncate text-sm text-ink">{p.name}</span>
                      <span className="font-mono text-xs text-ink-faint">{p.sku}</span>
                    </button>
                  ))}
                </div>
              )}
              {results?.customers?.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Customers</p>
                  {results.customers.map((c) => (
                    <button key={c.id} onClick={() => go(`/customers/${c.id}`)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
                      <Users className="h-4 w-4 text-ink-faint" />
                      <span className="flex-1 truncate text-sm text-ink">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {results?.suppliers?.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Suppliers</p>
                  {results.suppliers.map((s) => (
                    <button key={s.id} onClick={() => go(`/suppliers/${s.id}`)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
                      <Users2 className="h-4 w-4 text-ink-faint" />
                      <span className="flex-1 truncate text-sm text-ink">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {results?.sales?.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Sales</p>
                  {results.sales.map((s) => (
                    <button key={s.id} onClick={() => go(`/sales/${s.id}`)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
                      <Receipt className="h-4 w-4 text-ink-faint" />
                      <span className="flex-1 truncate text-sm text-ink">{s.invoiceNo}</span>
                      <span className="text-xs text-ink-faint">{formatFullCurrency(s.total)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearchModal;
