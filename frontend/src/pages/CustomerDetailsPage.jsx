import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Phone, MapPin } from 'lucide-react';
import * as customersApi from '../api/customers';
import Badge from '../components/ui/Badge';
import ErrorState from '../components/ui/ErrorState';
import { Table, THead, Th, TBody, Tr, Td } from '../components/ui/Table';
import { formatFullCurrency, formatDate } from '../utils/format';

const statusTone = { COMPLETED: 'success', PENDING: 'amber', CANCELLED: 'danger', REFUNDED: 'neutral' };

const CustomerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    customersApi.getCustomer(id).then((res) => setCustomer(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-surface-2" />;
  if (error || !customer) return <ErrorState message="This customer could not be found." onRetry={load} />;

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </button>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-faint"><Users className="h-6 w-6" /></div>
          <div>
            <h1 className="font-display text-lg font-semibold text-ink">{customer.name}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-faint">
              {customer.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>}
              {customer.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {customer.phone}</span>}
              {customer.city && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {customer.city}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><p className="font-display text-xl font-semibold text-ink">{formatFullCurrency(customer.totalSpent)}</p><p className="text-xs text-ink-muted">Total spending</p></div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><p className="font-display text-xl font-semibold text-ink">{customer.orderCount}</p><p className="text-xs text-ink-muted">Number of orders</p></div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><p className="font-display text-xl font-semibold text-ink">{formatFullCurrency(customer.avgOrderValue)}</p><p className="text-xs text-ink-muted">Average order value</p></div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        <div className="border-b border-border px-5 py-4"><h3 className="font-display text-sm font-semibold text-ink">Purchase history</h3></div>
        <Table>
          <THead><Th>Invoice</Th><Th>Items</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th></THead>
          <TBody>
            {customer.sales.slice(0, 20).map((s) => (
              <Tr key={s.id}>
                <Td className="font-mono text-xs">{s.invoiceNo}</Td>
                <Td className="text-ink-muted">{s.items.length}</Td>
                <Td className="font-semibold">{formatFullCurrency(s.total)}</Td>
                <Td><Badge tone={statusTone[s.status]}>{s.status}</Badge></Td>
                <Td className="text-ink-faint">{formatDate(s.createdAt)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
        {customer.sales.length === 0 && <p className="py-8 text-center text-sm text-ink-faint">No purchases from this customer yet.</p>}
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
