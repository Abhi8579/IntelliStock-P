import client from './client';

export const getInventory = () => client.get('/inventory');
export const getTransactions = (params) => client.get('/inventory/transactions', { params });
export const adjustStock = (data) => client.post('/inventory/adjust', data);
