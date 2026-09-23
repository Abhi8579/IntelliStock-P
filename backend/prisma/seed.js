/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

const CATEGORY_NAMES = [
  'Peripherals', 'Storage', 'Networking', 'Audio', 'Displays', 'Power & Cables',
  'Laptops & Accessories', 'Components', 'Office Electronics', 'Smart Home',
];

const SUPPLIER_SEED = [
  { name: 'Rajesh Kumar', company: 'TechDistributors India Pvt Ltd', city: 'Mumbai' },
  { name: 'Anita Sharma', company: 'Digital World Wholesale', city: 'Delhi' },
  { name: 'Vikram Mehta', company: 'ElectroMart Supplies', city: 'Bengaluru' },
  { name: 'Priya Nair', company: 'Southern Circuits Co.', city: 'Chennai' },
  { name: 'Sanjay Gupta', company: 'Gupta Electronics Traders', city: 'Pune' },
  { name: 'Deepa Iyer', company: 'Coastal Tech Imports', city: 'Kochi' },
  { name: 'Arvind Singh', company: 'Northern Gadget Hub', city: 'Jaipur' },
  { name: 'Meera Patel', company: 'Patel Computer Peripherals', city: 'Ahmedabad' },
  { name: 'Karan Malhotra', company: 'Malhotra Impex', city: 'Chandigarh' },
  { name: 'Ritu Verma', company: 'Verma Trading Co.', city: 'Lucknow' },
];

const CUSTOMER_FIRST = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Rohan',
  'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kavya', 'Myra', 'Anika', 'Riya', 'Pari', 'Ira'];
const CUSTOMER_LAST = ['Sharma', 'Verma', 'Gupta', 'Iyer', 'Nair', 'Reddy', 'Rao', 'Mehta', 'Kapoor', 'Joshi',
  'Chopra', 'Bose', 'Das', 'Pillai', 'Menon'];
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];

const PRODUCTS_SEED = [
  ['Wireless Mouse', 'Peripherals', 599, 799],
  ['Wireless Mouse Pro', 'Peripherals', 899, 1299],
  ['Mechanical Keyboard RGB', 'Peripherals', 2999, 4499],
  ['Compact Mechanical Keyboard', 'Peripherals', 2199, 3299],
  ['USB-C Hub 7-in-1', 'Peripherals', 1299, 1999],
  ['USB-C Hub 4-in-1', 'Peripherals', 799, 1199],
  ['Laptop Stand Aluminium', 'Laptops & Accessories', 1099, 1699],
  ['Laptop Cooling Pad', 'Laptops & Accessories', 899, 1399],
  ['Laptop Backpack 15.6"', 'Laptops & Accessories', 1499, 2299],
  ['HDMI Cable 2M', 'Power & Cables', 249, 399],
  ['HDMI Cable 5M', 'Power & Cables', 449, 699],
  ['USB-C to USB-C Cable', 'Power & Cables', 299, 499],
  ['1080p Webcam', 'Peripherals', 1799, 2799],
  ['4K Webcam', 'Peripherals', 3499, 4999],
  ['Bluetooth Speaker Mini', 'Audio', 1299, 1999],
  ['Bluetooth Speaker Pro', 'Audio', 2999, 4499],
  ['Wireless Earbuds', 'Audio', 1999, 2999],
  ['Over-ear Headphones', 'Audio', 2499, 3999],
  ['500GB SSD', 'Storage', 2799, 3999],
  ['1TB SSD', 'Storage', 4499, 6499],
  ['2TB External HDD', 'Storage', 4999, 6999],
  ['64GB Pen Drive', 'Storage', 399, 649],
  ['128GB Pen Drive', 'Storage', 699, 999],
  ['8GB DDR4 RAM', 'Components', 1499, 2199],
  ['16GB DDR4 RAM', 'Components', 2799, 3999],
  ['24-inch Full HD Monitor', 'Displays', 8999, 11999],
  ['27-inch QHD Monitor', 'Displays', 15999, 20999],
  ['32-inch 4K Monitor', 'Displays', 24999, 32999],
  ['Monitor Arm Stand', 'Displays', 1999, 2999],
  ['Wi-Fi Router AC1200', 'Networking', 1799, 2599],
  ['Wi-Fi 6 Router', 'Networking', 3999, 5499],
  ['8-Port Network Switch', 'Networking', 1299, 1899],
  ['Smart Plug', 'Smart Home', 699, 999],
  ['Smart Bulb (Pack of 2)', 'Smart Home', 999, 1499],
  ['Smart Security Camera', 'Smart Home', 2499, 3499],
  ['Multi-port USB Charger', 'Power & Cables', 899, 1399],
  ['65W USB-C Charger', 'Power & Cables', 1499, 2199],
  ['Power Bank 10000mAh', 'Power & Cables', 999, 1599],
  ['Power Bank 20000mAh', 'Power & Cables', 1799, 2599],
  ['Wireless Charging Pad', 'Power & Cables', 799, 1299],
  ['Document Scanner', 'Office Electronics', 6999, 9999],
  ['All-in-One Printer', 'Office Electronics', 8999, 12999],
  ['Label Printer', 'Office Electronics', 3999, 5499],
  ['Paper Shredder', 'Office Electronics', 2999, 4299],
  ['Graphics Tablet', 'Components', 3499, 4999],
  ['Cooling Fan for CPU', 'Components', 599, 899],
  ['Thermal Paste', 'Components', 249, 399],
  ['Cable Management Kit', 'Power & Cables', 349, 599],
  ['Ergonomic Mouse Pad', 'Peripherals', 449, 699],
  ['Adjustable Phone Stand', 'Peripherals', 349, 599],
  ['Portable SSD Enclosure', 'Storage', 999, 1499],
  ['Ring Light with Tripod', 'Office Electronics', 1299, 1999],
  ['Conference Speakerphone', 'Audio', 4999, 6999],
  ['Barcode Scanner', 'Office Electronics', 2499, 3499],
];

async function main() {
  console.log('🌱 Seeding IntelliStock Pro demo business data...');

  // This project's security model requires the FIRST user to be created
  // through the app's own onboarding flow (Register → OTP → Admin), not by
  // this script - that's the only way "first user becomes Admin" can be
  // tested honestly. So this script never creates the first user itself.
  const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!existingAdmin) {
    console.error('\n❌ No Admin account found.');
    console.error('   Start the backend (npm run dev), open the frontend, and complete');
    console.error('   the "Create Admin Account" first-run setup (with OTP) before seeding.');
    console.error('   Then run `npm run seed` again to populate demo business data.\n');
    process.exit(1);
  }

  console.log('Clearing existing business data (users are kept)...');
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.category.deleteMany();
  await prisma.settings.deleteMany();
  // Remove any previously-seeded demo Manager/Staff so re-running seed is idempotent,
  // but never touch real Admin accounts created through onboarding.
  await prisma.user.deleteMany({ where: { email: { in: ['manager@intellistock.demo', 'staff@intellistock.demo'] } } });

  console.log('Creating demo Manager & Staff accounts for realistic activity...');
  const randomPassword = () => Math.random().toString(36).slice(-10) + 'A1';
  const managerPassword = randomPassword();
  const staffPassword = randomPassword();

  const manager = await prisma.user.create({ data: { name: 'Meera Manager', email: 'manager@intellistock.demo', password: await bcrypt.hash(managerPassword, 10), role: 'MANAGER' } });
  const staff = await prisma.user.create({ data: { name: 'Suresh Staff', email: 'staff@intellistock.demo', password: await bcrypt.hash(staffPassword, 10), role: 'STAFF' } });
  const admin = existingAdmin;
  const users = [admin, manager, staff];

  console.log(`\n   Demo Manager login: manager@intellistock.demo / ${managerPassword}`);
  console.log(`   Demo Staff login:   staff@intellistock.demo / ${staffPassword}`);
  console.log('   (Random passwords, printed here once for your own local testing only.)\n');

  console.log('Creating categories...');
  const categories = {};
  for (const name of CATEGORY_NAMES) {
    categories[name] = await prisma.category.create({ data: { name, description: `${name} and related products` } });
  }

  console.log('Creating suppliers...');
  const suppliers = [];
  for (const s of SUPPLIER_SEED) {
    suppliers.push(await prisma.supplier.create({
      data: {
        name: s.name,
        company: s.company,
        email: `${s.name.toLowerCase().replace(/\s/g, '.')}@${s.company.split(' ')[0].toLowerCase()}.in`,
        phone: `+91 9${rand(100000000, 999999999)}`,
        address: `${rand(1, 200)}, Industrial Area, Phase ${rand(1, 3)}`,
        city: s.city,
        taxNumber: `${rand(10, 37)}ABCDE${rand(1000, 9999)}F1Z${rand(1, 9)}`,
        status: 'ACTIVE',
      },
    }));
  }

  console.log('Creating customers...');
  const customers = [];
  for (let i = 0; i < 35; i++) {
    const first = pick(CUSTOMER_FIRST);
    const last = pick(CUSTOMER_LAST);
    customers.push(await prisma.customer.create({
      data: {
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${rand(1, 99)}@example.com`,
        phone: `+91 8${rand(100000000, 999999999)}`,
        address: `${rand(1, 500)}, ${pick(['MG Road', 'Park Street', 'Ring Road', 'Station Road', 'Main Bazaar'])}`,
        city: pick(CITIES),
        status: 'ACTIVE',
      },
    }));
  }

  console.log('Creating products...');
  const products = [];
  for (let i = 0; i < PRODUCTS_SEED.length; i++) {
    const [name, catName, cost, sell] = PRODUCTS_SEED[i];
    const stock = rand(0, 150);
    const minStock = rand(10, 25);
    products.push(await prisma.product.create({
      data: {
        name,
        sku: `ISK-${String(1000 + i)}`,
        barcode: `8901${rand(100000000, 999999999)}`,
        description: `${name} - premium quality, reliable performance for everyday business and personal use.`,
        categoryId: categories[catName].id,
        supplierId: pick(suppliers).id,
        costPrice: cost,
        sellingPrice: sell,
        currentStock: stock,
        minStock,
        maxStock: minStock * 20,
        status: 'ACTIVE',
        createdAt: daysAgo(rand(30, 365)),
      },
    }));
  }

  console.log('Creating initial stock inventory transactions...');
  for (const p of products) {
    await prisma.inventoryTransaction.create({
      data: {
        productId: p.id,
        type: 'ADJUSTMENT',
        quantity: p.currentStock,
        stockAfter: p.currentStock,
        notes: 'Initial stock load',
        userId: admin.id,
        createdAt: p.createdAt,
      },
    });
  }

  console.log('Creating purchase orders...');
  for (let i = 0; i < 55; i++) {
    const supplier = pick(suppliers);
    const itemCount = rand(1, 4);
    const chosenProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, itemCount);
    const status = pick(['RECEIVED', 'RECEIVED', 'RECEIVED', 'PENDING', 'ORDERED', 'CANCELLED']);
    const createdAt = daysAgo(rand(1, 180));

    const items = chosenProducts.map((p) => {
      const quantity = rand(10, 100);
      const cost = p.costPrice;
      return { productId: p.id, quantity, cost, total: cost * quantity };
    });
    const subtotal = items.reduce((s, it) => s + it.total, 0);

    await prisma.purchase.create({
      data: {
        purchaseNo: `PO-${createdAt.getFullYear()}-${String(100000 + i)}`,
        supplierId: supplier.id,
        userId: pick([admin, manager]).id,
        subtotal,
        total: subtotal,
        status,
        expectedDate: new Date(createdAt.getTime() + 7 * 86400000),
        receivedDate: status === 'RECEIVED' ? new Date(createdAt.getTime() + rand(2, 6) * 86400000) : null,
        createdAt,
        items: { create: items },
      },
    });
  }

  console.log('Creating sales with items and inventory transactions...');
  let invoiceCounter = 1;
  for (let i = 0; i < 130; i++) {
    const createdAt = daysAgo(rand(0, 200));
    const customer = Math.random() > 0.15 ? pick(customers) : null;
    const itemCount = rand(1, 5);
    const chosenProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, itemCount);
    const user = pick(users);
    const status = pick(['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING', 'CANCELLED']);

    const items = chosenProducts.map((p) => {
      const quantity = rand(1, 6);
      return { productId: p.id, quantity, price: p.sellingPrice, total: p.sellingPrice * quantity };
    });
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const discount = Math.random() > 0.7 ? Math.round(subtotal * 0.05) : 0;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal - discount + tax;

    const sale = await prisma.sale.create({
      data: {
        invoiceNo: `INV-${createdAt.getFullYear()}-${String(invoiceCounter++).padStart(6, '0')}`,
        customerId: customer ? customer.id : null,
        userId: user.id,
        subtotal,
        discount,
        tax,
        total,
        status,
        paymentStatus: pick(['PAID', 'PAID', 'PAID', 'UNPAID', 'PARTIAL']),
        createdAt,
        items: { create: items },
      },
    });

    if (status === 'COMPLETED') {
      for (const it of items) {
        const product = products.find((p) => p.id === it.productId);
        const newStock = Math.max(0, product.currentStock - it.quantity);
        await prisma.inventoryTransaction.create({
          data: {
            productId: it.productId,
            type: 'SALE',
            quantity: -it.quantity,
            stockAfter: newStock,
            reference: sale.invoiceNo,
            saleId: sale.id,
            userId: user.id,
            createdAt,
          },
        });
      }
    }
  }

  console.log('Creating a handful of stock adjustments and returns for realism...');
  for (let i = 0; i < 20; i++) {
    const product = pick(products);
    const type = pick(['ADJUSTMENT', 'RETURN']);
    const quantity = type === 'RETURN' ? rand(1, 5) : rand(-5, 5);
    await prisma.inventoryTransaction.create({
      data: {
        productId: product.id,
        type,
        quantity,
        stockAfter: Math.max(0, product.currentStock + quantity),
        notes: type === 'RETURN' ? 'Customer return processed' : 'Stock count correction',
        userId: pick(users).id,
        createdAt: daysAgo(rand(0, 60)),
      },
    });
  }

  console.log('Creating notifications...');
  const lowStockProducts = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).slice(0, 8);
  const outOfStockProducts = products.filter((p) => p.currentStock === 0).slice(0, 5);
  for (const p of lowStockProducts) {
    await prisma.notification.create({
      data: { type: 'LOW_STOCK', title: 'Low stock alert', message: `${p.name} (SKU: ${p.sku}) has only ${p.currentStock} units left.`, link: `/products/${p.id}`, isRead: Math.random() > 0.6 },
    });
  }
  for (const p of outOfStockProducts) {
    await prisma.notification.create({
      data: { type: 'OUT_OF_STOCK', title: 'Product out of stock', message: `${p.name} (SKU: ${p.sku}) is now out of stock.`, link: `/products/${p.id}`, isRead: Math.random() > 0.6 },
    });
  }
  await prisma.notification.create({ data: { type: 'SYSTEM', title: 'Welcome to IntelliStock Pro', message: 'Your inventory intelligence platform is ready to use.', isRead: true } });

  console.log('Creating activity logs...');
  const actions = [
    { action: 'LOGIN', entity: 'User', description: 'logged in.' },
    { action: 'CREATE', entity: 'Product', description: 'created a new product.' },
    { action: 'UPDATE', entity: 'Product', description: 'updated product details.' },
    { action: 'CREATE', entity: 'Sale', description: 'recorded a new sale.' },
    { action: 'CREATE', entity: 'Purchase', description: 'created a purchase order.' },
    { action: 'ADJUST', entity: 'Product', description: 'adjusted stock levels.' },
    { action: 'CREATE', entity: 'Supplier', description: 'added a new supplier.' },
    { action: 'CREATE', entity: 'Customer', description: 'added a new customer.' },
  ];
  for (let i = 0; i < 60; i++) {
    const a = pick(actions);
    const user = pick(users);
    await prisma.activityLog.create({
      data: { userId: user.id, action: a.action, entity: a.entity, description: `${user.name} ${a.description}`, createdAt: daysAgo(rand(0, 90)) },
    });
  }

  console.log('Creating default settings...');
  await prisma.settings.create({ data: { id: '1' } });

  console.log('✅ Seed completed successfully!');
  console.log(`Demo business data attached to Admin: ${admin.email}`);
  console.log('Manager/Staff demo logins were printed above this line - scroll up if you missed them.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
