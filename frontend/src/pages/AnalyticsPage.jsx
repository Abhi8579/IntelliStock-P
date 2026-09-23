import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Package, Boxes, Users } from 'lucide-react';
import * as analyticsApi from '../api/analytics';
import ChartCard from '../components/dashboard/ChartCard';
import ErrorState from '../components/ui/ErrorState';
import Select from '../components/ui/Select';
import { formatCurrency, formatFullCurrency, formatNumber, formatDate } from '../utils/format';

const RANGES = [
  { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' }, { value: '6m', label: 'Last 6 months' }, { value: '1y', label: 'Last year' },
];
const CATEGORY_COLORS = ['#E8A33D', '#1F9E8F', '#34B27A', '#E5484D', '#9CA3AF', '#63D9CB', '#C7822A', '#F1C070', '#146259', '#992025'];

const AnalyticsPage = () => {
  const [business, setBusiness] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    Promise.all([analyticsApi.getBusinessAnalytics(), analyticsApi.getSalesAnalytics(range)])
      .then(([b, s]) => { setBusiness(b.data); setSalesChart(s.data); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [range]);

  if (loading && !business) return <div className="h-96 animate-pulse rounded-2xl bg-surface-2" />;
  if (error) return <ErrorState onRetry={load} message="Couldn't load analytics data." />;

  const { stats, inventoryAnalytics, topProducts, newCustomers, topCustomers } = business;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Analytics</h1>
          <p className="text-sm text-ink-muted">Business intelligence across revenue, products, inventory, and customers.</p>
        </div>
        <Select value={range} onChange={(e) => setRange(e.target.value)} className="sm:w-48">
          {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><TrendingUp className="h-4 w-4 text-teal-500" /><p className="mt-3 font-display text-xl font-semibold text-ink">{formatCurrency(stats.monthRevenue)}</p><p className="text-xs text-ink-muted">Revenue this month</p></div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><Package className="h-4 w-4 text-amber-500" /><p className="mt-3 font-display text-xl font-semibold text-ink">{formatNumber(stats.monthOrders)}</p><p className="text-xs text-ink-muted">Orders this month</p></div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><Boxes className="h-4 w-4 text-ink-faint" /><p className="mt-3 font-display text-xl font-semibold text-ink">{formatCurrency(stats.inventoryValue)}</p><p className="text-xs text-ink-muted">Inventory value</p></div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft"><Users className="h-4 w-4 text-teal-500" /><p className="mt-3 font-display text-xl font-semibold text-ink">{formatNumber(newCustomers)}</p><p className="text-xs text-ink-muted">New customers (30d)</p></div>
      </div>

      <ChartCard title="Revenue & profit" subtitle={`Performance over ${RANGES.find((r) => r.value === range)?.label.toLowerCase()}`}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesChart}>
            <defs>
              <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E8A33D" stopOpacity={0.3} /><stop offset="100%" stopColor="#E8A33D" stopOpacity={0} /></linearGradient>
              <linearGradient id="profit2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1F9E8F" stopOpacity={0.3} /><stop offset="100%" stopColor="#1F9E8F" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} width={56} />
            <RTooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 10, fontSize: 12 }} formatter={(v, name) => [formatFullCurrency(v), name === 'revenue' ? 'Revenue' : 'Profit']} labelFormatter={formatDate} />
            <Area type="monotone" dataKey="revenue" stroke="#E8A33D" strokeWidth={2} fill="url(#rev2)" />
            <Area type="monotone" dataKey="profit" stroke="#1F9E8F" strokeWidth={2} fill="url(#profit2)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Top selling products" subtitle="By revenue generated">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts.slice(0, 8).map((t) => ({ name: t.product?.name?.slice(0, 14), revenue: t.revenue }))} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgb(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--ink-muted))' }} width={100} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 10, fontSize: 12 }} formatter={(v) => formatFullCurrency(v)} />
              <Bar dataKey="revenue" fill="#E8A33D" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Inventory value by category" subtitle="Where your capital is tied up">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={inventoryAnalytics.categoryDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {inventoryAnalytics.categoryDistribution.map((entry, i) => <Cell key={entry.name} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
              </Pie>
              <RTooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 10, fontSize: 12 }} formatter={(v) => formatFullCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Fast-moving products" subtitle="Highest units sold">
          <div className="space-y-3">
            {inventoryAnalytics.fastMoving.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">{p.name}</span>
                <span className="font-medium text-ink">{p.sold} sold</span>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Top customers" subtitle="By total spend">
          <div className="space-y-3">
            {topCustomers.length === 0 && <p className="text-sm text-ink-faint">No customer purchases recorded yet.</p>}
            {topCustomers.map((c) => (
              <div key={c.customer?.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">{c.customer?.name}</span>
                <span className="font-medium text-ink">{formatFullCurrency(c.totalSpent)}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;
