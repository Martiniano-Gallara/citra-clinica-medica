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
  X,
  MapPin,
  Phone,
  BadgeCheck
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { dataService } from '../../services/dataService';

const InstagramIcon = ({ size = 20, color = '#ffffff', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const SettingsView = ({ initialTab = 'general' }) => {
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

  // Admin tabs: 'contact' | 'general' | 'profile' | 'doctor-profile'
  const [activeTab, setActiveTab] = useState(() => (isDoctor ? 'doctor-profile' : (initialTab || 'contact')));
  const [generalForm, setGeneralForm] = useState(clinicInfo || {});
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Sync generalForm if clinicInfo is loaded or updated
  useEffect(() => {
    if (clinicInfo) {
      setGeneralForm(clinicInfo);
    }
  }, [clinicInfo]);

  // Sync tab if initialTab prop changes
  useEffect(() => {
    if (initialTab && !isDoctor) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isDoctor]);

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
    if (!currentPassword) {
      addToast('Seguridad', 'Debe ingresar su contraseña actual para reautenticar la operación.', 'warning');
      return;
    }
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
        await dataService.updateUserPassword(currentPassword, newPassword);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (logAudit) {
        logAudit('UPDATE_PASSWORD', 'Seguridad & Credenciales', authAdmin?.email || currentDoctor?.email || '-', 'El profesional actualizó su contraseña de acceso.');
      }
      addToast('Contraseña Actualizada', 'Tu clave de acceso ha sido cambiada con éxito en la plataforma.', 'success');
    } catch (err) {
      console.error('Error al actualizar contraseña médica:', err);
      addToast('Error al Cambiar Contraseña', 'No se pudo actualizar la contraseña: ' + (err.message || ''), 'error');
    }
  };

  const handleSaveGeneral = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
    if (setAuthAdmin) {
      setAuthAdmin(prev => ({
        ...prev,
        name: adminProfileForm.name,
        email: adminProfileForm.email,
        phone: adminProfileForm.phone
      }));
    }
    addToast('Perfil Actualizado', 'Tus datos de secretaría/administración han sido guardados.', 'success');
  };

  const handleUpdateAdminPassword = async (e) => {
    e.preventDefault();
    if (!adminCurrentPassword) {
      addToast('Seguridad', 'Debe ingresar su contraseña actual para reautenticar la operación.', 'warning');
      return;
    }
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
        await dataService.updateUserPassword(adminCurrentPassword, adminNewPassword);
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
      addToast('Error al Cambiar Contraseña', 'No se pudo actualizar la contraseña: ' + (err.message || ''), 'error');
    }
  };

  // Doctor display name without duplicate prefix
  const doctorDisplayName = (() => {
    const raw = currentDoctor?.name || authAdmin?.name || 'Dr. Alejandro Blanco';
    return raw.includes('Morales') ? 'Dr. Alejandro Blanco' : raw;
  })();

  // Derived preview variables
  const previewAddress = generalForm.address || 'Av. Carlos Pontin 556, Arroyito, Córdoba';
  const previewSchedule = generalForm.scheduleShort || generalForm.schedule || 'Lunes a Viernes 8 a 20 hs';
  const previewPhone = generalForm.phoneFormatted || generalForm.phone || generalForm.whatsapp || '03576 450214';
  const previewInstagram = (generalForm.instagram || 'citra.arroyito').replace(/[@/]/g, '').trim();

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
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div className="page-title-group">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.25rem' }}>
            <Settings size={26} color="#076ABC" />
            <span>Configuración y Canales Oficiales</span>
          </h1>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>
            Gestioná los canales de atención en la portada, datos institucionales y seguridad de secretaría.
          </p>
        </div>
      </div>

      {/* Tabs Principales */}
      <div className="tabs-header" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '0.65rem', marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            borderRadius: '10px',
            border: activeTab === 'contact' ? '1.5px solid #076ABC' : '1.5px solid #CBD5E1',
            background: activeTab === 'contact' ? '#EBF3FD' : '#FFFFFF',
            color: activeTab === 'contact' ? '#002182' : '#475569',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Phone size={15} color={activeTab === 'contact' ? '#076ABC' : '#64748B'} />
          <span>Canales de Contacto (Portada Web)</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            borderRadius: '10px',
            border: activeTab === 'general' ? '1.5px solid #076ABC' : '1.5px solid #CBD5E1',
            background: activeTab === 'general' ? '#EBF3FD' : '#FFFFFF',
            color: activeTab === 'general' ? '#002182' : '#475569',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Building2 size={15} color={activeTab === 'general' ? '#076ABC' : '#64748B'} />
          <span>Datos Institucionales & Fiscales</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            borderRadius: '10px',
            border: activeTab === 'profile' ? '1.5px solid #076ABC' : '1.5px solid #CBD5E1',
            background: activeTab === 'profile' ? '#EBF3FD' : '#FFFFFF',
            color: activeTab === 'profile' ? '#002182' : '#475569',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <UserCheck size={15} color={activeTab === 'profile' ? '#076ABC' : '#64748B'} />
          <span>Mi Perfil & Seguridad</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CANALES DE CONTACTO (PORTADA WEB)                       */}
      {/* ============================================================== */}
      {activeTab === 'contact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Explicativo */}
          <div
            style={{
              background: 'linear-gradient(135deg, #EBF3FD 0%, #F5F8FE 100%)',
              border: '1.5px solid #D2E3FC',
              borderRadius: '16px',
              padding: '1.25rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#076ABC',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '0.25rem'
                }}
              >
                <Sparkles size={13} color="#076ABC" />
                ATENCIÓN INMEDIATA · 100% VINCULADO
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#002182', margin: '0 0 0.2rem' }}>
                Canales de Contacto Oficiales
              </h2>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#496386' }}>
                Lo que edites acá se actualiza en vivo en las 4 tarjetas de la portada, el pie de página y la botonera flotante.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveGeneral}
              disabled={isSavingGeneral}
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.35rem',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 14px rgba(7, 106, 188, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {isSavingGeneral ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isSavingGeneral ? 'Guardando...' : 'Guardar y Publicar en Web'}</span>
            </button>
          </div>

          {/* PREVISUALIZACIÓN EN VIVO (Exacta a la portada) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #D2E3FC',
              borderRadius: '18px',
              padding: '1.25rem 1.35rem',
              boxShadow: '0 4px 16px rgba(0, 33, 130, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Previsualización en vivo (Así lo ven los pacientes en la portada):
              </span>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Tiempo real
              </span>
            </div>

            {/* Grid 2x2 Idéntico a HomeDirectContact */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.75rem'
              }}
            >
              {/* 1. Ubicación */}
              <div
                style={{
                  background: '#F5F8FE',
                  border: '1.5px solid #D2E3FC',
                  borderRadius: '14px',
                  padding: '0.9rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.45rem'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182', marginBottom: '0.1rem' }}>
                    Ubicación
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#496386', lineHeight: 1.25 }}>
                    {previewAddress}
                  </div>
                </div>
              </div>

              {/* 2. Horarios */}
              <div
                style={{
                  background: '#F5F8FE',
                  border: '1.5px solid #D2E3FC',
                  borderRadius: '14px',
                  padding: '0.9rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.45rem'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #002182 0%, #001556 100%)',
                    color: '#257CE6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182', marginBottom: '0.1rem' }}>
                    Horarios
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#496386', lineHeight: 1.25 }}>
                    {previewSchedule}
                  </div>
                </div>
              </div>

              {/* 3. WhatsApp */}
              <div
                style={{
                  background: '#F5F8FE',
                  border: '1.5px solid #D2E3FC',
                  borderRadius: '14px',
                  padding: '0.9rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.45rem'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#25D366',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <WhatsAppIcon size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182', marginBottom: '0.1rem' }}>
                    WhatsApp
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#128C7E', fontWeight: 700 }}>
                    {previewPhone}
                  </div>
                </div>
              </div>

              {/* 4. Instagram */}
              <div
                style={{
                  background: '#F5F8FE',
                  border: '1.5px solid #D2E3FC',
                  borderRadius: '14px',
                  padding: '0.9rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.45rem'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <InstagramIcon size={18} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182', marginBottom: '0.1rem' }}>
                    Instagram
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#E1306C', fontWeight: 700 }}>
                    @{previewInstagram}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULARIO DE EDICIÓN DE LOS 4 CANALES */}
          <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              
              {/* Tarjeta 1: UBICACIÓN */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.5rem' }}>
                  <MapPin size={18} color="#076ABC" />
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>1. Ubicación Física</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Dirección visible en la tarjeta
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={generalForm.address || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                      placeholder="Av. Carlos Pontin 556, Arroyito, Córdoba"
                      required
                    />
                    <span style={{ fontSize: '0.71rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                      Texto visible bajo el título "Ubicación".
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                        Enlace a Google Maps
                      </label>
                      {generalForm.mapsUrl && (
                        <a
                          href={generalForm.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.74rem', color: '#076ABC', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          <ExternalLink size={12} /> Probar mapa
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      className="form-control"
                      value={generalForm.mapsUrl || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, mapsUrl: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                    />
                    <span style={{ fontSize: '0.71rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                      Destino al que viaja el paciente al tocar la tarjeta de Ubicación.
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: HORARIOS */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.5rem' }}>
                  <Clock size={18} color="#002182" />
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>2. Horarios de Atención</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Horario visible en la tarjeta (resumido)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={generalForm.scheduleShort || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, scheduleShort: e.target.value })}
                      placeholder="Lunes a Viernes 8 a 20 hs"
                      required
                    />
                    <span style={{ fontSize: '0.71rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                      Texto visible bajo el título "Horarios" en la tarjeta.
                    </span>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Horario detallado / institucional
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={generalForm.schedule || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, schedule: e.target.value })}
                      placeholder="Lunes a Viernes de 8:00 a 20:00 hs"
                    />
                    <span style={{ fontSize: '0.71rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                      Usado en pie de página y ficha completa de la clínica.
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: WHATSAPP */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.5rem' }}>
                  <WhatsAppIcon size={18} color="#25D366" />
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>3. WhatsApp Oficial</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                        Número de WhatsApp (con código de área)
                      </label>
                      {generalForm.whatsapp && (
                        <a
                          href={`https://wa.me/${String(generalForm.whatsapp).replace(/\D/g, '').startsWith('54') ? String(generalForm.whatsapp).replace(/\D/g, '') : '54' + String(generalForm.whatsapp).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          <WhatsAppIcon size={13} color="#16a34a" /> Probar chat
                        </a>
                      )}
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      value={generalForm.whatsapp || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, whatsapp: e.target.value })}
                      placeholder="+54 3576 450214"
                      required
                    />
                    <span style={{ fontSize: '0.71rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                      Destino de turnos por WhatsApp en toda la clínica.
                    </span>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      Teléfono con formato para mostrar
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={generalForm.phoneFormatted || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, phoneFormatted: e.target.value })}
                      placeholder="03576 450214"
                    />
                    <span style={{ fontSize: '0.71rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                      Texto verde legible visible bajo el título WhatsApp.
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 4: INSTAGRAM */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.5rem' }}>
                  <InstagramIcon size={18} color="#E1306C" />
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>4. Instagram Oficial</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                        Usuario de Instagram (con o sin @)
                      </label>
                      {generalForm.instagram && (
                        <a
                          href={`https://www.instagram.com/${String(generalForm.instagram).replace(/[@/]/g, '').trim()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.74rem', color: '#E1306C', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          <ExternalLink size={12} /> Probar perfil
                        </a>
                      )}
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      value={generalForm.instagram || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, instagram: e.target.value })}
                      placeholder="citra.arroyito"
                      required
                    />
                    <span style={{ fontSize: '0.71rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                      Se mostrará automáticamente como @{previewInstagram}.
                    </span>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                      URL del Perfil (opcional)
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      value={generalForm.instagramUrl || ''}
                      onChange={(e) => setGeneralForm({ ...generalForm, instagramUrl: e.target.value })}
                      placeholder="https://www.instagram.com/citra.arroyito"
                    />
                    <span style={{ fontSize: '0.71rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                      Si se deja vacío, se genera automáticamente con el usuario.
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Botón Guardar Inferior */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Los cambios se impactan en vivo sin necesidad de reiniciar la aplicación.
              </span>
              <button
                type="submit"
                disabled={isSavingGeneral}
                style={{
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.6rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(7, 106, 188, 0.28)'
                }}
              >
                {isSavingGeneral ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{isSavingGeneral ? 'Guardando...' : 'Guardar y Publicar en Web'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DATOS INSTITUCIONALES & FISCALES                        */}
      {/* ============================================================== */}
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
                <label className="form-label">Slogan de Atención al Paciente</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.slogan || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, slogan: e.target.value })}
                  placeholder="Nos enfocamos en tu recuperación y bienestar. ¡Consultá por nuestras especialidades!"
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
              <div className="form-group">
                <label className="form-label">Teléfono de Contacto Fijo</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.phone || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                  placeholder="3576 450214"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Código SISA / REFES</label>
                <input
                  type="text"
                  className="form-control"
                  value={generalForm.sisaRefesCode || ''}
                  onChange={(e) => setGeneralForm({ ...generalForm, sisaRefesCode: e.target.value })}
                  placeholder="REFES-04-14289"
                />
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Al guardar, la información se actualiza de inmediato en la base de datos de la clínica.
              </span>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSavingGeneral}
                style={{ minWidth: '200px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isSavingGeneral ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{isSavingGeneral ? 'Guardando...' : 'Guardar Parámetros'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MI PERFIL & SEGURIDAD (SECRETARÍA / ADMIN)               */}
      {/* ============================================================== */}
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
