import { useEffect, useState } from 'react';
import { Plus, UserCog, ShieldCheck, ShieldOff } from 'lucide-react';
import * as usersApi from '../api/users';
import { useAuth } from '../context/AuthContext';
import { notify } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ErrorState from '../components/ui/ErrorState';
import { Table, THead, Th, TBody, Tr, Td } from '../components/ui/Table';
import { SkeletonRow } from '../components/ui/Skeleton';
import { formatDate, initials } from '../utils/format';

const emptyForm = { name: '', email: '', role: 'STAFF', tempPassword: '' };

const CreateUserForm = ({ onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (form.tempPassword.length < 8) errs.tempPassword = 'At least 8 characters.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full name" value={form.name} onChange={set('name')} error={errors.name} />
      <Input label="Email address" type="email" value={form.email} onChange={set('email')} error={errors.email} />
      <Select label="Role" value={form.role} onChange={set('role')}>
        <option value="STAFF">Staff</option>
        <option value="MANAGER">Manager</option>
      </Select>
      <Input label="Temporary password" type="text" value={form.tempPassword} onChange={set('tempPassword')} error={errors.tempPassword} hint="Shared with the employee by email. They can change it after logging in." />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="accent" loading={submitting}>Create User</Button>
      </div>
    </form>
  );
};

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  const load = () => {
    setLoading(true); setError(false);
    usersApi.getUsers().then((res) => setUsers(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await usersApi.createUser(payload);
      notify.success('User created. Login details have been emailed to them.');
      setFormOpen(false); load();
    } catch (err) { notify.error(err.message); } finally { setSubmitting(false); }
  };

  const handleToggleStatus = async () => {
    try {
      await usersApi.setUserStatus(statusTarget.id, !statusTarget.isActive);
      notify.success(`User ${statusTarget.isActive ? 'deactivated' : 'activated'} successfully.`);
      setStatusTarget(null); load();
    } catch (err) { notify.error(err.message); setStatusTarget(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">User Management</h1>
          <p className="text-sm text-ink-muted">Create and manage Staff and Manager accounts for your team.</p>
        </div>
        <Button variant="accent" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add User</Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        {error ? <ErrorState onRetry={load} /> : (
          <Table>
            <THead><Th>User</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Joined</Th><Th className="text-right">Actions</Th></THead>
            <TBody>
              {loading && Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={6}><SkeletonRow cols={6} /></td></tr>)}
              {!loading && users.map((u) => (
                <Tr key={u.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/15 text-[11px] font-semibold text-teal-700 dark:text-teal-300">{initials(u.name)}</div>
                      <span className="font-medium text-ink">{u.name}{u.id === currentUser.id && <span className="ml-1.5 text-xs font-normal text-ink-faint">(you)</span>}</span>
                    </div>
                  </Td>
                  <Td className="text-ink-muted">{u.email}</Td>
                  <Td><Badge tone={u.role === 'ADMIN' ? 'amber' : u.role === 'MANAGER' ? 'teal' : 'neutral'}>{u.role}</Badge></Td>
                  <Td><Badge tone={u.isActive ? 'success' : 'danger'} dot>{u.isActive ? 'Active' : 'Inactive'}</Badge></Td>
                  <Td className="text-ink-faint">{formatDate(u.createdAt)}</Td>
                  <Td className="text-right">
                    <button
                      onClick={() => setStatusTarget(u)}
                      disabled={u.id === currentUser.id}
                      title={u.id === currentUser.id ? "You can't deactivate your own account" : u.isActive ? 'Deactivate user' : 'Activate user'}
                      className="inline-flex rounded-lg p-2 text-ink-faint hover:bg-surface-2 hover:text-ink disabled:opacity-30 disabled:pointer-events-none"
                    >
                      {u.isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </button>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
        {!loading && !error && users.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-faint"><UserCog className="h-6 w-6" /></div>
            <h3 className="font-display text-sm font-semibold text-ink">No users yet</h3>
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add user" description="Create a Staff or Manager account.">
        <CreateUserForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleToggleStatus}
        tone={statusTarget?.isActive ? 'danger' : 'amber'}
        title={statusTarget?.isActive ? 'Deactivate this user?' : 'Activate this user?'}
        description={statusTarget?.isActive ? `"${statusTarget?.name}" will no longer be able to log in.` : `"${statusTarget?.name}" will be able to log in again.`}
        confirmLabel={statusTarget?.isActive ? 'Deactivate' : 'Activate'}
      />
    </div>
  );
};

export default UserManagementPage;
