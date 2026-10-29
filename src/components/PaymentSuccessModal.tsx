import React from 'react';
import {
  CheckCircle2,
  Clock,
  PhoneCall,
  FileText,
  Copy,
  Check,
  ArrowRight,
  Printer,
  X,
  ShieldCheck,
  Languages,
  Sparkles,
} from 'lucide-react';
import { ApplicationRecord } from '../types';

export interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationRecord | null;
  onViewHistory: () => void;
  onViewReceipt: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  application,
  onViewHistory,
  onViewReceipt,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !application) return null;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(application.tokenNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Top Decorative Success Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-6 sm:p-7 text-center relative overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/20 ring-4 ring-emerald-400/30">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Application Submitted Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-bold mt-1">
            Admin will approve soon & contact you • நிர்வாகி விரைவில் அங்கீகரிப்பார் & தொடர்பு கொள்வார்
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4.5 max-h-[75vh] overflow-y-auto">
          {/* Bilingual Professional Announcement Box */}
          <div className="bg-gradient-to-br from-amber-50/95 via-orange-50/60 to-emerald-50/60 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            {/* English Section */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                <PhoneCall className="w-4 h-4 text-amber-700 animate-bounce" />
                <span>Admin Will Approve Soon & Contact You (English)</span>
              </div>
              <p className="text-xs sm:text-[13px] text-amber-950 font-medium leading-relaxed">
                Your application has been received and registered under token <strong className="font-mono text-slate-900 bg-amber-200/70 px-1 rounded">{application.tokenNumber}</strong>. 
                Our admin team will review your submission and payment, <strong>approve it soon</strong>, and <strong>reach out to you directly via phone / WhatsApp</strong> at <strong className="font-mono text-slate-900">+91 {application.mobile}</strong> to finalize and provide your service document.
              </p>
            </div>

            <div className="border-t border-amber-200/90" />

            {/* Tamil Section */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-xs uppercase tracking-wider">
                <Languages className="w-4 h-4 text-emerald-700" />
                <span>நிர்வாகி விரைவில் அங்கீகரிப்பார் & தொடர்பு கொள்வார் (தமிழ்)</span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-relaxed">
                உங்கள் விண்ணப்பம் மற்றும் கட்டண விவரங்கள் டோக்கன் எண் <strong className="font-mono text-slate-900 bg-emerald-100 px-1 rounded">{application.tokenNumber}</strong> உடன் பெறப்பட்டது.
                எங்கள் நிர்வாகி உங்கள் விவரங்களை விரைவில் சரிபார்த்து <strong>அங்கீகரிப்பார் (Approve)</strong>, மேலும் உங்களை நேரடியாக <strong className="font-mono text-slate-900">+91 {application.mobile}</strong> என்ற எண்ணில் <strong>தொலைபேசி / வாட்ஸ்அப் மூலம் விரைவில் தொடர்பு கொள்வார்</strong>.
              </p>
            </div>
          </div>

          {/* Application Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-4.5 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Application Reference
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                <span>Pending Verification / சரிபார்ப்பு நிலுவை</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Token Number / டோக்கன் எண்
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                    {application.tokenNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer transition-colors"
                    title="Copy Token"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Service / விண்ணப்பித்த சேவை
                </span>
                <span className="font-bold text-slate-900 text-xs block truncate mt-0.5">
                  {application.serviceName}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Applicant / விண்ணப்பதாரர்
                </span>
                <span className="font-bold text-slate-800 text-xs block truncate mt-0.5">
                  {application.applicantName} (+91 {application.mobile})
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Fee & UTR / கட்டணம் & UTR
                </span>
                <div className="font-bold text-xs mt-0.5">
                  <span className="text-emerald-700 font-black">₹{application.paidAmount || application.fee || 0}</span>
                  {application.utrNumber && (
                    <span className="text-slate-600 font-mono text-[11px] ml-1.5 font-bold">
                      (UTR: {application.utrNumber})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={onViewHistory}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Track in Service History / விண்ணப்ப வரலாறு</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onViewReceipt}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>View Receipt / ரசீது</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer"
              >
                Done / முடிந்தது
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

