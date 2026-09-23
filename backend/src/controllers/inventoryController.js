const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { applyStockChange, checkAndNotifyStockLevel } = require('../services/inventoryService');
const { logActivity } = require('../utils/activityLogger');

const getInventory = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true, supplier: true },
    orderBy: { currentStock: 'asc' },
  });
  sendSuccess(res, 200, 'Inventory fetched.', products);
});

const getTransactions = asyncHandler(async (req, res) => {
  const { productId, type, page = 1, limit = 20 } = req.query;
  const where = { AND: [productId ? { productId } : {}, type ? { type } : {}] };
  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Math.max(Number(page), 1) - 1) * take;

  const [transactions, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where, include: { product: true, user: true }, orderBy: { createdAt: 'desc' }, skip, take,
    }),
    prisma.inventoryTransaction.count({ where }),
  ]);

  sendSuccess(res, 200, 'Inventory transactions fetched.', transactions, { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) });
});

const adjustStock = asyncHandler(async (req, res) => {
  const { productId, quantity, notes } = req.body;
  if (!productId || quantity === undefined || Number(quantity) === 0) {
    throw new ApiError(422, 'Provide a product and a non-zero quantity to adjust.');
  }

  const product = await prisma.$transaction(async (tx) =>
    applyStockChange(tx, {
      productId,
      type: 'ADJUSTMENT',
      quantity: Number(quantity),
      userId: req.user.id,
      notes: notes || 'Manual stock adjustment',
    })
  );

  await checkAndNotifyStockLevel(product);
  await logActivity({
    userId: req.user.id,
    action: 'ADJUST',
    entity: 'Product',
    entityId: productId,
    description: `Adjusted stock for "${product.name}" by ${quantity > 0 ? '+' : ''}${quantity}.`,
  });

  sendSuccess(res, 200, 'Stock adjusted successfully.', product);
});

module.exports = { getInventory, getTransactions, adjustStock };
