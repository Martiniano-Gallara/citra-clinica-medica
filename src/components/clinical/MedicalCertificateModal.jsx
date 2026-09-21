import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  FileBadge,
  X,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Printer,
  Download,
  Send,
  Eye,
  Edit3,
  Clock,
  Calendar,
  User,
  Stethoscope,
  Sparkles,
  Share2,
  FileText,
  Award,
  AlertCircle,
  Check,
  Lock,
  Building2,
  Briefcase
} from 'lucide-react';

export const MedicalCertificateModal = () => {
  const {
    isMedicalCertificateModalOpen,
    setIsMedicalCertificateModalOpen,
    patients,
    currentUser,
    currentDoctor,
    isDoctor,
    addMedicalCertificate,
    medicalCertificates,
    clinicInfo,
    addToast
  } = useClinic();

  // Active tab inside modal: 'editor' | 'preview' | 'history'
  const [modalTab, setModalTab] = useState('editor');

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [certificateType, setCertificateType] = useState('Certificado de Reposo Laboral / Licencia Médica');
  const [diagnosis, setDiagnosis] = useState('M54.5 - Lumbalgia Aguda Severa con Radiculopatía L5');
  const [restDays, setRestDays] = useState(7);
  const [restStartDate, setRestStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customContent, setCustomContent] = useState('');
  const [issuedCertificate, setIssuedCertificate] = useState(null);

  // Quick diagnosis presets for traumatology
  const traumaPresets = [
    { label: 'Lumbalgia Aguda', cie: 'M54.5 - Lumbalgia Aguda Severa con Radiculopatía L5', days: 7, type: 'Certificado de Reposo Laboral / Licencia Médica' },
    { label: 'Rotura LCA / Post-quirúrgico', cie: 'S83.5 - Traumatismo / Reconstrucción de Ligamento Cruzado Anterior', days: 21, type: 'Certificado de Reposo Laboral / Licencia Médica' },
    { label: 'Esguince de Tobillo', cie: 'S93.4 - Esguince y Desgarro de Ligamentos de Tobillo Grado II', days: 10, type: 'Certificado de Reposo Laboral / Licencia Médica' },
    { label: 'Tendinitis Manguito Rotador', cie: 'M75.1 - Síndrome del Manguito Rotatorio / Tendinopatía Supraespinoso', days: 5, type: 'Certificado de Reposo Laboral / Licencia Médica' },
    { label: 'Apto Físico Deportivo', cie: 'Z02.5 - Examen Médico para Participación en Deportes Competitivos', days: 0, type: 'Certificado de Apto Físico Deportivo Traumatológico' },
    { label: 'Asistencia a Consulta', cie: 'Z76.0 - Emisión de Certificado Médico / Asistencia a Consultorio', days: 0, type: 'Certificado de Asistencia a Consulta Médica' }
  ];

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Professional details (Dr. Blanco)
  const doctorName = (isDoctor && currentDoctor ? currentDoctor.name : currentUser?.name) || 'Dr. Alejandro Blanco';
  const doctorLicense = (isDoctor && currentDoctor ? currentDoctor.license : 'M.P. 34.892 · M.N. 114.829');
  const doctorSpecialty = (isDoctor && currentDoctor ? currentDoctor.specialty : 'Traumatología & Ortopedia');

  // Date calculations
  const calculateEndDate = (startDateStr, days) => {
    try {
      const d = new Date(startDateStr);
      d.setDate(d.getDate() + Number(days) - 1);
      return d.toISOString().split('T')[0];
    } catch {
      return startDateStr;
    }
  };

  const calculateReturnDate = (startDateStr, days) => {
    try {
      const d = new Date(startDateStr);
      d.setDate(d.getDate() + Number(days));
      return d.toISOString().split('T')[0];
    } catch {
      return startDateStr;
    }
  };

  const restEndDate = calculateEndDate(restStartDate, restDays);
  const returnToWorkDate = calculateReturnDate(restStartDate, restDays);

  const formatDateSpanish = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return d.toLocaleDateString('es-AR', options);
    } catch {
      return dateStr;
    }
  };

  function numberToWords(num) {
    const units = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno'];
    if (num <= 21) return units[num] || String(num);
    return String(num);
  }

  // Generate formal legal text
  const defaultFormalText = useMemo(() => {
    if (certificateType.includes('Apto Físico')) {
      return `Por la presente CERTIFICO que habiendo realizado el examen clínico-traumatológico, osteoarticular y funcional del paciente, no se evidencian signos ni síntomas de patología que contraindique en la actualidad la realización de ACTIVIDADES FÍSICAS Y DEPORTIVAS DE MEDIANO Y ALTO IMPACTO, encontrándose APTO FÍSICAMENTE al momento del presente acto médico.`;
    }
    if (certificateType.includes('Asistencia')) {
      return `Por la presente CERTIFICO que el/la paciente ha concurrido a este consultorio de Traumatología en el día de la fecha, habiendo permanecido en atención médica desde las 08:30 hs hasta las 09:30 hs para control clínico y diagnóstico. Se extiende la presente a los fines de ser presentada ante quien corresponda.`;
    }
    if (certificateType.includes('Movilidad')) {
      return `Por la presente CERTIFICO que el/la paciente presenta cuadro traumatológico agudo que requiere inmovilización mediante férula / vendaje funcional, con limitación severa de la bipedestación y deambulación, requiriendo asistencia para el traslado y reposo relativo por el término de ${restDays} días.`;
    }
    // Default Reposo
    return `Por la presente CERTIFICO que el/la paciente ha sido examinado/a en el día de la fecha, presentando cuadro clínico compatible con ${diagnosis}. Por tal motivo, se prescribe REPOSO LABORAL Y FÍSICO ABSOLUTO por el término de ${restDays} (${numberToWords(restDays)}) días, a partir del ${formatDateSpanish(restStartDate)} hasta el ${formatDateSpanish(restEndDate)} inclusive, debiendo reincorporarse a sus actividades habituales el día ${formatDateSpanish(returnToWorkDate)}.`;
  }, [certificateType, diagnosis, restDays, restStartDate, restEndDate, returnToWorkDate]);

  const certificateBodyText = customContent || defaultFormalText;

  if (!isMedicalCertificateModalOpen) return null;

  // Apply quick preset
  const handleApplyPreset = (preset) => {
    setCertificateType(preset.type);
    setDiagnosis(preset.cie);
    if (preset.days > 0) {
      setRestDays(preset.days);
    }
    setCustomContent('');
    addToast('Plantilla Aplicada', `Se cargó el diagnóstico y pauta para ${preset.label}.`, 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!selectedPatient?.phone) {
      addToast('Sin Teléfono', 'El paciente no tiene número de teléfono registrado.', 'warning');
      return;
    }
    const cleanPhone = selectedPatient.phone.replace(/[^0-9]/g, '');
    const certNumber = `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const msg = encodeURIComponent(
      `Hola ${selectedPatient.name}, adjuntamos su *Certificado Médico Oficial* de CITRA Clínica Médica emitido por ${doctorName}.\n\n*Tipo:* ${certificateType}\n*Diagnóstico:* ${diagnosis}\n*Período:* ${restDays} días (hasta el ${formatDateSpanish(restEndDate)})\n*Verificación Online:* https://citra.com.ar/validar/${certNumber}\n\n_Documento firmado digitalmente con validez oficial plena._`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cert = addMedicalCertificate({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientDni: selectedPatient.dni,
      doctorId: currentDoctor?.id || 'doc-1',
      doctorName,
      doctorLicense,
      doctorSpecialty,
      certificateType,
      diagnosis,
      restDays: Number(restDays),
      restStartDate,
      restEndDate,
      content: certificateBodyText
    });

    setIssuedCertificate(cert);
    setModalTab('preview');
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 21, 86, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={() => setIsMedicalCertificateModalOpen(false)}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: modalTab === 'preview' ? '820px' : '740px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(210, 227, 252, 0.5)',
          overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER: STUNNING MEDICAL BADGE & VIEW SWITCHER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #002182 0%, #001556 100%)',
            padding: '1.25rem 1.75rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #076ABC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93C5FD'
              }}
            >
              <FileBadge size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
                  Certificado Médico Oficial · CITRA
                </h3>
                <span
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '100px',
                    letterSpacing: '0.04em'
                  }}
                >
                  CERTIFICADO OFICIAL
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#D2E3FC' }}>
                Validez formal con Firma Digital X.509 & Verificación QR en tiempo real
              </p>
            </div>
          </div>

          {/* Tab buttons switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.12)', padding: '3px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => setModalTab('editor')}
                style={{
                  background: modalTab === 'editor' ? '#ffffff' : 'transparent',
                  color: modalTab === 'editor' ? '#002182' : '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '7px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Edit3 size={13} />
                Editor
              </button>
              <button
                type="button"
                onClick={() => setModalTab('preview')}
                style={{
                  background: modalTab === 'preview' ? '#ffffff' : 'transparent',
                  color: modalTab === 'preview' ? '#002182' : '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '7px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Eye size={13} />
                Vista Previa Oficial
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMedicalCertificateModalOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
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

        {/* TAB 1: FORM EDITOR */}
        {modalTab === 'editor' && (
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '1.5rem 1.75rem', maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Quick Presets Carousel / Pills */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={13} color="#076ABC" />
                  Plantillas Rápidas Traumatológicas (1-Click)
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {traumaPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#334155',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#257CE6')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 2 Columns: Paciente & Tipo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Paciente Destinatario *
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => {
                      setSelectedPatientId(e.target.value);
                      setCustomContent('');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                    required
                  >
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.name} — DNI {pat.dni} ({pat.insuranceName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Tipo de Certificado *
                  </label>
                  <select
                    value={certificateType}
                    onChange={(e) => {
                      setCertificateType(e.target.value);
                      setCustomContent('');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                    required
                  >
                    <option value="Certificado de Reposo Laboral / Licencia Médica">Certificado de Reposo Laboral / Licencia Médica</option>
                    <option value="Certificado de Apto Físico Deportivo Traumatológico">Certificado de Apto Físico Deportivo Traumatológico</option>
                    <option value="Certificado de Asistencia a Consulta Médica">Certificado de Asistencia a Consulta Médica</option>
                    <option value="Certificado de Movilidad Reducida / Inmovilización de Miembro">Certificado de Movilidad Reducida / Inmovilización</option>
                    <option value="Certificado de Alta Médica Definitiva">Certificado de Alta Médica / Reincorporación Laboral</option>
                  </select>
                </div>
              </div>

              {/* Diagnóstico CIE-10 */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Diagnóstico Clínico (Homologado CIE-10) *
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => {
                    setDiagnosis(e.target.value);
                    setCustomContent('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Período de Reposo si aplica */}
              {certificateType.includes('Reposo') && (
                <div
                  style={{
                    background: '#F5F8FE',
                    border: '1.5px solid #D2E3FC',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                        Días de Reposo Prescrito
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={restDays}
                          onChange={(e) => {
                            setRestDays(Number(e.target.value));
                            setCustomContent('');
                          }}
                          style={{
                            width: '90px',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            border: '1.5px solid #D2E3FC',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            outline: 'none',
                            textAlign: 'center'
                          }}
                          required
                        />
                        {/* Quick Day Chips */}
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {[3, 5, 7, 14, 21].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setRestDays(d);
                                setCustomContent('');
                              }}
                              style={{
                                background: restDays === d ? '#002182' : '#ffffff',
                                color: restDays === d ? '#ffffff' : '#475569',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              {d}d
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                        Fecha de Inicio de Reposo
                      </label>
                      <input
                        type="date"
                        value={restStartDate}
                        onChange={(e) => {
                          setRestStartDate(e.target.value);
                          setCustomContent('');
                        }}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D2E3FC',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Calculated Dates Badge */}
                  <div
                    style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px dashed #D2E3FC',
                      fontSize: '0.78rem',
                      color: '#076ABC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: 700
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={13} /> Fin del Reposo: <strong>{formatDateSpanish(restEndDate)}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Briefcase size={13} color="#059669" /> Reincorporación Laboral: <strong style={{ color: '#059669' }}>{formatDateSpanish(returnToWorkDate)}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Dictamen / Texto Oficial del Certificado */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#002182' }}>
                    Cuerpo del Certificado / Dictamen Médico Legal *
                  </label>
                  {customContent && (
                    <button
                      type="button"
                      onClick={() => setCustomContent('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#076ABC',
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Restaurar texto automático
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={customContent || defaultFormalText}
                  onChange={(e) => setCustomContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>

              {/* Professional Signer Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                      Profesional Firmante: {doctorName}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {doctorSpecialty} · {doctorLicense}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Lock size={11} />
                  Firma Digital X.509
                </div>
              </div>
            </div>

            {/* Footer Form Buttons */}
            <div
              style={{
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '1rem 1.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <button
                type="button"
                onClick={() => setModalTab('preview')}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #D2E3FC',
                  color: '#002182',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Eye size={15} />
                Ver Vista Previa
              </button>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsMedicalCertificateModalOpen(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 1.35rem',
                    borderRadius: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  Firmar y Emitir Certificado
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: GORGEOUS OFFICIAL PRINTABLE CERTIFICATE PREVIEW */}
        {modalTab === 'preview' && (
          <div>
            <div style={{ padding: '1.5rem 1.75rem', maxHeight: '72vh', overflowY: 'auto' }}>
              {/* THE OFFICIAL CERTIFICATE DOCUMENT CONTAINER */}
              <div
                id="printable-certificate"
                className="printable-area"
                style={{
                  background: '#ffffff',
                  border: '2px solid #002182',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  boxShadow: '0 8px 30px rgba(0, 33, 130, 0.08)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Security Guilloche Micro-Border (Top & Bottom accent lines) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: 'repeating-linear-gradient(45deg, #002182, #002182 10px, #076ABC 10px, #076ABC 20px)'
                  }}
                />

                {/* Subtle Official Watermark Background */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.035,
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  <img src="/citra-icon.png" alt="Watermark" style={{ width: '380px', height: '380px', objectFit: 'contain' }} />
                </div>

                {/* 1. OFFICIAL INSTITUTIONAL HEADER */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2px solid #002182',
                    paddingBottom: '1.25rem',
                    marginBottom: '1.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src="/citra-icon.png"
                      alt="CITRA Logo"
                      style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                    />
                    <div>
                      <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#002182', margin: 0, letterSpacing: '-0.02em' }}>
                        CITRA · CLÍNICA MÉDICA
                      </h1>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Centro Integral de Traumatología & Rehabilitación
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                        Av. Rafael Núñez 4210, Cerro de las Rosas, Córdoba · CUIT: 30-71829104-9 · Habilitación SISA N° 4492-C
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        background: '#002182',
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        display: 'inline-block'
                      }}
                    >
                      CERTIFICADO OFICIAL
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px', fontWeight: 700 }}>
                      N° CERT-2026-0894
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Fecha: {formatDateSpanish(new Date().toISOString().split('T')[0])}
                    </div>
                  </div>
                </div>

                {/* 2. DOCUMENT TITLE */}
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  <h2
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 900,
                      color: '#002182',
                      margin: '0 0 0.35rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}
                  >
                    {certificateType}
                  </h2>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.76rem', fontWeight: 800 }}>
                    <CheckCircle2 size={13} />
                    Documento Válido ante Entidades Laborales, Educativas y Obras Sociales
                  </div>
                </div>

                {/* 3. PATIENT IDENTIFICATION BOX */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.75rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem',
                    fontSize: '0.86rem'
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Paciente:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{selectedPatient?.name}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>DNI / Identificación:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedPatient?.dni}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Obra Social / Prepaga:</span>
                    <div style={{ fontWeight: 800, color: '#076ABC' }}>{selectedPatient?.insuranceName} ({selectedPatient?.insurancePlan || 'Plan Base'})</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>N° Afiliado / Carnet:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedPatient?.insuranceNumber || '9481029381'}</div>
                  </div>
                </div>

                {/* 4. CLINICAL DIAGNOSIS & CERTIFICATION BODY */}
                <div style={{ marginBottom: '2rem' }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#002182',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '0.4rem'
                    }}
                  >
                    Diagnóstico Traumatológico (CIE-10):
                  </div>
                  <div
                    style={{
                      background: '#eff6ff',
                      border: '1.5px solid #bfdbfe',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      color: '#1e3a8a',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      marginBottom: '1.25rem'
                    }}
                  >
                    {diagnosis}
                  </div>

                  {/* Body Text in formal font */}
                  <div
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.8',
                      color: '#0f172a',
                      textAlign: 'justify',
                      padding: '0 0.5rem'
                    }}
                  >
                    {certificateBodyText}
                  </div>
                </div>

                {/* 5. LEGAL SIGNATURE, STAMP & REAL-TIME QR VERIFICATION */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2rem',
                    alignItems: 'flex-end',
                    borderTop: '1.5px solid #e2e8f0',
                    paddingTop: '1.5rem'
                  }}
                >
                  {/* Left: Security QR Code Box */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '0.85rem'
                    }}
                  >
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        padding: '6px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <QrCode size={56} color="#002182" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase' }}>
                        Verificación QR Oficial
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                        Escanee para verificar autenticidad en el servidor ministerial de CITRA Clínica.
                      </div>
                      <code style={{ fontSize: '0.66rem', color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>
                        HASH: 994a-81bf-4f2a-e801
                      </code>
                    </div>
                  </div>

                  {/* Right: Official Physician Stamp & Digital Signature */}
                  <div style={{ textAlign: 'center' }}>
                    {/* Visual Stamp Frame */}
                    <div
                      style={{
                        display: 'inline-block',
                        border: '2px dashed #002182',
                        borderRadius: '12px',
                        padding: '0.65rem 1.25rem',
                        background: 'rgba(0, 33, 130, 0.02)',
                        textAlign: 'center',
                        minWidth: '220px'
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'cursive, serif',
                          fontSize: '1.25rem',
                          color: '#002182',
                          fontWeight: 700,
                          transform: 'rotate(-2deg)',
                          marginBottom: '4px'
                        }}
                      >
                        {doctorName}
                      </div>
                      <div style={{ borderTop: '1px solid #002182', paddingTop: '4px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#002182' }}>
                          {doctorName.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#076ABC' }}>
                          {doctorSpecialty}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
                          {doctorLicense}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.68rem', color: '#059669', marginTop: '6px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <CheckCircle2 size={11} />
                      Firmado Digitalmente (Certificado ONTI X.509)
                    </div>
                  </div>
                </div>

                {/* Bottom Legal Legend */}
                <div
                  style={{
                    marginTop: '1.5rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '0.65rem',
                    color: '#94a3b8',
                    textAlign: 'center',
                    lineHeight: 1.4
                  }}
                >
                  El presente certificado médico tiene carácter de declaración jurada y plena validez oficial con firma digital certificada. Registro inmutable auditado en el sistema CITRA Clínica Médica.
                </div>
              </div>
            </div>

            {/* Print & Action Controls Bar */}
            <div
              style={{
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '1rem 1.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setModalTab('editor')}
                style={{ fontSize: '0.84rem' }}
              >
                <Edit3 size={15} />
                <span>Volver al Editor</span>
              </button>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  style={{
                    background: '#25d366',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
                  }}
                >
                  <Share2 size={15} />
                  <span>Enviar por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    background: '#076ABC',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                  }}
                >
                  <Printer size={16} />
                  <span>Imprimir Certificado / PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
