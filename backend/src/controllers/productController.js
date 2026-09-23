const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { logActivity } = require('../utils/activityLogger');

const getProducts = asyncHandler(async (req, res) => {
  const { search = '', category, status, stockStatus, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 12 } = req.query;

  const where = {
    AND: [
      search
        ? { OR: [{ name: { contains: search } }, { sku: { contains: search } }, { barcode: { contains: search } }] }
        : {},
      category ? { categoryId: category } : {},
      status ? { status } : {},
    ],
  };

  const take = Math.min(Number(limit) || 12, 100);
  const skip = (Math.max(Number(page), 1) - 1) * take;

  let products = await prisma.product.findMany({
    where,
    include: { category: true, supplier: true },
    orderBy: { [sortBy]: sortOrder },
  });

  if (stockStatus === 'low') products = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock);
  if (stockStatus === 'out') products = products.filter((p) => p.currentStock <= 0);
  if (stockStatus === 'healthy') products = products.filter((p) => p.currentStock > p.minStock);

  const total = products.length;
  const paged = products.slice(skip, skip + take);

  sendSuccess(res, 200, 'Products fetched.', paged, { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      supplier: true,
      inventoryTxns: { orderBy: { createdAt: 'desc' }, take: 30 },
    },
  });
  if (!product) throw new ApiError(404, 'Product not found.');

  const salesAgg = await prisma.saleItem.aggregate({
    where: { productId: product.id },
    _sum: { quantity: true, total: true },
  });

  sendSuccess(res, 200, 'Product fetched.', {
    ...product,
    totalUnitsSold: salesAgg._sum.quantity || 0,
    totalRevenue: salesAgg._sum.total || 0,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { sku: req.body.sku } });
  if (existing) throw new ApiError(409, 'A product with this SKU already exists.');

  const product = await prisma.product.create({
    data: {
      name: req.body.name,
      sku: req.body.sku,
      barcode: req.body.barcode || null,
      description: req.body.description || null,
      image: req.body.image || null,
      categoryId: req.body.categoryId || null,
      supplierId: req.body.supplierId || null,
      costPrice: Number(req.body.costPrice),
      sellingPrice: Number(req.body.sellingPrice),
      currentStock: Number(req.body.currentStock) || 0,
      minStock: Number(req.body.minStock) || 10,
      maxStock: Number(req.body.maxStock) || 1000,
      status: req.body.status || 'ACTIVE',
    },
  });

  if (product.currentStock > 0) {
    await prisma.inventoryTransaction.create({
      data: {
        productId: product.id,
        type: 'ADJUSTMENT',
        quantity: product.currentStock,
        stockAfter: product.currentStock,
        notes: 'Initial stock on product creation.',
        userId: req.user.id,
      },
    });
  }

  await logActivity({ userId: req.user.id, action: 'CREATE', entity: 'Product', entityId: product.id, description: `Created product "${product.name}" (${product.sku}).` });

  sendSuccess(res, 201, 'Product created successfully.', product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Product not found.');

  if (req.body.sku && req.body.sku !== existing.sku) {
    const dup = await prisma.product.findUnique({ where: { sku: req.body.sku } });
    if (dup) throw new ApiError(409, 'A product with this SKU already exists.');
  }

  const { currentStock, ...rest } = req.body; // stock changes must go through /inventory/adjust
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      costPrice: rest.costPrice !== undefined ? Number(rest.costPrice) : undefined,
      sellingPrice: rest.sellingPrice !== undefined ? Number(rest.sellingPrice) : undefined,
      minStock: rest.minStock !== undefined ? Number(rest.minStock) : undefined,
      maxStock: rest.maxStock !== undefined ? Number(rest.maxStock) : undefined,
    },
  });

  await logActivity({ userId: req.user.id, action: 'UPDATE', entity: 'Product', entityId: product.id, description: `Updated product "${product.name}".` });

  sendSuccess(res, 200, 'Product updated successfully.', product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Product not found.');

  await prisma.product.delete({ where: { id: req.params.id } });
  await logActivity({ userId: req.user.id, action: 'DELETE', entity: 'Product', entityId: req.params.id, description: `Deleted product "${existing.name}".` });

  sendSuccess(res, 200, 'Product deleted successfully.');
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
