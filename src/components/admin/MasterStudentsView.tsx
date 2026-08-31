import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../lib/db';
import { Student } from '../../types/assessment';
import { Users, Upload, Plus, Trash2, Search, FileText, CheckCircle2 } from 'lucide-react';

export const MasterStudentsView: React.FC = () => {
  const { students, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const [newNim, setNewNim] = useState('');
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('1C');

  const filtered = (students || []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nim.includes(search)
  );

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNim.trim() || !newName.trim()) return;

    const id = `std-${newNim.trim()}`;
    const newStudent: Student = {
      id,
      nim: newNim.trim(),
      name: newName.trim(),
      class: newClass,
    };

    await db.students.put(newStudent);
    setNewNim('');
    setNewName('');
    showToast(`Mahasiswa ${newStudent.name} berhasil ditambahkan!`, 'success');
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus data master mahasiswa ${name}?`)) {
      await db.students.delete(id);
      showToast(`Data ${name} dihapus dari master.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Add */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-sm">Master Mahasiswa & Kelas</h3>
          <p className="text-xs text-slate-400">
            Total {(students || []).length} Mahasiswa terdaftar dalam database institusi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NIM / Nama..."
              className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 w-48"
            />
          </div>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Impor CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Manual Add Form */}
      <form
        onSubmit={handleAddStudent}
        className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-3"
      >
        <span className="text-xs font-bold text-slate-300">Tambah Cepat:</span>
        <input
          type="text"
          placeholder="NIM (contoh: 22603099)"
          value={newNim}
          onChange={(e) => setNewNim(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Nama Mahasiswa Lengkap"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none min-w-[200px]"
        />
        <input
          type="text"
          placeholder="Kelas"
          value={newClass}
          onChange={(e) => setNewClass(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white w-20 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
        >
          Tambah
        </button>
      </form>

      {/* Students Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4 w-32">NIM</th>
              <th className="py-3 px-4">Nama Mahasiswa</th>
              <th className="py-3 px-4 w-24 text-center">Kelas</th>
              <th className="py-3 px-4 w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.map((st, idx) => (
              <tr key={st.id} className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                <td className="py-2.5 px-4 font-mono font-semibold text-indigo-300">{st.nim}</td>
                <td className="py-2.5 px-4 font-medium text-slate-100">{st.name}</td>
                <td className="py-2.5 px-4 text-center font-bold text-slate-300">{st.class}</td>
                <td className="py-2.5 px-4 text-right">
                  <button
                    onClick={() => handleDelete(st.id, st.name)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Hapus Mahasiswa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mock CSV/Excel Import Preview Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Impor Master Peserta dari CSV/XLSX</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Format header CSV yang didukung: <code className="font-mono text-amber-300">semester, kelas, kode_praktik, pekan_semester, minggu_kalender, nim, nama</code>.
            </p>
            <div className="p-6 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 text-center space-y-2">
              <Upload className="w-8 h-8 text-amber-400 mx-auto" />
              <div className="text-xs text-slate-300">Tarik berkas .csv atau .xlsx ke sini</div>
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
                  showToast('Pratinjau impor berhasil divalidasi (36 baris cocok)!', 'success');
                  setShowImportModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
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
