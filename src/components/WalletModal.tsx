import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WalletType } from '../types';
import {
  X,
  Zap,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WalletModal: React.FC = () => {
  const {
    isRechargeModalOpen,
    setIsRechargeModalOpen,
    paymentsWallet,
    cardsWallet,
    creditWallet,
    profile,
  } = useApp();

  const [targetWallet, setTargetWallet] = useState<WalletType>('payments');
  const [amount, setAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'netbanking' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isRechargeModalOpen) return null;

  const quickAmounts = [100, 250, 500, 1000, 2000, 5000];

  const handleRecharge = () => {
    if (amount <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      creditWallet(
        targetWallet,
        amount,
        paymentMethod === 'upi' ? 'UPI / QR' : paymentMethod === 'netbanking' ? 'Net Banking' : 'Card'
      );
      setIsProcessing(false);
      setSuccessNotice(true);
      confetti({ particleCount: 70, spread: 60 });

      setTimeout(() => {
        setSuccessNotice(false);
        setIsRechargeModalOpen(false);
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Recharge Portal Wallet</h3>
              <p className="text-[11px] text-slate-300">
                Instant auto-credit to Princess A to Z portal balance
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
                ₹{amount.toFixed(2)} has been added to your {targetWallet === 'payments' ? 'Payments' : 'Cards'} Wallet.
              </p>
            </div>
          ) : (
            <>
              {/* Select Wallet */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">
                  1. Select Target Wallet
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetWallet('payments')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      targetWallet === 'payments'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
                      <Zap className="w-4 h-4 fill-blue-600" />
                      <span>Payments Wallet</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900">
                      Balance: ₹ {paymentsWallet.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      For Ration, DL, RC, Birth, Aadhaar
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetWallet('cards')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      targetWallet === 'cards'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span>Cards Wallet</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900">
                      Balance: ₹ {cardsWallet.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      For CAN Registration & TN Certificates
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  2. Choose Amount (₹)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-slate-700">₹</span>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-lg font-black font-mono border border-slate-300 rounded-xl focus:border-emerald-500 outline-hidden"
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

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">
                  3. Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs">UPI / QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs">Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs">Debit / Rupay</span>
                  </button>
                </div>
              </div>

              {/* UPI QR Display preview if UPI selected */}
              {paymentMethod === 'upi' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 shrink-0 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 grid grid-cols-3 gap-0.5 p-0.5">
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      VPA / Merchant UPI ID
                    </span>
                    <strong className="text-slate-800 font-mono text-[11px]">
                      princess.atoz@sbi
                    </strong>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Accepts Google Pay, PhonePe, Paytm, BHIM UPI
                    </p>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleRecharge}
                disabled={isProcessing || amount <= 0}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isProcessing ? 'Verifying Gateway...' : `Complete Recharge of ₹ ${amount.toFixed(2)}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
