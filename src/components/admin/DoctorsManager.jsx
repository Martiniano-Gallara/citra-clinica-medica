import React, { useState, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Users,
  Stethoscope,
  Shield,
  Clock,
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  X,
  Lock,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShieldCheck,
  DollarSign,
  Calendar,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Tag,
  Mail
} from 'lucide-react';
import { generateSecureTempPassword } from '../../utils/cryptoAudit';

export const DoctorsManager = ({ initialTab }) => {
  const {
    doctors = [],
    addDoctor,
    updateDoctor,
    deleteDoctor,
    specialties = [],
    addSpecialty,
    updateSpecialty,
    deleteSpecialty,
    healthInsurances = [],
    addHealthInsurance,
    updateHealthInsurance,
    deleteHealthInsurance,
    users = [],
    addUser,
    updateUser,
    isDoctor
  } = useClinic();

  // --- CABECERA: ESPECIALIDADES & OBRAS SOCIALES (SEPARADAS POR PESTAÑAS) ---
  const determineInitialCabeceraTab = () => {
    if (initialTab === 'services') return 'specialties';
    if (initialTab === 'insurances') return 'insurances';
    if (initialTab === 'staff') return 'adminUsers';
    return 'specialties';
  };

  const [cabeceraTab, setCabeceraTab] = useState(determineInitialCabeceraTab);
  const [isCabeceraCollapsed, setIsCabeceraCollapsed] = useState(false);

  // --- FILTROS DE CUERPO MÉDICO ---
  const [searchDocTerm, setSearchDocTerm] = useState('');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState('all');

  // --- MODAL CUERPO MÉDICO (UNIFICADO: DATOS, HORARIOS, PERMISOS, OBRAS SOCIALES) ---
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorModalTab, setDoctorModalTab] = useState('perfil'); // 'perfil' | 'horarios' | 'acceso' | 'coberturas'

  // Campos del formulario médico
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState(specialties[0]?.name || 'Traumatología');
  const [isCustomDocSpecialty, setIsCustomDocSpecialty] = useState(false);
  const [customDocSpecialty, setCustomDocSpecialty] = useState('');
  const [docPriceConsultation, setDocPriceConsultation] = useState(25000);
  const [docActive, setDocActive] = useState(true);

  // Horarios del médico
  const [docWorkingDays, setDocWorkingDays] = useState(['Lunes', 'Miércoles', 'Viernes']);
  const [docScheduleStart, setDocScheduleStart] = useState('08:30');
  const [docScheduleEnd, setDocScheduleEnd] = useState('17:00');
  const [docSlotDuration, setDocSlotDuration] = useState(30);
  const [docScheduleDisplay, setDocScheduleDisplay] = useState('Consultar en secretaría');

  // Acceso y Permisos del médico
  const [docEmail, setDocEmail] = useState('');
  const [docPassword, setDocPassword] = useState('');
  const [docRole, setDocRole] = useState('Médico / Especialista');

  // Obras sociales aceptadas por el médico
  const [docAcceptedInsurances, setDocAcceptedInsurances] = useState([]);

  // --- MODAL DE CONTRASEÑA RÁPIDA (RESET SECRETARÍA) ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetDoctor, setPasswordTargetDoctor] = useState(null);
  const [quickPasswordValue, setQuickPasswordValue] = useState('');

  // --- MODAL DE ESPECIALIDAD (CABECERA) ---
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [specialtyName, setSpecialtyName] = useState('');
  const [specialtySelectedDocIds, setSpecialtySelectedDocIds] = useState([]);
  const [specialtyDocSearch, setSpecialtyDocSearch] = useState('');

  // --- MODAL DE OBRA SOCIAL (CABECERA) ---
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [insuranceName, setInsuranceName] = useState('');
  const [insuranceCopay, setInsuranceCopay] = useState(0);
  const [insurancePlansInput, setInsurancePlansInput] = useState('');
  const [insuranceStatus, setInsuranceStatus] = useState('Activa');

  // --- MODAL DE USUARIO ADMINISTRATIVO (CABECERA) ---
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffUser, setEditingStaffUser] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('Secretaría / Recepción');
  const [staffPassword, setStaffPassword] = useState('');

  const allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Universal background scroll lock sin mutaciones de estilo conflictivas
  const isAnyModalOpen =
    isDoctorModalOpen ||
    isPasswordModalOpen ||
    isSpecialtyModalOpen ||
    isInsuranceModalOpen ||
    isStaffModalOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
      };
    }
  }, [isAnyModalOpen]);

  // Sincronizar tab de cabecera si el prop cambia
  useEffect(() => {
    if (initialTab === 'services') setCabeceraTab('specialties');
    if (initialTab === 'insurances') setCabeceraTab('insurances');
    if (initialTab === 'staff') setCabeceraTab('adminUsers');
  }, [initialTab]);

  // Helper: Normalizar texto para búsqueda insensible a acentos y mayúsculas
  const normalizeStr = (str) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Helper: Limpiar formatos de hora (ej: "14:00:00" -> "14:00")
  const formatCleanTime = (timeStr, defaultVal = '08:30') => {
    if (!timeStr) return defaultVal;
    const parts = String(timeStr).trim().split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return timeStr;
  };

  // Helper: Formatear días de atención de forma inteligente y limpia (sin puntos suspensivos ficticios)
  const formatDaysSummary = (days) => {
    if (!Array.isArray(days) || days.length === 0) return 'Días a coordinar';
    const dayMap = {
      Lunes: 'Lun',
      Martes: 'Mar',
      Miércoles: 'Mié',
      Miercoles: 'Mié',
      Jueves: 'Jue',
      Viernes: 'Vie',
      Sábado: 'Sáb',
      Sabado: 'Sáb',
      Domingo: 'Dom'
    };

    const norm = days.map((d) => normalizeStr(d));
    const hasMon = norm.some((d) => d.startsWith('lun'));
    const hasTue = norm.some((d) => d.startsWith('mar'));
    const hasWed = norm.some((d) => d.startsWith('mie'));
    const hasThu = norm.some((d) => d.startsWith('jue'));
    const hasFri = norm.some((d) => d.startsWith('vie'));
    const hasSat = norm.some((d) => d.startsWith('sab'));

    if (days.length === 5 && hasMon && hasTue && hasWed && hasThu && hasFri) {
      return 'Lun a Vie';
    }
    if (days.length === 6 && hasMon && hasTue && hasWed && hasThu && hasFri && hasSat) {
      return 'Lun a Sáb';
    }

    const shortDays = days.map((d) => dayMap[d] || d.slice(0, 3));
    if (shortDays.length <= 3) {
      return shortDays.join(', ');
    }
    return `${shortDays.slice(0, 3).join(', ')} +${shortDays.length - 3}`;
  };

  // Helper: Obtener doctores vinculados a una especialidad
  const getDoctorsForSpecialty = (spec) => {
    if (!spec) return [];
    const sName = normalizeStr(spec.name);
    return (doctors || []).filter((d) => {
      if (!d) return false;
      if (d.specialtyId && spec.id && d.specialtyId === spec.id) return true;
      if (Array.isArray(d.specialtyIds) && spec.id && d.specialtyIds.includes(spec.id)) return true;
      const docSpec = normalizeStr(d.specialty);
      const docSpecName = normalizeStr(d.specialtyName);
      if (sName && docSpec && docSpec === sName) return true;
      if (sName && docSpecName && docSpecName === sName) return true;
      return false;
    });
  };

  // Helper: Obtener iniciales profesionales
  const getDoctorInitials = (name) => {
    if (!name) return 'DR';
    const clean = name.replace(/^(Dr\.|Dra\.|Lic\.)\s*/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase() || 'DR';
  };

  // Helper: Encontrar usuario asociado a un doctor
  const getDoctorUser = (doc) => {
    if (!doc) return null;
    return (
      users.find(
        (u) =>
          u.doctorId === doc.id ||
          (u.email && doc.email && normalizeStr(u.email) === normalizeStr(doc.email)) ||
          (u.name && doc.name && normalizeStr(u.name) === normalizeStr(doc.name))
      ) || null
    );
  };

  // Doctores filtrados con búsqueda insensible a acentos
  const filteredDoctors = useMemo(() => {
    const cleanTerm = normalizeStr(searchDocTerm);
    const normSpecFilter = normalizeStr(selectedSpecialtyFilter);

    return doctors.filter((doc) => {
      const docNameNorm = normalizeStr(doc.name);
      const docSpecNorm = normalizeStr(doc.specialty);
      const docSpecNameNorm = normalizeStr(doc.specialtyName);
      const docEmailNorm = normalizeStr(doc.email);

      const matchesSearch =
        cleanTerm === '' ||
        docNameNorm.includes(cleanTerm) ||
        docSpecNorm.includes(cleanTerm) ||
        docSpecNameNorm.includes(cleanTerm) ||
        docEmailNorm.includes(cleanTerm);

      const matchesSpec =
        selectedSpecialtyFilter === 'all' ||
        docSpecNorm === normSpecFilter ||
        docSpecNameNorm === normSpecFilter ||
        doc.specialtyId === selectedSpecialtyFilter;

      return matchesSearch && matchesSpec;
    });
  }, [doctors, searchDocTerm, selectedSpecialtyFilter]);

  // Doctores filtrados para el modal de asignación de especialidades
  const filteredSpecialtyDoctors = useMemo(() => {
    if (!specialtyDocSearch.trim()) return doctors;
    const term = normalizeStr(specialtyDocSearch);
    return doctors.filter(
      (d) =>
        normalizeStr(d.name).includes(term) ||
        normalizeStr(d.specialty).includes(term) ||
        normalizeStr(d.specialtyName).includes(term)
    );
  }, [doctors, specialtyDocSearch]);

  // Cuentas de usuarios administrativos (no médicos)
  const adminUsersList = useMemo(() => {
    return users.filter(
      (u) => u.adminType === 'administrative' || u.adminType === 'superadmin' || !u.doctorId
    );
  }, [users]);

  // --- HANDLERS: CUERPO MÉDICO ---
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorModalTab('perfil');
    setDocName('');
    setDocSpecialty(specialties[0]?.name || 'Traumatología');
    setIsCustomDocSpecialty(false);
    setCustomDocSpecialty('');
    setDocPriceConsultation(25000);
    setDocActive(true);
    setDocWorkingDays(['Lunes', 'Miércoles', 'Viernes']);
    setDocScheduleStart('08:30');
    setDocScheduleEnd('17:00');
    setDocSlotDuration(30);
    setDocScheduleDisplay('Consultar en secretaría');
    setDocEmail('');
    setDocPassword('');
    setDocRole('Médico / Especialista');
    setDocAcceptedInsurances(healthInsurances.map((h) => h.id));
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc) => {
    setEditingDoctor(doc);
    setDoctorModalTab('perfil');
    setDocName(doc.name || '');

    const existingSpec = specialties.find(
      (s) => s.name.toLowerCase() === (doc.specialty || doc.specialtyName || '').toLowerCase()
    );
    if (existingSpec) {
      setDocSpecialty(existingSpec.name);
      setIsCustomDocSpecialty(false);
      setCustomDocSpecialty('');
    } else {
      setIsCustomDocSpecialty(true);
      setCustomDocSpecialty(doc.specialty || doc.specialtyName || '');
      setDocSpecialty(specialties[0]?.name || 'Traumatología');
    }

    setDocPriceConsultation(doc.priceConsultation || 25000);
    setDocActive(doc.active !== false);
    setDocWorkingDays(doc.workingDays || ['Lunes', 'Miércoles', 'Viernes']);
    setDocScheduleStart(doc.scheduleStart || '08:30');
    setDocScheduleEnd(doc.scheduleEnd || '17:00');
    setDocSlotDuration(doc.slotDuration || 30);
    setDocScheduleDisplay(doc.scheduleDisplay || 'Consultar en secretaría');

    const matchedUser = getDoctorUser(doc);
    setDocEmail(matchedUser?.email || doc.email || `${(doc.name || 'doctor').toLowerCase().replace(/[^a-z]/g, '')}@citra.com.ar`);
    setDocPassword(matchedUser?.password || '');
    setDocRole(matchedUser?.role || `Médico ${doc.specialty || 'Profesional'}`);
    setDocAcceptedInsurances(doc.acceptedInsurances || healthInsurances.map((h) => h.id));
    setIsDoctorModalOpen(true);
  };

  const toggleDocWorkingDay = (day) => {
    setDocWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleDocAcceptedInsurance = (insId) => {
    setDocAcceptedInsurances((prev) =>
      prev.includes(insId) ? prev.filter((id) => id !== insId) : [...prev, insId]
    );
  };

  const handleSaveDoctor = (e) => {
    e.preventDefault();
    if (!docName.trim()) {
      addToast('Nombre Requerido', 'Ingrese el nombre del profesional.', 'warning');
      return;
    }

    const finalSpecialty = isCustomDocSpecialty ? customDocSpecialty.trim() : docSpecialty;
    if (!finalSpecialty) return;

    // Verificar si la especialidad existe en el catálogo o crearla
    let matchedSpec = specialties.find(
      (s) => s.name.toLowerCase() === finalSpecialty.toLowerCase()
    );
    if (!matchedSpec) {
      const newSpecId = `esp-${Date.now()}`;
      matchedSpec = {
        id: newSpecId,
        name: finalSpecialty,
        color: '#076ABC',
        category: 'Especialidades',
        defaultDuration: Number(docSlotDuration) || 30
      };
      if (typeof addSpecialty === 'function') {
        addSpecialty(matchedSpec);
      }
    }

    // C-04 y T11: Bloqueo de auto-edición de honorarios y auto-reactivación por parte del médico
    const effectivePrice = isDoctor && editingDoctor
      ? (editingDoctor.priceConsultation || 25000)
      : Number(docPriceConsultation);

    const effectiveActive = isDoctor && editingDoctor
      ? (editingDoctor.active !== false)
      : docActive;

    const payload = {
      name: docName.trim(),
      specialty: finalSpecialty,
      specialtyName: finalSpecialty,
      specialtyId: matchedSpec?.id || 'esp-1',
      priceConsultation: effectivePrice,
      active: effectiveActive,
      workingDays: docWorkingDays,
      scheduleStart: docScheduleStart,
      scheduleEnd: docScheduleEnd,
      slotDuration: Number(docSlotDuration),
      scheduleDisplay: docScheduleDisplay.trim() || undefined,
      email: docEmail.trim(),
      acceptedInsurances: docAcceptedInsurances,
      license: '',
      roomName: ''
    };

    let targetDoctorId = editingDoctor ? editingDoctor.id : null;

    if (editingDoctor) {
      updateDoctor(editingDoctor.id, payload);
    } else {
      const created = addDoctor(payload);
      targetDoctorId = created?.id;
    }

    // Sincronizar cuenta de usuario y contraseña (C-06: sin clave por defecto predecible)
    const cleanEmail = docEmail.trim() || `${docName.toLowerCase().replace(/[^a-z]/g, '')}@citra.com.ar`;
    let cleanPassword = docPassword.trim();
    if (!cleanPassword && !editingDoctor) {
      cleanPassword = generateSecureTempPassword();
      addToast('Clave Temporal Asignada (C-06)', `Contraseña criptográfica provisoria: ${cleanPassword}`, 'info');
    }
    const effectiveDocId = editingDoctor ? editingDoctor.id : targetDoctorId;

    const matchedUser = users.find(
      (u) =>
        (effectiveDocId && u.doctorId === effectiveDocId) ||
        (u.email && u.email.toLowerCase() === cleanEmail.toLowerCase())
    );

    if (matchedUser) {
      updateUser(matchedUser.id, {
        name: docName.trim(),
        email: cleanEmail,
        password: cleanPassword || matchedUser.password,
        role: docRole.trim() || `Médico ${finalSpecialty}`,
        specialty: finalSpecialty,
        doctorId: effectiveDocId,
        status: effectiveActive ? 'Activo' : 'Inactivo'
      });
    } else if (addUser) {
      addUser({
        name: docName.trim(),
        fullName: docName.trim(),
        email: cleanEmail,
        password: cleanPassword,
        role: docRole.trim() || `Médico ${finalSpecialty}`,
        adminType: 'doctor',
        doctorId: effectiveDocId,
        specialty: finalSpecialty,
        status: effectiveActive ? 'Activo' : 'Inactivo'
      });
    }

    addToast(
      editingDoctor ? 'Profesional Actualizado' : 'Profesional Registrado',
      `Ficha, horarios, permisos y accesos de ${docName} guardados con éxito.`,
      'success'
    );

    setIsDoctorModalOpen(false);
  };

  const handleDeleteDoctor = () => {
    if (!editingDoctor) return;
    if (window.confirm(`¿Está seguro de dar de baja al profesional ${editingDoctor.name}?`)) {
      deleteDoctor(editingDoctor.id);
      setIsDoctorModalOpen(false);
    }
  };

  // --- HANDLERS: CONTRASEÑA RÁPIDA ---
  const handleOpenQuickPassword = (doc) => {
    setPasswordTargetDoctor(doc);
    const matched = getDoctorUser(doc);
    setQuickPasswordValue(matched?.password || '');
    setIsPasswordModalOpen(true);
  };

  const handleSaveQuickPassword = (e) => {
    e.preventDefault();
    if (!passwordTargetDoctor) return;
    const newPwd = quickPasswordValue.trim();
    if (!newPwd) {
      addToast('Contraseña Requerida', 'Ingrese la nueva contraseña.', 'warning');
      return;
    }
    const matched = getDoctorUser(passwordTargetDoctor);

    if (matched && typeof updateUser === 'function') {
      updateUser(matched.id, { password: newPwd });
    } else if (typeof addUser === 'function') {
      addUser({
        name: passwordTargetDoctor.name,
        email: passwordTargetDoctor.email || `${passwordTargetDoctor.name.toLowerCase().replace(/[^a-z]/g, '')}@citra.com.ar`,
        password: newPwd,
        adminType: 'doctor',
        doctorId: passwordTargetDoctor.id,
        role: `Médico ${passwordTargetDoctor.specialty || 'Profesional'}`
      });
    }

    if (typeof updateDoctor === 'function') {
      updateDoctor(passwordTargetDoctor.id, { password: newPwd });
    }

    addToast('Contraseña Actualizada', `Nueva clave asignada a ${passwordTargetDoctor.name}.`, 'success');
    setIsPasswordModalOpen(false);
    setPasswordTargetDoctor(null);
  };

  // --- HANDLERS: ESPECIALIDADES EN CABECERA ---
  const handleOpenAddSpecialty = () => {
    setEditingSpecialty(null);
    setSpecialtyName('');
    setSpecialtySelectedDocIds([]);
    setSpecialtyDocSearch('');
    setIsSpecialtyModalOpen(true);
  };

  const handleOpenEditSpecialty = (spec) => {
    if (!spec) return;
    setEditingSpecialty(spec);
    setSpecialtyName(spec.name || '');
    setSpecialtyDocSearch('');
    try {
      const assigned = getDoctorsForSpecialty(spec).map((d) => d.id);
      setSpecialtySelectedDocIds(assigned || []);
    } catch {
      setSpecialtySelectedDocIds([]);
    }
    setIsSpecialtyModalOpen(true);
  };

  const toggleSpecialtyDoc = (docId) => {
    setSpecialtySelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSaveSpecialty = (e) => {
    e.preventDefault();
    const clean = specialtyName.trim();
    if (!clean) return;

    let targetSpecId = editingSpecialty ? editingSpecialty.id : `esp-${Date.now()}`;

    if (editingSpecialty) {
      updateSpecialty(editingSpecialty.id, { name: clean });
    } else {
      addSpecialty({
        id: targetSpecId,
        name: clean,
        color: '#076ABC',
        category: 'Especialidades',
        defaultDuration: 30
      });
    }

    // Vincular / desvincular doctores
    if (typeof updateDoctor === 'function') {
      const oldName = editingSpecialty ? editingSpecialty.name.trim().toLowerCase() : '';
      doctors.forEach((doc) => {
        const isSelected = specialtySelectedDocIds.includes(doc.id);
        const matchesOld =
          doc.specialtyId === targetSpecId ||
          (oldName && (
            (doc.specialty && doc.specialty.trim().toLowerCase() === oldName) ||
            (doc.specialtyName && doc.specialtyName.trim().toLowerCase() === oldName)
          ));

        if (isSelected) {
          updateDoctor(doc.id, {
            specialty: clean,
            specialtyName: clean,
            specialtyId: targetSpecId
          });
        } else if (!isSelected && matchesOld) {
          updateDoctor(doc.id, {
            specialty: 'Medicina General',
            specialtyName: 'Medicina General',
            specialtyId: 'spec-general'
          });
        }
      });
    }

    setIsSpecialtyModalOpen(false);
  };

  const handleDeleteSpecialtyAction = () => {
    if (!editingSpecialty) return;
    if (window.confirm(`¿Está seguro de eliminar la especialidad "${editingSpecialty.name}"?`)) {
      deleteSpecialty(editingSpecialty.id);
      setIsSpecialtyModalOpen(false);
    }
  };

  // --- HANDLERS: OBRAS SOCIALES EN CABECERA ---
  const handleOpenAddInsurance = () => {
    setEditingInsurance(null);
    setInsuranceName('');
    setInsuranceCopay(0);
    setInsurancePlansInput('Planes Generales');
    setInsuranceStatus('Activa');
    setIsInsuranceModalOpen(true);
  };

  const handleOpenEditInsurance = (hi) => {
    setEditingInsurance(hi);
    setInsuranceName(hi.name || '');
    setInsuranceCopay(hi.copay || 0);
    setInsurancePlansInput((hi.plans || []).join(', '));
    setInsuranceStatus(hi.status || 'Activa');
    setIsInsuranceModalOpen(true);
  };

  const handleSaveInsurance = (e) => {
    e.preventDefault();
    const cleanName = insuranceName.trim();
    if (!cleanName) return;

    const plansArray = insurancePlansInput
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const payload = {
      name: cleanName,
      copay: Number(insuranceCopay) || 0,
      plans: plansArray.length > 0 ? plansArray : ['General'],
      status: insuranceStatus
    };

    if (editingInsurance) {
      updateHealthInsurance(editingInsurance.id, payload);
    } else {
      addHealthInsurance(payload);
    }

    setIsInsuranceModalOpen(false);
  };

  const handleDeleteInsuranceAction = () => {
    if (!editingInsurance) return;
    if (window.confirm(`¿Está seguro de eliminar la obra social "${editingInsurance.name}"?`)) {
      deleteHealthInsurance(editingInsurance.id);
      setIsInsuranceModalOpen(false);
    }
  };

  // --- HANDLERS: USUARIOS ADMINISTRATIVOS (CABECERA) ---
  const handleOpenAddStaff = () => {
    setEditingStaffUser(null);
    setStaffName('');
    setStaffEmail('');
    setStaffRole('Secretaría / Recepción');
    setStaffPassword('');
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (user) => {
    setEditingStaffUser(user);
    setStaffName(user.name || '');
    setStaffEmail(user.email || '');
    setStaffRole(user.role || 'Secretaría / Recepción');
    setStaffPassword(user.password || '');
    setIsStaffModalOpen(true);
  };

  const handleSaveStaffUser = (e) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) {
      addToast('Campos Requeridos', 'Ingrese nombre y correo electrónico.', 'warning');
      return;
    }

    const payload = {
      name: staffName.trim(),
      fullName: staffName.trim(),
      email: staffEmail.trim().toLowerCase(),
      role: staffRole.trim(),
      adminType: 'administrative',
      password: staffPassword.trim(),
      status: 'Activo'
    };

    if (editingStaffUser) {
      updateUser(editingStaffUser.id, payload);
      addToast('Usuario Actualizado', `Datos de ${staffName} guardados.`, 'success');
    } else if (addUser) {
      addUser(payload);
      addToast('Usuario Creado', `Cuenta de ${staffName} habilitada.`, 'success');
    }

    setIsStaffModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* ========================================================================= */}
      {/* 1. CABECERA UNIFICADA: ESPECIALIDADES & OBRAS SOCIALES (SEPARADAS POR PESTAÑAS) */}
      {/* ========================================================================= */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #D2E3FC',
          padding: '1.25rem',
          boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Cabecera Top Bar: Título y Selector de Pestañas */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: isCabeceraCollapsed ? 'none' : '1px solid #EDF3FD',
            paddingBottom: isCabeceraCollapsed ? 0 : '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#002182', margin: 0 }}>
                Catálogo Institucional & Prestaciones
              </h2>
              <button
                type="button"
                onClick={() => setIsCabeceraCollapsed(!isCabeceraCollapsed)}
                style={{
                  background: '#F0F5FF',
                  border: '1px solid #D2E3FC',
                  color: '#076ABC',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {isCabeceraCollapsed ? (
                  <>
                    <ChevronDown size={14} /> Ver Catálogo
                  </>
                ) : (
                  <>
                    <ChevronUp size={14} /> Minimizar
                  </>
                )}
              </button>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#496386' }}>
              Gestión centralizada de especialidades médicas, convenios con obras sociales y cuentas administrativas.
            </p>
          </div>

          {/* Pestañas de Cabecera */}
          <div
            style={{
              display: 'flex',
              background: '#F5F8FE',
              padding: '0.3rem',
              borderRadius: '10px',
              border: '1px solid #D2E3FC',
              gap: '0.35rem'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setCabeceraTab('specialties');
                setIsCabeceraCollapsed(false);
              }}
              style={{
                background: cabeceraTab === 'specialties' ? '#002182' : 'transparent',
                color: cabeceraTab === 'specialties' ? '#ffffff' : '#002182',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Stethoscope size={15} />
              Especialidades ({specialties.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setCabeceraTab('insurances');
                setIsCabeceraCollapsed(false);
              }}
              style={{
                background: cabeceraTab === 'insurances' ? '#002182' : 'transparent',
                color: cabeceraTab === 'insurances' ? '#ffffff' : '#002182',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Shield size={15} />
              Obras Sociales ({healthInsurances.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setCabeceraTab('adminUsers');
                setIsCabeceraCollapsed(false);
              }}
              style={{
                background: cabeceraTab === 'adminUsers' ? '#002182' : 'transparent',
                color: cabeceraTab === 'adminUsers' ? '#ffffff' : '#002182',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <UserCheck size={15} />
              Cuentas Secretaría ({adminUsersList.length})
            </button>
          </div>
        </div>

        {/* Contenido Desplegable de la Cabecera */}
        {!isCabeceraCollapsed && (
          <div style={{ marginTop: '1rem' }}>
            {/* SUB-PESTAÑA 1: ESPECIALIDADES MÉDICAS (ULTRA COMPRIMIDAS) */}
            {cabeceraTab === 'specialties' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#076ABC' }}>
                    Catálogo de Especialidades vinculadas con profesionales:
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddSpecialty}
                    style={{
                      background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={15} /> Nueva Especialidad
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))',
                    gap: '0.75rem',
                    maxHeight: '270px',
                    overflowY: 'auto',
                    paddingRight: '0.35rem'
                  }}
                >
                  {specialties.map((spec) => {
                    const assigned = getDoctorsForSpecialty(spec);
                    const count = assigned.length;
                    return (
                      <div
                        key={spec.id}
                        style={{
                          background: '#F9FAFE',
                          borderRadius: '10px',
                          border: '1.5px solid #D2E3FC',
                          padding: '0.75rem 0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.6rem',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 2px 4px rgba(0, 33, 130, 0.02)'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                          }}
                        >
                          <h4
                            style={{
                              margin: 0,
                              fontSize: '0.86rem',
                              fontWeight: 800,
                              color: '#002182',
                              lineHeight: 1.25,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '2.2em'
                            }}
                            title={spec.name}
                          >
                            {spec.name}
                          </h4>
                          <span
                            style={{
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              padding: '0.14rem 0.45rem',
                              borderRadius: '100px',
                              background: count > 0 ? '#EBF3FD' : '#F1F5F9',
                              color: count > 0 ? '#002182' : '#64748B',
                              border: count > 0 ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                              flexShrink: 0,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {count} {count === 1 ? 'profesional' : 'profesionales'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEditSpecialty(spec)}
                          style={{
                            width: '100%',
                            background: '#ffffff',
                            border: '1px solid #D2E3FC',
                            color: '#002182',
                            padding: '0.38rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#076ABC';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#076ABC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.color = '#002182';
                            e.currentTarget.style.borderColor = '#D2E3FC';
                          }}
                        >
                          <Edit2 size={12} />
                          Editar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-PESTAÑA 2: OBRAS SOCIALES & PREPAGAS */}
            {cabeceraTab === 'insurances' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#076ABC' }}>
                    Convenios activos con obras sociales y sistemas de salud:
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddInsurance}
                    style={{
                      background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={15} /> Nueva Obra Social
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))',
                    gap: '0.75rem',
                    maxHeight: '270px',
                    overflowY: 'auto',
                    paddingRight: '0.35rem'
                  }}
                >
                  {healthInsurances.map((hi) => {
                    const docsAccepting = doctors.filter((d) =>
                      (d.acceptedInsurances || []).includes(hi.id)
                    ).length;

                    return (
                      <div
                        key={hi.id}
                        style={{
                          background: '#F9FAFE',
                          borderRadius: '10px',
                          border: '1.5px solid #D2E3FC',
                          padding: '0.75rem 0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.6rem',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 2px 4px rgba(0, 33, 130, 0.02)'
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              marginBottom: '0.35rem'
                            }}
                          >
                            <h4
                              style={{
                                margin: 0,
                                fontSize: '0.88rem',
                                fontWeight: 800,
                                color: '#002182',
                                lineHeight: 1.25,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                minHeight: '2.2em'
                              }}
                              title={hi.name}
                            >
                              {hi.name}
                            </h4>
                            <span
                              style={{
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                padding: '0.12rem 0.45rem',
                                borderRadius: '100px',
                                background: hi.status !== 'Inactiva' ? '#d1fae5' : '#fee2e2',
                                color: hi.status !== 'Inactiva' ? '#065f46' : '#991b1b',
                                flexShrink: 0
                              }}
                            >
                              {hi.status || 'Activa'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.74rem', color: '#496386', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span>
                              <strong>Copago:</strong> {hi.copay > 0 ? `$${hi.copay.toLocaleString('es-AR')}` : 'Sin copago / Directo'}
                            </span>
                            <span>
                              <strong>Atienden:</strong> {docsAccepting} profesionales
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEditInsurance(hi)}
                          style={{
                            width: '100%',
                            background: '#ffffff',
                            border: '1px solid #D2E3FC',
                            color: '#002182',
                            padding: '0.38rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#076ABC';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#076ABC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.color = '#002182';
                            e.currentTarget.style.borderColor = '#D2E3FC';
                          }}
                        >
                          <Shield size={12} />
                          Configurar Cobertura
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-PESTAÑA 3: CUENTAS ADMINISTRATIVAS Y MESA DE ENTRADA */}
            {cabeceraTab === 'adminUsers' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#076ABC' }}>
                    Personal con credenciales administrativas (Recepción / Secretaría / Dirección):
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddStaff}
                    style={{
                      background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={15} /> Nuevo Usuario Administrativo
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '0.85rem',
                    maxHeight: '290px',
                    overflowY: 'auto',
                    paddingRight: '0.35rem'
                  }}
                >
                  {adminUsersList.map((user) => {
                    const initials = (user.name || 'S')
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={user.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '12px',
                          border: '1.5px solid #D2E3FC',
                          padding: '0.85rem 0.95rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.65rem',
                          transition: 'all 0.18s ease',
                          boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.borderColor = '#BFDBFE';
                          e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 33, 130, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = '#D2E3FC';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 33, 130, 0.03)';
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.45rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  flexShrink: 0
                                }}
                              >
                                {initials}
                              </div>
                              <span
                                style={{
                                  fontSize: '0.66rem',
                                  fontWeight: 800,
                                  padding: '0.12rem 0.5rem',
                                  borderRadius: '100px',
                                  background: '#EFF6FF',
                                  color: '#076ABC',
                                  border: '1px solid #BFDBFE'
                                }}
                              >
                                {user.role || 'Secretaría'}
                              </span>
                            </div>
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: '#10B981',
                                display: 'inline-block',
                                flexShrink: 0
                              }}
                              title="Activo"
                            />
                          </div>

                          <h4
                            style={{
                              margin: '0 0 0.2rem',
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              color: '#002182',
                              lineHeight: 1.25,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={user.name}
                          >
                            {user.name}
                          </h4>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.74rem',
                              color: '#64748B'
                            }}
                            title={user.email}
                          >
                            <Mail size={12} color="#7994B8" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user.email}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEditStaff(user)}
                          style={{
                            width: '100%',
                            background: '#F5F8FE',
                            border: '1.5px solid #D2E3FC',
                            color: '#002182',
                            padding: '0.42rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#002182';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#002182';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F5F8FE';
                            e.currentTarget.style.color = '#002182';
                            e.currentTarget.style.borderColor = '#D2E3FC';
                          }}
                        >
                          <KeyRound size={13} />
                          Gestionar Clave / Rol
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. CUERPO MÉDICO: GESTIÓN INTEGRAL DE PROFESIONALES, HORARIOS Y PERMISOS  */}
      {/* ========================================================================= */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #D2E3FC',
          padding: '1.25rem',
          boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
        }}
      >
        {/* Cabecera de Cuerpo Médico con Filtros */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.28rem', fontWeight: 900, color: '#002182', margin: '0 0 0.2rem' }}>
              Cuerpo Médico CITRA ({doctors.length} profesionales)
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#496386' }}>
              Edición unificada de especialidad, horarios semanales, cuenta de acceso y obras sociales habilitadas.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Buscador */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F5F8FE',
                border: '1.5px solid #D2E3FC',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                gap: '0.4rem',
                minWidth: '240px'
              }}
            >
              <Search size={15} color="#076ABC" />
              <input
                type="text"
                value={searchDocTerm}
                onChange={(e) => setSearchDocTerm(e.target.value)}
                placeholder="Buscar médico o especialidad..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.82rem',
                  color: '#002182',
                  width: '100%'
                }}
              />
              {searchDocTerm && (
                <button
                  type="button"
                  onClick={() => setSearchDocTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtro por Especialidad */}
            <select
              value={selectedSpecialtyFilter}
              onChange={(e) => setSelectedSpecialtyFilter(e.target.value)}
              style={{
                background: '#F5F8FE',
                border: '1.5px solid #D2E3FC',
                borderRadius: '8px',
                padding: '0.45rem 0.65rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#002182',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todas las especialidades</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Botón Nuevo Profesional */}
            <button
              onClick={handleOpenAddDoctor}
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
              }}
            >
              <Plus size={16} />
              Nuevo Profesional
            </button>
          </div>
        </div>

        {/* Cuadrícula de Profesionales: Ultra Comprimidas con Información Clave */}
        {filteredDoctors.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
              gap: '0.85rem',
              alignItems: 'stretch'
            }}
          >
            {filteredDoctors.map((doc) => {
              const userObj = getDoctorUser(doc);
              const daysLabel = formatDaysSummary(doc.workingDays);
              const timeLabel = `${formatCleanTime(doc.scheduleStart, '08:30')} a ${formatCleanTime(doc.scheduleEnd, '17:00')} hs`;
              const docEmailDisplay = userObj?.email || doc.email || 'Acceso por configurar';
              const cleanDocName = (doc.name || '')
                .replace(/^Dr\.\s*|^Dra\.\s*|^Lic\.\s*/i, '')
                .trim();
              const initials = cleanDocName
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'DR';

              return (
                <div
                  key={doc.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1.5px solid #D2E3FC',
                    padding: '0.95rem 1rem',
                    boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.65rem',
                    height: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 33, 130, 0.07)';
                    e.currentTarget.style.borderColor = '#BFDBFE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 33, 130, 0.03)';
                    e.currentTarget.style.borderColor = '#D2E3FC';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {/* Fila 1: Avatar, Nombre & Especialidad, y Switch Activo */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(7, 106, 188, 0.2)'
                          }}
                        >
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: '0.94rem',
                              fontWeight: 800,
                              color: '#002182',
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={doc.name}
                          >
                            {doc.name}
                          </h4>
                          <span
                            style={{
                              fontSize: '0.73rem',
                              fontWeight: 700,
                              color: '#076ABC',
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={doc.specialty || doc.specialtyName || 'Especialidad'}
                          >
                            {doc.specialty || doc.specialtyName || 'Especialidad médica'}
                          </span>
                        </div>
                      </div>

                      <span
                        onClick={() => {
                          if (isDoctor) {
                            addToast('Acceso Denegado (T11)', 'Solo la Dirección Administrativa puede modificar la habilitación institucional de un profesional.', 'warning');
                            return;
                          }
                          updateDoctor(doc.id, { active: !doc.active });
                        }}
                        style={{
                          cursor: isDoctor ? 'default' : 'pointer',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          padding: '0.14rem 0.5rem',
                          borderRadius: '100px',
                          background: doc.active !== false ? '#ecfdf5' : '#fee2e2',
                          color: doc.active !== false ? '#065f46' : '#991b1b',
                          border: doc.active !== false ? '1px solid #a7f3d0' : '1px solid #fecaca',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          flexShrink: 0
                        }}
                        title={isDoctor ? 'Habilitación gestionada por Secretaría' : 'Clic para alternar activo/inactivo'}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: doc.active !== false ? '#10b981' : '#ef4444' }} />
                        {doc.active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Fila 2: Resumen Limpio de Horarios & Obras Sociales */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        fontSize: '0.73rem',
                        color: '#496386',
                        background: '#F8FAFE',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '8px',
                        border: '1px solid #EDF3FD'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Clock size={13} color="#076ABC" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {daysLabel} · <span style={{ color: '#496386', fontWeight: 500 }}>{timeLabel}</span>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                          <Shield size={12} color="#076ABC" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: '0.71rem', color: '#002182', fontWeight: 700 }}>
                            {(doc.acceptedInsurances || []).length} O.S. habilitadas
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.7rem',
                            color: '#64748B',
                            maxWidth: '120px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={docEmailDisplay}
                        >
                          <Mail size={11} color="#7994B8" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{docEmailDisplay}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditDoctor(doc)}
                      style={{
                        flex: 1,
                        background: '#F5F8FE',
                        border: '1.5px solid #D2E3FC',
                        color: '#002182',
                        padding: '0.42rem 0.65rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#002182';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = '#002182';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F5F8FE';
                        e.currentTarget.style.color = '#002182';
                        e.currentTarget.style.borderColor = '#D2E3FC';
                      }}
                    >
                      <Edit2 size={13} />
                      Editar Ficha
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenQuickPassword(doc)}
                      style={{
                        background: '#F0F5FF',
                        border: '1.5px solid #D2E3FC',
                        color: '#076ABC',
                        padding: '0.42rem 0.65rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#076ABC';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = '#076ABC';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F0F5FF';
                        e.currentTarget.style.color = '#076ABC';
                        e.currentTarget.style.borderColor = '#D2E3FC';
                      }}
                      title="Resetear o cambiar contraseña de acceso"
                    >
                      <KeyRound size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              background: '#F8FAFE',
              borderRadius: '12px',
              border: '1.5px dashed #D2E3FC'
            }}
          >
            <Users size={36} color="#076ABC" style={{ margin: '0 auto 0.75rem', opacity: 0.7 }} />
            <h4 style={{ margin: '0 0 0.4rem', fontSize: '1rem', fontWeight: 800, color: '#002182' }}>
              No se encontraron profesionales
            </h4>
            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#496386' }}>
              Intente con otro término de búsqueda o seleccione otra especialidad médica.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchDocTerm('');
                setSelectedSpecialtyFilter('all');
              }}
              style={{
                background: '#076ABC',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL UNIFICADO: EDITAR / REGISTRAR PROFESIONAL COMPLETO               */}
      {/* ========================================================================= */}
      {isDoctorModalOpen && (
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
          onClick={() => setIsDoctorModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '92vh',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div
              style={{
                background: '#002182',
                color: '#ffffff',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>
                  {editingDoctor ? `Ficha Integral: ${editingDoctor.name}` : 'Alta de Nuevo Profesional'}
                </h3>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#BFDBFE' }}>
                  Datos clínicos, horarios semanales, credenciales y obras sociales.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDoctorModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Pestañas de Navegación dentro del Modal (Organizado y Cero Abrumador) */}
            <div
              style={{
                display: 'flex',
                background: '#F5F8FE',
                borderBottom: '1.5px solid #D2E3FC',
                padding: '0.4rem 1rem',
                gap: '0.5rem',
                overflowX: 'auto'
              }}
            >
              {[
                { id: 'perfil', label: '1. Perfil & Especialidad', icon: Stethoscope },
                { id: 'horarios', label: '2. Horarios & Días', icon: Clock },
                { id: 'acceso', label: '3. Usuario & Clave', icon: KeyRound },
                { id: 'coberturas', label: '4. Obras Sociales', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDoctorModalTab(tab.id)}
                  style={{
                    background: doctorModalTab === tab.id ? '#002182' : 'transparent',
                    color: doctorModalTab === tab.id ? '#ffffff' : '#002182',
                    border: 'none',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido del Formulario */}
            <form onSubmit={handleSaveDoctor} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                {/* TAB 1: PERFIL & ESPECIALIDAD */}
                {doctorModalTab === 'perfil' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                        Nombre y Apellido del Profesional *
                      </label>
                      <input
                        type="text"
                        required
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="Ej: Dr. Fernando Peralta"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D2E3FC',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#002182', margin: 0 }}>
                          Especialidad Principal *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomDocSpecialty(!isCustomDocSpecialty);
                            if (!isCustomDocSpecialty) setCustomDocSpecialty('');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#076ABC',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline'
                          }}
                        >
                          {isCustomDocSpecialty ? '← Elegir del catálogo' : '+ Nueva especialidad'}
                        </button>
                      </div>

                      {isCustomDocSpecialty ? (
                        <input
                          type="text"
                          required
                          value={customDocSpecialty}
                          onChange={(e) => setCustomDocSpecialty(e.target.value)}
                          placeholder="Escriba nueva especialidad (ej: Flebología, Cardiología...)"
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.75rem',
                            borderRadius: '8px',
                            border: '1.5px solid #076ABC',
                            fontSize: '0.85rem',
                            outline: 'none',
                            background: '#F8FAFE',
                            boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <select
                          value={docSpecialty}
                          onChange={(e) => {
                            if (e.target.value === '__NEW__') {
                              setIsCustomDocSpecialty(true);
                              setCustomDocSpecialty('');
                            } else {
                              setDocSpecialty(e.target.value);
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.75rem',
                            borderRadius: '8px',
                            border: '1.5px solid #D2E3FC',
                            fontSize: '0.85rem',
                            outline: 'none',
                            background: '#ffffff',
                            boxSizing: 'border-box'
                          }}
                        >
                          {specialties.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                          <option value="__NEW__">+ Agregar otra especialidad...</option>
                        </select>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                          Arancel Consulta Particular ($ ARS) {isDoctor && <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal' }}>(Fijado por Administración)</span>}
                        </label>
                        <input
                          type="number"
                          value={docPriceConsultation}
                          onChange={(e) => setDocPriceConsultation(Number(e.target.value))}
                          disabled={isDoctor}
                          placeholder="25000"
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.75rem',
                            borderRadius: '8px',
                            border: '1.5px solid #D2E3FC',
                            fontSize: '0.85rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            background: isDoctor ? '#f1f5f9' : '#fff',
                            cursor: isDoctor ? 'not-allowed' : 'text'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                          Estado en la Clínica {isDoctor && <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal' }}>(Solo Admin)</span>}
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <button
                            type="button"
                            disabled={isDoctor}
                            onClick={() => !isDoctor && setDocActive(true)}
                            style={{
                              flex: 1,
                              background: docActive ? '#d1fae5' : '#F5F8FE',
                              color: docActive ? '#065f46' : '#64748B',
                              border: docActive ? '1.5px solid #10b981' : '1px solid #D2E3FC',
                              padding: '0.55rem',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              cursor: isDoctor ? 'not-allowed' : 'pointer',
                              opacity: isDoctor ? 0.7 : 1
                            }}
                          >
                            Activo
                          </button>
                          <button
                            type="button"
                            disabled={isDoctor}
                            onClick={() => !isDoctor && setDocActive(false)}
                            style={{
                              flex: 1,
                              background: !docActive ? '#fee2e2' : '#F5F8FE',
                              color: !docActive ? '#991b1b' : '#64748B',
                              border: !docActive ? '1.5px solid #ef4444' : '1px solid #D2E3FC',
                              padding: '0.55rem',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              cursor: isDoctor ? 'not-allowed' : 'pointer',
                              opacity: isDoctor ? 0.7 : 1
                            }}
                          >
                            Inactivo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: HORARIOS & DISPONIBILIDAD */}
                {doctorModalTab === 'horarios' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.4rem' }}>
                        Días de Atención Semanal
                      </label>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {allDays.map((d) => {
                          const isSel = docWorkingDays.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleDocWorkingDay(d)}
                              style={{
                                background: isSel ? '#002182' : '#F5F8FE',
                                color: isSel ? '#ffffff' : '#002182',
                                border: isSel ? '1.5px solid #002182' : '1.5px solid #D2E3FC',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                          Hora Inicio
                        </label>
                        <input
                          type="time"
                          value={docScheduleStart}
                          onChange={(e) => setDocScheduleStart(e.target.value)}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                          Hora Fin
                        </label>
                        <input
                          type="time"
                          value={docScheduleEnd}
                          onChange={(e) => setDocScheduleEnd(e.target.value)}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                          Intervalo Turnos
                        </label>
                        <select
                          value={docSlotDuration}
                          onChange={(e) => setDocSlotDuration(Number(e.target.value))}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', background: '#ffffff' }}
                        >
                          <option value={15}>15 min</option>
                          <option value={20}>20 min</option>
                          <option value={30}>30 min</option>
                          <option value={40}>40 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>60 min</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                        Leyenda de Turnos para Pacientes (Opcional)
                      </label>
                      <input
                        type="text"
                        value={docScheduleDisplay}
                        onChange={(e) => setDocScheduleDisplay(e.target.value)}
                        placeholder="Ej: Turnos cada 30 min / Consultar en secretaría"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D2E3FC',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: USUARIO, ACCESO & PERMISOS */}
                {doctorModalTab === 'acceso' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#002182', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={16} color="#076ABC" />
                        Acceso Médico Seguro (Ley 25.326)
                      </span>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#1e40af', lineHeight: 1.4 }}>
                        El médico podrá ingresar al Panel Médico para consultar su agenda de turnos, asentar historias clínicas y emitir recetas electrónicas.
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                        Email Institucional de Ingreso *
                      </label>
                      <input
                        type="email"
                        required
                        value={docEmail}
                        onChange={(e) => setDocEmail(e.target.value)}
                        placeholder="nombre.apellido@citra.com.ar"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D2E3FC',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                        Contraseña de Acceso
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          required
                          value={docPassword}
                          onChange={(e) => setDocPassword(e.target.value)}
                          placeholder="Contraseña institucional..."
                          style={{
                            flex: 1,
                            padding: '0.65rem 0.75rem',
                            borderRadius: '8px',
                            border: '1.5px solid #D2E3FC',
                            fontSize: '0.85rem',
                            outline: 'none',
                            fontFamily: 'monospace'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setDocPassword('Citra_' + Math.random().toString(36).slice(-6) + '!')}
                          style={{
                            background: '#F0F5FF',
                            border: '1px solid #D2E3FC',
                            color: '#076ABC',
                            padding: '0 0.85rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Generar Segura
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                        Rol de Seguridad Asignado
                      </label>
                      <input
                        type="text"
                        value={docRole}
                        onChange={(e) => setDocRole(e.target.value)}
                        placeholder="Médico / Especialista"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D2E3FC',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: OBRAS SOCIALES ACEPTADAS */}
                {doctorModalTab === 'coberturas' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#002182', margin: 0 }}>
                        Coberturas Médicas que atiende este profesional:
                      </label>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => setDocAcceptedInsurances(healthInsurances.map((h) => h.id))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#076ABC',
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Habilitar todas
                        </button>
                        <span style={{ color: '#94a3b8' }}>|</span>
                        <button
                          type="button"
                          onClick={() => setDocAcceptedInsurances(['hi-7'])}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#076ABC',
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Solo Particular
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '0.5rem',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        padding: '0.4rem',
                        background: '#F8FAFE',
                        borderRadius: '10px',
                        border: '1.5px solid #D2E3FC'
                      }}
                    >
                      {healthInsurances.map((hi) => {
                        const isAccepted = docAcceptedInsurances.includes(hi.id);
                        return (
                          <label
                            key={hi.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 0.65rem',
                              borderRadius: '8px',
                              background: isAccepted ? '#EFF6FF' : '#ffffff',
                              border: isAccepted ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: isAccepted ? 800 : 600,
                              color: isAccepted ? '#002182' : '#496386',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isAccepted}
                              onChange={() => toggleDocAcceptedInsurance(hi.id)}
                              style={{ accentColor: '#076ABC', cursor: 'pointer' }}
                            />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {hi.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer con Acciones */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid #EDF3FD',
                  background: '#F8FAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                {editingDoctor ? (
                  <button
                    type="button"
                    onClick={handleDeleteDoctor}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e11d48',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <Trash2 size={14} />
                    Dar de baja
                  </button>
                ) : (
                  <span />
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsDoctorModalOpen(false)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #D2E3FC',
                      color: '#496386',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
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
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.55rem 1.25rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(7, 106, 188, 0.25)'
                    }}
                  >
                    {editingDoctor ? 'Guardar Cambios' : 'Registrar Profesional'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL RÁPIDO: RESET / CAMBIO DE CONTRASEÑA DE ACCESO MÉDICO            */}
      {/* ========================================================================= */}
      {isPasswordModalOpen && passwordTargetDoctor && (
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
          onClick={() => setIsPasswordModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: '#002182',
                color: '#ffffff',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={18} />
                Contraseña de {passwordTargetDoctor.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPassword} style={{ padding: '1.5rem' }}>
              <div
                style={{
                  background: '#F8FAFE',
                  border: '1px solid #D2E3FC',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  marginBottom: '1rem',
                  fontSize: '0.78rem',
                  color: '#496386',
                  lineHeight: 1.4
                }}
              >
                <div>
                  <strong>Usuario de ingreso:</strong>{' '}
                  <span style={{ color: '#002182', fontWeight: 700 }}>
                    {getDoctorUser(passwordTargetDoctor)?.email || passwordTargetDoctor.email || `${passwordTargetDoctor.name.toLowerCase().replace(/[^a-z]/g, '')}@citra.com.ar`}
                  </span>
                </div>
                <div style={{ marginTop: '0.2rem', fontSize: '0.72rem', color: '#64748B' }}>
                  El profesional utilizará esta clave para acceder a su agenda y turnos clínicos.
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                  Nueva Contraseña
                </label>
                <input
                  type="text"
                  required
                  value={quickPasswordValue}
                  onChange={(e) => setQuickPasswordValue(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #D2E3FC',
                    color: '#496386',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
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
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Guardar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL DE ESPECIALIDAD (CABECERA) - REDISEÑO PROFESIONAL               */}
      {/* ========================================================================= */}
      {isSpecialtyModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            overscrollBehavior: 'contain'
          }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onClick={() => setIsSpecialtyModalOpen(false)}
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
            {/* Cabecera Luminosa con Ícono e Información */}
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
                onClick={() => setIsSpecialtyModalOpen(false)}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E2E8F0';
                  e.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F1F5F9';
                  e.currentTarget.style.color = '#64748B';
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSpecialty} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '1.4rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Campo: Nombre de la Especialidad */}
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
                      value={specialtyName}
                      onChange={(e) => setSpecialtyName(e.target.value)}
                      placeholder="Ej: Cirugía de Cadera, Neurología, Traumatología..."
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
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                        background: '#FAFAFC'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#076ABC';
                        e.target.style.boxShadow = '0 0 0 3px rgba(7, 106, 188, 0.12)';
                        e.target.style.background = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#CBD5E1';
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = '#FAFAFC';
                      }}
                    />
                  </div>
                </div>

                {/* Campo: Profesionales Asignados con selección inteligente */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
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
                        {specialtySelectedDocIds.length} de {doctors.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => setSpecialtySelectedDocIds(doctors.map((d) => d.id))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#076ABC',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '0.15rem 0.35rem',
                          borderRadius: '4px'
                        }}
                      >
                        Seleccionar todos
                      </button>
                      <span style={{ color: '#CBD5E1', fontSize: '0.74rem' }}>•</span>
                      <button
                        type="button"
                        onClick={() => setSpecialtySelectedDocIds([])}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '0.15rem 0.35rem',
                          borderRadius: '4px'
                        }}
                      >
                        Ninguno
                      </button>
                    </div>
                  </div>

                  {/* Buscador interno si hay varios profesionales */}
                  {doctors.length > 4 && (
                    <div style={{ position: 'relative', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                      <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        value={specialtyDocSearch}
                        onChange={(e) => setSpecialtyDocSearch(e.target.value)}
                        placeholder="Filtrar por nombre de médico o especialidad..."
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.75rem 0.45rem 2.1rem',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.78rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: '#F8FAFC'
                        }}
                      />
                      {specialtyDocSearch && (
                        <button
                          type="button"
                          onClick={() => setSpecialtyDocSearch('')}
                          style={{
                            position: 'absolute',
                            right: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0
                          }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Lista de médicos estilo tarjetas interactivas */}
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
                    {filteredSpecialtyDoctors.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', fontSize: '0.78rem', color: '#94A3B8' }}>
                        No se encontraron profesionales que coincidan.
                      </div>
                    ) : (
                      filteredSpecialtyDoctors.map((d) => {
                        const isSel = specialtySelectedDocIds.includes(d.id);
                        const initials = getDoctorInitials(d.name);
                        return (
                          <div
                            key={d.id}
                            onClick={() => toggleSpecialtyDoc(d.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '10px',
                              background: isSel ? '#EFF6FF' : '#FFFFFF',
                              border: isSel ? '1.5px solid #93C5FD' : '1px solid #E2E8F0',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: isSel ? '0 2px 5px rgba(7, 106, 188, 0.08)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '6px',
                                  background: isSel ? '#076ABC' : '#FFFFFF',
                                  border: isSel ? 'none' : '1.5px solid #CBD5E1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {isSel && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                              </div>
                              <div
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '8px',
                                  background: isSel ? '#DBEAFE' : '#F1F5F9',
                                  color: isSel ? '#002182' : '#475569',
                                  fontWeight: 800,
                                  fontSize: '0.74rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                {initials}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{
                                  fontSize: '0.84rem',
                                  fontWeight: isSel ? 800 : 700,
                                  color: isSel ? '#002182' : '#1E293B',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {d.name}
                                </div>
                              </div>
                            </div>

                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: isSel ? '#1E40AF' : '#64748B',
                                background: isSel ? '#DBEAFE' : '#F1F5F9',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                marginLeft: '0.5rem'
                              }}
                            >
                              {d.specialty || d.specialtyName || 'Medicina General'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Pie de Acciones */}
              <div
                style={{
                  padding: '1.1rem 1.5rem',
                  borderTop: '1px solid #EDF2F7',
                  background: '#F8FAFC',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                {editingSpecialty ? (
                  <button
                    type="button"
                    onClick={handleDeleteSpecialtyAction}
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FEE2E2';
                      e.currentTarget.style.borderColor = '#FCA5A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FEF2F2';
                      e.currentTarget.style.borderColor = '#FECACA';
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Eliminar</span>
                  </button>
                ) : (
                  <span />
                )}

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsSpecialtyModalOpen(false)}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      color: '#475569',
                      padding: '0.55rem 1.15rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F1F5F9';
                      e.currentTarget.style.borderColor = '#94A3B8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#CBD5E1';
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
                      boxShadow: '0 4px 12px rgba(7, 106, 188, 0.28)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(7, 106, 188, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(7, 106, 188, 0.28)';
                    }}
                  >
                    <Check size={16} />
                    <span>{editingSpecialty ? 'Guardar Cambios' : 'Crear Especialidad'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DE OBRA SOCIAL (CABECERA) - REDISEÑO PROFESIONAL                 */}
      {/* ========================================================================= */}
      {isInsuranceModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            overscrollBehavior: 'contain'
          }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onClick={() => setIsInsuranceModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              boxShadow: '0 25px 60px -15px rgba(0, 33, 130, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera Luminosa con Ícono de Cobertura */}
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
                    background: 'linear-gradient(135deg, #DCFCE7 0%, #E0F2FE 100%)',
                    border: '1px solid #BBF7D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.12)'
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                    {editingInsurance ? 'Configurar Obra Social / Prepaga' : 'Nueva Obra Social / Prepaga'}
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    Defina las condiciones de cobertura, aranceles y planes habilitados.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInsuranceModalOpen(false)}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E2E8F0';
                  e.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F1F5F9';
                  e.currentTarget.style.color = '#64748B';
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveInsurance} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '1.4rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* Nombre de la Cobertura */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                      <Shield size={14} color="#076ABC" />
                      <span>Nombre de la Entidad o Cobertura</span>
                    </label>
                    <span style={{ fontSize: '0.7rem', color: '#076ABC', fontWeight: 700, background: '#EFF6FF', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                      Obligatorio
                    </span>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <ShieldCheck size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.9rem', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      required
                      value={insuranceName}
                      onChange={(e) => setInsuranceName(e.target.value)}
                      placeholder="Ej: OSDE, Swiss Medical, Apross, PAMI..."
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
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                        background: '#FAFAFC'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#076ABC';
                        e.target.style.boxShadow = '0 0 0 3px rgba(7, 106, 188, 0.12)';
                        e.target.style.background = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#CBD5E1';
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = '#FAFAFC';
                      }}
                    />
                  </div>
                </div>

                {/* Dos Columnas: Copago y Estado con botón segmentado */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Copago */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                      <DollarSign size={14} color="#076ABC" />
                      <span>Copago al Paciente</span>
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '0.9rem', color: '#64748B', fontWeight: 700, fontSize: '0.9rem', pointerEvents: 'none' }}>$</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={insuranceCopay}
                        onChange={(e) => setInsuranceCopay(e.target.value)}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem 0.7rem 2.2rem',
                          borderRadius: '12px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: '#0F172A',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: '#FAFAFC'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#076ABC';
                          e.target.style.boxShadow = '0 0 0 3px rgba(7, 106, 188, 0.12)';
                          e.target.style.background = '#FFFFFF';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#CBD5E1';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = '#FAFAFC';
                        }}
                      />
                    </div>
                    <span style={{ display: 'block', fontSize: '0.71rem', color: '#64748B', marginTop: '0.3rem' }}>
                      Monto a abonar en secretaría ($0 = 100% cubierto).
                    </span>
                  </div>

                  {/* Estado con Selector Visual */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                      <Sparkles size={14} color="#076ABC" />
                      <span>Estado del Convenio</span>
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        background: '#F1F5F9',
                        padding: '0.25rem',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        gap: '0.25rem'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setInsuranceStatus('Activa')}
                        style={{
                          flex: 1,
                          padding: '0.48rem 0.5rem',
                          borderRadius: '9px',
                          border: insuranceStatus === 'Activa' ? '1px solid #86EFAC' : 'none',
                          background: insuranceStatus === 'Activa' ? '#DCFCE7' : 'transparent',
                          color: insuranceStatus === 'Activa' ? '#166534' : '#64748B',
                          fontWeight: insuranceStatus === 'Activa' ? 800 : 600,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: insuranceStatus === 'Activa' ? '#16A34A' : '#94A3B8' }} />
                        Activa
                      </button>
                      <button
                        type="button"
                        onClick={() => setInsuranceStatus('Inactiva')}
                        style={{
                          flex: 1,
                          padding: '0.48rem 0.5rem',
                          borderRadius: '9px',
                          border: insuranceStatus === 'Inactiva' ? '1px solid #FCA5A5' : 'none',
                          background: insuranceStatus === 'Inactiva' ? '#FEE2E2' : 'transparent',
                          color: insuranceStatus === 'Inactiva' ? '#991B1B' : '#64748B',
                          fontWeight: insuranceStatus === 'Inactiva' ? 800 : 600,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: insuranceStatus === 'Inactiva' ? '#DC2626' : '#94A3B8' }} />
                        Inactiva
                      </button>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.71rem', color: '#64748B', marginTop: '0.3rem' }}>
                      {insuranceStatus === 'Activa' ? 'Disponible para otorgar turnos.' : 'Pausada temporalmente.'}
                    </span>
                  </div>
                </div>

                {/* Planes Aceptados con Chips Interactivos y Presets */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                      <Layers size={14} color="#076ABC" />
                      <span>Planes de Cobertura Habilitados</span>
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Separar con comas
                    </span>
                  </div>

                  {(() => {
                    const parsedPlans = insurancePlansInput
                      .split(',')
                      .map((p) => p.trim())
                      .filter(Boolean);

                    const removePlan = (planToRemove) => {
                      const updated = parsedPlans.filter((p) => p.toLowerCase() !== planToRemove.toLowerCase());
                      setInsurancePlansInput(updated.join(', '));
                    };

                    const addPlanPreset = (preset) => {
                      if (!parsedPlans.some((p) => p.toLowerCase() === preset.toLowerCase())) {
                        const updated = [...parsedPlans, preset];
                        setInsurancePlansInput(updated.join(', '));
                      }
                    };

                    const presets = ['210', '310', '410', '510', 'Obligatorio', 'Voluntario', 'Particular'];

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {parsedPlans.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', padding: '0.45rem', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                            {parsedPlans.map((plan, idx) => (
                              <span
                                key={idx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  background: '#EFF6FF',
                                  border: '1px solid #BFDBFE',
                                  color: '#1D4ED8',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  padding: '0.22rem 0.55rem',
                                  borderRadius: '8px'
                                }}
                              >
                                {plan}
                                <button
                                  type="button"
                                  onClick={() => removePlan(plan)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#60A5FA',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  title="Quitar plan"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        <input
                          type="text"
                          value={insurancePlansInput}
                          onChange={(e) => setInsurancePlansInput(e.target.value)}
                          placeholder="Ej: 210, 310, 410, Obligatorio..."
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.85rem',
                            borderRadius: '12px',
                            border: '1.5px solid #CBD5E1',
                            fontSize: '0.88rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            background: '#FAFAFC',
                            fontWeight: 600,
                            color: '#0F172A'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#076ABC';
                            e.target.style.boxShadow = '0 0 0 3px rgba(7, 106, 188, 0.12)';
                            e.target.style.background = '#FFFFFF';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#CBD5E1';
                            e.target.style.boxShadow = 'none';
                            e.target.style.background = '#FAFAFC';
                          }}
                        />

                        {/* Atajos rápidos de planes */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Atajos rápidos:</span>
                          {presets.map((preset) => {
                            const alreadyAdded = parsedPlans.some((p) => p.toLowerCase() === preset.toLowerCase());
                            if (alreadyAdded) return null;
                            return (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => addPlanPreset(preset)}
                                style={{
                                  background: '#FFFFFF',
                                  border: '1px solid #D2E3FC',
                                  color: '#076ABC',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.12s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#EFF6FF';
                                  e.currentTarget.style.borderColor = '#076ABC';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#FFFFFF';
                                  e.currentTarget.style.borderColor = '#D2E3FC';
                                }}
                              >
                                + {preset}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Nota de Integración */}
                <div
                  style={{
                    background: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: '12px',
                    padding: '0.75rem 0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.76rem',
                    color: '#0369A1'
                  }}
                >
                  <CheckCircle2 size={16} color="#0284C7" style={{ flexShrink: 0 }} />
                  <span>
                    Los planes definidos aquí estarán disponibles automáticamente para los recepcionistas y médicos en la agenda de turnos.
                  </span>
                </div>
              </div>

              {/* Pie de Acciones */}
              <div
                style={{
                  padding: '1.1rem 1.5rem',
                  borderTop: '1px solid #EDF2F7',
                  background: '#F8FAFC',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                {editingInsurance ? (
                  <button
                    type="button"
                    onClick={handleDeleteInsuranceAction}
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FEE2E2';
                      e.currentTarget.style.borderColor = '#FCA5A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FEF2F2';
                      e.currentTarget.style.borderColor = '#FECACA';
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Eliminar</span>
                  </button>
                ) : (
                  <span />
                )}

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsInsuranceModalOpen(false)}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      color: '#475569',
                      padding: '0.55rem 1.15rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F1F5F9';
                      e.currentTarget.style.borderColor = '#94A3B8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#CBD5E1';
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
                      boxShadow: '0 4px 12px rgba(7, 106, 188, 0.28)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(7, 106, 188, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(7, 106, 188, 0.28)';
                    }}
                  >
                    <Check size={16} />
                    <span>{editingInsurance ? 'Guardar Cambios' : 'Crear Obra Social'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL DE USUARIO ADMINISTRATIVO / SECRETARÍA (CABECERA)                */}
      {/* ========================================================================= */}
      {isStaffModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 33, 130, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            overscrollBehavior: 'contain'
          }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onClick={() => setIsStaffModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 25px 50px -12px rgba(0, 33, 130, 0.35)',
              overflow: 'hidden',
              animation: 'scaleUp 0.18s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Luminous Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
                color: '#ffffff',
                padding: '1.35rem 1.6rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <UserCheck size={20} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800 }}>
                    {editingStaffUser ? 'Editar Cuenta de Secretaría' : 'Nueva Cuenta de Secretaría'}
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#D2E3FC', marginTop: '2px' }}>
                    Credenciales institucionales para gestión de turnos y mesa de entrada
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaffUser} style={{ padding: '1.5rem 1.6rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Ej: Valeria Rossi"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#002182',
                      fontWeight: 600
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                    Email Institucional de Ingreso *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="#7994B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="secretaria@citra.com.ar"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                        borderRadius: '8px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.86rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#002182',
                        fontWeight: 600
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                      Rol Institucional
                    </label>
                    <input
                      type="text"
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      placeholder="Secretaría / Recepción"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.86rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#002182',
                        fontWeight: 600
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                      Contraseña de Acceso
                    </label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={14} color="#7994B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="Contraseña segura..."
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem 0.65rem 2.1rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D2E3FC',
                          fontSize: '0.86rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          color: '#002182',
                          fontWeight: 600
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #EDF3FD' }}>
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.55rem 1.35rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 16px rgba(7, 106, 188, 0.35)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(7, 106, 188, 0.25)')}
                >
                  <Check size={16} />
                  <span>{editingStaffUser ? 'Guardar Cambios' : 'Crear Cuenta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
