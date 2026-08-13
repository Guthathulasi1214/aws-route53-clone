import apiClient from '@/lib/api';
import { HostedZone, HostedZoneCreate, HostedZoneUpdate, PaginatedResponse } from '@/types';

export interface GetHostedZonesParams {
  search?: string;
  page?: number;
  page_size?: number;
}

export const hostedZonesService = {
  async list(params: GetHostedZonesParams = {}): Promise<PaginatedResponse<HostedZone>> {
    const resp = await apiClient.get<PaginatedResponse<HostedZone>>('/api/hosted-zones', { params });
    return resp.data;
  },

  async get(id: number): Promise<HostedZone> {
    const resp = await apiClient.get<HostedZone>(`/api/hosted-zones/${id}`);
    return resp.data;
  },

  async create(data: HostedZoneCreate): Promise<HostedZone> {
    const resp = await apiClient.post<HostedZone>('/api/hosted-zones', data);
    return resp.data;
  },

  async update(id: number, data: HostedZoneUpdate): Promise<HostedZone> {
    const resp = await apiClient.put<HostedZone>(`/api/hosted-zones/${id}`, data);
    return resp.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/hosted-zones/${id}`);
  },
};
