import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  Upload,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PVCCardMaker: React.FC = () => {
  const { addApplication } = useApp();

  const [cardType, setCardType] = useState<'aadhaar' | 'voter' | 'pan' | 'dl' | 'custom'>('aadhaar');
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(110);
  const [saturation, setSaturation] = useState(105);
  const [cardHolderName, setCardHolderName] = useState('K. MUTHUKUMAR');
  const [cardNumber, setCardNumber] = useState('5481 9201 4410');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setCardType('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    setIsProcessing(true);
    setTimeout(() => {
      addApplication({
        serviceId: 'pvc-maker',
        serviceName: 'PVC Maker | PDF to Smart Card',
        applicantName: cardHolderName,
        mobile: '9840123456',
        status: 'Completed',
        fee: 0,
        walletType: 'payments',
        details: {
          cardType,
          cardHolderName,
          cardNumber,
        },
        remarks: 'CR80 standard front & back thermal PVC card format ready.',
      });

      confetti({ particleCount: 50, spread: 60 });
      setIsProcessing(false);
      window.print();
    }, 400);
  };

  return (
    <div
      className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center p-2 text-amber-600 shadow-2xs">
              <Printer className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                PVC Maker | PDF to Smart Card Converter
              </h1>
              <p className="text-sm text-slate-500 font-bold">
                Standard CR80 (85.6mm × 53.98mm) Plastic ID Card Print Ready Layout
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                Select Card Type / Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'aadhaar', label: 'Aadhaar' },
                  { id: 'voter', label: 'Voter ID' },
                  { id: 'pan', label: 'PAN Card' },
                  { id: 'dl', label: 'Driving Lic.' },
                  { id: 'custom', label: 'Upload PDF' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCardType(item.id as any)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      cardType === item.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom File Upload */}
            <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <label className="flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Upload Card PDF or Front/Back Scan
                </span>
                <span className="text-[10px] text-slate-400">
                  Supports .pdf, .jpg, .png (Auto Crop & Align)
                </span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Editable Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-500 uppercase outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Card / Document Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-500 font-mono outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Quality Sliders for Thermal Card Printer */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Thermal Printer Color Tuning</span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="130"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="140"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Print Buttons - No fees */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isProcessing}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Printer className="w-5 h-5" />
                <span>{isProcessing ? 'Formatting CR80 Card...' : 'Print Front & Back PVC Card'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setSaturation(100);
                }}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Color Sliders</span>
              </button>
            </div>
          </div>

          {/* Right Live Preview Panel */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-100 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-600 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Standard CR80 PVC Thermal Card View (300 DPI Precision)</span>
            </div>

            <div
              id="printable-slip"
              className="space-y-4"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              }}
            >
              {/* Card Front */}
              <div className="w-[320px] sm:w-[350px] h-[215px] bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden relative p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[8px] flex items-center justify-center">
                      IND
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-800 tracking-tight">
                        {cardType === 'pan'
                          ? 'INCOME TAX DEPARTMENT'
                          : cardType === 'dl'
                          ? 'UNION OF INDIA - DRIVING LICENCE'
                          : cardType === 'voter'
                          ? 'ELECTION COMMISSION OF INDIA'
                          : 'GOVERNMENT OF INDIA'}
                      </div>
                      <div className="text-[8px] text-slate-500 font-medium">
                        {cardType === 'pan' ? 'GOVT OF INDIA' : 'TAMIL NADU'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-600">CR80</span>
                </div>

                <div className="flex items-center gap-3 my-1">
                  <div className="w-20 h-24 bg-slate-200 rounded border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-1">
                        <div className="w-8 h-8 rounded-full bg-slate-400 mx-auto mb-1" />
                        <span className="text-[7px] text-slate-500 font-bold">PHOTO</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 text-[9px] block uppercase font-bold">Name</span>
                      <strong className="text-slate-900 font-bold block truncate">
                        {cardHolderName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block uppercase font-bold">DOB / Year</span>
                      <span className="text-slate-700 font-mono">14/06/1992</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block uppercase font-bold">Gender</span>
                      <span className="text-slate-700 font-bold">MALE</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-mono font-black text-xs text-slate-900 tracking-wider">
                    {cardNumber}
                  </span>
                  <div className="w-24 h-4 bg-slate-900 flex items-center justify-center">
                    <span className="text-[6px] text-white font-mono">|| | ||| | || |||</span>
                  </div>
                </div>
              </div>

              {/* Card Back */}
              <div className="w-[320px] sm:w-[350px] h-[215px] bg-slate-50 rounded-xl shadow-md border border-slate-300 overflow-hidden relative p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="text-[9px] font-bold text-slate-600 uppercase">
                    Back Side / Address Record
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold">UIDAI / RTO Authorized</span>
                </div>

                <div className="text-xs space-y-1 my-1 text-slate-700">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">
                    Permanent Address:
                  </span>
                  <p className="leading-tight text-[10px]">
                    S/O P. Subramanian, No. 42/B, Anna Salai Commercial Complex, Main Road, Hasthampatti,
                    Salem, Tamil Nadu - 636007
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <div className="w-12 h-12 bg-white border border-slate-200 p-0.5 rounded flex items-center justify-center">
                    <span className="text-[7px] font-mono text-center text-slate-600 font-bold">QR VERIFIED</span>
                  </div>
                  <div className="text-right text-[9px] text-slate-500 font-mono">
                    <div>PRINTED AT: PRINCESS CSC</div>
                    <div>HELPLINE: 1947 / 1800-425-9999</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
