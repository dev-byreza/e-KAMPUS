import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { PracticeVersion } from '../../../src/types/assessment';

export const practiceVersionsRouter = Router();

// GET /api/practice-versions - List all format versions
practiceVersionsRouter.get('/', (req: Request, res: Response) => {
  res.json({ success: true, count: db.practiceVersions.length, data: db.practiceVersions });
});

// GET /api/practice-versions/:id - Get specific format version
practiceVersionsRouter.get('/:id', (req: Request, res: Response) => {
  const version = db.practiceVersions.find((v) => v.id === req.params.id);
  if (!version) {
    res.status(404).json({ success: false, message: 'Format version tidak ditemukan.' });
    return;
  }
  res.json({ success: true, data: version });
});

// POST /api/practice-versions - Create new format version (draft)
practiceVersionsRouter.post('/', (req: Request, res: Response) => {
  const newVersion: PracticeVersion = req.body;
  if (!newVersion.id || !newVersion.name) {
    res.status(400).json({ success: false, message: 'ID dan Nama versi wajib diisi.' });
    return;
  }

  const existing = db.practiceVersions.find((v) => v.id === newVersion.id);
  if (existing) {
    res.status(409).json({ success: false, message: 'ID versi format sudah ada.' });
    return;
  }

  db.practiceVersions.push(newVersion);
  db.persist();

  // Audit
  db.auditEvents.push({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'Admin Unit CAD',
    action: 'create_practice_version',
    targetType: 'practice_version',
    targetId: newVersion.id,
    details: `Membuat draft versi format baru: ${newVersion.name} (${newVersion.id})`,
  });
  db.persist();

  res.status(201).json({ success: true, data: newVersion });
});

// PUT /api/practice-versions/:id - Update draft format
practiceVersionsRouter.put('/:id', (req: Request, res: Response) => {
  const idx = db.practiceVersions.findIndex((v) => v.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Format version tidak ditemukan.' });
    return;
  }

  const updated: PracticeVersion = {
    ...db.practiceVersions[idx],
    ...req.body,
    id: db.practiceVersions[idx].id,
  };

  db.practiceVersions[idx] = updated;
  db.persist();

  res.json({ success: true, data: updated });
});

// POST /api/practice-versions/:id/publish - Publish draft to official
practiceVersionsRouter.post('/:id/publish', (req: Request, res: Response) => {
  const version = db.practiceVersions.find((v) => v.id === req.params.id);
  if (!version) {
    res.status(404).json({ success: false, message: 'Format version tidak ditemukan.' });
    return;
  }

  version.status = 'published';
  version.publishedAt = new Date().toISOString();
  version.publishedBy = 'Admin Unit CAD';
  db.persist();

  // Audit
  db.auditEvents.push({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'Admin Unit CAD',
    action: 'publish_practice_version',
    targetType: 'practice_version',
    targetId: version.id,
    details: `Menerbitkan versi format resmi: ${version.name} (${version.id})`,
  });
  db.persist();

  res.json({ success: true, data: version });
});

// POST /api/practice-versions/:id/apply - Apply format to selected offerings
practiceVersionsRouter.post('/:id/apply', (req: Request, res: Response) => {
  const { targetOfferingIds } = req.body;
  const versionId = req.params.id;

  const version = db.practiceVersions.find((v) => v.id === versionId);
  if (!version) {
    res.status(404).json({ success: false, message: 'Format version tidak ditemukan.' });
    return;
  }

  if (!Array.isArray(targetOfferingIds)) {
    res.status(400).json({ success: false, message: 'targetOfferingIds harus berupa array ID offering.' });
    return;
  }

  targetOfferingIds.forEach((offId: string) => {
    const off = db.offerings.find((o) => o.id === offId);
    if (off) {
      off.practiceVersionId = versionId;
    }
  });

  db.persist();

  // Audit
  db.auditEvents.push({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'Admin Unit CAD',
    action: 'apply_practice_version_to_offerings',
    targetType: 'practice_version',
    targetId: versionId,
    details: `Menerapkan versi ${versionId} ke offering: ${targetOfferingIds.join(', ')}`,
  });
  db.persist();

  res.json({ success: true, appliedOfferings: targetOfferingIds });
});
