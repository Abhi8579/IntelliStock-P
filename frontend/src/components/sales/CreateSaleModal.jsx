import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';
import * as productsApi from '../../api/products';
import * as customersApi from '../../api/customers';
import { formatFullCurrency } from '../../utils/format';

const CreateSaleModal = ({ open, onClose, onSubmit, submitting }) => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantity: 1 }]);
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(18);
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    productsApi.getProducts({ limit: 100, status: 'ACTIVE' }).then((res) => setProducts(res.data));
    customersApi.getCustomers().then((res) => setCustomers(res.data));
    setLines([{ productId: '', quantity: 1 }]);
    setCustomerId(''); setDiscount(0); setTaxPercent(18); setPaymentStatus('PAID'); setError('');
  }, [open]);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const subtotal = lines.reduce((sum, l) => {
    const p = productMap.get(l.productId);
    return sum + (p ? p.sellingPrice * Number(l.quantity || 0) : 0);
  }, 0);
  const tax = Math.round(subtotal * (Number(taxPercent) / 100));
  const total = Math.max(0, subtotal - Number(discount || 0) + tax);

  const addLine = () => setLines((l) => [...l, { productId: '', quantity: 1 }]);
  const removeLine = (i) => setLines((l) => l.filter((_, idx) => idx !== i));
  const updateLine = (i, patch) => setLines((l) => l.map((line, idx) => (idx === i ? { ...line, ...patch } : line)));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validLines = lines.filter((l) => l.productId && Number(l.quantity) > 0);
    if (validLines.length === 0) { setError('Add at least one product with a valid quantity.'); return; }
    for (const l of validLines) {
      const p = productMap.get(l.productId);
      if (p && Number(l.quantity) > p.currentStock) { setError(`Not enough stock for "${p.name}". Available: ${p.currentStock}.`); return; }
    }
    setError('');
    onSubmit({
      customerId: customerId || null,
      items: validLines.map((l) => ({ productId: l.productId, quantity: Number(l.quantity) })),
      discount: Number(discount || 0),
      tax,
      paymentStatus,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create sale" description="Record a new sale and update inventory automatically." size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Customer (optional)" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">Walk-in customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>

        <div className="space-y-2">
          <span className="block text-xs font-medium text-ink-muted">Products</span>
          {lines.map((line, i) => {
            const p = productMap.get(line.productId);
            return (
              <div key={i} className="flex items-end gap-2 rounded-lg border border-border p-2.5">
                <div className="flex-1">
                  <Select value={line.productId} onChange={(e) => updateLine(i, { productId: e.target.value })}>
                    <option value="">Select product…</option>
                    {products.map((prod) => <option key={prod.id} value={prod.id} disabled={prod.currentStock <= 0}>{prod.name} ({prod.currentStock} in stock){prod.currentStock <= 0 ? ' - Out of stock' : ''}</option>)}
                  </Select>
                </div>
                <div className="w-24">
                  <Input type="number" min="1" max={p?.currentStock || undefined} value={line.quantity} onChange={(e) => updateLine(i, { quantity: e.target.value })} />
                </div>
                <div className="w-28 pb-2.5 text-right text-sm font-medium text-ink">{p ? formatFullCurrency(p.sellingPrice * Number(line.quantity || 0)) : '—'}</div>
                <button type="button" onClick={() => removeLine(i)} className="mb-1 rounded-lg p-2 text-ink-faint hover:bg-danger-100 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
          <Button type="button" variant="secondary" size="sm" onClick={addLine}><Plus className="h-3.5 w-3.5" /> Add product</Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input label="Discount (₹)" type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          <Input label="Tax (%)" type="number" min="0" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
          <Select label="Payment status" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
          </Select>
        </div>

        <div className="rounded-lg border border-border bg-surface-2 p-3.5 text-sm">
          <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span>{formatFullCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-ink-muted"><span>Discount</span><span>-{formatFullCurrency(discount || 0)}</span></div>
          <div className="flex justify-between text-ink-muted"><span>Tax</span><span>+{formatFullCurrency(tax)}</span></div>
          <div className="mt-1.5 flex justify-between border-t border-border pt-1.5 font-semibold text-ink"><span>Total</span><span>{formatFullCurrency(total)}</span></div>
        </div>

        {error && <p className="rounded-lg bg-danger-100 px-3 py-2 text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="accent" loading={submitting}><ShoppingCart className="h-4 w-4" /> Complete sale</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSaleModal;
