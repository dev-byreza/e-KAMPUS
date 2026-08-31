import { Router, Request, Response } from 'express';
import * as db from '../db/database';
import { AuditEvent } from '../../../src/types/assessment';

export const auditRouter = Router();

// GET /api/audit
auditRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const max = Number(limit) || 100;
    const list = await db.getAuditEvents(max);
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/audit
auditRouter.post('/', async (req: Request, res: Response) => {
  try {
    const event: AuditEvent = {
      id: req.body.id || `audit-${Date.now()}`,
      timestamp: req.body.timestamp || new Date().toISOString(),
      actor: req.body.actor || 'Instruktur / Admin',
      action: req.body.action || 'system_event',
      targetType: req.body.targetType || 'system',
      targetId: req.body.targetId || 'global',
      details: req.body.details || '',
    };

    await db.insertAuditEvent(event);
    res.status(201).json({ success: true, data: event });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
