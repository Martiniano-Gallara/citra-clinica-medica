import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  MessageSquare,
  Send,
  CheckCheck,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  User,
  Sparkles,
  Smartphone,
  Calendar,
  FileText,
  Zap,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const CommunicationsView = () => {
  const {
    communications,
    appointments,
    sendWhatsAppReminder,
    updateCommunicationStatus,
    addToast
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointments[0]?.id || '');
  const [selectedTemplate, setSelectedTemplate] = useState('recordatorio_turno_citra');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedLogForChat, setSelectedLogForChat] = useState(communications[0] || null);

  const filteredLogs = communications.filter((log) =>
    log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.phone.includes(searchTerm) ||
    log.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingAppointments = appointments.filter(
    (a) => a.date === '2026-08-28' && a.status === 'pendiente'
  );

  const handleSendReminder = (e) => {
    e.preventDefault();
    if (!selectedAppointmentId) return;

    sendWhatsAppReminder(selectedAppointmentId, selectedTemplate, customMessage);
    setCustomMessage('');
  };

  const handleSimulatePatientResponse = (logId, responseType) => {
    if (responseType === 'confirm') {
      updateCommunicationStatus(logId, 'Confirmado por Paciente', '1 - Confirmado, muchas gracias');
      addToast('Respuesta de Paciente Recibida', 'Turno confirmado automáticamente vía WhatsApp Bot.', 'success');
    } else if (responseType === 'cancel') {
      updateCommunicationStatus(logId, 'Cancelado por Paciente', '2 - Necesito cancelar el turno');
      addToast('Cancelación Recibida', 'El paciente notificó que no podrá asistir.', 'warning');
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="badge-wrapper" style={{ marginBottom: '0.4rem' }}>
            <span className="badge badge-teal">
              <MessageSquare size={13} style={{ marginRight: '4px' }} />
              WhatsApp Cloud API, Email & Centro de Mensajería Omnicanal
            </span>
          </div>
          <h1 className="view-title">Comunicaciones & WhatsApp Center</h1>
          <p className="view-subtitle">
            Recordatorios automáticos de turnos, confirmaciones interactivas por WhatsApp Bot y entrega de recetas.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="dashboard-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-teal">
            <Smartphone size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Mensajes Enviados Hoy</span>
            <span className="kpi-value">{communications.length}</span>
            <span className="kpi-meta text-success">100% tasa de entrega</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-mint">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Confirmados por WhatsApp</span>
            <span className="kpi-value">
              {communications.filter((c) => c.status.includes('Confirmado')).length}
            </span>
            <span className="kpi-meta text-success">Reducción del ausentismo</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-warning">
            <Clock size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Turnos sin Confirmar</span>
            <span className="kpi-value">{pendingAppointments.length}</span>
            <span className="kpi-meta text-warning">Listos para disparo masivo</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-teal">
            <Zap size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Plantillas WhatsApp API</span>
            <span className="kpi-value">4 Plantillas</span>
            <span className="kpi-meta text-muted">Aprobadas por Meta</span>
          </div>
        </div>
      </div>

      {/* Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Left: Dispatcher Form & Log Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Dispatcher Box */}
          <div className="card" style={{ border: '2px solid var(--c-accent)' }}>
            <div className="card-header">
              <h3 className="card-title">Disparador de Mensaje / Recordatorio Manual</h3>
              <p className="card-subtitle">Envío con plantilla oficial de WhatsApp Business API</p>
            </div>

            <form onSubmit={handleSendReminder}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Seleccionar Turno / Paciente</label>
                  <select
                    className="form-select"
                    value={selectedAppointmentId}
                    onChange={(e) => setSelectedAppointmentId(e.target.value)}
                    required
                  >
                    {appointments.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.patientName} — {app.date} {app.time} hs ({app.doctorName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Plantilla WhatsApp Aprobada</label>
                  <select
                    className="form-select"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    required
                  >
                    <option value="recordatorio_turno_citra">recordatorio_turno_citra</option>
                    <option value="recordatorio_turno_kinesio">recordatorio_turno_kinesio</option>
                    <option value="receta_digital_lista">receta_digital_lista (ReNaPDiS)</option>
                    <option value="estudio_informado_disponible">estudio_informado_disponible</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Mensaje Personalizado Opcional (o usa plantilla oficial)</label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Dejar vacío para enviar plantilla automática de recordatorio..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  <Send size={16} />
                  Enviar WhatsApp Inmediato
                </button>
              </div>
            </form>
          </div>

          {/* Communications Log Table */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">Historial de Notificaciones y WhatsApp</h3>
                <p className="card-subtitle">Trazabilidad de entrega y respuestas de pacientes</p>
              </div>
              <div className="search-box-inline">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar mensaje..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha / Paciente</th>
                    <th>Teléfono</th>
                    <th>Plantilla</th>
                    <th>Estado Entrega</th>
                    <th style={{ textAlign: 'right' }}>Simular Respuesta</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const isSelected = selectedLogForChat?.id === log.id;
                    return (
                      <tr
                        key={log.id}
                        style={{ cursor: 'pointer', background: isSelected ? 'var(--primary-light)' : 'transparent' }}
                        onClick={() => setSelectedLogForChat(log)}
                      >
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{log.patientName}</div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{log.sentAt}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{log.phone}</span>
                        </td>
                        <td>
                          <span className="badge badge-soft" style={{ fontSize: '0.75rem' }}>{log.template}</span>
                        </td>
                        <td>
                          <Badge variant={log.status.includes('Confirmado') ? 'atendido' : 'confirmado'}>
                            {log.status}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              style={{ padding: '2px 8px', fontSize: '0.75rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSimulatePatientResponse(log.id, 'confirm');
                              }}
                              title="Simular que el paciente responde '1 - Confirmo'"
                            >
                              <Check size={12} />
                              <span>Confirma</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              style={{ padding: '2px 8px', fontSize: '0.75rem', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSimulatePatientResponse(log.id, 'cancel');
                              }}
                              title="Simular que el paciente responde '2 - Cancelo'"
                            >
                              <X size={12} />
                              <span>Cancela</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Interactive Smartphone WhatsApp Preview Screen */}
        <div>
          <div
            className="card"
            style={{
              padding: '1.25rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <Smartphone size={20} color="var(--c-primary)" />
              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Previsualización WhatsApp del Paciente
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Experiencia del usuario en terminal móvil
                </span>
              </div>
            </div>

            {selectedLogForChat ? (
              <div
                style={{
                  background: '#e5ddd5',
                  backgroundImage: 'radial-gradient(#cfc5b8 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  minHeight: '440px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '8px solid #1f2937',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                }}
              >
                {/* Chat Top Header */}
                <div
                  style={{
                    background: '#075e54',
                    color: '#ffffff',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div className="avatar-sm" style={{ background: '#ffffff', color: '#075e54', fontWeight: 800 }}>
                    C
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>CITRA Traumatología</span>
                      <CheckCircle2 size={13} color="#25D366" />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#cdeeee' }}>Cuenta de empresa oficial verificada</div>
                  </div>
                </div>

                {/* Messages Stream */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                  {/* Sent Balloon from CITRA */}
                  <div
                    style={{
                      background: '#dcf8c6',
                      padding: '0.85rem',
                      borderRadius: '10px 10px 2px 10px',
                      maxWidth: '88%',
                      alignSelf: 'flex-end',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      color: '#111827'
                    }}
                  >
                    <div>{selectedLogForChat.message}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.7rem', color: '#6b7280' }}>
                      <span>{selectedLogForChat.sentAt?.split(' ')[1] || '18:00'}</span>
                      <CheckCheck size={14} color="#3b82f6" />
                    </div>
                  </div>

                  {/* Patient Reply Balloon (if received) */}
                  {selectedLogForChat.responseReceived && (
                    <div
                      style={{
                        background: '#ffffff',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px 10px 10px 2px',
                        maxWidth: '85%',
                        alignSelf: 'flex-start',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        color: '#111827'
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{selectedLogForChat.responseReceived}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'right', marginTop: '4px' }}>
                        Recibido • Bot procesado
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Simulated Buttons */}
                <div style={{ background: '#f0f2f5', padding: '0.65rem', borderRadius: '10px', marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textAlign: 'center' }}>
                    Acciones Rápidas del Bot:
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      style={{ flex: 1, fontSize: '0.75rem', padding: '6px 4px' }}
                      onClick={() => handleSimulatePatientResponse(selectedLogForChat.id, 'confirm')}
                    >
                      1 - Confirmar Turno
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      style={{ flex: 1, fontSize: '0.75rem', padding: '6px 4px', background: '#fff' }}
                      onClick={() => handleSimulatePatientResponse(selectedLogForChat.id, 'cancel')}
                    >
                      2 - Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Selecciona una notificación para previsualizar la conversación de WhatsApp.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
