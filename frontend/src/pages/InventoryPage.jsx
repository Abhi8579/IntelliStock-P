import { useEffect, useState } from 'react';
import { Boxes, SlidersHorizontal, ArrowUpDown, PackageSearch } from 'lucide-react';
import * as inventoryApi from '../api/inventory';
import { useAuth } from '../context/AuthContext';
import { notify } from '../context/ToastContext';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { Table, THead, Th, TBody, Tr, Td } from '../components/ui/Table';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import StockAdjustModal from '../components/products/StockAdjustModal';
import { cn } from '../utils/cn';
import { formatDateTime } from '../utils/format';

const TABS = [{ key: 'stock', label: 'Stock Overview' }, { key: 'log', label: 'Transaction Log' }];

const InventoryPage = () => {
  const { can } = useAuth();
  const [tab, setTab] = useState('stock');
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canManage = can('ADMIN', 'MANAGER');

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([inventoryApi.getInventory(), inventoryApi.getTransactions({ limit: 40 })])
      .then(([inv, txns]) => { setItems(inv.data); setTransactions(txns.data); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdjust = async (payload) => {
    setSubmitting(true);
    try {
      await inventoryApi.adjustStock(payload);
      notify.success('Stock adjusted successfully.');
      setAdjustTarget(null);
      load();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Inventory</h1>
        <p className="text-sm text-ink-muted">Track current stock and every movement across your warehouse.</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('rounded-md px-4 py-1.5 text-sm font-medium transition-colors', tab === t.key ? 'bg-surface text-ink shadow-soft' : 'text-ink-muted hover:text-ink')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stock' && (
        <div className="rounded-2xl border border-border bg-surface shadow-soft">
          <div className="border-b border-border p-4">
            <Input icon={PackageSearch} placeholder="Search by product name or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          </div>
          {error ? <ErrorState onRetry={load} /> : (
            <Table>
              <THead>
                <Th>Product</Th>
                <Th>Current Stock</Th>
                <Th>Minimum</Th>
                <Th>Maximum</Th>
                <Th>Health</Th>
                {canManage && <Th className="text-right">Actions</Th>}
              </THead>
              <TBody>
                {loading && Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={6}><SkeletonRow cols={6} /></td></tr>)}
                {!loading && filtered.map((p) => {
                  const pct = Math.min(100, (p.currentStock / (p.maxStock || 1)) * 100);
                  return (
                    <Tr key={p.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-ink-faint"><Boxes className="h-4 w-4" /></div>
                          <div>
                            <p className="font-medium text-ink">{p.name}</p>
                            <p className="font-mono text-xs text-ink-faint">{p.sku}</p>
                          </div>
                        </div>
                      </Td>
                      <Td className="font-semibold">{p.currentStock}</Td>
                      <Td className="text-ink-muted">{p.minStock}</Td>
                      <Td className="text-ink-muted">{p.maxStock}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
                            <div className={cn('h-full rounded-full', p.currentStock <= 0 ? 'bg-danger' : p.currentStock <= p.minStock ? 'bg-amber-500' : 'bg-success')} style={{ width: `${pct}%` }} />
                          </div>
                          {p.currentStock <= 0 ? <Badge tone="danger">Out</Badge> : p.currentStock <= p.minStock ? <Badge tone="amber">Low</Badge> : <Badge tone="success">Good</Badge>}
                        </div>
                      </Td>
                      {canManage && (
                        <Td className="text-right">
                          <button onClick={() => setAdjustTarget(p)} className="rounded-lg p-2 text-ink-faint hover:bg-surface-2 hover:text-ink"><SlidersHorizontal className="h-4 w-4" /></button>
                        </Td>
                      )}
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
          )}
          {!loading && !error && filtered.length === 0 && <EmptyState icon={PackageSearch} title="No matching products" description="Try a different search term." />}
        </div>
      )}

      {tab === 'log' && (
        <div className="rounded-2xl border border-border bg-surface shadow-soft">
          {error ? <ErrorState onRetry={load} /> : (
            <Table>
              <THead>
                <Th>Product</Th>
                <Th>Type</Th>
                <Th>Quantity</Th>
                <Th>Stock After</Th>
                <Th>Reference</Th>
                <Th>User</Th>
                <Th>Date</Th>
              </THead>
              <TBody>
                {loading && Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={7}><SkeletonRow cols={7} /></td></tr>)}
                {!loading && transactions.map((t) => (
                  <Tr key={t.id}>
                    <Td className="font-medium">{t.product?.name}</Td>
                    <Td><Badge tone={t.type === 'SALE' ? 'teal' : t.type === 'PURCHASE' ? 'success' : t.type === 'RETURN' ? 'amber' : 'neutral'}>{t.type}</Badge></Td>
                    <Td className={cn('font-mono', t.quantity < 0 ? 'text-danger' : 'text-success')}>{t.quantity > 0 ? `+${t.quantity}` : t.quantity}</Td>
                    <Td>{t.stockAfter}</Td>
                    <Td className="text-ink-faint">{t.reference || '—'}</Td>
                    <Td className="text-ink-muted">{t.user?.name || 'System'}</Td>
                    <Td className="text-ink-faint">{formatDateTime(t.createdAt)}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
          {!loading && !error && transactions.length === 0 && <EmptyState icon={ArrowUpDown} title="No transactions yet" description="Stock movements will appear here as sales, purchases, and adjustments happen." />}
        </div>
      )}

      <StockAdjustModal open={!!adjustTarget} product={adjustTarget} onClose={() => setAdjustTarget(null)} onSubmit={handleAdjust} submitting={submitting} />
    </div>
  );
};

export default InventoryPage;
