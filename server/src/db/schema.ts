import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

// ─── Courses (Mata Kuliah) ───────────────────────────────────────────────────
export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  sks: integer('sks').default(2),
  description: text('description'),
  defaultFormatId: text('default_format_id'),
});

// ─── Students ────────────────────────────────────────────────────────────────
export const students = pgTable('students', {
  id: text('id').primaryKey(),
  nim: text('nim').notNull().unique(),
  name: text('name').notNull(),
  class: text('class').notNull().default('1C'),
});

// ─── Offerings ────────────────────────────────────────────────────────────────
export const offerings = pgTable('offerings', {
  id: text('id').primaryKey(),
  practiceCode: text('practice_code').notNull(),
  semester: text('semester').notNull(),
  class: text('class').notNull(),
  semesterWeek: integer('semester_week').notNull(),
  calendarWeek: integer('calendar_week'),
  dateRangeText: text('date_range_text'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  instructorName: text('instructor_name'),
  instructorTitle: text('instructor_title'),
  practiceVersionId: text('practice_version_id').notNull(),
  studentIds: jsonb('student_ids').$type<string[]>().notNull().default([]),
  isRosterVerified: boolean('is_roster_verified').default(false),
  areDatesVerified: boolean('are_dates_verified').default(false),
});

// ─── Practice Versions ────────────────────────────────────────────────────────
export const practiceVersions = pgTable('practice_versions', {
  id: text('id').primaryKey(),
  name: text('name'),
  courseCode: text('course_code').default('CAD 1.1'),
  courseName: text('course_name').default('Praktik CAD 1.1'),
  status: text('status').notNull().default('published'),
  description: text('description'),
  lastUpdated: text('last_updated'),
  publishedAt: text('published_at'),
  publishedBy: text('published_by'),
  sections: jsonb('sections').$type<any[]>().default([]),
  exercises: jsonb('exercises').$type<any[]>().default([]),
  pdfCriteria: jsonb('pdf_criteria').$type<any[]>().default([]),
  exerciseCriteria: jsonb('exercise_criteria').$type<any[]>().default([]),
  softSkillCriteria: jsonb('soft_skill_criteria').$type<any[]>().default([]),
  attendancePolicy: jsonb('attendance_policy').$type<any>(),
  componentWeights: jsonb('component_weights').$type<any>(),
  passingThreshold: integer('passing_threshold').default(75),
  passingScore: integer('passing_score').default(60),
});

// ─── Exercise Grade Records ───────────────────────────────────────────────────
export const exerciseRecords = pgTable('exercise_records', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  offeringId: text('offering_id').notNull(),
  exerciseId: text('exercise_id').notNull(),
  scores: jsonb('scores').$type<Record<string, number | null>>().default({}),
  isComplete: boolean('is_complete').default(false),
  updatedAt: text('updated_at'),
  revision: integer('revision').default(0),
});

// ─── PDF Grade Records ────────────────────────────────────────────────────────
export const pdfRecords = pgTable('pdf_records', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  offeringId: text('offering_id').notNull(),
  artifacts: jsonb('artifacts').$type<any[]>().default([]),
  activeArtifactVersion: integer('active_artifact_version').default(0),
  submissionStatus: text('submission_status').default('belum_dikumpulkan'),
  inspectionStatus: text('inspection_status').default('belum_diperiksa'),
  scores: jsonb('scores').$type<Record<string, number | null>>().default({}),
  notes: text('notes').default(''),
  updatedAt: text('updated_at'),
  revision: integer('revision').default(0),
});

// ─── Soft Skill Grade Records ─────────────────────────────────────────────────
export const softSkillRecords = pgTable('soft_skill_records', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  offeringId: text('offering_id').notNull(),
  sessionOrdinal: integer('session_ordinal').notNull(),
  scores: jsonb('scores').$type<Record<string, number | null>>().default({}),
  isComplete: boolean('is_complete').default(false),
  updatedAt: text('updated_at'),
  revision: integer('revision').default(0),
});

// ─── Attendance Records ───────────────────────────────────────────────────────
export const attendanceRecords = pgTable('attendance_records', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  offeringId: text('offering_id').notNull(),
  sessionOrdinal: integer('session_ordinal').notNull(),
  status: text('status').default('alpa'),
  score: integer('score').default(0),
  updatedAt: text('updated_at'),
  revision: integer('revision').default(0),
});

// ─── Grade Snapshots ──────────────────────────────────────────────────────────
export const snapshots = pgTable('snapshots', {
  id: text('id').primaryKey(),
  offeringId: text('offering_id').notNull(),
  studentId: text('student_id').notNull(),
  snapshotNumber: integer('snapshot_number').default(1),
  finalizedAt: text('finalized_at'),
  finalizedBy: text('finalized_by'),
  practiceVersionId: text('practice_version_id'),
  calculatedGrade: jsonb('calculated_grade').$type<any>(),
  status: text('status').default('final'),
  reopenReason: text('reopen_reason'),
  reopenedAt: text('reopened_at'),
  reopenedBy: text('reopened_by'),
});

// ─── Audit Events ─────────────────────────────────────────────────────────────
export const auditEvents = pgTable('audit_events', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type'),
  targetId: text('target_id'),
  details: text('details'),
});

// ─── Export all for Drizzle schema inference ──────────────────────────────────
export const schema = {
  students,
  offerings,
  practiceVersions,
  exerciseRecords,
  pdfRecords,
  softSkillRecords,
  attendanceRecords,
  snapshots,
  auditEvents,
};
