import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Truck } from 'lucide-react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';
import * as productsApi from '../../api/products';
import * as suppliersApi from '../../api/suppliers';
import { formatFullCurrency } from '../../utils/format';

const CreatePurchaseModal = ({ open, onClose, onSubmit, submitting }) => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantity: 10, cost: '' }]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    productsApi.getProducts({ limit: 100 }).then((res) => setProducts(res.data));
    suppliersApi.getSuppliers().then((res) => setSuppliers(res.data));
    setLines([{ productId: '', quantity: 10, cost: '' }]);
    setSupplierId(''); setExpectedDate(''); setError('');
  }, [open]);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const addLine = () => setLines((l) => [...l, { productId: '', quantity: 10, cost: '' }]);
  const removeLine = (i) => setLines((l) => l.filter((_, idx) => idx !== i));
  const updateLine = (i, patch) => setLines((l) => l.map((line, idx) => {
    if (idx !== i) return line;
    const next = { ...line, ...patch };
    if (patch.productId) {
      const p = productMap.get(patch.productId);
      if (p && !line.cost) next.cost = p.costPrice;
    }
    return next;
  }));

  const total = lines.reduce((sum, l) => sum + Number(l.cost || 0) * Number(l.quantity || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId) { setError('Select a supplier.'); return; }
    const validLines = lines.filter((l) => l.productId && Number(l.quantity) > 0 && l.cost !== '');
    if (validLines.length === 0) { setError('Add at least one product with quantity and cost.'); return; }
    setError('');
    onSubmit({
      supplierId,
      expectedDate: expectedDate || undefined,
      items: validLines.map((l) => ({ productId: l.productId, quantity: Number(l.quantity), cost: Number(l.cost) })),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create purchase order" description="Order stock from a supplier." size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Supplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="">Select supplier…</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name} {s.company ? `(${s.company})` : ''}</option>)}
          </Select>
          <Input label="Expected delivery date" type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-medium text-ink-muted">Products to order</span>
          {lines.map((line, i) => (
            <div key={i} className="flex items-end gap-2 rounded-lg border border-border p-2.5">
              <div className="flex-1">
                <Select value={line.productId} onChange={(e) => updateLine(i, { productId: e.target.value })}>
                  <option value="">Select product…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </div>
              <div className="w-24"><Input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(i, { quantity: e.target.value })} /></div>
              <div className="w-28"><Input type="number" min="0" step="0.01" value={line.cost} onChange={(e) => updateLine(i, { cost: e.target.value })} placeholder="Cost ₹" /></div>
              <div className="w-28 pb-2.5 text-right text-sm font-medium text-ink">{formatFullCurrency(Number(line.cost || 0) * Number(line.quantity || 0))}</div>
              <button type="button" onClick={() => removeLine(i)} className="mb-1 rounded-lg p-2 text-ink-faint hover:bg-danger-100 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addLine}><Plus className="h-3.5 w-3.5" /> Add product</Button>
        </div>

        <div className="flex justify-between rounded-lg border border-border bg-surface-2 p-3.5 text-sm font-semibold text-ink">
          <span>Order total</span><span>{formatFullCurrency(total)}</span>
        </div>

        {error && <p className="rounded-lg bg-danger-100 px-3 py-2 text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="accent" loading={submitting}><Truck className="h-4 w-4" /> Create order</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePurchaseModal;
