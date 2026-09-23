const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { logActivity } = require('../utils/activityLogger');

const getSuppliers = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const suppliers = await prisma.supplier.findMany({
    where: search ? { OR: [{ name: { contains: search } }, { company: { contains: search } }] } : {},
    include: { _count: { select: { products: true, purchases: true } } },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, 200, 'Suppliers fetched.', suppliers);
});

const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: req.params.id },
    include: { products: true, purchases: { orderBy: { createdAt: 'desc' }, include: { items: true } } },
  });
  if (!supplier) throw new ApiError(404, 'Supplier not found.');

  const totalPurchaseValue = supplier.purchases.filter((p) => p.status === 'RECEIVED').reduce((s, p) => s + p.total, 0);
  const pendingPurchases = supplier.purchases.filter((p) => p.status === 'PENDING' || p.status === 'ORDERED').length;

  sendSuccess(res, 200, 'Supplier fetched.', { ...supplier, totalPurchaseValue, pendingPurchases });
});

const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await prisma.supplier.create({
    data: {
      name: req.body.name,
      company: req.body.company || null,
      email: req.body.email || null,
      phone: req.body.phone || null,
      address: req.body.address || null,
      city: req.body.city || null,
      taxNumber: req.body.taxNumber || null,
      status: req.body.status || 'ACTIVE',
    },
  });
  await logActivity({ userId: req.user.id, action: 'CREATE', entity: 'Supplier', entityId: supplier.id, description: `Added supplier "${supplier.name}".` });
  sendSuccess(res, 201, 'Supplier added successfully.', supplier);
});

const updateSupplier = asyncHandler(async (req, res) => {
  const existing = await prisma.supplier.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Supplier not found.');
  const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, 200, 'Supplier updated successfully.', supplier);
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const existing = await prisma.supplier.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Supplier not found.');
  await prisma.supplier.delete({ where: { id: req.params.id } });
  await logActivity({ userId: req.user.id, action: 'DELETE', entity: 'Supplier', entityId: req.params.id, description: `Deleted supplier "${existing.name}".` });
  sendSuccess(res, 200, 'Supplier deleted successfully.');
});

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };
