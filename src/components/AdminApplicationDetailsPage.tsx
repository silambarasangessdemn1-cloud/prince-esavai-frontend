import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Printer,
  ExternalLink,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  SlidersHorizontal,
  Sparkles,
  Car,
  CreditCard,
  Vote,
  Store,
  Save,
  Send,
  Loader2,
  CheckCircle,
  Hash,
  Sprout,
  QrCode,
  XCircle,
} from 'lucide-react';
import { AdminQueue } from './AdminSidebar';
import { aadhaarApi } from '../services/aadhaarApi';
import { panApi } from '../services/panApi';
import { voterApi } from '../services/voterApi';
import { rationApi } from '../services/rationApi';
import { drivingApi } from '../services/drivingApi';
import { vehicleApi } from '../services/vehicleApi';
import { farmerApi } from '../services/farmerApi';
import { paymentApi } from '../services/paymentApi';

interface AdminApplicationDetailsPageProps {
  type: AdminQueue;
  ticket: any;
  onBack: () => void;
  onRefreshQueue: () => void;
  allTicketsInQueue?: any[];
  onSelectTicket?: (ticket: any) => void;
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  Pending: { label: 'Pending', badge: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  'In Progress': { label: 'In Progress', badge: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  Scheduled: { label: 'Scheduled', badge: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  'Pending Docs': { label: 'Pending Docs', badge: 'bg-orange-50 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  Resolved: { label: 'Resolved', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  Completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  Approved: { label: 'Approved', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  Rejected: { label: 'Rejected', badge: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
  Closed: { label: 'Closed', badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-500' },
};

const QUEUE_METADATA: Record<AdminQueue, { title: string; subtitle: string; icon: React.FC<{ className?: string }> }> = {
  aadhaar: {
    title: 'Aadhaar Service Dossier',
    subtitle: 'UIDAI Citizen Identity & Demographic / Biometric Service Request',
    icon: ShieldCheck,
  },
  pan: {
    title: 'PAN Card Application Record',
    subtitle: 'Income Tax Department (Form 49A / CSF Correction Service)',
    icon: CreditCard,
  },
  voter: {
    title: 'Voter Registration Dossier',
    subtitle: 'Election Commission of India (Form 6 / 8 Electoral Services)',
    icon: Vote,
  },
  ration: {
    title: 'Smart Ration Card Dossier',
    subtitle: 'Tamil Nadu Civil Supplies (TNPDS Smart Card Management)',
    icon: Store,
  },
  driving: {
    title: 'Driving License Dossier',
    subtitle: 'Ministry of Road Transport - Sarathi DL & LL Services',
    icon: Car,
  },
  vehicle: {
    title: 'Vahan Vehicle Services Record',
    subtitle: 'Parivahan Sewa - RC Services, Transfer, Fitness & Challans',
    icon: Car,
  },
  farmer: {
    title: 'Farmer & Land Records Dossier',
    subtitle: 'Uzhavan / Tamil Nadu Agriculture, PM-KISAN, e-Patta & Crop Insurance',
    icon: Sprout,
  },
};

export const AdminApplicationDetailsPage: React.FC<AdminApplicationDetailsPageProps> = ({
  type,
  ticket: initialTicket,
  onBack,
  onRefreshQueue,
  allTicketsInQueue = [],
  onSelectTicket,
}) => {
  const [ticket, setTicket] = useState<any>(initialTicket);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Status Processing Form States
  const [status, setStatus] = useState<string>(
    initialTicket.status || (type === 'pan' ? 'Pending' : 'Pending')
  );
  const [remarks, setRemarks] = useState<string>(initialTicket.resolutionRemarks || '');
  const [ackNumber, setAckNumber] = useState<string>(
    initialTicket.officialAckNumber ||
    initialTicket.vahanAckNumber ||
    initialTicket.sarathiAckNumber ||
    initialTicket.tnpdsAckNumber ||
    initialTicket.eciReferenceNumber ||
    initialTicket.nsdlUtiiAckNumber ||
    ''
  );
  const [slotDate, setSlotDate] = useState<string>(
    initialTicket.fieldInspectionDate
      ? new Date(initialTicket.fieldInspectionDate).toISOString().substring(0, 10)
      : initialTicket.rtoSlotDate
      ? new Date(initialTicket.rtoSlotDate).toISOString().substring(0, 10)
      : ''
  );
  const [challanRef, setChallanRef] = useState<string>(initialTicket.challanSettlementRef || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Payment record linked to this application
  const [paymentRecord, setPaymentRecord] = useState<any>(() => {
    if (initialTicket.utrNumber) {
      return {
        utrNumber: initialTicket.utrNumber,
        amount: initialTicket.paidAmount || initialTicket.fee || 0,
        status: initialTicket.paymentStatus || 'Pending Verification',
        paymentScreenshot: initialTicket.paymentScreenshot,
        upiIdUsed: initialTicket.upiIdUsed || 'jjesper143@oksbi',
        verifiedBy: initialTicket.paymentVerifiedBy,
      };
    }
    try {
      const stored = localStorage.getItem('esevai_all_payments');
      if (stored) {
        const list = JSON.parse(stored);
        const match = list.find(
          (p: any) =>
            p.ticketNumber === (initialTicket.ticketNumber || initialTicket._id) ||
            p.ticketNumber === initialTicket.tokenNumber
        );
        if (match) return match;
      }
    } catch {}
    return null;
  });

  const handleApprovePayment = async () => {
    const ticketId = ticket.ticketNumber || ticket.tokenNumber || ticket._id;
    await paymentApi.verifyPayment(ticketId, 'Verified & Approved', 'Approved from dossier page');
    setPaymentRecord((prev: any) => (prev ? { ...prev, status: 'Verified & Approved' } : null));
    setFeedback({ type: 'success', message: 'Payment verified and approved successfully!' });
  };

  const handleRejectPayment = async () => {
    const reason = window.prompt('Enter reason for payment rejection (e.g. UTR mismatch):');
    if (!reason) return;
    const ticketId = ticket.ticketNumber || ticket.tokenNumber || ticket._id;
    await paymentApi.verifyPayment(ticketId, 'Rejected', reason);
    setPaymentRecord((prev: any) => (prev ? { ...prev, status: 'Rejected', rejectionReason: reason } : null));
    setFeedback({ type: 'error', message: `Payment marked as rejected: ${reason}` });
  };

  const meta = QUEUE_METADATA[type] || {
    title: 'Application Record',
    subtitle: 'Official Citizen Service Record',
    icon: FileText,
  };
  const IconComponent = meta.icon;

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Find previous and next tickets in current queue
  const currentIndex = allTicketsInQueue.findIndex((t) => t._id === ticket._id);
  const prevTicket = currentIndex > 0 ? allTicketsInQueue[currentIndex - 1] : null;
  const nextTicket = currentIndex >= 0 && currentIndex < allTicketsInQueue.length - 1 ? allTicketsInQueue[currentIndex + 1] : null;

  const handleNavigateTicket = (newTicket: any) => {
    if (!newTicket) return;
    setTicket(newTicket);
    setStatus(newTicket.status);
    setRemarks(newTicket.resolutionRemarks || '');
    setAckNumber(
      newTicket.officialAckNumber ||
      newTicket.vahanAckNumber ||
      newTicket.sarathiAckNumber ||
      newTicket.tnpdsAckNumber ||
      newTicket.eciReferenceNumber ||
      newTicket.nsdlUtiiAckNumber ||
      ''
    );
    setSlotDate(
      newTicket.fieldInspectionDate
        ? new Date(newTicket.fieldInspectionDate).toISOString().substring(0, 10)
        : newTicket.rtoSlotDate
        ? new Date(newTicket.rtoSlotDate).toISOString().substring(0, 10)
        : ''
    );
    setChallanRef(newTicket.challanSettlementRef || '');
    setFeedback(null);
    if (onSelectTicket) onSelectTicket(newTicket);
  };

  // Submit Status Update directly from this page
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      let res: any;

      if (type === 'aadhaar') {
        res = await aadhaarApi.updateStatus(ticket._id, status, remarks);
        if (res.success && res.data?.issue) {
          setTicket(res.data.issue);
          setFeedback({ type: 'success', message: `Aadhaar application status updated to "${status}" successfully!` });
          onRefreshQueue();
        } else {
          setFeedback({ type: 'error', message: res.message || 'Failed to update Aadhaar status.' });
        }
      } else if (type === 'pan') {
        res = await panApi.updateStatus(ticket._id, status, remarks, ackNumber);
        if (res.success && res.data?.request) {
          setTicket(res.data.request);
          setFeedback({ type: 'success', message: `PAN application status updated to "${status}" successfully!` });
          onRefreshQueue();
        } else {
          setFeedback({ type: 'error', message: res.message || 'Failed to update PAN status.' });
        }
      } else if (type === 'voter') {
        res = await voterApi.updateStatus(ticket._id, status, remarks, ackNumber);
        if (res.success && res.data?.request) {
          setTicket(res.data.request);
          setFeedback({ type: 'success', message: `Voter ID application status updated to "${status}" successfully!` });
          onRefreshQueue();
        } else {
          setFeedback({ type: 'error', message: res.message || 'Failed to update Voter status.' });
        }
      } else if (type === 'ration') {
        res = await rationApi.updateStatus(ticket._id, {
          status,
          resolutionRemarks: remarks,
          tnpdsAckNumber: ackNumber,
        });
        if (res.success && res.data) {
          setTicket(res.data);
          setFeedback({ type: 'success', message: `Ration Card application status updated to "${status}" successfully!` });
          onRefreshQueue();
        } else {
          setFeedback({ type: 'error', message: res.message || 'Failed to update Ration status.' });
        }
      } else if (type === 'driving') {
        res = await drivingApi.updateStatus(ticket._id, {
          status,
          resolutionRemarks: remarks,
          sarathiAckNumber: ackNumber,
          rtoSlotDate: slotDate || undefined,
        });
        if (res.success && res.data) {
          setTicket(res.data);
          setFeedback({ type: 'success', message: `Driving License status updated to "${status}" successfully!` });
          onRefreshQueue();
        } else {
          setFeedback({ type: 'error', message: res.message || 'Failed to update Driving status.' });
        }
      } else if (type === 'vehicle') {
        res = await vehicleApi.updateStatus(ticket._id, {
          status,
          resolutionRemarks: remarks,
          vahanAckNumber: ackNumber,
          rtoSlotDate: slotDate || undefined,
          challanSettlementRef: challanRef || undefined,
        });
        if (res.success && res.data) {
          setTicket(res.data);
          setFeedback({ type: 'success', message: `Vehicle Service status updated to "${status}" successfully!` });
          onRefreshQueue();
        } else {
          setFeedback({ type: 'error', message: res.message || 'Failed to update Vehicle status.' });
        }
      } else if (type === 'farmer') {
        res = await farmerApi.updateStatus(ticket._id, {
          status,
          resolutionRemarks: remarks,
          officialAckNumber: ackNumber,
          fieldInspectionDate: slotDate || undefined,
        });
        if (res.success && res.data) {
          setTicket(res.data);
          setFeedback({ type: 'success', message: `Farmer application status updated to "${status}" successfully!` });
          onRefreshQueue();
        } else {
          setFeedback({ type: 'error', message: res.message || 'Failed to update Farmer status.' });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Unexpected network error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatusObj = STATUS_CONFIG[ticket.status] || {
    label: ticket.status || 'Pending',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
  };

  const citizenName =
    ticket.citizenName ||
    ticket.applicantName ||
    ticket.ownerName ||
    ticket.farmerName ||
    'Applicant';

  const citizenPhone = ticket.contactNumber || ticket.phone || ticket.mobileNumber || '';
  const citizenEmail = ticket.email || ticket.applicantEmail || '';
  const citizenAddress =
    ticket.address ||
    ticket.newAddress ||
    ticket.permanentAddress ||
    (ticket.district && ticket.taluk && ticket.village ? `${ticket.village}, Taluk: ${ticket.taluk}, Dist: ${ticket.district}` : '');

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      {/* TOP NAVIGATION & ACTIONS BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span>Back to Queue</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Breadcrumb Info */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="capitalize">{type} Queue</span>
            <span>/</span>
            <span className="font-mono font-bold text-slate-900">{ticket.ticketNumber || ticket._id}</span>
          </div>
        </div>

        {/* Quick Toolbar: Prev/Next & Print */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {prevTicket && (
            <button
              onClick={() => handleNavigateTicket(prevTicket)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              title="Previous application in queue"
            >
              ← Previous
            </button>
          )}

          {nextTicket && (
            <button
              onClick={() => handleNavigateTicket(nextTicket)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              title="Next application in queue"
            >
              Next →
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE HEADER BANNER */}
      <div className="bg-[#0f172a] text-white rounded-2xl p-5 sm:p-7 shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="p-3.5 sm:p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl shrink-0">
              <IconComponent className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {type.toUpperCase()} SERVICE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Submitted:{' '}
                  {ticket.createdAt
                    ? new Date(ticket.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '---'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{meta.title}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">{meta.subtitle}</p>
            </div>
          </div>

          {/* Ticket ID & Status Pill */}
          <div className="flex lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t border-slate-800 lg:border-t-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Ticket:</span>
              <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-xl">
                <span className="font-mono font-black text-emerald-400 text-sm">{ticket.ticketNumber || ticket._id}</span>
                <button
                  onClick={() => handleCopy(ticket.ticketNumber || ticket._id, 'ticket')}
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white cursor-pointer"
                  title="Copy Application ID"
                >
                  {copiedText === 'ticket' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs inline-flex items-center gap-1.5 ${currentStatusObj.badge}`}>
                <span className={`w-2 h-2 rounded-full ${currentStatusObj.dot}`} />
                {currentStatusObj.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: DETAILED DOSSIER (2 SPANS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* UPI PAYMENT & UTR VERIFICATION CARD */}
          {paymentRecord && (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <span>UPI Payment & UTR Verification</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          paymentRecord.status === 'Verified & Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : paymentRecord.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        }`}
                      >
                        {paymentRecord.status}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">Citizen UPI QR Code Payment Reference</p>
                  </div>
                </div>

                {/* Quick Approve / Reject action */}
                <div className="flex items-center gap-2">
                  {paymentRecord.status === 'Pending Verification' ? (
                    <>
                      <button
                        type="button"
                        onClick={handleRejectPayment}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleApprovePayment}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Payment</span>
                      </button>
                    </>
                  ) : paymentRecord.status === 'Verified & Approved' ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Payment Verified</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Payment Rejected</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Amount Paid
                  </span>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">
                    ₹{paymentRecord.amount || 0}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    12-Digit UTR Ref Number
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <code className="text-xs font-mono font-black text-slate-900">
                      {paymentRecord.utrNumber || 'N/A'}
                    </code>
                    {paymentRecord.utrNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentRecord.utrNumber, 'utr')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copy UTR"
                      >
                        {copiedText === 'utr' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    UPI ID Used
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-0.5 truncate">
                    {paymentRecord.upiIdUsed || 'jjesper143@oksbi'}
                  </div>
                </div>
              </div>

              {paymentRecord.paymentScreenshot && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-600 block mb-1">
                    Uploaded Payment Receipt Proof:
                  </span>
                  <img
                    src={paymentRecord.paymentScreenshot}
                    alt="Receipt Proof"
                    className="w-32 h-32 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90"
                    onClick={() => window.open(paymentRecord.paymentScreenshot, '_blank')}
                  />
                </div>
              )}
            </div>
          )}

          {/* 1. CITIZEN / APPLICANT PROFILE CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Citizen / Applicant Profile</h2>
                  <p className="text-xs text-slate-500">Registered primary contact details and identity information</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Applicant Full Name</span>
                <div className="text-sm font-black text-slate-900 mt-1">{citizenName}</div>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Mobile Number</span>
                <div className="flex items-center justify-between mt-1">
                  <a
                    href={`tel:${citizenPhone}`}
                    className="text-sm font-bold font-mono text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{citizenPhone || '---'}</span>
                  </a>
                  {citizenPhone && (
                    <button
                      onClick={() => handleCopy(citizenPhone, 'phone')}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedText === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Email Address</span>
                <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                  {citizenEmail ? (
                    <a href={`mailto:${citizenEmail}`} className="text-slate-800 hover:text-emerald-700 hover:underline flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{citizenEmail}</span>
                    </a>
                  ) : (
                    'Not Specified'
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">User Account / Citizen ID</span>
                <div className="text-xs font-mono font-bold text-slate-700 mt-1 truncate">
                  {ticket.userId ? `${ticket.userId.slice(0, 14)}...` : 'Guest / Direct'}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Alternate Contact</span>
                <div className="text-xs font-mono font-semibold text-slate-800 mt-1">
                  {ticket.alternateNumber || ticket.alternatePhone || 'None Provided'}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Priority Level</span>
                <div className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${ticket.priority === 'Urgent' ? 'bg-rose-500' : ticket.priority === 'High' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span>{ticket.priority || 'Normal'}</span>
                </div>
              </div>
            </div>

            {citizenAddress && (
              <div className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-xl flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Registered Residence / Delivery Address</span>
                  <div className="text-xs font-medium text-slate-800 leading-relaxed mt-0.5">{citizenAddress}</div>
                </div>
              </div>
            )}
          </div>

          {/* 2. SERVICE PAYLOAD SPECIFICATIONS CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Application Parameters & Details</h2>
                  <p className="text-xs text-slate-500">Service-specific parameters submitted by the citizen</p>
                </div>
              </div>
            </div>

            {/* AADHAAR CONTENT */}
            {type === 'aadhaar' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Service / Issue Type</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.issueType}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Aadhaar Card Reference</span>
                    <div className="font-mono font-bold text-emerald-800 text-xs mt-1">
                      {ticket.aadhaarNumber ? `XXXX-XXXX-${ticket.aadhaarNumber.slice(-4)}` : 'Biometric / Demographic'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">UIDAI URN / SRN Number</span>
                    <div className="font-mono font-bold text-slate-800 text-xs mt-1">{ticket.urnNumber || 'Pending Generation'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled UIDAI Kendra</span>
                    <div className="font-medium text-slate-800 text-xs mt-1">{ticket.enrolledCenter || 'Head Post Office / Taluk Kendra'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Birth / Demographic Record</span>
                    <div className="font-medium text-slate-800 text-xs mt-1">{ticket.dateOfBirth || 'As per Aadhaar Database'}</div>
                  </div>
                </div>

                {ticket.description && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Citizen Statement / Correction Notes:</span>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs leading-relaxed font-medium">
                      {ticket.description}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PAN CONTENT */}
            {type === 'pan' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Category</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.applicationType === 'new' ? 'Form 49A (New PAN Card)' : 'CSF (Correction / Re-issue)'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Father / Mother Name</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.fatherName || ticket.motherName || '---'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Birth (DOB)</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.dateOfBirth || '---'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Aadhaar Linked</span>
                    <div className="font-mono font-bold text-emerald-800 text-xs mt-1">
                      {ticket.aadhaarNumber ? `XXXX-XXXX-${ticket.aadhaarNumber.slice(-4)}` : '---'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Existing PAN Number</span>
                    <div className="font-mono font-bold text-slate-800 text-xs mt-1">{ticket.existingPan || 'N/A (New Card)'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Card Delivery Mode</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.deliveryMode || 'Physical + e-PAN Card'}</div>
                  </div>
                </div>

                {ticket.correctionDetails && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Requested Corrections:</span>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs leading-relaxed font-medium">
                      {ticket.correctionDetails}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VOTER CONTENT */}
            {type === 'voter' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Relative / Father / Spouse</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.relationName || '---'} ({ticket.relationType || 'Relative'})
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">DOB / Age & Gender</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.dateOfBirth || (ticket.age ? `${ticket.age} Yrs` : '---')} • {ticket.gender || '---'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">EPIC (Voter Card) Number</span>
                    <div className="font-mono font-bold text-emerald-800 text-xs mt-1">{ticket.epicNumber || 'New Form 6'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Assembly Constituency</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.assemblyConstituency || 'Salem Central'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">District & State</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.district || 'Salem'}, {ticket.state || 'Tamil Nadu'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Polling Station / Part No</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.pollingStation || 'Designated Kendra'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* RATION CONTENT */}
            {type === 'ration' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Ration Card Number</span>
                    <div className="font-mono font-bold text-emerald-800 text-xs mt-1">
                      {ticket.rationCardNumber || 'New Smart Card Application'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Card Category</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.cardType || 'PHH - Priority Household'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Family Head / Relative</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.relativeName || '---'} ({ticket.relationType || 'Relative'})
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">District & Taluk</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.district || 'Salem'} / {ticket.taluk || 'Central'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fair Price Shop (FPS)</span>
                    <div className="font-mono font-bold text-slate-900 text-xs mt-1">{ticket.fpsCode || 'FPS-TN-DEFAULT'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Request Type</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.serviceType}</div>
                  </div>
                </div>

                {/* Family Members list table */}
                {ticket.membersList && ticket.membersList.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                      Registered Family Members ({ticket.membersList.length}):
                    </span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="p-3">Member Name</th>
                            <th className="p-3">Relationship</th>
                            <th className="p-3">Gender</th>
                            <th className="p-3">Date of Birth</th>
                            <th className="p-3">Aadhaar Reference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {ticket.membersList.map((m: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/70">
                              <td className="p-3 font-bold text-slate-900">{m.name || '---'}</td>
                              <td className="p-3 text-slate-600">{m.relation}</td>
                              <td className="p-3 text-slate-600">{m.gender}</td>
                              <td className="p-3 font-mono text-slate-600">{m.dateOfBirth || '---'}</td>
                              <td className="p-3 font-mono text-slate-800">
                                {m.aadhaarNumber ? `XXXX-XXXX-${m.aadhaarNumber.slice(-4)}` : '---'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DRIVING CONTENT */}
            {type === 'driving' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Driving License / LL Number</span>
                    <div className="font-mono font-bold text-emerald-800 text-xs mt-1">
                      {ticket.drivingLicenseNumber || ticket.learnerLicenseNumber || 'New Application'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Relative / Father Name</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.relativeName || '---'} ({ticket.relationType || 'Relative'})
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">DOB & Blood Group</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.dateOfBirth || '---'} • Blood: {ticket.bloodGroup || 'O+'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">RTO Jurisdiction</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.rtoOffice || 'TN-01 Chennai'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Authorized Vehicle Classes</span>
                    <div className="font-mono font-bold text-slate-900 text-xs mt-1">{ticket.vehicleClass || 'MCWG, LMV'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sarathi Service Type</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.serviceType}</div>
                  </div>
                </div>
              </div>
            )}

            {/* VEHICLE CONTENT */}
            {type === 'vehicle' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Vehicle Registration Number</span>
                    <div className="font-mono font-black text-emerald-950 text-base mt-1">{ticket.vehicleNumber}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle Class & Fuel</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.vehicleClass} • {ticket.fuelType}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Maker & Model</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.makerModel || 'Standard Private'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Chassis Number</span>
                    <div className="font-mono font-bold text-slate-800 text-xs mt-1">{ticket.chassisNumber || '---'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Engine Number</span>
                    <div className="font-mono font-bold text-slate-800 text-xs mt-1">{ticket.engineNumber || '---'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">RTO Jurisdiction</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.rtoOffice || 'TN-01 Chennai Central'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Insurance & PUCC Details</span>
                    <div className="text-xs text-slate-800 font-semibold">
                      Policy: <strong className="font-mono">{ticket.insurancePolicyNumber || '---'}</strong> ({ticket.insuranceCompany || '---'})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Insurance Expiry: {ticket.insuranceExpiryDate || '---'} • PUCC: {ticket.puccNumber || '---'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Finance & Challan Status</span>
                    <div className="text-xs text-slate-800 font-semibold">
                      Hypothecation: <strong className="font-medium">{ticket.hypothecationBank || 'None / Cleared'}</strong>
                    </div>
                    {ticket.challanNumber ? (
                      <div className="text-xs font-bold text-rose-700">
                        Challan: {ticket.challanNumber} (₹{ticket.challanAmount || 0})
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 font-bold">No Pending Challans</div>
                    )}
                  </div>
                </div>

                {ticket.newOwnerName && (
                  <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] uppercase font-black text-blue-900 block">Ownership Transfer (Buyer) Details</span>
                    <div className="font-bold text-slate-900">
                      Buyer Name: {ticket.newOwnerName} (Phone: {ticket.newOwnerPhone})
                    </div>
                    <div className="text-slate-600">New Registered Address: {ticket.newAddress || '---'}</div>
                  </div>
                )}
              </div>
            )}

            {/* FARMER DETAILS */}
            {type === 'farmer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Farmer Name</span>
                    <div className="font-bold text-emerald-950 text-sm mt-1">{ticket.farmerName}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Father / Spouse Name</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.fatherOrHusbandName || '---'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer Category & Community</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.farmerCategory} • {ticket.community}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue District & Taluk</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.district} / {ticket.taluk}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue Village</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.village}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Patta & Survey Numbers</span>
                    <div className="font-mono font-bold text-emerald-800 text-xs mt-1">
                      {ticket.pattaNumber ? `Patta: ${ticket.pattaNumber}` : ''} {ticket.surveyNumber ? `Sy: ${ticket.surveyNumber}` : '---'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Land Area</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ticket.totalLandArea || '---'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cultivated Crop & Season</span>
                    <div className="font-bold text-slate-900 text-xs mt-1">
                      {ticket.cropName} • {ticket.season}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Irrigation Source</span>
                    <div className="font-medium text-slate-800 text-xs mt-1">{ticket.irrigationSource || 'Borewell'}</div>
                  </div>
                </div>

                {/* DBT Bank Account Card */}
                {(ticket.bankAccountNumber || ticket.bankIfscCode) && (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] uppercase font-black text-emerald-900 block">Direct Benefit Transfer (DBT) Bank Account</span>
                    <div className="font-semibold text-slate-900">
                      Bank: <strong className="font-bold">{ticket.bankName || 'Direct Account'}</strong> • A/c:{' '}
                      <strong className="font-mono">{ticket.bankAccountNumber || '---'}</strong> • IFSC:{' '}
                      <strong className="font-mono">{ticket.bankIfscCode || '---'}</strong>
                    </div>
                  </div>
                )}

                {ticket.pmKisanBeneficiaryId && (
                  <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-900 block">PM-KISAN Beneficiary ID</span>
                      <span className="font-mono font-bold text-blue-950">{ticket.pmKisanBeneficiaryId}</span>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">PM-KISAN DBT</span>
                  </div>
                )}

                {ticket.schemeSpecificNotes && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Scheme Specific Notes:</span>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs leading-relaxed font-medium">
                      {ticket.schemeSpecificNotes}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. ATTACHED DOCUMENTS & PROOFS CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Verification Assets & Documents</h2>
                  <p className="text-xs text-slate-500">Citizen uploads, certificates, and ID proof attachments</p>
                </div>
              </div>
            </div>

            {ticket.documents && ticket.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ticket.documents.map((doc: any, idx: number) => {
                  const docName = typeof doc === 'string' ? doc : doc.name || doc.fileName || `Document #${idx + 1}`;
                  const docUrl = typeof doc === 'string' ? doc : doc.url || doc.path || '#';
                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate" title={docName}>
                          {docName}
                        </span>
                      </div>
                      {docUrl && docUrl !== '#' && (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg text-emerald-700 hover:text-emerald-800 cursor-pointer shadow-2xs shrink-0"
                          title="Open document in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                No external document files attached. Data verified via national API/portal.
              </div>
            )}
          </div>

          {/* 4. AUDIT TRAIL & ACTIVITY LOG */}
          {ticket.auditLog && ticket.auditLog.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Audit Trail & Status Timeline ({ticket.auditLog.length} Events)
                    </h2>
                    <p className="text-xs text-slate-500">Comprehensive chronological log of status transitions and officer remarks</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Status Transition</th>
                      <th className="p-3">Official Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {ticket.auditLog.map((log: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '---'}
                        </td>
                        <td className="p-3 font-bold text-slate-800">{log.action}</td>
                        <td className="p-3 whitespace-nowrap">
                          {log.fromStatus && log.toStatus ? (
                            <span className="font-mono text-[11px] text-slate-700">
                              {log.fromStatus} → <strong className="text-emerald-700">{log.toStatus}</strong>
                            </span>
                          ) : (
                            <span className="text-slate-400">---</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs">{log.remarks || '---'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTION & PROCESSING CONSOLE (1 SPAN) */}
        <div className="space-y-6">
          {/* A. OFFICIAL DEPARTMENT ACKNOWLEDGMENT */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Department References</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Ack / Reference Number</span>
                <div className="font-mono font-bold text-emerald-800 text-xs mt-1 flex items-center justify-between">
                  <span>
                    {ticket.officialAckNumber ||
                      ticket.vahanAckNumber ||
                      ticket.sarathiAckNumber ||
                      ticket.tnpdsAckNumber ||
                      ticket.eciReferenceNumber ||
                      ticket.nsdlUtiiAckNumber ||
                      'Pending Assignment'}
                  </span>
                  {(ticket.officialAckNumber || ticket.vahanAckNumber || ticket.sarathiAckNumber || ticket.tnpdsAckNumber || ticket.eciReferenceNumber || ticket.nsdlUtiiAckNumber) && (
                    <button
                      onClick={() =>
                        handleCopy(
                          ticket.officialAckNumber ||
                            ticket.vahanAckNumber ||
                            ticket.sarathiAckNumber ||
                            ticket.tnpdsAckNumber ||
                            ticket.eciReferenceNumber ||
                            ticket.nsdlUtiiAckNumber,
                          'ack'
                        )
                      }
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {copiedText === 'ack' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {type === 'farmer' ? 'Field Inspection Date' : 'Scheduled In-Person Slot'}
                </span>
                <div className="font-semibold text-slate-800 text-xs mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {ticket.fieldInspectionDate
                      ? new Date(ticket.fieldInspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : ticket.rtoSlotDate
                      ? new Date(ticket.rtoSlotDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : type === 'farmer' ? 'No Inspection Scheduled' : 'No Physical Slot Required'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Previous Official Remarks:</span>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs font-medium rounded-xl leading-relaxed">
                  {ticket.resolutionRemarks || (
                    <span className="text-slate-400 italic">No notes recorded yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* B. LIVE STATUS PROCESSING CONSOLE */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500/20 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Process / Update Status</h3>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-3.5">
              {/* Status Dropdown */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="Pending">Pending (Received)</option>
                  <option value="In Progress">In Progress (Processing)</option>
                  <option value="Scheduled">Scheduled (Appointment Set)</option>
                  <option value="Pending Docs">Pending Docs (Awaiting Proofs)</option>
                  <option value="Resolved">Resolved / Completed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Official Ack / Reference Field */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Official Acknowledgment / Ref No
                </label>
                <input
                  type="text"
                  value={ackNumber}
                  onChange={(e) => setAckNumber(e.target.value)}
                  placeholder="e.g. TN-2026-981245 / VAH-8812"
                  className="w-full text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Slot / Inspection Date (For Driving / Vehicle / Aadhaar / Farmer) */}
              {(type === 'driving' || type === 'vehicle' || type === 'aadhaar' || type === 'farmer') && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    {type === 'farmer' ? 'Field Inspection / Verification Date' : 'Appointment / Slot Date'}
                  </label>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              )}

              {/* Challan Settlement Ref (For Vehicle) */}
              {type === 'vehicle' && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Challan Settlement Reference
                  </label>
                  <input
                    type="text"
                    value={challanRef}
                    onChange={(e) => setChallanRef(e.target.value)}
                    placeholder="e.g. E-CHALLAN-PAID-9921"
                    className="w-full text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              )}

              {/* Remarks Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Official Remarks & Citizen Note</label>
                </div>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter update notes for the citizen or internal processing record..."
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                />
              </div>

              {/* Quick Preset Remarks Buttons */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Quick Note Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Documents verified & submitted to portal',
                    'Appointment slot confirmed. Bring original IDs.',
                    'Application completed successfully.',
                    'Please re-upload clear proof document.',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRemarks(preset)}
                      className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer transition-colors text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Update...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Update Application</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

