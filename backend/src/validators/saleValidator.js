const validateSale = (body) => {
  const errors = {};
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.items = 'A sale must include at least one product.';
  } else {
    for (const item of body.items) {
      if (!item.productId) { errors.items = 'Each item requires a product.'; break; }
      if (!item.quantity || Number(item.quantity) <= 0) { errors.items = 'Quantity must be greater than zero.'; break; }
    }
  }
  if (body.discount !== undefined && Number(body.discount) < 0) errors.discount = 'Discount cannot be negative.';
  if (body.tax !== undefined && Number(body.tax) < 0) errors.tax = 'Tax cannot be negative.';
  return { valid: Object.keys(errors).length === 0, errors };
};

module.exports = { validateSale };
