-- ====================================================================
-- CITRA · Centro Integral de Traumatología & Rehabilitación Arroyito
-- ESQUEMA DE BASE DE DATOS PARA PRODUCCIÓN EN SUPABASE (PostgreSQL 15+)
-- Cumplimiento: Ley 26.529, Ley 25.506 (Firma Digital), Ley 27.553 (ReNaPDiS)
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
    CREATE TYPE study_status AS ENUM ('solicitado', 'en_proceso', 'completado', 'entregado');
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
    sisa_refeps VARCHAR(100) DEFAULT 'REFEPS-MN-114829',
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
    registered_at DATE DEFAULT CURRENT_DATE,
    avatar_url TEXT,
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
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    patient_phone VARCHAR(50),
    patient_email VARCHAR(200),
    patient_insurance VARCHAR(150),
    patient_insurance_number VARCHAR(100),
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
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
    copay_amount NUMERIC(10,2) DEFAULT 0,
    booked_online BOOLEAN DEFAULT FALSE,
    booking_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evitar turnos duplicados con el mismo doctor, fecha y hora si no están cancelados
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_appointment
ON appointments (doctor_id, date, time)
WHERE status != 'cancelado';

-- 11. Historias Clínicas Electrónicas (HCE) - Ley 26.529 y Ley 25.506
CREATE TABLE IF NOT EXISTS consultations (
    id VARCHAR(50) PRIMARY KEY,
    appointment_id VARCHAR(50) REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    doctor_name VARCHAR(200) NOT NULL,
    doctor_license VARCHAR(100) NOT NULL,
    sisa_refeps VARCHAR(100) DEFAULT 'REFEPS-MN-114829',
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

-- 12. Adendas Clínicas (Inmutabilidad de HCE: sólo se anexa información)
CREATE TABLE IF NOT EXISTS consultation_adendas (
    id VARCHAR(50) PRIMARY KEY,
    consultation_id VARCHAR(50) NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    doctor_name VARCHAR(200) NOT NULL,
    note TEXT NOT NULL,
    reason VARCHAR(250),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    integrity_hash VARCHAR(64) NOT NULL
);

-- 13. Recetas Electrónicas Oficiales (ReNaPDiS - Ley 27.553)
CREATE TABLE IF NOT EXISTS electronic_prescriptions (
    id VARCHAR(50) PRIMARY KEY,
    cuir VARCHAR(100) UNIQUE NOT NULL,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    doctor_name VARCHAR(200) NOT NULL,
    doctor_license VARCHAR(100) NOT NULL,
    sisa_refeps VARCHAR(100) DEFAULT 'REFEPS-MN-114829',
    diagnosis_presuntivo TEXT NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE NOT NULL,
    status prescription_status DEFAULT 'activa',
    verification_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Diagnóstico por Imágenes & Radiología
CREATE TABLE IF NOT EXISTS imaging_studies (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
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
    images JSONB DEFAULT '[]'::jsonb,
    priority VARCHAR(20) DEFAULT 'Normal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Órdenes y Certificados Médicos
CREATE TABLE IF NOT EXISTS medical_orders (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
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
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(200) NOT NULL,
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE SET NULL,
    doctor_name VARCHAR(200) NOT NULL,
    diagnosis TEXT NOT NULL,
    rest_days INT DEFAULT 0,
    observations TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Kinesiología & Rehabilitación
CREATE TABLE IF NOT EXISTS rehab_plans (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(200) NOT NULL,
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

-- 17. Registro Inmutable de Auditoría (Audit Logs - Ley 25.326 y Ley 26.529)
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
    event_hash VARCHAR(64) NOT NULL
);

-- 18. Índices de Alto Rendimiento para Producción
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON electronic_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_cuir ON electronic_prescriptions(cuir);

CREATE INDEX IF NOT EXISTS idx_imaging_patient_id ON imaging_studies(patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_doctor_id ON imaging_studies(doctor_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_dni ON audit_logs(target_dni);

-- 19. Triggers para auto-actualización de 'updated_at'
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

-- 20. Disparador de alta automática de Perfil al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'::user_role)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
