const validateProduct = (body) => {
  const errors = {};
  if (!body.name || !body.name.trim()) errors.name = 'Product name is required.';
  if (!body.sku || !body.sku.trim()) errors.sku = 'SKU is required.';
  if (body.costPrice === undefined || body.costPrice === null || isNaN(body.costPrice) || Number(body.costPrice) < 0) {
    errors.costPrice = 'Cost price must be a non-negative number.';
  }
  if (body.sellingPrice === undefined || body.sellingPrice === null || isNaN(body.sellingPrice) || Number(body.sellingPrice) < 0) {
    errors.sellingPrice = 'Selling price must be a non-negative number.';
  }
  if (body.currentStock !== undefined && (isNaN(body.currentStock) || Number(body.currentStock) < 0)) {
    errors.currentStock = 'Current stock cannot be negative.';
  }
  if (body.minStock !== undefined && (isNaN(body.minStock) || Number(body.minStock) < 0)) {
    errors.minStock = 'Minimum stock cannot be negative.';
  }
  if (body.maxStock !== undefined && body.minStock !== undefined && Number(body.maxStock) < Number(body.minStock)) {
    errors.maxStock = 'Maximum stock cannot be less than minimum stock.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

module.exports = { validateProduct };
