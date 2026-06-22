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

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 502) {
      throw new Error('RASMP backend is not reachable. Start the server on port 5000, then refresh the client.');
    }

    throw new Error(data.message || 'RASMP API request failed.');
  }
  console.log("API URL:", API_BASE_URL);
  console.log("API Response:", data);
  return data;
}

export const api = {
  bootstrap: () => apiRequest('/bootstrap'),
  session: () => apiRequest('/session'),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  checkEmail: (email) => apiRequest('/auth/check-email', { method: 'POST', body: { email } }),
  register: (user) => apiRequest('/auth/register', { method: 'POST', body: { user } }),
  addRequirement: (requirement) => apiRequest('/requirements', { method: 'POST', body: requirement }),
  deleteRequirement: (id) => apiRequest(`/requirements/${id}`, { method: 'DELETE' }),
  submitBid: (payload) => apiRequest('/quotations', { method: 'POST', body: payload }),
  shortlistQuotation: (id) => apiRequest(`/quotations/${id}/shortlist`, { method: 'POST' }),
  selectQuotation: (id) => apiRequest(`/quotations/${id}/select`, { method: 'POST' }),
  updateSupplierVerification: (id, status) => apiRequest(`/suppliers/${id}/verification`, { method: 'PATCH', body: { status } }),
  updateSupplierProfile: (profile) => apiRequest('/suppliers/profile', { method: 'PATCH', body: profile }),
  updateCustomerProfile: (profile) => apiRequest('/customers/profile', { method: 'PATCH', body: profile }),
  changeCustomerPassword: (payload) => apiRequest('/customers/password', { method: 'PATCH', body: payload }),
  clearNotifications: (role) => apiRequest(`/notifications/${role}`, { method: 'DELETE' })
};
