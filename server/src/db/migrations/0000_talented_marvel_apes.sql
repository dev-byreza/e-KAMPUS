CREATE TABLE "attendance_records" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"offering_id" text NOT NULL,
	"session_ordinal" integer NOT NULL,
	"status" text DEFAULT 'alpa',
	"score" integer DEFAULT 0,
	"updated_at" text,
	"revision" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" text NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"details" text
);
--> statement-breakpoint
CREATE TABLE "exercise_records" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"offering_id" text NOT NULL,
	"exercise_id" text NOT NULL,
	"scores" jsonb DEFAULT '{}'::jsonb,
	"is_complete" boolean DEFAULT false,
	"updated_at" text,
	"revision" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "offerings" (
	"id" text PRIMARY KEY NOT NULL,
	"practice_code" text NOT NULL,
	"semester" text NOT NULL,
	"class" text NOT NULL,
	"semester_week" integer NOT NULL,
	"calendar_week" integer,
	"date_range_text" text,
	"start_date" text,
	"end_date" text,
	"instructor_name" text,
	"instructor_title" text,
	"practice_version_id" text NOT NULL,
	"student_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_roster_verified" boolean DEFAULT false,
	"are_dates_verified" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pdf_records" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"offering_id" text NOT NULL,
	"artifacts" jsonb DEFAULT '[]'::jsonb,
	"active_artifact_version" integer DEFAULT 0,
	"submission_status" text DEFAULT 'belum_dikumpulkan',
	"inspection_status" text DEFAULT 'belum_diperiksa',
	"scores" jsonb DEFAULT '{}'::jsonb,
	"notes" text DEFAULT '',
	"updated_at" text,
	"revision" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "practice_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"description" text,
	"last_updated" text,
	"pdf_criteria" jsonb DEFAULT '[]'::jsonb,
	"exercise_criteria" jsonb DEFAULT '[]'::jsonb,
	"soft_skill_criteria" jsonb DEFAULT '[]'::jsonb,
	"attendance_policy" jsonb,
	"component_weights" jsonb,
	"passing_score" integer DEFAULT 60
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"offering_id" text NOT NULL,
	"student_id" text NOT NULL,
	"snapshot_number" integer DEFAULT 1,
	"finalized_at" text,
	"finalized_by" text,
	"practice_version_id" text,
	"calculated_grade" jsonb,
	"status" text DEFAULT 'final',
	"reopen_reason" text,
	"reopened_at" text,
	"reopened_by" text
);
--> statement-breakpoint
CREATE TABLE "soft_skill_records" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"offering_id" text NOT NULL,
	"session_ordinal" integer NOT NULL,
	"scores" jsonb DEFAULT '{}'::jsonb,
	"is_complete" boolean DEFAULT false,
	"updated_at" text,
	"revision" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"nim" text NOT NULL,
	"name" text NOT NULL,
	"class" text DEFAULT '1C' NOT NULL,
	CONSTRAINT "students_nim_unique" UNIQUE("nim")
);
