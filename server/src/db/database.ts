/**
 * database.ts — Drizzle ORM query helpers replacing the old JSON-file Database class.
 *
 * All exported functions are async and return typed data matching
 * the existing route contracts so routes need minimal changes.
 */
import { eq, and } from 'drizzle-orm';
import { db } from './client';
import * as t from './schema';
import type {
  Course,
  Student,
  Offering,
  PracticeVersion,
  ExerciseGradeRecord,
  PdfGradeRecord,
  SoftSkillGradeRecord,
  AttendanceRecord,
  GradeSnapshot,
  AuditEvent,
} from '../../../src/types/assessment';

// ─────────────────────────────────────────────────────────────────
// COURSES (MATA KULIAH)
// ─────────────────────────────────────────────────────────────────
export async function getCourses(): Promise<Course[]> {
  return db.select().from(t.courses) as Promise<Course[]>;
}

export async function getCourseById(id: string): Promise<Course | null> {
  const rows = await db.select().from(t.courses).where(eq(t.courses.id, id));
  return (rows[0] as Course) || null;
}

export async function upsertCourse(course: Course): Promise<Course> {
  const rows = await db
    .insert(t.courses)
    .values(course as any)
    .onConflictDoUpdate({
      target: t.courses.id,
      set: {
        code: course.code,
        name: course.name,
        sks: course.sks,
        description: course.description,
        defaultFormatId: course.defaultFormatId,
      },
    })
    .returning();
  return rows[0] as Course;
}

export async function deleteCourse(id: string): Promise<Course | null> {
  const rows = await db.delete(t.courses).where(eq(t.courses.id, id)).returning();
  return (rows[0] as Course) || null;
}

// ─────────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────────
export async function getStudents(): Promise<Student[]> {
  return db.select().from(t.students) as Promise<Student[]>;
}

export async function getStudentById(id: string): Promise<Student | null> {
  const rows = await db.select().from(t.students).where(eq(t.students.id, id));
  return (rows[0] as Student) || null;
}

export async function createStudent(student: Student): Promise<Student> {
  const rows = await db.insert(t.students).values(student).returning();
  return rows[0] as Student;
}

export async function upsertStudent(student: Student): Promise<Student> {
  const rows = await db
    .insert(t.students)
    .values(student)
    .onConflictDoUpdate({ target: t.students.id, set: { nim: student.nim, name: student.name, class: student.class } })
    .returning();
  return rows[0] as Student;
}

export async function deleteStudent(id: string): Promise<Student | null> {
  const rows = await db.delete(t.students).where(eq(t.students.id, id)).returning();
  return (rows[0] as Student) || null;
}

// ─────────────────────────────────────────────────────────────────
// OFFERINGS
// ─────────────────────────────────────────────────────────────────
export async function getOfferings(): Promise<Offering[]> {
  return db.select().from(t.offerings) as Promise<Offering[]>;
}

export async function getOfferingById(id: string): Promise<Offering | null> {
  const rows = await db.select().from(t.offerings).where(eq(t.offerings.id, id));
  return (rows[0] as Offering) || null;
}

export async function updateOffering(id: string, data: Partial<Offering>): Promise<Offering | null> {
  const rows = await db.update(t.offerings).set(data as any).where(eq(t.offerings.id, id)).returning();
  return (rows[0] as Offering) || null;
}

// ─────────────────────────────────────────────────────────────────
// PRACTICE VERSIONS
// ─────────────────────────────────────────────────────────────────
export async function getPracticeVersions(): Promise<PracticeVersion[]> {
  return db.select().from(t.practiceVersions) as Promise<PracticeVersion[]>;
}

export async function getPracticeVersionById(id: string): Promise<PracticeVersion | null> {
  const rows = await db.select().from(t.practiceVersions).where(eq(t.practiceVersions.id, id));
  return (rows[0] as PracticeVersion) || null;
}

export async function upsertPracticeVersion(pv: PracticeVersion): Promise<PracticeVersion> {
  const rows = await db
    .insert(t.practiceVersions)
    .values(pv as any)
    .onConflictDoUpdate({ target: t.practiceVersions.id, set: pv as any })
    .returning();
  return rows[0] as PracticeVersion;
}

// ─────────────────────────────────────────────────────────────────
// EXERCISE RECORDS
// ─────────────────────────────────────────────────────────────────
export async function getExerciseRecordsByOffering(offeringId: string): Promise<ExerciseGradeRecord[]> {
  return db.select().from(t.exerciseRecords).where(eq(t.exerciseRecords.offeringId, offeringId)) as Promise<ExerciseGradeRecord[]>;
}

export async function upsertExerciseRecord(record: ExerciseGradeRecord): Promise<ExerciseGradeRecord> {
  const rows = await db
    .insert(t.exerciseRecords)
    .values(record as any)
    .onConflictDoUpdate({ target: t.exerciseRecords.id, set: record as any })
    .returning();
  return rows[0] as ExerciseGradeRecord;
}

// ─────────────────────────────────────────────────────────────────
// PDF RECORDS
// ─────────────────────────────────────────────────────────────────
export async function getPdfRecordsByOffering(offeringId: string): Promise<PdfGradeRecord[]> {
  return db.select().from(t.pdfRecords).where(eq(t.pdfRecords.offeringId, offeringId)) as Promise<PdfGradeRecord[]>;
}

export async function upsertPdfRecord(record: PdfGradeRecord): Promise<PdfGradeRecord> {
  const rows = await db
    .insert(t.pdfRecords)
    .values(record as any)
    .onConflictDoUpdate({ target: t.pdfRecords.id, set: record as any })
    .returning();
  return rows[0] as PdfGradeRecord;
}

// ─────────────────────────────────────────────────────────────────
// SOFT SKILL RECORDS
// ─────────────────────────────────────────────────────────────────
export async function getSoftSkillRecordsByOffering(offeringId: string): Promise<SoftSkillGradeRecord[]> {
  return db.select().from(t.softSkillRecords).where(eq(t.softSkillRecords.offeringId, offeringId)) as Promise<SoftSkillGradeRecord[]>;
}

export async function upsertSoftSkillRecord(record: SoftSkillGradeRecord): Promise<SoftSkillGradeRecord> {
  const rows = await db
    .insert(t.softSkillRecords)
    .values(record as any)
    .onConflictDoUpdate({ target: t.softSkillRecords.id, set: record as any })
    .returning();
  return rows[0] as SoftSkillGradeRecord;
}

// ─────────────────────────────────────────────────────────────────
// ATTENDANCE RECORDS
// ─────────────────────────────────────────────────────────────────
export async function getAttendanceRecordsByOffering(offeringId: string): Promise<AttendanceRecord[]> {
  return db.select().from(t.attendanceRecords).where(eq(t.attendanceRecords.offeringId, offeringId)) as Promise<AttendanceRecord[]>;
}

export async function upsertAttendanceRecord(record: AttendanceRecord): Promise<AttendanceRecord> {
  const rows = await db
    .insert(t.attendanceRecords)
    .values(record as any)
    .onConflictDoUpdate({ target: t.attendanceRecords.id, set: record as any })
    .returning();
  return rows[0] as AttendanceRecord;
}

// ─────────────────────────────────────────────────────────────────
// SNAPSHOTS
// ─────────────────────────────────────────────────────────────────
export async function getSnapshotsByOffering(offeringId: string): Promise<GradeSnapshot[]> {
  return db.select().from(t.snapshots).where(eq(t.snapshots.offeringId, offeringId)) as Promise<GradeSnapshot[]>;
}

export async function insertSnapshots(records: GradeSnapshot[]): Promise<GradeSnapshot[]> {
  if (records.length === 0) return [];
  const rows = await db.insert(t.snapshots).values(records as any[]).returning();
  return rows as GradeSnapshot[];
}

export async function reopenSnapshots(offeringId: string, reason: string, actor: string, now: string): Promise<void> {
  await db
    .update(t.snapshots)
    .set({ status: 'reopened', reopenReason: reason, reopenedAt: now, reopenedBy: actor })
    .where(and(eq(t.snapshots.offeringId, offeringId), eq(t.snapshots.status, 'final')));
}

// ─────────────────────────────────────────────────────────────────
// AUDIT EVENTS
// ─────────────────────────────────────────────────────────────────
export async function getAuditEvents(limit = 100): Promise<AuditEvent[]> {
  return db.select().from(t.auditEvents).limit(limit) as Promise<AuditEvent[]>;
}

export async function insertAuditEvent(event: AuditEvent): Promise<void> {
  await db.insert(t.auditEvents).values(event as any);
}

// ─────────────────────────────────────────────────────────────────
// SYSTEM RESET (re-seed master data)
// ─────────────────────────────────────────────────────────────────
export async function resetDatabase(): Promise<void> {
  const { SEED_COURSES, SEED_STUDENTS, SEED_OFFERINGS, SEED_PRACTICE_VERSIONS } = await import('./seedData');

  // Clear grade data (keep students/offerings/versions)
  await db.delete(t.exerciseRecords);
  await db.delete(t.pdfRecords);
  await db.delete(t.softSkillRecords);
  await db.delete(t.attendanceRecords);
  await db.delete(t.snapshots);

  // Re-seed master data
  for (const c of SEED_COURSES) await upsertCourse(c);
  for (const s of SEED_STUDENTS) await upsertStudent(s);
  for (const o of SEED_OFFERINGS) {
    await db.insert(t.offerings).values(o as any).onConflictDoUpdate({ target: t.offerings.id, set: o as any });
  }
  for (const pv of SEED_PRACTICE_VERSIONS) await upsertPracticeVersion(pv);

  await insertAuditEvent({
    id: `audit-reset-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'System',
    action: 'reset_database',
    targetType: 'system',
    targetId: 'all',
    details: 'Database direset ke data awal (36 mahasiswa, 3 offerings, CAD11-R1).',
  });
}
