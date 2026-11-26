import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  FileCheck2,
  LogOut,
  Wallet,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    searchQuery,
    setSearchQuery,
    notifications,
    markAllNotificationsRead,
    profile,
    setActiveTab,
    closeService,
    walletBalance,
    refreshWalletBalance,
    setIsRechargeModalOpen,
  } = useApp();
  const { user, logout } = useAuth();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleManualRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsRefreshingBalance(true);
      await refreshWalletBalance();
    } finally {
      setTimeout(() => setIsRefreshingBalance(false), 500);
    }
  };

  const formattedBalance = Number(walletBalance || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <header
      className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-emerald-100 text-xs font-semibold px-2.5 sm:px-4 py-1 flex items-center justify-between min-w-0 w-full overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
          <span className="bg-emerald-500 text-white px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[11px] font-black tracking-wider uppercase shrink-0">
            LIVE
          </span>
          <span className="text-[10px] sm:text-xs truncate">
            Tamil Nadu e-Governance Citizen Access Network
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-xs shrink-0 text-emerald-200">
          <span className="hidden sm:inline text-xs">VLE ID: <strong className="text-white font-mono">{profile.vleId}</strong></span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline text-xs">Helpline: <strong>044-2850-9999</strong></span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3 lg:gap-6">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => {
              setActiveTab('dashboard');
              closeService();
            }}
            className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-hidden cursor-pointer"
          >
            <img
              src="/assets/aistudio/image_0c10b464.png"
              alt="Princess A to Z Business Logo"
              className="h-7 sm:h-9 md:h-11 w-auto object-contain rounded drop-shadow-xs group-hover:scale-102 transition-transform"
            />
            <div className="hidden md:block pl-2.5 border-l border-slate-200">
              <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                Citizen e-Governance Portal
              </div>
              <div className="text-[11px] font-semibold text-emerald-700">
                Tamil Nadu & CSC Network
              </div>
            </div>
          </button>
        </div>

        {/* Center: Live Search for Services */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-2 min-w-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-7 sm:pl-10 pr-2.5 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg sm:rounded-xl outline-hidden transition-all shadow-inner font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Center Actions */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Responsive Wallet Balance & Add Money */}
          <div className="flex items-center bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-100/50 border border-emerald-300/80 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-xs">
            {/* Balance Pill Button */}
            <button
              onClick={() => {
                setActiveTab('wallet_passbook');
                closeService();
              }}
              className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-0.5 text-left cursor-pointer group"
              title="Click to view Wallet Ledger & Passbook"
            >
              <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="flex flex-col">
                <span className="hidden sm:flex text-[9px] font-bold text-emerald-800 uppercase tracking-wider leading-none items-center gap-1">
                  Wallet
                  <span title="Refresh Balance" className="inline-flex items-center">
                    <RefreshCw
                      onClick={handleManualRefresh}
                      className={`w-2.5 h-2.5 text-emerald-600 hover:text-emerald-900 ${
                        isRefreshingBalance ? 'animate-spin' : ''
                      }`}
                    />
                  </span>
                </span>
                <span className="text-[11px] sm:text-xs md:text-sm font-black font-mono text-slate-900 leading-tight whitespace-nowrap">
                  ₹{formattedBalance}
                </span>
              </div>
            </button>

            {/* Direct Add Money Button */}
            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="ml-0.5 sm:ml-1.5 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-[#00a86b] hover:bg-[#008f5b] active:bg-[#007a4d] text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all shadow-xs cursor-pointer shrink-0"
              title="Add Money via Cashfree"
            >
              <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Money</span>
              <span className="sm:hidden font-bold">Add</span>
            </button>
          </div>

          {/* Track Applications Shortcut Button - Hidden on small mobile */}
          <button
            onClick={() => {
              setActiveTab('service_history');
              closeService();
            }}
            className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <FileCheck2 className="w-4 h-4 text-slate-500" />
            <span>Track</span>
          </button>

          {/* Notification Menu */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">System Notifications</span>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-emerald-600 hover:underline cursor-pointer font-bold"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs ${
                        n.read ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50/70 text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {n.read ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span className="font-bold text-slate-800">{n.title}</span>
                        <span className="ml-auto text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logged-in User & Logout */}
          <div className="flex items-center gap-1">
            {user && (
              <span className="hidden xl:block text-xs font-semibold text-slate-600 truncate max-w-[100px]">
                {user.username}
              </span>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg sm:rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
