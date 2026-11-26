import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Wallet,
  Calendar,
  Filter,
  ArrowUpRight,
  Download,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  Users,
  Layers,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Fingerprint,
  Vote,
  Store,
  Car,
  Tag,
  ArrowDownLeft,
} from 'lucide-react';
import { AdminQueue } from './AdminSidebar';
import { useApp } from '../context/AppContext';
import { applicationApi } from '../services/applicationApi';
import { aadhaarApi } from '../services/aadhaarApi';
import { rationApi } from '../services/rationApi';
import { panApi } from '../services/panApi';
import { voterApi } from '../services/voterApi';
import { drivingApi } from '../services/drivingApi';
import { vehicleApi } from '../services/vehicleApi';
import { paymentApi } from '../services/paymentApi';
import { walletApi } from '../services/walletApi';
import { pricingApi } from '../services/pricingApi';
import { mapBackendStatusToAppStatus, getAppTimestamp } from '../utils/statusSync';
import { ApplicationRecord } from '../types';

export interface AdminDashboardViewProps {
  onNavigateQueue: (queue: AdminQueue) => void;
}

export interface UnifiedServiceRecord {
  id: string;
  ticketNumber: string;
  serviceName: string;
  category: 'Aadhaar' | 'PAN' | 'Voter' | 'Ration' | 'Driving' | 'Vehicle' | 'General';
  queueId: AdminQueue;
  applicantName: string;
  mobile: string;
  fee: number;
  status: 'Completed' | 'In Process' | 'Pending Verification' | 'Rejected' | 'Under Review' | 'Pending';
  rawStatus: string;
  paymentMethod: string;
  createdAt: string;
  timestamp: number;
  ackNumber?: string;
  remarks?: string;
}

const DEFAULT_CATEGORY_FEES: Record<string, number> = {
  Aadhaar: 60,
  PAN: 110,
  Voter: 40,
  Ration: 50,
  Driving: 200,
  Vehicle: 150,
  General: 60,
};

// Safe helper to extract arrays regardless of API wrapping ({ data: [...] }, { data: { requests: [...] } }, etc.)
function extractArray(val: any, preferredKey?: string): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (preferredKey && val?.data && Array.isArray(val.data[preferredKey])) return val.data[preferredKey];
  if (preferredKey && Array.isArray(val[preferredKey])) return val[preferredKey];
  if (Array.isArray(val.data)) return val.data;
  if (Array.isArray(val.data?.requests)) return val.data.requests;
  if (Array.isArray(val.data?.issues)) return val.data.issues;
  if (Array.isArray(val.data?.items)) return val.data.items;
  if (Array.isArray(val.data?.payments)) return val.data.payments;
  if (Array.isArray(val.requests)) return val.requests;
  if (Array.isArray(val.issues)) return val.issues;
  if (Array.isArray(val.items)) return val.items;
  if (Array.isArray(val.payments)) return val.payments;
  return [];
}

type DateFilterPreset = 'all' | 'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'custom';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigateQueue }) => {
  const { applications: contextApps, servicePrices } = useApp();
  const [records, setRecords] = useState<UnifiedServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Filter States
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination for Ledger Table
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Cashfree wallet metrics
  const [walletOverview, setWalletOverview] = useState<{
    circulatingBalance: number;
    totalTopups: number;
    topupCount: number;
    totalDebits: number;
    debitCount: number;
  }>({
    circulatingBalance: 0,
    totalTopups: 0,
    topupCount: 0,
    totalDebits: 0,
    debitCount: 0,
  });

  // Price Map
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});

  // Fetch all live records across backend APIs and localStorage stores
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        appDbRes,
        aadhaarRes,
        rationRes,
        panRes,
        voterRes,
        drivingRes,
        vehicleRes,
        paymentRes,
        walletOverviewRes,
        pricingRes,
      ] = await Promise.allSettled([
        applicationApi.listApplications({ scope: 'all', limit: 200 }),
        aadhaarApi.listIssues({ scope: 'all', limit: 200 }),
        rationApi.listRequests({ scope: 'all', limit: 200 }),
        panApi.listRequests({ scope: 'all', limit: 200 }),
        voterApi.listRequests({ scope: 'all', limit: 200 }),
        drivingApi.listRequests({ scope: 'all', limit: 200 }),
        vehicleApi.listRequests({ scope: 'all', limit: 200 }),
        paymentApi.getAllPayments({ status: 'all' }),
        walletApi.getAdminOverview(),
        pricingApi.getConfig(),
      ]);

      // Service price lookup map
      const pMap: Record<string, number> = {};
      if (pricingRes.status === 'fulfilled' && pricingRes.value) {
        const val = pricingRes.value as any;
        if (val.prices) {
          Object.assign(pMap, val.prices);
        } else if (val.data?.services) {
          val.data.services.forEach((s: any) => {
            if (s.serviceId) pMap[s.serviceId] = s.price;
          });
        }
      }
      setPriceMap(pMap);

      // Wallet Overview metrics
      if (walletOverviewRes.status === 'fulfilled' && walletOverviewRes.value) {
        const wo = walletOverviewRes.value;
        setWalletOverview({
          circulatingBalance: wo.totalCirculatingBalance || 0,
          totalTopups: wo.credits?.total || 0,
          topupCount: wo.credits?.count || 0,
          totalDebits: wo.debits?.total || 0,
          debitCount: wo.debits?.count || 0,
        });
      }

      // Payment lookup map by ticketNumber and UTR
      const paymentLookup = new Map<string, any>();
      const paymentItems = extractArray(paymentRes.status === 'fulfilled' ? paymentRes.value : null, 'payments');
      paymentItems.forEach((p: any) => {
        if (p.ticketNumber) paymentLookup.set(p.ticketNumber, p);
        if (p.utrNumber) paymentLookup.set(p.utrNumber, p);
      });

      const unified: UnifiedServiceRecord[] = [];

      // Helper to detect department category and queueId from names/IDs
      const classifyDepartment = (name?: string, id?: string, rawCat?: string): { category: UnifiedServiceRecord['category']; queueId: AdminQueue } => {
        const str = `${name || ''} ${id || ''} ${rawCat || ''}`.toLowerCase();
        if (str.includes('ration') || str.includes('smart card') || str.includes('tnpds')) return { category: 'Ration', queueId: 'ration' };
        if (str.includes('aadhaar') || str.includes('uidai')) return { category: 'Aadhaar', queueId: 'aadhaar' };
        if (str.includes('pan') || str.includes('nsdl') || str.includes('utiit') || str.includes('income tax')) return { category: 'PAN', queueId: 'pan' };
        if (str.includes('voter') || str.includes('epic') || str.includes('eci') || str.includes('election')) return { category: 'Voter', queueId: 'voter' };
        if (str.includes('driving') || str.includes('license') || str.includes('sarathi') || str.includes('llr')) return { category: 'Driving', queueId: 'driving' };
        if (str.includes('vehicle') || str.includes('vahan') || str.includes('rc ') || str.includes('road tax')) return { category: 'Vehicle', queueId: 'vehicle' };
        return { category: 'General', queueId: 'aadhaar' };
      };

      // 0. Central MongoDB Applications
      const appDbItems = extractArray(appDbRes.status === 'fulfilled' ? appDbRes.value : null);
      appDbItems.forEach((item: any) => {
        const mapped = mapBackendStatusToAppStatus(item.status);
        const { category: cat, queueId: qId } = classifyDepartment(item.serviceName, item.serviceId, item.category);
        const defaultCatFee = DEFAULT_CATEGORY_FEES[cat] || 60;
        const feeVal = Number(item.fee || item.paidAmount) || pMap[item.serviceId] || defaultCatFee;
        const ts = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();

        unified.push({
          id: item._id,
          ticketNumber: item.tokenNumber,
          serviceName: item.serviceName || `${cat} Service`,
          category: cat,
          queueId: qId,
          applicantName: item.applicantName || 'Citizen',
          mobile: item.applicantPhone || '',
          fee: feeVal,
          status: mapped.status,
          rawStatus: item.status,
          paymentMethod: item.paymentMethod || 'Wallet',
          createdAt: item.createdAt || new Date().toISOString(),
          timestamp: ts,
          ackNumber: item.ackNumber,
          remarks: item.remarks,
        });
      });

      // 1. Aadhaar Issues from MongoDB
      const aadhaarItems = extractArray(aadhaarRes.status === 'fulfilled' ? aadhaarRes.value : null, 'issues');
      aadhaarItems.forEach((item: any) => {
        const exists = unified.some(
          (u) => u.ticketNumber === item.ticketNumber || u.id === item._id || (item.ticketNumber && u.id === item.ticketNumber)
        );
        if (exists) return;

        const mapped = mapBackendStatusToAppStatus(item.status);
        const pay = paymentLookup.get(item.ticketNumber);
        const fee = pay?.amount || pMap['aadhaar-correction'] || 60;
        const ts = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();

        unified.push({
          id: item._id,
          ticketNumber: item.ticketNumber,
          serviceName: item.issueType || 'Aadhaar Demographic Correction',
          category: 'Aadhaar',
          queueId: 'aadhaar',
          applicantName: item.applicantName || 'Citizen',
          mobile: item.applicantPhone || '',
          fee: Number(fee) || 60,
          status: mapped.status,
          rawStatus: item.status,
          paymentMethod: pay?.paymentMethod || 'Wallet',
          createdAt: item.createdAt || new Date().toISOString(),
          timestamp: ts,
          remarks: item.resolutionRemarks,
        });
      });

      // 2. Ration Requests from MongoDB
      const rationItems = extractArray(rationRes.status === 'fulfilled' ? rationRes.value : null);
      rationItems.forEach((item: any) => {
        const exists = unified.some(
          (u) => u.ticketNumber === item.ticketNumber || u.id === item._id || (item.ticketNumber && u.id === item.ticketNumber)
        );
        if (exists) return;

        const mapped = mapBackendStatusToAppStatus(item.status);
        const pay = paymentLookup.get(item.ticketNumber);
        const fee = pay?.amount || 50;
        const ts = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();

        unified.push({
          id: item._id,
          ticketNumber: item.ticketNumber,
          serviceName: item.serviceType || 'Ration Card Service',
          category: 'Ration',
          queueId: 'ration',
          applicantName: item.applicantName || 'Citizen',
          mobile: item.applicantPhone || '',
          fee: Number(fee) || 50,
          status: mapped.status,
          rawStatus: item.status,
          paymentMethod: pay?.paymentMethod || 'Wallet',
          createdAt: item.createdAt || new Date().toISOString(),
          timestamp: ts,
          ackNumber: item.tnpdsAckNumber,
          remarks: item.resolutionRemarks,
        });
      });

      // 3. PAN Requests from MongoDB
      const panItems = extractArray(panRes.status === 'fulfilled' ? panRes.value : null, 'requests');
      panItems.forEach((item: any) => {
        const exists = unified.some(
          (u) => u.ticketNumber === item.ticketNumber || u.id === item._id || (item.ticketNumber && u.id === item.ticketNumber)
        );
        if (exists) return;

        const mapped = mapBackendStatusToAppStatus(item.status);
        const pay = paymentLookup.get(item.ticketNumber);
        const fee = pay?.amount || 110;
        const ts = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();

        unified.push({
          id: item._id,
          ticketNumber: item.ticketNumber,
          serviceName: item.serviceType || 'PAN Card Service',
          category: 'PAN',
          queueId: 'pan',
          applicantName: item.applicantName || 'Citizen',
          mobile: item.applicantPhone || '',
          fee: Number(fee) || 110,
          status: mapped.status,
          rawStatus: item.status,
          paymentMethod: pay?.paymentMethod || 'Wallet',
          createdAt: item.createdAt || new Date().toISOString(),
          timestamp: ts,
          ackNumber: item.nsdlUtiiAckNumber,
          remarks: item.resolutionRemarks,
        });
      });

      // 4. Voter Requests from MongoDB
      const voterItems = extractArray(voterRes.status === 'fulfilled' ? voterRes.value : null, 'requests');
      voterItems.forEach((item: any) => {
        const exists = unified.some(
          (u) => u.ticketNumber === item.ticketNumber || u.id === item._id || (item.ticketNumber && u.id === item.ticketNumber)
        );
        if (exists) return;

        const mapped = mapBackendStatusToAppStatus(item.status);
        const pay = paymentLookup.get(item.ticketNumber);
        const fee = pay?.amount || 40;
        const ts = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();

        unified.push({
          id: item._id,
          ticketNumber: item.ticketNumber,
          serviceName: item.serviceType || 'Voter ID Service',
          category: 'Voter',
          queueId: 'voter',
          applicantName: item.applicantName || 'Citizen',
          mobile: item.applicantPhone || '',
          fee: Number(fee) || 40,
          status: mapped.status,
          rawStatus: item.status,
          paymentMethod: pay?.paymentMethod || 'Wallet',
          createdAt: item.createdAt || new Date().toISOString(),
          timestamp: ts,
          ackNumber: item.eciReferenceNumber,
          remarks: item.resolutionRemarks,
        });
      });

      // 5. Driving Requests from MongoDB
      const drivingItems = extractArray(drivingRes.status === 'fulfilled' ? drivingRes.value : null);
      drivingItems.forEach((item: any) => {
        const exists = unified.some(
          (u) => u.ticketNumber === item.ticketNumber || u.id === item._id || (item.ticketNumber && u.id === item.ticketNumber)
        );
        if (exists) return;

        const mapped = mapBackendStatusToAppStatus(item.status);
        const pay = paymentLookup.get(item.ticketNumber);
        const fee = pay?.amount || 200;
        const ts = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();

        unified.push({
          id: item._id,
          ticketNumber: item.ticketNumber,
          serviceName: item.serviceType || 'Driving License Service',
          category: 'Driving',
          queueId: 'driving',
          applicantName: item.applicantName || 'Citizen',
          mobile: item.applicantPhone || '',
          fee: Number(fee) || 200,
          status: mapped.status,
          rawStatus: item.status,
          paymentMethod: pay?.paymentMethod || 'Wallet',
          createdAt: item.createdAt || new Date().toISOString(),
          timestamp: ts,
          ackNumber: item.sarathiAckNumber,
          remarks: item.resolutionRemarks,
        });
      });

      // 6. Vehicle Requests from MongoDB
      const vehicleItems = extractArray(vehicleRes.status === 'fulfilled' ? vehicleRes.value : null);
      vehicleItems.forEach((item: any) => {
        const exists = unified.some(
          (u) => u.ticketNumber === item.ticketNumber || u.id === item._id || (item.ticketNumber && u.id === item.ticketNumber)
        );
        if (exists) return;

        const mapped = mapBackendStatusToAppStatus(item.status);
        const pay = paymentLookup.get(item.ticketNumber);
        const fee = pay?.amount || 150;
        const ts = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();

        unified.push({
          id: item._id,
          ticketNumber: item.ticketNumber,
          serviceName: item.serviceType || 'Vehicle Registration / Vahan',
          category: 'Vehicle',
          queueId: 'vehicle',
          applicantName: item.ownerName || item.applicantName || 'Citizen',
          mobile: item.applicantPhone || '',
          fee: Number(fee) || 150,
          status: mapped.status,
          rawStatus: item.status,
          paymentMethod: pay?.paymentMethod || 'Wallet',
          createdAt: item.createdAt || new Date().toISOString(),
          timestamp: ts,
          ackNumber: item.vahanAckNumber,
          remarks: item.resolutionRemarks,
        });
      });

      // 7. Reconcile standalone payments recorded in MongoDB Payment collection
      paymentItems.forEach((p: any) => {
        if (p.status === 'Failed' || p.status === 'Cancelled' || p.paymentStatus === 'Failed') return;
        const exists = unified.some(
          (u) =>
            (p.ticketNumber && u.ticketNumber === p.ticketNumber) ||
            (p.utrNumber && u.ackNumber === p.utrNumber) ||
            u.id === p._id
        );
        if (!exists && p.ticketNumber) {
          const { category: cat, queueId: qId } = classifyDepartment(p.serviceName, p.serviceId, p.category);
          const mapped = mapBackendStatusToAppStatus(p.status);
          const defaultCatFee = DEFAULT_CATEGORY_FEES[cat] || 60;
          const feeVal = Number(p.amount) || defaultCatFee;
          const ts = p.createdAt ? new Date(p.createdAt).getTime() : Date.now();

          unified.push({
            id: p._id || p.ticketNumber,
            ticketNumber: p.ticketNumber,
            serviceName: p.serviceName || `${cat} Service`,
            category: cat,
            queueId: qId,
            applicantName: p.applicantName || 'Citizen',
            mobile: p.applicantPhone || '',
            fee: feeVal,
            status: mapped.status,
            rawStatus: p.status,
            paymentMethod: p.paymentMethod || 'UPI QR',
            createdAt: p.createdAt || new Date().toISOString(),
            timestamp: ts,
            remarks: p.adminRemarks,
          });
        }
      });

      // Sort newest / latest first
      unified.sort((a, b) => b.timestamp - a.timestamp);
      setRecords(unified);
      setLastRefreshedAt(new Date());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [contextApps, servicePrices]);

  // Live synchronization: auto-refresh on storage updates, app status changes, and window focus
  useEffect(() => {
    fetchAllData();

    const handleSync = () => {
      fetchAllData();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('app_status_updated', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('app_status_updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [fetchAllData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchAllData();
  };

  const handleSeedDemoEnrollments = async () => {
    const demoApps: ApplicationRecord[] = [
      {
        id: `app-demo-ration-1`,
        tokenNumber: 'RC-TN-2026-48921',
        serviceId: 'ration-name-transfer',
        serviceName: 'Ration Card Name Transfer (பெயர் மாற்றம்)',
        applicantName: 'M. Senthil Kumar',
        mobile: '9840123456',
        date: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'Completed',
        fee: 50,
        paidAmount: 50,
        walletType: 'payments',
        paymentMethod: 'Wallet',
        paymentStatus: 'Verified & Approved',
        remarks: 'Name transfer completed successfully with TNePDS.',
        details: { ticketNumber: 'RC-TN-2026-48921', ackNumber: 'TNPDS-881249' },
      },
      {
        id: `app-demo-aadhaar-1`,
        tokenNumber: 'UID-TN-2026-77214',
        serviceId: 'aadhaar-correction',
        serviceName: 'Aadhaar Demographic Correction (முகவரி மாற்றம்)',
        applicantName: 'K. Priya Dharshini',
        mobile: '9443187654',
        date: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: 'In Process',
        fee: 60,
        paidAmount: 60,
        walletType: 'payments',
        paymentMethod: 'Wallet',
        paymentStatus: 'Verified & Approved',
        remarks: 'Biometric update appointment slot booked.',
        details: { ticketNumber: 'UID-TN-2026-77214' },
      },
      {
        id: `app-demo-pan-1`,
        tokenNumber: 'PAN-TN-2026-11893',
        serviceId: 'pan-new',
        serviceName: 'PAN Card New Application (புதிய பான் கார்டு)',
        applicantName: 'R. Vignesh',
        mobile: '9789012345',
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'Completed',
        fee: 110,
        paidAmount: 110,
        walletType: 'payments',
        paymentMethod: 'Wallet',
        paymentStatus: 'Verified & Approved',
        remarks: 'NSDL acknowledgment issued. e-PAN dispatched.',
        details: { ticketNumber: 'PAN-TN-2026-11893', ackNumber: 'NSDL-8910482910' },
      },
      {
        id: `app-demo-voter-1`,
        tokenNumber: 'VOT-TN-2026-33910',
        serviceId: 'voter-new',
        serviceName: 'Voter ID Form 6 Inclusion (புதிய வாக்காளர்)',
        applicantName: 'S. Anitha',
        mobile: '9884512390',
        date: new Date(Date.now() - 3600000 * 36).toISOString(),
        status: 'Under Review',
        fee: 40,
        paidAmount: 40,
        walletType: 'payments',
        paymentMethod: 'Wallet',
        paymentStatus: 'Verified & Approved',
        remarks: 'BLO physical inspection pending.',
        details: { ticketNumber: 'VOT-TN-2026-33910', ackNumber: 'ECI-TN-771249' },
      },
      {
        id: `app-demo-driving-1`,
        tokenNumber: 'DL-TN-2026-90412',
        serviceId: 'driving-ll-fresh',
        serviceName: 'Learner License LLR (பழகுநர் உரிமம்)',
        applicantName: 'T. Karthikeyan',
        mobile: '9176543210',
        date: new Date(Date.now() - 3600000 * 48).toISOString(),
        status: 'In Process',
        fee: 200,
        paidAmount: 200,
        walletType: 'payments',
        paymentMethod: 'Wallet',
        paymentStatus: 'Verified & Approved',
        remarks: 'Online road safety test slot allotted at RTO Chennai South.',
        details: { ticketNumber: 'DL-TN-2026-90412', ackNumber: 'SAR-2026-98124' },
      },
      {
        id: `app-demo-vehicle-1`,
        tokenNumber: 'VAH-TN-2026-66421',
        serviceId: 'vehicle-rc-transfer',
        serviceName: 'Vehicle RC Ownership Transfer (வாகன உரிமை மாற்றம்)',
        applicantName: 'V. Murugan',
        mobile: '9003124567',
        date: new Date(Date.now() - 3600000 * 60).toISOString(),
        status: 'Completed',
        fee: 150,
        paidAmount: 150,
        walletType: 'payments',
        paymentMethod: 'Wallet',
        paymentStatus: 'Verified & Approved',
        remarks: 'Smart card RC dispatched by speed post.',
        details: { ticketNumber: 'VAH-TN-2026-66421', ackNumber: 'VAH-TN-0812' },
      },
    ];

    try {
      setIsRefreshing(true);
      for (const demo of demoApps) {
        await applicationApi.createApplication(demo);
      }
      fetchAllData();
    } catch {
      fetchAllData();
    }
  };

  // Filter Computation
  const filteredRecords = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysAgo = now.getTime() - 7 * 86400000;
    const thirtyDaysAgo = now.getTime() - 30 * 86400000;
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return records.filter((r) => {
      // 1. Date Filter
      if (datePreset === 'today') {
        if (r.timestamp < todayStart) return false;
      } else if (datePreset === 'yesterday') {
        if (r.timestamp < yesterdayStart || r.timestamp >= todayStart) return false;
      } else if (datePreset === '7d') {
        if (r.timestamp < sevenDaysAgo) return false;
      } else if (datePreset === '30d') {
        if (r.timestamp < thirtyDaysAgo) return false;
      } else if (datePreset === 'this_month') {
        if (r.timestamp < thisMonthStart) return false;
      } else if (datePreset === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate).getTime();
          if (r.timestamp < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate).getTime() + 86400000; // inclusive of end day
          if (r.timestamp > end) return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (r.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // 3. Status Filter (Handles Completed, In Process, Pending / Under Review, Rejected)
      if (selectedStatus !== 'all') {
        const isPendingApp =
          r.status === 'Under Review' ||
          r.status === 'Pending' ||
          r.status === 'Pending Verification' ||
          r.rawStatus?.toLowerCase().includes('pending') ||
          r.rawStatus?.toLowerCase().includes('review');

        if (selectedStatus === 'Pending' || selectedStatus === 'Pending Verification') {
          if (!isPendingApp) return false;
        } else if (r.status !== selectedStatus) {
          return false;
        }
      }

      // 4. Payment Method Filter
      if (selectedPaymentMethod !== 'all') {
        const pm = (r.paymentMethod || '').toLowerCase();
        if (selectedPaymentMethod === 'wallet' && !pm.includes('wallet')) return false;
        if (selectedPaymentMethod === 'upi' && !pm.includes('upi') && !pm.includes('qr')) return false;
      }

      // 5. Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          r.ticketNumber.toLowerCase().includes(q) ||
          r.applicantName.toLowerCase().includes(q) ||
          r.mobile.includes(q) ||
          r.serviceName.toLowerCase().includes(q) ||
          (r.ackNumber && r.ackNumber.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [
    records,
    datePreset,
    customStartDate,
    customEndDate,
    selectedCategory,
    selectedStatus,
    selectedPaymentMethod,
    searchTerm,
  ]);

  // Aggregate Key Performance Indicators (KPIs)
  const stats = useMemo(() => {
    let totalEarnings = 0;
    let pendingEarnings = 0;
    let completedCount = 0;
    let inProcessCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    const departmentStats: Record<
      string,
      { count: number; earnings: number; completed: number; inProcess: number; pending: number }
    > = {
      Aadhaar: { count: 0, earnings: 0, completed: 0, inProcess: 0, pending: 0 },
      PAN: { count: 0, earnings: 0, completed: 0, inProcess: 0, pending: 0 },
      Voter: { count: 0, earnings: 0, completed: 0, inProcess: 0, pending: 0 },
      Ration: { count: 0, earnings: 0, completed: 0, inProcess: 0, pending: 0 },
      Driving: { count: 0, earnings: 0, completed: 0, inProcess: 0, pending: 0 },
      Vehicle: { count: 0, earnings: 0, completed: 0, inProcess: 0, pending: 0 },
    };

    const servicePopularity: Record<string, { count: number; earnings: number }> = {};

    filteredRecords.forEach((r) => {
      const isCompleted = r.status === 'Completed';
      const isInProcess = r.status === 'In Process';
      const isPending =
        r.status === 'Under Review' ||
        r.status === 'Pending' ||
        r.status === 'Pending Verification' ||
        r.rawStatus?.toLowerCase().includes('pending') ||
        r.rawStatus?.toLowerCase().includes('review');
      const isRejected = r.status === 'Rejected';

      // An application fee is realized/earned if paid via Wallet, approved, or active in process
      const isPaid =
        r.paymentMethod?.toLowerCase().includes('wallet') ||
        isCompleted ||
        isInProcess ||
        r.rawStatus === 'Verified & Approved' ||
        (!r.rawStatus?.toLowerCase().includes('pending verification') && isPending);

      if (isCompleted) {
        completedCount++;
        totalEarnings += r.fee;
      } else if (isInProcess) {
        inProcessCount++;
        totalEarnings += r.fee;
      } else if (isPending) {
        pendingCount++;
        if (isPaid) {
          totalEarnings += r.fee;
        } else {
          pendingEarnings += r.fee;
        }
      } else if (isRejected) {
        rejectedCount++;
      }

      // Department breakdown
      if (departmentStats[r.category]) {
        departmentStats[r.category].count++;
        if (isCompleted || isInProcess || (isPending && isPaid)) {
          departmentStats[r.category].earnings += r.fee;
        }
        if (isCompleted) departmentStats[r.category].completed++;
        if (isInProcess) departmentStats[r.category].inProcess++;
        if (isPending) departmentStats[r.category].pending++;
      }

      // Service popularity
      if (!servicePopularity[r.serviceName]) {
        servicePopularity[r.serviceName] = { count: 0, earnings: 0 };
      }
      servicePopularity[r.serviceName].count++;
      if (isCompleted || isInProcess || (isPending && isPaid)) {
        servicePopularity[r.serviceName].earnings += r.fee;
      }
    });

    const totalServices = filteredRecords.length;
    const completionRate = totalServices > 0 ? ((completedCount / totalServices) * 100).toFixed(1) : '0';
    const paidServicesCount = completedCount + inProcessCount + (totalEarnings > 0 ? pendingCount : 0);
    const avgRevenue = paidServicesCount > 0 ? (totalEarnings / paidServicesCount).toFixed(2) : '0';

    // Top 5 services ranked by revenue
    const topServices = Object.entries(servicePopularity)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    return {
      totalEarnings,
      pendingEarnings,
      totalServices,
      completedCount,
      inProcessCount,
      pendingCount,
      rejectedCount,
      completionRate,
      avgRevenue,
      departmentStats,
      topServices,
    };
  }, [filteredRecords]);

  // Export Filtered View to CSV
  const handleExportCSV = () => {
    const headers = [
      'Ticket Number',
      'Service Name',
      'Category',
      'Applicant Name',
      'Mobile',
      'Fee (INR)',
      'Status',
      'Payment Method',
      'Date & Time',
      'Ack Number',
      'Official Remarks',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.ticketNumber}"`,
      `"${r.serviceName.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.applicantName.replace(/"/g, '""')}"`,
      `"${r.mobile}"`,
      r.fee,
      `"${r.status}"`,
      `"${r.paymentMethod}"`,
      `"${new Date(r.timestamp).toLocaleString()}"`,
      `"${r.ackNumber || ''}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `esevai_admin_earnings_${datePreset}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginated records for Ledger table
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;

  const departmentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Aadhaar: Fingerprint,
    PAN: CreditCard,
    Voter: Vote,
    Ration: Store,
    Driving: ShieldCheck,
    Vehicle: Car,
  };

  const departmentQueueMap: Record<string, AdminQueue> = {
    Aadhaar: 'aadhaar',
    PAN: 'pan',
    Voter: 'voter',
    Ration: 'ration',
    Driving: 'driving',
    Vehicle: 'vehicle',
  };

  return (
    <div
      className="space-y-6 pb-16 max-w-[1600px] mx-auto animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* ─────────────────────────────────────────────────────────────────
          EXECUTIVE HERO HEADER & CONTROLS
         ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Central Revenue & Operations Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            <span>Executive Dashboard</span>
            <span className="text-slate-400 font-medium text-lg hidden sm:inline">|</span>
            <span className="text-emerald-700 text-lg sm:text-2xl font-black">
              Total Earnings & Services
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time financial reconciliation, service volumes, and departmental performance with custom filters.
          </p>
        </div>

        {/* Action Buttons: Live Refresh & CSV Export */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {records.length === 0 && (
            <button
              type="button"
              onClick={handleSeedDemoEnrollments}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Load Sample Records</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isRefreshing || isLoading ? 'Syncing Data...' : 'Refresh Records'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-700/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          FILTER TOOLBAR (Date Range, Category, Status, Payment, Search)
         ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Filter Options
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setDatePreset('all');
              setCustomStartDate('');
              setCustomEndDate('');
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSelectedPaymentMethod('all');
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="text-xs font-bold text-slate-500 hover:text-emerald-700 cursor-pointer underline underline-offset-2"
          >
            Reset All Filters
          </button>
        </div>

        {/* Date Filter Presets Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 touch-pan-x">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Timeline:
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'custom', label: 'Custom Range' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setDatePreset(item.id as DateFilterPreset);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                datePreset === item.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Picker (shown when 'custom' selected) */}
        {datePreset === 'custom' && (
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-emerald-900">Select Date Window:</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium outline-none focus:border-emerald-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        )}

        {/* Dropdowns & Search Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* 1. Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Department / Queue
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">All Departments (6 Queues)</option>
              <option value="Aadhaar">Aadhaar Corrections</option>
              <option value="PAN">PAN Card (NSDL / UTIITSL)</option>
              <option value="Voter">Voter Services (ECI)</option>
              <option value="Ration">Ration Card (TNePDS)</option>
              <option value="Driving">Driving License (Sarathi)</option>
              <option value="Vehicle">Vehicle Services (Vahan)</option>
            </select>
          </div>

          {/* 2. Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Application Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed / Approved</option>
              <option value="In Process">In Process / Scheduled</option>
              <option value="Pending Verification">Pending / Under Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* 3. Payment Method Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Payment Source
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => {
                setSelectedPaymentMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">All Payment Sources</option>
              <option value="wallet">Wallet Balance Deduction</option>
              <option value="upi">Direct UPI / Cashfree</option>
            </select>
          </div>

          {/* 4. Live Search Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Search Records
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search ticket, name, mobile..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TOP FINANCIAL & SERVICE KPI METRICS
         ───────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Realized Earnings */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-sm bg-gradient-to-br from-white via-white to-emerald-50/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Realized Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono mt-2">
            ₹{stats.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-emerald-700 font-bold">
              {stats.completedCount + stats.inProcessCount} paid services
            </span>
            <span>•</span>
            <span>Avg ₹{stats.avgRevenue}/app</span>
          </div>
        </div>

        {/* Metric 2: Total Service Applications */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Services Applied</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
            {stats.totalServices}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-2">
            <span className="text-emerald-700 font-bold">{stats.completedCount} Completed</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">{stats.inProcessCount} In Process</span>
          </div>
        </div>

        {/* Metric 3: Department Completion Rate */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Completion & Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 font-mono mt-2">
            {stats.completionRate}%
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, Number(stats.completionRate)))}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            {stats.rejectedCount} rejected / returned applications
          </div>
        </div>

        {/* Metric 4: Cashfree Circulating Balance & Inflow */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 bg-gradient-to-br from-white via-white to-amber-50/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Wallet Inflow & Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Wallet className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono mt-2">
            ₹{walletOverview.circulatingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-1">
            ₹{walletOverview.totalTopups.toLocaleString('en-IN')} Cashfree top-ups ({walletOverview.topupCount})
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          DEPARTMENTAL REVENUE & VOLUME BREAKDOWN CARDS
         ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Department Performance Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Click any department card to jump directly into its queue
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(stats.departmentStats).map(([deptName, deptData]) => {
            const Icon = departmentIcons[deptName] || FileText;
            const qId = departmentQueueMap[deptName];

            return (
              <div
                key={deptName}
                onClick={() => qId && onNavigateQueue(qId)}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 flex items-center justify-center transition-colors">
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900 leading-tight">
                          {deptName}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {deptData.count} Total Tickets
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Total Realized Revenue
                    </div>
                    <div className="text-lg font-black text-emerald-800 font-mono mt-0.5">
                      ₹{deptData.earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-500 border-t border-slate-50">
                  <span className="text-emerald-700">{deptData.completed} Done</span>
                  <span className="text-blue-700">{deptData.inProcess} In Queue</span>
                  <span className="text-amber-700">{deptData.pending} Pending</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          DETAILED SERVICE APPLICATIONS & REVENUE LEDGER TABLE
         ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        {/* Ledger Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Service Application & Revenue Ledger
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Showing {filteredRecords.length} filtered records. Real-time timestamps and customer fee details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg font-bold text-slate-700 bg-slate-50 outline-none"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Desktop & Tablet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/90 text-xs font-black text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Ticket / Token #</th>
                <th className="py-3 px-4">Service & Department</th>
                <th className="py-3 px-4">Applicant & Contact</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Service Fee</th>
                <th className="py-3 px-4">Payment Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    <div className="max-w-md mx-auto space-y-3">
                      <p className="text-sm font-bold text-slate-700">
                        {records.length === 0
                          ? 'No past enrollments detected yet.'
                          : 'No service applications match the selected filter criteria.'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {records.length === 0
                          ? 'All newly submitted applications from citizen services appear here automatically in real time.'
                          : 'Try switching the date filter to "All Time" or resetting filters.'}
                      </p>
                      {records.length === 0 && (
                        <button
                          type="button"
                          onClick={handleSeedDemoEnrollments}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Load Sample Records</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const Icon = departmentIcons[r.category] || FileText;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ticket Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap text-xs sm:text-sm">
                        {r.ticketNumber}
                      </td>

                      {/* Service & Category */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-800 text-xs leading-tight">
                          {r.serviceName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {r.category}
                          </span>
                          {r.ackNumber && (
                            <span className="text-[10px] font-mono text-emerald-800 font-bold">
                              Ack: {r.ackNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Applicant & Mobile */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-xs">{r.applicantName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">+91 {r.mobile}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap text-xs">
                        {new Date(r.timestamp).toLocaleDateString()}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-slate-900 text-sm font-mono">
                          ₹{r.fee.toFixed(2)}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {r.paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            r.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : r.status === 'In Process'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : r.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Jump to Queue Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onNavigateQueue(r.queueId)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <div>
              Page {currentPage} of {totalPages} ({filteredRecords.length} total entries)
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
