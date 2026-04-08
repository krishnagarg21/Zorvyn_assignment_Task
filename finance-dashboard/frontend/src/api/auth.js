import client from './client';

export const loginAPI = (credentials) => client.post('/auth/login', credentials);

export const registerAPI = (data) => client.post('/auth/register', data);

export const logoutAPI = () => client.post('/auth/logout');
