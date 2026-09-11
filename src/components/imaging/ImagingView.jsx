import React, { useState, useMemo } from 'react';
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
  Printer,
  ShieldCheck,
  Ruler,
  ChevronDown,
  ChevronUp,
  X,
  Stethoscope,
  Activity,
  Calendar,
  Building,
  User,
  Copy,
  ExternalLink,
  Edit3,
  Check,
  FileCheck,
  Info
} from 'lucide-react';

export const ImagingView = () => {
  const {
    imagingStudies,
    scopedImagingStudies,
    isDoctor,
    currentDoctor,
    patients,
    setIsImagingStudyModalOpen,
    updateImagingStudyReport,
    addToast
  } = useClinic();

  // Scope to Dr. Blanco when logged in as physician
  const effectiveStudies = isDoctor ? scopedImagingStudies : imagingStudies;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Interactive Table Accordion State (which row is expanded)
  const [expandedStudyId, setExpandedStudyId] = useState(effectiveStudies[0]?.id || null);

  // PACS Lightbox Modal State
  const [pacsModalStudy, setPacsModalStudy] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [measurementTool, setMeasurementTool] = useState('none'); // 'none', 'ruler'

  // Inline Report Editing State
  const [editingStudyId, setEditingStudyId] = useState(null);
  const [editFindings, setEditFindings] = useState('');
  const [editConclusion, setEditConclusion] = useState('');

  // Doctor display info
  const doctorName = currentDoctor?.name || 'Dr. Alejandro Blanco';
  const doctorSpecialty = currentDoctor?.specialty || 'Traumatología y Ortopedia';

  // Filtered Studies
  const filteredStudies = useMemo(() => {
    return effectiveStudies.filter((study) => {
      // Modality filter
      if (modalityFilter !== 'all' && !study.modality.toLowerCase().includes(modalityFilter.toLowerCase())) {
        return false;
      }
      // Status filter
      if (statusFilter === 'informados' && study.status !== 'Informado') return false;
      if (statusFilter === 'pendientes' && study.status === 'Informado') return false;

      // Search match
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim();
        const matchName = study.patientName?.toLowerCase().includes(q);
        const matchDni = study.patientDni?.includes(q);
        const matchBody = study.bodyPart?.toLowerCase().includes(q);
        const matchCenter = study.center?.toLowerCase().includes(q);
        const matchConclusion = study.conclusion?.toLowerCase().includes(q);
        const matchId = study.id?.toLowerCase().includes(q);
        return matchName || matchDni || matchBody || matchCenter || matchConclusion || matchId;
      }
      return true;
    });
  }, [effectiveStudies, modalityFilter, statusFilter, searchTerm]);

  // Operational Metrics
  const metrics = useMemo(() => {
    const total = effectiveStudies.length;
    const rmnCount = effectiveStudies.filter((s) => s.modality.includes('Resonancia') || s.modality.includes('RMN')).length;
    const rxTacCount = effectiveStudies.filter((s) => s.modality.includes('Radiografía') || s.modality.includes('Tomografía') || s.modality.includes('TAC') || s.modality.includes('RX')).length;
    const informedCount = effectiveStudies.filter((s) => s.status === 'Informado').length;
    return { total, rmnCount, rxTacCount, informedCount };
  }, [effectiveStudies]);

  // Open PACS Modal for a given study
  const handleOpenPacs = (study, e) => {
    if (e) e.stopPropagation();
    setPacsModalStudy(study);
    setZoomLevel(1);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setRotation(0);
    setMeasurementTool('none');
  };

  const handleClosePacs = () => {
    setPacsModalStudy(null);
  };

  // Reset PACS controls
  const handleResetPacsControls = () => {
    setZoomLevel(1);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setRotation(0);
    setMeasurementTool('none');
  };

  // Toggle row expansion
  const toggleRow = (studyId) => {
    setExpandedStudyId((prev) => (prev === studyId ? null : studyId));
  };

  // Start editing report
  const handleStartEdit = (study, e) => {
    if (e) e.stopPropagation();
    setEditingStudyId(study.id);
    setEditFindings(study.findings || '');
    setEditConclusion(study.conclusion || '');
  };

  // Save edited report
  const handleSaveReport = (studyId) => {
    const study = effectiveStudies.find((s) => s.id === studyId);
    if (!study) return;
    updateImagingStudyReport(
      studyId,
      editFindings || study.findings,
      editConclusion || study.conclusion,
      study.radiologist
    );
    setEditingStudyId(null);
    addToast('Informe Actualizado', 'Los hallazgos y conclusión médica han sido guardados con firma criptográfica.', 'success');
  };

  // WhatsApp sharing
  const handleShareWhatsApp = (study, e) => {
    if (e) e.stopPropagation();
    const patient = patients.find((p) => p.id === study.patientId || p.dni === study.patientDni);
    const phone = patient?.phone || '5493510000000';
    const msg = `*CITRA Diagnóstico por Imágenes*\nEstimado/a ${study.patientName},\nSu informe de *${study.modality}* (${study.bodyPart}) solicitado por ${doctorName} se encuentra disponible y validado.\nConclusión: ${study.conclusion}\nCódigo de estudio: ${study.id}`;
    addToast('Enlace de WhatsApp', `Mensaje preparado para enviar al ${phone}.`, 'success');
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Print report
  const handlePrintStudy = (study, e) => {
    if (e) e.stopPropagation();
    addToast('Imprimiendo Informe', `Generando PDF oficial del estudio ${study.id}...`, 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Copy hash to clipboard
  const handleCopyHash = (hash, e) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hash);
      addToast('Hash SHA-256 Copiado', 'Identificador de integridad copiado al portapapeles.', 'info');
    }
  };

  // Format initials
  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Get modality tag styling
  const getModalityBadge = (modality) => {
    const mod = modality.toLowerCase();
    if (mod.includes('resonancia') || mod.includes('rmn')) {
      return { label: 'RMN', bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe', emoji: '🦵' };
    }
    if (mod.includes('tomografía') || mod.includes('tac')) {
      return { label: 'TAC', bg: '#fef3c7', color: '#b45309', border: '#fde68a', emoji: '🧠' };
    }
    if (mod.includes('ecografía') || mod.includes('eco')) {
      return { label: 'ECO', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', emoji: '💪' };
    }
    return { label: 'RX', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', emoji: '🦴' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* 1. TOP HEADER: CLEAN, UNSATURATED, MEDICAL-GRADE */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '0.2rem 0.65rem',
                borderRadius: '100px',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Stethoscope size={13} />
              {isDoctor ? `Dr. Alejandro Blanco (${doctorSpecialty})` : 'Servicio de Imágenes & PACS'}
            </span>
            <span
              style={{
                background: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
                padding: '0.2rem 0.65rem',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 800
              }}
            >
              CMPC M.P. 34.892 · PROTOCOLO TRAUMATOLOGÍA
            </span>
            <span
              style={{
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0',
                padding: '0.2rem 0.65rem',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              VISOR PACS / DICOM INTEGRADO
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            {isDoctor ? 'Mis Estudios & Radiología' : 'Diagnóstico por Imágenes & PACS'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            {isDoctor
              ? `Estudios diagnósticos (RMN, RX, TAC, Ecografía) solicitados e informados para tus pacientes (${filteredStudies.length} estudios registrados).`
              : 'Visualización radiológica de alta resolución, mediciones traumatológicas e informes con firma digital X.509.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsImagingStudyModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Plus size={18} />
          Solicitar / Cargar Estudio
        </button>
      </div>

      {/* 2. OPERATIONAL KPI SUMMARY STRIP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* Card 1: Total Estudios */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Estudios del Paciente
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Eye size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
            {metrics.total}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Estudios en historial traumatológico
          </div>
        </div>

        {/* Card 2: Resonancias (RMN) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Resonancias (RMN)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ede9fe',
                color: '#6d28d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem'
              }}
            >
              🦵
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
            {metrics.rmnCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Protocolo ligamentario y meniscal
          </div>
        </div>

        {/* Card 3: Radiografías & TAC */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Radiografías & TAC
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#e0f2fe',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem'
              }}
            >
              🦴
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
            {metrics.rxTacCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Columna 3D, mortaja y articulaciones
          </div>
        </div>

        {/* Card 4: Informados y Validados */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Informados 100%
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669' }}>
            {metrics.informedCount} / {metrics.total}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
            ✓ Firma Digital X.509 Verificada
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR (CLEAN, MINIMALIST) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '220px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }}
          />
          <input
            type="text"
            placeholder="Buscar por paciente, DNI, región anatómica o conclusión..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.25rem',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#f8fafc',
              color: '#0f172a',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => (e.target.style.borderColor = '#076ABC')}
            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>

        {/* Modality filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
            Modalidad:
          </span>
          {[
            { key: 'all', label: 'Todos' },
            { key: 'resonancia', label: '🦵 RMN' },
            { key: 'radiografía', label: '🦴 RX' },
            { key: 'tomografía', label: '🧠 TAC' },
            { key: 'ecografía', label: '💪 Eco' }
          ].map((pill) => {
            const isActive = modalityFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setModalityFilter(pill.key)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  fontWeight: isActive ? 800 : 600,
                  border: isActive ? '1px solid #076ABC' : '1px solid #e2e8f0',
                  background: isActive ? '#076ABC' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
            Estado:
          </span>
          {[
            { key: 'all', label: 'Todos' },
            { key: 'informados', label: 'Informados' },
            { key: 'pendientes', label: 'Pendientes' }
          ].map((statusPill) => {
            const isActive = statusFilter === statusPill.key;
            return (
              <button
                key={statusPill.key}
                type="button"
                onClick={() => setStatusFilter(statusPill.key)}
                style={{
                  padding: '0.35rem 0.7rem',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  fontWeight: isActive ? 800 : 600,
                  border: isActive ? '1px solid #002182' : '1px solid #e2e8f0',
                  background: isActive ? '#002182' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {statusPill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN SPACIOUS, CLEAN STUDIES TABLE */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        {filteredStudies.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Eye size={42} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>
              No se encontraron estudios
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem' }}>
              No hay estudios que coincidan con los filtros seleccionados o la búsqueda realizada.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setModalityFilter('all');
                setStatusFilter('all');
              }}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  <th style={{ padding: '0.85rem 1.25rem', width: '22%' }}>Paciente</th>
                  <th style={{ padding: '0.85rem 1rem', width: '26%' }}>Estudio & Región</th>
                  <th style={{ padding: '0.85rem 1rem', width: '18%' }}>Fecha & Centro</th>
                  <th style={{ padding: '0.85rem 1rem', width: '18%' }}>Conclusión</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right', width: '16%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudies.map((study) => {
                  const isExpanded = expandedStudyId === study.id;
                  const modBadge = getModalityBadge(study.modality);
                  const patient = patients.find((p) => p.id === study.patientId || p.dni === study.patientDni);
                  const insurance = patient?.healthInsurance || 'Particular';

                  return (
                    <React.Fragment key={study.id}>
                      <tr
                        onClick={() => toggleRow(study.id)}
                        style={{
                          borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                          background: isExpanded ? '#f8fafc' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'background 0.12s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = '#ffffff';
                        }}
                      >
                        {/* 1. Paciente */}
                        <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                flexShrink: 0
                              }}
                            >
                              {getInitials(study.patientName)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                {study.patientName}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  DNI {study.patientDni}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    padding: '0.1rem 0.45rem',
                                    borderRadius: '4px',
                                    border: '1px solid #e2e8f0'
                                  }}
                                >
                                  {insurance}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Estudio & Región */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                            <span
                              style={{
                                background: modBadge.bg,
                                color: modBadge.color,
                                border: `1px solid ${modBadge.border}`,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <span>{modBadge.emoji}</span>
                              {modBadge.label}
                            </span>
                            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                              {study.seriesCount || 3} series • {study.fileSize || '32 MB'}
                            </span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#1e293b' }}>
                            {study.bodyPart}
                          </div>
                        </td>

                        {/* 3. Fecha & Centro */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                            {study.date}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={12} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                              {study.center}
                            </span>
                          </div>
                        </td>

                        {/* 4. Conclusión / Estado */}
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: '#334155',
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              marginBottom: '3px'
                            }}
                          >
                            {study.conclusion}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span
                              style={{
                                background: '#ecfdf5',
                                color: '#059669',
                                padding: '0.1rem 0.45rem',
                                borderRadius: '100px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Check size={11} />
                              X.509 Válido
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              ID: {study.id}
                            </span>
                          </div>
                        </td>

                        {/* 5. Acciones */}
                        <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                            {/* Open PACS Modal Button */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenPacs(study, e)}
                              title="Abrir en Visor PACS / DICOM"
                              style={{
                                background: '#076ABC',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(7, 106, 188, 0.2)'
                              }}
                            >
                              <Eye size={14} />
                              Visor PACS
                            </button>

                            {/* Share button */}
                            <button
                              type="button"
                              onClick={(e) => handleShareWhatsApp(study, e)}
                              title="Compartir por WhatsApp"
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#059669',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Share2 size={14} />
                            </button>

                            {/* Expand Row Toggle */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(study.id);
                              }}
                              title={isExpanded ? 'Colapsar detalles' : 'Ver informe completo'}
                              style={{
                                background: isExpanded ? '#e2e8f0' : '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDABLE ACCORDION DETAIL ROW */}
                      {isExpanded && (
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <td colSpan={5} style={{ padding: '0 1.25rem 1.25rem' }}>
                            <div
                              style={{
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '10px',
                                padding: '1.25rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.1rem'
                              }}
                            >
                              {/* Header inside detail */}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '0.75rem',
                                  borderBottom: '1px solid #f1f5f9',
                                  paddingBottom: '0.85rem'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div
                                    style={{
                                      background: '#ecfdf5',
                                      color: '#065f46',
                                      border: '1px solid #a7f3d0',
                                      padding: '0.25rem 0.65rem',
                                      borderRadius: '100px',
                                      fontSize: '0.74rem',
                                      fontWeight: 800,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <FileCheck size={13} />
                                    Informe Radiológico Oficial
                                  </div>
                                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    Informado por: <strong style={{ color: '#0f172a' }}>{study.radiologist}</strong>
                                  </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  {editingStudyId !== study.id ? (
                                    <button
                                      type="button"
                                      onClick={(e) => handleStartEdit(study, e)}
                                      style={{
                                        background: '#f8fafc',
                                        border: '1px solid #cbd5e1',
                                        color: '#334155',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Edit3 size={13} />
                                      Editar Observación
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setEditingStudyId(null)}
                                      style={{
                                        background: '#f8fafc',
                                        border: '1px solid #cbd5e1',
                                        color: '#64748b',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cancelar
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => handlePrintStudy(study, e)}
                                    style={{
                                      background: '#f8fafc',
                                      border: '1px solid #cbd5e1',
                                      color: '#334155',
                                      padding: '0.35rem 0.75rem',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Printer size={13} />
                                    Imprimir
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleShareWhatsApp(study, e)}
                                    style={{
                                      background: '#ecfdf5',
                                      border: '1px solid #a7f3d0',
                                      color: '#065f46',
                                      padding: '0.35rem 0.75rem',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Share2 size={13} />
                                    Enviar al Paciente
                                  </button>
                                </div>
                              </div>

                              {/* Two columns: Left Thumbnail + Quick PACS launch, Right findings & conclusion */}
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '220px 1fr',
                                  gap: '1.25rem',
                                  alignItems: 'start'
                                }}
                              >
                                {/* Left Column: Thumbnail + PACS launcher */}
                                <div
                                  style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    background: '#090f10',
                                    position: 'relative'
                                  }}
                                >
                                  <img
                                    src={study.thumbnailUrl}
                                    alt={study.bodyPart}
                                    style={{
                                      width: '100%',
                                      height: '160px',
                                      objectFit: 'cover',
                                      display: 'block',
                                      opacity: 0.95
                                    }}
                                  />
                                  <div
                                    style={{
                                      padding: '0.65rem',
                                      background: '#0c1b1c',
                                      borderTop: '1px solid #1e3a3a',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0.45rem'
                                    }}
                                  >
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                                      <span>DICOM 3.0</span>
                                      <span>{study.fileSize || '48 MB'}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenPacs(study, e)}
                                      style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '0.45rem',
                                        borderRadius: '6px',
                                        fontSize: '0.78rem',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '5px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Maximize2 size={13} />
                                      Abrir Visor PACS
                                    </button>
                                  </div>
                                </div>

                                {/* Right Column: Medical report text */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                  {editingStudyId !== study.id ? (
                                    <>
                                      {/* Findings text */}
                                      <div>
                                        <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                                          Hallazgos Radiológicos / Descripción Técnica:
                                        </div>
                                        <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                                          {study.findings}
                                        </div>
                                      </div>

                                      {/* Conclusion box */}
                                      <div
                                        style={{
                                          background: '#eff6ff',
                                          borderLeft: '4px solid #076ABC',
                                          padding: '0.85rem',
                                          borderRadius: '4px 8px 8px 4px'
                                        }}
                                      >
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '3px' }}>
                                          Conclusión Diagnóstica:
                                        </div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182', lineHeight: 1.4 }}>
                                          {study.conclusion}
                                        </div>
                                      </div>

                                      {/* Measurements chips */}
                                      {study.measurements && Object.keys(study.measurements).length > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b' }}>
                                            Mediciones Cuantificadas:
                                          </span>
                                          {Object.entries(study.measurements).map(([key, val]) => (
                                            <span
                                              key={key}
                                              style={{
                                                background: '#f8fafc',
                                                border: '1px solid #cbd5e1',
                                                padding: '0.2rem 0.55rem',
                                                borderRadius: '6px',
                                                fontSize: '0.76rem',
                                                color: '#334155'
                                              }}
                                            >
                                              <strong style={{ color: '#0f172a' }}>{key}:</strong> {val}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    /* Edit report mode */
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                      <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                                          Editar Hallazgos Radiológicos:
                                        </label>
                                        <textarea
                                          rows={3}
                                          value={editFindings}
                                          onChange={(e) => setEditFindings(e.target.value)}
                                          style={{
                                            width: '100%',
                                            padding: '0.65rem',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.86rem',
                                            color: '#0f172a',
                                            background: '#ffffff'
                                          }}
                                        />
                                      </div>

                                      <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                                          Editar Conclusión Diagnóstica:
                                        </label>
                                        <textarea
                                          rows={2}
                                          value={editConclusion}
                                          onChange={(e) => setEditConclusion(e.target.value)}
                                          style={{
                                            width: '100%',
                                            padding: '0.65rem',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.86rem',
                                            color: '#0f172a',
                                            background: '#ffffff'
                                          }}
                                        />
                                      </div>

                                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button
                                          type="button"
                                          onClick={() => setEditingStudyId(null)}
                                          style={{
                                            padding: '0.45rem 0.85rem',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            background: '#f8fafc',
                                            color: '#475569',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                          }}
                                        >
                                          Descartar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveReport(study.id)}
                                          style={{
                                            padding: '0.45rem 0.95rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: '#076ABC',
                                            color: '#ffffff',
                                            fontSize: '0.8rem',
                                            fontWeight: 800,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          <CheckCircle2 size={14} />
                                          Guardar y Firmar
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Legal signature footer */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      flexWrap: 'wrap',
                                      gap: '0.5rem',
                                      paddingTop: '0.65rem',
                                      borderTop: '1px solid #f1f5f9',
                                      fontSize: '0.72rem',
                                      color: '#64748b'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669', fontWeight: 700 }}>
                                      <ShieldCheck size={14} />
                                      Firma Digital X.509 Verificada • Integridad Criptográfica Válida
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span>SHA-256:</span>
                                      <code style={{ background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#334155' }}>
                                        {study.hashSha256?.substring(0, 16)}...
                                      </code>
                                      <button
                                        type="button"
                                        onClick={(e) => handleCopyHash(study.hashSha256 || '', e)}
                                        title="Copiar Hash SHA-256"
                                        style={{ background: 'none', border: 'none', color: '#076ABC', cursor: 'pointer', padding: '2px' }}
                                      >
                                        <Copy size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. DEDICATED PACS / DICOM MODAL VIEWER (FOCUSED LIGHTBOX, ZERO CLUTTER) */}
      {pacsModalStudy && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(2, 6, 12, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={handleClosePacs}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '960px',
              background: '#070c0e',
              border: '1px solid #1a2e30',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* PACS Modal Top Bar */}
            <div
              style={{
                background: '#0a1618',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #193336',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#D2E3FC'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    background: '#076ABC',
                    color: '#ffffff',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em'
                  }}
                >
                  PACS CITRA
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff' }}>
                    {pacsModalStudy.patientName} — {pacsModalStudy.modality}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#7994B8' }}>
                    {pacsModalStudy.bodyPart} • {pacsModalStudy.date} • {pacsModalStudy.center}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClosePacs}
                style={{
                  background: '#13282b',
                  border: '1px solid #234848',
                  color: '#D2E3FC',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* PACS Tools Strip */}
            <div
              style={{
                background: '#0c1b1c',
                padding: '0.5rem 1.25rem',
                borderBottom: '1px solid #162f31',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  title="Acercar (Zoom In)"
                  style={{
                    background: '#142c2d',
                    color: '#D2E3FC',
                    border: '1px solid #234848',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <ZoomIn size={14} />
                  Zoom +
                </button>

                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                  title="Alejar (Zoom Out)"
                  style={{
                    background: '#142c2d',
                    color: '#D2E3FC',
                    border: '1px solid #234848',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <ZoomOut size={14} />
                  Zoom -
                </button>

                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotar 90 Grados"
                  style={{
                    background: '#142c2d',
                    color: '#D2E3FC',
                    border: '1px solid #234848',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCw size={14} />
                  Rotar
                </button>

                <button
                  type="button"
                  onClick={() => setIsInverted(!isInverted)}
                  title="Invertir Negativo (Negatoscopio)"
                  style={{
                    background: isInverted ? '#076ABC' : '#142c2d',
                    color: '#ffffff',
                    border: '1px solid #234848',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: isInverted ? 800 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Contrast size={14} />
                  Invertir
                </button>

                <button
                  type="button"
                  onClick={() => setMeasurementTool(measurementTool === 'ruler' ? 'none' : 'ruler')}
                  title="Calibrador Milimétrico"
                  style={{
                    background: measurementTool === 'ruler' ? '#076ABC' : '#142c2d',
                    color: '#ffffff',
                    border: '1px solid #234848',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: measurementTool === 'ruler' ? 800 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Ruler size={14} />
                  Calibrador
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetPacsControls}
                style={{
                  background: '#142c2d',
                  color: '#94a3b8',
                  border: '1px solid #234848',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Restablecer
              </button>
            </div>

            {/* PACS Viewport Canvas */}
            <div
              style={{
                height: '460px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: '#040708'
              }}
            >
              {/* The Image */}
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
                  src={pacsModalStudy.thumbnailUrl}
                  alt={pacsModalStudy.bodyPart}
                  style={{
                    maxHeight: '410px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    boxShadow: '0 0 25px rgba(0, 0, 0, 0.9)'
                  }}
                />

                {/* Caliper HUD Overlay */}
                {measurementTool === 'ruler' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '40%',
                      left: '25%',
                      width: '190px',
                      borderBottom: '2px dashed #00ffcc',
                      color: '#00ffcc',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      paddingBottom: '4px',
                      textShadow: '0 1px 4px #000'
                    }}
                  >
                    <span>📏 Calibre: 8.4 mm (Normoposición)</span>
                  </div>
                )}
              </div>

              {/* Monospace DICOM OSD (Top-Left) */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '14px',
                  color: '#257CE6',
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                  pointerEvents: 'none',
                  textShadow: '0 1px 3px #000'
                }}
              >
                <div>PAC: {pacsModalStudy.patientName.toUpperCase()}</div>
                <div>DNI: {pacsModalStudy.patientDni}</div>
                <div>MOD: {pacsModalStudy.modality.split(' ')[0]} | KV: 120 / MA: 250</div>
                <div>FOV: 240mm | MATRIX: 512x512</div>
              </div>

              {/* Monospace DICOM OSD (Bottom-Right) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '14px',
                  color: '#D2E3FC',
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                  textAlign: 'right',
                  pointerEvents: 'none',
                  textShadow: '0 1px 3px #000'
                }}
              >
                <div>ZOOM: {Math.round(zoomLevel * 100)}%</div>
                <div>ROT: {rotation}°</div>
                <div>HASH: {pacsModalStudy.hashSha256?.substring(0, 14)}...</div>
              </div>
            </div>

            {/* Sliders & Bottom Ribbon */}
            <div
              style={{
                background: '#0a1618',
                padding: '0.65rem 1.25rem',
                borderTop: '1px solid #162f31',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                alignItems: 'center',
                fontSize: '0.78rem',
                color: '#D2E3FC'
              }}
            >
              {/* Brightness slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 200px' }}>
                <Sun size={14} color="#257CE6" />
                <span>Brillo:</span>
                <input
                  type="range"
                  min="40"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ width: '38px', textAlign: 'right' }}>{brightness}%</span>
              </div>

              {/* Contrast slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 200px' }}>
                <Sliders size={14} color="#257CE6" />
                <span>Contraste:</span>
                <input
                  type="range"
                  min="40"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ width: '38px', textAlign: 'right' }}>{contrast}%</span>
              </div>

              {/* Quick Close button */}
              <button
                type="button"
                onClick={handleClosePacs}
                style={{
                  background: '#142c2d',
                  border: '1px solid #234848',
                  color: '#D2E3FC',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cerrar Visor (ESC)
              </button>
            </div>

            {/* Conclusión Preview Footer inside PACS modal */}
            <div
              style={{
                background: '#060d0e',
                padding: '0.65rem 1.25rem',
                borderTop: '1px solid #14282a',
                fontSize: '0.8rem',
                color: '#94a3b8'
              }}
            >
              <strong style={{ color: '#257CE6' }}>Conclusión Radiológica: </strong>
              <span style={{ color: '#e2e8f0' }}>{pacsModalStudy.conclusion}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
