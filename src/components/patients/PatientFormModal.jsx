import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { User, Phone, Mail, Shield, AlertTriangle, FileText, Stethoscope, Check } from 'lucide-react';

export const PatientFormModal = () => {
  const {
    isPatientFormModalOpen,
    setIsPatientFormModalOpen,
    patientFormModalData,
    healthInsurances,
    doctors,
    addPatient,
    updatePatient,
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
    assignedDoctorIds: []
  });

  useEffect(() => {
    if (patientFormModalData) {
      let initialDoctorIds = [];
      if (Array.isArray(patientFormModalData.assignedDoctorIds)) {
        initialDoctorIds = [...patientFormModalData.assignedDoctorIds];
      } else if (patientFormModalData.assignedDoctorId) {
        initialDoctorIds = [patientFormModalData.assignedDoctorId];
      } else if (patientFormModalData.primaryDoctor) {
        const doc = (doctors || []).find(
          (d) => d.name && d.name.toLowerCase().trim() === patientFormModalData.primaryDoctor.toLowerCase().trim()
        );
        if (doc) initialDoctorIds = [doc.id];
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
    } else {
      setFormData({
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
        assignedDoctorIds: []
      });
    }
  }, [patientFormModalData, isPatientFormModalOpen, healthInsurances, doctors]);

  const handleInsuranceChange = (e) => {
    const id = e.target.value;
    const hi = healthInsurances.find((h) => h.id === id);
    if (hi) {
      setFormData((prev) => ({
        ...prev,
        insuranceId: hi.id,
        insuranceName: hi.name,
        insurancePlan: hi.plans[0] || 'General'
      }));
    }
  };

  const toggleDoctor = (docId) => {
    setFormData((prev) => {
      const current = prev.assignedDoctorIds || [];
      const exists = current.includes(docId);
      const updated = exists ? current.filter((id) => id !== docId) : [...current, docId];
      return { ...prev, assignedDoctorIds: updated };
    });
  };

  const selectAllDoctors = () => {
    setFormData((prev) => ({
      ...prev,
      assignedDoctorIds: (doctors || []).map((d) => d.id)
    }));
  };

  const clearDoctors = () => {
    setFormData((prev) => ({
      ...prev,
      assignedDoctorIds: []
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dni) {
      addToast('Campos requeridos', 'El nombre y DNI son obligatorios.', 'error');
      return;
    }

    const selectedDocs = (doctors || []).filter((d) => (formData.assignedDoctorIds || []).includes(d.id));
    const assignedNames = selectedDocs.map((d) => d.name);
    const primaryDoctor = selectedDocs.length > 0 ? selectedDocs[0].name : '';

    const payload = {
      ...formData,
      assignedDoctorIds: formData.assignedDoctorIds || [],
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

  const selectedInsurance = healthInsurances.find((h) => h.id === formData.insuranceId);

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
        {/* Basic Personal Info */}
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb', marginBottom: '0.75rem' }}>
          1. Datos Personales y de Identificación
        </div>
        <div className="form-row">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Nombre y Apellido Completo *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Lucía Soler"
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
              placeholder="Ej: 38.450.920"
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

        {/* Contact info */}
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb', margin: '1.25rem 0 0.75rem' }}>
          2. Información de Contacto
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Teléfono / WhatsApp</label>
            <input
              type="text"
              className="form-control"
              placeholder="+54 11 5566-7788"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="paciente@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dirección / Localidad</label>
            <input
              type="text"
              className="form-control"
              placeholder="Av. Santa Fe 1200, CABA"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        {/* Health Insurance */}
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb', margin: '1.25rem 0 0.75rem' }}>
          3. Cobertura Médica (Obra Social / Prepaga)
        </div>
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
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Plan</label>
            {selectedInsurance && selectedInsurance.plans.length > 0 ? (
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
              placeholder="Ej: 310-892110-01"
              value={formData.insuranceNumber}
              onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
            />
          </div>
        </div>

        {/* 4. Asignación a Profesionales Médicos (Secretaría) */}
        <div style={{ margin: '1.5rem 0 0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb' }}>
                4. Asignación a Profesionales Médicos
              </span>
              <span
                style={{
                  background: (formData.assignedDoctorIds || []).length > 0 ? '#eff6ff' : '#f1f5f9',
                  color: (formData.assignedDoctorIds || []).length > 0 ? '#076ABC' : '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid #bfdbfe'
                }}
              >
                {(formData.assignedDoctorIds || []).length} profesional{(formData.assignedDoctorIds || []).length === 1 ? '' : 'es'} asignado{(formData.assignedDoctorIds || []).length === 1 ? '' : 's'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={selectAllDoctors}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                Seleccionar todos
              </button>
              <button
                type="button"
                onClick={clearDoctors}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                Limpiar
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
            Los pacientes registrados en Secretaría pueden ser asignados a uno o varios médicos. El paciente figurará automáticamente en sus paneles médicos de <strong>Mis Pacientes</strong>.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: '0.6rem',
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              background: '#fafafa'
            }}
          >
            {(doctors || []).map((doc) => {
              const isSelected = (formData.assignedDoctorIds || []).includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDoctor(doc.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid #076ABC' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 6px rgba(7, 106, 188, 0.15)' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: isSelected ? 'none' : '1.5px solid #94a3b8',
                      background: isSelected ? '#076ABC' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </div>

                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: doc.color || '#002182',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {doc.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: isSelected ? '#002182' : '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {doc.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {doc.specialtyName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical alerts & background */}
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb', margin: '1.25rem 0 0.75rem' }}>
          5. Alergias, Antecedentes & Observaciones Clínicas
        </div>
        <div className="form-group">
          <label className="form-label" style={{ color: '#dc2626' }}>
            Alergias Conocidas (separadas por coma)
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Penicilina, AINEs, Iodo..."
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Antecedentes Médicos Relevantes (separados por coma)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Hipertensión arterial, Diabetes tipo 2, Cirugía de cadera 2021..."
            value={formData.antecedentes}
            onChange={(e) => setFormData({ ...formData, antecedentes: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Observaciones Generales</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Preferencias de atención, notas de recepción..."
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
};
