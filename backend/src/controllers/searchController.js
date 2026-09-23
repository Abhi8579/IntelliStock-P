const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return sendSuccess(res, 200, 'Search results.', { products: [], customers: [], suppliers: [], sales: [] });

  const [products, customers, suppliers, sales] = await Promise.all([
    prisma.product.findMany({ where: { OR: [{ name: { contains: q } }, { sku: { contains: q } }] }, take: 5 }),
    prisma.customer.findMany({ where: { OR: [{ name: { contains: q } }, { email: { contains: q } }] }, take: 5 }),
    prisma.supplier.findMany({ where: { OR: [{ name: { contains: q } }, { company: { contains: q } }] }, take: 5 }),
    prisma.sale.findMany({ where: { invoiceNo: { contains: q } }, take: 5, include: { customer: true } }),
  ]);

  sendSuccess(res, 200, 'Search results.', { products, customers, suppliers, sales });
});

module.exports = { globalSearch };
