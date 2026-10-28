import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BirthCertificateForm: React.FC = () => {
  const {
    addApplication,
    setCertificateModalData,
  } = useApp();

  const [childName, setChildName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [fatherName, setFatherName] = useState('');
  const [district, setDistrict] = useState('Salem');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!childName.trim()) {
      setErrorMsg('Please enter child name.');
      return;
    }
    if (!dob) {
      setErrorMsg('Please select date of birth.');
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      const certData = {
        regNo: `DPH-TN-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        childName: childName.toUpperCase(),
        dob,
        gender,
        fatherName: fatherName || 'KARTHIK RAJAN S',
        motherName: 'PRIYA KARTHIK',
        placeOfBirth: 'Govt. Hospital, Salem, Tamil Nadu',
        permanentAddress: 'Door No. 14, Gandhi Road, Salem - 636001',
        registrationDate: dob,
        issuingAuthority: 'Department of Public Health and Preventive Medicine, Govt. of Tamil Nadu',
      };

      addApplication({
        serviceId: 'birth-certificate-tn',
        serviceName: 'Tamilnadu Birth Certificate',
        applicantName: `${childName.toUpperCase()} (Father: ${certData.fatherName})`,
        mobile: '9840123456',
        status: 'Completed',
        fee: 0,
        walletType: 'payments',
        details: certData,
        remarks: 'Digital Certificate generated from TN Public Health Database.',
      });

      confetti({ particleCount: 60, spread: 50 });
      setIsSearching(false);
      setCertificateModalData({
        type: 'birth',
        title: 'Tamil Nadu Birth Certificate',
        data: certData,
      });
    }, 500);
  };

  return (
    <div
      className="max-w-3xl mx-auto space-y-4 pb-12 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tamilnadu Birth Certificate
          </h1>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">
            Instant Download
          </span>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleDownload} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
              Child Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="ENTER CHILD NAME"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base focus:border-emerald-500 outline-hidden font-bold text-slate-900 uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base focus:border-emerald-500 outline-hidden text-slate-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base focus:border-emerald-500 outline-hidden bg-white text-slate-900 font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Father's Name (Optional)
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="ENTER FATHER NAME"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base focus:border-emerald-500 outline-hidden uppercase font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                District Name
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="District (e.g. Salem / Chennai)"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base focus:border-emerald-500 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Direct Download Button (No fees, no insufficient balance block) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <Download className="w-5 h-5" />
              <span>
                {isSearching ? 'Fetching from TN e-Registry...' : 'Instant Download Certificate PDF'}
              </span>
            </button>
          </div>
        </form>

        {/* Recent Downloads Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Recent Downloads</span>
          </div>

          <div className="space-y-2">
            {[
              { name: 'AADHAVAN K', dob: '14/06/2024', reg: 'TN-BC-48912', time: 'Yesterday' },
              { name: 'DHANYA SRI M', dob: '08/02/2025', reg: 'TN-BC-48901', time: '3 days ago' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl text-sm border border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-slate-400 ml-2">DOB: {item.dob}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-xs">{item.reg}</span>
                  <button
                    onClick={() => {
                      setCertificateModalData({
                        type: 'birth',
                        title: 'Tamil Nadu Birth Certificate',
                        data: {
                          regNo: item.reg,
                          childName: item.name,
                          dob: item.dob,
                          gender: 'Male',
                          fatherName: 'Muthukumar S',
                          motherName: 'Meena M',
                          placeOfBirth: 'Govt. Hospital, Salem',
                          permanentAddress: 'Salem, Tamil Nadu',
                          registrationDate: item.dob,
                          issuingAuthority: 'Department of Public Health and Preventive Medicine, Govt. of Tamil Nadu',
                        },
                      });
                    }}
                    className="px-3 py-1 bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 font-bold rounded-md text-xs cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
