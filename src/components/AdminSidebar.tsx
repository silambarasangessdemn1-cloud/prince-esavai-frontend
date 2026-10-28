import React from 'react';
import {
  ShieldCheck,
  Fingerprint,
  CreditCard,
  Vote,
  Store,
  Car,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  RefreshCw,
  ArrowLeft,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Headphones,
  Database,
  X,
  Sprout,
} from 'lucide-react';

export type AdminQueue = 'aadhaar' | 'pan' | 'voter' | 'ration' | 'driving' | 'vehicle' | 'farmer';
export type AdminQuickTab = 'all' | 'pending' | 'in_progress' | 'resolved';

export interface AdminQueueCounts {
  aadhaar: number;
  pan: number;
  voter: number;
  ration: number;
  driving: number;
  vehicle: number;
  farmer: number;
  total: number;
}

export interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeQueue: AdminQueue;
  onSelectQueue: (queue: AdminQueue) => void;
  quickTab: AdminQuickTab;
  onSelectQuickTab: (tab: AdminQuickTab) => void;
  counts: AdminQueueCounts;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onGoToCitizenPortal: () => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  activeQueue,
  onSelectQueue,
  quickTab,
  onSelectQuickTab,
  counts,
  isRefreshing,
  onRefresh,
  onGoToCitizenPortal,
  onLogout,
}) => {
  const queueItems: Array<{
    id: AdminQueue;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
  }> = [
    {
      id: 'aadhaar',
      label: 'Aadhaar Corrections',
      sublabel: 'UIDAI Gateway Queue',
      icon: Fingerprint,
      count: counts.aadhaar,
    },
    {
      id: 'pan',
      label: 'PAN Card Services',
      sublabel: 'NSDL / UTIITSL Queue',
      icon: CreditCard,
      count: counts.pan,
    },
    {
      id: 'voter',
      label: 'Voter ID Services',
      sublabel: 'ECI NVSP Form 6/7/8',
      icon: Vote,
      count: counts.voter,
    },
    {
      id: 'ration',
      label: 'Ration Card (TNePDS)',
      sublabel: 'Family / Smartcard Queue',
      icon: Store,
      count: counts.ration,
    },
    {
      id: 'driving',
      label: 'Driving License',
      sublabel: 'Sarathi MoRTH RTO',
      icon: ShieldCheck,
      count: counts.driving,
    },
    {
      id: 'vehicle',
      label: 'Vehicle Services',
      sublabel: 'Vahan Parivahan Portal',
      icon: Car,
      count: counts.vehicle,
    },
    {
      id: 'farmer',
      label: 'Farmer Services',
      sublabel: 'Uzhavan / Land Records',
      icon: Sprout,
      count: counts.farmer,
    },
  ];

  const statusItems: Array<{
    id: AdminQuickTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'all', label: 'All Statuses', icon: FileText },
    { id: 'pending', label: 'Submitted / Pending', icon: Clock },
    { id: 'in_progress', label: 'In Progress / Docs', icon: AlertCircle },
    { id: 'resolved', label: 'Resolved / Done', icon: CheckCircle2 },
  ];

  const handleQueueClick = (id: AdminQueue) => {
    onSelectQueue(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleStatusClick = (id: AdminQuickTab) => {
    onSelectQuickTab(id);
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
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Admin Sidebar Container (Full height executive midnight slate) */}
      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-20 h-screen w-72 bg-[#0f172a] text-slate-100 flex flex-col shrink-0 transition-transform duration-200 ease-in-out border-r border-slate-800/90 shadow-2xl lg:shadow-none overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
      >
        {/* Top Master Branding Bar */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-[#090d16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981] text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black text-sm tracking-tight text-white leading-tight flex items-center gap-1.5">
                <span>Princess e-Sevai</span>
                <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-semibold">
                Central Control Console
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 text-sm font-bold cursor-pointer lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Profile & Total Counter Banner */}
        <div className="p-3.5 m-3 rounded-xl bg-[#131b2e] border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                Central Queue Hub
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700 font-mono">
              v2.6
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-[#0b1120] p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Total Tickets
              </div>
              <div className="text-xl font-black text-white font-mono mt-0.5">
                {counts.total}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Service Queues */}
        <div className="px-3 py-1 flex-1 space-y-4">
          <div>
            <div className="px-2 pb-1.5 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Service Request Queues</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                Live Sync
              </span>
            </div>

            <div className="space-y-1">
              {queueItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeQueue === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleQueueClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer text-left group ${
                      isActive
                        ? 'bg-[#10b981] text-slate-950 font-black shadow-lg shadow-emerald-500/25 translate-x-0.5'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-[#131b2e] text-[#10b981] group-hover:bg-slate-700/80 border border-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-black text-xs leading-tight">
                          {item.label}
                        </div>
                        <div
                          className={`text-[10px] truncate ${
                            isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {item.sublabel}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'bg-[#090d16] text-emerald-400 border border-slate-800'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Filter Section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="px-2 pb-1.5 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Filter by Status</span>
            </div>

            <div className="space-y-1">
              {statusItems.map((status) => {
                const Icon = status.icon;
                const isActive = quickTab === status.id;

                return (
                  <button
                    key={status.id}
                    onClick={() => handleStatusClick(status.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-slate-800 text-white font-black border border-slate-700 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{status.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Utilities Section */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="px-2 pb-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              System Control
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer text-left disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#10b981] ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span>{isRefreshing ? 'Refreshing Data...' : 'Refresh All Queues'}</span>
              </button>
            )}

            <button
              onClick={onGoToCitizenPortal}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer text-left"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Back to Citizen Portal</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-950/50 transition-all cursor-pointer text-left border border-rose-900/30"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Logout Administrator</span>
            </button>
          </div>
        </div>

        {/* Footer Support Desk */}
        <div className="p-3 m-3 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-slate-400 mt-auto">
          <div className="flex items-center gap-2 mb-1 text-white font-bold text-[11px]">
            <Database className="w-3.5 h-3.5 text-[#10b981]" />
            <span>e-Sevai Central Gateway</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            IP Monitored • SSL TLS 1.3
          </div>
        </div>
      </aside>
    </>
  );
};
