import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  X,
  ExternalLink,
  Lock,
  Stethoscope,
  BadgeCheck,
  LogIn
} from 'lucide-react';

export const UsersManager = () => {
  const {
    users = [],
    updateUser,
    addUser,
    deleteUser,
    switchAdminUser,
    authAdmin,
    addToast
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'superadmin' | 'administrative' | 'doctor'

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    fullName: '',
    email: '',
    role: '',
    specialty: '',
    adminType: 'doctor',
    sisaLicense: '',
    password: 'citra2026'
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPasswordValue, setNewPasswordValue] = useState('citra2026');

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.specialty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.sisaLicense || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (roleFilter === 'all') return true;
      if (roleFilter === 'superadmin') return u.adminType === 'superadmin';
      if (roleFilter === 'administrative') return u.adminType === 'administrative';
      if (roleFilter === 'doctor') return u.adminType === 'doctor';
      return true;
    });
  }, [users, searchTerm, roleFilter]);

  // Metric counts
  const totalUsers = users.length;
  const superadminCount = users.filter((u) => u.adminType === 'superadmin').length;
  const adminCount = users.filter((u) => u.adminType === 'administrative').length;
  const doctorCount = users.filter((u) => u.adminType === 'doctor').length;

  const handleOpenEdit = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (typeof updateUser === 'function') {
      updateUser(editingUser.id, editingUser);
    }
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) {
      if (addToast) addToast('Datos Incompletos', 'Ingrese el nombre y correo institucional.', 'warning');
      return;
    }

    if (typeof addUser === 'function') {
      addUser({
        ...newUserData,
        fullName: newUserData.fullName || newUserData.name,
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
      });
    }

    setIsAddModalOpen(false);
    setNewUserData({
      name: '',
      fullName: '',
      email: '',
      role: '',
      specialty: '',
      adminType: 'doctor',
      sisaLicense: '',
      password: 'citra2026'
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordUser) return;
    if (typeof updateUser === 'function') {
      updateUser(passwordUser.id, { password: newPasswordValue.trim() || 'citra2026' });
    }
    setIsPasswordModalOpen(false);
    setPasswordUser(null);
    if (addToast) addToast('Contraseña Actualizada', `Nueva clave asignada a ${passwordUser.name}.`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* 1. Header institucional */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            Usuarios y Asignación de Roles CITRA
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#496386', maxWidth: '750px', lineHeight: 1.5 }}>
            Gestión de cuentas institucionales del cuerpo médico, mesa de entrada y dirección médica bajo estándares de seguridad y protección de datos médicos (Ley 25.326).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.75rem 1.35rem',
            borderRadius: '12px',
            fontSize: '0.88rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(7, 106, 188, 0.25)',
            transition: 'all 0.15s ease'
          }}
        >
          <Plus size={18} />
          Alta de Nuevo Usuario
        </button>
      </div>

      {/* 2. KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem'
        }}
      >
        <div
          onClick={() => setRoleFilter('all')}
          style={{
            background: roleFilter === 'all' ? '#002182' : '#ffffff',
            color: roleFilter === 'all' ? '#ffffff' : '#002182',
            borderRadius: '14px',
            padding: '1.15rem 1.25rem',
            border: '1.5px solid #D2E3FC',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 33, 130, 0.04)'
          }}
        >
          <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: roleFilter === 'all' ? '#93c5fd' : '#7994B8' }}>
            NÓMINA TOTAL
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, marginTop: '0.25rem' }}>
            {totalUsers} Cuentas
          </div>
          <div style={{ fontSize: '0.72rem', color: roleFilter === 'all' ? '#dbeafe' : '#076ABC', fontWeight: 700, marginTop: '0.2rem' }}>
            Profesionales y staff activos
          </div>
        </div>

        <div
          onClick={() => setRoleFilter('superadmin')}
          style={{
            background: roleFilter === 'superadmin' ? '#002182' : '#ffffff',
            color: roleFilter === 'superadmin' ? '#ffffff' : '#002182',
            borderRadius: '14px',
            padding: '1.15rem 1.25rem',
            border: '1.5px solid #D2E3FC',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 33, 130, 0.04)'
          }}
        >
          <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: roleFilter === 'superadmin' ? '#fbcfe8' : '#9333ea' }}>
            DIRECCIÓN & SUPERADMIN
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, marginTop: '0.25rem' }}>
            {superadminCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: roleFilter === 'superadmin' ? '#fdf2f8' : '#7e22ce', fontWeight: 700, marginTop: '0.2rem' }}>
            Acceso directivo y auditoría total
          </div>
        </div>

        <div
          onClick={() => setRoleFilter('administrative')}
          style={{
            background: roleFilter === 'administrative' ? '#002182' : '#ffffff',
            color: roleFilter === 'administrative' ? '#ffffff' : '#002182',
            borderRadius: '14px',
            padding: '1.15rem 1.25rem',
            border: '1.5px solid #D2E3FC',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 33, 130, 0.04)'
          }}
        >
          <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: roleFilter === 'administrative' ? '#bfdbfe' : '#076ABC' }}>
            RECEPCIÓN & MESA DE ENTRADA
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, marginTop: '0.25rem' }}>
            {adminCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: roleFilter === 'administrative' ? '#eff6ff' : '#0284c7', fontWeight: 700, marginTop: '0.2rem' }}>
            Gestión de turnos, pacientes y caja
          </div>
        </div>

        <div
          onClick={() => setRoleFilter('doctor')}
          style={{
            background: roleFilter === 'doctor' ? '#002182' : '#ffffff',
            color: roleFilter === 'doctor' ? '#ffffff' : '#002182',
            borderRadius: '14px',
            padding: '1.15rem 1.25rem',
            border: '1.5px solid #D2E3FC',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 33, 130, 0.04)'
          }}
        >
          <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: roleFilter === 'doctor' ? '#bbf7d0' : '#059669' }}>
            CUERPO MÉDICO / ESPECIALISTAS
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, marginTop: '0.25rem' }}>
            {doctorCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: roleFilter === 'doctor' ? '#f0fdf4' : '#10b981', fontWeight: 700, marginTop: '0.2rem' }}>
            13 profesionales de la salud
          </div>
        </div>
      </div>

      {/* 3. Search & Quick Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo institucional, rol o especialidad..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '12px',
              border: '1.5px solid #D2E3FC',
              fontSize: '0.88rem',
              outline: 'none',
              background: '#ffffff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'superadmin', label: 'Superadmin' },
            { id: 'administrative', label: 'Recepción' },
            { id: 'doctor', label: 'Médicos (13)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: roleFilter === tab.id ? '1.5px solid #002182' : '1px solid #D2E3FC',
                background: roleFilter === tab.id ? '#002182' : '#ffffff',
                color: roleFilter === tab.id ? '#ffffff' : '#002182',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Table of Users */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #D2E3FC',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0, 33, 130, 0.04)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#F5F8FE', borderBottom: '1.5px solid #D2E3FC', color: '#002182', fontWeight: 800 }}>
                <th style={{ padding: '0.95rem 1.25rem' }}>Usuario Institucional</th>
                <th style={{ padding: '0.95rem 1.25rem' }}>Rol & Especialidad</th>
                <th style={{ padding: '0.95rem 1.25rem' }}>Nivel de Acceso</th>
                <th style={{ padding: '0.95rem 1.25rem' }}>Matrícula / SISA</th>
                <th style={{ padding: '0.95rem 1.25rem' }}>Seguridad</th>
                <th style={{ padding: '0.95rem 1.25rem', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#496386' }}>
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentLogged = authAdmin?.id === u.id;
                  const isSuper = u.adminType === 'superadmin';
                  const isAdmin = u.adminType === 'administrative';
                  const isDoc = u.adminType === 'doctor';

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #EDF3FD',
                        background: isCurrentLogged ? '#F0F6FF' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrentLogged) e.currentTarget.style.background = '#F5F8FE';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrentLogged) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Name & Email */}
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1622253692010?w=100'}
                            alt={u.name}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: isCurrentLogged ? '2px solid #002182' : '1px solid #D2E3FC'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: '#002182', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {u.name}
                              {isCurrentLogged && (
                                <span
                                  style={{
                                    fontSize: '0.66rem',
                                    background: '#002182',
                                    color: '#ffffff',
                                    padding: '0.1rem 0.45rem',
                                    borderRadius: '100px',
                                    fontWeight: 700
                                  }}
                                >
                                  Sesión actual
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#496386', marginTop: '2px' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>
                          {u.role || u.specialty || 'Staff CITRA'}
                        </div>
                        {u.specialty && u.role !== u.specialty && (
                          <div style={{ fontSize: '0.74rem', color: '#076ABC', marginTop: '2px' }}>
                            {u.specialty}
                          </div>
                        )}
                      </td>

                      {/* Access Level Badge */}
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '100px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            background: isSuper ? '#f3e8ff' : isAdmin ? '#e0f2fe' : '#dcfce7',
                            color: isSuper ? '#7e22ce' : isAdmin ? '#0284c7' : '#15803d',
                            border: `1px solid ${isSuper ? '#d8b4fe' : isAdmin ? '#7dd3fc' : '#86efac'}`
                          }}
                        >
                          {isSuper && <ShieldCheck size={13} />}
                          {isAdmin && <Users size={13} />}
                          {isDoc && <Stethoscope size={13} />}
                          {isSuper ? 'Superadmin / Dirección' : isAdmin ? 'Mesa de Entrada' : 'Profesional Médico'}
                        </span>
                      </td>

                      {/* License */}
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                          {u.sisaLicense || '-'}
                        </div>
                      </td>

                      {/* Security / 2FA */}
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#10b981'
                            }}
                          />
                          <span style={{ fontSize: '0.74rem', color: '#065f46', fontWeight: 700 }}>
                            MFA Activo
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          PKI ONTI Digital
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.95rem 1.25rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                          {/* Quick switch to operate as this user */}
                          <button
                            type="button"
                            onClick={() => switchAdminUser(u.id)}
                            title={`Operar el panel como ${u.name}`}
                            style={{
                              background: isCurrentLogged ? '#002182' : '#F5F8FE',
                              border: '1px solid #D2E3FC',
                              color: isCurrentLogged ? '#ffffff' : '#076ABC',
                              padding: '0.45rem 0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <LogIn size={13} />
                            {isCurrentLogged ? 'En uso' : 'Operar'}
                          </button>

                          {/* Edit role and info */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            title="Editar rol y permisos"
                            style={{
                              background: '#ffffff',
                              border: '1px solid #D2E3FC',
                              color: '#334155',
                              padding: '0.45rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Change password */}
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordUser(u);
                              setNewPasswordValue('citra2026');
                              setIsPasswordModalOpen(true);
                            }}
                            title="Gestionar clave de acceso"
                            style={{
                              background: '#ffffff',
                              border: '1px solid #D2E3FC',
                              color: '#64748b',
                              padding: '0.45rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <KeyRound size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Editar Usuario */}
      {isEditModalOpen && editingUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 15, 60, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1.5px solid #D2E3FC'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#002182' }}>
                Editar Rol y Permisos de {editingUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Nombre y Título Profesional
                </label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Correo Institucional
                </label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Nivel de Acceso (RBAC)
                  </label>
                  <select
                    value={editingUser.adminType || 'doctor'}
                    onChange={(e) => setEditingUser({ ...editingUser, adminType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="doctor">Profesional Médico</option>
                    <option value="administrative">Mesa de Entrada / Recepción</option>
                    <option value="superadmin">Dirección / Superadmin</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Matrícula / SISA REFEPS
                  </label>
                  <input
                    type="text"
                    value={editingUser.sisaLicense || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, sisaLicense: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Descripción de Rol Funcional
                </label>
                <input
                  type="text"
                  value={editingUser.role || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#076ABC',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Nuevo Usuario */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 15, 60, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1.5px solid #D2E3FC'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#002182' }}>
                Alta de Nuevo Usuario Institucional
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Nombre y Título (Ej: Dr. Juan Pérez / Lic. Ana Gómez)
                </label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Dr. / Lic. / Nombre..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Correo Institucional (@citra.com.ar)
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="usuario@citra.com.ar"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Nivel de Acceso (RBAC)
                  </label>
                  <select
                    value={newUserData.adminType}
                    onChange={(e) => setNewUserData({ ...newUserData, adminType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="doctor">Profesional Médico</option>
                    <option value="administrative">Mesa de Entrada / Recepción</option>
                    <option value="superadmin">Dirección / Superadmin</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Matrícula / SISA REFEPS
                  </label>
                  <input
                    type="text"
                    value={newUserData.sisaLicense}
                    onChange={(e) => setNewUserData({ ...newUserData, sisaLicense: e.target.value })}
                    placeholder="REFEPS-MP-XXXXX"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Rol / Especialidad Clínica
                </label>
                <input
                  type="text"
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value, specialty: e.target.value })}
                  placeholder="Ej: Kinesiología, Traumatología, etc."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Contraseña Inicial de Acceso
                </label>
                <input
                  type="text"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#076ABC',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Dar de Alta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal Gestionar Contraseña */}
      {isPasswordModalOpen && passwordUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 15, 60, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1.5px solid #D2E3FC'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#002182' }}>
                Nueva Clave para {passwordUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
                Ingrese la nueva contraseña provisoria o definitiva para el acceso administrativo institucional.
              </p>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Contraseña
                </label>
                <input
                  type="text"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#076ABC',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Actualizar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
