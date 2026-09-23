const validateSupplier = (body) => {
  const errors = {};
  if (!body.name || !body.name.trim()) errors.name = 'Supplier name is required.';
  if (body.email && !/^\S+@\S+\.\S+$/.test(body.email)) errors.email = 'Enter a valid email.';
  return { valid: Object.keys(errors).length === 0, errors };
};
module.exports = { validateSupplier };
