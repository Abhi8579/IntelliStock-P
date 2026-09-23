import client from './client';

export const getSetupStatus = () => client.get('/auth/setup-status');
export const requestSetupOtp = (data) => client.post('/auth/setup/request-otp', data);
export const verifySetupOtp = (data) => client.post('/auth/setup/verify-otp', data);

export const login = (data) => client.post('/auth/login', data);
export const getMe = () => client.get('/auth/me');

export const requestPasswordResetOtp = (data) => client.post('/auth/forgot-password/request-otp', data);
export const verifyPasswordResetOtp = (data) => client.post('/auth/forgot-password/verify-otp', data);
export const resetPassword = (data) => client.post('/auth/forgot-password/reset', data);
