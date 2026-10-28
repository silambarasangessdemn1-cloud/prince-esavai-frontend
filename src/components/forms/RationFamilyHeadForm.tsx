import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { List, Send, RotateCcw, Bell, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RationFamilyHeadForm: React.FC = () => {
  const {
    addApplication,
    closeService,
    setActiveTab,
    setReceiptModalData,
  } = useApp();

  const [formData, setFormData] = useState({
    applicantName: '',
    mobileNumber: '',
    rationCardNumber: '',
    familyHeadName: '',
  });

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [rationFile, setRationFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      applicantName: '',
      mobileNumber: '',
      rationCardNumber: '',
      familyHeadName: '',
    });
    setAadhaarFile(null);
    setRationFile(null);
    setPhotoFile(null);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.applicantName.trim()) {
      setErrorMsg('Please enter applicant name.');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.rationCardNumber.trim() || formData.rationCardNumber.length < 12) {
      setErrorMsg('Please enter a valid 12-digit Ration card number.');
      return;
    }
    if (!formData.familyHeadName.trim()) {
      setErrorMsg('Please enter proposed family head name.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newApp = addApplication({
        serviceId: 'ration-family-head',
        serviceName: 'TN Ration Card Family Head Change(Without OTP)',
        applicantName: formData.applicantName,
        mobile: formData.mobileNumber,
        status: 'In Process',
        fee: 0,
        walletType: 'payments',
        details: {
          ...formData,
        },
        remarks: 'TNePDS Backend Queue. Verification will complete within 1 working day.',
      });

      confetti({ particleCount: 75, spread: 60 });
      setIsSubmitting(false);
      setReceiptModalData(newApp);
    }, 500);
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-4 pb-12 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-2 text-emerald-600 shadow-2xs">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                TN Ration Card Family Head Change(Without OTP)
              </h1>
              <p className="text-sm text-slate-500 font-bold">
                TN Ration Card Family Head Change(Without OTP)
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
              className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg text-sm font-black shadow-2xs transition-all cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                maxLength={10}
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="Aadhaar Linked Mobile Number"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ration Card Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="rationCardNumber"
                maxLength={12}
                value={formData.rationCardNumber}
                onChange={handleInputChange}
                placeholder="Enter Rc No"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-mono font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Family Head Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="familyHeadName"
                value={formData.familyHeadName}
                onChange={handleInputChange}
                placeholder="Enter Head Name"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                required
              />
            </div>
          </div>

          {/* Documents Section */}
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Documents</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                  <span>Aadhaar PDF</span>
                  <span className="text-red-500">*</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer border-r border-slate-300 shrink-0 text-sm">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg"
                      onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span className="px-3 text-slate-500 truncate text-sm">
                    {aadhaarFile ? aadhaarFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                  <span>Ration Card PDF</span>
                  <span className="text-red-500">*</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer border-r border-slate-300 shrink-0 text-sm">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg"
                      onChange={(e) => setRationFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span className="px-3 text-slate-500 truncate text-sm">
                    {rationFile ? rationFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                  <span>Photo</span>
                  <span className="text-red-500">*</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer border-r border-slate-300 shrink-0 text-sm">
                    Choose File
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span className="px-3 text-slate-500 truncate text-sm">
                    {photoFile ? photoFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>
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

          {/* Action Footer */}
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
              <span>{isSubmitting ? 'Submitting...' : 'Submit Form'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
