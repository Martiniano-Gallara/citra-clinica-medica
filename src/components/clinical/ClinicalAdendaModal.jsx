import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { FileEdit, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ClinicalAdendaModal = () => {
  const {
    isAdendaModalOpen,
    setIsAdendaModalOpen,
    adendaTargetConsultation,
    currentUser,
    addConsultationAdenda,
    addToast
  } = useClinic();

  const [adendaText, setAdendaText] = useState('');

  if (!adendaTargetConsultation) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!adendaText.trim()) {
      addToast('Error', 'Debe escribir el texto de la adenda médica.', 'error');
      return;
    }

    addConsultationAdenda(
      adendaTargetConsultation.id,
      adendaText,
      currentUser.name,
      currentUser.sisaLicense || 'MN 114.829'
    );
    setAdendaText('');
    setIsAdendaModalOpen(false);
  };

  return (
    <Modal
      isOpen={isAdendaModalOpen}
      onClose={() => setIsAdendaModalOpen(false)}
      title="Incorporar Adenda Médica / Rectificación Auditada (Ley 26.529)"
      size="default"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsAdendaModalOpen(false)}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            <FileEdit size={16} />
            <span>Firmar & Asentar Adenda</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: '#e0f6f5',
            border: '1px solid #6FD0CC',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.86rem',
            color: '#0C4E4C'
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: '2px' }}>
            Marco Legal de Inalterabilidad (Leyes 26.529 y 26.742):
          </div>
          Los registros clínicos no pueden ser modificados destructivamente ni eliminados. Toda aclaración o corrección posterior debe asentarse cronológicamente mediante una adenda firmada digitalmente.
        </div>

        <div style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
          <div><strong>Paciente:</strong> {adendaTargetConsultation.patientName} (DNI {adendaTargetConsultation.patientDni})</div>
          <div><strong>Consulta Original:</strong> {adendaTargetConsultation.date} a las {adendaTargetConsultation.time} hs</div>
          <div><strong>Diagnóstico Inicial:</strong> {adendaTargetConsultation.diagnosis}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Texto de la Adenda / Aclaración Clínica *</label>
          <textarea
            className="form-control"
            rows={4}
            placeholder="Especifique con precisión la aclaración diagnóstica, corrección posológica o evolución complementaria..."
            value={adendaText}
            onChange={(e) => setAdendaText(e.target.value)}
            required
          />
        </div>

        <div style={{ fontSize: '0.8rem', color: '#4e7a78', fontStyle: 'italic' }}>
          La adenda se anexará con firma digital de <strong>{currentUser.name}</strong> y sello de tiempo inmutable.
        </div>
      </form>
    </Modal>
  );
};
