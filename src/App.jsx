import React, { useEffect } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Toast } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Institutional & Patient Portal Views
import { Navbar } from './components/institutional/Navbar';
import { InstitutionalHome } from './components/institutional/InstitutionalHome';
import { ServicesPage } from './components/institutional/ServicesPage';
import { InsurancesPage } from './components/institutional/InsurancesPage';
import { DoctorsPage } from './components/institutional/DoctorsPage';
import { Footer } from './components/institutional/Footer';
import { AppointmentBookingWizard } from './components/booking/AppointmentBookingWizard';
import { PatientPortalView } from './components/portal/PatientPortalView';

// Administration Views
import { AdminLoginView } from './components/auth/AdminLoginView';
import { AdminManagementHub } from './components/admin/AdminManagementHub';

// Environment & Cloud Diagnostics (Audit B-04)
import { supabaseConfigDiagnostics } from './lib/supabaseClient';
import { EnvConfigErrorScreen } from './components/common/EnvConfigErrorScreen';

import './App.css';

/**
 * Hook global ultra-optimizado que bloquea el scroll de fondo en absolutamente toda la web
 * siempre que exista cualquier ventana emergente, modal o popup abierto, sin bucles de mutación.
 */
const useGlobalModalScrollLock = () => {
  useEffect(() => {
    let isUpdating = false;

    const checkAndLockScroll = () => {
      if (isUpdating) return;
      isUpdating = true;

      try {
        const hasModalOpen = !!document.querySelector(
          '.modal-overlay, .prescription-modal-overlay, .legal-hce-overlay, .consultation-print-overlay, [role="dialog"], [aria-modal="true"]'
        );

        const isCurrentlyLocked = document.body.classList.contains('modal-open');

        if (hasModalOpen && !isCurrentlyLocked) {
          document.body.classList.add('modal-open');
          document.documentElement.classList.add('modal-open');
        } else if (!hasModalOpen && isCurrentlyLocked) {
          document.body.classList.remove('modal-open');
          document.documentElement.classList.remove('modal-open');
        }
      } finally {
        isUpdating = false;
      }
    };

    checkAndLockScroll();

    let rafId = null;
    const observer = new MutationObserver((mutations) => {
      // Ignorar mutaciones en el body o html para evitar bucles infinitos
      const hasForeignMutation = mutations.some(
        (m) => m.target !== document.body && m.target !== document.documentElement
      );
      if (!hasForeignMutation) return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        checkAndLockScroll();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    const handlePreventBackdropScroll = (e) => {
      if (document.body.classList.contains('modal-open')) {
        const target = e.target;
        if (target && target.classList && target.classList.contains('modal-overlay')) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', handlePreventBackdropScroll, { passive: false });
    window.addEventListener('touchmove', handlePreventBackdropScroll, { passive: false });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('wheel', handlePreventBackdropScroll);
      window.removeEventListener('touchmove', handlePreventBackdropScroll);
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, []);
};

const MainLayout = () => {
  useGlobalModalScrollLock();
  const { currentView } = useClinic();
  const [devBypass, setDevBypass] = React.useState(false);

  // Fallo explícito de arranque si faltan variables de entorno (Auditoría B-04)
  if (!supabaseConfigDiagnostics.isConfigured && (!import.meta.env.DEV || !devBypass)) {
    return (
      <EnvConfigErrorScreen
        diagnostics={supabaseConfigDiagnostics}
        onBypass={() => setDevBypass(true)}
      />
    );
  }

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
              <PatientPortalView />
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
      {!supabaseConfigDiagnostics.isConfigured && (
        <div style={{ background: '#FEF3C7', color: '#92400E', padding: '0.45rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800, borderBottom: '1px solid #FDE68A' }}>
          ⚠️ AVISO MODO DESARROLLO (B-04): Persistencia cloud no configurada en .env. El sistema opera en sandbox local volátil.
        </div>
      )}
      {renderCurrentView()}

      {/* Global Notifications */}
      <Toast />
    </div>
  );
};
export default function App() {
  return (
    <ErrorBoundary>
      <ClinicProvider>
        <MainLayout />
      </ClinicProvider>
    </ErrorBoundary>
  );
}
