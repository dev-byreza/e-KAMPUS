import { Router, Request, Response } from 'express';
import * as db from '../db/database';
import { Course } from '../../../src/types/assessment';

export const coursesRouter = Router();

// GET /api/courses
coursesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const data = await db.getCourses();
    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/courses/:id
coursesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const course = await db.getCourseById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, message: 'Mata kuliah tidak ditemukan.' });
      return;
    }
    res.json({ success: true, data: course });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/courses
coursesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { code, name, sks, description, defaultFormatId } = req.body;
    if (!code || !name) {
      res.status(400).json({ success: false, message: 'Kode dan Nama mata kuliah wajib diisi.' });
      return;
    }

    const safeId = `crs-${String(code).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const newCourse: Course = {
      id: req.body.id || safeId,
      code: String(code).trim(),
      name: String(name).trim(),
      sks: sks ? Number(sks) : 2,
      description: description || '',
      defaultFormatId: defaultFormatId || undefined,
    };

    const created = await db.upsertCourse(newCourse);

    await db.insertAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
      action: 'create_course',
      targetType: 'course',
      targetId: newCourse.id,
      details: `Menambahkan mata kuliah baru: ${newCourse.name} (${newCourse.code})`,
    });

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/courses/:id
coursesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await db.getCourseById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Mata kuliah tidak ditemukan.' });
      return;
    }

    const updated = await db.upsertCourse({ ...existing, ...req.body, id: req.params.id });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/courses/:id
coursesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await db.deleteCourse(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Mata kuliah tidak ditemukan.' });
      return;
    }
    res.json({ success: true, data: deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
