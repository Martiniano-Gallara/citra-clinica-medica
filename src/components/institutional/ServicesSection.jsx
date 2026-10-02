import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Bone,
  Brain,
  Activity,
  Dumbbell,
  ScanLine,
  Sparkles,
  Heart,
  Footprints,
  Apple,
  Layers,
  Smile,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const ServicesSection = () => {
  const { clinicInfo } = useClinic();
  const categories = [
    {
      id: 'medicas',
      label: 'Consultas Médicas',
      title: 'CONSULTAS MÉDICAS',
      badge: 'Especialistas',
      items: [
        { name: 'Traumatología', detail: 'Dr. Blanco · Dr. Lagos', icon: Bone },
        { name: 'Neurología', detail: 'Dra. Ferreira · Secretaría', icon: Brain },
        { name: 'Reumatología', detail: 'Dra. Miretti · Secretaría', icon: Activity },
        { name: 'Nutrición', detail: 'Lic. Tsakoumagkos · Secretaría', icon: Apple },
        { name: 'Atención PAMI', detail: 'Dra. Allione · Mar y jue mañana', icon: Heart }
      ]
    },
    {
      id: 'kinesio',
      label: 'Rehabilitación',
      title: 'REHABILITACIÓN',
      badge: 'Gimnasio Terapéutico',
      items: [
        { name: 'Kinesiología & Fisioterapia', detail: 'Lic. Barrea · Lic. Baravalle · Lic. Mondino', icon: Dumbbell },
        { name: 'Osteopatía', detail: 'Lic. Mondino · Consultar en CITRA', icon: Layers },
        { name: 'ATM (Mandíbula)', detail: 'Lic. Baravalle · Consultar en CITRA', icon: Smile },
        { name: 'Suelo Pélvico', detail: 'Lic. Baravalle · Consultar en CITRA', icon: Heart }
      ]
    },
    {
      id: 'diagnostico',
      label: 'Diagnóstico & Terapias',
      title: 'DIAGNÓSTICO & BIENESTAR',
      badge: 'Estudios & Tratamientos',
      items: [
        { name: 'Radiología Digital', detail: 'Lic. Emilio · Próximamente', icon: ScanLine },
        { name: 'Ozonoterapia', detail: 'Dr. Luque · Secretaría', icon: Sparkles },
        { name: 'Estudio de Pisada', detail: 'Lic. Salvagno · Secretaría', icon: Footprints },
        { name: 'Medicina Estética', detail: 'Dra. Allione · Lun, mié y vie', icon: Sparkles },
        { name: 'Shama Yoga', detail: 'Profe Maru · Lun y mar', icon: Activity }
      ]
    }
  ];

  const [selectedCategoryId, setSelectedCategoryId] = useState('medicas');
  const activeCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  // Elemento seleccionado individualmente (por defecto el primero de la categoría activa)
  const [selectedService, setSelectedService] = useState(activeCategory.items[0]);

  const handleCategoryChange = (catId) => {
    setSelectedCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat && cat.items.length > 0) {
      setSelectedService(cat.items[0]);
    }
  };

  const handleBook = (serviceName) => {
    const rawWa = (clinicInfo?.whatsapp || '543576450214').replace(/\D/g, '');
    const cleanWa = rawWa.startsWith('54') ? rawWa : `54${rawWa}`;
    const text = `Hola ${clinicInfo?.name || 'CITRA'}, quisiera solicitar un turno para ${serviceName}.`;
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

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
        {/* Header de la Sección */}
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
            <span>ÁREAS DE ATENCIÓN</span>
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
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#496386', lineHeight: 1.4 }}>
            Elegí tu área y seleccioná el servicio para coordinar tu turno por WhatsApp.
          </p>
        </div>

        {/* Pestañas de Categoría */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '1.5rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #076ABC 0%, #002182 100%)' : '#F5F8FE',
                  color: isSelected ? '#ffffff' : '#002182',
                  border: isSelected ? '1.5px solid #076ABC' : '1.5px solid #D2E3FC',
                  padding: '0.55rem 1.15rem',
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

        {/* Tarjeta Principal Interactiva con Selección Individual */}
        <div
          style={{
            background: '#F8FAFD',
            borderRadius: '22px',
            border: '1.5px solid #D2E3FC',
            padding: '1.35rem clamp(0.9rem, 3.5vw, 1.35rem) 1.5rem',
            boxShadow: '0 6px 20px rgba(0, 33, 130, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}
        >
          {/* Header de la categoría activa */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#076ABC',
                color: '#ffffff',
                padding: '0.35rem 0.8rem',
                borderRadius: '100px',
                fontSize: 'clamp(0.7rem, 2.4vw, 0.76rem)',
                fontWeight: 900,
                letterSpacing: '0.04em',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              <CheckCircle2 size={14} color="#ffffff" style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: 1.2 }}>{activeCategory.title}</span>
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



          {/* Lista de especialidades / servicios: 100% interactivos y seleccionables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
            {activeCategory.items.map((item) => {
              const ItemIcon = item.icon;
              const isSelected = selectedService?.name === item.name;

              return (
                <div
                  key={item.name}
                  onClick={() => setSelectedService(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                    border: isSelected ? '2px solid #076ABC' : '1.5px solid #D2E3FC',
                    padding: '0.8rem 1rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected
                      ? '0 4px 14px rgba(7, 106, 188, 0.12)'
                      : '0 1px 3px rgba(0, 33, 130, 0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: isSelected ? '#076ABC' : '#EBF3FD',
                        color: isSelected ? '#ffffff' : '#076ABC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.18s ease'
                      }}
                    >
                      <ItemIcon size={18} />
                    </div>

                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: isSelected ? '#002182' : '#1E293B',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.name}
                      <span style={{ fontWeight: 500, color: '#496386', marginLeft: '0.35rem' }}>
                        · {item.detail}
                      </span>
                    </div>
                  </div>

                  {/* Botón rápido de turno directo para este servicio */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBook(item.name);
                    }}
                    style={{
                      background: isSelected ? '#25D366' : '#F0FDF4',
                      color: isSelected ? '#ffffff' : '#15803D',
                      border: isSelected ? '1px solid #16A34A' : '1px solid #BBF7D0',
                      borderRadius: '8px',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(37, 211, 102, 0.25)' : 'none'
                    }}
                    title={`Solicitar turno para ${item.name}`}
                  >
                    <WhatsAppIcon size={13} color={isSelected ? '#ffffff' : '#15803D'} />
                    <span>Turno</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Botón Principal Dinámico: SIEMPRE con el servicio seleccionado */}
          <button
            onClick={() => handleBook(selectedService?.name || activeCategory.items[0].name)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '0.9rem 1.1rem',
              borderRadius: '14px',
              fontSize: '0.96rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              boxShadow: '0 6px 20px rgba(37, 211, 102, 0.3)',
              minHeight: '48px',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 26px rgba(37, 211, 102, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.3)';
            }}
          >
            <WhatsAppIcon size={20} color="#ffffff" style={{ flexShrink: 0 }} />
            <span style={{ textAlign: 'center', lineHeight: 1.25 }}>
              Sacar Turno para {selectedService?.name || activeCategory.items[0].name}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
