import { PaymentSubmission, PaymentStatus } from '../types';
import { API_ENDPOINTS } from '../config/apiConfig';

export interface PaymentItem {
  _id?: string;
  ticketNumber: string;
  serviceId: string;
  serviceName: string;
  category: string;
  applicantName: string;
  applicantPhone: string;
  amount: number;
  utrNumber: string;
  upiIdUsed: string;
  paymentScreenshot?: string;
  paymentMethod: string;
  status: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

const BASE = API_ENDPOINTS.payments;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const paymentApi = {
  /**
   * Submit payment details when user completes UPI QR transfer
   */
  async submitPayment(data: PaymentSubmission): Promise<{ success: boolean; data?: any; error?: string }> {
    const paymentRecord: PaymentItem = {
      _id: `pay-${Date.now()}`,
      ticketNumber: data.ticketNumber,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      category: data.category || 'General',
      applicantName: data.applicantName,
      applicantPhone: data.applicantPhone,
      amount: data.amount,
      utrNumber: data.utrNumber,
      upiIdUsed: data.upiIdUsed || 'jjesper143@oksbi',
      paymentScreenshot: data.paymentScreenshot || '',
      paymentMethod: data.paymentMethod || 'UPI QR',
      status: 'Pending Verification',
      createdAt: new Date().toISOString(),
    };

    // Store in global payments store in localStorage for offline / multi-user fallback
    try {
      const stored = localStorage.getItem('esevai_all_payments');
      const list: PaymentItem[] = stored ? JSON.parse(stored) : [];
      list.unshift(paymentRecord);
      localStorage.setItem('esevai_all_payments', JSON.stringify(list));
    } catch {}

    // Also send to backend
    try {
      const res = await fetch(`${BASE}/submit`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json;
    } catch {
      return { success: true, data: paymentRecord };
    }
  },

  /**
   * Admin: Get all payments
   */
  async getAllPayments(query?: { status?: string; search?: string }): Promise<{
    payments: PaymentItem[];
    stats: { total: number; pending: number; verified: number; rejected: number };
  }> {
    // Check backend
    try {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.search) params.append('search', query.search);

      const res = await fetch(`${BASE}?${params.toString()}`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // Sync to localStorage
          if (Array.isArray(json.data.payments)) {
            localStorage.setItem('esevai_all_payments', JSON.stringify(json.data.payments));
          }
          return {
            payments: json.data.payments || [],
            stats: json.data.stats || {
              total: json.data.payments?.length || 0,
              pending: 0,
              verified: 0,
              rejected: 0,
            },
          };
        }
      }
    } catch {}

    // Fallback: Read from local storage
    try {
      const stored = localStorage.getItem('esevai_all_payments');
      let list: PaymentItem[] = stored ? JSON.parse(stored) : [];

      // Also gather from any local applications that have payment info
      const allKeys = Object.keys(localStorage).filter((k) => k.startsWith('esevai_apps_'));
      allKeys.forEach((key) => {
        try {
          const apps = JSON.parse(localStorage.getItem(key) || '[]');
          apps.forEach((app: any) => {
            if (app.utrNumber && !list.some((p) => p.ticketNumber === app.tokenNumber)) {
              list.push({
                _id: `pay-${app.id}`,
                ticketNumber: app.tokenNumber,
                serviceId: app.serviceId,
                serviceName: app.serviceName,
                category: app.category || 'General',
                applicantName: app.applicantName,
                applicantPhone: app.mobile,
                amount: app.paidAmount || app.fee || 0,
                utrNumber: app.utrNumber,
                upiIdUsed: app.upiIdUsed || 'jjesper143@oksbi',
                paymentScreenshot: app.paymentScreenshot,
                paymentMethod: app.paymentMethod || 'UPI QR',
                status: app.paymentStatus || 'Pending Verification',
                verifiedBy: app.paymentVerifiedBy,
                verifiedAt: app.paymentVerifiedAt,
                createdAt: app.paymentDate || app.date || new Date().toISOString(),
              });
            }
          });
        } catch {}
      });

      if (query?.status && query.status !== 'all') {
        list = list.filter((p) => p.status === query.status);
      }
      if (query?.search) {
        const s = query.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.ticketNumber?.toLowerCase().includes(s) ||
            p.utrNumber?.toLowerCase().includes(s) ||
            p.applicantName?.toLowerCase().includes(s) ||
            p.applicantPhone?.toLowerCase().includes(s) ||
            p.serviceName?.toLowerCase().includes(s)
        );
      }

      const total = list.length;
      const pending = list.filter((p) => p.status === 'Pending Verification').length;
      const verified = list.filter((p) => p.status === 'Verified & Approved').length;
      const rejected = list.filter((p) => p.status === 'Rejected').length;

      return { payments: list, stats: { total, pending, verified, rejected } };
    } catch {
      return {
        payments: [],
        stats: { total: 0, pending: 0, verified: 0, rejected: 0 },
      };
    }
  },

  /**
   * Admin: Verify & approve or reject a payment
   */
  async verifyPayment(
    idOrTicket: string,
    status: 'Verified & Approved' | 'Rejected',
    adminRemarks?: string,
    verifiedBy: string = 'Admin'
  ): Promise<boolean> {
    // 1. Update in local storage
    try {
      const stored = localStorage.getItem('esevai_all_payments');
      if (stored) {
        const list: PaymentItem[] = JSON.parse(stored);
        const updated = list.map((item) => {
          if (item._id === idOrTicket || item.ticketNumber === idOrTicket) {
            return {
              ...item,
              status,
              adminRemarks: adminRemarks || '',
              rejectionReason: status === 'Rejected' ? adminRemarks || '' : '',
              verifiedBy,
              verifiedAt: new Date().toISOString(),
            };
          }
          return item;
        });
        localStorage.setItem('esevai_all_payments', JSON.stringify(updated));
      }

      // Also update application records across all user accounts in localStorage
      const allAppKeys = Object.keys(localStorage).filter((k) => k.startsWith('esevai_apps_'));
      allAppKeys.forEach((key) => {
        try {
          const apps = JSON.parse(localStorage.getItem(key) || '[]');
          const updatedApps = apps.map((app: any) => {
            if (app.tokenNumber === idOrTicket || app.id === idOrTicket) {
              return {
                ...app,
                paymentStatus: status,
                paymentVerifiedBy: verifiedBy,
                paymentVerifiedAt: new Date().toISOString(),
                rejectionReason: status === 'Rejected' ? adminRemarks : undefined,
                status: status === 'Verified & Approved' && app.status === 'Under Review' ? 'In Process' : app.status,
              };
            }
            return app;
          });
          localStorage.setItem(key, JSON.stringify(updatedApps));
        } catch {}
      });
      try {
        window.dispatchEvent(new Event('storage'));
      } catch {}
    } catch {}

    // 2. Call backend if payment has MongoDB ID
    if (idOrTicket.length === 24) {
      try {
        await fetch(`${BASE}/${idOrTicket}/verify`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ status, adminRemarks, verifiedBy }),
        });
      } catch {}
    }

    return true;
  },
};

