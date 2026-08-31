import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { Student } from '../../../src/types/assessment';

export const studentsRouter = Router();

// GET /api/students - List all students
studentsRouter.get('/', (req: Request, res: Response) => {
  const { class: studentClass, search } = req.query;
  let result = db.students;

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
});

// POST /api/students - Create a student
studentsRouter.post('/', (req: Request, res: Response) => {
  const { nim, name, class: studentClass } = req.body;

  if (!nim || !name) {
    res.status(400).json({ success: false, message: 'NIM dan Nama wajib diisi.' });
    return;
  }

  const id = `std-${nim}`;
  const existing = db.students.find((s) => s.id === id || s.nim === nim);
  if (existing) {
    res.status(409).json({ success: false, message: 'Mahasiswa dengan NIM ini sudah terdaftar.' });
    return;
  }

  const newStudent: Student = {
    id,
    nim: String(nim).trim(),
    name: String(name).trim(),
    class: studentClass || '1C',
  };

  db.students.push(newStudent);
  db.persist();

  // Audit
  db.auditEvents.push({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'Admin',
    action: 'create_student',
    targetType: 'student',
    targetId: newStudent.id,
    details: `Menambahkan mahasiswa baru: ${newStudent.name} (${newStudent.nim})`,
  });
  db.persist();

  res.status(201).json({ success: true, data: newStudent });
});

// POST /api/students/bulk-import - Import students array
studentsRouter.post('/bulk-import', (req: Request, res: Response) => {
  const { students } = req.body;

  if (!Array.isArray(students)) {
    res.status(400).json({ success: false, message: 'Format data harus berupa array mahasiswa.' });
    return;
  }

  let importedCount = 0;
  students.forEach((st: Partial<Student>) => {
    if (st.nim && st.name) {
      const id = st.id || `std-${st.nim}`;
      const idx = db.students.findIndex((s) => s.id === id || s.nim === st.nim);
      const studentObj: Student = {
        id,
        nim: String(st.nim).trim(),
        name: String(st.name).trim(),
        class: st.class || '1C',
      };

      if (idx >= 0) {
        db.students[idx] = studentObj;
      } else {
        db.students.push(studentObj);
      }
      importedCount++;
    }
  });

  db.persist();
  res.json({ success: true, importedCount, totalStudents: db.students.length });
});

// DELETE /api/students/:id - Delete a student
studentsRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.students.findIndex((s) => s.id === id || s.nim === id);

  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan.' });
    return;
  }

  const deleted = db.students.splice(idx, 1)[0];
  db.persist();

  res.json({ success: true, data: deleted });
});
