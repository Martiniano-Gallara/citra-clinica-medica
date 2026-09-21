-- ====================================================================
-- CITRA · Centro Integral de Traumatología & Rehabilitación Arroyito
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- Aislamiento estricto de datos en backend PostgreSQL / Supabase
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
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Funciones de Ayuda (Helper Functions) ejecutadas con SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
    SELECT (public.get_auth_role() = 'superadmin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_administrative()
RETURNS BOOLEAN AS $$
    SELECT (public.get_auth_role() IN ('administrative', 'superadmin'));
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS BOOLEAN AS $$
    SELECT (public.get_auth_role() = 'doctor');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_doctor_id()
RETURNS VARCHAR AS $$
    SELECT id FROM public.doctors WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_patient_id()
RETURNS VARCHAR AS $$
    SELECT id FROM public.patients WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ====================================================================
-- 3. POLÍTICAS PARA PROFILES
-- ====================================================================
-- Cada usuario puede leer su propio perfil; el personal administrativo puede leer todos
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (
    id = auth.uid() OR public.is_administrative()
);

-- Cada usuario puede actualizar sus datos personales (excepto su rol)
CREATE POLICY "profiles_update_self_policy" ON profiles
FOR UPDATE USING (
    id = auth.uid() OR public.is_superadmin()
) WITH CHECK (
    (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()))
    OR public.is_superadmin()
);

-- ====================================================================
-- 4. POLÍTICAS PARA DOCTORS
-- ====================================================================
-- Lectura pública para médicos activos (necesario para portal y reserva online)
CREATE POLICY "doctors_public_select" ON doctors
FOR SELECT USING (
    is_active = TRUE OR public.is_administrative() OR user_id = auth.uid()
);

-- El doctor puede actualizar su propia disponibilidad y perfil
CREATE POLICY "doctors_update_self" ON doctors
FOR UPDATE USING (
    user_id = auth.uid() OR public.is_administrative()
);

-- Solo administradores pueden crear o eliminar médicos
CREATE POLICY "doctors_admin_insert" ON doctors
FOR INSERT WITH CHECK (public.is_administrative());

CREATE POLICY "doctors_admin_delete" ON doctors
FOR DELETE USING (public.is_superadmin());

-- ====================================================================
-- 5. POLÍTICAS PARA PATIENTS
-- ====================================================================
-- Un paciente solo puede ver su propia ficha. Los administradores y médicos tratantes pueden verlas.
CREATE POLICY "patients_select_policy" ON patients
FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_administrative()
    OR (
        public.is_doctor() AND EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.patient_id = patients.id
            AND a.doctor_id = public.get_current_doctor_id()
        )
    )
);

-- El paciente puede actualizar sus datos de contacto y cobertura
CREATE POLICY "patients_update_policy" ON patients
FOR UPDATE USING (
    user_id = auth.uid() OR public.is_administrative()
);

-- Inserción de pacientes: paciente al registrarse o personal administrativo
CREATE POLICY "patients_insert_policy" ON patients
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR public.is_administrative()
);

-- ====================================================================
-- 6. POLÍTICAS PARA APPOINTMENTS (TURNOS)
-- ====================================================================
-- Lectura:
-- - El paciente solo ve sus turnos.
-- - El médico solo ve turnos asignados a él.
-- - La administración ve todos los turnos.
CREATE POLICY "appointments_select_policy" ON appointments
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

-- Creación:
-- - Pacientes autenticados pueden agendar para sí mismos.
-- - Personal administrativo puede agendar turnos para cualquier paciente.
CREATE POLICY "appointments_insert_policy" ON appointments
FOR INSERT WITH CHECK (
    patient_id = public.get_current_patient_id()
    OR public.is_administrative()
    OR auth.role() = 'anon' -- Reserva web pública antes del login
);

-- Modificación (Cancelación o cambio de estado):
-- - El paciente solo puede cancelar sus propios turnos futuros.
-- - El médico puede actualizar el estado a 'en_sala', 'atendido', 'ausente'.
-- - La administración puede reprogramar o cancelar.
CREATE POLICY "appointments_update_policy" ON appointments
FOR UPDATE USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

-- ====================================================================
-- 7. POLÍTICAS PARA CONSULTATIONS (HISTORIA CLÍNICA ELECTRÓNICA - HCE)
-- Ley 26.529: Confidencialidad absoluta y derecho de acceso del paciente
-- ====================================================================
-- Lectura:
-- - El paciente tiene acceso legítimo a sus propias consultas firmadas.
-- - El médico tiene acceso a las consultas de sus pacientes.
-- - La administración tiene acceso restringido o de auditoría.
CREATE POLICY "consultations_select_policy" ON consultations
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_superadmin()
);

-- Creación: Solo el profesional médico tratante puede asentar un acto médico
CREATE POLICY "consultations_insert_policy" ON consultations
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

-- MODIFICACIÓN Y ELIMINACIÓN BLOQUEADAS:
-- La ley 26.529 prohíbe enmiendas o borrados en la HCE. Solo se permiten adendas.
-- Por lo tanto, NO EXISTEN POLÍTICAS DE UPDATE NI DELETE EN 'consultations'.

-- ====================================================================
-- 8. POLÍTICAS PARA ADENDAS CLÍNICAS
-- ====================================================================
CREATE POLICY "adendas_select_policy" ON consultation_adendas
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM consultations c
        WHERE c.id = consultation_adendas.consultation_id
        AND (c.patient_id = public.get_current_patient_id() OR c.doctor_id = public.get_current_doctor_id() OR public.is_superadmin())
    )
);

CREATE POLICY "adendas_insert_policy" ON consultation_adendas
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

-- ====================================================================
-- 9. POLÍTICAS PARA RECETAS ELECTRÓNICAS (ELECTRONIC PRESCRIPTIONS - CUIR)
-- ====================================================================
-- Lectura: el paciente descarga sus recetas; el médico ve las que prescribió; administración para despacho
CREATE POLICY "prescriptions_select_policy" ON electronic_prescriptions
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

-- Creación: solo médicos autorizados
CREATE POLICY "prescriptions_insert_policy" ON electronic_prescriptions
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

-- ====================================================================
-- 10. POLÍTICAS PARA DIAGNÓSTICO POR IMÁGENES (IMAGING STUDIES)
-- ====================================================================
CREATE POLICY "imaging_select_policy" ON imaging_studies
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

CREATE POLICY "imaging_insert_policy" ON imaging_studies
FOR INSERT WITH CHECK (
    public.is_doctor() OR public.is_administrative()
);

CREATE POLICY "imaging_update_policy" ON imaging_studies
FOR UPDATE USING (
    public.is_administrative() OR doctor_id = public.get_current_doctor_id()
);

-- ====================================================================
-- 11. POLÍTICAS PARA AUDIT LOGS (INMUTABILIDAD DE SEGURIDAD)
-- ====================================================================
-- Solo el Director Médico / Superadmin puede consultar los registros de auditoría
CREATE POLICY "audit_logs_select_policy" ON audit_logs
FOR SELECT USING (
    public.is_superadmin()
);

-- Inserción autorizada para registrar eventos del sistema
CREATE POLICY "audit_logs_insert_policy" ON audit_logs
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR auth.role() = 'anon'
);

-- PROHIBICIÓN TOTAL DE UPDATE Y DELETE EN AUDIT LOGS:
-- Nadie (ni siquiera el superadmin) puede borrar o modificar eventos de auditoría.
-- No se definen políticas de UPDATE ni DELETE para audit_logs.

-- ====================================================================
-- 12. TABLAS PÚBLICAS Y DE CONFIGURACIÓN GENERAL (READ-ONLY PARA USUARIOS)
-- ====================================================================
CREATE POLICY "specialties_public_select" ON specialties FOR SELECT USING (TRUE);
CREATE POLICY "specialties_admin_all" ON specialties FOR ALL USING (public.is_administrative());

CREATE POLICY "rooms_public_select" ON rooms FOR SELECT USING (TRUE);
CREATE POLICY "rooms_admin_all" ON rooms FOR ALL USING (public.is_administrative());

CREATE POLICY "insurances_public_select" ON health_insurances FOR SELECT USING (TRUE);
CREATE POLICY "insurances_admin_all" ON health_insurances FOR ALL USING (public.is_administrative());

CREATE POLICY "schedules_public_select" ON clinic_schedules FOR SELECT USING (TRUE);
CREATE POLICY "schedules_admin_all" ON clinic_schedules FOR ALL USING (public.is_administrative());

CREATE POLICY "orders_select_policy" ON medical_orders FOR SELECT USING (
    patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative()
);
CREATE POLICY "orders_insert_policy" ON medical_orders FOR INSERT WITH CHECK (public.is_doctor() OR public.is_administrative());

CREATE POLICY "certificates_select_policy" ON medical_certificates FOR SELECT USING (
    patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative()
);
CREATE POLICY "certificates_insert_policy" ON medical_certificates FOR INSERT WITH CHECK (public.is_doctor() OR public.is_administrative());

CREATE POLICY "rehab_select_policy" ON rehab_plans FOR SELECT USING (
    patient_id = public.get_current_patient_id() OR public.is_doctor() OR public.is_administrative()
);
CREATE POLICY "rehab_all_policy" ON rehab_plans FOR ALL USING (public.is_doctor() OR public.is_administrative());
