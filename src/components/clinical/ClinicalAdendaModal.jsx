import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  FileEdit,
  ShieldAlert,
  CheckCircle2,
  X,
  Lock,
  Sparkles,
  Scale
} from 'lucide-react';

export const ClinicalAdendaModal = () => {
  const {
    isAdendaModalOpen,
    setIsAdendaModalOpen,
    adendaTargetConsultation,
    currentUser,
    currentDoctor,
    isDoctor,
    addConsultationAdenda,
    addToast
  } = useClinic();

  const [adendaReason, setAdendaReason] = useState('Aclaración Diagnóstica / Evolución Complementaria');
  const [adendaText, setAdendaText] = useState('');

  // Active doctor resolution (strictly Dr. Blanco when isDoctor)
  const activeDoctorName = isDoctor && currentDoctor ? currentDoctor.name : (currentUser?.name || 'Dr. Alejandro Blanco');
  const activeDoctorLicense = isDoctor && currentDoctor ? currentDoctor.license : (currentUser?.license || 'M.P. 34.892 (CMPC)');

  const adendaTypes = [
    'Aclaración Diagnóstica',
    'Ajuste Posológico / Fármaco',
    'Recepción de Estudio Complementario',
    'Evolución Post-procedimiento',
    'Fe de Erratas Inmutable'
  ];

  if (!isAdendaModalOpen || !adendaTargetConsultation) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!adendaText.trim()) {
      addToast('Error', 'Debe redactar el texto de la adenda médica.', 'error');
      return;
    }

    const fullText = `[${adendaReason.toUpperCase()}]: ${adendaText.trim()}`;
    addConsultationAdenda(
      adendaTargetConsultation.id,
      fullText,
      activeDoctorName,
      activeDoctorLicense
    );
    setAdendaText('');
    setIsAdendaModalOpen(false);
  };

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
      onClick={() => setIsAdendaModalOpen(false)}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '650px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 30px 60px -15px rgba(0, 21, 86, 0.45), 0 0 0 1px rgba(7, 106, 188, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #001f66 0%, #001242 100%)',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #076ABC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93C5FD'
              }}
            >
              <Scale size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>
                  Asentar Adenda Médica Inmutable
                </h3>
                <span
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '100px'
                  }}
                >
                  ENMIENDA CLÍNICA OFICIAL
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#D2E3FC', marginTop: '2px' }}>
                Registro Clínico Inmutable · Firma Digital X.509 · Registro Auditado
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAdendaModalOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem' }}>
          {/* LEGAL DIRECTIVE BANNER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
              border: '1.5px solid #bfdbfe',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: '#1e3a8a',
              lineHeight: 1.5
            }}
          >
            <strong>Inalterabilidad del Registro Clínico:</strong> La Historia Clínica Electrónica es inmutable. Para preservar la integridad del historial, los asientos previos no se sobreescriben. Toda rectificación o aclaración posterior se anexa cronológicamente mediante una adenda firmada digitalmente que preserva el registro original.
          </div>

          {/* TARGET CONSULTATION INFO */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.84rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span><strong>Paciente:</strong> {adendaTargetConsultation.patientName} (DNI {adendaTargetConsultation.patientDni})</span>
              <span style={{ color: '#076ABC', fontWeight: 700 }}>Acto ID: {adendaTargetConsultation.id}</span>
            </div>
            <div><strong>Consulta Original:</strong> {adendaTargetConsultation.date} a las {adendaTargetConsultation.time} hs</div>
            <div style={{ marginTop: '2px', color: '#475569' }}><strong>Diagnóstico Asentado:</strong> {adendaTargetConsultation.diagnosis}</div>
          </div>

          {/* REASON SELECTOR */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Motivo Legal de la Adenda
            </label>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {adendaTypes.map((type, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAdendaReason(type)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: adendaReason === type ? '1.5px solid #002182' : '1px solid #cbd5e1',
                    background: adendaReason === type ? '#F5F8FE' : '#ffffff',
                    color: adendaReason === type ? '#002182' : '#64748b'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={adendaReason}
              onChange={(e) => setAdendaReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.86rem',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* ADENDA TEXT */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Contenido de la Adenda / Aclaración Clínica *
            </label>
            <textarea
              rows={4}
              value={adendaText}
              onChange={(e) => setAdendaText(e.target.value)}
              placeholder="Describa con precisión la enmienda, resultado de resonancia/radiografía verificado, evolución complementaria o rectificación terapéutica..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>

          {/* SIGNATURE NOTICE */}
          <div style={{ fontSize: '0.76rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.25rem' }}>
            <Lock size={14} />
            <span>
              Firmante Digital X.509: <strong>{activeDoctorName}</strong> ({activeDoctorLicense}) · Sellado de tiempo criptográfico SHA-256
            </span>
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAdendaModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.35rem',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
              }}
            >
              <FileEdit size={16} /> Firmar & Asentar Adenda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
