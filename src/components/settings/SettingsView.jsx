import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Settings,
  Building2,
  Users,
  Shield,
  Clock,
  CreditCard,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  KeyRound,
  Check
} from 'lucide-react';

export const SettingsView = () => {
  const {
    clinicInfo,
    setClinicInfo,
    specialties,
    setSpecialties,
    rooms,
    setRooms,
    healthInsurances,
    setHealthInsurances,
    users,
    setUsers,
    resetToDefaults,
    addToast
  } = useClinic();

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'branches', 'users', 'specialties', 'insurances'
  const [generalForm, setGeneralForm] = useState(clinicInfo);

  // New Specialty modal / inline state
  const [newEspName, setNewEspName] = useState('');
  const [newEspDuration, setNewEspDuration] = useState(30);

  // New Room inline state
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('Piso 1');

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setClinicInfo(generalForm);
    addToast('Configuración Guardada', 'Datos institucionales de la clínica actualizados.', 'success');
  };

  const handleAddSpecialty = (e) => {
    e.preventDefault();
    if (!newEspName.trim()) return;
    const newEsp = {
      id: `esp-${Date.now()}`,
      name: newEspName,
      defaultDuration: Number(newEspDuration),
      color: '#3b82f6',
      icon: 'Activity'
    };
    setSpecialties([...specialties, newEsp]);
    setNewEspName('');
    addToast('Especialidad Creada', `Especialidad "${newEspName}" agregada.`, 'success');
  };

  const handleDeleteSpecialty = (id) => {
    setSpecialties(specialties.filter((s) => s.id !== id));
    addToast('Especialidad Eliminada', 'La especialidad fue removida.', 'warning');
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const newR = {
      id: `room-${Date.now()}`,
      name: newRoomName,
      floor: newRoomFloor,
      branchId: 'branch-1',
      specialty: 'General'
    };
    setRooms([...rooms, newR]);
    setNewRoomName('');
    addToast('Consultorio Creado', `Consultorio "${newRoomName}" habilitado.`, 'success');
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Settings size={28} color="#2563eb" />
            <span>Configuración del Sistema SaaS</span>
          </h1>
          <p>Parámetros institucionales, roles de usuario, sedes, especialidades y obras sociales</p>
        </div>

        <div className="page-actions-group">
          <button className="btn btn-danger btn-sm" onClick={resetToDefaults}>
            <RotateCcw size={15} />
            <span>Restaurar Datos de Demostración</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <Building2 size={16} />
          <span>Datos de la Clínica</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`}
          onClick={() => setActiveTab('branches')}
        >
          <Building2 size={16} />
          <span>Sedes & Sucursales</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>Usuarios & Roles</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'specialties' ? 'active' : ''}`}
          onClick={() => setActiveTab('specialties')}
        >
          <Clock size={16} />
          <span>Especialidades & Consultorios</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'insurances' ? 'active' : ''}`}
          onClick={() => setActiveTab('insurances')}
        >
          <Shield size={16} />
          <span>Obras Sociales & Aranceles</span>
        </button>
      </div>

      {/* TAB 1: DATOS INSTITUCIONALES */}
      {activeTab === 'general' && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <form onSubmit={handleSaveGeneral}>
            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Nombre Institucional de la Clínica</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.name}
                  onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CUIT / Identificación Tributaria</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.cuit}
                  onChange={(e) => setGeneralForm({ ...generalForm, cuit: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Eslogan / Subtítulo Institucional</label>
              <input
                type="text"
                className="form-control"
                value={generalForm.tagline}
                onChange={(e) => setGeneralForm({ ...generalForm, tagline: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teléfono de Contacto</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.phone}
                  onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp de Turnos</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.whatsapp}
                  onChange={(e) => setGeneralForm({ ...generalForm, whatsapp: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Oficial</label>
                <input
                  type="email"
                  className="form-control"
                  value={generalForm.email}
                  onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dirección Principal</label>
              <input
                type="text"
                className="form-control"
                value={generalForm.address}
                onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SEDES & SUCURSALES (Multi-Branch) */}
      {activeTab === 'branches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {clinicInfo.branches.map((b) => (
              <div key={b.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{b.name}</h3>
                  <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                    {b.consultorios} Salas
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b' }}>Dirección: {b.address}</div>
                <div style={{ fontSize: '0.84rem', color: '#64748b' }}>Teléfono: {b.phone}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USUARIOS & ROLES */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol / Nivel de Acceso</th>
                  <th>Último Acceso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={u.avatar}
                          alt={u.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.email}</td>
                    <td>
                      <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{u.lastAccess}</td>
                    <td>
                      <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.82rem' }}>● Activo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ESPECIALIDADES & CONSULTORIOS */}
      {activeTab === 'specialties' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Specialties List & Add */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Especialidades Médicas ({specialties.length})</div>
            </div>

            <form onSubmit={handleAddSpecialty} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Nueva especialidad (Ej: Kinesiología)"
                value={newEspName}
                onChange={(e) => setNewEspName(e.target.value)}
              />
              <select
                className="form-control"
                value={newEspDuration}
                onChange={(e) => setNewEspDuration(Number(e.target.value))}
                style={{ width: '110px' }}
              >
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
              </select>
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={16} />
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '350px', overflowY: 'auto' }}>
              {specialties.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{s.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.defaultDuration} min</span>
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      style={{ width: '26px', height: '26px' }}
                      onClick={() => handleDeleteSpecialty(s.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rooms List & Add */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Consultorios Físicos ({rooms.length})</div>
            </div>

            <form onSubmit={handleAddRoom} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre (Ej: Consultorio 301)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <select
                className="form-control"
                value={newRoomFloor}
                onChange={(e) => setNewRoomFloor(e.target.value)}
                style={{ width: '110px' }}
              >
                <option value="Piso 1">Piso 1</option>
                <option value="Piso 2">Piso 2</option>
                <option value="Piso 3">Piso 3</option>
              </select>
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={16} />
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '350px', overflowY: 'auto' }}>
              {rooms.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{r.name}</span>
                  <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    {r.floor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OBRAS SOCIALES & PREPAGAS */}
      {activeTab === 'insurances' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Obra Social / Prepaga</th>
                  <th>Planes Habilitados</th>
                  <th>Copago Estándar ($)</th>
                  <th>Estado Prestación</th>
                </tr>
              </thead>
              <tbody>
                {healthInsurances.map((hi) => (
                  <tr key={hi.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{hi.name}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {hi.plans.map((p, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: '#f1f5f9',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: '#334155',
                              fontWeight: 600
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>
                      ${hi.copay.toLocaleString()}
                    </td>
                    <td>
                      <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={12} />
                        <span>{hi.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
