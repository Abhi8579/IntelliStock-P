import client from './client';

export const getUsers = () => client.get('/users');
export const createUser = (data) => client.post('/users', data);
export const setUserStatus = (id, isActive) => client.put(`/users/${id}/status`, { isActive });
