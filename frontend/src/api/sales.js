import client from './client';

export const getSales = (params) => client.get('/sales', { params });
export const getSale = (id) => client.get(`/sales/${id}`);
export const createSale = (data) => client.post('/sales', data);
