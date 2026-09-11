import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  DoorClosed,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Layers,
  MapPin,
  Stethoscope,
  X,
  Sparkles
} from 'lucide-react';

export const RoomsManager = () => {
  const { rooms, setRooms, doctors, specialties, addToast } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal de alta/edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    floor: 'Piso 1',
    specialty: 'Traumatología',
    status: 'Disponible',
    equipment: 'Camilla ergonómica, escritorio médico, negatoscopio digital'
  });

  const handleOpenNew = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      floor: 'Piso 1',
      specialty: specialties[0]?.name || 'Traumatología',
      status: 'Disponible',
      equipment: 'Camilla ergonómica, escritorio médico, negatoscopio digital'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      floor: room.floor || 'Piso 1',
      specialty: room.specialty || 'Traumatología',
      status: room.status || 'Disponible',
      equipment: room.equipment || 'Camilla ergonómica, escritorio médico'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Nombre requerido', 'Ingresa el nombre o número del consultorio.', 'warning');
      return;
    }

    if (editingRoom) {
      setRooms(
        rooms.map((r) =>
          r.id === editingRoom.id
            ? { ...r, ...formData }
            : r
        )
      );
      addToast('Consultorio actualizado', `Se actualizaron los datos de ${formData.name}`, 'success');
    } else {
      const newRoom = {
        id: `room-${Date.now().toString().slice(-4)}`,
        branchId: 'branch-1',
        ...formData
      };
      setRooms([...rooms, newRoom]);
      addToast('Consultorio creado', `Se ha agregado ${formData.name} al sistema.`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (roomId, roomName) => {
    if (window.confirm(`¿Estás seguro de eliminar ${roomName}?`)) {
      setRooms(rooms.filter((r) => r.id !== roomId));
      addToast('Consultorio eliminado', 'El espacio físico ha sido removido.', 'info');
    }
  };

  const toggleRoomStatus = (roomId) => {
    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          const next = r.status === 'En Consulta' ? 'Disponible' : r.status === 'Disponible' ? 'En Consulta' : 'Disponible';
          return { ...r, status: next };
        }
        return r;
      })
    );
  };

  const filteredRooms = rooms.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.specialty && r.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchFloor = floorFilter === 'all' || r.floor === floorFilter;
    const currentStatus = r.status || 'Disponible';
    const matchStatus = statusFilter === 'all' || currentStatus === statusFilter;
    return matchSearch && matchFloor && matchStatus;
  });

  const totalCount = rooms.length;
  const inConsultCount = rooms.filter((r) => r.status === 'En Consulta').length;
  const availableCount = rooms.filter((r) => (r.status || 'Disponible') === 'Disponible').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.4rem 1.6rem',
            border: '1.5px solid #D2E3FC',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#496386', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TOTAL CONSULTORIOS
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#002182', margin: '0.2rem 0' }}>
              {totalCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#496386' }}>Sede Central Arroyito</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#EBF3FD',
              color: '#076ABC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <DoorClosed size={22} />
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.4rem 1.6rem',
            border: '1.5px solid #D2E3FC',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#496386', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              DISPONIBLES AHORA
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', margin: '0.2rem 0' }}>
              {availableCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#059669' }}>Listos para atención</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#d1fae5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.4rem 1.6rem',
            border: '1.5px solid #D2E3FC',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#496386', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              EN CONSULTA ACTIVA
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#002182', margin: '0.2rem 0' }}>
              {inConsultCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#076ABC' }}>Atención en curso</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#EBF3FD',
              color: '#002182',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Add Button */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          border: '1.5px solid #D2E3FC',
          boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#076ABC' }}
            />
            <input
              type="text"
              placeholder="Buscar por consultorio o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                borderRadius: '12px',
                border: '1.5px solid #D2E3FC',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#F5F8FE'
              }}
            />
          </div>

          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '12px',
              border: '1.5px solid #D2E3FC',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#002182',
              background: '#ffffff',
              outline: 'none'
            }}
          >
            <option value="all">Todos los Pisos</option>
            <option value="PB">Planta Baja (PB)</option>
            <option value="Piso 1">Piso 1</option>
            <option value="Piso 2">Piso 2</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '12px',
              border: '1.5px solid #D2E3FC',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#002182',
              background: '#ffffff',
              outline: 'none'
            }}
          >
            <option value="all">Todos los Estados</option>
            <option value="Disponible">Disponible</option>
            <option value="En Consulta">En Consulta</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <button
          onClick={handleOpenNew}
          style={{
            background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.75rem 1.4rem',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(7, 106, 188, 0.25)'
          }}
        >
          <Plus size={18} />
          <span>Nuevo Consultorio</span>
        </button>
      </div>

      {/* Grid of Rooms */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {filteredRooms.map((room) => {
          const status = room.status || 'Disponible';
          const assignedDoctors = doctors.filter((d) => d.roomId === room.id || (d.specialty === room.specialty && !d.roomId));

          return (
            <div
              key={room.id}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1.5px solid #D2E3FC',
                boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                {/* Header: Room Name & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem' }}>
                      {room.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#496386', fontWeight: 700 }}>
                      <MapPin size={13} color="#076ABC" />
                      <span>{room.floor || 'Piso 1'} — CITRA Arroyito</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleRoomStatus(room.id)}
                    title="Click para alternar estado"
                    style={{
                      background:
                        status === 'Disponible'
                          ? '#d1fae5'
                          : status === 'En Consulta'
                          ? '#EBF3FD'
                          : '#fef3c7',
                      color:
                        status === 'Disponible'
                          ? '#065f46'
                          : status === 'En Consulta'
                          ? '#002182'
                          : '#92400e',
                      border: 'none',
                      borderRadius: '100px',
                      padding: '0.35rem 0.8rem',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background:
                          status === 'Disponible'
                            ? '#10b981'
                            : status === 'En Consulta'
                            ? '#257CE6'
                            : '#f59e0b'
                      }}
                    />
                    {status}
                  </button>
                </div>

                {/* Specialty Tag */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#F5F8FE',
                      border: '1px solid #D2E3FC',
                      color: '#076ABC',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}
                  >
                    <Stethoscope size={13} />
                    {room.specialty || 'General'}
                  </span>
                </div>

                {/* Doctors assigned */}
                <div style={{ background: '#F5F8FE', borderRadius: '12px', padding: '0.75rem 0.9rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#496386', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Profesionales Asignados:
                  </div>
                  {assignedDoctors.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {assignedDoctors.slice(0, 2).map((doc) => (
                        <div key={doc.id} style={{ fontSize: '0.82rem', fontWeight: 700, color: '#002182' }}>
                          • {doc.name} <span style={{ fontSize: '0.75rem', color: '#496386', fontWeight: 500 }}>({doc.schedule || 'L-V'})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#7994B8', fontStyle: 'italic' }}>
                      Sin asignación fija / Consultorio rotativo
                    </div>
                  )}
                </div>

                {/* Equipment */}
                {room.equipment && (
                  <div style={{ fontSize: '0.76rem', color: '#496386', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: '#002182' }}>Equipamiento: </span>
                    {room.equipment}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  borderTop: '1px solid #EDF3FD',
                  paddingTop: '0.85rem'
                }}
              >
                <button
                  onClick={() => handleOpenEdit(room)}
                  style={{
                    background: '#F5F8FE',
                    border: '1.5px solid #D2E3FC',
                    color: '#076ABC',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={13} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(room.id, room.name)}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Eliminar consultorio"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Alta / Edición de Consultorio */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 33, 130, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px rgba(0, 33, 130, 0.25)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#EBF3FD',
                    color: '#076ABC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DoorClosed size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#002182', margin: 0 }}>
                    {editingRoom ? 'Editar Consultorio' : 'Nuevo Consultorio'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#496386' }}>Sede Central CITRA Arroyito</div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#496386' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Nombre o Identificador
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Consultorio 104 — Traumatología"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#F5F8FE'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Piso / Ubicación
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="PB">Planta Baja (PB)</option>
                    <option value="Piso 1">Piso 1</option>
                    <option value="Piso 2">Piso 2</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Especialidad Principal
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    {specialties.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    <option value="General">Polivalente / General</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Estado Inicial
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En Consulta">En Consulta</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Equipamiento y Recursos
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Camilla eléctrica, negatoscopio, ecógrafo portátil..."
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#F5F8FE',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    border: '1.5px solid #D2E3FC',
                    background: '#ffffff',
                    color: '#496386',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.6rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                  }}
                >
                  {editingRoom ? 'Guardar Cambios' : 'Crear Consultorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
