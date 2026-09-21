-- ====================================================================
-- CITRA · Centro Integral de Traumatología & Rehabilitación Arroyito
-- SEED DATA DE PRODUCCIÓN / INICIALIZACIÓN PARA SUPABASE
-- ====================================================================

-- 1. Especialidades Médicas
INSERT INTO specialties (id, name, category, color, icon, estimated_duration, description) VALUES
('esp-1', 'Traumatología', 'Especialidades', '#002182', 'Bone', 30, 'Diagnóstico y tratamiento óseo, articular, fracturas y lesiones deportivas.'),
('esp-2', 'Neurología', 'Especialidades', '#076ABC', 'Brain', 40, 'Atención integral del sistema nervioso, migrañas, cefaleas y dolor neuropático.'),
('esp-3', 'Reumatología', 'Especialidades', '#257CE6', 'Activity', 30, 'Enfermedades inflamatorias y autoinmunes de las articulaciones y tejido conectivo.'),
('esp-4', 'Nutrición', 'Especialidades', '#055294', 'Apple', 30, 'Planes nutricionales personalizados, antiinflamatorios y nutrición deportiva.'),
('esp-5', 'Kinesiología', 'Rehabilitación', '#076ABC', 'Dumbbell', 40, 'Recuperación funcional activa, pre y post-quirúrgica en gimnasio terapéutico.'),
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

-- 2. Consultorios
INSERT INTO rooms (id, name, floor, branch_id, specialty) VALUES
('room-101', 'Consultorio 101 — Traumatología', 'Piso 1', 'branch-1', 'Traumatología'),
('room-102', 'Consultorio 102 — Kinesiología & Fisioterapia', 'Piso 1', 'branch-1', 'Kinesiología'),
('room-103', 'Consultorio 103 — Neurología & Reumatología', 'Piso 1', 'branch-1', 'Neurología'),
('room-201', 'Consultorio 201 — Nutrición & Piso Pélvico', 'Piso 2', 'branch-1', 'Nutrición'),
('room-202', 'Consultorio 202 — Osteopatía & ATM', 'Piso 2', 'branch-1', 'Osteopatía'),
('room-203', 'Gabinete de Ozonoterapia & Medicina Estética', 'Piso 2', 'branch-1', 'Ozonoterapia'),
('room-204', 'Sala de Radiología Digital & Estudio de la Pisada', 'PB', 'branch-1', 'Radiología Digital')
ON CONFLICT (id) DO NOTHING;

-- 3. Obras Sociales y Prepagas
INSERT INTO health_insurances (id, name, plans, copay, status) VALUES
('hi-1', 'OSDE', '["210", "310", "410", "450", "510"]'::jsonb, 0, 'Activa'),
('hi-2', 'Swiss Medical', '["SMG20", "SMG30", "SMG40", "SMG50"]'::jsonb, 1500, 'Activa'),
('hi-3', 'Galeno', '["Plata", "Oro", "Azul"]'::jsonb, 2000, 'Activa'),
('hi-4', 'Apross', '["Obligatorio", "Voluntario"]'::jsonb, 1200, 'Activa'),
('hi-5', 'PAMI', '["General", "Veteranos"]'::jsonb, 0, 'Activa'),
('hi-6', 'Medicus', '["Celeste", "Azul"]'::jsonb, 1800, 'Activa'),
('hi-7', 'Particular / Privado', '["Arancel Pleno"]'::jsonb, 22000, 'Activa')
ON CONFLICT (id) DO NOTHING;

-- 4. Horarios Generales de la Clínica
INSERT INTO clinic_schedules (id, opening_time, closing_time, saturday_closing_time, slot_duration, working_days, blocked_dates) VALUES
('main-schedule', '08:00', '20:00', '13:00', 30, ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'], ARRAY['2026-12-25'::date, '2027-01-01'::date])
ON CONFLICT (id) DO NOTHING;

-- 5. Profesionales Médicos Iniciales
INSERT INTO doctors (id, name, license, sisa_refeps, specialty_id, specialty_name, room_id, room_name, email, phone, working_days, schedule_start, schedule_end, slot_duration, price_consultation, fee_percentage, accepted_insurances, experience, bio) VALUES
('doc-1', 'Dr. Alejandro Blanco', 'MP 38.412 / ME 19.820', 'REFEPS-MP-38412', 'esp-1', 'Traumatología y Ortopedia', 'room-101', 'Consultorio 101 — Traumatología', 'dr.blanco@citra.com.ar', '3576 450214', ARRAY['Lunes','Miércoles','Viernes'], '08:00', '14:00', 30, 25000, 75, ARRAY['hi-1','hi-2','hi-3','hi-7'], '15+ años de experiencia', 'Especialista en traumatología y ortopedia, patología de rodilla, hombro y lesiones deportivas de alta competencia.'),
('doc-2', 'Dr. Lagos', 'MP 41.250 / ME 20.315', 'REFEPS-MP-41250', 'esp-1', 'Traumatología y Ortopedia', 'room-101', 'Consultorio 101 — Traumatología', 'dr.lagos@citra.com.ar', '3576 450214', ARRAY['Martes','Jueves','Sábado'], '09:00', '15:00', 30, 25000, 75, ARRAY['hi-1','hi-2','hi-4','hi-7'], '12+ años de experiencia', 'Cirujano ortopedista enfocado en miembro inferior, cadera y columna vertebral.')
ON CONFLICT (id) DO NOTHING;
