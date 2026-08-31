import { Router, Request, Response } from 'express';
import * as db from '../db/database';
import { Student } from '../../../src/types/assessment';

export const studentsRouter = Router();

// GET /api/students
studentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { class: studentClass, search } = req.query;
    let result = await db.getStudents();

    if (studentClass) {
      result = result.filter((s) => s.class === studentClass);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.nim.includes(q)
      );
    }

    res.json({ success: true, count: result.length, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/students
studentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { nim, name, class: studentClass } = req.body;
    if (!nim || !name) {
      res.status(400).json({ success: false, message: 'NIM dan Nama wajib diisi.' });
      return;
    }

    const id = `std-${nim}`;
    const existing = await db.getStudentById(id);
    if (existing) {
      res.status(409).json({ success: false, message: 'Mahasiswa dengan NIM ini sudah terdaftar.' });
      return;
    }

    const newStudent: Student = { id, nim: String(nim).trim(), name: String(name).trim(), class: studentClass || '1C' };
    const created = await db.createStudent(newStudent);

    await db.insertAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
      action: 'create_student',
      targetType: 'student',
      targetId: newStudent.id,
      details: `Menambahkan mahasiswa baru: ${newStudent.name} (${newStudent.nim})`,
    });

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/students/bulk-import
studentsRouter.post('/bulk-import', async (req: Request, res: Response) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) {
      res.status(400).json({ success: false, message: 'Format data harus berupa array mahasiswa.' });
      return;
    }

    let importedCount = 0;
    for (const st of students as Partial<Student>[]) {
      if (st.nim && st.name) {
        const id = st.id || `std-${st.nim}`;
        await db.upsertStudent({ id, nim: String(st.nim).trim(), name: String(st.name).trim(), class: st.class || '1C' });
        importedCount++;
      }
    }

    const total = await db.getStudents();
    res.json({ success: true, importedCount, totalStudents: total.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/students/:id
studentsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await db.deleteStudent(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan.' });
      return;
    }
    res.json({ success: true, data: deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
