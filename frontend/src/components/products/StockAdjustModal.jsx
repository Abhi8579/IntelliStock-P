import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const StockAdjustModal = ({ open, onClose, product, onSubmit, submitting }) => {
  const [direction, setDirection] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;
    onSubmit({ productId: product.id, quantity: direction === 'in' ? qty : -qty, notes });
  };

  const reset = () => { setQuantity(''); setNotes(''); setDirection('in'); onClose(); };

  return (
    <Modal open={open} onClose={reset} title="Adjust stock" description={`${product.name} · ${product.sku}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink-muted">
          Current stock: <span className="font-semibold text-ink">{product.currentStock}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setDirection('in')} className={cn('flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium transition-colors', direction === 'in' ? 'border-success bg-success-100 text-success-700' : 'border-border text-ink-muted hover:bg-surface-2')}>
            <Plus className="h-4 w-4" /> Stock in
          </button>
          <button type="button" onClick={() => setDirection('out')} className={cn('flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium transition-colors', direction === 'out' ? 'border-danger bg-danger-100 text-danger' : 'border-border text-ink-muted hover:bg-surface-2')}>
            <Minus className="h-4 w-4" /> Stock out
          </button>
        </div>

        <Input label="Quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">Reason / notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus-ring" placeholder="e.g. Damaged in transit, stock count correction…" />
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={reset}>Cancel</Button>
          <Button type="submit" variant={direction === 'in' ? 'accent' : 'danger'} loading={submitting}>Confirm adjustment</Button>
        </div>
      </form>
    </Modal>
  );
};

export default StockAdjustModal;
