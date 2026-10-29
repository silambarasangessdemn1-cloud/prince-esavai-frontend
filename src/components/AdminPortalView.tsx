import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { aadhaarApi, AadhaarIssue, Pagination, StatsResponse } from '../services/aadhaarApi';
import { panApi, PanRequest, PanStatsResponse } from '../services/panApi';
import { voterApi, VoterRequest, VoterStatsResponse } from '../services/voterApi';
import { rationApi, RationRequest, RationStatsResponse } from '../services/rationApi';
import { drivingApi, DrivingRequest, DrivingStatsResponse } from '../services/drivingApi';
import { vehicleApi, VehicleRequest, VehicleStatsResponse } from '../services/vehicleApi';
import { farmerApi, FarmerRequest, FarmerStatsResponse } from '../services/farmerApi';
import { paymentApi } from '../services/paymentApi';
import { AdminApplicationDetailsPage } from './AdminApplicationDetailsPage';
import { AdminPricingView } from './AdminPricingView';
import { AdminPaymentsView } from './AdminPaymentsView';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  User,
  Phone,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Trash2,
  ExternalLink,
  ChevronDown,
  Eye,
  SlidersHorizontal,
  Send,
  MessageSquare,
  Sparkles,
  CreditCard,
  Vote,
  Store,
  Car,
  Sprout,
  Calendar,
  Mail,
  MapPin,
  Copy,
  Check,
  Printer,
  Download,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; badge: string; bg: string }> = {
  'Submitted':    { label: 'Submitted', badge: 'bg-sky-50 text-sky-800 border-sky-200', bg: 'bg-sky-500' },
  'Under Review': { label: 'Under Review', badge: 'bg-purple-50 text-purple-800 border-purple-200', bg: 'bg-purple-500' },
  'In Progress':  { label: 'In Progress', badge: 'bg-amber-50 text-amber-800 border-amber-200', bg: 'bg-amber-500' },
  'Pending Docs': { label: 'Pending Docs', badge: 'bg-orange-50 text-orange-800 border-orange-200', bg: 'bg-orange-500' },
  'Resolved':     { label: 'Resolved', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold', bg: 'bg-emerald-500' },
  'Rejected':     { label: 'Rejected', badge: 'bg-rose-50 text-rose-800 border-rose-200', bg: 'bg-rose-500' },
  'Closed':       { label: 'Closed', badge: 'bg-slate-100 text-slate-600 border-slate-200', bg: 'bg-slate-500' },
};

const PRIORITY_BADGES: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  High: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200 font-black animate-pulse',
};

import { AdminQueue, AdminQuickTab, AdminQueueCounts } from './AdminSidebar';

export interface AdminPortalViewProps {
  activeQueue?: AdminQueue;
  setActiveQueue?: (queue: AdminQueue) => void;
  quickTab?: AdminQuickTab;
  setQuickTab?: (tab: AdminQuickTab) => void;
  onCountsUpdate?: (counts: AdminQueueCounts) => void;
  refreshKey?: number;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  activeQueue: propActiveQueue,
  setActiveQueue: propSetActiveQueue,
  quickTab: propQuickTab,
  setQuickTab: propSetQuickTab,
  onCountsUpdate,
  refreshKey,
}) => {
  const { setActiveTab } = useApp();

  // Active Queue Switcher ('aadhaar' vs 'pan' vs 'voter' vs 'ration' vs 'driving' vs 'vehicle')
  const [internalActiveQueue, setInternalActiveQueue] = useState<AdminQueue>('aadhaar');
  const activeQueue = propActiveQueue !== undefined ? propActiveQueue : internalActiveQueue;
  const setActiveQueue = propSetActiveQueue || setInternalActiveQueue;

  // Quick Status tab ('all' vs 'pending' vs 'in_progress' vs 'resolved')
  const [internalQuickTab, setInternalQuickTab] = useState<AdminQuickTab>('all');
  const quickTab = propQuickTab !== undefined ? propQuickTab : internalQuickTab;
  const setQuickTab = propSetQuickTab || setInternalQuickTab;

  // Aadhaar Queue State
  const [issues, setIssues] = useState<AadhaarIssue[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // PAN Queue State
  const [panRequests, setPanRequests] = useState<PanRequest[]>([]);
  const [panStats, setPanStats] = useState<PanStatsResponse | null>(null);
  const [panPagination, setPanPagination] = useState<Pagination | null>(null);

  // Voter Queue State
  const [voterRequests, setVoterRequests] = useState<VoterRequest[]>([]);
  const [voterStats, setVoterStats] = useState<VoterStatsResponse | null>(null);
  const [voterPagination, setVoterPagination] = useState<Pagination | null>(null);

  // Ration Queue State
  const [rationRequests, setRationRequests] = useState<RationRequest[]>([]);
  const [rationStats, setRationStats] = useState<RationStatsResponse | null>(null);
  const [rationPagination, setRationPagination] = useState<Pagination | null>(null);

  // Driving Queue State
  const [drivingRequests, setDrivingRequests] = useState<DrivingRequest[]>([]);
  const [drivingStats, setDrivingStats] = useState<DrivingStatsResponse | null>(null);
  const [drivingPagination, setDrivingPagination] = useState<Pagination | null>(null);

  // Vehicle Queue State
  const [vehicleRequests, setVehicleRequests] = useState<VehicleRequest[]>([]);
  const [vehicleStats, setVehicleStats] = useState<VehicleStatsResponse | null>(null);
  const [vehiclePagination, setVehiclePagination] = useState<Pagination | null>(null);

  // Farmer Queue State
  const [farmerRequests, setFarmerRequests] = useState<FarmerRequest[]>([]);
  const [farmerStats, setFarmerStats] = useState<FarmerStatsResponse | null>(null);
  const [farmerPagination, setFarmerPagination] = useState<Pagination | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);

  // Selected Aadhaar Ticket for Modal
  const [activeTicket, setActiveTicket] = useState<AadhaarIssue | null>(null);
  const [adminStatus, setAdminStatus] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');

  // Selected PAN Request for Modal
  const [activePanTicket, setActivePanTicket] = useState<PanRequest | null>(null);
  const [adminPanStatus, setAdminPanStatus] = useState('');
  const [adminPanRemarks, setAdminPanRemarks] = useState('');
  const [adminPanAck, setAdminPanAck] = useState('');

  // Selected Voter Request for Modal
  const [activeVoterTicket, setActiveVoterTicket] = useState<VoterRequest | null>(null);
  const [adminVoterStatus, setAdminVoterStatus] = useState('');
  const [adminVoterRemarks, setAdminVoterRemarks] = useState('');
  const [adminVoterEciRef, setAdminVoterEciRef] = useState('');

  // Selected Ration Request for Modal
  const [activeRationTicket, setActiveRationTicket] = useState<RationRequest | null>(null);
  const [adminRationStatus, setAdminRationStatus] = useState('');
  const [adminRationRemarks, setAdminRationRemarks] = useState('');
  const [adminRationAck, setAdminRationAck] = useState('');

  // Selected Driving Request for Modal
  const [activeDrivingTicket, setActiveDrivingTicket] = useState<DrivingRequest | null>(null);
  const [adminDrivingStatus, setAdminDrivingStatus] = useState('');
  const [adminDrivingRemarks, setAdminDrivingRemarks] = useState('');
  const [adminDrivingAck, setAdminDrivingAck] = useState('');
  const [adminDrivingSlot, setAdminDrivingSlot] = useState('');

  // Selected Vehicle Request for Modal
  const [activeVehicleTicket, setActiveVehicleTicket] = useState<VehicleRequest | null>(null);
  const [adminVehicleStatus, setAdminVehicleStatus] = useState('');
  const [adminVehicleRemarks, setAdminVehicleRemarks] = useState('');
  const [adminVehicleAck, setAdminVehicleAck] = useState('');
  const [adminVehicleSlot, setAdminVehicleSlot] = useState('');
  const [adminVehicleChallanRef, setAdminVehicleChallanRef] = useState('');

  // Selected Farmer Request for Modal
  const [activeFarmerTicket, setActiveFarmerTicket] = useState<FarmerRequest | null>(null);
  const [adminFarmerStatus, setAdminFarmerStatus] = useState('');
  const [adminFarmerRemarks, setAdminFarmerRemarks] = useState('');
  const [adminFarmerAck, setAdminFarmerAck] = useState('');
  const [adminFarmerInspectionDate, setAdminFarmerInspectionDate] = useState('');

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // Dedicated Full Page Application Details State
  const [selectedRecord, setSelectedRecord] = useState<{
    type: AdminQueue;
    ticket: any;
  } | null>(null);

  // Clear selected detail view when switching queues
  useEffect(() => {
    setSelectedRecord(null);
  }, [activeQueue]);

  const handleViewFullDetails = (
    ticket: any,
    type: AdminQueue
  ) => {
    setSelectedRecord({ type, ticket });
  };

  // Load Requests based on active queue
  const loadRequests = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    let effectiveStatus = statusFilter;
    if (quickTab === 'pending') effectiveStatus = 'Submitted';
    else if (quickTab === 'in_progress') effectiveStatus = 'In Progress';
    else if (quickTab === 'resolved') effectiveStatus = 'Resolved';

    if (activeQueue === 'aadhaar') {
      const [issuesRes, statsRes] = await Promise.all([
        aadhaarApi.listIssues({
          page,
          limit: 15,
          search: search.trim() || undefined,
          status: effectiveStatus || undefined,
          priority: priorityFilter || undefined,
          scope: 'all',
        }),
        aadhaarApi.getStats({ scope: 'all' }),
      ]);

      if (issuesRes.success && issuesRes.data) {
        setIssues(issuesRes.data.issues);
        setPagination(issuesRes.data.pagination);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } else if (activeQueue === 'pan') {
      const [panRes, panStatsRes] = await Promise.all([
        panApi.listRequests({
          page,
          limit: 15,
          search: search.trim() || undefined,
          status: effectiveStatus || undefined,
          priority: priorityFilter || undefined,
          scope: 'all',
        }),
        panApi.getStats({ scope: 'all' }),
      ]);

      if (panRes.success && panRes.data) {
        setPanRequests(panRes.data.requests);
        setPanPagination(panRes.data.pagination);
      }
      if (panStatsRes.success && panStatsRes.data) {
        setPanStats(panStatsRes.data);
      }
    } else if (activeQueue === 'voter') {
      const [voterRes, voterStatsRes] = await Promise.all([
        voterApi.listRequests({
          page,
          limit: 15,
          search: search.trim() || undefined,
          status: effectiveStatus || undefined,
          priority: priorityFilter || undefined,
          scope: 'all',
        }),
        voterApi.getStats({ scope: 'all' }),
      ]);

      if (voterRes.success && voterRes.data) {
        setVoterRequests(voterRes.data.requests);
        setVoterPagination(voterRes.data.pagination);
      }
      if (voterStatsRes.success && voterStatsRes.data) {
        setVoterStats(voterStatsRes.data);
      }
    } else if (activeQueue === 'ration') {
      const [rationRes, rationStatsRes] = await Promise.all([
        rationApi.listRequests({
          page,
          limit: 15,
          search: search.trim() || undefined,
          status: effectiveStatus || undefined,
          scope: 'all',
        }),
        rationApi.getStats({ scope: 'all' }),
      ]);

      if (rationRes.success && Array.isArray(rationRes.data)) {
        setRationRequests(rationRes.data);
        if ((rationRes as any).meta) {
          setRationPagination((rationRes as any).meta);
        }
      }
      if (rationStatsRes.success && rationStatsRes.data) {
        setRationStats(rationStatsRes.data);
      }
    } else if (activeQueue === 'driving') {
      const [drvRes, drvStatsRes] = await Promise.all([
        drivingApi.listRequests({
          page,
          limit: 15,
          search: search.trim() || undefined,
          status: effectiveStatus || undefined,
          scope: 'all',
        }),
        drivingApi.getStats({ scope: 'all' }),
      ]);

      if (drvRes.success && Array.isArray(drvRes.data)) {
        setDrivingRequests(drvRes.data);
        if ((drvRes as any).meta) {
          setDrivingPagination((drvRes as any).meta);
        }
      }
      if (drvStatsRes.success && drvStatsRes.data) {
        setDrivingStats(drvStatsRes.data);
      }
    } else if (activeQueue === 'vehicle') {
      const [vehRes, vehStatsRes] = await Promise.all([
        vehicleApi.listRequests({
          page,
          limit: 15,
          search: search.trim() || undefined,
          status: effectiveStatus || undefined,
          scope: 'all',
        }),
        vehicleApi.getStats({ scope: 'all' }),
      ]);

      if (vehRes.success && Array.isArray(vehRes.data)) {
        setVehicleRequests(vehRes.data);
        if ((vehRes as any).meta) {
          setVehiclePagination((vehRes as any).meta);
        }
      }
      if (vehStatsRes.success && vehStatsRes.data) {
        setVehicleStats(vehStatsRes.data);
      }
    } else {
      const [farmRes, farmStatsRes] = await Promise.all([
        farmerApi.listRequests({
          page,
          limit: 15,
          search: search.trim() || undefined,
          status: effectiveStatus || undefined,
          scope: 'all',
        }),
        farmerApi.getStats('all'),
      ]);

      if (farmRes.success && Array.isArray(farmRes.data)) {
        setFarmerRequests(farmRes.data);
        if (farmRes.meta) {
          setFarmerPagination(farmRes.meta);
        }
      }
      if (farmStatsRes.success && farmStatsRes.data) {
        setFarmerStats(farmStatsRes.data);
      }
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, [activeQueue, page, search, statusFilter, priorityFilter, quickTab]);

  // Load all queue totals to keep sidebar badges 100% synchronized
  const loadAllQueueCounts = useCallback(async () => {
    try {
      const [aStats, pStats, vStats, rStats, dStats, vehStats, farmStats, payData] = await Promise.all([
        aadhaarApi.getStats({ scope: 'all' }),
        panApi.getStats({ scope: 'all' }),
        voterApi.getStats({ scope: 'all' }),
        rationApi.getStats({ scope: 'all' }),
        drivingApi.getStats({ scope: 'all' }),
        vehicleApi.getStats({ scope: 'all' }),
        farmerApi.getStats('all'),
        paymentApi.getAllPayments(),
      ]);

      const counts: AdminQueueCounts = {
        aadhaar: aStats.success && aStats.data ? aStats.data.total : 0,
        pan: pStats.success && pStats.data ? pStats.data.total : 0,
        voter: vStats.success && vStats.data ? vStats.data.total : 0,
        ration: rStats.success && rStats.data ? rStats.data.total : 0,
        driving: dStats.success && dStats.data ? dStats.data.total : 0,
        vehicle: vehStats.success && vehStats.data ? vehStats.data.total : 0,
        farmer: farmStats.success && farmStats.data ? farmStats.data.total : 0,
        payments: payData?.stats?.pending || 0,
        pricing: 44,
        total: 0,
      };
      counts.total =
        counts.aadhaar +
        counts.pan +
        counts.voter +
        counts.ration +
        counts.driving +
        counts.vehicle +
        counts.farmer;

      if (onCountsUpdate) {
        onCountsUpdate(counts);
      }
    } catch {
      // ignore
    }
  }, [onCountsUpdate]);

  useEffect(() => {
    setPage(1);
  }, [activeQueue, quickTab]);

  useEffect(() => {
    loadRequests();
    loadAllQueueCounts();
  }, [loadRequests, loadAllQueueCounts, refreshKey]);

  // Open Aadhaar Ticket Modal
  const openActionModal = (issue: AadhaarIssue) => {
    setActiveTicket(issue);
    setActivePanTicket(null);
    setActiveVoterTicket(null);
    setAdminStatus(issue.status);
    setAdminRemarks(issue.resolutionRemarks || '');
    setActionSuccessMsg('');
    setActionErrorMsg('');
  };

  // Open PAN Ticket Modal
  const openPanActionModal = (req: PanRequest) => {
    setActivePanTicket(req);
    setActiveTicket(null);
    setActiveVoterTicket(null);
    setAdminPanStatus(req.status);
    setAdminPanRemarks(req.resolutionRemarks || '');
    setAdminPanAck(req.nsdlUtiiAckNumber || '');
    setActionSuccessMsg('');
    setActionErrorMsg('');
  };

  // Open Voter Ticket Modal
  const openVoterActionModal = (req: VoterRequest) => {
    setActiveVoterTicket(req);
    setActiveTicket(null);
    setActivePanTicket(null);
    setActiveRationTicket(null);
    setAdminVoterStatus(req.status);
    setAdminVoterRemarks(req.resolutionRemarks || '');
    setAdminVoterEciRef(req.eciReferenceNumber || '');
    setActionSuccessMsg('');
    setActionErrorMsg('');
  };

  // Open Ration Ticket Modal
  const openRationActionModal = (req: RationRequest) => {
    setActiveRationTicket(req);
    setActiveTicket(null);
    setActivePanTicket(null);
    setActiveVoterTicket(null);
    setActiveDrivingTicket(null);
    setAdminRationStatus(req.status);
    setAdminRationRemarks(req.resolutionRemarks || '');
    setAdminRationAck(req.tnpdsAckNumber || '');
    setActionSuccessMsg('');
    setActionErrorMsg('');
  };

  // Open Driving Ticket Modal
  const openDrivingActionModal = (req: DrivingRequest) => {
    setActiveDrivingTicket(req);
    setActiveTicket(null);
    setActivePanTicket(null);
    setActiveVoterTicket(null);
    setActiveRationTicket(null);
    setActiveVehicleTicket(null);
    setAdminDrivingStatus(req.status);
    setAdminDrivingRemarks(req.resolutionRemarks || '');
    setAdminDrivingAck(req.sarathiAckNumber || '');
    setAdminDrivingSlot(req.rtoSlotDate ? new Date(req.rtoSlotDate).toISOString().substring(0, 10) : '');
    setActionSuccessMsg('');
    setActionErrorMsg('');
  };

  // Open Vehicle Ticket Modal
  const openVehicleActionModal = (req: VehicleRequest) => {
    setActiveVehicleTicket(req);
    setActiveTicket(null);
    setActivePanTicket(null);
    setActiveVoterTicket(null);
    setActiveRationTicket(null);
    setActiveDrivingTicket(null);
    setActiveFarmerTicket(null);
    setAdminVehicleStatus(req.status);
    setAdminVehicleRemarks(req.resolutionRemarks || '');
    setAdminVehicleAck(req.vahanAckNumber || '');
    setAdminVehicleSlot(req.rtoSlotDate ? new Date(req.rtoSlotDate).toISOString().substring(0, 10) : '');
    setAdminVehicleChallanRef(req.challanSettlementRef || '');
    setActionSuccessMsg('');
    setActionErrorMsg('');
  };

  // Open Farmer Ticket Modal
  const openFarmerActionModal = (req: FarmerRequest) => {
    setActiveFarmerTicket(req);
    setActiveTicket(null);
    setActivePanTicket(null);
    setActiveVoterTicket(null);
    setActiveRationTicket(null);
    setActiveDrivingTicket(null);
    setActiveVehicleTicket(null);
    setAdminFarmerStatus(req.status);
    setAdminFarmerRemarks(req.resolutionRemarks || '');
    setAdminFarmerAck(req.officialAckNumber || '');
    setAdminFarmerInspectionDate(req.fieldInspectionDate ? new Date(req.fieldInspectionDate).toISOString().substring(0, 10) : '');
    setActionSuccessMsg('');
    setActionErrorMsg('');
  };

  // Submit Aadhaar Status Update
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;

    setIsUpdatingStatus(true);
    setActionSuccessMsg('');
    setActionErrorMsg('');

    const res = await aadhaarApi.updateStatus(activeTicket._id, adminStatus, adminRemarks);
    setIsUpdatingStatus(false);

    if (res.success && res.data) {
      setActionSuccessMsg(`Status successfully updated to "${adminStatus}"!`);
      setActiveTicket(res.data.issue);
      loadRequests(true);
    } else {
      setActionErrorMsg(res.message || 'Failed to update status.');
    }
  };

  // Submit PAN Status Update
  const handlePanStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePanTicket) return;

    setIsUpdatingStatus(true);
    setActionSuccessMsg('');
    setActionErrorMsg('');

    const res = await panApi.updateStatus(
      activePanTicket._id,
      adminPanStatus,
      adminPanRemarks,
      adminPanAck
    );
    setIsUpdatingStatus(false);

    if (res.success && res.data) {
      setActionSuccessMsg(`PAN Application status updated to "${adminPanStatus}"!`);
      setActivePanTicket(res.data.request);
      loadRequests(true);
    } else {
      setActionErrorMsg(res.message || 'Failed to update PAN status.');
    }
  };

  // Submit Voter Status Update
  const handleVoterStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVoterTicket) return;

    setIsUpdatingStatus(true);
    setActionSuccessMsg('');
    setActionErrorMsg('');

    const res = await voterApi.updateStatus(
      activeVoterTicket._id,
      adminVoterStatus,
      adminVoterRemarks,
      adminVoterEciRef
    );
    setIsUpdatingStatus(false);

    if (res.success && res.data) {
      setActionSuccessMsg(`Voter Application status updated to "${adminVoterStatus}"!`);
      setActiveVoterTicket(res.data.request);
      loadRequests(true);
    } else {
      setActionErrorMsg(res.message || 'Failed to update Voter application status.');
    }
  };

  // Submit Ration Status Update
  const handleRationStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRationTicket) return;

    setIsUpdatingStatus(true);
    setActionSuccessMsg('');
    setActionErrorMsg('');

    const res = await rationApi.updateStatus(activeRationTicket._id, {
      status: adminRationStatus,
      resolutionRemarks: adminRationRemarks,
      tnpdsAckNumber: adminRationAck,
    });
    setIsUpdatingStatus(false);

    if (res.success && res.data) {
      setActionSuccessMsg(`Ration Application status updated to "${adminRationStatus}"!`);
      setActiveRationTicket(res.data);
      loadRequests(true);
    } else {
      setActionErrorMsg(res.message || 'Failed to update Ration application status.');
    }
  };

  // Submit Driving Status Update
  const handleDrivingStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDrivingTicket) return;

    setIsUpdatingStatus(true);
    setActionSuccessMsg('');
    setActionErrorMsg('');

    const res = await drivingApi.updateStatus(activeDrivingTicket._id, {
      status: adminDrivingStatus,
      resolutionRemarks: adminDrivingRemarks,
      sarathiAckNumber: adminDrivingAck,
      rtoSlotDate: adminDrivingSlot || undefined,
    });
    setIsUpdatingStatus(false);

    if (res.success && res.data) {
      setActionSuccessMsg(`Driving License application status updated to "${adminDrivingStatus}"!`);
      setActiveDrivingTicket(res.data);
      loadRequests(true);
    } else {
      setActionErrorMsg(res.message || 'Failed to update Driving License application status.');
    }
  };

  // Submit Vehicle Status Update
  const handleVehicleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicleTicket) return;

    setIsUpdatingStatus(true);
    setActionSuccessMsg('');
    setActionErrorMsg('');

    const res = await vehicleApi.updateStatus(activeVehicleTicket._id, {
      status: adminVehicleStatus,
      resolutionRemarks: adminVehicleRemarks,
      vahanAckNumber: adminVehicleAck,
      rtoSlotDate: adminVehicleSlot || undefined,
      challanSettlementRef: adminVehicleChallanRef || undefined,
    });
    setIsUpdatingStatus(false);

    if (res.success && res.data) {
      setActionSuccessMsg(`Vehicle / Vahan application status updated to "${adminVehicleStatus}"!`);
      setActiveVehicleTicket(res.data);
      loadRequests(true);
    } else {
      setActionErrorMsg(res.message || 'Failed to update Vehicle application status.');
    }
  };

  // Submit Farmer Status Update
  const handleFarmerStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarmerTicket) return;

    setIsUpdatingStatus(true);
    setActionSuccessMsg('');
    setActionErrorMsg('');

    const res = await farmerApi.updateStatus(activeFarmerTicket._id, {
      status: adminFarmerStatus,
      resolutionRemarks: adminFarmerRemarks,
      officialAckNumber: adminFarmerAck,
      fieldInspectionDate: adminFarmerInspectionDate || undefined,
    });
    setIsUpdatingStatus(false);

    if (res.success && res.data) {
      setActionSuccessMsg(`Farmer service application status updated to "${adminFarmerStatus}"!`);
      setActiveFarmerTicket(res.data);
      loadRequests(true);
    } else {
      setActionErrorMsg(res.message || 'Failed to update Farmer application status.');
    }
  };

  // Admin Delete Ticket
  const handleDeleteTicket = async (id: string, queueType: 'aadhaar' | 'pan' | 'voter' | 'ration' | 'driving' | 'vehicle' | 'farmer') => {
    if (!confirm('Are you sure you want to permanently delete this request ticket?')) return;
    let res;
    if (queueType === 'pan') res = await panApi.deleteRequest(id);
    else if (queueType === 'voter') res = await voterApi.deleteRequest(id);
    else if (queueType === 'ration') res = await rationApi.deleteRequest(id);
    else if (queueType === 'driving') res = await drivingApi.deleteRequest(id);
    else if (queueType === 'vehicle') res = await vehicleApi.deleteRequest(id);
    else if (queueType === 'farmer') res = await farmerApi.deleteRequest(id);
    else res = await aadhaarApi.deleteIssue(id);

    if (res.success) {
      if (activeTicket && activeTicket._id === id) setActiveTicket(null);
      if (activePanTicket && activePanTicket._id === id) setActivePanTicket(null);
      if (activeVoterTicket && activeVoterTicket._id === id) setActiveVoterTicket(null);
      if (activeRationTicket && activeRationTicket._id === id) setActiveRationTicket(null);
      if (activeDrivingTicket && activeDrivingTicket._id === id) setActiveDrivingTicket(null);
      if (activeVehicleTicket && activeVehicleTicket._id === id) setActiveVehicleTicket(null);
      if (activeFarmerTicket && activeFarmerTicket._id === id) setActiveFarmerTicket(null);
      loadRequests(true);
    } else {
      alert(res.message || 'Could not delete ticket.');
    }
  };

  const currentStats =
    activeQueue === 'aadhaar'
      ? stats
      : activeQueue === 'pan'
      ? panStats
      : activeQueue === 'voter'
      ? voterStats
      : activeQueue === 'ration'
      ? (rationStats as any)
      : activeQueue === 'driving'
      ? (drivingStats as any)
      : activeQueue === 'vehicle'
      ? (vehicleStats as any)
      : (farmerStats as any);

  const currentPagination =
    activeQueue === 'aadhaar'
      ? pagination
      : activeQueue === 'pan'
      ? panPagination
      : activeQueue === 'voter'
      ? voterPagination
      : activeQueue === 'ration'
      ? rationPagination
      : activeQueue === 'driving'
      ? drivingPagination
      : activeQueue === 'vehicle'
      ? vehiclePagination
      : farmerPagination;

  // Render Full Dedicated Application Details Page if a record is selected
  if (selectedRecord) {
    const allTicketsInQueue =
      selectedRecord.type === 'aadhaar'
        ? issues
        : selectedRecord.type === 'pan'
        ? panRequests
        : selectedRecord.type === 'voter'
        ? voterRequests
        : selectedRecord.type === 'ration'
        ? rationRequests
        : selectedRecord.type === 'driving'
        ? drivingRequests
        : selectedRecord.type === 'vehicle'
        ? vehicleRequests
        : farmerRequests;

    return (
      <AdminApplicationDetailsPage
        type={selectedRecord.type}
        ticket={selectedRecord.ticket}
        onBack={() => setSelectedRecord(null)}
        onRefreshQueue={() => loadRequests(true)}
        allTicketsInQueue={allTicketsInQueue}
        onSelectTicket={(newTicket) =>
          setSelectedRecord({ type: selectedRecord.type, ticket: newTicket })
        }
      />
    );
  }

  // Dedicated Service Pricing Portal View
  if (activeQueue === 'pricing') {
    return <AdminPricingView />;
  }

  // Dedicated Payment & UTR Verifications View
  if (activeQueue === 'payments') {
    return <AdminPaymentsView onRefreshCounts={loadAllQueueCounts} />;
  }

  return (
    <div
      className="space-y-6 pb-16 max-w-[1600px] mx-auto animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* ─────────────────────────────────────────────────────────────────
          ADMIN TOP STATS & CONTROL BAR
         ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center p-2.5 shadow-md shrink-0">
              {activeQueue === 'aadhaar' && <Fingerprint className="w-7 h-7" />}
              {activeQueue === 'pan' && <CreditCard className="w-7 h-7" />}
              {activeQueue === 'voter' && <Vote className="w-7 h-7" />}
              {activeQueue === 'ration' && <Store className="w-7 h-7" />}
              {activeQueue === 'driving' && <ShieldCheck className="w-7 h-7" />}
              {activeQueue === 'vehicle' && <Car className="w-7 h-7" />}
              {activeQueue === 'farmer' && <Sprout className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {activeQueue === 'aadhaar' && 'Aadhaar Corrections Queue'}
                  {activeQueue === 'pan' && 'PAN Card Services Queue'}
                  {activeQueue === 'voter' && 'Voter ID Services Queue'}
                  {activeQueue === 'ration' && 'Ration Card (TNePDS) Queue'}
                  {activeQueue === 'driving' && 'Driving License (Sarathi) Queue'}
                  {activeQueue === 'vehicle' && 'Vehicle Services (Vahan) Queue'}
                  {activeQueue === 'farmer' && 'Farmer Services (Uzhavan) Queue'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-bold mt-0.5">
                Review, process and update incoming citizen {activeQueue.toUpperCase()} applications with official department status and acknowledgements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => loadRequests(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Metric Cards */}
        {currentStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total {activeQueue === 'aadhaar' ? 'Aadhaar' : activeQueue === 'pan' ? 'PAN' : activeQueue === 'voter' ? 'Voter' : activeQueue === 'ration' ? 'Ration' : activeQueue === 'driving' ? 'Driving' : 'Vehicle'} Requests
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{currentStats.total}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">New Submitted</span>
                <div className="text-2xl sm:text-3xl font-black text-sky-900 mt-0.5">{currentStats.byStatus['Submitted'] || 0}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">In Processing</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-0.5">
                  {(currentStats.byStatus['Under Review'] || 0) + (currentStats.byStatus['In Progress'] || 0)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Resolved Today</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-0.5">
                  {(currentStats.byStatus['Resolved'] || 0) + (currentStats.byStatus['Closed'] || 0)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold">
            <button
              onClick={() => { setQuickTab('all'); setPage(1); }}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                quickTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => { setQuickTab('pending'); setPage(1); }}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                quickTab === 'pending'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
              }`}
            >
              New Submitted
            </button>
            <button
              onClick={() => { setQuickTab('in_progress'); setPage(1); }}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                quickTab === 'in_progress'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => { setQuickTab('resolved'); setPage(1); }}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                quickTab === 'resolved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              Resolved
            </button>
          </div>

          {/* Search Bar & Dropdowns */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={`Search by applicant, phone, or ticket ID...`}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setQuickTab('all'); setPage(1); }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-700 outline-none"
            >
              <option value="">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          QUEUE TABLE DISPLAY (AADHAAR, PAN, OR VOTER)
         ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-sm font-semibold">Loading requests feed...</p>
          </div>
        ) : activeQueue === 'aadhaar' ? (
          /* AADHAAR TABLE */
          issues.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-800">No Aadhaar Requests Found</h3>
              <p className="text-xs text-slate-500">Incoming citizen requests will automatically list here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Aadhaar</th>
                    <th className="py-3 px-4">Service / Issue</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {issues.map((issue) => {
                    const statusInfo = STATUS_CONFIG[issue.status] || { badge: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={issue._id} className="hover:bg-slate-50/80 transition-colors">
                        <td
                          onClick={() => handleViewFullDetails(issue, 'aadhaar')}
                          className="py-3 px-4 font-mono font-bold text-emerald-800 hover:text-emerald-600 hover:underline cursor-pointer"
                          title="Click to view full application details"
                        >
                          {issue.ticketNumber}
                        </td>
                        <td
                          onClick={() => handleViewFullDetails(issue, 'aadhaar')}
                          className="py-3 px-4 cursor-pointer group hover:bg-emerald-50/70 transition-colors rounded-lg"
                          title="Click to view full citizen details"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                            <span>{issue.applicantName}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono group-hover:text-emerald-600/70">{issue.applicantPhone}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 font-semibold">{issue.maskedAadhaar}</td>
                        <td className="py-3 px-4"><span className="font-bold text-slate-800">{issue.issueType}</span></td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border ${PRIORITY_BADGES[issue.priority] || 'bg-slate-100'}`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] border font-bold ${statusInfo.badge}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewFullDetails(issue, 'aadhaar')}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openActionModal(issue)}
                              className="px-3 py-1.5 bg-[#00a86b] hover:bg-[#008f5b] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Process</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(issue._id, 'aadhaar')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeQueue === 'pan' ? (
          /* PAN TABLE */
          panRequests.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-800">No PAN Applications Found</h3>
              <p className="text-xs text-slate-500">Incoming PAN service applications from citizens will list here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Aadhaar / PAN</th>
                    <th className="py-3 px-4">PAN Service Type</th>
                    <th className="py-3 px-4">Ack Reference</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {panRequests.map((req) => {
                    const statusInfo = STATUS_CONFIG[req.status] || { badge: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                        <td
                          onClick={() => handleViewFullDetails(req, 'pan')}
                          className="py-3 px-4 font-mono font-bold text-emerald-800 hover:text-emerald-600 hover:underline cursor-pointer"
                          title="Click to view full application details"
                        >
                          {req.ticketNumber}
                        </td>
                        <td
                          onClick={() => handleViewFullDetails(req, 'pan')}
                          className="py-3 px-4 cursor-pointer group hover:bg-emerald-50/70 transition-colors rounded-lg"
                          title="Click to view full citizen details"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                            <span>{req.applicantName}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono group-hover:text-emerald-600/70">{req.applicantPhone}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 font-semibold">
                          <div>{req.maskedAadhaar}</div>
                          {req.panNumber && <div className="text-blue-700 text-[10px] font-bold">{req.maskedPan || req.panNumber}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{req.serviceType}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">
                          {req.nsdlUtiiAckNumber ? (
                            <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                              {req.nsdlUtiiAckNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400">---</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] border font-bold ${statusInfo.badge}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewFullDetails(req, 'pan')}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openPanActionModal(req)}
                              className="px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Process</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(req._id, 'pan')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeQueue === 'voter' ? (
          /* VOTER TABLE */
          voterRequests.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Vote className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-800">No Voter Applications Found</h3>
              <p className="text-xs text-slate-500">Incoming Voter service applications (Form 6, 8, 6B) will list here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">EPIC / Aadhaar</th>
                    <th className="py-3 px-4">Form / Service Type</th>
                    <th className="py-3 px-4">ECI Ref Number</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {voterRequests.map((req) => {
                    const statusInfo = STATUS_CONFIG[req.status] || { badge: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                        <td
                          onClick={() => handleViewFullDetails(req, 'voter')}
                          className="py-3 px-4 font-mono font-bold text-emerald-800 hover:text-emerald-600 hover:underline cursor-pointer"
                          title="Click to view full application details"
                        >
                          {req.ticketNumber}
                        </td>
                        <td
                          onClick={() => handleViewFullDetails(req, 'voter')}
                          className="py-3 px-4 cursor-pointer group hover:bg-emerald-50/70 transition-colors rounded-lg"
                          title="Click to view full citizen details"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                            <span>{req.applicantName}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono group-hover:text-emerald-600/70">{req.applicantPhone}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 font-semibold">
                          {req.epicNumber ? (
                            <div className="text-emerald-800 font-bold">{req.epicNumber}</div>
                          ) : (
                            <div className="text-slate-400">New Form 6</div>
                          )}
                          {req.maskedAadhaar && <div className="text-slate-400 text-[10px]">{req.maskedAadhaar}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{req.serviceType}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                          {req.eciReferenceNumber ? (
                            <span className="bg-lime-50 border border-lime-200 px-2 py-0.5 rounded">
                              {req.eciReferenceNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400">---</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] border font-bold ${statusInfo.badge}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewFullDetails(req, 'voter')}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openVoterActionModal(req)}
                              className="px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Process</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(req._id, 'voter')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeQueue === 'ration' ? (
          /* RATION TABLE */
          rationRequests.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Store className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-800">No Ration Applications Found</h3>
              <p className="text-xs text-slate-500">Incoming TNPDS Smart Card applications will list here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Applicant / Head</th>
                    <th className="py-3 px-4">Smart Card / Aadhaar</th>
                    <th className="py-3 px-4">Service Type</th>
                    <th className="py-3 px-4">TNPDS Ref Number</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {rationRequests.map((req) => {
                    const statusInfo = STATUS_CONFIG[req.status] || { badge: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                        <td
                          onClick={() => handleViewFullDetails(req, 'ration')}
                          className="py-3 px-4 font-mono font-bold text-emerald-800 hover:text-emerald-600 hover:underline cursor-pointer"
                          title="Click to view full application details"
                        >
                          {req.ticketNumber}
                        </td>
                        <td
                          onClick={() => handleViewFullDetails(req, 'ration')}
                          className="py-3 px-4 cursor-pointer group hover:bg-emerald-50/70 transition-colors rounded-lg"
                          title="Click to view full citizen details"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                            <span>{req.applicantName}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono group-hover:text-emerald-600/70">{req.applicantPhone}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 font-semibold">
                          {req.rationCardNumber ? (
                            <div className="text-emerald-800 font-bold">{req.rationCardNumber}</div>
                          ) : (
                            <div className="text-slate-400">New Smart Card</div>
                          )}
                          {req.maskedAadhaar && <div className="text-slate-400 text-[10px]">{req.maskedAadhaar}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{req.serviceType}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                          {req.tnpdsAckNumber ? (
                            <span className="bg-lime-50 border border-lime-200 px-2 py-0.5 rounded">
                              {req.tnpdsAckNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400">---</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] border font-bold ${statusInfo.badge}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewFullDetails(req, 'ration')}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRationActionModal(req)}
                              className="px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Process</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(req._id, 'ration')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeQueue === 'driving' ? (
          /* DRIVING LICENSE TABLE */
          drivingRequests.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Car className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-800">No Driving License Applications Found</h3>
              <p className="text-xs text-slate-500">Incoming Sarathi Parivahan applications will list here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">License / Class</th>
                    <th className="py-3 px-4">Service & RTO</th>
                    <th className="py-3 px-4">Sarathi Ref / Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {drivingRequests.map((req) => {
                    const statusInfo = STATUS_CONFIG[req.status] || { badge: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                        <td
                          onClick={() => handleViewFullDetails(req, 'driving')}
                          className="py-3 px-4 font-mono font-bold text-emerald-800 hover:text-emerald-600 hover:underline cursor-pointer"
                          title="Click to view full application details"
                        >
                          {req.ticketNumber}
                        </td>
                        <td
                          onClick={() => handleViewFullDetails(req, 'driving')}
                          className="py-3 px-4 cursor-pointer group hover:bg-emerald-50/70 transition-colors rounded-lg"
                          title="Click to view full citizen details"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                            <span>{req.applicantName}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono group-hover:text-emerald-600/70">{req.applicantPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-emerald-800">
                            {req.drivingLicenseNumber || req.learnerLicenseNumber || 'New Application'}
                          </div>
                          {req.vehicleClass && (
                            <div className="flex gap-1 flex-wrap mt-0.5">
                              {req.vehicleClass.split(',').map((vc) => (
                                <span key={vc.trim()} className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded text-[10px] font-mono">
                                  {vc.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{req.serviceType}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{req.rtoOffice}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {req.sarathiAckNumber ? (
                            <div className="font-bold text-emerald-900 bg-lime-50 border border-lime-200 px-2 py-0.5 rounded inline-block">
                              {req.sarathiAckNumber}
                            </div>
                          ) : (
                            <span className="text-slate-400">---</span>
                          )}
                          {req.rtoSlotDate && (
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-sans">
                              <Calendar className="w-3 h-3 text-emerald-600" />
                              <span>Slot: {new Date(req.rtoSlotDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] border font-bold ${statusInfo.badge}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewFullDetails(req, 'driving')}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDrivingActionModal(req)}
                              className="px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Process</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(req._id, 'driving')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeQueue === 'vehicle' ? (
          /* VEHICLE / VAHAN TABLE */
          vehicleRequests.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Car className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-800">No Vehicle / Vahan Applications Found</h3>
              <p className="text-xs text-slate-500">Incoming Vahan RC, Insurance, PUCC, and e-Challan service applications will list here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Vehicle Reg / Class</th>
                    <th className="py-3 px-4">Registered Owner</th>
                    <th className="py-3 px-4">Service Type & RTO</th>
                    <th className="py-3 px-4">Vahan Ref / Slot / Challan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {vehicleRequests.map((req) => {
                    const statusInfo = STATUS_CONFIG[req.status] || { badge: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                        <td
                          onClick={() => handleViewFullDetails(req, 'vehicle')}
                          className="py-3 px-4 font-mono font-bold text-emerald-800 hover:text-emerald-600 hover:underline cursor-pointer"
                          title="Click to view full application details"
                        >
                          {req.ticketNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div
                            onClick={() => handleViewFullDetails(req, 'vehicle')}
                            className="font-mono font-bold text-emerald-800 text-sm hover:underline cursor-pointer"
                          >
                            {req.vehicleNumber}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">{req.vehicleClass}</div>
                          {req.fuelType && (
                            <span className="inline-block mt-0.5 bg-slate-100 text-slate-600 px-1 py-0.2 rounded text-[10px] font-medium">
                              {req.fuelType}
                            </span>
                          )}
                        </td>
                        <td
                          onClick={() => handleViewFullDetails(req, 'vehicle')}
                          className="py-3 px-4 cursor-pointer group hover:bg-emerald-50/70 transition-colors rounded-lg"
                          title="Click to view full registered owner details"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                            <span>{req.ownerName}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono group-hover:text-emerald-600/70">{req.ownerPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{req.serviceType}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{req.rtoOffice}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {req.vahanAckNumber && (
                            <div className="font-bold text-emerald-900 bg-lime-50 border border-lime-200 px-2 py-0.5 rounded inline-block">
                              {req.vahanAckNumber}
                            </div>
                          )}
                          {req.challanNumber && (
                            <div className="text-[11px] text-rose-700 font-bold mt-0.5">
                              Challan: {req.challanNumber} {req.challanAmount ? `(₹${req.challanAmount})` : ''}
                            </div>
                          )}
                          {req.challanSettlementRef && (
                            <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                              Paid: {req.challanSettlementRef}
                            </div>
                          )}
                          {req.rtoSlotDate && (
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-sans">
                              <Calendar className="w-3 h-3 text-emerald-600" />
                              <span>Slot: {new Date(req.rtoSlotDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          )}
                          {!req.vahanAckNumber && !req.challanNumber && !req.rtoSlotDate && (
                            <span className="text-slate-400">---</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] border font-bold ${statusInfo.badge}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewFullDetails(req, 'vehicle')}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openVehicleActionModal(req)}
                              className="px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Process</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(req._id, 'vehicle')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* FARMER / UZHAVAN TABLE */
          farmerRequests.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Sprout className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-800">No Farmer / Uzhavan Applications Found</h3>
              <p className="text-xs text-slate-500">Incoming PM-KISAN, e-Patta & Chitta, Crop Insurance, and Subsidy applications will list here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Scheme / Service</th>
                    <th className="py-3 px-4">Farmer & Mobile</th>
                    <th className="py-3 px-4">Revenue Land Details</th>
                    <th className="py-3 px-4">Crop & Season</th>
                    <th className="py-3 px-4">Ack / Inspection</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {farmerRequests.map((req) => {
                    const statusInfo = STATUS_CONFIG[req.status] || { badge: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                        <td
                          onClick={() => handleViewFullDetails(req, 'farmer')}
                          className="py-3 px-4 font-mono font-bold text-emerald-800 hover:text-emerald-600 hover:underline cursor-pointer"
                          title="Click to view full application details"
                        >
                          {req.ticketNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 max-w-xs">{req.serviceType}</div>
                          {req.farmerCategory && (
                            <span className="inline-block mt-0.5 bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded text-[10px] font-bold border border-emerald-200">
                              {req.farmerCategory}
                            </span>
                          )}
                        </td>
                        <td
                          onClick={() => handleViewFullDetails(req, 'farmer')}
                          className="py-3 px-4 cursor-pointer group hover:bg-emerald-50/70 transition-colors rounded-lg"
                          title="Click to view full farmer profile"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                            <span>{req.farmerName}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono group-hover:text-emerald-600/70">{req.contactNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{req.district} ({req.taluk})</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {req.village} • {req.pattaNumber ? `Patta: ${req.pattaNumber}` : ''} {req.surveyNumber ? `Sy: ${req.surveyNumber}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{req.cropName}</div>
                          <div className="text-[11px] text-slate-500">{req.season}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {req.officialAckNumber ? (
                            <div className="font-bold text-emerald-900 bg-lime-50 border border-lime-200 px-2 py-0.5 rounded inline-block text-[11px]">
                              {req.officialAckNumber}
                            </div>
                          ) : (
                            <span className="text-slate-400">---</span>
                          )}
                          {req.fieldInspectionDate && (
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-sans">
                              <Calendar className="w-3 h-3 text-emerald-600" />
                              <span>Insp: {new Date(req.fieldInspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] border font-bold ${statusInfo.badge}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewFullDetails(req, 'farmer')}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openFarmerActionModal(req)}
                              className="px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Process</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(req._id, 'farmer')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Pagination controls */}
        {currentPagination && currentPagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>
              Showing Page {currentPagination.page} of {currentPagination.totalPages} ({currentPagination.total} records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!currentPagination.hasPrevPage}
                className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!currentPagination.hasNextPage}
                className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50 cursor-pointer flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: AADHAAR ACTION PROCESSOR
         ───────────────────────────────────────────────────────────────── */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-emerald-200">
                    {activeTicket.ticketNumber}
                  </span>
                  <span className="text-xs uppercase font-bold text-emerald-300">
                    {activeTicket.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
                  {activeTicket.issueType}
                </h3>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Applicant Name</span>
                  <div className="font-black text-slate-800 text-sm mt-0.5">{activeTicket.applicantName}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Contact Phone</span>
                  <div className="font-black text-slate-800 text-sm mt-0.5">{activeTicket.applicantPhone}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Aadhaar (Masked)</span>
                  <div className="font-mono font-black text-slate-800 text-sm mt-0.5">{activeTicket.maskedAadhaar}</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Query Description:</span>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                  {activeTicket.issueDescription}
                </div>
              </div>

              <form onSubmit={handleStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Admin Resolution & Status Control</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Update Ticket Status</label>
                  <select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="Submitted">Submitted (Queued)</option>
                    <option value="Under Review">Under Review (Agent Assigned)</option>
                    <option value="In Progress">In Progress (Processing in UIDAI)</option>
                    <option value="Pending Docs">Pending Docs (Waiting for user documents)</option>
                    <option value="Resolved">Resolved (Success / Completed)</option>
                    <option value="Rejected">Rejected (Ineligible / Wrong details)</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Remarks / Operator Notes</label>
                  <textarea
                    rows={3}
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that the citizen will see on their dashboard..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#00a86b] hover:bg-[#008f5b] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────────
          MODAL: PROCESS FARMER / UZHAVAN TICKET
         ───────────────────────────────────────────────────────────────── */}
      {activeFarmerTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0 border border-emerald-500/30">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-white">
                      {activeFarmerTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] uppercase font-black bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                      UZHAVAN SERVICE
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-1">
                    Process Farmer & Agriculture Application
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveFarmerTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer Name</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.farmerName}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.contactNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheme Requested</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{activeFarmerTicket.serviceType}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue Jurisdiction</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeFarmerTicket.district} ({activeFarmerTicket.taluk})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patta / Survey</span>
                  <div className="font-mono text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.pattaNumber ? `Patta: ${activeFarmerTicket.pattaNumber}` : ''} {activeFarmerTicket.surveyNumber ? `Sy: ${activeFarmerTicket.surveyNumber}` : '---'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Crop & Season</span>
                  <div className="text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.cropName} • {activeFarmerTicket.season}
                  </div>
                </div>
              </div>

              {activeFarmerTicket.schemeSpecificNotes && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Specific Notes:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activeFarmerTicket.schemeSpecificNotes}
                  </div>
                </div>
              )}

              {/* Action Form */}
              <form onSubmit={handleFarmerStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Uzhavan / Agri Department Processing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Update Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={adminFarmerStatus}
                      onChange={(e) => setAdminFarmerStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value="Submitted">Submitted (Received)</option>
                      <option value="Under Review">Under Review (Scrutiny)</option>
                      <option value="Field Inspection Scheduled">Field Inspection Scheduled</option>
                      <option value="Verified">Verified by VAO / Agri Officer</option>
                      <option value="Approved">Approved (Subsidy / Pass Issued)</option>
                      <option value="Resolved">Resolved / Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Uzhavan / Revenue Ack No
                    </label>
                    <input
                      type="text"
                      value={adminFarmerAck}
                      onChange={(e) => setAdminFarmerAck(e.target.value)}
                      placeholder="e.g. UZHAVAN-2026-8912"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Field Inspection / Land Verification Date (If applicable)
                  </label>
                  <input
                    type="date"
                    value={adminFarmerInspectionDate}
                    onChange={(e) => setAdminFarmerInspectionDate(e.target.value)}
                    className="w-full sm:w-1/2 px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Citizen Response Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminFarmerRemarks}
                    onChange={(e) => setAdminFarmerRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted in green on the citizen portal..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Farmer Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: PAN ACTION PROCESSOR (WITH NSDL / UTIITSL ACK NO)
         ───────────────────────────────────────────────────────────────── */}
      {activePanTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-blue-200">
                    {activePanTicket.ticketNumber}
                  </span>
                  <span className="text-xs uppercase font-bold text-blue-300">
                    {activePanTicket.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
                  {activePanTicket.serviceType}
                </h3>
              </div>
              <button
                onClick={() => setActivePanTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              {/* Applicant Credentials */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Applicant</span>
                  <div className="font-black text-slate-800 text-sm mt-0.5">{activePanTicket.applicantName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{activePanTicket.applicantPhone}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Aadhaar (Masked)</span>
                  <div className="font-mono font-black text-slate-800 text-sm mt-0.5">{activePanTicket.maskedAadhaar}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">PAN Number</span>
                  <div className="font-mono font-black text-blue-700 text-sm mt-0.5">
                    {activePanTicket.panNumber || 'New Allotment'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Delivery</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{activePanTicket.deliveryMode}</div>
                </div>
              </div>

              {/* Application Details */}
              {(activePanTicket.correctionDetails || activePanTicket.instructions) && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Request Notes:</span>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activePanTicket.correctionDetails || activePanTicket.instructions}
                  </div>
                </div>
              )}

              {/* PAN Admin Action Form */}
              <form onSubmit={handlePanStatusUpdate} className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>NSDL / UTIITSL Processing & Resolution</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                    <select
                      value={adminPanStatus}
                      onChange={(e) => setAdminPanStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="Submitted">Submitted (Queued)</option>
                      <option value="Under Review">Under Review (NSDL Verification)</option>
                      <option value="In Progress">In Progress (Printing / Dispatch)</option>
                      <option value="Pending Docs">Pending Docs (Signature / Photo required)</option>
                      <option value="Resolved">Resolved (PAN Allotted / Dispatched)</option>
                      <option value="Rejected">Rejected (Ineligible / Mismatch)</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NSDL / UTIITSL Ack Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={adminPanAck}
                      onChange={(e) => setAdminPanAck(e.target.value)}
                      placeholder="e.g. 881923481239"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminPanRemarks}
                    onChange={(e) => setAdminPanRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted on the citizen side..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save PAN Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────────
          MODAL: PROCESS FARMER / UZHAVAN TICKET
         ───────────────────────────────────────────────────────────────── */}
      {activeFarmerTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0 border border-emerald-500/30">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-white">
                      {activeFarmerTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] uppercase font-black bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                      UZHAVAN SERVICE
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-1">
                    Process Farmer & Agriculture Application
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveFarmerTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer Name</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.farmerName}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.contactNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheme Requested</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{activeFarmerTicket.serviceType}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue Jurisdiction</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeFarmerTicket.district} ({activeFarmerTicket.taluk})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patta / Survey</span>
                  <div className="font-mono text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.pattaNumber ? `Patta: ${activeFarmerTicket.pattaNumber}` : ''} {activeFarmerTicket.surveyNumber ? `Sy: ${activeFarmerTicket.surveyNumber}` : '---'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Crop & Season</span>
                  <div className="text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.cropName} • {activeFarmerTicket.season}
                  </div>
                </div>
              </div>

              {activeFarmerTicket.schemeSpecificNotes && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Specific Notes:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activeFarmerTicket.schemeSpecificNotes}
                  </div>
                </div>
              )}

              {/* Action Form */}
              <form onSubmit={handleFarmerStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Uzhavan / Agri Department Processing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Update Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={adminFarmerStatus}
                      onChange={(e) => setAdminFarmerStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value="Submitted">Submitted (Received)</option>
                      <option value="Under Review">Under Review (Scrutiny)</option>
                      <option value="Field Inspection Scheduled">Field Inspection Scheduled</option>
                      <option value="Verified">Verified by VAO / Agri Officer</option>
                      <option value="Approved">Approved (Subsidy / Pass Issued)</option>
                      <option value="Resolved">Resolved / Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Uzhavan / Revenue Ack No
                    </label>
                    <input
                      type="text"
                      value={adminFarmerAck}
                      onChange={(e) => setAdminFarmerAck(e.target.value)}
                      placeholder="e.g. UZHAVAN-2026-8912"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Field Inspection / Land Verification Date (If applicable)
                  </label>
                  <input
                    type="date"
                    value={adminFarmerInspectionDate}
                    onChange={(e) => setAdminFarmerInspectionDate(e.target.value)}
                    className="w-full sm:w-1/2 px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Citizen Response Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminFarmerRemarks}
                    onChange={(e) => setAdminFarmerRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted in green on the citizen portal..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Farmer Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: VOTER ACTION PROCESSOR (WITH ECI NVSP REF NO)
         ───────────────────────────────────────────────────────────────── */}
      {activeVoterTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-emerald-200">
                    {activeVoterTicket.ticketNumber}
                  </span>
                  <span className="text-xs uppercase font-bold text-emerald-300">
                    {activeVoterTicket.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
                  {activeVoterTicket.serviceType}
                </h3>
              </div>
              <button
                onClick={() => setActiveVoterTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              {/* Applicant Credentials */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Applicant</span>
                  <div className="font-black text-slate-800 text-sm mt-0.5">{activeVoterTicket.applicantName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{activeVoterTicket.applicantPhone}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">EPIC Number</span>
                  <div className="font-mono font-black text-emerald-800 text-sm mt-0.5">
                    {activeVoterTicket.epicNumber || 'New Form 6'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">District</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeVoterTicket.district || 'Salem'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Constituency</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeVoterTicket.assemblyConstituency || 'General'}
                  </div>
                </div>
              </div>

              {/* Application Details */}
              {(activeVoterTicket.correctionDetails || activeVoterTicket.remarksOrNotes) && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Request Notes:</span>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activeVoterTicket.correctionDetails || activeVoterTicket.remarksOrNotes}
                  </div>
                </div>
              )}

              {/* Voter Admin Action Form */}
              <form onSubmit={handleVoterStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>ECI NVSP Electoral Processing & Resolution</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                    <select
                      value={adminVoterStatus}
                      onChange={(e) => setAdminVoterStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value="Submitted">Submitted (Queued)</option>
                      <option value="Under Review">Under Review (ECI Portal Verification)</option>
                      <option value="In Progress">In Progress (BLO Field Verification)</option>
                      <option value="Pending Docs">Pending Docs (Address / Photo proof)</option>
                      <option value="Resolved">Resolved (Approved / EPIC Generated)</option>
                      <option value="Rejected">Rejected (Ineligible / Duplicate)</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ECI NVSP Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={adminVoterEciRef}
                      onChange={(e) => setAdminVoterEciRef(e.target.value)}
                      placeholder="e.g. TN-08-2026-98124"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminVoterRemarks}
                    onChange={(e) => setAdminVoterRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted on the citizen side..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Voter Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────────
          MODAL: PROCESS FARMER / UZHAVAN TICKET
         ───────────────────────────────────────────────────────────────── */}
      {activeFarmerTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0 border border-emerald-500/30">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-white">
                      {activeFarmerTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] uppercase font-black bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                      UZHAVAN SERVICE
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-1">
                    Process Farmer & Agriculture Application
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveFarmerTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer Name</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.farmerName}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.contactNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheme Requested</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{activeFarmerTicket.serviceType}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue Jurisdiction</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeFarmerTicket.district} ({activeFarmerTicket.taluk})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patta / Survey</span>
                  <div className="font-mono text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.pattaNumber ? `Patta: ${activeFarmerTicket.pattaNumber}` : ''} {activeFarmerTicket.surveyNumber ? `Sy: ${activeFarmerTicket.surveyNumber}` : '---'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Crop & Season</span>
                  <div className="text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.cropName} • {activeFarmerTicket.season}
                  </div>
                </div>
              </div>

              {activeFarmerTicket.schemeSpecificNotes && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Specific Notes:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activeFarmerTicket.schemeSpecificNotes}
                  </div>
                </div>
              )}

              {/* Action Form */}
              <form onSubmit={handleFarmerStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Uzhavan / Agri Department Processing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Update Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={adminFarmerStatus}
                      onChange={(e) => setAdminFarmerStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value="Submitted">Submitted (Received)</option>
                      <option value="Under Review">Under Review (Scrutiny)</option>
                      <option value="Field Inspection Scheduled">Field Inspection Scheduled</option>
                      <option value="Verified">Verified by VAO / Agri Officer</option>
                      <option value="Approved">Approved (Subsidy / Pass Issued)</option>
                      <option value="Resolved">Resolved / Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Uzhavan / Revenue Ack No
                    </label>
                    <input
                      type="text"
                      value={adminFarmerAck}
                      onChange={(e) => setAdminFarmerAck(e.target.value)}
                      placeholder="e.g. UZHAVAN-2026-8912"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Field Inspection / Land Verification Date (If applicable)
                  </label>
                  <input
                    type="date"
                    value={adminFarmerInspectionDate}
                    onChange={(e) => setAdminFarmerInspectionDate(e.target.value)}
                    className="w-full sm:w-1/2 px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Citizen Response Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminFarmerRemarks}
                    onChange={(e) => setAdminFarmerRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted in green on the citizen portal..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Farmer Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: RATION CARD ACTION PROCESSOR
         ───────────────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────
          RATION ACTION PROCESSOR MODAL
         ───────────────────────────────────────────────────────────────── */}
      {activeRationTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-emerald-200">
                    {activeRationTicket.ticketNumber}
                  </span>
                  <span className="text-xs uppercase font-bold text-emerald-300">
                    {activeRationTicket.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
                  {activeRationTicket.serviceType}
                </h3>
              </div>
              <button
                onClick={() => setActiveRationTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              {/* Applicant Credentials */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Applicant / Head</span>
                  <div className="font-black text-slate-800 text-sm mt-0.5">{activeRationTicket.applicantName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{activeRationTicket.applicantPhone}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Smart Card Number</span>
                  <div className="font-mono font-black text-emerald-800 text-sm mt-0.5">
                    {activeRationTicket.rationCardNumber || 'New Smart Card'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Commodity Type</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                    {activeRationTicket.cardType || 'PHH Rice'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">District & Shop</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeRationTicket.district || 'Salem'} • {activeRationTicket.fpsCode || 'General'}
                  </div>
                </div>
              </div>

              {/* Application Details / Members */}
              {activeRationTicket.members && activeRationTicket.members.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Enrolled Family Members:</span>
                  <div className="space-y-1.5 mt-1">
                    {activeRationTicket.members.map((m, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{m.name} ({m.relation})</span>
                        <span className="font-mono text-slate-500">{m.aadhaarNumber ? `Aadhaar: ${m.aadhaarNumber}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeRationTicket.correctionDetails || activeRationTicket.newAddress || activeRationTicket.remarksOrNotes) && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Application Details:</span>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activeRationTicket.correctionDetails || activeRationTicket.newAddress || activeRationTicket.remarksOrNotes}
                  </div>
                </div>
              )}

              {/* Ration Admin Action Form */}
              <form onSubmit={handleRationStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>TNPDS Civil Supplies Processing & Resolution</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                    <select
                      value={adminRationStatus}
                      onChange={(e) => setAdminRationStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value="Submitted">Submitted (Queued)</option>
                      <option value="Under Review">Under Review (TNPDS Verification)</option>
                      <option value="In Progress">In Progress (Taluk Supply Officer Review)</option>
                      <option value="Pending Verification">Pending Verification (Field Verification)</option>
                      <option value="Resolved">Resolved (Approved / Card Issued)</option>
                      <option value="Rejected">Rejected (Ineligible / Incomplete)</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      TNPDS Reference / Acknowledgment Number
                    </label>
                    <input
                      type="text"
                      value={adminRationAck}
                      onChange={(e) => setAdminRationAck(e.target.value)}
                      placeholder="e.g. TNPDS-2026-081234"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminRationRemarks}
                    onChange={(e) => setAdminRationRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted in green on the citizen portal..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Ration Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────────
          MODAL: PROCESS FARMER / UZHAVAN TICKET
         ───────────────────────────────────────────────────────────────── */}
      {activeFarmerTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0 border border-emerald-500/30">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-white">
                      {activeFarmerTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] uppercase font-black bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                      UZHAVAN SERVICE
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-1">
                    Process Farmer & Agriculture Application
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveFarmerTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer Name</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.farmerName}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.contactNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheme Requested</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{activeFarmerTicket.serviceType}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue Jurisdiction</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeFarmerTicket.district} ({activeFarmerTicket.taluk})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patta / Survey</span>
                  <div className="font-mono text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.pattaNumber ? `Patta: ${activeFarmerTicket.pattaNumber}` : ''} {activeFarmerTicket.surveyNumber ? `Sy: ${activeFarmerTicket.surveyNumber}` : '---'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Crop & Season</span>
                  <div className="text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.cropName} • {activeFarmerTicket.season}
                  </div>
                </div>
              </div>

              {activeFarmerTicket.schemeSpecificNotes && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Specific Notes:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activeFarmerTicket.schemeSpecificNotes}
                  </div>
                </div>
              )}

              {/* Action Form */}
              <form onSubmit={handleFarmerStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Uzhavan / Agri Department Processing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Update Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={adminFarmerStatus}
                      onChange={(e) => setAdminFarmerStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value="Submitted">Submitted (Received)</option>
                      <option value="Under Review">Under Review (Scrutiny)</option>
                      <option value="Field Inspection Scheduled">Field Inspection Scheduled</option>
                      <option value="Verified">Verified by VAO / Agri Officer</option>
                      <option value="Approved">Approved (Subsidy / Pass Issued)</option>
                      <option value="Resolved">Resolved / Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Uzhavan / Revenue Ack No
                    </label>
                    <input
                      type="text"
                      value={adminFarmerAck}
                      onChange={(e) => setAdminFarmerAck(e.target.value)}
                      placeholder="e.g. UZHAVAN-2026-8912"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Field Inspection / Land Verification Date (If applicable)
                  </label>
                  <input
                    type="date"
                    value={adminFarmerInspectionDate}
                    onChange={(e) => setAdminFarmerInspectionDate(e.target.value)}
                    className="w-full sm:w-1/2 px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Citizen Response Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminFarmerRemarks}
                    onChange={(e) => setAdminFarmerRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted in green on the citizen portal..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Farmer Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          DRIVING LICENSE ACTION PROCESSOR MODAL
         ───────────────────────────────────────────────────────────────── */}
      {activeDrivingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-emerald-200">
                    {activeDrivingTicket.ticketNumber}
                  </span>
                  <span className="text-xs uppercase font-bold text-emerald-300">
                    {activeDrivingTicket.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
                  {activeDrivingTicket.serviceType}
                </h3>
              </div>
              <button
                onClick={() => setActiveDrivingTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              {/* Applicant Credentials */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Applicant</span>
                  <div className="font-black text-slate-800 text-sm mt-0.5">{activeDrivingTicket.applicantName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{activeDrivingTicket.applicantPhone}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">License / LL No.</span>
                  <div className="font-mono font-black text-emerald-800 text-sm mt-0.5">
                    {activeDrivingTicket.drivingLicenseNumber || activeDrivingTicket.learnerLicenseNumber || 'New Application'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">RTO Jurisdiction</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                    {activeDrivingTicket.rtoOffice || 'TN-01 Chennai Central'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Blood & Guardian</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeDrivingTicket.bloodGroup || 'O+'} • {activeDrivingTicket.relativeName || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Vehicle Classes */}
              {activeDrivingTicket.vehicleClass && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Vehicle Classes Applied:</span>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {activeDrivingTicket.vehicleClass.split(',').map((vc) => (
                      <span key={vc.trim()} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono font-bold">
                        {vc.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Citizen Details / Remarks */}
              {(activeDrivingTicket.newAddress || activeDrivingTicket.remarksOrNotes) && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Request Details:</span>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activeDrivingTicket.newAddress || activeDrivingTicket.remarksOrNotes}
                  </div>
                </div>
              )}

              {/* Driving Admin Action Form */}
              <form onSubmit={handleDrivingStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Sarathi Parivahan Processing & Slot Booking</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                    <select
                      value={adminDrivingStatus}
                      onChange={(e) => setAdminDrivingStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value="Submitted">Submitted (Queued)</option>
                      <option value="Under Review">Under Review (Document Check)</option>
                      <option value="In Progress">In Progress (Fee & Scrutiny)</option>
                      <option value="RTO Test Scheduled">RTO Test Scheduled</option>
                      <option value="Biometric Capture">Biometric Capture Pending</option>
                      <option value="Resolved">Resolved (DL / LL Approved & Dispatched)</option>
                      <option value="Rejected">Rejected (Ineligible / Disqualified)</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sarathi App / Ack Number
                    </label>
                    <input
                      type="text"
                      value={adminDrivingAck}
                      onChange={(e) => setAdminDrivingAck(e.target.value)}
                      placeholder="e.g. TN2026008123LL"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      RTO Slot / Test Date
                    </label>
                    <input
                      type="date"
                      value={adminDrivingSlot}
                      onChange={(e) => setAdminDrivingSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Citizen Response Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminDrivingRemarks}
                    onChange={(e) => setAdminDrivingRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted in green on the citizen portal..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Driving Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────────
          MODAL: PROCESS FARMER / UZHAVAN TICKET
         ───────────────────────────────────────────────────────────────── */}
      {activeFarmerTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0 border border-emerald-500/30">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-white">
                      {activeFarmerTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] uppercase font-black bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                      UZHAVAN SERVICE
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-1">
                    Process Farmer & Agriculture Application
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveFarmerTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer Name</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.farmerName}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.contactNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheme Requested</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{activeFarmerTicket.serviceType}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue Jurisdiction</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeFarmerTicket.district} ({activeFarmerTicket.taluk})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patta / Survey</span>
                  <div className="font-mono text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.pattaNumber ? `Patta: ${activeFarmerTicket.pattaNumber}` : ''} {activeFarmerTicket.surveyNumber ? `Sy: ${activeFarmerTicket.surveyNumber}` : '---'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Crop & Season</span>
                  <div className="text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.cropName} • {activeFarmerTicket.season}
                  </div>
                </div>
              </div>

              {activeFarmerTicket.schemeSpecificNotes && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Specific Notes:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activeFarmerTicket.schemeSpecificNotes}
                  </div>
                </div>
              )}

              {/* Action Form */}
              <form onSubmit={handleFarmerStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Uzhavan / Agri Department Processing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Update Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={adminFarmerStatus}
                      onChange={(e) => setAdminFarmerStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value="Submitted">Submitted (Received)</option>
                      <option value="Under Review">Under Review (Scrutiny)</option>
                      <option value="Field Inspection Scheduled">Field Inspection Scheduled</option>
                      <option value="Verified">Verified by VAO / Agri Officer</option>
                      <option value="Approved">Approved (Subsidy / Pass Issued)</option>
                      <option value="Resolved">Resolved / Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Uzhavan / Revenue Ack No
                    </label>
                    <input
                      type="text"
                      value={adminFarmerAck}
                      onChange={(e) => setAdminFarmerAck(e.target.value)}
                      placeholder="e.g. UZHAVAN-2026-8912"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Field Inspection / Land Verification Date (If applicable)
                  </label>
                  <input
                    type="date"
                    value={adminFarmerInspectionDate}
                    onChange={(e) => setAdminFarmerInspectionDate(e.target.value)}
                    className="w-full sm:w-1/2 px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Citizen Response Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminFarmerRemarks}
                    onChange={(e) => setAdminFarmerRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted in green on the citizen portal..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Farmer Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          VEHICLE / VAHAN ACTION PROCESSOR MODAL
         ───────────────────────────────────────────────────────────────── */}
      {activeVehicleTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-emerald-200">
                    {activeVehicleTicket.ticketNumber}
                  </span>
                  <span className="text-xs uppercase font-bold text-emerald-300">
                    {activeVehicleTicket.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
                  {activeVehicleTicket.serviceType}
                </h3>
              </div>
              <button
                onClick={() => setActiveVehicleTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              {/* Vehicle Credentials */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Vehicle Reg No</span>
                  <div className="font-mono font-black text-emerald-800 text-sm mt-0.5">{activeVehicleTicket.vehicleNumber}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{activeVehicleTicket.vehicleClass}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Owner Name</span>
                  <div className="font-black text-slate-800 text-sm mt-0.5 truncate">{activeVehicleTicket.ownerName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{activeVehicleTicket.ownerPhone}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">RTO Jurisdiction</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                    {activeVehicleTicket.rtoOffice || 'TN-01 Chennai Central'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Fuel & Details</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeVehicleTicket.fuelType} • {activeVehicleTicket.makerModel || 'Standard'}
                  </div>
                </div>
              </div>

              {/* Challan or Transfer Information */}
              {(activeVehicleTicket.challanNumber || activeVehicleTicket.newOwnerName || activeVehicleTicket.newAddress) && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  {activeVehicleTicket.challanNumber && (
                    <div className="font-mono text-rose-700 font-bold">
                      Challan Reference: {activeVehicleTicket.challanNumber} {activeVehicleTicket.challanAmount ? `(Fine: ₹${activeVehicleTicket.challanAmount})` : ''}
                    </div>
                  )}
                  {activeVehicleTicket.newOwnerName && (
                    <div className="font-bold text-slate-800">
                      Buyer: {activeVehicleTicket.newOwnerName} ({activeVehicleTicket.newOwnerPhone})
                    </div>
                  )}
                  {activeVehicleTicket.newAddress && (
                    <div className="text-slate-600 font-medium">
                      New Address: {activeVehicleTicket.newAddress}
                    </div>
                  )}
                </div>
              )}

              {/* Citizen Remarks */}
              {activeVehicleTicket.remarksOrNotes && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Request Remarks:</span>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activeVehicleTicket.remarksOrNotes}
                  </div>
                </div>
              )}

              {/* Vehicle Admin Action Form */}
              <form onSubmit={handleVehicleStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Vahan Parivahan Processing & Settlement</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                    <select
                      value={adminVehicleStatus}
                      onChange={(e) => setAdminVehicleStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value="Submitted">Submitted (Queued)</option>
                      <option value="Under Review">Under Review (Document Check)</option>
                      <option value="In Progress">In Progress (Fee & Scrutiny)</option>
                      <option value="RTO Verification">RTO Verification Pending</option>
                      <option value="Fitness / Inspection Scheduled">Fitness / Inspection Scheduled</option>
                      <option value="Resolved">Resolved (Approved & Issued)</option>
                      <option value="Rejected">Rejected (Ineligible / Disqualified)</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vahan Ack / Ref Number
                    </label>
                    <input
                      type="text"
                      value={adminVehicleAck}
                      onChange={(e) => setAdminVehicleAck(e.target.value)}
                      placeholder="e.g. TN2026-VAHAN-008123"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Challan Settlement Ref
                    </label>
                    <input
                      type="text"
                      value={adminVehicleChallanRef}
                      onChange={(e) => setAdminVehicleChallanRef(e.target.value)}
                      placeholder="e.g. CHL-SET-2026-9012"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RTO Inspection / Slot Date (If applicable)
                  </label>
                  <input
                    type="date"
                    value={adminVehicleSlot}
                    onChange={(e) => setAdminVehicleSlot(e.target.value)}
                    className="w-full sm:w-1/2 px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Citizen Response Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminVehicleRemarks}
                    onChange={(e) => setAdminVehicleRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted in green on the citizen portal..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Vehicle Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: PROCESS FARMER / UZHAVAN TICKET
         ───────────────────────────────────────────────────────────────── */}
      {activeFarmerTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0 border border-emerald-500/30">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded text-white">
                      {activeFarmerTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] uppercase font-black bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                      UZHAVAN SERVICE
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-1">
                    Process Farmer & Agriculture Application
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveFarmerTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {actionErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer Name</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.farmerName}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{activeFarmerTicket.contactNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheme Requested</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{activeFarmerTicket.serviceType}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue Jurisdiction</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {activeFarmerTicket.district} ({activeFarmerTicket.taluk})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patta / Survey</span>
                  <div className="font-mono text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.pattaNumber ? `Patta: ${activeFarmerTicket.pattaNumber}` : ''} {activeFarmerTicket.surveyNumber ? `Sy: ${activeFarmerTicket.surveyNumber}` : '---'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Crop & Season</span>
                  <div className="text-xs mt-0.5 text-slate-700">
                    {activeFarmerTicket.cropName} • {activeFarmerTicket.season}
                  </div>
                </div>
              </div>

              {activeFarmerTicket.schemeSpecificNotes && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Citizen Specific Notes:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {activeFarmerTicket.schemeSpecificNotes}
                  </div>
                </div>
              )}

              {/* Action Form */}
              <form onSubmit={handleFarmerStatusUpdate} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Uzhavan / Agri Department Processing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Update Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={adminFarmerStatus}
                      onChange={(e) => setAdminFarmerStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value="Submitted">Submitted (Received)</option>
                      <option value="Under Review">Under Review (Scrutiny)</option>
                      <option value="Field Inspection Scheduled">Field Inspection Scheduled</option>
                      <option value="Verified">Verified by VAO / Agri Officer</option>
                      <option value="Approved">Approved (Subsidy / Pass Issued)</option>
                      <option value="Resolved">Resolved / Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Uzhavan / Revenue Ack No
                    </label>
                    <input
                      type="text"
                      value={adminFarmerAck}
                      onChange={(e) => setAdminFarmerAck(e.target.value)}
                      placeholder="e.g. UZHAVAN-2026-8912"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Field Inspection / Land Verification Date (If applicable)
                  </label>
                  <input
                    type="date"
                    value={adminFarmerInspectionDate}
                    onChange={(e) => setAdminFarmerInspectionDate(e.target.value)}
                    className="w-full sm:w-1/2 px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Remarks / Citizen Response Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminFarmerRemarks}
                    onChange={(e) => setAdminFarmerRemarks(e.target.value)}
                    placeholder="Enter official resolution notes that will be prominently highlighted in green on the citizen portal..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Farmer Status & Send Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
