import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { getTodayArgentina } from '../../utils/dateUtils';
import { generateSHA256Hash } from '../../utils/cryptoAudit';
import {
  Eye,
  X,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  Activity
} from 'lucide-react';

export const NewImagingStudyModal = () => {
  const {
    isImagingStudyModalOpen,
    setIsImagingStudyModalOpen,
    patients,
    scopedPatients,
    doctors,
    currentDoctor,
    isDoctor,
    addImagingStudy,
    addToast
  } = useClinic();

  // El médico solicitante es estrictamente el que está en la sesión activa y no debe cambiar
  const activeDoctorName = isDoctor && currentDoctor ? currentDoctor.name : (doctors[0]?.name || 'Dr. Alejandro Blanco');

  const imagingPresets = [
    {
      label: 'RMN Rodilla (LCA / Meniscos)',
      modality: 'Resonancia Magnética Nuclear (RMN)',
      bodyPart: 'Rodilla Derecha (Protocolo Ligamentario LCA & Meniscos)',
      center: 'Centro de Diagnóstico Por Imágenes Arroyito',
      radiologist: 'Dra. Patricia Solari (MN 92.401 / MP 28.910 CMPC)',
      findings: 'Plastia de ligamento cruzado anterior normoposicionada sin signos de dehiscencia ni fricción intercondílea. Meniscos íntegros. Sin derrame articular a tensión.',
      conclusion: 'Evolución satisfactoria post-reconstrucción ligamentaria. Articulación fémoro-tibial y fémoro-patelar conservadas.'
    },
    {
      label: 'Rx Columna Lumbar (F y P)',
      modality: 'Radiografía Digital (RX)',
      bodyPart: 'Columna Lumbo-Sacra (Frente y Perfil)',
      center: 'Instituto Radiológico San Justo',
      radiologist: 'Dr. Gonzalo Méndez (MP 33.109 CMPC)',
      findings: 'Alineación lordótica lumbar conservada. Espacios intersomáticos L1-L4 respetados. Leve pinzamiento discal posterior L5-S1 sin lisis ni espondilolistesis.',
      conclusion: 'Signos de discopatía degenerativa incipiente L5-S1. Sin lesiones traumáticas óseas agudas.'
    },
    {
      label: 'Ecografía Hombro (Manguito Rotador)',
      modality: 'Ecografía de Partes Blandas (Eco)',
      bodyPart: 'Hombro Derecho (Tendón Supraespinoso y Manguito Rotador)',
      center: 'Centro de Diagnóstico Por Imágenes Arroyito',
      radiologist: 'Dr. Gonzalo Méndez (MP 33.109 CMPC)',
      findings: 'Tendón supraespinoso con engrosamiento focal y alteración ecoestructural sin solución de continuidad de espesor completo. Tendón bicipital en corredera normoposicionado.',
      conclusion: 'Tendinopatía insercional de supraespinoso sin desgarro de espesor completo. Bursitis subacromial reactiva.'
    },
    {
      label: 'Rx Tobillo (F, P y Mortaja)',
      modality: 'Radiografía Digital (RX)',
      bodyPart: 'Tobillo Derecho (Frente, Perfil y Proyección de Mortaja)',
      center: 'Instituto Radiológico San Justo',
      radiologist: 'Dr. Gonzalo Méndez (MP 33.109 CMPC)',
      findings: 'Mortaja articular conservada, espacio medial normal (< 4 mm). Sin trazos de fractura ósea ni arrancamientos maleolares. Tumefacción de partes blandas perimaleolar externa.',
      conclusion: 'Estudio radiográfico negativo para lesión ósea. Criterios de Ottawa negativos. Compatible con esguince de tobillo.'
    }
  ];

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [modality, setModality] = useState('Radiografía Digital (RX)');
  const [bodyPart, setBodyPart] = useState('');
  const [studyDate, setStudyDate] = useState(getTodayArgentina());
  const [center, setCenter] = useState('');
  const [radiologist, setRadiologist] = useState('');
  const [findings, setFindings] = useState('');
  const [conclusion, setConclusion] = useState('');

  if (!isImagingStudyModalOpen) return null;

  const availablePatients = isDoctor ? scopedPatients : patients;
  const selectedPatient = availablePatients.find((p) => p.id === selectedPatientId) || null;

  const handleApplyPreset = (preset) => {
    setModality(preset.modality);
    setBodyPart(preset.bodyPart);
    setCenter(preset.center);
    setRadiologist(preset.radiologist);
    setFindings(preset.findings);
    setConclusion(preset.conclusion);
    addToast('Plantilla Aplicada', `Se cargó el protocolo para ${preset.label}.`, 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      addToast('Paciente Requerido', 'Debe seleccionar un paciente de la lista.', 'warning');
      return;
    }
    const todayStr = studyDate || getTodayArgentina();
    const hasReport = Boolean((conclusion && conclusion.trim()) || (findings && findings.trim()));

    addImagingStudy({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientDni: selectedPatient.dni,
      doctorId: isDoctor && currentDoctor ? currentDoctor.id : undefined,
      modality,
      bodyPart: bodyPart.trim() || 'Región anatómica no especificada',
      center: center.trim() || 'Centro de Diagnóstico Externo',
      referringDoctor: activeDoctorName,
      radiologist: radiologist.trim() || 'Médico Radiólogo',
      findings: findings.trim(),
      conclusion: conclusion.trim(),
      date: todayStr,
      status: hasReport ? 'Informado' : 'Realizado',
      seriesCount: modality.includes('RMN') ? 4 : modality.includes('TAC') ? 3 : 2,
      fileSize: modality.includes('RMN') ? '48.2 MB' : modality.includes('TAC') ? '62.1 MB' : '18.4 MB',
      hashSha256: generateSHA256Hash(`${selectedPatient.dni}|${modality}|${bodyPart}|${todayStr}|${Date.now()}`),
      thumbnailUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80'
    });

    setIsImagingStudyModalOpen(false);
    addToast('Estudio Registrado', 'El estudio diagnóstico ha sido incorporado a la historia clínica del paciente.', 'success');
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
      onClick={() => setIsImagingStudyModalOpen(false)}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#ffffff',
          borderRadius: '22px',
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
            padding: '1.25rem 1.75rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #076ABC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93C5FD'
              }}
            >
              <Eye size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>
                Cargar Estudio de Diagnóstico por Imágenes
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#D2E3FC', marginTop: '2px' }}>
                Registro y archivo de estudios radiológicos (RMN, RX, TAC, Ecografía)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsImagingStudyModalOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              width: '34px',
              height: '34px',
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

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', maxHeight: '78vh' }}>
          {/* PLANTILLAS RÁPIDAS */}
          <div style={{ marginBottom: '1.25rem', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} color="#076ABC" /> Plantillas frecuentes de traumatología (autocompletar)
            </div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {imagingPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#002182';
                    e.currentTarget.style.color = '#002182';
                    e.currentTarget.style.background = '#EFF6FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.color = '#334155';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={12} color="#076ABC" />
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN 1: PACIENTE Y PROFESIONAL EN SESIÓN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                Paciente Titular *
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.62rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              >
                <option value="">-- Seleccionar Paciente --</option>
                {availablePatients.map((pat) => (
                  <option key={pat.id} value={pat.id}>
                    {pat.name} — DNI {pat.dni} ({pat.insuranceName || 'Particular'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                Médico Solicitante
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.62rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #E2E8F0',
                  background: '#F8FAFC',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stethoscope size={16} color="#076ABC" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                    {activeDoctorName}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#047857',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '2px 7px',
                    borderRadius: '6px'
                  }}
                >
                  Sesión activa
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL ESTUDIO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                Modalidad del Estudio *
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.62rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              >
                <option value="Resonancia Magnética Nuclear (RMN)">Resonancia Magnética (RMN)</option>
                <option value="Radiografía Digital (RX)">Radiografía Digital (RX)</option>
                <option value="Tomografía Computada Multislice (TAC)">Tomografía Computada (TAC)</option>
                <option value="Ecografía de Partes Blandas (Eco)">Ecografía Músculo-Esquelética</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                Región Anatómica *
              </label>
              <input
                type="text"
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
                placeholder="Ej: Rodilla Derecha, Hombro Izquierdo..."
                style={{
                  width: '100%',
                  padding: '0.62rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                Fecha de Realización del Estudio
              </label>
              <input
                type="date"
                value={studyDate}
                onChange={(e) => setStudyDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.62rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                Centro Emisor / Institución Externa <span style={{ color: '#64748b', fontWeight: 600 }}>(Opcional)</span>
              </label>
              <input
                type="text"
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                placeholder="Ej: Instituto Oulton, Sanatorio Privado..."
                style={{
                  width: '100%',
                  padding: '0.62rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* SECCIÓN 3: INFORME RADIOLÓGICO (OPCIONAL) */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Informe Radiológico Adjunto
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Opcional
              </span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                Médico Radiólogo Informante <span style={{ color: '#64748b', fontWeight: 600 }}>(Opcional)</span>
              </label>
              <input
                type="text"
                value={radiologist}
                onChange={(e) => setRadiologist(e.target.value)}
                placeholder="Ej: Dr. Gonzalo Méndez (Radiólogo)..."
                style={{
                  width: '100%',
                  padding: '0.62rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                Hallazgos Radiológicos / Descripción Técnica <span style={{ color: '#64748b', fontWeight: 600 }}>(Opcional)</span>
              </label>
              <textarea
                rows={3}
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Descripción de cortes, secuencias o hallazgos anatómicos (opcional)..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  lineHeight: 1.5,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                Conclusión Diagnóstica <span style={{ color: '#64748b', fontWeight: 600 }}>(Opcional)</span>
              </label>
              <textarea
                rows={2}
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Conclusión diagnóstica del estudio (opcional)..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  lineHeight: 1.5,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsImagingStudyModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.4rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
              }}
            >
              <CheckCircle2 size={16} /> Guardar Estudio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
