import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { FileBadge, X, CheckCircle2, QrCode, ShieldCheck } from 'lucide-react';

export const MedicalCertificateModal = () => {
  const {
    isMedicalCertificateModalOpen,
    setIsMedicalCertificateModalOpen,
    patients,
    currentUser,
    addMedicalCertificate
  } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [certificateType, setCertificateType] = useState('Certificado de Reposo Laboral / Licencia Médica');
  const [diagnosis, setDiagnosis] = useState('M54.5 - Lumbalgia Aguda Severa con Radiculopatía L5');
  const [restDays, setRestDays] = useState(7);
  const [restStartDate, setRestStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('Se certifica que el paciente debe guardar reposo laboral y evitar esfuerzos físicos por presentar cuadro álgico agudo que limita la deambulación.');

  if (!isMedicalCertificateModalOpen) return null;

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const calculateEndDate = (startDateStr, days) => {
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + Number(days));
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const restEndDate = calculateEndDate(restStartDate, restDays);

    addMedicalCertificate({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientDni: selectedPatient.dni,
      doctorId: currentUser.id || 'doc-1',
      doctorName: currentUser.name || 'Dr. Alejandro Morales',
      doctorLicense: currentUser.sisaLicense || 'MN 114.829 / MP 44.920',
      certificateType,
      diagnosis,
      restDays: Number(restDays),
      restStartDate,
      restEndDate,
      content
    });

    setIsMedicalCertificateModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsMedicalCertificateModalOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="avatar-sm" style={{ background: 'var(--c-soft)', color: 'var(--c-dark)' }}>
              <FileBadge size={18} />
            </div>
            <div>
              <h3 className="modal-title">Emisión de Certificado Médico Oficial</h3>
              <p className="modal-subtitle">Con validación QR, firma digital y cumplimiento de Ley 26.529</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsMedicalCertificateModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div className="form-group">
              <label className="form-label">Paciente</label>
              <select
                className="form-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
              >
                {patients.map((pat) => (
                  <option key={pat.id} value={pat.id}>
                    {pat.name} — DNI {pat.dni}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Certificado</label>
              <select
                className="form-select"
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                required
              >
                <option value="Certificado de Reposo Laboral / Licencia Médica">Certificado de Reposo Laboral / Licencia Médica</option>
                <option value="Certificado de Apto Físico Deportivo">Certificado de Apto Físico Deportivo Traumatológico</option>
                <option value="Certificado de Asistencia a Consulta Médica">Certificado de Asistencia a Consulta Médica</option>
                <option value="Certificado de Discapacidad / Movilidad Reducida">Certificado de Movilidad Reducida / Inmovilización</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnóstico (CIE-10)</label>
              <input
                type="text"
                className="form-input"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />
            </div>

            {certificateType.includes('Reposo') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Días de Reposo Prescrito</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    className="form-input"
                    value={restDays}
                    onChange={(e) => setRestDays(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de Inicio de Reposo</label>
                  <input
                    type="date"
                    className="form-input"
                    value={restStartDate}
                    onChange={(e) => setRestStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Cuerpo del Certificado / Observaciones</label>
              <textarea
                className="form-input"
                rows="3"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <QrCode size={24} color="var(--primary)" />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Se generará automáticamente un <strong>código QR de autenticidad</strong> que cualquier empleador o entidad podrá escanear para verificar la legitimidad del acto médico.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsMedicalCertificateModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              Firmar y Generar Certificado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
