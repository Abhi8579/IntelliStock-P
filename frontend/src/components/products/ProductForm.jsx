import { useEffect, useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const emptyForm = {
  name: '', sku: '', barcode: '', categoryId: '', supplierId: '', description: '',
  costPrice: '', sellingPrice: '', currentStock: '', minStock: '', maxStock: '', status: 'ACTIVE', image: '',
};

const ProductForm = ({ initial, categories, suppliers, onSubmit, onCancel, submitting, isEdit }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '', sku: initial.sku || '', barcode: initial.barcode || '',
        categoryId: initial.categoryId || '', supplierId: initial.supplierId || '', description: initial.description || '',
        costPrice: initial.costPrice ?? '', sellingPrice: initial.sellingPrice ?? '',
        currentStock: initial.currentStock ?? '', minStock: initial.minStock ?? '', maxStock: initial.maxStock ?? '',
        status: initial.status || 'ACTIVE', image: initial.image || '',
      });
    }
  }, [initial]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required.';
    if (!form.sku.trim()) errs.sku = 'SKU is required.';
    if (form.costPrice === '' || Number(form.costPrice) < 0) errs.costPrice = 'Enter a valid cost price.';
    if (form.sellingPrice === '' || Number(form.sellingPrice) < 0) errs.sellingPrice = 'Enter a valid selling price.';
    if (form.minStock !== '' && Number(form.minStock) < 0) errs.minStock = 'Cannot be negative.';
    if (form.maxStock !== '' && form.minStock !== '' && Number(form.maxStock) < Number(form.minStock)) errs.maxStock = 'Must be ≥ minimum stock.';
    if (!isEdit && form.currentStock !== '' && Number(form.currentStock) < 0) errs.currentStock = 'Cannot be negative.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({
      ...form,
      categoryId: form.categoryId || null,
      supplierId: form.supplierId || null,
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      currentStock: form.currentStock === '' ? 0 : Number(form.currentStock),
      minStock: form.minStock === '' ? 10 : Number(form.minStock),
      maxStock: form.maxStock === '' ? 1000 : Number(form.maxStock),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Product name" value={form.name} onChange={set('name')} error={errors.name} className="col-span-2" />
        <Input label="SKU" value={form.sku} onChange={set('sku')} error={errors.sku} />
        <Input label="Barcode (optional)" value={form.barcode} onChange={set('barcode')} />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink-muted">Description</span>
        <textarea
          value={form.description} onChange={set('description')} rows={2}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus-ring"
          placeholder="Short description of the product…"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Category" value={form.categoryId} onChange={set('categoryId')}>
          <option value="">Uncategorized</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="Supplier" value={form.supplierId} onChange={set('supplierId')}>
          <option value="">No supplier</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Cost price (₹)" type="number" step="0.01" value={form.costPrice} onChange={set('costPrice')} error={errors.costPrice} />
        <Input label="Selling price (₹)" type="number" step="0.01" value={form.sellingPrice} onChange={set('sellingPrice')} error={errors.sellingPrice} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input label={isEdit ? 'Current stock (locked)' : 'Current stock'} type="number" value={form.currentStock} onChange={set('currentStock')} error={errors.currentStock} disabled={isEdit} hint={isEdit ? 'Use Adjust Stock to change.' : undefined} />
        <Input label="Minimum stock" type="number" value={form.minStock} onChange={set('minStock')} error={errors.minStock} />
        <Input label="Maximum stock" type="number" value={form.maxStock} onChange={set('maxStock')} error={errors.maxStock} />
      </div>

      <Select label="Status" value={form.status} onChange={set('status')}>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="DISCONTINUED">Discontinued</option>
      </Select>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="accent" loading={submitting}>{isEdit ? 'Save changes' : 'Add product'}</Button>
      </div>
    </form>
  );
};

export default ProductForm;
