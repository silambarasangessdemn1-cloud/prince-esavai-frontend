import { API_ENDPOINTS } from '../config/apiConfig';

export interface WalletTransactionItem {
  _id: string;
  transactionId: string;
  userId: string | { _id: string; username: string; phoneNumber: string };
  type: 'CREDIT' | 'DEBIT' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  previousBalance: number;
  updatedBalance: number;
  description: string;
  relatedOrderId?: string;
  serviceId?: string;
  serviceName?: string;
  cashfreeOrderId?: string;
  paymentReferenceId?: string;
  paymentMethod?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELLED';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface WalletBalanceResponse {
  walletBalance: number;
  username: string;
  phoneNumber: string;
  minTopup: number;
  maxTopup: number;
}

const WALLET_BASE = `${API_ENDPOINTS.payments.replace(/\/payments$/, '')}/wallet`;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Ensures Cashfree Web SDK is loaded and returns initialized Cashfree instance
 */
export async function getCashfreeInstance(env: 'sandbox' | 'production' = 'sandbox'): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).Cashfree !== 'undefined') {
      const cashfree = (window as any).Cashfree({ mode: env });
      return resolve(cashfree);
    }

    // If script not yet loaded, load it dynamically
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).Cashfree !== 'undefined') {
        const cashfree = (window as any).Cashfree({ mode: env });
        resolve(cashfree);
      } else {
        reject(new Error('Cashfree SDK failed to initialize'));
      }
    };
    script.onerror = () => reject(new Error('Could not load Cashfree Web SDK'));
    document.body.appendChild(script);
  });
}

export interface UserRechargeRecord {
  transactionId: string;
  orderId: string;
  amount: number;
  balanceAfter: number;
  paymentMethod: string;
  createdAt: string;
  dateFormatted: string;
  timeFormatted: string;
  status: string;
  description: string;
}

export interface AdminUserRechargeItem {
  userId: string;
  name: string;
  phone: string;
  walletBalance: number;
  totalAmountAdded: number;
  rechargeCount: number;
  lastRechargedAt: string | null;
  lastRechargedTimeFormatted: string;
  recharges: UserRechargeRecord[];
  joinedAt: string;
}

export interface AdminUsersRechargesResponse {
  users: AdminUserRechargeItem[];
  summary: {
    totalUsers: number;
    activeRechargingUsers: number;
    totalRechargedAllUsers: number;
  };
}

export const walletApi = {
  /**
   * Fetch current user's wallet balance
   */
  async getBalance(): Promise<WalletBalanceResponse> {
    try {
      const res = await fetch(`${WALLET_BASE}/balance`, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          localStorage.setItem('esevai_wallet_balance', String(json.data.walletBalance));
          return json.data;
        }
      }
    } catch {}

    // Fallback to cache
    const cached = localStorage.getItem('esevai_wallet_balance');
    return {
      walletBalance: cached ? parseFloat(cached) : 0,
      username: 'Citizen',
      phoneNumber: '',
      minTopup: 10,
      maxTopup: 50000,
    };
  },

  /**
   * Fetch current user's transaction ledger
   */
  async getTransactions(page = 1, limit = 20, type = 'ALL'): Promise<{
    transactions: WalletTransactionItem[];
    total: number;
    pages: number;
  }> {
    try {
      const res = await fetch(`${WALLET_BASE}/transactions?page=${page}&limit=${limit}&type=${type}`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            transactions: json.data.transactions || [],
            total: json.data.pagination?.total || 0,
            pages: json.data.pagination?.pages || 1,
          };
        }
      }
    } catch {}

    return { transactions: [], total: 0, pages: 1 };
  },

  /**
   * Create Cashfree PG order for wallet top-up
   */
  async createTopupOrder(amount: number): Promise<{
    orderId: string;
    paymentSessionId: string;
    orderAmount: number;
  }> {
    const res = await fetch(`${WALLET_BASE}/topup/create-order`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ amount }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create Cashfree top-up order');
    }

    return json.data;
  },

  /**
   * Verify Cashfree PG order server-side and credit wallet
   */
  async verifyTopupOrder(orderId: string): Promise<{
    walletBalance: number;
    creditedAmount: number;
    transactionId?: string;
  }> {
    const res = await fetch(`${WALLET_BASE}/topup/verify`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ orderId }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Payment verification failed');
    }

    if (json.data?.walletBalance !== undefined) {
      localStorage.setItem('esevai_wallet_balance', String(json.data.walletBalance));
    }

    return json.data;
  },

  /**
   * Deduct amount from wallet for a service application
   */
  async debitWalletForService(data: {
    amount: number;
    serviceId: string;
    serviceName: string;
    ticketNumber: string;
    applicantName: string;
    applicantPhone: string;
  }): Promise<{
    transactionId: string;
    updatedBalance: number;
    deductedAmount: number;
    ticketNumber: string;
  }> {
    const res = await fetch(`${WALLET_BASE}/debit`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      const err: any = new Error(json.message || 'Failed to process wallet payment');
      err.data = json.data;
      throw err;
    }

    if (json.data?.updatedBalance !== undefined) {
      localStorage.setItem('esevai_wallet_balance', String(json.data.updatedBalance));
    }

    return json.data;
  },

  /**
   * Admin: Get wallet overview metrics
   */
  async getAdminOverview(): Promise<any> {
    const res = await fetch(`${WALLET_BASE}/admin/overview`, {
      headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to load wallet overview');
    }
    return json.data;
  },

  /**
   * Admin: Get all wallet transactions across users
   */
  async getAdminTransactions(page = 1, limit = 50, type = 'ALL', search = ''): Promise<any> {
    const q = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      type,
      search,
    }).toString();

    const res = await fetch(`${WALLET_BASE}/admin/transactions?${q}`, {
      headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to load admin transactions');
    }
    return json.data;
  },

  /**
   * Admin: Manual wallet adjustment
   */
  async adminAdjustWallet(data: {
    userId: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    reason: string;
  }): Promise<any> {
    const res = await fetch(`${WALLET_BASE}/admin/adjust`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to adjust user wallet');
    }
    return json.data;
  },

  /**
   * Admin: Get all users with total amount added and timestamped recharge history
   */
  async getAdminUsersRecharges(): Promise<AdminUsersRechargesResponse> {
    try {
      const res = await fetch(`${WALLET_BASE}/admin/users-recharges`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch {}
    return {
      users: [],
      summary: { totalUsers: 0, activeRechargingUsers: 0, totalRechargedAllUsers: 0 },
    };
  },
};
