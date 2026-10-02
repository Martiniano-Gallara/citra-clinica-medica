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

// Administration Views
import { AdminLoginView } from './components/auth/AdminLoginView';
import { AdminManagementHub } from './components/admin/AdminManagementHub';

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
      case 'my-turnos':
      case 'patient-portal':
      case 'portal':
        return (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <InstitutionalHome />
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
