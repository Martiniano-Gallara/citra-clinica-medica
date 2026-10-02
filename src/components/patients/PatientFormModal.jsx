import React, { useState, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { User, Phone, Mail, Shield, AlertTriangle, FileText, Stethoscope, Check, Plus, Tag } from 'lucide-react';

const COMMON_ALLERGIES = [
  'Penicilina',
  'Ibuprofeno / AINEs',
  'Aspirina (AAS)',
  'Dipirona / Metamizol',
  'Yodo / Contrastes',
  'Látex',
  'Sulfas / Sulfamidas',
  'Paracetamol',
  'Ninguna conocida'
];

const QUICK_EMAIL_DOMAINS = ['@gmail.com', '@hotmail.com', '@yahoo.com', '@outlook.com'];

export const PatientFormModal = () => {
  const {
    isPatientFormModalOpen,
    setIsPatientFormModalOpen,
    patientFormModalData,
    healthInsurances,
    doctors,
    addPatient,
    updatePatient,
    addHealthInsurance,
    addToast
  } = useClinic();

  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    birthDate: '',
    gender: '',
    bloodType: 'N/E',
    phone: '',
    email: '',
    address: '',
    insuranceId: healthInsurances[0]?.id || '',
    insuranceName: healthInsurances[0]?.name || '',
    insurancePlan: '',
    insuranceNumber: '',
    allergies: '',
    antecedentes: '',
    observations: '',
    assignedDoctorIds: ['doc-1'] // Default to Dr. Blanco
  });

  const [isAddingNewInsurance, setIsAddingNewInsurance] = useState(false);
  const [newInsuranceName, setNewInsuranceName] = useState('');
  const [newInsurancePlan, setNewInsurancePlan] = useState('');

  // Lock background scroll when this modal is open
  useEffect(() => {
    if (isPatientFormModalOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isPatientFormModalOpen]);

  useEffect(() => {
    if (patientFormModalData) {
      let initialDoctorIds = ['doc-1'];
      if (Array.isArray(patientFormModalData.assignedDoctorIds) && patientFormModalData.assignedDoctorIds.length > 0) {
        // Normalize to either doc-1 or doc-otros
        const hasOtros = patientFormModalData.assignedDoctorIds.includes('doc-otros') ||
          (patientFormModalData.assignedDoctorNames || []).some(n => (n || '').toLowerCase().includes('otros'));
        initialDoctorIds = hasOtros ? ['doc-otros'] : ['doc-1'];
      } else if (patientFormModalData.assignedDoctorId) {
        initialDoctorIds = patientFormModalData.assignedDoctorId === 'doc-otros' ? ['doc-otros'] : ['doc-1'];
      } else if (patientFormModalData.primaryDoctor) {
        const isOtros = patientFormModalData.primaryDoctor.toLowerCase().includes('otros');
        initialDoctorIds = isOtros ? ['doc-otros'] : ['doc-1'];
      }

      setFormData({
        ...patientFormModalData,
        birthDate: patientFormModalData.birthDate || '',
        gender: patientFormModalData.gender || '',
        bloodType: patientFormModalData.bloodType || 'N/E',
        allergies: Array.isArray(patientFormModalData.allergies)
          ? patientFormModalData.allergies.join(', ')
          : patientFormModalData.allergies || '',
        antecedentes: Array.isArray(patientFormModalData.antecedentes)
          ? patientFormModalData.antecedentes.join(', ')
          : patientFormModalData.antecedentes || '',
        assignedDoctorIds: initialDoctorIds
      });

      setIsAddingNewInsurance(false);
      setNewInsuranceName('');
      setNewInsurancePlan('');
    } else {
      const defaultInsurance = healthInsurances[0];
      setFormData({
        name: '',
        dni: '',
        birthDate: '',
        gender: '',
        bloodType: 'N/E',
        phone: '',
        email: '',
        address: '',
        insuranceId: defaultInsurance?.id || '',
        insuranceName: defaultInsurance?.name || '',
        insurancePlan: defaultInsurance?.plans?.[0] || 'General',
        insuranceNumber: '',
        allergies: '',
        antecedentes: '',
        observations: '',
        assignedDoctorIds: ['doc-1'] // Pre-assigned to Dr. Blanco
      });

      setIsAddingNewInsurance(false);
      setNewInsuranceName('');
      setNewInsurancePlan('');
    }
  }, [patientFormModalData, isPatientFormModalOpen, healthInsurances]);

  // Selected existing insurance from context list
  const selectedInsurance = useMemo(() => {
    return healthInsurances.find((h) => h.id === formData.insuranceId);
  }, [healthInsurances, formData.insuranceId]);

  const handleInsuranceChange = (e) => {
    const val = e.target.value;
    if (val === '__otra__') {
      setIsAddingNewInsurance(true);
      setFormData((prev) => ({
        ...prev,
        insuranceId: '__otra__',
        insuranceName: '',
        insurancePlan: ''
      }));
      return;
    }

    setIsAddingNewInsurance(false);
    const hi = healthInsurances.find((h) => h.id === val);
    if (hi) {
      setFormData((prev) => ({
        ...prev,
        insuranceId: hi.id,
        insuranceName: hi.name,
        insurancePlan: hi.plans?.[0] || 'General'
      }));
    }
  };

  const handleToggleAddNewInsurance = () => {
    if (!isAddingNewInsurance) {
      setIsAddingNewInsurance(true);
      setFormData((prev) => ({
        ...prev,
        insuranceId: '__otra__',
        insuranceName: '',
        insurancePlan: ''
      }));
    } else {
      setIsAddingNewInsurance(false);
      const defaultHi = healthInsurances[0];
      setFormData((prev) => ({
        ...prev,
        insuranceId: defaultHi?.id || '',
        insuranceName: defaultHi?.name || '',
        insurancePlan: defaultHi?.plans?.[0] || 'General'
      }));
    }
  };

  // Quick email domain autofill
  const handleEmailDomainClick = (domain) => {
    setFormData((prev) => {
      const current = (prev.email || '').trim();
      let userPart = '';
      if (!current) {
        userPart = '';
      } else if (current.includes('@')) {
        userPart = current.split('@')[0];
      } else {
        userPart = current;
      }
      return {
        ...prev,
        email: userPart ? `${userPart}${domain}` : domain
      };
    });
  };

  // Quick allergies multi-select accumulation
  const handleToggleAllergy = (allergy) => {
    setFormData((prev) => {
      const current = prev.allergies
        ? prev.allergies.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      if (allergy === 'Ninguna conocida') {
        const isAlreadyNone = current.some((s) => s.toLowerCase() === 'ninguna conocida');
        return {
          ...prev,
          allergies: isAlreadyNone ? '' : 'Ninguna conocida'
        };
      }

      // If adding a specific allergy, remove "Ninguna conocida" if present
      const cleaned = current.filter((s) => s.toLowerCase() !== 'ninguna conocida');
      const existsIndex = cleaned.findIndex((s) => s.toLowerCase() === allergy.toLowerCase());

      let updated;
      if (existsIndex >= 0) {
        updated = cleaned.filter((_, idx) => idx !== existsIndex);
      } else {
        updated = [...cleaned, allergy];
      }

      return {
        ...prev,
        allergies: updated.join(', ')
      };
    });
  };

  const isAllergyActive = (allergy) => {
    if (!formData.allergies) return false;
    const current = formData.allergies.split(',').map((s) => s.trim().toLowerCase());
    return current.includes(allergy.toLowerCase());
  };

  // Doctor assignment selection: Strictly Dr. Blanco or Otros Profesionales
  const handleSelectDoctor = (docId) => {
    setFormData((prev) => ({
      ...prev,
      assignedDoctorIds: [docId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dni.trim()) {
      addToast('Campos requeridos', 'El nombre y DNI son obligatorios.', 'error');
      return;
    }

    // Process Obra Social
    let finalInsuranceId = formData.insuranceId;
    let finalInsuranceName = formData.insuranceName;
    let finalInsurancePlan = formData.insurancePlan;

    if (isAddingNewInsurance || formData.insuranceId === '__otra__') {
      if (!newInsuranceName.trim()) {
        addToast('Obra Social Requerida', 'Por favor ingrese el nombre de la nueva obra social.', 'warning');
        return;
      }
      const planName = newInsurancePlan.trim() || 'Estándar';
      if (typeof addHealthInsurance === 'function') {
        const createdHi = addHealthInsurance({
          name: newInsuranceName.trim(),
          plans: [planName],
          copay: 0,
          status: 'Activa'
        });
        finalInsuranceId = createdHi?.id || `hi-${Date.now()}`;
        finalInsuranceName = createdHi?.name || newInsuranceName.trim();
        finalInsurancePlan = planName;
      } else {
        finalInsuranceId = `hi-${Date.now()}`;
        finalInsuranceName = newInsuranceName.trim();
        finalInsurancePlan = planName;
      }
    } else if (selectedInsurance) {
      finalInsuranceName = selectedInsurance.name;
    }

    // Process Doctor: Blanco vs Otros Profesionales
    const isOtros = (formData.assignedDoctorIds || []).includes('doc-otros');
    const assignedIds = isOtros ? ['doc-otros'] : ['doc-1'];
    const assignedNames = isOtros ? ['Otros Profesionales'] : ['Dr. Alejandro Blanco'];
    const primaryDoctor = isOtros ? 'Otros Profesionales' : 'Dr. Alejandro Blanco';

    const payload = {
      ...formData,
      insuranceId: finalInsuranceId,
      insuranceName: finalInsuranceName,
      insurancePlan: finalInsurancePlan,
      assignedDoctorIds: assignedIds,
      assignedDoctorNames: assignedNames,
      primaryDoctor: primaryDoctor,
      allergies: formData.allergies
        ? formData.allergies.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      antecedentes: formData.antecedentes
        ? formData.antecedentes.split(',').map((s) => s.trim()).filter(Boolean)
        : []
    };

    if (patientFormModalData) {
      updatePatient(patientFormModalData.id, payload);
    } else {
      addPatient(payload);
    }

    setIsPatientFormModalOpen(false);
  };

  const isBlancoSelected = (formData.assignedDoctorIds || []).includes('doc-1');
  const isOtrosSelected = (formData.assignedDoctorIds || []).includes('doc-otros');

  return (
    <Modal
      isOpen={isPatientFormModalOpen}
      onClose={() => setIsPatientFormModalOpen(false)}
      title={patientFormModalData ? 'Editar Ficha del Paciente' : 'Alta de Nuevo Paciente'}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsPatientFormModalOpen(false)}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {patientFormModalData ? 'Guardar Cambios' : 'Registrar Paciente'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* 1. Datos Personales y de Identificación */}
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#002182', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={16} color="#076ABC" />
          <span>1. Datos Personales y de Identificación</span>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Nombre y Apellido Completo *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Juan Carlos Rossi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">DNI / Documento *</label>
            <input
              type="text"
              className="form-control"
              placeholder="34850920"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fecha de Nacimiento</label>
            <input
              type="date"
              className="form-control"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Género</label>
            <select
              className="form-control"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">-- No especificado --</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="No binario / Otro">No binario / Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Grupo Sanguíneo</label>
            <select
              className="form-control"
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
            >
              <option value="N/E">No especificado (N/E)</option>
              {['0+', '0-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Información de Contacto */}
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#002182', margin: '1.25rem 0 0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Phone size={16} color="#076ABC" />
          <span>2. Información de Contacto</span>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Teléfono / WhatsApp</label>
            <input
              type="text"
              className="form-control"
              placeholder="+54 9 351 456-7890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="m.rossi@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {/* Quick Email Domain Fillers */}
            <div style={{ display: 'flex', gap: '5px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Completar dominio:</span>
              {QUICK_EMAIL_DOMAINS.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => handleEmailDomainClick(domain)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '5px',
                    padding: '2px 7px',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    color: '#076ABC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#eff6ff';
                    e.currentTarget.style.borderColor = '#076ABC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dirección / Localidad</label>
            <input
              type="text"
              className="form-control"
              placeholder="Av. Colón 1450, Córdoba"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        {/* 3. Cobertura Médica (Obra Social / Prepaga) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.25rem 0 0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#002182', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={16} color="#076ABC" />
            <span>3. Cobertura Médica (Obra Social / Prepaga)</span>
          </div>

          <button
            type="button"
            onClick={handleToggleAddNewInsurance}
            style={{
              background: isAddingNewInsurance ? '#eff6ff' : '#f8fafc',
              border: isAddingNewInsurance ? '1px solid #076ABC' : '1px solid #cbd5e1',
              color: isAddingNewInsurance ? '#076ABC' : '#475569',
              borderRadius: '6px',
              padding: '3px 9px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>{isAddingNewInsurance ? 'Seleccionar existente' : '+ Cargar otra obra social'}</span>
          </button>
        </div>

        {!isAddingNewInsurance ? (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Obra Social / Prepaga</label>
              <select
                className="form-control"
                value={formData.insuranceId}
                onChange={handleInsuranceChange}
              >
                {healthInsurances.map((hi) => (
                  <option key={hi.id} value={hi.id}>{hi.name}</option>
                ))}
                <option value="__otra__">+ Otra Obra Social (Cargar nueva)...</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Plan</label>
              {selectedInsurance && selectedInsurance.plans && selectedInsurance.plans.length > 0 ? (
                <select
                  className="form-control"
                  value={formData.insurancePlan}
                  onChange={(e) => setFormData({ ...formData, insurancePlan: e.target.value })}
                >
                  {selectedInsurance.plans.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Plan de cobertura"
                  value={formData.insurancePlan}
                  onChange={(e) => setFormData({ ...formData, insurancePlan: e.target.value })}
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">N° de Afiliado / Credencial</label>
              <input
                type="text"
                className="form-control"
                placeholder="004829104-01"
                value={formData.insuranceNumber}
                onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
              />
            </div>
          </div>
        ) : (
          /* Custom Obra Social Inputs: Saves both to patient and to clinic health insurances */
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px dashed #076ABC',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#076ABC', fontWeight: 800, marginBottom: '0.75rem' }}>
              Incorporar Nueva Obra Social / Prepaga al Sistema de CITRA:
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre de la Obra Social *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Sancor Salud, OMINT, Federada..."
                  value={newInsuranceName}
                  onChange={(e) => setNewInsuranceName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Plan Inicial *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Plan 2000, Clásico, Oro..."
                  value={newInsurancePlan}
                  onChange={(e) => setNewInsurancePlan(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">N° de Afiliado / Credencial</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="004829104-01"
                  value={formData.insuranceNumber}
                  onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. Asignación a Profesionales Médicos: Dr. Blanco o Otros Profesionales */}
        <div style={{ margin: '1.5rem 0 0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Stethoscope size={16} color="#076ABC" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#002182' }}>
                4. Asignación a Profesionales Médicos
              </span>
            </div>
            <span
              style={{
                background: '#eff6ff',
                color: '#076ABC',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe'
              }}
            >
              {isOtrosSelected ? 'Otros Profesionales' : 'Dr. Alejandro Blanco'}
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
            Asigne el paciente a <strong>Dr. Blanco</strong> (atención presencial en CITRA) o a <strong>Otros Profesionales</strong> (asistencia gestionada por secretaría con impacto inmediato en métricas).
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.85rem'
            }}
          >
            {/* Opción 1: Dr. Alejandro Blanco */}
            <div
              onClick={() => handleSelectDoctor('doc-1')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.9rem 1.1rem',
                borderRadius: '12px',
                border: isBlancoSelected ? '2px solid #002182' : '1.5px solid #e2e8f0',
                background: isBlancoSelected ? '#f0f5ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isBlancoSelected ? '0 4px 12px rgba(0, 33, 130, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: isBlancoSelected ? '6px solid #002182' : '2px solid #94a3b8',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              />

              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#002182',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                AB
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isBlancoSelected ? '#002182' : '#0f172a' }}>
                  Dr. Alejandro Blanco
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Traumatología y Ortopedia · Staff Principal
                </div>
              </div>
            </div>

            {/* Opción 2: Otros Profesionales */}
            <div
              onClick={() => handleSelectDoctor('doc-otros')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.9rem 1.1rem',
                borderRadius: '12px',
                border: isOtrosSelected ? '2px solid #076ABC' : '1.5px solid #e2e8f0',
                background: isOtrosSelected ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isOtrosSelected ? '0 4px 12px rgba(7, 106, 188, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: isOtrosSelected ? '6px solid #076ABC' : '2px solid #94a3b8',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              />

              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#076ABC',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                OP
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isOtrosSelected ? '#076ABC' : '#0f172a' }}>
                  Otros Profesionales
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Consultas Externas / Otras Especialidades
                </div>
                <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 700, marginTop: '2px' }}>
                  Secretaría registra Asistencias / Ausencias
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Alergias, Antecedentes & Observaciones Clínicas */}
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#002182', margin: '1.25rem 0 0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} color="#dc2626" />
          <span>5. Alergias, Antecedentes & Observaciones Clínicas</span>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ color: '#dc2626', fontWeight: 700 }}>
            Alergias Conocidas (separadas por coma)
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Penicilina, Ibuprofeno, Yodo..."
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
          />

          {/* Quick Clickable Allergy Chips */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '5px' }}>
              Presione para agregar o quitar alergias frecuentes:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {COMMON_ALLERGIES.map((allergy) => {
                const active = isAllergyActive(allergy);
                const isNone = allergy === 'Ninguna conocida';

                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => handleToggleAllergy(allergy)}
                    style={{
                      background: active ? (isNone ? '#ecfdf5' : '#fee2e2') : '#f8fafc',
                      color: active ? (isNone ? '#065f46' : '#991b1b') : '#475569',
                      border: active ? (isNone ? '1.5px solid #10b981' : '1.5px solid #ef4444') : '1px solid #cbd5e1',
                      borderRadius: '20px',
                      padding: '3px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {active && <Check size={12} strokeWidth={3} />}
                    <span>{allergy}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Antecedentes Médicos Relevantes (separados por coma)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Hipertensión arterial, Diabetes tipo 2, Cirugías previas..."
            value={formData.antecedentes}
            onChange={(e) => setFormData({ ...formData, antecedentes: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Observaciones Generales</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Observaciones de recepción o notas adicionales..."
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
};
