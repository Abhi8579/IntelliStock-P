import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Users } from 'lucide-react';
import * as customersApi from '../api/customers';
import { useAuth } from '../context/AuthContext';
import { notify } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { Table, THead, Th, TBody, Tr, Td } from '../components/ui/Table';
import { SkeletonRow } from '../components/ui/Skeleton';
import { formatFullCurrency, formatDate } from '../utils/format';

const emptyForm = { name: '', email: '', phone: '', address: '', city: '', status: 'ACTIVE' };

const CustomerForm = ({ initial, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(initial || emptyForm);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full name" value={form.name} onChange={set('name')} required />
        <Input label="Email" type="email" value={form.email || ''} onChange={set('email')} />
        <Input label="Phone" value={form.phone || ''} onChange={set('phone')} />
        <Input label="City" value={form.city || ''} onChange={set('city')} />
      </div>
      <Input label="Address" value={form.address || ''} onChange={set('address')} />
      <Select label="Status" value={form.status} onChange={set('status')}>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </Select>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="accent" loading={submitting}>{initial ? 'Save changes' : 'Add customer'}</Button>
      </div>
    </form>
  );
};

const CustomersPage = () => {
  const { can } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(searchParams.get('new') === '1');
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const canManage = can('ADMIN', 'MANAGER');

  const load = useCallback(() => {
    setLoading(true); setError(false);
    customersApi.getCustomers({ search }).then((res) => setCustomers(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);
  const closeForm = () => { setFormOpen(false); setEditing(null); setSearchParams({}); };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) { await customersApi.updateCustomer(editing.id, payload); notify.success('Customer updated.'); }
      else { await customersApi.createCustomer(payload); notify.success('Customer added successfully.'); }
      closeForm(); load();
    } catch (err) { notify.error(err.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try { await customersApi.deleteCustomer(deleteTarget.id); notify.success('Customer deleted.'); setDeleteTarget(null); load(); }
    catch (err) { notify.error(err.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Customers</h1>
          <p className="text-sm text-ink-muted">Everyone who has purchased from your business.</p>
        </div>
        {canManage && <Button variant="accent" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add Customer</Button>}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
        <Input icon={Search} placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        {error ? <ErrorState onRetry={load} /> : (
          <Table>
            <THead><Th>Customer</Th><Th>Contact</Th><Th>City</Th><Th>Total Spent</Th><Th>Last Purchase</Th><Th>Status</Th>{canManage && <Th className="text-right">Actions</Th>}</THead>
            <TBody>
              {loading && Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={7}><SkeletonRow cols={7} /></td></tr>)}
              {!loading && customers.map((c) => (
                <Tr key={c.id}>
                  <Td><Link to={`/customers/${c.id}`} className="font-medium text-ink hover:underline">{c.name}</Link></Td>
                  <Td className="text-ink-muted">{c.email || c.phone || '—'}</Td>
                  <Td className="text-ink-muted">{c.city || '—'}</Td>
                  <Td className="font-semibold">{formatFullCurrency(c.totalSpent)}</Td>
                  <Td className="text-ink-faint">{c.lastPurchase ? formatDate(c.lastPurchase) : '—'}</Td>
                  <Td><Badge tone={c.status === 'ACTIVE' ? 'success' : 'neutral'}>{c.status}</Badge></Td>
                  {canManage && (
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/customers/${c.id}`} className="rounded-lg p-2 text-ink-faint hover:bg-surface-2 hover:text-ink"><Eye className="h-4 w-4" /></Link>
                        <button onClick={() => { setEditing(c); setFormOpen(true); }} className="rounded-lg p-2 text-ink-faint hover:bg-surface-2 hover:text-ink"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-2 text-ink-faint hover:bg-danger-100 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
        {!loading && !error && customers.length === 0 && <EmptyState icon={Users} title="No customers yet" description="Add a customer to start tracking their purchase history." actionLabel={canManage ? 'Add customer' : undefined} onAction={() => setFormOpen(true)} />}
      </div>

      <Modal open={formOpen} onClose={closeForm} title={editing ? 'Edit customer' : 'Add customer'}>
        <CustomerForm initial={editing} onSubmit={handleSubmit} onCancel={closeForm} submitting={submitting} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete this customer?" description={`"${deleteTarget?.name}" will be permanently removed.`} confirmLabel="Delete customer" />
    </div>
  );
};

export default CustomersPage;
