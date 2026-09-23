import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Receipt, Eye } from 'lucide-react';
import * as salesApi from '../api/sales';
import { notify } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Table, THead, Th, TBody, Tr, Td } from '../components/ui/Table';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import CreateSaleModal from '../components/sales/CreateSaleModal';
import { formatFullCurrency, formatDateTime } from '../utils/format';

const statusTone = { COMPLETED: 'success', PENDING: 'amber', CANCELLED: 'danger', REFUNDED: 'neutral' };
const paymentTone = { PAID: 'success', UNPAID: 'danger', PARTIAL: 'amber' };

const SalesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sales, setSales] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 15 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === '1');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    salesApi.getSales({ page, limit: 15 }).then((res) => { setSales(res.data); setMeta(res.meta); }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const closeModal = () => { setModalOpen(false); setSearchParams({}); };

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await salesApi.createSale(payload);
      notify.success('Sale completed successfully.');
      closeModal();
      load();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Sales</h1>
          <p className="text-sm text-ink-muted">All sales transactions across your business.</p>
        </div>
        <Button variant="accent" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Create Sale</Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        {error ? <ErrorState onRetry={load} /> : (
          <Table>
            <THead>
              <Th>Invoice</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Amount</Th>
              <Th>Payment</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="text-right">Actions</Th>
            </THead>
            <TBody>
              {loading && Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={8}><SkeletonRow cols={8} /></td></tr>)}
              {!loading && sales.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-mono text-xs font-medium">{s.invoiceNo}</Td>
                  <Td>{s.customer?.name || 'Walk-in'}</Td>
                  <Td className="text-ink-muted">{s.items.length} item{s.items.length !== 1 ? 's' : ''}</Td>
                  <Td className="font-semibold">{formatFullCurrency(s.total)}</Td>
                  <Td><Badge tone={paymentTone[s.paymentStatus]}>{s.paymentStatus}</Badge></Td>
                  <Td><Badge tone={statusTone[s.status]}>{s.status}</Badge></Td>
                  <Td className="text-ink-faint">{formatDateTime(s.createdAt)}</Td>
                  <Td className="text-right">
                    <Link to={`/sales/${s.id}`} className="inline-flex rounded-lg p-2 text-ink-faint hover:bg-surface-2 hover:text-ink"><Eye className="h-4 w-4" /></Link>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
        {!loading && !error && sales.length === 0 && (
          <EmptyState icon={Receipt} title="No sales yet" description="Once you start recording sales, they'll show up here." actionLabel="Create sale" onAction={() => setModalOpen(true)} />
        )}
        {!loading && !error && sales.length > 0 && <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onChange={setPage} />}
      </div>

      <CreateSaleModal open={modalOpen} onClose={closeModal} onSubmit={handleCreate} submitting={submitting} />
    </div>
  );
};

export default SalesPage;
