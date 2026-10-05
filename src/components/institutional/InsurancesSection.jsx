import React, { useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { INITIAL_HEALTH_INSURANCES } from '../../data/mockData';
import {
  ShieldCheck,
  ArrowRight,
  BadgeCheck
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

const INSURANCE_LOGOS = {
  'osde': './logos/logo-osde.png',
  'swiss': './logos/logo-swiss-medical.png',
  'galeno': './logos/logo-galeno.png',
  'apross': './logos/logo-apross.png',
  'pami': './logos/logo-pami.png',
  'medicus': './logos/logo-medicus.svg'
};

const getResolvedLogo = (hi) => {
  if (hi.logo && typeof hi.logo === 'string' && hi.logo.trim() !== '') return hi.logo;
  const nameLower = (hi.name || '').toLowerCase();
  for (const [key, path] of Object.entries(INSURANCE_LOGOS)) {
    if (nameLower.includes(key)) return path;
  }
  return null;
};

const getInsuranceBadge = (hi) => {
  if (hi.badge && typeof hi.badge === 'string' && hi.badge.trim() !== '') {
    if (hi.badge === 'Planes Adheridos') return 'Convenio Activo';
    return hi.badge;
  }
  const n = (hi.name || '').toLowerCase();
  if (n.includes('pami') || n.includes('osde')) return 'Consultar a secretaría';
  if (n.includes('apross')) return 'Convenio Provincial';
  return 'Convenio Activo';
};

export const InsurancesSection = () => {
  const { healthInsurances, setCurrentView, clinicInfo } = useClinic();

  // Coberturas activas 100% dinámicas vinculadas al panel de administración de secretaría
  const activeInsurances = useMemo(() => {
    const list = Array.isArray(healthInsurances) && healthInsurances.length > 0
      ? healthInsurances
      : INITIAL_HEALTH_INSURANCES;

    return list.filter((hi) => {
      const isInactive = hi.status === 'Inactiva' || hi.status === 'Deshabilitada';
      const isParticular = (hi.name || '').toLowerCase().includes('particular');
      return !isInactive && !isParticular;
    });
  }, [healthInsurances]);

  const handleViewAll = () => {
    setCurrentView('insurances');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsApp = (insuranceName) => {
    const rawWa = (clinicInfo?.whatsapp || '543576450214').replace(/\D/g, '');
    const cleanWa = rawWa.startsWith('54') ? rawWa : `54${rawWa}`;
    const clinicName = clinicInfo?.name || 'CITRA';
    const text = encodeURIComponent(`Hola ${clinicName}, quisiera consultar sobre cobertura de ${insuranceName}.`);
    window.open(`https://wa.me/${cleanWa}?text=${text}`, '_blank', 'noopener');
  };

  return (
    <section
      id="obras-sociales"
      style={{
        padding: '2.5rem 1.25rem',
        background: '#F5F8FE',
        borderTop: '1px solid #D2E3FC'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header — Estilo App con título y "Ver todas" en el mismo renglón */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.15rem'
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
                marginBottom: '0.2rem'
              }}
            >
              <ShieldCheck size={13} color="#076ABC" />
              Coberturas Adheridas
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.25rem, 2.8vw, 1.7rem)',
                fontWeight: 900,
                color: '#002182',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.15
              }}
            >
              Obras Sociales & Prepagas
            </h2>
          </div>

          <button
            onClick={handleViewAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#076ABC',
              fontWeight: 800,
              fontSize: '0.86rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              padding: '0.35rem 0',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#002182';
              e.currentTarget.style.gap = '0.45rem';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#076ABC';
              e.currentTarget.style.gap = '0.25rem';
            }}
          >
            <span>Ver todas</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* HORIZONTAL SCROLL RUNNER (Corredor dinámico 100% sincronizado con Secretaría) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '0.85rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: '0.65rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}
        >
          {activeInsurances.length === 0 ? (
            <div style={{ padding: '1rem', color: '#496386', fontSize: '0.85rem' }}>
              No hay coberturas activas en este momento. Consultá a secretaría por WhatsApp.
            </div>
          ) : (
            activeInsurances.map((hi) => {
              const logo = getResolvedLogo(hi);
              const badge = getInsuranceBadge(hi);
              const initials = (hi.name || 'OS').substring(0, 3).toUpperCase();
              const logoColor = hi.logoColor || '#076ABC';

              return (
                <div
                  key={hi.id}
                  style={{
                    flex: '0 0 248px',
                    scrollSnapAlign: 'start',
                    background: '#ffffff',
                    border: '1.5px solid #E1EDFC',
                    borderRadius: '16px',
                    padding: '1.1rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.85rem',
                    boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#076ABC';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 33, 130, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#E1EDFC';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 33, 130, 0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1.5px solid #EDF3FD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3px',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0, 33, 130, 0.04)',
                        overflow: 'hidden'
                      }}
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt={hi.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: logo ? 'none' : 'flex',
                          width: '100%',
                          height: '100%',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #EBF3FD 0%, #D2E3FC 100%)',
                          color: logoColor,
                          fontWeight: 900,
                          fontSize: '0.82rem',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {initials}
                      </div>
                    </div>

                    <div style={{ overflow: 'hidden', minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.94rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {hi.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.73rem',
                          color: '#16a34a',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginTop: '0.15rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <BadgeCheck size={13} style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap' }}>{badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón Consultar → WhatsApp con logo oficial */}
                  <button
                    onClick={() => handleWhatsApp(hi.name)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.25)';
                    }}
                  >
                    <WhatsAppIcon size={15} color="#ffffff" style={{ flexShrink: 0 }} />
                    <span>Consultar</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
