import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { FileText, X, CheckCircle2, Printer, ShieldCheck, Plus, Trash2 } from 'lucide-react';

export const MedicalOrderModal = () => {
  const {
    isMedicalOrderModalOpen,
    setIsMedicalOrderModalOpen,
    patients,
    currentUser,
    addMedicalOrder
  } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [orderType, setOrderType] = useState('Derivación / Orden de Kinesiología');
  const [diagnosis, setDiagnosis] = useState('S83.5 - Traumatismo / Reconstrucción LCA Rodilla Derecha');
  const [justification, setJustification] = useState('Plan de reeducación propioceptiva, fortalecimiento muscular de cadena cinética cerrada y retorno a la actividad física.');
  const [studies, setStudies] = useState([
    'Cinesioterapia activa resistida x 10 sesiones',
    'Reentrenamiento neuromuscular y propiocepción en bosu',
    'Test Isocinético de fuerza muscular'
  ]);
  const [newStudyInput, setNewStudyInput] = useState('');

  if (!isMedicalOrderModalOpen) return null;

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleAddStudy = () => {
    if (newStudyInput.trim() && !studies.includes(newStudyInput.trim())) {
      setStudies([...studies, newStudyInput.trim()]);
      setNewStudyInput('');
    }
  };

  const handleRemoveStudy = (idx) => {
    setStudies(studies.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (studies.length === 0) return;

    addMedicalOrder({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientDni: selectedPatient.dni,
      doctorId: currentUser.id || 'doc-1',
      doctorName: currentUser.name || 'Dr. Alejandro Morales',
      doctorLicense: currentUser.sisaLicense || 'MN 114.829 / MP 44.920',
      orderType,
      diagnosis,
      studiesRequested: studies,
      justification
    });

    setIsMedicalOrderModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsMedicalOrderModalOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '650px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="avatar-sm" style={{ background: 'var(--c-soft)', color: 'var(--c-dark)' }}>
              <FileText size={18} />
            </div>
            <div>
              <h3 className="modal-title">Emisión de Orden Médica / Solicitud de Estudios</h3>
              <p className="modal-subtitle">Documento con membrete oficial, firma digital y código de validación</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsMedicalOrderModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
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

            <div className="form-group">
              <label className="form-label">Tipo de Orden Médica</label>
              <select
                className="form-select"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                required
              >
                <option value="Derivación / Orden de Kinesiología">Derivación / Orden de Kinesiología & Fisiatría</option>
                <option value="Solicitud de Resonancia Magnética (RMN)">Solicitud de Resonancia Magnética (RMN)</option>
                <option value="Solicitud de Radiografía Digital (RX)">Solicitud de Radiografía Digital (RX)</option>
                <option value="Solicitud de Tomografía Computada (TAC)">Solicitud de Tomografía Computada (TAC)</option>
                <option value="Solicitud de Laboratorio Pre-Quirúrgico">Solicitud de Laboratorio Pre-Quirúrgico</option>
                <option value="Orden Quirúrgica / Intervención Traumatológica">Orden Quirúrgica / Intervención Traumatológica</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnóstico Clínico (CIE-10)</label>
              <input
                type="text"
                className="form-input"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />
            </div>

            {/* Estudios list */}
            <div>
              <label className="form-label">Prácticas o Estudios Solicitados ({studies.length})</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: RMN Rodilla derecha con cortes sagitales..."
                  value={newStudyInput}
                  onChange={(e) => setNewStudyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStudy();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddStudy}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {studies.map((st, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-subtle)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span><strong>{idx + 1}.</strong> {st}</span>
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ color: '#ef4444' }}
                      onClick={() => handleRemoveStudy(idx)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Justificación Clínica / Resumen de Cuadro</label>
              <textarea
                className="form-input"
                rows="2"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '0.65rem', borderRadius: '6px' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Esta orden médica será firmada digitalmente con certificado X.509 y almacenada de forma inmutable.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsMedicalOrderModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={studies.length === 0}>
              <CheckCircle2 size={16} />
              Emitir y Firmar Orden Médica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
