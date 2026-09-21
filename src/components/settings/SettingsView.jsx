import React, { useState, useEffect } from 'react';
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
  Check,
  Stethoscope,
  Award,
  FileCheck,
  Lock,
  Mail,
  Phone,
  DollarSign,
  Percent,
  UserCheck,
  MapPin,
  Copy
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

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
    addToast,
    isDoctor,
    currentDoctor,
    updateDoctorProfile,
    authAdmin
  } = useClinic();

  // Admin tabs
  const [activeTab, setActiveTab] = useState(isDoctor ? 'doctor-profile' : 'general');
  const [generalForm, setGeneralForm] = useState(clinicInfo);

  // Doctor personal profile form
  const [doctorForm, setDoctorForm] = useState({
    name: (() => {
      const raw = currentDoctor?.name || authAdmin?.name || 'Dr. Alejandro Blanco';
      return raw.includes('Morales') ? 'Dr. Alejandro Blanco' : raw;
    })(),
    specialty: currentDoctor?.specialty || 'Traumatología & Cirugía Artroscópica',
    license: currentDoctor?.license || 'MP 34.892 · MN 114.829',
    sisaRefeps: currentDoctor?.sisaRefeps || 'REFEPS-MN-114829',
    phone: currentDoctor?.phone || '+54 3576 45-2201',
    email: (() => {
      const raw = currentDoctor?.email || authAdmin?.email || 'dr.blanco@citra.com.ar';
      return raw.includes('morales') ? 'dr.blanco@citra.com.ar' : raw;
    })(),
    consultationPrice: currentDoctor?.consultationPrice || currentDoctor?.priceConsultation || 25000,
    feePercentage: currentDoctor?.feePercentage || 75,
    bio: currentDoctor?.bio || 'Especialista en lesiones osteoarticulares, artroscopía de rodilla, reemplazo protésico y traumatología deportiva de alto rendimiento.',
    cuirCode: 'CUIR-AR-TRAUMA-9941',
    pkiCertificateValidUntil: '15/12/2027',
    pkiSerial: 'PKI-ONTI-2024-X509-881290B'
  });

  // Security password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync when currentDoctor updates
  useEffect(() => {
    if (currentDoctor) {
      const cleanName = currentDoctor.name && currentDoctor.name.includes('Morales')
        ? 'Dr. Alejandro Blanco'
        : currentDoctor.name;
      const cleanEmail = currentDoctor.email && currentDoctor.email.includes('morales')
        ? 'dr.blanco@citra.com.ar'
        : currentDoctor.email;
      setDoctorForm((prev) => ({
        ...prev,
        name: cleanName || prev.name,
        specialty: currentDoctor.specialty || prev.specialty,
        license: currentDoctor.license || prev.license,
        sisaRefeps: currentDoctor.sisaRefeps || prev.sisaRefeps,
        phone: currentDoctor.phone || prev.phone,
        email: cleanEmail || prev.email,
        consultationPrice: currentDoctor.consultationPrice || prev.consultationPrice,
        feePercentage: currentDoctor.feePercentage || prev.feePercentage,
        bio: currentDoctor.bio || prev.bio
      }));
    }
  }, [currentDoctor]);

  // New Specialty modal / inline state (Admin)
  const [newEspName, setNewEspName] = useState('');
  const [newEspDuration, setNewEspDuration] = useState(30);

  // New Room inline state (Admin)
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('Piso 1');

  // Save Doctor Profile
  const handleSaveDoctorProfile = (e) => {
    e.preventDefault();
    if (currentDoctor) {
      updateDoctorProfile(currentDoctor.id, {
        name: doctorForm.name,
        specialty: doctorForm.specialty,
        license: doctorForm.license,
        sisaRefeps: doctorForm.sisaRefeps,
        phone: doctorForm.phone,
        email: doctorForm.email,
        consultationPrice: Number(doctorForm.consultationPrice),
        feePercentage: Number(doctorForm.feePercentage),
        bio: doctorForm.bio
      });
    } else {
      addToast('Configuración Guardada', 'Datos profesionales actualizados correctamente.', 'success');
    }
  };

  const handleUpdateDoctorPassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Error', 'La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Error', 'Las contraseñas no coinciden.', 'warning');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast('Contraseña Actualizada', 'Tu clave de acceso ha sido cambiada con éxito.', 'success');
  };

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

  // Doctor display name without duplicate prefix
  const doctorDisplayName = (() => {
    const raw = doctorForm.name || currentDoctor?.name || 'Dr. Alejandro Blanco';
    const clean = raw.includes('Morales') ? 'Dr. Alejandro Blanco' : raw;
    return clean.startsWith('Dr.') ? clean : `Dr. ${clean}`;
  })();

  // ==============================================================
  // DOCTOR VIEW: CONFIGURACIÓN EXCLUSIVA DE SUS DATOS
  // ==============================================================
  if (isDoctor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
        {/* 1. TOP HEADER: LIMPIO Y PROFESIONAL (SIN ETIQUETA REDUNDANTE) */}
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
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                color: '#0f172a',
                margin: '0 0 0.25rem',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Settings size={28} color="#002182" />
              <span>Mi Perfil Profesional & Credenciales</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Gestión de datos de matrícula, firma digital criptográfica, aranceles de consultorio y seguridad de cuenta.
            </p>
          </div>
        </div>

        {/* 3. DOCTOR SETTINGS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Main Professional Data Form */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.35rem',
              boxShadow: '0 2px 8px rgba(0, 33, 130, 0.02)',
              gridColumn: 'span 2'
            }}
          >
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem', marginBottom: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={18} color="#002182" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Datos Médicos & Matrículas Habilitantes
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0' }}>
                Información oficial que se imprime en recetas electrónicas, indicaciones y constancias de atención.
              </p>
            </div>

            <form onSubmit={handleSaveDoctorProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {/* Nombre Completo */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    Nombre Completo del Profesional
                  </label>
                  <input
                    type="text"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* Especialidad */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    Especialidad Principal
                  </label>
                  <input
                    type="text"
                    value={doctorForm.specialty}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* Matrículas */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    Matrículas (MP / MN)
                  </label>
                  <input
                    type="text"
                    value={doctorForm.license}
                    onChange={(e) => setDoctorForm({ ...doctorForm, license: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* SISA / REFEPS */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    Registro Nacional SISA / REFEPS
                  </label>
                  <input
                    type="text"
                    value={doctorForm.sisaRefeps}
                    onChange={(e) => setDoctorForm({ ...doctorForm, sisaRefeps: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    Email Profesional Oficial
                  </label>
                  <input
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* WhatsApp / Teléfono */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    <WhatsAppIcon size={14} />
                    WhatsApp / Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#0f172a'
                    }}
                  />
                </div>

                {/* Arancel Consulta Base */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    Arancel Consulta Base Privada ($)
                  </label>
                  <input
                    type="number"
                    value={doctorForm.consultationPrice}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultationPrice: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Bio / Perfil Clínico */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  Resumen Profesional / Perfil Clínico
                </label>
                <textarea
                  rows={3}
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                  placeholder="Descripción de trayectoria, subespecialidades y cirugías que realiza..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    outline: 'none',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    background: '#002182',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.6rem 1.4rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 33, 130, 0.2)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Save size={16} />
                  <span>Guardar Cambios de Perfil</span>
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: Account Security & Operational Scope */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Password change */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.35rem',
                boxShadow: '0 2px 8px rgba(0, 33, 130, 0.02)'
              }}
            >
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={17} color="#002182" />
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Seguridad de la Cuenta
                  </h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                  Actualice su clave de acceso al portal médico.
                </p>
              </div>

              <form onSubmit={handleUpdateDoctorPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Repita nueva clave"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    marginTop: '0.35rem',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <KeyRound size={14} />
                  <span>Actualizar Contraseña</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // ADMINISTRATIVE VIEW: CONFIGURACIÓN GLOBAL INSTITUCIONAL
  // ==============================================================
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
        <div className="card" style={{ width: '100%', maxWidth: '100%' }}>
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
                  <th>Tipo / Rol de Acceso</th>
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
                      <span
                        style={{
                          background: u.adminType === 'doctor' ? '#ecfdf5' : '#eff6ff',
                          color: u.adminType === 'doctor' ? '#065f46' : '#2563eb',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.78rem'
                        }}
                      >
                        {u.adminType === 'doctor' ? 'Médico (Privado)' : u.role}
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
