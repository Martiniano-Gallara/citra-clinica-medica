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
      // Explicit column mapping to avoid PGRST204 errors with non-existent columns
      const cleanPayload = {
        id: appointmentData.id,
        patient_id: appointmentData.patientId,
        patient_name: appointmentData.patientName,
        patient_dni: appointmentData.patientDni,
        patient_phone: appointmentData.patientPhone || null,
        patient_email: appointmentData.patientEmail || null,
        patient_insurance: appointmentData.patientInsurance || appointmentData.insuranceName || null,
        patient_insurance_number: appointmentData.patientInsuranceNumber || appointmentData.insuranceNumber || null,
        doctor_id: appointmentData.doctorId,
        doctor_name: appointmentData.doctorName,
        doctor_specialty: appointmentData.doctorSpecialty || appointmentData.specialtyName || appointmentData.specialty || '',
        room_id: appointmentData.roomId || null,
        room_name: appointmentData.roomName || null,
        date: appointmentData.date,
        time: appointmentData.time,
        duration: appointmentData.duration || 30,
        type: appointmentData.type || 'Consulta Presencial',
        status: (appointmentData.status || 'confirmado').toLowerCase(),
        reason: appointmentData.reason || appointmentData.notes || null,
        cancel_reason: appointmentData.cancelReason || null,
        copay_amount: appointmentData.copayAmount !== undefined ? appointmentData.copayAmount : (appointmentData.copay || 0),
        booked_online: Boolean(appointmentData.bookedOnline),
        booking_code: appointmentData.bookingCode || null
      };
      Object.keys(cleanPayload).forEach(key => cleanPayload[key] === undefined && delete cleanPayload[key]);

      const { data, error } = await supabase
        .from('appointments')
        .insert([cleanPayload])
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async updateAppointment(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const allowedKeys = [
        'patient_id', 'patient_name', 'patient_dni', 'patient_phone', 'patient_email',
        'patient_insurance', 'patient_insurance_number', 'doctor_id', 'doctor_name',
        'doctor_specialty', 'room_id', 'room_name', 'date', 'time', 'duration',
        'type', 'status', 'reason', 'cancel_reason', 'copay_amount', 'booked_online',
        'booking_code', 'updated_at'
      ];
      const rawPayload = toSnakeCase(updates);
      const cleanPayload = {};
      for (const [k, v] of Object.entries(rawPayload)) {
        if (allowedKeys.includes(k) && v !== undefined) {
          cleanPayload[k] = v;
        }
      }
      if (updates.specialtyName && !cleanPayload.doctor_specialty) cleanPayload.doctor_specialty = updates.specialtyName;
      if (updates.insuranceName && !cleanPayload.patient_insurance) cleanPayload.patient_insurance = updates.insuranceName;
      if (updates.notes && !cleanPayload.reason) cleanPayload.reason = updates.notes;
      if (cleanPayload.status) cleanPayload.status = cleanPayload.status.toLowerCase();

      cleanPayload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .update(cleanPayload)
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
      let query = supabase
        .from('consultations')
        .select('*, adendas:consultation_adendas(*)')
        .order('date', { ascending: false });
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
      // Excluir adendas de la tabla principal para evitar error de columna inexistente
      const { adendas, ...cleanData } = consultationData;
      const payload = toSnakeCase(cleanData);
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

  // Bundle transaccional atómico RPC: Consulta + Receta + Pedidos Diagnósticos
  async createConsultationBundle(consultationData, prescriptionData = null, medicalOrders = null) {
    if (isSupabaseConfigured && supabase) {
      const { adendas, ...cleanConsultation } = consultationData;
      const { data, error } = await supabase.rpc('create_consultation_bundle', {
        p_consultation: toSnakeCase(cleanConsultation),
        p_prescription: prescriptionData ? toSnakeCase(prescriptionData) : null,
        p_medical_orders: medicalOrders ? toSnakeCase(medicalOrders) : null
      });
      if (error) {
        // Fallback a inserción secuencial si el RPC aún no fue desplegado en la instancia
        return await this.createConsultation(consultationData);
      }
      return data;
    }
    return null;
  },

  async addConsultationAdenda(adendaData) {
    if (isSupabaseConfigured && supabase) {
      const payload = {
        id: adendaData.id,
        consultation_id: adendaData.consultationId,
        doctor_id: adendaData.doctorId || 'doc-1',
        doctor_name: adendaData.doctorName,
        doctor_license: adendaData.doctorLicense || null,
        note: adendaData.adendaText || adendaData.note || '',
        reason: adendaData.reason || 'Aclaración clínica',
        timestamp: adendaData.timestamp || new Date().toISOString(),
        integrity_hash: adendaData.adendaHash || adendaData.integrityHash || ''
      };
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
      const payload = {
        id: prescriptionData.id,
        cuir: prescriptionData.cuir,
        patient_id: prescriptionData.patientId,
        patient_name: prescriptionData.patientName,
        patient_dni: prescriptionData.patientDni,
        doctor_id: prescriptionData.doctorId,
        doctor_name: prescriptionData.doctorName,
        doctor_license: prescriptionData.doctorLicense,
        sisa_refeps: prescriptionData.sisaRefeps || 'REFEPS-MN-114829',
        diagnosis_presuntivo: prescriptionData.diagnosisPresuntivo || 'Control clínico',
        medications: prescriptionData.medications || [],
        issue_date: prescriptionData.issueDate || new Date().toISOString().split('T')[0],
        expiration_date: prescriptionData.expirationDate,
        status: prescriptionData.status || (prescriptionData.dispensationStatus?.toLowerCase().includes('dispensada') ? 'dispensada' : 'activa'),
        verification_url: prescriptionData.verificationUrl || `https://citra.com.ar/receta/${prescriptionData.cuir}`
      };
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
      const payload = {};
      if (updates.status) payload.status = updates.status;
      if (updates.dispensationStatus) {
        payload.status = updates.dispensationStatus.toLowerCase().includes('dispensada') ? 'dispensada' : 'activa';
      }
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

  async createRoom(roomData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(roomData);
      const { data, error } = await supabase.from('rooms').insert([payload]).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async updateRoom(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(updates);
      const { data, error } = await supabase.from('rooms').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async deleteRoom(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    return false;
  },

  async fetchHealthInsurances() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('health_insurances').select('*').order('name', { ascending: true });
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createHealthInsurance(insuranceData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(insuranceData);
      const { data, error } = await supabase.from('health_insurances').insert([payload]).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async updateHealthInsurance(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(updates);
      const { data, error } = await supabase.from('health_insurances').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async deleteHealthInsurance(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('health_insurances').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    return false;
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
      // Map frontend status 'Informado' to valid DB enum 'completado'
      if (payload.status === 'informado' || payload.status === 'Informado') {
        payload.status = 'completado';
      }
      const { data, error } = await supabase.from('imaging_studies').insert([payload]).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async updateImagingStudy(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(updates);
      if (payload.status === 'informado' || payload.status === 'Informado') {
        payload.status = 'completado';
      }
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

  // --- CONSENTIMIENTOS INFORMADOS (CONSENT FORMS) ---
  async fetchConsentForms(patientId = null, doctorId = null) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('consent_forms').select('*').order('created_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      if (doctorId) query = query.eq('doctor_id', doctorId);
      const { data, error } = await query;
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async createConsentForm(consentData) {
    if (isSupabaseConfigured && supabase) {
      const payload = toSnakeCase(consentData);
      const { data, error } = await supabase.from('consent_forms').insert([payload]).select().single();
      if (error) throw error;
      return toCamelCase(data);
    }
    return null;
  },

  async revokeConsentForm(id, reason) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('consent_forms')
        .update({
          status: 'revoked',
          revocation_reason: reason,
          revoked_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
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
          .subscribe();

        return () => {
          try {
            supabase.removeChannel(channel);
          } catch {
            // ignore channel removal error on unmount
          }
        };
      } catch {
        return () => {};
      }
    }
    return () => {};
  }
};
