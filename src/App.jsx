import React from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { Toast } from './components/common/Toast';

// Core & Clinical Views
import { DashboardView } from './components/dashboard/DashboardView';
import { AgendaView } from './components/agenda/AgendaView';
import { PatientsView } from './components/patients/PatientsView';
import { ClinicalRecordsView } from './components/clinical/ClinicalRecordsView';
import { KinesiologyView } from './components/kinesio/KinesiologyView';
import { ImagingView } from './components/imaging/ImagingView';
import { InsurancesView } from './components/insurances/InsurancesView';
import { InventoryView } from './components/inventory/InventoryView';
import { CommunicationsView } from './components/communications/CommunicationsView';
import { DoctorsView } from './components/doctors/DoctorsView';
import { BillingView } from './components/billing/BillingView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

// Argentine Health & Legal Compliance Views
import { AuditLogsView } from './components/audit/AuditLogsView';
import { BackupAndSecurityView } from './components/security/BackupAndSecurityView';
import { IntegrationsHubView } from './components/integrations/IntegrationsHubView';
import { PatientPortalView } from './components/portal/PatientPortalView';

// Global Modals
import { AppointmentModal } from './components/agenda/AppointmentModal';
import { BlockTimeModal } from './components/agenda/BlockTimeModal';
import { PatientFormModal } from './components/patients/PatientFormModal';
import { PatientDetailModal } from './components/patients/PatientDetailModal';
import { NewConsultationModal } from './components/clinical/NewConsultationModal';
import { ConsultationPrintView } from './components/clinical/ConsultationPrintView';
import { ClinicalAdendaModal } from './components/clinical/ClinicalAdendaModal';
import { PrescriptionDigitalModal } from './components/clinical/PrescriptionDigitalModal';
import { ConsentFormsModal } from './components/clinical/ConsentFormsModal';
import { MedicalOrderModal } from './components/clinical/MedicalOrderModal';
import { MedicalCertificateModal } from './components/clinical/MedicalCertificateModal';
import { DigitalSignatureModal } from './components/pki/DigitalSignatureModal';
import { ArcaInvoiceModal } from './components/billing/ArcaInvoiceModal';
import { DoctorModal } from './components/doctors/DoctorModal';
import { PaymentModal } from './components/billing/PaymentModal';
import { NewRehabPlanModal } from './components/kinesio/NewRehabPlanModal';
import { NewRehabSessionModal } from './components/kinesio/NewRehabSessionModal';
import { NewImagingStudyModal } from './components/imaging/NewImagingStudyModal';
import { OnlineAuthModal } from './components/insurances/OnlineAuthModal';
import { NewPurchaseOrderModal } from './components/inventory/NewPurchaseOrderModal';

import './App.css';

const MainLayout = () => {
  const { activeTab, isPatientPortalMode } = useClinic();

  if (isPatientPortalMode) {
    return (
      <div className="app-container" style={{ display: 'block', background: 'var(--bg-app)', minHeight: '100vh', padding: '2rem' }}>
        <PatientPortalView />
        <Toast />
        <GlobalSearchModal />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'agenda':
        return <AgendaView />;
      case 'patients':
        return <PatientsView />;
      case 'clinical':
        return <ClinicalRecordsView />;
      case 'kinesio':
        return <KinesiologyView />;
      case 'imaging':
        return <ImagingView />;
      case 'insurances':
        return <InsurancesView />;
      case 'inventory':
        return <InventoryView />;
      case 'communications':
        return <CommunicationsView />;
      case 'doctors':
        return <DoctorsView />;
      case 'billing':
        return <BillingView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditLogsView />;
      case 'security':
        return <BackupAndSecurityView />;
      case 'integrations':
        return <IntegrationsHubView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar with Teal Medical Palette */}
      <Sidebar />

      {/* Main Content Shell */}
      <div className="main-wrapper">
        <Topbar />
        <main className="content-area">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <GlobalSearchModal />
      <Toast />
      <AppointmentModal />
      <BlockTimeModal />
      <PatientFormModal />
      <PatientDetailModal />
      <NewConsultationModal />
      <ConsultationPrintView />
      <ClinicalAdendaModal />
      <PrescriptionDigitalModal />
      <ConsentFormsModal />
      <MedicalOrderModal />
      <MedicalCertificateModal />
      <DigitalSignatureModal />
      <ArcaInvoiceModal />
      <DoctorModal />
      <PaymentModal />
      <NewRehabPlanModal />
      <NewRehabSessionModal />
      <NewImagingStudyModal />
      <OnlineAuthModal />
      <NewPurchaseOrderModal />
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
