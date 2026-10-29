import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Send,
  Loader2,
  RotateCcw,
  User,
  Phone,
  Fingerprint,
  MessageSquare,
  List,
  Plus,
  Trash2,
  QrCode,
  FileText,
  Building,
} from 'lucide-react';
import { ServiceIcon } from './ServiceIcon';
import { useApp } from '../context/AppContext';
import { paymentApi } from '../services/paymentApi';
import confetti from 'canvas-confetti';
import {
  rationApi,
  RationRequest,
  RationStatsResponse,
  FamilyMember,
} from '../services/rationApi';

// ─────────────────────────────────────────────────────────────────────────────
//  Ration Service Cards Definitions (TNPDS - e-Sevai reference portal)
// ─────────────────────────────────────────────────────────────────────────────

interface RationServiceCard {
  id: string;
  name: string;
  actionLabel: string;
  category: 'new' | 'members' | 'corrections' | 'download';
  iconType: string;
  cornerColor: 'green';
  actionColor: 'green';
  backendServiceType: string;
  defaultDescription: string;
  requiresExistingCard: boolean;
}

const TN_DISTRICTS = [
  'Salem', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli',
  'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
  'Thanjavur', 'Kanchipuram', 'Cuddalore', 'Tiruppur', 'Villupuram',
  'Namakkal', 'Karur', 'Krishnagiri', 'Dharmapuri', 'Pudukkottai',
  'Ramanathapuram', 'Sivaganga', 'Theni', 'Virudhunagar', 'Nagapattinam',
  'Ariyalur', 'Chengalpattu', 'Kallakurichi', 'Ranipet', 'Tenkasi',
  'Tirupattur', 'Tiruvallur', 'Tiruvarur', 'Nilgiris', 'Mayiladuthurai'
];

const CARD_TYPES = [
  'PHH - Priority Household (Rice)',
  'PHH-AAY - Antyodaya Anna Yojana',
  'NPHH - Non-Priority (Rice)',
  'NPHH-S - Non-Priority (Sugar)',
  'NPHH-NC - No Commodity',
];

const RATION_SERVICES: RationServiceCard[] = [
  {
    id: 'new-smartcard-app',
    name: 'NEW SMART CARD APPLICATION',
    actionLabel: 'APPLY ONLINE',
    category: 'new',
    iconType: 'leaf-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'New Smart Card Application',
    defaultDescription: 'Application for first-time issuance of new digital Smart Family Card in Tamil Nadu Civil Supplies.',
    requiresExistingCard: false,
  },
  {
    id: 'add-family-member',
    name: 'ADD FAMILY MEMBER (உறுப்பினர் சேர்க்க)',
    actionLabel: 'ADD MEMBER',
    category: 'members',
    iconType: 'smartcard',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Add Family Member',
    defaultDescription: 'Include newborn child, spouse, or family member into existing smart ration card with Birth Certificate or Aadhaar.',
    requiresExistingCard: true,
  },
  {
    id: 'remove-family-member',
    name: 'REMOVE / DELETE MEMBER (உறுப்பினர் நீக்க)',
    actionLabel: 'DELETE',
    category: 'members',
    iconType: 'smartcard',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Remove / Delete Family Member',
    defaultDescription: 'Surrender or deletion of family member name due to marriage, separate card creation, or demise.',
    requiresExistingCard: true,
  },
  {
    id: 'ration-family-head',
    name: 'FAMILY HEAD CHANGE (WITHOUT OTP)',
    actionLabel: 'WITHOUT OTP',
    category: 'corrections',
    iconType: 'leaf-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Change of Family Head',
    defaultDescription: 'Transfer head of family designation to senior female or male family member without requiring OTP.',
    requiresExistingCard: true,
  },
  {
    id: 'ration-mobile-link',
    name: 'NEW MOBILE NUMBER LINK (NO OTP)',
    actionLabel: 'WITHOUT OTP',
    category: 'corrections',
    iconType: 'leaf-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Mobile Number Update / Link',
    defaultDescription: 'Direct portal linking and updating of 10-digit mobile number for ration SMS notifications and OTP delivery.',
    requiresExistingCard: true,
  },
  {
    id: 'address-fps-change',
    name: 'CHANGE OF ADDRESS & FPS (முகவரி)',
    actionLabel: 'TRANSFER',
    category: 'corrections',
    iconType: 'smartcard',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Change of Address / FPS',
    defaultDescription: 'Transfer enrollment and Fair Price Shop (FPS) allocation due to shifting of residence across wards or taluks.',
    requiresExistingCard: true,
  },
  {
    id: 'ration-qr-code',
    name: 'QR CODE & SMART CARD DOWNLOAD',
    actionLabel: 'INSTANT DOWNLOAD',
    category: 'download',
    iconType: 'qr-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Smart Card QR Code & Download',
    defaultDescription: 'Generate official barcode & QR code PDF print slip for instant smart card duplicate verification.',
    requiresExistingCard: true,
  },
  {
    id: 'card-type-conversion',
    name: 'CARD COMMODITY CONVERSION',
    actionLabel: 'CONVERSION',
    category: 'corrections',
    iconType: 'leaf-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Card Type Conversion',
    defaultDescription: 'Convert commodity preference from Sugar Card (NPHH-S) to Rice Card (PHH/NPHH) or No Commodity card.',
    requiresExistingCard: true,
  },
];

const STATUS_BADGES: Record<string, string> = {
  'Submitted':            'bg-sky-50 text-sky-800 border-sky-200',
  'Under Review':         'bg-purple-50 text-purple-800 border-purple-200',
  'In Progress':          'bg-amber-50 text-amber-800 border-amber-200',
  'Pending Verification': 'bg-orange-50 text-orange-800 border-orange-200',
  'Resolved':             'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Rejected':             'bg-rose-50 text-rose-800 border-rose-200',
  'Closed':               'bg-slate-50 text-slate-700 border-slate-200',
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Ration Services View Component
// ─────────────────────────────────────────────────────────────────────────────
export const RationServicesView: React.FC = () => {
  const { setActiveTab, getServicePrice, openPaymentDialog, addApplication } = useApp();

  // State
  const [activeCategory, setActiveCategory] = useState<'all' | 'new' | 'members' | 'corrections' | 'download' | 'tickets'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<RationServiceCard | null>(null);
  const [inspectRequest, setInspectRequest] = useState<RationRequest | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    rationCardNumber: '',
    cardType: 'PHH - Priority Household (Rice)',
    applicantName: '',
    relativeName: '',
    relationType: 'Husband',
    gender: 'Female',
    dateOfBirth: '',
    applicantPhone: '',
    applicantEmail: '',
    aadhaarNumber: '',
    district: 'Salem',
    taluk: '',
    villageOrWard: '',
    fpsCode: '',
    newAddress: '',
    correctionDetails: '',
    remarksOrNotes: '',
    priority: 'Medium',
  });

  // Dynamic Members State (for Add/Remove member)
  const [membersList, setMembersList] = useState<FamilyMember[]>([
    { name: '', relation: 'Son', gender: 'Male', dateOfBirth: '', aadhaarNumber: '' }
  ]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Live Requests & Stats
  const [recentRequests, setRecentRequests] = useState<RationRequest[]>([]);
  const [stats, setStats] = useState<RationStatsResponse | null>(null);

  // Lookup / Tracking bar
  const [lookupInput, setLookupInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    identifier: string;
    summary: { totalRequests: number; byStatus: Record<string, number> };
    requests: RationRequest[];
  } | null>(null);
  const [lookupError, setLookupError] = useState('');

  // Latest Admin Response Banner
  const [latestAdminResponse, setLatestAdminResponse] = useState<RationRequest | null>(null);

  // Fetch Requests and Stats
  const loadRequestsAndStats = useCallback(async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        rationApi.listRequests({ limit: 15 }),
        rationApi.getStats(),
      ]);

      if (listRes.success && Array.isArray(listRes.data)) {
        setRecentRequests(listRes.data);

        // Find the latest request that has an official admin response
        const withResponse = listRes.data.find(
          (r: RationRequest) => r.resolutionRemarks && r.resolutionRemarks.trim().length > 0
        );
        if (withResponse) {
          setLatestAdminResponse(withResponse);
        }
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch {
      // Ignore background fetch error
    }
  }, []);

  useEffect(() => {
    loadRequestsAndStats();
    const interval = setInterval(loadRequestsAndStats, 8000);
    return () => clearInterval(interval);
  }, [loadRequestsAndStats]);

  // Filter service cards
  const filteredServices = RATION_SERVICES.filter((service) => {
    const matchesCategory =
      activeCategory === 'all' ||
      activeCategory === 'tickets' ||
      service.category === activeCategory;

    const matchesSearch =
      !searchTerm ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.defaultDescription.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Open modal
  const handleOpenService = (service: RationServiceCard) => {
    setSelectedService(service);
    setSubmitSuccess(null);
    setFieldErrors({});
    setFormData({
      rationCardNumber: '',
      cardType: 'PHH - Priority Household (Rice)',
      applicantName: '',
      relativeName: '',
      relationType: 'Husband',
      gender: 'Female',
      dateOfBirth: '',
      applicantPhone: '',
      applicantEmail: '',
      aadhaarNumber: '',
      district: 'Salem',
      taluk: '',
      villageOrWard: '',
      fpsCode: '',
      newAddress: '',
      correctionDetails: '',
      remarksOrNotes: service.defaultDescription,
      priority: 'Medium',
    });
    setMembersList([
      { name: '', relation: 'Son', gender: 'Male', dateOfBirth: '', aadhaarNumber: '' }
    ]);
  };

  // Add Member Row
  const handleAddMemberRow = () => {
    setMembersList([
      ...membersList,
      { name: '', relation: 'Daughter', gender: 'Female', dateOfBirth: '', aadhaarNumber: '' }
    ]);
  };

  // Remove Member Row
  const handleRemoveMemberRow = (index: number) => {
    if (membersList.length > 1) {
      setMembersList(membersList.filter((_, idx) => idx !== index));
    }
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const errors: Record<string, string> = {};

    if (!formData.applicantName.trim()) {
      errors.applicantName = 'Applicant full name is required.';
    }

    const cleanPhone = formData.applicantPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errors.applicantPhone = 'Please provide a valid 10-digit mobile number.';
    }

    if (selectedService.requiresExistingCard && !formData.rationCardNumber.trim()) {
      errors.rationCardNumber = 'Smart Ration Card Number is required for this service.';
    }

    if (formData.aadhaarNumber && formData.aadhaarNumber.replace(/\D/g, '').length !== 12) {
      errors.aadhaarNumber = 'Aadhaar must be exactly 12 digits.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    const fee = getServicePrice(selectedService.id);

    // Prompt UPI QR payment modal before completing submission
    openPaymentDialog({
      serviceName: selectedService.name,
      categoryLabel: 'RATION SERVICES',
      amount: fee,
      applicantName: formData.applicantName.trim(),
      applicantPhone: cleanPhone,
      onConfirmed: async (paymentDetails) => {
        setIsSubmitting(true);
        setFieldErrors({});

        const ticketNum = `RAT-${Date.now()}`;

        // Immediately add to local & history storage (which triggers bilingual confirmation modal instantly!)
        addApplication({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          applicantName: formData.applicantName.trim(),
          mobile: cleanPhone,
          status: 'Under Review',
          fee,
          walletType: 'payments',
          details: {
            ...formData,
            ticketNumber: ticketNum,
          },
          remarks: `Payment of ₹${paymentDetails.paidAmount} submitted with UTR: ${paymentDetails.utrNumber}. Admin will approve soon and contact you.`,
          paidAmount: paymentDetails.paidAmount,
          utrNumber: paymentDetails.utrNumber,
          upiIdUsed: paymentDetails.upiIdUsed,
          paymentScreenshot: paymentDetails.paymentScreenshot,
          paymentMethod: 'UPI QR',
          paymentStatus: 'Pending Verification',
          paymentDate: new Date().toISOString(),
        });

        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setSubmitSuccess(ticketNum);

        try {
          const validMembers = membersList.filter((m) => m.name.trim().length > 0);

          const res = await rationApi.submitRequest({
            serviceType: selectedService.backendServiceType,
            rationCardNumber: formData.rationCardNumber.trim().toUpperCase(),
            cardType: formData.cardType,
            applicantName: formData.applicantName.trim(),
            relativeName: formData.relativeName.trim(),
            relationType: formData.relationType,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            applicantPhone: cleanPhone,
            applicantEmail: formData.applicantEmail.trim(),
            aadhaarNumber: formData.aadhaarNumber.replace(/\D/g, ''),
            district: formData.district,
            taluk: formData.taluk.trim(),
            villageOrWard: formData.villageOrWard.trim(),
            fpsCode: formData.fpsCode.trim(),
            newAddress: formData.newAddress.trim(),
            members: selectedService.category === 'members' ? validMembers : [],
            correctionDetails: formData.correctionDetails.trim(),
            remarksOrNotes: formData.remarksOrNotes.trim(),
            priority: formData.priority,
          });

          const finalTicket = res.success && res.ticketNumber ? res.ticketNumber : ticketNum;

          // Record payment in payments DB & localStorage
          await paymentApi.submitPayment({
            ticketNumber: finalTicket,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            category: 'Ration',
            applicantName: formData.applicantName.trim(),
            applicantPhone: cleanPhone,
            amount: paymentDetails.paidAmount,
            utrNumber: paymentDetails.utrNumber,
            upiIdUsed: paymentDetails.upiIdUsed,
            paymentScreenshot: paymentDetails.paymentScreenshot,
            paymentMethod: 'UPI QR',
            status: 'Pending Verification',
          });

          await loadRequestsAndStats();
        } catch (err: any) {
          console.warn('Backend sync in background:', err);
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  // Live Identifier Lookup
  const handleLookup = async () => {
    if (!lookupInput.trim()) {
      setLookupError('Please enter a Ration Card Number, Aadhaar Number, or Mobile.');
      return;
    }

    setIsLookingUp(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const res = await rationApi.lookupByIdentifier(lookupInput.trim());
      if (res.success && Array.isArray(res.data)) {
        setLookupResult({
          identifier: lookupInput.trim().toUpperCase(),
          summary: {
            totalRequests: res.data.length,
            byStatus: res.data.reduce((acc: Record<string, number>, r: RationRequest) => {
              acc[r.status] = (acc[r.status] || 0) + 1;
              return acc;
            }, {}),
          },
          requests: res.data,
        });
      } else {
        setLookupError(res.message || 'No applications found.');
      }
    } catch (err: any) {
      setLookupError(err.message || 'Lookup failed.');
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─────────────────────────────────────────────────────────────────
          ADMIN RESPONSE HIGHLIGHT BANNER (LATEST UPDATES FROM OPERATOR)
         ───────────────────────────────────────────────────────────────── */}
      {latestAdminResponse && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  OFFICIAL TNPDS RESPONSE RECEIVED
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
                {latestAdminResponse.tnpdsAckNumber && (
                  <span className="px-2 py-0.5 rounded bg-lime-100 text-lime-900 font-mono text-[11px] font-bold">
                    Ack No: {latestAdminResponse.tnpdsAckNumber}
                  </span>
                )}
              </div>

              <div className="text-sm sm:text-base font-black text-emerald-950 flex items-start gap-1.5 pt-0.5">
                <span className="text-emerald-600 text-lg leading-none">“</span>
                <span className="leading-snug">
                  {latestAdminResponse.resolutionRemarks || `Application status updated to "${latestAdminResponse.status}" by Civil Supplies Officer.`}
                </span>
                <span className="text-emerald-600 text-lg leading-none">”</span>
              </div>

              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-2 mt-1">
                <span>Service: <strong>{latestAdminResponse.serviceType}</strong></span>
                <span>•</span>
                <span>Updated: {new Date(latestAdminResponse.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setInspectRequest(latestAdminResponse)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
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
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  TN Ration Card Services (TNPDS)
                </h1>
                <p className="text-sm text-slate-500 font-bold">
                  New Smart Card • Member Addition & Removal • Head Change • Address & Mobile Update (Without OTP)
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
                New Smart Card
              </button>

              <button
                onClick={() => setActiveCategory('members')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === 'members'
                    ? 'bg-[#00a86b] text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                Family Members (Add/Remove)
              </button>

              <button
                onClick={() => setActiveCategory('corrections')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'corrections'
                    ? 'bg-[#eab308] text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                Head Change & Mobile Link
              </button>

              <button
                onClick={() => setActiveCategory('download')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'download'
                    ? 'bg-[#15803d] text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                QR Code & Download
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
                placeholder="Search Ration services..."
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
              <span className="sm:hidden font-bold">RATION SERVICES</span>
              <span className="hidden sm:inline [writing-mode:vertical-rl] rotate-180 text-center tracking-widest font-black">
                RATION SERVICES
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

        {/* ── LIVE RATION CARD / AADHAAR LOOKUP SECTION ── */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-600" />
              <span>Track Ration Applications by Smart Card Number / Aadhaar / Mobile</span>
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
              <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={16}
                value={lookupInput}
                onChange={(e) => {
                  setLookupInput(e.target.value.toUpperCase());
                  setLookupError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="Enter 12-digit Ration Card No or Aadhaar No"
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
                        <th className="py-2.5 px-3">Applicant / Head</th>
                        <th className="py-2.5 px-3">Service & Admin Response</th>
                        <th className="py-2.5 px-3">TNPDS Ref No</th>
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
                            <div className="text-[11px] text-slate-400 font-mono">{req.applicantPhone}</div>
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
                            {req.tnpdsAckNumber || 'Pending TNPDS Processing'}
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

          {/* ── RECENT CITIZEN RATION REQUESTS TABLE ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span>Recently Submitted Citizen Ration Card Applications</span>
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
                    <th className="py-3 px-4">Applicant / Head</th>
                    <th className="py-3 px-4">Smart Card / Aadhaar</th>
                    <th className="py-3 px-4">Service & Admin Response</th>
                    <th className="py-3 px-4">TNPDS Ref Number</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                        No Ration application tickets found. Click any service card above to apply.
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
                            {req.rationCardNumber && (
                              <div className="text-emerald-800 font-bold text-xs">{req.rationCardNumber}</div>
                            )}
                            {req.maskedAadhaar && (
                              <div className="text-slate-400 text-[10px]">{req.maskedAadhaar}</div>
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
                                Awaiting Civil Supplies review
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-900">
                            {req.tnpdsAckNumber ? (
                              <span className="bg-lime-50 border border-lime-200 px-2 py-0.5 rounded">
                                {req.tnpdsAckNumber}
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
          MODAL: INTERACTIVE RATION SERVICE APPLICATION FORM
         ───────────────────────────────────────────────────────────────── */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                    {selectedService.name}
                  </h3>
                  <p className="text-xs text-emerald-200 font-medium">
                    Tamil Nadu Public Distribution System (TNPDS) • e-Sevai Online Submission
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
                  <h4 className="text-lg font-black text-emerald-950">Ration Application Submitted Successfully!</h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    Your request has been queued in the system. The Civil Supplies operator will verify your details and issue the TNPDS reference.
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

                  {/* Existing Ration Card Number (if required) */}
                  {selectedService.requiresExistingCard && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        12-Digit Smart Ration Card Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={16}
                          value={formData.rationCardNumber}
                          onChange={(e) => {
                            setFormData({ ...formData, rationCardNumber: e.target.value.toUpperCase() });
                            setFieldErrors({ ...fieldErrors, rationCardNumber: '' });
                          }}
                          placeholder="e.g. 33/W/0123456 or 12-digit number"
                          className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase focus:border-emerald-500 outline-hidden"
                          required
                        />
                      </div>
                      {fieldErrors.rationCardNumber && (
                        <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.rationCardNumber}</p>
                      )}
                    </div>
                  )}

                  {/* Commodity Card Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Family Card Commodity Type
                    </label>
                    <select
                      value={formData.cardType}
                      onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:border-emerald-500 outline-hidden bg-white text-slate-800"
                    >
                      {CARD_TYPES.map((ct) => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>

                  {/* Applicant Name & Relative Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Applicant / Family Head Full Name <span className="text-red-500">*</span>
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
                          placeholder="Full Name as on Aadhaar"
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
                        Father / Husband Name
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.relationType}
                          onChange={(e) => setFormData({ ...formData, relationType: e.target.value })}
                          className="px-2 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-700 outline-none"
                        >
                          <option value="Husband">Husband</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Wife">Wife</option>
                        </select>
                        <input
                          type="text"
                          value={formData.relativeName}
                          onChange={(e) => setFormData({ ...formData, relativeName: e.target.value })}
                          placeholder="Relative's Name"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DOB, Gender & Aadhaar */}
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden bg-white"
                      >
                        <option value="Female">Female (Preferred Family Head)</option>
                        <option value="Male">Male</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Head 12-Digit Aadhaar
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
                          placeholder="12-digit Aadhaar"
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-medium focus:border-emerald-500 outline-hidden"
                        />
                      </div>
                      {fieldErrors.aadhaarNumber && (
                        <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.aadhaarNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contact Mobile Number <span className="text-red-500">*</span>
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
                        Email Address (optional)
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

                  {/* District & Taluk */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                      <select
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden bg-white text-slate-800"
                      >
                        {TN_DISTRICTS.map((dst) => (
                          <option key={dst} value={dst}>{dst}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Taluk</label>
                      <input
                        type="text"
                        value={formData.taluk}
                        onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                        placeholder="e.g. Salem West / Omalur"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Fair Price Shop (FPS) Code</label>
                      <input
                        type="text"
                        value={formData.fpsCode}
                        onChange={(e) => setFormData({ ...formData, fpsCode: e.target.value })}
                        placeholder="e.g. 08AA012 (Optional)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-medium focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Add Family Members Section (if category is members) */}
                  {selectedService.category === 'members' && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Member Details to Add / Remove</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleAddMemberRow}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add More</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {membersList.map((mem, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 border border-slate-200 rounded-lg">
                            <input
                              type="text"
                              value={mem.name}
                              onChange={(e) => {
                                const copy = [...membersList];
                                copy[idx].name = e.target.value;
                                setMembersList(copy);
                              }}
                              placeholder="Member Name"
                              className="w-full sm:flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs font-medium focus:border-emerald-500 outline-none"
                            />
                            <select
                              value={mem.relation}
                              onChange={(e) => {
                                const copy = [...membersList];
                                copy[idx].relation = e.target.value;
                                setMembersList(copy);
                              }}
                              className="w-full sm:w-28 px-2 py-1.5 border border-slate-200 rounded text-xs font-medium bg-white"
                            >
                              <option value="Son">Son</option>
                              <option value="Daughter">Daughter</option>
                              <option value="Husband">Husband</option>
                              <option value="Wife">Wife</option>
                              <option value="Mother">Mother</option>
                              <option value="Father">Father</option>
                              <option value="Other">Other</option>
                            </select>
                            <input
                              type="text"
                              maxLength={12}
                              value={mem.aadhaarNumber}
                              onChange={(e) => {
                                const copy = [...membersList];
                                copy[idx].aadhaarNumber = e.target.value.replace(/\D/g, '');
                                setMembersList(copy);
                              }}
                              placeholder="12-digit Aadhaar"
                              className="w-full sm:w-32 px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono font-medium focus:border-emerald-500 outline-none"
                            />
                            {membersList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMemberRow(idx)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Change of Address Section */}
                  {selectedService.id === 'address-fps-change' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        New Residential Address (Door No, Street, Landmark, Pincode) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.newAddress}
                        onChange={(e) => setFormData({ ...formData, newAddress: e.target.value })}
                        placeholder="Enter full new residential address for shop transfer"
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                        required
                      />
                    </div>
                  )}

                  {/* Correction specifics */}
                  {selectedService.category === 'corrections' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Specific Change / Modification Note
                      </label>
                      <input
                        type="text"
                        value={formData.correctionDetails}
                        onChange={(e) => setFormData({ ...formData, correctionDetails: e.target.value })}
                        placeholder="e.g. Change family head from deceased husband to wife, or new mobile link"
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
          MODAL: INSPECT RATION APPLICATION DETAILS & AUDIT TRAIL
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
                        Official TNPDS Response
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-2xs">
                      Status: {inspectRequest.status}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white border border-emerald-200 rounded-xl text-emerald-950 font-black text-sm sm:text-base leading-relaxed shadow-2xs">
                    "{inspectRequest.resolutionRemarks}"
                  </div>

                  {inspectRequest.tnpdsAckNumber && (
                    <div className="p-2 bg-lime-50 border border-lime-200 rounded-lg text-lime-900 font-mono font-bold flex items-center justify-between">
                      <span>TNPDS Reference Number:</span>
                      <span className="text-sm font-black">{inspectRequest.tnpdsAckNumber}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Updated on {new Date(inspectRequest.updatedAt).toLocaleString('en-IN')} by Civil Supplies Officer</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Awaiting Civil Supplies review. Official TNPDS reference number and status remarks will be highlighted here.</span>
                </div>
              )}

              {/* Credentials Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Applicant / Head</span>
                  <div className="text-sm font-bold text-slate-800">{inspectRequest.applicantName}</div>
                  <div className="text-slate-500">{inspectRequest.applicantPhone}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Identity Details</span>
                  <div className="text-sm font-mono font-bold text-emerald-800">
                    {inspectRequest.rationCardNumber || 'New Registration'}
                  </div>
                  {inspectRequest.maskedAadhaar && (
                    <div className="text-slate-400 text-xs font-mono">{inspectRequest.maskedAadhaar}</div>
                  )}
                </div>
              </div>

              {/* Commodity Type & FPS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Card Commodity Type</span>
                  <div className="font-bold text-slate-800">{inspectRequest.cardType || 'PHH - Priority Household'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">District & Shop</span>
                  <div className="font-bold text-slate-800">{inspectRequest.district || 'Salem'} • {inspectRequest.fpsCode || 'General FPS'}</div>
                </div>
              </div>

              {/* Specific notes / Member lists */}
              {inspectRequest.members && inspectRequest.members.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Family Members Enrolled ({inspectRequest.members.length})</span>
                  <div className="space-y-1.5 mt-1">
                    {inspectRequest.members.map((m, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{m.name} ({m.relation})</span>
                        <span className="font-mono text-slate-500">{m.aadhaarNumber ? `Aadhaar: ${m.aadhaarNumber}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Shifting Note */}
              {inspectRequest.newAddress && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">New Address for Shifting</span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-800 font-medium mt-1">
                    {inspectRequest.newAddress}
                  </div>
                </div>
              )}

              {/* Audit History Timeline */}
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

