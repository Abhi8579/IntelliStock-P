import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, SlidersHorizontal, PackageSearch, Boxes } from 'lucide-react';
import * as productsApi from '../api/products';
import * as suppliersApi from '../api/suppliers';
import { adjustStock } from '../api/inventory';
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
import Pagination from '../components/ui/Pagination';
import ProductForm from '../components/products/ProductForm';
import StockAdjustModal from '../components/products/StockAdjustModal';
import { formatFullCurrency } from '../utils/format';

const stockBadge = (p) => {
  if (p.currentStock <= 0) return <Badge tone="danger" dot>Out of stock</Badge>;
  if (p.currentStock <= p.minStock) return <Badge tone="amber" dot>Low stock</Badge>;
  return <Badge tone="success" dot>In stock</Badge>;
};

const ProductsPage = () => {
  const { can } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 12 });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(searchParams.get('new') === '1');
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null);

  const canManage = can('ADMIN', 'MANAGER');

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    const [sortField, sortOrder] = sortBy.startsWith('-') ? [sortBy.slice(1), 'desc'] : [sortBy, 'asc'];
    productsApi.getProducts({ search, category: categoryFilter, stockStatus: stockFilter, sortBy: sortField, sortOrder, page, limit: 10 })
      .then((res) => { setProducts(res.data); setMeta(res.meta); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, categoryFilter, stockFilter, sortBy, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    productsApi.getCategories().then((res) => setCategories(res.data)).catch(() => {});
    suppliersApi.getSuppliers().then((res) => setSuppliers(res.data)).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p) => { setEditing(p); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); setSearchParams({}); };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await productsApi.updateProduct(editing.id, payload);
        notify.success('Product updated successfully.');
      } else {
        await productsApi.createProduct(payload);
        notify.success('Product created successfully.');
      }
      closeForm();
      load();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productsApi.deleteProduct(deleteTarget.id);
      notify.success('Product deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const handleAdjust = async (payload) => {
    setSubmitting(true);
    try {
      await adjustStock(payload);
      notify.success('Stock adjusted successfully.');
      setAdjustTarget(null);
      load();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => { setSearch(''); setCategoryFilter(''); setStockFilter(''); setPage(1); };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Products</h1>
          <p className="text-sm text-ink-muted">Manage your product catalog, pricing, and stock levels.</p>
        </div>
        {canManage && <Button variant="accent" onClick={openCreate}><Plus className="h-4 w-4" /> Add Product</Button>}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input icon={Search} placeholder="Search by name, SKU, or barcode…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="sm:w-44">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} className="sm:w-40">
          <option value="">All stock</option>
          <option value="healthy">Healthy</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sm:w-44">
          <option value="createdAt">Newest first</option>
          <option value="name">Name (A-Z)</option>
          <option value="sellingPrice">Price: Low to High</option>
          <option value="-sellingPrice">Price: High to Low</option>
          <option value="currentStock">Stock: Low to High</option>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        {error ? (
          <ErrorState onRetry={load} message="Couldn't load products. Please check your connection and try again." />
        ) : (
          <Table>
            <THead>
              <Th>Product</Th>
              <Th>SKU</Th>
              <Th>Category</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </THead>
            <TBody>
              {loading && Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={7}><SkeletonRow cols={7} /></td></tr>)}
              {!loading && products.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-faint">
                        <Boxes className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <Link to={`/products/${p.id}`} className="block truncate font-medium text-ink hover:underline">{p.name}</Link>
                        <p className="truncate text-xs text-ink-faint">{p.supplier?.name || 'No supplier'}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs text-ink-muted">{p.sku}</Td>
                  <Td className="text-ink-muted">{p.category?.name || '—'}</Td>
                  <Td>
                    <p className="font-medium">{formatFullCurrency(p.sellingPrice)}</p>
                    <p className="text-xs text-ink-faint">Cost {formatFullCurrency(p.costPrice)}</p>
                  </Td>
                  <Td>
                    <p className="font-medium">{p.currentStock} <span className="text-xs font-normal text-ink-faint">/ min {p.minStock}</span></p>
                  </Td>
                  <Td>{stockBadge(p)}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/products/${p.id}`} className="rounded-lg p-2 text-ink-faint hover:bg-surface-2 hover:text-ink"><Eye className="h-4 w-4" /></Link>
                      {canManage && (
                        <>
                          <button onClick={() => setAdjustTarget(p)} className="rounded-lg p-2 text-ink-faint hover:bg-surface-2 hover:text-ink"><SlidersHorizontal className="h-4 w-4" /></button>
                          <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-ink-faint hover:bg-surface-2 hover:text-ink"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-2 text-ink-faint hover:bg-danger-100 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}

        {!loading && !error && products.length === 0 && (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description="Try changing your search or filters, or add your first product."
            actionLabel={canManage ? 'Add product' : undefined}
            onAction={openCreate}
            secondaryLabel="Clear filters"
            onSecondary={clearFilters}
          />
        )}

        {!loading && !error && products.length > 0 && (
          <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onChange={setPage} />
        )}
      </div>

      <Modal open={formOpen} onClose={closeForm} title={editing ? 'Edit product' : 'Add product'} size="lg">
        <ProductForm initial={editing} categories={categories} suppliers={suppliers} onSubmit={handleSubmit} onCancel={closeForm} submitting={submitting} isEdit={!!editing} />
      </Modal>

      <StockAdjustModal open={!!adjustTarget} product={adjustTarget} onClose={() => setAdjustTarget(null)} onSubmit={handleAdjust} submitting={submitting} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this product?"
        description={`"${deleteTarget?.name}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete product"
      />
    </div>
  );
};

export default ProductsPage;
