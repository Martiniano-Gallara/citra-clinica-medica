import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { FileCheck2, ShieldAlert, Plus, Printer, Trash2, Undo2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ConsentFormsModal = () => {
  const {
    isConsentModalOpen,
    setIsConsentModalOpen,
    consentForms,
    patients,
    doctors,
    addConsentForm,
    revokeConsentForm,
    addToast
  } = useClinic();

  const [mode, setMode] = useState('list'); // 'list' or 'new'
  const [formData, setFormData] = useState({
    patientId: patients[0]?.id || '',
    procedureType: 'Infiltración Articular Guiada por Ecografía',
    title: 'Consentimiento Informado para Procedimiento de Infiltración / Artrocentesis',
    doctorName: doctors[0]?.name || '',
    risksExplained: 'Riesgo de infección articular (<0.05%), dolor transitorio post-infiltración, hematoma leve o reacción inflamatoria reactiva temporal.',
    benefitsExpected: 'Disminución del proceso inflamatorio sinovial, analgesia sostenida y mejora funcional articular.',
    patientSignatureType: 'Firma Electrónica / Biométrica Validada',
    witnessName: 'Romina Maidana (DNI 32.105.880)'
  });

  const [selectedConsent, setSelectedConsent] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === formData.patientId);
    if (!pat) return;

    addConsentForm({
      ...formData,
      patientName: pat.name,
      patientDni: pat.dni
    });

    setMode('list');
  };

  const handleRevoke = (id) => {
    const reason = window.prompt('Especifique el motivo de revocación del consentimiento informado:', 'Decisión voluntaria del paciente previo al procedimiento.');
    if (reason) {
      revokeConsentForm(id, reason);
    }
  };

  return (
    <Modal
      isOpen={isConsentModalOpen}
      onClose={() => {
        setIsConsentModalOpen(false);
        setMode('list');
        setSelectedConsent(null);
      }}
      title="Gestión de Consentimientos Informados (Ley 26.529 y 26.742)"
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {mode === 'new' && (
              <button className="btn btn-secondary" onClick={() => setMode('list')}>
                Volver al Listado
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsConsentModalOpen(false)}
            >
              Cerrar
            </button>
            {mode === 'list' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setMode('new')}
              >
                <Plus size={16} />
                <span>Emitir Nuevo Consentimiento</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      {mode === 'list' ? (
        <div>
          <div style={{ background: '#e0f6f5', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #6FD0CC', marginBottom: '1rem', fontSize: '0.84rem', color: '#0C4E4C' }}>
            <strong>Marco Legal (Ley 26.529 Arts. 5 a 10):</strong> La declaración de voluntad del paciente debe ser libre, informada y emitida luego de recibir información clara sobre el procedimiento, riesgos y beneficios. El paciente conserva en todo momento el derecho a la revocación formal.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '55vh', overflowY: 'auto' }}>
            {consentForms.map((cf) => (
              <div
                key={cf.id}
                style={{
                  background: cf.revoked ? '#fef2f2' : '#ffffff',
                  border: `1px solid ${cf.revoked ? '#fca5a5' : '#CDEEEE'}`,
                  borderRadius: '10px',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0C4E4C' }}>
                      {cf.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#4e7a78', marginTop: '2px' }}>
                      Paciente: <strong>{cf.patientName}</strong> (DNI {cf.patientDni}) · Fecha: {cf.date} · Médico: {cf.doctorName}
                    </div>
                  </div>
                  <span
                    style={{
                      background: cf.revoked ? '#fee2e2' : '#d1fae5',
                      color: cf.revoked ? '#991b1b' : '#065f46',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 700
                    }}
                  >
                    {cf.status}
                  </span>
                </div>

                <div style={{ margin: '0.65rem 0', fontSize: '0.84rem', color: '#1e3a39', background: '#F3FBFB', padding: '0.65rem', borderRadius: '6px' }}>
                  <div><strong>Procedimiento:</strong> {cf.procedureType}</div>
                  <div><strong>Riesgos informados:</strong> {cf.risksExplained}</div>
                  <div><strong>Beneficios esperados:</strong> {cf.benefitsExpected}</div>
                  {cf.revoked && (
                    <div style={{ color: '#991b1b', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={13} color="#dc2626" />
                      <span>Revocado el {cf.revocationDate?.split('T')[0]}. Motivo: {cf.revocationReason}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#4e7a78' }}>
                  <span>Testigo / Asistente: {cf.witnessName || 'Sin testigo'}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!cf.revoked && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRevoke(cf.id)}
                      >
                        <Undo2 size={14} />
                        <span>Revocar Consentimiento</span>
                      </button>
                    )}
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => alert(`Imprimiendo copia del Consentimiento Informado ID ${cf.id} según Ley 26.529...`)}
                    >
                      <Printer size={14} />
                      <span>Imprimir Copia</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* FORM: NEW CONSENT */
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Paciente *</label>
              <select
                className="form-control"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (DNI {p.dni})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Médico Tratante / Informante *</label>
              <select
                className="form-control"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>{d.name} ({d.specialtyName})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Título del Documento *</label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Procedimiento Médico / Quirúrgico Específico *</label>
            <input
              type="text"
              className="form-control"
              value={formData.procedureType}
              onChange={(e) => setFormData({ ...formData, procedureType: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Riesgos y Posibles Complicaciones Explicadas *</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.risksExplained}
              onChange={(e) => setFormData({ ...formData, risksExplained: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Beneficios Clínicos Esperados *</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.benefitsExpected}
              onChange={(e) => setFormData({ ...formData, benefitsExpected: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Testigo / Profesional Asistente</label>
              <input
                type="text"
                className="form-control"
                value={formData.witnessName}
                onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setMode('list')}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <FileCheck2 size={16} />
              <span>Registrar Consentimiento Informado</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
