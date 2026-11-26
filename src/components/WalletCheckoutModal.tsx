import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  PlusCircle,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { walletApi, getCashfreeInstance } from '../services/walletApi';

export interface WalletCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  categoryLabel?: string;
  amount: number;
  applicantName: string;
  applicantPhone: string;
  ticketNumber?: string;
  serviceId?: string;
  onConfirmPayment: (paymentDetails: {
    transactionId: string;
    paidAmount: number;
    paymentMethod: string;
  }) => void;
}

export const WalletCheckoutModal: React.FC<WalletCheckoutModalProps> = ({
  isOpen,
  onClose,
  serviceName,
  categoryLabel = 'e-Sevai Service',
  amount,
  applicantName,
  applicantPhone,
  ticketNumber = '',
  serviceId = '',
  onConfirmPayment,
}) => {
  const { walletBalance, refreshWalletBalance } = useApp();

  const [isDeducting, setIsDeducting] = useState(false);
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [topupSuccessMsg, setTopupSuccessMsg] = useState('');

  const shortfall = Math.max(0, +(amount - walletBalance).toFixed(2));
  const isSufficient = walletBalance >= amount;

  // Recommended topup amount: at least the shortfall, rounded to nearest 50 or minimum 10
  const defaultTopup = shortfall > 0 ? Math.max(10, Math.ceil(shortfall / 10) * 10) : 100;
  const [customTopupAmount, setCustomTopupAmount] = useState<number>(defaultTopup);

  useEffect(() => {
    if (shortfall > 0) {
      setCustomTopupAmount(Math.max(10, Math.ceil(shortfall / 10) * 10));
    }
  }, [shortfall]);

  if (!isOpen) return null;

  // 1. Process payment using existing wallet balance
  const handlePayFromWallet = async () => {
    if (!isSufficient) {
      setErrorMsg(`Insufficient wallet balance. You need ₹${shortfall.toFixed(2)} more to proceed.`);
      return;
    }

    setIsDeducting(true);
    setErrorMsg('');

    try {
      const generatedTicket = ticketNumber || `ESV_${Date.now().toString(36).toUpperCase()}`;
      const res = await walletApi.debitWalletForService({
        amount,
        serviceId: serviceId || 'generic',
        serviceName,
        ticketNumber: generatedTicket,
        applicantName,
        applicantPhone,
      });

      await refreshWalletBalance();

      onConfirmPayment({
        transactionId: res.transactionId,
        paidAmount: amount,
        paymentMethod: 'Wallet Balance',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment deduction failed. Please check your balance.');
    } finally {
      setIsDeducting(false);
    }
  };

  // 2. Launch Cashfree PG checkout to top-up wallet
  const handleCashfreeTopup = async () => {
    if (customTopupAmount < 10) {
      setErrorMsg('Minimum wallet top-up amount is ₹10');
      return;
    }

    setIsTopupLoading(true);
    setErrorMsg('');
    setTopupSuccessMsg('');

    try {
      // Create Cashfree PG Order on backend
      const orderData = await walletApi.createTopupOrder(customTopupAmount);

      // Load Cashfree Web SDK
      const cashfree = await getCashfreeInstance('sandbox');

      // Launch Cashfree checkout popup
      const checkoutResult = await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_modal',
      });

      if (checkoutResult?.error) {
        setErrorMsg(checkoutResult.error.message || 'Payment was cancelled or failed.');
        setIsTopupLoading(false);
        return;
      }

      // Verify payment on backend
      const verifyRes = await walletApi.verifyTopupOrder(orderData.orderId);
      await refreshWalletBalance();

      setTopupSuccessMsg(`₹${customTopupAmount} added successfully! Your new balance is ₹${verifyRes.walletBalance.toFixed(2)}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not complete Cashfree payment. Please try again.');
    } finally {
      setIsTopupLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Wallet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                {categoryLabel}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                Secure Wallet Checkout
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Service Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                  Service Application
                </span>
                <span className="text-sm font-black text-slate-900 block">
                  {serviceName}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Applicant: <strong>{applicantName}</strong> {applicantPhone ? `• ${applicantPhone}` : ''}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                  Service Fee
                </span>
                <span className="text-xl font-black text-emerald-700">
                  ₹{amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isSufficient
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Wallet className={`w-4 h-4 ${isSufficient ? 'text-emerald-700' : 'text-amber-700'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Your Available Wallet Balance
                </span>
              </div>
              <span className="text-lg font-black font-mono">
                ₹{walletBalance.toFixed(2)}
              </span>
            </div>

            <div className="pt-2 text-xs flex items-center justify-between font-semibold">
              {isSufficient ? (
                <>
                  <span className="text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Sufficient balance available
                  </span>
                  <span className="text-slate-600">
                    Remaining after fee: <strong>₹{(walletBalance - amount).toFixed(2)}</strong>
                  </span>
                </>
              ) : (
                <>
                  <span className="text-amber-900 flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    Shortfall: ₹{shortfall.toFixed(2)} needed
                  </span>
                  <span className="text-amber-800">
                    Top up using Cashfree below
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {topupSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{topupSuccessMsg}</span>
            </div>
          )}

          {/* Cashfree Top-Up Box (Visible when Insufficient Balance OR user wants to add money) */}
          {!isSufficient && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Instant Wallet Top-up (Cashfree)</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  100% Secure PG
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  shortfall > 0 ? Math.ceil(shortfall) : 50,
                  100,
                  250,
                  500,
                ].map((val, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomTopupAmount(val)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      customTopupAmount === val
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    +₹{val}
                  </button>
                ))}
              </div>

              {/* Top-up Input & Cashfree Checkout Button */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={10}
                    max={50000}
                    value={customTopupAmount || ''}
                    onChange={(e) => setCustomTopupAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="Enter amount"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCashfreeTopup}
                  disabled={isTopupLoading || customTopupAmount < 10}
                  className="px-4 py-2 bg-[#00a86b] hover:bg-[#008f5b] text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-colors shrink-0"
                >
                  {isTopupLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Money via Cashfree</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeducting || isTopupLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePayFromWallet}
              disabled={!isSufficient || isDeducting || isTopupLoading}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                isSufficient
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {isDeducting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deducting & Submitting...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay ₹{amount.toFixed(2)} from Wallet & Submit</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Payments powered securely by Cashfree PG & Princess e-Sevai Wallet Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
};
