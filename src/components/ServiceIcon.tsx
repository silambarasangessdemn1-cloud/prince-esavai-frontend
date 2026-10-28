import React from 'react';

interface ServiceIconProps {
  type: string;
  className?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ type, className = 'w-16 h-16' }) => {
  switch (type) {
    // AADHAAR CORRECTIONS SPECIFIC ICONS (MATCHING REFERENCE PORTAL)
    case 'aadhaar-mobile-update':
      return (
        <div className={`${className} rounded-full bg-emerald-50 flex items-center justify-center p-1.5 shadow-xs border-2 border-emerald-400`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#f0fdf4" />
            {/* Smartphone body */}
            <rect x="22" y="12" width="20" height="38" rx="4" fill="#0f172a" />
            <rect x="24" y="15" width="16" height="30" rx="2" fill="#22c55e" />
            <circle cx="32" cy="47" r="1.5" fill="#ffffff" />
            {/* Screen content: Aadhaar sun and signal */}
            <circle cx="32" cy="27" r="5" fill="#ffffff" />
            <circle cx="32" cy="27" r="3" fill="#ea580c" />
            {/* Radiating rays */}
            <line x1="32" y1="20" x2="32" y2="22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="32" y1="32" x2="32" y2="34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="25" y1="27" x2="27" y2="27" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="37" y1="27" x2="39" y2="27" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M26 38h12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'aadhaar-address-update':
      return (
        <div className={`${className} rounded-full bg-amber-50 flex items-center justify-center p-1.5 shadow-xs border-2 border-amber-400`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#fffbeb" />
            {/* Map / Document card */}
            <rect x="14" y="16" width="36" height="26" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <rect x="17" y="19" width="30" height="4" rx="1" fill="#ea580c" />
            <rect x="17" y="25" width="18" height="2" rx="0.5" fill="#94a3b8" />
            <rect x="17" y="29" width="14" height="2" rx="0.5" fill="#94a3b8" />
            <rect x="17" y="33" width="22" height="2" rx="0.5" fill="#16a34a" />
            {/* Red Map Pin with house */}
            <path
              d="M42 22c-4.4 0-8 3.6-8 8 0 6 8 16 8 16s8-10 8-16c0-4.4-3.6-8-8-8z"
              fill="#ef4444"
              stroke="#b91c1c"
              strokeWidth="1"
            />
            <circle cx="42" cy="29" r="3" fill="#ffffff" />
          </svg>
        </div>
      );

    case 'aadhaar-physical-card':
      return (
        <div className={`${className} rounded-full bg-orange-50 flex items-center justify-center p-1.5 shadow-xs border-2 border-orange-400`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#fff7ed" />
            {/* Stacked PVC Cards (Layer 1 back) */}
            <rect x="12" y="22" width="36" height="22" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" transform="rotate(-6 12 22)" />
            {/* Front card */}
            <rect x="16" y="20" width="36" height="24" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* Tricolor top header */}
            <rect x="17" y="21" width="34" height="3" fill="#ea580c" />
            <rect x="17" y="24" width="34" height="2" fill="#ffffff" />
            <rect x="17" y="26" width="34" height="2" fill="#16a34a" />
            {/* Chip */}
            <rect x="20" y="30" width="6" height="5" rx="1" fill="#f59e0b" />
            {/* Photo box */}
            <rect x="40" y="29" width="8" height="10" rx="1" fill="#cbd5e1" />
            <circle cx="44" cy="32" r="2" fill="#94a3b8" />
            <path d="M41 40c0-2 1.5-3 3-3s3 1 3 3" fill="#94a3b8" />
            {/* Text lines */}
            <rect x="20" y="38" width="16" height="2" rx="0.5" fill="#64748b" />
            <rect x="20" y="41" width="12" height="1.5" rx="0.5" fill="#94a3b8" />
          </svg>
        </div>
      );

    case 'aadhaar-rekyc':
      return (
        <div className={`${className} rounded-full bg-sky-50 flex items-center justify-center p-1.5 shadow-xs border-2 border-sky-400`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#f0f9ff" />
            {/* Aadhaar card base */}
            <rect x="14" y="18" width="36" height="24" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
            <rect x="15" y="19" width="34" height="3" fill="#ea580c" />
            <rect x="15" y="22" width="34" height="2" fill="#ffffff" />
            <rect x="15" y="24" width="34" height="2" fill="#16a34a" />
            {/* QR code mini */}
            <rect x="18" y="28" width="10" height="10" fill="#0369a1" rx="1" />
            <rect x="20" y="30" width="6" height="6" fill="#ffffff" />
            <rect x="22" y="32" width="2" height="2" fill="#0369a1" />
            {/* Green verification shield */}
            <path d="M38 28l6-3 6 3v5c0 4-3 7-6 8-3-1-6-4-6-8v-5z" fill="#10b981" />
            <path d="M41 33l2 2 4-4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    // 1. RATION SERVICES LOGOS
    case 'leaf-ration':
      return (
        <div className={`${className} rounded-full bg-emerald-50 flex items-center justify-center p-1.5 shadow-xs border border-emerald-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Green leaf emblem with Tamil Nadu state seal inspiration */}
            <circle cx="32" cy="32" r="28" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
            <path
              d="M16 38C16 20 28 12 48 12c0 20-8 32-24 32-3 0-5.5-.5-8-2v5c0 1-1 2-2 2s-2-1-2-2V38z"
              fill="#059669"
            />
            <path d="M22 36c11-3 19-11 23-20" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M28 28c4 3 8 4 12 4" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="32" cy="46" r="2" fill="#047857" />
          </svg>
        </div>
      );

    case 'qr-ration':
      return (
        <div className={`${className} rounded-full bg-teal-50 flex items-center justify-center p-1.5 shadow-xs border border-teal-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#f0fdfa" stroke="#0d9488" strokeWidth="2" />
            {/* Authentic QR code boxes */}
            <rect x="18" y="18" width="12" height="12" rx="2" fill="#0f766e" />
            <rect x="21" y="21" width="6" height="6" fill="#ffffff" />
            <rect x="23" y="23" width="2" height="2" fill="#0f766e" />

            <rect x="34" y="18" width="12" height="12" rx="2" fill="#0f766e" />
            <rect x="37" y="21" width="6" height="6" fill="#ffffff" />
            <rect x="39" y="23" width="2" height="2" fill="#0f766e" />

            <rect x="18" y="34" width="12" height="12" rx="2" fill="#0f766e" />
            <rect x="21" y="37" width="6" height="6" fill="#ffffff" />
            <rect x="23" y="39" width="2" height="2" fill="#0f766e" />

            <rect x="34" y="34" width="5" height="5" fill="#0f766e" />
            <rect x="41" y="34" width="5" height="5" fill="#0f766e" />
            <rect x="34" y="41" width="5" height="5" fill="#0f766e" />
            <rect x="41" y="41" width="5" height="5" fill="#0f766e" />
          </svg>
        </div>
      );

    case 'smartcard':
      return (
        <div className={`${className} rounded-full bg-orange-50 flex items-center justify-center p-1 shadow-xs border border-orange-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#fff7ed" />
            <rect x="10" y="18" width="44" height="28" rx="4" fill="#ea580c" stroke="#c2410c" strokeWidth="1.5" />
            {/* Gold chip */}
            <rect x="14" y="24" width="9" height="8" rx="1.5" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
            <circle cx="44" cy="27" r="4" fill="#15803d" />
            <line x1="26" y1="26" x2="38" y2="26" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="36" x2="48" y2="36" stroke="#fed7aa" strokeWidth="1.2" />
            <text x="14" y="42" fontSize="5" fontWeight="900" fill="#ffffff" fontFamily="Calibri, sans-serif">
              TNePDS SMART CARD
            </text>
          </svg>
        </div>
      );

    // 2. AADHAAR & DOWNLOAD LOGOS
    case 'pan-aadhaar':
      return (
        <div className={`${className} rounded-full bg-purple-500 flex items-center justify-center p-1 shadow-sm`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#9333ea" />
            {/* PAN card */}
            <rect x="12" y="18" width="24" height="15" rx="2" fill="#ffffff" />
            <rect x="14" y="20" width="6" height="7" fill="#0284c7" rx="1" />
            <line x1="22" y1="21" x2="33" y2="21" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="22" y1="24" x2="31" y2="24" stroke="#64748b" strokeWidth="1" />
            <text x="14" y="31" fontSize="4.5" fontWeight="900" fill="#0369a1">PAN</text>
            {/* Aadhaar card overlapping */}
            <rect x="26" y="28" width="26" height="16" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="26" y="28" width="26" height="3" fill="#ea580c" />
            <rect x="26" y="31" width="26" height="3" fill="#ffffff" />
            <rect x="26" y="34" width="26" height="3" fill="#16a34a" />
            <circle cx="46" cy="37" r="3" fill="#dc2626" />
            {/* Magnifying Glass */}
            <circle cx="43" cy="23" r="6" stroke="#ffffff" strokeWidth="2.2" fill="none" />
            <line x1="48" y1="27" x2="54" y2="33" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'laptop-bio':
      return (
        <div className={`${className} rounded-full bg-purple-500 flex items-center justify-center p-1 shadow-sm`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#a855f7" />
            {/* Laptop */}
            <rect x="15" y="18" width="26" height="18" rx="2" fill="#ffffff" />
            <path d="M11 36h34l-3 4H14z" fill="#f3e8ff" />
            {/* Fingerprint biometric scan on screen */}
            <circle cx="28" cy="27" r="5" stroke="#7e22ce" strokeWidth="1.2" fill="none" />
            <path d="M25 27a3 3 0 0 1 6 0" stroke="#7e22ce" strokeWidth="1.2" />
            <path d="M26 29a2 2 0 0 0 4 0" stroke="#7e22ce" strokeWidth="1.2" />
            {/* Phone on right */}
            <rect x="42" y="22" width="10" height="18" rx="2" fill="#ffffff" stroke="#7e22ce" strokeWidth="0.8" />
            <circle cx="47" cy="37" r="1" fill="#7e22ce" />
          </svg>
        </div>
      );

    case 'aadhaar-doc':
      return (
        <div className={`${className} rounded-full bg-amber-50 flex items-center justify-center p-1.5 shadow-xs border border-amber-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Authentic UIDAI Letter Folded */}
            <rect x="16" y="12" width="32" height="40" rx="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="16" y="12" width="32" height="4" fill="#ea580c" />
            <rect x="16" y="16" width="32" height="4" fill="#ffffff" />
            <rect x="16" y="20" width="32" height="4" fill="#16a34a" />
            {/* UIDAI Sun */}
            <circle cx="32" cy="29" r="4.5" fill="#dc2626" />
            <circle cx="32" cy="29" r="6" stroke="#f59e0b" strokeWidth="1" strokeDasharray="1.5 1.5" />
            <line x1="20" y1="38" x2="44" y2="38" stroke="#475569" strokeWidth="1.5" />
            <line x1="20" y1="42" x2="38" y2="42" stroke="#64748b" strokeWidth="1.2" />
            <rect x="20" y="46" width="24" height="3" fill="#fee2e2" rx="0.5" />
          </svg>
        </div>
      );

    case 'aadhaar-sun':
      return (
        <div className={`${className} rounded-full bg-red-50 flex items-center justify-center p-1 shadow-xs border border-red-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* The Official Indian UIDAI Aadhaar Red Sun with Fingerprint & Rays */}
            <circle cx="32" cy="26" r="10" fill="#dc2626" />
            {/* Golden Sun Flame Rays */}
            <path d="M32 10l2 4-2 1-2-1z" fill="#f59e0b" />
            <path d="M42 14l-1 4-2-1 1-2z" fill="#f59e0b" />
            <path d="M46 22l-4 1-1-2 2-1z" fill="#f59e0b" />
            <path d="M22 14l1 4 2-1-1-2z" fill="#f59e0b" />
            <path d="M18 22l4 1 1-2-2-1z" fill="#f59e0b" />
            {/* Fingerprint ridges inside red sun */}
            <path d="M28 26c0-2.5 1.8-4 4-4s4 1.5 4 4" stroke="#ffffff" strokeWidth="1.2" fill="none" />
            <path d="M26 26c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="#ffffff" strokeWidth="1.2" fill="none" />
            <path d="M30 26a2 2 0 0 1 4 0" stroke="#ffffff" strokeWidth="1.2" fill="none" />
            {/* UIDAI text */}
            <text x="14" y="47" fontSize="8" fontWeight="900" fill="#dc2626" fontFamily="Calibri, sans-serif" letterSpacing="0.5">
              AADHAAR
            </text>
          </svg>
        </div>
      );

    case 'know-aadhaar':
      return (
        <div className={`${className} rounded-full bg-orange-50 flex items-center justify-center p-1 shadow-xs border border-orange-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Notched sun emblem */}
            <circle cx="32" cy="32" r="26" fill="#f97316" />
            <circle cx="32" cy="32" r="15" fill="#ffffff" />
            <text x="19" y="34" fontSize="5.5" fontWeight="900" fill="#ea580c" fontFamily="Calibri, sans-serif">
              E AADHAR
            </text>
          </svg>
        </div>
      );

    case 'bank-aadhaar':
      return (
        <div className={`${className} rounded-full bg-sky-50 flex items-center justify-center p-1.5 shadow-xs border border-sky-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Aadhaar card on left */}
            <rect x="10" y="20" width="22" height="15" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="15" cy="27" r="3" fill="#dc2626" />
            {/* Bank on right */}
            <path d="M36 34l12-8 12 8v3H36z" fill="#0284c7" />
            <rect x="39" y="38" width="3" height="10" fill="#0284c7" />
            <rect x="46" y="38" width="3" height="10" fill="#0284c7" />
            <rect x="53" y="38" width="3" height="10" fill="#0284c7" />
            <rect x="36" y="48" width="24" height="3" fill="#0284c7" />
            {/* Checkmark in circle */}
            <circle cx="32" cy="27" r="7" fill="#16a34a" />
            <path d="M29 27l2 2 4-4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'bank-check':
      return (
        <div className={`${className} rounded-full bg-emerald-50 flex items-center justify-center p-1.5 shadow-xs border border-emerald-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Bank columns with Aadhaar linking badge */}
            <path d="M20 28l12-8 12 8v3H20z" fill="#047857" />
            <rect x="23" y="32" width="3" height="12" fill="#047857" />
            <rect x="30" y="32" width="3" height="12" fill="#047857" />
            <rect x="37" y="32" width="3" height="12" fill="#047857" />
            <rect x="18" y="44" width="28" height="3" fill="#047857" />
            {/* Green linking ring */}
            <circle cx="44" cy="24" r="8" fill="#10b981" />
            <path d="M41 24l2 2 4-4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 3. CAN & CERTIFICATES
    case 'can-user':
      return (
        <div className={`${className} rounded-full bg-emerald-100 flex items-center justify-center p-1.5 shadow-xs border border-emerald-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="28" cy="24" r="9" fill="#059669" />
            <path d="M12 48c0-7 7-11 16-11s16 4 16 11" fill="#047857" />
            {/* Plus badge */}
            <circle cx="46" cy="38" r="9" fill="#15803d" stroke="#ffffff" strokeWidth="2" />
            <line x1="46" y1="33" x2="46" y2="43" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="41" y1="38" x2="51" y2="38" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'birth':
    case 'death':
      return (
        <div className={`${className} rounded-full bg-indigo-50 flex items-center justify-center p-1.5 shadow-xs border border-indigo-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="16" y="12" width="32" height="40" rx="3" fill="#ffffff" stroke="#4f46e5" strokeWidth="1.8" />
            <rect x="16" y="12" width="32" height="6" fill="#4f46e5" />
            <line x1="22" y1="24" x2="42" y2="24" stroke="#6366f1" strokeWidth="2" />
            <line x1="22" y1="30" x2="38" y2="30" stroke="#cbd5e1" strokeWidth="1.8" />
            <line x1="22" y1="35" x2="35" y2="35" stroke="#cbd5e1" strokeWidth="1.8" />
            {/* Stamp seal */}
            <circle cx="38" cy="42" r="5" fill="#4338ca" />
            <path d="M36 42l1.5 1.5 3-3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 4. VOTER SERVICES LOGOS
    case 'voter-check':
      return (
        <div className={`${className} rounded-full bg-emerald-600 flex items-center justify-center p-1 shadow-sm`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#047857" stroke="#ffffff" strokeWidth="2" />
            <text x="18" y="24" fontSize="8" fontWeight="900" fill="#a7f3d0" fontFamily="Calibri, sans-serif">
              ONLINE
            </text>
            <text x="20" y="44" fontSize="9.5" fontWeight="900" fill="#ffffff" fontFamily="Calibri, sans-serif">
              voter
            </text>
            <path d="M23 32l6 6 13-13" stroke="#34d399" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'voter-vote':
      return (
        <div className={`${className} rounded-full bg-slate-900 flex items-center justify-center p-1 shadow-sm border border-sky-400`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
            {/* EVM button with red vote light */}
            <circle cx="32" cy="24" r="7" fill="#ef4444" />
            {/* Hand pointing to press */}
            <path d="M32 29v14l-4-4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <text x="21" y="52" fontSize="9" fontWeight="900" fill="#38bdf8" fontFamily="Calibri, sans-serif">
              voter
            </text>
          </svg>
        </div>
      );

    // 5. PAN & MSME SERVICES LOGOS
    case 'e-pan':
      return (
        <div className={`${className} rounded-full bg-blue-600 flex items-center justify-center p-1 shadow-sm`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#0284c7" />
            <text x="16" y="25" fontSize="9" fontWeight="900" fill="#ffffff" fontFamily="Calibri, sans-serif">
              E-PAN
            </text>
            <circle cx="32" cy="36" r="6" fill="#ffffff" />
            <path d="M23 50c0-5 4-8 9-8s9 3 9 8" fill="#ffffff" />
          </svg>
        </div>
      );

    case 'pan-hand':
      return (
        <div className={`${className} rounded-full bg-teal-600 flex items-center justify-center p-1 shadow-sm`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="28" fill="#0f766e" />
            <rect x="17" y="19" width="32" height="22" rx="3" fill="#67e8f9" stroke="#ffffff" strokeWidth="1" />
            <text x="20" y="32" fontSize="8" fontWeight="900" fill="#0e7490" fontFamily="Calibri, sans-serif">
              PAN
            </text>
            <circle cx="42" cy="27" r="3.5" fill="#f59e0b" />
            {/* Hand holding card */}
            <path d="M12 44l12-9 6 6" stroke="#fbcfe8" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'msme-doc':
      return (
        <div className={`${className} rounded-full bg-sky-100 flex items-center justify-center p-1.5 shadow-xs border border-sky-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="16" y="14" width="32" height="38" rx="2" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="16" y="14" width="32" height="8" fill="#0369a1" />
            <text x="18" y="20" fontSize="5" fontWeight="900" fill="#ffffff" fontFamily="Calibri, sans-serif">
              MSME UDYAM
            </text>
            <line x1="20" y1="28" x2="44" y2="28" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="20" y1="34" x2="40" y2="34" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="32" cy="42" r="4" fill="#f59e0b" />
          </svg>
        </div>
      );

    case 'aeps':
      return (
        <div className={`${className} rounded-full bg-white flex items-center justify-center p-1 shadow-xs border border-slate-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <text x="14" y="24" fontSize="11" fontWeight="900" fill="#1e293b" fontFamily="Calibri, sans-serif">
              A PS
            </text>
            <path d="M22 20l4-4M30 16l3 3" stroke="#ea580c" strokeWidth="2" />
            {/* Biometric circles */}
            <circle cx="32" cy="38" r="9" stroke="#16a34a" strokeWidth="1.8" strokeDasharray="3 2" />
            <circle cx="32" cy="38" r="4.5" fill="#ea580c" />
          </svg>
        </div>
      );

    case 'udid':
      return (
        <div className={`${className} rounded-full bg-teal-50 flex items-center justify-center p-1.5 shadow-xs border border-teal-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="26" stroke="#0f766e" strokeWidth="2" />
            <circle cx="32" cy="22" r="4" fill="#0f766e" />
            {/* Wheelchair sign */}
            <path d="M32 26v8h7M32 34l-5 7h8" stroke="#0f766e" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="32" cy="38" r="6" stroke="#0f766e" strokeWidth="1.5" fill="none" />
            <text x="21" y="53" fontSize="7.5" fontWeight="900" fill="#047857" fontFamily="Calibri, sans-serif">
              UDID
            </text>
          </svg>
        </div>
      );

    // 6. PVC CARD & PHOTO LOGOS
    case 'pvc-deliver':
      return (
        <div className={`${className} rounded-full bg-rose-50 flex items-center justify-center p-1.5 shadow-xs border border-rose-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="12" y="16" width="40" height="28" rx="4" fill="#f43f5e" />
            <rect x="16" y="22" width="10" height="12" rx="2" fill="#ffffff" />
            <circle cx="21" cy="27" r="3" fill="#e11d48" />
            <line x1="30" y1="24" x2="46" y2="24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="30" x2="42" y2="30" stroke="#fecdd3" strokeWidth="2" strokeLinecap="round" />
            <path d="M44 14l2 3 3 1-3 1-2 3-1-3-3-1 3-1z" fill="#facc15" />
          </svg>
        </div>
      );

    case 'pvc-badge':
      return (
        <div className={`${className} rounded-full bg-amber-50 flex items-center justify-center p-1.5 shadow-xs border border-amber-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <path d="M26 10l6 10 6-10" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <rect x="20" y="20" width="24" height="32" rx="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            <rect x="28" y="22" width="8" height="2" rx="1" fill="#713f12" />
            <circle cx="32" cy="32" r="5" fill="#0284c7" />
            <path d="M26 44c0-3 3-5 6-5s6 2 6 5" fill="#0284c7" />
          </svg>
        </div>
      );

    case 'photo-maker':
      return (
        <div className={`${className} rounded-full bg-amber-100 flex items-center justify-center p-1.5 shadow-xs`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="23" r="8" fill="#d97706" />
            <path d="M20 44c0-6 5.5-10 12-10s12 4 12 10" fill="#b45309" />
            <rect x="16" y="44" width="32" height="12" fill="#f59e0b" rx="2" />
            <rect x="20" y="48" width="4" height="4" fill="#ef4444" />
            <rect x="26" y="48" width="4" height="4" fill="#3b82f6" />
            <rect x="32" y="48" width="4" height="4" fill="#22c55e" />
            <rect x="38" y="48" width="4" height="4" fill="#eab308" />
          </svg>
        </div>
      );

    case 'stamp-maker':
      return (
        <div className={`${className} rounded-full bg-blue-100 flex items-center justify-center p-1.5 shadow-xs`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="14" y="16" width="16" height="20" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1" />
            <circle cx="22" cy="23" r="3" fill="#3b82f6" />
            <rect x="34" y="16" width="16" height="20" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1" />
            <circle cx="42" cy="23" r="3" fill="#3b82f6" />
            <rect x="14" y="38" width="14" height="14" rx="1" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
            <rect x="30" y="38" width="14" height="14" rx="1" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
            <rect x="46" y="38" width="12" height="14" rx="1" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
          </svg>
        </div>
      );

    // 7. OTHER SERVICES (CIBIL, AGRI, MOBILE)
    case 'cibil':
      return (
        <div className={`${className} rounded-full bg-pink-50 flex items-center justify-center p-1.5 shadow-xs border border-pink-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <text x="18" y="16" fontSize="8" fontWeight="900" fill="#0284c7" fontFamily="Calibri, sans-serif">
              cibil
            </text>
            <circle cx="30" cy="32" r="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
            <path d="M24 36c0-4 3-6 6-6s6 2 6 6" fill="#0284c7" />
            <circle cx="30" cy="26" r="3.5" fill="#0284c7" />
            <circle cx="38" cy="38" r="8" stroke="#ec4899" strokeWidth="2.5" fill="#fdf2f8" fillOpacity="0.5" />
            <line x1="44" y1="44" x2="52" y2="52" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'agri-stack':
      return (
        <div className={`${className} rounded-full bg-lime-50 flex items-center justify-center p-1.5 shadow-xs border border-lime-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <text x="13" y="36" fontSize="12" fontWeight="900" fill="#65a30d" fontFamily="Calibri, sans-serif">
              Agri
            </text>
            <text x="36" y="36" fontSize="12" fontWeight="900" fill="#15803d" fontFamily="Calibri, sans-serif">
              Stack
            </text>
            <path d="M38 18c0 4-4 6-4 6s-4-2-4-6a4 4 0 018 0z" fill="#84cc16" />
          </svg>
        </div>
      );

    case 'agri-record':
      return (
        <div className={`${className} rounded-full bg-emerald-100 flex items-center justify-center p-1.5 shadow-xs border border-emerald-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="26" stroke="#059669" strokeWidth="2" strokeDasharray="3 2" />
            <rect x="18" y="18" width="28" height="28" rx="3" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="25" cy="26" r="3" fill="#059669" />
            <path d="M31 24h10M31 29h8M22 36h20" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M32 10l3 5h-6z" fill="#10b981" />
          </svg>
        </div>
      );

    case 'mobile-details':
      return (
        <div className={`${className} rounded-full bg-sky-50 flex items-center justify-center p-1.5 shadow-xs border border-sky-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="18" y="12" width="28" height="42" rx="4" fill="#0284c7" />
            <rect x="20" y="16" width="24" height="32" fill="#ffffff" />
            <circle cx="32" cy="26" r="4.5" fill="#f59e0b" />
            <path d="M25 36c0-3 3.5-5 7-5s7 2 7 5" fill="#f59e0b" />
            <line x1="24" y1="40" x2="40" y2="40" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="32" cy="51" r="1.5" fill="#ffffff" />
          </svg>
        </div>
      );

    // 8. DRIVING SERVICES LOGOS (LAST)
    case 'dl':
      return (
        <div className={`${className} rounded-full bg-cyan-100 flex items-center justify-center p-2 shadow-xs border border-cyan-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="8" y="14" width="48" height="36" rx="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
            <rect x="14" y="20" width="12" height="15" rx="3" fill="#ffffff" />
            <circle cx="20" cy="25" r="4" fill="#0284c7" />
            <path d="M15 33c0-2.5 2.5-4 5-4s5 1.5 5 4" fill="#0284c7" />
            <line x1="30" y1="22" x2="48" y2="22" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="30" y1="28" x2="45" y2="28" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="34" x2="42" y2="34" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
            <rect x="14" y="39" width="36" height="5" rx="1.5" fill="#0369a1" />
          </svg>
        </div>
      );

    case 'phone-dl':
      return (
        <div className={`${className} rounded-full bg-sky-100 flex items-center justify-center p-1.5 shadow-xs border border-sky-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="12" y="10" width="18" height="38" rx="3" fill="#1e293b" />
            <rect x="14" y="14" width="14" height="30" fill="#38bdf8" />
            <circle cx="21" cy="46" r="1.5" fill="#94a3b8" />
            <rect x="34" y="10" width="18" height="38" rx="3" fill="#1e293b" />
            <rect x="36" y="14" width="14" height="30" fill="#60a5fa" />
            <circle cx="43" cy="46" r="1.5" fill="#94a3b8" />
            <line x1="16" y1="20" x2="26" y2="20" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="38" y1="20" x2="48" y2="20" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'link-mobile':
      return (
        <div className={`${className} rounded-full bg-slate-100 flex items-center justify-center p-2 shadow-xs border border-slate-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="10" y="16" width="18" height="32" rx="3" fill="#64748b" />
            <rect x="12" y="20" width="14" height="23" fill="#e2e8f0" />
            <path d="M16 28h6" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="34" y="16" width="22" height="16" rx="2" fill="#3b82f6" />
            <rect x="37" y="19" width="5" height="5" fill="#ffffff" />
            <line x1="44" y1="20" x2="52" y2="20" stroke="#ffffff" strokeWidth="1" />
            <path d="M26 32c4-4 8-4 12 0" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M26 34c4 4 8 4 12 0" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'find-card':
      return (
        <div className={`${className} rounded-full bg-purple-50 flex items-center justify-center p-2 shadow-xs border border-red-200`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="10" y="16" width="44" height="30" rx="3" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="14" y="20" width="10" height="12" fill="#cbd5e1" />
            <line x1="28" y1="22" x2="48" y2="22" stroke="#64748b" strokeWidth="1.5" />
            <line x1="28" y1="27" x2="42" y2="27" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="32" cy="31" r="13" fill="#ef4444" fillOpacity="0.1" />
            <text x="26" y="38" fontSize="22" fontWeight="900" fill="#dc2626" fontFamily="Calibri, sans-serif">?</text>
          </svg>
        </div>
      );

    // 9. VEHICLE SERVICES LOGOS (LAST)
    case 'rc-cards':
      return (
        <div className={`${className} rounded-full bg-amber-50 flex items-center justify-center p-1.5 shadow-xs border border-amber-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="8" y="16" width="34" height="22" rx="3" fill="#fed7aa" stroke="#f97316" strokeWidth="1" />
            <rect x="12" y="20" width="8" height="8" rx="1" fill="#ea580c" />
            <line x1="23" y1="21" x2="38" y2="21" stroke="#9a3412" strokeWidth="1.5" />
            <rect x="22" y="26" width="34" height="22" rx="3" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="26" y="30" width="8" height="8" rx="1" fill="#f97316" />
            <line x1="37" y1="31" x2="52" y2="31" stroke="#9a3412" strokeWidth="1.5" />
            <line x1="37" y1="36" x2="48" y2="36" stroke="#c2410c" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'insurance':
      return (
        <div className={`${className} rounded-full bg-teal-50 flex items-center justify-center p-1.5 shadow-xs border border-teal-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="18" y="10" width="28" height="38" rx="2" fill="#ffffff" stroke="#0d9488" strokeWidth="1.5" />
            <line x1="23" y1="18" x2="39" y2="18" stroke="#0f766e" strokeWidth="2" />
            <line x1="23" y1="23" x2="41" y2="23" stroke="#99f6e4" strokeWidth="1.5" />
            <line x1="23" y1="28" x2="37" y2="28" stroke="#99f6e4" strokeWidth="1.5" />
            <rect x="14" y="38" width="22" height="12" rx="2" fill="#14b8a6" />
            <circle cx="19" cy="50" r="3" fill="#0f172a" />
            <circle cx="31" cy="50" r="3" fill="#0f172a" />
          </svg>
        </div>
      );

    case 'pollution':
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-2 shadow-xs`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="24" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M22 36l3-6h14l3 6v6h-3v-2h-14v2h-3v-6z" fill="#ffffff" />
            <circle cx="26" cy="42" r="2.5" fill="#f97316" />
            <circle cx="38" cy="42" r="2.5" fill="#f97316" />
            <line x1="16" y1="16" x2="48" y2="48" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'bike-car':
      return (
        <div className={`${className} rounded-full bg-rose-50 flex items-center justify-center p-1.5 shadow-xs border border-rose-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <circle cx="32" cy="32" r="26" stroke="#e11d48" strokeWidth="2" />
            <circle cx="24" cy="22" r="4" stroke="#e11d48" strokeWidth="1.5" />
            <circle cx="40" cy="22" r="4" stroke="#e11d48" strokeWidth="1.5" />
            <path d="M24 22l6-4h4l4 4" stroke="#e11d48" strokeWidth="1.5" />
            <path d="M20 40l3-6h18l3 6v8h-3v-2h-18v2h-3v-8z" fill="#e11d48" />
            <circle cx="25" cy="46" r="2.5" fill="#ffffff" />
            <circle cx="39" cy="46" r="2.5" fill="#ffffff" />
          </svg>
        </div>
      );

    case 'phone-rc':
      return (
        <div className={`${className} rounded-full bg-amber-100 flex items-center justify-center p-2 shadow-xs border border-amber-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="10" y="16" width="16" height="32" rx="3" fill="#d97706" />
            <text x="11" y="32" fontSize="7" fontWeight="bold" fill="#ffffff" fontFamily="Calibri, sans-serif">+91</text>
            <rect x="36" y="20" width="20" height="24" rx="2" fill="#f59e0b" />
            <text x="39" y="34" fontSize="8" fontWeight="bold" fill="#ffffff" fontFamily="Calibri, sans-serif">RC</text>
            <path d="M26 30c5-3 6-3 10 0" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M26 34c5 3 6 3 10 0" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'challan':
      return (
        <div className={`${className} rounded-full bg-emerald-50 flex items-center justify-center p-1.5 shadow-xs border border-emerald-300`}>
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="14" y="12" width="10" height="24" rx="3" fill="#1e293b" />
            <circle cx="19" cy="17" r="2" fill="#ef4444" />
            <circle cx="19" cy="24" r="2" fill="#eab308" />
            <circle cx="19" cy="31" r="2" fill="#22c55e" />
            <line x1="19" y1="36" x2="19" y2="48" stroke="#475569" strokeWidth="2" />
            <path d="M28 34l3-6h16l3 6v8h-3v-2h-16v2h-3v-8z" fill="#ef4444" />
            <circle cx="34" cy="40" r="2.5" fill="#ffffff" />
            <circle cx="44" cy="40" r="2.5" fill="#ffffff" />
          </svg>
        </div>
      );

    default:
      return (
        <div className={`${className} rounded-full bg-emerald-100 flex items-center justify-center p-2 shadow-inner text-emerald-700 font-bold`}>
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="7" y1="8" x2="17" y2="8" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="7" y1="16" x2="13" y2="16" />
          </svg>
        </div>
      );
  }
};
