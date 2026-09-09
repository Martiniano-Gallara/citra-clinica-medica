import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  Mail,
  Phone,
  CreditCard,
  X,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export const UsersManager = () => {
  const { patients, addPatient, updatePatient, appointments, healthInsurances } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientForView, setSelectedPatientForView] = useState(null);

  // New patient state
  const [newName, setNewName] = useState('');
  const [newDni, setNewDni] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newInsurance, setNewInsurance] = useState('OSDE');
  const [newInsuranceNumber, setNewInsuranceNumber] = useState('');

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.insuranceName && p.insuranceName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreatePatient = (e) => {
    e.preventDefault();
    if (!newName || !newDni) return;

    addPatient({
      name: newName.trim(),
      dni: newDni.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || '+54 9 351 000-0000',
      insuranceName: newInsurance,
      insurancePlan: newInsurance === 'Particular' ? 'Sin cobertura' : 'Plan Estándar',
      insuranceNumber: newInsuranceNumber.trim() || 'N/A',
      registeredAt: new Date().toISOString().split('T')[0],
      active: true
    });

    setIsModalOpen(false);
    setNewName('');
    setNewDni('');
    setNewEmail('');
    setNewPhone('');
    setNewInsuranceNumber('');
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem' }}>
            Padrón de Pacientes y Usuarios
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#496386' }}>
            Administración de cuentas de pacientes, coberturas médicas e historial de turnos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
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
            gap: '0.45rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
          }}
        >
          <Plus size={18} />
          Registrar Nuevo Paciente
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '420px', marginBottom: '1.5rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, DNI, email u obra social..."
          style={{
            width: '100%',
            padding: '0.7rem 0.85rem 0.7rem 2.3rem',
            borderRadius: '10px',
            border: '1.5px solid #D2E3FC',
            fontSize: '0.88rem',
            outline: 'none',
            background: '#ffffff'
          }}
        />
      </div>

      {/* Patients Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #D2E3FC',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0, 33, 130, 0.04)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#F5F8FE', borderBottom: '1.5px solid #D2E3FC', color: '#002182', fontWeight: 800 }}>
                <th style={{ padding: '0.9rem 1.25rem' }}>Paciente</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>DNI</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Contacto</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Obra Social & N°</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Turnos</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#496386' }}>
                    No se encontraron pacientes registrados con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => {
                  const patAppointments = appointments.filter((a) => a.patientId === pat.id || a.patientDni === pat.dni);
                  return (
                    <tr
                      key={pat.id}
                      style={{ borderBottom: '1px solid #EDF3FD', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F8FE')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={pat.avatar || 'https://images.unsplash.com/photo-1534528741775?w=100'}
                            alt={pat.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: '#002182' }}>{pat.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#7994B8' }}>Alta: {pat.registeredAt || '2025'}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#172A4A' }}>
                        {pat.dni}
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ fontSize: '0.82rem', color: '#002182' }}>{pat.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#496386' }}>{pat.phone}</div>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#002182' }}>{pat.insuranceName || 'Particular'}</div>
                        <div style={{ fontSize: '0.74rem', color: '#7994B8' }}>{pat.insuranceNumber || 'Sin número'}</div>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span
                          style={{
                            background: '#EBF3FD',
                            color: '#002182',
                            border: '1px solid #257CE6',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '100px',
                            fontSize: '0.75rem',
                            fontWeight: 800
                          }}
                        >
                          {patAppointments.length} turnos
                        </span>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedPatientForView(pat)}
                          style={{
                            background: '#F5F8FE',
                            border: '1px solid #D2E3FC',
                            color: '#002182',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Ver Ficha
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Patient */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 33, 130, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
                color: '#ffffff',
                padding: '1.5rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                Registrar Nuevo Paciente
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} style={{ padding: '1.75rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Laura Santillán"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    DNI *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDni}
                    onChange={(e) => setNewDni(e.target.value)}
                    placeholder="35.981.220"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+54 9 351..."
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="paciente@correo.com"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Obra Social o Prepaga
                  </label>
                  <select
                    value={newInsurance}
                    onChange={(e) => setNewInsurance(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none', background: '#ffffff' }}
                  >
                    <option value="Particular">Particular</option>
                    {healthInsurances.map((hi) => (
                      <option key={hi.id} value={hi.name}>{hi.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    N° de Afiliado
                  </label>
                  <input
                    type="text"
                    value={newInsuranceNumber}
                    onChange={(e) => setNewInsuranceNumber(e.target.value)}
                    placeholder="310-8849-01"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                Dar de Alta Paciente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatientForView && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 33, 130, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setSelectedPatientForView(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: '#002182', color: '#ffffff', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={selectedPatientForView.avatar} alt={selectedPatientForView.name} style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{selectedPatientForView.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: '#D2E3FC' }}>DNI: {selectedPatientForView.dni}</div>
                </div>
              </div>
              <button onClick={() => setSelectedPatientForView(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ color: '#7994B8' }}>Email: </span>
                  <div style={{ fontWeight: 700, color: '#002182' }}>{selectedPatientForView.email}</div>
                </div>
                <div>
                  <span style={{ color: '#7994B8' }}>Teléfono: </span>
                  <div style={{ fontWeight: 700, color: '#002182' }}>{selectedPatientForView.phone}</div>
                </div>
                <div>
                  <span style={{ color: '#7994B8' }}>Obra Social: </span>
                  <div style={{ fontWeight: 700, color: '#002182' }}>{selectedPatientForView.insuranceName}</div>
                </div>
                <div>
                  <span style={{ color: '#7994B8' }}>N° Credencial: </span>
                  <div style={{ fontWeight: 700, color: '#002182' }}>{selectedPatientForView.insuranceNumber || 'N/A'}</div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#002182', marginBottom: '0.75rem' }}>
                Historial de Turnos de este Paciente
              </h4>

              {appointments.filter((a) => a.patientId === selectedPatientForView.id || a.patientDni === selectedPatientForView.dni).length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: '#7994B8', fontStyle: 'italic' }}>Sin turnos registrados.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {appointments
                    .filter((a) => a.patientId === selectedPatientForView.id || a.patientDni === selectedPatientForView.dni)
                    .map((a) => (
                      <div key={a.id} style={{ background: '#F5F8FE', padding: '0.6rem 0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <div>
                          <strong>{a.date} - {a.time} hs</strong> ({a.doctorSpecialty || a.specialtyName})
                        </div>
                        <span style={{ textTransform: 'capitalize', fontWeight: 700, color: '#076ABC' }}>{a.status}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
