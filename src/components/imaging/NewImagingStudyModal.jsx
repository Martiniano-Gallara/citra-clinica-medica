import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Eye,
  X,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  FileCheck2,
  Stethoscope,
  Building,
  Activity
} from 'lucide-react';

export const NewImagingStudyModal = () => {
  const {
    isImagingStudyModalOpen,
    setIsImagingStudyModalOpen,
    patients,
    doctors,
    currentDoctor,
    isDoctor,
    addImagingStudy,
    addToast
  } = useClinic();

  const activeDoctorName = isDoctor && currentDoctor ? currentDoctor.name : 'Dr. Alejandro Blanco';

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
      center: 'Servicio Radiología CITRA Sede Central',
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
      center: 'Servicio Radiología CITRA Sede Central',
      radiologist: 'Dr. Gonzalo Méndez (MP 33.109 CMPC)',
      findings: 'Mortaja articular conservada, espacio medial normal (< 4 mm). Sin trazos de fractura ósea ni arrancamientos maleolares. Tumefacción de partes blandas perimaleolar externa.',
      conclusion: 'Estudio radiográfico negativo para lesión ósea. Criterios de Ottawa negativos. Compatible con esguince de tobillo.'
    }
  ];

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [modality, setModality] = useState(imagingPresets[0].modality);
  const [bodyPart, setBodyPart] = useState(imagingPresets[0].bodyPart);
  const [center, setCenter] = useState(imagingPresets[0].center);
  const [referringDoctor, setReferringDoctor] = useState(activeDoctorName);
  const [radiologist, setRadiologist] = useState(imagingPresets[0].radiologist);
  const [findings, setFindings] = useState(imagingPresets[0].findings);
  const [conclusion, setConclusion] = useState(imagingPresets[0].conclusion);

  if (!isImagingStudyModalOpen) return null;

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

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
      conclusion,
      date: new Date().toISOString().split('T')[0],
      status: 'Informado',
      seriesCount: modality.includes('RMN') ? 4 : modality.includes('TAC') ? 3 : 2,
      fileSize: modality.includes('RMN') ? '48.2 MB' : modality.includes('TAC') ? '62.1 MB' : '18.4 MB',
      hashSha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b5c6d7e8f9a0b1c2d3e4f5a6b',
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
          maxWidth: '740px',
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
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93C5FD'
              }}
            >
              <Eye size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>
                Cargar Estudio de Diagnóstico por Imágenes
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#D2E3FC', marginTop: '2px' }}>
                Registro de RMN, Radiografía Digital, TAC y Ecografía en Sistema PACS CITRA
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
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', maxHeight: '75vh' }}>
          {/* QUICK PRESETS */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} color="#076ABC" /> Protocolos Traumatológicos Frecuentes (1-Click)
            </div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {imagingPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    background: '#F5F8FE',
                    border: '1.5px solid #BFDBFE',
                    borderRadius: '8px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#002182',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#002182')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#BFDBFE')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Activity size={12} color="#076ABC" />
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* PATIENT SELECTION */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
              Paciente Titular *
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: '#ffffff',
                outline: 'none'
              }}
              required
            >
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.name} — DNI {pat.dni} ({pat.insuranceName || 'Particular'})
                </option>
              ))}
            </select>
          </div>

          {/* MODALITY AND BODY PART */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                Modalidad del Estudio *
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  outline: 'none'
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                Región Anatómica *
              </label>
              <input
                type="text"
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
                placeholder="Ej: Rodilla Derecha, Hombro Izq..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
          </div>

          {/* DOCTOR AND RADIOLOGIST */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                Médico Traumatólogo Solicitante
              </label>
              <input
                type="text"
                value={referringDoctor}
                onChange={(e) => setReferringDoctor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  background: '#f8fafc',
                  fontWeight: 700,
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                Médico Radiólogo Informante
              </label>
              <input
                type="text"
                value={radiologist}
                onChange={(e) => setRadiologist(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
          </div>

          {/* CENTER */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
              Centro Radiológico / Institución
            </label>
            <input
              type="text"
              value={center}
              onChange={(e) => setCenter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* FINDINGS */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
              Hallazgos Radiológicos / Descripción Técnica *
            </label>
            <textarea
              rows={3}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
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
              required
            />
          </div>

          {/* CONCLUSION */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
              Conclusión Diagnóstica *
            </label>
            <textarea
              rows={2}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
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
              required
            />
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
              <CheckCircle2 size={16} /> Guardar Estudio en PACS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
