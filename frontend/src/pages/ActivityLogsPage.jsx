import { useCallback, useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import * as activityLogsApi from '../api/activityLogs';
import Badge from '../components/ui/Badge';
import { Table, THead, Th, TBody, Tr, Td } from '../components/ui/Table';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import { formatDateTime, initials } from '../utils/format';

const actionTone = { CREATE: 'success', UPDATE: 'amber', DELETE: 'danger', ADJUST: 'teal', LOGIN: 'neutral', PASSWORD_RESET: 'danger' };

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 25 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setError(false);
    activityLogsApi.getActivityLogs({ page, limit: 25 }).then((res) => { setLogs(res.data); setMeta(res.meta); }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Activity Logs</h1>
        <p className="text-sm text-ink-muted">A complete audit trail of actions taken across your workspace.</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        {error ? <ErrorState onRetry={load} /> : (
          <Table>
            <THead><Th>User</Th><Th>Action</Th><Th>Entity</Th><Th>Description</Th><Th>Timestamp</Th></THead>
            <TBody>
              {loading && Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={5}><SkeletonRow cols={5} /></td></tr>)}
              {!loading && logs.map((log) => (
                <Tr key={log.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/15 text-[10px] font-semibold text-teal-700 dark:text-teal-300">{initials(log.user?.name || 'SYS')}</div>
                      <span className="text-ink-muted">{log.user?.name || 'System'}</span>
                    </div>
                  </Td>
                  <Td><Badge tone={actionTone[log.action] || 'neutral'}>{log.action}</Badge></Td>
                  <Td className="text-ink-muted">{log.entity}</Td>
                  <Td className="max-w-md truncate text-ink-muted">{log.description}</Td>
                  <Td className="text-ink-faint">{formatDateTime(log.createdAt)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
        {!loading && !error && logs.length === 0 && <EmptyState icon={ScrollText} title="No activity yet" description="Actions taken across the app will be recorded here." />}
        {!loading && !error && logs.length > 0 && <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onChange={setPage} />}
      </div>
    </div>
  );
};

export default ActivityLogsPage;
