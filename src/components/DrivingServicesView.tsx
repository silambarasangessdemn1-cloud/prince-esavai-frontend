import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
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
  Car,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { ServiceIcon } from './ServiceIcon';
import { useApp } from '../context/AppContext';
import {
  drivingApi,
  DrivingRequest,
  DrivingStatsResponse,
} from '../services/drivingApi';

// ─────────────────────────────────────────────────────────────────────────────
//  Driving Service Cards Definitions (Sarathi Parivahan / MoRTH / RTO)
// ─────────────────────────────────────────────────────────────────────────────

interface DrivingServiceCard {
  id: string;
  name: string;
  actionLabel: string;
  category: 'll' | 'dl' | 'renewal' | 'download';
  iconType: string;
  cornerColor: 'green';
  actionColor: 'green';
  backendServiceType: string;
  defaultDescription: string;
  requiresExistingDl: boolean;
}

const TN_RTO_OFFICES = [
  'TN-54 Salem South', 'TN-30 Salem West', 'TN-27 Salem Central', 'TN-77 Attur', 'TN-90 Salem East', 'TN-93 Mettur',
  'TN-01 Chennai Central', 'TN-02 Chennai North', 'TN-03 Chennai North-East', 'TN-04 Chennai East', 'TN-05 Chennai North-West',
  'TN-07 Chennai South', 'TN-09 Chennai West', 'TN-10 Chennai South-West', 'TN-11 Tambaram', 'TN-14 Sholinganallur',
  'TN-18 Red Hills', 'TN-19 Chengalpattu', 'TN-20 Tiruvallur', 'TN-21 Kanchipuram', 'TN-23 Vellore', 'TN-24 Krishnagiri',
  'TN-25 Tiruvannamalai', 'TN-28 Namakkal North', 'TN-29 Dharmapuri', 'TN-31 Cuddalore', 'TN-32 Villupuram',
  'TN-33 Erode', 'TN-34 Tiruchengode', 'TN-37 Coimbatore South', 'TN-38 Coimbatore North', 'TN-39 Tiruppur North',
  'TN-41 Pollachi', 'TN-42 Tiruppur South', 'TN-43 Ooty', 'TN-45 Tiruchirappalli West', 'TN-47 Karur', 'TN-49 Thanjavur',
  'TN-50 Tiruvarur', 'TN-51 Nagapattinam', 'TN-55 Pudukkottai', 'TN-57 Dindigul', 'TN-58 Madurai South', 'TN-59 Madurai North',
  'TN-60 Theni', 'TN-65 Ramanathapuram', 'TN-67 Virudhunagar', 'TN-69 Thoothukudi', 'TN-70 Hosur', 'TN-72 Tirunelveli',
  'TN-74 Nagercoil', 'TN-76 Tenkasi', 'TN-82 Mayiladuthurai', 'TN-86 Erode West'
];

const VEHICLE_CLASSES = [
  'MCWG + LMV (Two Wheeler + Four Wheeler)',
  'MCWG - Motorcycle With Gear',
  'MCWOG - Motorcycle Without Gear (Scooter)',
  'LMV - Light Motor Vehicle (Car/Jeep)',
  'TRANS - Transport / Commercial Vehicle',
  'Other Class',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

const DRIVING_SERVICES: DrivingServiceCard[] = [
  {
    id: 'learner-license-ll',
    name: 'LEARNER LICENSE (LL) ONLINE',
    actionLabel: 'APPLY ONLINE',
    category: 'll',
    iconType: 'dl',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Learner License Application (LL)',
    defaultDescription: 'Form 2 application for fresh Learner License with Aadhaar e-KYC and online computer test slot.',
    requiresExistingDl: false,
  },
  {
    id: 'permanent-dl-apply',
    name: 'PERMANENT DRIVING LICENSE (DL)',
    actionLabel: 'BOOK SLOT',
    category: 'dl',
    iconType: 'dl',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Permanent Driving License (DL)',
    defaultDescription: 'Form 4 application for permanent driving license against valid Learner License with RTO driving test slot.',
    requiresExistingDl: false,
  },
  {
    id: 'dl-renewal-expiry',
    name: 'DL RENEWAL / EXTENSION',
    actionLabel: 'RENEWAL',
    category: 'renewal',
    iconType: 'dl',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'DL Renewal / Expiry Extension',
    defaultDescription: 'Form 9 renewal of expired non-transport or transport license with Form 1A self medical declaration.',
    requiresExistingDl: true,
  },
  {
    id: 'duplicate-dl-reissue',
    name: 'DUPLICATE DRIVING LICENSE',
    actionLabel: 'RE-ISSUE',
    category: 'renewal',
    iconType: 'dl',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Duplicate Driving License',
    defaultDescription: 'Re-issue of lost, stolen, damaged, or mutilated original Driving License smart card.',
    requiresExistingDl: true,
  },
  {
    id: 'change-address-dl',
    name: 'CHANGE OF ADDRESS IN DL',
    actionLabel: 'UPDATE',
    category: 'renewal',
    iconType: 'dl',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Change of Address in DL',
    defaultDescription: 'Transfer RTO endorsement and update residential address in Sarathi Parivahan national database.',
    requiresExistingDl: true,
  },
  {
    id: 'link-mobile-dl',
    name: 'LINK MOBILE NUMBER TO DL (NO OTP)',
    actionLabel: 'WITHOUT OTP',
    category: 'renewal',
    iconType: 'phone-dl',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Mobile Number Link & Update',
    defaultDescription: 'Link 10-digit mobile number in Sarathi Parivahan for DigiLocker sync, mParivahan, and traffic SMS alerts.',
    requiresExistingDl: true,
  },
  {
    id: 'download-digital-dl-pvc',
    name: 'DOWNLOAD DIGITAL DL & PVC FILE',
    actionLabel: 'INSTANT DOWNLOAD',
    category: 'download',
    iconType: 'dl',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Download Digital DL & PVC File',
    defaultDescription: 'Instant download of official Sarathi DL PDF copy and HD UV-print PVC layout with QR verification barcode.',
    requiresExistingDl: true,
  },
  {
    id: 'find-lost-dl-number',
    name: 'FIND LOST DL NUMBER',
    actionLabel: 'SEARCH',
    category: 'download',
    iconType: 'find-card',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Find Lost DL Number',
    defaultDescription: 'Search lost driving license number using full name, date of birth, state, and RTO office verification.',
    requiresExistingDl: false,
  },
];

const STATUS_BADGES: Record<string, string> = {
  'Submitted':            'bg-sky-50 text-sky-800 border-sky-200',
  'Under Review':         'bg-purple-50 text-purple-800 border-purple-200',
  'In Progress':          'bg-amber-50 text-amber-800 border-amber-200',
  'RTO Slot Booked':      'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold',
  'Pending Verification': 'bg-orange-50 text-orange-800 border-orange-200',
  'Resolved':             'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
  'Rejected':             'bg-rose-50 text-rose-800 border-rose-200',
  'Closed':               'bg-slate-50 text-slate-700 border-slate-200',
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Driving Services View Component
// ─────────────────────────────────────────────────────────────────────────────
export const DrivingServicesView: React.FC = () => {
  const { setActiveTab } = useApp();

  // State
  const [activeCategory, setActiveCategory] = useState<'all' | 'll' | 'dl' | 'renewal' | 'download' | 'tickets'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<DrivingServiceCard | null>(null);
  const [inspectRequest, setInspectRequest] = useState<DrivingRequest | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    drivingLicenseNumber: '',
    learnerLicenseNumber: '',
    vehicleClass: 'MCWG + LMV (Two Wheeler + Four Wheeler)',
    applicantName: '',
    relativeName: '',
    relationType: 'Father',
    gender: 'Male',
    dateOfBirth: '',
    bloodGroup: 'O+',
    applicantPhone: '',
    applicantEmail: '',
    aadhaarNumber: '',
    rtoOffice: 'TN-54 Salem South',
    newAddress: '',
    correctionDetails: '',
    remarksOrNotes: '',
    priority: 'Medium',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Live Requests & Stats
  const [recentRequests, setRecentRequests] = useState<DrivingRequest[]>([]);
  const [stats, setStats] = useState<DrivingStatsResponse | null>(null);

  // Lookup / Tracking bar
  const [lookupInput, setLookupInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    identifier: string;
    summary: { totalRequests: number; byStatus: Record<string, number> };
    requests: DrivingRequest[];
  } | null>(null);
  const [lookupError, setLookupError] = useState('');

  // Latest Admin Response Banner
  const [latestAdminResponse, setLatestAdminResponse] = useState<DrivingRequest | null>(null);

  // Fetch Requests and Stats
  const loadRequestsAndStats = useCallback(async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        drivingApi.listRequests({ limit: 15 }),
        drivingApi.getStats(),
      ]);

      if (listRes.success && Array.isArray(listRes.data)) {
        setRecentRequests(listRes.data);

        // Find the latest request that has an official admin response
        const withResponse = listRes.data.find(
          (r: DrivingRequest) => r.resolutionRemarks && r.resolutionRemarks.trim().length > 0
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
  const filteredServices = DRIVING_SERVICES.filter((service) => {
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
  const handleOpenService = (service: DrivingServiceCard) => {
    setSelectedService(service);
    setSubmitSuccess(null);
    setFieldErrors({});
    setFormData({
      drivingLicenseNumber: '',
      learnerLicenseNumber: '',
      vehicleClass: 'MCWG + LMV (Two Wheeler + Four Wheeler)',
      applicantName: '',
      relativeName: '',
      relationType: 'Father',
      gender: 'Male',
      dateOfBirth: '',
      bloodGroup: 'O+',
      applicantPhone: '',
      applicantEmail: '',
      aadhaarNumber: '',
      rtoOffice: 'TN-54 Salem South',
      newAddress: '',
      correctionDetails: '',
      remarksOrNotes: service.defaultDescription,
      priority: 'Medium',
    });
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

    if (selectedService.requiresExistingDl && !formData.drivingLicenseNumber.trim()) {
      errors.drivingLicenseNumber = 'Driving License Number is required for this service.';
    }

    if (formData.aadhaarNumber && formData.aadhaarNumber.replace(/\D/g, '').length !== 12) {
      errors.aadhaarNumber = 'Aadhaar must be exactly 12 digits.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const res = await drivingApi.submitRequest({
        serviceType: selectedService.backendServiceType,
        drivingLicenseNumber: formData.drivingLicenseNumber.trim().toUpperCase(),
        learnerLicenseNumber: formData.learnerLicenseNumber.trim().toUpperCase(),
        vehicleClass: formData.vehicleClass,
        applicantName: formData.applicantName.trim(),
        relativeName: formData.relativeName.trim(),
        relationType: formData.relationType,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        applicantPhone: cleanPhone,
        applicantEmail: formData.applicantEmail.trim(),
        aadhaarNumber: formData.aadhaarNumber.replace(/\D/g, ''),
        rtoOffice: formData.rtoOffice,
        newAddress: formData.newAddress.trim(),
        correctionDetails: formData.correctionDetails.trim(),
        remarksOrNotes: formData.remarksOrNotes.trim(),
        priority: formData.priority,
      });

      if (res.success && res.ticketNumber) {
        setSubmitSuccess(res.ticketNumber);
        await loadRequestsAndStats();
      } else {
        setFieldErrors({ general: res.message || 'Submission failed. Please check inputs.' });
      }
    } catch (err: any) {
      setFieldErrors({ general: err.message || 'An error occurred during submission.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live Identifier Lookup
  const handleLookup = async () => {
    if (!lookupInput.trim()) {
      setLookupError('Please enter a DL Number, LL Number, Aadhaar, or Mobile.');
      return;
    }

    setIsLookingUp(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const res = await drivingApi.lookupByIdentifier(lookupInput.trim());
      if (res.success && Array.isArray(res.data)) {
        setLookupResult({
          identifier: lookupInput.trim().toUpperCase(),
          summary: {
            totalRequests: res.data.length,
            byStatus: res.data.reduce((acc: Record<string, number>, r: DrivingRequest) => {
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
          ADMIN RESPONSE HIGHLIGHT BANNER (LATEST UPDATES FROM SARATHI RTO)
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
                  OFFICIAL SARATHI RTO RESPONSE RECEIVED
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
                {latestAdminResponse.sarathiAckNumber && (
                  <span className="px-2 py-0.5 rounded bg-lime-100 text-lime-900 font-mono text-[11px] font-bold">
                    Sarathi Ref: {latestAdminResponse.sarathiAckNumber}
                  </span>
                )}
                {latestAdminResponse.rtoSlotDate && (
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-mono text-[11px] font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Slot: {latestAdminResponse.rtoSlotDate}
                  </span>
                )}
              </div>

              <div className="text-sm sm:text-base font-black text-emerald-950 flex items-start gap-1.5 pt-0.5">
                <span className="text-emerald-600 text-lg leading-none">“</span>
                <span className="leading-snug">
                  {latestAdminResponse.resolutionRemarks || `Application status updated to "${latestAdminResponse.status}" by RTO Officer.`}
                </span>
                <span className="text-emerald-600 text-lg leading-none">”</span>
              </div>

              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-2 mt-1">
                <span>Service: <strong>{latestAdminResponse.serviceType}</strong></span>
                <span>•</span>
                <span>RTO: {latestAdminResponse.rtoOffice}</span>
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
                <Car className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Driving License Services (Sarathi Parivahan)
                </h1>
                <p className="text-sm text-slate-500 font-bold">
                  Learner License (LL) • Permanent DL Slot • Renewal • Duplicate DL • Address & Mobile Update (Without OTP)
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
                onClick={() => setActiveCategory('ll')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'll'
                    ? 'bg-[#15803d] text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                Learner License (LL)
              </button>

              <button
                onClick={() => setActiveCategory('dl')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === 'dl'
                    ? 'bg-[#00a86b] text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                Permanent DL
              </button>

              <button
                onClick={() => setActiveCategory('renewal')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'renewal'
                    ? 'bg-[#eab308] text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                Renewal & Duplicate
              </button>

              <button
                onClick={() => setActiveCategory('download')}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'download'
                    ? 'bg-[#15803d] text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                Download & PVC
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
                placeholder="Search Driving services..."
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
              <span className="sm:hidden font-bold">DRIVING SERVICES</span>
              <span className="hidden sm:inline [writing-mode:vertical-rl] rotate-180 text-center tracking-widest font-black">
                DRIVING SERVICES
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

        {/* ── LIVE DL / AADHAAR LOOKUP SECTION ── */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-600" />
              <span>Track Driving Applications by DL Number / LL / Aadhaar / Mobile</span>
            </div>

            {stats && (
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg">
                  Submitted: {stats.byStatus['Submitted'] || 0}
                </span>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg">
                  Slot Booked: {stats.byStatus['RTO Slot Booked'] || 0}
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
                maxLength={20}
                value={lookupInput}
                onChange={(e) => {
                  setLookupInput(e.target.value.toUpperCase());
                  setLookupError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="Enter DL No (TN-01-2018-0012345) or Aadhaar No"
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
                        <th className="py-2.5 px-3">Sarathi Ref / Slot</th>
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
                            <div>{req.sarathiAckNumber || 'Pending Sarathi Processing'}</div>
                            {req.rtoSlotDate && (
                              <div className="text-[10px] text-indigo-700 font-sans font-bold">
                                Slot: {req.rtoSlotDate}
                              </div>
                            )}
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

          {/* ── RECENT CITIZEN DRIVING REQUESTS TABLE ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span>Recently Submitted Citizen Driving License Applications</span>
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
                    <th className="py-3 px-4">DL / LL Number</th>
                    <th className="py-3 px-4">Service & Admin Response</th>
                    <th className="py-3 px-4">Sarathi Ref / Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                        No Driving application tickets found. Click any service card above to apply.
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
                            {req.drivingLicenseNumber ? (
                              <div className="text-emerald-800 font-bold text-xs">{req.drivingLicenseNumber}</div>
                            ) : req.learnerLicenseNumber ? (
                              <div className="text-indigo-800 font-bold text-xs">LL: {req.learnerLicenseNumber}</div>
                            ) : (
                              <div className="text-slate-400 text-xs">Fresh Application</div>
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
                                Awaiting Sarathi RTO verification
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-900">
                            {req.sarathiAckNumber ? (
                              <span className="bg-lime-50 border border-lime-200 px-2 py-0.5 rounded">
                                {req.sarathiAckNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400">---</span>
                            )}
                            {req.rtoSlotDate && (
                              <div className="text-[10px] text-indigo-700 font-sans font-bold mt-0.5">
                                Slot: {req.rtoSlotDate}
                              </div>
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
          MODAL: INTERACTIVE DRIVING SERVICE APPLICATION FORM
         ───────────────────────────────────────────────────────────────── */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                    {selectedService.name}
                  </h3>
                  <p className="text-xs text-emerald-200 font-medium">
                    Ministry of Road Transport & Highways (MoRTH) • Sarathi Parivahan
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
                  <h4 className="text-lg font-black text-emerald-950">Driving Application Submitted Successfully!</h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    Your request has been queued in the system. The operator will verify your details and generate your Sarathi Parivahan reference.
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

                  {/* Existing DL Number (if required) */}
                  {selectedService.requiresExistingDl && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Existing Driving License (DL) Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={18}
                          value={formData.drivingLicenseNumber}
                          onChange={(e) => {
                            setFormData({ ...formData, drivingLicenseNumber: e.target.value.toUpperCase() });
                            setFieldErrors({ ...fieldErrors, drivingLicenseNumber: '' });
                          }}
                          placeholder="e.g. TN-01-2018-0012345"
                          className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase focus:border-emerald-500 outline-hidden"
                          required
                        />
                      </div>
                      {fieldErrors.drivingLicenseNumber && (
                        <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.drivingLicenseNumber}</p>
                      )}
                    </div>
                  )}

                  {/* Learner License (LL) Number (if Permanent DL) */}
                  {selectedService.id === 'permanent-dl-apply' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Valid Learner License (LL) Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={22}
                        value={formData.learnerLicenseNumber}
                        onChange={(e) => setFormData({ ...formData, learnerLicenseNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g. TN-54/LL/001245/2026"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase focus:border-emerald-500 outline-hidden"
                        required
                      />
                    </div>
                  )}

                  {/* Vehicle Class & RTO Office */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vehicle Class / Endorsement
                      </label>
                      <select
                        value={formData.vehicleClass}
                        onChange={(e) => setFormData({ ...formData, vehicleClass: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:border-emerald-500 outline-hidden bg-white text-slate-800"
                      >
                        {VEHICLE_CLASSES.map((vc) => (
                          <option key={vc} value={vc}>{vc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        RTO Office (Tamil Nadu)
                      </label>
                      <select
                        value={formData.rtoOffice}
                        onChange={(e) => setFormData({ ...formData, rtoOffice: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:border-emerald-500 outline-hidden bg-white text-slate-800"
                      >
                        {TN_RTO_OFFICES.map((rto) => (
                          <option key={rto} value={rto}>{rto}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Applicant Name & Relative Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Applicant Full Name <span className="text-red-500">*</span>
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
                        Father / Mother / Husband Name
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.relationType}
                          onChange={(e) => setFormData({ ...formData, relationType: e.target.value })}
                          className="px-2 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-700 outline-none"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Husband">Husband</option>
                          <option value="Guardian">Guardian</option>
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

                  {/* DOB, Gender & Blood Group */}
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
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden bg-white"
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contact Info & Aadhaar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
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

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        12-Digit Aadhaar Number
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

                  {/* Change of Address Section */}
                  {selectedService.id === 'change-address-dl' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        New Residential Address (Door No, Street, Landmark, Pincode) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.newAddress}
                        onChange={(e) => setFormData({ ...formData, newAddress: e.target.value })}
                        placeholder="Enter full new residential address as per Aadhaar/Voter proof"
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                        required
                      />
                    </div>
                  )}

                  {/* Correction specifics */}
                  {selectedService.category === 'renewal' && selectedService.id !== 'change-address-dl' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Specific Change / Modification Note
                      </label>
                      <input
                        type="text"
                        value={formData.correctionDetails}
                        onChange={(e) => setFormData({ ...formData, correctionDetails: e.target.value })}
                        placeholder="e.g. DL expired on 12/2025, need Form 9 renewal, or link new mobile number"
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
          MODAL: INSPECT DRIVING APPLICATION DETAILS & AUDIT TRAIL
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
                        Official Sarathi Parivahan Response
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-2xs">
                      Status: {inspectRequest.status}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white border border-emerald-200 rounded-xl text-emerald-950 font-black text-sm sm:text-base leading-relaxed shadow-2xs">
                    "{inspectRequest.resolutionRemarks}"
                  </div>

                  {inspectRequest.sarathiAckNumber && (
                    <div className="p-2 bg-lime-50 border border-lime-200 rounded-lg text-lime-900 font-mono font-bold flex items-center justify-between">
                      <span>Sarathi Application Reference:</span>
                      <span className="text-sm font-black">{inspectRequest.sarathiAckNumber}</span>
                    </div>
                  )}

                  {inspectRequest.rtoSlotDate && (
                    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 font-mono font-bold flex items-center justify-between">
                      <span>RTO Driving Test Slot:</span>
                      <span className="text-sm font-black">{inspectRequest.rtoSlotDate}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Updated on {new Date(inspectRequest.updatedAt).toLocaleString('en-IN')} by RTO Operator</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Awaiting RTO verification. Official Sarathi reference number and slot appointment will be highlighted here.</span>
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
                  <span className="text-[10px] uppercase font-bold text-slate-500">License Details</span>
                  <div className="text-sm font-mono font-bold text-emerald-800">
                    {inspectRequest.drivingLicenseNumber || inspectRequest.learnerLicenseNumber || 'Fresh Application'}
                  </div>
                  {inspectRequest.maskedAadhaar && (
                    <div className="text-slate-400 text-xs font-mono">{inspectRequest.maskedAadhaar}</div>
                  )}
                </div>
              </div>

              {/* Vehicle Class & RTO */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Vehicle Class</span>
                  <div className="font-bold text-slate-800 truncate">{inspectRequest.vehicleClass}</div>
                  <div className="text-slate-500 font-semibold">Blood Group: {inspectRequest.bloodGroup || 'O+'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">RTO Jurisdiction</span>
                  <div className="font-bold text-slate-800">{inspectRequest.rtoOffice}</div>
                </div>
              </div>

              {/* Address Shifting Note */}
              {inspectRequest.newAddress && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">New Address for DL Record</span>
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

