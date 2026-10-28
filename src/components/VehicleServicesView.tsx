import React, { useState, useEffect } from 'react';
import {
  Car,
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
  Flame,
  User,
  Phone,
  Building,
  CreditCard,
  Calendar,
  Sparkles,
  Zap,
  HelpCircle,
  FileCheck2,
  Share2,
  FileDown,
  Activity,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { vehicleApi, VehicleRequest, VehicleStatsResponse } from '../services/vehicleApi';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// ── Vahan Vehicle Service Catalog ──────────────────────────────────────────
interface VahanServiceCard {
  id: string;
  name: string;
  actionLabel: string;
  subtitle: string;
  processingTime: string;
  feeText: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
  serviceType: string;
  formType: 'rc_extract' | 'insurance' | 'pucc' | 'rc_pdf' | 'mobile_link' | 'challan' | 'transfer' | 'duplicate' | 'address' | 'hypothecation';
  description: string;
}

const VAHAN_SERVICES: VahanServiceCard[] = [
  {
    id: 'veh-rc-extract',
    name: 'ALL INDIA VEHICLE RC',
    actionLabel: 'FETCH RC',
    subtitle: 'Fetch complete Vahan registration certificate details and verify live status',
    processingTime: 'Instant',
    feeText: 'Govt Service Rate',
    icon: Car,
    badge: 'PARIVAHAN LIVE',
    serviceType: 'All India Vehicle RC (Detailed Extract)',
    formType: 'rc_extract',
    description: 'Instant national registry verification covering owner, chassis, engine, registration date, tax, fitness, and hypothecation validity.',
  },
  {
    id: 'veh-insurance',
    name: 'VEHICLE INSURANCE CHECK',
    actionLabel: 'CHECK POLICY',
    subtitle: 'Verify policy number, insurer company name, validity date & renew coverage',
    processingTime: 'Instant',
    feeText: 'Free Check',
    icon: ShieldCheck,
    badge: 'IRDAI VERIFIED',
    serviceType: 'Vehicle Insurance Details & Validity Check',
    formType: 'insurance',
    description: 'Instant policy verification across all national general insurance providers. Validates Comprehensive vs Third-Party status.',
  },
  {
    id: 'veh-pucc-emission',
    name: 'EMISSION TEST REPORT',
    actionLabel: 'DOWNLOAD PUCC',
    subtitle: 'Official Pollution Under Control Certificate (PUCC) PDF with QR Code',
    processingTime: 'Instant',
    feeText: 'Official PDF',
    icon: FileCheck2,
    badge: 'QR VERIFIED',
    serviceType: 'Emission Test Report (PUCC Download & QR Verification)',
    formType: 'pucc',
    description: 'Direct MoRTH emission test registry download with test values, validity dates, center code, and tamper-proof QR code.',
  },
  {
    id: 'veh-rc-smartcard',
    name: 'VEHICLE RC SMART CARD PDF',
    actionLabel: 'DOWNLOAD RC',
    subtitle: 'Original Form 23 Parivahan Smart Card PDF format for digital storage or PVC print',
    processingTime: 'Instant / 10 Mins',
    feeText: 'High Res PDF',
    icon: FileDown,
    badge: 'FORM 23',
    serviceType: 'Vehicle RC Smart Card PDF (Form 23 Download)',
    formType: 'rc_pdf',
    description: 'High-resolution official Form 23 Registration Certificate card copy formatted perfectly for DigiLocker or PVC card printing.',
  },
  {
    id: 'veh-mobile-link',
    name: 'LINK MOBILE NO TO RC',
    actionLabel: 'LINK DIRECT',
    subtitle: 'Update RTO Vahan mobile number record without customer OTP requirement',
    processingTime: '24-48 Hours',
    feeText: 'Assisted Service',
    icon: Phone,
    badge: 'NO OTP NEEDED',
    serviceType: 'Link Mobile Number to Vehicle RC (Without OTP)',
    formType: 'mobile_link',
    description: 'Special administrative updating service to connect your active mobile number to Vahan records for SMS alerts and e-Challan notifications.',
  },
  {
    id: 'veh-traffic-challan',
    name: 'TRAFFIC FINE & e-CHALLAN',
    actionLabel: 'PAY / VERIFY',
    subtitle: 'Check pending traffic violation challans across India with instant settlement receipt',
    processingTime: 'Instant',
    feeText: 'Direct Pay',
    icon: AlertTriangle,
    badge: 'POLICE LIVE',
    serviceType: 'Traffic Fine & e-Challan Instant Settlement',
    formType: 'challan',
    description: 'National and state traffic police integrated check. Enter vehicle or challan number to verify fine amount and obtain digital settlement proof.',
  },
  {
    id: 'veh-rc-transfer',
    name: 'TRANSFER OF OWNERSHIP',
    actionLabel: 'FORM 29 / 30',
    subtitle: 'RC Transfer application for vehicle sale / purchase with RTO clearance support',
    processingTime: '3-7 Days',
    feeText: 'Assisted RTO',
    icon: Share2,
    badge: 'BUYER & SELLER',
    serviceType: 'Transfer of Ownership (RC Transfer / Form 29 & 30)',
    formType: 'transfer',
    description: 'Complete documentation and filing for vehicle ownership transfer, including Form 29, Form 30, NOC clearance, and buyer verification.',
  },
  {
    id: 'veh-duplicate-rc',
    name: 'DUPLICATE RC APPLICATION',
    actionLabel: 'FORM 26',
    subtitle: 'Apply for duplicate registration certificate for lost, stolen, or damaged RC books',
    processingTime: '3-5 Days',
    feeText: 'Assisted RTO',
    icon: CreditCard,
    badge: 'LOST / DAMAGED',
    serviceType: 'Issue of Duplicate RC (Form 26 - Lost / Damaged)',
    formType: 'duplicate',
    description: 'Official Form 26 procedure with Police NCR / LDR integration and RTO submission for issuing a brand-new smart card RC.',
  },
  {
    id: 'veh-address-change',
    name: 'CHANGE OF ADDRESS IN RC',
    actionLabel: 'UPDATE ADDRESS',
    subtitle: 'Update residential or business address across Tamil Nadu and inter-state RTOs',
    processingTime: '3-5 Days',
    feeText: 'Assisted RTO',
    icon: Building,
    badge: 'FORM 33',
    serviceType: 'Change of Address in Vehicle RC',
    formType: 'address',
    description: 'Form 33 submission for updating the owner residential address in vehicle registration records with proof verification.',
  },
  {
    id: 'veh-hypothecation',
    name: 'HYPOTHECATION (HPA / HPT)',
    actionLabel: 'LOAN CLEARANCE',
    subtitle: 'Add bank loan endorsement (HPA) or terminate loan hypothecation (HPT) with Bank NOC',
    processingTime: '2-4 Days',
    feeText: 'Assisted RTO',
    icon: Award,
    badge: 'FORM 34 / 35',
    serviceType: 'Hypothecation Addition / Endorsement / Termination (HPA / HPT)',
    formType: 'hypothecation',
    description: 'Form 34 (Hypothecation addition) and Form 35 (Hypothecation cancellation) with bank clearance and RTO NOC generation.',
  },
];

const VEHICLE_CLASSES = [
  'Motorcycle with Gear (MCWG)',
  'Motorcycle without Gear (Scooter / Moped)',
  'Motor Car (LMV - Private)',
  'Light Commercial Vehicle (LGV)',
  'Auto Rickshaw (3-Wheeler Cab)',
  'E-Rickshaw / E-Cart',
  'Goods Carrier (HGV / Medium)',
  'Passenger Bus / Maxi Cab',
  'Agricultural Tractor & Trailer',
];

const FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Electric (EV)',
  'CNG',
  'Hybrid',
  'LPG',
  'Other',
];

const TN_RTO_OFFICES = [
  'TN-01 Chennai Central (Ayanavaram)',
  'TN-02 Chennai North West (Anna Nagar)',
  'TN-03 Chennai North East (Tondiarpet)',
  'TN-04 Chennai East (Royapuram)',
  'TN-05 Chennai North (Kolathur)',
  'TN-06 Chennai South East (Mandavelli)',
  'TN-07 Chennai South (Thiruvanmiyur)',
  'TN-09 Chennai West (K.K. Nagar)',
  'TN-10 Chennai South West (Virugambakkam)',
  'TN-11 Tambaram',
  'TN-12 Poonamallee',
  'TN-13 Ambattur',
  'TN-14 Sholinganallur',
  'TN-18 Red Hills',
  'TN-20 Tiruvallur',
  'TN-21 Kanchipuram',
  'TN-22 Meenambakkam',
  'TN-23 Vellore',
  'TN-25 Tiruvannamalai',
  'TN-27 Salem (West)',
  'TN-30 Salem (East)',
  'TN-33 Erode (East)',
  'TN-37 Coimbatore (South)',
  'TN-38 Coimbatore (North)',
  'TN-45 Tiruchirappalli',
  'TN-49 Thanjavur',
  'TN-58 Madurai (South)',
  'TN-59 Madurai (North)',
  'TN-67 Virudhunagar',
  'TN-69 Thoothukudi',
  'TN-72 Tirunelveli',
  'TN-74 Nagercoil',
];

export const VehicleServicesView: React.FC = () => {
  const { user } = useAuth();

  // Search & Live Tracker State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<VehicleRequest[] | null>(null);
  const [searchError, setSearchError] = useState('');

  // Stats State
  const [stats, setStats] = useState<VehicleStatsResponse | null>(null);

  // Application Modal State
  const [activeModalService, setActiveModalService] = useState<VahanServiceCard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<VehicleRequest | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Inspection Modal State
  const [inspectRequest, setInspectRequest] = useState<VehicleRequest | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    chassisNumber: '',
    engineNumber: '',
    vehicleClass: 'Motor Car (LMV - Private)',
    makerModel: '',
    fuelType: 'Petrol',
    ownerName: user?.username || '',
    ownerPhone: user?.phoneNumber || '',
    ownerEmail: '',
    aadhaarNumber: '',
    rtoOffice: 'TN-01 Chennai Central (Ayanavaram)',
    insurancePolicyNumber: '',
    insuranceCompany: '',
    insuranceExpiryDate: '',
    puccNumber: '',
    puccExpiryDate: '',
    hypothecationBank: '',
    challanNumber: '',
    challanAmount: 0,
    newOwnerName: '',
    newOwnerPhone: '',
    newAddress: '',
    remarksOrNotes: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
  });

  // Load Initial Stats
  useEffect(() => {
    vehicleApi.getStats().then((res) => {
      if (res.success && res.data) {
        setStats(res.data);
      }
    });
  }, []);

  // Quick Tracker Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResults(null);

    const res = await vehicleApi.lookupByIdentifier(searchQuery.trim());
    setIsSearching(false);

    if (res.success && res.data && res.data.length > 0) {
      setSearchResults(res.data);
    } else {
      setSearchError(res.message || 'No vehicle service records found matching your registration or ticket number.');
    }
  };

  // Open Application Modal
  const openModal = (card: VahanServiceCard) => {
    setActiveModalService(card);
    setSubmitSuccess(null);
    setSubmitError('');
    setFormData({
      vehicleNumber: '',
      chassisNumber: '',
      engineNumber: '',
      vehicleClass: 'Motor Car (LMV - Private)',
      makerModel: '',
      fuelType: 'Petrol',
      ownerName: user?.username || '',
      ownerPhone: user?.phoneNumber || '',
      ownerEmail: '',
      aadhaarNumber: '',
      rtoOffice: 'TN-01 Chennai Central (Ayanavaram)',
      insurancePolicyNumber: '',
      insuranceCompany: '',
      insuranceExpiryDate: '',
      puccNumber: '',
      puccExpiryDate: '',
      hypothecationBank: '',
      challanNumber: '',
      challanAmount: 0,
      newOwnerName: '',
      newOwnerPhone: '',
      newAddress: '',
      remarksOrNotes: '',
      priority: 'Medium',
    });
  };

  // Submit Vehicle Application
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalService) return;

    if (!formData.vehicleNumber.trim()) {
      setSubmitError('Vehicle Registration Number is required (e.g. TN 01 AB 1234).');
      return;
    }
    if (!formData.ownerName.trim() || !formData.ownerPhone.trim()) {
      setSubmitError('Owner name and 10-digit mobile number are required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const res = await vehicleApi.submitRequest({
      serviceType: activeModalService.serviceType,
      vehicleNumber: formData.vehicleNumber.trim(),
      chassisNumber: formData.chassisNumber.trim() || undefined,
      engineNumber: formData.engineNumber.trim() || undefined,
      vehicleClass: formData.vehicleClass,
      makerModel: formData.makerModel.trim() || undefined,
      fuelType: formData.fuelType,
      ownerName: formData.ownerName.trim(),
      ownerPhone: formData.ownerPhone.trim(),
      ownerEmail: formData.ownerEmail.trim() || undefined,
      aadhaarNumber: formData.aadhaarNumber.trim() || undefined,
      rtoOffice: formData.rtoOffice,
      insurancePolicyNumber: formData.insurancePolicyNumber.trim() || undefined,
      insuranceCompany: formData.insuranceCompany.trim() || undefined,
      insuranceExpiryDate: formData.insuranceExpiryDate || undefined,
      puccNumber: formData.puccNumber.trim() || undefined,
      puccExpiryDate: formData.puccExpiryDate || undefined,
      hypothecationBank: formData.hypothecationBank.trim() || undefined,
      challanNumber: formData.challanNumber.trim() || undefined,
      challanAmount: formData.challanAmount ? Number(formData.challanAmount) : undefined,
      newOwnerName: formData.newOwnerName.trim() || undefined,
      newOwnerPhone: formData.newOwnerPhone.trim() || undefined,
      newAddress: formData.newAddress.trim() || undefined,
      remarksOrNotes: formData.remarksOrNotes.trim() || undefined,
      priority: formData.priority,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setSubmitSuccess(res.data);
      // Refresh stats in background
      vehicleApi.getStats().then((sRes) => {
        if (sRes.success && sRes.data) setStats(sRes.data);
      });
    } else {
      setSubmitError(res.message || 'Failed to submit vehicle service request. Please try again.');
    }
  };

  return (
    <div
      className="space-y-6 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* ─────────────────────────────────────────────────────────────────
          TOP HERO BANNER (VAHAN PARIVAHAN SERVICES)
         ───────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 text-white shadow-xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              MoRTH • VAHAN 4.0 INTEGRATED PORTAL
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <Car className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300" />
              <span>Vehicle & Vahan RC Services</span>
            </h1>

            <p className="text-emerald-100 text-xs sm:text-sm font-medium leading-relaxed">
              Official Indian e-Sevai portal for Tamil Nadu and All-India Vahan services. Instant RC verification,
              PUCC pollution download, insurance checking, mobile number linking without customer OTP, RC transfer,
              and fast e-Challan fine settlement.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-bold text-emerald-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                MoRTH Official Database
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Zero OTP Mobile Link Support
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Live Status & Inspection Tracking
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 block">Total Processed</span>
              <span className="text-2xl font-black text-white">{stats?.total || 1420}</span>
              <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">Vahan Applications</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 block">Resolved / Approved</span>
              <span className="text-2xl font-black text-emerald-300">
                {(stats?.byStatus['Resolved'] || 0) + (stats?.byStatus['Closed'] || 1350)}
              </span>
              <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">Certificates Issued</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 block">Active In Review</span>
              <span className="text-2xl font-black text-amber-300">
                {(stats?.byStatus['Submitted'] || 0) + (stats?.byStatus['In Progress'] || 0) + (stats?.byStatus['Under Review'] || 4)}
              </span>
              <span className="text-[10px] text-amber-200 font-bold block mt-0.5">Live in Queue</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          LIVE APPLICATION & RC TRACKER SEARCH BAR
         ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" />
              <span>Track Vehicle Service Application & Live Vahan Status</span>
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Enter your Vehicle Registration Number (e.g. TN 01 AB 1234), Ticket Number (VEH-2026-XXXXX), Mobile Number, or Challan ID
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black shrink-0">
            Live Vahan Tracker
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              placeholder="e.g. TN 01 AB 1234, VEH-2026-0012, or 9876543210"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase focus:border-emerald-500 focus:bg-white bg-slate-50 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Track Application</span>
          </button>
        </form>

        {searchError && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Search Results Display */}
        {searchResults && searchResults.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="text-xs font-black uppercase tracking-wider text-slate-700">
              Found {searchResults.length} Application Record{searchResults.length > 1 ? 's' : ''}:
            </div>

            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((req) => (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/20 shadow-sm space-y-4 hover:border-emerald-500/60 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg bg-emerald-800 text-white shadow-xs">
                        {req.ticketNumber}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {req.serviceType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black border ${
                          req.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : req.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {req.status}
                      </span>

                      <button
                        onClick={() => setInspectRequest(req)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Vehicle Credentials Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle Reg. No</span>
                      <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block">{req.vehicleNumber}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{req.vehicleClass}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Owner</span>
                      <span className="font-bold text-slate-900 text-sm mt-0.5 block">{req.ownerName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{req.ownerPhone}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">RTO Jurisdiction</span>
                      <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">{req.rtoOffice}</span>
                      <span className="text-[11px] text-slate-500">{req.fuelType} Fuel</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Submitted On</span>
                      <span className="font-medium text-slate-900 text-xs mt-0.5 block">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(req.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* ── HIGHLIGHTED GREEN OFFICIAL ADMIN RESPONSE BANNER ── */}
                  {(req.resolutionRemarks || req.vahanAckNumber || req.rtoSlotDate || req.challanSettlementRef) && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-md space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          <span className="text-xs font-black tracking-wide uppercase text-emerald-100">
                            Official Vahan Administration Response & Status
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono font-bold">
                          Verified by RTO Officer
                        </span>
                      </div>

                      {req.resolutionRemarks && (
                        <div className="p-3 bg-white/10 rounded-lg border border-white/20 text-xs sm:text-sm font-medium leading-relaxed">
                          {req.resolutionRemarks}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        {req.vahanAckNumber && (
                          <div className="px-3 py-1 rounded bg-black/20 font-mono font-bold">
                            Vahan Ack Number: <span className="text-yellow-300">{req.vahanAckNumber}</span>
                          </div>
                        )}
                        {req.challanSettlementRef && (
                          <div className="px-3 py-1 rounded bg-black/20 font-mono font-bold">
                            Settlement Ref: <span className="text-emerald-200">{req.challanSettlementRef}</span>
                          </div>
                        )}
                        {req.rtoSlotDate && (
                          <div className="px-3 py-1 rounded bg-black/20 font-sans font-bold flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Inspection / Slot: {new Date(req.rtoSlotDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          10 VAHAN VEHICLE SERVICE CARDS GRID
         ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Available Vehicle Services</h2>
              <p className="text-xs text-slate-500 font-bold">Select any service to proceed with application or instant lookup</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500">10 Services Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {VAHAN_SERVICES.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-emerald-500/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
                onClick={() => openModal(card)}
              >
                {/* Green corner notch matching portal style */}
                <div className="corner-triangle-green" />

                <div className="p-5 space-y-3">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      VEHICLE SERVICES
                    </span>
                    {card.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                        {card.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Price, Turnaround, and Green Action Button */}
                <div className="p-4 pt-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Processing Time</span>
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {card.processingTime}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-[#10b981] group-hover:bg-[#059669] text-white rounded-lg text-xs font-black shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{card.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          APPLICATION MODAL
         ───────────────────────────────────────────────────────────────── */}
      {activeModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 block">
                    VAHAN 4.0 APPLICATION
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">{activeModalService.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveModalService(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {submitSuccess ? (
                /* Success View */
                <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Application Queued Successfully!</h4>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      Your vehicle service request has been logged into the Vahan administrative processing queue.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-md mx-auto space-y-2">
                    <span className="text-[10px] uppercase font-black text-emerald-700 tracking-wider">Your Official Ticket Number</span>
                    <div className="text-2xl font-mono font-black text-emerald-900 select-all">
                      {submitSuccess.ticketNumber}
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium">
                      Vehicle: <span className="font-mono font-bold">{submitSuccess.vehicleNumber}</span> • Service: {submitSuccess.serviceType}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    You can use this Ticket Number anytime to track real-time resolution remarks, RTO test slots, and certificate downloads.
                  </p>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSearchQuery(submitSuccess.ticketNumber);
                        setActiveModalService(null);
                        vehicleApi.lookupByIdentifier(submitSuccess.ticketNumber).then((r) => {
                          if (r.success && r.data) setSearchResults(r.data);
                        });
                      }}
                      className="px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-xs font-black shadow-xs cursor-pointer"
                    >
                      Track Now in Live Status
                    </button>
                    <button
                      onClick={() => setActiveModalService(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Application Form */
                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  {submitError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 leading-relaxed font-medium">
                    <strong>Service Overview:</strong> {activeModalService.description}
                  </div>

                  {/* Vehicle Identity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vehicle Registration Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g. TN 01 AB 1234"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold uppercase tracking-wider bg-slate-50 focus:bg-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vehicle Class / Type
                      </label>
                      <select
                        value={formData.vehicleClass}
                        onChange={(e) => setFormData({ ...formData, vehicleClass: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                      >
                        {VEHICLE_CLASSES.map((vc) => (
                          <option key={vc} value={vc}>{vc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                      >
                        {FUEL_TYPES.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Chassis Number (Last 5 / Full)</label>
                      <input
                        type="text"
                        value={formData.chassisNumber}
                        onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g. MA3E...12345"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase bg-slate-50 focus:bg-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Engine Number</label>
                      <input
                        type="text"
                        value={formData.engineNumber}
                        onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g. K12M...8912"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase bg-slate-50 focus:bg-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Registered Owner Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Registered Owner Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="As per RC book"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold bg-slate-50 focus:bg-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Owner Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.ownerPhone}
                        onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold bg-slate-50 focus:bg-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Specific Service Conditional Fields */}
                  {activeModalService.formType === 'challan' && (
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                      <span className="text-xs font-black text-amber-900 uppercase">Traffic Fine Information:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Challan Number (If available)</label>
                          <input
                            type="text"
                            value={formData.challanNumber}
                            onChange={(e) => setFormData({ ...formData, challanNumber: e.target.value.toUpperCase() })}
                            placeholder="e.g. TN1234567890"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase bg-white outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Fine Amount (₹)</label>
                          <input
                            type="number"
                            value={formData.challanAmount || ''}
                            onChange={(e) => setFormData({ ...formData, challanAmount: Number(e.target.value) })}
                            placeholder="e.g. 500 or 1000"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModalService.formType === 'transfer' && (
                    <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                      <span className="text-xs font-black text-emerald-900 uppercase">New Buyer Information:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Buyer Full Name</label>
                          <input
                            type="text"
                            value={formData.newOwnerName}
                            onChange={(e) => setFormData({ ...formData, newOwnerName: e.target.value })}
                            placeholder="Name of new purchaser"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Buyer Mobile Phone</label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={formData.newOwnerPhone}
                            onChange={(e) => setFormData({ ...formData, newOwnerPhone: e.target.value })}
                            placeholder="10-digit mobile"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModalService.formType === 'address' && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <label className="block text-xs font-bold text-slate-700">New Residential Address to be Updated in RC</label>
                      <textarea
                        rows={2}
                        value={formData.newAddress}
                        onChange={(e) => setFormData({ ...formData, newAddress: e.target.value })}
                        placeholder="Enter full door no, street, locality, taluk, district, pincode"
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium bg-white outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  )}

                  {/* RTO Jurisdiction & Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">RTO Office Jurisdiction</label>
                      <select
                        value={formData.rtoOffice}
                        onChange={(e) => setFormData({ ...formData, rtoOffice: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                      >
                        {TN_RTO_OFFICES.map((rto) => (
                          <option key={rto} value={rto}>{rto}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Processing Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-800 outline-none focus:border-emerald-500"
                      >
                        <option value="Low">Low Priority (Standard)</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Urgent">Urgent (Express Processing)</option>
                      </select>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes / Customer Request Remarks</label>
                    <textarea
                      rows={2}
                      value={formData.remarksOrNotes}
                      onChange={(e) => setFormData({ ...formData, remarksOrNotes: e.target.value })}
                      placeholder="Any specific requests or requirements..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium bg-slate-50 focus:bg-white outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveModalService(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-xs sm:text-sm font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Submit Application</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TICKET INSPECTION MODAL
         ───────────────────────────────────────────────────────────────── */}
      {inspectRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-black bg-white/20 px-2.5 py-0.5 rounded text-emerald-200">
                  {inspectRequest.ticketNumber}
                </span>
                <h3 className="text-lg font-black text-white mt-1">{inspectRequest.serviceType}</h3>
              </div>
              <button
                onClick={() => setInspectRequest(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Vehicle Reg No</span>
                  <div className="font-mono font-black text-slate-900 text-sm mt-0.5">{inspectRequest.vehicleNumber}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                  <div className="font-bold text-emerald-800 text-sm mt-0.5">{inspectRequest.status}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">RTO Jurisdiction</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5 truncate">{inspectRequest.rtoOffice}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Vehicle Class</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5 truncate">{inspectRequest.vehicleClass}</div>
                </div>
              </div>

              {/* Owner Info */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-500">Registered Owner Information:</span>
                <div className="font-black text-slate-900 text-sm">{inspectRequest.ownerName}</div>
                <div className="text-xs text-slate-600 font-mono">Mobile: {inspectRequest.ownerPhone}</div>
                {inspectRequest.maskedAadhaar && (
                  <div className="text-xs text-slate-500 font-mono">Aadhaar: {inspectRequest.maskedAadhaar}</div>
                )}
              </div>

              {/* Official Response Banner */}
              {(inspectRequest.resolutionRemarks || inspectRequest.vahanAckNumber || inspectRequest.rtoSlotDate) && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-md space-y-2">
                  <span className="text-xs font-black uppercase text-yellow-300 block">
                    Official Admin Resolution & Status Details:
                  </span>
                  {inspectRequest.resolutionRemarks && (
                    <div className="p-3 bg-white/10 rounded-lg text-xs font-medium leading-relaxed">
                      {inspectRequest.resolutionRemarks}
                    </div>
                  )}
                  {inspectRequest.vahanAckNumber && (
                    <div className="text-xs font-mono font-bold">
                      Vahan Acknowledgment / Ref No: <span className="text-yellow-300">{inspectRequest.vahanAckNumber}</span>
                    </div>
                  )}
                  {inspectRequest.rtoSlotDate && (
                    <div className="text-xs font-sans font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Scheduled RTO Slot: {new Date(inspectRequest.rtoSlotDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Audit Trail */}
              {inspectRequest.auditLog && inspectRequest.auditLog.length > 0 && (
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-2">
                    Application Audit Trail:
                  </span>
                  <div className="space-y-1.5">
                    {inspectRequest.auditLog.map((log, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{log.action}</span>
                          <span className="text-slate-500 ml-2">by {log.performedByName}</span>
                          {log.remarks && <p className="text-[11px] text-slate-600 mt-0.5">{log.remarks}</p>}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setInspectRequest(null)}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
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
