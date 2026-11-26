import { ApplicationRecord } from '../types';
import { API_ENDPOINTS } from '../config/apiConfig';

const BASE = API_ENDPOINTS.applications;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ApplicationListResponse {
  success: boolean;
  data: ApplicationRecord[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats?: {
      total: number;
      completed: number;
      inProcess: number;
      pending: number;
      rejected: number;
    };
  };
  message?: string;
}

export const applicationApi = {
  /**
   * Submit an application directly to MongoDB database
   */
  async createApplication(
    app: Partial<ApplicationRecord>
  ): Promise<{ success: boolean; data?: ApplicationRecord; message?: string }> {
    try {
      const payload = {
        tokenNumber: app.tokenNumber,
        serviceId: app.serviceId,
        serviceName: app.serviceName,
        category: app.details?.categoryLabel || 'General',
        applicantName: app.applicantName,
        applicantPhone: app.mobile,
        mobile: app.mobile,
        fee: app.fee || app.paidAmount || 0,
        paidAmount: app.paidAmount || app.fee || 0,
        walletType: app.walletType || 'payments',
        paymentMethod: app.paymentMethod || 'Wallet',
        paymentStatus: app.paymentStatus || 'Pending Verification',
        utrNumber: app.utrNumber || '',
        upiIdUsed: app.upiIdUsed || '',
        paymentScreenshot: app.paymentScreenshot || '',
        documents: app.documents || [],
        details: app.details || {},
        remarks: app.remarks || '',
        status: app.status || 'Under Review',
      };

      const res = await fetch(`${BASE}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.error('Failed to submit application to database:', err);
      return {
        success: false,
        message: err?.message || 'Network error while saving application to database.',
      };
    }
  },

  /**
   * Fetch applications directly from MongoDB database
   */
  async listApplications(params?: {
    scope?: string;
    status?: string;
    category?: string;
    serviceId?: string;
    search?: string;
    phone?: string;
    page?: number;
    limit?: number;
  }): Promise<ApplicationListResponse> {
    try {
      const q = new URLSearchParams();
      if (params?.scope) q.set('scope', params.scope);
      if (params?.status) q.set('status', params.status);
      if (params?.category) q.set('category', params.category);
      if (params?.serviceId) q.set('serviceId', params.serviceId);
      if (params?.search) q.set('search', params.search);
      if (params?.phone) q.set('phone', params.phone);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));

      const queryStr = q.toString() ? `?${q.toString()}` : '';
      const res = await fetch(`${BASE}${queryStr}`, {
        method: 'GET',
        headers: authHeaders(),
      });

      if (!res.ok) {
        return { success: false, data: [] };
      }

      const json = await res.json();
      return {
        success: json.success ?? true,
        data: Array.isArray(json.data) ? json.data : [],
        meta: json.meta,
      };
    } catch (err: any) {
      console.warn('Could not fetch applications from database:', err);
      return { success: false, data: [] };
    }
  },

  /**
   * Get single application by ID or token from MongoDB
   */
  async getApplication(
    idOrToken: string
  ): Promise<{ success: boolean; data?: ApplicationRecord; message?: string }> {
    try {
      const res = await fetch(`${BASE}/${encodeURIComponent(idOrToken)}`, {
        method: 'GET',
        headers: authHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  /**
   * Admin: Update application status directly in MongoDB
   */
  async updateStatus(
    idOrToken: string,
    status: string,
    remarks?: string,
    ackNumber?: string,
    verifiedBy: string = 'Admin'
  ): Promise<{ success: boolean; data?: ApplicationRecord; message?: string }> {
    try {
      const res = await fetch(`${BASE}/${encodeURIComponent(idOrToken)}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          status,
          remarks,
          ackNumber,
          verifiedBy,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  /**
   * Admin: Get statistics directly from MongoDB database
   */
  async getStats(): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`${BASE}/stats/overview`, {
        method: 'GET',
        headers: authHeaders(),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },
};
