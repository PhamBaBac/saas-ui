import api from './axios';

export const getTenants = async (params = {}) => {
  const response = await api.get('/tenants', { params });
  return response.data;
};

export const approveTenant = async (id) => {
  const response = await api.post(`/tenants/approve/${id}`);
  return response.data;
};

export const patchTenant = async (action, id) => {
  const response = await api.patch(`/tenants/${action}/${id}`);
  return response.data;
};
