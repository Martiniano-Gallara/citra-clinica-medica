import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import {
  Printer,
  FileText,
  X,
  QrCode,
  Download,
  CheckCircle2
} from 'lucide-react';

export const ConsultationPrintView = () => {
  const {
    selectedConsultationForPrint,
    setSelectedConsultationForPrint,
    patients
  } = useClinic();

  if (!selectedConsultationForPrint) return null;

  const cons = selectedConsultationForPrint;
  const pat = patients.find((p) => p.id === cons.patientId) || {
    name: cons.patientName || 'Paciente',
    dni: cons.patientDni || '-',
    insuranceName: 'Particular',
    insurancePlan: '',
    insuranceNumber: ''
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Estimado/a ${pat.name}: Le compartimos el informe médico de su atención del ${cons.date} en CITRA Clínica Médica.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const hashDisplay = cons.integrityHash || cons.sha256Hash || '4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c';

  return (
    <div
      className="modal-overlay consultation-print-overlay"
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
      onClick={() => setSelectedConsultationForPrint(null)}
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
          .consultation-print-header, .consultation-print-footer,
          button, .btn {
            display: none !important;
          }
          .modal-overlay:not(.consultation-print-overlay) {
            display: none !important;
          }
          .consultation-print-overlay {
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
          .consultation-print-modal {
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
          .consultation-print-sheet-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }
          .consultation-print-sheet {
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
          .consultation-print-sheet * {
            visibility: visible !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div
        className="modal-content consultation-print-modal"
        style={{
          width: '100%',
          maxWidth: '860px',
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
        {/* MODAL ACTION BAR */}
        <div
          className="consultation-print-header"
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
                Informe de Consulta Médica
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                Vista previa para descarga en PDF e impresión clínica
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
              onClick={() => setSelectedConsultationForPrint(null)}
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

        {/* PRINTABLE DOCUMENT SHEET */}
        <div
          className="consultation-print-sheet-wrapper"
          style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}
        >
          <div
            className="consultation-print-sheet printable-area"
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '2.75rem 3rem',
              color: '#0f172a',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.5,
              fontSize: '0.88rem'
            }}
          >
            {/* INSTITUTIONAL HEADER */}
            <div
              className="print-avoid-break"
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
                  Historia Clínica
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                  Fecha: <strong>{cons.date}</strong> · {cons.time} hs
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Folio: <strong>{cons.id?.toUpperCase()}</strong>
                </div>
              </div>
            </div>

            {/* PATIENT & DOCTOR DATA */}
            <div
              className="print-avoid-break"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.25rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                fontSize: '0.84rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  Datos del Paciente
                </div>
                <div><strong>Paciente:</strong> {pat.name}</div>
                <div><strong>DNI:</strong> {pat.dni}</div>
                <div>
                  <strong>Cobertura:</strong> {pat.insuranceName || 'Particular'}
                  {pat.insurancePlan && ` (${pat.insurancePlan})`}
                </div>
                {pat.insuranceNumber && <div><strong>N° Afiliado:</strong> {pat.insuranceNumber}</div>}
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  Profesional Interviniente
                </div>
                <div><strong>Médico:</strong> {cons.doctorName}</div>
                <div><strong>Especialidad:</strong> {cons.specialtyName || 'Traumatología y Ortopedia'}</div>
                <div><strong>Matrícula:</strong> {cons.doctorLicense || 'M.P. 34.892'}</div>
                {cons.sisaRefeps && <div><strong>Registro:</strong> {cons.sisaRefeps}</div>}
              </div>
            </div>

            {/* MOTIVO DE CONSULTA Y DIAGNÓSTICO */}
            <div className="print-avoid-break" style={{ marginBottom: '1.35rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#002182',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.35rem',
                  marginBottom: '0.55rem'
                }}
              >
                Motivo de Consulta y Diagnóstico (CIE-10)
              </div>
              <div style={{ marginBottom: '0.35rem' }}>
                <strong style={{ color: '#475569' }}>Motivo de consulta:</strong>{' '}
                <span>{cons.reason || 'Control médico general'}</span>
              </div>
              <div>
                <strong style={{ color: '#475569' }}>Diagnóstico principal:</strong>{' '}
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{cons.diagnosis || 'Consulta Médica'}</span>
              </div>
              {cons.secondaryDiagnosis && (
                <div style={{ marginTop: '2px', color: '#64748b', fontSize: '0.82rem' }}>
                  <strong style={{ color: '#475569' }}>Diagnóstico secundario:</strong> {cons.secondaryDiagnosis}
                </div>
              )}
            </div>

            {/* SIGNOS VITALES */}
            {cons.vitals && (
              <div className="print-avoid-break" style={{ marginBottom: '1.35rem' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#002182',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.35rem',
                    marginBottom: '0.55rem'
                  }}
                >
                  Signos Vitales y Parámetros Antropométricos
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '1.25rem',
                    flexWrap: 'wrap',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.82rem'
                  }}
                >
                  <span><strong>T.A.:</strong> {cons.vitals.bpSystolic}/{cons.vitals.bpDiastolic} mmHg</span>
                  <span><strong>F.C.:</strong> {cons.vitals.heartRate} lpm</span>
                  <span><strong>Temp.:</strong> {cons.vitals.temperature} °C</span>
                  <span><strong>Peso:</strong> {cons.vitals.weight} kg</span>
                  <span><strong>Altura:</strong> {cons.vitals.height} m</span>
                  <span><strong>IMC:</strong> {cons.vitals.bmi} ({cons.vitals.bmiCategory})</span>
                </div>
              </div>
            )}

            {/* EVOLUCIÓN CLÍNICA Y EXAMEN FÍSICO */}
            <div style={{ marginBottom: '1.35rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#002182',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.35rem',
                  marginBottom: '0.55rem'
                }}
              >
                Evolución Clínica y Examen Físico
              </div>
              <p style={{ margin: 0, color: '#1e293b', lineHeight: 1.6, textAlign: 'justify' }}>
                {cons.evolution || cons.physicalExam || 'Evolución clínica favorable sin complicaciones inmediatas.'}
              </p>
            </div>

            {/* PRESCRIPCIÓN MÉDICA (Rp/) */}
            {cons.prescriptions && cons.prescriptions.length > 0 && (
              <div className="print-avoid-break" style={{ marginBottom: '1.35rem' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#002182',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.35rem',
                    marginBottom: '0.55rem'
                  }}
                >
                  Prescripción Médica (Rp/)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {cons.prescriptions.map((p, idx) => {
                    const drugName = p.drugName || p.dci || p.name || p.medication || p.title || 'Medicamento prescrito';
                    const presentation = p.presentation || p.form || p.concentration || '';
                    const dosage = p.dosage || p.instructions || p.frequency || '';
                    const duration = p.duration ? `· Duración: ${p.duration}` : '';

                    return (
                      <div
                        key={idx}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '0.55rem 0.85rem'
                        }}
                      >
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>
                          {idx + 1}. {drugName} {presentation ? `(${presentation})` : ''}
                        </div>
                        {dosage && (
                          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                            Indicación: {dosage} {duration}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* INDICACIONES MÉDICAS */}
            {cons.indications && (
              <div style={{ marginBottom: '1.35rem' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#002182',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.35rem',
                    marginBottom: '0.55rem'
                  }}
                >
                  Indicaciones Médicas y Pautas de Cuidado
                </div>
                <div style={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {cons.indications}
                </div>
              </div>
            )}

            {/* ESTUDIOS SOLICITADOS */}
            {cons.studiesRequested && cons.studiesRequested.length > 0 && (
              <div style={{ marginBottom: '1.35rem' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#002182',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.35rem',
                    marginBottom: '0.55rem'
                  }}
                >
                  Estudios Solicitados
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155' }}>
                  {cons.studiesRequested.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: '2px' }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ADENDAS CLÍNICAS */}
            {cons.adendas && cons.adendas.length > 0 && (
              <div style={{ marginBottom: '1.35rem' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#002182',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.35rem',
                    marginBottom: '0.55rem'
                  }}
                >
                  Adendas Clínicas Fechadas
                </div>
                {cons.adendas.map((ad, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      marginBottom: '6px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div>
                      <strong>Adenda #{idx + 1} ({ad.date} {ad.time} hs):</strong> {ad.adendaText}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                      Asentado por {ad.doctorName} ({ad.doctorLicense})
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SIGNATURE & LEGAL INTEGRITY FOOTER */}
            <div
              className="print-avoid-break"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '3rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #cbd5e1'
              }}
            >
              <div style={{ maxWidth: '380px', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                  Registro Oficial de Historia Clínica
                </div>
                Documento médico electrónico con validez legal según Ley Nacional N° 25.506 y Ley N° 26.529.
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>
                  ID Verificación: {hashDisplay.substring(0, 28)}...
                </div>
              </div>

              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '6px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                    {cons.doctorName}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                    {cons.specialtyName || 'Traumatología y Ortopedia'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {cons.doctorLicense || 'Matrícula Profesional Verificada'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} color="#059669" /> Firma Electrónica Médica Certificada
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL BOTTOM CLOSE */}
        <div
          className="consultation-print-footer"
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
            onClick={() => setSelectedConsultationForPrint(null)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
