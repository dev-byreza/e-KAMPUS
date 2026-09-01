// Core types for Web App CAD 1.1 Assessment System based on PRD v1.1

export type Role = 'admin' | 'instructor';

export interface Course {
  id: string; // e.g. "crs-cad11", "crs-cad12", "crs-bim10"
  code: string; // e.g. "CAD 1.1", "CAD 1.2", "BIM 1.0", "CAM 1.0"
  name: string; // e.g. "Praktik CAD 1.1 — Pemodelan 2D & Dasar 3D"
  sks?: number; // e.g. 2
  description?: string;
  defaultFormatId?: string; // e.g. "CAD11-R1"
}

export interface Student {
  id: string; // UUID
  nim: string; // Stored strictly as text
  name: string;
  class: string; // e.g. "1C", "2A"
  courseCode?: string; // e.g. "CAD 1.1", "CAD 1.2", "BIM 1.0", "CAM 1.0"
  semester?: string; // e.g. "Ganjil 2026/2027", "Genap 2026/2027"
  avatarUrl?: string;
}

export interface Offering {
  id: string; // e.g. "CAD11-2026G-1C-P03"
  practiceCode: string; // "CAD 1.1"
  semester: string; // "Ganjil 2026/2027"
  class: string; // "1C"
  semesterWeek: number; // 3, 5, 7
  calendarWeek: number; // 34, 36, 38
  dateRangeText: string; // "17–21 Agustus 2026"
  startDate: string; // ISO date
  endDate: string; // ISO date
  studentIds: string[]; // 12 students enrolled
  practiceVersionId: string; // e.g. "CAD11-R1"
  instructorName: string;
  isRosterVerified: boolean;
  areDatesVerified: boolean;
}

export interface Session {
  id: string;
  offeringId: string;
  ordinal: number; // 1 to 5 (H1..H5)
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Senin", "Selasa", etc.
}

export interface RubricDescriptor {
  score: 0 | 1 | 2 | 3 | 4;
  label: string; // e.g. "Sangat Baik", "Baik", "Cukup", "Kurang", "Belum Tercapai"
  description: string; // Full specific guideline text
}

export interface RubricCriterion {
  id: string;
  code: string; // "K1", "K2", etc.
  name: string; // e.g. "Presisi ukuran/posisi"
  weight: number; // In percentage (e.g. 40 means 40%)
  descriptors: Record<0 | 1 | 2 | 3 | 4, string>;
}

export interface Exercise {
  id: string;
  code: string; // "L01", "L02", ..., "L10"
  title: string; // e.g. "Garis & Koordinat Relatif"
  topic: string;
  weight: number; // e.g. 10 (meaning 10% of technical component)
  instructions: string;
  referenceDrawing?: string;
  isReady: boolean; // e.g., true for L01-L08, false for L09/L10 until configured
}

export interface AssessmentSectionConfig {
  id: 'exercises' | 'pdf' | 'softskill' | 'attendance';
  buttonLabel: string; // e.g. "10 Latihan", "Output PDF", "Soft Skill", "Kehadiran 5 Hari"
  order: number;
  weight: number; // Component weight (e.g. 60, 15, 15, 10)
}

export interface AttendancePolicy {
  sessionsCount: number; // Default 5
  scores: {
    hadir: 4;
    izin: number | null; // null if not set by policy
    sakit: number | null;
    alpa: 0;
  };
}

export interface PracticeVersion {
  id: string; // e.g. "CAD11-R1", "CAD11-R2"
  name: string; // "Versi Standar CAD 1.1 R1"
  courseCode?: string; // e.g. "CAD 1.1", "CAD 1.2", "BIM 1.0", "CAM 1.0"
  courseName?: string; // e.g. "Praktik CAD 1.1 — Pemodelan 2D & Dasar 3D"
  description: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  publishedBy?: string;
  componentWeights: {
    exercises: number; // 60
    pdf: number; // 15
    softskill: number; // 15
    attendance: number; // 10
  };
  sections: AssessmentSectionConfig[];
  exercises: Exercise[];
  exerciseCriteria: RubricCriterion[];
  pdfCriteria: RubricCriterion[];
  softSkillCriteria: RubricCriterion[];
  attendancePolicy: AttendancePolicy;
  passingThreshold: number; // 75.00
  minimumSoftSkillObservations: number; // 1
  maxPdfSizeMb: number; // 20
}

// Student Assessment Records
export type ExerciseStatus = 'belum_dinilai' | 'draf' | 'dinilai' | 'tidak_mengumpulkan';
export type PdfSubmissionStatus = 'belum_dikumpulkan' | 'dikumpulkan' | 'tidak_dikumpulkan';
export type PdfInspectionStatus = 'belum_diperiksa' | 'perlu_revisi' | 'diterima' | 'tidak_ada_berkas';
export type SoftSkillStatus = 'belum_ditinjau' | 'draf' | 'dinilai' | 'tidak_teramati';
export type AttendanceStatus = 'hadir' | 'tidak_hadir' | 'izin' | 'sakit' | 'alpa';

export interface ExerciseGradeRecord {
  id: string;
  studentId: string;
  offeringId: string;
  exerciseId: string;
  scores: Record<string, number | null>; // criterionId -> 0..4 or null
  status: ExerciseStatus;
  notes?: string;
  reasonNotSubmitted?: string;
  updatedAt: string;
  revision: number;
}

export interface PdfArtifact {
  id: string;
  version: number;
  fileName: string;
  fileSize: number; // bytes
  uploadedAt: string;
  uploadedBy: string;
  fileUrl?: string;
}

export interface PdfGradeRecord {
  id: string;
  studentId: string;
  offeringId: string;
  artifacts: PdfArtifact[];
  activeArtifactVersion: number | null;
  submissionStatus: PdfSubmissionStatus;
  inspectionStatus: PdfInspectionStatus;
  scores: Record<string, number | null>; // criterionId -> 0..4 or null
  notes?: string;
  reasonNotSubmitted?: string;
  updatedAt: string;
  revision: number;
}

export interface SoftSkillGradeRecord {
  id: string;
  studentId: string;
  offeringId: string;
  sessionOrdinal: number; // 1..5
  scores: Record<string, number | null>; // criterionId -> 0..4 or null
  status: SoftSkillStatus;
  notes?: string;
  reasonUnobserved?: string;
  updatedAt: string;
  revision: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  offeringId: string;
  sessionOrdinal: number; // 1..5
  status: AttendanceStatus | null; // null if unrecorded
  notes?: string;
  updatedAt: string;
  revision: number;
}

export interface InstitutionalPillars {
  kualitas: number | null; // 70% (Latihan 60% + Kehadiran 10%)
  kreativitas: number | null; // 5% (Soft Skill: Kemandirian & Solusi CAD)
  sikap: number | null; // 10% (Soft Skill: Disiplin, SOP, & Etika)
  laporanKerja: number | null; // 15% (Output PDF Gabungan)
}

export interface StudentCalculatedGrade {
  studentId: string;
  // 4 Institutional Pillars (Kualitas 70%, Kreativitas 5%, Sikap 10%, Laporan Kerja 15%)
  pillars: InstitutionalPillars;
  // Exercises
  exerciseScores: Record<string, number | null>; // exerciseId -> 0..100
  exerciseAverage: number | null; // 0..100
  exercisesComplete: boolean;
  exercisesGradedCount: number;
  // PDF
  pdfScore: number | null; // 0..100
  pdfComplete: boolean;
  pdfAccepted: boolean;
  // Soft Skill
  softSkillDailyScores: Record<number, number | null>; // ordinal -> 0..100
  softSkillAverage: number | null; // 0..100
  softSkillDaysScored: number;
  softSkillDaysUnobserved: number;
  softSkillComplete: boolean;
  // Attendance
  attendanceScore: number | null; // 0..100
  attendancePercentage: number; // 0..100%
  attendanceDaysRecorded: number;
  attendanceComplete: boolean;
  // Overall Final
  finalGrade: number | null; // 0..100
  isComplete: boolean;
  isPassed: boolean; // >= 75.00 and conditions met
  incompletionReasons: string[];
}

export interface GradeSnapshot {
  id: string;
  offeringId: string;
  studentId: string;
  snapshotNumber: number;
  finalizedAt: string;
  finalizedBy: string;
  practiceVersionId: string;
  calculatedGrade: StudentCalculatedGrade;
  status: 'final' | 'reopened';
  reopenReason?: string;
  reopenedAt?: string;
  reopenedBy?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
}

export type ActiveTab = 'exercises' | 'pdf' | 'softskill' | 'attendance';
export type AppView = 
  | 'penilaian' 
  | 'dashboard_nilai' 
  | 'peserta_jadwal' 
  | 'rubrik_aturan' 
  | 'rekap_ekspor' 
  | 'riwayat_snapshot' 
  | 'dashboard_admin'
  | 'portal_mahasiswa';
