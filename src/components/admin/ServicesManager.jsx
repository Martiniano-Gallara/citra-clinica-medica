import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';

export const ServicesManager = () => {
  const { specialties, addSpecialty, updateSpecialty, deleteSpecialty, doctors } = useClinic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [price, setPrice] = useState(25000);

  const handleOpenAdd = () => {
    setEditingSpecialty(null);
    setName('');
    setDescription('');
    setEstimatedDuration(30);
    setPrice(25000);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (spec) => {
    setEditingSpecialty(spec);
    setName(spec.name);
    setDescription(spec.description || '');
    setEstimatedDuration(spec.estimatedDuration || 30);
    setPrice(spec.price || 25000);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSpecialty) {
      updateSpecialty(editingSpecialty.id, {
        name: name.trim(),
        description: description.trim(),
        estimatedDuration: Number(estimatedDuration),
        price: Number(price)
      });
    } else {
      addSpecialty({
        name: name.trim(),
        description: description.trim(),
        estimatedDuration: Number(estimatedDuration),
        price: Number(price)
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem' }}>
            Gestión de Especialidades y Servicios
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#496386' }}>
            Configuración del catálogo de prestaciones, duraciones estándar y aranceles institucionales.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
          }}
        >
          <Plus size={18} />
          Nueva Especialidad
        </button>
      </div>

      {/* Grid of Specialties */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {specialties.map((spec) => {
          const docCount = doctors.filter((d) => d.specialtyId === spec.id || d.specialty === spec.name).length;
          return (
            <div
              key={spec.id}
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                border: '1.5px solid #D2E3FC',
                padding: '1.5rem',
                boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                    {spec.name}
                  </h3>
                  <span
                    style={{
                      background: '#EBF3FD',
                      color: '#002182',
                      border: '1px solid #257CE6',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '100px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    {docCount} profesionales
                  </span>
                </div>

                <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#496386', lineHeight: 1.5 }}>
                  {spec.description || 'Prestación médica integral con cobertura de obras sociales.'}
                </p>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#002182', fontWeight: 700, background: '#F5F8FE', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #D2E3FC', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} color="#076ABC" />
                    <span>{spec.estimatedDuration || 30} min</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <DollarSign size={14} color="#076ABC" />
                    <span>Particular: ${spec.price ? spec.price.toLocaleString('es-AR') : '25.000'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid #EDF3FD', paddingTop: '1rem' }}>
                <button
                  onClick={() => handleOpenEdit(spec)}
                  style={{
                    flex: 1,
                    background: '#F5F8FE',
                    border: '1px solid #D2E3FC',
                    color: '#002182',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={14} />
                  Editar
                </button>

                <button
                  onClick={() => deleteSpecialty(spec.id)}
                  style={{
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    color: '#e11d48',
                    padding: '0.5rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Specialty */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 33, 130, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: '#002182', color: '#ffffff', padding: '1.5rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {editingSpecialty ? 'Editar Especialidad' : 'Nueva Especialidad Médica'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                  Nombre de la Especialidad / Servicio *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Cirugía de Hombro y Codo"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                  Descripción Clínica
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción de los tratamientos y alcances diagnósticos..."
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Duración Estimada (min)
                  </label>
                  <select
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', background: '#ffffff' }}
                  >
                    <option value={15}>15 minutos</option>
                    <option value={20}>20 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Arancel Particular ($ ARS)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25000"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
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
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                {editingSpecialty ? 'Guardar Cambios' : 'Crear Especialidad'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
