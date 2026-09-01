import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../lib/db';
import { api } from '../../services/api';
import { Course } from '../../types/assessment';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  FileCode2,
  Sparkles,
  Search,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MasterCoursesViewProps {
  onSelectCourseForFormat?: (course: Course) => void;
}

export const MasterCoursesView: React.FC<MasterCoursesViewProps> = ({
  onSelectCourseForFormat,
}) => {
  const { courses, practiceVersions, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sks: 2,
    description: '',
  });

  const filteredCourses = (courses || []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({ code: '', name: '', sks: 2, description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      sks: course.sks || 2,
      description: course.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      showToast('Kode dan Nama Mata Kuliah wajib diisi.', 'error');
      return;
    }

    const safeId = editingCourse
      ? editingCourse.id
      : `crs-${formData.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const newCourse: Course = {
      id: safeId,
      code: formData.code.trim(),
      name: formData.name.trim(),
      sks: Number(formData.sks),
      description: formData.description.trim(),
      defaultFormatId: editingCourse?.defaultFormatId,
    };

    await db.courses.put(newCourse);
    if (editingCourse) {
      api.updateCourse(newCourse.id, newCourse).catch((err) => {
        console.warn('[Courses] Backend update note:', err.message);
      });
      showToast(`Mata kuliah ${newCourse.code} berhasil diperbarui!`, 'success');
    } else {
      api.createCourse(newCourse).catch((err) => {
        console.warn('[Courses] Backend create note:', err.message);
      });
      showToast(`Mata kuliah ${newCourse.code} berhasil ditambahkan!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteCourse = async (course: Course) => {
    if (
      window.confirm(
        `Hapus mata kuliah "${course.code} — ${course.name}" dari sistem e-Kampus?`
      )
    ) {
      await db.courses.delete(course.id);
      api.deleteCourse(course.id).catch((err) => {
        console.warn('[Courses] Backend delete note:', err.message);
      });
      showToast(`Mata kuliah ${course.code} telah dihapus.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Master Kurikulum e-Kampus</span>
          </div>
          <h3 className="font-bold text-white text-base">Master Mata Kuliah & Praktikum</h3>
          <p className="text-xs text-slate-400">
            Kelola daftar mata kuliah institusi. Format penilaian dinamis dirancang berdasarkan mata kuliah ini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Mata Kuliah..."
              className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 w-48"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/50 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => {
          const attachedFormats = (practiceVersions || []).filter(
            (v) =>
              v.courseCode?.toLowerCase() === course.code.toLowerCase() ||
              v.id.toLowerCase().includes(course.code.toLowerCase().replace(/[^a-z0-9]/g, ''))
          );

          return (
            <div
              key={course.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-indigo-950/90 text-indigo-300 border border-indigo-700/60 font-black text-xs">
                    {course.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                    {course.sks || 2} SKS
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                    {course.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {course.description || 'Tidak ada deskripsi kurikulum tambahan.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Format Penilaian:</span>
                  <span className="font-bold text-amber-400">
                    {attachedFormats.length} Format Tersedia
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSelectCourseForFormat?.(course)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Rancang Format</span>
                  </button>

                  <button
                    onClick={() => openEditModal(course)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Edit Mata Kuliah"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Hapus Mata Kuliah"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Course */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Kode Mata Kuliah / Praktik *:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: CAD 1.2, BIM 1.0, CAM 1.0"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Nama Mata Kuliah Lengkap *:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Praktik CAD 1.2 — Pemodelan 3D Lanjut"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Jumlah SKS:</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.sks}
                  onChange={(e) => setFormData({ ...formData, sks: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Deskripsi Singkat Kurikulum:
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan materi, capaian pembelajaran, atau tujuan praktikum..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  {editingCourse ? 'Simpan Perubahan' : 'Tambah Mata Kuliah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
