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
    if (statusFilter !== 'All' && app.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        app.tokenNumber.toLowerCase().includes(q) ||
        app.serviceName.toLowerCase().includes(q) ||
        app.applicantName.toLowerCase().includes(q) ||
        app.mobile.includes(q)
      );
    }
    return true;
  });

  const completedCount = applications.filter((a) => a.status === 'Completed').length;
  const inProcessCount = applications.filter((a) => a.status === 'In Process').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Applications
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {applications.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Completed / Issued
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            {completedCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            In Process / Queue
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1 font-mono">
            {inProcessCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Service Access
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1 font-mono">
            Direct / Free
          </div>
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
              Real-time application status, receipts, and offline dispatch verification
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
                placeholder="Search token, mobile, name..."
                className="pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-hidden w-full sm:w-64 font-medium"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {['All', 'In Process', 'Completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all cursor-pointer ${
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

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-xs font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Token Number</th>
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-4">Applicant & Mobile</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Service Status</th>
                <th className="py-3 px-4">Delivery</th>
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
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                      Free Direct
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={app.status} />
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

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    case 'In Process':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>In Process</span>
        </span>
      );
    case 'Under Review':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
          <AlertCircle className="w-3 h-3 text-blue-600" />
          <span>Under Review</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>{status}</span>
        </span>
      );
  }
};
