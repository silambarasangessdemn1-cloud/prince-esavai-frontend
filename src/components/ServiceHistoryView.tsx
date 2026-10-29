import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationRecord, ApplicationStatus } from '../types';
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
} from 'lucide-react';

export const ServiceHistoryView: React.FC = () => {
  const { applications, setReceiptModalData, updateApplicationStatus } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'Pending Verification') {
      if (app.paymentStatus !== 'Pending Verification' && app.status !== 'Under Review') return false;
    } else if (statusFilter !== 'All' && app.status !== statusFilter) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        app.tokenNumber.toLowerCase().includes(q) ||
        app.serviceName.toLowerCase().includes(q) ||
        app.applicantName.toLowerCase().includes(q) ||
        app.mobile.includes(q) ||
        (app.utrNumber && app.utrNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingVerificationCount = applications.filter(
    (a) => a.paymentStatus === 'Pending Verification' || a.status === 'Under Review'
  ).length;
  const completedCount = applications.filter((a) => a.status === 'Completed').length;
  const inProcessCount = applications.filter((a) => a.status === 'In Process').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Applied
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {applications.length}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Recorded submissions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-300 bg-amber-50/40 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Verification</span>
            {pendingVerificationCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1 font-mono">
            {pendingVerificationCount}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Admin review underway</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            In Process / Queue
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1 font-mono">
            {inProcessCount}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Active processing</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Completed / Issued
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            {completedCount}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Delivered to citizen</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Service Application Tracker & History
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Track what you have applied for, view UTR payment verification status, and print receipts
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search token, UTR, service, mobile..."
                className="pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-hidden w-full sm:w-64 font-medium"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto no-scrollbar max-w-full">
              {['All', 'Pending Verification', 'In Process', 'Completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    statusFilter === s
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Cards View (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredApps.map((app) => (
            <div key={app.id} className="p-4 space-y-3 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                    Token
                  </span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {app.tokenNumber}
                  </span>
                </div>
                <StatusBadge status={app.status} paymentStatus={app.paymentStatus} />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{app.serviceName}</h4>
                {app.remarks && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{app.remarks}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Applicant</span>
                  <span className="font-semibold text-slate-800 truncate block">{app.applicantName}</span>
                  <span className="text-slate-500 font-mono text-[11px]">+91 {app.mobile}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Fee & UTR</span>
                  <div className="font-bold text-slate-900">
                    <span>₹{app.paidAmount || app.fee}</span>
                    {app.paymentStatus && (
                      <span className="text-[10px] font-bold text-amber-700 ml-1">
                        ({app.paymentStatus === 'Verified & Approved' ? 'Approved' : 'Pending'})
                      </span>
                    )}
                  </div>
                  {app.utrNumber && (
                    <span className="text-[10px] font-mono text-slate-500 block truncate">
                      UTR: {app.utrNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-slate-400">{app.date}</span>
                <button
                  onClick={() => setReceiptModalData(app)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-xs font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Token Number</th>
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-4">Applicant & Mobile</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Fee & UPI UTR</th>
                <th className="py-3 px-4">Application Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap text-sm">
                    {app.tokenNumber}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-800 text-sm leading-tight">
                      {app.serviceName}
                    </div>
                    {app.remarks && (
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {app.remarks}
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
                    {app.utrNumber ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 text-xs">
                            ₹{app.paidAmount || app.fee}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              app.paymentStatus === 'Verified & Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.paymentStatus === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.paymentStatus || 'Pending'}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                          UTR: {app.utrNumber}
                        </div>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                        ₹{app.fee || 0}
                      </span>
                    )}
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
                {applications.length === 0
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

const StatusBadge: React.FC<{ status: ApplicationStatus; paymentStatus?: string }> = ({
  status,
  paymentStatus,
}) => {
  if (paymentStatus === 'Pending Verification' || status === 'Under Review') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
        <span>Pending Verification / சரிபார்ப்பு நிலுவை</span>
      </span>
    );
  }

  if (paymentStatus === 'Rejected' || status === 'Rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>Rejected / நிராகரிக்கப்பட்டது</span>
      </span>
    );
  }

  if (status === 'Completed' || paymentStatus === 'Verified & Approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Approved & Active / அங்கீகரிக்கப்பட்டது</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
      <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
      <span>In Progress / செயல்பாட்டில்</span>
    </span>
  );
};
