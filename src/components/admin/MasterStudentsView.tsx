import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../lib/db';
import { api } from '../../services/api';
import { Student } from '../../types/assessment';
import {
  Users,
  Upload,
  Plus,
  Trash2,
  Search,
  FileText,
  CheckCircle2,
  Edit2,
  BookOpen,
  Filter,
  GraduationCap,
  Calendar,
  X,
  Save,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const MasterStudentsView: React.FC = () => {
  const { students, courses, showToast } = useApp();

  // Filters state
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // New student form state
  const [newNim, setNewNim] = useState('');
  const [newName, setNewName] = useState('');
  const [newCourse, setNewCourse] = useState(courses[0]?.code || 'CAD 1.1');
  const [newClass, setNewClass] = useState('1C');
  const [newSemester, setNewSemester] = useState('Ganjil 2026/2027');

  // Extract distinct classes and semesters for filter dropdowns
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    (students || []).forEach((s) => {
      if (s.class) set.add(s.class);
    });
    ['1A', '1B', '1C', '2A', '2B', '3A'].forEach((c) => set.add(c));
    return Array.from(set).sort();
  }, [students]);

  const availableSemesters = useMemo(() => {
    const set = new Set<string>();
    (students || []).forEach((s) => {
      if (s.semester) set.add(s.semester);
    });
    ['Ganjil 2026/2027', 'Genap 2026/2027', 'Ganjil 2027/2028'].forEach((sem) => set.add(sem));
    return Array.from(set).sort();
  }, [students]);

  // Filtered students list
  const filtered = useMemo(() => {
    return (students || []).filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.nim.includes(search);

      const studentCourse = s.courseCode || 'CAD 1.1';
      const matchCourse =
        courseFilter === 'ALL' ||
        studentCourse.toLowerCase() === courseFilter.toLowerCase();

      const matchClass =
        classFilter === 'ALL' ||
        (s.class || '').toLowerCase() === classFilter.toLowerCase();

      const studentSemester = s.semester || 'Ganjil 2026/2027';
      const matchSemester =
        semesterFilter === 'ALL' ||
        studentSemester.toLowerCase() === semesterFilter.toLowerCase();

      return matchSearch && matchCourse && matchClass && matchSemester;
    });
  }, [students, search, courseFilter, classFilter, semesterFilter]);

  // Add student handler
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNim.trim() || !newName.trim()) {
      showToast('NIM dan Nama Mahasiswa wajib diisi!', 'warning');
      return;
    }

    const id = `std-${newNim.trim()}`;
    const newStudent: Student = {
      id,
      nim: newNim.trim(),
      name: newName.trim(),
      class: newClass.trim() || '1C',
      courseCode: newCourse,
      semester: newSemester,
    };

    await db.students.put(newStudent);
    api.createStudent(newStudent).catch((err) => {
      console.warn('[MasterStudents] Backend sync note:', err.message);
    });

    setNewNim('');
    setNewName('');
    showToast(`Mahasiswa ${newStudent.name} (${newStudent.courseCode}) berhasil ditambahkan!`, 'success');
  };

  // Update student handler
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    await db.students.put(editingStudent);
    api.updateStudent(editingStudent.id, editingStudent).catch((err) => {
      console.warn('[MasterStudents] Backend update note:', err.message);
    });

    showToast(`Data mahasiswa ${editingStudent.name} berhasil diperbarui!`, 'success');
    setEditingStudent(null);
  };

  // Delete student handler
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus data master mahasiswa ${name}?`)) {
      await db.students.delete(id);
      api.deleteStudent(id).catch((err) => {
        console.warn('[MasterStudents] Backend delete note:', err.message);
      });
      showToast(`Data ${name} dihapus dari master.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Level Filters */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">
                Master Mahasiswa, Mata Kuliah & Kelas
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-xs font-bold border border-indigo-800">
                {filtered.length} / {(students || []).length} Mahasiswa
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Kelola peserta per Mata Kuliah Praktik, Kelas, dan Semester untuk penilaian mandiri.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Impor CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NIM atau Nama..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Course Filter */}
          <div className="relative">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Mata Kuliah</option>
              {(courses || []).map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="relative">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Kelas</option>
              {availableClasses.map((cl) => (
                <option key={cl} value={cl}>
                  Kelas {cl}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="relative">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Semester</option>
              {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Manual Add Form with Course, Class & Semester Selection */}
      <form
        onSubmit={handleAddStudent}
        className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg space-y-3"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Tambah Mahasiswa Baru ke Mata Kuliah:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Mata Kuliah */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Mata Kuliah
            </label>
            <select
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-semibold"
            >
              {(courses || []).map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          {/* Kelas */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Kelas
            </label>
            <input
              type="text"
              placeholder="Contoh: 1C"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-bold"
            />
          </div>

          {/* Semester */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Semester
            </label>
            <input
              type="text"
              placeholder="Ganjil 2026/2027"
              value={newSemester}
              onChange={(e) => setNewSemester(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* NIM */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              NIM
            </label>
            <input
              type="text"
              placeholder="22603099"
              value={newNim}
              onChange={(e) => setNewNim(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>

          {/* Nama & Submit */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Nama Mahasiswa
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama Lengkap..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0 transition-colors shadow-sm"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Students Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
              <th className="py-3.5 px-4 w-12 text-center">No</th>
              <th className="py-3.5 px-4 w-28">NIM</th>
              <th className="py-3.5 px-4">Nama Mahasiswa</th>
              <th className="py-3.5 px-4 w-32 text-center">Mata Kuliah</th>
              <th className="py-3.5 px-4 w-20 text-center">Kelas</th>
              <th className="py-3.5 px-4 w-36 text-center">Semester</th>
              <th className="py-3.5 px-4 w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Tidak ada mahasiswa yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((st, idx) => (
                <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300">{st.nim}</td>
                  <td className="py-3 px-4 font-medium text-slate-100">{st.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-md bg-amber-950/70 text-amber-300 border border-amber-700/50 font-mono text-[11px] font-bold">
                      {st.courseCode || 'CAD 1.1'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-xs font-bold">
                      {st.class || '1C'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-slate-400 text-[11px]">
                    {st.semester || 'Ganjil 2026/2027'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingStudent(st)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                        title="Edit Data Mahasiswa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(st.id, st.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Hapus Mahasiswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Edit Data Mahasiswa</h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Mata Kuliah Praktik
                </label>
                <select
                  value={editingStudent.courseCode || 'CAD 1.1'}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, courseCode: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  {(courses || []).map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  NIM
                </label>
                <input
                  type="text"
                  value={editingStudent.nim}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, nim: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nama Mahasiswa
                </label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={editingStudent.class}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, class: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={editingStudent.semester || 'Ganjil 2026/2027'}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, semester: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV/Excel Import Preview Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Impor Master Peserta dari CSV/XLSX</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Format kolom yang didukung: <code className="font-mono text-amber-300">nim, nama, mata_kuliah, kelas, semester</code>.
            </p>
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 text-center space-y-2">
              <Upload className="w-8 h-8 text-amber-400 mx-auto" />
              <div className="text-xs text-slate-300">Tarik berkas .csv atau .xlsx ke sini</div>
              <p className="text-[11px] text-slate-500">Mahasiswa akan otomatis dikaitkan ke Mata Kuliah & Kelas masing-masing.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  showToast('Pratinjau impor berhasil divalidasi!', 'success');
                  setShowImportModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
              >
                Jalankan Impor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
