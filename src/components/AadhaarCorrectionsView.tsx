import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceIcon } from './ServiceIcon';
import { aadhaarApi, AadhaarIssue, StatsResponse } from '../services/aadhaarApi';
import {
  Search,
  Fingerprint,
  RotateCcw,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Phone,
  User,
  BarChart3,
  List,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CorrectionService {
  id: string;
  name: string;
  actionLabel: string;
  category: 'correction' | 'update' | 'reissue';
  iconType: string;
  cornerColor: 'green' | 'blue';
  actionColor: 'green' | 'blue';
  backendIssueType: string;
  defaultDescription: string;
  processingMode: string;
}

const CORRECTION_SERVICES: CorrectionService[] = [
  {
    id: 'mobile-no-update',
    name: 'MOBILE.NO UPDATE',
    actionLabel: 'ONLINE',
    category: 'correction',
    iconType: 'aadhaar-mobile-update',
    cornerColor: 'blue',
    actionColor: 'blue',
    backendIssueType: 'Mobile Number Update',
    defaultDescription: 'Request to update mobile number linked to Aadhaar.',
    processingMode: 'Online OTP & Gateway',
  },
  {
    id: 'address-update',
    name: 'APPLY FOR ADDRESS UPDATE',
    actionLabel: 'OFFLINE',
    category: 'correction',
    iconType: 'aadhaar-address-update',
    cornerColor: 'blue',
    actionColor: 'blue',
    backendIssueType: 'Address Update',
    defaultDescription: 'Request to update current residential address in Aadhaar.',
    processingMode: 'Offline Verification with Document',
  },
  {
    id: 'physical-card',
    name: 'APPLY FOR PHYSICAL CARD',
    actionLabel: 'RE-ISSUE',
    category: 'correction',
    iconType: 'aadhaar-physical-card',
    cornerColor: 'blue',
    actionColor: 'blue',
    backendIssueType: 'Aadhaar Reprint / Duplicate',
    defaultDescription: 'Request to re-issue original PVC laminated physical Aadhaar card.',
    processingMode: 'UIDAI Speed Post Dispatch',
  },
  {
    id: 're-kyc',
    name: 'AADHAR RE-KYC',
    actionLabel: 'UPDATE',
    category: 'correction',
    iconType: 'aadhaar-rekyc',
    cornerColor: 'blue',
    actionColor: 'blue',
    backendIssueType: 'Aadhaar Unlocking',
    defaultDescription: 'Complete biometric / demographic Re-KYC authentication.',
    processingMode: 'Biometric Authentication',
  },
  {
    id: 'name-dob-correction',
    name: 'NAME & DOB CORRECTION',
    actionLabel: 'CORRECTION',
    category: 'correction',
    iconType: 'aadhaar-doc',
    cornerColor: 'blue',
    actionColor: 'blue',
    backendIssueType: 'Name Correction',
    defaultDescription: 'Request to correct spelling of name or date of birth in Aadhaar.',
    processingMode: 'Supporting Certificate Required',
  },
  {
    id: 'biometric-update',
    name: 'BIOMETRIC UPDATE',
    actionLabel: 'OFFLINE',
    category: 'update',
    iconType: 'laptop-bio',
    cornerColor: 'green',
    actionColor: 'green',
    backendIssueType: 'Biometric Update',
    defaultDescription: 'Mandatory biometric update (iris / fingerprint / facial photo).',
    processingMode: 'Enrolment Center Appointment',
  },
  {
    id: 'bank-seeding',
    name: 'AADHAAR BANK SEEDING',
    actionLabel: 'NPCI LINK',
    category: 'correction',
    iconType: 'bank-aadhaar',
    cornerColor: 'blue',
    actionColor: 'blue',
    backendIssueType: 'Aadhaar Linking (Bank / Mobile)',
    defaultDescription: 'Resolve Aadhaar NPCI bank account mapping issue for DBT subsidies.',
    processingMode: 'Direct Bank Server Verification',
  },
  {
    id: 'photo-update',
    name: 'PHOTO & GENDER UPDATE',
    actionLabel: 'UPDATE',
    category: 'correction',
    iconType: 'know-aadhaar',
    cornerColor: 'green',
    actionColor: 'green',
    backendIssueType: 'Photo Update',
    defaultDescription: 'Update photograph or correct gender recorded on Aadhaar.',
    processingMode: 'Official UIDAI Update',
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

export const AadhaarCorrectionsView: React.FC = () => {
  const { setActiveTab } = useApp();

  // Search and Category Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'correction' | 'update' | 'reissue' | 'tickets'>('all');

  // Modal Form State
  const [selectedService, setSelectedService] = useState<CorrectionService | null>(null);
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    applicantName: '',
    applicantPhone: '',
    applicantEmail: '',
    issueDescription: '',
    priority: 'Medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Issues Listing State
  const [recentIssues, setRecentIssues] = useState<AadhaarIssue[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);

  // Aadhaar Specific Lookup State
  const [aadhaarLookupInput, setAadhaarLookupInput] = useState('');
  const [lookupResult, setLookupResult] = useState<{
    summary: { totalIssues: number; byStatus: Record<string, number>; byIssueType: Record<string, number> };
    issues: AadhaarIssue[];
  } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Selected Issue for Detail Modal
  const [inspectIssue, setInspectIssue] = useState<AadhaarIssue | null>(null);

  // Load Recent Issues & Stats
  const loadIssuesAndStats = useCallback(async () => {
    const [issuesRes, statsRes] = await Promise.all([
      aadhaarApi.listIssues({ limit: 10 }),
      aadhaarApi.getStats(),
    ]);
    if (issuesRes.success && issuesRes.data) {
      setRecentIssues(issuesRes.data.issues);
    }
    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data);
    }
  }, []);

  // Polling every 5 seconds so admin responses show up in real-time
  useEffect(() => {
    loadIssuesAndStats();
    const interval = setInterval(() => {
      loadIssuesAndStats();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadIssuesAndStats]);

  // Find all issues with admin response or updated status
  const respondedIssues = recentIssues.filter(
    (i) => (i.resolutionRemarks && i.resolutionRemarks.trim().length > 0) || (i.status && i.status !== 'Submitted')
  );
  const latestAdminResponse = respondedIssues.length > 0 ? respondedIssues[0] : null;

  // Filter Services by Category and Search Term
  const filteredServices = CORRECTION_SERVICES.filter((srv) => {
    if (activeCategory === 'correction') {
      return ['mobile-no-update', 'address-update', 'physical-card', 're-kyc', 'name-dob-correction', 'biometric-update', 'bank-seeding', 'photo-update'].includes(srv.id);
    }
    if (activeCategory !== 'all' && activeCategory !== 'tickets' && srv.category !== activeCategory) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        srv.name.toLowerCase().includes(q) ||
        srv.actionLabel.toLowerCase().includes(q) ||
        srv.backendIssueType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Open Form Modal for Selected Service
  const handleOpenService = (service: CorrectionService) => {
    setSelectedService(service);
    setFormData({
      aadhaarNumber: '',
      applicantName: '',
      applicantPhone: '',
      applicantEmail: '',
      issueDescription: service.defaultDescription,
      priority: 'Medium',
    });
    setFieldErrors({});
    setSubmitSuccess(null);
  };

  // Submit Form Handler
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

    setIsSubmitting(true);
    const res = await aadhaarApi.submitIssue({
      aadhaarNumber: cleanAadhaar,
      applicantName: formData.applicantName.trim(),
      applicantPhone: cleanPhone,
      applicantEmail: formData.applicantEmail.trim(),
      issueType: selectedService.backendIssueType,
      issueDescription: formData.issueDescription.trim(),
      priority: formData.priority,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      setSubmitSuccess(res.data.issue.ticketNumber);
      loadIssuesAndStats();
    } else if (res.errors && res.errors.length > 0) {
      const errMap: Record<string, string> = {};
      res.errors.forEach((err) => {
        errMap[err.field] = err.message;
      });
      setFieldErrors(errMap);
    } else {
      setFieldErrors({ general: res.message || 'Submission failed. Please try again.' });
    }
  };

  // Aadhaar Number Search Handler
  const handleAadhaarLookup = async () => {
    const cleanNum = aadhaarLookupInput.replace(/\D/g, '');
    if (cleanNum.length !== 12) {
      setLookupError('Enter exactly 12 digits.');
      return;
    }
    setLookupError('');
    setIsLookingUp(true);
    const res = await aadhaarApi.getByAadhaar(cleanNum);
    setIsLookingUp(false);

    if (res.success && res.data) {
      setLookupResult({
        summary: res.data.summary,
        issues: res.data.issues,
      });
    } else {
      setLookupError(res.message || 'No issues found for this Aadhaar number.');
      setLookupResult(null);
    }
  };

  return (
    <div
      className="space-y-5 pb-16 max-w-[1600px] mx-auto animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* ─────────────────────────────────────────────────────────────────
          PROMINENT HIGHLIGHT BANNER: ADMIN RESPONSE RECEIVED
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
                  OFFICIAL ADMIN RESPONSE
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
              </div>

              <div className="text-sm sm:text-base font-black text-emerald-950 flex items-start gap-1.5 pt-0.5">
                <span className="text-emerald-600 text-lg leading-none">“</span>
                <span className="leading-snug">
                  {latestAdminResponse.resolutionRemarks || `Ticket status updated to "${latestAdminResponse.status}" by Administrator.`}
                </span>
                <span className="text-emerald-600 text-lg leading-none">”</span>
              </div>

              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-2">
                <span>Issue: <strong>{latestAdminResponse.issueType}</strong></span>
                <span>•</span>
                <span>Updated on {new Date(latestAdminResponse.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} by Administrator</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setInspectIssue(latestAdminResponse)}
            className="px-5 py-2.5 bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>View Full Details</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TOP CONTAINER CARD (MATCHING PORTAL'S CLEAN WHITE & SLATE STYLE)
         ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-2 text-emerald-600 shadow-2xs">
                <Fingerprint className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Aadhaar Corrections
                </h1>
                <p className="text-sm text-slate-500 font-bold">
                  Quick filters • tap category or search service
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
                onClick={() => setActiveCategory('update')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'update'
                    ? 'bg-[#10b981] text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                Update
              </button>

              <button
                onClick={() => setActiveCategory('reissue')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'reissue'
                    ? 'bg-[#eab308] text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                Re-Issue
              </button>

              <button
                onClick={() => setActiveCategory('tickets')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'tickets'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Track Tickets ({stats?.total || 0})</span>
              </button>
            </div>
          </div>

          {/* Quick Search and Action */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Quick search services..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl outline-hidden transition-all shadow-inner font-medium"
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

        {/* ── SHELF CONTENT: VERTICAL RIBBON + GRID OF CARDS ── */}
        {activeCategory !== 'tickets' && (
          <div className="bg-white/90 rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch gap-3 transition-all hover:border-slate-300">
            {/* Left Vertical Ribbon matching reference image (coral/red CORRECTION) */}
            <div className="bg-[#f43f5e] text-white font-black text-xs sm:text-sm tracking-widest rounded-xl px-2.5 py-3 sm:py-4 flex sm:flex-col items-center justify-center shrink-0 uppercase shadow-xs sm:w-12 min-h-[44px]">
              <span className="sm:hidden font-bold">CORRECTION</span>
              <span className="hidden sm:inline [writing-mode:vertical-rl] rotate-180 text-center tracking-widest font-black">
                CORRECTION
              </span>
            </div>

            {/* Grid of Service Cards matching ServiceCard component */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredServices.map((service) => {
                const isBlueBtn = service.actionColor === 'blue';

                return (
                  <div
                    key={service.id}
                    onClick={() => handleOpenService(service)}
                    className="group relative bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer select-none min-h-[195px] sm:min-h-[205px]"
                  >
                    {/* Top Left Triangle Fold Notch */}
                    <div
                      className={service.cornerColor === 'blue' ? 'corner-triangle-blue' : 'corner-triangle-green'}
                    />

                    {/* Center Icon & Title */}
                    <div className="pt-4 px-2.5 pb-2.5 flex flex-col items-center text-center flex-1 justify-center">
                      <div className="transform group-hover:scale-106 transition-transform duration-200 mb-2">
                        <ServiceIcon type={service.iconType} className="w-16 h-16 sm:w-18 sm:h-18" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug tracking-tight uppercase line-clamp-2 px-1">
                        {service.name}
                      </h3>
                    </div>

                    {/* Bottom Action Button matching reference portal */}
                    <div
                      className={`w-full py-2 px-1 text-center font-black text-xs sm:text-sm tracking-wide uppercase text-white transition-colors duration-150 rounded-b-xl ${
                        isBlueBtn
                          ? 'bg-[#1d4ed8] group-hover:bg-[#1e40af]'
                          : 'bg-[#10b981] group-hover:bg-[#059669]'
                      }`}
                    >
                      {service.actionLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LIVE AADHAAR NUMBER LOOKUP & TICKETS SECTION ── */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Track Issues by Aadhaar Number</span>
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

          {/* Aadhaar Input Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
            <div className="relative flex-1">
              <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={12}
                value={aadhaarLookupInput}
                onChange={(e) => {
                  setAadhaarLookupInput(e.target.value.replace(/\D/g, ''));
                  setLookupError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAadhaarLookup()}
                placeholder="12 Digit Aadhaar Number"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-mono font-medium"
              />
            </div>
            <button
              onClick={handleAadhaarLookup}
              disabled={isLookingUp}
              className="px-6 py-2.5 bg-[#00a86b] hover:bg-[#008f5b] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search Aadhaar</span>
            </button>
            {lookupResult && (
              <button
                onClick={() => {
                  setLookupResult(null);
                  setAadhaarLookupInput('');
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

          {/* Specific Aadhaar Lookup Results Banner & Table */}
          {lookupResult && (
            <div className="p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs sm:text-sm font-black text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Found {lookupResult.summary.totalIssues} linked issue(s) for this Aadhaar</span>
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

              {lookupResult.issues.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No tickets submitted for this Aadhaar number yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-emerald-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-emerald-50/80 text-emerald-950 font-black uppercase border-b border-emerald-100">
                      <tr>
                        <th className="py-2.5 px-3">Ticket No</th>
                        <th className="py-2.5 px-3">Applicant Name</th>
                        <th className="py-2.5 px-3">Issue Type & Admin Response</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {lookupResult.issues.map((issue) => (
                        <tr
                          key={issue._id}
                          className={`transition-colors ${
                            issue.resolutionRemarks
                              ? 'bg-emerald-50/60 hover:bg-emerald-50/90 border-l-4 border-l-emerald-500'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                            {issue.ticketNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 font-bold">
                            {issue.applicantName}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="text-slate-800 font-bold">{issue.issueType}</div>

                            {/* Prominent Admin Response Highlight Box */}
                            {issue.resolutionRemarks && (
                              <div className="mt-1.5 p-2 bg-emerald-100/90 border border-emerald-300 rounded-lg text-emerald-950 text-xs shadow-2xs">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                  <span className="font-black text-emerald-900 uppercase text-[9px] tracking-wider">
                                    Official Admin Response:
                                  </span>
                                </div>
                                <p className="font-black text-emerald-950 leading-relaxed">
                                  "{issue.resolutionRemarks}"
                                </p>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold">{issue.priority}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                                STATUS_BADGES[issue.status] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {issue.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setInspectIssue(issue)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer text-xs transition-colors shadow-2xs"
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

          {/* Recent Global Issues Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span>Recently Submitted Citizen Requests</span>
              <button
                onClick={loadIssuesAndStats}
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
                    <th className="py-3 px-4">Aadhaar (Masked)</th>
                    <th className="py-3 px-4">Service & Admin Response</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentIssues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                        No issue tickets found. Click any service card above to submit an Aadhaar correction.
                      </td>
                    </tr>
                  ) : (
                    recentIssues.map((issue) => {
                      const hasAdminResponse = !!(issue.resolutionRemarks && issue.resolutionRemarks.trim());

                      return (
                        <tr
                          key={issue._id}
                          className={`transition-colors ${
                            hasAdminResponse
                              ? 'bg-emerald-50/50 hover:bg-emerald-50/80 border-l-4 border-l-emerald-500'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {issue.ticketNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{issue.applicantName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{issue.applicantPhone}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{issue.maskedAadhaar}</td>
                          <td className="py-3 px-4 max-w-sm">
                            <div className="text-slate-800 font-bold">{issue.issueType}</div>

                            {/* PROMINENT ADMIN RESPONSE HIGHLIGHT BOX */}
                            {hasAdminResponse ? (
                              <div className="mt-1.5 p-2 bg-emerald-100/90 border border-emerald-300 rounded-lg text-emerald-950 font-bold text-xs flex items-start gap-1.5 shadow-2xs">
                                <span className="bg-emerald-700 text-white font-black text-[9px] uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                                  ADMIN RESPONSE
                                </span>
                                <span className="leading-tight text-emerald-950">
                                  "{issue.resolutionRemarks}"
                                </span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                Awaiting admin processing
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                issue.priority === 'High' || issue.priority === 'Urgent'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {issue.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                                STATUS_BADGES[issue.status] || 'bg-slate-50 text-slate-700'
                              }`}
                            >
                              {issue.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setInspectIssue(issue)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                                hasAdminResponse
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {hasAdminResponse ? 'View Response' : 'View Ticket'}
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
          MODAL: SUBMIT FORM WITH PORTAL'S HEADER GRADIENT & THEME
         ───────────────────────────────────────────────────────────────── */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-1">
                  <ServiceIcon type={selectedService.iconType} className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight uppercase text-white">
                    {selectedService.name}
                  </h3>
                  <p className="text-xs text-emerald-200 font-medium">{selectedService.processingMode}</p>
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
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {submitSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h4 className="text-xl font-black text-slate-800">Application Recorded Successfully!</h4>
                  <p className="text-sm text-slate-600">
                    Your Aadhaar correction ticket has been created and queued for processing:
                  </p>
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl font-mono text-base font-black text-emerald-800 inline-block px-6">
                    {submitSuccess}
                  </div>
                  <div className="pt-4 flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSubmitSuccess(null);
                        setSelectedService(null);
                      }}
                      className="px-6 py-2 bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {fieldErrors.general && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {fieldErrors.general}
                    </div>
                  )}

                  {/* Section Title */}
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Application Credentials</span>
                  </div>

                  {/* Aadhaar Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      12-Digit Aadhaar Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={12}
                        value={formData.aadhaarNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })
                        }
                        placeholder="12 Digit Aadhaar Number"
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono tracking-widest font-medium focus:border-emerald-500 outline-hidden"
                        required
                      />
                    </div>
                    {fieldErrors.aadhaarNumber && (
                      <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.aadhaarNumber}</p>
                    )}
                  </div>

                  {/* Applicant Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Applicant Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.applicantName}
                          onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                          placeholder="Enter Applicant Name"
                          className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                          required
                        />
                      </div>
                      {fieldErrors.applicantName && (
                        <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.applicantName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          maxLength={10}
                          value={formData.applicantPhone}
                          onChange={(e) =>
                            setFormData({ ...formData, applicantPhone: e.target.value.replace(/\D/g, '') })
                          }
                          placeholder="Enter Mobile No"
                          className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden"
                          required
                        />
                      </div>
                      {fieldErrors.applicantPhone && (
                        <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.applicantPhone}</p>
                      )}
                    </div>
                  </div>

                  {/* Issue Description / Instructions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Issue Description / Specific Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.issueDescription}
                      onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                      placeholder="Specify the exact change needed..."
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-hidden resize-none"
                      required
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High', 'Urgent'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: lvl })}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            formData.priority === lvl
                              ? 'bg-[#00a86b] text-white border-[#00a86b] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
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
                      className="px-6 py-2 bg-[#00a86b] hover:bg-[#008f5b] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Form</span>
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
          MODAL: INSPECT SPECIFIC ISSUE TICKET & AUDIT TRAIL
         ───────────────────────────────────────────────────────────────── */}
      {inspectIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-300">{inspectIssue.ticketNumber}</span>
                <h3 className="font-bold text-base text-white">{inspectIssue.issueType}</h3>
              </div>
              <button
                onClick={() => setInspectIssue(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* HIGHLIGHTED OFFICIAL ADMIN RESPONSE BOX (TOP OF MODAL) */}
              {inspectIssue.resolutionRemarks ? (
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
                      Status: {inspectIssue.status}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white border border-emerald-200 rounded-xl text-emerald-950 font-black text-sm sm:text-base leading-relaxed shadow-2xs">
                    "{inspectIssue.resolutionRemarks}"
                  </div>

                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Updated on {new Date(inspectIssue.updatedAt).toLocaleString('en-IN')} by Administrator</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Awaiting admin review. Once processed, the official response will be highlighted here.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Applicant</span>
                  <div className="text-sm font-bold text-slate-800">{inspectIssue.applicantName}</div>
                  <div className="text-slate-500">{inspectIssue.applicantPhone}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Aadhaar (Masked)</span>
                  <div className="text-sm font-mono font-bold text-slate-800">{inspectIssue.maskedAadhaar}</div>
                  <div className="text-slate-500">Priority: {inspectIssue.priority}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Current Status</span>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full font-bold border ${STATUS_BADGES[inspectIssue.status] || 'bg-slate-100'}`}>
                    {inspectIssue.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Citizen Query / Details</span>
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 leading-relaxed font-medium mt-1">
                  {inspectIssue.issueDescription}
                </div>
              </div>

              {/* Audit Log Entries */}
              {inspectIssue.auditLog && inspectIssue.auditLog.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Audit History Timeline</span>
                  <div className="space-y-2 mt-2">
                    {[...inspectIssue.auditLog].reverse().map((entry, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
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
                  onClick={() => setInspectIssue(null)}
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
