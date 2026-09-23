import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';
import * as salesApi from '../api/sales';
import Badge from '../components/ui/Badge';
import ErrorState from '../components/ui/ErrorState';
import { Table, THead, Th, TBody, Tr, Td } from '../components/ui/Table';
import { formatFullCurrency, formatDateTime } from '../utils/format';

const statusTone = { COMPLETED: 'success', PENDING: 'amber', CANCELLED: 'danger', REFUNDED: 'neutral' };

const SaleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    salesApi.getSale(id).then((res) => setSale(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-surface-2" />;
  if (error || !sale) return <ErrorState message="This sale could not be found." onRetry={load} />;

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/sales')} className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to sales
      </button>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"><Receipt className="h-6 w-6" /></div>
            <div>
              <h1 className="font-display text-lg font-semibold text-ink">{sale.invoiceNo}</h1>
              <p className="text-sm text-ink-muted">{formatDateTime(sale.createdAt)} · Served by {sale.user?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge tone={statusTone[sale.status]}>{sale.status}</Badge>
            <Badge tone={sale.paymentStatus === 'PAID' ? 'success' : sale.paymentStatus === 'UNPAID' ? 'danger' : 'amber'}>{sale.paymentStatus}</Badge>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
          <div><p className="text-xs text-ink-faint">Customer</p><p className="text-sm font-medium text-ink">{sale.customer?.name || 'Walk-in customer'}</p></div>
          <div><p className="text-xs text-ink-faint">Subtotal</p><p className="text-sm font-medium text-ink">{formatFullCurrency(sale.subtotal)}</p></div>
          <div><p className="text-xs text-ink-faint">Discount</p><p className="text-sm font-medium text-ink">{formatFullCurrency(sale.discount)}</p></div>
          <div><p className="text-xs text-ink-faint">Total</p><p className="text-sm font-semibold text-ink">{formatFullCurrency(sale.total)}</p></div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        <div className="border-b border-border px-5 py-4"><h3 className="font-display text-sm font-semibold text-ink">Items</h3></div>
        <Table>
          <THead><Th>Product</Th><Th>Quantity</Th><Th>Price</Th><Th>Total</Th></THead>
          <TBody>
            {sale.items.map((item) => (
              <Tr key={item.id}>
                <Td className="font-medium">{item.product?.name}</Td>
                <Td>{item.quantity}</Td>
                <Td>{formatFullCurrency(item.price)}</Td>
                <Td className="font-semibold">{formatFullCurrency(item.total)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
};

export default SaleDetailsPage;
