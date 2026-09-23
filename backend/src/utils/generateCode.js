const generateInvoiceNo = (seq) => `INV-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;
const generatePurchaseNo = (seq) => `PO-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;
module.exports = { generateInvoiceNo, generatePurchaseNo };
