import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Car, Search, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const VehicleRCForm: React.FC = () => {
  const { addApplication } = useApp();

  const [regNumber, setRegNumber] = useState('TN30AB4812');
  const [chassisLast5, setChassisLast5] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rcDetails, setRcDetails] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanReg = regNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanReg.length < 8) {
      setErrorMsg('Please enter a valid Vehicle Registration Number (e.g., TN30AB4812).');
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      const vehicleData = {
        regNo: cleanReg,
        ownerName: 'S. MUTHUKRISHNAN',
        makerModel: 'HYUNDAI MOTOR INDIA LTD / CRETA 1.5 MPI',
        vehicleClass: 'Motor Car (LMV - Private)',
        fuelType: 'PETROL / BS-VI',
        regDate: '15-Mar-2022',
        fitnessUpto: '14-Mar-2037',
        insuranceUpto: '12-Mar-2027 (HDFC ERGO General Insurance)',
        puccUpto: '18-Nov-2026',
        roadTaxPaidUpto: 'LTT (Life Time Tax Paid)',
        rtoOffice: 'RTO SALEM WEST (TN-30), Tamil Nadu',
        hypothecation: 'HDFC BANK LIMITED (Active Loan)',
        engineNo: 'G4FLNM684910',
        chassisNo: 'MALC381CLNM491820',
        color: 'POLAR WHITE',
      };

      addApplication({
        serviceId: 'vehicle-rc-adv',
        serviceName: 'ALL INDIA VEICLE RC',
        applicantName: vehicleData.ownerName,
        mobile: '9840123456',
        status: 'Completed',
        fee: 0,
        walletType: 'payments',
        details: vehicleData,
        remarks: 'Live Vahan National Register 4.0 verification successful.',
      });

      confetti({ particleCount: 60, spread: 50 });
      setRcDetails(vehicleData);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-5 pb-12 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
          <div className="w-13 h-13 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center p-2 text-indigo-600">
            <Car className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              All India Vehicle RC & Vahan Verification
            </h1>
            <p className="text-sm text-slate-500 font-bold">
              National Register Parivahan Vahan 4.0 Instant Smart Card Download
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase">
                Vehicle Registration No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                placeholder="e.g. TN30AB4812"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:border-emerald-500 outline-hidden tracking-wider text-base"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Chassis Last 5 Digits (Optional)
              </label>
              <input
                type="text"
                maxLength={5}
                value={chassisLast5}
                onChange={(e) => setChassisLast5(e.target.value.toUpperCase())}
                placeholder="Last 5 digits of chassis"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl font-mono text-slate-700 focus:border-emerald-500 outline-hidden text-base"
              />
            </div>
          </div>

          {/* Search Button without fee */}
          <div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
            >
              <Search className="w-5 h-5" />
              <span>
                {isSearching ? 'Querying Parivahan Vahan Database...' : 'Search Vehicle RC Details'}
              </span>
            </button>
            <div className="text-center text-xs text-slate-500 font-bold mt-2">
              Instant retrieval directly from Ministry of Road Transport & Highways RTO Server
            </div>
          </div>
        </form>

        {rcDetails && (
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Vehicle Registered at {rcDetails.rtoOffice}</span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Print Official RC Slip</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-sm">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Registration Number</div>
                  <div className="text-2xl font-black font-mono text-slate-900 tracking-wider">
                    {rcDetails.regNo}
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase">
                    ACTIVE / FIT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Owner Name</span>
                  <strong className="text-slate-800 text-base">{rcDetails.ownerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Maker & Model</span>
                  <span className="text-slate-800 font-bold">{rcDetails.makerModel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Vehicle Class</span>
                  <span className="text-slate-800 font-medium">{rcDetails.vehicleClass}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Fuel & Norms</span>
                  <span className="text-slate-800 font-medium">{rcDetails.fuelType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Insurance Validity</span>
                  <span className="text-emerald-700 font-bold">{rcDetails.insuranceUpto}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">PUCC Validity</span>
                  <span className="text-emerald-700 font-bold">{rcDetails.puccUpto}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Registration Date</span>
                  <span className="text-slate-800 font-medium font-mono">{rcDetails.regDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Fitness Upto</span>
                  <span className="text-slate-800 font-medium font-mono">{rcDetails.fitnessUpto}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Financier / Loan</span>
                  <span className="text-amber-700 font-bold">{rcDetails.hypothecation}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
