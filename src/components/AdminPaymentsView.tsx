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
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
} from 'lucide-react';
import { paymentApi, PaymentItem } from '../services/paymentApi';
import { walletApi, WalletTransactionItem } from '../services/walletApi';

export interface AdminPaymentsViewProps {
  onRefreshCounts?: () => void;
}

export const AdminPaymentsView: React.FC<AdminPaymentsViewProps> = ({ onRefreshCounts }) => {
  const [activeViewTab, setActiveViewTab] = useState<'ledger' | 'historical'>('ledger');

  // Ledger state
  const [ledgerTxns, setLedgerTxns] = useState<WalletTransactionItem[]>([]);
  const [ledgerOverview, setLedgerOverview] = useState<any>(null);
  const [ledgerFilter, setLedgerFilter] = useState<string>('ALL');
  const [ledgerSearch, setLedgerSearch] = useState('');

  // Historical payments state
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [historicalStats, setHistoricalStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [historicalSearch, setHistoricalSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load Wallet Ledger & Overview
  const loadLedgerData = async () => {
    setIsLoading(true);
    try {
      const [overviewData, txnsData] = await Promise.all([
        walletApi.getAdminOverview().catch(() => null),
        walletApi.getAdminTransactions(1, 50, ledgerFilter, ledgerSearch.trim()).catch(() => ({ transactions: [] })),
      ]);
      setLedgerOverview(overviewData);
      setLedgerTxns(txnsData.transactions || []);
    } catch {}
    setIsLoading(false);
  };

  // Load Historical Payments
  const loadHistoricalData = async () => {
    setIsLoading(true);
    try {
      const res = await paymentApi.getAllPayments({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: historicalSearch.trim() || undefined,
      });
      setPayments(res.payments || []);
      setHistoricalStats(res.stats || { total: 0, pending: 0, verified: 0, rejected: 0 });
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeViewTab === 'ledger') {
      loadLedgerData();
    } else {
      loadHistoricalData();
    }
  }, [activeViewTab, ledgerFilter, ledgerSearch, statusFilter, historicalSearch]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className="space-y-6 pb-16 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cashfree Gateway & Wallet Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payments & Wallet Management
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Monitor real-time Cashfree wallet top-ups, automated service debits, and historical transaction ledgers.
          </p>
        </div>

        <button
          onClick={() => (activeViewTab === 'ledger' ? loadLedgerData() : loadHistoricalData())}
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
            Circulating Balance
          </span>
          <span className="text-2xl font-black text-slate-900 block mt-1 font-mono">
            ₹{(ledgerOverview?.totalCirculatingBalance || 0).toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
            Across {ledgerOverview?.totalUsers || 0} citizen accounts
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Cashfree Top-Ups
          </span>
          <span className="text-2xl font-black text-emerald-700 block mt-1 font-mono">
            ₹{(ledgerOverview?.credits?.total || 0).toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            {ledgerOverview?.credits?.count || 0} successful top-ups
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Service Debits
          </span>
          <span className="text-2xl font-black text-blue-700 block mt-1 font-mono">
            ₹{(ledgerOverview?.debits?.total || 0).toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            {ledgerOverview?.debits?.count || 0} applications processed
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Gateway Status
          </span>
          <span className="text-sm font-black text-emerald-800 block mt-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Cashfree {ledgerOverview?.gateway?.env?.toUpperCase() || 'SANDBOX'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            API v2023-08-01 Active
          </span>
        </div>
      </div>

      {/* Main Container with View Selector Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="px-5 pt-4 pb-0 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveViewTab('ledger')}
            className={`pb-3 px-1 text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeViewTab === 'ledger'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Cashfree Top-Ups & Wallet Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('historical')}
            className={`pb-3 px-1 text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeViewTab === 'historical'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Historical Applications & UTR Archive ({historicalStats.total})</span>
          </button>
        </div>

        {/* ── TAB 1: WALLET LEDGER & CASHFREE TOP-UPS ──────────────────────── */}
        {activeViewTab === 'ledger' && (
          <div className="p-5 space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'ALL', label: 'All Operations' },
                  { id: 'CREDIT', label: 'Top-Ups (Cashfree)' },
                  { id: 'DEBIT', label: 'Service Payments' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setLedgerFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      ledgerFilter === f.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Search Txn ID, Order ID, User..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Ledger Table */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Transaction ID & Ref</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Balance After</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {ledgerTxns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                        No transactions recorded yet in the Cashfree ledger.
                      </td>
                    </tr>
                  ) : (
                    ledgerTxns.map((tx) => {
                      const isCredit = tx.type === 'CREDIT';
                      const userObj = typeof tx.userId === 'object' && tx.userId ? tx.userId : null;
                      return (
                        <tr key={tx._id || tx.transactionId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{tx.transactionId}</span>
                              <button
                                onClick={() => handleCopy(tx.transactionId)}
                                className="text-slate-400 hover:text-slate-700"
                                title="Copy Transaction ID"
                              >
                                {copiedId === tx.transactionId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            {(tx.cashfreeOrderId || tx.relatedOrderId) && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                                Ref: {tx.cashfreeOrderId || tx.relatedOrderId}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-800">{userObj?.username || 'Citizen'}</div>
                            <div className="text-[10px] text-slate-500">{userObj?.phoneNumber || ''}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800 block">{tx.description}</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono font-black text-sm">
                            <span className={isCredit ? 'text-emerald-700' : 'text-slate-900'}>
                              {isCredit ? '+' : '-'} ₹{tx.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600 font-bold">
                            ₹{tx.updatedBalance.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                              {tx.status || 'SUCCESS'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: HISTORICAL APPLICATIONS & ARCHIVE ────────────────────── */}
        {activeViewTab === 'historical' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
                {[
                  { id: 'all', label: `All (${historicalStats.total})` },
                  { id: 'Verified & Approved', label: `Approved (${historicalStats.verified})` },
                  { id: 'Pending Verification', label: `Pending (${historicalStats.pending})` },
                  { id: 'Rejected', label: `Rejected (${historicalStats.rejected})` },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === s.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historicalSearch}
                  onChange={(e) => setHistoricalSearch(e.target.value)}
                  placeholder="Search Ticket, UTR, Name..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Ticket & Service</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reference / UTR</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        No historical payment records found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p._id || p.ticketNumber} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-emerald-900">{p.ticketNumber}</div>
                          <div className="text-[11px] text-slate-500">{p.serviceName}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{p.applicantName}</div>
                          <div className="text-[11px] text-slate-500">{p.applicantPhone}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono font-black text-slate-900">
                          ₹{(p.amount || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-700">
                          {p.utrNumber}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {p.paymentMethod || 'Wallet'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              p.status === 'Verified & Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
