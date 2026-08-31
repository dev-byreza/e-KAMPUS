import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { GradeSnapshot } from '../../../src/types/assessment';

export const snapshotsRouter = Router();

// GET /api/snapshots/:offeringId - Get snapshots history
snapshotsRouter.get('/:offeringId', (req: Request, res: Response) => {
  const { offeringId } = req.params;
  const list = db.snapshots.filter((s) => s.offeringId === offeringId);
  res.json({ success: true, count: list.length, data: list });
});

// POST /api/snapshots/finalize - Save immutable snapshot
snapshotsRouter.post('/finalize', (req: Request, res: Response) => {
  const { offeringId, snapshots, instructorName } = req.body;

  if (!offeringId || !Array.isArray(snapshots)) {
    res.status(400).json({ success: false, message: 'Data finalisasi tidak lengkap.' });
    return;
  }

  const now = new Date().toISOString();
  const createdSnapshots: GradeSnapshot[] = snapshots.map((s: Partial<GradeSnapshot>, index: number) => ({
    id: `snap-${offeringId}-${s.studentId}-${Date.now()}-${index}`,
    offeringId,
    studentId: s.studentId || '',
    snapshotNumber: 1,
    finalizedAt: now,
    finalizedBy: instructorName || 'Instruktur Utama',
    practiceVersionId: s.practiceVersionId || 'CAD11-R1',
    calculatedGrade: s.calculatedGrade as any,
    status: 'final',
  }));

  db.snapshots.push(...createdSnapshots);
  db.persist();

  // Audit
  db.auditEvents.push({
    id: `audit-${Date.now()}`,
    timestamp: now,
    actor: instructorName || 'Instruktur Utama',
    action: 'finalize_grades',
    targetType: 'offering',
    targetId: offeringId,
    details: `Melakukan finalisasi nilai untuk ${createdSnapshots.length} mahasiswa pada offering ${offeringId}.`,
  });
  db.persist();

  res.status(201).json({ success: true, count: createdSnapshots.length, data: createdSnapshots });
});

// POST /api/snapshots/reopen - Reopen finalized grades with academic reason
snapshotsRouter.post('/reopen', (req: Request, res: Response) => {
  const { offeringId, reason, actor } = req.body;

  if (!offeringId || !reason) {
    res.status(400).json({ success: false, message: 'Alasan pembukaan revisi wajib disertakan.' });
    return;
  }

  const now = new Date().toISOString();

  // Mark all previous snapshots for this offering as reopened
  db.snapshots.forEach((s) => {
    if (s.offeringId === offeringId && s.status === 'final') {
      s.status = 'reopened';
      s.reopenReason = reason;
      s.reopenedAt = now;
      s.reopenedBy = actor || 'Instruktur Utama';
    }
  });
  db.persist();

  // Audit
  db.auditEvents.push({
    id: `audit-${Date.now()}`,
    timestamp: now,
    actor: actor || 'Instruktur Utama',
    action: 'reopen_grades',
    targetType: 'offering',
    targetId: offeringId,
    details: `Membuka kembali revisi penilaian untuk offering ${offeringId}. Alasan: "${reason}"`,
  });
  db.persist();

  res.json({ success: true, message: 'Revisi berhasil dibuka kembali.', offeringId });
});
