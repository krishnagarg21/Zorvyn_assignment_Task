import client from './client';

export const getUsers = (params) => client.get('/users', { params });

export const getUser = (id) => client.get(`/users/${id}`);

export const getMe = () => client.get('/users/me');

export const createUser = (data) => client.post('/users', data);

export const updateUser = (id, data) => client.patch(`/users/${id}`, data);

export const deleteUser = (id) => client.delete(`/users/${id}`);
