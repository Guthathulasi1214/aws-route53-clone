// API base client with cookie credentials
import axios from 'axios';
import { ApiError } from '@/types';

// Use relative URL — Next.js rewrites proxy /api/* → http://localhost:8000/api/*
// This means cookies are set on the same origin (localhost:3000) and always sent
const API_BASE_URL = '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send httpOnly cookies on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized (unless already on login page)
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (!data) return error.message;
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg).join(', ');
    }
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

export default apiClient;
