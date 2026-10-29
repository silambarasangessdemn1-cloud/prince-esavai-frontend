import { API_ENDPOINTS } from '../config/apiConfig';

// ─────────────────────────────────────────────────────────────────────────────
//  Vehicle Services (Vahan Parivahan / MoRTH / RTO) API Client
//  All fetch calls to /api/vehicle/* with JWT auth attached
// ─────────────────────────────────────────────────────────────────────────────

const BASE = API_ENDPOINTS.vehicle;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<{
  success: boolean;
  data?: T;
  ticketNumber?: string;
  error?: string;
  message?: string;
  meta?: Pagination;
  errors?: { field: string; message: string }[];
}> {
  try {
    const opts: RequestInit = { method, headers: authHeaders() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error occurred. Please check connection.',
    };
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuditEntry {
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  performedByName: string;
  remarks: string;
  createdAt: string;
}

export interface VehicleRequest {
  _id: string;
  ticketNumber: string;
  serviceType: string;
  vehicleNumber: string;
  chassisNumber?: string;
  engineNumber?: string;
  vehicleClass: string;
  makerModel?: string;
  fuelType: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  aadhaarNumber?: string;
  maskedAadhaar?: string;
  rtoOffice: string;
  insurancePolicyNumber?: string;
  insuranceCompany?: string;
  insuranceExpiryDate?: string;
  puccNumber?: string;
  puccExpiryDate?: string;
  hypothecationBank?: string;
  challanNumber?: string;
  challanAmount?: number;
  challanSettlementRef?: string;
  newOwnerName?: string;
  newOwnerPhone?: string;
  newAddress?: string;
  remarksOrNotes?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: string;
  vahanAckNumber?: string;
  rtoSlotDate?: string;
  resolutionRemarks?: string;
  resolvedAt?: string;
  auditLog?: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface VehicleStatsResponse {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface VehicleMetaResponse {
  services: string[];
  vehicleClasses: string[];
  fuelTypes: string[];
  rtoOffices: string[];
}

// ── API Methods ───────────────────────────────────────────────────────────────

export const vehicleApi = {
  // 1. Submit Application
  async submitRequest(data: {
    serviceType: string;
    vehicleNumber: string;
    chassisNumber?: string;
    engineNumber?: string;
    vehicleClass?: string;
    makerModel?: string;
    fuelType?: string;
    ownerName: string;
    ownerPhone: string;
    ownerEmail?: string;
    aadhaarNumber?: string;
    rtoOffice?: string;
    insurancePolicyNumber?: string;
    insuranceCompany?: string;
    insuranceExpiryDate?: string;
    puccNumber?: string;
    puccExpiryDate?: string;
    hypothecationBank?: string;
    challanNumber?: string;
    challanAmount?: number;
    newOwnerName?: string;
    newOwnerPhone?: string;
    newAddress?: string;
    remarksOrNotes?: string;
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  }) {
    return apiFetch<VehicleRequest>('POST', '/requests', data);
  },

  // 2. List Requests (with filters & search)
  async listRequests(params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    serviceType?: string;
    search?: string;
    scope?: string;
  } = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.priority) q.set('priority', params.priority);
    if (params.serviceType) q.set('serviceType', params.serviceType);
    if (params.search) q.set('search', params.search);
    if (params.scope) q.set('scope', params.scope);
    return apiFetch<VehicleRequest[]>('GET', `/requests?${q.toString()}`);
  },

  // 3. Get single ticket by ID
  async getRequestById(id: string) {
    return apiFetch<VehicleRequest>('GET', `/requests/${id}`);
  },

  // 4. Quick lookup by registration number, ticket number, phone or challan
  async lookupByIdentifier(identifier: string) {
    return apiFetch<VehicleRequest[]>('GET', `/lookup/${encodeURIComponent(identifier)}`);
  },

  // 5. Get aggregated stats
  async getStats(params: { scope?: string } = {}) {
    const q = new URLSearchParams();
    if (params.scope) q.set('scope', params.scope);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<VehicleStatsResponse>('GET', `/stats${qs}`);
  },

  // 6. Admin update status, vahanAckNumber, rtoSlotDate, resolutionRemarks
  async updateStatus(
    id: string,
    payload: {
      status: string;
      vahanAckNumber?: string;
      rtoSlotDate?: string;
      challanSettlementRef?: string;
      resolutionRemarks?: string;
    }
  ) {
    return apiFetch<VehicleRequest>('PATCH', `/requests/${id}/status`, payload);
  },

  // 7. Delete ticket
  async deleteRequest(id: string) {
    return apiFetch<{ message: string }>('DELETE', `/requests/${id}`);
  },

  // 8. Get reference metadata
  async getMeta() {
    return apiFetch<VehicleMetaResponse>('GET', '/meta');
  },
};

