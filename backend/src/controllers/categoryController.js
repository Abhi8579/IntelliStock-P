const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  sendSuccess(res, 200, 'Categories fetched.', categories);
});

const createCategory = asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.name.trim()) throw new ApiError(422, 'Category name is required.');
  const existing = await prisma.category.findUnique({ where: { name: req.body.name } });
  if (existing) throw new ApiError(409, 'This category already exists.');
  const category = await prisma.category.create({ data: { name: req.body.name, description: req.body.description || null } });
  sendSuccess(res, 201, 'Category created.', category);
});

module.exports = { getCategories, createCategory };
