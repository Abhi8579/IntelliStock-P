import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Truck, Eye, PackageCheck, XCircle } from 'lucide-react';
import * as purchasesApi from '../api/purchases';
import { notify } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Table, THead, Th, TBody, Tr, Td } from '../components/ui/Table';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CreatePurchaseModal from '../components/purchases/CreatePurchaseModal';
import { formatFullCurrency, formatDate } from '../utils/format';

const statusTone = { RECEIVED: 'success', PENDING: 'amber', ORDERED: 'teal', CANCELLED: 'danger' };

const PurchasesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [purchases, setPurchases] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 15 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === '1');
  const [submitting, setSubmitting] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(false);
    purchasesApi.getPurchases({ page, limit: 15 }).then((res) => { setPurchases(res.data); setMeta(res.meta); }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const closeModal = () => { setModalOpen(false); setSearchParams({}); };

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await purchasesApi.createPurchase(payload);
      notify.success('Purchase order created successfully.');
      closeModal(); load();
    } catch (err) { notify.error(err.message); } finally { setSubmitting(false); }
  };

  const handleReceive = async () => {
    try {
      await purchasesApi.receivePurchase(receiveTarget.id);
      notify.success('Purchase received. Stock updated.');
      setReceiveTarget(null); load();
    } catch (err) { notify.error(err.message); }
  };

  const handleCancel = async () => {
    try {
      await purchasesApi.cancelPurchase(cancelTarget.id);
      notify.success('Purchase order cancelled.');
      setCancelTarget(null); load();
    } catch (err) { notify.error(err.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Purchases</h1>
          <p className="text-sm text-ink-muted">Purchase orders placed with your suppliers.</p>
        </div>
        <Button variant="accent" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Create Purchase Order</Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        {error ? <ErrorState onRetry={load} /> : (
          <Table>
            <THead>
              <Th>Order No.</Th><Th>Supplier</Th><Th>Items</Th><Th>Total</Th><Th>Status</Th><Th>Expected</Th><Th className="text-right">Actions</Th>
            </THead>
            <TBody>
              {loading && Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={7}><SkeletonRow cols={7} /></td></tr>)}
              {!loading && purchases.map((p) => (
                <Tr key={p.id}>
                  <Td className="font-mono text-xs font-medium">{p.purchaseNo}</Td>
                  <Td>{p.supplier?.name}</Td>
                  <Td className="text-ink-muted">{p.items.length} item{p.items.length !== 1 ? 's' : ''}</Td>
                  <Td className="font-semibold">{formatFullCurrency(p.total)}</Td>
                  <Td><Badge tone={statusTone[p.status]}>{p.status}</Badge></Td>
                  <Td className="text-ink-faint">{formatDate(p.expectedDate)}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/purchases/${p.id}`} className="rounded-lg p-2 text-ink-faint hover:bg-surface-2 hover:text-ink"><Eye className="h-4 w-4" /></Link>
                      {(p.status === 'PENDING' || p.status === 'ORDERED') && (
                        <>
                          <button onClick={() => setReceiveTarget(p)} className="rounded-lg p-2 text-ink-faint hover:bg-success-100 hover:text-success" title="Mark received"><PackageCheck className="h-4 w-4" /></button>
                          <button onClick={() => setCancelTarget(p)} className="rounded-lg p-2 text-ink-faint hover:bg-danger-100 hover:text-danger" title="Cancel"><XCircle className="h-4 w-4" /></button>
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
        {!loading && !error && purchases.length === 0 && (
          <EmptyState icon={Truck} title="No purchase orders yet" description="Create a purchase order to restock your inventory." actionLabel="Create purchase order" onAction={() => setModalOpen(true)} />
        )}
        {!loading && !error && purchases.length > 0 && <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onChange={setPage} />}
      </div>

      <CreatePurchaseModal open={modalOpen} onClose={closeModal} onSubmit={handleCreate} submitting={submitting} />
      <ConfirmDialog open={!!receiveTarget} onClose={() => setReceiveTarget(null)} onConfirm={handleReceive} tone="amber" title="Mark this order as received?" description="Stock levels will be increased for every item in this order." confirmLabel="Mark received" />
      <ConfirmDialog open={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel} title="Cancel this purchase order?" description="This purchase order will be cancelled and cannot be received." confirmLabel="Cancel order" />
    </div>
  );
};

export default PurchasesPage;
