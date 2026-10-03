-- ====================================================================
-- CITRA · Centro Integral de Traumatología & Rehabilitación Arroyito
-- ESQUEMA COMPLETO DE BASE DE DATOS (PostgreSQL 15+ / Supabase DDL)
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

-- 7. Profesionales Médicos (Cuerpo Médico)
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_active_slot
ON appointments (patient_id, date, time)
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

-- 18. Registro Inmutable de Auditoría (Audit Logs - Ley 25.326 y Ley 26.529)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id VARCHAR(100),
    user_name VARCHAR(200) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    target_dni VARCHAR(20) DEFAULT '-',
    details TEXT,
    ip_address VARCHAR(50),
    event_hash VARCHAR(64) NOT NULL,
    module VARCHAR(100),
    target_id VARCHAR(100)
);

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

-- 21. Facturación y Comprobantes Fiscales ARCA (A-04)
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL,
    cae VARCHAR(30) NOT NULL,
    cae_vto DATE NOT NULL,
    pto_vta INTEGER NOT NULL DEFAULT 1,
    tipo_cmp INTEGER NOT NULL DEFAULT 6,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(200) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    concept VARCHAR(200) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
    status VARCHAR(30) NOT NULL DEFAULT 'Cobrado',
    arca_validated BOOLEAN NOT NULL DEFAULT true,
    receipt_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Índices de Alto Rendimiento para Producción (M09)
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_date ON consultations(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_date ON consultations(patient_id, date);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON electronic_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON electronic_prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_cuir ON electronic_prescriptions(cuir);

CREATE INDEX IF NOT EXISTS idx_imaging_patient_id ON imaging_studies(patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_doctor_id ON imaging_studies(doctor_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_dni ON audit_logs(target_dni);

CREATE INDEX IF NOT EXISTS idx_adendas_consultation ON consultation_adendas(consultation_id);
CREATE INDEX IF NOT EXISTS idx_adendas_doctor ON consultation_adendas(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_orders_patient ON medical_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_orders_doctor ON medical_orders(doctor_id);
CREATE INDEX IF NOT EXISTS idx_certificates_patient ON medical_certificates(patient_id);
CREATE INDEX IF NOT EXISTS idx_certificates_doctor ON medical_certificates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_cae ON invoices(cae);
CREATE INDEX IF NOT EXISTS idx_cash_movements_shift ON cash_movements(shift_id);
CREATE INDEX IF NOT EXISTS idx_cash_shifts_date ON cash_shifts(opened_at);

-- 22. Triggers para auto-actualización de 'updated_at'
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_doctors_updated_at ON doctors;
CREATE TRIGGER trigger_doctors_updated_at
BEFORE UPDATE ON doctors
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_patients_updated_at ON patients;
CREATE TRIGGER trigger_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_consultations_updated_at ON consultations;
CREATE TRIGGER trigger_consultations_updated_at
BEFORE UPDATE ON consultations
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 23. Disparador de alta automática de Perfil al registrarse en Auth
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
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 24. Solicitudes de Acceso Clínico e Interconsultas (A-07)
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. Vista Pública Reducida de Profesionales para Pacientes y Reserva Online (A-01)
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
WHERE is_active = TRUE;

-- ====================================================================
-- INMUTABILIDAD LEGAL Y PREVENCIÓN DE BORRADO FÍSICO (Ley 26.529 Art. 18 / CRIT-01, CRIT-02)
-- Obligación de custodia y conservación por 15 años de antecedentes médicos
-- ====================================================================
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

GRANT SELECT ON public.public_doctors TO anon, authenticated;

-- ====================================================================
-- 21. FUNCIONES AUXILIARES DE ROL Y VISTA PÚBLICA (T9, T16)
-- ====================================================================
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
    SELECT (public.get_auth_role() = 'doctor' OR auth.jwt() ->> 'email' = 'dr.blanco@citra.com.ar' OR EXISTS (SELECT 1 FROM public.doctors WHERE user_id = auth.uid()));
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE OR REPLACE FUNCTION public.get_current_doctor_id()
RETURNS VARCHAR AS $$
    SELECT d.id
    FROM public.doctors d
    LEFT JOIN public.profiles p ON p.id = d.user_id
    WHERE (d.user_id = auth.uid() OR auth.jwt() ->> 'email' = d.email)
      AND (p.role IN ('doctor', 'superadmin') OR p.role IS NULL)
      AND COALESCE(p.is_active, TRUE) = TRUE
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

REVOKE EXECUTE ON FUNCTION public.get_auth_role() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_superadmin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_administrative() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_doctor() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_current_doctor_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_current_patient_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.doctor_treats_patient(VARCHAR, VARCHAR) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.doctor_treats_patient(VARCHAR, VARCHAR) TO authenticated;
-- ====================================================================
-- POLÍTICAS Y TRIGGERS DE SEGURIDAD (C-04, T7, T10, T11, T12)
-- ====================================================================

-- 1. Protección contra auto-escalado en Doctors (C-04, T6, T11)
CREATE OR REPLACE FUNCTION public.protect_doctor_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT public.is_administrative() AND NOT public.is_superadmin() THEN
        IF NEW.fee_percentage IS DISTINCT FROM OLD.fee_percentage THEN
            RAISE EXCEPTION 'Operación denegada (C-04): Solo la administración de CITRA puede modificar porcentajes de honorarios.';
        END IF;
        IF NEW.price_consultation IS DISTINCT FROM OLD.price_consultation THEN
            RAISE EXCEPTION 'Operación denegada (C-04): Solo la administración puede modificar aranceles de consulta.';
        END IF;
        IF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
            RAISE EXCEPTION 'Operación denegada (T11): Un profesional inactivo no puede reactivarse a sí mismo unilateralmente.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_doctor_fields ON public.doctors;
CREATE TRIGGER trg_protect_doctor_fields
BEFORE UPDATE ON public.doctors
FOR EACH ROW EXECUTE FUNCTION public.protect_doctor_fields();

-- 2. Protección de modificación de datos en Patients (T4, C-04)
CREATE OR REPLACE FUNCTION public.protect_patient_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Inmutabilidad de identificadores: No se puede modificar el ID ni la fecha de creación del paciente.';
    END IF;

    IF public.get_auth_role() = 'patient' THEN
        IF NEW.dni IS DISTINCT FROM OLD.dni THEN
            RAISE EXCEPTION 'Operación denegada (T4): El DNI requiere validación de identidad en secretaría.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_patient_fields ON public.patients;
CREATE TRIGGER trg_protect_patient_fields
BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.protect_patient_fields();

-- 3. Protección de informes radiológicos contra edición administrativa (T7)
CREATE OR REPLACE FUNCTION public.protect_imaging_report()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT public.is_doctor() AND NOT public.is_superadmin() THEN
        IF NEW.report IS DISTINCT FROM OLD.report
           OR NEW.findings IS DISTINCT FROM OLD.findings
           OR NEW.conclusion IS DISTINCT FROM OLD.conclusion
           OR (NEW.status = 'informado' AND OLD.status != 'informado')
        THEN
            RAISE EXCEPTION 'Operación denegada (T7): La redacción o modificación de informes diagnósticos está reservada exclusivamente a profesionales médicos.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_imaging_report ON public.imaging_studies;
CREATE TRIGGER trg_protect_imaging_report
BEFORE UPDATE ON public.imaging_studies
FOR EACH ROW EXECUTE FUNCTION public.protect_imaging_report();

-- 4. Protección contra colisión y control de cancelación de turnos (A-03, T10)
CREATE OR REPLACE FUNCTION public.check_appointment_patient_cancellation()
RETURNS TRIGGER AS $$
BEGIN
    IF public.get_auth_role() = 'patient' THEN
        IF NEW.doctor_id IS DISTINCT FROM OLD.doctor_id OR
           NEW.patient_id IS DISTINCT FROM OLD.patient_id OR
           NEW.date IS DISTINCT FROM OLD.date OR
           NEW.time IS DISTINCT FROM OLD.time THEN
            RAISE EXCEPTION 'Operación denegada (T10): El paciente solo puede cancelar su turno sin modificar fecha, horario ni profesional asignado.';
        END IF;

        IF NEW.status != 'cancelado' THEN
            RAISE EXCEPTION 'Operación denegada (T10): El paciente solo tiene permisos para cancelar turnos agendados (status = cancelado).';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_appointment_patient_cancellation ON public.appointments;
CREATE TRIGGER trg_appointment_patient_cancellation
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.check_appointment_patient_cancellation();

-- 5. Prevención de solapamiento y validación de disponibilidad del profesional y paciente (A-03)
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

        -- 3. Validación de disponibilidad, feriados y horarios del profesional en el servidor
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

-- 6. Inmutabilidad HCE (Ley 26.529) para Consultas, Adendas, Órdenes y Certificados
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

-- 7. Inmutabilidad de Recetas Electrónicas (Ley 27.553)
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

-- 8. Inmutabilidad de Consentimientos Informados
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



