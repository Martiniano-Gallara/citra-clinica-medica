import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { FileCheck, X, Activity, User, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export const NewRehabSessionModal = () => {
  const {
    isRehabSessionModalOpen,
    setIsRehabSessionModalOpen,
    rehabSessionPreloadPlan,
    rehabPlans,
    currentUser,
    addRehabSession
  } = useClinic();

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [evaScore, setEvaScore] = useState(3);
  const [romMeasured, setRomMeasured] = useState('Flexión 135° / Extensión 0°');
  const [strengthScore, setStrengthScore] = useState('5/5 (Escala Daniels)');
  const [performedTechniques, setPerformedTechniques] = useState([
    'Calentamiento en bicicleta fija 10 min',
    'Cinesioterapia activa resistida con bandas elásticas',
    'Ejercicios propioceptivos en plano inestable',
    'Crioterapia con compresión neumática 15 min'
  ]);
  const [techInput, setTechInput] = useState('');
  const [patientFeedback, setPatientFeedback] = useState('Refiere excelente tolerancia y menor rigidez matutina.');
  const [therapistNotes, setTherapistNotes] = useState('Buena activación de vasto interno. Se autoriza aumento paulatino de carga.');

  useEffect(() => {
    if (rehabSessionPreloadPlan) {
      setSelectedPlanId(rehabSessionPreloadPlan.id);
      setEvaScore(rehabSessionPreloadPlan.currentEvaScore || 3);
    } else if (rehabPlans.length > 0) {
      setSelectedPlanId(rehabPlans[0].id);
    }
  }, [rehabSessionPreloadPlan, rehabPlans]);

  if (!isRehabSessionModalOpen) return null;

  const targetPlan = rehabPlans.find((p) => p.id === selectedPlanId) || rehabPlans[0];
  const nextSessionNumber = targetPlan ? (targetPlan.completedSessions || 0) + 1 : 1;

  const handleAddTech = () => {
    if (techInput.trim() && !performedTechniques.includes(techInput.trim())) {
      setPerformedTechniques([...performedTechniques, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech) => {
    setPerformedTechniques(performedTechniques.filter((t) => t !== tech));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetPlan) return;

    addRehabSession({
      planId: targetPlan.id,
      patientId: targetPlan.patientId,
      patientName: targetPlan.patientName,
      patientDni: targetPlan.patientDni,
      therapistName: currentUser.name || targetPlan.therapistName,
      sessionNumber: nextSessionNumber,
      evaScore: Number(evaScore),
      performedTechniques,
      romMeasured,
      strengthScore,
      patientFeedback,
      therapistNotes
    });

    setIsRehabSessionModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsRehabSessionModalOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '660px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="avatar-sm" style={{ background: 'var(--c-soft)', color: 'var(--c-dark)' }}>
              <FileCheck size={18} />
            </div>
            <div>
              <h3 className="modal-title">Evolución de Sesión Kinesiológica #{nextSessionNumber}</h3>
              <p className="modal-subtitle">Registro clínico con firma digital inmutable</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsRehabSessionModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Plan selector */}
            <div className="form-group">
              <label className="form-label">Plan Kinesiológico del Paciente</label>
              <select
                className="form-select"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                required
              >
                {rehabPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patientName} — {p.diagnosis} (Sesión {p.completedSessions + 1} de {p.prescribedSessions})
                  </option>
                ))}
              </select>
            </div>

            {/* Escala EVA y Mediciones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Escala Dolor EVA (0-10)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    className="form-input"
                    style={{ padding: 0 }}
                    value={evaScore}
                    onChange={(e) => setEvaScore(e.target.value)}
                  />
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: evaScore <= 3 ? '#d1fae5' : evaScore <= 6 ? '#fef3c7' : '#fee2e2',
                      color: evaScore <= 3 ? '#065f46' : evaScore <= 6 ? '#92400e' : '#991b1b'
                    }}
                  >
                    {evaScore}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Rango Articular (ROM)</label>
                <input
                  type="text"
                  className="form-input"
                  value={romMeasured}
                  onChange={(e) => setRomMeasured(e.target.value)}
                  placeholder="Ej: Flex 130°, Ext 0°"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fuerza Muscular</label>
                <input
                  type="text"
                  className="form-input"
                  value={strengthScore}
                  onChange={(e) => setStrengthScore(e.target.value)}
                  placeholder="Ej: 4+/5 Daniels"
                  required
                />
              </div>
            </div>

            {/* Técnicas */}
            <div className="form-group">
              <label className="form-label">Técnicas y Procedimientos Realizados en Sesión</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Fortalecimiento isométrico, TENS analgésico..."
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
                {performedTechniques.map((t, idx) => (
                  <span
                    key={idx}
                    className="badge badge-teal"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRemoveTech(t)}
                    title="Click para quitar"
                  >
                    {t} ×
                  </span>
                ))}
              </div>
            </div>

            {/* Sensación y Feedback */}
            <div className="form-group">
              <label className="form-label">Respuesta del Paciente y Tolerancia al Ejercicio</label>
              <input
                type="text"
                className="form-input"
                value={patientFeedback}
                onChange={(e) => setPatientFeedback(e.target.value)}
                placeholder="Sin dolor articular, adecuada tolerancia a la carga..."
              />
            </div>

            {/* Evolución y Pautas */}
            <div className="form-group">
              <label className="form-label">Evolución Profesional & Pautas para Próxima Sesión</label>
              <textarea
                className="form-input"
                rows="2"
                value={therapistNotes}
                onChange={(e) => setTherapistNotes(e.target.value)}
                required
              />
            </div>

            {/* Legal Notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '0.65rem', borderRadius: '6px' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Esta evolución quedará sellada con firma digital criptográfica e incorporada a la HCE inmutable.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsRehabSessionModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              Guardar y Firmar Sesión #{nextSessionNumber}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
