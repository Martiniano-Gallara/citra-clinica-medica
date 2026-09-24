import React, { useState, useMemo, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import {
  Printer,
  FileText,
  X,
  QrCode,
  Download,
  CheckCircle2,
  Calendar,
  User
} from 'lucide-react';

export const LegalHceCertificateModal = ({ isOpen, onClose, targetPatient = null }) => {
  const {
    patients,
    consultations,
    currentDoctor,
    isDoctor
  } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState(
    targetPatient?.id || patients[0]?.id || ''
  );

  useEffect(() => {
    if (targetPatient?.id) {
      setSelectedPatientId(targetPatient.id);
    }
  }, [targetPatient]);

  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || targetPatient || patients[0];
  }, [patients, selectedPatientId, targetPatient]);

  const patientConsultations = useMemo(() => {
    if (!activePatient) return [];
    return consultations.filter(
      (c) => c.patientId === activePatient.id || c.patientDni === activePatient.dni
    );
  }, [consultations, activePatient]);

  const activeDoctorName = isDoctor && currentDoctor ? currentDoctor.name : (activePatient?.doctorName || 'Dr. Alejandro Blanco');
  const activeDoctorLicense = isDoctor && currentDoctor ? currentDoctor.license : 'M.P. 34.892 · M.N. 114.829';

  const currentDateStr = new Date().toISOString().split('T')[0];
  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dossierId = `HC-${activePatient?.dni || '000'}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Estimado/a ${activePatient.name}: Le compartimos el historial clínico oficial emitido en CITRA Clínica Médica.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay legal-hce-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Ocultar toda la interfaz de la aplicación, navegación y modales de fondo */
          aside, header, nav, footer,
          .admin-container, .admin-sidebar, .admin-sidebar-backdrop, .admin-topbar, .admin-header,
          .navbar, .toast-container, .no-print,
          .legal-hce-header, .legal-hce-controls, .legal-hce-footer,
          button, .btn {
            display: none !important;
          }
          .modal-overlay:not(.legal-hce-overlay) {
            display: none !important;
          }
          .legal-hce-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            z-index: 999999 !important;
            overflow: visible !important;
          }
          .legal-hce-modal {
            position: static !important;
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            width: 100% !important;
            max-height: none !important;
            height: auto !important;
            border-radius: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .legal-hce-sheet-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }
          .legal-hce-sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
            visibility: visible !important;
            display: block !important;
          }
          .legal-hce-sheet * {
            visibility: visible !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div
        className="modal-content legal-hce-modal"
        style={{
          width: '100%',
          maxWidth: '900px',
          background: '#f8fafc',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP HEADER */}
        <div
          className="legal-hce-header"
          style={{
            background: '#ffffff',
            padding: '1rem 1.75rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Historia Clínica Completa
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                Registro médico cronológico para impresión y descarga en PDF
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <WhatsAppIcon size={15} color="#25D366" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.48rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(7, 106, 188, 0.25)'
              }}
            >
              <Download size={15} />
              <span>Descargar PDF / Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTROLS (PATIENT SELECTOR) */}
        {!targetPatient && (
          <div
            className="legal-hce-controls"
            style={{
              background: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
              padding: '0.65rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexShrink: 0
            }}
          >
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              Seleccionar Paciente:
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 600,
                background: '#ffffff',
                color: '#0f172a',
                outline: 'none',
                minWidth: '280px'
              }}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — DNI {p.dni} ({p.insuranceName || 'Particular'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* PRINTABLE DOCUMENT BODY */}
        <div
          className="legal-hce-sheet-wrapper"
          style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}
        >
          <div
            className="legal-hce-sheet printable-area"
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '2.75rem 3rem',
              color: '#0f172a',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              maxWidth: '820px',
              margin: '0 auto',
              lineHeight: 1.5,
              fontSize: '0.88rem'
            }}
          >
            {/* INSTITUTIONAL HEADER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #0f172a',
                paddingBottom: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#002182', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  CITRA CLÍNICA MÉDICA
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '3px' }}>
                  Centro Integral de Traumatología & Especialidades Médicas
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  Av. San Martín 450 · Arroyito, Córdoba · Tel: (03576) 450-200 · www.citra.com.ar
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>
                  Historia Clínica Completa
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                  Fecha de Emisión: <strong>{currentDateStr}</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  N° Registro: <strong>{dossierId}</strong>
                </div>
              </div>
            </div>

            {/* PATIENT FILIATION */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                fontSize: '0.84rem'
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Filiación del Paciente
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                <div><strong>Paciente:</strong> {activePatient?.name}</div>
                <div><strong>DNI:</strong> {activePatient?.dni}</div>
                <div><strong>Fecha de Nacimiento:</strong> {activePatient?.birthDate || '-'}</div>
                <div><strong>Cobertura:</strong> {activePatient?.insuranceName || 'Particular'} {activePatient?.insurancePlan && `(${activePatient?.insurancePlan})`}</div>
                {activePatient?.insuranceNumber && <div><strong>N° Afiliado:</strong> {activePatient?.insuranceNumber}</div>}
                <div><strong>Ciudad:</strong> Arroyito, Córdoba</div>
              </div>
            </div>

            {/* CHRONOLOGICAL CONSULTATIONS */}
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#002182',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.35rem',
                  marginBottom: '0.85rem'
                }}
              >
                Evoluciones Clínicas Registradas ({patientConsultations.length})
              </div>

              {patientConsultations.length === 0 ? (
                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.84rem', color: '#64748b', textAlign: 'center' }}>
                  No se registran consultas previas en el sistema para este paciente.
                </div>
              ) : (
                patientConsultations.map((c, idx) => (
                  <div
                    key={c.id || idx}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '1rem 1.15rem',
                      marginBottom: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                        Consulta #{idx + 1} · {c.date} ({c.time} hs)
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                        {c.doctorName} {c.doctorLicense && `(${c.doctorLicense})`}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.84rem', lineHeight: 1.5, color: '#334155' }}>
                      <div style={{ marginBottom: '3px' }}>
                        <strong>Motivo:</strong> {c.reason || 'Consulta médica'}
                      </div>
                      <div style={{ marginBottom: '3px' }}>
                        <strong>Diagnóstico (CIE-10):</strong> <span style={{ color: '#002182', fontWeight: 700 }}>{c.diagnosis}</span>
                        {c.secondaryDiagnosis && <span style={{ color: '#64748b' }}> · Secundario: {c.secondaryDiagnosis}</span>}
                      </div>
                      {c.vitals && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0' }}>
                          Signos vitales: T.A. {c.vitals.bpSystolic}/{c.vitals.bpDiastolic} mmHg · F.C. {c.vitals.heartRate} lpm · Temp. {c.vitals.temperature} °C · IMC {c.vitals.bmi}
                        </div>
                      )}
                      <div style={{ marginTop: '4px', color: '#1e293b' }}>
                        <strong>Evolución:</strong> {c.evolution || c.physicalExam}
                      </div>
                      {c.prescriptions && c.prescriptions.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <strong>Prescripción:</strong>{' '}
                          {c.prescriptions.map((p) => `${p.drugName || p.dci || p.name || p.medication} ${p.presentation || ''}`).join(', ')}
                        </div>
                      )}
                      {c.indications && (
                        <div style={{ marginTop: '4px' }}>
                          <strong>Indicaciones:</strong> {c.indications}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* LEGAL SIGNATURE FOOTER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '3rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #cbd5e1'
              }}
            >
              <div style={{ maxWidth: '400px', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                  Constancia Institucional
                </div>
                Copia oficial del historial clínico registrado en el sistema de Historia Clínica Electrónica de CITRA Clínica Médica. Validez legal conforme a Ley N° 26.529 y Ley N° 25.506.
              </div>

              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '6px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                    {activeDoctorName}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                    Traumatología y Ortopedia
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {activeDoctorLicense}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} color="#059669" /> Firma Digital Registrada
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CLOSE */}
        <div
          className="legal-hce-footer"
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '0.75rem 1.75rem',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
