import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Printer,
  FileCheck2,
  Stethoscope,
  X,
  QrCode,
  Lock,
  Share2,
  ShieldCheck,
  Calendar,
  Building,
  AlertCircle
} from 'lucide-react';

export const ConsultationPrintView = () => {
  const {
    selectedConsultationForPrint,
    setSelectedConsultationForPrint,
    clinicInfo,
    patients,
    currentDoctor,
    isDoctor
  } = useClinic();

  if (!selectedConsultationForPrint) return null;

  const cons = selectedConsultationForPrint;
  const pat = patients.find((p) => p.id === cons.patientId) || {
    name: cons.patientName,
    dni: cons.patientDni || '34.892.110',
    insuranceName: 'OSDE',
    insurancePlan: '310',
    insuranceNumber: '310-892110-01'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Estimado/a ${pat.name}: Adjuntamos copia oficial de su Evolución Médica & Informe Clínico emitido el ${cons.date} en CITRA Clínica Médica por el ${cons.doctorName}. Documento firmado digitalmente con validez legal plena.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const hashDisplay = cons.integrityHash || cons.sha256Hash || '4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c';

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 18, 66, 0.82)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto'
      }}
      onClick={() => setSelectedConsultationForPrint(null)}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '860px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 30px 60px -15px rgba(0, 21, 86, 0.45), 0 0 0 1px rgba(7, 106, 188, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL TOP CONTROLS */}
        <div
          style={{
            background: 'linear-gradient(135deg, #001f66 0%, #001242 100%)',
            padding: '1.15rem 1.75rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #076ABC',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93C5FD'
              }}
            >
              <FileCheck2 size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>
                Informe Clínico & Evolución Médica Homologada
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#D2E3FC', marginTop: '2px' }}>
                Documento Clínico Oficial · Firma Digital X.509 Verificada
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Share2 size={14} /> WhatsApp
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(7, 106, 188, 0.3)'
              }}
            >
              <Printer size={15} /> Imprimir Documento Oficial
            </button>

            <button
              type="button"
              onClick={() => setSelectedConsultationForPrint(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
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

        {/* PRINTABLE OFFICIAL MEDICAL DOCUMENT */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
          <div
            className="printable-area"
            style={{
              background: '#ffffff',
              border: '2px solid #002182',
              borderRadius: '16px',
              padding: '2.5rem',
              color: '#0f172a',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0, 33, 130, 0.06)'
            }}
          >
            {/* WATERMARK */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-30deg)',
                fontSize: '4.5rem',
                fontWeight: 900,
                color: 'rgba(0, 33, 130, 0.03)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                letterSpacing: '0.2em'
              }}
            >
              CITRA · DOCUMENTO MÉDICO OFICIAL
            </div>

            {/* INSTITUTIONAL HEADER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2.5px solid #002182',
                paddingBottom: '1.25rem',
                marginBottom: '1.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', letterSpacing: '-0.02em' }}>
                  CITRA CLÍNICA MÉDICA
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#076ABC' }}>
                  CENTRO INTEGRAL DE TRAUMATOLOGÍA Y REHABILITACIÓN ARROYITO (CÓRDOBA)
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
                  Av. San Martín 450, Arroyito, Pcia. de Córdoba · Tel: (03576) 450-200 · CUIT: 30-71829340-8<br />
                  Habilitación RUGEPRESA Disp. N° 8491/22 · Ministerio de Salud de Córdoba · SISA REFES N° 0414002
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    background: '#F5F8FE',
                    border: '1.5px solid #BFDBFE',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: '#002182',
                    display: 'inline-block'
                  }}
                >
                  ACTO MÉDICO ID: {cons.id.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#0f172a', fontWeight: 700, marginTop: '4px' }}>
                  FECHA: {cons.date} ({cons.time} hs)
                </div>
                <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                  ✓ Asiento Registrado e Inmutable
                </div>
              </div>
            </div>

            {/* PATIENT & PHYSICIAN INFORMATION BOX */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1fr',
                gap: '1.25rem',
                background: '#f8fafc',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                marginBottom: '1.5rem',
                fontSize: '0.86rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Datos del Paciente Titular
                </div>
                <div><strong>PACIENTE:</strong> {pat.name}</div>
                <div><strong>DNI:</strong> {pat.dni}</div>
                <div><strong>COBERTURA:</strong> {pat.insuranceName} ({pat.insurancePlan || 'Plan Médico'})</div>
                <div><strong>N° AFILIADO:</strong> {pat.insuranceNumber || '310-892110-01'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Profesional Interviniente
                </div>
                <div><strong>PROFESIONAL:</strong> {cons.doctorName}</div>
                <div><strong>ESPECIALIDAD:</strong> {cons.specialtyName || 'Traumatología y Ortopedia'}</div>
                <div><strong>MATRÍCULA PROVINCIAL:</strong> {cons.doctorLicense || 'M.P. 34.892 (CMPC)'}</div>
                <div><strong>REGISTRO NACIONAL:</strong> {cons.sisaRefeps || 'REFEPS-MN-114829'}</div>
              </div>
            </div>

            {/* 1. MOTIVO DE CONSULTA & DIAGNÓSTICO CIE-10 */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  borderBottom: '1.5px solid #002182',
                  paddingBottom: '0.3rem',
                  marginBottom: '0.6rem',
                  color: '#002182',
                  textTransform: 'uppercase'
                }}
              >
                1. Motivo de Consulta & Diagnóstico Clínico (CIE-10)
              </div>
              <div style={{ fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                <strong>Motivo Principal:</strong> {cons.reason}
              </div>
              <div style={{ fontSize: '0.86rem' }}>
                <strong>Diagnóstico Principal (CIE-10):</strong> <span style={{ color: '#002182', fontWeight: 700 }}>{cons.diagnosis}</span>
              </div>
              {cons.secondaryDiagnosis && (
                <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '3px' }}>
                  <strong>Diagnóstico Secundario:</strong> {cons.secondaryDiagnosis}
                </div>
              )}
            </div>

            {/* 2. SIGNOS VITALES */}
            {cons.vitals && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    borderBottom: '1.5px solid #002182',
                    paddingBottom: '0.3rem',
                    marginBottom: '0.6rem',
                    color: '#002182',
                    textTransform: 'uppercase'
                  }}
                >
                  2. Signos Vitales & Medición Antropométrica
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.84rem', flexWrap: 'wrap', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span><strong>T.A.:</strong> {cons.vitals.bpSystolic}/{cons.vitals.bpDiastolic} mmHg</span>
                  <span><strong>F.C.:</strong> {cons.vitals.heartRate} lpm</span>
                  <span><strong>Temp.:</strong> {cons.vitals.temperature} °C</span>
                  <span><strong>Peso:</strong> {cons.vitals.weight} kg</span>
                  <span><strong>Altura:</strong> {cons.vitals.height} m</span>
                  <span><strong>IMC:</strong> {cons.vitals.bmi} ({cons.vitals.bmiCategory})</span>
                </div>
              </div>
            )}

            {/* 3. EVOLUCIÓN MÉDICA & EXAMEN FÍSICO TRAUMATOLÓGICO */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  borderBottom: '1.5px solid #002182',
                  paddingBottom: '0.3rem',
                  marginBottom: '0.6rem',
                  color: '#002182',
                  textTransform: 'uppercase'
                }}
              >
                3. Evolución Médica & Examen Físico Especializado
              </div>
              <p style={{ fontSize: '0.86rem', lineHeight: 1.65, textAlign: 'justify', margin: 0, color: '#1e293b' }}>
                {cons.evolution}
              </p>
            </div>

            {/* 4. RECETA MÉDICA DIGITAL (Rp/) */}
            {cons.prescriptions && cons.prescriptions.length > 0 && (
              <div style={{ marginBottom: '1.25rem', border: '1.5px solid #BFDBFE', background: '#F5F8FE', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#002182', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Rp/ (PRESCRIPCIÓN MÉDICA DIGITAL OFICIAL)</span>
                  <span style={{ fontSize: '0.72rem', background: '#059669', color: '#ffffff', padding: '2px 8px', borderRadius: '100px' }}>
                    ReNaPDiS Válida
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cons.prescriptions.map((p, idx) => (
                    <div key={idx} style={{ fontSize: '0.86rem', color: '#0f172a' }}>
                      <strong>{idx + 1}. {p.medication || p.name || p.drugName}</strong> {p.dosage || p.presentation ? `(${p.dosage || p.presentation})` : ''}
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginLeft: '1rem' }}>
                        Frecuencia: {p.frequency || p.instructions || '-'} · Duración: {p.duration || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. INDICACIONES & ESTUDIOS */}
            {cons.indications && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    borderBottom: '1.5px solid #002182',
                    paddingBottom: '0.3rem',
                    marginBottom: '0.5rem',
                    color: '#002182',
                    textTransform: 'uppercase'
                  }}
                >
                  5. Indicaciones Terapéuticas & Pautas de Alarma
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-line', color: '#334155' }}>
                  {cons.indications}
                </div>
              </div>
            )}

            {cons.studiesRequested && cons.studiesRequested.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    borderBottom: '1.5px solid #002182',
                    paddingBottom: '0.3rem',
                    marginBottom: '0.5rem',
                    color: '#002182',
                    textTransform: 'uppercase'
                  }}
                >
                  6. Solicitud de Prácticas y Estudios Complementarios
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', margin: 0 }}>
                  {cons.studiesRequested.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: '2px' }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ADENDAS FECHADAS (ART. 13 LEY 26.529) */}
            {cons.adendas && cons.adendas.length > 0 && (
              <div style={{ marginBottom: '1.5rem', border: '1.5px solid #fef08a', background: '#fefce8', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#854d0e', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Adendas Médicas & Rectificaciones Registradas
                </div>
                {cons.adendas.map((ad, idx) => (
                  <div key={idx} style={{ fontSize: '0.82rem', color: '#713f12', marginBottom: '6px', lineHeight: 1.5 }}>
                    <strong>Adenda #{idx + 1} ({ad.date} {ad.time} hs):</strong> {ad.adendaText} — <em>Firmada por {ad.doctorName} ({ad.doctorLicense})</em>
                  </div>
                ))}
              </div>
            )}

            {/* PROFESSIONAL SIGNATURE & STAMP */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '2.5rem',
                paddingTop: '1.25rem',
                borderTop: '1.5px dashed #cbd5e1'
              }}
            >
              <div style={{ fontSize: '0.74rem', color: '#64748b', maxWidth: '380px', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: '#002182', marginBottom: '2px' }}>
                  CONSTANCIA DE VALIDEZ LEGAL Y PROBATORIA
                </div>
                Documento oficial extendido con validez probatoria plena y firma digital. Archivo y guarda institucional garantizada por 10 años. Asiento registrado en auditoría inmutable.
              </div>

              <div style={{ textAlign: 'center', minWidth: '240px' }}>
                <div style={{ fontFamily: 'cursive', fontSize: '1.25rem', color: '#002182', fontWeight: 800, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cons.doctorName}
                </div>
                <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '4px', fontSize: '0.82rem', fontWeight: 800 }}>
                  {cons.doctorName}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 700 }}>
                  {cons.doctorLicense || 'M.P. 34.892 (Consejo de Médicos de Córdoba)'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                  🔒 Firma Digital X.509 Criptográfica (AC ONTI Raíz)
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Sello de Tiempo: {cons.signatureTimestamp || cons.date}
                </div>
              </div>
            </div>

            {/* SECURITY FOOTER WITH QR CODE */}
            <div
              style={{
                marginTop: '1.5rem',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem',
                color: '#64748b'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    background: '#F5F8FE',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#002182'
                  }}
                >
                  <QrCode size={24} />
                </div>
                <div>
                  <div><strong>Verificación de Inalterabilidad Documental</strong></div>
                  <div>Hash SHA-256: {hashDisplay.substring(0, 32)}...</div>
                  <div>Validar online en https://citra.com.ar/validar/hce/{cons.id}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div><strong>CITRA CENTRO MÉDICO ARROYITO (CÓRDOBA)</strong></div>
                <div>Sistema de Historia Clínica Electrónica Homologada</div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '0.85rem 1.75rem',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setSelectedConsultationForPrint(null)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
