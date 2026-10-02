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
 * Hook global que bloquea el scroll de fondo en absolutamente toda la web
 * siempre que exista cualquier ventana emergente, modal o popup abierto.
 */
const useGlobalModalScrollLock = () => {
  useEffect(() => {
    const isModalElement = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const className = typeof el.className === 'string' ? el.className : '';
      if (
        className.includes('modal-overlay') ||
        className.includes('prescription-modal-overlay') ||
        className.includes('legal-hce-overlay') ||
        className.includes('consultation-print-overlay') ||
        el.getAttribute('role') === 'dialog' ||
        el.getAttribute('aria-modal') === 'true'
      ) {
        return true;
      }

      // Check inline styles of full-screen fixed modals
      const pos = el.style?.position;
      const zIndex = parseInt(el.style?.zIndex, 10);
      if (pos === 'fixed' && (zIndex >= 100 || el.style?.zIndex === '9999' || el.style?.zIndex === '99999')) {
        const inset = el.style?.inset;
        const top = el.style?.top;
        if (inset === '0' || inset === '0px' || top === '0' || top === '0px') {
          return true;
        }
      }
      return false;
    };

    const checkAndLockScroll = () => {
      const candidates = document.querySelectorAll(
        '.modal-overlay, .prescription-modal-overlay, .legal-hce-overlay, .consultation-print-overlay, [role="dialog"], [aria-modal="true"], div[style*="position: fixed"], div[style*="position:fixed"]'
      );

      let hasModalOpen = false;
      for (let i = 0; i < candidates.length; i++) {
        if (isModalElement(candidates[i])) {
          hasModalOpen = true;
          break;
        }
      }

      if (hasModalOpen) {
        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      } else {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.touchAction = '';
      }
    };

    checkAndLockScroll();

    const observer = new MutationObserver(() => {
      checkAndLockScroll();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'role', 'aria-modal']
    });

    const handlePreventBackdropScroll = (e) => {
      if (document.body.classList.contains('modal-open')) {
        const target = e.target;
        if (isModalElement(target)) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', handlePreventBackdropScroll, { passive: false });
    window.addEventListener('touchmove', handlePreventBackdropScroll, { passive: false });

    return () => {
      observer.disconnect();
      window.removeEventListener('wheel', handlePreventBackdropScroll);
      window.removeEventListener('touchmove', handlePreventBackdropScroll);
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
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
