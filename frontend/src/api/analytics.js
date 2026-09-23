import client from './client';

export const getDashboard = () => client.get('/analytics/dashboard');
export const getSalesAnalytics = (range) => client.get('/analytics/sales', { params: { range } });
export const getInventoryAnalytics = () => client.get('/analytics/inventory');
export const getBusinessAnalytics = () => client.get('/analytics/business');
