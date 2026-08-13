// TypeScript types matching the FastAPI Pydantic schemas

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface HostedZone {
  id: number;
  name: string;
  description: string | null;
  zone_type: 'public' | 'private';
  private_zone: boolean;
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface HostedZoneCreate {
  name: string;
  description?: string;
  zone_type: 'public' | 'private';
  private_zone: boolean;
}

export interface HostedZoneUpdate {
  name?: string;
  description?: string;
  zone_type?: 'public' | 'private';
  private_zone?: boolean;
}

export type RecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'PTR' | 'SRV' | 'CAA';

export const RECORD_TYPES: RecordType[] = ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'PTR', 'SRV', 'CAA'];

export type RoutingPolicy = 'simple' | 'weighted' | 'latency' | 'failover' | 'geolocation' | 'multivalue';

export const ROUTING_POLICIES: RoutingPolicy[] = [
  'simple', 'weighted', 'latency', 'failover', 'geolocation', 'multivalue'
];

export interface DnsRecord {
  id: number;
  hosted_zone_id: number;
  name: string;
  type: RecordType;
  ttl: number;
  value: string;
  routing_policy: RoutingPolicy;
  created_at: string;
  updated_at: string;
}

export interface DnsRecordCreate {
  name: string;
  type: RecordType;
  ttl: number;
  value: string;
  routing_policy: RoutingPolicy;
}

export interface DnsRecordUpdate {
  name?: string;
  type?: RecordType;
  ttl?: number;
  value?: string;
  routing_policy?: RoutingPolicy;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface ApiError {
  detail: string | { msg: string; loc: string[] }[];
}
