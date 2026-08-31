import { Router, Request, Response } from 'express';
import * as db from '../db/database';
import { PracticeVersion } from '../../../src/types/assessment';

export const practiceVersionsRouter = Router();

// GET /api/practice-versions
practiceVersionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const data = await db.getPracticeVersions();
    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/practice-versions/:id
practiceVersionsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const version = await db.getPracticeVersionById(req.params.id);
    if (!version) {
      res.status(404).json({ success: false, message: 'Format version tidak ditemukan.' });
      return;
    }
    res.json({ success: true, data: version });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/practice-versions
practiceVersionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const newVersion: PracticeVersion = req.body;
    if (!newVersion.id || !newVersion.name) {
      res.status(400).json({ success: false, message: 'ID dan Nama versi wajib diisi.' });
      return;
    }

    const existing = await db.getPracticeVersionById(newVersion.id);
    if (existing) {
      res.status(409).json({ success: false, message: 'ID versi format sudah ada.' });
      return;
    }

    const created = await db.upsertPracticeVersion(newVersion);

    await db.insertAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin Unit CAD',
      action: 'create_practice_version',
      targetType: 'practice_version',
      targetId: newVersion.id,
      details: `Membuat draft versi format baru: ${newVersion.name} (${newVersion.id})`,
    });

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/practice-versions/:id
practiceVersionsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await db.getPracticeVersionById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Format version tidak ditemukan.' });
      return;
    }

    const updated = await db.upsertPracticeVersion({ ...existing, ...req.body, id: req.params.id });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/practice-versions/:id/publish
practiceVersionsRouter.post('/:id/publish', async (req: Request, res: Response) => {
  try {
    const version = await db.getPracticeVersionById(req.params.id);
    if (!version) {
      res.status(404).json({ success: false, message: 'Format version tidak ditemukan.' });
      return;
    }

    const updated = await db.upsertPracticeVersion({
      ...version,
      status: 'published',
      publishedAt: new Date().toISOString(),
      publishedBy: 'Admin Unit CAD',
    });

    await db.insertAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin Unit CAD',
      action: 'publish_practice_version',
      targetType: 'practice_version',
      targetId: version.id,
      details: `Menerbitkan versi format resmi: ${version.name} (${version.id})`,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/practice-versions/:id/apply
practiceVersionsRouter.post('/:id/apply', async (req: Request, res: Response) => {
  try {
    const { targetOfferingIds } = req.body;
    const versionId = req.params.id;

    const version = await db.getPracticeVersionById(versionId);
    if (!version) {
      res.status(404).json({ success: false, message: 'Format version tidak ditemukan.' });
      return;
    }

    if (!Array.isArray(targetOfferingIds)) {
      res.status(400).json({ success: false, message: 'targetOfferingIds harus berupa array.' });
      return;
    }

    for (const offId of targetOfferingIds) {
      await db.updateOffering(offId, { practiceVersionId: versionId } as any);
    }

    await db.insertAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin Unit CAD',
      action: 'apply_practice_version_to_offerings',
      targetType: 'practice_version',
      targetId: versionId,
      details: `Menerapkan versi ${versionId} ke offering: ${targetOfferingIds.join(', ')}`,
    });

    res.json({ success: true, appliedOfferings: targetOfferingIds });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
