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
  assert(dupeErr, 'Restricción UNIQUE en DNI rechaza duplicados');

  // 6. DELETE de paciente de prueba
  await exec(db, `DELETE FROM patients WHERE id = $1`, [patId]);
  rows = await query(db, `SELECT count(*) AS n FROM patients WHERE id = $1`, [patId]);
  assert(parseInt(rows[0].n) === 0,            'Paciente eliminado correctamente');
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