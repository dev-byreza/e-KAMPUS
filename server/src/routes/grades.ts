import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import {
  ExerciseGradeRecord,
  PdfGradeRecord,
  SoftSkillGradeRecord,
  AttendanceRecord,
} from '../../../src/types/assessment';

export const gradesRouter = Router();

// GET /api/grades/:offeringId - Retrieve all grading records for an offering
gradesRouter.get('/:offeringId', (req: Request, res: Response) => {
  const { offeringId } = req.params;

  const exercises = db.exerciseRecords.filter((r) => r.offeringId === offeringId);
  const pdfs = db.pdfRecords.filter((r) => r.offeringId === offeringId);
  const softSkills = db.softSkillRecords.filter((r) => r.offeringId === offeringId);
  const attendances = db.attendanceRecords.filter((r) => r.offeringId === offeringId);

  res.json({
    success: true,
    data: {
      exercises,
      pdfs,
      softSkills,
      attendances,
    },
  });
});

// POST /api/grades/exercise - Upsert exercise record
gradesRouter.post('/exercise', (req: Request, res: Response) => {
  const record: ExerciseGradeRecord = req.body;
  if (!record.studentId || !record.exerciseId || !record.offeringId) {
    res.status(400).json({ success: false, message: 'Data record latihan tidak lengkap.' });
    return;
  }

  const id = record.id || `ex-${record.offeringId}-${record.studentId}-${record.exerciseId}`;
  const idx = db.exerciseRecords.findIndex((r) => r.id === id);

  const updatedRecord: ExerciseGradeRecord = {
    ...record,
    id,
    updatedAt: new Date().toISOString(),
    revision: (record.revision || 0) + 1,
  };

  if (idx >= 0) {
    db.exerciseRecords[idx] = updatedRecord;
  } else {
    db.exerciseRecords.push(updatedRecord);
  }
  db.persist();

  res.json({ success: true, data: updatedRecord });
});

// POST /api/grades/pdf - Upsert PDF record
gradesRouter.post('/pdf', (req: Request, res: Response) => {
  const record: PdfGradeRecord = req.body;
  if (!record.studentId || !record.offeringId) {
    res.status(400).json({ success: false, message: 'Data record PDF tidak lengkap.' });
    return;
  }

  const id = record.id || `pdf-${record.offeringId}-${record.studentId}`;
  const idx = db.pdfRecords.findIndex((r) => r.id === id);

  const updatedRecord: PdfGradeRecord = {
    ...record,
    id,
    updatedAt: new Date().toISOString(),
    revision: (record.revision || 0) + 1,
  };

  if (idx >= 0) {
    db.pdfRecords[idx] = updatedRecord;
  } else {
    db.pdfRecords.push(updatedRecord);
  }
  db.persist();

  res.json({ success: true, data: updatedRecord });
});

// POST /api/grades/softskill - Upsert Soft skill record
gradesRouter.post('/softskill', (req: Request, res: Response) => {
  const record: SoftSkillGradeRecord = req.body;
  if (!record.studentId || !record.offeringId || !record.sessionOrdinal) {
    res.status(400).json({ success: false, message: 'Data record soft skill tidak lengkap.' });
    return;
  }

  const id = record.id || `soft-${record.offeringId}-${record.studentId}-${record.sessionOrdinal}`;
  const idx = db.softSkillRecords.findIndex((r) => r.id === id);

  const updatedRecord: SoftSkillGradeRecord = {
    ...record,
    id,
    updatedAt: new Date().toISOString(),
    revision: (record.revision || 0) + 1,
  };

  if (idx >= 0) {
    db.softSkillRecords[idx] = updatedRecord;
  } else {
    db.softSkillRecords.push(updatedRecord);
  }
  db.persist();

  res.json({ success: true, data: updatedRecord });
});

// POST /api/grades/attendance - Upsert Attendance record
gradesRouter.post('/attendance', (req: Request, res: Response) => {
  const record: AttendanceRecord = req.body;
  if (!record.studentId || !record.offeringId || !record.sessionOrdinal) {
    res.status(400).json({ success: false, message: 'Data record absensi tidak lengkap.' });
    return;
  }

  const id = record.id || `att-${record.offeringId}-${record.studentId}-${record.sessionOrdinal}`;
  const idx = db.attendanceRecords.findIndex((r) => r.id === id);

  const updatedRecord: AttendanceRecord = {
    ...record,
    id,
    updatedAt: new Date().toISOString(),
    revision: (record.revision || 0) + 1,
  };

  if (idx >= 0) {
    db.attendanceRecords[idx] = updatedRecord;
  } else {
    db.attendanceRecords.push(updatedRecord);
  }
  db.persist();

  res.json({ success: true, data: updatedRecord });
});

// POST /api/grades/attendance/bulk-present - Bulk fill all empty slots with Hadir
gradesRouter.post('/attendance/bulk-present', (req: Request, res: Response) => {
  const { offeringId, sessionOrdinal } = req.body;
  const offering = db.offerings.find((o) => o.id === offeringId);

  if (!offering) {
    res.status(404).json({ success: false, message: 'Offering tidak ditemukan.' });
    return;
  }

  let updatedCount = 0;
  offering.studentIds.forEach((stdId) => {
    const id = `att-${offeringId}-${stdId}-${sessionOrdinal}`;
    const idx = db.attendanceRecords.findIndex((r) => r.id === id);

    if (idx === -1 || db.attendanceRecords[idx].status === 'alpa' || db.attendanceRecords[idx].score === 0) {
      const rec: AttendanceRecord = {
        id,
        studentId: stdId,
        offeringId,
        sessionOrdinal,
        status: 'hadir',
        score: 4,
        updatedAt: new Date().toISOString(),
        revision: 1,
      };

      if (idx >= 0) {
        db.attendanceRecords[idx] = rec;
      } else {
        db.attendanceRecords.push(rec);
      }
      updatedCount++;
    }
  });

  db.persist();
  res.json({ success: true, updatedCount });
});
