import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  ShieldCheck,
  Send,
  Loader2,
  X,
  ExternalLink,
  ChevronRight,
  User,
  Phone,
  Building,
  CreditCard,
  Calendar,
  Sparkles,
  Zap,
  HelpCircle,
  FileCheck2,
  FileDown,
  Activity,
  Award,
  Layers,
  MapPin,
  RefreshCw,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { farmerApi, FarmerRequest, FarmerStatsResponse } from '../services/farmerApi';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// ── Farmer Service Catalog Definition ───────────────────────────────────────
interface FarmerServiceCard {
  id: string;
  name: string;
  actionLabel: string;
  subtitle: string;
  processingTime: string;
  feeText: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
  serviceType: string;
  description: string;
}

const FARMER_SERVICES: FarmerServiceCard[] = [
  {
    id: 'pm-kisan-reg',
    name: 'PM-KISAN E-KYC & REGISTRATION',
    actionLabel: 'APPLY NOW',
    subtitle: 'Pradhan Mantri Kisan Samman Nidhi ₹6,000 annual direct income support & biometric e-KYC',
    processingTime: '24-48 Hours',
    feeText: 'Free DBT Scheme',
    icon: Award,
    badge: 'CENTRAL GOVT',
    serviceType: 'PM-KISAN Samman Nidhi e-KYC & New Registration',
    description: 'Direct Benefit Transfer (DBT) registration for landholding farmer families. Link Aadhaar, bank account, and land records to receive ₹2,000 tri-annual installments.',
  },
  {
    id: 'patta-chitta-extract',
    name: 'E-PATTA & CHITTA EXTRACT',
    actionLabel: 'DOWNLOAD PATTA',
    subtitle: 'Official Tamil Nadu Revenue Department digital e-Patta and Chitta land ownership record',
    processingTime: 'Instant / Same Day',
    feeText: 'Official Copy',
    icon: FileCheck2,
    badge: 'TNeGA REVENUE',
    serviceType: 'Tamil Nadu e-Patta & Chitta Land Records Extract',
    description: 'Instant verification of land ownership, owner name, patta number, survey number, sub-division, soil type, and wet/dry land classification with QR code.',
  },
  {
    id: 'fmb-sketch-copy',
    name: 'FMB SKETCH COPY DOWNLOAD',
    actionLabel: 'GET FMB SKETCH',
    subtitle: 'Field Measurement Book (FMB) survey sketch with precise boundary measurements & sub-divisions',
    processingTime: '1-2 Days',
    feeText: 'Survey Record',
    icon: Layers,
    badge: 'LAND SURVEY',
    serviceType: 'FMB (Field Measurement Book) Sketch Copy Download',
    description: 'Authentic boundary sketch from the Taluk Survey Office depicting survey boundaries, adjoining plots, sub-divisions, road paths, and canal channels.',
  },
  {
    id: 'crop-insurance-pmfby',
    name: 'CROP INSURANCE (PMFBY)',
    actionLabel: 'INSURE CROP',
    subtitle: 'Pradhan Mantri Fasal Bima Yojana crop loss coverage & compensation claim for drought/flood',
    processingTime: 'Immediate Acknowledgment',
    feeText: 'Subsidized Premium',
    icon: ShieldCheck,
    badge: 'PMFBY COVERED',
    serviceType: 'Crop Insurance (PMFBY) Registration & Claim Filing',
    description: 'Comprehensive risk insurance against non-preventable natural risks from pre-sowing to post-harvest for Paddy, Sugarcane, Cotton, Banana, and horticultural crops.',
  },
  {
    id: 'micro-irrigation-subsidy',
    name: '100% DRIP & SPRINKLER SUBSIDY',
    actionLabel: 'APPLY SUBSIDY',
    subtitle: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) - 100% subsidy for Small & Marginal farmers',
    processingTime: 'Field Inspection (3-5 Days)',
    feeText: '100% Govt Subsidy',
    icon: Zap,
    badge: '100% SUBSIDY',
    serviceType: '100% Micro-Irrigation (Drip / Sprinkler) Subsidy Scheme',
    description: 'Save water and maximize crop yield. 100% subsidy for Small & Marginal farmers (< 5 Acres) and 75% subsidy for other farmers covering drip lines, filters, and vents.',
  },
  {
    id: 'farm-machinery-tractor',
    name: 'FARM MACHINERY SUBSIDY',
    actionLabel: 'APPLY MACHINERY',
    subtitle: 'Subsidized Power Tiller, Rotavator, Tractor attachments, and Paddy Transplanter allotment',
    processingTime: 'Allotment Cycle',
    feeText: '40% - 50% Subsidy',
    icon: Sparkles,
    badge: 'AGRI ENGINEERING',
    serviceType: 'Subsidized Farm Machinery & Tractor Allotment',
    description: 'Agricultural Mechanization Scheme providing up to 50% capital subsidy on power tillers, bush cutters, multi-crop threshers, and tractor-driven implements.',
  },
  {
    id: 'uzhavar-sandhai-pass',
    name: 'UZHAVAR SANDHAI SELLER PASS',
    actionLabel: 'APPLY PASS',
    subtitle: 'Official Farmer Identity Card for selling vegetables and fruits directly without middlemen',
    processingTime: '2-3 Days',
    feeText: 'Free Identity Card',
    icon: User,
    badge: 'FARMER DIRECT',
    serviceType: 'Uzhavar Sandhai Farmer Identity Pass (Seller ID)',
    description: 'Issued by Agricultural Marketing Department allowing certified farmers to sell farm produce directly to consumers at daily Uzhavar Sandhais across Tamil Nadu.',
  },
  {
    id: 'soil-health-card',
    name: 'SOIL HEALTH CARD APPLICATION',
    actionLabel: 'REQUEST TEST',
    subtitle: 'Complete 12-parameter soil fertility analysis report and customized fertilizer dosage advice',
    processingTime: '3-7 Days',
    feeText: 'Free Soil Testing',
    icon: FileText,
    badge: 'SOIL LAB TEST',
    serviceType: 'Soil Health Card & Soil Nutrient Test Application',
    description: 'Laboratory testing of soil samples for pH, electrical conductivity, organic carbon, Nitrogen (N), Phosphorus (P), Potassium (K), and micronutrients (Zinc, Boron, Iron).',
  },
  {
    id: 'subsidized-seeds-depot',
    name: 'SUBSIDIZED SEEDS & FERTILIZERS',
    actionLabel: 'BOOK SEEDS',
    subtitle: 'Certified high-yielding seeds, bio-fertilizers & micro-nutrient kits from Agricultural Depots',
    processingTime: 'Immediate Voucher',
    feeText: '50% Seed Subsidy',
    icon: Sprout,
    badge: 'EXTENSION DEPOT',
    serviceType: 'Subsidized Certified Seeds & Bio-Fertilizers Allotment',
    description: 'Get certified seeds of ADT, CR-1009, CO-51 Paddy varieties, hybrid Maize, pulses, and bio-fertilizers (Azospirillum, Phosphobacteria) at 50% subsidized cost.',
  },
];

const TN_DISTRICTS = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kanchipuram',
  'Kanyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
];

const STATUS_BADGES: Record<string, { label: string; badge: string; dot: string }> = {
  Submitted: { label: 'Submitted', badge: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
  'Under Review': { label: 'Under Review', badge: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  'Field Inspection Scheduled': { label: 'Inspection Scheduled', badge: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  Verified: { label: 'Verified', badge: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  Approved: { label: 'Approved', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold', dot: 'bg-emerald-500' },
  Resolved: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold', dot: 'bg-emerald-500' },
  Rejected: { label: 'Rejected', badge: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
  Closed: { label: 'Closed', badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-500' },
};

export const FarmerServicesView: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab } = useApp();

  // Navigation Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'lookup' | 'history'>('catalog');

  // Stats
  const [stats, setStats] = useState<FarmerStatsResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Search in catalog
  const [catalogSearch, setCatalogSearch] = useState('');

  // Quick Tracker / Lookup
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResults, setLookupResults] = useState<FarmerRequest[] | null>(null);
  const [lookupError, setLookupError] = useState('');

  // Citizen Applied History
  const [historyRequests, setHistoryRequests] = useState<FarmerRequest[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  // Application Modal
  const [selectedService, setSelectedService] = useState<FarmerServiceCard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState<FarmerRequest | null>(null);

  // Receipt Modal
  const [receiptTicket, setReceiptTicket] = useState<FarmerRequest | null>(null);
  const [copiedAck, setCopiedAck] = useState(false);

  // Form Fields
  const [farmerName, setFarmerName] = useState(user?.username || '');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.mobile || '');
  const [alternateNumber, setAlternateNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Transgender' | 'Other'>('Male');
  const [community, setCommunity] = useState('General');
  const [farmerCategory, setFarmerCategory] = useState('Small Farmer (< 2.5 Acres)');
  const [district, setDistrict] = useState('Salem');
  const [taluk, setTaluk] = useState('Salem West');
  const [village, setVillage] = useState('');
  const [pattaNumber, setPattaNumber] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [totalLandArea, setTotalLandArea] = useState('2.5 Acres');
  const [cropName, setCropName] = useState('Paddy (Nellu)');
  const [season, setSeason] = useState('Kuruvai (Kharif)');
  const [irrigationSource, setIrrigationSource] = useState('Borewell / Open Well');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [pmKisanBeneficiaryId, setPmKisanBeneficiaryId] = useState('');
  const [schemeSpecificNotes, setSchemeSpecificNotes] = useState('');

  // Load User Stats and History
  const loadStats = async () => {
    setIsLoadingStats(true);
    const res = await farmerApi.getStats();
    if (res.success && res.data) {
      setStats(res.data);
    }
    setIsLoadingStats(false);
  };

  const loadHistory = async (page = 1) => {
    setHistoryLoading(true);
    const res = await farmerApi.listRequests({ page, limit: 10 });
    if (res.success && res.data) {
      setHistoryRequests(res.data);
      if (res.meta) {
        setHistoryTotalPages(res.meta.totalPages || 1);
        setHistoryPage(res.meta.page || 1);
      }
    }
    setHistoryLoading(false);
  };

  useEffect(() => {
    loadStats();
    if (activeSubTab === 'history') {
      loadHistory(1);
    }
  }, [activeSubTab]);

  // Open Application Modal
  const handleOpenApply = (service: FarmerServiceCard) => {
    setSelectedService(service);
    setFormError('');
    setSubmittedRequest(null);
  };

  // Submit Application
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    if (!farmerName.trim() || !contactNumber.trim() || !district || !taluk || !village) {
      setFormError('Please fill in all required fields (Name, Phone, District, Taluk, Village).');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const res = await farmerApi.createRequest({
      serviceType: selectedService.serviceType,
      farmerName,
      fatherOrHusbandName,
      contactNumber,
      alternateNumber,
      aadhaarNumber,
      gender,
      community,
      farmerCategory,
      district,
      taluk,
      village,
      pattaNumber,
      surveyNumber,
      totalLandArea,
      cropName,
      season,
      irrigationSource,
      bankName,
      bankAccountNumber,
      bankIfscCode,
      pmKisanBeneficiaryId,
      schemeSpecificNotes,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setSubmittedRequest(res.data);
      loadStats();
      loadHistory(1);
    } else {
      setFormError(res.message || 'Submission failed. Please verify your details.');
    }
  };

  // Perform Lookup Tracker
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setLookupLoading(true);
    setLookupError('');
    setLookupResults(null);

    const res = await farmerApi.lookup(lookupQuery.trim());
    setLookupLoading(false);

    if (res.success && res.data && res.data.length > 0) {
      setLookupResults(res.data);
    } else {
      setLookupError('No matching application or land record found. Please verify your ticket number, survey number, or mobile number.');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAck(true);
    setTimeout(() => setCopiedAck(false), 2000);
  };

  // Filter Catalog
  const filteredServices = FARMER_SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div
      className="space-y-6 pb-12 max-w-[1600px] mx-auto animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div className="bg-[#053228] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#094235]">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/15 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <span>TAMIL NADU UZHAVAN E-SEVAI</span>
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">Department of Agriculture & Farmers Welfare</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Farmer & Agriculture Citizen Services</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-2xl leading-relaxed">
              Single-window e-Services for PM-KISAN, e-Patta & Chitta extract, FMB boundary sketch, 100% Micro-Irrigation Drip subsidy, PMFBY crop insurance, and Uzhavar Sandhai seller registration.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Total Services</span>
              <span className="text-lg font-black text-white mt-0.5 block">09</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">My Requests</span>
              <span className="text-lg font-black text-white mt-0.5 block">{stats?.total || 0}</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Approved</span>
              <span className="text-lg font-black text-emerald-400 mt-0.5 block">{stats?.completed || 0}</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">In Review</span>
              <span className="text-lg font-black text-amber-300 mt-0.5 block">{stats?.underReview || 0}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-emerald-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'catalog'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Farmer Services Catalog</span>
          </button>

          <button
            onClick={() => setActiveSubTab('lookup')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'lookup'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Land Record & PM-KISAN Tracker</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'history'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Applied Requests ({stats?.total || 0})</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: CATALOG VIEW ─────────────────────────────────────────────── */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search farmer services by name, land record, subsidy, crop insurance, or PM-KISAN..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold hidden sm:block whitespace-nowrap">
              Showing {filteredServices.length} Schemes
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((svc) => {
              const IconComp = svc.icon;
              return (
                <div
                  key={svc.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 group-hover:scale-105 transition-transform shrink-0">
                        <IconComp className="w-6 h-6 text-emerald-700" />
                      </div>
                      {svc.badge && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                          {svc.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {svc.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        {svc.subtitle}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-[11px] text-slate-700 leading-normal font-medium">
                      {svc.description}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="font-semibold text-emerald-800">{svc.feeText}</span>
                      <span>⏱ {svc.processingTime}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenApply(svc)}
                    className="w-full mt-4 py-2.5 px-4 bg-[#053228] hover:bg-[#07473a] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 group-hover:bg-[#15803d]"
                  >
                    <span>{svc.actionLabel}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: LOOKUP & STATUS TRACKER ──────────────────────────────────── */}
      {activeSubTab === 'lookup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs max-w-2xl mx-auto space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Quick Land Record & Farmer Application Tracker
              </h2>
              <p className="text-xs text-slate-500">
                Track status instantly by Ticket Number, Mobile, Patta Number, Land Survey Number, or PM-KISAN ID.
              </p>
            </div>

            <form onSubmit={handleLookup} className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="e.g. FARM-202610-8912, Patta No: 412, or Mobile No"
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-5 py-2.5 bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Track Now</span>
              </button>
            </form>

            {lookupError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}
          </div>

          {/* Lookup Results */}
          {lookupResults && lookupResults.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Found Matching Records ({lookupResults.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lookupResults.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl space-y-3 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-black text-emerald-800 block">
                          {item.ticketNumber}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{item.serviceType}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGES[item.status]?.badge || 'bg-slate-100'}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer Name</span>
                        <span className="font-semibold text-slate-900">{item.farmerName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                        <span className="font-mono font-semibold text-slate-900">{item.contactNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue District / Taluk</span>
                        <span>{item.district} / {item.taluk}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Patta / Survey No</span>
                        <span className="font-mono font-bold text-slate-900">
                          {item.pattaNumber ? `Patta: ${item.pattaNumber}` : ''} {item.surveyNumber ? `Sy: ${item.surveyNumber}` : '---'}
                        </span>
                      </div>
                    </div>

                    {item.officialAckNumber && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-900">Official Ack: <strong className="font-mono">{item.officialAckNumber}</strong></span>
                        <button
                          onClick={() => handleCopy(item.officialAckNumber!)}
                          className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
                        >
                          {copiedAck ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setReceiptTicket(item)}
                      className="w-full py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      View Receipt & Application Slip
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: APPLIED HISTORY ─────────────────────────────────────────── */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                My Applied Farmer Service Applications
              </h2>
              <p className="text-xs text-slate-500">
                Track status, download acknowledgements, and view inspection schedules
              </p>
            </div>
            <button
              onClick={() => loadHistory(historyPage)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {historyLoading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
              <span className="text-xs font-semibold">Loading your applied records...</span>
            </div>
          ) : historyRequests.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Sprout className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">No applications found in this account</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't submitted any farmer service or land record requests yet. Choose a scheme from the catalog to get started.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('catalog')}
                className="px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Ticket ID</th>
                    <th className="p-3.5">Scheme / Service</th>
                    <th className="p-3.5">Farmer & Contact</th>
                    <th className="p-3.5">Land Details</th>
                    <th className="p-3.5">Applied Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {historyRequests.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-mono font-bold text-emerald-800">
                        {item.ticketNumber}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 max-w-xs truncate">
                        {item.serviceType}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.farmerName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.contactNumber}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{item.district} ({item.taluk})</div>
                        <div className="text-[11px] text-slate-500">
                          {item.pattaNumber ? `Patta ${item.pattaNumber}` : ''} {item.surveyNumber ? `Sy: ${item.surveyNumber}` : ''}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${STATUS_BADGES[item.status]?.badge || 'bg-slate-100'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setReceiptTicket(item)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          View Receipt
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

      {/* ── APPLICATION SUBMISSION MODAL ────────────────────────────────────── */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#053228] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#094235]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">{selectedService.name}</h3>
                  <p className="text-xs text-emerald-200 font-medium">Tamil Nadu e-Sevai Agriculture & Revenue Form</p>
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
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {submittedRequest ? (
                /* Success View */
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-900">Application Registered Successfully!</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Your farmer service request has been assigned to the designated Agricultural Extension Officer / Revenue Inspector desk.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Generated Ticket Reference ID</span>
                    <div className="font-mono font-black text-emerald-800 text-lg flex items-center justify-center gap-2">
                      <span>{submittedRequest.ticketNumber}</span>
                      <button
                        onClick={() => handleCopy(submittedRequest.ticketNumber)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {copiedAck ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Farmer: <strong>{submittedRequest.farmerName}</strong> ({submittedRequest.district})
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setReceiptTicket(submittedRequest);
                        setSelectedService(null);
                      }}
                      className="px-5 py-2.5 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      View & Print Acknowledgment Slip
                    </button>
                    <button
                      onClick={() => setSelectedService(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmitApplication} className="space-y-5">
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* SECTION 1: FARMER PROFILE */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                      <User className="w-4 h-4 text-emerald-700" />
                      <span>1. Farmer Identity & Contact Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Farmer Legal Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={farmerName}
                          onChange={(e) => setFarmerName(e.target.value)}
                          placeholder="As per Patta / Aadhaar"
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Father / Spouse Name</label>
                        <input
                          type="text"
                          value={fatherOrHusbandName}
                          onChange={(e) => setFatherOrHusbandName(e.target.value)}
                          placeholder="Father or Husband name"
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Mobile Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile number"
                          className="w-full text-xs font-mono font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Aadhaar Card Reference</label>
                        <input
                          type="text"
                          maxLength={12}
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="12-digit Aadhaar number"
                          className="w-full text-xs font-mono font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Farmer Category</label>
                        <select
                          value={farmerCategory}
                          onChange={(e) => setFarmerCategory(e.target.value)}
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        >
                          <option value="Small Farmer (< 2.5 Acres)">Small Farmer (&lt; 2.5 Acres)</option>
                          <option value="Marginal Farmer (< 5 Acres)">Marginal Farmer (&lt; 5 Acres)</option>
                          <option value="Big Farmer (> 5 Acres)">Big Farmer (&gt; 5 Acres)</option>
                          <option value="Tenant Farmer">Tenant Farmer</option>
                          <option value="Agricultural Laborer">Agricultural Laborer</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Community / Category</label>
                        <select
                          value={community}
                          onChange={(e) => setCommunity(e.target.value)}
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        >
                          <option value="General">General (OC)</option>
                          <option value="OBC">BC / OBC</option>
                          <option value="MBC">MBC / DNC</option>
                          <option value="SC">Scheduled Caste (SC)</option>
                          <option value="ST">Scheduled Tribe (ST)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: LAND REVENUE JURISDICTION */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      <span>2. Land Revenue Jurisdiction & Survey Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Revenue District <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        >
                          {TN_DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Taluk Office <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={taluk}
                          onChange={(e) => setTaluk(e.target.value)}
                          placeholder="e.g. Salem West / Thanjavur"
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Revenue Village <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          placeholder="e.g. Karuppur / Alagapuram"
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Patta Number</label>
                        <input
                          type="text"
                          value={pattaNumber}
                          onChange={(e) => setPattaNumber(e.target.value)}
                          placeholder="e.g. 524"
                          className="w-full text-xs font-mono font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Survey & Sub-Division No</label>
                        <input
                          type="text"
                          value={surveyNumber}
                          onChange={(e) => setSurveyNumber(e.target.value)}
                          placeholder="e.g. 142/3A, 88/1"
                          className="w-full text-xs font-mono font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Total Land Extent</label>
                        <input
                          type="text"
                          value={totalLandArea}
                          onChange={(e) => setTotalLandArea(e.target.value)}
                          placeholder="e.g. 2.5 Acres / 1.2 Hectares"
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: CROPS & DBT BANK DETAILS */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span>3. Crop Details & Direct Benefit Transfer (DBT) Bank Account</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Primary Crop Cultivated</label>
                        <input
                          type="text"
                          value={cropName}
                          onChange={(e) => setCropName(e.target.value)}
                          placeholder="e.g. Paddy (Nellu), Sugarcane, Turmeric"
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Cultivation Season</label>
                        <select
                          value={season}
                          onChange={(e) => setSeason(e.target.value)}
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        >
                          <option value="Kuruvai (Kharif)">Kuruvai (Kharif)</option>
                          <option value="Samba / Thaladi (Rabi)">Samba / Thaladi (Rabi)</option>
                          <option value="Navarai (Summer)">Navarai (Summer)</option>
                          <option value="Perennial / Annual">Perennial / Annual</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. State Bank of India / Canara"
                          className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Account Number (DBT)</label>
                        <input
                          type="text"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="Bank account number"
                          className="w-full text-xs font-mono font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Bank IFSC Code</label>
                        <input
                          type="text"
                          value={bankIfscCode}
                          onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                          placeholder="e.g. SBIN0001234"
                          className="w-full text-xs font-mono font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">PM-KISAN ID (if existing)</label>
                        <input
                          type="text"
                          value={pmKisanBeneficiaryId}
                          onChange={(e) => setPmKisanBeneficiaryId(e.target.value)}
                          placeholder="e.g. TN2024108821"
                          className="w-full text-xs font-mono font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Specific Scheme Requests / Officer Notes
                    </label>
                    <textarea
                      rows={2}
                      value={schemeSpecificNotes}
                      onChange={(e) => setSchemeSpecificNotes(e.target.value)}
                      placeholder="Specify pump horsepower, drip layout details, loss date for insurance, or variety of seeds..."
                      className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
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

      {/* ── RECEIPT SLIP MODAL ──────────────────────────────────────────────── */}
      {receiptTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="p-6 space-y-4 print:p-0">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <Sprout className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Tamil Nadu Agriculture e-Sevai</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Official Citizen Application Acknowledgment</p>
                  </div>
                </div>
                <button
                  onClick={() => setReceiptTicket(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer print:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Ticket No</span>
                    <span className="font-mono font-black text-emerald-900 text-sm">{receiptTicket.ticketNumber}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_BADGES[receiptTicket.status]?.badge || 'bg-slate-100'}`}>
                    {receiptTicket.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/60 border border-slate-200/60 rounded-xl text-slate-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Scheme</span>
                    <span className="font-bold text-slate-900">{receiptTicket.serviceType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer Name</span>
                    <span className="font-bold text-slate-900">{receiptTicket.farmerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                    <span className="font-mono">{receiptTicket.contactNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue District</span>
                    <span>{receiptTicket.district} ({receiptTicket.taluk})</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Patta / Survey No</span>
                    <span className="font-mono">{receiptTicket.pattaNumber ? `Patta: ${receiptTicket.pattaNumber}` : ''} {receiptTicket.surveyNumber ? `Sy: ${receiptTicket.surveyNumber}` : '---'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Submission Date</span>
                    <span className="font-mono">
                      {new Date(receiptTicket.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {receiptTicket.officialAckNumber && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Department Reference ID</span>
                    <div className="font-mono font-bold text-emerald-950 text-xs mt-0.5">
                      {receiptTicket.officialAckNumber}
                    </div>
                  </div>
                )}

                {receiptTicket.resolutionRemarks && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Officer Remarks</span>
                    <div className="text-slate-800 text-xs mt-0.5">{receiptTicket.resolutionRemarks}</div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-end gap-2.5 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setReceiptTicket(null)}
                  className="px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
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

