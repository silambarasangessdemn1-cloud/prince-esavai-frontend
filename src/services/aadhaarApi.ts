// ─────────────────────────────────────────────────────────────────────────────
//  Aadhaar Issues API Service
//  All fetch calls to /api/aadhaar/* with JWT auth attached
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '/api/aadhaar';

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
  const opts: RequestInit = { method, headers: authHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  return json;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AadhaarIssueDoc {
  name: string;
  type?: string;
  size?: string;
  uploadedAt?: string;
}

export interface AuditEntry {
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  performedByName: string;
  remarks: string;
  createdAt: string;
}

export interface AadhaarIssue {
  _id: string;
  ticketNumber: string;
  aadhaarNumber: string;
  maskedAadhaar: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  issueType: string;
  issueDescription: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: string;
  documents: AadhaarIssueDoc[];
  assignedToName: string;
  submittedByName: string;
  resolvedAt: string | null;
  resolutionRemarks: string;
  auditLog: AuditEntry[];
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

export interface IssueListResponse {
  issues: AadhaarIssue[];
  pagination: Pagination;
}

export interface ByAadhaarResponse {
  aadhaarNumber: string;
  summary: {
    totalIssues: number;
    byStatus: Record<string, number>;
    byIssueType: Record<string, number>;
  };
  issues: AadhaarIssue[];
}

export interface MetaResponse {
  issueTypes: string[];
  priorities: string[];
  statuses: string[];
}

export interface StatsResponse {
  total: number;
  byStatus: Record<string, number>;
  byIssueType: Record<string, number>;
  byPriority: Record<string, number>;
  recentIssues: Pick<AadhaarIssue, '_id' | 'ticketNumber' | 'applicantName' | 'issueType' | 'status' | 'priority' | 'createdAt'>[];
}

// ── API Calls ─────────────────────────────────────────────────────────────────

export const aadhaarApi = {
  /** GET /meta — issue types, priorities, statuses */
  getMeta: () => apiFetch<MetaResponse>('GET', '/meta'),

  /** GET /stats — dashboard summary */
  getStats: (params?: { scope?: string }) => {
    const qs = params?.scope ? `?scope=${params.scope}` : '';
    return apiFetch<StatsResponse>('GET', `/stats${qs}`);
  },

  /** POST /issues — submit new issue */
  submitIssue: (payload: {
    aadhaarNumber: string;
    applicantName: string;
    applicantPhone: string;
    applicantEmail?: string;
    issueType: string;
    issueDescription: string;
    priority?: string;
    documents?: AadhaarIssueDoc[];
  }) => apiFetch<{ issue: AadhaarIssue }>('POST', '/issues', payload),

  /** GET /issues?page&limit&status&priority&issueType&search */
  listIssues: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    issueType?: string;
    search?: string;
    scope?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page)      qs.set('page', String(params.page));
    if (params?.limit)     qs.set('limit', String(params.limit));
    if (params?.status)    qs.set('status', params.status);
    if (params?.priority)  qs.set('priority', params.priority);
    if (params?.issueType) qs.set('issueType', params.issueType);
    if (params?.search)    qs.set('search', params.search);
    if (params?.scope)     qs.set('scope', params.scope);
    return apiFetch<IssueListResponse>('GET', `/issues?${qs.toString()}`);
  },

  /** GET /issues/by-aadhaar/:aadhaarNumber */
  getByAadhaar: (aadhaarNumber: string) =>
    apiFetch<ByAadhaarResponse>('GET', `/issues/by-aadhaar/${aadhaarNumber}`),

  /** GET /issues/:id */
  getById: (id: string) => apiFetch<{ issue: AadhaarIssue }>('GET', `/issues/${id}`),

  /** PATCH /issues/:id/status */
  updateStatus: (id: string, status: string, remarks?: string) =>
    apiFetch<{ issue: AadhaarIssue }>('PATCH', `/issues/${id}/status`, { status, remarks }),

  /** DELETE /issues/:id */
  deleteIssue: (id: string) => apiFetch<null>('DELETE', `/issues/${id}`),
};

