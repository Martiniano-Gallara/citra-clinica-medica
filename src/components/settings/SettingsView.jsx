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
  Sparkles,
  Edit2,
  X
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { dataService } from '../../services/dataService';

export const SettingsView = () => {
  const {
    clinicInfo,
    setClinicInfo,
    updateClinicInfo,
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

  const handleUpdateDoctorPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Error', 'La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Error', 'Las contraseñas no coinciden.', 'warning');
      return;
    }

    try {
      if (dataService.isLive()) {
        await dataService.updateUserPassword(newPassword);
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
      addToast('Contraseña Actualizada', 'Tu clave de acceso ha sido cambiada con éxito en la plataforma.', 'success');
    } catch (err) {
      console.error('Error al actualizar contraseña médica:', err);
      addToast('Error al Cambiar Contraseña', 'No se pudo actualizar la contraseña en el servidor: ' + (err.message || ''), 'error');
    }
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

  const handleUpdateAdminPassword = async (e) => {
    e.preventDefault();
    if (!adminNewPassword || adminNewPassword.length < 6) {
      addToast('Error', 'La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      addToast('Error', 'Las contraseñas no coinciden.', 'warning');
      return;
    }

    try {
      if (dataService.isLive()) {
        await dataService.updateUserPassword(adminNewPassword);
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
      addToast('Contraseña Actualizada', 'Tu clave administrativa ha sido cambiada con éxito en la plataforma.', 'success');
    } catch (err) {
      console.error('Error al actualizar contraseña de administración:', err);
      addToast('Error al Cambiar Contraseña', 'No se pudo actualizar la contraseña en el servidor: ' + (err.message || ''), 'error');
    }
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
            <span>Configuración</span>
          </h1>
          <p>Parámetros institucionales y seguridad de la cuenta</p>
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
      </div>

      {/* TAB 1: DATOS INSTITUCIONALES */}
      {activeTab === 'general' && (
        <div className="card" style={{ width: '100%', maxWidth: '100%' }}>
          <form onSubmit={handleSaveGeneral}>
            <div className="form-row">
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

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Al guardar, la información se actualiza de inmediato en la página web pública.
              </span>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSavingGeneral}
                style={{ minWidth: '200px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isSavingGeneral ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{isSavingGeneral ? 'Guardando...' : 'Guardar y Sincronizar'}</span>
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



    </div>
  );
};
