const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const purchaseService = require('../services/purchaseService');

const getPurchases = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status } = req.query;
  const take = Math.min(Number(limit) || 15, 100);
  const skip = (Math.max(Number(page), 1) - 1) * take;
  const where = status ? { status } : {};

  const [purchases, total] = await Promise.all([
    prisma.purchase.findMany({
      where, include: { supplier: true, user: true, items: true }, orderBy: { createdAt: 'desc' }, skip, take,
    }),
    prisma.purchase.count({ where }),
  ]);

  sendSuccess(res, 200, 'Purchases fetched.', purchases, { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) });
});

const getPurchase = asyncHandler(async (req, res) => {
  const purchase = await prisma.purchase.findUnique({
    where: { id: req.params.id },
    include: { supplier: true, user: true, items: { include: { product: true } } },
  });
  if (!purchase) throw new ApiError(404, 'Purchase order not found.');
  sendSuccess(res, 200, 'Purchase fetched.', purchase);
});

const createPurchase = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.createPurchase(req.body, req.user);
  sendSuccess(res, 201, 'Purchase order created successfully.', purchase);
});

const receivePurchase = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.receivePurchase(req.params.id, req.user);
  sendSuccess(res, 200, 'Purchase order received. Stock updated.', purchase);
});

const cancelPurchase = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.cancelPurchase(req.params.id, req.user);
  sendSuccess(res, 200, 'Purchase order cancelled.', purchase);
});

module.exports = { getPurchases, getPurchase, createPurchase, receivePurchase, cancelPurchase };
