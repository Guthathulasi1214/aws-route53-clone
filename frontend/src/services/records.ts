import apiClient from '@/lib/api';
import { DnsRecord, DnsRecordCreate, DnsRecordUpdate, PaginatedResponse } from '@/types';

export interface GetRecordsParams {
  search?: string;
  type?: string;
  page?: number;
  page_size?: number;
}

export const recordsService = {
  async list(zoneId: number, params: GetRecordsParams = {}): Promise<PaginatedResponse<DnsRecord>> {
    const resp = await apiClient.get<PaginatedResponse<DnsRecord>>(
      `/api/hosted-zones/${zoneId}/records`,
      { params }
    );
    return resp.data;
  },

  async create(zoneId: number, data: DnsRecordCreate): Promise<DnsRecord> {
    const resp = await apiClient.post<DnsRecord>(`/api/hosted-zones/${zoneId}/records`, data);
    return resp.data;
  },

  async update(recordId: number, data: DnsRecordUpdate): Promise<DnsRecord> {
    const resp = await apiClient.put<DnsRecord>(`/api/records/${recordId}`, data);
    return resp.data;
  },

  async delete(recordId: number): Promise<void> {
    await apiClient.delete(`/api/records/${recordId}`);
  },
};
