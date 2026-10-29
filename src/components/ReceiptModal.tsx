import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, CheckCircle2 } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { receiptModalData, setReceiptModalData, profile } = useApp();

  if (!receiptModalData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm sm:text-base tracking-tight">Official Acknowledgment Receipt</span>
          </div>
          <button
            onClick={() => setReceiptModalData(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-3 sm:p-6 overflow-y-auto" id="printable-slip">
          <div className="border-2 border-slate-800 rounded-xl p-3 sm:p-5 space-y-3 sm:space-y-4 bg-white text-slate-900">
            {/* Gov & CSC Header */}
            <div className="text-center pb-3 border-b-2 border-slate-800">
              <div className="text-xs font-bold tracking-widest uppercase text-slate-600 mb-1">
                GOVERNMENT OF TAMIL NADU • e-GOVERNANCE AGENCY
              </div>
              <div className="flex items-center justify-center my-1">
                <img
                  src="/assets/aistudio/image_0c10b464.png"
                  alt="Princess A to Z Business"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div className="text-sm text-slate-700 font-bold">
                Common Service Centre (CSC) & Citizen Access Point
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                VLE ID: {profile.vleId} | Terminal: {profile.terminalId} | District: {profile.district}
              </div>
            </div>

            {/* Token & Status strip */}
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg border border-slate-300">
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase">
                  Application Token ID
                </span>
                <span className="font-mono font-black text-base tracking-wide text-slate-900">
                  {receiptModalData.tokenNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-bold block uppercase">
                  Current Status
                </span>
                <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
                  {receiptModalData.status}
                </span>
              </div>
            </div>

            {/* Service & Applicant Table */}
            <div className="space-y-2.5 text-sm">
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Service Name:</span>
                <span className="col-span-2 font-black text-slate-900">
                  {receiptModalData.serviceName}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Applicant Name:</span>
                <span className="col-span-2 font-bold text-slate-900">
                  {receiptModalData.applicantName}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Mobile Number:</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">
                  +91 {receiptModalData.mobile}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Submission Date:</span>
                <span className="col-span-2 font-mono text-slate-900 font-medium">
                  {receiptModalData.date}
                </span>
              </div>

              {/* UPI QR Payment Details Strip */}
              {receiptModalData.utrNumber && (
                <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3 space-y-1.5 my-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wider">
                      UPI QR Payment Verification
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        receiptModalData.paymentStatus === 'Verified & Approved'
                          ? 'bg-emerald-600 text-white'
                          : receiptModalData.paymentStatus === 'Rejected'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white animate-pulse'
                      }`}
                    >
                      {receiptModalData.paymentStatus || 'Pending Verification'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Fee Amount</span>
                      <span className="text-sm font-black text-emerald-800">
                        ₹{receiptModalData.paidAmount || receiptModalData.fee || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">12-Digit UTR Ref</span>
                      <span className="font-mono font-black text-xs text-slate-900">
                        {receiptModalData.utrNumber}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic pt-0.5">
                    * Admin verification of UTR is underway. Official receipt will be updated upon approval.
                  </p>
                </div>
              )}

              {receiptModalData.details && (
                <div className="pt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="font-black text-slate-700 block uppercase text-xs">
                    Application Specifics:
                  </span>
                  {Object.entries(receiptModalData.details)
                    .filter(([k]) => typeof receiptModalData.details[k] === 'string')
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="capitalize text-slate-500 font-medium">
                          {k.replace(/([A-Z])/g, ' $1')}:
                        </span>
                        <span className="font-mono font-bold text-slate-800">{String(v)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Simulated Barcode & Official Seal */}
            <div className="pt-3 border-t-2 border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-40 h-7 bg-slate-900 flex items-center justify-center">
                  <span className="text-[8px] text-white font-mono tracking-widest">
                    ||| | ||| || ||| | || |||
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 font-bold">
                  SECURE VERIFICATION TOKEN
                </div>
              </div>

              <div className="text-right">
                <div className="w-18 h-18 border-2 border-dashed border-emerald-700 rounded-full flex flex-col items-center justify-center p-1 text-[9px] font-black text-emerald-800 rotate-6 shadow-2xs">
                  <span>PRINCESS</span>
                  <span>A TO Z</span>
                  <span className="text-[8px]">OFFICIAL</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-1 font-bold">Authorized VLE Signature</div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-200">
              This is a computer-generated acknowledgment slip issued by Princess A to Z Business Portal.
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
          <button
            onClick={() => setReceiptModalData(null)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold rounded-lg cursor-pointer text-center"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Customer Slip (Ctrl+P)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
