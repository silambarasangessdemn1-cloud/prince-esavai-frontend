import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Filter,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';
import { paymentApi, PaymentItem } from '../services/paymentApi';

export interface AdminPaymentsViewProps {
  onRefreshCounts?: () => void;
}

export const AdminPaymentsView: React.FC<AdminPaymentsViewProps> = ({ onRefreshCounts }) => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Rejection modal
  const [rejectingItem, setRejectingItem] = useState<PaymentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Screenshot preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const res = await paymentApi.getAllPayments({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchQuery.trim() || undefined,
    });
    setPayments(res.payments);
    setStats(res.stats);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, searchQuery]);

  const handleCopy = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleApprove = async (payment: PaymentItem) => {
    const id = payment._id || payment.ticketNumber;
    await paymentApi.verifyPayment(id, 'Verified & Approved', 'Payment verified by Admin');
    await loadData();
    if (onRefreshCounts) onRefreshCounts();
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    const id = rejectingItem._id || rejectingItem.ticketNumber;
    await paymentApi.verifyPayment(
      id,
      'Rejected',
      rejectionReason || 'Invalid UTR or payment not received'
    );
    setRejectingItem(null);
    setRejectionReason('');
    await loadData();
    if (onRefreshCounts) onRefreshCounts();
  };

  const totalAmountCollected = payments
    .filter((p) => p.status === 'Verified & Approved')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div
      className="space-y-6 pb-16 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>UPI Verification Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            UPI QR Payment Verifications
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Verify citizen payment reference numbers (UTR) against bank records and approve service processing.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start md:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Submissions
          </span>
          <span className="text-2xl font-black text-slate-900 tracking-tight mt-1 block">
            {stats.total}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">All recorded payments</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/40 shadow-2xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            Pending Verification
          </span>
          <span className="text-2xl font-black text-amber-800 tracking-tight mt-1 block flex items-center gap-2">
            <span>{stats.pending}</span>
            {stats.pending > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full animate-pulse">
                Action Required
              </span>
            )}
          </span>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting admin review</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            Verified & Approved
          </span>
          <span className="text-2xl font-black text-emerald-800 tracking-tight mt-1 block">
            {stats.verified}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">Approved for processing</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Approved Volume
          </span>
          <span className="text-2xl font-black text-slate-900 tracking-tight mt-1 block">
            ₹{totalAmountCollected.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Total verified fees</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {[
            { id: 'all', label: `All (${stats.total})` },
            { id: 'Pending Verification', label: `Pending (${stats.pending})` },
            { id: 'Verified & Approved', label: `Approved (${stats.verified})` },
            { id: 'Rejected', label: `Rejected (${stats.rejected})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search UTR, Token, Citizen..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Payment Records Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Citizen submissions with UTR reference numbers will appear here for verification.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((payment) => {
              const isPending = payment.status === 'Pending Verification';
              const isApproved = payment.status === 'Verified & Approved';
              const isRejected = payment.status === 'Rejected';

              return (
                <div
                  key={payment._id || payment.ticketNumber}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-colors ${
                    isPending ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Left Column: Token, Service, Applicant */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {payment.ticketNumber}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {payment.serviceName}
                      </span>
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                          isPending
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : isApproved
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {payment.applicantName}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {payment.applicantPhone}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">
                        {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {payment.rejectionReason && (
                      <p className="text-xs text-rose-700 font-bold bg-rose-50/80 px-2.5 py-1 rounded-lg border border-rose-200 inline-block">
                        Rejection Reason: {payment.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Center Column: UTR & Amount */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                    {/* Amount */}
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Fee Paid
                      </span>
                      <span className="text-xl font-black text-emerald-700 tracking-tight">
                        ₹{payment.amount}
                      </span>
                    </div>

                    {/* UTR Box with copy */}
                    <div className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 flex items-center gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          12-Digit UTR Number
                        </span>
                        <code className="text-xs font-mono font-black text-slate-900">
                          {payment.utrNumber}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(payment.utrNumber)}
                        className="p-1 rounded-md hover:bg-white text-slate-600 cursor-pointer transition-colors"
                        title="Copy UTR"
                      >
                        {copiedUtr === payment.utrNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Screenshot Button (if attached) */}
                    {payment.paymentScreenshot && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(payment.paymentScreenshot || null)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setRejectingItem(payment)}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(payment)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify & Approve</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Approved & Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Payment Rejected</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Reject Payment for {rejectingItem.ticketNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Provide reason why this UTR ({rejectingItem.utrNumber}) cannot be verified.
                </p>
              </div>
              <button
                onClick={() => setRejectingItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. UTR not found in bank account, amount mismatch, duplicate UTR..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-900">Payment Receipt Screenshot</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewImage}
              alt="Payment receipt proof"
              className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

