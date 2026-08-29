import React, { useState, useEffect, useRef } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Search, User, Calendar, UserCheck, Receipt, X, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';

export const GlobalSearchModal = () => {
  const {
    globalSearchOpen,
    setGlobalSearchOpen,
    patients,
    doctors,
    appointments,
    invoices,
    setSelectedPatientForDetail,
    setActiveTab,
    setIsAppointmentModalOpen,
    setAppointmentModalData
  } = useClinic();

  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  useEffect(() => {
    if (globalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [globalSearchOpen]);

  if (!globalSearchOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  const matchedPatients = cleanQ
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQ) ||
          p.dni.toLowerCase().includes(cleanQ) ||
          p.insuranceName.toLowerCase().includes(cleanQ) ||
          p.phone.includes(cleanQ)
      )
    : [];

  const matchedDoctors = cleanQ
    ? doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(cleanQ) ||
          d.specialtyName.toLowerCase().includes(cleanQ) ||
          d.license.toLowerCase().includes(cleanQ)
      )
    : [];

  const matchedAppointments = cleanQ
    ? appointments.filter(
        (a) =>
          a.patientName.toLowerCase().includes(cleanQ) ||
          a.doctorName.toLowerCase().includes(cleanQ) ||
          a.reason.toLowerCase().includes(cleanQ)
      )
    : [];

  const matchedInvoices = cleanQ
    ? invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(cleanQ) ||
          i.patientName.toLowerCase().includes(cleanQ) ||
          i.concept.toLowerCase().includes(cleanQ)
      )
    : [];

  const totalResults =
    matchedPatients.length +
    matchedDoctors.length +
    matchedAppointments.length +
    matchedInvoices.length;

  return (
    <div className="modal-overlay" onClick={() => setGlobalSearchOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', maxHeight: '80vh', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff'
          }}
        >
          <Search size={22} color="#2563eb" />
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder="Buscar por paciente, DNI, médico, turno, estudio o comprobante..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              border: 'none',
              fontSize: '1.05rem',
              padding: 0,
              boxShadow: 'none'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={18} />
            </button>
          )}
          <span className="search-shortcut">ESC</span>
        </div>

        {/* Results Body */}
        <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', maxHeight: '60vh' }}>
          {!cleanQ && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.35rem', color: '#0f172a' }}>
                Búsqueda Rápida Global
              </div>
              <p style={{ fontSize: '0.82rem' }}>
                Escribe un nombre, DNI, especialidad médica o número de factura para encontrar resultados instantáneamente.
              </p>
            </div>
          )}

          {cleanQ && totalResults === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
              <p style={{ fontSize: '0.9rem' }}>
                No se encontraron resultados para <strong>"{query}"</strong>
              </p>
            </div>
          )}

          {/* Patients Results */}
          {matchedPatients.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}
              >
                Pacientes ({matchedPatients.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {matchedPatients.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => {
                      setSelectedPatientForDetail(pat);
                      setGlobalSearchOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: '#ffffff',
                      transition: 'var(--transition)'
                    }}
                    className="hover-subtle"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={pat.avatar}
                        alt={pat.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                          {pat.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          DNI {pat.dni} · {pat.insuranceName} ({pat.insurancePlan})
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#94a3b8" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctors Results */}
          {matchedDoctors.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}
              >
                Médicos y Especialistas ({matchedDoctors.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {matchedDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setActiveTab('doctors');
                      setGlobalSearchOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: '#ffffff'
                    }}
                    className="hover-subtle"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {doc.specialtyName} · {doc.license} · {doc.roomName}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#94a3b8" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments Results */}
          {matchedAppointments.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}
              >
                Turnos ({matchedAppointments.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {matchedAppointments.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      setAppointmentModalData(app);
                      setIsAppointmentModalOpen(true);
                      setGlobalSearchOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: '#ffffff'
                    }}
                    className="hover-subtle"
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                        {app.patientName} — {app.date} a las {app.time} hs
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {app.doctorName} ({app.specialtyName}) · Motivo: {app.reason}
                      </div>
                    </div>
                    <Badge status={app.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Results */}
          {matchedInvoices.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}
              >
                Comprobantes y Facturación ({matchedInvoices.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {matchedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setActiveTab('billing');
                      setGlobalSearchOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: '#ffffff'
                    }}
                    className="hover-subtle"
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                        {inv.invoiceNumber} — {inv.patientName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {inv.concept} · {inv.date}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#16a34a' }}>
                      ${inv.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
