import api from './axios';

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const createProduct = async (payload) => {
  const response = await api.post('/products', payload);
  return response.data;
};

export const updateProduct = async (id, payload) => {
  const response = await api.put(`/products/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const updateProductStatus = async (id, active) => {
  const response = await api.patch(`/products/${id}/status`, null, { params: { active } });
  return response.data;
};
