import React, { useState, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CIE10_COMMON_DIAGNOSES } from '../../data/mockData';
import {
  Stethoscope,
  Activity,
  Plus,
  Trash2,
  AlertTriangle,
  Pill,
  X,
  CheckCircle2,
  Lock,
  User,
  ShieldCheck,
  FileText,
  Search,
  ClipboardList
} from 'lucide-react';

export const NewConsultationModal = () => {
  const {
    isNewConsultationModalOpen,
    setIsNewConsultationModalOpen,
    consultationPreloadData,
    doctors,
    currentDoctor,
    isDoctor,
    patients,
    consultations,
    setSelectedConsultationForPrint,
    addConsultation,
    addToast
  } = useClinic();

  // Active doctor resolution (strictly Dr. Blanco when in doctor role)
  const activeDoctor = useMemo(() => {
    if (isDoctor && currentDoctor) return currentDoctor;
    return (
      doctors.find((d) => d.name?.includes('Blanco')) ||
      doctors[0] || {
        id: 'doc-1',
        name: 'Dr. Alejandro Blanco',
        license: 'M.P. 34.892 · M.N. 114.829',
        specialty: 'Traumatología & Cirugía Artroscópica'
      }
    );
  }, [isDoctor, currentDoctor, doctors]);

  const [formData, setFormData] = useState({
    appointmentId: '',
    patientId: '',
    patientName: '',
    patientDni: '',
    patientInsurance: '',
    doctorId: activeDoctor.id,
    doctorName: activeDoctor.name,
    doctorLicense: activeDoctor.license || 'M.P. 34.892 · M.N. 114.829',
    specialtyName: activeDoctor.specialty || 'Traumatología & Cirugía Artroscópica',
    reason: '',
    symptoms: '',
    vitals: {
      bpSystolic: 120,
      bpDiastolic: 80,
      heartRate: 72,
      respiratoryRate: 16,
      temperature: 36.5,
      weight: 74,
      height: 1.74,
      bmi: 24.4,
      bmiCategory: 'Peso normal'
    },
    diagnosis: 'S83.5 - Traumatismo / Reconstrucción de ligamento cruzado anterior de rodilla',
    secondaryDiagnosis: '',
    evolution: '',
    prescriptions: [],
    indications: '',
    studiesRequested: ''
  });

  const [diagnosisQuery, setDiagnosisQuery] = useState('');
  const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState(false);

  // Sync when modal opens or preload changes
  useEffect(() => {
    if (!isNewConsultationModalOpen) return;

    if (consultationPreloadData) {
      const targetPat = patients.find((p) => p.id === consultationPreloadData.patientId) || patients[0];
      setFormData((prev) => ({
        ...prev,
        appointmentId: consultationPreloadData.appointmentId || '',
        patientId: targetPat?.id || '',
        patientName: targetPat?.name || consultationPreloadData.patientName || '',
        patientDni: targetPat?.dni || consultationPreloadData.patientDni || '',
        patientInsurance: targetPat?.insuranceName || '',
        doctorId: activeDoctor.id,
        doctorName: activeDoctor.name,
        doctorLicense: activeDoctor.license,
        specialtyName: activeDoctor.specialty,
        reason: consultationPreloadData.reason || '',
        evolution: consultationPreloadData.evolution || '',
        diagnosis: consultationPreloadData.diagnosis || prev.diagnosis
      }));
    } else {
      const defaultPat = patients[0] || {};
      setFormData((prev) => ({
        ...prev,
        appointmentId: '',
        patientId: defaultPat.id || '',
        patientName: defaultPat.name || '',
        patientDni: defaultPat.dni || '',
        patientInsurance: defaultPat.insuranceName || '',
        doctorId: activeDoctor.id,
        doctorName: activeDoctor.name,
        doctorLicense: activeDoctor.license,
        specialtyName: activeDoctor.specialty,
        reason: 'Control clínico traumatológico programado',
        diagnosis: 'S83.5 - Traumatismo / Reconstrucción de ligamento cruzado anterior de rodilla',
        secondaryDiagnosis: '',
        evolution:
          'Paciente lúcido, afebril, hemodinámicamente estable. Al examen ortopédico traumatológico: adecuada alineación del eje de extremidad, arcos de movilidad conservados dentro del rango esperado. Sin signos de flogosis ni derrame articular agudo. Pulsos periféricos distales presentes y simétricos.',
        prescriptions: [
          { medication: 'Diclofenac 75mg', dosage: '1 comp.', frequency: 'Cada 12 hs', duration: '5 días' },
          { medication: 'Omeprazol 20mg', dosage: '1 cáps.', frequency: 'En ayunas', duration: '7 días' }
        ],
        indications:
          '1. Crioterapia local 15 minutos 3 veces al día post-actividad.\n2. Continuar plan de rehabilitación kinesiológica y fortalecimiento en CITRA.\n3. Pautas de alarma ante dolor súbito o impotencia funcional.',
        studiesRequested: 'Resonancia Magnética Nuclear de Rodilla (RMN)'
      }));
    }
  }, [consultationPreloadData, isNewConsultationModalOpen, patients, activeDoctor]);

  const currentPatient = patients.find((p) => p.id === formData.patientId) || patients[0];

  // Detect if this specific appointment already has a registered consultation
  const existingForAppointment = useMemo(() => {
    if (!formData.appointmentId) return null;
    return (consultations || []).find((c) => c.appointmentId === formData.appointmentId);
  }, [formData.appointmentId, consultations]);

  // Detect previous consultations for this patient (existing Historia Clínica)
  const patientConsultations = useMemo(() => {
    const targetId = formData.patientId || currentPatient?.id;
    const targetDni = formData.patientDni || currentPatient?.dni;
    if (!targetId && !targetDni) return [];
    return (consultations || []).filter(
      (c) => (targetId && c.patientId === targetId) || (targetDni && c.patientDni === targetDni)
    );
  }, [formData.patientId, formData.patientDni, currentPatient, consultations]);

  const hasExistingHC = patientConsultations.length > 0;

  if (!isNewConsultationModalOpen) return null;

  // Recalculate BMI live
  const handleVitalsChange = (field, value) => {
    const numVal = value === '' ? '' : Number(value);
    const updatedVitals = { ...formData.vitals, [field]: numVal };
    if (field === 'weight' || field === 'height') {
      const w = field === 'weight' ? numVal : formData.vitals.weight;
      const h = field === 'height' ? numVal : formData.vitals.height;
      if (w > 0 && h > 0) {
        const bmiVal = Number((w / (h * h)).toFixed(1));
        let cat = 'Peso normal';
        if (bmiVal < 18.5) cat = 'Bajo peso';
        else if (bmiVal >= 25 && bmiVal < 30) cat = 'Sobrepeso';
        else if (bmiVal >= 30) cat = 'Obesidad';
        updatedVitals.bmi = bmiVal;
        updatedVitals.bmiCategory = cat;
      }
    }
    setFormData((prev) => ({ ...prev, vitals: updatedVitals }));
  };

  // Prescriptions handling
  const handleAddPrescription = () => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { medication: '', dosage: '1 comp.', frequency: 'Cada 8 hs', duration: '5 días' }
      ]
    }));
  };

  const handleRemovePrescription = (index) => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const handlePrescriptionChange = (index, field, value) => {
    setFormData((prev) => {
      const list = [...prev.prescriptions];
      list[index][field] = value;
      return { ...prev, prescriptions: list };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (existingForAppointment) {
      addToast(
        'Turno Ya Atendido',
        'Este turno ya cuenta con una consulta registrada en la Historia Clínica del paciente. No se pueden duplicar asientos clínicos para el mismo turno.',
        'warning'
      );
      return;
    }

    if (!formData.patientName || !formData.diagnosis) {
      addToast('Datos Incompletos', 'Debe seleccionar un paciente y registrar el diagnóstico principal.', 'warning');
      return;
    }

    const payload = {
      ...formData,
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      doctorLicense: activeDoctor.license,
      specialtyName: activeDoctor.specialty,
      studiesRequested: formData.studiesRequested
        ? typeof formData.studiesRequested === 'string'
          ? formData.studiesRequested.split(',').map((s) => s.trim()).filter(Boolean)
          : formData.studiesRequested
        : [],
      prescriptions: formData.prescriptions.filter((p) => p.medication && p.medication.trim())
    };

    addConsultation(payload);
    setIsNewConsultationModalOpen(false);
    addToast(
      hasExistingHC ? 'Evolución Clínica Registrada' : 'Consulta Médica Registrada',
      hasExistingHC
        ? `Se anexó la nueva evolución a la Historia Clínica de ${formData.patientName}.`
        : `Apertura exitosa de Historia Clínica para ${formData.patientName}.`,
      'success'
    );
  };

  const matchedCIE10 = diagnosisQuery
    ? CIE10_COMMON_DIAGNOSES.filter(
        (d) =>
          d.label.toLowerCase().includes(diagnosisQuery.toLowerCase()) ||
          d.code.toLowerCase().includes(diagnosisQuery.toLowerCase())
      )
    : CIE10_COMMON_DIAGNOSES;

  // TA status indicator
  const getBPStatus = (sys, dia) => {
    if (!sys || !dia) return { label: 'Normal', color: '#059669', bg: '#ecfdf5' };
    if (sys >= 140 || dia >= 90) return { label: 'HTA', color: '#dc2626', bg: '#fef2f2' };
    if (sys >= 120 || dia >= 80) return { label: 'Pre-HTA', color: '#d97706', bg: '#fffbeb' };
    return { label: 'Normotenso', color: '#059669', bg: '#ecfdf5' };
  };

  const bpStatus = getBPStatus(formData.vitals.bpSystolic, formData.vitals.bpDiastolic);

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto'
      }}
      onClick={() => setIsNewConsultationModalOpen(false)}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '1120px',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 33, 130, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLEAN, ELEGANT CLINICAL HEADER */}
        <div
          style={{
            padding: '1.4rem 2rem',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#002182'
              }}
            >
              <Stethoscope size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Registrar Consulta Médica & Evolución
                </h2>
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '100px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={13} /> Firma Digital X.509
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Historia Clínica Electrónica · Registro ambulatorio y prescripción oficial
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNewConsultationModalOpen(false)}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
            }}
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY (SPACIOUS & SCROLLABLE) */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              padding: '1.75rem 2rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.75rem'
            }}
          >
            {/* ALERT: APPOINTMENT ALREADY HAS A REGISTERED CONSULTATION IN HC */}
            {existingForAppointment && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#dc2626',
                      flexShrink: 0
                    }}
                  >
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <strong style={{ color: '#991b1b', fontSize: '0.88rem' }}>
                      Este turno ya cuenta con consulta registrada en la Historia Clínica
                    </strong>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#7f1d1d' }}>
                      El paciente ya fue atendido para este turno ({existingForAppointment.date} {existingForAppointment.time} hs). No se puede duplicar la atención para el mismo paciente.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewConsultationModalOpen(false);
                    if (setSelectedConsultationForPrint) {
                      setSelectedConsultationForPrint(existingForAppointment);
                    }
                  }}
                  style={{
                    background: '#002182',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0, 33, 130, 0.2)'
                  }}
                >
                  Ver Consulta Existente
                </button>
              </div>
            )}

            {/* NOTICE: PATIENT ALREADY HAS AN ACTIVE HISTORIA CLÍNICA */}
            {!existingForAppointment && hasExistingHC && (
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '0.7rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="#002182" />
                  <span style={{ fontSize: '0.82rem', color: '#1e3a8a' }}>
                    <strong>Historia Clínica Activa (HC-{currentPatient?.dni || formData.patientDni}):</strong> {formData.patientName} ya tiene {patientConsultations.length} {patientConsultations.length === 1 ? 'consulta previa registrada' : 'consultas previas registradas'}. Esta atención se guardará como una <strong>nueva evolución</strong> en su expediente único.
                  </span>
                </div>
                <span
                  style={{
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Expediente Único
                </span>
              </div>
            )}

            {/* 1. PATIENT IDENTIFICATION & CLINICAL SUMMARY CARD */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr',
                gap: '1.5rem',
                alignItems: 'center'
              }}
            >
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: '#334155',
                    marginBottom: '0.5rem'
                  }}
                >
                  <User size={15} color="#002182" />
                  Paciente en Atención *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => {
                    const p = patients.find((pat) => pat.id === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      patientId: e.target.value,
                      patientName: p ? p.name : prev.patientName,
                      patientDni: p ? p.dni : prev.patientDni,
                      patientInsurance: p ? p.insuranceName : prev.patientInsurance
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    background: '#ffffff',
                    outline: 'none',
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                  required
                >
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.name} — DNI {pat.dni} ({pat.insuranceName || 'Particular'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Quick Context Badges */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '0.9rem 1.15rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Cobertura Médica:</span>
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#1e40af',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {currentPatient?.insuranceName || 'Particular'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Identificación:</span>
                  <span style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: 700 }}>
                    DNI {currentPatient?.dni}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem', marginTop: '0.1rem' }}>
                  {currentPatient?.allergies && currentPatient.allergies.length > 0 ? (
                    <span
                      style={{
                        color: '#b91c1c',
                        background: '#fef2f2',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <AlertTriangle size={13} /> Alergias: {currentPatient.allergies.join(', ')}
                    </span>
                  ) : (
                    <span
                      style={{
                        color: '#059669',
                        background: '#ecfdf5',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <CheckCircle2 size={13} /> Sin alergias medicamentosas registradas
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. MOTIVO PRINCIPAL DE CONSULTA */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '0.45rem'
                }}
              >
                <FileText size={16} color="#002182" />
                Motivo Principal de Consulta & Anamnesis *
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Ej: Dolor articular en rodilla derecha con limitación a la carga tras actividad deportiva..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a',
                  fontWeight: 600,
                  transition: 'border-color 0.15s ease'
                }}
                required
              />
            </div>

            {/* 3. SIGNOS VITALES & MEDIDAS ANTROPOMÉTRICAS */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '0.65rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={17} color="#002182" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                    Signos Vitales & Medición Antropométrica
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span
                    style={{
                      background: bpStatus.bg,
                      color: bpStatus.color,
                      padding: '3px 9px',
                      borderRadius: '100px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      border: `1px solid ${bpStatus.color}30`
                    }}
                  >
                    TA: {bpStatus.label}
                  </span>

                  <span
                    style={{
                      background:
                        formData.vitals.bmi >= 30
                          ? '#fef2f2'
                          : formData.vitals.bmi >= 25
                          ? '#fffbeb'
                          : '#ecfdf5',
                      color:
                        formData.vitals.bmi >= 30
                          ? '#dc2626'
                          : formData.vitals.bmi >= 25
                          ? '#d97706'
                          : '#059669',
                      padding: '3px 9px',
                      borderRadius: '100px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      border: '1px solid currentColor'
                    }}
                  >
                    IMC: {formData.vitals.bmi} ({formData.vitals.bmiCategory})
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '1rem'
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                    TA Sistólica (mmHg)
                  </label>
                  <input
                    type="number"
                    value={formData.vitals.bpSystolic}
                    onChange={(e) => handleVitalsChange('bpSystolic', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                    TA Diastólica (mmHg)
                  </label>
                  <input
                    type="number"
                    value={formData.vitals.bpDiastolic}
                    onChange={(e) => handleVitalsChange('bpDiastolic', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                    Frec. Cardíaca (lpm)
                  </label>
                  <input
                    type="number"
                    value={formData.vitals.heartRate}
                    onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitals.temperature}
                    onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitals.weight}
                    onChange={(e) => handleVitalsChange('weight', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                    Altura (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.vitals.height}
                    onChange={(e) => handleVitalsChange('height', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 4. DIAGNÓSTICO CLÍNICO (CIE-10) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem' }}>
                  Diagnóstico Principal (CIE-10) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => {
                      setFormData({ ...formData, diagnosis: e.target.value });
                      setDiagnosisQuery(e.target.value);
                      setShowDiagnosisDropdown(true);
                    }}
                    onFocus={() => setShowDiagnosisDropdown(true)}
                    placeholder="Buscar diagnóstico o código CIE-10..."
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.2rem 0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                    required
                  />
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>

                {showDiagnosisDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                      zIndex: 60,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      marginTop: '4px'
                    }}
                  >
                    {matchedCIE10.map((d) => (
                      <div
                        key={d.code}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, diagnosis: d.label }));
                          setShowDiagnosisDropdown(false);
                        }}
                        style={{
                          padding: '0.65rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.84rem',
                          borderBottom: '1px solid #f1f5f9',
                          color: '#0f172a',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                      >
                        <strong style={{ color: '#002182' }}>{d.code}</strong> — {d.label.split(' - ')[1] || d.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem' }}>
                  Diagnóstico Secundario / Comorbilidad
                </label>
                <input
                  type="text"
                  value={formData.secondaryDiagnosis}
                  onChange={(e) => setFormData({ ...formData, secondaryDiagnosis: e.target.value })}
                  placeholder="Ej: M25.5 - Artralgia de rodilla leve"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>

            {/* 5. EVOLUCIÓN CLÍNICA & EXAMEN FÍSICO */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem' }}>
                Evolución Clínica & Examen Físico Especializado *
              </label>
              <textarea
                rows={4}
                value={formData.evolution}
                onChange={(e) => setFormData({ ...formData, evolution: e.target.value })}
                placeholder="Detalle de anamnesis dirigida, inspección articular, maniobras ortopédicas de estabilidad, goniometría, tono y estado neurovascular periférico..."
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  color: '#0f172a',
                  resize: 'vertical'
                }}
                required
              />
            </div>

            {/* 6. PRESCRIPCIÓN FARMACOLÓGICA (RP/) */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '0.65rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pill size={17} color="#002182" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                    Prescripción Farmacológica Digital (Rp/)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddPrescription}
                  style={{
                    background: '#eff6ff',
                    color: '#002182',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#dbeafe')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#eff6ff')}
                >
                  <Plus size={15} /> Agregar Fármaco
                </button>
              </div>

              {formData.prescriptions.length === 0 ? (
                <div style={{ fontSize: '0.84rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.4rem 0' }}>
                  No se han registrado medicamentos para esta consulta. Haga clic en "+ Agregar Fármaco" para incluir recetas oficiales.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {formData.prescriptions.map((presc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.2fr 1.6fr 1.2fr 36px',
                        gap: '0.75rem',
                        alignItems: 'center',
                        background: '#f8fafc',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Fármaco (Ej: Diclofenac 75mg)"
                        value={presc.medication}
                        onChange={(e) => handlePrescriptionChange(idx, 'medication', e.target.value)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#0f172a'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Dosis (Ej: 1 comp.)"
                        value={presc.dosage}
                        onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Frecuencia (Ej: Cada 12 hs)"
                        value={presc.frequency}
                        onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Duración (Ej: 5 días)"
                        value={presc.duration}
                        onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(idx)}
                        style={{
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          color: '#e11d48',
                          borderRadius: '6px',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.15s ease'
                        }}
                        title="Quitar fármaco"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. INDICACIONES MÉDICAS & ESTUDIOS COMPLEMENTARIOS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem' }}>
                  Indicaciones Médicas, Reposo & Pautas de Alarma
                </label>
                <textarea
                  rows={3}
                  value={formData.indications}
                  onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
                  placeholder="Instrucciones para el paciente, pautas kinésicas, reposo deportivo relativo, signos de alarma..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem' }}>
                  Solicitud de Estudios Complementarios
                </label>
                <textarea
                  rows={3}
                  value={formData.studiesRequested}
                  onChange={(e) => setFormData({ ...formData, studiesRequested: e.target.value })}
                  placeholder="Ej: Resonancia Magnética Nuclear de Rodilla (RMN) con protocolo ligamentario, Radiografía..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* CLEAN MODAL FOOTER */}
          <div
            style={{
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              padding: '1.2rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: hasExistingHC ? '#002182' : '#059669' }}>
              <ShieldCheck size={18} />
              <span>
                {hasExistingHC ? 'Evolución clínica — Registro acumulativo en expediente único' : 'Apertura de Historia Clínica — Validez Clínica Institucional (Ley 26.529)'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsNewConsultationModalOpen(false)}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                style={{
                  background: '#002182',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.6rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 33, 130, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#001a66')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#002182')}
              >
                <CheckCircle2 size={17} />
                {hasExistingHC ? 'Guardar Evolución' : 'Abrir Historia Clínica'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
