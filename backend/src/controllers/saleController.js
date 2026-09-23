const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const saleService = require('../services/saleService');

const getSales = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status } = req.query;
  const take = Math.min(Number(limit) || 15, 100);
  const skip = (Math.max(Number(page), 1) - 1) * take;
  const where = status ? { status } : {};

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where, include: { customer: true, user: true, items: true }, orderBy: { createdAt: 'desc' }, skip, take,
    }),
    prisma.sale.count({ where }),
  ]);

  sendSuccess(res, 200, 'Sales fetched.', sales, { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) });
});

const getSale = asyncHandler(async (req, res) => {
  const sale = await prisma.sale.findUnique({
    where: { id: req.params.id },
    include: { customer: true, user: true, items: { include: { product: true } } },
  });
  if (!sale) throw new ApiError(404, 'Sale not found.');
  sendSuccess(res, 200, 'Sale fetched.', sale);
});

const createSale = asyncHandler(async (req, res) => {
  const sale = await saleService.createSale(req.body, req.user);
  sendSuccess(res, 201, 'Sale completed successfully.', sale);
});

module.exports = { getSales, getSale, createSale };
