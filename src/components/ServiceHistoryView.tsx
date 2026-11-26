import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationRecord, ApplicationStatus } from '../types';
import { getAppTimestamp } from '../utils/statusSync';
import {
  Search,
  Filter,
  Printer,
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export const isCompletedApp = (a: ApplicationRecord): boolean => {
  const s = String(a.status || '').toLowerCase();
  const ps = String(a.paymentStatus || '').toLowerCase();
  return (
    s.includes('completed') ||
    s.includes('resolved') ||
    s.includes('approved') ||
    s.includes('issued') ||
    s.includes('closed') ||
    ps.includes('verified & approved') ||
    ps.includes('approved')
  );
};

export const isInProcessApp = (a: ApplicationRecord): boolean => {
  if (isCompletedApp(a)) return false;
  const s = String(a.status || '').toLowerCase();
  return (
    s.includes('in process') ||
    s.includes('in progress') ||
    s.includes('slot') ||
    s.includes('inspection') ||
    s.includes('verified')
  );
};

export const isRejectedApp = (a: ApplicationRecord): boolean => {
  const s = String(a.status || '').toLowerCase();
  const ps = String(a.paymentStatus || '').toLowerCase();
  return s.includes('reject') || ps.includes('reject') || s.includes('cancel');
};

export const isPendingApp = (a: ApplicationRecord): boolean => {
  return !isCompletedApp(a) && !isInProcessApp(a) && !isRejectedApp(a);
};

export const ServiceHistoryView: React.FC = () => {
  const { applications, setReceiptModalData, refreshApplications, isSyncingApplications } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Initial live synchronization on mount
  useEffect(() => {
    if (refreshApplications) {
      refreshApplications();
    }
  }, [refreshApplications]);

  // ALWAYS sort applications: newest / latest data first (descending timestamp)
  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => getAppTimestamp(b) - getAppTimestamp(a));
  }, [applications]);

  const filteredApps = useMemo(() => {
    return sortedApplications.filter((app) => {
      // Exclude failed or errored payment attempts
      if (
        app.paymentStatus === 'Failed' ||
        app.status === 'Failed' ||
        (app.remarks && (app.remarks.toLowerCase().includes('failed') || app.remarks.toLowerCase().includes('error')))
      ) {
        return false;
      }

      if (statusFilter === 'Pending Verification') {
        if (!isPendingApp(app)) return false;
      } else if (statusFilter === 'In Process') {
        if (!isInProcessApp(app)) return false;
      } else if (statusFilter === 'Completed') {
        if (!isCompletedApp(app)) return false;
      } else if (statusFilter === 'Rejected') {
        if (!isRejectedApp(app)) return false;
      } else if (statusFilter !== 'All') {
        if (app.status !== statusFilter) return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          app.tokenNumber.toLowerCase().includes(q) ||
          (app.details?.ticketNumber && String(app.details.ticketNumber).toLowerCase().includes(q)) ||
          app.serviceName.toLowerCase().includes(q) ||
          app.applicantName.toLowerCase().includes(q) ||
          app.mobile.includes(q) ||
          (app.utrNumber && app.utrNumber.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [sortedApplications, statusFilter, searchTerm]);

  const pendingVerificationCount = useMemo(() => sortedApplications.filter(isPendingApp).length, [sortedApplications]);
  const completedCount = useMemo(() => sortedApplications.filter(isCompletedApp).length, [sortedApplications]);
  const inProcessCount = useMemo(() => sortedApplications.filter(isInProcessApp).length, [sortedApplications]);
  const rejectedCount = useMemo(() => sortedApplications.filter(isRejectedApp).length, [sortedApplications]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-14 animate-in fade-in duration-200 w-full max-w-full overflow-hidden">
      {/* Top Stats Banner (Responsive 2 cols on mobile, 4 cols on lg) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Applied */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
            Total Applied
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
            {sortedApplications.length}
          </div>
          <span className="text-[10px] text-slate-400 font-medium truncate block mt-0.5">Submissions recorded</span>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-300 bg-amber-50/40 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
            <span className="truncate">Pending</span>
            {pendingVerificationCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-800 mt-1 font-mono">
            {pendingVerificationCount}
          </div>
          <span className="text-[10px] text-amber-600 font-medium truncate block mt-0.5">Under official review</span>
        </div>

        {/* In Process */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-200 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-wider truncate">
            In Process
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1 font-mono">
            {inProcessCount}
          </div>
          <span className="text-[10px] text-slate-400 font-medium truncate block mt-0.5">Active department queue</span>
        </div>

        {/* Completed */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider truncate">
            Completed / Issued
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
            {completedCount}
          </div>
          <span className="text-[10px] text-slate-400 font-medium truncate block mt-0.5">Approved & Delivered</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls (Mobile friendly stacked layout) */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex flex-col gap-3">
          {/* Title & Live Sync Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                  Service Application Tracker & History
                </h2>
                <button
                  type="button"
                  onClick={() => refreshApplications && refreshApplications()}
                  disabled={isSyncingApplications}
                  title="Sync with live database status"
                  className="px-2 sm:px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold bg-white shadow-2xs shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingApplications ? 'animate-spin text-emerald-600' : ''}`} />
                  <span className="text-[11px] sm:text-xs">{isSyncingApplications ? 'Syncing...' : 'Live Sync'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Newest applications displayed first. Live statuses updated automatically from e-Sevai administration.
              </p>
            </div>
          </div>

          {/* Search input and horizontal filter tabs */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-1">
            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket, UTR, service, mobile..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none font-medium"
              />
            </div>

            {/* Status Tabs (Mobile horizontal scrolling) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar w-full md:w-auto touch-pan-x">
              {['All', 'Pending Verification', 'In Process', 'Completed', 'Rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    statusFilter === s
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MOBILE CARDS VIEW (< md screens) ── */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredApps.map((app) => (
            <div key={app.id} className="p-3.5 sm:p-4 space-y-3 hover:bg-slate-50/70 transition-colors">
              {/* Ticket & Status Row */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0 max-w-[60%]">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                    Ticket / Token
                  </span>
                  <span className="font-mono font-black text-slate-900 text-xs sm:text-sm truncate block">
                    {app.details?.ticketNumber || app.tokenNumber}
                  </span>
                  {app.details?.ticketNumber && app.tokenNumber !== app.details.ticketNumber && (
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      Ref: {app.tokenNumber}
                    </span>
                  )}
                </div>
                <div className="shrink-0">
                  <StatusBadge status={app.status} paymentStatus={app.paymentStatus} />
                </div>
              </div>

              {/* Service Title & Official Remarks */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                  {app.serviceName}
                </h4>
                {app.remarks && (
                  <div className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium">
                    <span className="font-bold text-slate-900 block text-[10px] uppercase tracking-wide">
                      Official Remarks:
                    </span>
                    <p className="mt-0.5 leading-relaxed break-words">{app.remarks}</p>
                  </div>
                )}
                {app.details?.ackNumber && (
                  <div className="text-[11px] text-emerald-800 font-mono font-bold mt-1 bg-emerald-50 inline-block px-1.5 py-0.5 rounded border border-emerald-200">
                    Ack Ref: {app.details.ackNumber}
                  </div>
                )}
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Applicant</span>
                  <span className="font-semibold text-slate-800 truncate block">{app.applicantName}</span>
                  <span className="text-slate-500 font-mono text-[11px] block truncate">+91 {app.mobile}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Fee & Status</span>
                  <div className="font-bold text-slate-900 flex items-center gap-1 flex-wrap">
                    <span>₹{app.paidAmount || app.fee}</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        isCompletedApp(app)
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInProcessApp(app)
                          ? 'bg-blue-100 text-blue-800'
                          : isRejectedApp(app)
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCompletedApp(app)
                        ? 'Approved'
                        : isInProcessApp(app)
                        ? 'Processing'
                        : isRejectedApp(app)
                        ? 'Rejected'
                        : 'Pending'}
                    </span>
                  </div>
                  {app.utrNumber && (
                    <span className="text-[10px] font-mono text-slate-500 block truncate mt-0.5">
                      UTR: {app.utrNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Date & Print Slip Row */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <span className="text-[11px] font-mono text-slate-400 truncate">{app.date}</span>
                <button
                  onClick={() => setReceiptModalData(app)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300 text-emerald-800 font-bold rounded-lg text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── DESKTOP TABLE VIEW (md+ screens) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[760px]">
            <thead>
              <tr className="bg-slate-50/80 text-xs font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Ticket / Token</th>
                <th className="py-3 px-4">Service Details & Remarks</th>
                <th className="py-3 px-4">Applicant & Mobile</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Fee & Verification</th>
                <th className="py-3 px-4">Application Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap text-sm">
                    <div>{app.details?.ticketNumber || app.tokenNumber}</div>
                    {app.details?.ticketNumber && app.tokenNumber !== app.details.ticketNumber && (
                      <div className="text-[10px] text-slate-400 font-normal">Ref: {app.tokenNumber}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="font-bold text-slate-800 text-sm leading-tight">
                      {app.serviceName}
                    </div>
                    {app.remarks && (
                      <div className="text-xs text-slate-600 mt-1 p-1.5 bg-slate-50 rounded border border-slate-200/70 leading-snug">
                        {app.remarks}
                      </div>
                    )}
                    {app.details?.ackNumber && (
                      <div className="text-[11px] font-mono font-bold text-emerald-800 mt-0.5">
                        Ack: {app.details.ackNumber}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 text-sm">{app.applicantName}</div>
                    <div className="text-xs text-slate-500 font-mono">+91 {app.mobile}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap text-xs">
                    {app.date}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-xs">
                          ₹{app.paidAmount || app.fee}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isCompletedApp(app)
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInProcessApp(app)
                              ? 'bg-blue-100 text-blue-800'
                              : isRejectedApp(app)
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCompletedApp(app)
                            ? 'Approved'
                            : isInProcessApp(app)
                            ? 'In Process'
                            : isRejectedApp(app)
                            ? 'Rejected'
                            : 'Pending'}
                        </span>
                      </div>
                      {app.utrNumber && (
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                          UTR: {app.utrNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={app.status} paymentStatus={app.paymentStatus} />
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setReceiptModalData(app)}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApps.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-700">No Service Records Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {sortedApplications.length === 0
                  ? 'You have not submitted any service applications yet. Apply for Ration, Aadhaar, Voter, Driving, or Vehicle services from the dashboard.'
                  : 'No applications match your search or filter criteria.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const StatusBadge: React.FC<{ status: ApplicationStatus | string; paymentStatus?: string }> = ({
  status,
  paymentStatus,
}) => {
  const dummyApp = { status, paymentStatus } as ApplicationRecord;

  // 1. Rejected
  if (isRejectedApp(dummyApp)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 whitespace-nowrap">
        <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" />
        <span>Rejected</span>
      </span>
    );
  }

  // 2. Completed / Approved / Resolved
  if (isCompletedApp(dummyApp)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
        <span>Approved & Active</span>
      </span>
    );
  }

  // 3. In Process / In Progress
  if (isInProcessApp(dummyApp)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 whitespace-nowrap">
        <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
        <span>In Process</span>
      </span>
    );
  }

  // 4. Fallback: Pending Verification
  return (
    <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs whitespace-nowrap">
      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 animate-spin shrink-0" />
      <span>Pending Verification</span>
    </span>
  );
};
