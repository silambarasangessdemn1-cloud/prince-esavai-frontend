import { API_ENDPOINTS } from '../config/apiConfig';

// ─────────────────────────────────────────────────────────────────────────────
//  Driving Services (Sarathi Parivahan / MoRTH / RTO) API Client
//  All fetch calls to /api/driving/* with JWT auth attached
// ─────────────────────────────────────────────────────────────────────────────

const BASE = API_ENDPOINTS.driving;

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

export interface AuditEntry {
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  performedByName: string;
  remarks: string;
  createdAt: string;
}

export interface DrivingRequest {
  _id: string;
  ticketNumber: string;
  serviceType: string;
  drivingLicenseNumber?: string;
  learnerLicenseNumber?: string;
  vehicleClass: string;
  applicantName: string;
  relativeName?: string;
  relationType?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  applicantPhone: string;
  applicantEmail?: string;
  aadhaarNumber?: string;
  maskedAadhaar?: string;
  state?: string;
  rtoOffice: string;
  newAddress?: string;
  correctionDetails?: string;
  remarksOrNotes?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: string;
  sarathiAckNumber?: string;
  rtoSlotDate?: string;
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

export interface DrivingListResponse {
  data: DrivingRequest[];
  meta: Pagination;
}

export interface DrivingLookupResponse {
  identifier: string;
  summary: {
    totalRequests: number;
    byStatus: Record<string, number>;
  };
  data: DrivingRequest[];
}

export interface DrivingStatsResponse {
  total: number;
  byStatus: Record<string, number>;
  byService: Record<string, number>;
  availableStatuses: string[];
  availableServices: string[];
  availableVehicleClasses: string[];
  availablePriorities: string[];
}

export interface SubmitDrivingPayload {
  serviceType: string;
  drivingLicenseNumber?: string;
  learnerLicenseNumber?: string;
  vehicleClass?: string;
  applicantName: string;
  relativeName?: string;
  relationType?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  applicantPhone: string;
  applicantEmail?: string;
  aadhaarNumber?: string;
  state?: string;
  rtoOffice: string;
  newAddress?: string;
  correctionDetails?: string;
  remarksOrNotes?: string;
  priority?: string;
}

export interface UpdateDrivingStatusPayload {
  status?: string;
  sarathiAckNumber?: string;
  rtoSlotDate?: string;
  resolutionRemarks?: string;
  assignedToName?: string;
}

// ── Exported API Methods ──────────────────────────────────────────────────────

export const drivingApi = {
  // Submit new Driving service application
  submitRequest: (payload: SubmitDrivingPayload) =>
    apiFetch<DrivingRequest>('POST', '/requests', payload),

  // List all requests with filters & pagination
  listRequests: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    serviceType?: string;
    rtoOffice?: string;
    search?: string;
    scope?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    if (params?.serviceType) q.set('serviceType', params.serviceType);
    if (params?.rtoOffice) q.set('rtoOffice', params.rtoOffice);
    if (params?.search) q.set('search', params.search);
    if (params?.scope) q.set('scope', params.scope);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<DrivingRequest[]>('GET', `/requests${qs}`);
  },

  // Lookup applications by DL Number, LL Number, Aadhaar or Phone
  lookupByIdentifier: (identifier: string) =>
    apiFetch<DrivingRequest[]>('GET', `/lookup/${encodeURIComponent(identifier)}`),

  // Single request details
  getRequestById: (id: string) =>
    apiFetch<DrivingRequest>('GET', `/requests/${encodeURIComponent(id)}`),

  // Dashboard Stats
  getStats: (params?: { scope?: string }) => {
    const qs = params?.scope ? `?scope=${params.scope}` : '';
    return apiFetch<DrivingStatsResponse>('GET', `/stats${qs}`);
  },

  // Metadata
  getMeta: () =>
    apiFetch<{
      serviceTypes: string[];
      vehicleClasses: string[];
      bloodGroups: string[];
      statuses: string[];
      priorities: string[];
    }>('GET', '/meta'),

  // Admin: Update Status & Resolution Remarks
  updateStatus: (id: string, payload: UpdateDrivingStatusPayload) =>
    apiFetch<DrivingRequest>('PATCH', `/requests/${encodeURIComponent(id)}/status`, payload),

  // Admin: Append Audit Log Note
  addAuditLog: (id: string, action: string, remarks?: string) =>
    apiFetch<AuditEntry[]>('POST', `/requests/${encodeURIComponent(id)}/audit`, { action, remarks }),

  // Admin: Delete Request
  deleteRequest: (id: string) =>
    apiFetch<null>('DELETE', `/requests/${encodeURIComponent(id)}`),
};

