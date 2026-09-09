import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ContactSection = () => {
  const { addToast } = useClinic();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Consulta General',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Campos requeridos', 'Por favor completa tu nombre, email y mensaje.', 'warning');
      return;
    }

    setSubmitted(true);
    addToast('Mensaje Enviado', 'Nos pondremos en contacto contigo a la brevedad.', 'success');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'Consulta General',
      message: ''
    });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section
      id="contacto"
      style={{
        padding: '5rem 1.5rem',
        background: '#ffffff'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#EBF3FD',
              color: '#002182',
              padding: '0.35rem 0.85rem',
              borderRadius: '100px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}
          >
            CONTACTO & ATENCIÓN
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 900,
              color: '#002182',
              margin: '0 0 1rem',
              letterSpacing: '-0.02em'
            }}
          >
            Estamos a tu Disposición
          </h2>
          <p style={{ fontSize: '1rem', color: '#496386', margin: 0, lineHeight: 1.6 }}>
            Comunicate con nuestra mesa de recepción para consultas administrativas, estudios o autorizaciones.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Direct info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                background: '#F5F8FE',
                border: '1.5px solid #D2E3FC',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}
              >
                <MapPin size={22} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800, color: '#002182' }}>
                  Dirección y Acceso
                </h4>
                <div style={{ fontSize: '0.88rem', color: '#496386', lineHeight: 1.5 }}>
                  Av. Carlos Pontin Nº556, Arroyito, Córdoba (CP 2434).<br />
                  Fácil acceso y estacionamiento.
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#F5F8FE',
                border: '1.5px solid #D2E3FC',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}
              >
                <Phone size={22} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800, color: '#002182' }}>
                  Central Telefónica de Turnos
                </h4>
                <div style={{ fontSize: '0.88rem', color: '#496386', lineHeight: 1.5 }}>
                  <a href="tel:03576450214" style={{ color: '#076ABC', fontWeight: 800, textDecoration: 'none' }}>
                    3576 450214
                  </a><br />
                  Solicitá tu turno con nuestros especialistas.
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#F5F8FE',
                border: '1.5px solid #D2E3FC',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}
              >
                <MessageCircle size={22} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800, color: '#002182' }}>
                  Instagram Oficial
                </h4>
                <div style={{ fontSize: '0.88rem', color: '#496386', lineHeight: 1.5 }}>
                  <a href="https://www.instagram.com/citra.arroyito" target="_blank" rel="noopener noreferrer" style={{ color: '#076ABC', fontWeight: 800, textDecoration: 'none' }}>
                    @citra.arroyito
                  </a><br />
                  Nos enfocamos en tu recuperación y bienestar.
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#F5F8FE',
                border: '1.5px solid #D2E3FC',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}
              >
                <Clock size={22} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800, color: '#002182' }}>
                  Horarios de Atención
                </h4>
                <div style={{ fontSize: '0.88rem', color: '#496386', lineHeight: 1.5 }}>
                  Lunes a Viernes: 8 a 20 hs<br />
                  <span style={{ color: '#076ABC', fontWeight: 700 }}>¡Estamos para ayudarte!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div
            style={{
              background: '#F5F8FE',
              border: '1.5px solid #D2E3FC',
              borderRadius: '20px',
              padding: '2rem 2.25rem',
              boxShadow: '0 10px 25px rgba(0, 33, 130, 0.05)'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', fontWeight: 800, color: '#002182' }}>
              Envíanos un Mensaje
            </h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#496386' }}>
              Respondemos tus consultas administrativas y presupuestos dentro de las 24 horas hábiles.
            </p>

            {submitted ? (
              <div
                style={{
                  background: '#d1fae5',
                  border: '1px solid #6ee7b7',
                  color: '#065f46',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>¡Mensaje Enviado con Éxito!</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
                  Nos comunicaremos a la brevedad al correo o teléfono proporcionado.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Marcelo Fernández"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nombre@correo.com"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.88rem',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+54 9 11 ..."
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.88rem',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                    Motivo o Asunto
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Consulta General">Consulta General</option>
                    <option value="Turnos y Horarios">Turnos y Horarios</option>
                    <option value="Autorización de Obra Social">Autorización de Obra Social</option>
                    <option value="Presupuesto Quirúrgico">Presupuesto Quirúrgico / Prótesis</option>
                    <option value="Kinesiología & Rehabilitación">Kinesiología & Rehabilitación</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                    Mensaje o Consulta *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Escribí aquí los detalles de tu consulta..."
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: '#ffffff',
                      resize: 'vertical'
                    }}
                  />
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                  }}
                >
                  <Send size={17} />
                  Enviar Consulta
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
