import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  List,
  Send,
  RotateCcw,
  Bell,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CANRegistrationForm: React.FC = () => {
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
    applicantMobile: '',
    aadhaarNumber: '',
    dob: '',
    maritalType: 'Unmarried',
    relativeType: 'Father',
    relativeName: '',
    motherName: '',
    religionName: 'Hindu',
    communityName: 'BC (Backward Class)',
    districtName: 'Salem',
    talukName: 'Salem Central',
    villageName: 'Hasthampatti',
    streetName: '',
    wardNo: '',
    pinCode: '636007',
    buildingNo: '',
  });

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [rationFile, setRationFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      applicantName: '',
      applicantMobile: '',
      aadhaarNumber: '',
      dob: '',
      maritalType: 'Unmarried',
      relativeType: 'Father',
      relativeName: '',
      motherName: '',
      religionName: 'Hindu',
      communityName: 'BC (Backward Class)',
      districtName: 'Salem',
      talukName: 'Salem Central',
      villageName: '',
      streetName: '',
      wardNo: '',
      pinCode: '',
      buildingNo: '',
    });
    setAadhaarFile(null);
    setRationFile(null);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.applicantName.trim()) {
      setErrorMsg('Please enter applicant name.');
      return;
    }
    if (!formData.applicantMobile.trim() || formData.applicantMobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.aadhaarNumber.trim() || formData.aadhaarNumber.length < 12) {
      setErrorMsg('Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    const fee = getServicePrice('can-registration');

    openPaymentDialog({
      serviceName: 'CAN Registration Tamil Nadu',
      categoryLabel: 'CITIZEN REGISTRATION',
      amount: fee,
      applicantName: formData.applicantName,
      applicantPhone: formData.applicantMobile,
      onConfirmed: (paymentDetails) => {
        setIsSubmitting(true);
        setTimeout(() => {
          const newApp = addApplication({
            serviceId: 'can-registration',
            serviceName: 'CAN Registration Tamil Nadu',
            applicantName: formData.applicantName,
            mobile: formData.applicantMobile,
            status: 'Under Review',
            fee,
            walletType: 'cards',
            details: {
              ...formData,
            },
            remarks: `Offline application sent to TN e-Governance Tahsildar queue. Fee ₹${paymentDetails.paidAmount} submitted with UTR: ${paymentDetails.utrNumber}.`,
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
      className="max-w-5xl mx-auto space-y-4 pb-12 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-2 text-emerald-600 shadow-2xs">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                CAN Registration Tamil Nadu
              </h1>
              <p className="text-sm text-slate-500 font-bold">CAN Registration TN</p>
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
          {/* Section 1: Applicant Details */}
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Applicant Details</span>
            </div>

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
                  Applicant Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="applicantMobile"
                  maxLength={10}
                  value={formData.applicantMobile}
                  onChange={handleInputChange}
                  placeholder="Enter Mobile No"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  maxLength={12}
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  placeholder="12 Digit Aadhaar Number"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-mono font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dob <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Marital type <span className="text-red-500">*</span>
                </label>
                <select
                  name="maritalType"
                  value={formData.maritalType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden bg-white font-medium"
                >
                  <option value="Unmarried">Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relative Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="relativeType"
                  value={formData.relativeType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden bg-white font-medium"
                >
                  <option value="Father">Father</option>
                  <option value="Husband">Husband</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relative Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="relativeName"
                  value={formData.relativeName}
                  onChange={handleInputChange}
                  placeholder="Enter Relative Name"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mother Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="Enter Mother Name"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Caste Details */}
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Caste Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Religion Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="religionName"
                  value={formData.religionName}
                  onChange={handleInputChange}
                  placeholder="Enter Religion Name"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Community Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="communityName"
                  value={formData.communityName}
                  onChange={handleInputChange}
                  placeholder="Enter Community Name"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Address Details */}
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Address Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="districtName"
                  value={formData.districtName}
                  onChange={handleInputChange}
                  placeholder="Enter District Name"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Taluk Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="talukName"
                  value={formData.talukName}
                  onChange={handleInputChange}
                  placeholder="Enter Taluk Name"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Village Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="villageName"
                  value={formData.villageName}
                  onChange={handleInputChange}
                  placeholder="Enter Village Name"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Name /No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="streetName"
                  value={formData.streetName}
                  onChange={handleInputChange}
                  placeholder="Enter Street Name /No"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ward No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="wardNo"
                  value={formData.wardNo}
                  onChange={handleInputChange}
                  placeholder="Enter Ward No"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PinCode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pinCode"
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  placeholder="Enter Pincode"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-mono font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Building No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="buildingNo"
                  value={formData.buildingNo}
                  onChange={handleInputChange}
                  placeholder="Enter Building No"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Documents Upload */}
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Documents Upload</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                      accept=".pdf,.png,.jpg,.jpeg"
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
                  <span>TN Ration Card / Voter ID</span>
                  <span className="text-red-500">*</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer border-r border-slate-300 shrink-0 text-sm">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setRationFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span className="px-3 text-slate-500 truncate text-sm">
                    {rationFile ? rationFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Notice Banner */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white border border-emerald-300 flex items-center justify-center text-emerald-600 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold text-red-600 text-right sm:text-left flex-1">
              It is an Offline Application: Your Application Will Be Processed within 1 working Day..
            </div>
          </div>

          {/* Bottom Action Footer - No fees, enlarged submit buttons */}
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
