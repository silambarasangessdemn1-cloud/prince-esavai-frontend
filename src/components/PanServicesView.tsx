import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceIcon } from './ServiceIcon';
import { panApi, PanRequest, PanStatsResponse } from '../services/panApi';
import {
  CreditCard,
  Search,
  RotateCcw,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Phone,
  User,
  Sparkles,
  MessageSquare,
  List,
  Fingerprint,
  FileText,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PanServiceCard {
  id: string;
  name: string;
  actionLabel: string;
  category: 'new' | 'correction' | 'reprint' | 'linking';
  iconType: string;
  cornerColor: 'blue' | 'green';
  actionColor: 'blue' | 'green';
  backendServiceType: string;
  defaultDescription: string;
  deliveryMode: 'Physical Card + e-PAN' | 'e-PAN Only';
  requiresExistingPan: boolean;
}

const PAN_SERVICES: PanServiceCard[] = [
  {
    id: 'new-pan-form-49a',
    name: 'NEW PAN CARD (FORM 49A)',
    actionLabel: 'APPLY ONLINE',
    category: 'new',
    iconType: 'pan-hand',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'New PAN Card (Form 49A)',
    defaultDescription: 'Application for new PAN card allotment for adult Indian citizen under Form 49A.',
    deliveryMode: 'Physical Card + e-PAN',
    requiresExistingPan: false,
  },
  {
    id: 'pan-correction-changes',
    name: 'PAN CORRECTION & CHANGES',
    actionLabel: 'CORRECTION',
    category: 'correction',
    iconType: 'e-pan',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'PAN Correction / Changes',
    defaultDescription: 'Request for correction of Name, Date of Birth, Father Name, Photo or Signature on PAN card.',
    deliveryMode: 'Physical Card + e-PAN',
    requiresExistingPan: true,
  },
  {
    id: 'reprint-physical-pan',
    name: 'REPRINT PHYSICAL PAN',
    actionLabel: 'RE-ISSUE',
    category: 'reprint',
    iconType: 'pan-aadhaar',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Reprint Physical PAN Card',
    defaultDescription: 'Request duplicate physical reprint of lost, stolen, or damaged original PAN card.',
    deliveryMode: 'Physical Card + e-PAN',
    requiresExistingPan: true,
  },
  {
    id: 'minor-to-major-pan',
    name: 'MINOR TO MAJOR PAN',
    actionLabel: 'UPDATE',
    category: 'correction',
    iconType: 'aadhaar-doc',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Minor to Major PAN Update',
    defaultDescription: 'Upgrade PAN issued during minor age (<18 yrs) with major photo and signature endorsement.',
    deliveryMode: 'Physical Card + e-PAN',
    requiresExistingPan: true,
  },
  {
    id: 'instant-epan-service',
    name: 'INSTANT E-PAN SERVICE',
    actionLabel: 'DOWNLOAD',
    category: 'new',
    iconType: 'pan-hand',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Instant e-PAN Download',
    defaultDescription: 'Instant generation of digital digitally-signed e-PAN card via Aadhaar e-KYC authentication.',
    deliveryMode: 'e-PAN Only',
    requiresExistingPan: false,
  },
  {
    id: 'aadhaar-pan-linking',
    name: 'AADHAAR - PAN LINKING',
    actionLabel: 'LINK NPCI',
    category: 'linking',
    iconType: 'bank-aadhaar',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Aadhaar - PAN Linking',
    defaultDescription: 'Resolution of inoperative PAN status by linking with valid 12-digit Aadhaar under Section 139AA.',
    deliveryMode: 'Physical Card + e-PAN',
    requiresExistingPan: true,
  },
  {
    id: 'find-lost-pan',
    name: 'FIND LOST PAN NUMBER',
    actionLabel: 'FIND',
    category: 'reprint',
    iconType: 'know-aadhaar',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Find Lost PAN Number',
    defaultDescription: 'Retrieve lost 10-character PAN number using Aadhaar biometric details and full name verification.',
    deliveryMode: 'e-PAN Only',
    requiresExistingPan: false,
  },
  {
    id: 'pvc-plastic-card-order',
    name: 'PVC PLASTIC CARD PRINT',
    actionLabel: 'DISPATCH',
    category: 'reprint',
    iconType: 'laptop-bio',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'PVC Plastic Card Order',
    defaultDescription: 'Order high-resolution UV printed plastic PVC card dispatch with QR code barcode security.',
    deliveryMode: 'Physical Card + e-PAN',
    requiresExistingPan: true,
  },
];

const STATUS_BADGES: Record<string, string> = {
  'Submitted':    'bg-sky-50 text-sky-800 border-sky-200',
  'Under Review': 'bg-purple-50 text-purple-800 border-purple-200',
  'In Progress':  'bg-amber-50 text-amber-800 border-amber-200',
  'Pending Docs': 'bg-orange-50 text-orange-800 border-orange-200',
  'Resolved':     'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
  'Rejected':     'bg-rose-50 text-rose-800 border-rose-200',
  'Closed':       'bg-slate-100 text-slate-600 border-slate-200',
};

export const PanServicesView: React.FC = () => {
  const { setActiveTab } = useApp();

  // Search and Category Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'new' | 'correction' | 'reprint' | 'linking' | 'tickets'>('all');

  // Form Modal State
  const [selectedService, setSelectedService] = useState<PanServiceCard | null>(null);
  const [formData, setFormData] = useState({
    applicantName: '',
    fatherName: '',
    dateOfBirth: '',
    gender: 'Male',
    applicantPhone: '',
    applicantEmail: '',
    aadhaarNumber: '',
    panNumber: '',
    deliveryMode: 'Physical Card + e-PAN',
    correctionDetails: '',
    instructions: '',
    priority: 'Medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Issues & Stats
  const [recentRequests, setRecentRequests] = useState<PanRequest[]>([]);
  const [stats, setStats] = useState<PanStatsResponse | null>(null);

  // Search by PAN or Aadhaar
  const [lookupInput, setLookupInput] = useState('');
  const [lookupResult, setLookupResult] = useState<{
    identifier: string;
    summary: { totalRequests: number; byStatus: Record<string, number>; byServiceType: Record<string, number> };
    requests: PanRequest[];
  } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Selected for Inspect Modal
  const [inspectRequest, setInspectRequest] = useState<PanRequest | null>(null);

  // Load live requests and stats
  const loadRequestsAndStats = useCallback(async () => {
    const [reqsRes, statsRes] = await Promise.all([
      panApi.listRequests({ limit: 12 }),
      panApi.getStats(),
    ]);
    if (reqsRes.success && reqsRes.data) {
      setRecentRequests(reqsRes.data.requests);
    }
    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data);
    }
  }, []);

  // Poll every 5s so admin responses appear in real-time
  useEffect(() => {
    loadRequestsAndStats();
    const interval = setInterval(() => {
      loadRequestsAndStats();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadRequestsAndStats]);

  // Find all requests with admin response or updated status
  const respondedRequests = recentRequests.filter(
    (r) => (r.resolutionRemarks && r.resolutionRemarks.trim().length > 0) || (r.status && r.status !== 'Submitted')
  );
  const latestAdminResponse = respondedRequests.length > 0 ? respondedRequests[0] : null;

  // Filter Services by category and search term
  const filteredServices = PAN_SERVICES.filter((srv) => {
    if (activeCategory !== 'all' && activeCategory !== 'tickets' && srv.category !== activeCategory) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        srv.name.toLowerCase().includes(q) ||
        srv.actionLabel.toLowerCase().includes(q) ||
        srv.backendServiceType.toLowerCase().includes(q) ||
        srv.defaultDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Open Form Modal
  const handleOpenService = (service: PanServiceCard) => {
    setSelectedService(service);
    setFormData({
      applicantName: '',
      fatherName: '',
      dateOfBirth: '',
      gender: 'Male',
      applicantPhone: '',
      applicantEmail: '',
      aadhaarNumber: '',
      panNumber: '',
      deliveryMode: service.deliveryMode,
      correctionDetails: service.category === 'correction' ? 'Name and DOB spelling correction' : '',
      instructions: service.defaultDescription,
      priority: 'Medium',
    });
    setFieldErrors({});
    setSubmitSuccess(null);
  };

  // Submit PAN Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setFieldErrors({});
    setSubmitSuccess(null);

    const cleanAadhaar = formData.aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setFieldErrors({ aadhaarNumber: 'Please enter a valid 12-digit Aadhaar number.' });
      return;
    }

    if (!formData.applicantName.trim()) {
      setFieldErrors({ applicantName: 'Applicant name is required.' });
      return;
    }

    const cleanPhone = formData.applicantPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFieldErrors({ applicantPhone: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    if (selectedService.requiresExistingPan) {
      const cleanPan = formData.panNumber.trim().toUpperCase();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
        setFieldErrors({ panNumber: 'Enter a valid 10-character PAN number (e.g. ABCDE1234F).' });
        return;
      }
    }

    setIsSubmitting(true);
    const res = await panApi.submitRequest({
      serviceType: selectedService.backendServiceType,
      applicantName: formData.applicantName.trim(),
      fatherName: formData.fatherName.trim(),
      dateOfBirth: formData.dateOfBirth.trim(),
      gender: formData.gender,
      applicantPhone: cleanPhone,
      applicantEmail: formData.applicantEmail.trim(),
      aadhaarNumber: cleanAadhaar,
      panNumber: formData.panNumber.trim().toUpperCase() || undefined,
      deliveryMode: formData.deliveryMode,
      correctionDetails: formData.correctionDetails.trim(),
      instructions: formData.instructions.trim(),
      priority: formData.priority,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      setSubmitSuccess(res.data.request.ticketNumber);
      loadRequestsAndStats();
    } else if (res.errors && res.errors.length > 0) {
      const errMap: Record<string, string> = {};
      res.errors.forEach((err) => {
        errMap[err.field] = err.message;
      });
      setFieldErrors(errMap);
    } else {
      setFieldErrors({ general: res.message || 'Submission failed. Please verify the entered details.' });
    }
  };

  // Lookup by PAN or Aadhaar
  const handleLookup = async () => {
    const clean = lookupInput.trim().toUpperCase();
    if (!clean) {
      setLookupError('Enter either a 12-digit Aadhaar number or a 10-character PAN number.');
      return;
    }
    setLookupError('');
    setIsLookingUp(true);
    const res = await panApi.getByIdentifier(clean);
    setIsLookingUp(false);

    if (res.success && res.data) {
      setLookupResult(res.data);
    } else {
      setLookupError(res.message || 'No applications found for this identifier.');
      setLookupResult(null);
    }
  };

  return (
    <div
      className="space-y-5 pb-16 max-w-[1600px] mx-auto animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* ─────────────────────────────────────────────────────────────────
          TOP HIGHLIGHT BANNER: ADMIN RESPONSE RECEIVED ON PAN REQUEST
         ───────────────────────────────────────────────────────────────── */}
      {latestAdminResponse && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-500 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  OFFICIAL ADMIN RESPONSE (PAN)
                </span>
                <span className="font-mono text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">
                  {latestAdminResponse.ticketNumber}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {latestAdminResponse.applicantName}
                </span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${STATUS_BADGES[latestAdminResponse.status] || 'bg-white'}`}>
                  {latestAdminResponse.status}
                </span>
                {latestAdminResponse.nsdlUtiiAckNumber && (
                  <span className="px-2 py-0.5 rounded bg-lime-100 text-lime-900 font-mono text-[11px] font-bold">
                    Ack No: {latestAdminResponse.nsdlUtiiAckNumber}
                  </span>
                )}
              </div>

              <div className="text-sm sm:text-base font-black text-emerald-950 flex items-start gap-1.5 pt-0.5">
                <span className="text-emerald-600 text-lg leading-none">“</span>
                <span className="leading-snug">
                  {latestAdminResponse.resolutionRemarks || `Application status updated to "${latestAdminResponse.status}" by Administrator.`}
                </span>
                <span className="text-emerald-600 text-lg leading-none">”</span>
              </div>

              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-2">
                <span>Service: <strong>{latestAdminResponse.serviceType}</strong></span>
                <span>•</span>
                <span>Updated on {new Date(latestAdminResponse.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} by Administrator</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setInspectRequest(latestAdminResponse)}
            className="px-5 py-2.5 bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>View Response Details</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TOP CONTAINER CARD: HEADER + CATEGORY FILTER PILLS + SEARCH
         ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-2 text-emerald-600 shadow-2xs">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  PAN Card Services
                </h1>
                <p className="text-sm text-slate-500 font-bold">
                  Form 49A • Correction • Reprint • Minor to Major • e-PAN & PVC Delivery
                </p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 text-sm font-semibold">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
                Category:
              </span>

              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Categories
              </button>

              <button
                onClick={() => setActiveCategory('new')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'new'
                    ? 'bg-[#15803d] text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                New PAN (49A)
              </button>

              <button
                onClick={() => setActiveCategory('correction')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === 'correction'
                    ? 'bg-[#f43f5e] text-white shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                }`}
              >
                Correction
              </button>

              <button
                onClick={() => setActiveCategory('reprint')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'reprint'
                    ? 'bg-[#eab308] text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                Reprint & PVC
              </button>

              <button
                onClick={() => setActiveCategory('linking')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'linking'
                    ? 'bg-[#00a86b] text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                Aadhaar Linking
              </button>

              <button
                onClick={() => setActiveCategory('tickets')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'tickets'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-lime-600" />
                <span>Track Requests ({stats?.total || 0})</span>
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search PAN services..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-lime-500 rounded-xl outline-hidden transition-all shadow-inner font-medium"
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('service_history')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#eab308] hover:bg-[#ca8a04] text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <List className="w-4 h-4" />
              <span>Go to list</span>
            </button>
          </div>
        </div>

        {/* ── SHELF CONTENT: VERTICAL RIBBON + GRID OF 8 SERVICE CARDS ── */}
        {activeCategory !== 'tickets' && (
          <div className="bg-white/90 rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch gap-3 transition-all hover:border-slate-300">
            {/* Left Vertical Ribbon */}
            <div className="bg-[#15803d] text-white font-black text-xs sm:text-sm tracking-widest rounded-xl px-2.5 py-3 sm:py-4 flex sm:flex-col items-center justify-center shrink-0 uppercase shadow-xs sm:w-12 min-h-[44px]">
              <span className="sm:hidden font-bold">PAN SERVICES</span>
              <span className="hidden sm:inline [writing-mode:vertical-rl] rotate-180 text-center tracking-widest font-black">
                PAN SERVICES
              </span>
            </div>

            {/* Grid of Cards */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleOpenService(service)}
                  className="group relative bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-lime-500 transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer select-none min-h-[195px] sm:min-h-[205px]"
                >
                  {/* Top-left Green Triangle Fold */}
                  <div className="corner-triangle-green" />

                  {/* Center Icon & Title */}
                  <div className="pt-4 px-2.5 pb-2.5 flex flex-col items-center text-center flex-1 justify-center">
                    <div className="transform group-hover:scale-106 transition-transform duration-200 mb-2">
                      <ServiceIcon type={service.iconType} className="w-16 h-16 sm:w-18 sm:h-18" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug tracking-tight uppercase line-clamp-2 px-1">
                      {service.name}
                    </h3>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="w-full py-2 px-1 text-center font-black text-xs sm:text-sm tracking-wide uppercase text-white bg-[#10b981] group-hover:bg-[#059669] transition-colors duration-150 rounded-b-xl">
                    {service.actionLabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LIVE PAN OR AADHAAR LOOKUP SECTION ── */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-600" />
              <span>Track PAN Applications by Aadhaar / PAN Number</span>
            </div>

            {stats && (
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg">
                  Submitted: {stats.byStatus['Submitted'] || 0}
                </span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                  In Progress: {(stats.byStatus['Under Review'] || 0) + (stats.byStatus['In Progress'] || 0)}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                  Resolved: {stats.byStatus['Resolved'] || 0}
                </span>
              </div>
            )}
          </div>

          {/* Search Input Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
            <div className="relative flex-1">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={14}
                value={lookupInput}
                onChange={(e) => {
                  setLookupInput(e.target.value.toUpperCase());
                  setLookupError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="Enter 12-digit Aadhaar or 10-char PAN"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-lime-600 outline-hidden font-mono font-bold uppercase"
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={isLookingUp}
              className="px-6 py-2.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search Status</span>
            </button>
            {lookupResult && (
              <button
                onClick={() => {
                  setLookupResult(null);
                  setLookupInput('');
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {lookupError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {lookupError}
            </div>
          )}

          {/* Lookup Results Display */}
          {lookupResult && (
            <div className="p-4 bg-lime-50/70 border-2 border-lime-300 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs sm:text-sm font-black text-lime-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-lime-700" />
                  <span>Found {lookupResult.summary.totalRequests} application(s) for "{lookupResult.identifier}"</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {Object.entries(lookupResult.summary.byStatus).map(([st, count]) => (
                    <span
                      key={st}
                      className={`px-2.5 py-0.5 rounded-full font-bold border ${STATUS_BADGES[st] || 'bg-white text-slate-700'}`}
                    >
                      {st}: {count}
                    </span>
                  ))}
                </div>
              </div>

              {lookupResult.requests.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No applications found for this identifier.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-lime-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-lime-50/80 text-lime-950 font-black uppercase border-b border-lime-100">
                      <tr>
                        <th className="py-2.5 px-3">Ticket No</th>
                        <th className="py-2.5 px-3">Applicant Name</th>
                        <th className="py-2.5 px-3">Service & Admin Response</th>
                        <th className="py-2.5 px-3">Ack Reference</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {lookupResult.requests.map((req) => (
                        <tr
                          key={req._id}
                          className={`transition-colors ${
                            req.resolutionRemarks
                              ? 'bg-emerald-50/60 hover:bg-emerald-50/90 border-l-4 border-l-emerald-500'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                            {req.ticketNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 font-bold">
                            {req.applicantName}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="text-slate-800 font-bold">{req.serviceType}</div>
                            {req.resolutionRemarks && (
                              <div className="mt-1.5 p-2 bg-emerald-100/90 border border-emerald-300 rounded-lg text-emerald-950 text-xs shadow-2xs">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                  <span className="font-black text-emerald-900 uppercase text-[9px] tracking-wider">
                                    Official Admin Response:
                                  </span>
                                </div>
                                <p className="font-black text-emerald-950 leading-relaxed">
                                  "{req.resolutionRemarks}"
                                </p>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                            {req.nsdlUtiiAckNumber || 'Pending Allotment'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                                STATUS_BADGES[req.status] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setInspectRequest(req)}
                              className="px-3 py-1 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg font-bold cursor-pointer text-xs transition-colors shadow-2xs"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── RECENT CITIZEN PAN REQUESTS TABLE ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span>Recently Submitted Citizen PAN Applications</span>
              <button
                onClick={loadRequestsAndStats}
                className="text-emerald-700 hover:underline cursor-pointer flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh Live</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Ticket Number</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Aadhaar / PAN</th>
                    <th className="py-3 px-4">Service & Admin Response</th>
                    <th className="py-3 px-4">Ack Number</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                        No PAN application tickets found. Click any service card above to apply.
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map((req) => {
                      const hasAdminResponse = !!(req.resolutionRemarks && req.resolutionRemarks.trim());

                      return (
                        <tr
                          key={req._id}
                          className={`transition-colors ${
                            hasAdminResponse
                              ? 'bg-emerald-50/50 hover:bg-emerald-50/80 border-l-4 border-l-emerald-500'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {req.ticketNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{req.applicantName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{req.applicantPhone}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            <div>{req.maskedAadhaar}</div>
                            {req.panNumber && (
                              <div className="text-emerald-700 font-bold text-[10px]">{req.maskedPan || req.panNumber}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <div className="text-slate-800 font-bold">{req.serviceType}</div>
                            {hasAdminResponse ? (
                              <div className="mt-1.5 p-2 bg-emerald-100/90 border border-emerald-300 rounded-lg text-emerald-950 font-bold text-xs flex items-start gap-1.5 shadow-2xs">
                                <span className="bg-emerald-700 text-white font-black text-[9px] uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                                  ADMIN RESPONSE
                                </span>
                                <span className="leading-tight text-emerald-950">
                                  "{req.resolutionRemarks}"
                                </span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                Awaiting admin processing
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-900">
                            {req.nsdlUtiiAckNumber ? (
                              <span className="bg-lime-50 border border-lime-200 px-2 py-0.5 rounded">
                                {req.nsdlUtiiAckNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400">---</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                                STATUS_BADGES[req.status] || 'bg-slate-50 text-slate-700'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setInspectRequest(req)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                                hasAdminResponse
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {hasAdminResponse ? 'View Response' : 'View Details'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: INTERACTIVE PAN SERVICE APPLICATION FORM
         ───────────────────────────────────────────────────────────────── */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                    {selectedService.name}
                  </h3>
                  <p className="text-xs text-emerald-200 font-medium">
                    {selectedService.backendServiceType} • Online Application Gateway
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {submitSuccess ? (
                <div className="p-6 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-emerald-950">PAN Application Submitted Successfully!</h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    Your request has been queued in the system. The operator will process and verify your Form 49A details.
                  </p>
                  <div className="p-3 bg-white border border-emerald-200 rounded-xl inline-block shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Ticket Reference Number
                    </span>
                    <span className="font-mono text-lg font-black text-emerald-900">{submitSuccess}</span>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedService(null)}
                      className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Close & Back to Services
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                  {fieldErrors.general && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{fieldErrors.general}</span>
                    </div>
                  )}

                  {/* Aadhaar Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Applicant 12-Digit Aadhaar Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={12}
                        value={formData.aadhaarNumber}
                        onChange={(e) => {
                          setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') });
                          setFieldErrors({ ...fieldErrors, aadhaarNumber: '' });
                        }}
                        placeholder="e.g. 5489 1234 5678"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono font-medium focus:border-emerald-500 outline-hidden"
                        required
                      />
                    </div>
                    {fieldErrors.aadhaarNumber && (
                      <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.aadhaarNumber}</p>
                    )}
                  </div>

                  {/* Existing PAN Number (if required) */}
                  {selectedService.requiresExistingPan && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Existing 10-Character PAN Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={10}
                          value={formData.panNumber}
                          onChange={(e) => {
                            setFormData({ ...formData, panNumber: e.target.value.toUpperCase() });
                            setFieldErrors({ ...fieldErrors, panNumber: '' });
                          }}
                          placeholder="e.g. ABCDE1234F"
                          className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase focus:border-emerald-500 outline-hidden"
                          required
                        />
                      </div>
                      {fieldErrors.panNumber && (
                        <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.panNumber}</p>
                      )}
                    </div>
                  )}

                  {/* Applicant Name & Father's Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Applicant Full Name (as on Aadhaar) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.applicantName}
                          onChange={(e) => {
                            setFormData({ ...formData, applicantName: e.target.value });
                            setFieldErrors({ ...fieldErrors, applicantName: '' });
                          }}
                          placeholder="Full Name"
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                          required
                        />
                      </div>
                      {fieldErrors.applicantName && (
                        <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.applicantName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Father's Full Name (for PAN Card print)
                      </label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        placeholder="Father's Full Name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* DOB, Gender & Delivery Mode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date of Birth (DD/MM/YYYY)
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Preference</label>
                      <select
                        value={formData.deliveryMode}
                        onChange={(e) => setFormData({ ...formData, deliveryMode: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                      >
                        <option value="Physical Card + e-PAN">Physical Card + e-PAN</option>
                        <option value="e-PAN Only">Digital e-PAN Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number (linked to Aadhaar OTP) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          maxLength={10}
                          value={formData.applicantPhone}
                          onChange={(e) => {
                            setFormData({ ...formData, applicantPhone: e.target.value.replace(/\D/g, '') });
                            setFieldErrors({ ...fieldErrors, applicantPhone: '' });
                          }}
                          placeholder="10-digit mobile"
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                          required
                        />
                      </div>
                      {fieldErrors.applicantPhone && (
                        <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.applicantPhone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address (for e-PAN PDF dispatch)
                      </label>
                      <input
                        type="email"
                        value={formData.applicantEmail}
                        onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
                        placeholder="name@email.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Correction specifics if correction */}
                  {selectedService.category === 'correction' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Specific Change / Correction Requested
                      </label>
                      <input
                        type="text"
                        value={formData.correctionDetails}
                        onChange={(e) => setFormData({ ...formData, correctionDetails: e.target.value })}
                        placeholder="e.g. Correct surname from Devi to Kumar, update DOB to 14/05/1994"
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  )}

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Processing Priority</label>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High', 'Urgent'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: lvl })}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            formData.priority === lvl
                              ? 'bg-[#15803d] text-white border-[#15803d] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: INSPECT PAN APPLICATION DETAILS & AUDIT TRAIL
         ───────────────────────────────────────────────────────────────── */}
      {inspectRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-200">{inspectRequest.ticketNumber}</span>
                <h3 className="font-bold text-base text-white">{inspectRequest.serviceType}</h3>
              </div>
              <button
                onClick={() => setInspectRequest(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Official Admin Response Box */}
              {inspectRequest.resolutionRemarks ? (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-2.5 shadow-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                        ✓
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                        Official Administrator Response
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-2xs">
                      Status: {inspectRequest.status}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white border border-emerald-200 rounded-xl text-emerald-950 font-black text-sm sm:text-base leading-relaxed shadow-2xs">
                    "{inspectRequest.resolutionRemarks}"
                  </div>

                  {inspectRequest.nsdlUtiiAckNumber && (
                    <div className="p-2 bg-lime-50 border border-lime-200 rounded-lg text-lime-900 font-mono font-bold flex items-center justify-between">
                      <span>NSDL / UTIITSL Acknowledgment No:</span>
                      <span className="text-sm font-black">{inspectRequest.nsdlUtiiAckNumber}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Updated on {new Date(inspectRequest.updatedAt).toLocaleString('en-IN')} by Administrator</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Awaiting admin processing. Official acknowledgment and dispatch remarks will be highlighted here.</span>
                </div>
              )}

              {/* Credentials Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Applicant Name</span>
                  <div className="text-sm font-bold text-slate-800">{inspectRequest.applicantName}</div>
                  <div className="text-slate-500">{inspectRequest.applicantPhone}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Identity Numbers</span>
                  <div className="text-sm font-mono font-bold text-slate-800">{inspectRequest.maskedAadhaar}</div>
                  {inspectRequest.panNumber && (
                    <div className="font-mono text-emerald-700 font-bold">{inspectRequest.panNumber}</div>
                  )}
                </div>
              </div>

              {/* Status & Delivery Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Current Status</span>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full font-bold border ${STATUS_BADGES[inspectRequest.status] || 'bg-slate-100'}`}>
                      {inspectRequest.status}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Delivery Preference</span>
                  <div className="mt-1 font-bold text-slate-800">{inspectRequest.deliveryMode}</div>
                </div>
              </div>

              {/* Instructions or Details */}
              {inspectRequest.instructions && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Application Notes</span>
                  <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                    {inspectRequest.instructions}
                  </div>
                </div>
              )}

              {/* Audit Trail */}
              {inspectRequest.auditLog && inspectRequest.auditLog.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Audit History Timeline</span>
                  <div className="space-y-2 mt-2">
                    {[...inspectRequest.auditLog].reverse().map((entry, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-lime-600 mt-1 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800">{entry.action}</div>
                          {entry.remarks && (
                            <div className="text-emerald-800 font-bold text-xs mt-0.5">
                              "{entry.remarks}"
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            By {entry.performedByName} • {new Date(entry.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 text-right">
                <button
                  onClick={() => setInspectRequest(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

