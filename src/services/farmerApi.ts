// ─────────────────────────────────────────────────────────────────────────────
//  Farmer Services (Uzhavan / Tamil Nadu Agriculture / PM-KISAN / Revenue) API Client
//  All fetch calls to /api/farmer/* with JWT auth attached
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '/api/farmer';

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

export interface FarmerDocument {
  name: string;
  url: string;
  type: string;
}

export interface FarmerRequest {
  _id: string;
  ticketNumber: string;
  serviceType: string;
  farmerName: string;
  fatherOrHusbandName?: string;
  contactNumber: string;
  alternateNumber?: string;
  aadhaarNumber?: string;
  maskedAadhaar?: string;
  gender: 'Male' | 'Female' | 'Transgender' | 'Other';
  community: string;
  farmerCategory: string;
  district: string;
  taluk: string;
  village: string;
  pattaNumber?: string;
  surveyNumber?: string;
  totalLandArea: string;
  cropName: string;
  season: string;
  irrigationSource: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  pmKisanBeneficiaryId?: string;
  uzhavanAppRegNo?: string;
  cropInsurancePolicyNo?: string;
  schemeSpecificNotes?: string;
  documents?: FarmerDocument[];
  status:
    | 'Submitted'
    | 'Under Review'
    | 'Field Inspection Scheduled'
    | 'Verified'
    | 'Approved'
    | 'Resolved'
    | 'Rejected'
    | 'Closed';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  officialAckNumber?: string;
  fieldInspectionDate?: string | null;
  assignedOfficer?: string;
  resolutionRemarks?: string;
  userId?: string;
  user?: string;
  submittedBy?: string;
  submittedByName?: string;
  createdAt: string;
  updatedAt: string;
  auditLog?: AuditEntry[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FarmerStatsResponse {
  total: number;
  submitted: number;
  underReview: number;
  fieldInspection: number;
  approved: number;
  resolved: number;
  completed: number;
  rejected: number;
  byService: { _id: string; count: number }[];
}

export interface FarmerFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  serviceType?: string;
  district?: string;
  search?: string;
  scope?: string;
}

export interface CreateFarmerInput {
  serviceType: string;
  farmerName: string;
  fatherOrHusbandName?: string;
  contactNumber: string;
  alternateNumber?: string;
  aadhaarNumber?: string;
  gender?: string;
  community?: string;
  farmerCategory?: string;
  district: string;
  taluk: string;
  village: string;
  pattaNumber?: string;
  surveyNumber?: string;
  totalLandArea?: string;
  cropName?: string;
  season?: string;
  irrigationSource?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  pmKisanBeneficiaryId?: string;
  uzhavanAppRegNo?: string;
  cropInsurancePolicyNo?: string;
  schemeSpecificNotes?: string;
  documents?: FarmerDocument[];
  priority?: string;
}

// ── API Methods ───────────────────────────────────────────────────────────────

export const farmerApi = {
  /**
   * Reference metadata (districts, crops, services, seasons)
   */
  getMeta: async () => {
    return apiFetch<{
      districts: string[];
      services: string[];
      crops: string[];
      seasons: string[];
      categories: string[];
    }>('GET', '/meta');
  },

  /**
   * Overall dashboard stats
   */
  getStats: async (scope = 'user') => {
    return apiFetch<FarmerStatsResponse>('GET', `/stats?scope=${scope}`);
  },

  /**
   * Quick lookup by identifier (ticket, mobile, patta, survey, or pm-kisan)
   */
  lookup: async (identifier: string) => {
    return apiFetch<FarmerRequest[]>('GET', `/lookup/${encodeURIComponent(identifier)}`);
  },

  /**
   * Submit new Farmer Service application
   */
  createRequest: async (payload: CreateFarmerInput) => {
    return apiFetch<FarmerRequest>('POST', '/requests', payload);
  },

  /**
   * Paginated list of applications
   */
  listRequests: async (params: FarmerFilterParams = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status && params.status !== 'all') q.set('status', params.status);
    if (params.priority && params.priority !== 'all') q.set('priority', params.priority);
    if (params.serviceType && params.serviceType !== 'all') q.set('serviceType', params.serviceType);
    if (params.district && params.district !== 'all') q.set('district', params.district);
    if (params.search) q.set('search', params.search);
    if (params.scope) q.set('scope', params.scope);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<FarmerRequest[]>('GET', `/requests${queryStr}`);
  },

  /**
   * Single application by ID
   */
  getRequest: async (id: string) => {
    return apiFetch<FarmerRequest>('GET', `/requests/${id}`);
  },

  /**
   * Admin: update status, official acknowledgement number, inspection date, remarks
   */
  updateStatus: async (
    id: string,
    payload: {
      status?: string;
      resolutionRemarks?: string;
      officialAckNumber?: string;
      fieldInspectionDate?: string;
      assignedOfficer?: string;
    }
  ) => {
    return apiFetch<FarmerRequest>('PATCH', `/requests/${id}/status`, payload);
  },

  /**
   * Admin: delete application
   */
  deleteRequest: async (id: string) => {
    return apiFetch<{ message: string }>('DELETE', `/requests/${id}`);
  },
};

