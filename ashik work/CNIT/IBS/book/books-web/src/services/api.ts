import axios from 'axios';
import { User, defaultAdmin } from '../models/User';

// In-memory storage for demo purposes. In production, use a proper database
let users: User[] = [defaultAdmin];
let currentUser: User | null = null;

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Refresh token logic here if needed
        const token = localStorage.getItem('refresh_token');
        const response = await axios.post('/api/auth/refresh', { token });
        const { access_token } = response.data;
        
        localStorage.setItem('auth_token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        return api(originalRequest);
      } catch (err) {
        // If refresh token fails, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    currentUser = user;
    return user;
  },

  logout: async (): Promise<void> => {
    currentUser = null;
  },

  getCurrentUser: (): User | null => {
    return currentUser;
  },

  isAdmin: (): boolean => {
    return currentUser?.role === 'admin';
  },

  registerUser: async (username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User> => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only administrators can register new users');
    }

    if (users.some(u => u.username === username)) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      id: String(users.length + 1),
      username,
      password,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);
    return newUser;
  },
};

export default api;
