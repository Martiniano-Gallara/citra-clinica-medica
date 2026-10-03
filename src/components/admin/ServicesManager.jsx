import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Plus, X, Trash2, CheckCircle2, UserCheck, Stethoscope, Check, Tag, Users } from 'lucide-react';

export const ServicesManager = () => {
  const {
    specialties,
    addSpecialty,
    updateSpecialty,
    deleteSpecialty,
    doctors,
    updateDoctor
  } = useClinic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [name, setName] = useState('');
  const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);

  // Bloquear el scroll de fondo de toda la ventana cuando se abre el modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
      };
    }
  }, [isModalOpen]);

  // Función robusta para vincular y contar profesionales asignados a cada especialidad
  const getDoctorsForSpecialty = (spec) => {
    const sName = (spec.name || '').trim().toLowerCase();
    return doctors.filter((d) => {
      if (d.specialtyId && d.specialtyId === spec.id) return true;
      if (Array.isArray(d.specialtyIds) && d.specialtyIds.includes(spec.id)) return true;
      const docSpec = (d.specialty || '').trim().toLowerCase();
      const docSpecName = (d.specialtyName || '').trim().toLowerCase();
      if (docSpec && docSpec === sName) return true;
      if (docSpecName && docSpecName === sName) return true;
      if (Array.isArray(d.specialties) && d.specialties.some((s) => (s || '').trim().toLowerCase() === sName)) return true;
      return false;
    });
  };

  const handleOpenAdd = () => {
    setEditingSpecialty(null);
    setName('');
    setSelectedDoctorIds([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (spec) => {
    setEditingSpecialty(spec);
    setName(spec.name);
    const assigned = getDoctorsForSpecialty(spec).map((d) => d.id);
    setSelectedDoctorIds(assigned);
    setIsModalOpen(true);
  };

  const toggleDoctorSelection = (docId) => {
    setSelectedDoctorIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    let targetSpecId = editingSpecialty ? editingSpecialty.id : `esp-${Date.now()}`;

    if (editingSpecialty) {
      updateSpecialty(editingSpecialty.id, {
        name: cleanName
      });
    } else {
      addSpecialty({
        id: targetSpecId,
        name: cleanName,
        color: '#076ABC',
        category: 'Especialidades',
        defaultDuration: 30
      });
    }

    // Vincular / desvincular profesionales seleccionados
    if (typeof updateDoctor === 'function') {
      const oldSpecName = editingSpecialty ? editingSpecialty.name.trim().toLowerCase() : '';
      doctors.forEach((doc) => {
        const isSelected = selectedDoctorIds.includes(doc.id);
        const matchesOld =
          doc.specialtyId === targetSpecId ||
          (oldSpecName && (
            (doc.specialty && doc.specialty.trim().toLowerCase() === oldSpecName) ||
            (doc.specialtyName && doc.specialtyName.trim().toLowerCase() === oldSpecName)
          ));

        if (isSelected) {
          // Asignar esta especialidad al profesional
          updateDoctor(doc.id, {
            specialty: cleanName,
            specialtyName: cleanName,
            specialtyId: targetSpecId
          });
        } else if (!isSelected && matchesOld) {
          // Si fue desvinculado de esta especialidad
          updateDoctor(doc.id, {
            specialty: 'Medicina General',
            specialtyName: 'Medicina General',
            specialtyId: 'spec-general'
          });
        }
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!editingSpecialty) return;
    if (window.confirm(`¿Está seguro de eliminar la especialidad "${editingSpecialty.name}"?`)) {
      deleteSpecialty(editingSpecialty.id);
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem' }}>
            Gestión de Especialidades y Servicios
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#496386' }}>
            Catálogo y vinculación directa con el cuerpo de profesionales médicos de CITRA.
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

      {/* Grid of Specialties: Ultra Comprimidas (Solo nombre, cantidad de profesionales y botón Editar) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.85rem'
        }}
      >
        {specialties.map((spec) => {
          const assignedDocs = getDoctorsForSpecialty(spec);
          const docCount = assignedDocs.length;

          return (
            <div
              key={spec.id}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1.5px solid #D2E3FC',
                padding: '0.85rem 1rem',
                boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '0.35rem'
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.96rem',
                      fontWeight: 800,
                      color: '#002182',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={spec.name}
                  >
                    {spec.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '100px',
                      background: docCount > 0 ? '#EBF3FD' : '#F1F5F9',
                      color: docCount > 0 ? '#002182' : '#64748B',
                      border: docCount > 0 ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                      flexShrink: 0
                    }}
                  >
                    {docCount} {docCount === 1 ? 'profesional' : 'profesionales'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEdit(spec)}
                style={{
                  width: '100%',
                  background: '#F5F8FE',
                  border: '1px solid #D2E3FC',
                  color: '#002182',
                  padding: '0.45rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#076ABC';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F5F8FE';
                  e.currentTarget.style.color = '#002182';
                }}
              >
                Editar
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Editar / Nueva Especialidad */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 33, 130, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            overscrollBehavior: 'contain'
          }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '90vh',
              boxShadow: '0 25px 60px -15px rgba(0, 33, 130, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #EDF2F7',
                background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)',
                    border: '1px solid #BAE6FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#076ABC',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(7, 106, 188, 0.12)'
                  }}
                >
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                    {editingSpecialty ? 'Editar Especialidad Médica' : 'Nueva Especialidad Médica'}
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    Configure la prestación y asigne los profesionales habilitados.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido del Formulario */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '1.4rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Nombre de la especialidad */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                      <Tag size={14} color="#076ABC" />
                      <span>Nombre de la Especialidad</span>
                    </label>
                    <span style={{ fontSize: '0.7rem', color: '#076ABC', fontWeight: 700, background: '#EFF6FF', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                      Obligatorio
                    </span>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Stethoscope size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.9rem', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Traumatología, Cirugía de Rodilla..."
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem 0.7rem 2.45rem',
                        borderRadius: '12px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#0F172A',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: '#FAFAFC'
                      }}
                    />
                  </div>
                </div>

                {/* Vinculación con Profesionales */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Users size={15} color="#076ABC" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                        Profesionales Asignados
                      </span>
                      <span style={{
                        background: '#EFF6FF',
                        color: '#076ABC',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        padding: '0.12rem 0.55rem',
                        borderRadius: '100px',
                        border: '1px solid #BFDBFE'
                      }}>
                        {selectedDoctorIds.length} de {doctors.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedDoctorIds(doctors.map((d) => d.id))}
                        style={{ background: 'none', border: 'none', color: '#076ABC', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', padding: '0.15rem 0.35rem' }}
                      >
                        Todos
                      </button>
                      <span style={{ color: '#CBD5E1', fontSize: '0.74rem' }}>•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedDoctorIds([])}
                        style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', padding: '0.15rem 0.35rem' }}
                      >
                        Ninguno
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '0.5rem',
                      maxHeight: '210px',
                      overflowY: 'auto',
                      background: '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    {doctors.map((doc) => {
                      const isChecked = selectedDoctorIds.includes(doc.id);
                      return (
                        <div
                          key={doc.id}
                          onClick={() => toggleDoctorSelection(doc.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '10px',
                            background: isChecked ? '#EFF6FF' : '#FFFFFF',
                            border: isChecked ? '1.5px solid #93C5FD' : '1px solid #E2E8F0',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '6px',
                                background: isChecked ? '#076ABC' : '#FFFFFF',
                                border: isChecked ? 'none' : '1.5px solid #CBD5E1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {isChecked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: '0.84rem', fontWeight: isChecked ? 800 : 700, color: isChecked ? '#002182' : '#1E293B' }}>
                              {doc.name}
                            </span>
                          </div>

                          <span style={{ fontSize: '0.68rem', color: isChecked ? '#1E40AF' : '#64748B', background: isChecked ? '#DBEAFE' : '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                            {doc.specialty || doc.specialtyName || 'Sin especialidad'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer con acciones */}
              <div
                style={{
                  padding: '1.1rem 1.5rem',
                  borderTop: '1px solid #EDF2F7',
                  background: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                {editingSpecialty ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                ) : (
                  <span />
                )}

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      color: '#475569',
                      padding: '0.55rem 1.15rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.55rem 1.35rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 4px 12px rgba(7, 106, 188, 0.28)'
                    }}
                  >
                    <Check size={16} />
                    <span>{editingSpecialty ? 'Guardar Cambios' : 'Crear'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
