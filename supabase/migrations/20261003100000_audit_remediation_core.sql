-- ====================================================================
-- CITRA - MIGRACIÓN OFICIAL DE REMEDIACIÓN DE AUDITORÍA (OCTUBRE 2026)
-- Resuelve: CRIT-01, CRIT-02, ALTA-01, ALTA-02, ALTA-03, ALTA-05, ALTA-07, ALTA-09
-- ====================================================================

-- 1. CRIT-01 & CRIT-02: INMUTABILIDAD ASISTENCIAL (Ley 26.529 Art. 18)
-- Se agregan columnas de baja lógica y cancelación
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ DEFAULT NULL;

-- Cambiar FK de borrado en cascada a RESTRICT
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE RESTRICT;

ALTER TABLE public.imaging_studies DROP CONSTRAINT IF EXISTS imaging_studies_patient_id_fkey;
ALTER TABLE public.imaging_studies ADD CONSTRAINT imaging_studies_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;

ALTER TABLE public.medical_orders DROP CONSTRAINT IF EXISTS medical_orders_patient_id_fkey;
ALTER TABLE public.medical_orders ADD CONSTRAINT medical_orders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;

ALTER TABLE public.medical_certificates DROP CONSTRAINT IF EXISTS medical_certificates_patient_id_fkey;
ALTER TABLE public.medical_certificates ADD CONSTRAINT medical_certificates_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;

-- Trigger prevent_medical_record_hard_delete
CREATE OR REPLACE FUNCTION public.prevent_medical_record_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Operación denegada por Ley 26.529 (Art. 18): Los registros asistenciales, historias clínicas, turnos y pacientes tienen obligación legal de conservación por 15 años y no admiten borrado físico. Utilice baja lógica o cancelación.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_no_hard_delete_patients ON public.patients;
CREATE TRIGGER trg_no_hard_delete_patients BEFORE DELETE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.prevent_medical_record_hard_delete();

DROP TRIGGER IF EXISTS trg_no_hard_delete_doctors ON public.doctors;
CREATE TRIGGER trg_no_hard_delete_doctors BEFORE DELETE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.prevent_medical_record_hard_delete();

DROP TRIGGER IF EXISTS trg_no_hard_delete_appointments ON public.appointments;
CREATE TRIGGER trg_no_hard_delete_appointments BEFORE DELETE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.prevent_medical_record_hard_delete();

DROP TRIGGER IF EXISTS trg_no_hard_delete_consultations ON public.consultations;
CREATE TRIGGER trg_no_hard_delete_consultations BEFORE DELETE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.prevent_medical_record_hard_delete();

DROP TRIGGER IF EXISTS trg_no_hard_delete_prescriptions ON public.electronic_prescriptions;
CREATE TRIGGER trg_no_hard_delete_prescriptions BEFORE DELETE ON public.electronic_prescriptions FOR EACH ROW EXECUTE FUNCTION public.prevent_medical_record_hard_delete();

DROP TRIGGER IF EXISTS trg_no_hard_delete_imaging ON public.imaging_studies;
CREATE TRIGGER trg_no_hard_delete_imaging BEFORE DELETE ON public.imaging_studies FOR EACH ROW EXECUTE FUNCTION public.prevent_medical_record_hard_delete();

DROP TRIGGER IF EXISTS trg_no_hard_delete_rehab_plans ON public.rehab_plans;
CREATE TRIGGER trg_no_hard_delete_rehab_plans BEFORE DELETE ON public.rehab_plans FOR EACH ROW EXECUTE FUNCTION public.prevent_medical_record_hard_delete();

DROP TRIGGER IF EXISTS trg_no_hard_delete_rehab_sessions ON public.rehab_sessions;
CREATE TRIGGER trg_no_hard_delete_rehab_sessions BEFORE DELETE ON public.rehab_sessions FOR EACH ROW EXECUTE FUNCTION public.prevent_medical_record_hard_delete();

-- Eliminar políticas de DELETE físico
DROP POLICY IF EXISTS "patients_delete_policy" ON public.patients;
DROP POLICY IF EXISTS "doctors_admin_delete" ON public.doctors;
DROP POLICY IF EXISTS "appointments_delete_policy" ON public.appointments;


-- 2. ALTA-01: AUDIT_LOGS DEFAULTS & RPCS
ALTER TABLE public.audit_logs ALTER COLUMN id SET DEFAULT ('aud-' || gen_random_uuid()::text);
ALTER TABLE public.audit_logs ALTER COLUMN event_hash SET DEFAULT encode(digest(gen_random_uuid()::text, 'sha256'), 'hex');


-- 3. ALTA-02: POLÍTICAS GRANULARES EN CAJA Y FACTURACIÓN
DROP POLICY IF EXISTS "cash_shifts_admin_all" ON public.cash_shifts;
CREATE POLICY "cash_shifts_select_policy" ON public.cash_shifts FOR SELECT USING (public.is_administrative());
CREATE POLICY "cash_shifts_insert_policy" ON public.cash_shifts FOR INSERT WITH CHECK (public.is_administrative());
CREATE POLICY "cash_shifts_update_policy" ON public.cash_shifts FOR UPDATE USING (public.is_administrative());
CREATE POLICY "cash_shifts_delete_policy" ON public.cash_shifts FOR DELETE USING (public.is_superadmin());

DROP POLICY IF EXISTS "cash_movements_admin_all" ON public.cash_movements;
CREATE POLICY "cash_movements_select_policy" ON public.cash_movements FOR SELECT USING (public.is_administrative());
CREATE POLICY "cash_movements_insert_policy" ON public.cash_movements FOR INSERT WITH CHECK (public.is_administrative());
CREATE POLICY "cash_movements_update_policy" ON public.cash_movements FOR UPDATE USING (public.is_superadmin());
CREATE POLICY "cash_movements_delete_policy" ON public.cash_movements FOR DELETE USING (public.is_superadmin());

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_admin_all" ON public.invoices;
DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;
CREATE POLICY "invoices_select_policy" ON public.invoices FOR SELECT USING (patient_id = public.get_current_patient_id() OR public.is_administrative());
CREATE POLICY "invoices_insert_policy" ON public.invoices FOR INSERT WITH CHECK (public.is_administrative());
CREATE POLICY "invoices_update_policy" ON public.invoices FOR UPDATE USING (public.is_superadmin());


-- 4. ALTA-03: CONTROL DE INTERCONSULTAS Y PERMISOS CLÍNICOS
DROP POLICY IF EXISTS "access_grants_insert_policy" ON public.clinical_access_grants;
CREATE POLICY "access_grants_insert_policy" ON public.clinical_access_grants
FOR INSERT WITH CHECK (
    public.is_doctor() AND requester_doctor_id = public.get_current_doctor_id() AND status = 'pending'
);

CREATE OR REPLACE FUNCTION public.force_clinical_access_grant_pending()
RETURNS TRIGGER AS $$
BEGIN
    NEW.status := 'pending';
    NEW.approved_at := NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_force_access_grant_pending ON public.clinical_access_grants;
CREATE TRIGGER trg_force_access_grant_pending
BEFORE INSERT ON public.clinical_access_grants
FOR EACH ROW EXECUTE FUNCTION public.force_clinical_access_grant_pending();

DROP POLICY IF EXISTS "access_grants_update_policy" ON public.clinical_access_grants;
CREATE POLICY "access_grants_update_policy" ON public.clinical_access_grants
FOR UPDATE USING (
    target_doctor_id = public.get_current_doctor_id() OR public.is_superadmin()
) WITH CHECK (
    target_doctor_id = public.get_current_doctor_id() OR public.is_superadmin()
);


-- 5. ALTA-05: CORRECCIÓN DEL TRIGGER PROTECT_PATIENT_FIELDS CON COLUMNAS REALES
CREATE OR REPLACE FUNCTION public.protect_patient_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF public.get_auth_role() = 'patient' THEN
        IF NEW.dni IS DISTINCT FROM OLD.dni
           OR NEW.name IS DISTINCT FROM OLD.name
           OR NEW.birth_date IS DISTINCT FROM OLD.birth_date
           OR NEW.gender IS DISTINCT FROM OLD.gender
           OR NEW.blood_type IS DISTINCT FROM OLD.blood_type
           OR NEW.allergies IS DISTINCT FROM OLD.allergies
           OR NEW.chronic_conditions IS DISTINCT FROM OLD.chronic_conditions
           OR NEW.insurance_id IS DISTINCT FROM OLD.insurance_id
           OR NEW.insurance_name IS DISTINCT FROM OLD.insurance_name
           OR NEW.insurance_plan IS DISTINCT FROM OLD.insurance_plan
           OR NEW.insurance_number IS DISTINCT FROM OLD.insurance_number
           OR NEW.is_active IS DISTINCT FROM OLD.is_active
           OR NEW.assigned_doctor_ids IS DISTINCT FROM OLD.assigned_doctor_ids
        THEN
            RAISE EXCEPTION 'Operación denegada (T4): Los pacientes solo pueden actualizar sus canales de contacto (teléfono, correo, domicilio y contacto de emergencia).';
        END IF;
    END IF;

    IF NOT public.is_administrative() THEN
        IF NEW.dni IS DISTINCT FROM OLD.dni THEN
            RAISE EXCEPTION 'Operación denegada: El DNI del paciente no puede ser modificado por usuarios sin rol administrativo.';
        END IF;
        IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
            RAISE EXCEPTION 'Operación denegada: La vinculación de cuenta de usuario es inmutable.';
        END IF;
    END IF;

    IF public.is_administrative() AND NOT public.is_doctor() AND NOT public.is_superadmin() THEN
        IF NEW.blood_type IS DISTINCT FROM OLD.blood_type
           OR NEW.allergies IS DISTINCT FROM OLD.allergies
           OR NEW.chronic_conditions IS DISTINCT FROM OLD.chronic_conditions
        THEN
            RAISE EXCEPTION 'Operación denegada: Los antecedentes médicos (grupo sanguíneo, alergias y patologías crónicas) solo pueden ser modificados por profesionales médicos habilitados.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_protect_patient_fields ON public.patients;
CREATE TRIGGER trg_protect_patient_fields
BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.protect_patient_fields();


-- 6. ALTA-07: RESERVA PÚBLICA SEGURA (SECURITY DEFINER)
DROP POLICY IF EXISTS "appointments_insert_policy" ON public.appointments;
CREATE POLICY "appointments_insert_policy" ON public.appointments FOR INSERT WITH CHECK (
    patient_id = public.get_current_patient_id() OR public.is_administrative()
);

CREATE OR REPLACE FUNCTION public.create_public_booking(
    p_booking JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_patient_id VARCHAR;
    v_clean_dni VARCHAR;
    v_doctor_id VARCHAR;
    v_doctor_name VARCHAR;
    v_doctor_specialty VARCHAR;
    v_date DATE;
    v_time TIME;
    v_app_id VARCHAR;
    v_booking_code VARCHAR;
    v_collision_count INT;
BEGIN
    v_clean_dni := regexp_replace(COALESCE(p_booking->>'patient_dni', ''), '\D', '', 'g');
    IF length(v_clean_dni) < 6 THEN
        RAISE EXCEPTION 'DNI inválido para reserva de turno.';
    END IF;

    v_doctor_id := p_booking->>'doctor_id';
    SELECT id, name, specialty_name INTO v_doctor_id, v_doctor_name, v_doctor_specialty
    FROM public.doctors
    WHERE id = v_doctor_id AND is_active = TRUE;

    IF v_doctor_id IS NULL THEN
        RAISE EXCEPTION 'El profesional solicitado no se encuentra activo o disponible.';
    END IF;

    v_date := (p_booking->>'date')::date;
    v_time := (p_booking->>'time')::time;

    -- Validar colisión de turno activo
    SELECT count(*) INTO v_collision_count
    FROM public.appointments
    WHERE doctor_id = v_doctor_id
      AND date = v_date
      AND time = v_time
      AND status != 'cancelado';

    IF v_collision_count > 0 THEN
        RAISE EXCEPTION 'El profesional ya cuenta con un turno reservado para la fecha y horario seleccionados.';
    END IF;

    -- Buscar o crear paciente en padrón
    SELECT id INTO v_patient_id
    FROM public.patients
    WHERE regexp_replace(dni, '\D', '', 'g') = v_clean_dni
    LIMIT 1;

    IF v_patient_id IS NULL THEN
        v_patient_id := 'pat-' || floor(extract(epoch from now()) * 1000)::text;
        INSERT INTO public.patients (
            id, name, dni, email, phone, insurance_name, insurance_number, registered_at
        ) VALUES (
            v_patient_id,
            COALESCE(p_booking->>'patient_name', 'Paciente Portal'),
            p_booking->>'patient_dni',
            p_booking->>'patient_email',
            p_booking->>'patient_phone',
            COALESCE(p_booking->>'patient_insurance', 'Particular'),
            p_booking->>'patient_insurance_number',
            CURRENT_DATE
        );
    END IF;

    v_app_id := 'app-' || floor(extract(epoch from now()) * 1000)::text;
    v_booking_code := 'CITRA-' || floor(10000 + random() * 90000)::text;

    INSERT INTO public.appointments (
        id, patient_id, patient_name, patient_dni, patient_phone, patient_email,
        patient_insurance, patient_insurance_number, doctor_id, doctor_name,
        doctor_specialty, date, time, duration, type, status, reason,
        copay_amount, booked_online, booking_code
    ) VALUES (
        v_app_id,
        v_patient_id,
        COALESCE(p_booking->>'patient_name', 'Paciente Portal'),
        p_booking->>'patient_dni',
        p_booking->>'patient_phone',
        p_booking->>'patient_email',
        COALESCE(p_booking->>'patient_insurance', 'Particular'),
        p_booking->>'patient_insurance_number',
        v_doctor_id,
        v_doctor_name,
        v_doctor_specialty,
        v_date,
        v_time,
        COALESCE((p_booking->>'duration')::int, 30),
        'Consulta Presencial',
        'confirmado',
        COALESCE(p_booking->>'reason', 'Reserva online de turno'),
        COALESCE((p_booking->>'copay_amount')::numeric, 0),
        TRUE,
        v_booking_code
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'appointment_id', v_app_id,
        'booking_code', v_booking_code,
        'patient_id', v_patient_id,
        'date', v_date,
        'time', v_time,
        'doctor_name', v_doctor_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

GRANT EXECUTE ON FUNCTION public.create_public_booking(JSONB) TO anon, authenticated;


-- 7. ALTA-09: STORAGE PRIVADO DE ARCHIVOS MÉDICOS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'medical_records',
    'medical_records',
    FALSE,
    52428800,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/dicom']
)
ON CONFLICT (id) DO UPDATE SET public = FALSE;

DROP POLICY IF EXISTS "medical_records_read_policy" ON storage.objects;
CREATE POLICY "medical_records_read_policy" ON storage.objects
FOR SELECT USING (
    bucket_id = 'medical_records' AND (
        public.is_administrative() OR
        public.is_doctor() OR
        (auth.uid() IS NOT NULL AND auth.uid()::text = (storage.foldername(name))[1])
    )
);

DROP POLICY IF EXISTS "medical_records_insert_policy" ON storage.objects;
CREATE POLICY "medical_records_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'medical_records' AND (
        public.is_administrative() OR
        public.is_doctor() OR
        (auth.uid() IS NOT NULL AND auth.uid()::text = (storage.foldername(name))[1])
    )
);
