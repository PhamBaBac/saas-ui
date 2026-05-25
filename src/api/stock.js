import api from './axios';

export const getStockMovements = async (params = {}) => {
  const response = await api.get('/stocks', { params });
  return response.data;
};

export const createStockMovement = async (payload) => {
  const response = await api.post('/stocks', payload);
  return response.data;
};

export const updateStockMovement = async (id, payload) => {
  const response = await api.put(`/stocks/${id}`, payload);
  return response.data;
};

export const deleteStockMovement = async (id) => {
  const response = await api.delete(`/stocks/${id}`);
  return response.data;
};
