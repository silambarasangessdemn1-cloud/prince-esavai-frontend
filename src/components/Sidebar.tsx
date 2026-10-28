import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutGrid,
  User,
  History,
  ListChecks,
  Fingerprint,
  CreditCard,
  Car,
  Sprout,
  Vote,
  FileEdit,
  Printer,
  Store,
  Layers,
  Key,
  Wallet,
  PhoneCall,
  ShieldCheck,
  ClipboardList,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, closeService, selectedService } = useApp();

  // Re-ordered nav items: Ration and Aadhaar/Download at the top; Driving and Vehicle at the bottom!
  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutGrid },
    { id: 'ration_services', label: 'RATION SERVICES', icon: Store },
    { id: 'aadhaar_corrections', label: 'AADHAAR CORR.', icon: Fingerprint },
    // { id: 'can_services', label: 'CAN EDIT SERVICES', icon: FileEdit },
    { id: 'voter_services', label: 'VOTER SERVICES', icon: Vote },
    { id: 'pan_services', label: 'PAN SERVICES', icon: CreditCard },
    // { id: 'pvc_services', label: 'PVC CARD PRINT', icon: Printer },
    { id: 'farmer_services', label: 'FARMER SERVICES', icon: Sprout },
    // Driving & Vehicle services placed last as requested:
    { id: 'driving_services', label: 'DRIVING SERVICES', icon: ShieldCheck },
    { id: 'vehicle_services', label: 'VEHICLE SERVICES', icon: Car },
    // Administrative views:
    
    // { id: 'service_history', label: 'SERVICE HISTORY', icon: History },
    { id: 'other_services', label: 'OTHER SERVICES', icon: Layers },
    { id: 'all_service_status', label: 'ALL SERVICE STATUS', icon: ListChecks },
    { id: 'my_profile', label: 'MY PROFILE', icon: User },
    
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    closeService();
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-2xs transition-opacity"
        />
      )}

      {/* Sidebar container with matching deep teal color scheme and enlarged Calibri typography */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[69px] z-50 lg:z-10 h-screen lg:h-[calc(100vh-69px)] w-68 bg-[#053228] text-emerald-100 flex flex-col shrink-0 transition-transform duration-200 ease-in-out border-r border-[#094235] shadow-xl lg:shadow-none overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
      >
        {/* Mobile Header Branding */}
        <div className="p-4 flex items-center justify-between border-b border-[#0a4235] lg:hidden bg-[#042a22]">
          <div className="flex items-center gap-2">
            <img
              src="/assets/aistudio/image_0c10b464.png"
              alt="Princess A to Z Business"
              className="h-9 w-auto object-contain rounded bg-white p-0.5"
            />
            <span className="font-bold text-base tracking-tight text-white">Princess A to Z</span>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-md text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <div className="p-3 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !selectedService;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#00cba0] text-slate-950 font-black shadow-md shadow-[#00cba0]/20 translate-x-0.5'
                    : 'text-[#9fc7bc] hover:text-white hover:bg-[#0c4739]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-slate-950 stroke-[2.5]' : 'text-[#69a193]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="p-3.5 m-3 rounded-xl bg-[#03231c] border border-[#094235] text-xs text-emerald-300/80">
          <div className="flex items-center gap-2 mb-1.5 text-white font-semibold">
            <PhoneCall className="w-4 h-4 text-[#00cba0]" />
            <span className="font-bold text-xs">CSC Support Desk</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-200 bg-[#063328] px-2 py-1 rounded text-center">
            HELPLINE: 044-2850-9999
          </div>
        </div>
      </aside>
    </>
  );
};
