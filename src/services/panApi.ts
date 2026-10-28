// ─────────────────────────────────────────────────────────────────────────────
//  PAN Card Services API Client
//  All fetch calls to /api/pan/* with JWT auth attached (supporting citizen & admin)
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '/api/pan';

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

export interface PanRequest {
  _id: string;
  ticketNumber: string;
  serviceType: string;
  applicantName: string;
  fatherName?: string;
  dateOfBirth?: string;
  gender?: string;
  applicantPhone: string;
  applicantEmail?: string;
  aadhaarNumber: string;
  maskedAadhaar: string;
  panNumber?: string;
  maskedPan?: string;
  deliveryMode: string;
  correctionDetails?: string;
  instructions?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: string;
  nsdlUtiiAckNumber?: string;
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

export interface PanListResponse {
  requests: PanRequest[];
  pagination: Pagination;
}

export interface PanLookupResponse {
  identifier: string;
  summary: {
    totalRequests: number;
    byStatus: Record<string, number>;
    byServiceType: Record<string, number>;
  };
  requests: PanRequest[];
}

export interface PanMetaResponse {
  serviceTypes: string[];
  statuses: string[];
  priorities: string[];
  deliveryModes: string[];
}

export interface PanStatsResponse {
  total: number;
  byStatus: Record<string, number>;
  byServiceType: Record<string, number>;
}

export interface SubmitPanPayload {
  serviceType: string;
  applicantName: string;
  fatherName?: string;
  dateOfBirth?: string;
  gender?: string;
  applicantPhone: string;
  applicantEmail?: string;
  aadhaarNumber: string;
  panNumber?: string;
  deliveryMode?: string;
  correctionDetails?: string;
  instructions?: string;
  priority?: string;
}

// ── API Methods ───────────────────────────────────────────────────────────────

export const panApi = {
  // Submit new PAN request
  submitRequest: (payload: SubmitPanPayload) =>
    apiFetch<{ request: PanRequest }>('POST', '/requests', payload),

  // List all PAN requests (with pagination, filters, search)
  listRequests: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    serviceType?: string;
    search?: string;
    scope?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    if (params?.priority) q.set('priority', params.priority);
    if (params?.serviceType) q.set('serviceType', params.serviceType);
    if (params?.search) q.set('search', params.search);
    if (params?.scope) q.set('scope', params.scope);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<PanListResponse>('GET', `/requests${qs}`);
  },

  // Lookup by 12-digit Aadhaar or 10-char PAN
  getByIdentifier: (identifier: string) =>
    apiFetch<PanLookupResponse>('GET', `/requests/lookup/${identifier.trim()}`),

  // Single request by ID (with full audit trail)
  getById: (id: string) =>
    apiFetch<{ request: PanRequest }>('GET', `/requests/${id}`),

  // Update status (Admin / Operator)
  updateStatus: (id: string, status: string, remarks?: string, nsdlUtiiAckNumber?: string) =>
    apiFetch<{ request: PanRequest }>('PATCH', `/requests/${id}/status`, {
      status,
      remarks,
      nsdlUtiiAckNumber,
    }),

  // Delete request (Admin)
  deleteRequest: (id: string) =>
    apiFetch<{ message: string }>('DELETE', `/requests/${id}`),

  // Get statistics
  getStats: (params?: { scope?: string }) => {
    const qs = params?.scope ? `?scope=${params.scope}` : '';
    return apiFetch<PanStatsResponse>('GET', `/stats${qs}`);
  },

  // Get metadata
  getMeta: () =>
    apiFetch<PanMetaResponse>('GET', '/meta'),
};

