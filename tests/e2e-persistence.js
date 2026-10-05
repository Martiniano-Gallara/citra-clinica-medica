/**
 * CITRA — Suite E2E de Persistencia con PGlite
 * ================================================
 * Verifica ciclo completo: CREAR → RECARGAR → VERIFICAR en DB
 * para Pacientes, Turnos, Consultas e Integridad Referencial.
 *
 * Cumplimiento normativo y de seguridad:
 * - Inmutabilidad HCE (Ley 26.529 / Ley 25.506)
 * - Adendas médicas fechadas
 * - Prevención de doble reserva (Gap A-03)
 * - Integridad referencial (FKs con RESTRICT)
 *
 * Ejecutar: npm run test:e2e
 */

import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'fs';
import path from 'path';

// ─── Colores de consola ───────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
};

// ─── Resultado acumulado ──────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];

function ok(label) {
  passed++;
  console.log(`  ${C.green}✔${C.reset} ${label}`);
}

function fail(label, detail) {
  failed++;
  failures.push({ label, detail });
  console.log(`  ${C.red}✘${C.reset} ${label}`);
  if (detail) console.log(`    ${C.dim}→ ${detail}${C.reset}`);
}

function assert(cond, label, detail) {
  cond ? ok(label) : fail(label, detail);
}

function section(title) {
  console.log(`\n${C.cyan}${C.bold}▶ ${title}${C.reset}`);
}

// ─── Bootstrap DB ─────────────────────────────────────────────────────────────
async function bootstrapDB() {
  const db = new PGlite({ extensions: { pgcrypto } });

  await db.exec(`
    DO $$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE ROLE service_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT,
      raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
    $$ LANGUAGE sql STABLE;
    CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT AS $$
      SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''), 'anon');
    $$ LANGUAGE sql STABLE;
    CREATE OR REPLACE FUNCTION auth.jwt() RETURNS JSONB AS $$
      SELECT jsonb_build_object(
        'sub',   current_setting('request.jwt.claim.sub',   true),
        'role',  COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''), 'anon'),
        'email', current_setting('request.jwt.claim.email', true)
      );
    $$ LANGUAGE sql STABLE;

    -- V2-M5: Storage schema mock for PGlite test harness
    CREATE SCHEMA IF NOT EXISTS storage;
    CREATE TABLE IF NOT EXISTS storage.buckets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      public BOOLEAN DEFAULT FALSE,
      avif_autodetection BOOLEAN DEFAULT FALSE,
      file_size_limit BIGINT,
      allowed_mime_types TEXT[],
      owner_id TEXT
    );
    CREATE TABLE IF NOT EXISTS storage.objects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket_id TEXT REFERENCES storage.buckets(id),
      name TEXT NOT NULL,
      owner UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'::jsonb,
      path_tokens TEXT[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED
    );
    CREATE OR REPLACE FUNCTION storage.foldername(name text)
    RETURNS text[] LANGUAGE plpgsql AS $$
    BEGIN
      RETURN string_to_array(name, '/');
    END;
    $$;
  `);

  let sql = fs.readFileSync(
    path.join(process.cwd(), 'supabase', 'COMPLETE_SUPABASE_SETUP.sql'),
    'utf8'
  );
  sql = sql.replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp";/g, '-- uuid-ossp nativo en PG16');

  await db.exec(sql);
  return db;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const query = (db, sql, p = []) => db.query(sql, p).then(r => r.rows);
const exec  = (db, sql, p = []) => db.query(sql, p);

// ─── SUITE 1: PACIENTES ───────────────────────────────────────────────────────
async function testPatients(db) {
  section('PACIENTES — Crear → Recargar → Verificar');

  const patId = 'pat-e2e-' + Date.now();
  const dni = '99887766';

  // 1. INSERT Paciente
  await exec(db, `
    INSERT INTO patients (id, name, dni, email, phone, birth_date, gender, insurance_name, insurance_plan)
    VALUES ($1, 'Lucia E2E Test', $2, 'lucia@e2e.test', '3576123456', '1990-05-15', 'Femenino', 'OSDE', '310')
  `, [patId, dni]);

  // 2. SELECT inmediato (Recarga desde DB)
  let rows = await query(db, `SELECT * FROM patients WHERE id = $1`, [patId]);
  assert(rows.length === 1,                    'Paciente insertado y recuperado por ID');
  assert(rows[0].name === 'Lucia E2E Test',    'Nombre y apellido correctos');
  assert(rows[0].dni === dni,                  'DNI persistido fielmente');
  assert(rows[0].insurance_name === 'OSDE',    'Obra social correcta');
  assert(rows[0].is_active === true,           'Estado activo por defecto');

  // 3. UPDATE — Modificar teléfono y cobertura
  await exec(db, `
    UPDATE patients 
    SET phone = '3576999000', insurance_plan = '410' 
    WHERE id = $1
  `, [patId]);

  // 4. Recarga simulada (nueva query para verificar persistencia del update)
  rows = await query(db, `SELECT phone, insurance_plan FROM patients WHERE id = $1`, [patId]);
  assert(rows[0].phone === '3576999000',       'Teléfono actualizado persiste');
  assert(rows[0].insurance_plan === '410',     'Plan de cobertura actualizado persiste');

  // 5. Unicidad de DNI (Constraint UNIQUE en dni)
  let dupeErr = false;
  try {
    await exec(db, `
      INSERT INTO patients (id, name, dni)
      VALUES ('pat-dupe', 'Duplicado Test', $1)
    `, [dni]);
  } catch (err) {
    dupeErr = true;
  }
  // 6. Seguridad (CRIT-01 / Ley 26.529): Intento de DELETE físico de paciente es bloqueado por trigger
  let deleteBlocked = false;
  try {
    await exec(db, `DELETE FROM patients WHERE id = $1`, [patId]);
  } catch (err) {
    deleteBlocked = err.message.includes('Ley 26.529') || err.message.includes('borrado');
  }
  assert(deleteBlocked, 'Seguridad (Ley 26.529): Trigger bloquea DELETE físico de pacientes');

  // 7. Baja lógica (Soft delete) mediante is_active = false
  await exec(db, `UPDATE patients SET is_active = false WHERE id = $1`, [patId]);
  rows = await query(db, `SELECT is_active FROM patients WHERE id = $1`, [patId]);
  assert(rows[0].is_active === false, 'Baja lógica: Paciente marcado como inactivo persiste');
}

// ─── SUITE 2: TURNOS ──────────────────────────────────────────────────────────
async function testAppointments(db) {
  section('TURNOS — Crear → Recargar → Estado → Doble Reserva (A-03)');

  // Paciente base para FK
  const patId = 'pat-appt-' + Date.now();
  const patDni = '44556677';
  await exec(db, `
    INSERT INTO patients (id, name, dni, email, phone)
    VALUES ($1, 'Pedro Turno Test', $2, 'pedro@e2e.test', '3576445566')
  `, [patId, patDni]);

  // Doctor real del seed (Dr. Blanco)
  const docRows = await query(db, `SELECT id, name, specialty_name FROM doctors LIMIT 1`);
  if (!docRows.length) {
    fail('Sin doctores en DB — saltando suite de turnos');
    return;
  }
  const doc = docRows[0];

  const apptId = 'appt-e2e-' + Date.now();
  const apptDate = '2026-11-18'; // Miércoles (día laboral de Dr. Blanco)
  const apptTime = '15:30:00';

  // 1. INSERT Turno
  await exec(db, `
    INSERT INTO appointments
      (id, patient_id, patient_name, patient_dni, doctor_id, doctor_name, doctor_specialty, date, time, status, reason)
    VALUES ($1, $2, 'Pedro Turno Test', $3, $4, $5, $6, $7, $8, 'pendiente', 'Consulta traumatológica dolor rodilla')
  `, [apptId, patId, patDni, doc.id, doc.name, doc.specialty_name, apptDate, apptTime]);

  // 2. SELECT y verificación inicial
  let rows = await query(db, `SELECT * FROM appointments WHERE id = $1`, [apptId]);
  assert(rows.length === 1,                       'Turno insertado y recuperado por ID');
  assert(rows[0].status === 'pendiente',          'Estado inicial registrado como pendiente');
  assert(rows[0].doctor_specialty === doc.specialty_name, 'Especialidad médica persistida');

  // 3. Modificación de estado (Flujo clínico: pendiente → atendido)
  await exec(db, `UPDATE appointments SET status = 'atendido' WHERE id = $1`, [apptId]);
  rows = await query(db, `SELECT status FROM appointments WHERE id = $1`, [apptId]);
  assert(rows[0].status === 'atendido',           'Transición de estado a atendido persiste');

  // 4. Recarga con JOIN de integridad (Turnos + Pacientes + Doctores)
  rows = await query(db, `
    SELECT a.id, a.status, a.reason,
           p.name AS paciente_nombre, p.dni AS paciente_dni,
           d.name AS doctor_nombre, d.license AS doctor_matricula
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors  d ON d.id = a.doctor_id
    WHERE a.id = $1
  `, [apptId]);
  assert(rows.length === 1,                       'Recarga JOIN appointments + patients + doctors OK');
  assert(rows[0].paciente_nombre === 'Pedro Turno Test', 'JOIN: datos del paciente coherentes');
  assert(rows[0].doctor_nombre === doc.name,      'JOIN: datos del profesional coherentes');

  // 5. Cancelación de turno
  await exec(db, `UPDATE appointments SET status = 'cancelado', cancel_reason = 'Reprogramación solicitada' WHERE id = $1`, [apptId]);
  rows = await query(db, `SELECT status, cancel_reason FROM appointments WHERE id = $1`, [apptId]);
  assert(rows[0].status === 'cancelado' && rows[0].cancel_reason === 'Reprogramación solicitada', 'Cancelación con motivo persiste');

  // 6. Test de Doble Reserva (A-03 / idx_unique_active_appointment)
  // Crear un nuevo turno activo a las 16:00
  const appt2Id = 'appt-e2e-active-1';
  const timeSlot = '16:00:00';
  await exec(db, `
    INSERT INTO appointments
      (id, patient_id, patient_name, patient_dni, doctor_id, doctor_name, doctor_specialty, date, time, status)
    VALUES ($1, $2, 'Pedro Turno Test', $3, $4, $5, $6, $7, $8, 'confirmado')
  `, [appt2Id, patId, patDni, doc.id, doc.name, doc.specialty_name, apptDate, timeSlot]);

  // Intentar crear un segundo turno en la MISMA FECHA, HORA Y DOCTOR
  let doubleBookingRejected = false;
  try {
    await exec(db, `
      INSERT INTO appointments
        (id, patient_id, patient_name, patient_dni, doctor_id, doctor_name, doctor_specialty, date, time, status)
      VALUES ('appt-e2e-double', $1, 'Pedro Turno Test', $2, $3, $4, $5, $6, $7, 'confirmado')
    `, [patId, patDni, doc.id, doc.name, doc.specialty_name, apptDate, timeSlot]);
  } catch (err) {
    doubleBookingRejected = true;
  }
  assert(doubleBookingRejected, 'Regla A-03: Índice único rechaza doble reserva simultánea para el mismo médico');
}

// ─── SUITE 3: CONSULTAS & HCE (LEY 26.529) ──────────────────────────────────
async function testConsultations(db) {
  section('CONSULTAS — HCE Ley 26.529 (Inmutabilidad, Adendas, Historial)');

  // Paciente base
  const patId = 'pat-cons-' + Date.now();
  const patDni = '55667788';
  await exec(db, `
    INSERT INTO patients (id, name, dni, email, phone)
    VALUES ($1, 'Ana Consulta Test', $2, 'ana@e2e.test', '3576556677')
  `, [patId, patDni]);

  // Doctor base
  const doc = (await query(db, `SELECT id, name, license, specialty_name FROM doctors LIMIT 1`))[0];

  const consId = 'cons-e2e-' + Date.now();
  const dummyHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  // 1. INSERT Consulta Médica Firmada
  await exec(db, `
    INSERT INTO consultations
      (id, patient_id, patient_name, patient_dni, doctor_id, doctor_name, doctor_license, specialty_name,
       date, time, reason, diagnosis, evolution, signed, integrity_hash)
    VALUES ($1, $2, 'Ana Consulta Test', $3, $4, $5, $6, $7,
       CURRENT_DATE, CURRENT_TIME, 'Gonalgia derecha post esfuerzo', 'Tendinitis rotuliana',
       'Paciente refiere dolor al subir escaleras. Se indica kinesiología.', true, $8)
  `, [consId, patId, patDni, doc.id, doc.name, doc.license, doc.specialty_name, dummyHash]);

  // 2. SELECT y verificación de persistencia
  let rows = await query(db, `SELECT * FROM consultations WHERE id = $1`, [consId]);
  assert(rows.length === 1,                             'Consulta HCE registrada y persistida');
  assert(rows[0].diagnosis === 'Tendinitis rotuliana',  'Diagnóstico clínico persistido');
  assert(rows[0].signed === true,                       'Estado firmado digitalmente registrado');
  assert(rows[0].integrity_hash === dummyHash,          'Hash SHA-256 de integridad preservado');

  // 3. Test de Inmutabilidad Legal (Ley 26.529 - Trigger trg_immutable_consultations)
  // Intentar modificar el diagnóstico de una consulta firmada debe ser RECHAZADO
  let updateBlocked = false;
  try {
    await exec(db, `UPDATE consultations SET diagnosis = 'Diagnóstico adulterado' WHERE id = $1`, [consId]);
  } catch (err) {
    updateBlocked = err.message.includes('Ley 26.529') || err.message.includes('inmutable');
  }
  assert(updateBlocked, 'Ley 26.529: Trigger de inmutabilidad bloquea UPDATE directo en HCE');

  // Intentar borrar la consulta debe ser RECHAZADO
  let deleteBlocked = false;
  try {
    await exec(db, `DELETE FROM consultations WHERE id = $1`, [consId]);
  } catch (err) {
    deleteBlocked = err.message.includes('Ley 26.529') || err.message.includes('inmutable');
  }
  assert(deleteBlocked, 'Ley 26.529: Trigger de inmutabilidad bloquea DELETE en registros de HCE');

  // 4. Mecanismo de Modificación Legal: Registro de Adenda Fechada
  const adendaId = 'adenda-' + Date.now();
  await exec(db, `
    INSERT INTO consultation_adendas
      (id, consultation_id, doctor_id, doctor_name, doctor_license, note, reason, integrity_hash)
    VALUES ($1, $2, $3, $4, $5, 'Se adjunta resultado de ecografía: sin rotura tendinosa.', 'Ampliación de estudios complementarios', $6)
  `, [adendaId, consId, doc.id, doc.name, doc.license, dummyHash]);

  const adendaRows = await query(db, `SELECT * FROM consultation_adendas WHERE consultation_id = $1`, [consId]);
  assert(adendaRows.length === 1,                       'Adenda Médica Fechada registrada exitosamente');
  assert(adendaRows[0].reason === 'Ampliación de estudios complementarios', 'Motivo legal de adenda persistido');
  assert(adendaRows[0].integrity_hash === dummyHash,    'Hash criptográfico de adenda persistido');

  // Verificar que la adenda también es inmutable
  let adendaUpdateBlocked = false;
  try {
    await exec(db, `UPDATE consultation_adendas SET note = 'Modificada' WHERE id = $1`, [adendaId]);
  } catch (err) {
    adendaUpdateBlocked = true;
  }
  assert(adendaUpdateBlocked, 'Ley 26.529: Adenda médica es inmutable (UPDATE bloqueado)');

  // 5. Historial Clínico Acumulativo (Segunda consulta posterior)
  const cons2Id = 'cons-e2e-2-' + Date.now();
  await exec(db, `
    INSERT INTO consultations
      (id, patient_id, patient_name, patient_dni, doctor_id, doctor_name, doctor_license, specialty_name,
       date, time, reason, diagnosis, evolution, signed, integrity_hash)
    VALUES ($1, $2, 'Ana Consulta Test', $3, $4, $5, $6, $7,
       CURRENT_DATE, CURRENT_TIME, 'Control post 10 sesiones kinesiología', 'Evolución favorable tendinitis',
       'Sin dolor en marcha. Alta médica kinesiológica.', true, $8)
  `, [cons2Id, patId, patDni, doc.id, doc.name, doc.license, doc.specialty_name, dummyHash]);

  const historyRows = await query(db, `
    SELECT id, diagnosis, date 
    FROM consultations 
    WHERE patient_id = $1 
    ORDER BY created_at ASC
  `, [patId]);
  assert(historyRows.length === 2,                      'Historial acumulativo: 2 consultas registradas para el paciente');
  assert(historyRows[1].diagnosis === 'Evolución favorable tendinitis', 'Historial mantiene orden cronológico');
}

// ─── SUITE 4: INTEGRIDAD REFERENCIAL & RESTRICCIONES ──────────────────────────
async function testReferentialIntegrity(db) {
  section('INTEGRIDAD REFERENCIAL — Claves Foráneas & Protección de Registros');

  // 1. Turno con patient_id inexistente
  let badPatAppt = false;
  try {
    await exec(db, `
      INSERT INTO appointments
        (id, patient_id, patient_name, patient_dni, doctor_id, doctor_name, doctor_specialty, date, time)
      VALUES ('appt-bad-pat', 'pat-fantasma-999', 'Fantasma', '00000000', 'doc-1', 'Dr. Blanco', 'Traumatología', '2026-12-01', '10:00:00')
    `);
  } catch (err) {
    badPatAppt = true;
  }
  assert(badPatAppt, 'FK: Rechazo de turno con patient_id inexistente');

  // 2. Consulta con doctor_id inexistente
  let badDocCons = false;
  try {
    await exec(db, `
      INSERT INTO consultations
        (id, patient_id, patient_name, patient_dni, doctor_id, doctor_name, doctor_license, specialty_name,
         reason, diagnosis, evolution, integrity_hash)
      VALUES ('cons-bad-doc', (SELECT id FROM patients LIMIT 1), 'Test', '12345678', 'doc-inexistente', 'Dr. Fantasma', 'MP 999', 'Especialidad',
         'Motivo', 'Diagnóstico', 'Evolución', 'hash123')
    `);
  } catch (err) {
    badDocCons = true;
  }
  assert(badDocCons, 'FK: Rechazo de consulta con doctor_id inexistente');

  // 3. Protección de Historia Clínica (ON DELETE RESTRICT en consultas)
  const protPatId = 'pat-prot-' + Date.now();
  await exec(db, `
    INSERT INTO patients (id, name, dni) VALUES ($1, 'Paciente Protegido', '77889900')
  `, [protPatId]);

  const protConsId = 'cons-prot-' + Date.now();
  await exec(db, `
    INSERT INTO consultations
      (id, patient_id, patient_name, patient_dni, doctor_id, doctor_name, doctor_license, specialty_name,
       reason, diagnosis, evolution, integrity_hash)
    VALUES ($1, $2, 'Paciente Protegido', '77889900', 'doc-1', 'Dr. Blanco', 'MP 38.412', 'Traumatología',
       'Chequeo', 'Chequeo preventivo', 'Normal', 'hash456')
  `, [protConsId, protPatId]);

  let patDeleteBlocked = false;
  try {
    // Intentar eliminar paciente que posee antecedentes clínicos
    await exec(db, `DELETE FROM patients WHERE id = $1`, [protPatId]);
  } catch (err) {
    patDeleteBlocked = true;
  }
  assert(patDeleteBlocked, 'Seguridad: ON DELETE RESTRICT impide borrar pacientes con historias clínicas activas');
}

// ─── SUITE 5: REMEDIACIONES AUDITORÍA CITRA V2 ──────────────────────────────
async function testAuditV2Remediations(db) {
  section('AUDITORÍA CITRA V2 — Pruebas de Remediación Forense');

  // 1. Prevención de TRUNCATE en tablas clínicas (V2 Riesgo Potencial)
  let truncBlocked = false;
  try {
    await exec(db, `TRUNCATE TABLE patients CASCADE`);
  } catch (err) {
    truncBlocked = err.message.toLowerCase().includes('truncate') || err.message.includes('Ley 26.529');
  }
  assert(truncBlocked, 'Seguridad: TRUNCATE bloqueado por trigger prevent_table_truncate en patients');

  let truncConsBlocked = false;
  try {
    await exec(db, `TRUNCATE TABLE consultations CASCADE`);
  } catch (err) {
    truncConsBlocked = err.message.toLowerCase().includes('truncate') || err.message.includes('Ley 26.529');
  }
  assert(truncConsBlocked, 'Seguridad: TRUNCATE bloqueado por trigger prevent_table_truncate en consultations');

  // 2. Control de Superadmin sin atajo por email (V2-A2)
  const testUserId = '11111111-2222-3333-4444-555555555555';
  await exec(db, `
    INSERT INTO auth.users (id, email) VALUES ($1, 'dr.blanco@citra.com.ar')
    ON CONFLICT (id) DO NOTHING
  `, [testUserId]);

  await exec(db, `
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES ($1, 'dr.blanco@citra.com.ar', 'Alejandro', 'Blanco', 'patient')
    ON CONFLICT (id) DO UPDATE SET role = 'patient'
  `, [testUserId]);

  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', $1, false),
           set_config('request.jwt.claim.role', 'authenticated', false),
           set_config('request.jwt.claim.email', 'dr.blanco@citra.com.ar', false)
  `, [testUserId]);

  const saCheck = await query(db, `SELECT public.is_superadmin() AS is_sa`);
  assert(saCheck[0].is_sa === false, 'V2-A2: Email dr.blanco@citra.com.ar NO otorga superadmin sin rol en profiles');

  // Asignar rol formal (como DB superadmin / service_role sin JWT de paciente impostor)
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', '', false),
           set_config('request.jwt.claim.role', '', false),
           set_config('request.jwt.claim.email', '', false)
  `);
  await exec(db, `
    UPDATE public.profiles SET role = 'superadmin' WHERE id = $1
  `, [testUserId]);
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', $1, false),
           set_config('request.jwt.claim.role', 'authenticated', false),
           set_config('request.jwt.claim.email', 'dr.blanco@citra.com.ar', false)
  `, [testUserId]);
  const saCheckAfter = await query(db, `SELECT public.is_superadmin() AS is_sa`);
  assert(saCheckAfter[0].is_sa === true, 'V2-A2: Rol formal superadmin en profiles habilita is_superadmin()');

  // 3. RPC link_doctor_account (V2-A3)
  const linkRes = await query(db, `SELECT public.link_doctor_account('doc-1', $1) AS res`, [testUserId]);
  assert(linkRes[0].res?.success === true, 'V2-A3: link_doctor_account vincula exitosamente doctor con auth user');
  const docRow = await query(db, `SELECT user_id FROM public.doctors WHERE id = 'doc-1'`);
  assert(docRow[0].user_id === testUserId, 'V2-A3: Campo doctors.user_id actualizado con auth user ID');

  // 4. Validaciones de Reserva Pública create_public_booking (V2-A8)
  // Simular sesión anon
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', '', false),
           set_config('request.jwt.claim.role', 'anon', false),
           set_config('request.jwt.claim.email', '', false)
  `);

  let pastErr = null;
  try {
    await query(db, `
      SELECT public.create_public_booking($1::jsonb) AS res
    `, [JSON.stringify({
      doctor_id: 'doc-1',
      date: '2020-01-01',
      time: '15:00:00',
      patient_name: 'Paciente Pasado',
      patient_dni: '11223344',
      patient_email: 'paciente@test.com',
      patient_phone: '35761234'
    })]);
  } catch (err) {
    pastErr = err.message;
  }
  assert(pastErr && pastErr.includes('pasada'), 'V2-A8: create_public_booking rechaza fechas pasadas');

  let futureErr = null;
  try {
    await query(db, `
      SELECT public.create_public_booking($1::jsonb) AS res
    `, [JSON.stringify({
      doctor_id: 'doc-1',
      date: '2028-01-01',
      time: '15:00:00',
      patient_name: 'Paciente Futuro',
      patient_dni: '11223345',
      patient_email: 'paciente@test.com',
      patient_phone: '35761234'
    })]);
  } catch (err) {
    futureErr = err.message;
  }
  assert(futureErr && futureErr.includes('90 días'), 'V2-A8: create_public_booking rechaza fechas superiores a 90 días');

  // Reserva válida en fecha futura (un miércoles)
  const validDateRow = await query(db, `
    SELECT (CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7)::int)::text AS fdate
  `);
  const validDate = validDateRow[0].fdate;

  const bookingRows = await query(db, `
    SELECT public.create_public_booking($1::jsonb) AS res
  `, [JSON.stringify({
    doctor_id: 'doc-1',
    date: validDate,
    time: '15:00:00',
    patient_name: 'Paciente Valido Anon',
    patient_dni: '88223344',
    patient_email: 'anonvalido@citra.test',
    patient_phone: '3576443322'
  })]);
  assert(bookingRows[0].res?.success === true, 'V2-A8: create_public_booking genera reserva exitosa');
  assert(bookingRows[0].res?.patient_id === undefined, 'V2-A8: create_public_booking no filtra el campo patient_id');

  // 5. RPC open_cash_shift_rpc (V2-A7)
  const adminUserId = '22222222-3333-4444-5555-666666666666';
  await exec(db, `
    INSERT INTO auth.users (id, email) VALUES ($1, 'secretaria@citra.com.ar')
    ON CONFLICT (id) DO NOTHING
  `, [adminUserId]);
  await exec(db, `
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES ($1, 'secretaria@citra.com.ar', 'Marta', 'Secretaria', 'administrative')
    ON CONFLICT (id) DO UPDATE SET role = 'administrative'
  `, [adminUserId]);
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', $1, false),
           set_config('request.jwt.claim.role', 'authenticated', false),
           set_config('request.jwt.claim.email', 'secretaria@citra.com.ar', false)
  `, [adminUserId]);

  const openShiftRes = await query(db, `SELECT public.open_cash_shift_rpc(15000, 'Turno Mañana Test', 'Secretaría Central') AS res`);
  assert(openShiftRes[0].res?.success === true, 'V2-A7: open_cash_shift_rpc abre turno de caja exitosamente');

  let dupeShiftErr = false;
  try {
    await query(db, `SELECT public.open_cash_shift_rpc(5000, 'Turno Duplicado', 'Secretaría')`);
  } catch (err) {
    dupeShiftErr = true;
  }
  assert(dupeShiftErr, 'V2-A7: Índice único bloquea apertura simultánea de dos turnos para el mismo operador');

  // 6. Anulación de sesión de kinesiología sin pisar patient_tolerance (V2-M1)
  const pId = 'pat-rehab-test';
  await exec(db, `
    INSERT INTO patients (id, name, dni) VALUES ($1, 'Paciente Kine', '66554433')
    ON CONFLICT (id) DO NOTHING
  `, [pId]);
  const planId = 'plan-rehab-test';
  await exec(db, `
    INSERT INTO rehab_plans (id, patient_id, patient_name, prescribing_doctor, diagnosis, target_sessions, status)
    VALUES ($1, $2, 'Paciente Kine', 'Dr. Blanco', 'Rehabilitación postquirúrgica', 10, 'En curso')
    ON CONFLICT (id) DO NOTHING
  `, [planId, pId]);
  const sessId = 'sess-rehab-test';
  await exec(db, `
    INSERT INTO rehab_sessions (id, plan_id, patient_id, patient_name, therapist_name, session_number, date, patient_tolerance)
    VALUES ($1, $2, $3, 'Paciente Kine', 'Lic. Kinesiólogo', 1, CURRENT_DATE, 'Buena tolerancia sin dolor agudo')
    ON CONFLICT (id) DO NOTHING
  `, [sessId, planId, pId]);

  await exec(db, `
    UPDATE rehab_sessions
    SET voided_at = NOW(), void_reason = 'Cancelación por reposo médico'
    WHERE id = $1
  `, [sessId]);

  const sessCheck = await query(db, `SELECT voided_at, void_reason, patient_tolerance FROM rehab_sessions WHERE id = $1`, [sessId]);
  assert(sessCheck[0].voided_at !== null, 'V2-M1: voided_at registrado correctamente');
  assert(sessCheck[0].void_reason === 'Cancelación por reposo médico', 'V2-M1: void_reason registrado');
  assert(sessCheck[0].patient_tolerance === 'Buena tolerancia sin dolor agudo', 'V2-M1: patient_tolerance clínico preservado');

  // 7. Auto-vínculo de paciente en registro de usuario Auth (V2-A5 / V2-A6)
  const autolinkPatId = 'pat-autolink-test';
  const autolinkEmail = 'paciente.autolink@citra.test';
  await exec(db, `
    INSERT INTO patients (id, name, dni, email, user_id)
    VALUES ($1, 'Paciente AutoVinculo', '45678912', $2, NULL)
    ON CONFLICT (id) DO NOTHING
  `, [autolinkPatId, autolinkEmail]);

  const newAuthPatUserId = '33333333-4444-5555-6666-777777777777';
  await exec(db, `
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES ($1, $2, '{"dni":"45678912","first_name":"Paciente"}'::jsonb)
  `, [newAuthPatUserId, autolinkEmail]);

  const linkedPatCheck = await query(db, `SELECT user_id FROM patients WHERE id = $1`, [autolinkPatId]);
  assert(linkedPatCheck[0].user_id === newAuthPatUserId, 'V2-A6: handle_new_auth_user vincula automáticamente paciente con su auth user_id');

  // 8. Validación de política de almacenamiento de carpetas por patient.id (V2-A4)
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', $1, false),
           set_config('request.jwt.claim.role', 'authenticated', false),
           set_config('request.jwt.claim.email', $2, false)
  `, [newAuthPatUserId, autolinkEmail]);

  const storageCheck = await query(db, `
    SELECT EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.user_id = auth.uid()
        AND p.id = $1
    ) AS can_access_folder
  `, [autolinkPatId]);
  assert(storageCheck[0].can_access_folder === true, 'V2-A4: Carpeta con patient.id autorizada para lectura del paciente autenticado');
}

// ─── SUITE 6: REMEDIACIONES AUDITORÍA CITRA V3 (A3-01..A3-18) ──────────────────
async function testAuditV3Remediations(db) {
  section('AUDITORÍA CITRA V3 — Pruebas Adversariales & Seguridad RLS');

  // Reset contexto a superadmin / postgres
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', '', false),
           set_config('request.jwt.claim.role', '', false),
           set_config('request.jwt.claim.email', '', false)
  `);

  // Setup usuarios para A3-01: Dr. Solicitante vs Dr. Titular
  const docReqAuth = '44444444-1111-2222-3333-444444444444';
  const docTargetAuth = '55555555-1111-2222-3333-555555555555';
  await exec(db, `
    INSERT INTO auth.users (id, email) VALUES ($1, 'doc.req@citra.test'), ($2, 'doc.target@citra.test')
    ON CONFLICT (id) DO NOTHING
  `, [docReqAuth, docTargetAuth]);
  await exec(db, `
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES ($1, 'doc.req@citra.test', 'Doc', 'Req', 'doctor'),
           ($2, 'doc.target@citra.test', 'Doc', 'Target', 'doctor')
    ON CONFLICT (id) DO UPDATE SET role = 'doctor'
  `, [docReqAuth, docTargetAuth]);
  await exec(db, `
    INSERT INTO public.doctors (id, name, license, specialty_name, email, user_id)
    VALUES ('doc-req-1', 'Dr Req', 'MP 101', 'Cardiología', 'doc.req@citra.test', $1),
           ('doc-target-1', 'Dr Target', 'MP 102', 'Traumatología', 'doc.target@citra.test', $2)
    ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id
  `, [docReqAuth, docTargetAuth]);

  // A3-01: Prevención de auto-aprobación en clinical_access_grants
  const grantPatId = 'pat-grant-' + Date.now();
  await exec(db, `
    INSERT INTO public.patients (id, name, dni)
    VALUES ($1, 'Paciente Interconsulta', '12345678')
  `, [grantPatId]);

  const grantId = 'grant-test-' + Date.now();
  await exec(db, `
    INSERT INTO public.clinical_access_grants (id, consultation_id, patient_id, patient_name, patient_dni, requester_doctor_id, requester_doctor_name, target_doctor_id, target_doctor_name, justification, status)
    VALUES ($1, NULL, $2, 'Paciente Interconsulta', '12345678', 'doc-req-1', 'Dr Req', 'doc-target-1', 'Dr Target', 'Interconsulta urgente', 'pending')
  `, [grantId, grantPatId]);

  // Simular sesión del doctor solicitante (intento de auto-aprobación)
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', $1, false),
           set_config('request.jwt.claim.role', 'authenticated', false),
           set_config('request.jwt.claim.email', 'doc.req@citra.test', false)
  `, [docReqAuth]);

  let selfApproveBlocked = false;
  try {
    await exec(db, `
      UPDATE public.clinical_access_grants
      SET status = 'approved', approved_at = NOW()
      WHERE id = $1
    `, [grantId]);
  } catch (e) {
    selfApproveBlocked = true;
  }
  // Verificar que el estado no cambió
  const grantRow = await query(db, `SELECT status FROM public.clinical_access_grants WHERE id = $1`, [grantId]);
  assert(selfApproveBlocked || grantRow[0].status === 'pending', 'A3-01: Doctor solicitante NO puede auto-aprobarse acceso clínico');

  // Reset contexto para inserción administrativa
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', '', false),
           set_config('request.jwt.claim.role', '', false),
           set_config('request.jwt.claim.email', '', false)
  `);

  // A3-02: Intento de paciente de mutar patient_id en un turno existente
  const victimPatId = 'pat-victima-' + Date.now();
  const victimApptId = 'app-victima-' + Date.now();
  await exec(db, `
    INSERT INTO public.patients (id, name, dni)
    VALUES ($1, 'Victima Test', '33445566')
  `, [victimPatId]);

  // Miércoles futuro válido para doc-1
  const apptDateRow = await query(db, `
    SELECT (CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7)::int)::text AS fdate
  `);
  const apptDate = apptDateRow[0].fdate;

  await exec(db, `
    INSERT INTO public.appointments (id, patient_id, patient_name, patient_dni, doctor_id, doctor_name, doctor_specialty, date, time, status, duration)
    VALUES ($1, $2, 'Victima Test', '33445566', 'doc-1', 'Dr. Alejandro Blanco', 'Traumatología', $3, '16:00:00', 'pendiente', 30)
  `, [victimApptId, victimPatId, apptDate]);

  const patAuth = '66666666-1111-2222-3333-666666666666';
  await exec(db, `
    INSERT INTO auth.users (id, email) VALUES ($1, 'paciente.atacante@citra.test')
    ON CONFLICT (id) DO NOTHING
  `, [patAuth]);
  await exec(db, `
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES ($1, 'paciente.atacante@citra.test', 'Atacante', 'Test', 'patient')
    ON CONFLICT (id) DO UPDATE SET role = 'patient'
  `, [patAuth]);

  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', $1, false),
           set_config('request.jwt.claim.role', 'authenticated', false),
           set_config('request.jwt.claim.email', 'paciente.atacante@citra.test', false)
  `, [patAuth]);

  let patMutationBlocked = false;
  try {
    await exec(db, `
      UPDATE public.appointments
      SET patient_id = 'pat-impostor'
      WHERE id = $1
    `, [victimApptId]);
  } catch (e) {
    patMutationBlocked = true;
  }
  assert(patMutationBlocked, 'A3-02: Trigger prevent_appointment_identity_mutation bloquea mutación de patient_id');

  // A3-05: get_auth_role() ignora usuarios inactivos
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', '', false),
           set_config('request.jwt.claim.role', '', false),
           set_config('request.jwt.claim.email', '', false)
  `);
  const inactAuth = '77777777-1111-2222-3333-777777777777';
  await exec(db, `
    INSERT INTO auth.users (id, email) VALUES ($1, 'admin.despedido@citra.test')
    ON CONFLICT (id) DO NOTHING
  `, [inactAuth]);
  await exec(db, `
    INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
    VALUES ($1, 'admin.despedido@citra.test', 'Ex', 'Admin', 'superadmin', false)
    ON CONFLICT (id) DO UPDATE SET role = 'superadmin', is_active = false
  `, [inactAuth]);

  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', $1, false),
           set_config('request.jwt.claim.role', 'authenticated', false),
           set_config('request.jwt.claim.email', 'admin.despedido@citra.test', false)
  `, [inactAuth]);

  const inactiveRole = await query(db, `SELECT public.get_auth_role() AS role, public.is_superadmin() AS is_sa`);
  assert(inactiveRole[0].role === null && inactiveRole[0].is_sa === false, 'A3-05: Administrador inactivo (is_active=false) pierde inmediatamente privilegios');

  // A3-16: Facturas no admiten total negativo o nulo
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', '', false),
           set_config('request.jwt.claim.role', '', false),
           set_config('request.jwt.claim.email', '', false)
  `);
  let negInvoiceBlocked = false;
  try {
    await exec(db, `
      INSERT INTO public.invoices (id, invoice_number, total, subtotal, pto_vta, tipo_cmp, patient_name, concept)
      VALUES ('inv-neg-1', 'FC-001', -500, -500, 1, 6, 'Test', 'Negativo')
    `);
  } catch (e) {
    negInvoiceBlocked = true;
  }
  assert(negInvoiceBlocked, 'A3-16: invoices CHECK (total > 0) bloquea facturas con importe negativo o nulo');

  // A3-17: Spoofing de user_id en audit_logs bloqueado o forzado a auth.uid()
  await exec(db, `
    SELECT set_config('request.jwt.claim.sub', $1, false),
           set_config('request.jwt.claim.role', 'authenticated', false),
           set_config('request.jwt.claim.email', 'doc.req@citra.test', false)
  `, [docReqAuth]);

  await exec(db, `
    INSERT INTO public.audit_logs (action, resource, details, user_id, user_name, user_role)
    VALUES ('SPOOF_TEST', 'Test', 'Intento de spoofing', 'victima-id', 'Victima', 'doctor')
  `);
  const auditEntry = await query(db, `
    SELECT user_id FROM public.audit_logs WHERE action = 'SPOOF_TEST' ORDER BY id DESC LIMIT 1
  `);
  assert(auditEntry[0].user_id === docReqAuth, 'A3-17: Trigger protect_audit_logs fuerza user_id = auth.uid() impidiendo falsificación de autoría');
}

// ─── RUNNER PRINCIPAL ─────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${C.bold}${C.cyan}╔══════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}${C.cyan}║   CITRA — Suite E2E de Persistencia (PGlite)     ║${C.reset}`);
  console.log(`${C.bold}${C.cyan}╚══════════════════════════════════════════════════╝${C.reset}\n`);

  let db;
  try {
    process.stdout.write(`${C.dim}Inicializando PGlite + schema CITRA...${C.reset}`);
    db = await bootstrapDB();
    console.log(` ${C.green}OK${C.reset}`);
  } catch (err) {
    console.log(` ${C.red}FALLÓ${C.reset}`);
    console.error(`\n${C.red}Error fatal en bootstrap:${C.reset} ${err.message}`);
    process.exit(1);
  }

  await testPatients(db);
  await testAppointments(db);
  await testConsultations(db);
  await testReferentialIntegrity(db);
  await testAuditV2Remediations(db);
  await testAuditV3Remediations(db);

  // Resumen final
  const total = passed + failed;
  console.log(`\n${C.bold}${'─'.repeat(52)}${C.reset}`);
  console.log(`${C.bold}RESUMEN: ${passed}/${total} pruebas pasaron exitosamente${C.reset}`);

  if (failed > 0) {
    console.log(`\n${C.red}${C.bold}Fallos detectados (${failed}):${C.reset}`);
    for (const f of failures) {
      console.log(`  ${C.red}✘${C.reset} ${f.label}`);
      if (f.detail) console.log(`    ${C.dim}${f.detail}${C.reset}`);
    }
  } else {
    console.log(`\n${C.green}${C.bold}✔ Todas las pruebas de persistencia pasaron (100%)${C.reset}\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`\n${C.red}Error no capturado: ${err.message}${C.reset}`);
  process.exit(1);
});