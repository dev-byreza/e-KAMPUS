import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { AuditEvent } from '../../../src/types/assessment';

export const auditRouter = Router();

// GET /api/audit - List all audit events
auditRouter.get('/', (req: Request, res: Response) => {
  const { action, targetId, limit } = req.query;
  let list = [...db.auditEvents].reverse();

  if (action && typeof action === 'string') {
    list = list.filter((e) => e.action === action);
  }

  if (targetId && typeof targetId === 'string') {
    list = list.filter((e) => e.targetId === targetId);
  }

  const max = Number(limit) || 100;
  res.json({ success: true, count: list.length, data: list.slice(0, max) });
});

// POST /api/audit - Record new audit event
auditRouter.post('/', (req: Request, res: Response) => {
  const event: AuditEvent = {
    id: req.body.id || `audit-${Date.now()}`,
    timestamp: req.body.timestamp || new Date().toISOString(),
    actor: req.body.actor || 'Instruktur / Admin',
    action: req.body.action || 'system_event',
    targetType: req.body.targetType || 'system',
    targetId: req.body.targetId || 'global',
    details: req.body.details || '',
  };

  db.auditEvents.push(event);
  db.persist();

  res.status(201).json({ success: true, data: event });
});
