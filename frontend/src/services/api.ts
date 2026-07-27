import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to automatically attach authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authorization expiries
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // If we're not on auth routes, redirect to login page
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signup")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  signup: (data: any) => api.post("/auth/signup", data).then((res) => res.data),
  login: (data: any) => api.post("/auth/login", data).then((res) => res.data),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }).then((res) => res.data),
  resetPassword: (data: any) => api.post("/auth/reset-password", data).then((res) => res.data),
  getMe: () => api.get("/auth/me").then((res) => res.data),
};

// Projects endpoints
export const projectsApi = {
  list: () => api.get("/projects").then((res) => res.data),
  get: (id: string) => api.get(`/projects/${id}`).then((res) => res.data),
  create: (data: any) => api.post("/projects", data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/projects/${id}`).then((res) => res.data),
  addMember: (id: string, data: any) => api.post(`/projects/${id}/members`, data).then((res) => res.data),
};

// Tasks endpoints
export const tasksApi = {
  list: (params: { projectId?: string; status?: string; priority?: string; search?: string; page?: number; limit?: number }) =>
    api.get("/tasks", { params }).then((res) => res.data),
  get: (id: string) => api.get(`/tasks/${id}`).then((res) => res.data),
  create: (data: any) => api.post("/tasks", data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/tasks/${id}`).then((res) => res.data),
  
  // Comments (nested under tasks)
  listComments: (taskId: string) => api.get(`/tasks/${taskId}/comments`).then((res) => res.data),
  createComment: (taskId: string, content: string) => api.post(`/tasks/${taskId}/comments`, { content }).then((res) => res.data),
  deleteComment: (id: string) => api.delete(`/comments/${id}`).then((res) => res.data),
};

// Dashboard endpoints
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats").then((res) => res.data),
  getProjectActivity: (projectId: string) => api.get(`/activity/project/${projectId}`).then((res) => res.data),
};

// User Profile endpoints
export const userApi = {
  updateProfile: (data: any) => api.put("/users/profile", data).then((res) => res.data),
  uploadAvatar: (formData: FormData) =>
    api.post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => res.data),
};
