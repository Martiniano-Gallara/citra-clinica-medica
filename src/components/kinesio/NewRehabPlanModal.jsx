import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Activity, X, User, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

export const NewRehabPlanModal = () => {
  const {
    isRehabPlanModalOpen,
    setIsRehabPlanModalOpen,
    patients,
    doctors,
    addRehabPlan
  } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('Post-Quirúrgico Reconstrucción LCA Rodilla Derecha');
  const [therapistName, setTherapistName] = useState('Lic. Valentina Rossi');
  const [referringDoctor, setReferringDoctor] = useState('Dr. Alejandro Morales');
  const [prescribedSessions, setPrescribedSessions] = useState(10);
  const [initialEvaScore, setInitialEvaScore] = useState(7);
  const [objective, setObjective] = useState('Alivio de dolor, recuperación completa del arco de movimiento y fortalecimiento 5/5.');
  const [techniques, setTechniques] = useState([
    'Cinesioterapia activa resistida',
    'Electroestimulación Compex',
    'Propiocepción en bosu',
    'Crioterapia compresión'
  ]);
  const [techInput, setTechInput] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('AUT-OSDE-8812-A');

  if (!isRehabPlanModalOpen) return null;

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleAddTech = () => {
    if (techInput.trim() && !techniques.includes(techInput.trim())) {
      setTechniques([...techniques, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech) => {
    setTechniques(techniques.filter((t) => t !== tech));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addRehabPlan({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientDni: selectedPatient.dni,
      diagnosis,
      therapistName,
      referringDoctor,
      insuranceName: selectedPatient.insuranceName || 'Particular',
      authorizationCode,
      prescribedSessions: Number(prescribedSessions),
      initialEvaScore: Number(initialEvaScore),
      objective,
      techniques
    });
    setIsRehabPlanModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsRehabPlanModalOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="avatar-sm" style={{ background: 'var(--c-soft)', color: 'var(--c-dark)' }}>
              <Activity size={18} />
            </div>
            <div>
              <h3 className="modal-title">Nuevo Plan de Rehabilitación & Kinesiología</h3>
              <p className="modal-subtitle">Asignación de protocolo terapéutico y sesiones autorizadas</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsRehabPlanModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Paciente Selector */}
            <div className="form-group">
              <label className="form-label">Paciente Titular</label>
              <select
                className="form-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
              >
                {patients.map((pat) => (
                  <option key={pat.id} value={pat.id}>
                    {pat.name} — DNI {pat.dni} ({pat.insuranceName})
                  </option>
                ))}
              </select>
            </div>

            {/* Diagnóstico */}
            <div className="form-group">
              <label className="form-label">Diagnóstico Clínico / Lesión Traumatológica</label>
              <input
                type="text"
                className="form-input"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Ej: Esguince tobillo grado II, Post-Qx LCA, Tendinitis manguito rotador..."
                required
              />
            </div>

            {/* Profesionales */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Kinesiólogo / Terapeuta Asignado</label>
                <input
                  type="text"
                  className="form-input"
                  value={therapistName}
                  onChange={(e) => setTherapistName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Médico Traumatólogo Derivante</label>
                <input
                  type="text"
                  className="form-input"
                  value={referringDoctor}
                  onChange={(e) => setReferringDoctor(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Sesiones y Escala EVA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Sesiones Prescritas</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="form-input"
                  value={prescribedSessions}
                  onChange={(e) => setPrescribedSessions(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dolor Inicial EVA (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  className="form-input"
                  value={initialEvaScore}
                  onChange={(e) => setInitialEvaScore(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Código Autorización OS</label>
                <input
                  type="text"
                  className="form-input"
                  value={authorizationCode}
                  onChange={(e) => setAuthorizationCode(e.target.value)}
                  placeholder="AUT-00000"
                />
              </div>
            </div>

            {/* Objetivo */}
            <div className="form-group">
              <label className="form-label">Objetivo Terapéutico y Criterio de Alta</label>
              <textarea
                className="form-input"
                rows="2"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                required
              />
            </div>

            {/* Técnicas y Agentes */}
            <div className="form-group">
              <label className="form-label">Técnicas y Agentes Físicos Indicados</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Punción seca, Magneto, RPG, Crioterapia..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTech();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleAddTech}
                >
                  Agregar
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {techniques.map((t, idx) => (
                  <span
                    key={idx}
                    className="badge badge-teal"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => handleRemoveTech(t)}
                    title="Click para quitar"
                  >
                    {t} ×
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsRehabPlanModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              Iniciar Plan Kinesiológico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
