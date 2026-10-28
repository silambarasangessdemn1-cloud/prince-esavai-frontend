import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  CheckCircle2,
  Save,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, addNotification } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    addNotification('Profile Updated', 'Center profile details updated successfully.');
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-sm">
              <img
                src="/assets/aistudio/image_0c10b464.png"
                alt="Princess A to Z Business Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {profile.centerName}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  VERIFIED CSC VLE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Authorized Tamil Nadu e-Governance Citizen Service Center
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 font-mono">
                <span>VLE ID: <strong className="text-slate-900">{profile.vleId}</strong></span>
                <span>•</span>
                <span>Terminal: <strong className="text-slate-900">{profile.terminalId}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 border border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Center Info'}
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Center profile updated successfully!</span>
          </div>
        )}

        {/* Details or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Center / Shop Name
                </label>
                <input
                  type="text"
                  value={formData.centerName}
                  onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Agent / Operator Name
                </label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Center Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Authorized VLE</span>
              </span>
              <p className="font-bold text-slate-800 text-sm">{profile.agentName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact Helpline</span>
              </span>
              <p className="font-mono text-slate-800 font-semibold">{profile.mobile}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Official Email</span>
              </span>
              <p className="font-mono text-slate-800 font-semibold">{profile.email}</p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Operating Location</span>
              </span>
              <p className="text-slate-800 font-medium">
                {profile.address}, {profile.district} - {profile.pincode}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Affiliation Since</span>
              </span>
              <p className="font-mono text-slate-800 font-semibold">{profile.joiningDate}</p>
            </div>
          </div>
        )}
      </div>

      {/* Official Certificate of Authorization */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-amber-200">
          <Award className="w-6 h-6 text-amber-700" />
          <div>
            <h3 className="text-sm font-bold text-amber-950 uppercase tracking-tight">
              Certificate of CSC Authorization & e-Seva Accreditation
            </h3>
            <p className="text-[11px] text-amber-800">
              Government of Tamil Nadu • Directorate of e-Governance & IT Department
            </p>
          </div>
        </div>

        <p className="text-xs text-amber-900 leading-relaxed">
          This certifies that <strong>{profile.centerName}</strong> (VLE ID: <span className="font-mono font-bold">{profile.vleId}</span>)
          is recognized and authorized to execute Citizen Access Network (CAN) registrations, 
          civil supplies ration card modifications, transport vehicle checks, and smart card printing in Tamil Nadu.
        </p>

        <div className="flex items-center justify-between pt-2 text-[11px] text-amber-800">
          <span>Security Standard: ISO/IEC 27001 Verified</span>
          <span>Status: <strong>PERPETUAL / ACTIVE</strong></span>
        </div>
      </div>
    </div>
  );
};
