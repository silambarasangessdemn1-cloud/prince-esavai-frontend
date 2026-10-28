import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';

export const CertificatePreviewModal: React.FC = () => {
  const { certificateModalData, setCertificateModalData } = useApp();

  if (!certificateModalData) return null;

  const { type, title, data } = certificateModalData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-tight">{title}</span>
          </div>
          <button
            onClick={() => setCertificateModalData(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Content (Printable) */}
        <div className="p-6 overflow-y-auto bg-slate-50" id="printable-slip">
          {type === 'birth' ? (
            /* Tamil Nadu Birth Certificate Form No 5 */
            <div className="bg-white border-4 border-double border-emerald-900 p-8 rounded-lg shadow-sm space-y-5 text-slate-900 relative">
              <div className="text-center space-y-1 pb-4 border-b-2 border-emerald-900">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-800 text-amber-300 font-serif font-black flex items-center justify-center text-xs shadow-xs mb-1">
                  TN GOV
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-900">
                  GOVERNMENT OF TAMIL NADU
                </div>
                <div className="text-[11px] font-semibold text-slate-700">
                  DEPARTMENT OF PUBLIC HEALTH AND PREVENTIVE MEDICINE
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  (ISSUED UNDER SECTION 12/17 OF THE REGISTRATION OF BIRTHS & DEATHS ACT, 1969)
                </div>
                <h3 className="text-base font-black text-emerald-950 uppercase tracking-wider pt-1">
                  BIRTH CERTIFICATE / பிறப்புச் சான்றிதழ்
                </h3>
              </div>

              {/* Reg info strip */}
              <div className="flex justify-between text-xs font-mono font-bold text-slate-700 bg-emerald-50/60 p-2 rounded border border-emerald-200">
                <span>Registration No: {data.regNo}</span>
                <span>Date of Reg: {data.registrationDate || data.dob}</span>
              </div>

              {/* Data Table */}
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-semibold">Child Name:</span>
                  <span className="col-span-2 font-black text-slate-900 uppercase">
                    {data.childName}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-semibold">Gender:</span>
                  <span className="col-span-2 font-bold text-slate-800 uppercase">{data.gender}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-semibold">Date of Birth:</span>
                  <span className="col-span-2 font-bold font-mono text-slate-900">{data.dob}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-semibold">Father's Name:</span>
                  <span className="col-span-2 font-bold text-slate-800 uppercase">{data.fatherName}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-semibold">Mother's Name:</span>
                  <span className="col-span-2 font-bold text-slate-800 uppercase">{data.motherName}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-semibold">Place of Birth:</span>
                  <span className="col-span-2 text-slate-800 font-medium">{data.placeOfBirth}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-semibold">Permanent Address:</span>
                  <span className="col-span-2 text-slate-800">{data.permanentAddress}</span>
                </div>
              </div>

              {/* Bottom Sign & QR */}
              <div className="pt-4 flex items-center justify-between border-t-2 border-emerald-900">
                <div className="space-y-1">
                  <div className="w-16 h-16 bg-slate-900 p-1 rounded">
                    <div className="w-full h-full bg-white p-0.5 grid grid-cols-4 gap-0.5">
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 font-bold block">
                    DIGITALLY SIGNED & VERIFIED
                  </span>
                </div>

                <div className="text-right text-[10px] space-y-0.5">
                  <div className="font-bold text-slate-900 uppercase">Registrar of Births & Deaths</div>
                  <div className="text-slate-500">Government of Tamil Nadu</div>
                  <div className="text-emerald-700 font-bold">Authenticated via Princess A to Z Portal</div>
                </div>
              </div>
            </div>
          ) : (
            /* Smartcard View */
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-amber-300/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white text-orange-600 font-black flex items-center justify-center text-xs">
                    TN
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">
                      Civil Supplies & Consumer Protection Dept
                    </h4>
                    <p className="text-xs text-amber-100">Government of Tamil Nadu • Smart Family Card</p>
                  </div>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded text-xs font-bold uppercase">
                  {data.cardType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-amber-200 block text-[10px]">Card Number</span>
                  <strong className="text-base font-mono tracking-wider">{data.rcNo}</strong>
                </div>
                <div>
                  <span className="text-amber-200 block text-[10px]">Head of Family</span>
                  <strong className="text-sm">{data.familyHead}</strong>
                </div>
                <div>
                  <span className="text-amber-200 block text-[10px]">Father / Spouse</span>
                  <span>{data.spouseName}</span>
                </div>
                <div>
                  <span className="text-amber-200 block text-[10px]">Fair Price Shop</span>
                  <span>{data.fpsCode}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={() => setCertificateModalData(null)}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
