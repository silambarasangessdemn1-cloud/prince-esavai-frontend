import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Zap,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { walletApi, getCashfreeInstance } from '../services/walletApi';

export const WalletModal: React.FC = () => {
  const {
    isRechargeModalOpen,
    setIsRechargeModalOpen,
    walletBalance,
    refreshWalletBalance,
  } = useApp();

  const [amount, setAmount] = useState<number>(500);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isRechargeModalOpen) return null;

  const quickAmounts = [100, 250, 500, 1000, 2000, 5000];

  const handleCashfreeRecharge = async () => {
    if (amount < 10) {
      setErrorMsg('Minimum recharge amount is ₹10');
      return;
    }
    if (amount > 50000) {
      setErrorMsg('Maximum recharge amount is ₹50,000');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      // 1. Create order on backend
      const orderData = await walletApi.createTopupOrder(amount);

      // 2. Load Cashfree Web SDK
      const cashfree = await getCashfreeInstance('sandbox');

      // 3. Launch Cashfree checkout modal
      const checkoutResult = await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_modal',
      });

      if (checkoutResult?.error) {
        setErrorMsg(checkoutResult.error.message || 'Payment was cancelled or could not be completed.');
        setIsProcessing(false);
        return;
      }

      // 4. Verify payment server-side
      await walletApi.verifyTopupOrder(orderData.orderId);
      await refreshWalletBalance();

      setSuccessNotice(`₹${amount.toFixed(2)} credited successfully to your wallet!`);
      confetti({ particleCount: 80, spread: 70 });

      setTimeout(() => {
        setSuccessNotice(null);
        setIsRechargeModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Cashfree payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Add Money to Wallet</h3>
              <p className="text-[11px] text-slate-300">
                Instant credit via Cashfree Payment Gateway (UPI, Cards, Netbanking)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRechargeModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {successNotice ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Wallet Recharged Successfully!</h4>
              <p className="text-xs text-slate-600 font-mono">
                {successNotice}
              </p>
            </div>
          ) : (
            <>
              {/* Single Unified Wallet Balance Status */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Current Available Balance
                    </span>
                    <span className="text-xl font-black font-mono text-slate-900">
                      ₹ {Number(walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
                  Unified Wallet
                </span>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  Top-Up Amount (₹ INR)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-black text-slate-700">₹</span>
                  <input
                    type="number"
                    min="10"
                    max="50000"
                    step="10"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-lg font-black font-mono border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    placeholder="Enter amount (Min ₹10)"
                  />
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q)}
                      className={`py-1 text-xs font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                        amount === q
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      +{q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Gateway Badge */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">Powered by Cashfree Payment Gateway</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Instant Auto-Credit
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleCashfreeRecharge}
                disabled={isProcessing || amount < 10}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting Cashfree Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay ₹{amount.toFixed(2)} via Cashfree</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
