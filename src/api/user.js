import api from './axios';

export const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const createUser = async (payload) => {
  const response = await api.post('/users', payload);
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const disableUser = async (id) => {
  const response = await api.put(`/users/${id}/disable`);
  return response.data;
};

export const enableUser = async (id) => {
  const response = await api.put(`/users/${id}/enable`);
  return response.data;
};
