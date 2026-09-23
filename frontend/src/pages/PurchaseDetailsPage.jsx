import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, PackageCheck, XCircle } from 'lucide-react';
import * as purchasesApi from '../api/purchases';
import { notify } from '../context/ToastContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ErrorState from '../components/ui/ErrorState';
import { Table, THead, Th, TBody, Tr, Td } from '../components/ui/Table';
import { formatFullCurrency, formatDate, formatDateTime } from '../utils/format';

const statusTone = { RECEIVED: 'success', PENDING: 'amber', ORDERED: 'teal', CANCELLED: 'danger' };

const PurchaseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    purchasesApi.getPurchase(id).then((res) => setPurchase(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-surface-2" />;
  if (error || !purchase) return <ErrorState message="This purchase order could not be found." onRetry={load} />;

  const canAct = purchase.status === 'PENDING' || purchase.status === 'ORDERED';

  const handleReceive = async () => {
    try { await purchasesApi.receivePurchase(purchase.id); notify.success('Purchase received. Stock updated.'); setReceiveOpen(false); load(); }
    catch (err) { notify.error(err.message); }
  };
  const handleCancel = async () => {
    try { await purchasesApi.cancelPurchase(purchase.id); notify.success('Purchase order cancelled.'); setCancelOpen(false); load(); }
    catch (err) { notify.error(err.message); }
  };

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/purchases')} className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to purchases
      </button>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"><Truck className="h-6 w-6" /></div>
            <div>
              <h1 className="font-display text-lg font-semibold text-ink">{purchase.purchaseNo}</h1>
              <p className="text-sm text-ink-muted">From {purchase.supplier?.name} · Placed by {purchase.user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone[purchase.status]}>{purchase.status}</Badge>
            {canAct && (
              <>
                <Button size="sm" variant="secondary" onClick={() => setReceiveOpen(true)}><PackageCheck className="h-4 w-4" /> Mark Received</Button>
                <Button size="sm" variant="danger" onClick={() => setCancelOpen(true)}><XCircle className="h-4 w-4" /> Cancel</Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
          <div><p className="text-xs text-ink-faint">Expected date</p><p className="text-sm font-medium text-ink">{formatDate(purchase.expectedDate)}</p></div>
          <div><p className="text-xs text-ink-faint">Received date</p><p className="text-sm font-medium text-ink">{purchase.receivedDate ? formatDateTime(purchase.receivedDate) : '—'}</p></div>
          <div><p className="text-xs text-ink-faint">Created</p><p className="text-sm font-medium text-ink">{formatDateTime(purchase.createdAt)}</p></div>
          <div><p className="text-xs text-ink-faint">Total</p><p className="text-sm font-semibold text-ink">{formatFullCurrency(purchase.total)}</p></div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        <div className="border-b border-border px-5 py-4"><h3 className="font-display text-sm font-semibold text-ink">Items ordered</h3></div>
        <Table>
          <THead><Th>Product</Th><Th>Quantity</Th><Th>Unit Cost</Th><Th>Total</Th></THead>
          <TBody>
            {purchase.items.map((item) => (
              <Tr key={item.id}>
                <Td className="font-medium">{item.product?.name}</Td>
                <Td>{item.quantity}</Td>
                <Td>{formatFullCurrency(item.cost)}</Td>
                <Td className="font-semibold">{formatFullCurrency(item.total)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>

      <ConfirmDialog open={receiveOpen} onClose={() => setReceiveOpen(false)} onConfirm={handleReceive} tone="amber" title="Mark this order as received?" description="Stock levels will be increased for every item in this order." confirmLabel="Mark received" />
      <ConfirmDialog open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleCancel} title="Cancel this purchase order?" description="This cannot be undone." confirmLabel="Cancel order" />
    </div>
  );
};

export default PurchaseDetailsPage;
