import React, { useState, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import {
  User,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
  Stethoscope,
  Check,
  Plus,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';

const COMMON_ALLERGIES = [
  'Penicilina',
  'Ibuprofeno / AINEs',
  'Aspirina (AAS)',
  'Dipirona / Metamizol',
  'Yodo / Contrastes',
  'Látex',
  'Sulfas',
  'Paracetamol',
  'Ninguna conocida'
];

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
  const [showClinicalDetails, setShowClinicalDetails] = useState(false);

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
        const hasOtros = patientFormModalData.assignedDoctorIds.includes('doc-otros') ||
          (patientFormModalData.assignedDoctorNames || []).some(n => (n || '').toLowerCase().includes('otros'));
        initialDoctorIds = hasOtros ? ['doc-otros'] : ['doc-1'];
      } else if (patientFormModalData.assignedDoctorId) {
        initialDoctorIds = patientFormModalData.assignedDoctorId === 'doc-otros' ? ['doc-otros'] : ['doc-1'];
      } else if (patientFormModalData.primaryDoctor) {
        const isOtros = patientFormModalData.primaryDoctor.toLowerCase().includes('otros');
        initialDoctorIds = isOtros ? ['doc-otros'] : ['doc-1'];
      }

      const hasClinicalData = Boolean(
        patientFormModalData.allergies?.length ||
        patientFormModalData.antecedentes?.length ||
        patientFormModalData.observations
      );
      setShowClinicalDetails(hasClinicalData);

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
      setShowClinicalDetails(false);
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

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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

    try {
      if (patientFormModalData) {
        await updatePatient(patientFormModalData.id, payload);
      } else {
        await addPatient(payload);
      }
      setIsPatientFormModalOpen(false);
    } catch (err) {
      console.error('Error al guardar paciente:', err);
    }
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
            <Check size={16} />
            <span>{patientFormModalData ? 'Guardar Cambios' : 'Registrar Paciente'}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {/* 1. Datos Personales y de Identificación */}
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#002182', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={15} color="#076ABC" />
            <span>1. Datos Personales y de Identificación</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#002182', marginBottom: '0.25rem' }}>
                Nombre y Apellido Completo *
              </label>
              <input
                type="text"
                placeholder="Ej: Juan Carlos Rossi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #D2E3FC',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#002182', marginBottom: '0.25rem' }}>
                DNI / Documento *
              </label>
              <input
                type="text"
                placeholder="34850920"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #D2E3FC',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#002182', marginBottom: '0.25rem' }}>
                Teléfono / WhatsApp *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={13} color="#7994B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="+54 9 351 456-7890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#002182', marginBottom: '0.25rem' }}>
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #D2E3FC',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#002182'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#002182', marginBottom: '0.25rem' }}>
                Género
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #D2E3FC',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff'
                }}
              >
                <option value="">No especificado</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="No binario / Otro">No binario / Otro</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#002182', marginBottom: '0.25rem' }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} color="#7994B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="paciente@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#002182', marginBottom: '0.25rem' }}>
                Dirección / Localidad
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={13} color="#7994B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Av. Colón 1450, Córdoba"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Cobertura Médica (Obra Social / Prepaga) */}
        <div style={{ background: '#F8FAFE', border: '1.5px solid #D2E3FC', borderRadius: '12px', padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#002182', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={15} color="#076ABC" />
              <span>2. Cobertura Médica (Obra Social / Prepaga)</span>
            </div>

            <button
              type="button"
              onClick={handleToggleAddNewInsurance}
              style={{
                background: isAddingNewInsurance ? '#EFF6FF' : '#ffffff',
                border: isAddingNewInsurance ? '1px solid #076ABC' : '1px solid #CBD5E1',
                color: isAddingNewInsurance ? '#076ABC' : '#475569',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={12} strokeWidth={2.5} />
              <span>{isAddingNewInsurance ? 'Seleccionar existente' : '+ Cargar otra obra social'}</span>
            </button>
          </div>

          {!isAddingNewInsurance ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#002182', marginBottom: '0.2rem' }}>
                  Obra Social / Prepaga
                </label>
                <select
                  value={formData.insuranceId}
                  onChange={handleInsuranceChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    fontWeight: 600,
                    color: '#002182'
                  }}
                >
                  {healthInsurances.map((hi) => (
                    <option key={hi.id} value={hi.id}>{hi.name}</option>
                  ))}
                  <option value="__otra__">+ Otra Obra Social...</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#002182', marginBottom: '0.2rem' }}>
                  Plan
                </label>
                <input
                    type="text"
                    id="insurance-plan-input"
                    list="insurance-plans-list"
                    placeholder={selectedInsurance?.plans?.length > 0 ? 'Seleccionar o escribir un plan...' : 'Plan de cobertura'}
                    value={formData.insurancePlan}
                    onChange={(e) => setFormData({ ...formData, insurancePlan: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#ffffff'
                    }}
                  />
                  {selectedInsurance?.plans?.length > 0 && (
                    <datalist id="insurance-plans-list">
                      {selectedInsurance.plans.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#002182', marginBottom: '0.2rem' }}>
                  N° Afiliado / Credencial
                </label>
                <input
                  type="text"
                  placeholder="004829104-01"
                  value={formData.insuranceNumber}
                  onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#076ABC', marginBottom: '0.2rem' }}>
                  Nombre de la Obra Social *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sancor Salud, OMINT..."
                  value={newInsuranceName}
                  onChange={(e) => setNewInsuranceName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #076ABC',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#076ABC', marginBottom: '0.2rem' }}>
                  Plan Inicial *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2000, Clásico, Oro..."
                  value={newInsurancePlan}
                  onChange={(e) => setNewInsurancePlan(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #076ABC',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#076ABC', marginBottom: '0.2rem' }}>
                  N° Afiliado / Credencial
                </label>
                <input
                  type="text"
                  placeholder="004829104-01"
                  value={formData.insuranceNumber}
                  onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #076ABC',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Asignación a Profesionales Médicos: Segmented Selector Ultra Compacto */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#002182', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Stethoscope size={15} color="#076ABC" />
              <span>3. Asignación Profesional Médica</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Seleccione el profesional de cabecera
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => handleSelectDoctor('doc-1')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: isBlancoSelected ? '2px solid #002182' : '1.5px solid #D2E3FC',
                background: isBlancoSelected ? '#F0F5FF' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: isBlancoSelected ? '0 3px 10px rgba(0, 33, 130, 0.1)' : 'none'
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: isBlancoSelected ? '5px solid #002182' : '2px solid #94A3B8',
                  background: '#ffffff',
                  flexShrink: 0
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: isBlancoSelected ? '#002182' : '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Dr. Alejandro Blanco
                </div>
                <div style={{ fontSize: '0.71rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Staff Principal · Traumatología
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDoctor('doc-otros')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: isOtrosSelected ? '2px solid #076ABC' : '1.5px solid #D2E3FC',
                background: isOtrosSelected ? '#EFF6FF' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: isOtrosSelected ? '0 3px 10px rgba(7, 106, 188, 0.12)' : 'none'
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: isOtrosSelected ? '5px solid #076ABC' : '2px solid #94A3B8',
                  background: '#ffffff',
                  flexShrink: 0
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: isOtrosSelected ? '#076ABC' : '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Otros Profesionales
                </div>
                <div style={{ fontSize: '0.71rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Consultas Externas / Secretaría
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 4. Datos Clínicos, Alergias & Observaciones (Accordion Desplegable) */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setShowClinicalDetails(!showClinicalDetails)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              background: showClinicalDetails ? '#F8FAFC' : '#ffffff',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={15} color={formData.allergies ? '#DC2626' : '#64748B'} />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>
                Datos Clínicos, Alergias & Observaciones
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
                (Opcional)
              </span>
            </div>
            {showClinicalDetails ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
          </button>

          {showClinicalDetails && (
            <div style={{ padding: '0.85rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Alergias */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#DC2626', marginBottom: '0.25rem' }}>
                  Alergias Conocidas
                </label>
                <input
                  type="text"
                  placeholder="Ej: Penicilina, Ibuprofeno..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1.5px solid #FECACA',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff'
                  }}
                />
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '5px' }}>
                  {COMMON_ALLERGIES.map((allergy) => {
                    const active = isAllergyActive(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => handleToggleAllergy(allergy)}
                        style={{
                          background: active ? '#FEE2E2' : '#ffffff',
                          color: active ? '#991B1B' : '#475569',
                          border: active ? '1px solid #EF4444' : '1px solid #CBD5E1',
                          borderRadius: '12px',
                          padding: '1px 7px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {active && '✓ '}
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Antecedentes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  Antecedentes Médicos Relevantes
                </label>
                <input
                  type="text"
                  placeholder="Ej: Hipertensión, Diabetes..."
                  value={formData.antecedentes}
                  onChange={(e) => setFormData({ ...formData, antecedentes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff'
                  }}
                />
              </div>

              {/* Observaciones */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  Observaciones Generales de Recepción
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas internas o consideraciones..."
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    resize: 'none'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

