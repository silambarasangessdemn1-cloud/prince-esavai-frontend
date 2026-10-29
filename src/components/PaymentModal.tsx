import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  Upload,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PaymentGatewaySettings } from '../types';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  categoryLabel?: string;
  amount: number;
  applicantName: string;
  applicantPhone: string;
  settings: PaymentGatewaySettings;
  onConfirmPayment: (paymentDetails: {
    utrNumber: string;
    paidAmount: number;
    upiIdUsed: string;
    paymentScreenshot?: string;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  serviceName,
  categoryLabel = 'e-Sevai Service',
  amount,
  applicantName,
  applicantPhone,
  settings,
  onConfirmPayment,
}) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Screenshot file size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setErrorMsg('Please enter the 12-digit UTR / UPI Transaction Reference Number');
      return;
    }

    if (cleanUtr.length < 8) {
      setErrorMsg('UTR / Transaction reference number must be at least 8-12 digits');
      return;
    }

    setIsSubmitting(true);
    onConfirmPayment({
      utrNumber: cleanUtr,
      paidAmount: amount,
      upiIdUsed: settings.upiId,
      paymentScreenshot: screenshotPreview,
    });
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Step 2: Service Fee Payment</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Pay via UPI & Submit Form
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              Official Government & Portal Facilitation Fee
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Service Details & Fee Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {categoryLabel}
            </span>
            <span className="text-sm font-bold text-slate-900 block truncate">
              {serviceName}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Fee Payable
            </span>
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              ₹{amount}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* QR Code and UPI ID Section */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-5">
            {/* QR Code Preview */}
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm shrink-0 flex flex-col items-center">
              <img
                src={settings.qrCodeImage || '/assets/qrcode.jpeg'}
                alt="UPI Payment QR Code"
                className="w-36 h-36 object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/qrcode.jpeg';
                }}
              />
              <span className="text-[10px] font-bold text-slate-600 mt-1.5 flex items-center gap-1">
                <QrCode className="w-3 h-3 text-emerald-600" />
                Scan to Pay ₹{amount}
              </span>
            </div>

            {/* UPI Details */}
            <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Payee Account Name
                </span>
                <p className="text-sm font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-1">
                  <span>{settings.payeeName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Verified UPI ID
                </span>
                <div className="mt-1 flex items-center justify-center sm:justify-start gap-2">
                  <code className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 selection:bg-emerald-200">
                    {settings.upiId}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 font-medium">
                Compatible with Google Pay, PhonePe, Paytm, BHIM, Cred, and all UPI mobile banking apps.
              </div>
            </div>
          </div>

          {/* Quick Payment Instructions */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 block text-xs">
              Simple 3-Step Verification:
            </span>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-600 font-medium">
              <li>Open your preferred UPI app and scan the QR code above.</li>
              <li>Pay the exact fee amount of <strong>₹{amount}</strong>.</li>
              <li>Enter the 12-digit <strong>UPI Ref / UTR No.</strong> below and click submit.</li>
            </ol>
          </div>

          {/* Form: UTR Number & Screenshot */}
          <form onSubmit={handleProceed} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <span>UPI Ref No. / 12-Digit UTR</span>
                  <span className="text-red-500 font-black">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {utrNumber.trim().length} digits
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={22}
                value={utrNumber}
                onChange={(e) => {
                  setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''));
                  setErrorMsg('');
                }}
                placeholder="e.g. 429183920194 or UPI Ref ID"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You will find this in your payment receipt under "UPI Transaction ID" or "UTR".
              </p>
            </div>

            {/* Optional Screenshot */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Payment Screenshot (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {screenshotPreview && (
                  <div className="flex items-center gap-2">
                    <img
                      src={screenshotPreview}
                      alt="Proof preview"
                      className="w-9 h-9 object-cover rounded-lg border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setScreenshotPreview('')}
                      className="text-xs text-red-600 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Back to Edit Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !utrNumber.trim()}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting || !utrNumber.trim()
                    ? 'bg-slate-400 cursor-not-allowed opacity-70'
                    : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg active:scale-98'
                }`}
              >
                <span>{isSubmitting ? 'Verifying...' : 'Submit Application & Payment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

