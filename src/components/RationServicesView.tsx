import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  List,
  Trash2,
  Upload,
  CreditCard,
  MapPin,
  Image as ImageIcon,
  FileCheck,
} from 'lucide-react';
import { ServiceIcon } from './ServiceIcon';
import { useApp } from '../context/AppContext';
import { paymentApi } from '../services/paymentApi';
import confetti from 'canvas-confetti';
import {
  rationApi,
  RationRequest,
  RationStatsResponse,
} from '../services/rationApi';

// ─────────────────────────────────────────────────────────────────────────────
//  Ration Service Cards Definitions (TNPDS - e-Sevai reference portal)
// ─────────────────────────────────────────────────────────────────────────────

export type RationFormType =
  | 'add_member'
  | 'remove_member'
  | 'family_head_change'
  | 'address_change'
  | 'mobile_link'
  | 'name_correction'
  | 'dob_correction'
  | 'address_correction'
  | 'photo_change'
  | 'number_missing'
  | 'smartcard_qr'
  | 'green_card'
  | 'name_transfer';

export interface RationServiceCard {
  id: string;
  name: string;
  tamilSubtitle?: string;
  actionLabel: string;
  category: 'members' | 'corrections' | 'download';
  iconType: string;
  cornerColor: 'green';
  actionColor: 'green';
  backendServiceType: string;
  defaultDescription: string;
  formType: RationFormType;
}

export interface UploadedDoc {
  name: string;
  dataUrl: string;
  size: number;
}

const RATION_SERVICES: RationServiceCard[] = [
  {
    id: 'add-family-member',
    name: 'ADD FAMILY MEMBER (உறுப்பினர் சேர்க்கை)',
    tamilSubtitle: 'உறுப்பினர் சேர்க்கை',
    actionLabel: 'ADD MEMBER',
    category: 'members',
    iconType: 'smartcard',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Add Family Member',
    defaultDescription: 'Include newborn or spouse with Aadhaar & Smart Card verification.',
    formType: 'add_member',
  },
  {
    id: 'remove-family-member',
    name: 'REMOVE MEMBER (உறுப்பினர் நீக்க)',
    tamilSubtitle: 'உறுப்பினர் நீக்க',
    actionLabel: 'DELETE MEMBER',
    category: 'members',
    iconType: 'smartcard',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Remove / Delete Family Member',
    defaultDescription: 'Surrender or deletion of family member name due to marriage or separate card.',
    formType: 'remove_member',
  },
  {
    id: 'ration-family-head',
    name: 'CHANGE OF FAMILY HEAD (குடும்ப தலைவர் மாற்றம்)',
    tamilSubtitle: 'குடும்ப தலைவர் மாற்றம்',
    actionLabel: 'CHANGE HEAD',
    category: 'corrections',
    iconType: 'leaf-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Change of Family Head',
    defaultDescription: 'Transfer head of family designation to senior female or male family member.',
    formType: 'family_head_change',
  },
  {
    id: 'address-fps-change',
    name: 'CHANGE OF ADDRESS (முகவரி மாற்றம்)',
    tamilSubtitle: 'முகவரி மாற்றம்',
    actionLabel: 'TRANSFER ADDRESS',
    category: 'corrections',
    iconType: 'smartcard',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Change of Address / FPS',
    defaultDescription: 'Transfer Fair Price Shop (FPS) and update residential address.',
    formType: 'address_change',
  },
  {
    id: 'ration-mobile-link',
    name: 'MOBILE NUMBER LINK (செல் நம்பர் இணைத்தல்)',
    tamilSubtitle: 'செல் நம்பர் இணைத்தல்',
    actionLabel: 'LINK MOBILE',
    category: 'corrections',
    iconType: 'leaf-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Mobile Number Update / Link',
    defaultDescription: 'Update & link new 10-digit mobile number for TNPDS OTP & SMS.',
    formType: 'mobile_link',
  },
  {
    id: 'name-correction',
    name: 'NAME CORRECTION (பெயர் திருத்தம்)',
    tamilSubtitle: 'பெயர் திருத்தம்',
    actionLabel: 'CORRECT NAME',
    category: 'corrections',
    iconType: 'leaf-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Smart Card Name Correction',
    defaultDescription: 'Spelling or clerical error modification in family member name.',
    formType: 'name_correction',
  },
  {
    id: 'dob-correction',
    name: 'DOB CORRECTION (பிறந்த தேதி திருத்தம்)',
    tamilSubtitle: 'பிறந்த தேதி திருத்தம்',
    actionLabel: 'CORRECT DOB',
    category: 'corrections',
    iconType: 'leaf-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Smart Card DOB Correction',
    defaultDescription: 'Correction of date of birth or name particulars in smart card.',
    formType: 'dob_correction',
  },
  {
    id: 'address-correction',
    name: 'ADDRESS CORRECTION (முகவரி திருத்தம்)',
    tamilSubtitle: 'முகவரி திருத்தம்',
    actionLabel: 'CORRECT ADDRESS',
    category: 'corrections',
    iconType: 'smartcard',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Smart Card Address Correction',
    defaultDescription: 'Minor door number or street spelling correction in existing address.',
    formType: 'address_correction',
  },
  {
    id: 'photo-change',
    name: 'PHOTO CHANGE (புகைப்படம் மாற்றம்)',
    tamilSubtitle: 'புகைப்படம் மாற்றம்',
    actionLabel: 'CHANGE PHOTO',
    category: 'corrections',
    iconType: 'leaf-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Smart Card Photo Change',
    defaultDescription: 'Update head of family photograph printed on digital smart card.',
    formType: 'photo_change',
  },
  {
    id: 'smartcard-number-missing',
    name: 'SMART CARD NUMBER MISSING (எண் காணவில்லை)',
    tamilSubtitle: 'ஸ்மார்ட் கார்டு எண் தொலைந்தது',
    actionLabel: 'FIND CARD NUMBER',
    category: 'download',
    iconType: 'smartcard',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Smart Card Number Missing',
    defaultDescription: 'Retrieve lost smart ration card number using Aadhaar proof.',
    formType: 'number_missing',
  },
  {
    id: 'ration-qr-code',
    name: 'SMART CARD QR (ஸ்மார்ட் கார்டு QR)',
    tamilSubtitle: 'ஸ்மார்ட் கார்டு QR கோடு',
    actionLabel: 'DOWNLOAD QR',
    category: 'download',
    iconType: 'qr-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Smart Card QR Code & Download',
    defaultDescription: 'Instant QR code verification barcode and electronic card slip.',
    formType: 'smartcard_qr',
  },
  {
    id: 'smartcard-pdf-green',
    name: 'SMART CARD PDF GREEN CARD (பச்சை அட்டை PDF)',
    tamilSubtitle: 'ஸ்மார்ட் கார்டு PDF பச்சை அட்டை',
    actionLabel: 'DOWNLOAD PDF',
    category: 'download',
    iconType: 'qr-ration',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Smart Card PDF Green Card',
    defaultDescription: 'Full color Green Ration Card PDF copy for print and laminate.',
    formType: 'green_card',
  },
  {
    id: 'name-transfer',
    name: 'NAME TRANSFER (பெயர் மாற்றம்)',
    tamilSubtitle: 'பெயர் மாற்றம்',
    actionLabel: 'NAME TRANSFER',
    category: 'corrections',
    iconType: 'smartcard',
    cornerColor: 'green',
    actionColor: 'green',
    backendServiceType: 'Name Transfer',
    defaultDescription: 'Transfer family member name to new smart card with Aadhaar & Smart Card proof.',
    formType: 'name_transfer',
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
//  Reusable File Upload Field Component
// ─────────────────────────────────────────────────────────────────────────────

interface FileUploadFieldProps {
  label: string;
  tamilLabel?: string;
  file?: UploadedDoc | null;
  onChange: (doc: UploadedDoc) => void;
  onRemove: () => void;
  error?: string;
  required?: boolean;
  accept?: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  tamilLabel,
  file,
  onChange,
  onRemove,
  error,
  required = true,
  accept = 'image/*,.pdf',
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
                alt="Uploaded preview"
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
            className={`w-full py-2.5 px-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              error
                ? 'border-red-400 bg-red-50/50 text-red-600'
                : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 text-slate-600'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">Choose File (Photo / PDF)</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
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
//  Main Ration Services View Component
// ─────────────────────────────────────────────────────────────────────────────
export const RationServicesView: React.FC = () => {
  const { setActiveTab, getServicePrice, openPaymentDialog, addApplication } = useApp();

  // Active Category Filter
  const [activeCategory, setActiveCategory] = useState<'all' | 'members' | 'corrections' | 'download' | 'tickets'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<RationServiceCard | null>(null);
  const [inspectRequest, setInspectRequest] = useState<RationRequest | null>(null);

  // Form Fields State (Strictly for given content per form)
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    smartCardNumber: '',
    customerPhone: '',
    shopCode: '',
    fullAddress: '',
    newPhone: '',
    oldName: '',
    newName: '',
  });

  // Uploaded Files State
  const [uploadedFiles, setUploadedFiles] = useState<{
    aadhaarPhoto?: UploadedDoc | null;
    smartCardPhoto?: UploadedDoc | null;
    passportPhoto?: UploadedDoc | null;
    eCardFile?: UploadedDoc | null;
    newPhoto?: UploadedDoc | null;
  }>({});

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
      (service.tamilSubtitle && service.tamilSubtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      service.defaultDescription.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Open modal and reset fields
  const handleOpenService = (service: RationServiceCard) => {
    setSelectedService(service);
    setSubmitSuccess(null);
    setFieldErrors({});
    setFormData({
      aadhaarNumber: '',
      smartCardNumber: '',
      customerPhone: '',
      shopCode: '',
      fullAddress: '',
      newPhone: '',
      oldName: '',
      newName: '',
    });
    setUploadedFiles({});
  };

  // Form Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const errors: Record<string, string> = {};
    const ft = selectedService.formType;

    // 1. Aadhaar Card Photo
    if (
      ['add_member', 'remove_member', 'family_head_change', 'number_missing', 'name_transfer'].includes(ft) &&
      !uploadedFiles.aadhaarPhoto
    ) {
      errors.aadhaarPhoto = 'ஆதார் கார்டு போட்டோ பதிவேற்றம் செய்க (Aadhaar Card Photo is required).';
    }

    // 2. Smart Card Photo
    if (
      [
        'add_member',
        'remove_member',
        'family_head_change',
        'address_change',
        'mobile_link',
        'name_correction',
        'dob_correction',
        'address_correction',
        'photo_change',
        'smartcard_qr',
        'green_card',
        'name_transfer',
      ].includes(ft) &&
      !uploadedFiles.smartCardPhoto
    ) {
      errors.smartCardPhoto =
        ft === 'name_transfer'
          ? 'புதிய ஸ்மார்ட் கார்டு போட்டோ பதிவேற்றம் செய்க (New Smart Card Photo is required).'
          : 'ஸ்மார்ட் கார்டு போட்டோ பதிவேற்றம் செய்க (Smart Card Photo is required).';
    }

    // 3. Passport Size Photo
    if (ft === 'family_head_change' && !uploadedFiles.passportPhoto) {
      errors.passportPhoto = 'பாஸ்போர்ட் சைஸ் போட்டோ பதிவேற்றம் செய்க (Passport Size Photo is required).';
    }

    // 4. New Photo
    if (ft === 'photo_change' && !uploadedFiles.newPhoto) {
      errors.newPhoto = 'புதிய புகைப்படம் பதிவேற்றம் செய்க (New Photo is required).';
    }

    // 5. E Card
    if (
      ['name_correction', 'dob_correction', 'address_correction', 'photo_change', 'smartcard_qr', 'green_card'].includes(ft) &&
      !uploadedFiles.eCardFile
    ) {
      errors.eCardFile = 'E Card ஆவணம் பதிவேற்றம் செய்க (E Card is required).';
    }

    // 6. Aadhaar Number
    if (['add_member', 'remove_member', 'family_head_change'].includes(ft)) {
      const cleanAadhaar = formData.aadhaarNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        errors.aadhaarNumber = '12 இலக்க ஆதார் எண் தேவை (Aadhaar must be exactly 12 digits).';
      }
    }

    // 7. Smart Card Number
    if (ft !== 'number_missing') {
      if (!formData.smartCardNumber.trim()) {
        errors.smartCardNumber =
          ft === 'name_transfer'
            ? 'புதிய ஸ்மார்ட் கார்டு எண் தேவை (New Smart Card Number is required).'
            : 'ஸ்மார்ட் கார்டு எண் தேவை (Smart Card Number is required).';
      }
    }

    // 8. Customer Phone Number
    if (ft === 'mobile_link') {
      const cleanNewPhone = formData.newPhone.replace(/\D/g, '');
      if (cleanNewPhone.length < 10) {
        errors.newPhone = 'சரியான 10 இலக்க புதிய போன் எண் தேவை (10-digit mobile number required).';
      }
    } else {
      const cleanPhone = formData.customerPhone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        errors.customerPhone = 'சரியான 10 இலக்க தொடர்பு எண் தேவை (10-digit mobile number required).';
      }
    }

    // 9. Shop Code & Address (for address_change)
    if (ft === 'address_change') {
      if (!formData.shopCode.trim()) {
        errors.shopCode = 'Shop Code நியாய விலைக்கடை எண் தேவை (Shop Code is required).';
      }
      if (!formData.fullAddress.trim()) {
        errors.fullAddress = 'முழு முகவரி விவரங்கள் தேவை (Full Address is required).';
      }
    }

    // 10. Address Correction
    if (ft === 'address_correction' && !formData.fullAddress.trim()) {
      errors.fullAddress = 'திருத்தப்பட வேண்டிய முழு முகவரி தேவை (Full Address Type is required).';
    }

    // 11. Old Name / New Name
    if (['name_correction', 'dob_correction'].includes(ft)) {
      if (!formData.oldName.trim()) {
        errors.oldName = 'Old Name பழைய விவரம் தேவை (Old Name is required).';
      }
      if (!formData.newName.trim()) {
        errors.newName = 'New Name புதிய திருத்த விவரம் தேவை (New Name is required).';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const fee = getServicePrice(selectedService.id);
    const primaryPhone = (formData.customerPhone || formData.newPhone).replace(/\D/g, '');
    const applicantIdentifier =
      formData.newName ||
      formData.oldName ||
      (formData.smartCardNumber ? `Card: ${formData.smartCardNumber}` : '') ||
      (formData.aadhaarNumber ? `Aadhaar: ${formData.aadhaarNumber}` : '') ||
      `Citizen (${primaryPhone})`;

    // Prompt UPI QR payment modal before completing submission
    openPaymentDialog({
      serviceName: selectedService.name,
      categoryLabel: 'RATION SERVICES',
      amount: fee,
      applicantName: applicantIdentifier,
      applicantPhone: primaryPhone,
      onConfirmed: async (paymentDetails) => {
        setIsSubmitting(true);
        setFieldErrors({});

        const ticketNum = `RAT-${Date.now()}`;

        // Package all uploaded attachments
        const documentsList: Array<{ name: string; url: string; type?: string }> = [];
        if (uploadedFiles.aadhaarPhoto) {
          documentsList.push({ name: 'Aadhaar Card Photo', url: uploadedFiles.aadhaarPhoto.dataUrl });
        }
        if (uploadedFiles.smartCardPhoto) {
          documentsList.push({
            name: selectedService.formType === 'name_transfer' ? 'New Smart Card Photo' : 'Smart Card Photo',
            url: uploadedFiles.smartCardPhoto.dataUrl,
          });
        }
        if (uploadedFiles.passportPhoto) {
          documentsList.push({ name: 'Passport Size Photo', url: uploadedFiles.passportPhoto.dataUrl });
        }
        if (uploadedFiles.newPhoto) {
          documentsList.push({ name: 'New Photo', url: uploadedFiles.newPhoto.dataUrl });
        }
        if (uploadedFiles.eCardFile) {
          documentsList.push({ name: 'E Card Document', url: uploadedFiles.eCardFile.dataUrl });
        }

        // Immediately add to local & history storage
        addApplication({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          applicantName: applicantIdentifier,
          mobile: primaryPhone,
          status: 'Under Review',
          fee,
          walletType: 'payments',
          details: {
            ...formData,
            ticketNumber: ticketNum,
            serviceType: selectedService.backendServiceType,
            formType: selectedService.formType,
          },
          documents: documentsList as any,
          remarks: `Payment of ₹${paymentDetails.paidAmount} submitted with UTR: ${paymentDetails.utrNumber}. Verification pending with TNPDS operator.`,
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
          const res = await rationApi.submitRequest({
            serviceType: selectedService.backendServiceType,
            rationCardNumber: formData.smartCardNumber.trim().toUpperCase(),
            applicantName: applicantIdentifier,
            applicantPhone: primaryPhone,
            aadhaarNumber: formData.aadhaarNumber.replace(/\D/g, ''),
            fpsCode: formData.shopCode.trim(),
            newAddress: formData.fullAddress.trim(),
            correctionDetails: [
              formData.oldName ? `Old: ${formData.oldName}` : '',
              formData.newName ? `New: ${formData.newName}` : '',
              formData.fullAddress ? `Address: ${formData.fullAddress}` : '',
              formData.newPhone ? `New Phone: ${formData.newPhone}` : '',
            ].filter(Boolean).join(' | '),
            remarksOrNotes: `Submitted from Ration Services Portal. Service: ${selectedService.name}`,
            documents: documentsList,
            priority: 'Medium',
          });

          const finalTicket = res.success && res.ticketNumber ? res.ticketNumber : ticketNum;

          // Record payment in payments DB
          await paymentApi.submitPayment({
            ticketNumber: finalTicket,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            category: 'Ration',
            applicantName: applicantIdentifier,
            applicantPhone: primaryPhone,
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
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded">
                  Official Operator Update
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Ticket #{latestAdminResponse.ticketNumber}
                </span>
              </div>
              <p className="text-sm font-black text-emerald-950 mt-1">
                "{latestAdminResponse.resolutionRemarks}"
              </p>
              <div className="flex items-center gap-4 text-xs text-emerald-800 font-medium mt-1">
                <span>Citizen: <strong>{latestAdminResponse.applicantName}</strong></span>
                {latestAdminResponse.tnpdsAckNumber && (
                  <span>TNPDS Ref: <strong className="font-mono">{latestAdminResponse.tnpdsAckNumber}</strong></span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setInspectRequest(latestAdminResponse)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors whitespace-nowrap self-stretch sm:self-auto text-center"
          >
            View Official Response
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TOP SHELF: TITLE, CATEGORY PILLS & SEARCH BAR
         ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Store className="w-6 h-6 text-emerald-700" />
              <span>RATION SERVICES (TNPDS)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Tamil Nadu Public Distribution System • Smart Family Card Portal
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Official e-Sevai Online Submission Active</span>
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
              All Services ({RATION_SERVICES.length})
            </button>

            <button
              onClick={() => setActiveCategory('members')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'members'
                  ? 'bg-[#00a86b] text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              Family Members (சேர்க்கை / நீக்க)
            </button>

            <button
              onClick={() => setActiveCategory('corrections')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'corrections'
                  ? 'bg-[#eab308] text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              Corrections & Changes (மாற்றம் / திருத்தம்)
            </button>

            <button
              onClick={() => setActiveCategory('download')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'download'
                  ? 'bg-[#15803d] text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              Cards & Download (QR / PDF)
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

          {/* Quick Search */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services..."
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

        {/* ── SHELF CONTENT: VERTICAL RIBBON + GRID OF SERVICE CARDS ── */}
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
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
              <span>Track Applications by Smart Card Number / Mobile</span>
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
                placeholder="Enter Ration Card No or Mobile Number"
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
                    <th className="py-3 px-4">Smart Card</th>
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
                            {req.rationCardNumber ? (
                              <div className="text-emerald-800 font-bold text-xs">{req.rationCardNumber}</div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">---</span>
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
          (Strictly collects ONLY the required data per service)
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
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-xs text-emerald-200 font-medium">
                      TNPDS Service Application • Required Documents & Verification
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
                    Application successfully submitted. Operator will verify your uploaded documents and update TNPDS reference.
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
                  {/* General / Missing Field Alert */}
                  {Object.keys(fieldErrors).length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>தயவுசெய்து அனைத்து தேவையான ஆவணங்கள் மற்றும் விவரங்களை உள்ளிடவும்.</span>
                    </div>
                  )}

                  {/* ── DOCUMENTS UPLOAD SECTION ── */}
                  <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wide">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>தேவையான ஆவணங்கள் (Required Documents)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 1. Aadhaar Card Photo */}
                      {['add_member', 'remove_member', 'family_head_change', 'number_missing', 'name_transfer'].includes(
                        selectedService.formType
                      ) && (
                        <FileUploadField
                          label="Aadhaar Card Photo"
                          tamilLabel="ஆதார் கார்டு போட்டோ"
                          file={uploadedFiles.aadhaarPhoto}
                          onChange={(doc) => {
                            setUploadedFiles({ ...uploadedFiles, aadhaarPhoto: doc });
                            setFieldErrors({ ...fieldErrors, aadhaarPhoto: '' });
                          }}
                          onRemove={() => setUploadedFiles({ ...uploadedFiles, aadhaarPhoto: null })}
                          error={fieldErrors.aadhaarPhoto}
                          required
                          accept="image/*,.pdf"
                        />
                      )}

                      {/* 2. Smart Card Photo */}
                      {[
                        'add_member',
                        'remove_member',
                        'family_head_change',
                        'address_change',
                        'mobile_link',
                        'name_correction',
                        'dob_correction',
                        'address_correction',
                        'photo_change',
                        'smartcard_qr',
                        'green_card',
                        'name_transfer',
                      ].includes(selectedService.formType) && (
                        <FileUploadField
                          label={selectedService.formType === 'name_transfer' ? 'New Smart Card Photo' : 'Smart Card Photo'}
                          tamilLabel={selectedService.formType === 'name_transfer' ? 'புதிய ஸ்மார்ட் கார்டு ஃபோட்டோ' : 'ஸ்மார்ட் கார்டு ஃபோட்டோ'}
                          file={uploadedFiles.smartCardPhoto}
                          onChange={(doc) => {
                            setUploadedFiles({ ...uploadedFiles, smartCardPhoto: doc });
                            setFieldErrors({ ...fieldErrors, smartCardPhoto: '' });
                          }}
                          onRemove={() => setUploadedFiles({ ...uploadedFiles, smartCardPhoto: null })}
                          error={fieldErrors.smartCardPhoto}
                          required
                          accept="image/*,.pdf"
                        />
                      )}

                      {/* 3. Passport Size Photo (for family head change) */}
                      {selectedService.formType === 'family_head_change' && (
                        <FileUploadField
                          label="Passport Size Photo"
                          tamilLabel="பாஸ்போர்ட் சைஸ் போட்டோ"
                          file={uploadedFiles.passportPhoto}
                          onChange={(doc) => {
                            setUploadedFiles({ ...uploadedFiles, passportPhoto: doc });
                            setFieldErrors({ ...fieldErrors, passportPhoto: '' });
                          }}
                          onRemove={() => setUploadedFiles({ ...uploadedFiles, passportPhoto: null })}
                          error={fieldErrors.passportPhoto}
                          required
                          accept="image/*"
                        />
                      )}

                      {/* 4. New Photo (for photo change) */}
                      {selectedService.formType === 'photo_change' && (
                        <FileUploadField
                          label="New Photo"
                          tamilLabel="புதிய புகைப்படம்"
                          file={uploadedFiles.newPhoto}
                          onChange={(doc) => {
                            setUploadedFiles({ ...uploadedFiles, newPhoto: doc });
                            setFieldErrors({ ...fieldErrors, newPhoto: '' });
                          }}
                          onRemove={() => setUploadedFiles({ ...uploadedFiles, newPhoto: null })}
                          error={fieldErrors.newPhoto}
                          required
                          accept="image/*"
                        />
                      )}

                      {/* 5. E Card (for corrections, QR & Green card) */}
                      {[
                        'name_correction',
                        'dob_correction',
                        'address_correction',
                        'photo_change',
                        'smartcard_qr',
                        'green_card',
                      ].includes(selectedService.formType) && (
                        <FileUploadField
                          label="E Card Document / Photo"
                          tamilLabel="E Card (மின் அட்டை)"
                          file={uploadedFiles.eCardFile}
                          onChange={(doc) => {
                            setUploadedFiles({ ...uploadedFiles, eCardFile: doc });
                            setFieldErrors({ ...fieldErrors, eCardFile: '' });
                          }}
                          onRemove={() => setUploadedFiles({ ...uploadedFiles, eCardFile: null })}
                          error={fieldErrors.eCardFile}
                          required
                          accept="image/*,.pdf"
                        />
                      )}
                    </div>
                  </div>

                  {/* ── TEXT INPUTS SECTION (Strictly per form requirements) ── */}
                  <div className="space-y-3">
                    {/* Old Name & New Name (for Name & DOB corrections) */}
                    {['name_correction', 'dob_correction'].includes(selectedService.formType) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Old Name (பழைய பெயர் / விவரம்) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={formData.oldName}
                              onChange={(e) => {
                                setFormData({ ...formData, oldName: e.target.value });
                                setFieldErrors({ ...fieldErrors, oldName: '' });
                              }}
                              placeholder="Existing Name as in Smart Card"
                              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-none"
                            />
                          </div>
                          {fieldErrors.oldName && (
                            <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.oldName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            New Name (புதிய திருத்தப்பட்ட பெயர்) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={formData.newName}
                              onChange={(e) => {
                                setFormData({ ...formData, newName: e.target.value });
                                setFieldErrors({ ...fieldErrors, newName: '' });
                              }}
                              placeholder="New / Corrected Name to update"
                              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-none"
                            />
                          </div>
                          {fieldErrors.newName && (
                            <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.newName}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Aadhaar Card Number (Add, Remove, Head Change) */}
                    {['add_member', 'remove_member', 'family_head_change'].includes(selectedService.formType) && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ஆதார் கார்டு நம்பர் (Aadhaar Card Number) <span className="text-red-500">*</span>
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
                    )}

                    {/* Smart Card Number (All services except number missing) */}
                    {selectedService.formType !== 'number_missing' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {selectedService.formType === 'name_transfer'
                            ? 'புதிய ஸ்மார்ட் கார்டு எண் (New Smart Card Number)'
                            : 'ஸ்மார்ட் கார்டு நம்பர் (Smart Card Number)'}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            maxLength={16}
                            value={formData.smartCardNumber}
                            onChange={(e) => {
                              setFormData({ ...formData, smartCardNumber: e.target.value.toUpperCase() });
                              setFieldErrors({ ...fieldErrors, smartCardNumber: '' });
                            }}
                            placeholder={
                              selectedService.formType === 'name_transfer'
                                ? 'Enter New Smart Card Number (e.g. 33/W/0123456)'
                                : 'e.g. 33/W/0123456 or 12-digit number'
                            }
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase focus:border-emerald-500 outline-none"
                          />
                        </div>
                        {fieldErrors.smartCardNumber && (
                          <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.smartCardNumber}</p>
                        )}
                      </div>
                    )}

                    {/* Shop Code (for Address Change) */}
                    {selectedService.formType === 'address_change' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Shop Code (நியாய விலைக்கடை எண்) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={formData.shopCode}
                            onChange={(e) => {
                              setFormData({ ...formData, shopCode: e.target.value.toUpperCase() });
                              setFieldErrors({ ...fieldErrors, shopCode: '' });
                            }}
                            placeholder="e.g. 08AA012"
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase focus:border-emerald-500 outline-none"
                          />
                        </div>
                        {fieldErrors.shopCode && (
                          <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.shopCode}</p>
                        )}
                      </div>
                    )}

                    {/* Full Address (for Address Change: தெரு மாவட்டம் தாலுகா அனைத்து) */}
                    {selectedService.formType === 'address_change' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Full Address (தெரு, மாவட்டம், தாலுகா அனைத்து) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <textarea
                            rows={3}
                            value={formData.fullAddress}
                            onChange={(e) => {
                              setFormData({ ...formData, fullAddress: e.target.value });
                              setFieldErrors({ ...fieldErrors, fullAddress: '' });
                            }}
                            placeholder="கதவு எண், தெரு பெயர், கிராமம்/வார்டு, தாலுகா, மாவட்டம், பின்கோடு..."
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-none"
                          />
                        </div>
                        {fieldErrors.fullAddress && (
                          <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.fullAddress}</p>
                        )}
                      </div>
                    )}

                    {/* Address Correction: Full Address Type */}
                    {selectedService.formType === 'address_correction' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Full Address Type (முழு முகவரி விவரங்கள்) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <textarea
                            rows={3}
                            value={formData.fullAddress}
                            onChange={(e) => {
                              setFormData({ ...formData, fullAddress: e.target.value });
                              setFieldErrors({ ...fieldErrors, fullAddress: '' });
                            }}
                            placeholder="Enter Complete Corrected Address..."
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 outline-none"
                          />
                        </div>
                        {fieldErrors.fullAddress && (
                          <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.fullAddress}</p>
                        )}
                      </div>
                    )}

                    {/* New Phone Number (for Mobile Link) */}
                    {selectedService.formType === 'mobile_link' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          புதிய போன் நம்பர் (New Phone Number) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            maxLength={10}
                            value={formData.newPhone}
                            onChange={(e) => {
                              setFormData({ ...formData, newPhone: e.target.value.replace(/\D/g, '') });
                              setFieldErrors({ ...fieldErrors, newPhone: '' });
                            }}
                            placeholder="10-digit New Mobile Number"
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:border-emerald-500 outline-none"
                          />
                        </div>
                        {fieldErrors.newPhone && (
                          <p className="text-[11px] text-red-600 font-bold mt-1">{fieldErrors.newPhone}</p>
                        )}
                      </div>
                    ) : (
                      /* Customer Contact Number (For all other forms) */
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          கஸ்டமர் போன் நம்பர் (Customer Contact Number) <span className="text-red-500">*</span>
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
                  <span className="text-[10px] uppercase font-bold text-slate-500">Applicant / Contact</span>
                  <div className="text-sm font-bold text-slate-800">{inspectRequest.applicantName}</div>
                  <div className="text-slate-500">{inspectRequest.applicantPhone}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Identity Details</span>
                  <div className="text-sm font-mono font-bold text-emerald-800">
                    {inspectRequest.rationCardNumber || 'Card Verification'}
                  </div>
                  {inspectRequest.maskedAadhaar && (
                    <div className="text-slate-400 text-xs font-mono">{inspectRequest.maskedAadhaar}</div>
                  )}
                </div>
              </div>

              {/* Specific notes or Address Shifting */}
              {inspectRequest.correctionDetails && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Request Specifics</span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-800 font-medium mt-1">
                    {inspectRequest.correctionDetails}
                  </div>
                </div>
              )}

              {inspectRequest.newAddress && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Address Details</span>
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
