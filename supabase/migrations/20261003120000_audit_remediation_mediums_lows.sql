-- ==============================================================================
-- CITRA CLINICA MEDICA - MIGRACIÓN DE REMEDIACIÓN AUDITORÍA (MED-01 a MED-10 & RIESGOS)
-- Fecha: 2026-10-03
-- Conforme a Ley 26.529 (HCE), Ley 25.326 (Protección Datos) y Ley 25.506 (Firma Digital)
-- ==============================================================================

-- 1. Vinculación estricta de identidad médica por user_id = auth.uid() (MED-08)
-- Vinculación inicial de cualquier doctor huérfano con su perfil correspondiente
UPDATE public.doctors d
SET user_id = p.id
FROM public.profiles p
WHERE d.user_id IS NULL AND LOWER(TRIM(d.email)) = LOWER(TRIM(p.email));

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

-- 2. Restricción de acceso a tabla doctors y exposición de vista pública (MED-09)
DROP POLICY IF EXISTS "doctors_public_select" ON public.doctors;
DROP POLICY IF EXISTS "doctors_select_policy" ON public.doctors;
CREATE POLICY "doctors_select_policy" ON public.doctors FOR SELECT
USING (public.is_administrative() OR user_id = auth.uid());

DROP VIEW IF EXISTS public.public_doctors CASCADE;
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

-- 3. Inmutabilidad estricta de consentimientos informados (MED-04)
CREATE OR REPLACE FUNCTION public.enforce_consent_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Operación denegada (Ley 26.529): Los consentimientos informados no pueden eliminarse.';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'revoked' THEN
            RAISE EXCEPTION 'Operación denegada: El consentimiento ya se encuentra revocado permanentemente.';
        END IF;
        IF NEW.status != 'revoked' OR NEW.revocation_reason IS NULL OR TRIM(NEW.revocation_reason) = '' THEN
            RAISE EXCEPTION 'Operación denegada: El consentimiento solo puede modificarse para asentar su revocación formal con motivo.';
        END IF;

        -- MED-04: Comparar OLD y NEW en todas las columnas firmadas e inmutables
        IF NEW.id IS DISTINCT FROM OLD.id OR
           NEW.patient_id IS DISTINCT FROM OLD.patient_id OR
           NEW.patient_name IS DISTINCT FROM OLD.patient_name OR
           NEW.patient_dni IS DISTINCT FROM OLD.patient_dni OR
           NEW.doctor_id IS DISTINCT FROM OLD.doctor_id OR
           NEW.doctor_name IS DISTINCT FROM OLD.doctor_name OR
           NEW.procedure_type IS DISTINCT FROM OLD.procedure_type OR
           NEW.title IS DISTINCT FROM OLD.title OR
           NEW.risks IS DISTINCT FROM OLD.risks OR
           NEW.benefits IS DISTINCT FROM OLD.benefits OR
           NEW.witness_name IS DISTINCT FROM OLD.witness_name OR
           NEW.witness_dni IS DISTINCT FROM OLD.witness_dni OR
           NEW.signed_at IS DISTINCT FROM OLD.signed_at OR
           NEW.integrity_hash IS DISTINCT FROM OLD.integrity_hash OR
           NEW.created_at IS DISTINCT FROM OLD.created_at THEN
            RAISE EXCEPTION 'Operación denegada (MED-04 / Ley 26.529): No se permite alterar campos clínicos, voluntades declaradas ni firmas del consentimiento informado.';
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

-- 4. Garantizar publicación Supabase Realtime en tablas críticas (Sección 4 - Riesgo 4)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.electronic_prescriptions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.imaging_studies;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_shifts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_movements;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
    WHEN others THEN NULL;
END $$;
