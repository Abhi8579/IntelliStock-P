const prisma = require('../config/prisma');
const { applyStockChange, checkAndNotifyStockLevel } = require('./inventoryService');
const { generateInvoiceNo } = require('../utils/generateCode');
const { createNotification } = require('../utils/notify');
const { logActivity } = require('../utils/activityLogger');
const { ApiError } = require('../utils/apiResponse');

const LARGE_ORDER_THRESHOLD = 25000;

// Creates a sale atomically: sale + items + stock decrement + inventory txns + notifications + activity log.
// If any step fails, the whole transaction rolls back so inventory can never go inconsistent.
const createSale = async (payload, user) => {
  const { customerId, items, discount = 0, tax = 0, paymentStatus = 'PAID' } = payload;

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) throw new ApiError(404, 'One of the selected products no longer exists.');
    if (product.currentStock < Number(item.quantity)) {
      throw new ApiError(400, `Not enough stock for "${product.name}". Available: ${product.currentStock}.`);
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + product.sellingPrice * Number(item.quantity);
  }, 0);
  const total = Math.max(0, subtotal - Number(discount) + Number(tax));

  const count = await prisma.sale.count();
  const invoiceNo = generateInvoiceNo(count + 1);

  const sale = await prisma.$transaction(async (tx) => {
    const createdSale = await tx.sale.create({
      data: {
        invoiceNo,
        customerId: customerId || null,
        userId: user.id,
        subtotal,
        discount: Number(discount),
        tax: Number(tax),
        total,
        status: 'COMPLETED',
        paymentStatus,
        items: {
          create: items.map((item) => {
            const product = productMap.get(item.productId);
            return {
              productId: item.productId,
              quantity: Number(item.quantity),
              price: product.sellingPrice,
              total: product.sellingPrice * Number(item.quantity),
            };
          }),
        },
      },
      include: { items: { include: { product: true } }, customer: true },
    });

    for (const item of items) {
      await applyStockChange(tx, {
        productId: item.productId,
        type: 'SALE',
        quantity: -Number(item.quantity),
        userId: user.id,
        reference: invoiceNo,
        saleId: createdSale.id,
        notes: `Sold via invoice ${invoiceNo}`,
      });
    }

    return createdSale;
  });

  for (const item of sale.items) {
    const refreshed = await prisma.product.findUnique({ where: { id: item.productId } });
    await checkAndNotifyStockLevel(refreshed);
  }

  await createNotification({
    type: total >= LARGE_ORDER_THRESHOLD ? 'LARGE_ORDER' : 'NEW_SALE',
    title: total >= LARGE_ORDER_THRESHOLD ? 'Large order placed' : 'New sale recorded',
    message: `Invoice ${invoiceNo} for ₹${total.toLocaleString('en-IN')} was completed.`,
    link: `/sales/${sale.id}`,
  });

  await logActivity({
    userId: user.id,
    action: 'CREATE',
    entity: 'Sale',
    entityId: sale.id,
    description: `Created sale ${invoiceNo} totaling ₹${total.toLocaleString('en-IN')}.`,
  });

  return sale;
};

module.exports = { createSale };
