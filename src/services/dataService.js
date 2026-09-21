import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Utilitarios bidireccionales de conversión de nomenclatura
 * Permiten que el frontend opere en camelCase estándar de JavaScript
 * y PostgreSQL/Supabase opere en snake_case idiomático sin discrepancias.
 */
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str) {
  return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

export function toSnakeCase(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = camelToSnake(key);
    newObj[newKey] = (value !== null && typeof value === 'object' && !(value instanceof Date))
      ? toSnakeCase(value)
      : value;
  }
  return newObj;
}

export function toCamelCase(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = snakeToCamel(key);
    newObj[newKey] = (value !== null && typeof value === 'object' && !(value instanceof Date))
      ? toCamelCase(value)
      : value;
  }
  return newObj;
}

/**
 * Servicio de datos y persistencia unificado CITRA
 * Sincroniza de forma transparente y reactiva con Supabase Cloud
 * manteniendo compatibilidad de respaldo con el almacenamiento local seguro.
 */
export const dataService = {
  isLive: () => isSupabaseConfigured,

  // --- AUTENTICACIÓN ---
  async signInWithPassword(email, password) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    }
    return null;
  },

  async signUp(email, password, metadata = {}) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: toSnakeCase(metadata) }
      });
      if (error) throw error;
      return data;
    }
    return null;
  },

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  },

  async getSession() {
    if (isSupabaseConfigured && supabase) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    }
    return null;
  },

  async resetPassword(email) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/#admin-login` : undefined
      });
      if (error) throw error;
      return data;
    }
    return null;
  },

  // --- TURNOS (APPOINTMENTS) ---
  async fetchAppointments(filterDoctorId = null) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('appointments').select('*').order('date', { ascending: true });
      if (filterDoctorId) {
        query = query.eq('doctor_id', filterDoctorId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createAppointment(appointmentData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(appointmentData);
      const { data, error } = await supabase
        .from('appointments')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async updateAppointment(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(updates);
      const { data, error } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async deleteAppointment(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    return false;
  },

  // --- HISTORIA CLÍNICA & CONSULTAS (CONSULTATIONS) ---
  async fetchConsultations(patientId = null, doctorId = null) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('consultations').select('*').order('date', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      if (doctorId) query = query.eq('doctor_id', doctorId);
      const { data, error } = await query;
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createConsultation(consultationData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(consultationData);
      const { data, error } = await supabase
        .from('consultations')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async addConsultationAdenda(adendaData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(adendaData);
      const { data, error } = await supabase
        .from('consultation_adendas')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  // --- RECETAS ELECTRÓNICAS (PRESCRIPTIONS) ---
  async fetchPrescriptions(patientId = null, doctorId = null) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('electronic_prescriptions').select('*').order('issue_date', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      if (doctorId) query = query.eq('doctor_id', doctorId);
      const { data, error } = await query;
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createPrescription(prescriptionData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(prescriptionData);
      const { data, error } = await supabase
        .from('electronic_prescriptions')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async updatePrescription(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(updates);
      const { data, error } = await supabase
        .from('electronic_prescriptions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  // --- PACIENTES (PATIENTS) ---
  async fetchPatients() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('patients').select('*').order('name', { ascending: true });
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createPatient(patientData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(patientData);
      const { data, error } = await supabase
        .from('patients')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async updatePatient(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(updates);
      const { data, error } = await supabase
        .from('patients')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  // --- CUERPO MÉDICO (DOCTORS) ---
  async fetchDoctors() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('doctors').select('*').order('name', { ascending: true });
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createDoctor(doctorData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(doctorData);
      const { data, error } = await supabase
        .from('doctors')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async updateDoctor(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(updates);
      const { data, error } = await supabase
        .from('doctors')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async deleteDoctor(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    return false;
  },

  // --- ESPECIALIDADES, CONSULTORIOS Y OBRAS SOCIALES ---
  async fetchSpecialties() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('specialties').select('*').order('name', { ascending: true });
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createSpecialty(specialtyData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(specialtyData);
      const { data, error } = await supabase.from('specialties').insert([payload]).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async updateSpecialty(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(updates);
      const { data, error } = await supabase.from('specialties').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async deleteSpecialty(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('specialties').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    return false;
  },

  async fetchRooms() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('rooms').select('*');
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async fetchHealthInsurances() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('health_insurances').select('*').order('name', { ascending: true });
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async fetchClinicSchedule() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('clinic_schedules').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? toCamelCase(data) : null;
    }
    return null;
  },

  async updateClinicSchedule(scheduleData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(scheduleData);
      const { data, error } = await supabase
        .from('clinic_schedules')
        .upsert([{ id: 'main-schedule', ...payload }])
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  // --- ESTUDIOS RADIOLÓGICOS E IMÁGENES (IMAGING STUDIES) ---
  async fetchImagingStudies(patientId = null, doctorId = null) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('imaging_studies').select('*').order('date', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      if (doctorId) query = query.eq('doctor_id', doctorId);
      const { data, error } = await query;
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createImagingStudy(studyData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(studyData);
      const { data, error } = await supabase.from('imaging_studies').insert([payload]).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async updateImagingStudy(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(updates);
      const { data, error } = await supabase.from('imaging_studies').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  // --- ÓRDENES Y CERTIFICADOS MÉDICOS ---
  async fetchMedicalOrders(patientId = null, doctorId = null) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('medical_orders').select('*').order('date', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      if (doctorId) query = query.eq('doctor_id', doctorId);
      const { data, error } = await query;
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createMedicalOrder(orderData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(orderData);
      const { data, error } = await supabase.from('medical_orders').insert([payload]).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async fetchMedicalCertificates(patientId = null, doctorId = null) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('medical_certificates').select('*').order('date', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      if (doctorId) query = query.eq('doctor_id', doctorId);
      const { data, error } = await query;
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createMedicalCertificate(certData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(certData);
      const { data, error } = await supabase.from('medical_certificates').insert([payload]).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  // --- AUDITORÍA INMUTABLE (AUDIT LOGS - LEY 25.326) ---
  async fetchAuditLogs(limit = 100) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async logAuditEvent(auditLogEntry) {
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = toSnakeCase(auditLogEntry);
        await supabase.from('audit_logs').insert([payload]);
      } catch (err) {
        console.warn('Audit log write error to Supabase', err);
      }
    }
  },

  // --- STORAGE / ARCHIVOS MÉDICOS ---
  async uploadMedicalFile(bucketName, path, file) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.storage.from(bucketName).upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(path);
      return publicUrlData?.publicUrl || null;
    }
    return null;
  },

  // --- REALTIME SUBSCRIPTION HELPER ---
  subscribeToTable(tableName, onInsert = null, onUpdate = null, onDelete = null) {
    if (isSupabaseConfigured && supabase) {
      try {
        const channel = supabase
          .channel(`realtime_${tableName}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: tableName },
            (payload) => {
              if (payload.eventType === 'INSERT' && onInsert) {
                onInsert(toCamelCase(payload.new));
              } else if (payload.eventType === 'UPDATE' && onUpdate) {
                onUpdate(toCamelCase(payload.new));
              } else if (payload.eventType === 'DELETE' && onDelete) {
                onDelete(toCamelCase(payload.old));
              }
            }
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              console.warn(`[CITRA Realtime] Canal ${tableName} en espera de conexión.`);
            }
          });

        return () => {
          try {
            supabase.removeChannel(channel);
          } catch {
            // ignore channel removal error on unmount
          }
        };
      } catch (err) {
        console.warn(`[CITRA Realtime] Error al inicializar suscripción para ${tableName}:`, err);
        return () => {};
      }
    }
    return () => {};
  }
};
