import client from './client';

export const getPurchases = (params) => client.get('/purchases', { params });
export const getPurchase = (id) => client.get(`/purchases/${id}`);
export const createPurchase = (data) => client.post('/purchases', data);
export const receivePurchase = (id) => client.post(`/purchases/${id}/receive`);
export const cancelPurchase = (id) => client.post(`/purchases/${id}/cancel`);
