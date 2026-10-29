import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { List, Send, RotateCcw, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RationQRForm: React.FC = () => {
  const {
    addApplication,
    closeService,
    setActiveTab,
    setReceiptModalData,
    getServicePrice,
    openPaymentDialog,
  } = useApp();

  const [formData, setFormData] = useState({
    applicantName: '',
    rationCardNumber: '',
    mobileNumber: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      applicantName: '',
      rationCardNumber: '',
      mobileNumber: '',
    });
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.applicantName.trim()) {
      setErrorMsg('Please enter Applicant Name.');
      return;
    }
    if (!formData.rationCardNumber.trim() || formData.rationCardNumber.length < 12) {
      setErrorMsg('Please enter a valid 12-digit Ration card number.');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const fee = getServicePrice('ration-qr-code');

    openPaymentDialog({
      serviceName: 'TN Ration Card QR Code Generation (Without OTP)',
      categoryLabel: 'RATION SERVICES',
      amount: fee,
      applicantName: formData.applicantName,
      applicantPhone: formData.mobileNumber,
      onConfirmed: (paymentDetails) => {
        setIsSubmitting(true);
        setTimeout(() => {
          const newApp = addApplication({
            serviceId: 'ration-qr-code',
            serviceName: 'TN Ration Card QR Code Generation(Without OTP)',
            applicantName: formData.applicantName,
            mobile: formData.mobileNumber,
            status: 'Under Review',
            fee,
            walletType: 'payments',
            details: {
              ...formData,
            },
            remarks: `Digital Smart QR generated for TNePDS Fair Price Shop biometric terminal. Fee ₹${paymentDetails.paidAmount} submitted with UTR: ${paymentDetails.utrNumber}.`,
            paidAmount: paymentDetails.paidAmount,
            utrNumber: paymentDetails.utrNumber,
            upiIdUsed: paymentDetails.upiIdUsed,
            paymentScreenshot: paymentDetails.paymentScreenshot,
            paymentMethod: 'UPI QR',
            paymentStatus: 'Pending Verification',
            paymentDate: new Date().toISOString(),
          });

          confetti({ particleCount: 70, spread: 60 });
          setIsSubmitting(false);
        }, 400);
      },
    });
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-4 pb-12 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-2 text-emerald-600 shadow-2xs">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3h-3z" />
                <path d="M20 14v3h-3" />
                <path d="M14 20h7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                TN Ration Card QR Code Generation(Without OTP)
              </h1>
              <p className="text-sm text-slate-500 font-bold">
                TN Ration Card QR Code Generation(With OTP)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('service_history');
                closeService();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#eab308] hover:bg-[#ca8a04] text-white rounded-lg text-sm font-black shadow-2xs transition-all cursor-pointer"
            >
              <List className="w-4 h-4" />
              <span>Go to list</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Applicant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleInputChange}
                placeholder="Enter Applicant Name"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                TN Ration Card No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="rationCardNumber"
                maxLength={12}
                value={formData.rationCardNumber}
                onChange={handleInputChange}
                placeholder="12 Digit RC No"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-mono font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                maxLength={10}
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="10 Digit mobile no"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                required
              />
            </div>
          </div>

          {/* Banner */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
            <div className="w-7 h-7 rounded-full bg-white border border-emerald-300 flex items-center justify-center text-emerald-600 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-red-600 text-right sm:text-left flex-1">
              It is an Offline Application: Your Application Will Be Processed within 1 working Day..
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-sm font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Generating...' : 'Submit Form'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
