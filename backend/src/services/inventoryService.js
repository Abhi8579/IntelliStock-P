const prisma = require('../config/prisma');
const { createNotification } = require('../utils/notify');

// Every stock mutation MUST go through this function so an InventoryTransaction
// is always recorded and stock never drifts out of sync with its history.
const applyStockChange = async (tx, { productId, type, quantity, userId, reference, notes, saleId, purchaseId }) => {
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Product not found for stock change.');

  const newStock = product.currentStock + quantity;
  if (newStock < 0) {
    const err = new Error(`Insufficient stock for "${product.name}". Available: ${product.currentStock}.`);
    err.statusCode = 400;
    throw err;
  }

  const updated = await tx.product.update({
    where: { id: productId },
    data: { currentStock: newStock },
  });

  await tx.inventoryTransaction.create({
    data: {
      productId,
      type,
      quantity,
      stockAfter: newStock,
      reference: reference || null,
      notes: notes || null,
      userId: userId || null,
      saleId: saleId || null,
      purchaseId: purchaseId || null,
    },
  });

  return updated;
};

const checkAndNotifyStockLevel = async (product) => {
  if (product.currentStock <= 0) {
    await createNotification({
      type: 'OUT_OF_STOCK',
      title: 'Product out of stock',
      message: `${product.name} (SKU: ${product.sku}) is now out of stock.`,
      link: `/products/${product.id}`,
    });
  } else if (product.currentStock <= product.minStock) {
    await createNotification({
      type: 'LOW_STOCK',
      title: 'Low stock alert',
      message: `${product.name} (SKU: ${product.sku}) has only ${product.currentStock} units left (minimum: ${product.minStock}).`,
      link: `/products/${product.id}`,
    });
  }
};

module.exports = { applyStockChange, checkAndNotifyStockLevel };
