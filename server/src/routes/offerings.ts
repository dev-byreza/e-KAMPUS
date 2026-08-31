import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { Offering } from '../../../src/types/assessment';

export const offeringsRouter = Router();

// GET /api/offerings - List all offerings
offeringsRouter.get('/', (req: Request, res: Response) => {
  res.json({ success: true, count: db.offerings.length, data: db.offerings });
});

// GET /api/offerings/:id - Get single offering
offeringsRouter.get('/:id', (req: Request, res: Response) => {
  const offering = db.offerings.find((o) => o.id === req.params.id);
  if (!offering) {
    res.status(404).json({ success: false, message: 'Offering tidak ditemukan.' });
    return;
  }
  res.json({ success: true, data: offering });
});

// PUT /api/offerings/:id - Update offering (dates, roster, version, instructor)
offeringsRouter.put('/:id', (req: Request, res: Response) => {
  const idx = db.offerings.findIndex((o) => o.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Offering tidak ditemukan.' });
    return;
  }

  const updated: Offering = {
    ...db.offerings[idx],
    ...req.body,
    id: db.offerings[idx].id, // keep original ID
  };

  db.offerings[idx] = updated;
  db.persist();

  res.json({ success: true, data: updated });
});

// POST /api/offerings/:id/verify-roster - Toggle roster verified flag
offeringsRouter.post('/:id/verify-roster', (req: Request, res: Response) => {
  const offering = db.offerings.find((o) => o.id === req.params.id);
  if (!offering) {
    res.status(404).json({ success: false, message: 'Offering tidak ditemukan.' });
    return;
  }

  offering.isRosterVerified = !offering.isRosterVerified;
  db.persist();

  // Audit
  db.auditEvents.push({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'Instruktur',
    action: 'toggle_roster_verification',
    targetType: 'offering',
    targetId: offering.id,
    details: `Status verifikasi roster diubah menjadi: ${offering.isRosterVerified ? 'TERVERIFIKASI' : 'BELUM TERVERIFIKASI'}`,
  });
  db.persist();

  res.json({ success: true, data: offering });
});

// POST /api/offerings/:id/verify-dates - Toggle dates verified flag
offeringsRouter.post('/:id/verify-dates', (req: Request, res: Response) => {
  const offering = db.offerings.find((o) => o.id === req.params.id);
  if (!offering) {
    res.status(404).json({ success: false, message: 'Offering tidak ditemukan.' });
    return;
  }

  offering.areDatesVerified = !offering.areDatesVerified;
  db.persist();

  // Audit
  db.auditEvents.push({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'Instruktur',
    action: 'toggle_dates_verification',
    targetType: 'offering',
    targetId: offering.id,
    details: `Status verifikasi tanggal diubah menjadi: ${offering.areDatesVerified ? 'TERVERIFIKASI' : 'BELUM TERVERIFIKASI'}`,
  });
  db.persist();

  res.json({ success: true, data: offering });
});
