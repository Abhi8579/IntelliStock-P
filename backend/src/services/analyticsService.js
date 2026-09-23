const prisma = require('../config/prisma');

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return startOfDay(d); };

const sumSales = async (where) => {
  const agg = await prisma.sale.aggregate({ where, _sum: { total: true }, _count: true });
  return { total: agg._sum.total || 0, count: agg._count || 0 };
};

const getDashboardStats = async () => {
  const [totalProducts, products, todaySales, monthSales, prevMonthSales, pendingPurchases, totalCustomers, totalSuppliers] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.findMany({ select: { currentStock: true, minStock: true, costPrice: true, sellingPrice: true } }),
      sumSales({ createdAt: { gte: startOfDay() }, status: 'COMPLETED' }),
      sumSales({ createdAt: { gte: startOfMonth() }, status: 'COMPLETED' }),
      sumSales({
        createdAt: { gte: startOfMonth(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)), lt: startOfMonth() },
        status: 'COMPLETED',
      }),
      prisma.purchase.count({ where: { status: { in: ['PENDING', 'ORDERED'] } } }),
      prisma.customer.count(),
      prisma.supplier.count(),
    ]);

  const inventoryValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);
  const potentialRevenue = products.reduce((sum, p) => sum + p.currentStock * p.sellingPrice, 0);
  const lowStock = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length;
  const outOfStock = products.filter((p) => p.currentStock <= 0).length;

  const revenueChange = prevMonthSales.total > 0
    ? (((monthSales.total - prevMonthSales.total) / prevMonthSales.total) * 100).toFixed(1)
    : monthSales.total > 0 ? 100 : 0;

  return {
    totalProducts,
    inventoryValue,
    potentialRevenue,
    todayRevenue: todaySales.total,
    todayOrders: todaySales.count,
    monthRevenue: monthSales.total,
    monthOrders: monthSales.count,
    revenueChangePercent: Number(revenueChange),
    lowStock,
    outOfStock,
    pendingPurchases,
    totalCustomers,
    totalSuppliers,
  };
};

const getSalesChart = async (range = '7d') => {
  const rangeMap = { '7d': 7, '30d': 30, '3m': 90, '6m': 180, '1y': 365 };
  const days = rangeMap[range] || 7;
  const since = daysAgo(days - 1);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: since }, status: 'COMPLETED' },
    select: { createdAt: true, total: true, subtotal: true },
  });

  const items = await prisma.saleItem.findMany({
    where: { sale: { createdAt: { gte: since }, status: 'COMPLETED' } },
    select: { total: true, quantity: true, product: { select: { costPrice: true } }, sale: { select: { createdAt: true } } },
  });

  const bucketSize = days > 60 ? 'month' : 'day';
  const buckets = new Map();

  const keyFor = (date) => {
    if (bucketSize === 'month') return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return date.toISOString().slice(0, 10);
  };

  for (const s of sales) {
    const key = keyFor(new Date(s.createdAt));
    if (!buckets.has(key)) buckets.set(key, { date: key, revenue: 0, orders: 0, profit: 0 });
    buckets.get(key).revenue += s.total;
    buckets.get(key).orders += 1;
  }
  for (const it of items) {
    const key = keyFor(new Date(it.sale.createdAt));
    if (!buckets.has(key)) buckets.set(key, { date: key, revenue: 0, orders: 0, profit: 0 });
    buckets.get(key).profit += it.total - it.product.costPrice * it.quantity;
  }

  return Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date));
};

const getInventoryAnalytics = async () => {
  const products = await prisma.product.findMany({
    include: { category: true },
  });

  const categoryMap = new Map();
  for (const p of products) {
    const name = p.category?.name || 'Uncategorized';
    if (!categoryMap.has(name)) categoryMap.set(name, { name, value: 0, count: 0 });
    const bucket = categoryMap.get(name);
    bucket.value += p.currentStock * p.costPrice;
    bucket.count += 1;
  }

  const stockDistribution = [
    { name: 'Healthy', value: products.filter((p) => p.currentStock > p.minStock).length },
    { name: 'Low Stock', value: products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length },
    { name: 'Out of Stock', value: products.filter((p) => p.currentStock <= 0).length },
  ];

  const saleItemAgg = await prisma.saleItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
  });
  const soldMap = new Map(saleItemAgg.map((s) => [s.productId, s._sum.quantity || 0]));
  const withSales = products.map((p) => ({ ...p, sold: soldMap.get(p.id) || 0 }));
  const fastMoving = [...withSales].sort((a, b) => b.sold - a.sold).slice(0, 5)
    .map((p) => ({ name: p.name, sold: p.sold, stock: p.currentStock }));
  const slowMoving = [...withSales].sort((a, b) => a.sold - b.sold).slice(0, 5)
    .map((p) => ({ name: p.name, sold: p.sold, stock: p.currentStock }));

  return {
    categoryDistribution: Array.from(categoryMap.values()),
    stockDistribution,
    fastMoving,
    slowMoving,
  };
};

const getTopProducts = async (limit = 5) => {
  const agg = await prisma.saleItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { total: 'desc' } },
    take: limit,
  });
  const products = await prisma.product.findMany({ where: { id: { in: agg.map((a) => a.productId) } } });
  const productMap = new Map(products.map((p) => [p.id, p]));
  return agg.map((a) => ({
    product: productMap.get(a.productId),
    quantitySold: a._sum.quantity,
    revenue: a._sum.total,
  }));
};

module.exports = { getDashboardStats, getSalesChart, getInventoryAnalytics, getTopProducts };
