import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { User, Phone, Mail, Shield, AlertTriangle, FileText } from 'lucide-react';

export const PatientFormModal = () => {
  const {
    isPatientFormModalOpen,
    setIsPatientFormModalOpen,
    patientFormModalData,
    healthInsurances,
    addPatient,
    updatePatient,
    addToast
  } = useClinic();

  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    birthDate: '1990-01-01',
    gender: 'Masculino',
    bloodType: '0+',
    phone: '',
    email: '',
    address: '',
    insuranceId: healthInsurances[0]?.id || '',
    insuranceName: healthInsurances[0]?.name || '',
    insurancePlan: 'Plan 210',
    insuranceNumber: '',
    allergies: '',
    antecedentes: '',
    observations: ''
  });

  useEffect(() => {
    if (patientFormModalData) {
      setFormData({
        ...patientFormModalData,
        allergies: Array.isArray(patientFormModalData.allergies)
          ? patientFormModalData.allergies.join(', ')
          : patientFormModalData.allergies || '',
        antecedentes: Array.isArray(patientFormModalData.antecedentes)
          ? patientFormModalData.antecedentes.join(', ')
          : patientFormModalData.antecedentes || ''
      });
    } else {
      setFormData({
        name: '',
        dni: '',
        birthDate: '1990-01-01',
        gender: 'Masculino',
        bloodType: '0+',
        phone: '',
        email: '',
        address: '',
        insuranceId: healthInsurances[0]?.id || '',
        insuranceName: healthInsurances[0]?.name || '',
        insurancePlan: 'Plan 210',
        insuranceNumber: '',
        allergies: '',
        antecedentes: '',
        observations: ''
      });
    }
  }, [patientFormModalData, isPatientFormModalOpen, healthInsurances]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dni) {
      addToast('Campos requeridos', 'El nombre y DNI son obligatorios.', 'error');
      return;
    }

    const payload = {
      ...formData,
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

        {/* Clinical alerts & background */}
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb', margin: '1.25rem 0 0.75rem' }}>
          4. Alergias, Antecedentes & Observaciones Clínicas
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
