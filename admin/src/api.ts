import { auth } from './auth';

const BASE = import.meta.env.VITE_API_URL as string;

const authHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${auth.getToken() ?? ''}`,
  'Content-Type': 'application/json',
});

async function authFetch(url: string, opts?: RequestInit): Promise<Response> {
  const res = await fetch(url, opts);
  if (res.status === 401) {
    auth.clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res;
}

export const api = {
  // Auth
  login: (password: string) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    authFetch(`${BASE}/auth/password`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Read (public)
  getProjects: () => fetch(`${BASE}/projects`).then(r => r.json()).then(data => Array.isArray(data) ? data : []),
  getServices: () => fetch(`${BASE}/services`).then(r => r.json()).then(data => Array.isArray(data) ? data : []),
  getTestimonials: () => fetch(`${BASE}/testimonials`).then(r => r.json()).then(data => Array.isArray(data) ? data : []),
  getFaqs: () => fetch(`${BASE}/faqs`).then(r => r.json()).then(data => Array.isArray(data) ? data : []),
  getContent: () => fetch(`${BASE}/content`).then(r => r.json()),

  // Projects
  createProject: (data: unknown) =>
    authFetch(`${BASE}/projects`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }),
  updateProject: (id: string, data: unknown) =>
    authFetch(`${BASE}/projects/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    authFetch(`${BASE}/projects/${id}`, { method: 'DELETE', headers: authHeaders() }),
  reorderProjects: (ids: string[]) =>
    authFetch(`${BASE}/projects/reorder`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ ids }) }),

  // Services
  createService: (data: unknown) =>
    authFetch(`${BASE}/services`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }),
  updateService: (id: string, data: unknown) =>
    authFetch(`${BASE}/services/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
  deleteService: (id: string) =>
    authFetch(`${BASE}/services/${id}`, { method: 'DELETE', headers: authHeaders() }),
  reorderServices: (ids: string[]) =>
    authFetch(`${BASE}/services/reorder`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ ids }) }),

  // Testimonials
  createTestimonial: (data: unknown) =>
    authFetch(`${BASE}/testimonials`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }),
  updateTestimonial: (id: string, data: unknown) =>
    authFetch(`${BASE}/testimonials/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
  deleteTestimonial: (id: string) =>
    authFetch(`${BASE}/testimonials/${id}`, { method: 'DELETE', headers: authHeaders() }),
  reorderTestimonials: (ids: string[]) =>
    authFetch(`${BASE}/testimonials/reorder`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ ids }) }),

  // FAQs
  createFaq: (data: unknown) =>
    authFetch(`${BASE}/faqs`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }),
  updateFaq: (id: string, data: unknown) =>
    authFetch(`${BASE}/faqs/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
  deleteFaq: (id: string) =>
    authFetch(`${BASE}/faqs/${id}`, { method: 'DELETE', headers: authHeaders() }),
  reorderFaqs: (ids: string[]) =>
    authFetch(`${BASE}/faqs/reorder`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ ids }) }),

  // Content
  updateContent: (data: unknown) =>
    authFetch(`${BASE}/content`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),

  // Upload
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return authFetch(`${BASE}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.getToken() ?? ''}` },
      body: fd,
    });
  },
  deleteImage: (filename: string) =>
    authFetch(`${BASE}/upload/${filename}`, { method: 'DELETE', headers: authHeaders() }),
};
