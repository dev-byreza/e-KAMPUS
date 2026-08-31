import { Router, Request, Response } from 'express';
import * as db from '../db/database';
import { Offering } from '../../../src/types/assessment';

export const offeringsRouter = Router();

// GET /api/offerings
offeringsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const data = await db.getOfferings();
    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/offerings/:id
offeringsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const offering = await db.getOfferingById(req.params.id);
    if (!offering) {
      res.status(404).json({ success: false, message: 'Offering tidak ditemukan.' });
      return;
    }
    res.json({ success: true, data: offering });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/offerings/:id
offeringsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateOffering(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Offering tidak ditemukan.' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/offerings/:id/verify-roster
offeringsRouter.post('/:id/verify-roster', async (req: Request, res: Response) => {
  try {
    const offering = await db.getOfferingById(req.params.id);
    if (!offering) {
      res.status(404).json({ success: false, message: 'Offering tidak ditemukan.' });
      return;
    }

    const updated = await db.updateOffering(req.params.id, {
      isRosterVerified: !offering.isRosterVerified,
    } as Partial<Offering>);

    await db.insertAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Instruktur',
      action: 'toggle_roster_verification',
      targetType: 'offering',
      targetId: req.params.id,
      details: `Status verifikasi roster: ${updated?.isRosterVerified ? 'TERVERIFIKASI' : 'BELUM TERVERIFIKASI'}`,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/offerings/:id/verify-dates
offeringsRouter.post('/:id/verify-dates', async (req: Request, res: Response) => {
  try {
    const offering = await db.getOfferingById(req.params.id);
    if (!offering) {
      res.status(404).json({ success: false, message: 'Offering tidak ditemukan.' });
      return;
    }

    const updated = await db.updateOffering(req.params.id, {
      areDatesVerified: !offering.areDatesVerified,
    } as Partial<Offering>);

    await db.insertAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Instruktur',
      action: 'toggle_dates_verification',
      targetType: 'offering',
      targetId: req.params.id,
      details: `Status verifikasi tanggal: ${updated?.areDatesVerified ? 'TERVERIFIKASI' : 'BELUM TERVERIFIKASI'}`,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
