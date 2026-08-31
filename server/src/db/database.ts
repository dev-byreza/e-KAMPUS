import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
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
import {
  SEED_STUDENTS,
  SEED_OFFERINGS,
  SEED_PRACTICE_VERSIONS,
} from './seedData';

interface DatabaseSchema {
  students: Student[];
  offerings: Offering[];
  practiceVersions: PracticeVersion[];
  exerciseRecords: ExerciseGradeRecord[];
  pdfRecords: PdfGradeRecord[];
  softSkillRecords: SoftSkillGradeRecord[];
  attendanceRecords: AttendanceRecord[];
  snapshots: GradeSnapshot[];
  auditEvents: AuditEvent[];
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema = {
    students: [],
    offerings: [],
    practiceVersions: [],
    exerciseRecords: [],
    pdfRecords: [],
    softSkillRecords: [],
    attendanceRecords: [],
    snapshots: [],
    auditEvents: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);

        // Ensure practiceVersions has complete attendancePolicy and exerciseCriteria
        const defaultVer = this.data.practiceVersions?.find((pv) => pv.id === 'CAD11-R1');
        if (!defaultVer || !defaultVer.attendancePolicy) {
          this.data.practiceVersions = [...SEED_PRACTICE_VERSIONS];
          this.persist();
        }
      } else {
        this.seed();
        this.persist();
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      this.seed();
      this.persist();
    }
  }

  private seed() {
    console.log('Seeding initial data (36 students, offerings, CAD11-R1)...');
    this.data.students = [...SEED_STUDENTS];
    this.data.offerings = [...SEED_OFFERINGS];
    this.data.practiceVersions = [...SEED_PRACTICE_VERSIONS];

    // Seed initial PDF records and soft skills for students
    const initialPdfs: PdfGradeRecord[] = [];
    const initialSofts: SoftSkillGradeRecord[] = [];
    const initialAtts: AttendanceRecord[] = [];

    SEED_OFFERINGS.forEach((off) => {
      off.studentIds.forEach((stdId) => {
        // PDF record
        initialPdfs.push({
          id: `pdf-${off.id}-${stdId}`,
          studentId: stdId,
          offeringId: off.id,
          submissionStatus: 'dikumpulkan',
          inspectionStatus: 'diterima',
          scores: {
            'c-pdf-k1': 4,
            'c-pdf-k2': 3,
            'c-pdf-k3': 4,
            'c-pdf-k4': 3,
          },
          updatedAt: new Date().toISOString(),
          revision: 1,
        });

        // 5 Days Attendance
        for (let ord = 1; ord <= 5; ord++) {
          initialAtts.push({
            id: `att-${off.id}-${stdId}-${ord}`,
            studentId: stdId,
            offeringId: off.id,
            sessionOrdinal: ord,
            status: 'hadir',
            score: 4,
            updatedAt: new Date().toISOString(),
            revision: 1,
          });

          // Soft skill
          initialSofts.push({
            id: `soft-${off.id}-${stdId}-${ord}`,
            studentId: stdId,
            offeringId: off.id,
            sessionOrdinal: ord,
            scores: {
              'c-soft-k1': 4,
              'c-soft-k2': 4,
              'c-soft-k3': 3,
              'c-soft-k4': 3,
            },
            status: 'lengkap',
            updatedAt: new Date().toISOString(),
            revision: 1,
          });
        }
      });
    });

    this.data.pdfRecords = initialPdfs;
    this.data.softSkillRecords = initialSofts;
    this.data.attendanceRecords = initialAtts;

    // Log seed event
    this.data.auditEvents.push({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'System Auto-Seed',
      action: 'init_database',
      targetType: 'system',
      targetId: 'CAD11-R1',
      details: 'Database seeded with 36 students, 3 offerings, and CAD11-R1 practice version.',
    });
  }

  public persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // Getters for tables
  public get students() {
    return this.data.students;
  }
  public get offerings() {
    return this.data.offerings;
  }
  public get practiceVersions() {
    return this.data.practiceVersions;
  }
  public get exerciseRecords() {
    return this.data.exerciseRecords;
  }
  public get pdfRecords() {
    return this.data.pdfRecords;
  }
  public get softSkillRecords() {
    return this.data.softSkillRecords;
  }
  public get attendanceRecords() {
    return this.data.attendanceRecords;
  }
  public get snapshots() {
    return this.data.snapshots;
  }
  public get auditEvents() {
    return this.data.auditEvents;
  }

  public resetDatabase() {
    this.seed();
    this.persist();
    return this.data;
  }
}

export const db = new Database();
