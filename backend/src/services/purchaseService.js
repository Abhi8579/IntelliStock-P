const prisma = require('../config/prisma');
const { applyStockChange, checkAndNotifyStockLevel } = require('./inventoryService');
const { generatePurchaseNo } = require('../utils/generateCode');
const { createNotification } = require('../utils/notify');
const { logActivity } = require('../utils/activityLogger');
const { ApiError } = require('../utils/apiResponse');

const createPurchase = async (payload, user) => {
  const { supplierId, items, expectedDate } = payload;

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) throw new ApiError(404, 'Supplier not found.');

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));
  for (const item of items) {
    if (!productMap.has(item.productId)) throw new ApiError(404, 'One of the selected products no longer exists.');
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.cost) * Number(item.quantity), 0);
  const count = await prisma.purchase.count();
  const purchaseNo = generatePurchaseNo(count + 1);

  const purchase = await prisma.purchase.create({
    data: {
      purchaseNo,
      supplierId,
      userId: user.id,
      subtotal,
      total: subtotal,
      status: 'PENDING',
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          cost: Number(item.cost),
          total: Number(item.cost) * Number(item.quantity),
        })),
      },
    },
    include: { items: { include: { product: true } }, supplier: true },
  });

  await logActivity({
    userId: user.id,
    action: 'CREATE',
    entity: 'Purchase',
    entityId: purchase.id,
    description: `Created purchase order ${purchaseNo} with ${supplier.name}.`,
  });

  return purchase;
};

// Marking a purchase received is the moment stock actually increases - atomic + audited.
const receivePurchase = async (purchaseId, user) => {
  const existing = await prisma.purchase.findUnique({ where: { id: purchaseId }, include: { items: true, supplier: true } });
  if (!existing) throw new ApiError(404, 'Purchase order not found.');
  if (existing.status === 'RECEIVED') throw new ApiError(400, 'This purchase order has already been received.');
  if (existing.status === 'CANCELLED') throw new ApiError(400, 'Cannot receive a cancelled purchase order.');

  const updated = await prisma.$transaction(async (tx) => {
    for (const item of existing.items) {
      await applyStockChange(tx, {
        productId: item.productId,
        type: 'PURCHASE',
        quantity: item.quantity,
        userId: user.id,
        reference: existing.purchaseNo,
        purchaseId: existing.id,
        notes: `Received via purchase order ${existing.purchaseNo}`,
      });
    }
    return tx.purchase.update({
      where: { id: purchaseId },
      data: { status: 'RECEIVED', receivedDate: new Date() },
      include: { items: { include: { product: true } }, supplier: true },
    });
  });

  for (const item of existing.items) {
    const refreshed = await prisma.product.findUnique({ where: { id: item.productId } });
    await checkAndNotifyStockLevel(refreshed);
  }

  await createNotification({
    type: 'PURCHASE_RECEIVED',
    title: 'Purchase order received',
    message: `Purchase order ${existing.purchaseNo} from ${existing.supplier.name} was received and stock updated.`,
    link: `/purchases/${purchaseId}`,
  });

  await logActivity({
    userId: user.id,
    action: 'UPDATE',
    entity: 'Purchase',
    entityId: purchaseId,
    description: `Marked purchase order ${existing.purchaseNo} as received.`,
  });

  return updated;
};

const cancelPurchase = async (purchaseId, user) => {
  const existing = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (!existing) throw new ApiError(404, 'Purchase order not found.');
  if (existing.status === 'RECEIVED') throw new ApiError(400, 'Cannot cancel a purchase order that was already received.');

  const updated = await prisma.purchase.update({ where: { id: purchaseId }, data: { status: 'CANCELLED' } });

  await logActivity({
    userId: user.id,
    action: 'UPDATE',
    entity: 'Purchase',
    entityId: purchaseId,
    description: `Cancelled purchase order ${existing.purchaseNo}.`,
  });

  return updated;
};

module.exports = { createPurchase, receivePurchase, cancelPurchase };
