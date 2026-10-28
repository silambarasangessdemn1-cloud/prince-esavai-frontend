import React, { useState } from 'react';
import { AdminPortalView } from './AdminPortalView';
import {
  AdminSidebar,
  AdminQueue,
  AdminQuickTab,
  AdminQueueCounts,
} from './AdminSidebar';
import { Menu } from 'lucide-react';

interface AdminPortalWrapperProps {
  onLogout: () => void;
  onGoToCitizenPortal: () => void;
}

export const AdminPortalWrapper: React.FC<AdminPortalWrapperProps> = ({
  onLogout,
  onGoToCitizenPortal,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeQueue, setActiveQueue] = useState<AdminQueue>('aadhaar');
  const [quickTab, setQuickTab] = useState<AdminQuickTab>('all');
  const [counts, setCounts] = useState<AdminQueueCounts>({
    aadhaar: 0,
    pan: 0,
    voter: 0,
    ration: 0,
    driving: 0,
    vehicle: 0,
    farmer: 0,
    total: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  return (
    <div
      className="min-h-screen bg-[#f1f5f9] flex selection:bg-emerald-500 selection:text-white"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* Mobile Floating Menu Button (only visible on mobile/tablet) */}
      <div className="lg:hidden fixed top-3 left-3 z-30">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2.5 bg-[#0f172a] text-white rounded-xl shadow-lg border border-slate-700 hover:bg-slate-800 cursor-pointer flex items-center gap-2"
          aria-label="Open Admin Menu"
        >
          <Menu className="w-5 h-5 text-[#10b981]" />
          <span className="text-xs font-bold text-white pr-1">Admin Menu</span>
        </button>
      </div>

      {/* Left Admin Sidebar (Full Height top-0) */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeQueue={activeQueue}
        onSelectQueue={setActiveQueue}
        quickTab={quickTab}
        onSelectQuickTab={setQuickTab}
        counts={counts}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onGoToCitizenPortal={onGoToCitizenPortal}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-7 overflow-y-auto h-screen bg-[#f1f5f9]">
        <div className="max-w-[1600px] mx-auto pt-11 lg:pt-0">
          <AdminPortalView
            activeQueue={activeQueue}
            setActiveQueue={setActiveQueue}
            quickTab={quickTab}
            setQuickTab={setQuickTab}
            onCountsUpdate={setCounts}
            refreshKey={refreshKey}
          />
        </div>
      </main>
    </div>
  );
};
