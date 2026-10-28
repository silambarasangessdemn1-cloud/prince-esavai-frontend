import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem } from '../../types';
import { ServiceIcon } from '../ServiceIcon';
import {
  Send,
  RotateCcw,
  Bell,
  List,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GenericServiceFormProps {
  service: ServiceItem;
}

export const GenericServiceForm: React.FC<GenericServiceFormProps> = ({ service }) => {
  const {
    addApplication,
    closeService,
    setActiveTab,
    setReceiptModalData,
  } = useApp();

  const [applicantName, setApplicantName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [district, setDistrict] = useState('Salem');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getDocPlaceholder = () => {
    if (service.name.includes('PAN')) return '10 Character PAN (e.g. ABCDE1234F)';
    if (service.name.includes('AADHAAR')) return '12 Digit Aadhaar Number';
    if (service.name.includes('VOTER')) return '10 Digit EPIC / Voter ID No';
    if (service.name.includes('DL')) return 'Driving License Number';
    if (service.name.includes('CIBIL')) return 'Aadhaar / PAN Number';
    if (service.name.includes('AGRI')) return 'Farmer ID / Patta Number';
    if (service.name.includes('UDID')) return '18 Digit UDID Number';
    return 'Enter Reference / ID Number';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!applicantName.trim()) {
      setErrorMsg('Please enter applicant name.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!documentId.trim()) {
      setErrorMsg('Please enter document / ID number.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newApp = addApplication({
        serviceId: service.id,
        serviceName: service.name,
        applicantName,
        mobile: mobileNumber,
        status: service.actionLabel.includes('INSTANT') ? 'Completed' : 'In Process',
        fee: 0,
        walletType: service.walletType,
        details: {
          documentId,
          district,
          remarks,
          processingMode: service.actionLabel,
        },
        remarks: `Application recorded for ${service.name}. Standard turnaround: ${service.processingTime || '24 hours'}.`,
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
            <ServiceIcon type={service.iconType} className="w-14 h-14 shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {service.name}
              </h1>
              <p className="text-sm text-slate-500 font-bold">
                {service.subtitle || service.categoryLabel}
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
              className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-black shadow-2xs transition-all cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Applicant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Enter Applicant Full Name"
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
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="10 Digit Mobile No"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reference ID / Document No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value.toUpperCase())}
                placeholder={getDocPlaceholder()}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-mono uppercase font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District Name
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Enter District (e.g. Salem, Chennai)"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Remarks / Specific Instructions
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional notes for operator processing"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Banner */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
            <div className="w-7 h-7 rounded-full bg-white border border-emerald-300 flex items-center justify-center text-emerald-600 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-red-600 text-right sm:text-left flex-1">
              Estimated Processing Window: {service.processingTime || 'Within 1 working day'}..
            </div>
          </div>

          {/* Action Footer - No fee */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setApplicantName('');
                setMobileNumber('');
                setDocumentId('');
                setRemarks('');
                setErrorMsg('');
              }}
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
              <span>{isSubmitting ? 'Processing...' : 'Submit Form'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
