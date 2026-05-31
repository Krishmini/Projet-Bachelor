import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Injecter le JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Déconnecter si le token expire (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/api/login', { email, password });

export const register = (nom, prenom, email, password) =>
  api.post('/api/register', { nom, prenom, email, password });

export const getMe = () => api.get('/api/me');

export const updateProfile = (data) => api.put('/api/profile', data);

// ── Ressources publiques ──────────────────────────────────────────────────────
export const getRessources = (categorie = null) =>
  api.get('/api/ressources', { params: categorie ? { categorie } : {} });

export const getRessource = (id) => api.get(`/api/ressources/${id}`);

// ── Contact ───────────────────────────────────────────────────────────────────
export const sendContact = (data) => api.post('/api/contact', data);

// ── Admin – Ressources ────────────────────────────────────────────────────────
export const adminGetRessources = () => api.get('/api/admin/ressources');

export const adminCreateRessource = (data) => api.post('/api/admin/ressources', data);

export const adminUpdateRessource = (id, data) => api.put(`/api/admin/ressources/${id}`, data);

export const adminValidateRessource = (id) => api.patch(`/api/admin/ressources/${id}/validate`);

export const adminDeleteRessource = (id) => api.delete(`/api/admin/ressources/${id}`);

// ── Admin – Users ─────────────────────────────────────────────────────────────
export const adminGetUsers = () => api.get('/api/admin/users');

export const adminValidateUser = (id) => api.patch(`/api/admin/users/${id}/validate`);

export const adminDeleteUser = (id) => api.delete(`/api/admin/users/${id}`);

export default api;
