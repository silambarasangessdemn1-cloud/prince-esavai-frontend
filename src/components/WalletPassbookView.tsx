import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Zap,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const WalletPassbookView: React.FC = () => {
  const {
    paymentsWallet,
    cardsWallet,
    transactions,
    setIsRechargeModalOpen,
  } = useApp();

  const [walletFilter, setWalletFilter] = useState<'all' | 'payments' | 'cards'>('all');
  const [searchTxn, setSearchTxn] = useState('');

  const filteredTxns = transactions.filter((t) => {
    if (walletFilter !== 'all' && t.wallet !== walletFilter) return false;
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
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Wallet Balances Top Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payments Wallet */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 fill-blue-300 text-blue-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Payments Wallet
              </span>
            </div>
            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Balance</span>
            </button>
          </div>
          <div className="text-3xl font-black font-mono">
            ₹ {paymentsWallet.toFixed(2)}
          </div>
          <div className="text-[11px] text-blue-200 mt-2">
            Used for TN Ration Services, Driving License, Vehicle RC, Birth Certificates, Aadhaar downloads.
          </div>
        </div>

        {/* Cards Wallet */}
        <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Cards Wallet
              </span>
            </div>
            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Balance</span>
            </button>
          </div>
          <div className="text-3xl font-black font-mono">
            ₹ {cardsWallet.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-200 mt-2">
            Dedicated wallet for CAN Registration TN and State e-Governance certificate portals.
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Wallet Passbook & Statements
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time audit log of service debits and portal top-ups
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTxn}
                onChange={(e) => setSearchTxn(e.target.value)}
                placeholder="Search Txn ID, service..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-hidden font-medium"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {[
                { id: 'all', label: 'All Wallets' },
                { id: 'payments', label: 'Payments' },
                { id: 'cards', label: 'Cards' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWalletFilter(w.id as any)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    walletFilter === w.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Txn ID & Ref</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Wallet</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTxns.map((txn) => {
                const isCredit = txn.type === 'credit';
                return (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono whitespace-nowrap">
                      <div className="font-bold text-slate-900">{txn.id}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{txn.refId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{txn.title}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          txn.wallet === 'payments'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {txn.wallet}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono whitespace-nowrap">
                      {txn.date} {txn.time}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-black text-sm">
                      <span
                        className={`flex items-center gap-1 ${
                          isCredit ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{isCredit ? '+' : '-'} ₹ {txn.amount.toFixed(2)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
