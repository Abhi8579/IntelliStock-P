import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Wallet, TrendingUp, AlertTriangle, PackageX, ClipboardList,
  RefreshCw, ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import * as analyticsApi from '../api/analytics';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/dashboard/ChartCard';
import MiniWarehouseHero from '../components/dashboard/MiniWarehouseHero';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { formatCurrency, formatFullCurrency, formatNumber, formatDate, formatDateTime } from '../utils/format';

const PIE_COLORS = ['#34B27A', '#E8A33D', '#E5484D'];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    analyticsApi.getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-36 animate-pulse rounded-2xl bg-surface-2" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl bg-surface-2 lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-2xl bg-surface-2" />
        </div>
      </div>
    );
  }

  if (error || !data) return <ErrorState message="We couldn't load your dashboard data. Check that the API server is running." onRetry={load} />;

  const { stats, salesChart, inventoryAnalytics, topProducts, criticalStock, recentTransactions } = data;

  const stockPie = inventoryAnalytics.stockDistribution.filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0B0F14] px-6 py-8 sm:px-8">
        <div className="card-grid-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="mt-1.5 text-sm text-white/60">Here's what's happening with your inventory today.</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-white/40">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <Button variant="secondary" size="sm" onClick={load} className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          </div>
          <div className="h-32 w-40 shrink-0 sm:h-36 sm:w-52">
            <MiniWarehouseHero />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard index={0} icon={Package} label="Total Products" value={formatNumber(stats.totalProducts)} tone="ink" />
        <StatCard index={1} icon={Wallet} label="Inventory Value" value={formatCurrency(stats.inventoryValue)} tone="amber" />
        <StatCard index={2} icon={TrendingUp} label="Today's Revenue" value={formatCurrency(stats.todayRevenue)} change={stats.revenueChangePercent} tone="teal" />
        <StatCard index={3} icon={AlertTriangle} label="Low Stock" value={formatNumber(stats.lowStock)} tone="amber" />
        <StatCard index={4} icon={PackageX} label="Out of Stock" value={formatNumber(stats.outOfStock)} tone="danger" />
        <StatCard index={5} icon={ClipboardList} label="Pending Orders" value={formatNumber(stats.pendingPurchases)} tone="ink" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Sales overview" subtitle="Revenue over the last 7 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesChart}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8A33D" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E8A33D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} tickFormatter={(d) => formatDate(d).replace(/\s\d{4}$/, '')} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} width={56} />
              <RTooltip
                contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 10, fontSize: 12 }}
                formatter={(value, name) => [name === 'orders' ? value : formatFullCurrency(value), name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : 'Orders']}
                labelFormatter={(l) => formatDate(l)}
              />
              <Area type="monotone" dataKey="revenue" stroke="#E8A33D" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Stock health" subtitle="Distribution across all products">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stockPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {stockPie.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <RTooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {stockPie.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-ink-muted"><span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{d.name}</span>
                <span className="font-medium text-ink">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Low stock alert */}
        <div className="rounded-2xl border border-border bg-surface shadow-soft lg:col-span-1">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="font-display text-sm font-semibold text-ink">Low stock alert</h3>
            </div>
            <Badge tone="amber">{criticalStock.length} items</Badge>
          </div>
          <div className="divide-y divide-border">
            {criticalStock.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink-faint">All products are well stocked.</p>}
            {criticalStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-ink-faint">Stock: <span className={p.currentStock === 0 ? 'text-danger font-medium' : 'text-amber-600 font-medium'}>{p.currentStock}</span> · Min: {p.minStock}</p>
                </div>
                <Link to={`/products/${p.id}`}>
                  <Button size="sm" variant="secondary">Restock</Button>
                </Link>
              </div>
            ))}
          </div>
          <Link to="/inventory" className="flex items-center justify-center gap-1 border-t border-border px-5 py-3 text-xs font-medium text-ink-muted hover:text-ink">
            View all inventory <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Recent transactions */}
        <div className="rounded-2xl border border-border bg-surface shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-ink">Recent transactions</h3>
            <Link to="/inventory" className="text-xs font-medium text-ink-muted hover:text-ink">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-2.5 font-medium">Product</th>
                  <th className="px-5 py-2.5 font-medium">Type</th>
                  <th className="px-5 py-2.5 font-medium">Qty</th>
                  <th className="px-5 py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-5 py-3 font-medium text-ink">{t.product?.name}</td>
                    <td className="px-5 py-3">
                      <Badge tone={t.type === 'SALE' ? 'teal' : t.type === 'PURCHASE' ? 'success' : t.type === 'RETURN' ? 'amber' : 'neutral'}>{t.type}</Badge>
                    </td>
                    <td className={`px-5 py-3 font-mono ${t.quantity < 0 ? 'text-danger' : 'text-success'}`}>{t.quantity > 0 ? `+${t.quantity}` : t.quantity}</td>
                    <td className="px-5 py-3 text-ink-faint">{formatDateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
