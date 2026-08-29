import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Eye, X, Upload, CheckCircle2, ShieldCheck } from 'lucide-react';

export const NewImagingStudyModal = () => {
  const {
    isImagingStudyModalOpen,
    setIsImagingStudyModalOpen,
    patients,
    doctors,
    addImagingStudy
  } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [modality, setModality] = useState('Radiografía Digital (RX)');
  const [bodyPart, setBodyPart] = useState('Rodilla Derecha (Frente y Perfil)');
  const [center, setCenter] = useState('Servicio Radiología CITRA Sede Central');
  const [referringDoctor, setReferringDoctor] = useState('Dr. Alejandro Morales');
  const [radiologist, setRadiologist] = useState('Dr. Gonzalo Méndez (MP 33.109)');
  const [findings, setFindings] = useState('Estructuras óseas de densidad y morfología conservadas. Espacios articulares preservados sin osteofitos ni calcificaciones patológicas.');
  const [conclusion, setConclusion] = useState('Estudio radiológico sin alteraciones óseas agudas evidentes.');

  if (!isImagingStudyModalOpen) return null;

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    addImagingStudy({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientDni: selectedPatient.dni,
      modality,
      bodyPart,
      center,
      referringDoctor,
      radiologist,
      findings,
      conclusion
    });
    setIsImagingStudyModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsImagingStudyModalOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '650px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="avatar-sm" style={{ background: 'var(--c-soft)', color: 'var(--c-dark)' }}>
              <Eye size={18} />
            </div>
            <div>
              <h3 className="modal-title">Cargar Estudio de Diagnóstico por Imágenes</h3>
              <p className="modal-subtitle">Subida de archivos DICOM / Informes radiológicos</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsImagingStudyModalOpen(false)}
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
                    {pat.name} — DNI {pat.dni}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Modalidad</label>
                <select
                  className="form-select"
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  required
                >
                  <option value="Radiografía Digital (RX)">Radiografía Digital (RX)</option>
                  <option value="Resonancia Magnética Nuclear (RMN)">Resonancia Magnética (RMN)</option>
                  <option value="Tomografía Computada (TAC)">Tomografía Computada (TAC)</option>
                  <option value="Ecografía Músculo-Esquelética">Ecografía Músculo-Esquelética</option>
                  <option value="Laboratorio Clínico">Laboratorio Clínico</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Región Anatómica / Estudio</label>
                <input
                  type="text"
                  className="form-input"
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  placeholder="Ej: Rodilla Derecha, Hombro Izq, Columna Lumbar..."
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Médico Especialista Derivante</label>
                <input
                  type="text"
                  className="form-input"
                  value={referringDoctor}
                  onChange={(e) => setReferringDoctor(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Médico Radiólogo Informante</label>
                <input
                  type="text"
                  className="form-input"
                  value={radiologist}
                  onChange={(e) => setRadiologist(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Centro Radiológico / Institución</label>
              <input
                type="text"
                className="form-input"
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hallazgos Radiológicos</label>
              <textarea
                className="form-input"
                rows="3"
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Conclusión Diagnóstica</label>
              <textarea
                className="form-input"
                rows="2"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                required
              />
            </div>

            {/* Upload Area Mock */}
            <div
              style={{
                border: '2px dashed var(--border-color)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                background: 'var(--bg-subtle)'
              }}
            >
              <Upload size={24} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Arrastre archivos DICOM (.dcm), ZIP de series o PDF de informe
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Verificación automática de checksum SHA-256 según Ley 25.326
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsImagingStudyModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              Cargar y Publicar al PACS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
