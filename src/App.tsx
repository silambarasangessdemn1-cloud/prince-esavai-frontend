import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AadhaarIssueForm } from './components/forms/AadhaarIssueForm';
import { AadhaarCorrectionsView } from './components/AadhaarCorrectionsView';
import { PanServicesView } from './components/PanServicesView';
import { VoterServicesView } from './components/VoterServicesView';
import { RationServicesView } from './components/RationServicesView';
import { DrivingServicesView } from './components/DrivingServicesView';
import { VehicleServicesView } from './components/VehicleServicesView';
import { FarmerServicesView } from './components/FarmerServicesView';
import { AdminPortalView } from './components/AdminPortalView';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminPortalWrapper } from './components/AdminPortalWrapper';
import { CANRegistrationForm } from './components/forms/CANRegistrationForm';
import { RationFamilyHeadForm } from './components/forms/RationFamilyHeadForm';
import { RationMobileLinkForm } from './components/forms/RationMobileLinkForm';
import { RationQRForm } from './components/forms/RationQRForm';
import { BirthCertificateForm } from './components/forms/BirthCertificateForm';
import { DeathCertificateForm } from './components/forms/DeathCertificateForm';
import { SmartcardSearchForm } from './components/forms/SmartcardSearchForm';
import { PVCCardMaker } from './components/forms/PVCCardMaker';
import { VehicleRCForm } from './components/forms/VehicleRCForm';
import { GenericServiceForm } from './components/forms/GenericServiceForm';
import { ServiceHistoryView } from './components/ServiceHistoryView';
import { ProfileView } from './components/ProfileView';
import { WalletPassbookView } from './components/WalletPassbookView';
import { ChangePasswordView } from './components/ChangePasswordView';
import { WalletModal } from './components/WalletModal';
import { ReceiptModal } from './components/ReceiptModal';
import { CertificatePreviewModal } from './components/CertificatePreviewModal';
import { ArrowLeft, Home, ChevronRight, Loader2 } from 'lucide-react';
const DashboardContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedService,
    closeService,
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine which view to render
  const renderMainContent = () => {
    if (selectedService) {
      switch (selectedService.formType) {
        case 'can_registration':
          return <CANRegistrationForm />;
        case 'ration_family_head':
          return <RationFamilyHeadForm />;
        case 'ration_mobile_link':
          return <RationMobileLinkForm />;
        case 'ration_qr_code':
          return <RationQRForm />;
        case 'birth_certificate':
          return <BirthCertificateForm />;
        case 'death_certificate':
          return <DeathCertificateForm />;
        case 'smartcard_search':
          return <SmartcardSearchForm />;
        case 'pvc_maker':
          return <PVCCardMaker />;
        case 'vehicle_rc':
        case 'driving_license':
          return <VehicleRCForm />;
        case 'aadhaar_issue':
          return <AadhaarIssueForm />;
        default:
          return <GenericServiceForm service={selectedService} />;
      }
    }

    switch (activeTab) {
      case 'profile':
        return <ProfileView />;
      case 'service_history':
      case 'all_service_status':
        return <ServiceHistoryView />;
      case 'wallet_passbook':
        return <WalletPassbookView />;
      case 'change_password':
        return <ChangePasswordView />;
      case 'pvc_services':
        return <PVCCardMaker />;
      case 'admin_portal':
        return <AdminPortalView />;
      case 'aadhaar_corrections':
        return <AadhaarCorrectionsView />;
      case 'ration_services':
        return <RationServicesView />;
      case 'pan_services':
        return <PanServicesView />;
      case 'voter_services':
        return <VoterServicesView />;
      case 'driving_services':
        return <DrivingServicesView />;
      case 'vehicle_services':
        return <VehicleServicesView />;
      case 'farmer_services':
        return <FarmerServicesView />;
      case 'aadhaar_issues':
        return <AadhaarCorrectionsView />;
      case 'aadhaar_issue_form':
        return <AadhaarIssueForm />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Breadcrumb / Back Bar when a service is opened */}
          {selectedService && (
            <div className="mb-4 flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  onClick={() => {
                    closeService();
                    setActiveTab('dashboard');
                  }}
                  className="flex items-center gap-1 hover:text-slate-900 cursor-pointer font-medium"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-semibold text-slate-700">{selectedService.categoryLabel}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-bold text-emerald-800">{selectedService.name}</span>
              </div>

              <button
                onClick={closeService}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          )}

          {/* Render Active View */}
          {renderMainContent()}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <WalletModal />
      <ReceiptModal />
      <CertificatePreviewModal />
    </div>
  );
};

const checkIsAdminPath = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.pathname.startsWith('/admin') ||
    window.location.hash.startsWith('#/admin') ||
    window.location.search.includes('admin=true')
  );
};

/** Decides between Dedicated Admin Gateway, Citizen Auth screen, and Dashboard */
const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isAdminPath, setIsAdminPath] = useState(checkIsAdminPath);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('admin_token'));

  useEffect(() => {
    const onLocationChange = () => {
      setIsAdminPath(checkIsAdminPath());
      setAdminToken(localStorage.getItem('admin_token'));
    };
    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
  }, []);

  // ── SEPARATE ADMIN GATEWAY (/admin) ──
  if (isAdminPath) {
    if (!adminToken) {
      return (
        <AdminLoginPage
          onLoginSuccess={(token) => {
            setAdminToken(token);
          }}
          onBackToCitizenPortal={() => {
            window.history.pushState({}, '', '/');
            setIsAdminPath(false);
          }}
        />
      );
    }

    return (
      <AppProvider>
        <AdminPortalWrapper
          onLogout={() => {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            setAdminToken(null);
          }}
          onGoToCitizenPortal={() => {
            window.history.pushState({}, '', '/');
            setIsAdminPath(false);
          }}
        />
      </AppProvider>
    );
  }

  // ── CITIZEN PORTAL (/ or anything else) ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
