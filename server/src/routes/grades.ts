import { Router, Request, Response } from 'express';
import * as db from '../db/database';
import {
  ExerciseGradeRecord,
  PdfGradeRecord,
  SoftSkillGradeRecord,
  AttendanceRecord,
} from '../../../src/types/assessment';

export const gradesRouter = Router();

// GET /api/grades/:offeringId
gradesRouter.get('/:offeringId', async (req: Request, res: Response) => {
  try {
    const { offeringId } = req.params;
    const [exercises, pdfs, softSkills, attendances] = await Promise.all([
      db.getExerciseRecordsByOffering(offeringId),
      db.getPdfRecordsByOffering(offeringId),
      db.getSoftSkillRecordsByOffering(offeringId),
      db.getAttendanceRecordsByOffering(offeringId),
    ]);
    res.json({ success: true, data: { exercises, pdfs, softSkills, attendances } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/grades/exercise
gradesRouter.post('/exercise', async (req: Request, res: Response) => {
  try {
    const record: ExerciseGradeRecord = req.body;
    if (!record.studentId || !record.exerciseId || !record.offeringId) {
      res.status(400).json({ success: false, message: 'Data record latihan tidak lengkap.' });
      return;
    }

    const id = record.id || `ex-${record.offeringId}-${record.studentId}-${record.exerciseId}`;
    const updated = await db.upsertExerciseRecord({
      ...record,
      id,
      updatedAt: new Date().toISOString(),
      revision: (record.revision || 0) + 1,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/grades/pdf
gradesRouter.post('/pdf', async (req: Request, res: Response) => {
  try {
    const record: PdfGradeRecord = req.body;
    if (!record.studentId || !record.offeringId) {
      res.status(400).json({ success: false, message: 'Data record PDF tidak lengkap.' });
      return;
    }

    const id = record.id || `pdf-${record.offeringId}-${record.studentId}`;
    const updated = await db.upsertPdfRecord({
      ...record,
      id,
      updatedAt: new Date().toISOString(),
      revision: (record.revision || 0) + 1,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/grades/softskill
gradesRouter.post('/softskill', async (req: Request, res: Response) => {
  try {
    const record: SoftSkillGradeRecord = req.body;
    if (!record.studentId || !record.offeringId || !record.sessionOrdinal) {
      res.status(400).json({ success: false, message: 'Data record soft skill tidak lengkap.' });
      return;
    }

    const id = record.id || `soft-${record.offeringId}-${record.studentId}-${record.sessionOrdinal}`;
    const updated = await db.upsertSoftSkillRecord({
      ...record,
      id,
      updatedAt: new Date().toISOString(),
      revision: (record.revision || 0) + 1,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/grades/attendance
gradesRouter.post('/attendance', async (req: Request, res: Response) => {
  try {
    const record: AttendanceRecord = req.body;
    if (!record.studentId || !record.offeringId || !record.sessionOrdinal) {
      res.status(400).json({ success: false, message: 'Data record absensi tidak lengkap.' });
      return;
    }

    const id = record.id || `att-${record.offeringId}-${record.studentId}-${record.sessionOrdinal}`;
    const updated = await db.upsertAttendanceRecord({
      ...record,
      id,
      updatedAt: new Date().toISOString(),
      revision: (record.revision || 0) + 1,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/grades/attendance/bulk-present
gradesRouter.post('/attendance/bulk-present', async (req: Request, res: Response) => {
  try {
    const { offeringId, sessionOrdinal } = req.body;
    const offering = await (await import('../db/database')).getOfferingById(offeringId);

    if (!offering) {
      res.status(404).json({ success: false, message: 'Offering tidak ditemukan.' });
      return;
    }

    const existing = await db.getAttendanceRecordsByOffering(offeringId);
    let updatedCount = 0;

    for (const stdId of offering.studentIds) {
      const id = `att-${offeringId}-${stdId}-${sessionOrdinal}`;
      const current = existing.find((r) => r.id === id);

      if (!current || current.status === 'alpa' || current.score === 0) {
        await db.upsertAttendanceRecord({
          id,
          studentId: stdId,
          offeringId,
          sessionOrdinal,
          status: 'hadir',
          score: 4,
          updatedAt: new Date().toISOString(),
          revision: 1,
        });
        updatedCount++;
      }
    }

    res.json({ success: true, updatedCount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
