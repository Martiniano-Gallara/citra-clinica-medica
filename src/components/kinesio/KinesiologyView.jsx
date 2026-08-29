import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Activity,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  ChevronRight,
  TrendingDown,
  Dumbbell,
  FileCheck,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const KinesiologyView = () => {
  const {
    rehabPlans,
    rehabSessions,
    homeExercises,
    patients,
    setIsRehabPlanModalOpen,
    setIsRehabSessionModalOpen,
    setRehabSessionPreloadPlan,
    setSelectedPatientForDetail
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'En curso', 'Finalizado'
  const [activeTab, setActiveTab] = useState('plans'); // 'plans', 'sessions', 'exercises', 'gym_live'
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState(null);

  const filteredPlans = rehabPlans.filter((plan) => {
    const matchSearch =
      plan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.patientDni.includes(searchTerm);
    const matchStatus = selectedFilter === 'all' || plan.status === selectedFilter;
    return matchSearch && matchStatus;
  });

  const totalSessionsPrescribed = rehabPlans.reduce((acc, p) => acc + (p.prescribedSessions || 0), 0);
  const totalSessionsCompleted = rehabPlans.reduce((acc, p) => acc + (p.completedSessions || 0), 0);
  const activePlansCount = rehabPlans.filter((p) => p.status === 'En curso').length;

  const handleOpenNewSession = (plan) => {
    setRehabSessionPreloadPlan(plan);
    setIsRehabSessionModalOpen(true);
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="badge-wrapper" style={{ marginBottom: '0.4rem' }}>
            <span className="badge badge-teal">
              <Activity size={13} style={{ marginRight: '4px' }} />
              Servicio de Kinesiología, Fisiatría & Gimnasio Terapéutico
            </span>
          </div>
          <h1 className="view-title">Rehabilitación & Fisiokinesioterapia</h1>
          <p className="view-subtitle">
            Planes kinesiológicos personalizados, contador de sesiones, evolución EVA (0-10) y ejercicios domiciliarios.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsRehabPlanModalOpen(true)}
          >
            <Plus size={18} />
            Nuevo Plan Kinesiológico
          </button>
        </div>
      </div>

      {/* KPI Stats Bento Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Pacientes en Tratamiento</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px' }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value">{activePlansCount}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--c-primary)', fontWeight: 700 }}>planes en curso</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>100% con HCE activa</div>
        </div>

        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Sesiones Realizadas</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px', background: '#d1fae5', color: '#065f46' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value" style={{ color: '#065f46' }}>{totalSessionsCompleted}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>de {totalSessionsPrescribed} indicadas</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Trazabilidad de asistencia</div>
        </div>

        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Alivio Clínico (EVA)</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px', background: '#e0f6f5', color: 'var(--c-primary)' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value" style={{ color: 'var(--c-dark)' }}>-68%</div>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>reducción del dolor</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Escala análoga visual</div>
        </div>

        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Boxes & Gimnasio</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px' }}>
              <Dumbbell size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value">4 Boxes</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>activos</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Capacidad de 12 pac/hora</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-bar" style={{ marginBottom: '1.25rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'plans' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('plans')}
          >
            <Activity size={15} />
            Planes Kinesiológicos ({rehabPlans.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'sessions' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('sessions')}
          >
            <FileCheck size={15} />
            Registro de Sesiones ({rehabSessions.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'exercises' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('exercises')}
          >
            <Dumbbell size={15} />
            Biblioteca de Ejercicios ({homeExercises.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'gym_live' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('gym_live')}
          >
            <Zap size={15} color="#1A9E9B" />
            Asistencia en Gimnasio / Box
          </button>
        </div>

        {activeTab === 'plans' && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="search-box-inline">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por paciente, DNI o patología..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '160px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="En curso">En curso</option>
              <option value="Finalizado">Finalizados</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: PLANES KINESIOLÓGICOS */}
      {activeTab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedPlanForDetail ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          {/* List of Plans */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">Planes Terapéuticos Activos</h3>
                <p className="card-subtitle">Seguimiento de sesiones prescritas y avance clínico</p>
              </div>
              <span className="badge badge-teal">{filteredPlans.length} planes</span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Paciente / DNI</th>
                    <th>Diagnóstico Traumatológico</th>
                    <th>Sesiones</th>
                    <th>Dolor EVA</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => {
                    const progress = Math.min(100, Math.round(((plan.completedSessions || 0) / (plan.prescribedSessions || 1)) * 100));
                    const isSelected = selectedPlanForDetail?.id === plan.id;
                    return (
                      <tr
                        key={plan.id}
                        style={{ cursor: 'pointer', background: isSelected ? 'var(--primary-light)' : 'transparent' }}
                        onClick={() => setSelectedPlanForDetail(plan)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div className="avatar-sm" style={{ background: 'var(--c-soft)', color: 'var(--c-dark)' }}>
                              <User size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{plan.patientName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DNI {plan.patientDni} • {plan.insuranceName}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '280px' }}>{plan.diagnosis}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deriva: {plan.referringDoctor}</div>
                        </td>
                        <td style={{ minWidth: '130px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700 }}>{plan.completedSessions} de {plan.prescribedSessions}</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{progress}%</span>
                          </div>
                          <div style={{ width: '100%', height: '7px', background: '#e2f4f4', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: progress >= 100 ? '#10b981' : 'linear-gradient(90deg, #1A9E9B, #6FD0CC)',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                background: plan.currentEvaScore <= 3 ? '#d1fae5' : plan.currentEvaScore <= 6 ? '#fef3c7' : '#fee2e2',
                                color: plan.currentEvaScore <= 3 ? '#065f46' : plan.currentEvaScore <= 6 ? '#92400e' : '#991b1b'
                              }}
                            >
                              EVA {plan.currentEvaScore}/10
                            </span>
                            {plan.initialEvaScore && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                (inicio: {plan.initialEvaScore})
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge variant={plan.status === 'En curso' ? 'confirmado' : 'atendido'}>
                            {plan.status}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenNewSession(plan);
                            }}
                            title="Registrar evolución de sesión"
                          >
                            <Plus size={14} />
                            Sesión
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plan Detail Panel */}
          {selectedPlanForDetail && (
            <div className="card" style={{ border: '2px solid var(--c-accent)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="badge badge-teal" style={{ marginBottom: '0.4rem' }}>
                    Plan ID: {selectedPlanForDetail.id}
                  </div>
                  <h3 className="card-title">{selectedPlanForDetail.patientName}</h3>
                  <p className="card-subtitle">Kinesióloga: {selectedPlanForDetail.therapistName}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setSelectedPlanForDetail(null)}
                >
                  Cerrar
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    OBJETIVO TERAPÉUTICO
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-body)', fontWeight: 600 }}>
                    {selectedPlanForDetail.objective}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="data-box">
                    <span className="data-box-label">Rango de Movilidad (ROM)</span>
                    <span className="data-box-value">
                      {selectedPlanForDetail.currentRom?.flexion ? `Flex: ${selectedPlanForDetail.currentRom.flexion} / Ext: ${selectedPlanForDetail.currentRom.extension}` : 'Evaluado completo'}
                    </span>
                  </div>
                  <div className="data-box">
                    <span className="data-box-label">Código Autorización OS</span>
                    <span className="data-box-value">{selectedPlanForDetail.authorizationCode || 'Directo OSDE'}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Técnicas y Agentes Físicos Aplicados:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {selectedPlanForDetail.techniques?.map((tech, idx) => (
                      <span key={idx} className="badge badge-soft">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedPlanForDetail.notes && (
                  <div style={{ fontSize: '0.85rem', background: '#ffffff', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Observaciones de evolución:</strong> {selectedPlanForDetail.notes}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => handleOpenNewSession(selectedPlanForDetail)}
                  >
                    <Plus size={16} />
                    Asentar Nueva Sesión
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      const matchedPat = patients.find((p) => p.dni === selectedPlanForDetail.patientDni);
                      if (matchedPat) setSelectedPatientForDetail(matchedPat);
                    }}
                  >
                    Ver HCE Completa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HISTORIAL DE SESIONES */}
      {activeTab === 'sessions' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Libro de Sesiones Kinesiológicas Registradas</h3>
              <p className="card-subtitle">Evoluciones con firma digital inmutable y mediciones funcionales</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Paciente</th>
                  <th>Sesión N°</th>
                  <th>Técnicas Realizadas</th>
                  <th>ROM / Fuerza</th>
                  <th>Dolor EVA</th>
                  <th>Firma Digital</th>
                </tr>
              </thead>
              <tbody>
                {rehabSessions.map((ses) => (
                  <tr key={ses.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{ses.date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ses.time} hs</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ses.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Por {ses.therapistName}</div>
                    </td>
                    <td>
                      <span className="badge badge-teal">Sesión #{ses.sessionNumber}</span>
                    </td>
                    <td>
                      <ul style={{ paddingLeft: '1.1rem', margin: 0, fontSize: '0.82rem' }}>
                        {ses.performedTechniques?.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{ses.romMeasured || 'Normal'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fuerza: {ses.strengthScore || '5/5'}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          background: ses.evaScore <= 3 ? '#d1fae5' : '#fef3c7',
                          color: ses.evaScore <= 3 ? '#065f46' : '#92400e'
                        }}
                      >
                        EVA {ses.evaScore}/10
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                        <FileCheck size={14} />
                        X.509 Firmado
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {ses.signatureHash?.substring(0, 12)}...
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BIBLIOTECA DE EJERCICIOS DOMICILIARIOS */}
      {activeTab === 'exercises' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Catálogo de Ejercicios Terapéuticos para el Hogar
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Prescripciones digitales accesibles desde el Portal del Paciente con indicaciones y guías visuales.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {homeExercises.map((ex) => (
              <div key={ex.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={ex.imageUrl}
                    alt={ex.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(12, 78, 76, 0.85)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {ex.category}
                  </div>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                    {ex.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.65rem' }}>
                    Zona: {ex.targetArea}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                    {ex.instructions}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.78rem', background: 'var(--bg-subtle)', padding: '0.6rem', borderRadius: '6px' }}>
                    <span><strong>Series:</strong> {ex.sets}</span> •
                    <span><strong>Reps:</strong> {ex.reps}</span> •
                    <span><strong>Descanso:</strong> {ex.rest}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ASISTENCIA EN GIMNASIO / BOX EN VIVO */}
      {activeTab === 'gym_live' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="card-title">Panel de Asistencia y Boxes en Vivo</h3>
              <p className="card-subtitle">Monitoreo de boxes de fisioterapia y pacientes en sala de rehabilitación</p>
            </div>
            <span className="badge badge-teal">
              <Clock size={14} style={{ marginRight: '4px' }} />
              En tiempo real
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ border: '2px solid var(--c-primary)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--primary-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--c-primary)' }}>BOX 1 — Crioterapia</span>
                <span className="badge badge-teal">Ocupado</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Juan Ignacio Pérez</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>GameReady Rodilla Derecha (15 min)</div>
              <div style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.4rem', borderRadius: '4px' }}>
                Restante: <strong>06:40 min</strong>
              </div>
            </div>

            <div style={{ border: '2px solid var(--c-primary)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--primary-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--c-primary)' }}>BOX 2 — Fisiatría</span>
                <span className="badge badge-teal">Ocupado</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>María Florencia Gómez</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>Punción Seca Trapecio & Magneto</div>
              <div style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.4rem', borderRadius: '4px' }}>
                Restante: <strong>12:15 min</strong>
              </div>
            </div>

            <div style={{ border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>BOX 3 — Magnetoterapia</span>
                <span className="badge" style={{ background: '#e2f4f4', color: 'var(--c-dark)' }}>Disponible</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                Listo para asignación
              </div>
            </div>

            <div style={{ border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>GIMNASIO — Propiocepción</span>
                <span className="badge badge-teal">2 en circuito</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Circuito Activo de Tren Inferior</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Supervisado por Lic. Valentina Rossi</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
