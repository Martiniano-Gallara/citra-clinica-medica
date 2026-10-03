-- ====================================================================
-- CITRA · Centro Integral de Traumatología & Rehabilitación Arroyito
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- Aislamiento estricto de datos en backend PostgreSQL / Supabase
-- Cumplimiento: Ley 26.529, Ley 25.506, Ley 27.553, Ley 25.326
-- ====================================================================

-- 1. Habilitar RLS en absolutamente todas las tablas del sistema
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_adendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE electronic_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rehab_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rehab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;

-- 2. Funciones de Ayuda (Helper Functions) ejecutadas con SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
    SELECT (public.get_auth_role() = 'superadmin' OR auth.jwt() ->> 'email' = 'dr.blanco@citra.com.ar');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE OR REPLACE FUNCTION public.is_administrative()
RETURNS BOOLEAN AS $$
    SELECT (public.get_auth_role() IN ('administrative', 'superadmin') OR auth.jwt() ->> 'email' = 'dr.blanco@citra.com.ar');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS BOOLEAN AS $$
    SELECT (
        public.get_auth_role() IN ('doctor', 'superadmin')
        AND EXISTS (
            SELECT 1 FROM public.doctors d
            JOIN public.profiles p ON p.id = d.user_id
            WHERE d.user_id = auth.uid()
              AND p.role IN ('doctor', 'superadmin')
              AND p.is_active = TRUE
              AND d.is_active = TRUE
        )
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE OR REPLACE FUNCTION public.get_current_doctor_id()
RETURNS VARCHAR AS $$
    SELECT d.id
    FROM public.doctors d
    JOIN public.profiles p ON p.id = d.user_id
    WHERE d.user_id = auth.uid()
      AND p.role IN ('doctor', 'superadmin')
      AND p.is_active = TRUE
      AND d.is_active = TRUE
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE OR REPLACE FUNCTION public.get_current_patient_id()
RETURNS VARCHAR AS $$
    SELECT p.id
    FROM public.patients p
    JOIN public.profiles pr ON pr.id = p.user_id
    WHERE p.user_id = auth.uid()
      AND pr.role = 'patient'
      AND pr.is_active = TRUE
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE OR REPLACE FUNCTION public.doctor_treats_patient(p_patient_id VARCHAR, p_doctor_id VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    IF p_doctor_id IS NULL OR p_patient_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.appointments
        WHERE patient_id = p_patient_id
          AND doctor_id = p_doctor_id
          AND status != 'cancelado'
    ) OR EXISTS (
        SELECT 1 FROM public.consultations
        WHERE patient_id = p_patient_id
          AND doctor_id = p_doctor_id
    ) OR EXISTS (
        SELECT 1 FROM public.patients
        WHERE id = p_patient_id
          AND p_doctor_id = ANY(assigned_doctor_ids)
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

-- T16: Prevención de oráculo en funciones internas (acceso exclusivo para usuarios autenticados)
REVOKE EXECUTE ON FUNCTION public.get_auth_role() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_superadmin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_administrative() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_doctor() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_current_doctor_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_current_patient_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.doctor_treats_patient(VARCHAR, VARCHAR) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.doctor_treats_patient(VARCHAR, VARCHAR) TO authenticated;

CREATE OR REPLACE VIEW public.public_doctors AS
SELECT 
    id,
    name,
    specialty_id,
    specialty_name,
    room_id,
    room_name,
    working_days,
    schedule_start,
    schedule_end,
    slot_duration,
    accepted_insurances,
    experience,
    bio,
    avatar_url,
    is_active
FROM public.doctors
WHERE is_active = true;

GRANT SELECT ON public.public_doctors TO anon, authenticated;

-- ====================================================================
-- 3. POLÍTICAS PARA PROFILES
-- ====================================================================
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (id = auth.uid() OR public.is_administrative());

DROP POLICY IF EXISTS "profiles_update_self_policy" ON profiles;
CREATE POLICY "profiles_update_self_policy" ON profiles
FOR UPDATE USING (id = auth.uid() OR public.is_superadmin())
WITH CHECK ((id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid())) OR public.is_superadmin());

-- ====================================================================
-- 4. POLÍTICAS PARA DOCTORS
-- ====================================================================
DROP POLICY IF EXISTS "doctors_public_select" ON doctors;
CREATE POLICY "doctors_public_select" ON doctors
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "doctors_update_self" ON doctors;
CREATE POLICY "doctors_update_self" ON doctors
FOR UPDATE USING (user_id = auth.uid() OR public.is_administrative());

DROP POLICY IF EXISTS "doctors_admin_insert" ON doctors;
CREATE POLICY "doctors_admin_insert" ON doctors
FOR INSERT WITH CHECK (public.is_administrative());

DROP POLICY IF EXISTS "doctors_admin_delete" ON doctors;
CREATE POLICY "doctors_admin_delete" ON doctors
FOR DELETE USING (public.is_superadmin());

-- ====================================================================
-- 5. POLÍTICAS PARA PATIENTS
-- ====================================================================
DROP POLICY IF EXISTS "patients_select_policy" ON patients;
CREATE POLICY "patients_select_policy" ON patients
FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_administrative()
    OR (public.is_doctor() AND public.doctor_treats_patient(patients.id, public.get_current_doctor_id()))
);

DROP POLICY IF EXISTS "patients_update_policy" ON patients;
CREATE POLICY "patients_update_policy" ON patients
FOR UPDATE USING (user_id = auth.uid() OR public.is_administrative());

DROP POLICY IF EXISTS "patients_insert_policy" ON patients;
CREATE POLICY "patients_insert_policy" ON patients
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR public.is_administrative());

DROP POLICY IF EXISTS "patients_delete_policy" ON patients;
CREATE POLICY "patients_delete_policy" ON patients
FOR DELETE USING (public.is_administrative() OR public.is_superadmin());

-- ====================================================================
-- 6. POLÍTICAS PARA APPOINTMENTS (TURNOS)
-- ====================================================================
DROP POLICY IF EXISTS "appointments_select_policy" ON appointments;
CREATE POLICY "appointments_select_policy" ON appointments
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

DROP POLICY IF EXISTS "appointments_insert_policy" ON appointments;
CREATE POLICY "appointments_insert_policy" ON appointments
FOR INSERT WITH CHECK (
    patient_id = public.get_current_patient_id()
    OR public.is_administrative()
    OR auth.role() = 'anon'
);

DROP POLICY IF EXISTS "appointments_update_policy" ON appointments;
CREATE POLICY "appointments_update_policy" ON appointments
FOR UPDATE USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
) WITH CHECK (
    (patient_id = public.get_current_patient_id() AND status = 'cancelado')
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

DROP POLICY IF EXISTS "appointments_delete_policy" ON appointments;
CREATE POLICY "appointments_delete_policy" ON appointments
FOR DELETE USING (public.is_administrative() OR public.is_superadmin());

-- ====================================================================
-- 7. POLÍTICAS PARA CONSULTATIONS (HCE - LEY 26.529)
-- ====================================================================
DROP POLICY IF EXISTS "consultations_select_policy" ON consultations;
CREATE POLICY "consultations_select_policy" ON consultations
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_superadmin()
);

DROP POLICY IF EXISTS "consultations_insert_policy" ON consultations;
CREATE POLICY "consultations_insert_policy" ON consultations
FOR INSERT WITH CHECK (
    public.is_doctor()
    AND doctor_id = public.get_current_doctor_id()
    AND public.doctor_treats_patient(patient_id, doctor_id)
);

-- Inmutabilidad legal: No se definen políticas de UPDATE ni DELETE para consultations.

-- ====================================================================
-- 8. POLÍTICAS PARA ADENDAS CLÍNICAS
-- ====================================================================
DROP POLICY IF EXISTS "adendas_select_policy" ON consultation_adendas;
CREATE POLICY "adendas_select_policy" ON consultation_adendas
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM consultations c
        WHERE c.id = consultation_adendas.consultation_id
        AND (c.patient_id = public.get_current_patient_id() OR c.doctor_id = public.get_current_doctor_id() OR public.is_superadmin())
    )
);

DROP POLICY IF EXISTS "adendas_insert_policy" ON consultation_adendas;
CREATE POLICY "adendas_insert_policy" ON consultation_adendas
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

-- ====================================================================
-- 9. POLÍTICAS PARA RECETAS ELECTRÓNICAS (RENAPDIS - LEY 27.553)
-- ====================================================================
DROP POLICY IF EXISTS "prescriptions_select_policy" ON electronic_prescriptions;
CREATE POLICY "prescriptions_select_policy" ON electronic_prescriptions
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

DROP POLICY IF EXISTS "prescriptions_insert_policy" ON electronic_prescriptions;
CREATE POLICY "prescriptions_insert_policy" ON electronic_prescriptions
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

DROP POLICY IF EXISTS "prescriptions_update_policy" ON electronic_prescriptions;
DROP POLICY IF EXISTS "prescriptions_annul_policy" ON electronic_prescriptions;
CREATE POLICY "prescriptions_update_policy" ON electronic_prescriptions
FOR UPDATE USING (
    doctor_id = public.get_current_doctor_id() OR public.is_administrative()
) WITH CHECK (
    status IN ('dispensada', 'anulada') AND (doctor_id = public.get_current_doctor_id() OR public.is_administrative())
);

-- ====================================================================
-- 10. POLÍTICAS PARA DIAGNÓSTICO POR IMÁGENES
-- ====================================================================
DROP POLICY IF EXISTS "imaging_select_policy" ON imaging_studies;
CREATE POLICY "imaging_select_policy" ON imaging_studies
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

DROP POLICY IF EXISTS "imaging_insert_policy" ON imaging_studies;
CREATE POLICY "imaging_insert_policy" ON imaging_studies
FOR INSERT WITH CHECK (
    public.is_doctor() OR public.is_administrative()
);

DROP POLICY IF EXISTS "imaging_update_policy" ON imaging_studies;
CREATE POLICY "imaging_update_policy" ON imaging_studies
FOR UPDATE USING (
    public.is_administrative() OR doctor_id = public.get_current_doctor_id()
);

-- ====================================================================
-- 11. POLÍTICAS PARA ÓRDENES Y CERTIFICADOS
-- ====================================================================
DROP POLICY IF EXISTS "orders_select_policy" ON medical_orders;
CREATE POLICY "orders_select_policy" ON medical_orders
FOR SELECT USING (
    patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative()
);

DROP POLICY IF EXISTS "orders_insert_policy" ON medical_orders;
CREATE POLICY "orders_insert_policy" ON medical_orders
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

DROP POLICY IF EXISTS "certificates_select_policy" ON medical_certificates;
CREATE POLICY "certificates_select_policy" ON medical_certificates
FOR SELECT USING (
    patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative()
);

DROP POLICY IF EXISTS "certificates_insert_policy" ON medical_certificates;
CREATE POLICY "certificates_insert_policy" ON medical_certificates
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

-- ====================================================================
-- 12. POLÍTICAS PARA CONSENTIMIENTOS INFORMADOS
-- ====================================================================
DROP POLICY IF EXISTS "consent_select_policy" ON consent_forms;
DROP POLICY IF EXISTS "consent_forms_select_policy" ON consent_forms;
CREATE POLICY "consent_forms_select_policy" ON consent_forms
FOR SELECT USING (
    patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative()
);

DROP POLICY IF EXISTS "consent_insert_policy" ON consent_forms;
DROP POLICY IF EXISTS "consent_forms_insert_policy" ON consent_forms;
CREATE POLICY "consent_forms_insert_policy" ON consent_forms
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

DROP POLICY IF EXISTS "consent_update_policy" ON consent_forms;
DROP POLICY IF EXISTS "consent_forms_update_policy" ON consent_forms;
CREATE POLICY "consent_forms_update_policy" ON consent_forms
FOR UPDATE USING (
    doctor_id = public.get_current_doctor_id()
    OR patient_id = public.get_current_patient_id()
    OR public.is_superadmin()
);

-- ====================================================================
-- 13. POLÍTICAS PARA PLANES Y SESIONES DE REHABILITACIÓN (C05, T8)
-- ====================================================================
DROP POLICY IF EXISTS "rehab_plans_all_policy" ON rehab_plans;
DROP POLICY IF EXISTS "rehab_all_policy" ON rehab_plans;
DROP POLICY IF EXISTS "rehab_plans_select_policy" ON rehab_plans;
DROP POLICY IF EXISTS "rehab_select_policy" ON rehab_plans;
DROP POLICY IF EXISTS "rehab_plans_insert_policy" ON rehab_plans;
DROP POLICY IF EXISTS "rehab_plans_update_policy" ON rehab_plans;
DROP POLICY IF EXISTS "rehab_plans_delete_policy" ON rehab_plans;

CREATE POLICY "rehab_plans_select_policy" ON rehab_plans
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR public.is_doctor()
    OR public.is_administrative()
);

CREATE POLICY "rehab_plans_insert_policy" ON rehab_plans
FOR INSERT WITH CHECK (
    public.is_doctor()
    AND doctor_id = public.get_current_doctor_id()
    AND public.doctor_treats_patient(patient_id, doctor_id)
);

CREATE POLICY "rehab_plans_update_policy" ON rehab_plans
FOR UPDATE USING (
    (public.is_doctor() AND doctor_id = public.get_current_doctor_id())
    OR public.is_superadmin()
) WITH CHECK (
    (public.is_doctor() AND doctor_id = public.get_current_doctor_id())
    OR public.is_superadmin()
);

-- T8: Solo el kinesiólogo/médico asignado al plan o el superadmin pueden eliminarlo
CREATE POLICY "rehab_plans_delete_policy" ON rehab_plans
FOR DELETE USING (
    (public.is_doctor() AND doctor_id = public.get_current_doctor_id())
    OR public.is_superadmin()
);

-- Políticas para Sesiones de Rehabilitación (C05, T8)
DROP POLICY IF EXISTS "rehab_sessions_select_policy" ON rehab_sessions;
CREATE POLICY "rehab_sessions_select_policy" ON rehab_sessions
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR public.is_doctor()
    OR public.is_administrative()
);

DROP POLICY IF EXISTS "rehab_sessions_insert_policy" ON rehab_sessions;
CREATE POLICY "rehab_sessions_insert_policy" ON rehab_sessions
FOR INSERT WITH CHECK (
    (public.is_doctor() AND therapist_id = public.get_current_doctor_id())
    OR public.is_superadmin()
);

DROP POLICY IF EXISTS "rehab_sessions_update_policy" ON rehab_sessions;
CREATE POLICY "rehab_sessions_update_policy" ON rehab_sessions
FOR UPDATE USING (
    (public.is_doctor() AND therapist_id = public.get_current_doctor_id())
    OR public.is_superadmin()
);

DROP POLICY IF EXISTS "rehab_sessions_delete_policy" ON rehab_sessions;
CREATE POLICY "rehab_sessions_delete_policy" ON rehab_sessions
FOR DELETE USING (
    (public.is_doctor() AND therapist_id = public.get_current_doctor_id())
    OR public.is_superadmin()
);

-- ====================================================================
-- 14. POLÍTICAS PARA AUDIT LOGS
-- ====================================================================
DROP POLICY IF EXISTS "audit_logs_select_policy" ON audit_logs;
CREATE POLICY "audit_logs_select_policy" ON audit_logs
FOR SELECT USING (public.is_superadmin());

DROP POLICY IF EXISTS "audit_logs_insert_policy" ON audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON audit_logs
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()::text)
);

-- ====================================================================
-- 15. TABLAS PÚBLICAS Y DE CONFIGURACIÓN GENERAL
-- ====================================================================
DROP POLICY IF EXISTS "specialties_public_select" ON specialties;
CREATE POLICY "specialties_public_select" ON specialties FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "specialties_admin_all" ON specialties;
CREATE POLICY "specialties_admin_all" ON specialties FOR ALL USING (public.is_administrative());

DROP POLICY IF EXISTS "rooms_public_select" ON rooms;
CREATE POLICY "rooms_public_select" ON rooms FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "rooms_admin_all" ON rooms;
CREATE POLICY "rooms_admin_all" ON rooms FOR ALL USING (public.is_administrative());

DROP POLICY IF EXISTS "insurances_public_select" ON health_insurances;
DROP POLICY IF EXISTS "health_insurances_public_select" ON health_insurances;
CREATE POLICY "health_insurances_public_select" ON health_insurances FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "insurances_admin_all" ON health_insurances;
CREATE POLICY "insurances_admin_all" ON health_insurances FOR ALL USING (public.is_administrative());

DROP POLICY IF EXISTS "schedules_public_select" ON clinic_schedules;
CREATE POLICY "schedules_public_select" ON clinic_schedules FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "schedules_admin_all" ON clinic_schedules;
CREATE POLICY "schedules_admin_all" ON clinic_schedules FOR ALL USING (public.is_administrative());

DROP POLICY IF EXISTS "clinic_settings_select_policy" ON clinic_settings;
CREATE POLICY "clinic_settings_select_policy" ON clinic_settings FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "clinic_settings_admin_all" ON clinic_settings;
CREATE POLICY "clinic_settings_admin_all" ON clinic_settings FOR ALL USING (public.is_administrative());

-- ALTA-02: Políticas granulares para caja y facturación
DROP POLICY IF EXISTS "cash_shifts_admin_all" ON cash_shifts;
CREATE POLICY "cash_shifts_select_policy" ON cash_shifts FOR SELECT USING (public.is_administrative());
CREATE POLICY "cash_shifts_insert_policy" ON cash_shifts FOR INSERT WITH CHECK (public.is_administrative());
CREATE POLICY "cash_shifts_update_policy" ON cash_shifts FOR UPDATE USING (public.is_administrative());
CREATE POLICY "cash_shifts_delete_policy" ON cash_shifts FOR DELETE USING (public.is_superadmin());

DROP POLICY IF EXISTS "cash_movements_admin_all" ON cash_movements;
CREATE POLICY "cash_movements_select_policy" ON cash_movements FOR SELECT USING (public.is_administrative());
CREATE POLICY "cash_movements_insert_policy" ON cash_movements FOR INSERT WITH CHECK (public.is_administrative());
CREATE POLICY "cash_movements_update_policy" ON cash_movements FOR UPDATE USING (public.is_superadmin());
CREATE POLICY "cash_movements_delete_policy" ON cash_movements FOR DELETE USING (public.is_superadmin());

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_admin_all" ON invoices;
DROP POLICY IF EXISTS "invoices_select_policy" ON invoices;
CREATE POLICY "invoices_select_policy" ON invoices FOR SELECT USING (patient_id = public.get_current_patient_id() OR public.is_administrative());
CREATE POLICY "invoices_insert_policy" ON invoices FOR INSERT WITH CHECK (public.is_administrative());
CREATE POLICY "invoices_update_policy" ON invoices FOR UPDATE USING (public.is_superadmin());
-- Inmutabilidad fiscal: Las facturas emitidas no tienen DELETE permitido para ningún rol (se anulan con nota de crédito)
