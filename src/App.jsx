import React from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Toast } from './components/common/Toast';

// Institutional & Patient Portal Views
import { Navbar } from './components/institutional/Navbar';
import { InstitutionalHome } from './components/institutional/InstitutionalHome';
import { ServicesPage } from './components/institutional/ServicesPage';
import { InsurancesPage } from './components/institutional/InsurancesPage';
import { DoctorsPage } from './components/institutional/DoctorsPage';
import { ClinicPage } from './components/institutional/ClinicPage';
import { Footer } from './components/institutional/Footer';
import { AppointmentBookingWizard } from './components/booking/AppointmentBookingWizard';
import { PatientUnifiedPortal } from './components/portal/PatientUnifiedPortal';
import { UserAuthModal } from './components/auth/UserAuthModal';

// Administration Views
import { AdminLoginView } from './components/auth/AdminLoginView';
import { AdminManagementHub } from './components/admin/AdminManagementHub';

import './App.css';

const MainLayout = () => {
  const { currentView } = useClinic();

  // Render by currentView
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <InstitutionalHome />
            </main>
            <Footer />
          </div>
        );

      case 'services':
        return (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <ServicesPage />
            </main>
            <Footer />
          </div>
        );

      case 'doctors':
        return (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <DoctorsPage />
            </main>
            <Footer />
          </div>
        );

      case 'clinic':
        return (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <ClinicPage />
            </main>
            <Footer />
          </div>
        );

      case 'insurances':
        return (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <InsurancesPage />
            </main>
            <Footer />
          </div>
        );

      case 'booking':
        return (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <AppointmentBookingWizard />
            </main>
            <Footer />
          </div>
        );

      case 'my-turnos':
      case 'patient-portal':
      case 'portal':
        return (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <PatientUnifiedPortal />
            </main>
            <Footer />
          </div>
        );

      case 'admin-login':
        return <AdminLoginView />;

      case 'admin-panel':
        return <AdminManagementHub />;

      default:
        return (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <InstitutionalHome />
            </main>
            <Footer />
          </div>
        );
    }
  };

  return (
    <div className="citra-platform" style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      {renderCurrentView()}

      {/* Global Modals & Notifications */}
      <UserAuthModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainLayout />
    </ClinicProvider>
  );
}
