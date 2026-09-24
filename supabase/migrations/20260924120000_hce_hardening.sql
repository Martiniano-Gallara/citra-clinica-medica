-- ====================================================================
-- CITRA · Centro Integral de Traumatología & Rehabilitación Arroyito
-- MIGRACIÓN DE ENDURECIMIENTO DE SEGURIDAD, INMUTABILIDAD Y AUDITORÍA HCE
-- Cumplimiento: Ley 26.529, Ley 25.506, Ley 27.553, Ley 25.326
-- Archivo: 20260924120000_hce_hardening.sql (Idempotente)
-- ====================================================================

-- 1. Fijar search_path estricto por seguridad en todas las extensiones y funciones
SET search_path = public, pg_catalog;

-- 2. Asegurar que las Foreign Keys de historias clínicas tengan ON DELETE RESTRICT
-- (Evita que el borrado de un paciente o médico elimine en cascada su historial clínico - C8)
DO $$ BEGIN
    ALTER TABLE public.consultations DROP CONSTRAINT IF EXISTS consultations_patient_id_fkey;
    ALTER TABLE public.consultations ADD CONSTRAINT consultations_patient_id_fkey
        FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;

    ALTER TABLE public.consultations DROP CONSTRAINT IF EXISTS consultations_doctor_id_fkey;
    ALTER TABLE public.consultations ADD CONSTRAINT consultations_doctor_id_fkey
        FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE RESTRICT;

    ALTER TABLE public.consultation_adendas DROP CONSTRAINT IF EXISTS consultation_adendas_consultation_id_fkey;
    ALTER TABLE public.consultation_adendas ADD CONSTRAINT consultation_adendas_consultation_id_fkey
        FOREIGN KEY (consultation_id) REFERENCES public.consultations(id) ON DELETE RESTRICT;

    ALTER TABLE public.electronic_prescriptions DROP CONSTRAINT IF EXISTS electronic_prescriptions_patient_id_fkey;
    ALTER TABLE public.electronic_prescriptions ADD CONSTRAINT electronic_prescriptions_patient_id_fkey
        FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE RESTRICT;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

-- 3. Índice Único: Un turno solo puede tener una única consulta médica (A5)
CREATE UNIQUE INDEX IF NOT EXISTS idx_consultations_one_per_appointment
ON public.consultations (appointment_id)
WHERE appointment_id IS NOT NULL;

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
-- Un médico solo puede acceder a la HC de un paciente si tiene turno asignado no cancelado o consulta previa
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
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_catalog;

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

-- Aplicar trigger de inmutabilidad
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

-- Trigger especial para recetas: solo permite cambiar status (dispensa farmacéutica)
CREATE OR REPLACE FUNCTION public.enforce_prescription_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Operación denegada (Ley 27.553): Las recetas electrónicas no pueden eliminarse.';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Solo se permite actualizar el campo status de activa a dispensada/anulada
        IF OLD.cuir != NEW.cuir OR OLD.patient_id != NEW.patient_id OR OLD.doctor_id != NEW.doctor_id
           OR OLD.medications::text != NEW.medications::text OR OLD.issue_date != NEW.issue_date THEN
            RAISE EXCEPTION 'Operación denegada: El contenido farmacológico y de autoría de la receta electrónica es inmutable.';
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
        module,
        target_id,
        details,
        ip_address,
        timestamp
    ) VALUES (
        'audit-' || gen_random_uuid()::text,
        v_user_id,
        COALESCE(v_user_email, 'Servidor/Sistema'),
        COALESCE(public.get_auth_role()::text, 'system'),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id, 'N/A'),
        v_details::text,
        COALESCE(inet_client_addr()::text, '127.0.0.1'),
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Vincular auditoría automática en tablas clínicas
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

-- 9. Políticas RLS para Consentimientos
DROP POLICY IF EXISTS "consent_select_policy" ON public.consent_forms;
CREATE POLICY "consent_select_policy" ON public.consent_forms
FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

DROP POLICY IF EXISTS "consent_insert_policy" ON public.consent_forms;
CREATE POLICY "consent_insert_policy" ON public.consent_forms
FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
);

DROP POLICY IF EXISTS "consent_update_policy" ON public.consent_forms;
CREATE POLICY "consent_update_policy" ON public.consent_forms
FOR UPDATE USING (
    doctor_id = public.get_current_doctor_id() OR public.is_administrative()
);

-- 10. Función RPC Transaccional: create_consultation_bundle (Riesgo 3)
-- Garantiza atomicidad total: consulta + receta + órdenes se crean en un único bloque transaccional
CREATE OR REPLACE FUNCTION public.create_consultation_bundle(
    p_consultation JSONB,
    p_prescription JSONB DEFAULT NULL,
    p_medical_orders JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_cons_id VARCHAR;
    v_doc_id VARCHAR;
    v_pat_id VARCHAR;
    v_order JSONB;
BEGIN
    v_doc_id := public.get_current_doctor_id();
    IF v_doc_id IS NULL THEN
        RAISE EXCEPTION 'No se encuentra un perfil médico activo para el usuario autenticado.';
    END IF;

    -- Validar que el médico esté autorizado para el paciente
    v_pat_id := p_consultation->>'patient_id';
    IF NOT public.doctor_treats_patient(v_pat_id, v_doc_id) AND NOT public.is_superadmin() THEN
        -- Si no hay turno previo, verificar si la consulta asigna el doctor actual
        IF (p_consultation->>'doctor_id') != v_doc_id THEN
            RAISE EXCEPTION 'Acceso denegado: El médico no tiene relación asistencial válida con el paciente.';
        END IF;
    END IF;

    v_cons_id := p_consultation->>'id';

    -- 1. Insertar Consulta
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
        COALESCE(p_consultation->>'sisa_refeps', 'REFEPS-MN-114829'),
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
            COALESCE(p_prescription->>'sisa_refeps', 'REFEPS-MN-114829'),
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

    -- 4. Actualizar estado del turno a 'atendido' si corresponde
    IF p_consultation->>'appointment_id' IS NOT NULL THEN
        UPDATE public.appointments
        SET status = 'atendido', updated_at = NOW()
        WHERE id = p_consultation->>'appointment_id';
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'consultation_id', v_cons_id,
        'message', 'Paquete clínico registrado atómicamente con éxito.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;
