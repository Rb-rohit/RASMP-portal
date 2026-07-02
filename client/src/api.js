import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const getToken = () => localStorage.getItem('rasmp_token');

export const setSession = ({ user, token }) => {
  if (token) localStorage.setItem('rasmp_token', token);
  if (user) localStorage.setItem('rasmp_user', JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem('rasmp_token');
  localStorage.removeItem('rasmp_user');
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});
axiosInstance.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function apiRequest(path, options = {}) {
  try {
    const response = await axiosInstance({
      url: path,
      method: options.method,
      data: options.body, // axios uses 'data' instead of 'body'
      ...options,
    });
    return response.data;
  } catch (error) {
  if (error.code === 'ECONNABORTED' || error.response?.status === 502) {
    throw new Error(
      'RASMP backend is not reachable. Start the server on port 5000, then refresh the client.',
      { cause: error }
    );
  }

  throw new Error(
    error.response?.data?.message ||
    error.message ||
    'RASMP API request failed.',
    { cause: error }
  );
}
}

export const api = {
  bootstrap: () => apiRequest('/bootstrap'),
  session: () => apiRequest('/session'),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  checkEmail: (email) => apiRequest('/auth/check-email', { method: 'POST', body: { email } }),
  register: (user) => apiRequest('/auth/register', { method: 'POST', body: { user } }),
  addRequirement: (requirement) => apiRequest('/requirements', { method: 'POST', body: requirement }),
  updateRequirement: (id, requirement) => apiRequest(`/requirements/${id}`, { method: 'PATCH', body: requirement }),
  deleteRequirement: (id) => apiRequest(`/requirements/${id}`, { method: 'DELETE' }),
  submitBid: (payload) => apiRequest('/quotations', { method: 'POST', body: payload }),
  sendQuotationMessage: (id, text) => apiRequest(`/quotations/${id}/messages`, { method: 'POST', body: { text } }),
  shortlistQuotation: (id) => apiRequest(`/quotations/${id}/shortlist`, { method: 'POST' }),
  selectQuotation: (id) => apiRequest(`/quotations/${id}/select`, { method: 'POST' }),
  updateSupplierVerification: (id, status) => apiRequest(`/suppliers/${id}/verification`, { method: 'PATCH', body: { status } }),
  updateSupplierProfile: (profile) => apiRequest('/suppliers/profile', { method: 'PATCH', body: profile }),
  updateCustomerProfile: (profile) => apiRequest('/customers/profile', { method: 'PATCH', body: profile }),
  changeCustomerPassword: (payload) => apiRequest('/customers/password', { method: 'PATCH', body: payload }),
  updateUserVerification: (id, verified) => apiRequest(`/admin/users/${id}/verification`, { method: 'PATCH', body: { verified } }),
  updateUserStatus: (id, payload) => apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: payload }),
  addCategory: (category) => apiRequest('/admin/categories', { method: 'POST', body: category }),
  updateCategory: (id, category) => apiRequest(`/admin/categories/${id}`, { method: 'PATCH', body: category }),
  generateAdminReport: () => apiRequest('/admin/reports', { method: 'POST' }),
  clearNotifications: (role) => apiRequest(`/notifications/${role}`, { method: 'DELETE' })
};
