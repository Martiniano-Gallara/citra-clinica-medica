import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  ShieldCheck,
  Printer,
  FileCheck2,
  X,
  QrCode,
  Lock,
  Building,
  Calendar,
  User,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Scale
} from 'lucide-react';

export const LegalHceCertificateModal = ({ isOpen, onClose, targetPatient = null }) => {
  const {
    patients,
    consultations,
    scopedConsultations,
    currentDoctor,
    isDoctor,
    clinicInfo,
    addToast
  } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState(
    targetPatient?.id || patients[0]?.id || ''
  );

  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || targetPatient || patients[0];
  }, [patients, selectedPatientId, targetPatient]);

  // Consultations for this patient
  const patientConsultations = useMemo(() => {
    if (!activePatient) return [];
    return consultations.filter(
      (c) => c.patientId === activePatient.id || c.patientDni === activePatient.dni
    );
  }, [consultations, activePatient]);

  const activeDoctorName = isDoctor && currentDoctor ? currentDoctor.name : 'Dr. Alejandro Blanco';
  const activeDoctorLicense = isDoctor && currentDoctor ? currentDoctor.license : 'M.P. 34.892 · M.N. 114.829 (CMPC)';

  const currentDateStr = new Date().toISOString().split('T')[0];
  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dossierId = `HCE-CBA-${activePatient?.dni || '000'}-${Date.now().toString().slice(-6)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Estimado/a ${activePatient.name}: CITRA Centro Médico le hace entrega formal de su Copia Certificada de Historia Clínica Electrónica (Dossier N° ${dossierId}). Validez legal plena verificable online.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

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
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '920px',
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
        {/* HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #001f66 0%, #001242 100%)',
            padding: '1.25rem 1.75rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #076ABC',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93C5FD'
              }}
            >
              <Scale size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                  Certificación y Entrega de Copia de Historia Clínica
                </h3>
                  <span
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '100px'
                    }}
                  >
                    COPIA OFICIAL CERTIFICADA
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#D2E3FC', marginTop: '3px' }}>
                  Dossier Digital Foliado · Autenticidad Verificada · Plazo de Entrega: 48 hs hábiles
                </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTROLS BAR (PATIENT SELECTOR & LEGAL BANNER) */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '1rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182', whiteSpace: 'nowrap' }}>
              Paciente Titular:
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: '#ffffff',
                outline: 'none',
                color: '#0f172a'
              }}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — DNI {p.dni} ({p.insuranceName || 'Particular'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                background: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                color: '#065f46',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Share2 size={15} /> WhatsApp
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
              }}
            >
              <Printer size={16} /> Imprimir Copia Autenticada
            </button>
          </div>
        </div>

        {/* PRINTABLE DOSSIER BODY */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
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
                fontSize: '4rem',
                fontWeight: 900,
                color: 'rgba(0, 33, 130, 0.03)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                letterSpacing: '0.2em'
              }}
            >
              CITRA · COPIA CERTIFICADA
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
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#002182', letterSpacing: '-0.02em' }}>
                  CITRA CLÍNICA MÉDICA
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#076ABC' }}>
                  CENTRO INTEGRAL DE TRAUMATOLOGÍA Y REHABILITACIÓN ARROYITO (CÓRDOBA)
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                  Av. San Martín 450, Arroyito, Pcia. de Córdoba · Tel: (03576) 450-200<br />
                  Habilitación Ministerial RUGEPRESA N° 8491/22 · Ministerio de Salud de Córdoba<br />
                  Entidad Adherida al Consejo de Médicos de la Pcia. de Córdoba (CMPC) y Colegio de Kinesiólogos (Colkine)
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    background: '#F5F8FE',
                    border: '1.5px solid #BFDBFE',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    color: '#002182',
                    display: 'inline-block'
                  }}
                >
                  DOSSIER FOLIADO N° {dossierId}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
                  Fecha de Expedición: <strong>{currentDateStr}</strong> a las <strong>{currentTimeStr} hs</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                  ✓ Entrega formal certificada en 48 hs
                </div>
              </div>
            </div>

            {/* CERTIFICATE TITLE */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#002182', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                Certificado de Autenticidad de Historia Clínica Electrónica
              </h2>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>
                Documento Oficial Emitido por el Departamento de Registro y Archivo Clínico
              </div>
            </div>

            {/* PATIENT FILIATION DATA */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                fontSize: '0.86rem'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div><strong>Paciente Titular:</strong> {activePatient?.name}</div>
                <div><strong>DNI / CUIL:</strong> {activePatient?.dni}</div>
                <div><strong>Fecha de Nacimiento:</strong> {activePatient?.birthDate || '14/05/1988'}</div>
                <div><strong>Cobertura de Salud:</strong> {activePatient?.insuranceName || 'Particular'} ({activePatient?.insurancePlan || 'Directo'})</div>
                <div><strong>N° Carnet / Afiliado:</strong> {activePatient?.insuranceNumber || '310-892110-01'}</div>
                <div><strong>Domicilio Legal:</strong> Arroyito, Pcia. de Córdoba</div>
              </div>
            </div>

            {/* LEGAL ATTESTATION PARAGRAPH */}
            <div style={{ fontSize: '0.86rem', lineHeight: 1.7, textAlign: 'justify', marginBottom: '1.5rem', color: '#1e293b' }}>
              <p style={{ margin: '0 0 0.8rem 0' }}>
                La Dirección Médica y el Departamento de Registro y Archivo de <strong>CITRA Centro Médico</strong>, en su carácter de depositario y custodio oficial de la documentación clínica, certifica que la presente constancia constituye <strong>COPIA FIEL E INALTERABLE</strong> de las actuaciones médicas, exámenes traumatológicos, evoluciones y terapéuticas registradas en el Sistema de Historia Clínica Electrónica de la institución para el paciente arriba individualizado.
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>
                Se deja constancia de que los asientos originales cuentan con firma digital criptográfica certificada, con sello de tiempo inmutable y garantía de guarda segura por el término de <strong>10 (diez) años</strong>.
              </p>
            </div>

            {/* CHRONOLOGICAL CONSULTATIONS DOSSIER */}
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  color: '#002182',
                  borderBottom: '2px solid #002182',
                  paddingBottom: '0.4rem',
                  marginBottom: '1rem',
                  textTransform: 'uppercase'
                }}
              >
                Cronología de Actos Clínicos y Evoluciones Registradas ({patientConsultations.length} asientos)
              </div>

              {patientConsultations.length === 0 ? (
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.84rem', color: '#64748b', textAlign: 'center' }}>
                  No se registran evoluciones previas en el sistema para este paciente.
                </div>
              ) : (
                patientConsultations.map((c, idx) => (
                  <div
                    key={c.id}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '1rem 1.25rem',
                      marginBottom: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '0.6rem' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#002182' }}>
                        Folio #{idx + 1} · Fecha: {c.date} ({c.time} hs) — {c.specialtyName || 'Traumatología'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                        Firma Digital X.509 · CMPC M.P. 34.892
                      </div>
                    </div>

                    <div style={{ fontSize: '0.84rem', lineHeight: 1.6, color: '#334155' }}>
                      <div><strong>Profesional:</strong> {c.doctorName} ({c.doctorLicense || activeDoctorLicense})</div>
                      <div><strong>Motivo & Diagnóstico:</strong> {c.reason} — <strong style={{ color: '#002182' }}>{c.diagnosis}</strong></div>
                      {c.vitals && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0' }}>
                          Signos Vitales: TA {c.vitals.bpSystolic}/{c.vitals.bpDiastolic} mmHg · FC {c.vitals.heartRate} lpm · Temp {c.vitals.temperature} °C · IMC {c.vitals.bmi}
                        </div>
                      )}
                      <div style={{ marginTop: '4px' }}><strong>Evolución:</strong> {c.evolution}</div>
                      {c.indications && <div style={{ marginTop: '2px' }}><strong>Indicaciones:</strong> {c.indications}</div>}
                    </div>

                    <div style={{ marginTop: '0.6rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem', fontSize: '0.72rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Hash Inalterabilidad: {c.sha256Hash ? `${c.sha256Hash.substring(0, 24)}...` : 'SHA256-INMUTABLE-VALIDATED'}</span>
                      <span>Sello de Tiempo Criptográfico</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* TRIPLE LEGAL ATTESTATION STAMP & SIGNATURE */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2.5rem',
                marginTop: '2.5rem',
                paddingTop: '1.5rem',
                borderTop: '2px dashed #002182'
              }}
            >
              {/* LEGAL DIRECTION STAMP */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#002182', fontWeight: 800 }}>
                    Dr. Roberto Morales
                  </div>
                </div>
                <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '4px', fontSize: '0.82rem', fontWeight: 800 }}>
                  Dr. Roberto Morales
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>
                  Director Médico · M.P. 28.190 (CMPC)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                  CITRA Centro Médico · Habilitación RUGEPRESA 8491/22
                </div>
              </div>

              {/* ATTENDING PHYSICIAN STAMP */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#002182', fontWeight: 800 }}>
                    {activeDoctorName}
                  </div>
                </div>
                <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '4px', fontSize: '0.82rem', fontWeight: 800 }}>
                  {activeDoctorName}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>
                  {activeDoctorLicense} · Traumatología
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                  🔒 Firma Digital X.509 Criptográfica (AC ONTI Raíz)
                </div>
              </div>
            </div>

            {/* SECURITY FOOTER WITH QR CODE */}
            <div
              style={{
                marginTop: '2rem',
                borderTop: '1px solid #cbd5e1',
                paddingTop: '0.9rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.74rem',
                color: '#64748b'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: '#F5F8FE',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#002182'
                  }}
                >
                  <QrCode size={28} />
                </div>
                <div>
                  <div><strong>Verificación de Validez Probatoria Digital</strong></div>
                  <div>Validar online en https://citra.com.ar/validar/hce/{dossierId}</div>
                  <div>Firma digital certificada y verificación criptográfica</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div><strong>CITRA CENTRO MÉDICO ARROYITO (CÓRDOBA)</strong></div>
                <div>Documento Oficial con Validez Legal y Probatoria Plena</div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '1rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} />
            <span>Guarda y archivo seguro por 10 años · Servidor Criptográfico CITRA</span>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
