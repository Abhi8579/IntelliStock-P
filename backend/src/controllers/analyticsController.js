const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const analyticsService = require('../services/analyticsService');

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  const salesChart = await analyticsService.getSalesChart('7d');
  const inventoryAnalytics = await analyticsService.getInventoryAnalytics();
  const topProducts = await analyticsService.getTopProducts(5);

  const lowStockProducts = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { currentStock: 'asc' },
    take: 50,
  });
  const criticalStock = lowStockProducts.filter((p) => p.currentStock <= p.minStock).slice(0, 6);

  const recentTransactions = await prisma.inventoryTransaction.findMany({
    include: { product: true, user: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  sendSuccess(res, 200, 'Dashboard data fetched.', {
    stats, salesChart, inventoryAnalytics, topProducts, criticalStock, recentTransactions,
  });
});

const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { range = '7d' } = req.query;
  const chart = await analyticsService.getSalesChart(range);
  sendSuccess(res, 200, 'Sales analytics fetched.', chart);
});

const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getInventoryAnalytics();
  sendSuccess(res, 200, 'Inventory analytics fetched.', data);
});

const getBusinessAnalytics = asyncHandler(async (req, res) => {
  const [stats, inventoryAnalytics, topProducts] = await Promise.all([
    analyticsService.getDashboardStats(),
    analyticsService.getInventoryAnalytics(),
    analyticsService.getTopProducts(10),
  ]);

  const newCustomers = await prisma.customer.count({
    where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
  });

  const topCustomersRaw = await prisma.sale.groupBy({
    by: ['customerId'],
    where: { customerId: { not: null }, status: 'COMPLETED' },
    _sum: { total: true },
    orderBy: { _sum: { total: 'desc' } },
    take: 5,
  });
  const customers = await prisma.customer.findMany({ where: { id: { in: topCustomersRaw.map((c) => c.customerId) } } });
  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const topCustomers = topCustomersRaw.map((c) => ({ customer: customerMap.get(c.customerId), totalSpent: c._sum.total }));

  sendSuccess(res, 200, 'Business analytics fetched.', {
    stats, inventoryAnalytics, topProducts, newCustomers, topCustomers,
  });
});

module.exports = { getDashboard, getSalesAnalytics, getInventoryAnalytics, getBusinessAnalytics };
