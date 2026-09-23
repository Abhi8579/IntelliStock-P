const validatePurchase = (body) => {
  const errors = {};
  if (!body.supplierId) errors.supplierId = 'Supplier is required.';
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.items = 'A purchase order must include at least one product.';
  } else {
    for (const item of body.items) {
      if (!item.productId) { errors.items = 'Each item requires a product.'; break; }
      if (!item.quantity || Number(item.quantity) <= 0) { errors.items = 'Quantity must be greater than zero.'; break; }
      if (item.cost === undefined || Number(item.cost) < 0) { errors.items = 'Cost must be a non-negative number.'; break; }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

module.exports = { validatePurchase };
