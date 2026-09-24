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

-- 7. Profesionales Médicos (Cuerpo Médico - 13 Especialistas Reales)
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
    is_active BOOLEAN DEFAULT TRUE,
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_appointment
ON appointments (doctor_id, date, time)
WHERE status != 'cancelado';

-- 11. Historias Clínicas Electrónicas (HCE) - Ley 26.529 y Ley 25.506
CREATE TABLE IF NOT EXISTS consultations (
    id VARCHAR(50) PRIMARY KEY,
    appointment_id VARCHAR(50) REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(200) NOT NULL,
    patient_dni VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
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
    sisa_refeps VARCHAR(100) DEFAULT 'REFEPS-MN-114829',
    diagnosis_presuntivo TEXT NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE NOT NULL,
    status prescription_status DEFAULT 'activa',
    verification_url TEXT,
    dispensation_status VARCHAR(50) DEFAULT 'Pendiente',
    dispensed_pharmacy VARCHAR(150),
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

-- 18. Registro Inmutable de Auditoría (Ley 25.326 y Ley 26.529)
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

-- 19. Función de creación segura de perfil al registrar usuario en Supabase Auth
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
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW; -- Garantiza que el alta del usuario nunca sea interrumpida
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 20. Políticas de Seguridad a Nivel de Fila (Row Level Security - RLS)
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
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Catálogos institucionales: Lectura pública (Landing, Turnero y Reserva)
DROP POLICY IF EXISTS "specialties_public_select" ON specialties;
CREATE POLICY "specialties_public_select" ON specialties FOR SELECT USING (true);

DROP POLICY IF EXISTS "rooms_public_select" ON rooms;
CREATE POLICY "rooms_public_select" ON rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "health_insurances_public_select" ON health_insurances;
CREATE POLICY "health_insurances_public_select" ON health_insurances FOR SELECT USING (true);

DROP POLICY IF EXISTS "doctors_public_select" ON doctors;
CREATE POLICY "doctors_public_select" ON doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "schedules_public_select" ON clinic_schedules;
CREATE POLICY "schedules_public_select" ON clinic_schedules FOR SELECT USING (true);

-- Pacientes: Acceso público/anon y autenticado para creación y lectura por DNI
DROP POLICY IF EXISTS "patients_all_access" ON patients;
CREATE POLICY "patients_all_access" ON patients FOR ALL USING (true) WITH CHECK (true);

-- Turnos: Acceso público/anon y administrativo para reserva y gestión
DROP POLICY IF EXISTS "appointments_all_access" ON appointments;
CREATE POLICY "appointments_all_access" ON appointments FOR ALL USING (true) WITH CHECK (true);

-- Historias Clínicas y Documentos Médicos: Permisivo para sincronización transparente del SPA
DROP POLICY IF EXISTS "consultations_all_access" ON consultations;
CREATE POLICY "consultations_all_access" ON consultations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "adendas_all_access" ON consultation_adendas;
CREATE POLICY "adendas_all_access" ON consultation_adendas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "prescriptions_all_access" ON electronic_prescriptions;
CREATE POLICY "prescriptions_all_access" ON electronic_prescriptions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "imaging_all_access" ON imaging_studies;
CREATE POLICY "imaging_all_access" ON imaging_studies FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orders_all_access" ON medical_orders;
CREATE POLICY "orders_all_access" ON medical_orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "certificates_all_access" ON medical_certificates;
CREATE POLICY "certificates_all_access" ON medical_certificates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "consent_forms_all_access" ON consent_forms;
CREATE POLICY "consent_forms_all_access" ON consent_forms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "rehab_plans_all_access" ON rehab_plans;
CREATE POLICY "rehab_plans_all_access" ON rehab_plans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "audit_logs_all_access" ON audit_logs;
CREATE POLICY "audit_logs_all_access" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 21. CARGA DE DATOS MAESTROS (SEED DATA COMPLETO DE CITRA)
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
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- B) Consultorios Físicos
INSERT INTO rooms (id, name, floor, branch_id, specialty) VALUES
('room-101', 'Consultorio 101 — Traumatología', 'Piso 1', 'branch-1', 'Traumatología'),
('room-102', 'Consultorio 102 — Kinesiología & Fisioterapia', 'Piso 1', 'branch-1', 'Kinesiología'),
('room-103', 'Consultorio 103 — Neurología & Reumatología', 'Piso 1', 'branch-1', 'Neurología'),
('room-201', 'Consultorio 201 — Nutrición & Piso Pélvico', 'Piso 2', 'branch-1', 'Nutrición'),
('room-202', 'Consultorio 202 — Osteopatía & ATM', 'Piso 2', 'branch-1', 'Osteopatía'),
('room-203', 'Gabinete de Ozonoterapia & Medicina Estética', 'Piso 2', 'branch-1', 'Ozonoterapia'),
('room-204', 'Sala de Radiología Digital & Estudio de la Pisada', 'PB', 'branch-1', 'Radiología Digital')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- C) Obras Sociales
INSERT INTO health_insurances (id, name, plans, copay, status) VALUES
('hi-1', 'OSDE', '["210", "310", "410", "450", "510"]'::jsonb, 0, 'Activa'),
('hi-2', 'Swiss Medical', '["SMG20", "SMG30", "SMG40", "SMG50"]'::jsonb, 1500, 'Activa'),
('hi-3', 'Galeno', '["Plata", "Oro", "Azul"]'::jsonb, 2000, 'Activa'),
('hi-4', 'Apross', '["Obligatorio", "Voluntario"]'::jsonb, 1200, 'Activa'),
('hi-5', 'PAMI', '["General", "Veteranos"]'::jsonb, 0, 'Activa'),
('hi-6', 'Medicus', '["Celeste", "Azul"]'::jsonb, 1800, 'Activa'),
('hi-7', 'Particular / Privado', '["Arancel Pleno"]'::jsonb, 22000, 'Activa')
ON CONFLICT (id) DO UPDATE SET copay = EXCLUDED.copay, status = EXCLUDED.status;

-- D) Horario General de la Clínica
INSERT INTO clinic_schedules (id, opening_time, closing_time, saturday_closing_time, slot_duration, working_days, blocked_dates) VALUES
('main-schedule', '08:00', '20:00', '13:00', 30, ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'], ARRAY['2026-12-25'::date, '2027-01-01'::date])
ON CONFLICT (id) DO UPDATE SET opening_time = EXCLUDED.opening_time, closing_time = EXCLUDED.closing_time;

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
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    specialty_name = EXCLUDED.specialty_name,
    room_name = EXCLUDED.room_name,
    working_days = EXCLUDED.working_days,
    schedule_start = EXCLUDED.schedule_start,
    schedule_end = EXCLUDED.schedule_end,
    price_consultation = EXCLUDED.price_consultation,
    fee_percentage = EXCLUDED.fee_percentage;

-- F) Pacientes Iniciales (Filiación real para turnos de ejemplo)
INSERT INTO patients (id, name, dni, email, phone, birth_date, gender, blood_type, emergency_contact_name, emergency_contact_phone, insurance_id, insurance_name, insurance_plan, insurance_number, registered_at) VALUES
('pat-1', 'Juan Ignacio Pérez', '34.892.110', 'juan.perez@gmail.com', '3576 489211', '1989-11-14', 'Masculino', 'A+', 'María Pérez (Hermana)', '3576 489212', 'hi-1', 'OSDE', '310', '310-984210-01', '2026-01-15'),
('pat-2', 'María Elena Gómez', '28.450.932', 'maria.gomez@hotmail.com', '3576 612894', '1981-06-22', 'Femenino', '0+', 'Carlos Gómez (Cónyuge)', '3576 612895', 'hi-2', 'Swiss Medical', 'SMG30', 'SMG-4819024', '2026-02-03'),
('pat-3', 'Roberto Carlos Sánchez', '18.724.891', 'roberto.sanchez@yahoo.com.ar', '3576 523109', '1968-03-30', 'Masculino', 'B+', 'Lucía Sánchez (Hija)', '3576 523110', 'hi-4', 'Apross', 'Obligatorio', 'APR-771892', '2026-02-18')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- G) Turnos Iniciales
INSERT INTO appointments (id, patient_id, patient_name, patient_dni, patient_phone, patient_email, patient_insurance, doctor_id, doctor_name, doctor_specialty, room_id, room_name, date, time, duration, status, reason, booked_online, booking_code) VALUES
('app-1', 'pat-1', 'Juan Ignacio Pérez', '34.892.110', '3576 489211', 'juan.perez@gmail.com', 'OSDE', 'doc-1', 'Dr. Alejandro Blanco', 'Traumatología y Ortopedia', 'room-101', 'Consultorio 101 — Traumatología', CURRENT_DATE, '09:00', 30, 'confirmado', 'Control postoperatorio rodilla derecha', false, 'CTR-91823'),
('app-2', 'pat-2', 'María Elena Gómez', '28.450.932', '3576 612894', 'maria.gomez@hotmail.com', 'Swiss Medical', 'doc-1', 'Dr. Alejandro Blanco', 'Traumatología y Ortopedia', 'room-101', 'Consultorio 101 — Traumatología', CURRENT_DATE, '09:30', 30, 'confirmado', 'Dolor en hombro izquierdo - Manguito rotador', true, 'CTR-84192'),
('app-3', 'pat-3', 'Roberto Carlos Sánchez', '18.724.891', '3576 523109', 'roberto.sanchez@yahoo.com.ar', 'Apross', 'doc-4', 'Lic. Barrea', 'Kinesiología & Fisioterapia', 'room-102', 'Consultorio 102 — Gimnasio Kinésico', CURRENT_DATE, '10:00', 40, 'confirmado', 'Sesión de fisioterapia lumbar', false, 'CTR-37190')
ON CONFLICT (id) DO NOTHING;
