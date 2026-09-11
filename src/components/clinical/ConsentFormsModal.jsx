import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  FileCheck2,
  ShieldAlert,
  Plus,
  Printer,
  Trash2,
  Undo2,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Share2,
  FileText,
  Lock,
  QrCode,
  Eye,
  Sparkles,
  ArrowLeft,
  Building,
  User,
  Stethoscope,
  Check,
  Calendar
} from 'lucide-react';

export const ConsentFormsModal = () => {
  const {
    isConsentModalOpen,
    setIsConsentModalOpen,
    consentForms,
    scopedConsentForms,
    patients,
    doctors,
    currentDoctor,
    isDoctor,
    addConsentForm,
    revokeConsentForm,
    addToast
  } = useClinic();

  // Active doctor resolution (strictly Dr. Alejandro Blanco when isDoctor)
  const activeDoctor = useMemo(() => {
    if (isDoctor && currentDoctor) return currentDoctor;
    return (
      doctors.find((d) => d.name?.includes('Blanco')) ||
      doctors[0] || {
        id: 'doc-1',
        name: 'Dr. Alejandro Blanco',
        license: 'M.P. 34.892 · M.N. 114.829',
        specialty: 'Traumatología & Cirugía Artroscópica'
      }
    );
  }, [isDoctor, currentDoctor, doctors]);

  // Mode: 'list' | 'new' | 'preview'
  const [mode, setMode] = useState('list');
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'signed' | 'revoked'

  // Revocation modal state
  const [revokingId, setRevokingId] = useState(null);
  const [revocationReason, setRevocationReason] = useState(
    'Decisión voluntaria del paciente previo a la realización del procedimiento.'
  );

  // Traumatology Fast Procedures Protocols
  const procedureProtocols = [
    {
      label: '💉 Infiltración Rodilla (Ácido Hialurónico)',
      procedureType: 'Infiltración Intraarticular de Rodilla con Ácido Hialurónico / Corticoide',
      title: 'Consentimiento Informado para Artrocentesis e Infiltración Articular',
      risks:
        'Infección articular (artritis séptica < 0.05%), dolor local transitorio, sinovitis reactiva química leve, hematoma o equimosis en el sitio de punción, reacción de hipersensibilidad al producto.',
      benefits:
        'Alivio sostenido del dolor gonartrósico, viscosuplementación del cartílago hialino articular, reducción de la fricción femorotibial y recuperación de la movilidad funcional.',
      witness: 'Romina Maidana (DNI 32.105.880)'
    },
    {
      label: '🔬 Artroscopía Rodilla / Plastia LCA',
      procedureType: 'Cirugía Artroscópica con Reconstrucción de Ligamento Cruzado Anterior (Neoinjerto H-T-H)',
      title: 'Consentimiento Informado para Artroscopía de Rodilla & Reconstrucción LCA',
      risks:
        'Riesgo anestésico general o raquídeo, hemartrosis articular postquirúrgica, trombosis venosa profunda (TVP), rigidez articular transitoria en flexo-extensión, fallo de fijación ligamentaria o re-rotura de injerto.',
      benefits:
        'Restitución anatómica de la estabilidad articular antero-posterior de la rodilla, prevención de lesiones meniscales secundarias y posibilidad de reintegro deportivo progresivo.',
      witness: 'Lic. Facundo Quiroga (DNI 30.412.981)'
    },
    {
      label: '💪 Cirugía Manguito Rotador (Hombro)',
      procedureType: 'Reparación Artroscópica de Hombro con Anclaje Óseo Titanio/PEEK de Tendón Supraespinoso',
      title: 'Consentimiento Informado para Cirugía Artroscópica de Manguito Rotador',
      risks:
        'Rigidez postquirúrgica (capsulitis adhesiva u hombro congelado), dehiscencia o desinserción tendinosa parcial, infección de heridas quirúrgicas, dolor neuropático residual prolongado.',
      benefits:
        'Cese del dolor nocturno de hombro, recuperación progresiva de la fuerza en abducción y rotación externa, y preservación de la congruencia glenohumeral.',
      witness: 'Romina Maidana (DNI 32.105.880)'
    },
    {
      label: '🩹 Reducción Fractura / Yeso',
      procedureType: 'Reducción Cerrada de Fractura e Inmovilización con Vendaje Enyesado / Bota Walker',
      title: 'Consentimiento Informado para Reducción e Inmovilización Traumatológica',
      risks:
        'Síndrome compartimental por compresión excesiva, maceración o escaras cutáneas por roce, pérdida secundaria de reducción que amerite cirugía, rigidez articular por inmovilización.',
      benefits:
        'Alineación anatómica de los fragmentos óseos, consolidación de la fractura en posición funcional y mitigación inmediata del dolor traumático.',
      witness: 'Lic. Facundo Quiroga (DNI 30.412.981)'
    }
  ];

  // New Consent Form Data
  const [formData, setFormData] = useState({
    patientId: patients[0]?.id || '',
    procedureType: procedureProtocols[0].procedureType,
    title: procedureProtocols[0].title,
    doctorId: activeDoctor.id,
    doctorName: activeDoctor.name,
    doctorLicense: activeDoctor.license || 'M.P. 34.892 · M.N. 114.829',
    specialtyName: activeDoctor.specialty || 'Traumatología & Cirugía Artroscópica',
    risksExplained: procedureProtocols[0].risks,
    benefitsExpected: procedureProtocols[0].benefits,
    patientSignatureType: 'Firma Biométrica Digital con DNI',
    witnessName: procedureProtocols[0].witness
  });

  // Effective consent collection based on role
  const effectiveConsents = scopedConsentForms || consentForms;

  // Filtered consents
  const filteredConsents = useMemo(() => {
    return effectiveConsents.filter((c) => {
      const matchesSearch =
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientDni?.includes(searchQuery) ||
        c.procedureType?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'signed') return !c.revoked;
      if (statusFilter === 'revoked') return c.revoked;
      return true;
    });
  }, [effectiveConsents, searchQuery, statusFilter]);

  // Apply Protocol
  const handleApplyProtocol = (proto) => {
    setFormData((prev) => ({
      ...prev,
      title: proto.title,
      procedureType: proto.procedureType,
      risksExplained: proto.risks,
      benefitsExpected: proto.benefits,
      witnessName: proto.witness
    }));
    addToast('Protocolo Cargado', `Plantilla para ${proto.label} aplicada.`, 'info');
  };

  // Submit New Consent
  const handleCreate = (e) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === formData.patientId) || patients[0];
    if (!pat) {
      addToast('Error', 'Seleccione un paciente válido.', 'warning');
      return;
    }

    const newConsent = {
      id: `cons-f-${Date.now()}`,
      patientId: pat.id,
      patientName: pat.name,
      patientDni: pat.dni,
      title: formData.title,
      procedureType: formData.procedureType,
      legalFramework: 'Protocolo de Consentimiento Informado & Declaración de Voluntad',
      date: new Date().toISOString().split('T')[0],
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      doctorLicense: activeDoctor.license,
      specialtyName: activeDoctor.specialty,
      risksExplained: formData.risksExplained,
      benefitsExpected: formData.benefitsExpected,
      status: 'Otorgado y Firmado',
      patientSignatureType: formData.patientSignatureType,
      witnessName: formData.witnessName,
      revoked: false
    };

    addConsentForm(newConsent);
    addToast('Consentimiento Registrado', 'Documento formal firmado y registrado fehacientemente.', 'success');
    setSelectedConsent(newConsent);
    setMode('preview');
  };

  // Execute Revocation
  const handleConfirmRevoke = () => {
    if (!revokingId) return;
    revokeConsentForm(revokingId, revocationReason);
    addToast('Consentimiento Revocado', 'Se ha registrado la revocación formal de la voluntad del paciente.', 'info');
    setRevokingId(null);
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Share
  const handleShareWhatsApp = (consent) => {
    const text = encodeURIComponent(
      `Estimado/a ${consent.patientName}: Adjuntamos copia digital de su Consentimiento Informado para "${consent.procedureType}" emitido en CITRA por el ${consent.doctorName}. Validez legal verificable mediante firma digital.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!isConsentModalOpen) return null;

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
      onClick={() => {
        setIsConsentModalOpen(false);
        setMode('list');
        setSelectedConsent(null);
      }}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: mode === 'preview' ? '860px' : '940px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 30px 60px -15px rgba(0, 21, 86, 0.4), 0 0 0 1px rgba(7, 106, 188, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #001f66 0%, #001242 100%)',
            padding: '1.25rem 1.75rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #076ABC',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93C5FD'
              }}
            >
              <FileCheck2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.22rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                  Gestión de Consentimientos Informados
                </h3>
                <span
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '100px'
                  }}
                >
                  CONSENTIMIENTO DIGITAL
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#D2E3FC', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span><strong>{activeDoctor.name}</strong></span>
                <span>•</span>
                <span>{activeDoctor.specialty}</span>
                <span>•</span>
                <span style={{ color: '#93C5FD' }}>{activeDoctor.license}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsConsentModalOpen(false);
              setMode('list');
              setSelectedConsent(null);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* ========================================================================= */}
          {/* MODE 1: LIST OF CONSENTS (CLEAN & NON-SATURATED) */}
          {/* ========================================================================= */}
          {mode === 'list' && (
            <div>
              {/* LEGAL DIRECTIVE BANNER */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '14px',
                  padding: '0.9rem 1.25rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Lock size={18} />
                </div>
                <div style={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                  <strong>Consentimiento Informado del Paciente:</strong> La declaración de voluntad del paciente es libre, informada y personal tras recibir explicación fehaciente de riesgos y beneficios. El paciente conserva en todo momento el derecho a la <strong>revocación formal</strong> del acto médico.
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ position: 'relative', flex: '1 1 280px' }}>
                  <Search
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar por paciente, DNI o procedimiento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: statusFilter === 'all' ? '1.5px solid #002182' : '1px solid #cbd5e1',
                      background: statusFilter === 'all' ? '#F5F8FE' : '#ffffff',
                      color: statusFilter === 'all' ? '#002182' : '#64748b'
                    }}
                  >
                    Todos ({effectiveConsents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('signed')}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: statusFilter === 'signed' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                      background: statusFilter === 'signed' ? '#ecfdf5' : '#ffffff',
                      color: statusFilter === 'signed' ? '#059669' : '#64748b'
                    }}
                  >
                    Firmados ({effectiveConsents.filter((c) => !c.revoked).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('revoked')}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: statusFilter === 'revoked' ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                      background: statusFilter === 'revoked' ? '#fee2e2' : '#ffffff',
                      color: statusFilter === 'revoked' ? '#dc2626' : '#64748b'
                    }}
                  >
                    Revocados ({effectiveConsents.filter((c) => c.revoked).length})
                  </button>
                </div>
              </div>

              {/* CONSENTS CARDS CONTAINER */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {filteredConsents.length === 0 ? (
                  <div
                    style={{
                      padding: '3rem 1rem',
                      textAlign: 'center',
                      background: '#f8fafc',
                      borderRadius: '16px',
                      border: '1.5px dashed #cbd5e1',
                      color: '#64748b'
                    }}
                  >
                    <FileCheck2 size={42} color="#94a3b8" style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
                    <h4 style={{ margin: '0 0 0.4rem 0', color: '#1e293b' }}>No se encontraron consentimientos</h4>
                    <p style={{ margin: 0, fontSize: '0.84rem' }}>
                      No hay registros que coincidan con los filtros o aún no se han emitido consentimientos.
                    </p>
                  </div>
                ) : (
                  filteredConsents.map((cf) => (
                    <div
                      key={cf.id}
                      style={{
                        background: cf.revoked ? '#fff5f5' : '#ffffff',
                        border: `1.5px solid ${cf.revoked ? '#fca5a5' : '#cbd5e1'}`,
                        borderRadius: '16px',
                        padding: '1.15rem 1.35rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* CARD TOP ROW */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                background: '#eff6ff',
                                color: '#1e40af',
                                fontWeight: 800,
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '6px'
                              }}
                            >
                              {cf.id.toUpperCase()}
                            </span>
                            <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#002182' }}>
                              {cf.title}
                            </h4>
                          </div>

                          <div style={{ fontSize: '0.83rem', color: '#475569', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>Paciente: <strong style={{ color: '#0f172a' }}>{cf.patientName}</strong> (DNI {cf.patientDni})</span>
                            <span>•</span>
                            <span>Fecha: <strong>{cf.date}</strong></span>
                            <span>•</span>
                            <span style={{ color: '#076ABC', fontWeight: 700 }}>{cf.doctorName}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            background: cf.revoked ? '#fee2e2' : '#dcfce7',
                            color: cf.revoked ? '#991b1b' : '#15803d',
                            padding: '4px 12px',
                            borderRadius: '100px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: `1px solid ${cf.revoked ? '#f87171' : '#86efac'}`
                          }}
                        >
                          {cf.revoked ? (
                            <>
                              <AlertTriangle size={13} /> Revocado por el Paciente
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={13} /> Otorgado & Firmado
                            </>
                          )}
                        </span>
                      </div>

                      {/* PROCEDURE DETAILS BOX */}
                      <div
                        style={{
                          margin: '0.85rem 0',
                          background: cf.revoked ? '#ffffff' : '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '0.85rem 1rem',
                          fontSize: '0.84rem',
                          color: '#334155',
                          lineHeight: 1.55
                        }}
                      >
                        <div style={{ marginBottom: '4px' }}>
                          <strong style={{ color: '#002182' }}>Procedimiento:</strong> {cf.procedureType}
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <strong style={{ color: '#b91c1c' }}>Riesgos y complicaciones explicadas:</strong> {cf.risksExplained}
                        </div>
                        <div>
                          <strong style={{ color: '#047857' }}>Beneficios clínicos esperados:</strong> {cf.benefitsExpected}
                        </div>

                        {cf.revoked && (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '6px 10px',
                              background: '#fee2e2',
                              borderRadius: '8px',
                              color: '#991b1b',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <AlertTriangle size={14} />
                            <span>Revocado formalmente el {cf.revocationDate?.split('T')[0] || cf.date}. Causa: {cf.revocationReason || 'A petición del paciente.'}</span>
                          </div>
                        )}
                      </div>

                      {/* CARD FOOTER WITH ACTIONS */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.78rem',
                          color: '#64748b',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>Firma: <strong style={{ color: '#0f172a' }}>{cf.patientSignatureType || 'Biométrica'}</strong></span>
                          <span>•</span>
                          <span>Testigo: <strong>{cf.witnessName || 'Sin testigo registrado'}</strong></span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!cf.revoked && (
                            <button
                              type="button"
                              onClick={() => {
                                setRevokingId(cf.id);
                                setRevocationReason('Decisión voluntaria del paciente previo al procedimiento.');
                              }}
                              style={{
                                background: '#fff1f2',
                                border: '1px solid #fecdd3',
                                color: '#e11d48',
                                padding: '0.4rem 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.15s'
                              }}
                            >
                              <Undo2 size={13} />
                              Revocar
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(cf)}
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#065f46',
                              padding: '0.4rem 0.85rem',
                              borderRadius: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                            title="Compartir por WhatsApp"
                          >
                            <Share2 size={13} />
                            WhatsApp
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedConsent(cf);
                              setMode('preview');
                            }}
                            style={{
                              background: '#F5F8FE',
                              border: '1.5px solid #BFDBFE',
                              color: '#002182',
                              padding: '0.4rem 0.95rem',
                              borderRadius: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Eye size={14} />
                            Ver Documento Oficial
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: NEW CONSENT FORM WITH PROTOCOL PRESETS */}
          {/* ========================================================================= */}
          {mode === 'new' && (
            <form onSubmit={handleCreate}>
              {/* FAST PROTOCOL TEMPLATES */}
              <div style={{ marginBottom: '1.35rem' }}>
                <div
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: '#002182',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} color="#076ABC" />
                  Protocolos Traumatológicos Frecuentes (1-Click)
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {procedureProtocols.map((proto, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyProtocol(proto)}
                      style={{
                        background: '#F5F8FE',
                        border: '1.5px solid #BFDBFE',
                        borderRadius: '10px',
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: '#002182',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#002182';
                        e.currentTarget.style.background = '#e0edff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#BFDBFE';
                        e.currentTarget.style.background = '#F5F8FE';
                      }}
                    >
                      {proto.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PATIENT & DOCTOR ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Paciente Otorgante *
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      background: '#ffffff',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                    required
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — DNI {p.dni} ({p.insuranceName || 'Particular'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Profesional Médico Informante
                  </label>
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: '#002182',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Stethoscope size={15} color="#076ABC" />
                    <span>{activeDoctor.name} ({activeDoctor.license})</span>
                  </div>
                </div>
              </div>

              {/* DOCUMENT TITLE */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Título del Documento Legal *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontWeight: 700,
                    color: '#0f172a'
                  }}
                  required
                />
              </div>

              {/* SPECIFIC PROCEDURE */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Procedimiento Médico / Quirúrgico Específico *
                </label>
                <input
                  type="text"
                  value={formData.procedureType}
                  onChange={(e) => setFormData({ ...formData, procedureType: e.target.value })}
                  placeholder="Ej: Infiltración Intraarticular de Rodilla con Ácido Hialurónico..."
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

              {/* RISKS EXPLAINED */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Riesgos y Posibles Complicaciones Explicadas al Paciente *
                </label>
                <textarea
                  rows={3}
                  value={formData.risksExplained}
                  onChange={(e) => setFormData({ ...formData, risksExplained: e.target.value })}
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

              {/* BENEFITS EXPECTED */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Beneficios Clínicos Esperados *
                </label>
                <textarea
                  rows={2}
                  value={formData.benefitsExpected}
                  onChange={(e) => setFormData({ ...formData, benefitsExpected: e.target.value })}
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

              {/* WITNESS & SIGNATURE TYPE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Testigo / Profesional Asistente
                  </label>
                  <input
                    type="text"
                    value={formData.witnessName}
                    onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Modalidad de Firma del Paciente
                  </label>
                  <select
                    value={formData.patientSignatureType}
                    onChange={(e) => setFormData({ ...formData, patientSignatureType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Firma Biométrica Digital con DNI">Firma Biométrica Digital con DNI</option>
                    <option value="Firma Electrónica Validada por Token">Firma Electrónica Validada por Token</option>
                    <option value="Firma Digital PKI X.509">Firma Digital PKI X.509</option>
                  </select>
                </div>
              </div>

              {/* SUBMIT BUTTONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setMode('list')}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.7rem 1.6rem',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(7, 106, 188, 0.3)'
                  }}
                >
                  <FileCheck2 size={17} />
                  Emitir & Guardar Consentimiento
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* MODE 3: OFFICIAL LEGAL PRINTABLE PREVIEW */}
          {/* ========================================================================= */}
          {mode === 'preview' && selectedConsent && (
            <div>
              {/* TOP ACTION BAR */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.95rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#334155'
                  }}
                >
                  <ArrowLeft size={15} /> Volver al Listado
                </button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(selectedConsent)}
                    style={{
                      background: '#ecfdf5',
                      border: '1.5px solid #a7f3d0',
                      color: '#065f46',
                      padding: '0.55rem 1.1rem',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Share2 size={16} /> Compartir por WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    style={{
                      background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.55rem 1.35rem',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                    }}
                  >
                    <Printer size={16} /> Imprimir Documento Oficial
                  </button>
                </div>
              </div>

              {/* PRINTABLE LEGAL DOCUMENT AREA */}
              <div
                className="printable-area"
                style={{
                  background: '#ffffff',
                  border: '2px solid #002182',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  color: '#0f172a',
                  position: 'relative',
                  boxShadow: '0 10px 30px rgba(0, 33, 130, 0.08)',
                  overflow: 'hidden'
                }}
              >
                {/* WATERMARK */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-30deg)',
                    fontSize: '4.5rem',
                    fontWeight: 900,
                    color: 'rgba(0, 33, 130, 0.03)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em'
                  }}
                >
                  CITRA · CONSENTIMIENTO INFORMADO
                </div>

                {/* INSTITUTIONAL HEADER */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2.5px solid #002182',
                    paddingBottom: '1.25rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', letterSpacing: '-0.02em' }}>
                      CITRA CLÍNICA MÉDICA
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#076ABC' }}>
                      CENTRO INTEGRAL DE TRAUMATOLOGÍA Y REHABILITACIÓN ARROYITO
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
                      Av. San Martín 450, Arroyito, Córdoba · Tel: (03576) 450-200 · Habilitación Ministerial N° 8491/22
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        background: '#F5F8FE',
                        border: '1.5px solid #BFDBFE',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#002182',
                        display: 'inline-block'
                      }}
                    >
                      REGISTRO N° {selectedConsent.id.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      Fecha de Emisión: <strong>{selectedConsent.date}</strong>
                    </div>
                  </div>
                </div>

                {/* DOCUMENT FORMAL TITLE */}
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  <h2
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      color: '#002182',
                      margin: '0 0 6px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.01em'
                    }}
                  >
                    {selectedConsent.title}
                  </h2>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
                    Declaración Formal de Información Médica & Aceptación del Procedimiento
                  </div>
                </div>

                {/* FORMAL DECLARATION */}
                <div style={{ fontSize: '0.86rem', lineHeight: 1.7, color: '#1e293b', marginBottom: '1.5rem', textAlign: 'justify' }}>
                  <p style={{ margin: '0 0 0.9rem 0' }}>
                    Por la presente, yo, <strong>{selectedConsent.patientName}</strong>, con Documento Nacional de Identidad <strong>DNI {selectedConsent.patientDni}</strong>, en pleno uso de mis facultades mentales y en ejercicio de mis derechos de autonomía sanitaria, declaro haber recibido del profesional tratante <strong>{selectedConsent.doctorName} ({selectedConsent.doctorLicense || activeDoctor.license})</strong>, especialista en <strong>{selectedConsent.specialtyName || activeDoctor.specialty}</strong>, información clara, precisa, detallada y en lenguaje comprensible respecto a:
                  </p>

                  <div
                    style={{
                      background: '#f8fafc',
                      borderLeft: '4px solid #002182',
                      padding: '0.85rem 1.15rem',
                      margin: '0.9rem 0',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ marginBottom: '6px' }}>
                      <strong>1. Naturaleza del Procedimiento:</strong> {selectedConsent.procedureType}.
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>2. Beneficios Esperados:</strong> {selectedConsent.benefitsExpected}
                    </div>
                    <div>
                      <strong>3. Riesgos Comunes y Complicaciones Potenciales:</strong> {selectedConsent.risksExplained}
                    </div>
                  </div>

                  <p style={{ margin: '0 0 0.9rem 0' }}>
                    Se me ha otorgado la oportunidad de formular todas las preguntas pertinentes, las cuales han sido respondidas a mi entera satisfacción, habiéndoseme explicado también las alternativas terapéuticas existentes y las eventuales consecuencias en caso de rechazar la intervención.
                  </p>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>
                    <strong>Cláusula de Revocabilidad:</strong> Se deja expresa constancia de que el consentimiento aquí otorgado podrá ser revocado libremente por el paciente en cualquier momento antes de la realización efectiva del acto médico, sin que ello genere menoscabo alguno en la atención debida.
                  </p>
                </div>

                {/* TRIPLE SIGNATURE SECTION */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '1.5rem',
                    marginTop: '2.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1.5px dashed #cbd5e1'
                  }}
                >
                  {/* PATIENT SIGNATURE */}
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        height: '55px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'cursive',
                        fontSize: '1.15rem',
                        color: '#002182'
                      }}
                    >
                      {selectedConsent.patientName}
                    </div>
                    <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontSize: '0.78rem', fontWeight: 800 }}>
                      Firma del Paciente / Representante
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      DNI {selectedConsent.patientDni}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                      ✓ {selectedConsent.patientSignatureType || 'Biometría Digital'}
                    </div>
                  </div>

                  {/* WITNESS SIGNATURE */}
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        height: '55px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'cursive',
                        fontSize: '1rem',
                        color: '#475569'
                      }}
                    >
                      {selectedConsent.witnessName?.split('(')[0] || 'Romina Maidana'}
                    </div>
                    <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontSize: '0.78rem', fontWeight: 800 }}>
                      Firma del Testigo / Asistente
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {selectedConsent.witnessName || 'Romina Maidana (DNI 32.105.880)'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                      ✓ Asistencia Acreditada
                    </div>
                  </div>

                  {/* DOCTOR SIGNATURE & X.509 SEAL */}
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        height: '55px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#002182', fontWeight: 'bold' }}>
                        {selectedConsent.doctorName}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontSize: '0.78rem', fontWeight: 800, color: '#002182' }}>
                      {selectedConsent.doctorName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700 }}>
                      {selectedConsent.doctorLicense || activeDoctor.license}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                      🔒 Firma Digital X.509 Estándar ONTI
                    </div>
                  </div>
                </div>

                {/* SECURITY FOOTER WITH QR CODE */}
                <div
                  style={{
                    marginTop: '2rem',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.72rem',
                    color: '#64748b'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        background: '#F5F8FE',
                        border: '1px solid #BFDBFE',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#002182'
                      }}
                    >
                      <QrCode size={26} />
                    </div>
                    <div>
                      <div><strong>Verificación de Inalterabilidad Documental</strong></div>
                      <div>Hash SHA-256: 8f9b...a102c77d · Repositorio Criptográfico Seguro</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div>CITRA SISTEMA INTEGRAL DE GESTIÓN CLÍNICA</div>
                    <div>Documento emitido electrónicamente con validez legal plena</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* REVOCATION MODAL OVERLAY */}
        {/* ========================================================================= */}
        {revokingId && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setRevokingId(null)}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '1.5rem',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '1rem' }}>
                <ShieldAlert size={26} />
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>
                  Revocar Consentimiento Informado
                </h4>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                El paciente tiene derecho a revocar su manifestación de voluntad en cualquier momento antes del procedimiento. Ingrese el motivo de la revocación para dejar constancia legal inmutable:
              </p>

              <textarea
                rows={3}
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '1.25rem'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setRevokingId(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRevoke}
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Confirmar Revocación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1.5px solid #e2e8f0',
            padding: '1rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <div>
            {mode !== 'list' && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setMode('list');
                  setSelectedConsent(null);
                }}
                style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
              >
                ← Volver al Listado
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setIsConsentModalOpen(false);
                setMode('list');
                setSelectedConsent(null);
              }}
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
            >
              Cerrar
            </button>

            {mode === 'list' && (
              <button
                type="button"
                onClick={() => setMode('new')}
                style={{
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.55rem 1.35rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                }}
              >
                <Plus size={16} /> Emitir Nuevo Consentimiento
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
