import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users2, Mail, Phone, MapPin } from 'lucide-react';
import * as suppliersApi from '../api/suppliers';
import Badge from '../components/ui/Badge';
import ErrorState from '../components/ui/ErrorState';
import { Table, THead, Th, TBody, Tr, Td } from '../components/ui/Table';
import { formatFullCurrency, formatDate } from '../utils/format';

const statusTone = { RECEIVED: 'success', PENDING: 'amber', ORDERED: 'teal', CANCELLED: 'danger' };

const SupplierDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    suppliersApi.getSupplier(id).then((res) => setSupplier(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-surface-2" />;
  if (error || !supplier) return <ErrorState message="This supplier could not be found." onRetry={load} />;

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/suppliers')} className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to suppliers
      </button>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-faint"><Users2 className="h-6 w-6" /></div>
          <div>
            <h1 className="font-display text-lg font-semibold text-ink">{supplier.name}</h1>
            <p className="text-sm text-ink-muted">{supplier.company}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-faint">
              {supplier.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {supplier.email}</span>}
              {supplier.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {supplier.phone}</span>}
              {supplier.city && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {supplier.city}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><p className="font-display text-xl font-semibold text-ink">{formatFullCurrency(supplier.totalPurchaseValue)}</p><p className="text-xs text-ink-muted">Total purchases</p></div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><p className="font-display text-xl font-semibold text-ink">{supplier.pendingPurchases}</p><p className="text-xs text-ink-muted">Pending purchases</p></div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><p className="font-display text-xl font-semibold text-ink">{supplier.products.length}</p><p className="text-xs text-ink-muted">Products supplied</p></div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><p className="font-display text-xl font-semibold text-ink">{supplier.purchases.length}</p><p className="text-xs text-ink-muted">Total orders</p></div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        <div className="border-b border-border px-5 py-4"><h3 className="font-display text-sm font-semibold text-ink">Purchase history</h3></div>
        <Table>
          <THead><Th>Order No.</Th><Th>Items</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th></THead>
          <TBody>
            {supplier.purchases.slice(0, 20).map((p) => (
              <Tr key={p.id}>
                <Td className="font-mono text-xs">{p.purchaseNo}</Td>
                <Td className="text-ink-muted">{p.items.length}</Td>
                <Td className="font-semibold">{formatFullCurrency(p.total)}</Td>
                <Td><Badge tone={statusTone[p.status]}>{p.status}</Badge></Td>
                <Td className="text-ink-faint">{formatDate(p.createdAt)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
        {supplier.purchases.length === 0 && <p className="py-8 text-center text-sm text-ink-faint">No purchase orders with this supplier yet.</p>}
      </div>
    </div>
  );
};

export default SupplierDetailsPage;
