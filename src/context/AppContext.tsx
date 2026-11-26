import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  ApplicationRecord,
  CenterProfile,
  ServiceItem,
  TransactionRecord,
  WalletType,
  PaymentGatewaySettings,
} from '../types';
import { ALL_SERVICES } from '../data/servicesData';
import { useAuth } from './AuthContext';
import { applicationApi } from '../services/applicationApi';
import { pricingApi, DEFAULT_SERVICE_PRICES, DEFAULT_PAYMENT_SETTINGS } from '../services/pricingApi';
import { paymentApi } from '../services/paymentApi';
import { walletApi } from '../services/walletApi';
import { WalletCheckoutModal } from '../components/WalletCheckoutModal';
import { PaymentSuccessModal } from '../components/PaymentSuccessModal';
import { syncTicketStatusToLocal, syncLiveApplicationsWithBackend, getAppTimestamp } from '../utils/statusSync';

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedService: ServiceItem | null;
  setSelectedService: (service: ServiceItem | null) => void;
  openService: (service: ServiceItem) => void;
  closeService: () => void;

  // Service Pricing & Gateway
  servicePrices: Record<string, number>;
  getServicePrice: (serviceId: string) => number;
  updateServicePrice: (serviceId: string, price: number) => void;
  paymentSettings: PaymentGatewaySettings;
  updatePaymentSettings: (settings: Partial<PaymentGatewaySettings>) => void;

  // Payment Verification Modal Trigger
  openPaymentDialog: (params: {
    serviceName: string;
    categoryLabel?: string;
    amount?: number;
    serviceId?: string;
    applicantName: string;
    applicantPhone: string;
    onConfirmed: (paymentDetails: {
      utrNumber: string;
      paidAmount: number;
      upiIdUsed: string;
      paymentScreenshot?: string;
    }) => void;
  }) => void;

  // Post-Payment Success Bilingual Popup
  paymentSuccessModalData: ApplicationRecord | null;
  setPaymentSuccessModalData: (app: ApplicationRecord | null) => void;

  // Wallets
  walletBalance: number;
  refreshWalletBalance: () => Promise<number>;
  paymentsWallet: number;
  cardsWallet: number;
  deductWallet: (wallet: WalletType, amount: number, title: string, refId: string) => boolean;
  creditWallet: (wallet: WalletType, amount: number, method: string) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Applications
  applications: ApplicationRecord[];
  addApplication: (app: Omit<ApplicationRecord, 'id' | 'tokenNumber' | 'date'>) => ApplicationRecord;
  updateApplicationStatus: (id: string, status: ApplicationRecord['status']) => void;
  refreshApplications: () => Promise<ApplicationRecord[]>;
  isSyncingApplications: boolean;

  // Transactions
  transactions: TransactionRecord[];

  // Profile
  profile: CenterProfile;
  updateProfile: (profile: Partial<CenterProfile>) => void;

  // Modals
  isRechargeModalOpen: boolean;
  setIsRechargeModalOpen: (open: boolean) => void;
  receiptModalData: ApplicationRecord | null;
  setReceiptModalData: (app: ApplicationRecord | null) => void;
  certificateModalData: { type: string; title: string; data: any } | null;
  setCertificateModalData: (data: { type: string; title: string; data: any } | null) => void;

  // Notifications
  notifications: { id: string; title: string; message: string; time: string; read: boolean }[];
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string) => void;
}

const initialProfile: CenterProfile = {
  centerName: 'Princess A to Z Business',
  agentName: 'K. Princess & Team',
  vleId: 'TN-CSC-2026-8842',
  mobile: '+91 98401 23456',
  email: 'princess.atoz@govmail.in',
  district: 'Salem / Chennai',
  taluk: 'Salem Central',
  address: 'No. 42/B, Anna Salai Commercial Complex, Main Road',
  pincode: '636001',
  joiningDate: '12-Jan-2023',
  terminalId: 'POS-TN-9812-X',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Access current user from AuthContext
  let auth: any = null;
  try {
    auth = useAuth();
  } catch {
    // If mounted outside AuthProvider (e.g. unit tests)
  }
  const user = auth?.user;
  const currentUserId = user?._id || 'guest';

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Real-time Wallet Balance synchronized with Cashfree & Ledger
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const v = localStorage.getItem('esevai_wallet_balance');
      return v !== null ? parseFloat(v) : 0.0;
    } catch {
      return 0.0;
    }
  });

  const refreshWalletBalance = async (): Promise<number> => {
    try {
      const res = await walletApi.getBalance();
      setWalletBalance(res.walletBalance);
      setPaymentsWallet(res.walletBalance);
      setCardsWallet(res.walletBalance);
      return res.walletBalance;
    } catch {
      return walletBalance;
    }
  };

  useEffect(() => {
    refreshWalletBalance();
  }, [user?._id]);

  // Exact wallet balances matching the screenshots
  const [paymentsWallet, setPaymentsWallet] = useState<number>(() => {
    if (!user?._id) return 799.0;
    try {
      const v = localStorage.getItem(`esevai_wallet_pay_${user._id}`);
      return v !== null ? parseFloat(v) : 799.0;
    } catch {
      return 799.0;
    }
  });

  const [cardsWallet, setCardsWallet] = useState<number>(() => {
    if (!user?._id) return 79.0;
    try {
      const v = localStorage.getItem(`esevai_wallet_card_${user._id}`);
      return v !== null ? parseFloat(v) : 79.0;
    } catch {
      return 79.0;
    }
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Service Pricing & Payment Gateway settings
  const [servicePrices, setServicePrices] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('esevai_service_prices');
      return saved ? { ...DEFAULT_SERVICE_PRICES, ...JSON.parse(saved) } : { ...DEFAULT_SERVICE_PRICES };
    } catch {
      return { ...DEFAULT_SERVICE_PRICES };
    }
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentGatewaySettings>(() => {
    try {
      const saved = localStorage.getItem('esevai_payment_settings');
      return saved ? { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_PAYMENT_SETTINGS };
    } catch {
      return { ...DEFAULT_PAYMENT_SETTINGS };
    }
  });

  useEffect(() => {
    pricingApi.getConfig().then(({ settings: loadedSettings, prices: loadedPrices }) => {
      setPaymentSettings(loadedSettings);
      setServicePrices(loadedPrices);
    });
  }, []);

  const getServicePrice = (serviceId: string): number => {
    if (servicePrices[serviceId] !== undefined) {
      return servicePrices[serviceId];
    }
    return DEFAULT_SERVICE_PRICES[serviceId] ?? 50;
  };

  const updateServicePrice = (serviceId: string, price: number) => {
    setServicePrices((prev) => {
      const next = { ...prev, [serviceId]: price };
      localStorage.setItem('esevai_service_prices', JSON.stringify(next));
      return next;
    });
  };

  const updatePaymentSettings = (updated: Partial<PaymentGatewaySettings>) => {
    setPaymentSettings((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('esevai_payment_settings', JSON.stringify(next));
      return next;
    });
  };

  // Payment Dialog State (Cashfree & Wallet Checkout)
  const [paymentDialogParams, setPaymentDialogParams] = useState<{
    isOpen: boolean;
    serviceName: string;
    categoryLabel?: string;
    amount: number;
    applicantName: string;
    applicantPhone: string;
    serviceId?: string;
    ticketNumber?: string;
    onConfirmed: (details: {
      transactionId?: string;
      utrNumber?: string;
      paidAmount: number;
      paymentMethod?: string;
      upiIdUsed?: string;
      paymentScreenshot?: string;
    }) => void;
  } | null>(null);

  const openPaymentDialog = (params: {
    serviceName: string;
    categoryLabel?: string;
    amount?: number;
    serviceId?: string;
    ticketNumber?: string;
    applicantName: string;
    applicantPhone: string;
    onConfirmed: (details: any) => void;
  }) => {
    const fee = params.amount !== undefined ? params.amount : (params.serviceId ? getServicePrice(params.serviceId) : 50);
    setPaymentDialogParams({
      isOpen: true,
      serviceName: params.serviceName,
      categoryLabel: params.categoryLabel || 'e-Sevai Service',
      amount: fee,
      applicantName: params.applicantName,
      applicantPhone: params.applicantPhone,
      serviceId: params.serviceId,
      ticketNumber: params.ticketNumber,
      onConfirmed: (details) => {
        setPaymentDialogParams(null);
        params.onConfirmed(details);
      },
    });
  };

  // Post-payment success bilingual popup state
  const [paymentSuccessModalData, setPaymentSuccessModalData] = useState<ApplicationRecord | null>(null);

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);

  // User-scoped transactions
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    if (!user?._id) return [];
    try {
      const saved = localStorage.getItem(`esevai_txns_${user._id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User-scoped profile
  const [profile, setProfile] = useState<CenterProfile>(() => {
    const base = {
      ...initialProfile,
      agentName: user?.username || initialProfile.agentName,
      mobile: user?.phoneNumber || initialProfile.mobile,
    };
    if (!user?._id) return base;
    try {
      const saved = localStorage.getItem(`esevai_profile_${user._id}`);
      return saved ? JSON.parse(saved) : base;
    } catch {
      return base;
    }
  });

  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState<ApplicationRecord | null>(null);
  const [certificateModalData, setCertificateModalData] = useState<{
    type: string;
    title: string;
    data: any;
  } | null>(null);

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }>>(() => {
    if (!user?._id) return [];
    try {
      const saved = localStorage.getItem(`esevai_notifs_${user._id}`);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'notif-welcome',
              title: 'Welcome to e-Sevai Portal',
              message: `Signed in as ${user.username}. All service portals are active and operational.`,
              time: 'Just now',
              read: false,
            },
          ];
    } catch {
      return [];
    }
  });

  // Whenever the active logged-in user changes (login, logout, switch account), sync state immediately
  const prevUserIdRef = useRef<string>(currentUserId);
  useEffect(() => {
    if (prevUserIdRef.current === currentUserId) return;
    prevUserIdRef.current = currentUserId;

    if (!user?._id) {
      setTransactions([]);
      setPaymentsWallet(799.0);
      setCardsWallet(79.0);
      setNotifications([]);
      setProfile(initialProfile);
      refreshApplications();
      return;
    }

    try {
      refreshApplications();

      const savedTxns = localStorage.getItem(`esevai_txns_${user._id}`);
      setTransactions(savedTxns ? JSON.parse(savedTxns) : []);

      const savedPay = localStorage.getItem(`esevai_wallet_pay_${user._id}`);
      setPaymentsWallet(savedPay !== null ? parseFloat(savedPay) : 799.0);

      const savedCard = localStorage.getItem(`esevai_wallet_card_${user._id}`);
      setCardsWallet(savedCard !== null ? parseFloat(savedCard) : 79.0);

      const savedProfile = localStorage.getItem(`esevai_profile_${user._id}`);
      setProfile(
        savedProfile
          ? JSON.parse(savedProfile)
          : {
              ...initialProfile,
              agentName: user.username,
              mobile: user.phoneNumber,
            }
      );

      const savedNotifs = localStorage.getItem(`esevai_notifs_${user._id}`);
      setNotifications(
        savedNotifs
          ? JSON.parse(savedNotifs)
          : [
              {
                id: `notif-${Date.now()}`,
                title: 'Welcome to e-Sevai Portal',
                message: `Signed in as ${user.username}. All service portals are active and operational.`,
                time: 'Just now',
                read: false,
              },
            ]
      );
    } catch (err) {
      console.error('Failed to reload user state:', err);
    }
  }, [currentUserId, user?._id, user?.username, user?.phoneNumber]);

  const [isSyncingApplications, setIsSyncingApplications] = useState(false);

  const refreshApplications = useCallback(async (): Promise<ApplicationRecord[]> => {
    setIsSyncingApplications(true);
    try {
      // 1. Fetch directly from MongoDB backend applications API
      const dbRes = await applicationApi.listApplications({
        phone: user?.phoneNumber,
        scope: user?.role === 'admin' ? 'all' : undefined,
        limit: 200,
      });

      const dbApps: ApplicationRecord[] = Array.isArray(dbRes.data) ? dbRes.data : [];

      // 2. Reconcile with live backend queues (Aadhaar, Ration, PAN, Voter, Driving, Vehicle)
      const reconciled = await syncLiveApplicationsWithBackend(dbApps);
      setApplications(reconciled);
      return reconciled;
    } catch (err) {
      console.warn('Failed to refresh applications from database:', err);
      return [];
    } finally {
      setIsSyncingApplications(false);
    }
  }, [user?.phoneNumber, user?.role]);

  // Keep applications synchronized with backend database and live updates
  useEffect(() => {
    const onStorageSync = () => {
      refreshApplications();
    };

    window.addEventListener('storage', onStorageSync);
    window.addEventListener('app_status_updated', onStorageSync);

    // Initial load directly from MongoDB database
    refreshApplications();

    // Periodic live sync every 15 seconds so admin updates reflect in real-time
    const interval = setInterval(refreshApplications, 15000);

    return () => {
      window.removeEventListener('storage', onStorageSync);
      window.removeEventListener('app_status_updated', onStorageSync);
      clearInterval(interval);
    };
  }, [refreshApplications]);

  const openService = (service: ServiceItem) => {
    setSelectedService(service);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeService = () => {
    setSelectedService(null);
  };

  const deductWallet = (
    _wallet: WalletType,
    amount: number,
    title: string,
    refId: string
  ): boolean => {
    if (walletBalance < amount) {
      return false;
    }
    const nextVal = +(walletBalance - amount).toFixed(2);
    setWalletBalance(nextVal);
    setPaymentsWallet(nextVal);
    setCardsWallet(nextVal);
    try {
      localStorage.setItem('esevai_wallet_balance', String(nextVal));
    } catch {}

    // Record transaction
    const now = new Date();
    const newTxn: TransactionRecord = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      amount,
      type: 'debit',
      wallet: 'payments',
      date: now.toISOString().split('T')[0],
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      status: 'SUCCESS',
      refId,
    };
    setTransactions((prev) => {
      const nextTxns = [newTxn, ...prev];
      if (user?._id) {
        try {
          localStorage.setItem(`esevai_txns_${user._id}`, JSON.stringify(nextTxns));
        } catch {}
      }
      return nextTxns;
    });
    return true;
  };

  const creditWallet = (wallet: WalletType, amount: number, method: string) => {
    const nextVal = +(walletBalance + amount).toFixed(2);
    setWalletBalance(nextVal);
    setPaymentsWallet(nextVal);
    setCardsWallet(nextVal);
    try {
      localStorage.setItem('esevai_wallet_balance', String(nextVal));
    } catch {}

    const now = new Date();
    const newTxn: TransactionRecord = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Wallet Recharge via ${method}`,
      amount,
      type: 'credit',
      wallet,
      date: now.toISOString().split('T')[0],
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      status: 'SUCCESS',
      refId: `REC-${Date.now()}`,
    };
    setTransactions((prev) => {
      const nextTxns = [newTxn, ...prev];
      if (user?._id) {
        try {
          localStorage.setItem(`esevai_txns_${user._id}`, JSON.stringify(nextTxns));
        } catch {}
      }
      return nextTxns;
    });
    addNotification('Wallet Recharged', `Successfully credited ₹${amount} to your ${wallet === 'payments' ? 'Payments' : 'Cards'} Wallet.`);
  };

  const addApplication = (
    app: Omit<ApplicationRecord, 'id' | 'tokenNumber' | 'date'>
  ): ApplicationRecord => {
    const now = new Date();
    const prefix = app.serviceId.includes('can')
      ? 'CAN-TN'
      : app.serviceId.includes('ration')
      ? 'RC-TN'
      : app.serviceId.includes('birth')
      ? 'BC-TN'
      : app.serviceId.includes('death')
      ? 'DC-TN'
      : app.serviceId.includes('aadhaar')
      ? 'UID-TN'
      : app.serviceId.includes('pan')
      ? 'PAN-TN'
      : app.serviceId.includes('voter')
      ? 'VOT-TN'
      : app.serviceId.includes('driving')
      ? 'DL-TN'
      : app.serviceId.includes('vehicle')
      ? 'VAH-TN'
      : 'APP';

    const tokenNumber = `${prefix}-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newApp: ApplicationRecord = {
      ...app,
      id: `app-${Date.now()}`,
      tokenNumber,
      date: `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      status: app.status || 'Under Review',
      paymentStatus:
        app.paymentStatus ||
        (app.paymentMethod?.toLowerCase().includes('wallet')
          ? 'Verified & Approved'
          : 'Pending Verification'),
    };

    const appTicket = (app.details?.ticketNumber as string) || tokenNumber;

    // Immediately update React in-memory state for instantaneous UI responsiveness
    setApplications((prev) => [newApp, ...prev.filter((a) => a.tokenNumber !== tokenNumber)]);

    // 1. Persist directly to MongoDB database
    applicationApi
      .createApplication({
        ...newApp,
        tokenNumber: appTicket,
      })
      .then((res) => {
        if (res.success && res.data) {
          // Reconcile temporary ID with real MongoDB ID
          setApplications((prev) =>
            prev.map((a) =>
              a.tokenNumber === tokenNumber ? { ...a, id: (res.data as any)._id || a.id } : a
            )
          );
        }
      })
      .catch((err) => console.error('Database application save error:', err));

    // 2. Persist payment record to MongoDB database
    if (app.paidAmount || app.utrNumber) {
      paymentApi
        .submitPayment({
          ticketNumber: appTicket,
          serviceId: app.serviceId,
          serviceName: app.serviceName,
          category: (app.details?.categoryLabel as string) || 'General',
          applicantName: app.applicantName,
          applicantPhone: app.mobile,
          amount: app.paidAmount || app.fee || 0,
          utrNumber: app.utrNumber || `WAL-${Date.now()}`,
          upiIdUsed: app.upiIdUsed || paymentSettings.upiId,
          paymentScreenshot: app.paymentScreenshot,
          paymentMethod: app.paymentMethod || 'Wallet',
          status:
            app.paymentStatus ||
            (app.paymentMethod?.toLowerCase().includes('wallet')
              ? 'Verified & Approved'
              : 'Pending Verification'),
        })
        .catch((err) => console.error('Database payment save error:', err));
    }

    // Always open the confirmation modal notifying citizen
    setPaymentSuccessModalData(newApp);

    addNotification(
      'New Application Submitted',
      `Application for ${app.serviceName} submitted. Token: ${tokenNumber}`
    );
    return newApp;
  };

  const updateApplicationStatus = (id: string, status: ApplicationRecord['status']) => {
    // 1. Update in-memory state
    setApplications((prev) =>
      prev.map((app) => (app.id === id || app.tokenNumber === id ? { ...app, status } : app))
    );
    // 2. Persist to MongoDB database
    applicationApi.updateStatus(id, status).catch(console.warn);
    syncTicketStatusToLocal(id, status);
  };

  const updateProfile = (updated: Partial<CenterProfile>) => {
    setProfile((prev) => {
      const nextProfile = { ...prev, ...updated };
      if (user?._id) {
        try {
          localStorage.setItem(`esevai_profile_${user._id}`, JSON.stringify(nextProfile));
        } catch {}
      }
      return nextProfile;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const nextNotifs = prev.map((n) => ({ ...n, read: true }));
      if (user?._id) {
        try {
          localStorage.setItem(`esevai_notifs_${user._id}`, JSON.stringify(nextNotifs));
        } catch {}
      }
      return nextNotifs;
    });
  };

  const addNotification = (title: string, message: string) => {
    setNotifications((prev) => {
      const nextNotifs = [
        {
          id: `notif-${Date.now()}`,
          title,
          message,
          time: 'Just now',
          read: false,
        },
        ...prev,
      ];
      if (user?._id) {
        try {
          localStorage.setItem(`esevai_notifs_${user._id}`, JSON.stringify(nextNotifs));
        } catch {}
      }
      return nextNotifs;
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedService,
        setSelectedService,
        openService,
        closeService,
        servicePrices,
        getServicePrice,
        updateServicePrice,
        paymentSettings,
        updatePaymentSettings,
        openPaymentDialog,
        paymentSuccessModalData,
        setPaymentSuccessModalData,
        walletBalance,
        refreshWalletBalance,
        paymentsWallet,
        cardsWallet,
        deductWallet,
        creditWallet,
        searchQuery,
        setSearchQuery,
        applications,
        addApplication,
        updateApplicationStatus,
        transactions,
        profile,
        updateProfile,
        isRechargeModalOpen,
        setIsRechargeModalOpen,
        receiptModalData,
        setReceiptModalData,
        certificateModalData,
        setCertificateModalData,
        notifications,
        markAllNotificationsRead,
        addNotification,
        refreshApplications,
        isSyncingApplications,
      }}
    >
      {children}
      {paymentDialogParams && (
        <WalletCheckoutModal
          isOpen={paymentDialogParams.isOpen}
          onClose={() => setPaymentDialogParams(null)}
          serviceName={paymentDialogParams.serviceName}
          categoryLabel={paymentDialogParams.categoryLabel}
          amount={paymentDialogParams.amount}
          applicantName={paymentDialogParams.applicantName}
          applicantPhone={paymentDialogParams.applicantPhone}
          serviceId={paymentDialogParams.serviceId}
          ticketNumber={paymentDialogParams.ticketNumber}
          onConfirmPayment={paymentDialogParams.onConfirmed}
        />
      )}
      <PaymentSuccessModal
        isOpen={Boolean(paymentSuccessModalData)}
        onClose={() => setPaymentSuccessModalData(null)}
        application={paymentSuccessModalData}
        onViewHistory={() => {
          setPaymentSuccessModalData(null);
          closeService();
          setActiveTab('service_history');
        }}
        onViewReceipt={() => {
          const app = paymentSuccessModalData;
          setPaymentSuccessModalData(null);
          setReceiptModalData(app);
        }}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
