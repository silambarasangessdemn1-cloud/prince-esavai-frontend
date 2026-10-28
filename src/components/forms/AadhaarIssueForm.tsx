import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  RotateCcw,
  List,
  Bell,
  FileText,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Fingerprint,
} from 'lucide-react';
import { aadhaarApi, MetaResponse } from '../../services/aadhaarApi';

const PRIORITY_COLORS: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-700',
  Medium: 'bg-blue-50 text-blue-700',
  High: 'bg-amber-50 text-amber-700',
  Urgent: 'bg-red-50 text-red-700',
};

const INITIAL_FORM = {
  aadhaarNumber: '',
  applicantName: '',
  applicantPhone: '',
  applicantEmail: '',
  issueType: '',
  issueDescription: '',
  priority: 'Medium',
};

export const AadhaarIssueForm: React.FC = () => {
  const { setActiveTab, closeService } = useApp();

  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  // Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successTicket, setSuccessTicket] = useState('');

  // Load meta (issue types, priorities, statuses) on mount
  useEffect(() => {
    aadhaarApi.getMeta().then((res) => {
      if (res.success && res.data) setMeta(res.data);
      setIsLoadingMeta(false);
    }).catch(() => setIsLoadingMeta(false));
  }, []);

  const field = (name: keyof typeof INITIAL_FORM) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [name]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
      setErrorMsg('');
    },
  });

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrorMsg('');
    setFieldErrors({});
    setSuccessTicket('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});
    setSuccessTicket('');

    // Client-side pre-checks
    if (!/^\d{12}$/.test(form.aadhaarNumber)) {
      setFieldErrors({ aadhaarNumber: 'Must be exactly 12 digits' });
      return;
    }
    if (!form.issueType) {
      setFieldErrors({ issueType: 'Please select an issue type' });
      return;
    }
    if (form.issueDescription.trim().length < 10) {
      setFieldErrors({ issueDescription: 'Description must be at least 10 characters' });
      return;
    }

    setIsSubmitting(true);

    const res = await aadhaarApi.submitIssue({
      aadhaarNumber: form.aadhaarNumber.trim(),
      applicantName: form.applicantName.trim(),
      applicantPhone: form.applicantPhone.trim(),
      applicantEmail: form.applicantEmail.trim(),
      issueType: form.issueType,
      issueDescription: form.issueDescription.trim(),
      priority: form.priority,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setSuccessTicket(res.data.issue.ticketNumber);
      setForm(INITIAL_FORM);
      return;
    }

    // Handle validation errors from server
    if (res.errors && res.errors.length > 0) {
      const fe: Record<string, string> = {};
      res.errors.forEach((err) => { fe[err.field] = err.message; });
      setFieldErrors(fe);
      return;
    }

    setErrorMsg(res.message || 'Failed to submit issue. Please try again.');
  };

  const inputClass = (name: string) =>
    `w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none transition-all font-medium ${
      fieldErrors[name]
        ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-1 focus:ring-red-400/30'
        : 'border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400/20'
    }`;

  return (
    <div
      className="max-w-4xl mx-auto space-y-4 pb-12"
      style={{ fontFamily: "Calibri, 'Carlito', 'Segoe UI', Candara, system-ui, sans-serif" }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Fingerprint className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Aadhaar Issue / Update Request
              </h1>
              <p className="text-sm text-slate-500 font-semibold">
                Submit your Aadhaar-related query or correction request
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setActiveTab('aadhaar_issues'); closeService(); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-black shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <List className="w-4 h-4" />
            View All Issues
          </button>
        </div>

        {/* Success Banner */}
        {successTicket && (
          <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-black text-emerald-800 text-sm">Issue Submitted Successfully!</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                Your ticket number is{' '}
                <span className="font-mono font-black bg-emerald-100 px-2 py-0.5 rounded">{successTicket}</span>.
                Our team will process it within 1 working day.
              </p>
              <button
                onClick={() => { setActiveTab('aadhaar_issues'); closeService(); }}
                className="mt-2 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                → View all submitted issues
              </button>
            </div>
          </div>
        )}

        {/* Global Error */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {isLoadingMeta ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading form...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">

            {/* ── Section 1: Aadhaar Details ─────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Aadhaar Details</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="12-digit Aadhaar number"
                    {...field('aadhaarNumber')}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      setForm((p) => ({ ...p, aadhaarNumber: v }));
                      setFieldErrors((p) => ({ ...p, aadhaarNumber: '' }));
                    }}
                    className={`pl-10 ${inputClass('aadhaarNumber')} font-mono tracking-widest`}
                    required
                  />
                </div>
                {fieldErrors.aadhaarNumber && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.aadhaarNumber}</p>
                )}
                <p className="mt-1 text-[11px] text-slate-400">Stored securely. Only last 4 digits shown in records.</p>
              </div>
            </div>

            {/* ── Section 2: Applicant Details ──────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Applicant Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Applicant full name" {...field('applicantName')}
                      className={`pl-10 ${inputClass('applicantName')}`} required />
                  </div>
                  {fieldErrors.applicantName && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.applicantName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" maxLength={10} placeholder="10-digit mobile number" {...field('applicantPhone')}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '');
                        setForm((p) => ({ ...p, applicantPhone: v }));
                        setFieldErrors((p) => ({ ...p, applicantPhone: '' }));
                      }}
                      className={`pl-10 ${inputClass('applicantPhone')}`} required />
                  </div>
                  {fieldErrors.applicantPhone && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.applicantPhone}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" placeholder="applicant@email.com" {...field('applicantEmail')}
                      className={`pl-10 ${inputClass('applicantEmail')}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 3: Issue Details ───────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Issue Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Issue Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select {...field('issueType')} className={`${inputClass('issueType')} appearance-none pr-9 bg-white`} required>
                      <option value="">— Select Issue Type —</option>
                      {(meta?.issueTypes ?? []).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {fieldErrors.issueType && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.issueType}</p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <div className="flex gap-2 flex-wrap">
                    {(meta?.priorities ?? ['Low', 'Medium', 'High', 'Urgent']).map((p) => (
                      <button
                        key={p} type="button"
                        onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          form.priority === p
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs'
                            : `border-slate-200 ${PRIORITY_COLORS[p] || 'bg-slate-50 text-slate-600'} hover:border-slate-300`
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Issue Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      {...field('issueDescription')}
                      rows={4}
                      maxLength={2000}
                      placeholder="Describe your Aadhaar issue in detail. Include what needs to be corrected and any reference details..."
                      className={`pl-10 ${inputClass('issueDescription')} resize-none`}
                      required
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    {fieldErrors.issueDescription
                      ? <p className="text-xs text-red-600 font-medium">{fieldErrors.issueDescription}</p>
                      : <span />}
                    <p className="text-[11px] text-slate-400 ml-auto">
                      {form.issueDescription.length}/2000
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice Banner */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white border border-blue-300 flex items-center justify-center text-blue-600 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-blue-700 flex-1">
                Your issue will be recorded and tracked. Processing time: 1–3 Working Days depending on issue type.
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
              <button type="button" onClick={handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold transition-all cursor-pointer">
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button type="submit" disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-black shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Issue</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

