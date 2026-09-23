import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Boxes, TrendingUp, Package, SlidersHorizontal, Pencil } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Cell } from 'recharts';
import * as productsApi from '../api/products';
import * as suppliersApi from '../api/suppliers';
import { adjustStock } from '../api/inventory';
import { notify } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProductForm from '../components/products/ProductForm';
import StockAdjustModal from '../components/products/StockAdjustModal';
import ErrorState from '../components/ui/ErrorState';
import { formatFullCurrency, formatDateTime } from '../utils/format';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canManage = can('ADMIN', 'MANAGER');

  const load = () => {
    setLoading(true);
    setError(false);
    productsApi.getProduct(id).then((res) => setProduct(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    productsApi.getCategories().then((res) => setCategories(res.data)).catch(() => {});
    suppliersApi.getSuppliers().then((res) => setSuppliers(res.data)).catch(() => {});
  }, []);

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-surface-2" />;
  if (error || !product) return <ErrorState message="This product could not be found." onRetry={load} />;

  const margin = product.sellingPrice > 0 ? (((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(1) : 0;

  const historyData = [...product.inventoryTxns].reverse().slice(-14).map((t) => ({
    label: new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    quantity: t.quantity,
    type: t.type,
  }));

  const handleEditSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await productsApi.updateProduct(product.id, payload);
      notify.success('Product updated successfully.');
      setEditOpen(false);
      load();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjust = async (payload) => {
    setSubmitting(true);
    try {
      await adjustStock(payload);
      notify.success('Stock adjusted successfully.');
      setAdjustOpen(false);
      load();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/products')} className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </button>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-ink-faint">
              <Boxes className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-semibold text-ink">{product.name}</h1>
                <Badge tone={product.currentStock <= 0 ? 'danger' : product.currentStock <= product.minStock ? 'amber' : 'success'} dot>
                  {product.currentStock <= 0 ? 'Out of stock' : product.currentStock <= product.minStock ? 'Low stock' : 'In stock'}
                </Badge>
              </div>
              <p className="mt-1 font-mono text-xs text-ink-faint">{product.sku} {product.barcode && `· ${product.barcode}`}</p>
              <p className="mt-2 max-w-lg text-sm text-ink-muted">{product.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.category && <Badge tone="neutral">{product.category.name}</Badge>}
                {product.supplier && <Badge tone="neutral">Supplied by {product.supplier.name}</Badge>}
              </div>
            </div>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setAdjustOpen(true)}><SlidersHorizontal className="h-4 w-4" /> Adjust Stock</Button>
              <Button variant="accent" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" /> Edit</Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Current stock', value: product.currentStock, icon: Boxes },
          { label: 'Selling price', value: formatFullCurrency(product.sellingPrice), icon: Package },
          { label: 'Profit margin', value: `${margin}%`, icon: TrendingUp },
          { label: 'Units sold', value: product.totalUnitsSold, icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
            <s.icon className="h-4 w-4 text-ink-faint" />
            <p className="mt-3 font-display text-xl font-semibold text-ink">{s.value}</p>
            <p className="text-xs text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h3 className="font-display text-sm font-semibold text-ink">Stock movement history</h3>
        <p className="mb-4 text-xs text-ink-faint">Additions, sales, adjustments, and returns over recent transactions.</p>
        {historyData.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-faint">No stock movements recorded yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="quantity" radius={[4, 4, 4, 4]}>
                {historyData.map((d, i) => <Cell key={i} fill={d.quantity >= 0 ? '#1F9E8F' : '#E5484D'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        <div className="border-b border-border px-5 py-4"><h3 className="font-display text-sm font-semibold text-ink">Recent activity</h3></div>
        <div className="divide-y divide-border">
          {product.inventoryTxns.slice(0, 10).map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <Badge tone={t.type === 'SALE' ? 'teal' : t.type === 'PURCHASE' ? 'success' : t.type === 'RETURN' ? 'amber' : 'neutral'}>{t.type}</Badge>
                <p className="text-sm text-ink-muted">{t.notes || t.reference || 'Stock update'}</p>
              </div>
              <div className="text-right">
                <p className={`font-mono text-sm font-medium ${t.quantity < 0 ? 'text-danger' : 'text-success'}`}>{t.quantity > 0 ? `+${t.quantity}` : t.quantity}</p>
                <p className="text-xs text-ink-faint">{formatDateTime(t.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit product" size="lg">
        <ProductForm initial={product} categories={categories} suppliers={suppliers} onSubmit={handleEditSubmit} onCancel={() => setEditOpen(false)} submitting={submitting} isEdit />
      </Modal>
      <StockAdjustModal open={adjustOpen} product={product} onClose={() => setAdjustOpen(false)} onSubmit={handleAdjust} submitting={submitting} />
    </div>
  );
};

export default ProductDetailsPage;
