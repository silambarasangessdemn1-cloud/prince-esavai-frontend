import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreditCard, Search, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SmartcardSearchForm: React.FC = () => {
  const {
    addApplication,
    setCertificateModalData,
  } = useApp();

  const [rcNumber, setRcNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cardResult, setCardResult] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!rcNumber.trim() || rcNumber.replace(/\D/g, '').length !== 12) {
      setErrorMsg('Please enter a valid 12-digit Tamil Nadu Ration Card number.');
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      const generated = {
        rcNo: rcNumber.replace(/\D/g, ''),
        familyHead: 'K. RATHINAMMAL',
        spouseName: 'KRISHNASAMY P',
        cardType: 'PHH - Priority Household (Rice)',
        fpsCode: '08-SL-0381 (Salem West Co-op Store)',
        taluk: 'Salem Central',
        district: 'Salem',
        cylinderCount: '1',
        members: [
          { name: 'K. RATHINAMMAL', relation: 'Head', age: 52 },
          { name: 'K. SATHISH KUMAR', relation: 'Son', age: 28 },
          { name: 'K. PRIYA', relation: 'Daughter-in-law', age: 26 },
        ],
        issuedDate: '14-Aug-2018',
        smartCardUid: `TNPDS-${rcNumber.slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      addApplication({
        serviceId: 'ration-smartcard-instant',
        serviceName: 'No OTP Required | Instant Smartcard',
        applicantName: generated.familyHead,
        mobile: '9840123456',
        status: 'Completed',
        fee: 0,
        walletType: 'payments',
        details: generated,
        remarks: 'Direct TNePDS Smartcard PDF copy generated instantly without OTP.',
      });

      confetti({ particleCount: 65, spread: 55 });
      setCardResult(generated);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div
      className="max-w-2xl mx-auto space-y-4 pb-12 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
          <div className="w-13 h-13 rounded-full bg-orange-100 flex items-center justify-center p-2 shrink-0 border border-orange-200">
            <CreditCard className="w-7 h-7 text-orange-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            No OTP Required | Instant Smartcard
          </h1>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Enter Ration Card No.
            </label>
            <input
              type="text"
              maxLength={12}
              value={rcNumber}
              onChange={(e) => setRcNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="12 Digit Ration Card No."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-emerald-500 outline-hidden font-mono text-lg font-bold text-slate-800 tracking-wider placeholder:font-sans placeholder:font-normal"
              required
            />
          </div>

          {/* Direct Search Button - No fees, no balance check */}
          <div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>
                {isSearching ? 'Fetching Smartcard from TNePDS...' : 'Search & Generate Instant Smartcard'}
              </span>
            </button>
          </div>
        </form>

        {/* Live Result View */}
        {cardResult && (
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Smartcard Record Verified & Found</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCertificateModalData({
                      type: 'smartcard',
                      title: 'Tamil Nadu Smart Ration Card',
                      data: cardResult,
                    });
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Full Screen Print View</span>
                </button>
              </div>
            </div>

            {/* Tamil Nadu Smart Ration Card Graphic */}
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-amber-300/40 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white p-1 flex items-center justify-center text-orange-600 font-black text-[10px] shadow-xs">
                    TN
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold tracking-tight uppercase">
                      Civil Supplies and Consumer Protection Dept
                    </div>
                    <div className="text-[10px] text-amber-100 font-medium">
                      Government of Tamil Nadu • Smart Family Card
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-white/20 px-2.5 py-1 rounded text-xs font-bold">
                    {cardResult.cardType.split(' - ')[0]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="col-span-2 space-y-1 text-xs">
                  <div>
                    <span className="text-amber-200">Card Number: </span>
                    <strong className="font-mono text-base tracking-wider text-white">
                      {cardResult.rcNo}
                    </strong>
                  </div>
                  <div>
                    <span className="text-amber-200">Family Head: </span>
                    <strong className="text-white text-sm">{cardResult.familyHead}</strong>
                  </div>
                  <div>
                    <span className="text-amber-200">Father / Spouse: </span>
                    <span>{cardResult.spouseName}</span>
                  </div>
                  <div>
                    <span className="text-amber-200">Fair Price Shop: </span>
                    <span className="truncate">{cardResult.fpsCode}</span>
                  </div>
                  <div>
                    <span className="text-amber-200">Taluk & District: </span>
                    <span>{cardResult.taluk}, {cardResult.district}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-white p-2 rounded-xl text-slate-900 shadow-inner">
                  <div className="w-16 h-16 bg-slate-900 p-1 rounded">
                    <div className="w-full h-full bg-white p-1 grid grid-cols-4 gap-0.5">
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                      <div className="bg-white" />
                      <div className="bg-slate-900" />
                      <div className="bg-slate-900" />
                    </div>
                  </div>
                  <span className="text-[9px] font-mono mt-1 text-slate-500 font-bold">
                    SCAN FPS
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-amber-300/30 text-xs flex items-center justify-between text-amber-100">
                <span>Family Members: {cardResult.members.length} registered</span>
                <span>LPG Cylinders: {cardResult.cylinderCount}</span>
                <span>UID: {cardResult.smartCardUid}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
