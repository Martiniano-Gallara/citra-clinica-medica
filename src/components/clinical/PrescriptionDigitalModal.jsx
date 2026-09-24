import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  X,
  Share2,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Pill,
  FileText,
  Building2,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { generateReNaPDiSVerificationUrl } from '../../utils/renapdisEngine';

export const PrescriptionDigitalModal = () => {
  const {
    selectedPrescriptionForView,
    setSelectedPrescriptionForView,
    clinicInfo,
    updatePrescriptionStatus,
    addToast
  } = useClinic();

  if (!selectedPrescriptionForView) return null;

  const rx = selectedPrescriptionForView;
  const qrUrl = generateReNaPDiSVerificationUrl(rx.cuir, rx.sisaRefeps, rx.patientDni);

  const handlePrint = () => {
    window.print();
  };

  const handleMarkDispensed = () => {
    const pharmacy = window.prompt('Ingrese el nombre de la Farmacia dispensadora:', 'Farmacia Central Arroyito');
    if (pharmacy) {
      updatePrescriptionStatus(rx.id, 'Dispensada', pharmacy);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Hola ${rx.patientName}, desde CITRA Clínica Médica le compartimos su Receta Médica Oficial (CUIR: ${rx.cuir}). Válida para dispensa en farmacias de todo el país. Vigencia: 30 días. Enlace de validación: ${qrUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Normalizar lista de medicamentos para soportar tanto modelos antiguos como nuevos
  const medicationsList = Array.isArray(rx.medications) && rx.medications.length > 0
    ? rx.medications
    : [
        {
          dci: rx.medicationName || rx.dci || 'Medicamento Prescrito',
          form: rx.form || 'Comprimidos',
          concentration: rx.dosage || rx.concentration || 'Dosis indicada',
          quantityUnits: rx.quantity || rx.quantityUnits || '1 caja',
          instructions: rx.indications || rx.instructions || 'Según indicación médica'
        }
      ];

  const effectiveDiagnosis = rx.diagnosisPresuntivo || rx.diagnosis || 'Control y tratamiento traumatológico';
  const effectiveDoctorName = rx.doctorName === 'Dr. Blanco' ? 'Dr. Alejandro Blanco' : (rx.doctorName || 'Dr. Alejandro Blanco');
  const effectiveDoctorLicense = rx.doctorLicense === 'MN 114.829 / MP 44.920' || !rx.doctorLicense ? 'M.N. 114.829 · M.P. 44.920' : (rx.doctorLicense || rx.doctorMatricula || 'M.N. 114.829 · M.P. 44.920');

  return (
    <div
      className="prescription-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 21, 86, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto'
      }}
      onClick={() => setSelectedPrescriptionForView(null)}
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          body, html {
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
          header, nav, aside, footer,
          .admin-container, .admin-sidebar, .admin-sidebar-backdrop, .admin-topbar, .admin-header,
          .navbar, .toast-container, .no-print,
          .prescription-action-bar, button, .btn {
            display: none !important;
          }
          .modal-overlay:not(.prescription-modal-overlay) {
            display: none !important;
          }
          .prescription-modal-overlay {
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
          .prescription-modal-container {
            position: static !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            max-height: none !important;
            height: auto !important;
            background: #ffffff !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }
          .prescription-printable-document {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
            visibility: visible !important;
            display: block !important;
          }
          .prescription-printable-document * {
            visibility: visible !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div
        className="prescription-modal-container"
        style={{
          width: '100%',
          maxWidth: '840px',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 33, 130, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ACTION BAR (NO-PRINT) */}
        <div
          className="prescription-action-bar no-print"
          style={{
            background: 'linear-gradient(135deg, #001f66 0%, #001242 100%)',
            padding: '1rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #076ABC',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93C5FD'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                Receta Médica Electrónica Oficial
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#93C5FD' }}>
                CUIR: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{rx.cuir}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {rx.dispensationStatus === 'Habilitada para Dispensa' && (
              <button
                type="button"
                onClick={handleMarkDispensed}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={14} color="#34D399" />
                <span>Simular Dispensa</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                background: '#25D366',
                border: 'none',
                color: '#ffffff',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <Share2 size={14} />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#076ABC',
                border: 'none',
                color: '#ffffff',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(7, 106, 188, 0.4)'
              }}
            >
              <Printer size={15} />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPrescriptionForView(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                padding: '0.35rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL PRESCRIPTION DOCUMENT */}
        <div
          style={{
            overflowY: 'auto',
            padding: '1.75rem 2rem',
            background: '#ffffff',
            flex: 1
          }}
        >
          <div
            className="prescription-printable-document printable-area"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}
          >
            {/* 1. OFFICIAL INSTITUTIONAL HEADER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2.5px solid #002182',
                paddingBottom: '1rem',
                marginBottom: '1.25rem'
              }}
            >
              {/* Left: Clinic Brand & Legal Identifiers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src="/citra-icon.png"
                  alt="CITRA Logo"
                  style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#002182', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    CITRA
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#076ABC', marginTop: '2px' }}>
                    Centro Integral de Traumatología & Rehabilitación Arroyito
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                    Av. Arroyito 1045, Córdoba · Tel: +54 3576 45-2190 · Establecimiento REFES-04-14289
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    CUIT: 30-71829340-8 · Registro Sanitario SISA
                  </div>
                </div>
              </div>

              {/* Right: Official Recipe Credentials */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-block',
                    background: '#002182',
                    color: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem'
                  }}
                >
                  Receta Médica Oficial
                </div>
                <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
                  Código Único de Identificación (CUIR):
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#002182',
                    background: '#F0F6FE',
                    border: '1px solid #BFDBFE',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginTop: '2px'
                  }}
                >
                  {rx.cuir}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Sistema Nacional de Prescripción Digital
                </div>
              </div>
            </div>

            {/* 2. PATIENT & PRESCRIBER CLINICAL INFORMATION CARD */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '1.5rem',
                fontSize: '0.85rem'
              }}
            >
              {/* Left Column: Patient & Diagnosis */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Datos del Paciente
                </div>
                <div>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Paciente: </span>
                  <strong style={{ color: '#002182', fontSize: '0.98rem' }}>{rx.patientName}</strong>
                </div>
                <div>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Documento (DNI): </span>
                  <strong style={{ color: '#0f172a' }}>{rx.patientDni}</strong>
                </div>
                <div>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Cobertura Médica: </span>
                  <strong style={{ color: '#0f172a' }}>{rx.patientInsurance || 'Particular'}</strong>
                </div>
                <div style={{ marginTop: '2px' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Diagnóstico Clínico (CIE-10): </span>
                  <strong style={{ color: '#002182' }}>{effectiveDiagnosis}</strong>
                </div>
              </div>

              {/* Right Column: Prescriber & Expiration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Profesional Prescriptor
                </div>
                <div>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Médico: </span>
                  <strong style={{ color: '#002182', fontSize: '0.95rem' }}>{effectiveDoctorName}</strong>
                </div>
                <div>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Especialidad: </span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{rx.doctorSpecialty || 'Traumatología y Ortopedia'}</span>
                </div>
                <div>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Matrícula Profesional: </span>
                  <strong style={{ color: '#0f172a' }}>{effectiveDoctorLicense}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Estado: </span>
                  <span
                    style={{
                      background: rx.dispensationStatus === 'Dispensada' ? '#DCFCE7' : '#EFF6FF',
                      color: rx.dispensationStatus === 'Dispensada' ? '#15803D' : '#1D4ED8',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '100px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={11} />
                    {rx.dispensationStatus} {rx.dispensedPharmacy ? `· ${rx.dispensedPharmacy}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. DATES STRIP */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F0F6FE',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                color: '#002182',
                marginBottom: '1.25rem',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="#076ABC" />
                <span>Fecha de Emisión: <strong>{rx.issueDate || '2026-08-28'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#076ABC" />
                <span>Válido para Dispensa hasta: <strong style={{ color: '#B91C1C' }}>{rx.expirationDate || '2026-09-27'} (30 días)</strong></span>
              </div>
            </div>

            {/* 4. RP/ PRESCRIPTION BODY (THE ACTUAL RECIPE) */}
            <div
              style={{
                border: '1.5px solid #002182',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                background: '#ffffff'
              }}
            >
              {/* Monogram Rp/ Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.85rem',
                  borderBottom: '1.5px solid #E2E8F0',
                  paddingBottom: '0.75rem',
                  marginBottom: '1rem'
                }}
              >
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: '#002182',
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    lineHeight: 1
                  }}
                >
                  Rp/
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                  Prescripción Médica por Denominación Común Internacional (DCI) · Ley Nacional 25.649
                </div>
              </div>

              {/* Medications List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {medicationsList.map((med, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '1rem 1.25rem'
                    }}
                  >
                    {/* Item Title & Dosage */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#002182' }}>
                        {idx + 1}. {med.dci || med.name}
                        {med.concentration && (
                          <span style={{ fontWeight: 800, color: '#076ABC', marginLeft: '6px' }}>
                            — {med.concentration}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          background: '#E2EDFC',
                          color: '#002182',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        Item {idx + 1}
                      </div>
                    </div>

                    {/* Pharmaceutical Form & Total Units */}
                    <div style={{ fontSize: '0.84rem', color: '#334155', marginBottom: '0.5rem' }}>
                      <strong>Forma Farmacéutica:</strong> {med.form || 'Comprimidos'} &nbsp;|&nbsp;{' '}
                      <strong>Cantidad Total:</strong> {med.quantityUnits || med.quantity || '1 caja'}
                    </div>

                    {/* Posology / Patient Directions */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderLeft: '3.5px solid #076ABC',
                        borderTop: '1px solid #E2E8F0',
                        borderRight: '1px solid #E2E8F0',
                        borderBottom: '1px solid #E2E8F0',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '0.84rem',
                        color: '#0f172a'
                      }}
                    >
                      <strong style={{ color: '#002182' }}>Posología e Indicaciones:</strong>{' '}
                      <span>{med.instructions || med.dosage || 'Tomar según indicación médica'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* General Clinical Indications (if any) */}
              {rx.indications && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.65rem 1rem',
                    background: '#F0F6FE',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: '#002182'
                  }}
                >
                  <strong>Indicaciones Terapéuticas Generales:</strong> {rx.indications}
                </div>
              )}
            </div>

            {/* 5. FOOTER: VALIDATION QR & OFFICIAL DOCTOR SIGNATURE/STAMP */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                alignItems: 'flex-end',
                borderTop: '2px solid #E2E8F0',
                paddingTop: '1.25rem',
                marginTop: '1.25rem',
                gap: '1.5rem'
              }}
            >
              {/* Left: Pharmacy QR Scanner & Legal Validity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    background: '#ffffff',
                    padding: '6px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <QRCodeSVG value={qrUrl} size={82} level="M" />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '2px' }}>
                    Validación Farmacéutica Nacional
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#475569', lineHeight: 1.35, maxWidth: '280px' }}>
                    Escaneable en farmacias adheridas de todo el país para dispensa oficial y trazabilidad de receta.
                  </div>
                  <div style={{ fontSize: '0.69rem', color: '#64748b', marginTop: '4px' }}>
                    Emisión certificada en plataforma de salud CITRA.
                  </div>
                </div>
              </div>

              {/* Right: Authentic Doctor Signature & Professional Stamp (Clean, no "firma legal" or crypto-hashes) */}
              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                {/* Handwritten Calligraphic Signature */}
                <div
                  style={{
                    fontFamily: "'Dancing Script', 'Brush Script MT', 'Caveat', 'Segoe Script', cursive",
                    fontSize: '2.1rem',
                    fontWeight: 700,
                    color: '#002182',
                    lineHeight: 1,
                    marginBottom: '6px',
                    letterSpacing: '0.02em',
                    transform: 'rotate(-2deg)'
                  }}
                >
                  {effectiveDoctorName}
                </div>

                {/* Sello Profesional Aclaratorio */}
                <div
                  style={{
                    borderTop: '1.5px solid #002182',
                    paddingTop: '6px'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 900,
                      color: '#002182',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}
                  >
                    {effectiveDoctorName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 700 }}>
                    {rx.doctorSpecialty || 'Especialista en Traumatología y Ortopedia'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#002182', fontWeight: 800, marginTop: '1px' }}>
                    {effectiveDoctorLicense}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                    CITRA Centro Integral de Traumatología
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Legal Footnote */}
            <div
              style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                fontSize: '0.68rem',
                color: '#94A3B8',
                borderTop: '1px dashed #E2E8F0',
                paddingTop: '0.65rem'
              }}
            >
              Documento médico de prescripción farmacológica emitido conforme a la Ley de Prescripción por DCI 25.649 y Ley de Recetas Electrónicas 27.553. Validez legal plena en la República Argentina.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
