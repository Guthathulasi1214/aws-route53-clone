import apiClient from '@/lib/api';
import { LoginRequest, LoginResponse, User } from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const resp = await apiClient.post<LoginResponse>('/api/auth/login', data);
    return resp.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },

  async me(): Promise<User> {
    const resp = await apiClient.get<User>('/api/auth/me');
    return resp.data;
  },
};
