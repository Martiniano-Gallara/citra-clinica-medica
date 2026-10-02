-- ====================================================================
-- CITRA · Centro Integral de Traumatología & Rehabilitación Arroyito
-- MIGRACIÓN DE ENDURECIMIENTO DE SEGURIDAD, INMUTABILIDAD Y AUDITORÍA HCE
-- Cumplimiento: Ley 26.529, Ley 25.506, Ley 27.553, Ley 25.326
-- Archivo: 20260924120000_hce_hardening.sql (Idempotente)
-- ====================================================================

-- 1. Fijar search_path estricto por seguridad en todas las extensiones y funciones
SET search_path = public, pg_catalog;

-- 2. Asegurar que las Foreign Keys de historias clínicas tengan ON DELETE RESTRICT
-- (Evita que el borrado de un paciente, turno o médico elimine en cascada su historial clínico - C8, M04)
DO $$ BEGIN
    ALTER TABLE public.consultations DROP CONSTRAINT IF EXISTS consultations_patient_id_fkey;
    ALTER TABLE public.consultations ADD CONSTRAINT consultations_patient_id_fkey
        FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;

    ALTER TABLE public.consultations DROP CONSTRAINT IF EXISTS consultations_doctor_id_fkey;
    ALTER TABLE public.consultations ADD CONSTRAINT consultations_doctor_id_fkey
        FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE RESTRICT;

    ALTER TABLE public.consultations DROP CONSTRAINT IF EXISTS consultations_appointment_id_fkey;
    ALTER TABLE public.consultations ADD CONSTRAINT consultations_appointment_id_fkey
        FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE RESTRICT;

    ALTER TABLE public.consultation_adendas DROP CONSTRAINT IF EXISTS consultation_adendas_consultation_id_fkey;
    ALTER TABLE public.consultation_adendas ADD CONSTRAINT consultation_adendas_consultation_id_fkey
        FOREIGN KEY (consultation_id) REFERENCES public.consultations(id) ON DELETE RESTRICT;

    ALTER TABLE public.electronic_prescriptions DROP CONSTRAINT IF EXISTS electronic_prescriptions_patient_id_fkey;
    ALTER TABLE public.electronic_prescriptions ADD CONSTRAINT electronic_prescriptions_patient_id_fkey
        FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;

    -- Sincronizar columnas divergentes en patients (M02)
    ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS assigned_doctor_ids TEXT[] DEFAULT ARRAY[]::TEXT[];
    ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

    -- Ampliar enum study_status si no contiene los estados usados por UI (M03)
    ALTER TYPE study_status ADD VALUE IF NOT EXISTS 'pendiente';
    ALTER TYPE study_status ADD VALUE IF NOT EXISTS 'realizado';
    ALTER TYPE study_status ADD VALUE IF NOT EXISTS 'informado';
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;

-- 3. Índice Único: Un turno solo puede tener una única consulta médica (A5)
CREATE UNIQUE INDEX IF NOT EXISTS idx_consultations_one_per_appointment
ON public.consultations (appointment_id)
WHERE appointment_id IS NOT NULL;

-- 3.1 Prevención estricta de colisiones concurrentes en turnos (A03)
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_duplicate_appointment
ON public.appointments (doctor_id, date, time)
WHERE status != 'cancelado';

-- 4. Índices Únicos para user_id en doctors y patients (C7)
CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_user_id_unique
ON public.doctors (user_id)
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_user_id_unique
ON public.patients (user_id)
WHERE user_id IS NOT NULL;

-- 5. Tabla de Consentimientos Informados (A4)
CREATE TABLE IF NOT EXISTS public.consent_forms (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    doctor_name VARCHAR(200) NOT NULL,
    procedure_type TEXT NOT NULL,
    title TEXT NOT NULL,
    risks TEXT NOT NULL,
    benefits TEXT NOT NULL,
    witness_name VARCHAR(150),
    witness_dni VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'signed' CHECK (status IN ('signed', 'revoked')),
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    integrity_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.consent_forms ENABLE ROW LEVEL SECURITY;

-- Columnas complementarias en adendas si no existen
DO $$ BEGIN
    ALTER TABLE public.consultation_adendas ADD COLUMN IF NOT EXISTS doctor_license VARCHAR(100);
    ALTER TABLE public.consultation_adendas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 6. Helper asistencial: doctor_treats_patient (Aislamiento asistencial estricto)
-- Un médico solo puede acceder a la HC de un paciente si tiene turno asignado no cancelado, consulta previa o asignación formal
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_catalog;

REVOKE EXECUTE ON FUNCTION public.doctor_treats_patient(VARCHAR, VARCHAR) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.doctor_treats_patient(VARCHAR, VARCHAR) TO authenticated;

-- Helper get_current_doctor_id endurecido (C5 / C7)
CREATE OR REPLACE FUNCTION public.get_current_doctor_id()
RETURNS VARCHAR AS $$
    SELECT d.id
    FROM public.doctors d
    JOIN public.profiles p ON p.id = d.user_id
    WHERE d.user_id = auth.uid()
      AND p.role = 'doctor'
      AND p.is_active = TRUE
      AND d.is_active = TRUE
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog;

-- Helper get_current_patient_id endurecido
CREATE OR REPLACE FUNCTION public.get_current_patient_id()
RETURNS VARCHAR AS $$
    SELECT p.id
    FROM public.patients p
    JOIN public.profiles pr ON pr.id = p.user_id
    WHERE p.user_id = auth.uid()
      AND pr.role = 'patient'
      AND pr.is_active = TRUE
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog;

-- 7. Trigger de Inmutabilidad Legal (Ley 26.529)
-- Bloquea UPDATE y DELETE en consultas, adendas, órdenes, certificados y auditoría
CREATE OR REPLACE FUNCTION public.enforce_clinical_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Operación denegada (Ley 26.529): Los registros de la Historia Clínica Electrónica son inmutables y no pueden eliminarse.';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Operación denegada (Ley 26.529): Los registros clínicos firmados son inmutables. Para modificaciones debe registrarse una Adenda Médica Fechada.';
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_immutable_consultations ON public.consultations;
CREATE TRIGGER trg_immutable_consultations
BEFORE UPDATE OR DELETE ON public.consultations
FOR EACH ROW EXECUTE FUNCTION public.enforce_clinical_immutability();

DROP TRIGGER IF EXISTS trg_immutable_adendas ON public.consultation_adendas;
CREATE TRIGGER trg_immutable_adendas
BEFORE UPDATE OR DELETE ON public.consultation_adendas
FOR EACH ROW EXECUTE FUNCTION public.enforce_clinical_immutability();

DROP TRIGGER IF EXISTS trg_immutable_medical_orders ON public.medical_orders;
CREATE TRIGGER trg_immutable_medical_orders
BEFORE UPDATE OR DELETE ON public.medical_orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_clinical_immutability();

DROP TRIGGER IF EXISTS trg_immutable_medical_certificates ON public.medical_certificates;
CREATE TRIGGER trg_immutable_medical_certificates
BEFORE UPDATE OR DELETE ON public.medical_certificates
FOR EACH ROW EXECUTE FUNCTION public.enforce_clinical_immutability();

DROP TRIGGER IF EXISTS trg_immutable_audit_logs ON public.audit_logs;
CREATE TRIGGER trg_immutable_audit_logs
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.enforce_clinical_immutability();

-- Trigger especial para recetas: solo permite cambiar status (dispensa o anulación formal) (M05)
CREATE OR REPLACE FUNCTION public.enforce_prescription_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Operación denegada (Ley 27.553): Las recetas electrónicas no pueden eliminarse.';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'anulada' THEN
            RAISE EXCEPTION 'Operación denegada: La receta ya se encuentra formalmente anulada.';
        END IF;

        IF OLD.cuir != NEW.cuir OR OLD.patient_id != NEW.patient_id OR OLD.doctor_id != NEW.doctor_id
           OR OLD.medications::text != NEW.medications::text OR OLD.issue_date != NEW.issue_date THEN
            RAISE EXCEPTION 'Operación denegada: El contenido farmacológico y de autoría de la receta electrónica es inmutable.';
        END IF;

        IF NEW.status NOT IN ('activa', 'dispensada', 'vencida', 'anulada') THEN
            RAISE EXCEPTION 'Operación denegada: Estado de prescripción inválido.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_immutable_prescriptions ON public.electronic_prescriptions;
CREATE TRIGGER trg_immutable_prescriptions
BEFORE UPDATE OR DELETE ON public.electronic_prescriptions
FOR EACH ROW EXECUTE FUNCTION public.enforce_prescription_immutability();

-- Trigger especial para consentimientos: solo permite revocación única
CREATE OR REPLACE FUNCTION public.enforce_consent_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Operación denegada: Los consentimientos informados no pueden eliminarse.';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'revoked' THEN
            RAISE EXCEPTION 'Operación denegada: El consentimiento ya se encuentra revocado permanentemente.';
        END IF;
        IF NEW.status != 'revoked' OR NEW.revocation_reason IS NULL OR TRIM(NEW.revocation_reason) = '' THEN
            RAISE EXCEPTION 'Operación denegada: El consentimiento solo puede modificarse para asentar su revocación formal con motivo.';
        END IF;
        NEW.revoked_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_immutable_consent_forms ON public.consent_forms;
CREATE TRIGGER trg_immutable_consent_forms
BEFORE UPDATE OR DELETE ON public.consent_forms
FOR EACH ROW EXECUTE FUNCTION public.enforce_consent_immutability();

-- Triggers de protección contra auto-escalado de privilegios en patients y doctors (C04, T4, T6, T11)
CREATE OR REPLACE FUNCTION public.protect_doctor_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT public.is_administrative() THEN
        IF NEW.fee_percentage IS DISTINCT FROM OLD.fee_percentage THEN
            RAISE EXCEPTION 'Operación denegada (T6): Solo la administración de CITRA puede modificar porcentajes de honorarios.';
        END IF;
        IF NEW.price_consultation IS DISTINCT FROM OLD.price_consultation THEN
            RAISE EXCEPTION 'Operación denegada (T6): Solo la administración puede modificar aranceles base.';
        END IF;
        IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
            RAISE EXCEPTION 'Operación denegada (T11): Un profesional no puede modificar su estado de habilitación o reactivarse unilateralmente.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_protect_doctor_fields ON public.doctors;
CREATE TRIGGER trg_protect_doctor_fields
BEFORE UPDATE ON public.doctors
FOR EACH ROW EXECUTE FUNCTION public.protect_doctor_fields();

CREATE OR REPLACE FUNCTION public.protect_patient_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- C04 & T4: Los pacientes solo pueden actualizar canales de contacto y domicilio
    IF public.get_auth_role() = 'patient' THEN
        IF NEW.dni IS DISTINCT FROM OLD.dni
           OR NEW.first_name IS DISTINCT FROM OLD.first_name
           OR NEW.last_name IS DISTINCT FROM OLD.last_name
           OR NEW.insurance_id IS DISTINCT FROM OLD.insurance_id
           OR NEW.insurance_name IS DISTINCT FROM OLD.insurance_name
           OR NEW.insurance_plan IS DISTINCT FROM OLD.insurance_plan
           OR NEW.insurance_number IS DISTINCT FROM OLD.insurance_number
           OR NEW.allergies IS DISTINCT FROM OLD.allergies
           OR NEW.antecedentes IS DISTINCT FROM OLD.antecedentes
           OR NEW.chronic_conditions IS DISTINCT FROM OLD.chronic_conditions
           OR NEW.surgical_history IS DISTINCT FROM OLD.surgical_history
           OR NEW.observations IS DISTINCT FROM OLD.observations
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_protect_patient_fields ON public.patients;
CREATE TRIGGER trg_protect_patient_fields
BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.protect_patient_fields();

-- Protección de informes médicos diagnósticos contra manipulación administrativa (T7)
CREATE OR REPLACE FUNCTION public.protect_imaging_report()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT public.is_doctor() AND NOT public.is_superadmin() THEN
        IF NEW.report IS DISTINCT FROM OLD.report
           OR NEW.findings IS DISTINCT FROM OLD.findings
           OR NEW.conclusion IS DISTINCT FROM OLD.conclusion
           OR (NEW.status = 'informado' AND OLD.status != 'informado')
        THEN
            RAISE EXCEPTION 'Operación denegada (T7): La redacción o modificación de informes diagnósticos e interpretaciones radiológicas está reservada exclusivamente a profesionales médicos y radiólogos.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_protect_imaging_report ON public.imaging_studies;
CREATE TRIGGER trg_protect_imaging_report
BEFORE UPDATE ON public.imaging_studies
FOR EACH ROW EXECUTE FUNCTION public.protect_imaging_report();

-- Asegurar compatibilidad de columnas en audit_logs y cálculo de integridad forzada en servidor (M01)
DO $$ BEGIN
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS module VARCHAR(100);
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS target_id VARCHAR(100);
    ALTER TABLE public.audit_logs ALTER COLUMN resource DROP NOT NULL;
    ALTER TABLE public.audit_logs ALTER COLUMN event_hash DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.enforce_audit_log_user()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    NEW.timestamp := COALESCE(NEW.timestamp, NOW());
    NEW.event_hash := encode(digest(CONCAT(COALESCE(NEW.user_id::text, 'anon'), ':', NEW.action, ':', NEW.timestamp, ':', COALESCE(NEW.details::text, '')), 'sha256'), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_enforce_audit_log_user ON public.audit_logs;
CREATE TRIGGER trg_enforce_audit_log_user
BEFORE INSERT ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.enforce_audit_log_user();

-- 8. Trigger de Auditoría en Servidor con Diffs (A3)
CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email VARCHAR;
    v_details JSONB;
BEGIN
    v_user_id := auth.uid();
    SELECT email INTO v_user_email FROM public.profiles WHERE id = v_user_id;

    IF TG_OP = 'INSERT' THEN
        v_details := jsonb_build_object('new', to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        v_details := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        v_details := jsonb_build_object('old', to_jsonb(OLD));
    END IF;

    INSERT INTO public.audit_logs (
        id,
        user_id,
        user_name,
        user_role,
        action,
        resource,
        target_dni,
        details,
        ip_address,
        timestamp,
        event_hash,
        module,
        target_id
    ) VALUES (
        'audit-' || gen_random_uuid()::text,
        v_user_id,
        COALESCE(v_user_email, 'Servidor/Sistema'),
        COALESCE(public.get_auth_role()::text, 'system'),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(CASE WHEN TG_OP != 'DELETE' AND to_jsonb(NEW) ? 'patient_dni' THEN NEW.patient_dni ELSE '-' END, '-'),
        v_details::text,
        COALESCE(inet_client_addr()::text, '127.0.0.1'),
        NOW(),
        encode(digest(TG_TABLE_NAME || TG_OP || NOW()::text || COALESCE(NEW.id, OLD.id, ''), 'sha256'), 'hex'),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id, 'N/A')
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_audit_consultations ON public.consultations;
CREATE TRIGGER trg_audit_consultations
AFTER INSERT ON public.consultations
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_adendas ON public.consultation_adendas;
CREATE TRIGGER trg_audit_adendas
AFTER INSERT ON public.consultation_adendas
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_prescriptions ON public.electronic_prescriptions;
CREATE TRIGGER trg_audit_prescriptions
AFTER INSERT OR UPDATE ON public.electronic_prescriptions
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_consent_forms ON public.consent_forms;
CREATE TRIGGER trg_audit_consent_forms
AFTER INSERT OR UPDATE ON public.consent_forms
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

-- 9. Políticas RLS Unificadas sin duplicación (M02)
-- Consentimientos informados: eliminar ambas variantes de nombres antes de definir
DROP POLICY IF EXISTS "consent_select_policy" ON public.consent_forms;
DROP POLICY IF EXISTS "consent_forms_select_policy" ON public.consent_forms;
CREATE POLICY "consent_forms_select_policy" ON public.consent_forms
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

DROP POLICY IF EXISTS "consent_insert_policy" ON public.consent_forms;
DROP POLICY IF EXISTS "consent_forms_insert_policy" ON public.consent_forms;
CREATE POLICY "consent_forms_insert_policy" ON public.consent_forms
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

DROP POLICY IF EXISTS "consent_update_policy" ON public.consent_forms;
DROP POLICY IF EXISTS "consent_forms_update_policy" ON public.consent_forms;
CREATE POLICY "consent_forms_update_policy" ON public.consent_forms
FOR UPDATE USING (
    doctor_id = public.get_current_doctor_id()
    OR patient_id = public.get_current_patient_id()
    OR public.is_superadmin()
);

-- Corrección de appointment status en rls (C01)
DROP POLICY IF EXISTS "appointments_update_policy" ON public.appointments;
CREATE POLICY "appointments_update_policy" ON public.appointments
FOR UPDATE USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
) WITH CHECK (
    (patient_id = public.get_current_patient_id() AND status = 'cancelado')
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

-- Consultations insert con validación asistencial (C03)
DROP POLICY IF EXISTS "consultations_insert_policy" ON public.consultations;
CREATE POLICY "consultations_insert_policy" ON public.consultations
FOR INSERT WITH CHECK (
    public.is_doctor()
    AND doctor_id = public.get_current_doctor_id()
    AND public.doctor_treats_patient(patient_id, doctor_id)
);

-- Planes y sesiones de rehabilitación protegidos (C05, T8)
DROP POLICY IF EXISTS "rehab_plans_all_policy" ON public.rehab_plans;
DROP POLICY IF EXISTS "rehab_all_policy" ON public.rehab_plans;
DROP POLICY IF EXISTS "rehab_plans_select_policy" ON public.rehab_plans;
DROP POLICY IF EXISTS "rehab_select_policy" ON public.rehab_plans;
DROP POLICY IF EXISTS "rehab_plans_insert_policy" ON public.rehab_plans;
DROP POLICY IF EXISTS "rehab_plans_update_policy" ON public.rehab_plans;
DROP POLICY IF EXISTS "rehab_plans_delete_policy" ON public.rehab_plans;

CREATE POLICY "rehab_plans_select_policy" ON public.rehab_plans
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR public.is_doctor()
    OR public.is_administrative()
);

CREATE POLICY "rehab_plans_insert_policy" ON public.rehab_plans
FOR INSERT WITH CHECK (
    public.is_doctor()
    AND doctor_id = public.get_current_doctor_id()
    AND public.doctor_treats_patient(patient_id, doctor_id)
);

CREATE POLICY "rehab_plans_update_policy" ON public.rehab_plans
FOR UPDATE USING (
    (public.is_doctor() AND doctor_id = public.get_current_doctor_id())
    OR public.is_superadmin()
) WITH CHECK (
    (public.is_doctor() AND doctor_id = public.get_current_doctor_id())
    OR public.is_superadmin()
);

-- T8: Solo el kinesiólogo/médico asignado al plan o el superadmin pueden eliminarlo
CREATE POLICY "rehab_plans_delete_policy" ON public.rehab_plans
FOR DELETE USING (
    (public.is_doctor() AND doctor_id = public.get_current_doctor_id())
    OR public.is_superadmin()
);

-- Tabla transaccional de Sesiones de Rehabilitación (C05, T8)
CREATE TABLE IF NOT EXISTS public.rehab_sessions (
    id VARCHAR(50) PRIMARY KEY,
    plan_id VARCHAR(50) REFERENCES public.rehab_plans(id) ON DELETE CASCADE,
    patient_id VARCHAR(50) REFERENCES public.patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    therapist_id VARCHAR(50) REFERENCES public.doctors(id) ON DELETE RESTRICT,
    therapist_name VARCHAR(200) NOT NULL,
    session_number INT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time VARCHAR(10) DEFAULT '09:00',
    eva_score INT CHECK (eva_score BETWEEN 0 AND 10),
    procedures JSONB DEFAULT '[]'::jsonb,
    patient_tolerance VARCHAR(50) DEFAULT 'Buena',
    next_session_planned TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rehab_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rehab_sessions_select_policy" ON public.rehab_sessions;
CREATE POLICY "rehab_sessions_select_policy" ON public.rehab_sessions
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR public.is_doctor()
    OR public.is_administrative()
);

DROP POLICY IF EXISTS "rehab_sessions_insert_policy" ON public.rehab_sessions;
CREATE POLICY "rehab_sessions_insert_policy" ON public.rehab_sessions
FOR INSERT WITH CHECK (
    (public.is_doctor() AND therapist_id = public.get_current_doctor_id())
    OR public.is_superadmin()
);

DROP POLICY IF EXISTS "rehab_sessions_update_policy" ON public.rehab_sessions;
CREATE POLICY "rehab_sessions_update_policy" ON public.rehab_sessions
FOR UPDATE USING (
    (public.is_doctor() AND therapist_id = public.get_current_doctor_id())
    OR public.is_superadmin()
);

DROP POLICY IF EXISTS "rehab_sessions_delete_policy" ON public.rehab_sessions;
CREATE POLICY "rehab_sessions_delete_policy" ON public.rehab_sessions
FOR DELETE USING (
    (public.is_doctor() AND therapist_id = public.get_current_doctor_id())
    OR public.is_superadmin()
);

-- Órdenes médicas: solo emisión por profesionales médicos auténticos (T7)
DROP POLICY IF EXISTS "orders_insert_policy" ON public.medical_orders;
CREATE POLICY "orders_insert_policy" ON public.medical_orders
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

-- Aislamiento de doctores para consulta directa de datos privados / aranceles (T9)
DROP POLICY IF EXISTS "doctors_public_select" ON public.doctors;
CREATE POLICY "doctors_public_select" ON public.doctors
FOR SELECT USING (auth.role() = 'authenticated');

-- Audit logs insert con usuario autenticado verificado (M01)
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid())
);

-- Recetas electrónicas: permitir anulación trazable (M05)
DROP POLICY IF EXISTS "prescriptions_update_policy" ON public.electronic_prescriptions;
DROP POLICY IF EXISTS "prescriptions_annul_policy" ON public.electronic_prescriptions;
CREATE POLICY "prescriptions_update_policy" ON public.electronic_prescriptions
FOR UPDATE USING (
    doctor_id = public.get_current_doctor_id() OR public.is_administrative()
) WITH CHECK (
    status IN ('dispensada', 'anulada') AND (doctor_id = public.get_current_doctor_id() OR public.is_administrative())
);

-- 10. RPC de Anulación Formal de Receta (M05)
CREATE OR REPLACE FUNCTION public.annul_prescription(
    p_prescription_id VARCHAR,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_doc_id VARCHAR;
    v_presc RECORD;
BEGIN
    v_doc_id := public.get_current_doctor_id();
    IF v_doc_id IS NULL AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'Acceso denegado: Se requiere perfil médico autenticado para anular recetas.';
    END IF;

    SELECT * INTO v_presc FROM public.electronic_prescriptions WHERE id = p_prescription_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Receta no encontrada: %', p_prescription_id;
    END IF;

    IF v_presc.doctor_id != v_doc_id AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'Acceso denegado: Solo el profesional emisor o la dirección médica pueden anular una receta.';
    END IF;

    IF v_presc.status = 'anulada' THEN
        RAISE EXCEPTION 'La receta ya se encuentra formalmente anulada.';
    END IF;

    UPDATE public.electronic_prescriptions
    SET status = 'anulada',
        updated_at = NOW()
    WHERE id = p_prescription_id;

    INSERT INTO public.audit_logs (
        timestamp, user_id, user_name, user_role,
        action, resource, details, ip_address
    ) VALUES (
        NOW(), auth.uid(), 'Profesional Médico', 'doctor',
        'ANNUL_PRESCRIPTION', 'electronic_prescriptions',
        jsonb_build_object('prescription_id', p_prescription_id, 'cuir', v_presc.cuir, 'reason', p_reason),
        COALESCE(inet_client_addr()::text, '127.0.0.1')
    );

    RETURN jsonb_build_object('success', TRUE, 'message', 'Receta anulada exitosamente con trazabilidad legal.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- 11. Función RPC Transaccional: create_consultation_bundle endurecida (C02, A06)
CREATE OR REPLACE FUNCTION public.create_consultation_bundle(
    p_consultation JSONB,
    p_prescription JSONB DEFAULT NULL,
    p_medical_orders JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_cons_id VARCHAR;
    v_doc_id VARCHAR;
    v_doc_refeps VARCHAR;
    v_pat_id VARCHAR;
    v_order JSONB;
BEGIN
    v_doc_id := public.get_current_doctor_id();
    IF v_doc_id IS NULL AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'No se encuentra un perfil médico activo para el usuario autenticado.';
    END IF;

    -- Obtener datos fehacientes del médico
    SELECT sisa_refeps INTO v_doc_refeps FROM public.doctors WHERE id = v_doc_id;

    -- Validar relación asistencial estricta sin evasión de cliente (C02)
    v_pat_id := p_consultation->>'patient_id';
    IF NOT public.doctor_treats_patient(v_pat_id, v_doc_id) AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'Acceso denegado: El médico no tiene relación asistencial válida con el paciente.';
    END IF;

    v_cons_id := p_consultation->>'id';

    -- 1. Insertar Consulta con datos reales (sin SISA fake por defecto - A06)
    INSERT INTO public.consultations (
        id, appointment_id, patient_id, patient_name, patient_dni,
        doctor_id, doctor_name, doctor_license, sisa_refeps, specialty_name,
        date, time, reason, symptoms, vitals, diagnosis, secondary_diagnosis,
        evolution, prescriptions, indications, studies_requested, signed,
        signature_type, cert_authority, signature_timestamp, integrity_hash
    ) VALUES (
        v_cons_id,
        p_consultation->>'appointment_id',
        v_pat_id,
        p_consultation->>'patient_name',
        p_consultation->>'patient_dni',
        v_doc_id,
        p_consultation->>'doctor_name',
        p_consultation->>'doctor_license',
        COALESCE(p_consultation->>'sisa_refeps', v_doc_refeps),
        p_consultation->>'specialty_name',
        COALESCE((p_consultation->>'date')::date, CURRENT_DATE),
        COALESCE((p_consultation->>'time')::time, CURRENT_TIME),
        p_consultation->>'reason',
        p_consultation->>'symptoms',
        COALESCE(p_consultation->'vitals', '{}'::jsonb),
        p_consultation->>'diagnosis',
        p_consultation->>'secondary_diagnosis',
        p_consultation->>'evolution',
        COALESCE(p_consultation->'prescriptions', '[]'::jsonb),
        p_consultation->>'indications',
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_consultation->'studies_requested', '[]'::jsonb))),
        TRUE,
        'Firma Electrónica Médica Certificada (Ley 25.506 Art. 5)',
        'CITRA Seguridad Clínica Central',
        NOW(),
        p_consultation->>'integrity_hash'
    );

    -- 2. Si vino receta electrónica asociada, insertarla de forma atómica
    IF p_prescription IS NOT NULL AND (p_prescription->>'cuir') IS NOT NULL THEN
        INSERT INTO public.electronic_prescriptions (
            id, cuir, patient_id, patient_name, patient_dni,
            doctor_id, doctor_name, doctor_license, sisa_refeps,
            diagnosis_presuntivo, medications, issue_date, expiration_date,
            status, verification_url
        ) VALUES (
            p_prescription->>'id',
            p_prescription->>'cuir',
            v_pat_id,
            p_prescription->>'patient_name',
            p_prescription->>'patient_dni',
            v_doc_id,
            p_prescription->>'doctor_name',
            p_prescription->>'doctor_license',
            COALESCE(p_prescription->>'sisa_refeps', v_doc_refeps),
            p_prescription->>'diagnosis_presuntivo',
            COALESCE(p_prescription->'medications', '[]'::jsonb),
            COALESCE((p_prescription->>'issue_date')::date, CURRENT_DATE),
            (p_prescription->>'expiration_date')::date,
            'activa',
            p_prescription->>'verification_url'
        );
    END IF;

    -- 3. Si vinieron pedidos diagnósticos, insertarlos
    IF p_medical_orders IS NOT NULL AND jsonb_array_length(p_medical_orders) > 0 THEN
        FOR v_order IN SELECT * FROM jsonb_array_elements(p_medical_orders)
        LOOP
            INSERT INTO public.medical_orders (
                id, patient_id, patient_name, doctor_id, doctor_name, type, instructions, date
            ) VALUES (
                v_order->>'id',
                v_pat_id,
                v_order->>'patient_name',
                v_doc_id,
                v_order->>'doctor_name',
                v_order->>'type',
                v_order->>'instructions',
                COALESCE((v_order->>'date')::date, CURRENT_DATE)
            );
        END LOOP;
    END IF;

    -- 4. Actualizar estado del turno a 'atendido' acotado al médico y paciente legítimos (C02)
    IF p_consultation->>'appointment_id' IS NOT NULL THEN
        UPDATE public.appointments
        SET status = 'atendido', updated_at = NOW()
        WHERE id = p_consultation->>'appointment_id'
          AND (doctor_id = v_doc_id OR public.is_superadmin())
          AND patient_id = v_pat_id;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'consultation_id', v_cons_id,
        'message', 'Paquete clínico registrado atómicamente con éxito.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- 12. Tabla de Configuración Institucional Dedicada (C09)
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main-clinic-config',
    name VARCHAR(200) DEFAULT 'CITRA',
    legal_name VARCHAR(200) DEFAULT 'Centro Integral de Traumatología y Rehabilitación Arroyito S.R.L.',
    cuit VARCHAR(20) DEFAULT '30-71829340-8',
    iibb VARCHAR(50) DEFAULT '27-71829340',
    activity_start DATE DEFAULT '2018-03-01',
    iva_condition VARCHAR(50) DEFAULT 'Responsable Inscripto',
    address VARCHAR(200) DEFAULT 'Av. Carlos Pontín 450',
    city VARCHAR(100) DEFAULT 'Arroyito',
    province VARCHAR(100) DEFAULT 'Córdoba',
    postal_code VARCHAR(20) DEFAULT 'X2415',
    phone VARCHAR(50) DEFAULT '+54 3576 450214',
    whatsapp VARCHAR(50) DEFAULT '+54 9 3576 450214',
    emergency_phone VARCHAR(50) DEFAULT '+54 3576 450215',
    email VARCHAR(100) DEFAULT 'contacto@citra.com.ar',
    director_name VARCHAR(150) DEFAULT 'Dr. Alejandro Blanco',
    director_license VARCHAR(50) DEFAULT 'MP 38.412 / ME 19.820',
    director_specialty VARCHAR(100) DEFAULT 'Traumatología y Ortopedia',
    director_email VARCHAR(100) DEFAULT 'dr.blanco@citra.com.ar',
    director_phone VARCHAR(50) DEFAULT '3576 450214',
    director_schedule VARCHAR(100) DEFAULT 'Martes a Jueves 14:00 - 19:00',
    sisa_refes_code VARCHAR(50) DEFAULT '14068219201412',
    renapdis_platform_id VARCHAR(50) DEFAULT 'CITRA-HCE-2026',
    arca_pto_vta INT DEFAULT 1,
    schedule_summary VARCHAR(200) DEFAULT 'Lun a Vie 08:00 a 20:00 · Sáb 08:00 a 13:00',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clinic_settings_select_policy" ON public.clinic_settings;
CREATE POLICY "clinic_settings_select_policy" ON public.clinic_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "clinic_settings_admin_all" ON public.clinic_settings;
CREATE POLICY "clinic_settings_admin_all" ON public.clinic_settings FOR ALL USING (public.is_administrative());

-- 13. Módulo de Turnos y Movimientos de Caja Transaccional (M08)
CREATE TABLE IF NOT EXISTS public.cash_shifts (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cashier_name VARCHAR(150) NOT NULL,
    shift_name VARCHAR(100) DEFAULT 'Turno Mañana',
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    opening_balance NUMERIC(12,2) DEFAULT 0,
    closing_balance NUMERIC(12,2),
    total_cash NUMERIC(12,2) DEFAULT 0,
    total_cards NUMERIC(12,2) DEFAULT 0,
    total_transfers NUMERIC(12,2) DEFAULT 0,
    total_expenses NUMERIC(12,2) DEFAULT 0,
    net_total NUMERIC(12,2) DEFAULT 0,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_open_shift_per_user
ON public.cash_shifts (user_id) WHERE status = 'open';

CREATE TABLE IF NOT EXISTS public.cash_movements (
    id VARCHAR(50) PRIMARY KEY,
    shift_id VARCHAR(50) REFERENCES cash_shifts(id) ON DELETE RESTRICT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    concept VARCHAR(200) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Efectivo',
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200),
    cashier_name VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cash_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cash_shifts_admin_all" ON public.cash_shifts;
CREATE POLICY "cash_shifts_admin_all" ON public.cash_shifts FOR ALL USING (public.is_administrative());

DROP POLICY IF EXISTS "cash_movements_admin_all" ON public.cash_movements;
CREATE POLICY "cash_movements_admin_all" ON public.cash_movements FOR ALL USING (public.is_administrative());

CREATE OR REPLACE FUNCTION public.close_cash_shift_rpc(
    p_shift_id VARCHAR,
    p_observations TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_shift RECORD;
    v_cash_in NUMERIC(12,2) := 0;
    v_card_in NUMERIC(12,2) := 0;
    v_trans_in NUMERIC(12,2) := 0;
    v_expenses NUMERIC(12,2) := 0;
BEGIN
    IF NOT public.is_administrative() THEN
        RAISE EXCEPTION 'Acceso denegado: Se requiere rol administrativo para cerrar turnos de caja.';
    END IF;

    SELECT * INTO v_shift
    FROM public.cash_shifts
    WHERE id = p_shift_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Turno de caja no encontrado: %', p_shift_id;
    END IF;

    IF v_shift.status = 'closed' THEN
        RAISE EXCEPTION 'El turno de caja % ya fue cerrado previamente el %.', p_shift_id, v_shift.closed_at;
    END IF;

    SELECT
        COALESCE(SUM(CASE WHEN type = 'income' AND payment_method = 'Efectivo' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'income' AND payment_method IN ('Tarjeta de Débito', 'Tarjeta de Crédito') THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'income' AND payment_method IN ('Transferencia', 'QR / Mercado Pago') THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
    INTO v_cash_in, v_card_in, v_trans_in, v_expenses
    FROM public.cash_movements
    WHERE shift_id = p_shift_id;

    UPDATE public.cash_shifts
    SET status = 'closed',
        closed_at = NOW(),
        total_cash = v_cash_in,
        total_cards = v_card_in,
        total_transfers = v_trans_in,
        total_expenses = v_expenses,
        net_total = (opening_balance + v_cash_in + v_card_in + v_trans_in - v_expenses),
        closing_balance = (opening_balance + v_cash_in - v_expenses),
        observations = p_observations,
        updated_at = NOW()
    WHERE id = p_shift_id;

    INSERT INTO public.audit_logs (
        timestamp, user_id, user_name, user_role,
        action, resource, details, ip_address
    ) VALUES (
        NOW(), auth.uid(), 'Administración', 'admin',
        'CLOSE_CASH_SHIFT', 'cash_shifts',
        jsonb_build_object('shift_id', p_shift_id, 'observations', p_observations),
        COALESCE(inet_client_addr()::text, '127.0.0.1')
    );

    RETURN jsonb_build_object('success', TRUE, 'message', 'Turno de caja cerrado exitosamente de manera atómica.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- 14. Vista Segura de Profesionales para Consulta Pública / Anon (A01)
CREATE OR REPLACE VIEW public.public_doctors AS
SELECT
    id, name, specialty_id, specialty_name, room_id, room_name,
    working_days, schedule_start, schedule_end, slot_duration,
    accepted_insurances, experience, bio, avatar_url, is_active
FROM public.doctors
WHERE is_active = TRUE;

GRANT SELECT ON public.public_doctors TO anon, authenticated;

-- 15. Índices de Rendimiento para Escalabilidad y Consultas Masivas (M09)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments (doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON public.appointments (patient_id, date);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_date ON public.consultations (doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_date ON public.consultations (patient_id, date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.electronic_prescriptions (doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.electronic_prescriptions (patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_patient ON public.imaging_studies (patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_doctor ON public.imaging_studies (doctor_id);
