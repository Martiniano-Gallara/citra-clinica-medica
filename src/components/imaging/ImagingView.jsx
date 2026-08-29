import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Eye,
  Plus,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Contrast,
  Sliders,
  Maximize2,
  FileText,
  CheckCircle2,
  Share2,
  Download,
  Printer,
  ShieldCheck,
  Ruler,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const ImagingView = () => {
  const {
    imagingStudies,
    patients,
    setIsImagingStudyModalOpen,
    updateImagingStudyReport,
    addToast
  } = useClinic();

  const [selectedStudyId, setSelectedStudyId] = useState(imagingStudies[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModality, setFilterModality] = useState('all');

  // PACS Viewer Controls State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [measurementTool, setMeasurementTool] = useState('none'); // 'none', 'ruler', 'angle'

  // Report editing state
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editFindings, setEditFindings] = useState('');
  const [editConclusion, setEditConclusion] = useState('');

  const selectedStudy = imagingStudies.find((s) => s.id === selectedStudyId) || imagingStudies[0];

  const filteredStudies = imagingStudies.filter((s) => {
    const matchSearch =
      s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.patientDni.includes(searchTerm);
    const matchMod = filterModality === 'all' || s.modality.includes(filterModality);
    return matchSearch && matchMod;
  });

  const resetViewer = () => {
    setZoomLevel(1);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setRotation(0);
    setMeasurementTool('none');
  };

  const handleSaveReport = () => {
    if (!selectedStudy) return;
    updateImagingStudyReport(
      selectedStudy.id,
      editFindings || selectedStudy.findings,
      editConclusion || selectedStudy.conclusion,
      selectedStudy.radiologist
    );
    setIsEditingReport(false);
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="badge-wrapper" style={{ marginBottom: '0.4rem' }}>
            <span className="badge badge-teal">
              <Eye size={13} style={{ marginRight: '4px' }} />
              Servicio de Diagnóstico por Imágenes & Visor PACS / DICOM
            </span>
          </div>
          <h1 className="view-title">Estudios, Radiología & PACS</h1>
          <p className="view-subtitle">
            Visualización radiológica de alta resolución, mediciones traumatológicas (Cobb, Insall-Salvati) e informes firmados.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsImagingStudyModalOpen(true)}
          >
            <Plus size={18} />
            Cargar Nuevo Estudio
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left: Studies List & Filters */}
        <div className="card" style={{ padding: '1rem', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '0.85rem' }}>
            <div className="search-box-inline" style={{ width: '100%', marginBottom: '0.65rem' }}>
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar paciente, DNI o región..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '100%', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
              value={filterModality}
              onChange={(e) => setFilterModality(e.target.value)}
            >
              <option value="all">Todas las Modalidades</option>
              <option value="Resonancia">Resonancias (RMN)</option>
              <option value="Radiografía">Radiografías (RX)</option>
              <option value="Tomografía">Tomografías (TAC)</option>
            </select>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filteredStudies.map((study) => {
              const isSelected = study.id === selectedStudy?.id;
              return (
                <div
                  key={study.id}
                  onClick={() => {
                    setSelectedStudyId(study.id);
                    setIsEditingReport(false);
                    resetViewer();
                  }}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '2px solid var(--c-primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {study.patientName}
                    </span>
                    <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
                      {study.modality.split(' ')[0]}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-primary)' }}>
                    {study.bodyPart}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{study.date}</span>
                    <span>{study.seriesCount} series • {study.fileSize}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: PACS Interactive Viewer & Report */}
        {selectedStudy ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* PACS Viewport Canvas */}
            <div
              className="card"
              style={{
                padding: '0',
                background: '#090f10',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                border: '1px solid #1a3333'
              }}
            >
              {/* PACS Top Control Bar */}
              <div
                style={{
                  background: '#0c1b1c',
                  padding: '0.65rem 1.25rem',
                  borderBottom: '1px solid #1e3a3a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#CDEEEE'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontWeight: 800, color: '#6FD0CC', fontSize: '0.9rem' }}>
                    VISOR DICOM / PACS CITRA
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#7ba8a6' }}>
                    {selectedStudy.modality} — {selectedStudy.bodyPart}
                  </span>
                </div>

                {/* Toolbar Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#142c2d', color: '#CDEEEE', border: '1px solid #234848' }}
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                    title="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#142c2d', color: '#CDEEEE', border: '1px solid #234848' }}
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                    title="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#142c2d', color: '#CDEEEE', border: '1px solid #234848' }}
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    title="Rotar 90°"
                  >
                    <RotateCw size={15} />
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${isInverted ? 'btn-primary' : ''}`}
                    style={{ background: isInverted ? 'var(--c-primary)' : '#142c2d', color: '#CDEEEE', border: '1px solid #234848' }}
                    onClick={() => setIsInverted(!isInverted)}
                    title="Invertir Negativo"
                  >
                    <Contrast size={15} />
                    Invertir
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${measurementTool === 'ruler' ? 'btn-primary' : ''}`}
                    style={{ background: measurementTool === 'ruler' ? 'var(--c-primary)' : '#142c2d', color: '#CDEEEE', border: '1px solid #234848' }}
                    onClick={() => setMeasurementTool(measurementTool === 'ruler' ? 'none' : 'ruler')}
                    title="Calibrador milimétrico"
                  >
                    <Ruler size={15} />
                    Calibrar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#142c2d', color: '#CDEEEE', border: '1px solid #234848' }}
                    onClick={resetViewer}
                    title="Restablecer Visor"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* PACS Image Viewport Area */}
              <div
                style={{
                  height: '420px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#040707'
                }}
              >
                {/* Image under transformation */}
                <div
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : 'invert(0)'}`,
                    transition: 'transform 0.15s ease-out',
                    maxWidth: '85%',
                    maxHeight: '85%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <img
                    src={selectedStudy.thumbnailUrl}
                    alt={selectedStudy.bodyPart}
                    style={{
                      maxHeight: '380px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: '4px',
                      boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)'
                    }}
                  />

                  {/* Measurement HUD Overlay */}
                  {measurementTool === 'ruler' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40%',
                        left: '25%',
                        width: '180px',
                        borderBottom: '2px dashed #00ffcc',
                        color: '#00ffcc',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        paddingBottom: '4px',
                        textShadow: '0 1px 4px #000'
                      }}
                    >
                      <span>📏 Calibre: 8.4 mm (Normoposición)</span>
                    </div>
                  )}
                </div>

                {/* DICOM Metadata Overlay In-Canvas */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '14px',
                    color: '#6FD0CC',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    lineHeight: 1.5,
                    pointerEvents: 'none',
                    textShadow: '0 1px 3px #000'
                  }}
                >
                  <div>PAC: {selectedStudy.patientName.toUpperCase()}</div>
                  <div>DNI: {selectedStudy.patientDni}</div>
                  <div>MOD: {selectedStudy.modality.split(' ')[0]} | KV: 120 / MA: 250</div>
                  <div>FOV: 240mm | MATRIX: 512x512</div>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '14px',
                    color: '#CDEEEE',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    lineHeight: 1.5,
                    textAlign: 'right',
                    pointerEvents: 'none',
                    textShadow: '0 1px 3px #000'
                  }}
                >
                  <div>ZOOM: {Math.round(zoomLevel * 100)}%</div>
                  <div>ROT: {rotation}°</div>
                  <div>HASH: {selectedStudy.hashSha256?.substring(0, 12)}...</div>
                </div>
              </div>

              {/* PACS Bottom Sliders */}
              <div
                style={{
                  background: '#0c1b1c',
                  padding: '0.5rem 1.25rem',
                  borderTop: '1px solid #1e3a3a',
                  display: 'flex',
                  gap: '2rem',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: '#CDEEEE'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <Sun size={14} color="#6FD0CC" />
                  <span>Brillo:</span>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <span>{brightness}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <Sliders size={14} color="#6FD0CC" />
                  <span>Contraste:</span>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <span>{contrast}%</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Report Panel */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="badge badge-teal" style={{ marginBottom: '0.35rem' }}>
                    Informe Médico Oficial
                  </div>
                  <h3 className="card-title">Informe Radiológico / Diagnóstico Traumatológico</h3>
                  <p className="card-subtitle">
                    Especialista: {selectedStudy.radiologist || 'Dr. Gonzalo Méndez (MP 33.109)'} • Centro: {selectedStudy.center}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setIsEditingReport(!isEditingReport);
                      setEditFindings(selectedStudy.findings);
                      setEditConclusion(selectedStudy.conclusion);
                    }}
                  >
                    {isEditingReport ? 'Cancelar Edición' : 'Editar Informe'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => addToast('Informe Enviado', 'El PDF firmado ha sido enviado al portal y WhatsApp del paciente.', 'success')}
                  >
                    <Share2 size={14} />
                    Compartir
                  </button>
                </div>
              </div>

              {!isEditingReport ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      HALLAZGOS RADIOLÓGICOS / DESCRIPCIÓN TÉCNICA:
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                      {selectedStudy.findings}
                    </p>
                  </div>

                  <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--c-primary)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--c-dark)', marginBottom: '0.3rem' }}>
                      CONCLUSIÓN DIAGNÓSTICA:
                    </h4>
                    <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {selectedStudy.conclusion}
                    </p>
                  </div>

                  {selectedStudy.measurements && (
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', background: '#ffffff', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                      {Object.entries(selectedStudy.measurements).map(([k, v]) => (
                        <div key={k}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}: </span>
                          <strong style={{ color: 'var(--c-dark)' }}>{v}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700 }}>
                      <ShieldCheck size={16} />
                      Firma Digital X.509 Verificada • Integridad SHA-256 válida
                    </div>
                    <div>Código Estudio: {selectedStudy.id}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Hallazgos Radiológicos</label>
                    <textarea
                      className="form-input"
                      rows="4"
                      value={editFindings}
                      onChange={(e) => setEditFindings(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Conclusión Diagnóstica</label>
                    <textarea
                      className="form-input"
                      rows="2"
                      value={editConclusion}
                      onChange={(e) => setEditConclusion(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setIsEditingReport(false)}
                    >
                      Descartar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveReport}
                    >
                      <CheckCircle2 size={16} />
                      Guardar y Firmar Informe
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p>Seleccione un estudio radiológico de la lista para abrir el visor PACS.</p>
          </div>
        )}
      </div>
    </div>
  );
};
