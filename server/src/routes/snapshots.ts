import { Router, Request, Response } from 'express';
import * as db from '../db/database';
import { GradeSnapshot } from '../../../src/types/assessment';

export const snapshotsRouter = Router();

// GET /api/snapshots/:offeringId
snapshotsRouter.get('/:offeringId', async (req: Request, res: Response) => {
  try {
    const list = await db.getSnapshotsByOffering(req.params.offeringId);
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/snapshots/finalize
snapshotsRouter.post('/finalize', async (req: Request, res: Response) => {
  try {
    const { offeringId, snapshots, instructorName } = req.body;
    if (!offeringId || !Array.isArray(snapshots)) {
      res.status(400).json({ success: false, message: 'Data finalisasi tidak lengkap.' });
      return;
    }

    const now = new Date().toISOString();
    const records: GradeSnapshot[] = snapshots.map((s: Partial<GradeSnapshot>, i: number) => ({
      id: `snap-${offeringId}-${s.studentId}-${Date.now()}-${i}`,
      offeringId,
      studentId: s.studentId || '',
      snapshotNumber: 1,
      finalizedAt: now,
      finalizedBy: instructorName || 'Instruktur Utama',
      practiceVersionId: s.practiceVersionId || 'CAD11-R1',
      calculatedGrade: s.calculatedGrade as any,
      status: 'final',
    }));

    const created = await db.insertSnapshots(records);

    await db.insertAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: now,
      actor: instructorName || 'Instruktur Utama',
      action: 'finalize_grades',
      targetType: 'offering',
      targetId: offeringId,
      details: `Finalisasi nilai untuk ${created.length} mahasiswa pada offering ${offeringId}.`,
    });

    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/snapshots/reopen
snapshotsRouter.post('/reopen', async (req: Request, res: Response) => {
  try {
    const { offeringId, reason, actor } = req.body;
    if (!offeringId || !reason) {
      res.status(400).json({ success: false, message: 'Alasan pembukaan revisi wajib disertakan.' });
      return;
    }

    const now = new Date().toISOString();
    await db.reopenSnapshots(offeringId, reason, actor || 'Instruktur Utama', now);

    await db.insertAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: now,
      actor: actor || 'Instruktur Utama',
      action: 'reopen_grades',
      targetType: 'offering',
      targetId: offeringId,
      details: `Membuka kembali revisi penilaian untuk offering ${offeringId}. Alasan: "${reason}"`,
    });

    res.json({ success: true, message: 'Revisi berhasil dibuka kembali.', offeringId });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
