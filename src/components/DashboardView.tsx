import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_SERVICES, CATEGORIES_LIST } from '../data/servicesData';
import { ServiceIcon } from './ServiceIcon';
import { ServiceItem } from '../types';
import { BadgeAlert } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { openService, searchQuery, setSearchQuery, activeTab, setActiveTab } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleServiceClick = (service: ServiceItem) => {
    if (service.category === 'ration') {
      setActiveTab('ration_services');
    } else if (service.category === 'aadhaar') {
      setActiveTab('aadhaar_corrections');
    } else if (service.category === 'voter') {
      setActiveTab('voter_services');
    } else if (service.category === 'pan') {
      setActiveTab('pan_services');
    } else if (service.category === 'farmer') {
      setActiveTab('farmer_services');
    } else if (service.category === 'driving') {
      setActiveTab('driving_services');
    } else if (service.category === 'vehicle') {
      setActiveTab('vehicle_services');
    } else {
      openService(service);
    }
  };

  // Filter based on search query or category selected in sidebar or quick tabs
  const filteredServices = ALL_SERVICES.filter((service) => {
    if (activeTab === 'ration_services' && service.category !== 'ration') return false;
    if (activeTab === 'aadhaar_corrections' && service.category !== 'aadhaar') return false;
    if (activeTab === 'voter_services' && service.category !== 'voter') return false;
    if (activeTab === 'pan_services' && service.category !== 'pan') return false;
    if (activeTab === 'farmer_services' && service.category !== 'farmer') return false;
    if (activeTab === 'driving_services' && service.category !== 'driving') return false;
    if (activeTab === 'vehicle_services' && service.category !== 'vehicle') return false;

    // Filter bar tab
    if (filterCategory !== 'all' && service.category !== filterCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        service.name.toLowerCase().includes(q) ||
        service.categoryLabel.toLowerCase().includes(q) ||
        (service.subtitle && service.subtitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const isFiltering = searchQuery.trim().length > 0 || filterCategory !== 'all' || activeTab !== 'dashboard';

  return (
    <div className="space-y-5 pb-12" style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}>
      {/* Category Filter Bar */}
      <div className="bg-white px-4 py-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-sm font-semibold">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            Services:
          </span>
          {[
            { id: 'all', label: 'All Services' },
            { id: 'ration', label: 'Ration Services' },
            { id: 'aadhaar', label: 'Aadhaar Services' },
            { id: 'voter', label: 'Voter Services' },
            { id: 'pan', label: 'PAN Services' },
            { id: 'farmer', label: 'Farmer Services' },
            { id: 'driving', label: 'Driving Services' },
            { id: 'vehicle', label: 'Vehicle Services' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-bold transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* When filtering or searching: display clean responsive grid of cards */}
      {isFiltering ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-bold text-slate-800 px-1">
            <span>
              Showing {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
              }}
              className="text-emerald-700 hover:underline cursor-pointer font-bold"
            >
              Show All Categories
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} onClick={() => handleServiceClick(service)} />
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-2xs">
              <BadgeAlert className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-slate-800">No Services Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                No services matched your search. Try searching for "Ration", "Aadhaar", "Voter", "PAN", "Farmer", "DL", or "RC".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                }}
                className="mt-4 px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg cursor-pointer"
              >
                View All Services
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Categorized rows: 7 Official Services */
        <div className="space-y-4">
          {CATEGORIES_LIST.map((category) => (
            <div
              key={category.id}
              className="bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch gap-3 transition-all hover:border-slate-300"
            >
              {/* Left Vertical Ribbon matching the uploaded screenshot */}
              <div
                onClick={() => {
                  if (category.id === 'ration') setActiveTab('ration_services');
                  else if (category.id === 'aadhaar') setActiveTab('aadhaar_corrections');
                  else if (category.id === 'voter') setActiveTab('voter_services');
                  else if (category.id === 'pan') setActiveTab('pan_services');
                  else if (category.id === 'farmer') setActiveTab('farmer_services');
                  else if (category.id === 'driving') setActiveTab('driving_services');
                  else if (category.id === 'vehicle') setActiveTab('vehicle_services');
                }}
                className={`${category.ribbonColor} text-white font-black text-xs sm:text-sm tracking-wider rounded-xl px-2.5 py-2 sm:py-3 flex sm:flex-col items-center justify-center shrink-0 uppercase shadow-xs sm:w-12 min-h-[44px] cursor-pointer hover:opacity-95 transition-opacity`}
              >
                <span className="sm:hidden font-bold">{category.label}</span>
                <span className="hidden sm:inline [writing-mode:vertical-rl] rotate-180 text-center tracking-widest font-black">
                  {category.label}
                </span>
              </div>

              {/* Grid of Service Cards */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {category.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => handleServiceClick(service)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ServiceCardProps {
  service: ServiceItem;
  onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  const { getServicePrice } = useApp();
  const fee = getServicePrice(service.id);
  const isBlueBtn = service.actionColor === 'blue';

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer select-none min-h-[185px] sm:min-h-[195px]"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* Top Left Triangle Fold Notch (Exact match to reference screenshots) */}
      <div
        className={
          service.cornerColor === 'blue'
            ? 'corner-triangle-blue'
            : service.cornerColor === 'amber'
            ? 'corner-triangle-amber'
            : 'corner-triangle-green'
        }
      />

      {/* Top Right Fee & New Badges */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
        {fee > 0 && (
          <span className="bg-emerald-50/90 text-emerald-800 border border-emerald-200 text-[10px] font-black px-1.5 py-0.5 rounded shadow-2xs font-mono">
            ₹{fee}
          </span>
        )}
        {service.isNew && (
          <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-xs animate-pulse">
            NEW
          </span>
        )}
      </div>

      {/* Center Icon & Enlarged Title (No fee displayed) */}
      <div className="pt-4 px-2.5 pb-2.5 flex flex-col items-center text-center flex-1 justify-center">
        <div className="transform group-hover:scale-106 transition-transform duration-200 mb-2">
          <ServiceIcon type={service.iconType} className="w-16 h-16 sm:w-18 sm:h-18" />
        </div>
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug tracking-tight uppercase line-clamp-2 px-1">
          {service.name}
        </h3>
      </div>

      {/* Bottom Action Button matching reference screenshots (Enlarged text) */}
      <div
        className="w-full py-2 px-1 text-center font-black text-xs sm:text-sm tracking-wide uppercase text-white transition-colors duration-150 rounded-b-xl bg-[#10b981] group-hover:bg-[#059669]"
      >
        {service.actionLabel}
      </div>
    </div>
  );
};
