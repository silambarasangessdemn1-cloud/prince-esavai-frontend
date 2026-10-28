// ─────────────────────────────────────────────────────────────────────────────
//  Ration Services (TNPDS) API Client
//  All fetch calls to /api/ration/* with JWT auth attached
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '/api/ration';

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
): Promise<{ success: boolean; data?: T; ticketNumber?: string; error?: string; message?: string; errors?: { field: string; message: string }[] }> {
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

export interface FamilyMember {
  name: string;
  relation: string;
  gender: string;
  dateOfBirth?: string;
  aadhaarNumber?: string;
}

export interface AuditEntry {
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  performedByName: string;
  remarks: string;
  createdAt: string;
}

export interface RationRequest {
  _id: string;
  ticketNumber: string;
  serviceType: string;
  rationCardNumber?: string;
  cardType?: string;
  applicantName: string;
  relativeName?: string;
  relationType?: string;
  gender?: string;
  dateOfBirth?: string;
  applicantPhone: string;
  applicantEmail?: string;
  aadhaarNumber?: string;
  maskedAadhaar?: string;
  state?: string;
  district?: string;
  taluk?: string;
  villageOrWard?: string;
  fpsCode?: string;
  newAddress?: string;
  members?: FamilyMember[];
  correctionDetails?: string;
  remarksOrNotes?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: string;
  tnpdsAckNumber?: string;
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
}

export interface RationListResponse {
  data: RationRequest[];
  meta: Pagination;
}

export interface RationLookupResponse {
  identifier: string;
  summary: {
    totalRequests: number;
    byStatus: Record<string, number>;
  };
  data: RationRequest[];
}

export interface RationStatsResponse {
  total: number;
  byStatus: Record<string, number>;
  byService: Record<string, number>;
  availableStatuses: string[];
  availableServices: string[];
  availableCardTypes: string[];
  availablePriorities: string[];
}

export interface SubmitRationPayload {
  serviceType: string;
  rationCardNumber?: string;
  cardType?: string;
  applicantName: string;
  relativeName?: string;
  relationType?: string;
  gender?: string;
  dateOfBirth?: string;
  applicantPhone: string;
  applicantEmail?: string;
  aadhaarNumber?: string;
  district?: string;
  taluk?: string;
  villageOrWard?: string;
  fpsCode?: string;
  newAddress?: string;
  members?: FamilyMember[];
  correctionDetails?: string;
  remarksOrNotes?: string;
  priority?: string;
}

export interface UpdateRationStatusPayload {
  status?: string;
  tnpdsAckNumber?: string;
  resolutionRemarks?: string;
  assignedToName?: string;
}

// ── Exported API Methods ──────────────────────────────────────────────────────

export const rationApi = {
  // Submit new Ration application
  submitRequest: (payload: SubmitRationPayload) =>
    apiFetch<RationRequest>('POST', '/requests', payload),

  // List all requests with filters & pagination
  listRequests: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    serviceType?: string;
    district?: string;
    search?: string;
    scope?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    if (params?.serviceType) q.set('serviceType', params.serviceType);
    if (params?.district) q.set('district', params.district);
    if (params?.search) q.set('search', params.search);
    if (params?.scope) q.set('scope', params.scope);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<RationRequest[]>('GET', `/requests${qs}`);
  },

  // Lookup applications by 12-digit Ration card number, Aadhaar or Phone
  lookupByIdentifier: (identifier: string) =>
    apiFetch<RationRequest[]>('GET', `/lookup/${encodeURIComponent(identifier)}`),

  // Single request details
  getRequestById: (id: string) =>
    apiFetch<RationRequest>('GET', `/requests/${encodeURIComponent(id)}`),

  // Dashboard Stats
  getStats: (params?: { scope?: string }) => {
    const qs = params?.scope ? `?scope=${params.scope}` : '';
    return apiFetch<RationStatsResponse>('GET', `/stats${qs}`);
  },

  // Metadata
  getMeta: () =>
    apiFetch<{ serviceTypes: string[]; cardTypes: string[]; statuses: string[]; priorities: string[] }>('GET', '/meta'),

  // Admin: Update Status & Resolution Remarks
  updateStatus: (id: string, payload: UpdateRationStatusPayload) =>
    apiFetch<RationRequest>('PATCH', `/requests/${encodeURIComponent(id)}/status`, payload),

  // Admin: Append Audit Log Note
  addAuditLog: (id: string, action: string, remarks?: string) =>
    apiFetch<AuditEntry[]>('POST', `/requests/${encodeURIComponent(id)}/audit`, { action, remarks }),

  // Admin: Delete Request
  deleteRequest: (id: string) =>
    apiFetch<null>('DELETE', `/requests/${encodeURIComponent(id)}`),
};

