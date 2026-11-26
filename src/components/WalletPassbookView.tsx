import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  PlusCircle,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';
import { walletApi, WalletTransactionItem } from '../services/walletApi';

export const WalletPassbookView: React.FC = () => {
  const {
    walletBalance,
    transactions: localTxns,
    setIsRechargeModalOpen,
    refreshWalletBalance,
  } = useApp();

  const [walletFilter, setWalletFilter] = useState<'all' | 'CREDIT' | 'DEBIT'>('all');
  const [searchTxn, setSearchTxn] = useState('');
  const [backendTxns, setBackendTxns] = useState<WalletTransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await walletApi.getTransactions(1, 50);
      if (res.transactions && res.transactions.length > 0) {
        setBackendTxns(res.transactions);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
    refreshWalletBalance();
  }, []);

  // Merge backend transactions with local fallback transactions
  const displayTxns = backendTxns.length > 0
    ? backendTxns.map((bt) => ({
        id: bt.transactionId,
        refId: bt.cashfreeOrderId || bt.relatedOrderId || bt.paymentReferenceId || 'DIRECT_LEDGER',
        title: bt.description,
        wallet: 'Citizen Portal Wallet',
        date: new Date(bt.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date(bt.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        amount: bt.amount,
        type: bt.type === 'CREDIT' ? 'credit' : 'debit',
        status: bt.status,
      }))
    : localTxns.map((lt) => ({
        id: lt.id,
        refId: lt.refId,
        title: lt.title,
        wallet: 'Citizen Portal Wallet',
        date: lt.date,
        time: lt.time,
        amount: lt.amount,
        type: lt.type,
        status: 'SUCCESS',
      }));

  const filteredTxns = displayTxns.filter((t) => {
    if (walletFilter === 'CREDIT' && t.type !== 'credit') return false;
    if (walletFilter === 'DEBIT' && t.type !== 'debit') return false;
    if (searchTxn.trim()) {
      const q = searchTxn.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.refId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div
      className="space-y-6 pb-12 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* Single Unified Wallet Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-200">
                Citizen Portal Wallet
              </span>
            </div>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
              ₹ {Number(walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Single unified wallet for all Citizen e-Governance services: Ration Card, Driving License, Vehicle RC, CAN Registration, PAN, Voter, Aadhaar, and Certificates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 rounded-xl text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:scale-102"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>Add Money via Cashfree</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Wallet Passbook & Statements
              </h2>
              <button
                type="button"
                onClick={fetchTransactions}
                className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
                title="Refresh Transactions"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Real-time audit log of service debits and Cashfree portal top-ups
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTxn}
                onChange={(e) => setSearchTxn(e.target.value)}
                placeholder="Search Txn ID / Order..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 text-xs font-bold">
              <button
                onClick={() => setWalletFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  walletFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setWalletFilter('CREDIT')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  walletFilter === 'CREDIT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Credits
              </button>
              <button
                onClick={() => setWalletFilter('DEBIT')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  walletFilter === 'DEBIT' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Debits
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Txn ID / Ref</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Wallet Type</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-bold text-sm">No transactions found</p>
                    <p className="text-xs">Add money or apply for services to generate ledger records.</p>
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => {
                  const isCredit = txn.type === 'credit';
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{txn.id}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                          {txn.refId}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div className="font-bold">{txn.date}</div>
                        <div className="text-[10px] text-slate-400">{txn.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{txn.title}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Unified Wallet
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-black text-sm ${
                            isCredit ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isCredit ? '+' : '-'} ₹{txn.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {txn.status || 'SUCCESS'}
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
    </div>
  );
};
