import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const UserAuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    loginPatient,
    registerPatient,
    healthInsurances,
    patients
  } = useClinic();

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regDni, setRegDni] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regInsurance, setRegInsurance] = useState('OSDE');
  const [regInsuranceNumber, setRegInsuranceNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginInput.trim()) {
      setLoginError('Ingresa tu DNI o Correo Electrónico');
      return;
    }

    const res = loginPatient(loginInput, loginPassword);
    if (!res.success) {
      setLoginError('No encontramos un paciente registrado con esos datos. Si es tu primera vez, haz clic en "Crear Cuenta".');
    }
  };

  const handleQuickDemoLogin = () => {
    const demoPatient = patients[0] || { dni: '34.892.110', email: 'juan.perez@gmail.com' };
    setLoginInput(demoPatient.dni);
    setLoginPassword('demo1234');
    loginPatient(demoPatient.dni, 'demo1234');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regDni.trim() || !regEmail.trim()) {
      setRegError('Por favor completa los campos requeridos (Nombre, DNI, Email).');
      return;
    }

    const cleanDni = regDni.trim().replace(/\./g, '');
    const exists = patients.some((p) => (p.dni || '').replace(/\./g, '') === cleanDni);
    if (exists) {
      setRegError('Ya existe una cuenta con este DNI. Por favor inicia sesión.');
      return;
    }

    registerPatient({
      name: regName.trim(),
      dni: regDni.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim() || '+54 9 11 0000-0000',
      insuranceName: regInsurance,
      insurancePlan: regInsurance === 'Particular' ? 'Sin cobertura' : 'Plan Estándar',
      insuranceNumber: regInsuranceNumber.trim() || 'N/A',
      password: regPassword || '123456',
      bloodType: 'N/E',
      allergies: []
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 33, 130, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 33, 130, 0.35)',
          border: '1px solid #D2E3FC',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
            padding: '1.75rem 2rem 1.25rem',
            color: '#ffffff',
            borderTopLeftRadius: '19px',
            borderTopRightRadius: '19px',
            position: 'relative'
          }}
        >
          <button
            onClick={() => setIsAuthModalOpen(false)}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '0.4rem 0.8rem',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
              }}
            >
              <img
                src="./citra-logo.png"
                alt="CITRA Clínica Médica"
                style={{ height: '38px', maxWidth: '160px', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.75rem', borderRadius: '100px', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              <ShieldCheck size={14} color="#257CE6" />
              PORTAL DEL PACIENTE
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>
            {authModalTab === 'login' ? 'Iniciar Sesión' : 'Registro de Paciente'}
          </h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#D2E3FC' }}>
            {authModalTab === 'login'
              ? 'Accedé para gestionar tus turnos médicos y consultas.'
              : 'Registrate en menos de 1 minuto para sacar y consultar turnos.'}
          </p>

          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              padding: '4px',
              marginTop: '1.25rem',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => { setAuthModalTab('login'); setLoginError(''); }}
              style={{
                flex: 1,
                padding: '0.6rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                background: authModalTab === 'login' ? '#ffffff' : 'transparent',
                color: authModalTab === 'login' ? '#002182' : '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <LogIn size={15} />
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setAuthModalTab('register'); setRegError(''); }}
              style={{
                flex: 1,
                padding: '0.6rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                background: authModalTab === 'register' ? '#ffffff' : 'transparent',
                color: authModalTab === 'register' ? '#002182' : '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <UserPlus size={15} />
              Crear Cuenta
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.75rem 2rem' }}>
          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              {loginError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}
                >
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{loginError}</div>
                </div>
              )}

              {/* Demo Account Quick Access Card */}
              <div
                style={{
                  background: '#F5F8FE',
                  border: '1px dashed #076ABC',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={14} color="#076ABC" />
                    Cuenta de Demostración
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#496386', marginTop: '2px' }}>
                    DNI: 34.892.110 (Juan Ignacio Pérez)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  style={{
                    background: '#076ABC',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Ingresar Demo
                </button>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#002182', marginBottom: '0.4rem' }}>
                  DNI o Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Ej: 34.892.110 o juan@gmail.com"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#002182' }}>
                    Contraseña
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#076ABC', cursor: 'pointer' }}>
                    ¿Olvidaste tu clave?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
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
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                }}
              >
                <LogIn size={18} />
                Ingresar a Mi Cuenta
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#496386' }}>
                ¿Primera vez en CITRA?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthModalTab('register'); setRegError(''); }}
                  style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                >
                  Registrate aquí
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              {regError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}
                >
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{regError}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Nombre Completo *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ej: Lucía Gómez"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.6rem 0.65rem 2.2rem',
                        borderRadius: '9px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    DNI *
                  </label>
                  <input
                    type="text"
                    required
                    value={regDni}
                    onChange={(e) => setRegDni(e.target.value)}
                    placeholder="Ej: 38.250.914"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '9px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Correo Electrónico *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="tuemail@ejemplo.com"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.6rem 0.65rem 2.2rem',
                        borderRadius: '9px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Teléfono / WhatsApp *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+54 9 11 4455-6677"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.6rem 0.65rem 2.2rem',
                        borderRadius: '9px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Obra Social o Prepaga
                  </label>
                  <select
                    value={regInsurance}
                    onChange={(e) => setRegInsurance(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '9px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Particular">Particular (Sin Obra Social)</option>
                    {healthInsurances.map((hi) => (
                      <option key={hi.id} value={hi.name}>
                        {hi.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    N° de Afiliado
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                    <input
                      type="text"
                      value={regInsuranceNumber}
                      onChange={(e) => setRegInsuranceNumber(e.target.value)}
                      placeholder="Ej: 310-9281-01"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.6rem 0.65rem 2.2rem',
                        borderRadius: '9px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                  Crear Contraseña *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Crea una contraseña segura"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.6rem 0.65rem 2.2rem',
                      borderRadius: '9px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
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
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                }}
              >
                <CheckCircle2 size={18} />
                Completar Registro y Continuar
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#496386' }}>
                ¿Ya tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthModalTab('login'); setLoginError(''); }}
                  style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                >
                  Iniciá sesión aquí
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
