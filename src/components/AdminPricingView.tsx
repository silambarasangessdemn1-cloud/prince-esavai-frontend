import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Search,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  QrCode,
  CreditCard,
  Building,
  Upload,
  Sparkles,
  ArrowUpDown,
  Filter,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Sliders,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { ALL_SERVICES, CATEGORIES_LIST } from '../data/servicesData';
import { ServiceIcon } from './ServiceIcon';
import { pricingApi, DEFAULT_SERVICE_PRICES, DEFAULT_PAYMENT_SETTINGS } from '../services/pricingApi';
import { PaymentGatewaySettings } from '../types';

export const AdminPricingView: React.FC = () => {
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('esevai_service_prices');
      return saved ? { ...DEFAULT_SERVICE_PRICES, ...JSON.parse(saved) } : { ...DEFAULT_SERVICE_PRICES };
    } catch {
      return { ...DEFAULT_SERVICE_PRICES };
    }
  });

  const [settings, setSettings] = useState<PaymentGatewaySettings>(() => {
    try {
      const saved = localStorage.getItem('esevai_payment_settings');
      return saved ? { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_PAYMENT_SETTINGS };
    } catch {
      return { ...DEFAULT_PAYMENT_SETTINGS };
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [savedItemIds, setSavedItemIds] = useState<Record<string, boolean>>({});

  // Load from API on mount
  useEffect(() => {
    pricingApi.getConfig().then(({ settings: loadedSettings, prices: loadedPrices }) => {
      setSettings(loadedSettings);
      setPrices(loadedPrices);
    });
  }, []);

  // Update a single service price
  const handlePriceChange = (serviceId: string, val: number) => {
    const validVal = Math.max(0, val);
    setPrices((prev) => ({
      ...prev,
      [serviceId]: validVal,
    }));
    setHasChanges(true);
  };

  // Save single service price
  const handleSaveSingle = async (serviceId: string, serviceName: string, category: string) => {
    const currentPrice = prices[serviceId] ?? DEFAULT_SERVICE_PRICES[serviceId] ?? 50;
    await pricingApi.updatePrice(serviceId, currentPrice, serviceName, category);

    // Save in context/localStorage
    const nextPrices = { ...prices, [serviceId]: currentPrice };
    localStorage.setItem('esevai_service_prices', JSON.stringify(nextPrices));

    // Show temporary checkmark for this service
    setSavedItemIds((prev) => ({ ...prev, [serviceId]: true }));
    setTimeout(() => {
      setSavedItemIds((prev) => ({ ...prev, [serviceId]: false }));
    }, 2000);
  };

  // Save all price changes
  const handleSaveAll = async () => {
    await pricingApi.saveConfig(settings, prices);
    setHasChanges(false);
    setSavedSuccessMsg('All service prices & payment settings have been saved successfully!');
    setTimeout(() => setSavedSuccessMsg(''), 3500);
  };

  // Reset to default pricing
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all service fees to default government rates?')) {
      setPrices({ ...DEFAULT_SERVICE_PRICES });
      setSettings({ ...DEFAULT_PAYMENT_SETTINGS });
      setHasChanges(true);
    }
  };

  // Handle QR upload
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings((prev) => ({
          ...prev,
          qrCodeImage: reader.result as string,
        }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered services
  const filteredServices = useMemo(() => {
    return ALL_SERVICES.filter((svc) => {
      if (selectedCategory !== 'all' && svc.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          svc.name.toLowerCase().includes(q) ||
          svc.id.toLowerCase().includes(q) ||
          svc.categoryLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Statistics
  const priceValues = Object.values(prices).filter((v) => typeof v === 'number');
  const avgFee = priceValues.length > 0 ? Math.round(priceValues.reduce((a, b) => a + b, 0) / priceValues.length) : 0;
  const maxFee = priceValues.length > 0 ? Math.max(...priceValues) : 0;
  const minFee = priceValues.length > 0 ? Math.min(...priceValues) : 0;

  return (
    <div
      className="space-y-6 pb-16 animate-in fade-in duration-200"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* Top Banner / Title Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Tag className="w-3.5 h-3.5" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Service Pricing & Fee Portal
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Configure application fees for all public services. Citizens must pay this amount via UPI QR code before form submission.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              hasChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save All Pricing Changes</span>
          </button>
        </div>
      </div>

      {savedSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center gap-2.5 shadow-xs animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Services
          </span>
          <span className="text-2xl font-black text-slate-900 tracking-tight mt-1 block">
            {ALL_SERVICES.length}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">All e-Sevai categories</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Average Fee
          </span>
          <span className="text-2xl font-black text-emerald-700 tracking-tight mt-1 block">
            ₹{avgFee}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Per service application</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Fee Range
          </span>
          <span className="text-2xl font-black text-slate-900 tracking-tight mt-1 block">
            ₹{minFee} - ₹{maxFee}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Min to max charges</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            UPI Verification Gateway
          </span>
          <span className="text-sm font-black text-emerald-700 tracking-tight mt-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Active & Enforced</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono truncate block mt-0.5">
            {settings.upiId}
          </span>
        </div>
      </div>

      {/* UPI QR Gateway Configuration Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              UPI QR Code & Payee Configuration
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Active Payee: {settings.payeeName}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* Current QR Code Image Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Citizen Payment QR
            </span>
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
              <img
                src={settings.qrCodeImage || '/assets/qrcode.jpeg'}
                alt="Active QR Code"
                className="w-40 h-40 object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/qrcode.jpeg';
                }}
              />
            </div>
            <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Change QR Code Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Payee Settings Form */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Payee Account Name
                </label>
                <input
                  type="text"
                  value={settings.payeeName}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev, payeeName: e.target.value }));
                    setHasChanges(true);
                  }}
                  placeholder="e.g. j jesper"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Merchant / Personal UPI ID
                </label>
                <input
                  type="text"
                  value={settings.upiId}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev, upiId: e.target.value }));
                    setHasChanges(true);
                  }}
                  placeholder="e.g. jjesper143@oksbi"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">How Citizen Verification Works:</span>
                <p className="text-amber-800">
                  When citizens fill out a service form, they are prompted to scan this QR code, pay the exact fee for that service, and enter their 12-digit UPI UTR number. The application will be marked <strong>"Pending Verification"</strong> until you verify it under <strong>Payment Verifications</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.isPaymentRequired}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev, isPaymentRequired: e.target.checked }));
                    setHasChanges(true);
                  }}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  Enforce UPI QR Payment before any form submission
                </span>
              </label>

              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Save Gateway Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Fee List with Search & Category Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Individual Service Prices ({filteredServices.length})
            </h2>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service name or ID..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'ration', label: 'Ration' },
            { id: 'aadhaar', label: 'Aadhaar' },
            { id: 'voter', label: 'Voter' },
            { id: 'pan', label: 'PAN Card' },
            { id: 'farmer', label: 'Farmer' },
            { id: 'driving', label: 'Driving' },
            { id: 'vehicle', label: 'Vehicle' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Service Pricing Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          <div className="bg-slate-50 px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-3 items-center">
            <div className="col-span-6 sm:col-span-5">Service Name & Category</div>
            <div className="hidden sm:block col-span-3">Turnaround Time</div>
            <div className="col-span-4 sm:col-span-3 text-right">Fee (₹ INR)</div>
            <div className="col-span-2 sm:col-span-1 text-right">Action</div>
          </div>

          {filteredServices.map((svc) => {
            const currentPrice = prices[svc.id] ?? DEFAULT_SERVICE_PRICES[svc.id] ?? 50;
            const isSaved = savedItemIds[svc.id];

            return (
              <div
                key={svc.id}
                className="px-4 py-3 grid grid-cols-12 gap-3 items-center hover:bg-slate-50/80 transition-colors"
              >
                {/* Name & Icon */}
                <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                  <ServiceIcon type={svc.iconType} className="w-8 h-8 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                      {svc.name}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {svc.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Turnaround Time */}
                <div className="hidden sm:block col-span-3 text-xs text-slate-500 font-medium truncate">
                  {svc.processingTime || '1 Working Day'}
                </div>

                {/* Price Input & Quick Adjusters */}
                <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePriceChange(svc.id, currentPrice - 10)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer"
                    title="Decrease by ₹10"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <div className="relative w-20 sm:w-24">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={currentPrice}
                      onChange={(e) => handlePriceChange(svc.id, parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-black text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePriceChange(svc.id, currentPrice + 10)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer"
                    title="Increase by ₹10"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Single Save Action */}
                <div className="col-span-2 sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleSaveSingle(svc.id, svc.name, svc.category)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center ${
                      isSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 border border-transparent'
                    }`}
                    title="Save this fee"
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Save Bar */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            * All price updates reflect immediately across the Citizen dashboard & service forms.
          </span>
          <button
            type="button"
            onClick={handleSaveAll}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Pricing Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

