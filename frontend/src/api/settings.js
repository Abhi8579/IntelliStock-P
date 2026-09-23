import client from './client';

export const getSettings = () => client.get('/settings');
export const updateSettings = (data) => client.put('/settings', data);
export const updateProfile = (data) => client.put('/settings/profile', data);
export const changePassword = (data) => client.put('/settings/password', data);
