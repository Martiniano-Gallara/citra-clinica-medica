import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Settings,
  Building2,
  Users,
  Shield,
  Clock,
  CreditCard,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  KeyRound,
  Check,
  Stethoscope,
  Lock,
  DollarSign,
  Percent,
  UserCheck,
  Database,
  Globe,
  Loader2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const SettingsView = () => {
  const {
    clinicInfo,
    setClinicInfo,
    updateClinicInfo,
    specialties,
    setSpecialties,
    addSpecialty,
    deleteSpecialty,
    rooms,
    setRooms,
    addRoom,
    deleteRoom,
    healthInsurances,
    setHealthInsurances,
    users,
    setUsers,
    updateUser,
    addToast,
    isDoctor,
    currentDoctor,
    authAdmin,
    setAuthAdmin,
    logAudit
  } = useClinic();

  // Admin tabs
  const [activeTab, setActiveTab] = useState(isDoctor ? 'doctor-profile' : 'general');
  const [generalForm, setGeneralForm] = useState(clinicInfo);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Sync generalForm if clinicInfo is loaded from database
  useEffect(() => {
    if (clinicInfo) {
      setGeneralForm(clinicInfo);
    }
  }, [clinicInfo]);

  // Admin / Secretaría personal profile form
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: authAdmin?.name || 'Secretaría General',
    email: authAdmin?.email || 'secretaria@citra.com.ar',
    phone: authAdmin?.phone || '3576 450214'
  });
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  // Secretary: reset password for any user
  const [resetTargetUserId, setResetTargetUserId] = useState(null);
  const [resetNewPwd, setResetNewPwd] = useState('');
  const [resetConfirmPwd, setResetConfirmPwd] = useState('');

  useEffect(() => {
    if (authAdmin) {
      setAdminProfileForm({
        name: authAdmin.name || 'Secretaría General',
        email: authAdmin.email || 'secretaria@citra.com.ar',
        phone: authAdmin.phone || '3576 450214'
      });
    }
  }, [authAdmin]);

  // Security password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');



  // New Specialty modal / inline state (Admin)
  const [newEspName, setNewEspName] = useState('');
  const [newEspDuration, setNewEspDuration] = useState(30);

  // New Room inline state (Admin)
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('Piso 1');

  // Secretary: reset password for any user
  const handleSecretaryResetPassword = (e) => {
    e.preventDefault();
    if (!resetNewPwd || resetNewPwd.length < 6) {
      addToast('Error', 'La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (resetNewPwd !== resetConfirmPwd) {
      addToast('Error', 'Las contraseñas no coinciden.', 'warning');
      return;
    }
    const target = users.find((u) => u.id === resetTargetUserId);
    if (!target) return;
    setUsers((prev) =>
      prev.map((u) => u.id === resetTargetUserId ? { ...u, password: resetNewPwd } : u)
    );
    if (logAudit) {
      logAudit('RESET_PASSWORD', 'Seguridad & Credenciales', target.email || '-', `Secretaría restableció la contraseña del usuario: ${target.name}.`);
    }
    addToast('Contraseña Restablecida', `La contraseña de ${target.name} fue actualizada correctamente.`, 'success');
    setResetTargetUserId(null);
    setResetNewPwd('');
    setResetConfirmPwd('');
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

    const userEmail = authAdmin?.email || currentDoctor?.email;
    if (userEmail) {
      setUsers((prev) =>
        prev.map((u) => (u.email?.toLowerCase() === userEmail.toLowerCase() ? { ...u, password: newPassword } : u))
      );
      if (setAuthAdmin && authAdmin) {
        setAuthAdmin((prev) => ({ ...prev, password: newPassword }));
      }
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    if (logAudit) {
      logAudit('UPDATE_PASSWORD', 'Seguridad & Credenciales', authAdmin?.email || '-', 'El profesional actualizó su contraseña de acceso.');
    }
    addToast('Contraseña Actualizada', 'Tu clave de acceso ha sido cambiada con éxito.', 'success');
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      await updateClinicInfo(generalForm);
    } catch (err) {
      console.error('Error guardando configuración:', err);
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleAddSpecialty = (e) => {
    e.preventDefault();
    if (!newEspName.trim()) return;
    addSpecialty({
      name: newEspName,
      defaultDuration: Number(newEspDuration),
      estimatedDuration: Number(newEspDuration),
      color: '#3b82f6',
      icon: 'Activity'
    });
    setNewEspName('');
  };

  const handleDeleteSpecialty = (id) => {
    deleteSpecialty(id);
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    addRoom({
      name: newRoomName,
      floor: newRoomFloor,
      branchId: 'branch-1',
      specialty: 'General'
    });
    setNewRoomName('');
  };

  const handleDeleteRoom = (id) => {
    deleteRoom(id);
  };

  // Secretaría / Admin profile & password
  const handleSaveAdminProfile = (e) => {
    e.preventDefault();
    if (authAdmin?.id) {
      updateUser(authAdmin.id, {
        name: adminProfileForm.name,
        email: adminProfileForm.email,
        phone: adminProfileForm.phone
      });
    } else {
      if (setAuthAdmin) {
        setAuthAdmin(prev => ({
          ...prev,
          name: adminProfileForm.name,
          email: adminProfileForm.email,
          phone: adminProfileForm.phone
        }));
      }
      addToast('Perfil Actualizado', 'Tus datos de secretaría/administración han sido guardados.', 'success');
    }
  };

  const handleUpdateAdminPassword = (e) => {
    e.preventDefault();
    if (!adminNewPassword || adminNewPassword.length < 6) {
      addToast('Error', 'La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      addToast('Error', 'Las contraseñas no coinciden.', 'warning');
      return;
    }

    const userEmail = authAdmin?.email;
    if (userEmail) {
      setUsers((prev) =>
        prev.map((u) => (u.email?.toLowerCase() === userEmail.toLowerCase() ? { ...u, password: adminNewPassword } : u))
      );
      if (setAuthAdmin && authAdmin) {
        setAuthAdmin((prev) => ({ ...prev, password: adminNewPassword }));
      }
    }

    setAdminCurrentPassword('');
    setAdminNewPassword('');
    setAdminConfirmPassword('');
    if (logAudit) {
      logAudit('UPDATE_PASSWORD', 'Seguridad & Credenciales', authAdmin?.email || '-', 'El personal de secretaría/admin actualizó su contraseña de acceso.');
    }
    addToast('Contraseña Actualizada', 'Tu clave administrativa ha sido cambiada con éxito.', 'success');
  };

  // Doctor display name without duplicate prefix
  const doctorDisplayName = (() => {
    const raw = currentDoctor?.name || authAdmin?.name || 'Dr. Alejandro Blanco';
    return raw.includes('Morales') ? 'Dr. Alejandro Blanco' : raw;
  })();

  // ==============================================================
  // DOCTOR VIEW: SOLO CAMBIO DE CONTRASEÑA
  // ==============================================================
  if (isDoctor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '650px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Lock size={28} color="#002182" style={{ flexShrink: 0 }} />
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Mi Configuración
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, whiteSpace: 'nowrap' }}>
              Seguridad y acceso al panel médico. Los datos de perfil profesional los gestiona la secretaría.
            </p>
          </div>
        </div>

        {/* DATOS DE SOLO LECTURA */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
            <Stethoscope size={16} color="#002182" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Mis Datos Profesionales</span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1px 8px', fontWeight: 700, whiteSpace: 'nowrap' }}>Solo lectura · Editar en Secretaría</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.84rem' }}>
            <div><span style={{ color: '#64748b', fontWeight: 700 }}>Nombre: </span><span style={{ color: '#0f172a', fontWeight: 800 }}>{doctorDisplayName}</span></div>
            <div><span style={{ color: '#64748b', fontWeight: 700 }}>Especialidad: </span><span style={{ color: '#0f172a', fontWeight: 800 }}>{(currentDoctor?.specialty || authAdmin?.specialty)?.toLowerCase().includes('traumatolog') ? 'Traumatólogo' : (currentDoctor?.specialty || authAdmin?.specialty || '—')}</span></div>
            <div><span style={{ color: '#64748b', fontWeight: 700 }}>Teléfono: </span><span style={{ color: '#0f172a' }}>{currentDoctor?.phone || authAdmin?.phone || '3576 450214'}</span></div>
            <div><span style={{ color: '#64748b', fontWeight: 700 }}>Email: </span><span style={{ color: '#0f172a' }}>{currentDoctor?.email || authAdmin?.email || '—'}</span></div>
          </div>
        </div>

        {/* CAMBIO DE CONTRASEÑA */}
        <div style={{ background: '#ffffff', border: '1.5px solid #BFDBFE', borderRadius: '14px', padding: '1.35rem', boxShadow: '0 2px 12px rgba(0, 33, 130, 0.06)' }}>
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="#002182" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cambiar Contraseña</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0' }}>
              Actualizá tu clave de acceso. Si olvidaste tu contraseña, contactá a secretaría.
            </p>
          </div>

          <form onSubmit={handleUpdateDoctorPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>Contraseña Actual</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.52rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>Nueva Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.52rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>Confirmar Nueva Contraseña</label>
              <input
                type="password"
                placeholder="Repita nueva clave"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.52rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)', border: 'none', color: '#ffffff', padding: '0.62rem 1.4rem', borderRadius: '9px', fontSize: '0.88rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '7px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(7, 106, 188, 0.25)', alignSelf: 'flex-start' }}
            >
              <KeyRound size={16} />
              <span>Actualizar Contraseña</span>
            </button>
          </form>
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
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserCheck size={16} />
          <span>Mi Perfil & Seguridad</span>
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

      {/* TAB 1: DATOS INSTITUCIONALES (SINCRONIZADOS 100% CON BASE DE DATOS Y WEB PACIENTES) */}
      {activeTab === 'general' && (
        <div className="card" style={{ width: '100%', maxWidth: '100%' }}>
          {/* Live Supabase Synchronization Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#16a34a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Database size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#14532d', fontSize: '0.94rem' }}>
                    Sincronización Cloud Supabase PostgreSQL Activa
                  </span>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.55rem',
                      borderRadius: '100px',
                      border: '1px solid #86efac'
                    }}
                  >
                    100% VINCULADO
                  </span>
                </div>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#166534', lineHeight: 1.4 }}>
                  Los cambios guardados aquí se persisten en la base de datos e impactan en tiempo real en la página web pública de pacientes (botones de turnos, WhatsApp, teléfonos, dirección, horarios), en recetas electrónicas y comprobantes fiscales ARCA.
                </p>
              </div>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 700, background: '#ffffff', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              Base: mlmslhyvzohccniddemr.supabase.co
            </div>
          </div>

          <form onSubmit={handleSaveGeneral}>
            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Nombre Institucional de la Clínica</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.name || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                  placeholder="CITRA"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CUIT / Identificación Tributaria AFIP-ARCA</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.cuit || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, cuit: e.target.value })}
                  placeholder="30-71829340-8"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Razón Social / Subtítulo Institucional</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.tagline || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, tagline: e.target.value })}
                  placeholder="Centro Integral de Traumatología y Rehabilitación Arroyito"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slogan de Atención al Paciente</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.slogan || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, slogan: e.target.value })}
                  placeholder="Nos enfocamos en tu recuperación y bienestar. ¡Consultá por nuestras especialidades!"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teléfono de Contacto Fijo</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={generalForm.phone || ''}
                    onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                    placeholder="3576 450214"
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>WhatsApp Oficial de Turnos</label>
                  {generalForm.whatsapp && (
                    <a
                      href={`https://wa.me/${String(generalForm.whatsapp).replace(/\D/g, '').startsWith('54') ? String(generalForm.whatsapp).replace(/\D/g, '') : '54' + String(generalForm.whatsapp).replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <WhatsAppIcon size={13} color="#16a34a" /> Probar enlace
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.whatsapp || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, whatsapp: e.target.value })}
                  placeholder="+54 3576 450214"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Oficial de la Clínica</label>
                <input
                  type="email"
                  className="form-control"
                  value={generalForm.email || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                  placeholder="contacto@citra.com.ar"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Dirección Principal</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.address || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                  placeholder="Av. Carlos Pontin 556, Arroyito, Córdoba"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Horario Principal de Atención</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.schedule || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, schedule: e.target.value })}
                  placeholder="Lunes a Viernes de 8:00 a 20:00 hs"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Horario Resumido (Navbar y Pies)</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.scheduleShort || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, scheduleShort: e.target.value })}
                  placeholder="Lunes a Viernes 8 a 20 hs"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instagram Oficial (Usuario sin @)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={generalForm.instagram || ''}
                    onChange={(e) => setGeneralForm({ ...generalForm, instagram: e.target.value })}
                    placeholder="citra.arroyito"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Enlace a Google Maps</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.mapsUrl || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, mapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
            </div>

            {/* Parámetros Sanitarios y Fiscales */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} color="#002182" />
                <span>Parámetros de Integración Fiscal y Sanitaria (ARCA & SISA)</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Código Establecimiento SISA REFES</label>
                  <input
                    type="text"
                    className="form-control"
                    value={generalForm.sisaRefesCode || ''}
                    onChange={(e) => setGeneralForm({ ...generalForm, sisaRefesCode: e.target.value })}
                    placeholder="REFES-04-14289"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Punto de Venta ARCA Facturación Electrónica</label>
                  <input
                    type="number"
                    className="form-control"
                    value={generalForm.arcaPtoVta || 1}
                    onChange={(e) => setGeneralForm({ ...generalForm, arcaPtoVta: Number(e.target.value) })}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Al guardar, la información se actualiza de inmediato en Supabase Cloud y en la página web pública.
              </span>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSavingGeneral}
                style={{ minWidth: '220px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isSavingGeneral ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{isSavingGeneral ? 'Guardando en Supabase...' : 'Guardar y Sincronizar'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB NUEVA: MI PERFIL & SEGURIDAD (SECRETARÍA / ADMIN) */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Ficha de Operador Administrativo */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="#2563eb" />
                <span>Datos de Mi Cuenta de Secretaría</span>
              </div>
            </div>

            <form onSubmit={handleSaveAdminProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Nombre del Operador / Secretaría</label>
                <input
                  type="text"
                  className="form-control"
                  value={adminProfileForm.name}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Correo Electrónico de Notificaciones</label>
                <input
                  type="email"
                  className="form-control"
                  value={adminProfileForm.email}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Teléfono Directo de Contacto</label>
                <input
                  type="text"
                  className="form-control"
                  value={adminProfileForm.phone}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
                <strong>Rol Asignado:</strong> {authAdmin?.role || 'Secretaría / Recepción Integral'} · <strong>Estado:</strong> Activo
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <Save size={16} />
                <span>Guardar Mi Perfil</span>
              </button>
            </form>
          </div>

          {/* Cambio de Contraseña de Secretaría */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#2563eb" />
                <span>Seguridad & Clave de Acceso</span>
              </div>
            </div>

            <form onSubmit={handleUpdateAdminPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Contraseña Actual</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="form-control"
                  value={adminCurrentPassword}
                  onChange={(e) => setAdminCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="form-control"
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Repita nueva clave"
                  className="form-control"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
                <KeyRound size={16} />
                <span>Actualizar Contraseña</span>
              </button>
            </form>
          </div>
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

      {/* TAB 3: USUARIOS & ROLES + RESET PASSWORD */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header aviso */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <KeyRound size={18} color="#2563eb" />
            <span style={{ fontSize: '0.84rem', color: '#1e40af', fontWeight: 700 }}>
              Como secretaría, podés restablecer la contraseña de cualquier usuario del sistema si la olvidaron.
            </span>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Tipo / Rol de Acceso</th>
                    <th>Estado</th>
                    <th>Restablecer Contraseña</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <React.Fragment key={u.id}>
                      <tr>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: u.adminType === 'doctor' ? '#EBF3FD' : '#eff6ff', color: u.adminType === 'doctor' ? '#002182' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                              {(u.name || '?').charAt(0)}
                            </div>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.email}</td>
                        <td>
                          <span style={{ background: u.adminType === 'doctor' ? '#ecfdf5' : '#eff6ff', color: u.adminType === 'doctor' ? '#065f46' : '#2563eb', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem' }}>
                            {u.adminType === 'doctor' ? `Médico · ${u.specialty || 'Especialista'}` : (u.role || 'Secretaría')}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.82rem' }}>● Activo</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setResetTargetUserId(resetTargetUserId === u.id ? null : u.id);
                              setResetNewPwd('');
                              setResetConfirmPwd('');
                            }}
                            style={{ background: resetTargetUserId === u.id ? '#fee2e2' : '#f1f5f9', border: '1px solid ' + (resetTargetUserId === u.id ? '#fca5a5' : '#cbd5e1'), color: resetTargetUserId === u.id ? '#991b1b' : '#334155', padding: '0.35rem 0.75rem', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          >
                            <KeyRound size={13} />
                            <span>{resetTargetUserId === u.id ? 'Cancelar' : 'Restablecer'}</span>
                          </button>
                        </td>
                      </tr>
                      {resetTargetUserId === u.id && (
                        <tr>
                          <td colSpan={5} style={{ background: '#fafafa', padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0' }}>
                            <form onSubmit={handleSecretaryResetPassword} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginRight: '0.25rem', alignSelf: 'center' }}>
                                Nueva contraseña para <strong>{u.name}</strong>:
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Nueva contraseña</label>
                                <input
                                  type="password"
                                  placeholder="Mínimo 6 caracteres"
                                  value={resetNewPwd}
                                  onChange={(e) => setResetNewPwd(e.target.value)}
                                  required
                                  style={{ padding: '0.42rem 0.75rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', background: '#ffffff', width: '200px' }}
                                />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Confirmar contraseña</label>
                                <input
                                  type="password"
                                  placeholder="Repita la clave"
                                  value={resetConfirmPwd}
                                  onChange={(e) => setResetConfirmPwd(e.target.value)}
                                  required
                                  style={{ padding: '0.42rem 0.75rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', background: '#ffffff', width: '200px' }}
                                />
                              </div>
                              <button
                                type="submit"
                                style={{ background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)', border: 'none', color: '#ffffff', padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(7,106,188,0.2)', alignSelf: 'flex-end' }}
                              >
                                <Check size={15} />
                                <span>Guardar Nueva Contraseña</span>
                              </button>
                            </form>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                      {r.floor}
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      style={{ width: '26px', height: '26px' }}
                      onClick={() => handleDeleteRoom(r.id)}
                      title="Eliminar consultorio"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
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
