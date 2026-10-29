import { API_ENDPOINTS } from '../config/apiConfig';

// ─────────────────────────────────────────────────────────────────────────────
//  Voter Services API Client
//  All fetch calls to /api/voter/* with JWT auth attached
// ─────────────────────────────────────────────────────────────────────────────

const BASE = API_ENDPOINTS.voter;

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
): Promise<{ success: boolean; data?: T; error?: string; message?: string; errors?: { field: string; message: string }[] }> {
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

export interface VoterRequest {
  _id: string;
  ticketNumber: string;
  serviceType: string;
  applicantName: string;
  relativeName?: string;
  relationType?: string;
  dateOfBirth?: string;
  gender?: string;
  applicantPhone: string;
  applicantEmail?: string;
  aadhaarNumber?: string;
  maskedAadhaar?: string;
  epicNumber?: string;
  state?: string;
  district?: string;
  assemblyConstituency?: string;
  pollingStation?: string;
  correctionDetails?: string;
  newAddress?: string;
  remarksOrNotes?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: string;
  eciReferenceNumber?: string;
  resolutionRemarks?: string;
  resolvedAt?: string | null;
  submittedByName: string;
  assignedToName?: string;
  auditLog?: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface VoterListResponse {
  requests: VoterRequest[];
  pagination: Pagination;
}

export interface VoterLookupResponse {
  identifier: string;
  summary: {
    totalRequests: number;
    byStatus: Record<string, number>;
    byServiceType: Record<string, number>;
  };
  requests: VoterRequest[];
}

export interface VoterMetaResponse {
  serviceTypes: string[];
  statuses: string[];
  priorities: string[];
  relationTypes: string[];
}

export interface VoterStatsResponse {
  total: number;
  byStatus: Record<string, number>;
  byServiceType: Record<string, number>;
}

export interface SubmitVoterPayload {
  serviceType: string;
  applicantName: string;
  relativeName?: string;
  relationType?: string;
  dateOfBirth?: string;
  gender?: string;
  applicantPhone: string;
  applicantEmail?: string;
  aadhaarNumber?: string;
  epicNumber?: string;
  state?: string;
  district?: string;
  assemblyConstituency?: string;
  pollingStation?: string;
  correctionDetails?: string;
  newAddress?: string;
  remarksOrNotes?: string;
  priority?: string;
}

// ── API Methods ───────────────────────────────────────────────────────────────

export const voterApi = {
  // Submit new Voter request
  submitRequest: (payload: SubmitVoterPayload) =>
    apiFetch<{ request: VoterRequest }>('POST', '/requests', payload),

  // List all Voter requests (with pagination, filters, search)
  listRequests: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    serviceType?: string;
    district?: string;
    search?: string;
    scope?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    if (params?.priority) q.set('priority', params.priority);
    if (params?.serviceType) q.set('serviceType', params.serviceType);
    if (params?.district) q.set('district', params.district);
    if (params?.search) q.set('search', params.search);
    if (params?.scope) q.set('scope', params.scope);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<VoterListResponse>('GET', `/requests${qs}`);
  },

  // Lookup by 10-char EPIC or 12-digit Aadhaar
  getByIdentifier: (identifier: string) =>
    apiFetch<VoterLookupResponse>('GET', `/requests/lookup/${identifier.trim()}`),

  // Single request by ID (with full audit trail)
  getById: (id: string) =>
    apiFetch<{ request: VoterRequest }>('GET', `/requests/${id}`),

  // Update status (Admin / Operator)
  updateStatus: (id: string, status: string, remarks?: string, eciReferenceNumber?: string) =>
    apiFetch<{ request: VoterRequest }>('PATCH', `/requests/${id}/status`, {
      status,
      remarks,
      eciReferenceNumber,
    }),

  // Delete request (Admin)
  deleteRequest: (id: string) =>
    apiFetch<{ message: string }>('DELETE', `/requests/${id}`),

  // Get statistics
  getStats: (params?: { scope?: string }) => {
    const qs = params?.scope ? `?scope=${params.scope}` : '';
    return apiFetch<VoterStatsResponse>('GET', `/stats${qs}`);
  },

  // Get metadata
  getMeta: () =>
    apiFetch<VoterMetaResponse>('GET', '/meta'),
};

