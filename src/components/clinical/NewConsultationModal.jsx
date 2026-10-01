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
    scopedPatients,
    consultations,
    setSelectedConsultationForPrint,
    addConsultation,
    updateConsultation,
    addToast
  } = useClinic();

  // Active doctor resolution (strictly current authenticated physician or appointment's doctor)
  const activeDoctor = useMemo(() => {
    if (isDoctor && currentDoctor) return currentDoctor;
    if (consultationPreloadData?.doctorId) {
      const found = doctors.find((d) => d.id === consultationPreloadData.doctorId);
      if (found) return found;
    }
    if (currentDoctor) return currentDoctor;
    return doctors[0] || null;
  }, [isDoctor, currentDoctor, doctors, consultationPreloadData]);

  const initialVitals = {
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    weight: '',
    height: '',
    bmi: '',
    bmiCategory: ''
  };

  const [formData, setFormData] = useState({
    appointmentId: '',
    patientId: '',
    patientName: '',
    patientDni: '',
    patientInsurance: '',
    doctorId: activeDoctor?.id || '',
    doctorName: activeDoctor?.name || '',
    doctorLicense: activeDoctor?.license || '',
    specialtyName: activeDoctor?.specialty || '',
    reason: '',
    symptoms: '',
    vitals: initialVitals,
    diagnosis: '',
    secondaryDiagnosis: '',
    evolution: '',
    prescriptions: [],
    indications: '',
    studiesRequested: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosisQuery, setDiagnosisQuery] = useState('');
  const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState(false);

  // Search state for patients (fast even with 1000+ patients)
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isPatientSearchOpen, setIsPatientSearchOpen] = useState(false);
  const [isChangingPatient, setIsChangingPatient] = useState(false);

  // Fast filtered patients for combobox (capped at 15 for optimal performance)
  const filteredPatients = useMemo(() => {
    const list = isDoctor ? scopedPatients : patients;
    if (!patientSearchQuery.trim()) {
      return list.slice(0, 15);
    }
    const q = patientSearchQuery.toLowerCase().trim();
    return list
      .filter((p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.dni && p.dni.includes(q)) ||
        (p.insuranceName && p.insuranceName.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [scopedPatients, patients, isDoctor, patientSearchQuery]);

  // Sync when modal opens or preload changes
  useEffect(() => {
    if (!isNewConsultationModalOpen) {
      setIsChangingPatient(false);
      setIsPatientSearchOpen(false);
      setPatientSearchQuery('');
      return;
    }

    if (consultationPreloadData) {
      const targetPat = patients.find((p) => p.id === consultationPreloadData.patientId) || null;
      const existingAppCons = consultationPreloadData.appointmentId
        ? (consultations || []).find((c) => c.appointmentId === consultationPreloadData.appointmentId)
        : null;

      setIsChangingPatient(false);
      setFormData((prev) => ({
        ...prev,
        appointmentId: consultationPreloadData.appointmentId || '',
        patientId: targetPat?.id || consultationPreloadData.patientId || '',
        patientName: targetPat?.name || consultationPreloadData.patientName || '',
        patientDni: targetPat?.dni || consultationPreloadData.patientDni || '',
        patientInsurance: targetPat?.insuranceName || consultationPreloadData.patientInsurance || '',
        doctorId: activeDoctor?.id || '',
        doctorName: activeDoctor?.name || '',
        doctorLicense: activeDoctor?.license || '',
        specialtyName: activeDoctor?.specialty || '',
        reason: existingAppCons?.reason || consultationPreloadData.reason || '',
        symptoms: existingAppCons?.symptoms || '',
        evolution: existingAppCons?.evolution || consultationPreloadData.evolution || '',
        diagnosis: existingAppCons?.diagnosis || consultationPreloadData.diagnosis || '',
        secondaryDiagnosis: existingAppCons?.secondaryDiagnosis || '',
        vitals: existingAppCons?.vitals || consultationPreloadData.vitals || initialVitals,
        prescriptions: existingAppCons?.prescriptions || consultationPreloadData.prescriptions || [],
        indications: existingAppCons?.indications || consultationPreloadData.indications || '',
        studiesRequested: existingAppCons?.studiesRequested || consultationPreloadData.studiesRequested || ''
      }));
    } else {
      setIsChangingPatient(true);
      setFormData((prev) => ({
        ...prev,
        appointmentId: '',
        patientId: '',
        patientName: '',
        patientDni: '',
        patientInsurance: '',
        doctorId: activeDoctor?.id || '',
        doctorName: activeDoctor?.name || '',
        doctorLicense: activeDoctor?.license || '',
        specialtyName: activeDoctor?.specialty || '',
        reason: '',
        symptoms: '',
        vitals: initialVitals,
        diagnosis: '',
        secondaryDiagnosis: '',
        evolution: '',
        prescriptions: [],
        indications: '',
        studiesRequested: ''
      }));
    }
  }, [consultationPreloadData, isNewConsultationModalOpen, patients, activeDoctor, consultations]);

  const currentPatient = patients.find((p) => p.id === formData.patientId) || null;

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

    if (isSubmitting) return;

    if (!formData.patientName || !formData.diagnosis || !formData.diagnosis.trim()) {
      addToast('Datos Incompletos', 'Debe seleccionar un paciente e indicar el diagnóstico principal.', 'warning');
      return;
    }

    if (formData.diagnosis.trim().length < 2) {
      addToast('Diagnóstico Requerido', 'Ingrese un diagnóstico clínico válido.', 'warning');
      return;
    }

    if (existingForAppointment) {
      setIsSubmitting(true);
      try {
        updateConsultation(existingForAppointment.id, {
          reason: formData.reason,
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          secondaryDiagnosis: formData.secondaryDiagnosis,
          evolution: formData.evolution,
          vitals: formData.vitals,
          prescriptions: formData.prescriptions,
          indications: formData.indications,
          studiesRequested: formData.studiesRequested
        });
        setIsSubmitting(false);
        setIsNewConsultationModalOpen(false);
      } catch (err) {
        setIsSubmitting(false);
        addToast('Error al Guardar', 'No se pudieron actualizar los datos de la consulta.', 'error');
      }
      return;
    }

    setIsSubmitting(true);
    try {
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
    } catch (err) {
      console.error('Error al registrar consulta:', err);
      addToast('Error', 'No se pudo asentar la consulta médica.', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Historia Clínica Electrónica · Registro ambulatorio y prescripción médica
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
            {/* NOTICE: APPOINTMENT WITH PREVIOUS CONSULTATION */}
            {existingForAppointment && (
              <div
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '10px',
                  padding: '0.75rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#0369a1'
                }}
              >
                <FileText size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>
                  Este turno cuenta con una atención registrada ({existingForAppointment.date} {existingForAppointment.time} hs). Los datos fueron cargados para que pueda revisarlos, actualizarlos o complementar la evolución.
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

                {formData.patientId && !isChangingPatient ? (
                  /* Selected Patient Card */
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.95rem',
                      borderRadius: '10px',
                      border: '1.5px solid #bfdbfe',
                      background: '#ffffff',
                      boxShadow: '0 2px 6px rgba(0, 33, 130, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#002182',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          flexShrink: 0
                        }}
                      >
                        {(formData.patientName || 'P').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {formData.patientName}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span>DNI: <strong style={{ color: '#002182' }}>{formData.patientDni}</strong></span>
                          <span>·</span>
                          <span style={{ color: '#076ABC', fontWeight: 600 }}>{formData.patientInsurance || 'Particular'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPatient(true);
                        setPatientSearchQuery('');
                        setIsPatientSearchOpen(true);
                      }}
                      style={{
                        background: '#eff6ff',
                        color: '#076ABC',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        marginLeft: '8px'
                      }}
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  /* High-Performance Search Combobox (Supports 1000+ patients) */
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={patientSearchQuery}
                        onChange={(e) => {
                          setPatientSearchQuery(e.target.value);
                          setIsPatientSearchOpen(true);
                        }}
                        onFocus={() => setIsPatientSearchOpen(true)}
                        placeholder="Buscar paciente por nombre, DNI o cobertura médica..."
                        style={{
                          width: '100%',
                          padding: '0.7rem 2.2rem 0.7rem 0.95rem',
                          borderRadius: '10px',
                          border: '1.5px solid #076ABC',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          background: '#ffffff',
                          outline: 'none',
                          boxSizing: 'border-box',
                          color: '#0f172a'
                        }}
                        autoFocus={isChangingPatient}
                      />
                      <Search size={16} color="#076ABC" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>

                    {isPatientSearchOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          boxShadow: '0 10px 25px rgba(0, 33, 130, 0.15)',
                          zIndex: 100,
                          maxHeight: '260px',
                          overflowY: 'auto',
                          marginTop: '4px'
                        }}
                      >
                        {filteredPatients.length === 0 ? (
                          <div style={{ padding: '0.85rem 1rem', fontSize: '0.84rem', color: '#64748b', textAlign: 'center' }}>
                            No se encontraron pacientes para "{patientSearchQuery}"
                          </div>
                        ) : (
                          filteredPatients.map((pat) => (
                            <div
                              key={pat.id}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  patientId: pat.id,
                                  patientName: pat.name,
                                  patientDni: pat.dni,
                                  patientInsurance: pat.insuranceName || 'Particular'
                                }));
                                setIsChangingPatient(false);
                                setIsPatientSearchOpen(false);
                                setPatientSearchQuery('');
                              }}
                              style={{
                                padding: '0.65rem 1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background 0.12s ease'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f9ff')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                            >
                              <div>
                                <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>{pat.name}</strong>
                                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                  DNI: <strong style={{ color: '#002182' }}>{pat.dni}</strong> · {pat.insuranceName || 'Particular'} {pat.insurancePlan ? `(${pat.insurancePlan})` : ''}
                                </div>
                              </div>
                              <span style={{ background: '#eff6ff', color: '#076ABC', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                                Seleccionar
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                    Signos Vitales & Medición Antropométrica (Opcional)
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
                  Diagnóstico Principal (CIE-10 o Escrito Libre) *
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
                    placeholder="Buscar CIE-10 o escribir diagnóstico personalizado..."
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
                    {formData.diagnosis.trim().length > 0 && (
                      <div
                        onClick={() => {
                          setShowDiagnosisDropdown(false);
                        }}
                        style={{
                          padding: '0.65rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.84rem',
                          background: '#f0fdf4',
                          borderBottom: '1.5px solid #bbf7d0',
                          color: '#166534',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>✍ Usar diagnóstico ingresado: <strong>"{formData.diagnosis}"</strong></span>
                      </div>
                    )}
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
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? '#94a3b8' : '#002182',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.6rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 33, 130, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#001a66';
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#002182';
                }}
              >
                <CheckCircle2 size={17} />
                {isSubmitting ? 'Registrando...' : hasExistingHC ? 'Guardar Evolución' : 'Abrir Historia Clínica'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
