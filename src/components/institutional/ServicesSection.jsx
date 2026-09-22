import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Bone,
  Brain,
  Activity,
  Dumbbell,
  ScanLine,
  Sparkles,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Heart,
  Footprints,
  Apple,
  Zap,
  Layers,
  Smile,
  Stethoscope,
  FileText
} from 'lucide-react';

export const ServicesSection = () => {
  const { setCurrentView, setBookingPreselectedSpecialty } = useClinic();
  // Default to the first category (one at a time, no "Todos" option)
  const [selectedCategory, setSelectedCategory] = useState('esp-1');

  const handleBookSpecialty = (specialtyId) => {
    if (setBookingPreselectedSpecialty) {
      setBookingPreselectedSpecialty(specialtyId);
    }
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoriesFilter = [
    { id: 'esp-1', label: 'Especialidades' },
    { id: 'esp-5', label: 'Rehabilitación' },
    { id: 'esp-10', label: 'Diagnóstico' },
    { id: 'esp-12', label: 'Tratamientos' }
  ];

  const serviceCategories = [
    {
      id: 'esp-1',
      title: 'ESPECIALIDADES',
      badge: 'Consultas Médicas',
      description: 'Atención clínica y diagnóstica con médicos especialistas. Seleccioná tu especialidad para coordinar turno con el profesional.',
      icon: Bone,
      color: '#076ABC',
      items: [
        { name: 'Traumatología', detail: 'Huesos, articulaciones y lesiones', icon: Bone },
        { name: 'Neurología', detail: 'Cefaleas, migrañas y sistema nervioso', icon: Brain },
        { name: 'Reumatología', detail: 'Artritis y dolores inflamatorios', icon: Activity },
        { name: 'Nutrición', detail: 'Planes personalizados y desinflamación', icon: Apple },
        { name: 'Medicina General & PAMI', detail: 'Atención clínica integral de adultos mayores', icon: Stethoscope }
      ]
    },
    {
      id: 'esp-5',
      title: 'REHABILITACIÓN',
      badge: 'Terapia Activa',
      description: 'Recuperación funcional en gimnasio terapéutico con kinesiólogos y fisioterapeutas colegiados.',
      icon: Dumbbell,
      color: '#002182',
      items: [
        { name: 'Kinesiología & Fisioterapia', detail: 'Recuperación motora, fisiatría activa y analgesia', icon: Dumbbell },
        { name: 'Osteopatía', detail: 'Terapia manual biomecánica y estructural', icon: Layers },
        { name: 'ATM & Bruxismo', detail: 'Tratamiento articular temporomandibular', icon: Smile },
        { name: 'Piso Pélvico Femenino', detail: 'Fisioterapia perineal y uroginecológica', icon: Heart },
        { name: 'Readaptación Funcional', detail: 'Reeducación postural y reintegro deportivo', icon: Activity }
      ]
    },
    {
      id: 'esp-10',
      title: 'DIAGNÓSTICO',
      badge: 'Imágenes Digitales',
      description: 'Estudios por imágenes de alta resolución y análisis biomecánico con entrega inmediata.',
      icon: ScanLine,
      color: '#002182',
      items: [
        { name: 'Radiología Digital', detail: 'Rayos X directos de alta definición', icon: ScanLine },
        { name: 'Estudio de la Pisada', detail: 'Baropodometría computarizada y marcha', icon: Footprints },
        { name: 'Plantillas Ortopédicas', detail: 'Diseño biomecánico personalizado a medida', icon: Footprints },
        { name: 'Informes Inmediatos', detail: 'Entrega digital en el día para tu médico', icon: FileText },
        { name: 'Aptos Físicos & Quirúrgicos', detail: 'Evaluación diagnóstica y pre-participativa', icon: CheckCircle2 }
      ]
    },
    {
      id: 'esp-12',
      title: 'TRATAMIENTOS',
      badge: 'Bienestar & Alivio',
      description: 'Terapias regenerativas y medicina estética orientadas a tu bienestar corporal.',
      icon: Sparkles,
      color: '#076ABC',
      items: [
        { name: 'Ozonoterapia', detail: 'Alivio articular y regeneración biológica', icon: Sparkles },
        { name: 'Piso Pélvico Femenino', detail: 'Biofeedback y reeducación perineal', icon: Heart },
        { name: 'ATM', detail: 'Terapia para articulación temporomandibular', icon: Smile },
        { name: 'Medicina Estética', detail: 'Procedimientos médico-estéticos no invasivos', icon: Sparkles },
        { name: 'Regeneración Articular', detail: 'Terapias biológicas de recuperación', icon: Activity }
      ]
    }
  ];

  // Show only the selected category (one at a time)
  const activeCategory = serviceCategories.find((cat) => cat.id === selectedCategory) || serviceCategories[0];

  return (
    <section
      id="servicios"
      style={{
        padding: '3.5rem 1.25rem 4rem',
        background: '#ffffff'
      }}
      className="section-container"
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
              letterSpacing: '0.04em',
              marginBottom: '0.5rem'
            }}
          >
            <CheckCircle2 size={14} color="#076ABC" />
            NUESTROS SERVICIOS ESPECIALIZADOS
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)',
              fontWeight: 900,
              color: '#002182',
              margin: '0 0 0.4rem',
              letterSpacing: '-0.02em'
            }}
          >
            Especialidades Médicas & Servicios
          </h2>
          <p style={{ margin: 0, fontSize: '0.94rem', color: '#496386' }}>
            Seleccioná una categoría para ver los servicios y solicitar tu turno.
          </p>
        </div>

        {/* SINGLE-SELECTION PILL FILTER (One by one, no "Todos" button) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '1.75rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            justifyContent: 'flex-start'
          }}
        >
          {categoriesFilter.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: isSelected ? '#076ABC' : '#F5F8FE',
                  color: isSelected ? '#ffffff' : '#002182',
                  border: isSelected ? '1.5px solid #076ABC' : '1.5px solid #D2E3FC',
                  padding: '0.6rem 1.15rem',
                  borderRadius: '100px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 4px 14px rgba(7, 106, 188, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* DISPLAY ONLY ONE CATEGORY AT A TIME — TAMAÑO FIJO Y ESTABLE */}
        <div
          style={{
            background: '#F5F8FE',
            borderRadius: '22px',
            border: '1.5px solid #D2E3FC',
            padding: '1.75rem 1.5rem',
            boxShadow: '0 6px 20px rgba(0, 33, 130, 0.05)',
            minHeight: '530px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}
        >
          {/* Active Category Header — Garantizado en 1 solo renglón */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#076ABC',
                color: '#ffffff',
                padding: '0.35rem 0.85rem',
                borderRadius: '100px',
                fontSize: '0.76rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <CheckCircle2 size={14} color="#ffffff" />
              <span>{activeCategory.title}</span>
            </div>

            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#002182',
                background: '#ffffff',
                border: '1px solid #D2E3FC',
                padding: '0.25rem 0.65rem',
                borderRadius: '100px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {activeCategory.badge}
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#496386', lineHeight: 1.5, margin: '0 0 1.15rem', minHeight: '44px' }}>
            {activeCategory.description}
          </p>

          {/* List of included services with fixed flex distribution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1, marginBottom: '1.25rem' }}>
            {activeCategory.items.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: '#ffffff',
                    border: '1px solid #D2E3FC',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '12px',
                    color: '#002182',
                    boxShadow: '0 1px 3px rgba(0, 33, 130, 0.03)'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#EBF3FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#076ABC',
                      flexShrink: 0
                    }}
                  >
                    <ItemIcon size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.2 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#496386' }}>
                      {item.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct booking through this specialty — siempre anclado al fondo */}
          <button
            onClick={() => handleBookSpecialty(activeCategory.id)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '0.85rem 0.6rem',
              borderRadius: '12px',
              fontSize: 'clamp(0.82rem, 2.6vw, 0.94rem)',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              boxShadow: '0 4px 14px rgba(7, 106, 188, 0.28)',
              minHeight: '46px',
              marginTop: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            <CalendarPlus size={18} />
            <span>Sacar Turno en {activeCategory.title}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
