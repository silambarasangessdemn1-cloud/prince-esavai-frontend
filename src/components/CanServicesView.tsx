import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Send,
  Loader2,
  RotateCcw,
  Phone,
  Fingerprint,
  List,
  Trash2,
  Upload,
  CreditCard,
  FileCheck,
  FileEdit,
  ShieldCheck,
  SearchCode,
  Users,
  Trash,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { ServiceIcon } from './ServiceIcon';
import { useApp } from '../context/AppContext';
import { paymentApi } from '../services/paymentApi';
import confetti from 'canvas-confetti';

// ─────────────────────────────────────────────────────────────────────────────
//  CAN Services Definitions (TNeGA e-Sevai reference portal)
// ─────────────────────────────────────────────────────────────────────────────

export interface CanServiceCard {
  id: string;
  name: string;
  tamilSubtitle: string;
  actionLabel: string;
  category: 'application' | 'certificate' | 'can_edit';
  iconType: string;
  cornerColor: 'green' | 'blue';
  actionColor: 'green' | 'blue';
  backendServiceType: string;
  defaultDescription: string;
  needTypePlaceholder: string;
  needTypeLabel: string;
}

export interface UploadedDoc {
  name: string;
  dataUrl: string;
  size: number;
}

export interface CanRequestRecord {
  id: string;
  ticketNumber: string;
  serviceId: string;
  serviceName: string;
  aadhaarNumber: string;
  customerPhone: string;
  canNumber?: string;
  needType: string;
  documentName?: string;
  documentUrl?: string;
  status: string;
  createdAt: string;
  remarks?: string;
}

const CAN_SERVICES: CanServiceCard[] = [
  {
    id: 'can-saved-app-remove',
    name: 'SAVED APPLICATION REMOVE (சேமிக்கப்பட்ட விண்ணப்பம் நீக்கம்)',
    tamilSubtitle: 'சேமிக்கப்பட்ட விண்ணப்பம் நீக்கம்',
    actionLabel: 'REMOVE SAVED',
    category: 'application',
    iconType: 'msme-doc',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Saved Application Remove',
    defaultDescription: 'Remove or delete draft pending application from TNeGA e-Sevai portal inbox.',
    needTypeLabel: 'சேமிக்கப்பட்ட விண்ணப்ப எண் / துறை விவரம் (Saved Application ID & Details)',
    needTypePlaceholder: 'e.g. TN-72023... அல்லது பட்டா / வருமான சான்றிதழ் விண்ணப்ப எண் மற்றும் நீக்கக் காரணம்...',
  },
  {
    id: 'can-return-app-remove',
    name: 'RETURN APPLICATION REMOVE (திருப்பி அனுப்பப்பட்ட விண்ணப்பம் நீக்கம்)',
    tamilSubtitle: 'ரிட்டர்ன் விண்ணப்பம் நீக்கம்',
    actionLabel: 'REMOVE RETURN',
    category: 'application',
    iconType: 'aadhaar-doc',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Return Application Remove',
    defaultDescription: 'Clear or remove rejected/returned citizen application from portal account.',
    needTypeLabel: 'திருப்பி அனுப்பப்பட்ட விண்ணப்ப எண் & காரணம் (Return Application No & Remarks)',
    needTypePlaceholder: 'e.g. TN-72024... திருப்பி அனுப்பப்பட்ட விண்ணப்ப எண் மற்றும் விவரங்கள்...',
  },
  {
    id: 'can-certificate-find',
    name: 'CERTIFICATE FIND (சான்றிதழ் கண்டறிதல்)',
    tamilSubtitle: 'சான்றிதழ் கண்டறிதல்',
    actionLabel: 'FIND CERTIFICATE',
    category: 'certificate',
    iconType: 'find-card',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Certificate Find',
    defaultDescription: 'Search & retrieve issued TN e-District certificates (Community, Income, Nativity, etc.).',
    needTypeLabel: 'தேவையான சான்றிதழ் வகை & விவரங்கள் (Certificate Type / Details Required)',
    needTypePlaceholder: 'e.g. ஜாதி சான்றிதழ் (Community) / வருமான சான்றிதழ் (Income) / இருப்பிட சான்றிதழ் (Nativity)...',
  },
  {
    id: 'can-legal-heir-find',
    name: 'LEGAL HEIR CERTIFICATE FIND (வாரிசு சான்றிதழ் கண்டறிதல்)',
    tamilSubtitle: 'வாரிசு சான்றிதழ் கண்டறிதல்',
    actionLabel: 'FIND LEGAL HEIR',
    category: 'certificate',
    iconType: 'birth',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Legal Heir Certificate Find',
    defaultDescription: 'Track, find & retrieve issued Legal Heir / Varisu Certificate from revenue records.',
    needTypeLabel: 'இறந்தவர் பெயர் & விவரங்கள் (Deceased Name, Year of Death, Taluk Details)',
    needTypePlaceholder: 'e.g. இறந்தவர் பெயர், இறந்த ஆண்டு, தாலுகா, குடும்ப வாரிசுதாரர்கள் விவரம்...',
  },
  {
    id: 'can-deleted',
    name: 'CAN DELETED / SURRENDER (CAN எண் நீக்கம்)',
    tamilSubtitle: 'CAN எண் நீக்கம்',
    actionLabel: 'DELETE CAN',
    category: 'can_edit',
    iconType: 'can-user',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'CAN Deleted',
    defaultDescription: 'Delete or surrender duplicate, erroneous, or unused CAN registration number.',
    needTypeLabel: 'நீக்கப்பட வேண்டிய CAN எண் & காரணம் (CAN Number to Delete & Reason)',
    needTypePlaceholder: 'e.g. 13 இலக்க CAN எண் (033...) மற்றும் நீக்குவதற்கான காரணம்...',
  },
  {
    id: 'can-mobile-link',
    name: 'CAN MOBILE NUMBER LINK (செல் எண் இணைத்தல்)',
    tamilSubtitle: 'CAN செல் எண் இணைத்தல்',
    actionLabel: 'LINK MOBILE',
    category: 'can_edit',
    iconType: 'link-mobile',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'CAN Mobile Number Link',
    defaultDescription: 'Link new active 10-digit mobile number with citizen CAN number without OTP.',
    needTypeLabel: 'CAN எண் & புதிய எண் இணைப்பு விவரம் (CAN Number & Linking Details)',
    needTypePlaceholder: 'e.g. CAN எண் (033...) மற்றும் இணைக்கப்பட வேண்டிய புதிய மொபைல் எண் விவரங்கள்...',
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
//  Reusable Proof File Upload Component
// ─────────────────────────────────────────────────────────────────────────────

interface FileUploadFieldProps {
  label: string;
  tamilLabel?: string;
  file?: UploadedDoc | null;
  onChange: (doc: UploadedDoc) => void;
  onRemove: () => void;
  error?: string;
  required?: boolean;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  tamilLabel,
  file,
  onChange,
  onRemove,
  error,
  required = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      alert('File size must be less than 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange({
        name: f.name,
        dataUrl: reader.result as string,
        size: f.size,
      });
    };
    reader.readAsDataURL(f);
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">
        <span>{tamilLabel ? `${tamilLabel} (${label})` : label}</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {file ? (
        <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-300 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {file.dataUrl.startsWith('data:image/') ? (
              <img
                src={file.dataUrl}
                alt="Aadhaar preview"
                className="w-10 h-10 rounded-lg object-cover border border-emerald-300 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                PDF
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
              <p className="text-[10px] text-emerald-700 font-semibold font-mono">
                {(file.size / 1024).toFixed(0)} KB • Ready
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            title="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`w-full py-3 px-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              error
                ? 'border-red-400 bg-red-50/50 text-red-600'
                : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 text-slate-600'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">Choose Proof Photo (Aadhaar Card Photo)</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      )}
      {error && <p className="text-[11px] text-red-600 font-bold mt-1">{error}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main CAN Services View Component
// ─────────────────────────────────────────────────────────────────────────────
export const CanServicesView: React.FC = () => {
  const { setActiveTab, getServicePrice, openPaymentDialog, addApplication, applications } = useApp();

  // Category filter
  const [activeCategory, setActiveCategory] = useState<'all' | 'application' | 'certificate' | 'can_edit' | 'tickets'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<CanServiceCard | null>(null);
  const [inspectRequest, setInspectRequest] = useState<CanRequestRecord | null>(null);

  // Form Fields State (Strictly: Proof / Aadhaar Photo, Aadhaar Number, Customer Contact Number, Need Type)
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    customerPhone: '',
    needType: '',
    canNumber: '',
  });

  const [aadhaarPhoto, setAadhaarPhoto] = useState<UploadedDoc | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Lookup / Tracking bar
  const [lookupInput, setLookupInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<CanRequestRecord[] | null>(null);
  const [lookupError, setLookupError] = useState('');

  // Extract CAN applications from AppContext & LocalStorage
  const getCanRequests = useCallback((): CanRequestRecord[] => {
    try {
      const canApps = applications.filter(
        (app) => app.serviceId.startsWith('can-') || app.serviceName.toLowerCase().includes('can')
      );

      return canApps.map((a) => {
        const details = a.details || {};
        return {
          id: a.id,
          ticketNumber: details.ticketNumber || a.tokenNumber,
          serviceId: a.serviceId,
          serviceName: a.serviceName,
          aadhaarNumber: details.aadhaarNumber || '---',
          customerPhone: a.mobile,
          canNumber: details.canNumber,
          needType: details.needType || 'General CAN Requirement',
          documentName: a.documents?.[0]?.name,
          documentUrl: a.documents?.[0]?.url,
          status: a.status || 'Under Review',
          createdAt: a.date,
          remarks: a.remarks,
        };
      });
    } catch {
      return [];
    }
  }, [applications]);

  const recentRequests = getCanRequests();

  // Filter service cards
  const filteredServices = CAN_SERVICES.filter((service) => {
    const matchesCategory =
      activeCategory === 'all' ||
      activeCategory === 'tickets' ||
      service.category === activeCategory;

    const matchesSearch =
      !searchTerm ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.tamilSubtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.defaultDescription.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Open modal
  const handleOpenService = (service: CanServiceCard) => {
    setSelectedService(service);
    setSubmitSuccess(null);
    setFieldErrors({});
    setFormData({
      aadhaarNumber: '',
      customerPhone: '',
      needType: '',
      canNumber: '',
    });
    setAadhaarPhoto(null);
  };

  // Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const errors: Record<string, string> = {};

    // 1. Proof: Aadhaar Card Photo
    if (!aadhaarPhoto) {
      errors.aadhaarPhoto = 'ஆதார் கார்டு போட்டோ பதிவேற்றம் செய்க (Aadhaar Card Photo Proof is required).';
    }

    // 2. Aadhaar Card Number (12 digits)
    const cleanAadhaar = formData.aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      errors.aadhaarNumber = '12 இலக்க சரியான ஆதார் எண் தேவை (Aadhaar must be exactly 12 digits).';
    }

    // 3. Customer Contact Number (10 digits)
    const cleanPhone = formData.customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errors.customerPhone = '10 இலக்க மொபைல் எண் தேவை (10-digit customer phone number required).';
    }

    // 4. Need Type
    if (!formData.needType.trim()) {
      errors.needType = 'தேவை விவரங்களை உள்ளிடவும் (Need Type / Details are required).';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const fee = getServicePrice(selectedService.id);
    const applicantIdentifier = `Aadhaar: ${cleanAadhaar}`;

    // Prompt UPI QR payment modal before completing submission
    openPaymentDialog({
      serviceName: selectedService.name,
      categoryLabel: 'CAN SERVICES',
      amount: fee,
      applicantName: applicantIdentifier,
      applicantPhone: cleanPhone,
      onConfirmed: async (paymentDetails) => {
        setIsSubmitting(true);
        setFieldErrors({});

        const ticketNum = `CAN-${Date.now()}`;

        // Package uploaded document
        const documentsList: Array<{ name: string; url: string; type?: string }> = [];
        if (aadhaarPhoto) {
          documentsList.push({ name: 'Aadhaar Card Photo Proof', url: aadhaarPhoto.dataUrl });
        }

        // Add to local & history storage
        addApplication({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          applicantName: applicantIdentifier,
          mobile: cleanPhone,
          status: 'Under Review',
          fee,
          walletType: 'payments',
          details: {
            ...formData,
            ticketNumber: ticketNum,
            serviceType: selectedService.backendServiceType,
            needTypeLabel: selectedService.needTypeLabel,
          },
          documents: documentsList as any,
          remarks: `Payment of ₹${paymentDetails.paidAmount} submitted with UTR: ${paymentDetails.utrNumber}. TNeGA e-Sevai operator will process request.`,
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
          // Record payment in payments DB
          await paymentApi.submitPayment({
            ticketNumber: ticketNum,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            category: 'CAN',
            applicantName: applicantIdentifier,
            applicantPhone: cleanPhone,
            amount: paymentDetails.paidAmount,
            utrNumber: paymentDetails.utrNumber,
            upiIdUsed: paymentDetails.upiIdUsed,
            paymentScreenshot: paymentDetails.paymentScreenshot,
            paymentMethod: 'UPI QR',
            status: 'Pending Verification',
          });
        } catch (err: any) {
          console.warn('Backend payment record error:', err);
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  // Lookup Handler
  const handleLookup = () => {
    if (!lookupInput.trim()) {
      setLookupError('Please enter an Aadhaar Number, CAN Number, or Customer Mobile.');
      return;
    }

    setIsLookingUp(true);
    setLookupError('');
    setLookupResult(null);

    const term = lookupInput.trim().toLowerCase();
    const all = getCanRequests();

    const matched = all.filter((r) => {
      return (
        r.ticketNumber.toLowerCase().includes(term) ||
        r.aadhaarNumber.toLowerCase().includes(term) ||
        r.customerPhone.toLowerCase().includes(term) ||
        (r.canNumber && r.canNumber.toLowerCase().includes(term))
      );
    });

    if (matched.length > 0) {
      setLookupResult(matched);
    } else {
      setLookupError('No matching CAN requests found for this identifier.');
    }

    setIsLookingUp(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─────────────────────────────────────────────────────────────────
          TOP SHELF: TITLE, CATEGORY PILLS & SEARCH BAR
         ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileEdit className="w-6 h-6 text-emerald-700" />
              <span>CAN SERVICES (TNeGA e-SEVAI)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Citizen Access Number (CAN) Services, Application Cleanup & Certificate Retrieval
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Official TNeGA e-Sevai Service Queue Active</span>
          </div>
        </div>

        {/* Categories & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Services ({CAN_SERVICES.length})
            </button>

            <button
              onClick={() => setActiveCategory('application')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'application'
                  ? 'bg-[#00a86b] text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              Application Removal (விண்ணப்ப நீக்கம்)
            </button>

            <button
              onClick={() => setActiveCategory('certificate')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'certificate'
                  ? 'bg-[#eab308] text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              Certificate Retrieval (சான்றிதழ் கண்டறிதல்)
            </button>

            <button
              onClick={() => setActiveCategory('can_edit')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'can_edit'
                  ? 'bg-[#15803d] text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              CAN Number Edit / Link (CAN மேலாண்மை)
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
              <span>Track Requests ({recentRequests.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search CAN services..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-lime-500 rounded-xl outline-hidden transition-all font-medium"
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

        {/* ── SHELF CONTENT: VERTICAL RIBBON + GRID OF CAN SERVICE CARDS ── */}
        {activeCategory !== 'tickets' && (
          <div className="bg-white/90 rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch gap-3 transition-all hover:border-slate-300">
            {/* Left Vertical Ribbon */}
            <div className="bg-[#15803d] text-white font-black text-xs sm:text-sm tracking-widest rounded-xl px-2.5 py-3 sm:py-4 flex sm:flex-col items-center justify-center shrink-0 uppercase shadow-xs sm:w-12 min-h-[44px]">
              <span className="sm:hidden font-bold">CAN SERVICES</span>
              <span className="hidden sm:inline [writing-mode:vertical-rl] rotate-180 text-center tracking-widest font-black">
                CAN SERVICES
              </span>
            </div>

            {/* Grid of Cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleOpenService(service)}
                  className="group relative bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-lime-500 transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer select-none min-h-[200px]"
                >
                  {/* Top-left Green Triangle Fold */}
                  <div className="corner-triangle-green" />

                  {/* Center Icon & Title */}
                  <div className="pt-4 px-3 pb-2.5 flex flex-col items-center text-center flex-1 justify-center">
                    <div className="transform group-hover:scale-106 transition-transform duration-200 mb-2">
                      <ServiceIcon type={service.iconType} className="w-16 h-16 sm:w-18 sm:h-18" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug tracking-tight uppercase line-clamp-2 px-1">
                      {service.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2">
                      {service.defaultDescription}
                    </p>
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

        {/* ── LIVE CAN / AADHAAR LOOKUP SECTION ── */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-600" />
              <span>Track CAN Requests by Aadhaar Number / CAN / Mobile</span>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
            <div className="relative flex-1">
              <SearchCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lookupInput}
                onChange={(e) => {
                  setLookupInput(e.target.value.toUpperCase());
                  setLookupError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="Enter 12-digit Aadhaar / CAN No / Mobile"
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
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm font-black text-lime-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-lime-700" />
                  <span>Found {lookupResult.length} CAN application(s)</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-lime-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-lime-50/80 text-lime-950 font-black uppercase border-b border-lime-100">
                    <tr>
                      <th className="py-2.5 px-3">Ticket No</th>
                      <th className="py-2.5 px-3">Service Type</th>
                      <th className="py-2.5 px-3">Aadhaar / Mobile</th>
                      <th className="py-2.5 px-3">Need Type / Details</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {lookupResult.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {req.ticketNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 font-bold">{req.serviceName}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono text-xs text-emerald-800 font-bold">{req.aadhaarNumber}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{req.customerPhone}</div>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-slate-600">{req.needType}</td>
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
                            className="px-3 py-1 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg font-bold cursor-pointer text-xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── RECENT CITIZEN CAN REQUESTS TABLE ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span>Recently Submitted CAN Applications</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Ticket Number</th>
                    <th className="py-3 px-4">Service Type</th>
                    <th className="py-3 px-4">Aadhaar & Mobile</th>
                    <th className="py-3 px-4">Need Type / Requirement</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                        No CAN application tickets found. Click any service card above to apply.
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {req.ticketNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{req.serviceName}</td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-emerald-800 font-bold">{req.aadhaarNumber}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{req.customerPhone}</div>
                        </td>
                        <td className="py-3 px-4 max-w-sm truncate text-slate-600">
                          {req.needType}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">{req.createdAt}</td>
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
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: INTERACTIVE CAN SERVICE APPLICATION FORM
          (Strictly collects: Proof / Aadhaar Photo, Aadhaar Number,
           Customer Contact Number, Need Type)
         ───────────────────────────────────────────────────────────────── */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <FileEdit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                    {selectedService.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-xs text-emerald-200 font-medium">
                      TNeGA e-Sevai Service Application • Citizen Proof Verification
                    </p>
                    <span className="bg-white/20 text-white border border-white/30 text-[11px] font-black px-2 py-0.5 rounded-full">
                      Fee: ₹{getServicePrice(selectedService.id)}
                    </span>
                  </div>
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
                  <h4 className="text-lg font-black text-emerald-950">
                    விண்ணப்பம் வெற்றிகரமாக பதிவு செய்யப்பட்டது!
                  </h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    CAN Service application submitted successfully. TNeGA operator will verify your Aadhaar proof and fulfill the request.
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
                  {/* Alert on errors */}
                  {Object.keys(fieldErrors).length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>தயவுசெய்து அனைத்து தேவையான விவரங்கள் மற்றும் ஆவணங்களை உள்ளிடவும்.</span>
                    </div>
                  )}

                  {/* 1. Proof: Aadhaar Card Photo Upload */}
                  <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wide">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>ஆதார் அட்டை ஆதாரம் (Proof Document)</span>
                    </div>

                    <FileUploadField
                      label="Aadhaar Card Photo"
                      tamilLabel="ஆதார் கார்டு போட்டோ"
                      file={aadhaarPhoto}
                      onChange={(doc) => {
                        setAadhaarPhoto(doc);
                        setFieldErrors({ ...fieldErrors, aadhaarPhoto: '' });
                      }}
                      onRemove={() => setAadhaarPhoto(null)}
                      error={fieldErrors.aadhaarPhoto}
                      required
                    />
                  </div>

                  {/* 2. Aadhaar Card Number (12 Digits) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ஆதார் கார்டு எண் (Aadhaar Card Number) <span className="text-red-500">*</span>
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
                        placeholder="12-digit Aadhaar Number"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:border-emerald-500 outline-none"
                      />
                    </div>
                    {fieldErrors.aadhaarNumber && (
                      <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.aadhaarNumber}</p>
                    )}
                  </div>

                  {/* 3. Customer Contact Number (10 Digits) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      கஸ்டமர் தொடர்பு எண் (Customer Contact Number) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.customerPhone}
                        onChange={(e) => {
                          setFormData({ ...formData, customerPhone: e.target.value.replace(/\D/g, '') });
                          setFieldErrors({ ...fieldErrors, customerPhone: '' });
                        }}
                        placeholder="10-digit Customer Mobile Number"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:border-emerald-500 outline-none"
                      />
                    </div>
                    {fieldErrors.customerPhone && (
                      <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.customerPhone}</p>
                    )}
                  </div>

                  {/* Optional: Citizen CAN Number if available */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CAN எண் (CAN Number - இருந்தால் குறிப்பிடவும் / Optional)
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={15}
                        value={formData.canNumber}
                        onChange={(e) => {
                          setFormData({ ...formData, canNumber: e.target.value.replace(/\D/g, '') });
                        }}
                        placeholder="e.g. 13-digit CAN: 033..."
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* 4. Need Type (Context-aware requirement details) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {selectedService.needTypeLabel} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.needType}
                      onChange={(e) => {
                        setFormData({ ...formData, needType: e.target.value });
                        setFieldErrors({ ...fieldErrors, needType: '' });
                      }}
                      placeholder={selectedService.needTypePlaceholder}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-none"
                    />
                    {fieldErrors.needType && (
                      <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.needType}</p>
                    )}
                  </div>

                  {/* Service Fee Summary Box */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                        ₹
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Service Fee / சேவைக் கட்டணம்</span>
                        <span className="text-xs font-bold text-slate-800">Govt Portal & e-Sevai Service Charge</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-800 font-mono">₹{getServicePrice(selectedService.id)}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">All inclusive</span>
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
                          <span>Pay ₹{getServicePrice(selectedService.id)} & Submit</span>
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
          MODAL: INSPECT CAN APPLICATION DETAILS
         ───────────────────────────────────────────────────────────────── */}
      {inspectRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-200">{inspectRequest.ticketNumber}</span>
                <h3 className="font-bold text-base text-white">{inspectRequest.serviceName}</h3>
              </div>
              <button
                onClick={() => setInspectRequest(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
                  <span className="font-bold text-emerald-800 text-sm">{inspectRequest.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Submission Date</span>
                  <span className="text-slate-700 font-medium">{inspectRequest.createdAt}</span>
                </div>
              </div>

              {/* Citizen Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Aadhaar Number</span>
                  <div className="text-sm font-mono font-bold text-slate-800">{inspectRequest.aadhaarNumber}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Customer Mobile</span>
                  <div className="text-sm font-bold text-slate-800">{inspectRequest.customerPhone}</div>
                </div>
              </div>

              {inspectRequest.canNumber && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">CAN Number</span>
                  <div className="text-sm font-mono font-bold text-emerald-800">{inspectRequest.canNumber}</div>
                </div>
              )}

              {/* Need Type Requirement */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Need Type / Requirement Details</span>
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-800 font-medium mt-1 leading-relaxed">
                  {inspectRequest.needType}
                </div>
              </div>

              {/* Uploaded Proof */}
              {inspectRequest.documentUrl && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Aadhaar Proof Document</span>
                  <div className="mt-1 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 truncate">
                      {inspectRequest.documentName || 'Aadhaar Card Photo Proof'}
                    </span>
                    {inspectRequest.documentUrl.startsWith('data:image/') && (
                      <img
                        src={inspectRequest.documentUrl}
                        alt="Proof"
                        className="w-12 h-12 rounded object-cover border border-emerald-300"
                      />
                    )}
                  </div>
                </div>
              )}

              {inspectRequest.remarks && (
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-emerald-950 font-medium">
                  {inspectRequest.remarks}
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
