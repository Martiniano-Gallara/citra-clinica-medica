import React, { useState, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CIE10_COMMON_DIAGNOSES } from '../../data/mockData';
import {
  Stethoscope,
  Activity,
  Heart,
  Plus,
  Trash2,
  FileCheck,
  AlertTriangle,
  Pill,
  Sparkles,
  X,
  CheckCircle2,
  Lock,
  User,
  Shield,
  FileText,
  Calendar,
  Zap,
  ChevronDown,
  Search,
  Thermometer,
  Scale,
  FileSignature,
  Microscope,
  Check
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
    reason: 'Control clínico traumatológico programado',
    symptoms: '',
    vitals: {
      bpSystolic: 120,
      bpDiastolic: 80,
      heartRate: 74,
      respiratoryRate: 16,
      temperature: 36.6,
      weight: 72,
      height: 1.72,
      bmi: 24.3,
      bmiCategory: 'Peso normal'
    },
    diagnosis: 'S83.5 - Traumatismo / Reconstrucción de ligamento cruzado anterior de rodilla',
    secondaryDiagnosis: '',
    evolution:
      'Paciente refiere evolución favorable. Sin dolor en reposo ni episodios de inestabilidad articular. Rango de movilidad activa y pasiva conservado.',
    prescriptions: [],
    indications:
      '1. Continuar con plan de rehabilitación kinesiológica motora.\n2. Crioterapia local 15 minutos post-ejercicio.\n3. Pautas de alarma ante aumento brusco de dolor o inflamación.',
    studiesRequested: ''
  });

  const [diagnosisQuery, setDiagnosisQuery] = useState('');
  const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState(false);

  // Traumatology Specialized Clinical Protocols (1-Click Presets)
  const clinicalProtocols = [
    {
      label: '🦵 LCA / Post-quirúrgico',
      reason: 'Control evolutivo de rodilla post-reconstrucción ligamentaria LCA',
      diagnosis: 'S83.5 - Traumatismo / Reconstrucción de ligamento cruzado anterior de rodilla',
      evolution:
        'Paciente normotrófico, deambula con apoyo completo y brace articulado en 0°-90°. Heridas quirúrgicas limpias, bordes afrontados, sin flogosis ni secreciones. Rango de movilidad: flexión 110°, extensión completa 0°. Maniobra de Lachman (-) para neo-injerto, cajón anterior neutro. Choque rotuliano (-). Sin derrame articular a tensión.',
      prescriptions: [
        { medication: 'Diclofenac 75mg', dosage: '1 comp.', frequency: 'Cada 12 hs', duration: '5 días' },
        { medication: 'Omeprazol 20mg', dosage: '1 cáps.', frequency: 'En ayunas', duration: '7 días' }
      ],
      indications:
        '1. Crioterapia local 15 min 3 veces al día post-actividad.\n2. Continuar plan kinesiológico de propiocepción y fuerza de cuádriceps en CITRA.\n3. Control evolutivo en 15 días con nuevas mediciones goniométricas.',
      studies: 'Resonancia Magnética Nuclear de Rodilla (RMN)'
    },
    {
      label: '💥 Lumbalgia Aguda Mecánica',
      reason: 'Cuadro álgico lumbar agudo con limitación funcional para la bipedestación',
      diagnosis: 'M54.5 - Lumbalgia Aguda Severa con Radiculopatía L5',
      evolution:
        'Contractura bilateral de masas paravertebrales lumbares. Dolor a la palpación selectiva de apófisis espinosas L4-L5 y musculatura glútea. Maniobra de Lasègue bilateral negativa a 70°. Reflejos osteotendinosos rotulianos y aquilianos conservados simétricos (+/++). Sensibilidad táctil y propiocepción conservadas en ambos miembros inferiores.',
      prescriptions: [
        { medication: 'Meloxicam 15mg + Pridinol 4mg', dosage: '1 comp.', frequency: 'Cada 24 hs', duration: '7 días' },
        { medication: 'Paracetamol 1g', dosage: '1 comp.', frequency: 'Cada 8 hs condicional a dolor', duration: '5 días' }
      ],
      indications:
        '1. Reposo relativo 48-72 hs evitando esfuerzos y flexiones forzadas de columna.\n2. Aplicación de calor seco local 20 min cada 8 hs.\n3. Derivación a Fisioterapia y Kinesiología motora CITRA.',
      studies: 'Radiografía de Columna Lumbar Frente y Perfil'
    },
    {
      label: '🦶 Esguince Tobillo Grado II',
      reason: 'Traumatismo indirecto por mecanismo de inversión forzada en tobillo durante actividad física',
      diagnosis: 'S93.4 - Esguince y Desgarro de Ligamentos de Tobillo Grado II',
      evolution:
        'Edema perimaleolar moderado con hematoma en cara antero-externa de tobillo. Dolor exquisito a la palpación del ligamento peroneo-astragalino anterior (LPAA). Prueba de cajón anterior de tobillo estable. Criterios de Ottawa negativos para fractura ósea (sin dolor en maleolos ni base de 5to metatarsiano).',
      prescriptions: [
        { medication: 'Ibuprofeno 600mg', dosage: '1 comp.', frequency: 'Cada 8 hs con las comidas', duration: '5 días' }
      ],
      indications:
        '1. Protocolo RICE: Reposo, Hielo local x 15 min, Vendaje compresivo y Elevación del miembro.\n2. Apoyo parcial progresivo según tolerancia con bota Walker corta.\n3. Iniciar rehabilitación funcional de tobillo en CITRA.',
      studies: 'Radiografía de Tobillo Frente, Perfil y Proyección de Mortaja'
    },
    {
      label: '💪 Manguito Rotador / Hombro',
      reason: 'Omalgia de predominio nocturno y limitación dolorosa para la abducción mayor a 90°',
      diagnosis: 'M75.1 - Síndrome del Manguito Rotatorio / Tendinopatía Supraespinoso',
      evolution:
        'Dolor a la abducción activa entre 60° y 120° (arco doloroso subacromial positivo). Maniobra de Jobe positiva bilateral con predominio derecho. Maniobras de Neer y Hawkins-Kennedy positivas para pinzamiento subacromial. Movilidad pasiva conservada. Sin atrofia de fosas supra e infraespinosa.',
      prescriptions: [
        { medication: 'Diclofenac sódico 75mg', dosage: '1 comp.', frequency: 'Cada 12 hs', duration: '7 días' }
      ],
      indications:
        '1. Evitar elevación del brazo por encima de la línea del hombro.\n2. Crioterapia local post-esfuerzo.\n3. Plan kinesiológico de centrado humeral y fortalecimiento escapular.',
      studies: 'Ecografía de Partes Blandas de Hombro Alta Resolución'
    },
    {
      label: '🏃 Meniscopatía Rodilla',
      reason: 'Gonalgia interna con sensación de resalto y bloqueo articular transitorio',
      diagnosis: 'M23.2 - Trastorno de menisco debido a desgarro o rotura antigua',
      evolution:
        'Interlínea articular interna sensible a la palpación digital. Maniobra de McMurray positiva para cuerno posterior de menisco interno. Test de Apley positivo a la compresión y rotación externa. Sin derrame articular a tensión. Estabilidad ligamentaria antero-posterior y colateral conservada.',
      prescriptions: [
        { medication: 'Glucosamina + Condroitín', dosage: '1 sobre', frequency: 'Cada 24 hs disuelto en agua', duration: '30 días' },
        { medication: 'Meloxicam 15mg', dosage: '1 comp.', frequency: 'Cada 24 hs', duration: '5 días' }
      ],
      indications:
        '1. Evitar impacto y flexión profunda de rodilla mayor a 90°.\n2. Fortalecimiento isométrico de cuádriceps.\n3. Evaluación de indicación quirúrgica artroscópica según RMN.',
      studies: 'Resonancia Magnética Nuclear de Rodilla (RMN)'
    },
    {
      label: '🩺 Apto Físico / Control',
      reason: 'Evaluación ortopédica y traumatológica para aptitud deportiva anual',
      diagnosis: 'Z00.0 - Examen médico general de rutina / Certificado de aptitud física',
      evolution:
        'Eje de miembros inferiores alineado, sin discrepancia de longitud. Arcos de movilidad completos e indoloros en tobillos, rodillas, caderas y columna. Tono y trofismo muscular normales. Sin antecedentes traumáticos recientes ni signos de inestabilidad articular.',
      prescriptions: [],
      indications:
        '1. Se otorga apto físico traumatológico para práctica deportiva recreativa y competitiva.\n2. Mantener ejercicios de elongación y flexibilidad.\n3. Control periódico anual.',
      studies: ''
    }
  ];

  // Quick physical exam insertion chips
  const examChips = [
    'Marcha estable sin claudicación',
    'Rango de flexo-extensión completo sin dolor',
    'Sin tumefacción ni derrame articular',
    'Maniobra de Lachman (-) y Cajón (-)',
    'Criterios de Ottawa negativos sin dolor óseo',
    'Fuerza muscular 5/5 simétrica',
    'Pulsos periféricos presentes y simétricos',
    'Prueba de Lasègue negativa bilateral',
    'Sensibilidad táctil y térmica conservada',
    'Arcos de movilidad indoloros'
  ];

  // Quick medications
  const commonMeds = [
    { medication: 'Ibuprofeno 600mg', dosage: '1 comp.', frequency: 'Cada 8 hs con alimentos', duration: '5 días' },
    { medication: 'Diclofenac 75mg', dosage: '1 comp.', frequency: 'Cada 12 hs', duration: '5 días' },
    { medication: 'Meloxicam 15mg + Pridinol 4mg', dosage: '1 comp.', frequency: 'Cada 24 hs', duration: '7 días' },
    { medication: 'Paracetamol 1g', dosage: '1 comp.', frequency: 'Cada 8 hs condicional', duration: '3 días' },
    { medication: 'Omeprazol 20mg', dosage: '1 cáps.', frequency: 'En ayunas', duration: '14 días' },
    { medication: 'Glucosamina + Condroitín', dosage: '1 sobre', frequency: 'Cada 24 hs', duration: '30 días' }
  ];

  // Quick diagnostic study tags
  const studyChips = [
    'Resonancia Magnética (RMN)',
    'Radiografía Frente y Perfil',
    'Ecografía de Partes Blandas',
    'TAC Multicorte 3D',
    'Laboratorio Pre-quirúrgico Completo'
  ];

  // Quick reason/symptom tags
  const symptomChips = [
    '+ Dolor agudo',
    '+ Inflamación articular',
    '+ Limitación funcional',
    '+ Traumatismo deportivo',
    '+ Post-quirúrgico'
  ];

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
        reason: consultationPreloadData.reason || 'Control médico programado'
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
        evolution:
          'Paciente refiere buen estado general. Sin sintomatología aguda, arcos de movilidad conservados, sin bloqueos articulares.',
        prescriptions: [],
        indications: '1. Mantener reposo deportivo relativo.\n2. Continuar pautas de rehabilitación kinesiológica.'
      }));
    }
  }, [consultationPreloadData, isNewConsultationModalOpen, patients, activeDoctor]);

  if (!isNewConsultationModalOpen) return null;

  const currentPatient = patients.find((p) => p.id === formData.patientId) || patients[0];

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
  const handleAddPrescription = (medData = null) => {
    const newMed = medData || { medication: '', dosage: '', frequency: '', duration: '' };
    setFormData((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, newMed]
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

  // Insert physical exam phrase into evolution
  const handleAddExamPhrase = (phrase) => {
    setFormData((prev) => {
      const cleanPrev = prev.evolution ? prev.evolution.trim() : '';
      const separator = cleanPrev && !cleanPrev.endsWith('.') ? '. ' : cleanPrev ? ' ' : '';
      return {
        ...prev,
        evolution: `${cleanPrev}${separator}${phrase}.`
      };
    });
  };

  // Insert study requested
  const handleAddStudy = (study) => {
    setFormData((prev) => {
      const currentStudies = prev.studiesRequested ? prev.studiesRequested.split(',').map((s) => s.trim()) : [];
      if (currentStudies.includes(study)) return prev;
      return {
        ...prev,
        studiesRequested: currentStudies.length > 0 ? `${prev.studiesRequested}, ${study}` : study
      };
    });
  };

  // Apply protocol template
  const handleApplyProtocol = (proto) => {
    setFormData((prev) => ({
      ...prev,
      reason: proto.reason,
      diagnosis: proto.diagnosis,
      evolution: proto.evolution,
      prescriptions: [...proto.prescriptions],
      indications: proto.indications,
      studiesRequested: proto.studies || ''
    }));
    addToast('Protocolo Cargado', `Se aplicó el protocolo clínico para ${proto.label}.`, 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
        ? formData.studiesRequested.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      prescriptions: formData.prescriptions.filter((p) => p.medication && p.medication.trim())
    };

    addConsultation(payload);
    setIsNewConsultationModalOpen(false);
    addToast(
      'Consulta Médica Guardada & Firmada',
      `Evolución firmada digitalmente por ${activeDoctor.name} (${activeDoctor.license}).`,
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
    if (sys >= 140 || dia >= 90) return { label: 'HTA', color: '#dc2626', bg: '#fef2f2' };
    if (sys >= 120 || dia >= 80) return { label: 'Pre-HTA', color: '#b45309', bg: '#fef3c7' };
    return { label: 'Normotenso', color: '#059669', bg: '#ecfdf5' };
  };

  const bpStatus = getBPStatus(formData.vitals.bpSystolic, formData.vitals.bpDiastolic);

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 18, 66, 0.78)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto'
      }}
      onClick={() => setIsNewConsultationModalOpen(false)}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '920px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 30px 60px -15px rgba(0, 21, 86, 0.4), 0 0 0 1px rgba(7, 106, 188, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP CLINICAL HEADER */}
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
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93C5FD',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Stethoscope size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.22rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                  Registrar Consulta Médica & Evolución
                </h3>
                <span
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '100px',
                    letterSpacing: '0.05em'
                  }}
                >
                  REGISTRO CLÍNICO DIGITAL · FIRMA X.509
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#D2E3FC', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span><strong>{activeDoctor.name}</strong></span>
                <span>•</span>
                <span>{activeDoctor.specialty}</span>
                <span>•</span>
                <span style={{ color: '#93C5FD' }}>{activeDoctor.license}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNewConsultationModalOpen(false)}
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
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
            title="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
            {/* 1. PATIENT BAR & MEDICAL SUMMARY CARD */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.1rem 1.35rem',
                marginBottom: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '1.6fr 1.2fr',
                gap: '1.25rem',
                alignItems: 'center'
              }}
            >
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: '#002182',
                    textTransform: 'uppercase',
                    marginBottom: '0.4rem'
                  }}
                >
                  <User size={14} color="#076ABC" />
                  Paciente en Consulta Médica *
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
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #94a3b8',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: '#ffffff',
                    outline: 'none',
                    color: '#0f172a'
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

              {/* Patient Live Clinical Sheet Badge */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Cobertura:</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Identificación:</span>
                  <strong style={{ fontSize: '0.84rem', color: '#002182' }}>DNI {currentPatient?.dni}</strong>
                </div>
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                  {currentPatient?.allergies && currentPatient.allergies.length > 0 ? (
                    <span
                      style={{
                        color: '#b91c1c',
                        background: '#fef2f2',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <AlertTriangle size={13} /> Alergia: {currentPatient.allergies.join(', ')}
                    </span>
                  ) : (
                    <span
                      style={{
                        color: '#047857',
                        background: '#ecfdf5',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={13} /> Sin alergias conocidas
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. TRAUMATOLOGY FAST PROTOCOLS (1-CLICK TEMPLATES) */}
            <div style={{ marginBottom: '1.35rem' }}>
              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: '#002182',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} color="#076ABC" />
                Protocolos Traumatológicos Frecuentes (1-Click)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {clinicalProtocols.map((proto, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyProtocol(proto)}
                    style={{
                      background: '#F5F8FE',
                      border: '1.5px solid #BFDBFE',
                      borderRadius: '10px',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: '#002182',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 4px rgba(7, 106, 188, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#002182';
                      e.currentTarget.style.background = '#e0edff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#BFDBFE';
                      e.currentTarget.style.background = '#F5F8FE';
                    }}
                  >
                    {proto.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. MOTIVO DE CONSULTA & SÍNTOMAS */}
            <div style={{ marginBottom: '1.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FileText size={15} color="#076ABC" />
                  1. Motivo Principal de Consulta & Anamnesis *
                </label>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {symptomChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          reason: prev.reason ? `${prev.reason} - ${chip.replace('+ ', '')}` : chip.replace('+ ', '')
                        }));
                      }}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '1px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Ej: Dolor articular en rodilla derecha con limitación a la carga tras actividad deportiva..."
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a',
                  fontWeight: 600
                }}
                required
              />
            </div>

            {/* 4. SIGNOS VITALES & BIOMETRÍA CON TELEMETRÍA DINÁMICA */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.1rem 1.35rem',
                marginBottom: '1.35rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={16} color="#076ABC" />
                  2. Signos Vitales & Medición Antropométrica
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <div
                    style={{
                      background: bpStatus.bg,
                      color: bpStatus.color,
                      padding: '3px 10px',
                      borderRadius: '100px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      border: `1px solid ${bpStatus.color}40`
                    }}
                  >
                    TA: {bpStatus.label}
                  </div>

                  <div
                    style={{
                      background:
                        formData.vitals.bmi >= 30
                          ? '#fee2e2'
                          : formData.vitals.bmi >= 25
                          ? '#fef3c7'
                          : '#ecfdf5',
                      color:
                        formData.vitals.bmi >= 30
                          ? '#dc2626'
                          : formData.vitals.bmi >= 25
                          ? '#b45309'
                          : '#059669',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      border: '1px solid currentColor'
                    }}
                  >
                    IMC: {formData.vitals.bmi} ({formData.vitals.bmiCategory})
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    TA Sistólica
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={formData.vitals.bpSystolic}
                      onChange={(e) => handleVitalsChange('bpSystolic', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.5rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.66rem', color: '#94a3b8' }}>mmHg</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    TA Diastólica
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={formData.vitals.bpDiastolic}
                      onChange={(e) => handleVitalsChange('bpDiastolic', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.5rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.66rem', color: '#94a3b8' }}>mmHg</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    Frec. Cardíaca
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={formData.vitals.heartRate}
                      onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.5rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.66rem', color: '#94a3b8' }}>lpm</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    Temperatura
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.vitals.temperature}
                      onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.5rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.66rem', color: '#94a3b8' }}>°C</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitals.weight}
                    onChange={(e) => handleVitalsChange('weight', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.5rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    Altura (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.vitals.height}
                    onChange={(e) => handleVitalsChange('height', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.5rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 5. DIAGNÓSTICO CLÍNICO (CIE-10) */}
            <div style={{ marginBottom: '1.35rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.4rem' }}>
                    3. Diagnóstico Principal (CIE-10) *
                  </label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => {
                      setFormData({ ...formData, diagnosis: e.target.value });
                      setDiagnosisQuery(e.target.value);
                      setShowDiagnosisDropdown(true);
                    }}
                    onFocus={() => setShowDiagnosisDropdown(true)}
                    placeholder="Buscar código o nombre CIE-10..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #94a3b8',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                    required
                  />

                  {showDiagnosisDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#ffffff',
                        border: '2px solid #002182',
                        borderRadius: '10px',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                        zIndex: 60,
                        maxHeight: '200px',
                        overflowY: 'auto'
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
                            padding: '0.65rem 0.9rem',
                            cursor: 'pointer',
                            fontSize: '0.84rem',
                            borderBottom: '1px solid #f1f5f9',
                            color: '#0f172a'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F8FE')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                        >
                          <strong style={{ color: '#002182' }}>{d.code}</strong> — {d.label.split(' - ')[1]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.4rem' }}>
                    Diagnóstico Secundario / Comorbilidad
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryDiagnosis}
                    onChange={(e) => setFormData({ ...formData, secondaryDiagnosis: e.target.value })}
                    placeholder="Ej: M25.5 - Artralgia de rodilla leve"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 6. EVOLUCIÓN MÉDICA & EXAMEN FÍSICO TRAUMATOLÓGICO */}
            <div style={{ marginBottom: '1.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182' }}>
                  Evolución Médica & Examen Físico Traumatológico Completo *
                </label>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Haga clic para insertar hallazgos normales:</span>
              </div>

              {/* Physical Exam Chips */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {examChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddExamPhrase(chip)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#002182')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                    title="Insertar en la evolución"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={formData.evolution}
                onChange={(e) => setFormData({ ...formData, evolution: e.target.value })}
                placeholder="Inspección, palpación articular, rangos goniométricos, maniobras ortopédicas de estabilidad, tono y reflejos..."
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '1.5px solid #94a3b8',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  color: '#0f172a'
                }}
                required
              />
            </div>

            {/* 7. PRESCRIPCIÓN FARMACOLÓGICA DIGITAL (Rp/) */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.1rem 1.35rem',
                marginBottom: '1.35rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Pill size={16} color="#059669" />
                  4. Prescripción Farmacológica Digital (Rp/)
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPrescription()}
                  style={{
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1.5px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Plus size={15} /> Agregar Medicamento Personalizado
                </button>
              </div>

              {/* Quick Medication Chips */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                {commonMeds.map((med, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPrescription(med)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '3px 9px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    💊 {med.medication}
                  </button>
                ))}
              </div>

              {/* Prescriptions List */}
              {formData.prescriptions.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  No se han prescrito medicamentos para esta consulta. Utilice los botones rápidos de fármacos o haga clic en "Agregar Medicamento Personalizado".
                </div>
              ) : (
                formData.prescriptions.map((presc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.2fr 1.8fr 1.3fr 36px',
                      gap: '0.6rem',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                      background: '#F5F8FE',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC'
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Fármaco (Ej: Ibuprofeno 600mg)"
                      value={presc.medication}
                      onChange={(e) => handlePrescriptionChange(idx, 'medication', e.target.value)}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
                    />
                    <input
                      type="text"
                      placeholder="Dosis (Ej: 1 comp.)"
                      value={presc.dosage}
                      onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Frecuencia (Ej: Cada 8 hs)"
                      value={presc.frequency}
                      onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Duración (Ej: 5 días)"
                      value={presc.duration}
                      onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePrescription(idx)}
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        color: '#dc2626',
                        borderRadius: '6px',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Eliminar fármaco"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* 8. INDICACIONES & ESTUDIOS COMPLEMENTARIOS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.4rem' }}>
                  Indicaciones Terapéuticas & Pautas de Alarma
                </label>
                <textarea
                  rows={3}
                  value={formData.indications}
                  onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
                  placeholder="Pautas de rehabilitación kinésica, crioterapia, reposo deportivo..."
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    lineHeight: 1.5
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182' }}>
                    Solicitud de Estudios Complementarios
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                  {studyChips.map((st, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddStudy(st)}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '2px 7px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      + {st.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={formData.studiesRequested}
                  onChange={(e) => setFormData({ ...formData, studiesRequested: e.target.value })}
                  placeholder="Ej: RMN de rodilla derecha con protocolo ligamentario, Radiografía frente y perfil..."
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          {/* MODAL FOOTER BAR WITH LEGAL SIGNATURE & ACTIONS */}
          <div
            style={{
              background: '#f8fafc',
              borderTop: '1.5px solid #e2e8f0',
              padding: '1.1rem 1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              flexShrink: 0
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}
              >
                <Lock size={14} />
              </div>
              <div>
                <div>
                  Firma Digital X.509 Criptográfica: <strong>{activeDoctor.name}</strong> · M.P. 34.892 (CMPC)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {activeDoctor.specialty} · Registro Clínico Inmutable con Firma Digital y Hash SHA-256
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsNewConsultationModalOpen(false)}
                style={{
                  padding: '0.7rem 1.35rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.7rem 1.6rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(7, 106, 188, 0.35)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
              >
                <CheckCircle2 size={18} />
                Guardar & Firmar Consulta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
