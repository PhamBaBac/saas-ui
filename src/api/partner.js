import api from './axios';

export const getPartners = async (params = {}) => {
  const response = await api.get('/partners', { params });
  return response.data;
};

export const createPartner = async (payload) => {
  const response = await api.post('/partners', payload);
  return response.data;
};

export const updatePartner = async (id, payload) => {
  const response = await api.put(`/partners/${id}`, payload);
  return response.data;
};

export const deletePartner = async (id) => {
  const response = await api.delete(`/partners/${id}`);
  return response.data;
};
