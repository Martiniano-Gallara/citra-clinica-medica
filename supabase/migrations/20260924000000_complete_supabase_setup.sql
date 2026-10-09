-- ====================================================================
-- CITRA · Centro Integral de Traumatología & Rehabilitación Arroyito
-- SCRIPT MAESTRO DE CONFIGURACIÓN Y SINCRONIZACIÓN SUPABASE (PostgreSQL 15+)
-- Cumplimiento: Ley 26.529, Ley 25.506 (Firma Digital), Ley 27.553 (ReNaPDiS), Ley 25.326
-- ====================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tipos Enumerados (ENUMs)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'doctor', 'administrative', 'patient');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pendiente', 'confirmado', 'en_sala', 'atendido', 'cancelado', 'ausente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prescription_status AS ENUM ('activa', 'dispensada', 'vencida', 'anulada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE study_status AS ENUM ('solicitado', 'en_proceso', 'completado', 'entregado', 'pendiente', 'realizado', 'informado', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Perfiles de Usuario (vinculados a Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    dni VARCHAR(20) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email VARCHAR(200) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role user_role NOT NULL DEFAULT 'patient',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Especialidades Médicas
CREATE TABLE IF NOT EXISTS specialties (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Especialidades',
    color VARCHAR(30) DEFAULT '#002182',
    icon VARCHAR(50) DEFAULT 'Stethoscope',
    estimated_duration INT DEFAULT 30,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Consultorios (Rooms)
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    floor VARCHAR(50) DEFAULT 'Piso 1',
    branch_id VARCHAR(50) DEFAULT 'branch-1',
    specialty VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Disponible',
    equipment TEXT DEFAULT 'Camilla ergonómica, escritorio médico',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Obras Sociales y Prepagas
CREATE TABLE IF NOT EXISTS health_insurances (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    logo_url TEXT,
    plans JSONB DEFAULT '[]'::jsonb,
    copay NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Activa',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Profesionales Médicos (Cuerpo Médico - 13 Especialistas Reales)
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    license VARCHAR(100) NOT NULL,
    sisa_refeps VARCHAR(100),
    specialty_id VARCHAR(50) REFERENCES specialties(id) ON DELETE SET NULL,
    specialty_name VARCHAR(150) NOT NULL,
    room_id VARCHAR(50) REFERENCES rooms(id) ON DELETE SET NULL,
    room_name VARCHAR(150),
    email VARCHAR(200) UNIQUE NOT NULL,
    phone VARCHAR(50),
    color VARCHAR(30) DEFAULT '#002182',
    avatar_url TEXT,
    experience TEXT,
    bio TEXT,
    price_consultation NUMERIC(10,2) DEFAULT 25000,
    fee_percentage NUMERIC(5,2) DEFAULT 75,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    working_days TEXT[] DEFAULT ARRAY['Lunes','Miércoles','Viernes'],
    schedule_start TIME DEFAULT '08:00',
    schedule_end TIME DEFAULT '14:00',
    slot_duration INT DEFAULT 30,
    accepted_insurances TEXT[] DEFAULT ARRAY['hi-1','hi-2','hi-3','hi-7'],
    blocked_dates DATE[] DEFAULT ARRAY[]::DATE[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Padrón de Pacientes
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    birth_date DATE,
    gender VARCHAR(20),
    blood_type VARCHAR(10) DEFAULT 'N/E',
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(50),
    insurance_id VARCHAR(50) REFERENCES health_insurances(id) ON DELETE SET NULL,
    insurance_name VARCHAR(150) DEFAULT 'Particular',
    insurance_plan VARCHAR(100) DEFAULT 'Plan Estándar',
    insurance_number VARCHAR(100),
    assigned_doctor_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    registered_at DATE DEFAULT CURRENT_DATE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Horarios Generales de la Clínica
CREATE TABLE IF NOT EXISTS clinic_schedules (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main-schedule',
    opening_time TIME DEFAULT '08:00',
    closing_time TIME DEFAULT '20:00',
    saturday_closing_time TIME DEFAULT '13:00',
    slot_duration INT DEFAULT 30,
    working_days TEXT[] DEFAULT ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
    blocked_dates DATE[] DEFAULT ARRAY['2026-12-25'::date, '2027-01-01'::date],
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Turnos / Citas Médicas
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    patient_phone VARCHAR(50),
    patient_email VARCHAR(200),
    patient_insurance VARCHAR(150),
    patient_insurance_number VARCHAR(100),
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    doctor_name VARCHAR(200) NOT NULL,
    doctor_specialty VARCHAR(150) NOT NULL,
    room_id VARCHAR(50) REFERENCES rooms(id) ON DELETE SET NULL,
    room_name VARCHAR(150),
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INT DEFAULT 30,
    type VARCHAR(50) DEFAULT 'Consulta Presencial',
    status appointment_status DEFAULT 'confirmado',
    reason TEXT,
    cancel_reason TEXT,
    cancelled_at TIMESTAMPTZ DEFAULT NULL,
    copay_amount NUMERIC(10,2) DEFAULT 0,
    booked_online BOOLEAN DEFAULT FALSE,
    booking_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_appointment
ON appointments (doctor_id, date, time)
WHERE status != 'cancelado';

CREATE UNIQUE INDEX IF NOT EXISTS idx_no_duplicate_appointment
ON appointments (doctor_id, date, time)
WHERE status != 'cancelado';

-- 11. Historias Clínicas Electrónicas (HCE) - Ley 26.529 y Ley 25.506
CREATE TABLE IF NOT EXISTS consultations (
    id VARCHAR(50) PRIMARY KEY,
    appointment_id VARCHAR(50) REFERENCES appointments(id) ON DELETE RESTRICT,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    doctor_name VARCHAR(200) NOT NULL,
    doctor_license VARCHAR(100) NOT NULL,
    sisa_refeps VARCHAR(100),
    specialty_name VARCHAR(150) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME NOT NULL DEFAULT CURRENT_TIME,
    reason TEXT NOT NULL,
    symptoms TEXT,
    vitals JSONB DEFAULT '{}'::jsonb,
    diagnosis TEXT NOT NULL,
    secondary_diagnosis TEXT,
    evolution TEXT NOT NULL,
    prescriptions JSONB DEFAULT '[]'::jsonb,
    indications TEXT,
    studies_requested TEXT[] DEFAULT ARRAY[]::TEXT[],
    signed BOOLEAN DEFAULT TRUE,
    signature_type VARCHAR(100) DEFAULT 'Firma Digital X.509 (PKI ONTI)',
    cert_authority VARCHAR(150) DEFAULT 'AC ONTI / Ministerio de Modernización Argentina',
    signature_timestamp TIMESTAMPTZ DEFAULT NOW(),
    integrity_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Adendas Clínicas (Inmutabilidad de HCE)
CREATE TABLE IF NOT EXISTS consultation_adendas (
    id VARCHAR(50) PRIMARY KEY,
    consultation_id VARCHAR(50) NOT NULL REFERENCES consultations(id) ON DELETE RESTRICT,
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    doctor_name VARCHAR(200) NOT NULL,
    doctor_license VARCHAR(100),
    note TEXT NOT NULL,
    reason VARCHAR(250),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    integrity_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Recetas Electrónicas Oficiales (ReNaPDiS - Ley 27.553)
CREATE TABLE IF NOT EXISTS electronic_prescriptions (
    id VARCHAR(50) PRIMARY KEY,
    cuir VARCHAR(100) UNIQUE NOT NULL,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    doctor_name VARCHAR(200) NOT NULL,
    doctor_license VARCHAR(100) NOT NULL,
    sisa_refeps VARCHAR(100),
    diagnosis_presuntivo TEXT NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE NOT NULL,
    status prescription_status DEFAULT 'activa',
    verification_url TEXT,
    dispensation_status VARCHAR(50) DEFAULT 'Pendiente',
    dispensed_pharmacy VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Diagnóstico por Imágenes & Radiología
CREATE TABLE IF NOT EXISTS imaging_studies (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    study_type VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE SET NULL,
    referring_doctor VARCHAR(200) NOT NULL,
    status study_status DEFAULT 'solicitado',
    report TEXT,
    findings TEXT,
    conclusion TEXT,
    radiologist VARCHAR(150),
    images JSONB DEFAULT '[]'::jsonb,
    priority VARCHAR(20) DEFAULT 'Normal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Órdenes y Certificados Médicos
CREATE TABLE IF NOT EXISTS medical_orders (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE SET NULL,
    doctor_name VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL,
    instructions TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_certificates (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20),
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE SET NULL,
    doctor_name VARCHAR(200) NOT NULL,
    doctor_license VARCHAR(50),
    doctor_specialty VARCHAR(100),
    certificate_type VARCHAR(100) DEFAULT 'Certificado de Reposo',
    diagnosis TEXT NOT NULL,
    rest_days INT DEFAULT 0,
    rest_start_date DATE,
    rest_end_date DATE,
    content TEXT,
    observations TEXT,
    signature_hash VARCHAR(64),
    qr_verification_url TEXT,
    signed BOOLEAN DEFAULT TRUE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Kinesiología & Rehabilitación
CREATE TABLE IF NOT EXISTS rehab_plans (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE RESTRICT,
    prescribing_doctor VARCHAR(200) NOT NULL,
    diagnosis TEXT NOT NULL,
    target_sessions INT DEFAULT 10,
    completed_sessions INT DEFAULT 0,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'En curso',
    goals TEXT,
    exercises JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sesiones de Rehabilitación (C05, T8)
CREATE TABLE IF NOT EXISTS rehab_sessions (
    id VARCHAR(50) PRIMARY KEY,
    plan_id VARCHAR(50) REFERENCES rehab_plans(id) ON DELETE CASCADE,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    therapist_id VARCHAR(50) REFERENCES doctors(id) ON DELETE RESTRICT,
    therapist_name VARCHAR(200) NOT NULL,
    session_number INT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time VARCHAR(10) DEFAULT '09:00',
    eva_score INT CHECK (eva_score BETWEEN 0 AND 10),
    procedures JSONB DEFAULT '[]'::jsonb,
    patient_tolerance VARCHAR(50) DEFAULT 'Buena',
    next_session_planned TEXT,
    voided_at TIMESTAMPTZ,
    void_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Consentimientos Informados (Ley 26.529 Art. 5 a 10)
CREATE TABLE IF NOT EXISTS consent_forms (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
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

-- 18. Registro Inmutable de Auditoría (Ley 25.326 y Ley 26.529 / ALTA-01)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('aud-' || gen_random_uuid()::text),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id VARCHAR(100),
    user_name VARCHAR(200) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    target_dni VARCHAR(20) DEFAULT '-',
    details TEXT,
    ip_address VARCHAR(50),
    event_hash VARCHAR(64) NOT NULL DEFAULT encode(digest(gen_random_uuid()::text, 'sha256'), 'hex'),
    module VARCHAR(100),
    target_id VARCHAR(100)
);

-- Asegurar defaults en instalaciones existentes
ALTER TABLE audit_logs ALTER COLUMN id SET DEFAULT ('aud-' || gen_random_uuid()::text);
ALTER TABLE audit_logs ALTER COLUMN event_hash SET DEFAULT encode(digest(gen_random_uuid()::text, 'sha256'), 'hex');

-- 19. Configuración Institucional Dedicada (C09)
CREATE TABLE IF NOT EXISTS clinic_settings (
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

-- 20. Turnos y Movimientos de Caja Transaccional (M08)
CREATE TABLE IF NOT EXISTS cash_shifts (
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
ON cash_shifts (user_id) WHERE status = 'open';

CREATE TABLE IF NOT EXISTS cash_movements (
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

-- 21. Facturación y Comprobantes Fiscales ARCA (A-04, A3-16, V4-A4)
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL,
    cae VARCHAR(30),
    cae_vto DATE,
    pto_vta INTEGER NOT NULL DEFAULT 1,
    tipo_cmp INTEGER NOT NULL DEFAULT 6,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    total NUMERIC(12,2) NOT NULL CHECK (total > 0),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    concept VARCHAR(200) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
    status VARCHAR(30) NOT NULL DEFAULT 'Cobrado',
    arca_validated BOOLEAN NOT NULL DEFAULT false,
    receipt_number VARCHAR(50),
    related_invoice_id VARCHAR(50) REFERENCES invoices(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ALTER COLUMN cae DROP NOT NULL;
ALTER TABLE public.invoices ALTER COLUMN cae_vto DROP NOT NULL;
CREATE SEQUENCE IF NOT EXISTS public.seq_credit_note_number START 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_invoice_number ON invoices (pto_vta, tipo_cmp, invoice_number);

-- 21. Helpers y Funciones de Seguridad
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = pg_catalog, public
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        'patient'::user_role
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);

    -- V4-A1: Auto-vincular ficha de paciente SOLO SI el email ya fue confirmado
    -- (e.g. cuentas creadas por admin-create-user con email_confirm: true)
    IF NEW.email_confirmed_at IS NOT NULL THEN
        BEGIN
            PERFORM set_config('citra.system_link', 'on', true);
            UPDATE public.patients
            SET user_id = NEW.id
            WHERE user_id IS NULL
              AND email IS NOT NULL
              AND lower(email) = lower(NEW.email);
            PERFORM set_config('citra.system_link', 'off', true);
        EXCEPTION WHEN OTHERS THEN
            PERFORM set_config('citra.system_link', 'off', true);
            RAISE WARNING 'Aviso: No se pudo auto-vincular la ficha del paciente en handle_new_auth_user: %', SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- V4-A1: Auto-vincular ficha al confirmar el correo (AFTER UPDATE OF email_confirmed_at)
CREATE OR REPLACE FUNCTION public.link_patient_on_confirm()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public
LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
        BEGIN
            PERFORM set_config('citra.system_link', 'on', true);
            UPDATE public.patients
            SET user_id = NEW.id
            WHERE user_id IS NULL
              AND email IS NOT NULL
              AND lower(email) = lower(NEW.email);
            PERFORM set_config('citra.system_link', 'off', true);
        EXCEPTION WHEN OTHERS THEN
            PERFORM set_config('citra.system_link', 'off', true);
            RAISE WARNING 'Aviso: No se pudo auto-vincular la ficha del paciente en link_patient_on_confirm: %', SQLERRM;
        END;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.link_patient_on_confirm();

-- A3-05: El rol solo es válido si el usuario se encuentra activo
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = TRUE;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(public.get_auth_role() = 'superadmin', false);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE OR REPLACE FUNCTION public.is_administrative()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(public.get_auth_role() IN ('administrative', 'superadmin'), false);
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
    ) OR EXISTS (
        SELECT 1 FROM public.clinical_access_grants
        WHERE patient_id = p_patient_id
          AND requester_doctor_id = p_doctor_id
          AND status = 'approved'
          AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_catalog;

-- T16: Prevención de oráculo en funciones internas (acceso exclusivo para usuarios autenticados)
REVOKE EXECUTE ON FUNCTION public.get_auth_role() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_superadmin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_administrative() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_doctor() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_current_doctor_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_current_patient_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.doctor_treats_patient(VARCHAR, VARCHAR) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.doctor_treats_patient(VARCHAR, VARCHAR) TO authenticated;

-- V2-A3 / V4-M2: Vinculación formal de credenciales de auth a profesionales médicos por Superadmin o service_role
CREATE OR REPLACE FUNCTION public.link_doctor_account(
    p_doctor_id VARCHAR,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT (public.is_superadmin() OR auth.role() = 'service_role' OR current_setting('request.jwt.claim.role', true) = 'service_role') THEN
        RAISE EXCEPTION 'Solo un superadministrador puede vincular cuentas de profesionales';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.doctors WHERE id = p_doctor_id) THEN
        RAISE EXCEPTION 'Profesional % no encontrado', p_doctor_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'Usuario auth % no encontrado', p_user_id;
    END IF;

    UPDATE public.doctors
    SET user_id = p_user_id
    WHERE id = p_doctor_id;

    UPDATE public.profiles
    SET role = 'doctor'::public.user_role
    WHERE id = p_user_id AND role = 'patient'::public.user_role;

    RETURN jsonb_build_object(
        'success', true,
        'doctor_id', p_doctor_id,
        'user_id', p_user_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_doctor_account(VARCHAR, UUID) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.link_doctor_account(VARCHAR, UUID) FROM anon;

-- T9: Vista segura de catálogo público de profesionales (oculta datos confidenciales y honorarios)
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

-- 22. Habilitar RLS en Todas las Tablas
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


-- V3-B4 / V4-A2: Tabla inmutable de archivos y adjuntos de pacientes (Append-Only)
CREATE TABLE IF NOT EXISTS public.patient_files (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('pf-' || gen_random_uuid()::text),
    patient_id VARCHAR(50) NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    sha256 VARCHAR(64),
    category VARCHAR(50) DEFAULT 'Adjunto',
    uploaded_by UUID DEFAULT auth.uid() REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patient_files ALTER COLUMN id SET DEFAULT ('pf-' || gen_random_uuid()::text);
ALTER TABLE public.patient_files ALTER COLUMN uploaded_by SET DEFAULT auth.uid();

ALTER TABLE public.patient_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_files_select_policy" ON public.patient_files;
CREATE POLICY "patient_files_select_policy" ON public.patient_files
FOR SELECT USING (
    public.is_administrative() OR
    (public.is_doctor() AND public.doctor_treats_patient(patient_id, public.get_current_doctor_id())) OR
    (auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = patient_files.patient_id AND p.user_id = auth.uid()
    ))
);

-- V4-B1: uploaded_by IS NOT DISTINCT FROM auth.uid() impide falsificar autoría del archivo adjunto
DROP POLICY IF EXISTS "patient_files_insert_policy" ON public.patient_files;
CREATE POLICY "patient_files_insert_policy" ON public.patient_files
FOR INSERT WITH CHECK (
    (
        public.is_administrative() OR
        (public.is_doctor() AND public.doctor_treats_patient(patient_id, public.get_current_doctor_id())) OR
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = patient_files.patient_id AND p.user_id = auth.uid()
        ))
    )
    AND uploaded_by IS NOT DISTINCT FROM auth.uid()
);

DROP POLICY IF EXISTS "patient_files_update_policy" ON public.patient_files;
CREATE POLICY "patient_files_update_policy" ON public.patient_files FOR UPDATE USING (false);

DROP POLICY IF EXISTS "patient_files_delete_policy" ON public.patient_files;
CREATE POLICY "patient_files_delete_policy" ON public.patient_files FOR DELETE USING (false);

CREATE OR REPLACE FUNCTION public.protect_patient_file_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Los archivos y adjuntos clínicos de pacientes son estrictamente inmutables (Ley 26.529).';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_patient_file_immutability ON public.patient_files;
CREATE TRIGGER trg_protect_patient_file_immutability
BEFORE UPDATE OR DELETE ON public.patient_files
FOR EACH ROW EXECUTE FUNCTION public.protect_patient_file_immutability();

ALTER TABLE public.patient_files FORCE ROW LEVEL SECURITY;

-- V4-A2: Migración idempotente de archivos históricos almacenados en patients.files
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'files'
    ) THEN
        INSERT INTO public.patient_files (id, patient_id, file_name, file_url, file_size, mime_type, sha256, category, created_at)
        SELECT 
            COALESCE(elem->>'id', 'pf-' || gen_random_uuid()::text),
            p.id,
            COALESCE(elem->>'name', elem->>'fileName', 'archivo'),
            COALESCE(elem->>'storagePath', elem->>'url', ''),
            (elem->>'size')::bigint,
            COALESCE(elem->>'type', elem->>'mimeType'),
            COALESCE(elem->>'sha256', elem->>'hashSha256', elem->>'hash'),
            COALESCE(elem->>'category', 'Adjunto'),
            NOW()
        FROM public.patients p,
             jsonb_array_elements(CASE WHEN jsonb_typeof(p.files::jsonb) = 'array' THEN p.files::jsonb ELSE '[]'::jsonb END) AS elem
        ON CONFLICT (id) DO NOTHING;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 23. Políticas RLS Endurecidas (Sin duplicados y con status = 'cancelado')

-- A3-05: Protección de ciclo de vida de perfiles (solo superadmin o service_role puede modificar roles o reactivar)
CREATE OR REPLACE FUNCTION public.protect_profile_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL THEN
        IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active) THEN
            IF NOT (public.is_superadmin() OR auth.role() = 'service_role' OR current_setting('request.jwt.claim.role', true) = 'service_role' OR current_setting('citra.system_link', true) = 'on') THEN
                RAISE EXCEPTION 'Solo un superadministrador puede modificar el rol o el estado activo/inactivo de una cuenta.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_profile_lifecycle ON public.profiles;
CREATE TRIGGER trg_protect_profile_lifecycle
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_lifecycle();

DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (id = auth.uid() OR public.is_administrative());
DROP POLICY IF EXISTS "profiles_update_self_policy" ON profiles;
CREATE POLICY "profiles_update_self_policy" ON profiles FOR UPDATE USING (
    id = auth.uid() OR public.is_superadmin()
) WITH CHECK (
    ((id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()) AND is_active = (SELECT is_active FROM profiles WHERE id = auth.uid())) OR public.is_superadmin())
);

DROP POLICY IF EXISTS "specialties_public_select" ON specialties;
CREATE POLICY "specialties_public_select" ON specialties FOR SELECT USING (true);
DROP POLICY IF EXISTS "specialties_admin_all" ON specialties;
CREATE POLICY "specialties_admin_all" ON specialties FOR ALL USING (public.is_administrative());

DROP POLICY IF EXISTS "rooms_public_select" ON rooms;
CREATE POLICY "rooms_public_select" ON rooms FOR SELECT USING (true);
DROP POLICY IF EXISTS "rooms_admin_all" ON rooms;
CREATE POLICY "rooms_admin_all" ON rooms FOR ALL USING (public.is_administrative());

DROP POLICY IF EXISTS "health_insurances_public_select" ON health_insurances;
CREATE POLICY "health_insurances_public_select" ON health_insurances FOR SELECT USING (true);
DROP POLICY IF EXISTS "insurances_admin_all" ON health_insurances;
CREATE POLICY "insurances_admin_all" ON health_insurances FOR ALL USING (public.is_administrative());

-- A3-14: Protección de datos profesionales médicos (solo superadmin puede modificar matrícula o especialidad)
CREATE OR REPLACE FUNCTION public.protect_doctor_professional_data()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL AND NOT public.is_superadmin() THEN
        IF NEW.license IS DISTINCT FROM OLD.license OR
           NEW.sisa_refeps IS DISTINCT FROM OLD.sisa_refeps OR
           NEW.specialty_id IS DISTINCT FROM OLD.specialty_id OR
           NEW.specialty_name IS DISTINCT FROM OLD.specialty_name OR
           NEW.user_id IS DISTINCT FROM OLD.user_id THEN
            RAISE EXCEPTION 'Solo un superadministrador puede modificar la matrícula, REFEPS, especialidad o vinculación de cuenta de un profesional.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_doctor_professional_data ON public.doctors;
CREATE TRIGGER trg_protect_doctor_professional_data
BEFORE UPDATE ON public.doctors
FOR EACH ROW EXECUTE FUNCTION public.protect_doctor_professional_data();

DROP POLICY IF EXISTS "doctors_public_select" ON doctors;
DROP POLICY IF EXISTS "doctors_select_policy" ON doctors;
CREATE POLICY "doctors_select_policy" ON doctors FOR SELECT USING (public.is_administrative() OR user_id = auth.uid());
DROP POLICY IF EXISTS "doctors_update_self" ON doctors;
CREATE POLICY "doctors_update_self" ON doctors FOR UPDATE USING (user_id = auth.uid() OR public.is_administrative());
DROP POLICY IF EXISTS "doctors_admin_insert" ON doctors;
CREATE POLICY "doctors_admin_insert" ON doctors FOR INSERT WITH CHECK (public.is_administrative());

DROP POLICY IF EXISTS "schedules_public_select" ON clinic_schedules;
CREATE POLICY "schedules_public_select" ON clinic_schedules FOR SELECT USING (true);
DROP POLICY IF EXISTS "schedules_admin_all" ON clinic_schedules;
CREATE POLICY "schedules_admin_all" ON clinic_schedules FOR ALL USING (public.is_administrative());

-- A3-06: Paciente autenticado solo puede registrar su propia ficha
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_unique_user_id ON public.patients (user_id) WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.enforce_patient_insert_ownership()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.is_administrative() THEN
        IF NEW.user_id IS NULL OR NEW.user_id != auth.uid() THEN
            RAISE EXCEPTION 'Un paciente solo puede registrar su propia ficha vinculada a su cuenta autenticada.';
        END IF;
        IF EXISTS (SELECT 1 FROM public.patients WHERE user_id = auth.uid() AND id != NEW.id) THEN
            RAISE EXCEPTION 'El usuario ya posee una ficha de paciente registrada en el sistema.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_patient_insert_ownership ON public.patients;
CREATE TRIGGER trg_enforce_patient_insert_ownership
BEFORE INSERT ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.enforce_patient_insert_ownership();

DROP POLICY IF EXISTS "patients_select_policy" ON patients;
CREATE POLICY "patients_select_policy" ON patients FOR SELECT USING (
    user_id = auth.uid() OR public.is_administrative() OR (public.is_doctor() AND public.doctor_treats_patient(patients.id, public.get_current_doctor_id()))
);
DROP POLICY IF EXISTS "patients_update_policy" ON patients;
CREATE POLICY "patients_update_policy" ON patients FOR UPDATE USING (user_id = auth.uid() OR public.is_administrative())
WITH CHECK (
    public.is_administrative() OR
    (user_id = auth.uid() AND user_id = (SELECT p.user_id FROM public.patients p WHERE p.id = patients.id))
);
DROP POLICY IF EXISTS "patients_insert_policy" ON patients;
CREATE POLICY "patients_insert_policy" ON patients FOR INSERT WITH CHECK (
    public.is_administrative() OR
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- A3-02: Bloqueo de mutación de patient_id y doctor_id en turnos
CREATE OR REPLACE FUNCTION public.prevent_appointment_identity_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL THEN
        IF (NEW.patient_id IS DISTINCT FROM OLD.patient_id OR NEW.doctor_id IS DISTINCT FROM OLD.doctor_id) THEN
            IF NOT public.is_administrative() THEN
                RAISE EXCEPTION 'No está permitido modificar el paciente o profesional de un turno existente.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_appointment_identity_mutation ON public.appointments;
CREATE TRIGGER trg_prevent_appointment_identity_mutation
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.prevent_appointment_identity_mutation();

DROP POLICY IF EXISTS "appointments_select_policy" ON appointments;
CREATE POLICY "appointments_select_policy" ON appointments FOR SELECT USING (patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative());
DROP POLICY IF EXISTS "appointments_insert_policy" ON appointments;
CREATE POLICY "appointments_insert_policy" ON appointments FOR INSERT WITH CHECK (patient_id = public.get_current_patient_id() OR public.is_administrative());
DROP POLICY IF EXISTS "appointments_update_policy" ON appointments;
CREATE POLICY "appointments_update_policy" ON appointments FOR UPDATE USING (
    patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative()
) WITH CHECK (
    (patient_id = public.get_current_patient_id() AND status = 'cancelado') OR doctor_id = public.get_current_doctor_id() OR public.is_administrative()
);

DROP POLICY IF EXISTS "consultations_select_policy" ON consultations;
CREATE POLICY "consultations_select_policy" ON consultations FOR SELECT USING (patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_superadmin());
DROP POLICY IF EXISTS "consultations_insert_policy" ON consultations;
CREATE POLICY "consultations_insert_policy" ON consultations FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id() AND public.doctor_treats_patient(patient_id, doctor_id)
);
DROP POLICY IF EXISTS "consultations_update_policy" ON consultations;
CREATE POLICY "consultations_update_policy" ON consultations FOR UPDATE USING (
    (public.is_doctor() AND doctor_id = public.get_current_doctor_id()) OR public.is_superadmin()
) WITH CHECK (
    (public.is_doctor() AND doctor_id = public.get_current_doctor_id()) OR public.is_superadmin()
);

-- A3-10: Adendas restringidas a consultas propias del profesional o superadmin
DROP POLICY IF EXISTS "adendas_select_policy" ON consultation_adendas;
CREATE POLICY "adendas_select_policy" ON consultation_adendas FOR SELECT USING (EXISTS (SELECT 1 FROM consultations c WHERE c.id = consultation_adendas.consultation_id AND (c.patient_id = public.get_current_patient_id() OR c.doctor_id = public.get_current_doctor_id() OR public.is_superadmin())));
DROP POLICY IF EXISTS "adendas_insert_policy" ON consultation_adendas;
CREATE POLICY "adendas_insert_policy" ON consultation_adendas FOR INSERT WITH CHECK (
    public.is_doctor() AND doctor_id = public.get_current_doctor_id()
    AND EXISTS (
        SELECT 1 FROM public.consultations c
        WHERE c.id = consultation_adendas.consultation_id
          AND (c.doctor_id = public.get_current_doctor_id() OR public.is_superadmin())
    )
);

-- A3-11: Transición estricta de recetas médicas e inmutabilidad de prescripción
CREATE OR REPLACE FUNCTION public.validate_prescription_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'anulada' THEN
        RAISE EXCEPTION 'No se pueden modificar recetas anuladas.';
    END IF;
    IF OLD.status = 'dispensada' AND NEW.status != 'dispensada' THEN
        RAISE EXCEPTION 'No se pueden revertir recetas ya dispensadas.';
    END IF;
    IF NEW.status = 'dispensada' THEN
        IF OLD.expiration_date < (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date THEN
            RAISE EXCEPTION 'No se puede dispensar una receta médica vencida (fecha de expiración: %).', OLD.expiration_date;
        END IF;
    END IF;
    IF NEW.status = 'anulada' THEN
        IF NOT (public.get_current_doctor_id() = OLD.doctor_id OR public.is_superadmin()) THEN
            RAISE EXCEPTION 'Solo el profesional emisor o un superadministrador puede anular una receta médica.';
        END IF;
    END IF;
    IF NEW.cuir IS DISTINCT FROM OLD.cuir OR
       NEW.patient_id IS DISTINCT FROM OLD.patient_id OR
       NEW.doctor_id IS DISTINCT FROM OLD.doctor_id OR
       NEW.medications IS DISTINCT FROM OLD.medications OR
       NEW.issue_date IS DISTINCT FROM OLD.issue_date OR
       NEW.expiration_date IS DISTINCT FROM OLD.expiration_date THEN
        RAISE EXCEPTION 'Los datos farmacológicos y de prescripción de una receta médica son estrictamente inmutables (Ley 27.553).';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_prescription_transition ON public.electronic_prescriptions;
CREATE TRIGGER trg_validate_prescription_transition
BEFORE UPDATE ON public.electronic_prescriptions
FOR EACH ROW EXECUTE FUNCTION public.validate_prescription_transition();

DROP POLICY IF EXISTS "prescriptions_select_policy" ON electronic_prescriptions;
CREATE POLICY "prescriptions_select_policy" ON electronic_prescriptions FOR SELECT USING (patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative());
DROP POLICY IF EXISTS "prescriptions_insert_policy" ON electronic_prescriptions;
CREATE POLICY "prescriptions_insert_policy" ON electronic_prescriptions FOR INSERT WITH CHECK (public.is_doctor() AND doctor_id = public.get_current_doctor_id());
DROP POLICY IF EXISTS "prescriptions_update_policy" ON electronic_prescriptions;
CREATE POLICY "prescriptions_update_policy" ON electronic_prescriptions FOR UPDATE USING (
    doctor_id = public.get_current_doctor_id() OR public.is_administrative()
) WITH CHECK (
    status IN ('dispensada', 'anulada') AND (doctor_id = public.get_current_doctor_id() OR public.is_administrative())
);

-- A3-13: Inmutabilidad de paciente en estudios de imágenes
CREATE OR REPLACE FUNCTION public.protect_imaging_patient_identity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.patient_id IS DISTINCT FROM OLD.patient_id THEN
        RAISE EXCEPTION 'No está permitido reasignar el paciente de un estudio de imágenes.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_imaging_patient_identity ON public.imaging_studies;
CREATE TRIGGER trg_protect_imaging_patient_identity
BEFORE UPDATE ON public.imaging_studies
FOR EACH ROW EXECUTE FUNCTION public.protect_imaging_patient_identity();

DROP POLICY IF EXISTS "imaging_select_policy" ON imaging_studies;
CREATE POLICY "imaging_select_policy" ON imaging_studies FOR SELECT USING (patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative());
DROP POLICY IF EXISTS "imaging_insert_policy" ON imaging_studies;
CREATE POLICY "imaging_insert_policy" ON imaging_studies FOR INSERT WITH CHECK (public.is_doctor() OR public.is_administrative());
DROP POLICY IF EXISTS "imaging_update_policy" ON imaging_studies;
CREATE POLICY "imaging_update_policy" ON imaging_studies FOR UPDATE USING (public.is_administrative() OR doctor_id = public.get_current_doctor_id());

DROP POLICY IF EXISTS "orders_select_policy" ON medical_orders;
CREATE POLICY "orders_select_policy" ON medical_orders FOR SELECT USING (patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative());
DROP POLICY IF EXISTS "orders_insert_policy" ON medical_orders;
CREATE POLICY "orders_insert_policy" ON medical_orders FOR INSERT WITH CHECK (public.is_doctor() AND doctor_id = public.get_current_doctor_id());

DROP POLICY IF EXISTS "certificates_select_policy" ON medical_certificates;
CREATE POLICY "certificates_select_policy" ON medical_certificates FOR SELECT USING (patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative());
DROP POLICY IF EXISTS "certificates_insert_policy" ON medical_certificates;
CREATE POLICY "certificates_insert_policy" ON medical_certificates FOR INSERT WITH CHECK (public.is_doctor() AND doctor_id = public.get_current_doctor_id());

DROP POLICY IF EXISTS "consent_forms_select_policy" ON consent_forms;
CREATE POLICY "consent_forms_select_policy" ON consent_forms FOR SELECT USING (patient_id = public.get_current_patient_id() OR doctor_id = public.get_current_doctor_id() OR public.is_administrative());
DROP POLICY IF EXISTS "consent_forms_insert_policy" ON consent_forms;
CREATE POLICY "consent_forms_insert_policy" ON consent_forms FOR INSERT WITH CHECK (public.is_doctor() AND doctor_id = public.get_current_doctor_id());
DROP POLICY IF EXISTS "consent_forms_update_policy" ON consent_forms;
CREATE POLICY "consent_forms_update_policy" ON consent_forms FOR UPDATE USING (doctor_id = public.get_current_doctor_id() OR patient_id = public.get_current_patient_id() OR public.is_superadmin());

-- A3-12: Planes de rehabilitación filtrados por médico tratante
DROP POLICY IF EXISTS "rehab_plans_select_policy" ON rehab_plans;
CREATE POLICY "rehab_plans_select_policy" ON rehab_plans FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR (public.is_doctor() AND public.doctor_treats_patient(patient_id, public.get_current_doctor_id()))
    OR public.is_administrative()
);
DROP POLICY IF EXISTS "rehab_plans_insert_policy" ON rehab_plans;
CREATE POLICY "rehab_plans_insert_policy" ON rehab_plans FOR INSERT WITH CHECK (public.is_doctor() AND doctor_id = public.get_current_doctor_id() AND public.doctor_treats_patient(patient_id, doctor_id));
DROP POLICY IF EXISTS "rehab_plans_update_policy" ON rehab_plans;
CREATE POLICY "rehab_plans_update_policy" ON rehab_plans FOR UPDATE USING (public.is_doctor() AND doctor_id = public.get_current_doctor_id()) WITH CHECK (public.is_doctor() AND doctor_id = public.get_current_doctor_id());
DROP POLICY IF EXISTS "rehab_plans_delete_policy" ON rehab_plans;
CREATE POLICY "rehab_plans_delete_policy" ON rehab_plans FOR DELETE USING ((public.is_doctor() AND doctor_id = public.get_current_doctor_id()) OR public.is_superadmin());

DROP POLICY IF EXISTS "rehab_sessions_select_policy" ON rehab_sessions;
CREATE POLICY "rehab_sessions_select_policy" ON rehab_sessions FOR SELECT USING (
    patient_id = public.get_current_patient_id()
    OR (public.is_doctor() AND public.doctor_treats_patient(patient_id, public.get_current_doctor_id()))
    OR public.is_administrative()
);
DROP POLICY IF EXISTS "rehab_sessions_insert_policy" ON rehab_sessions;
CREATE POLICY "rehab_sessions_insert_policy" ON rehab_sessions FOR INSERT WITH CHECK ((public.is_doctor() AND therapist_id = public.get_current_doctor_id()) OR public.is_superadmin());
DROP POLICY IF EXISTS "rehab_sessions_update_policy" ON rehab_sessions;
CREATE POLICY "rehab_sessions_update_policy" ON rehab_sessions FOR UPDATE USING ((public.is_doctor() AND therapist_id = public.get_current_doctor_id()) OR public.is_superadmin());
DROP POLICY IF EXISTS "rehab_sessions_delete_policy" ON rehab_sessions;
CREATE POLICY "rehab_sessions_delete_policy" ON rehab_sessions FOR DELETE USING ((public.is_doctor() AND therapist_id = public.get_current_doctor_id()) OR public.is_superadmin());

-- A3-17: Auditoría append-only y sin user_id nulo para usuarios autenticados
CREATE OR REPLACE FUNCTION public.protect_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF auth.uid() IS NOT NULL THEN
            NEW.user_id := auth.uid()::text;
        END IF;
        NEW.timestamp := NOW();
        RETURN NEW;
    ELSIF TG_OP IN ('UPDATE', 'DELETE') THEN
        RAISE EXCEPTION 'La tabla audit_logs es estrictamente append-only; no admite modificaciones ni eliminaciones.';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_audit_logs ON public.audit_logs;
CREATE TRIGGER trg_protect_audit_logs
BEFORE INSERT OR UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.protect_audit_logs();

DROP POLICY IF EXISTS "audit_logs_select_policy" ON audit_logs;
CREATE POLICY "audit_logs_select_policy" ON audit_logs FOR SELECT USING (public.is_superadmin());
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON audit_logs FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()::text
);

DROP POLICY IF EXISTS "clinic_settings_select_policy" ON clinic_settings;
CREATE POLICY "clinic_settings_select_policy" ON clinic_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "clinic_settings_admin_all" ON clinic_settings;
CREATE POLICY "clinic_settings_admin_all" ON clinic_settings FOR ALL USING (public.is_administrative());

-- A3-15: Control de caja transaccional, bloqueo de movimientos en caja cerrada y protección de totales
CREATE OR REPLACE FUNCTION public.check_cash_shift_open()
RETURNS TRIGGER AS $$
DECLARE
    v_status VARCHAR;
BEGIN
    SELECT status INTO v_status FROM public.cash_shifts WHERE id = NEW.shift_id;
    IF v_status IS NULL THEN
        RAISE EXCEPTION 'El turno de caja especificado (%) no existe.', NEW.shift_id;
    END IF;
    IF v_status = 'closed' THEN
        RAISE EXCEPTION 'No se pueden registrar movimientos en un turno de caja cerrado (%).', NEW.shift_id;
    END IF;
    NEW.created_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_cash_shift_open ON public.cash_movements;
CREATE TRIGGER trg_check_cash_shift_open
BEFORE INSERT ON public.cash_movements
FOR EACH ROW EXECUTE FUNCTION public.check_cash_shift_open();

CREATE OR REPLACE FUNCTION public.protect_cash_shift_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'closed' AND NEW.status != 'closed' AND NOT public.is_superadmin() THEN
            RAISE EXCEPTION 'No se permite reabrir un turno de caja cerrado.';
        END IF;
        IF OLD.status = 'closed' AND NOT public.is_superadmin() THEN
            RAISE EXCEPTION 'Los datos de un turno de caja cerrado son inmutables.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_cash_shift_totals ON public.cash_shifts;
CREATE TRIGGER trg_protect_cash_shift_totals
BEFORE UPDATE ON public.cash_shifts
FOR EACH ROW EXECUTE FUNCTION public.protect_cash_shift_totals();

DROP POLICY IF EXISTS "cash_shifts_admin_all" ON cash_shifts;
DROP POLICY IF EXISTS "cash_shifts_select_policy" ON cash_shifts;
CREATE POLICY "cash_shifts_select_policy" ON cash_shifts FOR SELECT USING (public.is_administrative());
DROP POLICY IF EXISTS "cash_shifts_insert_policy" ON cash_shifts;
CREATE POLICY "cash_shifts_insert_policy" ON cash_shifts FOR INSERT WITH CHECK (public.is_administrative());
DROP POLICY IF EXISTS "cash_shifts_update_policy" ON cash_shifts;
CREATE POLICY "cash_shifts_update_policy" ON cash_shifts FOR UPDATE USING (public.is_administrative());
DROP POLICY IF EXISTS "cash_shifts_delete_policy" ON cash_shifts;
CREATE POLICY "cash_shifts_delete_policy" ON cash_shifts FOR DELETE USING (public.is_superadmin());

DROP POLICY IF EXISTS "cash_movements_admin_all" ON cash_movements;
DROP POLICY IF EXISTS "cash_movements_select_policy" ON cash_movements;
CREATE POLICY "cash_movements_select_policy" ON cash_movements FOR SELECT USING (public.is_administrative());
DROP POLICY IF EXISTS "cash_movements_insert_policy" ON cash_movements;
CREATE POLICY "cash_movements_insert_policy" ON cash_movements FOR INSERT WITH CHECK (public.is_administrative());
DROP POLICY IF EXISTS "cash_movements_update_policy" ON cash_movements;
CREATE POLICY "cash_movements_update_policy" ON cash_movements FOR UPDATE USING (public.is_superadmin());
DROP POLICY IF EXISTS "cash_movements_delete_policy" ON cash_movements;
CREATE POLICY "cash_movements_delete_policy" ON cash_movements FOR DELETE USING (public.is_superadmin());

-- A3-16: Inmutabilidad fiscal estricta de facturas
CREATE OR REPLACE FUNCTION public.protect_invoice_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.invoice_number IS DISTINCT FROM OLD.invoice_number OR
           NEW.cae IS DISTINCT FROM OLD.cae OR
           NEW.total IS DISTINCT FROM OLD.total OR
           NEW.subtotal IS DISTINCT FROM OLD.subtotal OR
           NEW.patient_id IS DISTINCT FROM OLD.patient_id OR
           NEW.date IS DISTINCT FROM OLD.date THEN
            RAISE EXCEPTION 'Los datos fiscales de un comprobante de facturación son estrictamente inmutables.';
        END IF;
    END IF;
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'No se permite eliminar comprobantes de facturación (deben anularse mediante Nota de Crédito).';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_invoice_immutability ON public.invoices;
CREATE TRIGGER trg_protect_invoice_immutability
BEFORE UPDATE OR DELETE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.protect_invoice_immutability();

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_admin_all" ON invoices;
DROP POLICY IF EXISTS "invoices_select_policy" ON invoices;
CREATE POLICY "invoices_select_policy" ON invoices FOR SELECT USING (patient_id = public.get_current_patient_id() OR public.is_administrative());
DROP POLICY IF EXISTS "invoices_insert_policy" ON invoices;
CREATE POLICY "invoices_insert_policy" ON invoices FOR INSERT WITH CHECK (public.is_administrative());
DROP POLICY IF EXISTS "invoices_update_policy" ON invoices;
CREATE POLICY "invoices_update_policy" ON invoices FOR UPDATE USING (false);

-- V3-M3: Emisión de Nota de Crédito para anulación fiscal autoritativa (Ley 26.529 / ARCA)
CREATE OR REPLACE FUNCTION public.issue_credit_note(
    p_invoice_id VARCHAR,
    p_reason TEXT DEFAULT 'Anulación por error de facturación'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_orig public.invoices%ROWTYPE;
    v_nc_id VARCHAR;
    v_nc_number VARCHAR;
    v_nc_tipo_cmp INT;
    v_existing_nc_count INT;
BEGIN
    IF NOT public.is_administrative() THEN
        RAISE EXCEPTION 'Operación denegada: Solo personal administrativo puede emitir notas de crédito.';
    END IF;

    SELECT * INTO v_orig FROM public.invoices WHERE id = p_invoice_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Comprobante original % no encontrado.', p_invoice_id;
    END IF;

    IF v_orig.tipo_cmp IN (3, 8, 13) THEN
        RAISE EXCEPTION 'No se puede emitir una nota de crédito sobre otra nota de crédito.';
    END IF;

    SELECT count(*) INTO v_existing_nc_count
    FROM public.invoices
    WHERE related_invoice_id = p_invoice_id;

    IF v_existing_nc_count > 0 THEN
        RAISE EXCEPTION 'El comprobante ya posee una nota de crédito emitida.';
    END IF;

    -- Mapeo ARCA Factura -> Nota de Crédito: 1->3, 6->8, 11->13
    v_nc_tipo_cmp := CASE v_orig.tipo_cmp
        WHEN 1 THEN 3
        WHEN 6 THEN 8
        WHEN 11 THEN 13
        ELSE 8
    END;

    v_nc_id := 'nc-' || gen_random_uuid()::text;
    v_nc_number := 'NC-' || LPAD(nextval('public.seq_credit_note_number')::text, 8, '0');

    INSERT INTO public.invoices (
        id, invoice_number, cae, cae_vto, pto_vta, tipo_cmp, date,
        patient_id, patient_name, dni, total, subtotal, concept,
        payment_method, status, arca_validated, related_invoice_id
    ) VALUES (
        v_nc_id,
        v_nc_number,
        NULL,
        NULL,
        v_orig.pto_vta,
        v_nc_tipo_cmp,
        CURRENT_DATE,
        v_orig.patient_id,
        v_orig.patient_name,
        v_orig.dni,
        v_orig.total,
        v_orig.subtotal,
        'Nota de Crédito por: ' || v_orig.concept || ' (Motivo: ' || COALESCE(p_reason, 'Anulación') || ')',
        v_orig.payment_method,
        'Pendiente de CAE',
        false,
        v_orig.id
    );

    INSERT INTO public.audit_logs (action, resource, details, user_id, user_name, user_role, target_id)
    VALUES (
        'ISSUE_CREDIT_NOTE',
        'Facturación',
        'Emisión de Nota de Crédito ' || v_nc_number || ' vinculada a comprobante ' || v_orig.invoice_number || '. Motivo: ' || p_reason,
        auth.uid()::text,
        COALESCE((SELECT first_name || ' ' || last_name FROM public.profiles WHERE id = auth.uid()), 'Administrativo'),
        COALESCE(public.get_auth_role()::text, 'administrative'),
        v_nc_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'credit_note_id', v_nc_id,
        'credit_note_number', v_nc_number,
        'related_invoice_id', v_orig.id,
        'status', 'Pendiente de CAE',
        'cae', NULL,
        'arca_validated', false
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.issue_credit_note(VARCHAR, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.issue_credit_note(VARCHAR, TEXT) FROM anon;

-- Inmutabilidad fiscal: Las facturas emitidas no tienen política de DELETE para ningún rol de la app (se anulan mediante NC)
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices (patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices (date);
CREATE INDEX IF NOT EXISTS idx_invoices_cae ON invoices (cae);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments (doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments (doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments (patient_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_active_slot ON appointments (patient_id, date, time) WHERE status != 'cancelado';
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations (patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations (doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_date ON consultations (doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_date ON consultations (patient_id, date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON electronic_prescriptions (patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON electronic_prescriptions (doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_cuir ON electronic_prescriptions (cuir);
CREATE INDEX IF NOT EXISTS idx_imaging_patient_id ON imaging_studies (patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_doctor_id ON imaging_studies (doctor_id);
CREATE INDEX IF NOT EXISTS idx_adendas_consultation ON consultation_adendas (consultation_id);
CREATE INDEX IF NOT EXISTS idx_adendas_doctor ON consultation_adendas (doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_orders_patient ON medical_orders (patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_orders_doctor ON medical_orders (doctor_id);
CREATE INDEX IF NOT EXISTS idx_certificates_patient ON medical_certificates (patient_id);
CREATE INDEX IF NOT EXISTS idx_certificates_doctor ON medical_certificates (doctor_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_shift ON cash_movements (shift_id);
CREATE INDEX IF NOT EXISTS idx_cash_shifts_date ON cash_shifts (opened_at);

-- 24. Vista Segura de Profesionales para Consulta Pública / Anon (A01)
DROP VIEW IF EXISTS public.public_doctors CASCADE;
CREATE OR REPLACE VIEW public.public_doctors AS
SELECT
    id, name, specialty_id, specialty_name, room_id, room_name,
    working_days, schedule_start, schedule_end, slot_duration,
    accepted_insurances, experience, bio, avatar_url, is_active
FROM public.doctors
WHERE is_active = TRUE;

GRANT SELECT ON public.public_doctors TO anon, authenticated;

-- 25. Índices de Rendimiento para Consultas Masivas y Escalabilidad (M09)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments (doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments (patient_id, date);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_date ON consultations (doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_date ON consultations (patient_id, date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON electronic_prescriptions (doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON electronic_prescriptions (patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_patient ON imaging_studies (patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_doctor ON imaging_studies (doctor_id);

-- ====================================================================
-- 26. TRIGGERS DE SEGURIDAD, INMUTABILIDAD Y AUDITORÍA FORENSE (Ley 26.529, 27.553, 25.326)
-- ====================================================================

-- 1. Inmutabilidad HCE (Ley 26.529)
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

-- 2. Inmutabilidad de Recetas Electrónicas (Ley 27.553)
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

-- 3. Inmutabilidad de Consentimientos Informados (Ley 26.529 / MED-04)
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

-- 4. Protección contra auto-escalado en Doctors (T6, T11)
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

-- 5. Protección contra manipulación de datos en Patients (T4, C-04, ALTA-05)
CREATE OR REPLACE FUNCTION public.protect_patient_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Los pacientes solo pueden actualizar canales de contacto propios
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

    -- V3-A1: Excepción para autovinculación del sistema en el alta
    IF current_setting('citra.system_link', true) = 'on' AND OLD.user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Usuarios no administrativos ni clínicos no pueden alterar identificación ni ligadura
    IF NOT public.is_administrative() THEN
        IF NEW.dni IS DISTINCT FROM OLD.dni THEN
            RAISE EXCEPTION 'Operación denegada: El DNI del paciente no puede ser modificado por usuarios sin rol administrativo.';
        END IF;
        IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
            RAISE EXCEPTION 'Operación denegada: La vinculación de cuenta de usuario es inmutable.';
        END IF;
    END IF;

    -- Personal administrativo sin rol médico no puede alterar antecedentes clínicos
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

-- 6. Protección de informes médicos diagnósticos contra manipulación administrativa (T7)
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

-- 6b. Prevención de solapamiento de turnos y validación de disponibilidad del profesional (A-03, A3-08)
CREATE OR REPLACE FUNCTION public.check_appointment_overlap()
RETURNS TRIGGER AS $$
DECLARE
    v_doc RECORD;
    v_dow INT;
    v_day_name TEXT;
BEGIN
    IF NEW.status != 'cancelado' THEN
        -- 1. Conflicto de turno para el profesional (Doble reserva médico)
        IF EXISTS (
            SELECT 1 FROM public.appointments
            WHERE doctor_id = NEW.doctor_id
              AND date = NEW.date
              AND time = NEW.time
              AND id != COALESCE(NEW.id, '')
              AND status != 'cancelado'
        ) THEN
            RAISE EXCEPTION 'Conflicto de agenda (A-03): El profesional ya posee un turno confirmado en esa fecha y horario.';
        END IF;

        -- 2. Conflicto de turno para el mismo paciente (Doble reserva paciente)
        IF NEW.patient_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.appointments
            WHERE patient_id = NEW.patient_id
              AND date = NEW.date
              AND time = NEW.time
              AND id != COALESCE(NEW.id, '')
              AND status != 'cancelado'
        ) THEN
            RAISE EXCEPTION 'Conflicto de turno: El paciente ya posee un turno asignado en este mismo horario.';
        END IF;

        -- Herencia de consultorio si no viene explícito
        IF NEW.room_id IS NULL THEN
            SELECT room_id INTO NEW.room_id FROM public.doctors WHERE id = NEW.doctor_id;
        END IF;

        -- 3. Conflicto de consultorio (Doble reserva de consultorio - A3-08)
        IF NEW.room_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.appointments
            WHERE room_id = NEW.room_id
              AND date = NEW.date
              AND time = NEW.time
              AND id != COALESCE(NEW.id, '')
              AND status != 'cancelado'
        ) THEN
            RAISE EXCEPTION 'Conflicto de consultorio (A3-08): El consultorio ya se encuentra ocupado en esa fecha y horario.';
        END IF;

        -- 4. Validación de disponibilidad, feriados y horarios del profesional en el servidor
        SELECT working_days, schedule_start, schedule_end, blocked_dates
        INTO v_doc
        FROM public.doctors
        WHERE id = NEW.doctor_id;

        IF FOUND THEN
            -- Fechas bloqueadas / feriados del médico
            IF v_doc.blocked_dates IS NOT NULL AND NEW.date = ANY(v_doc.blocked_dates) THEN
                RAISE EXCEPTION 'Disponibilidad denegada: La fecha seleccionada (%) está bloqueada para el profesional.', NEW.date;
            END IF;

            -- Rango horario de atención
            IF v_doc.schedule_start IS NOT NULL AND v_doc.schedule_end IS NOT NULL THEN
                IF NEW.time < v_doc.schedule_start OR NEW.time > v_doc.schedule_end THEN
                    RAISE EXCEPTION 'Horario no habilitado: El horario % está fuera del turno de atención del profesional (% a %).', 
                        NEW.time, v_doc.schedule_start, v_doc.schedule_end;
                END IF;
            END IF;

            -- Días laborables del profesional
            v_dow := EXTRACT(DOW FROM NEW.date)::INT;
            v_day_name := CASE v_dow
                WHEN 0 THEN 'Domingo'
                WHEN 1 THEN 'Lunes'
                WHEN 2 THEN 'Martes'
                WHEN 3 THEN 'Miércoles'
                WHEN 4 THEN 'Jueves'
                WHEN 5 THEN 'Viernes'
                WHEN 6 THEN 'Sábado'
            END;

            IF v_doc.working_days IS NOT NULL AND array_length(v_doc.working_days, 1) > 0 THEN
                IF NOT (v_day_name = ANY(v_doc.working_days)) THEN
                    RAISE EXCEPTION 'Día no laboral: El profesional no atiende los días %.', v_day_name;
                END IF;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_check_appointment_overlap ON public.appointments;
CREATE TRIGGER trg_check_appointment_overlap
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.check_appointment_overlap();

CREATE UNIQUE INDEX IF NOT EXISTS idx_room_active_slot
ON public.appointments (room_id, date, time)
WHERE status != 'cancelado' AND room_id IS NOT NULL;

-- 6c. Máquina de estados estricta de turnos (A3-07, A3-08, T10, C-01)
CREATE OR REPLACE FUNCTION public.validate_appointment_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        -- No se permite reactivar turnos cancelados (A3-08)
        IF OLD.status = 'cancelado' THEN
            RAISE EXCEPTION 'Transición de estado inválida (A3-08): Un turno cancelado no puede reactivarse a %.', NEW.status;
        END IF;

        -- Un turno ya atendido no puede modificarse (Ley 26.529 / V3-M2)
        IF OLD.status = 'atendido' AND NEW.status IS DISTINCT FROM 'atendido' AND NOT public.is_superadmin() THEN
            RAISE EXCEPTION 'Transición de estado inválida: Un turno atendido no puede modificarse (Ley 26.529).';
        END IF;

        -- Regla de cancelación para pacientes (A3-07)
        IF public.get_auth_role() = 'patient' THEN
            IF OLD.status = 'atendido' THEN
                RAISE EXCEPTION 'Operación denegada (A3-07): Un paciente no puede cancelar un turno ya atendido.';
            END IF;
            IF OLD.status NOT IN ('pendiente', 'confirmado') THEN
                RAISE EXCEPTION 'Operación denegada (A3-07): Un paciente solo puede cancelar turnos en estado pendiente o confirmado (estado actual: %).', OLD.status;
            END IF;
            IF NEW.status != 'cancelado' THEN
                RAISE EXCEPTION 'Operación denegada (A3-07): El paciente solo tiene permisos para cancelar turnos agendados.';
            END IF;
            IF NEW.doctor_id IS DISTINCT FROM OLD.doctor_id OR
               NEW.patient_id IS DISTINCT FROM OLD.patient_id OR
               NEW.date IS DISTINCT FROM OLD.date OR
               NEW.time IS DISTINCT FROM OLD.time THEN
                RAISE EXCEPTION 'Operación denegada (T10): El paciente solo puede cancelar su turno sin modificar fecha, horario ni profesional asignado.';
            END IF;
        END IF;
    END IF;

    -- En INSERT
    IF TG_OP = 'INSERT' AND auth.uid() IS NOT NULL THEN
        IF public.get_auth_role() = 'patient' AND NEW.status NOT IN ('pendiente', 'confirmado') THEN
            RAISE EXCEPTION 'Un paciente solo puede agendar turnos en estado pendiente o confirmado.';
        END IF;
        IF NEW.status NOT IN ('pendiente', 'confirmado') AND NOT public.is_administrative() THEN
            RAISE EXCEPTION 'Estado inicial de turno no autorizado: %.', NEW.status;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_validate_appointment_status_transition ON public.appointments;
CREATE TRIGGER trg_validate_appointment_status_transition
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.validate_appointment_status_transition();

DROP TRIGGER IF EXISTS trg_appointment_patient_cancellation ON public.appointments;

-- 7. Auditoría en Servidor con Diffs (A3)
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
        COALESCE(to_jsonb(NEW) ->> 'patient_dni', to_jsonb(OLD) ->> 'patient_dni', '-'),
        v_details::text,
        COALESCE(inet_client_addr()::text, '127.0.0.1'),
        NOW(),
        encode(digest(TG_TABLE_NAME || TG_OP || NOW()::text || COALESCE(to_jsonb(NEW) ->> 'id', to_jsonb(OLD) ->> 'id', ''), 'sha256'), 'hex'),
        TG_TABLE_NAME,
        COALESCE(to_jsonb(NEW) ->> 'id', to_jsonb(OLD) ->> 'id', 'N/A')
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

-- 8. RPC: Anulación Formal de Receta (M05)
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
        id, timestamp, user_id, user_name, user_role,
        action, resource, details, ip_address, event_hash
    ) VALUES (
        'aud-' || gen_random_uuid()::text,
        NOW(), auth.uid()::text, 'Profesional Médico', 'doctor',
        'ANNUL_PRESCRIPTION', 'electronic_prescriptions',
        jsonb_build_object('prescription_id', p_prescription_id, 'cuir', v_presc.cuir, 'reason', p_reason)::text,
        COALESCE(inet_client_addr()::text, '127.0.0.1'),
        encode(digest(p_prescription_id || '|' || NOW()::text || '|ANNUL', 'sha256'), 'hex')
    );

    RETURN jsonb_build_object('success', TRUE, 'message', 'Receta anulada exitosamente con trazabilidad legal.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

CREATE UNIQUE INDEX IF NOT EXISTS idx_consultations_unique_appointment
ON public.consultations (appointment_id)
WHERE appointment_id IS NOT NULL;

-- 9. RPC: create_consultation_bundle (C02, C03, A05, A06, A3-09 - Ley 26.529 y Ley 25.506)
CREATE OR REPLACE FUNCTION public.create_consultation_bundle(
    p_consultation JSONB,
    p_prescription JSONB DEFAULT NULL,
    p_medical_orders JSONB DEFAULT NULL,
    p_imaging_studies JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_cons_id VARCHAR;
    v_doc_id VARCHAR;
    v_doc_name VARCHAR;
    v_doc_license VARCHAR;
    v_doc_refeps VARCHAR;
    v_doc_specialty VARCHAR;
    v_pat_id VARCHAR;
    v_pat_name VARCHAR;
    v_pat_dni VARCHAR;
    v_integrity_hash VARCHAR;
    v_order JSONB;
    v_img JSONB;
    v_app_record public.appointments%ROWTYPE;
BEGIN
    v_cons_id := p_consultation->>'id';
    IF v_cons_id IS NULL OR TRIM(v_cons_id) = '' THEN
        v_cons_id := 'cns-' || gen_random_uuid()::text;
    END IF;

    -- Idempotencia transaccional (A3-09)
    IF EXISTS (SELECT 1 FROM public.consultations WHERE id = v_cons_id) THEN
        RETURN jsonb_build_object(
            'success', TRUE,
            'consultation_id', v_cons_id,
            'message', 'Consulta clínica ya registrada previamente.'
        );
    END IF;

    v_doc_id := public.get_current_doctor_id();
    IF v_doc_id IS NULL AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'No se encuentra un perfil médico activo para el usuario autenticado.';
    END IF;

    -- Atribución médica autoritativa desde la base de datos (C-03)
    SELECT name, license, sisa_refeps, specialty_name 
    INTO v_doc_name, v_doc_license, v_doc_refeps, v_doc_specialty 
    FROM public.doctors WHERE id = v_doc_id;

    IF v_doc_name IS NULL THEN
        RAISE EXCEPTION 'Perfil médico no encontrado en la base de datos.';
    END IF;

    v_pat_id := p_consultation->>'patient_id';
    -- Atribución de identidad de paciente autoritativa desde la base de datos (C-02)
    SELECT name, dni 
    INTO v_pat_name, v_pat_dni 
    FROM public.patients WHERE id = v_pat_id;

    IF v_pat_name IS NULL THEN
        RAISE EXCEPTION 'Paciente no registrado en el sistema.';
    END IF;

    IF NOT public.doctor_treats_patient(v_pat_id, v_doc_id) AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'Acceso denegado: El médico no tiene relación asistencial válida con el paciente.';
    END IF;

    -- Validaciones clínicas y fisiológicas estrictas en servidor
    IF LENGTH(TRIM(COALESCE(p_consultation->>'evolution', ''))) < 3 THEN
        RAISE EXCEPTION 'Validación clínica fallida: La evolución médica no puede estar vacía.';
    END IF;

    IF LENGTH(TRIM(COALESCE(p_consultation->>'diagnosis', ''))) < 2 THEN
        RAISE EXCEPTION 'Validación clínica fallida: Debe especificarse un diagnóstico clínico principal válido.';
    END IF;

    -- Validación de rangos de signos vitales (Heart Rate 30-260, Temp 30-45°C, Systolic 40-300, Diastolic 20-200)
    IF p_consultation->'vitals' IS NOT NULL AND jsonb_typeof(p_consultation->'vitals') = 'object' THEN
        IF (p_consultation->'vitals'->>'heartRate') IS NOT NULL AND (p_consultation->'vitals'->>'heartRate')::numeric > 0 THEN
            IF (p_consultation->'vitals'->>'heartRate')::numeric < 30 OR (p_consultation->'vitals'->>'heartRate')::numeric > 260 THEN
                RAISE EXCEPTION 'Signos vitales inválidos: Frecuencia cardíaca fuera de rango fisiológico (30-260 lpm).';
            END IF;
        END IF;

        IF (p_consultation->'vitals'->>'temperature') IS NOT NULL AND (p_consultation->'vitals'->>'temperature')::numeric > 0 THEN
            IF (p_consultation->'vitals'->>'temperature')::numeric < 30.0 OR (p_consultation->'vitals'->>'temperature')::numeric > 45.0 THEN
                RAISE EXCEPTION 'Signos vitales inválidos: Temperatura corporal fuera de rango fisiológico (30.0-45.0 °C).';
            END IF;
        END IF;

        IF (p_consultation->'vitals'->>'bpSystolic') IS NOT NULL AND (p_consultation->'vitals'->>'bpSystolic')::numeric > 0 THEN
            IF (p_consultation->'vitals'->>'bpSystolic')::numeric < 40 OR (p_consultation->'vitals'->>'bpSystolic')::numeric > 300 THEN
                RAISE EXCEPTION 'Signos vitales inválidos: Tensión arterial sistólica fuera de rango (40-300 mmHg).';
            END IF;
        END IF;

        IF (p_consultation->'vitals'->>'bpDiastolic') IS NOT NULL AND (p_consultation->'vitals'->>'bpDiastolic')::numeric > 0 THEN
            IF (p_consultation->'vitals'->>'bpDiastolic')::numeric < 20 OR (p_consultation->'vitals'->>'bpDiastolic')::numeric > 200 THEN
                RAISE EXCEPTION 'Signos vitales inválidos: Tensión arterial diastólica fuera de rango (20-200 mmHg).';
            END IF;
        END IF;
    END IF;

    -- A3-09: Verificación estricta de turno asociado
    IF (p_consultation->>'appointment_id') IS NOT NULL AND TRIM(p_consultation->>'appointment_id') <> '' THEN
        SELECT * INTO v_app_record
        FROM public.appointments
        WHERE id = p_consultation->>'appointment_id';

        IF NOT FOUND THEN
            RAISE EXCEPTION 'El turno referenciado no existe: %', (p_consultation->>'appointment_id');
        END IF;

        IF v_app_record.status = 'cancelado' THEN
            RAISE EXCEPTION 'Operación denegada (A3-09): No se puede registrar una consulta sobre un turno que ha sido cancelado.';
        END IF;

        IF v_app_record.patient_id != v_pat_id THEN
            RAISE EXCEPTION 'Operación denegada (A3-09): El turno no corresponde al paciente indicado.';
        END IF;

        IF v_app_record.doctor_id != v_doc_id AND NOT public.is_superadmin() THEN
            RAISE EXCEPTION 'Operación denegada (A3-09): El turno corresponde a otro profesional médico.';
        END IF;

        IF EXISTS (SELECT 1 FROM public.consultations WHERE appointment_id = (p_consultation->>'appointment_id') AND id != v_cons_id) THEN
            RAISE EXCEPTION 'Operación denegada (A3-09): El turno ya cuenta con una consulta médica registrada.';
        END IF;
    END IF;

    -- Cálculo del Hash Criptográfico SHA-256 en Servidor (A-05, Ley 25.506)
    v_integrity_hash := encode(digest(
        v_cons_id || '|' || 
        v_pat_id || '|' || 
        v_pat_dni || '|' || 
        v_doc_id || '|' || 
        COALESCE(p_consultation->>'evolution', '') || '|' || 
        COALESCE(p_consultation->>'diagnosis', '') || '|' || 
        NOW()::text, 
        'sha256'
    ), 'hex');

    -- A3-09 / Ley 26.529: Fecha y hora fijadas en el servidor según huso horario de Argentina (no retrodatables)
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
        v_pat_name,
        v_pat_dni,
        v_doc_id,
        v_doc_name,
        v_doc_license,
        COALESCE(v_doc_refeps, p_consultation->>'sisa_refeps'),
        COALESCE(p_consultation->>'specialty_name', v_doc_specialty),
        (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date,
        (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::time,
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
        v_integrity_hash
    );

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
            v_pat_name,
            v_pat_dni,
            v_doc_id,
            v_doc_name,
            v_doc_license,
            COALESCE(v_doc_refeps, p_prescription->>'sisa_refeps'),
            p_prescription->>'diagnosis_presuntivo',
            COALESCE(p_prescription->'medications', '[]'::jsonb),
            (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date,
            COALESCE((p_prescription->>'expiration_date')::date, ((NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date + INTERVAL '30 days')::date),
            'activa',
            p_prescription->>'verification_url'
        );
    END IF;

    IF p_medical_orders IS NOT NULL AND jsonb_array_length(p_medical_orders) > 0 THEN
        FOR v_order IN SELECT * FROM jsonb_array_elements(p_medical_orders)
        LOOP
            INSERT INTO public.medical_orders (
                id, patient_id, patient_name, doctor_id, doctor_name, type, instructions, date
            ) VALUES (
                v_order->>'id',
                v_pat_id,
                v_pat_name,
                v_doc_id,
                v_doc_name,
                v_order->>'type',
                v_order->>'instructions',
                (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date
            );
        END LOOP;
    END IF;

    -- Inserción atómica de estudios de imágenes si se adjuntan (A3-09)
    IF p_imaging_studies IS NOT NULL AND jsonb_array_length(p_imaging_studies) > 0 THEN
        FOR v_img IN SELECT * FROM jsonb_array_elements(p_imaging_studies)
        LOOP
            INSERT INTO public.imaging_studies (
                id, patient_id, patient_name, patient_dni, study_type, region,
                date, doctor_id, referring_doctor, status, priority
            ) VALUES (
                COALESCE(v_img->>'id', 'img-' || gen_random_uuid()::text),
                v_pat_id,
                v_pat_name,
                v_pat_dni,
                COALESCE(v_img->>'study_type', v_img->>'modality', 'Estudio de Imágenes'),
                COALESCE(v_img->>'region', v_img->>'body_part', 'Región Anatómica'),
                (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date,
                v_doc_id,
                v_doc_name,
                'solicitado',
                COALESCE(v_img->>'priority', 'Normal')
            );
        END LOOP;
    END IF;

    IF (p_consultation->>'appointment_id') IS NOT NULL AND TRIM(p_consultation->>'appointment_id') <> '' THEN
        UPDATE public.appointments
        SET status = 'atendido', updated_at = NOW()
        WHERE id = p_consultation->>'appointment_id'
          AND (doctor_id = v_doc_id OR public.is_superadmin())
          AND patient_id = v_pat_id
          AND status != 'cancelado';
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'consultation_id', v_cons_id,
        'integrity_hash', v_integrity_hash,
        'message', 'Paquete clínico registrado atómicamente con éxito conforme Ley 26.529 y Ley 25.506.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- 9.5. RPC: Apertura de Turno de Caja (V2-A7)
CREATE OR REPLACE FUNCTION public.open_cash_shift_rpc(
    p_opening_balance NUMERIC DEFAULT 0,
    p_shift_name VARCHAR DEFAULT 'Turno de Caja',
    p_cashier_name VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_user_id UUID;
    v_cashier_name VARCHAR(150);
    v_shift_id VARCHAR(50);
    v_existing_shift_id VARCHAR(50);
    v_shift_record public.cash_shifts%ROWTYPE;
BEGIN
    IF NOT public.is_administrative() THEN
        RAISE EXCEPTION 'Acceso denegado: Se requiere rol administrativo para abrir turnos de caja.';
    END IF;

    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado.';
    END IF;

    SELECT id INTO v_existing_shift_id
    FROM public.cash_shifts
    WHERE user_id = v_user_id AND status = 'open'
    LIMIT 1;

    IF v_existing_shift_id IS NOT NULL THEN
        RAISE EXCEPTION 'El usuario ya posee un turno de caja abierto: %', v_existing_shift_id;
    END IF;

    IF p_cashier_name IS NOT NULL AND trim(p_cashier_name) <> '' THEN
        v_cashier_name := trim(p_cashier_name);
    ELSE
        SELECT COALESCE(trim(first_name || ' ' || last_name), email, 'Administrador')
        INTO v_cashier_name
        FROM public.profiles
        WHERE id = v_user_id;

        IF v_cashier_name IS NULL OR trim(v_cashier_name) = '' THEN
            v_cashier_name := 'Administrador de Caja';
        END IF;
    END IF;

    v_shift_id := 'shift-' || to_char(NOW(), 'YYYYMMDD-HH24MISS') || '-' || substr(gen_random_uuid()::text, 1, 6);

    INSERT INTO public.cash_shifts (
        id, user_id, cashier_name, shift_name, status,
        opening_balance, total_cash, total_cards, total_transfers, total_expenses, net_total,
        opened_at, created_at, updated_at
    ) VALUES (
        v_shift_id, v_user_id, v_cashier_name, COALESCE(p_shift_name, 'Turno de Caja'), 'open',
        COALESCE(p_opening_balance, 0), 0, 0, 0, 0, COALESCE(p_opening_balance, 0),
        NOW(), NOW(), NOW()
    ) RETURNING * INTO v_shift_record;

    INSERT INTO public.audit_logs (
        id, timestamp, user_id, user_name, user_role,
        action, resource, details, ip_address, event_hash
    ) VALUES (
        'aud-' || gen_random_uuid()::text,
        NOW(), v_user_id::text, v_cashier_name, 'admin',
        'OPEN_CASH_SHIFT', 'cash_shifts',
        jsonb_build_object('shift_id', v_shift_id, 'opening_balance', p_opening_balance)::text,
        COALESCE(inet_client_addr()::text, '127.0.0.1'),
        encode(digest(v_shift_id || '|' || NOW()::text || '|OPEN', 'sha256'), 'hex')
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'shift_id', v_shift_id,
        'shift', to_jsonb(v_shift_record)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.open_cash_shift_rpc(NUMERIC, VARCHAR, VARCHAR) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.open_cash_shift_rpc(NUMERIC, VARCHAR, VARCHAR) FROM anon;

-- 10. RPC: Cierre de Turno de Caja (M08, A3-15)
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

    -- A3-15: Solo el operador que abrió el turno o un superadministrador puede cerrarlo
    IF v_shift.user_id != auth.uid() AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'Operación denegada (A3-15): Solo el operador que abrió el turno de caja o un superadministrador puede cerrarlo.';
    END IF;

    SELECT
        COALESCE(SUM(CASE WHEN type = 'income' AND lower(payment_method) IN ('efectivo') THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'income' AND (lower(payment_method) LIKE '%tarjeta%' OR lower(payment_method) LIKE '%debito%' OR lower(payment_method) LIKE '%débito%' OR lower(payment_method) LIKE '%credito%' OR lower(payment_method) LIKE '%crédito%') THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'income' AND (lower(payment_method) LIKE '%transferencia%' OR lower(payment_method) LIKE '%qr%' OR lower(payment_method) LIKE '%mercado%') THEN amount ELSE 0 END), 0),
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
        id, timestamp, user_id, user_name, user_role,
        action, resource, details, ip_address, event_hash
    ) VALUES (
        'aud-' || gen_random_uuid()::text,
        NOW(), auth.uid()::text, 'Administración', 'admin',
        'CLOSE_CASH_SHIFT', 'cash_shifts',
        jsonb_build_object('shift_id', p_shift_id, 'observations', p_observations)::text,
        COALESCE(inet_client_addr()::text, '127.0.0.1'),
        encode(digest(p_shift_id || '|' || NOW()::text || '|CLOSE', 'sha256'), 'hex')
    );

    RETURN jsonb_build_object('success', TRUE, 'message', 'Turno de caja cerrado exitosamente de manera atómica.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- ====================================================================
-- 27. CARGA DE DATOS MAESTROS (SEED DATA COMPLETO DE CITRA)
-- Todas las operaciones usan ON CONFLICT (id) DO NOTHING para no sobreescribir datos en producción (M02)
-- ====================================================================

-- A) Especialidades
INSERT INTO specialties (id, name, category, color, icon, estimated_duration, description) VALUES
('esp-1', 'Traumatología', 'Especialidades', '#002182', 'Bone', 30, 'Diagnóstico y tratamiento óseo, articular, fracturas y lesiones deportivas.'),
('esp-2', 'Neurología', 'Especialidades', '#076ABC', 'Brain', 40, 'Atención integral del sistema nervioso, migrañas, cefaleas y dolor neuropático.'),
('esp-3', 'Reumatología', 'Especialidades', '#257CE6', 'Activity', 30, 'Enfermedades inflamatorias y autoinmunes de las articulaciones y tejido conectivo.'),
('esp-4', 'Nutrición', 'Especialidades', '#055294', 'Apple', 30, 'Planes nutricionales personalizados, antiinflamatorios y nutrición deportiva.'),
('esp-5', 'Kinesiología & Fisioterapia', 'Rehabilitación', '#076ABC', 'Dumbbell', 40, 'Recuperación funcional activa, pre y post-quirúrgica en gimnasio terapéutico.'),
('esp-6', 'Fisioterapia', 'Rehabilitación', '#257CE6', 'Zap', 40, 'Magnetoterapia, ultrasonido, electroestimulación y analgesia profunda.'),
('esp-7', 'Osteopatía', 'Rehabilitación', '#002182', 'Layers', 45, 'Terapia manual estructural y visceral para restablecer la movilidad biomecánica.'),
('esp-8', 'ATM (Articulación Temporomandibular)', 'Rehabilitación', '#076ABC', 'Smile', 40, 'Tratamiento de disfunciones mandibulares, bruxismo y dolores orofaciales.'),
('esp-9', 'Rehabilitación de Suelo Pélvico', 'Rehabilitación', '#257CE6', 'Heart', 45, 'Fisioterapia uroginecológica, biofeedback y recuperación perineal postparto.'),
('esp-10', 'Radiología Digital', 'Diagnóstico', '#001556', 'ScanLine', 20, 'Rayos X digitales directos de alta definición con entrega inmediata.'),
('esp-11', 'Estudio de Pisadas y Plantillas', 'Diagnóstico', '#055294', 'Footprints', 30, 'Baropodometría computarizada estática y dinámica para plantillas a medida.'),
('esp-12', 'Ozonoterapia', 'Tratamientos Complementarios', '#076ABC', 'Sparkles', 30, 'Terapia con ozono medicinal con potente efecto analgésico y regenerativo articular.'),
('esp-13', 'Medicina Estética', 'Tratamientos Complementarios', '#257CE6', 'Sparkles', 30, 'Procedimientos médico-estéticos no invasivos y bioestimulación dérmica.'),
('esp-14', 'Atención PAMI', 'Especialidades', '#002182', 'UserCheck', 30, 'Atención clínica y seguimiento de adultos mayores afiliados a PAMI.')
ON CONFLICT (id) DO NOTHING;

-- B) Consultorios Físicos
INSERT INTO rooms (id, name, floor, branch_id, specialty) VALUES
('room-101', 'Consultorio 101 — Traumatología', 'Piso 1', 'branch-1', 'Traumatología'),
('room-102', 'Consultorio 102 — Kinesiología & Fisioterapia', 'Piso 1', 'branch-1', 'Kinesiología'),
('room-103', 'Consultorio 103 — Neurología & Reumatología', 'Piso 1', 'branch-1', 'Neurología'),
('room-201', 'Consultorio 201 — Nutrición & Piso Pélvico', 'Piso 2', 'branch-1', 'Nutrición'),
('room-202', 'Consultorio 202 — Osteopatía & ATM', 'Piso 2', 'branch-1', 'Osteopatía'),
('room-203', 'Gabinete de Ozonoterapia & Medicina Estética', 'Piso 2', 'branch-1', 'Ozonoterapia'),
('room-204', 'Sala de Radiología Digital & Estudio de la Pisada', 'PB', 'branch-1', 'Radiología Digital')
ON CONFLICT (id) DO NOTHING;

-- C) Obras Sociales
INSERT INTO health_insurances (id, name, plans, copay, status) VALUES
('hi-1', 'OSDE', '["210", "310", "410", "450", "510"]'::jsonb, 0, 'Activa'),
('hi-2', 'Swiss Medical', '["SMG20", "SMG30", "SMG40", "SMG50"]'::jsonb, 1500, 'Activa'),
('hi-3', 'Galeno', '["Plata", "Oro", "Azul"]'::jsonb, 2000, 'Activa'),
('hi-4', 'Apross', '["Obligatorio", "Voluntario"]'::jsonb, 1200, 'Activa'),
('hi-5', 'PAMI', '["General", "Veteranos"]'::jsonb, 0, 'Activa'),
('hi-6', 'Medicus', '["Celeste", "Azul"]'::jsonb, 1800, 'Activa'),
('hi-7', 'Particular / Privado', '["Arancel Pleno"]'::jsonb, 22000, 'Activa')
ON CONFLICT (id) DO NOTHING;

-- D) Horario General de la Clínica
INSERT INTO clinic_schedules (id, opening_time, closing_time, saturday_closing_time, slot_duration, working_days, blocked_dates) VALUES
('main-schedule', '08:00', '20:00', '13:00', 30, ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'], ARRAY['2026-12-25'::date, '2027-01-01'::date])
ON CONFLICT (id) DO NOTHING;

-- E) Los 13 Profesionales Médicos Reales de CITRA
INSERT INTO doctors (id, name, license, sisa_refeps, specialty_id, specialty_name, room_id, room_name, email, phone, working_days, schedule_start, schedule_end, slot_duration, price_consultation, fee_percentage, accepted_insurances, experience, bio) VALUES
('doc-1', 'Dr. Alejandro Blanco', 'MP 38.412 / ME 19.820', 'REFEPS-MP-38412', 'esp-1', 'Traumatología y Ortopedia', 'room-101', 'Consultorio 101 — Traumatología', 'dr.blanco@citra.com.ar', '3576 450214', ARRAY['Martes','Miércoles','Jueves'], '14:00', '19:00', 30, 25000, 75, ARRAY['hi-1','hi-2','hi-3','hi-7'], '15+ años de experiencia', 'Especialista en traumatología y ortopedia, patología de rodilla, hombro y lesiones deportivas de alta competencia.'),
('doc-2', 'Dr. Lagos', 'MP 41.250 / ME 20.315', 'REFEPS-MP-41250', 'esp-1', 'Traumatología y Ortopedia', 'room-101', 'Consultorio 101 — Traumatología', 'dr.lagos@citra.com.ar', '3576 450214', ARRAY['Lunes'], '18:00', '21:00', 30, 25000, 75, ARRAY['hi-1','hi-2','hi-4','hi-7'], '12+ años de experiencia', 'Cirujano ortopedista enfocado en miembro inferior, cadera y columna vertebral.'),
('doc-3', 'Dr. Luque', 'MP 35.890 / ME 16.940', 'REFEPS-MP-35890', 'esp-12', 'Ozonoterapia', 'room-203', 'Gabinete de Ozonoterapia', 'dr.luque@citra.com.ar', '3576 450214', ARRAY['Lunes','Miércoles','Viernes'], '09:00', '18:00', 30, 28000, 80, ARRAY['hi-1','hi-2','hi-7'], '18+ años de trayectoria', 'Médico especialista en ozonoterapia para dolor articular y regeneración tisular.'),
('doc-4', 'Lic. Barrea', 'MP 46.102', 'REFEPS-MP-46102', 'esp-5', 'Kinesiología & Fisioterapia', 'room-102', 'Consultorio 102 — Gimnasio Kinésico', 'lic.barrea@citra.com.ar', '3576 450214', ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes'], '08:00', '16:00', 40, 18000, 80, ARRAY['hi-1','hi-2','hi-4','hi-7'], '10+ años de experiencia', 'Rehabilitación kinésica integral, motora y deportiva.'),
('doc-5', 'Lic. Baravalle', 'MP 47.330', 'REFEPS-MP-47330', 'esp-5', 'Kinesiología · Suelo Pélvico · ATM', 'room-201', 'Consultorio 201 — Suelo Pélvico & ATM', 'lic.baravalle@citra.com.ar', '3576 450214', ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes'], '08:00', '14:00', 40, 20000, 80, ARRAY['hi-1','hi-2','hi-4','hi-7'], '11+ años de especialización', 'Rehabilitación de suelo pélvico femenino, disfunciones de ATM y kinesiología integral.'),
('doc-6', 'Lic. Mondino', 'MP 44.819', 'REFEPS-MP-44819', 'esp-5', 'Kinesiología y Osteopatía', 'room-202', 'Consultorio 202 — Osteopatía', 'lic.mondino@citra.com.ar', '3576 450214', ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes'], '14:00', '20:30', 45, 22000, 80, ARRAY['hi-1','hi-2','hi-4','hi-7'], '14+ años de experiencia', 'Kinesiología y osteopatía aplicada al tratamiento musculoesquelético y postural.'),
('doc-7', 'Dra. Allione', 'MP 39.774 / ME 18.110', 'REFEPS-MP-39774', 'esp-13', 'Atención PAMI · Medicina Estética y Reparadora', 'room-203', 'Consultorio 203 — Medicina Estética & PAMI', 'dra.allione@citra.com.ar', '3576 450214', ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes'], '08:30', '14:00', 30, 22000, 75, ARRAY['hi-5','hi-7'], '13+ años de trayectoria', 'Atención integral médica para afiliados PAMI y procedimientos de medicina estética y reparadora.'),
('doc-8', 'Lic. Tsakoumagkos', 'MP 4.218', 'REFEPS-MP-04218', 'esp-4', 'Nutrición', 'room-201', 'Consultorio 201 — Nutrición', 'lic.tsakoumagkos@citra.com.ar', '3576 450214', ARRAY['Lunes','Miércoles','Viernes'], '14:00', '18:30', 30, 17000, 80, ARRAY['hi-1','hi-2','hi-4','hi-7'], '9+ años de experiencia', 'Nutrición clínica y asesoramiento dietoterápico integral.'),
('doc-9', 'Lic. Salvagno', 'MP 43.512', 'REFEPS-MP-43512', 'esp-11', 'Estudio de Pisadas y Plantillas Ortopédicas', 'room-204', 'Sala de Baropodometría & Plantillas', 'lic.salvagno@citra.com.ar', '3576 450214', ARRAY['Martes','Jueves'], '09:00', '16:00', 30, 21000, 75, ARRAY['hi-1','hi-2','hi-7'], '12+ años de experiencia', 'Estudio biomecánico computarizado de la pisada y confección de plantillas ortopédicas.'),
('doc-10', 'Dra. Miretti', 'MP 37.190 / ME 17.650', 'REFEPS-MP-37190', 'esp-3', 'Reumatología', 'room-103', 'Consultorio 103 — Reumatología', 'dra.miretti@citra.com.ar', '3576 450214', ARRAY['Miércoles','Viernes'], '14:00', '18:30', 30, 26000, 75, ARRAY['hi-1','hi-2','hi-3','hi-7'], '16+ años de trayectoria', 'Diagnóstico y tratamiento de patologías reumatológicas y autoinmunes articulares.'),
('doc-11', 'Dra. Ferreira', 'MP 36.840 / ME 17.210', 'REFEPS-MP-36840', 'esp-2', 'Neurología', 'room-103', 'Consultorio 103 — Neurología', 'dra.ferreira@citra.com.ar', '3576 450214', ARRAY['Lunes','Jueves'], '14:00', '19:00', 40, 27000, 75, ARRAY['hi-1','hi-2','hi-3','hi-7'], '17+ años de trayectoria', 'Consulta neurológica integral para afecciones del sistema nervioso.'),
('doc-12', 'Lic. Emilio', 'MP 12.890', 'REFEPS-MP-12890', 'esp-10', 'Radiología Digital', 'room-204', 'Sala de Rayos X Digitales', 'lic.emilio@citra.com.ar', '3576 450214', ARRAY['Lunes','Miércoles','Viernes'], '08:00', '18:00', 20, 15000, 70, ARRAY['hi-1','hi-2','hi-4','hi-7'], 'Especialista en Bioimágenes', 'Servicio de radiología digital de alta resolución.'),
('doc-13', 'Profe Maru', 'Cert. Yoga', '-', 'esp-14', 'Shama Yoga · Adultos Mayores', 'room-102', 'Espacio de Yoga & Bienestar', 'profe.maru@citra.com.ar', '3576 450214', ARRAY['Martes','Jueves'], '09:00', '12:00', 60, 12000, 80, ARRAY['hi-7'], '10+ años de experiencia', 'Shama Yoga adaptado y biomecánica postural para adultos mayores.')
ON CONFLICT (id) DO NOTHING;

-- F) Pacientes Iniciales de Prueba Sintética (Solo inserción dev/demo sin pisar datos reales)
INSERT INTO patients (id, name, dni, email, phone, birth_date, gender, blood_type, emergency_contact_name, emergency_contact_phone, insurance_id, insurance_name, insurance_plan, insurance_number, registered_at) VALUES
('pat-demo-1', 'Paciente Demostración 1', '10.000.001', 'paciente1@demo.citra.local', '3576 000001', '1990-01-01', 'Masculino', '0+', 'Contacto Emergencia', '3576 000002', 'hi-1', 'OSDE', '310', '310-000001', '2026-01-01')
ON CONFLICT (id) DO NOTHING;

-- 24. Solicitudes de Acceso Clínico e Interconsultas (A-07, A3-01)
CREATE TABLE IF NOT EXISTS public.clinical_access_grants (
    id VARCHAR(50) PRIMARY KEY,
    consultation_id VARCHAR(50) REFERENCES public.consultations(id) ON DELETE RESTRICT,
    patient_id VARCHAR(50) NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    requester_doctor_id VARCHAR(50) NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    requester_doctor_name VARCHAR(200) NOT NULL,
    target_doctor_id VARCHAR(50) NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    target_doctor_name VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    justification TEXT NOT NULL,
    requested_sections TEXT[] DEFAULT ARRAY[]::TEXT[],
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    rejected_by UUID REFERENCES auth.users(id),
    rejected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_grant_different_doctors CHECK (requester_doctor_id != target_doctor_id)
);

ALTER TABLE public.clinical_access_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "access_grants_select_policy" ON public.clinical_access_grants;
CREATE POLICY "access_grants_select_policy" ON public.clinical_access_grants
FOR SELECT USING (
    requester_doctor_id = public.get_current_doctor_id()
    OR target_doctor_id = public.get_current_doctor_id()
    OR public.is_administrative()
);

DROP POLICY IF EXISTS "access_grants_insert_policy" ON public.clinical_access_grants;
CREATE POLICY "access_grants_insert_policy" ON public.clinical_access_grants
FOR INSERT WITH CHECK (
    public.is_doctor() AND requester_doctor_id = public.get_current_doctor_id() AND status = 'pending'
);

-- Trigger que asegura que un nuevo permiso nazca siempre en 'pending' y sin auto-aprobación (ALTA-03)
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

-- A3-01: Protección estricta contra autoaprobación y manipulación de solicitudes clínicas
CREATE OR REPLACE FUNCTION public.protect_clinical_access_grant()
RETURNS TRIGGER AS $$
DECLARE
    v_curr_doc VARCHAR;
BEGIN
    v_curr_doc := public.get_current_doctor_id();

    -- Inmutabilidad de claves de la solicitud
    IF NEW.requester_doctor_id IS DISTINCT FROM OLD.requester_doctor_id OR
       NEW.target_doctor_id IS DISTINCT FROM OLD.target_doctor_id OR
       NEW.patient_id IS DISTINCT FROM OLD.patient_id THEN
        RAISE EXCEPTION 'Los identificadores de médico y paciente en una solicitud de acceso clínico son inmutables.';
    END IF;

    -- Validación de aprobación (V3-A2: control estricto de NULL y roles)
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        IF v_curr_doc IS NULL AND NOT public.is_superadmin() THEN
            RAISE EXCEPTION 'Solo el profesional destinatario o un superadministrador puede aprobar la solicitud de acceso clínico.';
        END IF;
        IF v_curr_doc IS NOT DISTINCT FROM OLD.requester_doctor_id AND NOT public.is_superadmin() THEN
            RAISE EXCEPTION 'El profesional solicitante no puede auto-aprobarse el acceso clínico.';
        END IF;
        IF v_curr_doc IS DISTINCT FROM OLD.target_doctor_id AND NOT public.is_superadmin() THEN
            RAISE EXCEPTION 'Solo el profesional destinatario o un superadministrador puede aprobar la solicitud de acceso clínico.';
        END IF;
        NEW.approved_at := NOW();
        NEW.approved_by := auth.uid();
        IF NEW.expires_at IS NULL OR NEW.expires_at <= NOW() THEN
            NEW.expires_at := NOW() + INTERVAL '30 days';
        END IF;
    END IF;

    -- Validación de rechazo
    IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        IF v_curr_doc IS NULL AND NOT public.is_superadmin() THEN
            RAISE EXCEPTION 'Solo el profesional destinatario o un superadministrador puede rechazar la solicitud de acceso clínico.';
        END IF;
        IF v_curr_doc IS DISTINCT FROM OLD.target_doctor_id AND NOT public.is_superadmin() THEN
            RAISE EXCEPTION 'Solo el profesional destinatario o un superadministrador puede rechazar la solicitud de acceso clínico.';
        END IF;
        NEW.rejected_at := NOW();
        NEW.rejected_by := auth.uid();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_clinical_access_grant ON public.clinical_access_grants;
CREATE TRIGGER trg_protect_clinical_access_grant
BEFORE UPDATE ON public.clinical_access_grants
FOR EACH ROW EXECUTE FUNCTION public.protect_clinical_access_grant();

DROP POLICY IF EXISTS "access_grants_update_policy" ON public.clinical_access_grants;
CREATE POLICY "access_grants_update_policy" ON public.clinical_access_grants
FOR UPDATE USING (
    (target_doctor_id = public.get_current_doctor_id() AND requester_doctor_id != public.get_current_doctor_id())
    OR public.is_superadmin()
) WITH CHECK (
    (target_doctor_id = public.get_current_doctor_id() AND requester_doctor_id != public.get_current_doctor_id())
    OR public.is_superadmin()
);

-- RPC autoritativa para aprobación de interconsultas (A3-01)
CREATE OR REPLACE FUNCTION public.approve_access_grant(p_grant_id VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_grant public.clinical_access_grants%ROWTYPE;
    v_curr_doc VARCHAR;
BEGIN
    v_curr_doc := public.get_current_doctor_id();
    SELECT * INTO v_grant FROM public.clinical_access_grants WHERE id = p_grant_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitud de acceso clínico % no encontrada.', p_grant_id;
    END IF;

    -- V3-A2: Validación estricta de rol e identidad
    IF v_curr_doc IS NULL AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'Solo el profesional destinatario o un superadministrador puede aprobar.';
    END IF;

    IF v_grant.status <> 'pending' THEN
        RAISE EXCEPTION 'La solicitud ya fue resuelta (estado: %).', v_grant.status;
    END IF;

    IF v_grant.requester_doctor_id IS NOT DISTINCT FROM v_curr_doc AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'No puede auto-aprobarse el acceso clínico.';
    END IF;

    IF v_grant.target_doctor_id IS DISTINCT FROM v_curr_doc AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'Solo el profesional destinatario puede aprobar.';
    END IF;

    UPDATE public.clinical_access_grants
    SET status = 'approved',
        approved_at = NOW(),
        approved_by = auth.uid(),
        expires_at = NOW() + INTERVAL '30 days'
    WHERE id = p_grant_id;

    -- Registro en auditoría institucional
    INSERT INTO public.audit_logs (action, resource, details, user_id, user_name, user_role, target_id)
    VALUES (
        'APPROVE_ACCESS_GRANT',
        'Historia Clínica',
        'Aprobación de interconsulta clínica para paciente ' || v_grant.patient_name || ' hacia ' || v_grant.requester_doctor_name,
        auth.uid()::text,
        COALESCE((SELECT first_name || ' ' || last_name FROM public.profiles WHERE id = auth.uid()), 'Médico'),
        COALESCE(public.get_auth_role()::text, 'doctor'),
        p_grant_id
    );

    RETURN jsonb_build_object('success', TRUE, 'grant_id', p_grant_id, 'status', 'approved');
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_access_grant(VARCHAR) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.approve_access_grant(VARCHAR) FROM anon;

-- 25. Vista Pública Reducida de Profesionales (A-01)
DROP VIEW IF EXISTS public.public_doctors CASCADE;
CREATE OR REPLACE VIEW public.public_doctors AS
SELECT 
    id,
    name,
    license,
    specialty_id,
    specialty_name,
    room_id,
    room_name,
    color,
    avatar_url,
    experience,
    bio,
    working_days,
    schedule_start,
    schedule_end,
    slot_duration,
    accepted_insurances,
    is_active
FROM public.doctors
WHERE is_active = TRUE;

-- ====================================================================
-- INMUTABILIDAD LEGAL Y PREVENCIÓN DE BORRADO FÍSICO (Ley 26.529 Art. 18 / CRIT-01, CRIT-02, ALTA-11)
-- Obligación de custodia y conservación por 15 años de antecedentes médicos
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.retention_policy (
    id VARCHAR(50) PRIMARY KEY,
    entity_name VARCHAR(100) NOT NULL UNIQUE,
    retention_years INTEGER NOT NULL DEFAULT 15,
    legal_basis VARCHAR(200) NOT NULL DEFAULT 'Ley 26.529 Art. 18 - Historia Clínica Electrónica',
    allow_hard_delete BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.retention_policy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "retention_policy_select" ON public.retention_policy;
CREATE POLICY "retention_policy_select" ON public.retention_policy FOR SELECT USING (TRUE);

INSERT INTO public.retention_policy (id, entity_name, retention_years, legal_basis, allow_hard_delete, description) VALUES
('ret-patients', 'patients', 15, 'Ley 26.529 Art. 18', FALSE, 'Padrón de pacientes y filiación con custodia mínima de 15 años.'),
('ret-doctors', 'doctors', 15, 'Ley 26.529 Art. 18', FALSE, 'Registro de profesionales tratantes y firmas asistenciales.'),
('ret-appointments', 'appointments', 15, 'Ley 26.529 Art. 18', FALSE, 'Trazabilidad cronológica de citas y atenciones solicitadas.'),
('ret-consultations', 'consultations', 15, 'Ley 26.529 Art. 18', FALSE, 'Atenciones asistenciales, evoluciones médicas y diagnósticos.'),
('ret-prescriptions', 'electronic_prescriptions', 15, 'Ley 27.553 / Ley 26.529', FALSE, 'Recetas electrónicas y trazabilidad de prescripciones.'),
('ret-imaging', 'imaging_studies', 15, 'Ley 26.529 Art. 18', FALSE, 'Estudios de diagnóstico por imágenes y biomecánica.'),
('ret-rehab-plans', 'rehab_plans', 15, 'Ley 26.529 Art. 18', FALSE, 'Planes de rehabilitación kinésica y evolución motora.'),
('ret-rehab-sessions', 'rehab_sessions', 15, 'Ley 26.529 Art. 18', FALSE, 'Sesiones y registros de asistencia kinésica.')
ON CONFLICT (entity_name) DO UPDATE SET retention_years = 15, allow_hard_delete = FALSE;

CREATE OR REPLACE FUNCTION public.prevent_medical_record_hard_delete()
RETURNS TRIGGER AS $$
DECLARE
    v_retention RECORD;
BEGIN
    SELECT * INTO v_retention
    FROM public.retention_policy
    WHERE entity_name = TG_TABLE_NAME;

    RAISE EXCEPTION 'Operación denegada por Ley 26.529 (Art. 18) y Política de Retención Legal (%): Los registros de % tienen obligación legal de conservación por % años y no admiten borrado físico. Utilice baja lógica o cancelación.',
        COALESCE(v_retention.legal_basis, 'Ley 26.529 Art. 18'),
        TG_TABLE_NAME,
        COALESCE(v_retention.retention_years, 15);
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


GRANT SELECT ON public.public_doctors TO anon, authenticated;

-- ====================================================================
-- 28. RESERVA PÚBLICA DE TURNOS SEGURA (ALTA-07)
-- Ejecutable por rol anon y authenticated con validaciones estrictas
-- ====================================================================
-- Tabla para control de intentos y mitigación de abuso de reservas públicas (V2-A8, A3-03)
CREATE TABLE IF NOT EXISTS public.public_booking_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dni VARCHAR(30) NOT NULL,
    ip_address TEXT,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_booking_attempts_dni_time ON public.public_booking_attempts(dni, attempted_at);

-- A3-03: Bloqueo de acceso directo a la tabla de rate-limiting (solo accesible vía SECURITY DEFINER)
ALTER TABLE public.public_booking_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_booking_attempts FROM anon, authenticated;

-- V4-A3: Solicitudes de reserva pública que requieren validación presencial/telefónica por Secretaría
CREATE TABLE IF NOT EXISTS public.booking_requests (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('req-' || gen_random_uuid()::text),
    dni VARCHAR(20) NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(150),
    doctor_id VARCHAR(50) REFERENCES public.doctors(id) ON DELETE SET NULL,
    doctor_name VARCHAR(150),
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(30) DEFAULT 'Pendiente de confirmación',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "booking_requests_admin_policy" ON public.booking_requests;
CREATE POLICY "booking_requests_admin_policy" ON public.booking_requests FOR ALL USING (public.is_administrative());

-- A3-04: Reserva pública con validación de horarios, días laborales, duración acotada y respuesta uniforme
CREATE OR REPLACE FUNCTION public.create_public_booking(
    p_booking JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_patient_id VARCHAR;
    v_existing_pat RECORD;
    v_clean_dni VARCHAR;
    v_doctor_id VARCHAR;
    v_doctor_name VARCHAR;
    v_doctor_specialty VARCHAR;
    v_doc RECORD;
    v_date DATE;
    v_time TIME;
    v_duration INT;
    v_app_id VARCHAR;
    v_booking_code VARCHAR;
    v_collision_count INT;
    v_attempts_count INT;
    v_day_name TEXT;
BEGIN
    v_clean_dni := regexp_replace(COALESCE(p_booking->>'patient_dni', ''), '\D', '', 'g');
    IF length(v_clean_dni) < 6 THEN
        RAISE EXCEPTION 'DNI inválido para reserva de turno.';
    END IF;

    -- V2-A8: Control de abuso y rate limiting por DNI (máximo 5 reservas por DNI en 24 horas)
    SELECT count(*) INTO v_attempts_count
    FROM public.public_booking_attempts
    WHERE dni = v_clean_dni AND attempted_at > NOW() - INTERVAL '24 hours';

    IF v_attempts_count >= 5 THEN
        RAISE EXCEPTION 'Ha superado el límite de 5 intentos de reserva por día para este DNI.';
    END IF;

    DECLARE
        v_headers JSONB;
        v_client_ip TEXT;
        v_ip_count INT;
    BEGIN
        BEGIN
            v_headers := NULLIF(current_setting('request.headers', true), '')::jsonb;
        EXCEPTION WHEN OTHERS THEN
            v_headers := NULL;
        END;

        -- V4-A3: Leer IP de cabeceras seguras del gateway o socket, ignorando client_ip del JSON
        v_client_ip := COALESCE(
            v_headers->>'cf-connecting-ip',
            v_headers->>'x-forwarded-for',
            v_headers->>'x-real-ip',
            inet_client_addr()::text,
            '127.0.0.1'
        );
        IF position(',' IN v_client_ip) > 0 THEN
            v_client_ip := trim(split_part(v_client_ip, ',', 1));
        END IF;

        SELECT count(*) INTO v_ip_count
        FROM public.public_booking_attempts
        WHERE ip_address = v_client_ip AND attempted_at > NOW() - INTERVAL '1 hour';

        IF v_ip_count >= 10 THEN
            RAISE EXCEPTION 'Límite de reservas por hora alcanzado para su conexión. Por favor reintente más tarde.';
        END IF;

        INSERT INTO public.public_booking_attempts (dni, ip_address, attempted_at)
        VALUES (v_clean_dni, v_client_ip, NOW());
    END;

    v_doctor_id := p_booking->>'doctor_id';
    SELECT * INTO v_doc
    FROM public.doctors
    WHERE id = v_doctor_id AND is_active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El profesional solicitado no se encuentra activo o disponible.';
    END IF;

    v_doctor_name := v_doc.name;
    v_doctor_specialty := v_doc.specialty_name;

    v_date := (p_booking->>'date')::date;
    v_time := (p_booking->>'time')::time;

    -- Validaciones de fecha: rechazar fechas pasadas y reservas a más de 90 días
    IF v_date < (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date THEN
        RAISE EXCEPTION 'No se pueden agendar turnos para fechas pasadas.';
    END IF;

    IF v_date > ((NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date + INTERVAL '90 days') THEN
        RAISE EXCEPTION 'La fecha de reserva supera el límite permitido de 90 días de antelación.';
    END IF;

    -- A3-04: Validación de horario de atención del profesional
    IF v_doc.schedule_start IS NOT NULL AND v_doc.schedule_end IS NOT NULL THEN
        IF v_time < v_doc.schedule_start OR v_time > v_doc.schedule_end THEN
            RAISE EXCEPTION 'Horario no disponible: El horario solicitado (%) está fuera del rango de atención del profesional (% a %).', 
                v_time, v_doc.schedule_start, v_doc.schedule_end;
        END IF;
    END IF;

    -- A3-04: Validación de días laborales del profesional
    IF v_doc.working_days IS NOT NULL AND array_length(v_doc.working_days, 1) > 0 THEN
        v_day_name := CASE EXTRACT(DOW FROM v_date)::INT
            WHEN 0 THEN 'Domingo'
            WHEN 1 THEN 'Lunes'
            WHEN 2 THEN 'Martes'
            WHEN 3 THEN 'Miércoles'
            WHEN 4 THEN 'Jueves'
            WHEN 5 THEN 'Viernes'
            WHEN 6 THEN 'Sábado'
        END;
        IF NOT (v_day_name = ANY(v_doc.working_days)) THEN
            RAISE EXCEPTION 'Día no laboral: El profesional no atiende los días %.', v_day_name;
        END IF;
    END IF;

    -- A3-04: Validación de fechas bloqueadas
    IF v_doc.blocked_dates IS NOT NULL AND v_date = ANY(v_doc.blocked_dates) THEN
        RAISE EXCEPTION 'La fecha seleccionada se encuentra bloqueada por el profesional.';
    END IF;

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

    -- Acotar duración del turno de forma segura (entre 15 y 60 minutos)
    v_duration := LEAST(GREATEST(COALESCE((p_booking->>'duration')::int, v_doc.slot_duration, 30), 15), 60);

    -- Buscar o crear paciente en padrón con segundo factor (V3-A4 / V4-A3)
    SELECT id, name, dni, email, birth_date INTO v_existing_pat
    FROM public.patients
    WHERE regexp_replace(dni, '\D', '', 'g') = v_clean_dni
    LIMIT 1;

    IF v_existing_pat.id IS NOT NULL THEN
        -- V4-A3: Si la ficha ya existe, verificar que coincida la fecha de nacimiento obligatoriamente
        IF v_existing_pat.birth_date IS NULL 
           OR p_booking->>'patient_birth_date' IS NULL 
           OR (p_booking->>'patient_birth_date')::date != v_existing_pat.birth_date THEN
            RAISE EXCEPTION 'Los datos no coinciden con la ficha registrada. Verifique su fecha de nacimiento o comuníquese con secretaría.';
        END IF;
        v_patient_id := v_existing_pat.id;
    ELSE
        v_patient_id := 'pat-' || gen_random_uuid()::text;
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

    v_app_id := 'app-' || gen_random_uuid()::text;
    -- Código de reserva seguro e impredecible (A3-30)
    v_booking_code := 'CITRA-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));

    INSERT INTO public.appointments (
        id, patient_id, patient_name, patient_dni, patient_phone, patient_email,
        patient_insurance, patient_insurance_number, doctor_id, doctor_name,
        doctor_specialty, room_id, room_name, date, time, duration, type, status, reason,
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
        v_doc.room_id,
        v_doc.room_name,
        v_date,
        v_time,
        v_duration,
        'Consulta Presencial',
        'confirmado',
        COALESCE(p_booking->>'reason', 'Reserva online de turno'),
        COALESCE((p_booking->>'copay_amount')::numeric, 0),
        TRUE,
        v_booking_code
    );

    -- Retorno seguro sin filtrar patient_id y uniforme
    RETURN jsonb_build_object(
        'success', TRUE,
        'appointment_id', v_app_id,
        'booking_code', v_booking_code,
        'status', 'confirmado',
        'date', v_date,
        'time', v_time,
        'doctor_name', v_doctor_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

GRANT EXECUTE ON FUNCTION public.create_public_booking(JSONB) TO anon, authenticated;

-- ====================================================================
-- 29. STORAGE DE ARCHIVOS MÉDICOS SEGURO (ALTA-09)
-- Bucket privado sin fallback público y con RLS estricta
-- ====================================================================
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
        public.is_superadmin() OR
        public.is_administrative() OR
        (
            public.is_doctor() AND
            public.doctor_treats_patient(
                (storage.foldername(name))[1],
                public.get_current_doctor_id()
            )
        ) OR
        (
            auth.uid() IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM public.patients p
                WHERE p.user_id = auth.uid()
                  AND p.id = (storage.foldername(name))[1]
            )
        )
    )
);

DROP POLICY IF EXISTS "medical_records_insert_policy" ON storage.objects;
CREATE POLICY "medical_records_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'medical_records' AND (
        public.is_superadmin() OR
        public.is_administrative() OR
        (
            public.is_doctor() AND
            public.doctor_treats_patient(
                (storage.foldername(name))[1],
                public.get_current_doctor_id()
            )
        ) OR
        (
            auth.uid() IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM public.patients p
                WHERE p.user_id = auth.uid()
                  AND p.id = (storage.foldername(name))[1]
            )
        )
    )
);

-- ====================================================================
-- 30. PUBLICACIÓN EN TIEMPO REAL (Sección 4 - Riesgo 4)
-- ====================================================================
ALTER TABLE public.patients REPLICA IDENTITY FULL;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.consultations REPLICA IDENTITY FULL;
ALTER TABLE public.electronic_prescriptions REPLICA IDENTITY FULL;
ALTER TABLE public.imaging_studies REPLICA IDENTITY FULL;
ALTER TABLE public.cash_shifts REPLICA IDENTITY FULL;
ALTER TABLE public.cash_movements REPLICA IDENTITY FULL;

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'patients', 'appointments', 'consultations',
        'electronic_prescriptions', 'imaging_studies',
        'cash_shifts', 'cash_movements', 'patient_files'
    ];
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        FOREACH tbl IN ARRAY tables LOOP
            BEGIN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
            EXCEPTION
                WHEN duplicate_object THEN NULL;
                WHEN undefined_object THEN NULL;
                WHEN OTHERS THEN NULL;
            END;
        END LOOP;
    END IF;
END $$;

-- ====================================================================
-- 31. PREVENCIÓN TOTAL DE TRUNCATE EN TABLAS CLÍNICAS Y LEGALES
-- Ley 26.529 Art. 18 / Integridad y Custodia Legal
-- ====================================================================
CREATE OR REPLACE FUNCTION public.prevent_table_truncate()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Operación TRUNCATE terminantemente prohibida en tablas clínicas y contables (Ley 26.529 / Citra Security Policy).';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_no_truncate_patients ON public.patients;
CREATE TRIGGER trg_no_truncate_patients BEFORE TRUNCATE ON public.patients FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_table_truncate();

DROP TRIGGER IF EXISTS trg_no_truncate_doctors ON public.doctors;
CREATE TRIGGER trg_no_truncate_doctors BEFORE TRUNCATE ON public.doctors FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_table_truncate();

DROP TRIGGER IF EXISTS trg_no_truncate_appointments ON public.appointments;
CREATE TRIGGER trg_no_truncate_appointments BEFORE TRUNCATE ON public.appointments FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_table_truncate();

DROP TRIGGER IF EXISTS trg_no_truncate_consultations ON public.consultations;
CREATE TRIGGER trg_no_truncate_consultations BEFORE TRUNCATE ON public.consultations FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_table_truncate();

DROP TRIGGER IF EXISTS trg_no_truncate_prescriptions ON public.electronic_prescriptions;
CREATE TRIGGER trg_no_truncate_prescriptions BEFORE TRUNCATE ON public.electronic_prescriptions FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_table_truncate();

DROP TRIGGER IF EXISTS trg_no_truncate_imaging ON public.imaging_studies;
CREATE TRIGGER trg_no_truncate_imaging BEFORE TRUNCATE ON public.imaging_studies FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_table_truncate();

DROP TRIGGER IF EXISTS trg_no_truncate_rehab_sessions ON public.rehab_sessions;
CREATE TRIGGER trg_no_truncate_rehab_sessions BEFORE TRUNCATE ON public.rehab_sessions FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_table_truncate();

DROP TRIGGER IF EXISTS trg_no_truncate_cash_shifts ON public.cash_shifts;
CREATE TRIGGER trg_no_truncate_cash_shifts BEFORE TRUNCATE ON public.cash_shifts FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_table_truncate();

DROP TRIGGER IF EXISTS trg_no_truncate_cash_movements ON public.cash_movements;
CREATE TRIGGER trg_no_truncate_cash_movements BEFORE TRUNCATE ON public.cash_movements FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_table_truncate();

DROP TRIGGER IF EXISTS trg_no_truncate_audit_logs ON public.audit_logs;
CREATE TRIGGER trg_no_truncate_audit_logs BEFORE TRUNCATE ON public.audit_logs FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_table_truncate();

REVOKE TRUNCATE ON TABLE
    public.patients,
    public.doctors,
    public.appointments,
    public.consultations,
    public.electronic_prescriptions,
    public.imaging_studies,
    public.rehab_plans,
    public.rehab_sessions,
    public.consent_forms,
    public.invoices,
    public.cash_shifts,
    public.cash_movements,
    public.audit_logs
FROM public, authenticated, anon;

-- Asegurar rol de superadmin y vínculo médico para la cuenta del director (Dr. Blanco) si ya existe en auth
DO $$
DECLARE
    v_blanco_uid UUID;
BEGIN
    SELECT id INTO v_blanco_uid FROM auth.users WHERE email = 'dr.blanco@citra.com.ar' LIMIT 1;
    IF v_blanco_uid IS NOT NULL THEN
        UPDATE public.profiles SET role = 'superadmin' WHERE id = v_blanco_uid;
        UPDATE public.doctors SET user_id = v_blanco_uid WHERE id = 'doc-1';
    END IF;
END $$;


