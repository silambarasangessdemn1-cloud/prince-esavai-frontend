import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { List, Send, RotateCcw, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DeathCertificateForm: React.FC = () => {
  const {
    addApplication,
    closeService,
    setActiveTab,
    setReceiptModalData,
  } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dateOfDeath: '',
    placeOfDeath: 'Hospital',
    hospitalName: '',
    mobileNo: '',
    district: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      name: '',
      gender: 'Male',
      dateOfDeath: '',
      placeOfDeath: 'Hospital',
      hospitalName: '',
      mobileNo: '',
      district: '',
    });
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please enter name.');
      return;
    }
    if (!formData.dateOfDeath) {
      setErrorMsg('Please select date of death.');
      return;
    }
    if (!formData.mobileNo.trim() || formData.mobileNo.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.district.trim()) {
      setErrorMsg('Please enter district.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newApp = addApplication({
        serviceId: 'death-certificate-tn',
        serviceName: 'TN DEATH CERTIFICATE',
        applicantName: formData.name,
        mobile: formData.mobileNo,
        status: 'In Process',
        fee: 0,
        walletType: 'payments',
        details: {
          ...formData,
        },
        remarks: 'TN Public Health Municipal Corporation death register verification underway.',
      });

      confetti({ particleCount: 65, spread: 55 });
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center p-2 text-indigo-600 shadow-2xs">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                TN DEATH CERTIFICATE
              </h1>
              <p className="text-sm text-slate-500 font-bold">TN DEATH CERTIFICATE</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('service_history');
                closeService();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-black shadow-2xs transition-all cursor-pointer"
            >
              <List className="w-4 h-4" />
              <span>Go to List</span>
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
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden bg-white font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date of Death <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfDeath"
                value={formData.dateOfDeath}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Place of Death <span className="text-red-500">*</span>
              </label>
              <select
                name="placeOfDeath"
                value={formData.placeOfDeath}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden bg-white font-medium"
              >
                <option value="Hospital">Hospital</option>
                <option value="House / Residence">House / Residence</option>
                <option value="Other Location">Other Location</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hospital Name
              </label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleInputChange}
                placeholder="Hospital Name"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile No. <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobileNo"
                maxLength={10}
                value={formData.mobileNo}
                onChange={handleInputChange}
                placeholder="Mobile No."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Enter District"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                required
              />
            </div>
          </div>

          {/* Banner */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between gap-3">
            <div className="w-7 h-7 rounded-full bg-white border border-indigo-300 flex items-center justify-center text-indigo-600 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-red-600 text-right sm:text-left flex-1">
              It is an Offline Application: Your Application Will Be Processed..
            </div>
          </div>

          {/* Bottom Action Footer - No fees, enlarged submit */}
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
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg text-sm font-black shadow-md shadow-green-600/20 transition-all cursor-pointer disabled:opacity-60"
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
