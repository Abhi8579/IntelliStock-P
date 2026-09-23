const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { logActivity } = require('../utils/activityLogger');

const getCustomers = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const customers = await prisma.customer.findMany({
    where: search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {},
    include: { _count: { select: { sales: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const withTotals = await Promise.all(customers.map(async (c) => {
    const agg = await prisma.sale.aggregate({ where: { customerId: c.id, status: 'COMPLETED' }, _sum: { total: true }, _max: { createdAt: true } });
    return { ...c, totalSpent: agg._sum.total || 0, lastPurchase: agg._max.createdAt };
  }));

  sendSuccess(res, 200, 'Customers fetched.', withTotals);
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: { sales: { include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } } },
  });
  if (!customer) throw new ApiError(404, 'Customer not found.');

  const completed = customer.sales.filter((s) => s.status === 'COMPLETED');
  const totalSpent = completed.reduce((s, sale) => s + sale.total, 0);
  const avgOrderValue = completed.length ? totalSpent / completed.length : 0;

  sendSuccess(res, 200, 'Customer fetched.', { ...customer, totalSpent, avgOrderValue, orderCount: completed.length });
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await prisma.customer.create({
    data: {
      name: req.body.name,
      email: req.body.email || null,
      phone: req.body.phone || null,
      address: req.body.address || null,
      city: req.body.city || null,
      status: req.body.status || 'ACTIVE',
    },
  });
  await logActivity({ userId: req.user.id, action: 'CREATE', entity: 'Customer', entityId: customer.id, description: `Added customer "${customer.name}".` });
  sendSuccess(res, 201, 'Customer added successfully.', customer);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Customer not found.');
  const customer = await prisma.customer.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, 200, 'Customer updated successfully.', customer);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Customer not found.');
  await prisma.customer.delete({ where: { id: req.params.id } });
  await logActivity({ userId: req.user.id, action: 'DELETE', entity: 'Customer', entityId: req.params.id, description: `Deleted customer "${existing.name}".` });
  sendSuccess(res, 200, 'Customer deleted successfully.');
});

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
