import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../lib/db';
import { api } from '../../services/api';
import { Offering } from '../../types/assessment';
import {
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  X,
  Save,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

export const MasterOfferingsView: React.FC = () => {
  const {
    offerings,
    courses,
    practiceVersions,
    students,
    toggleRosterVerification,
    toggleDatesVerification,
    showToast,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code || 'CAD 1.1');
  const [semester, setSemester] = useState('Ganjil 2026/2027');
  const [className, setClassName] = useState('1C');
  const [semesterWeek, setSemesterWeek] = useState(1);
  const [calendarWeek, setCalendarWeek] = useState(32);
  const [dateRangeText, setDateRangeText] = useState('10–14 Agustus 2026');
  const [formatId, setFormatId] = useState(practiceVersions[0]?.id || 'CAD11-R1');
  const [instructorName, setInstructorName] = useState('Reza Febriadi Rauf, A.Md.T');

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCourse = selectedCourse.replace(/[^a-zA-Z0-9]/g, '');
    const cleanSem = semester.includes('Ganjil') ? '2026G' : '2026E';
    const id = `${cleanCourse}-${cleanSem}-${className}-P${String(semesterWeek).padStart(2, '0')}`;

    // Auto-pick students enrolled in this course and class
    const matchingStudents = (students || []).filter(
      (s) =>
        (s.courseCode || 'CAD 1.1').toLowerCase() === selectedCourse.toLowerCase() &&
        (s.class || '').toLowerCase() === className.toLowerCase()
    );

    const studentIds = matchingStudents.map((s) => s.id);

    const newOffering: Offering = {
      id,
      practiceCode: selectedCourse,
      semester,
      class: className,
      semesterWeek: Number(semesterWeek),
      calendarWeek: Number(calendarWeek),
      dateRangeText,
      startDate: '2026-08-10',
      endDate: '2026-08-14',
      studentIds,
      practiceVersionId: formatId,
      instructorName,
      isRosterVerified: false,
      areDatesVerified: false,
    };

    await db.offerings.put(newOffering);
    api.createOffering(newOffering).catch((err) => {
      console.warn('[MasterOfferings] Backend sync note:', err.message);
    });

    showToast(`Pelaksanaan ${id} untuk ${selectedCourse} berhasil dibuat!`, 'success');
    setShowAddModal(false);
  };

  const handleDeleteOffering = async (id: string) => {
    if (window.confirm(`Hapus jadwal pelaksanaan ${id}?`)) {
      await db.offerings.delete(id);
      showToast(`Jadwal ${id} dihapus.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-white text-base">
            Master Pelaksanaan Praktikum per Pekan & Kelas
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Kelola sesi pelaksanaan per Mata Kuliah, pembagian kelompok peserta, dan verifikasi tanggal sesi.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Pelaksanaan Pekan</span>
        </button>
      </div>

      {/* Offerings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(offerings || []).map((off) => (
          <div
            key={off.id}
            className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-950/70 text-amber-300 border border-amber-700/50 font-mono text-[10px] font-bold">
                    {off.practiceCode}
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    Kelas {off.class}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm mt-1">
                  Pekan {off.semesterWeek} (Minggu {off.calendarWeek})
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[10px] font-bold border border-slate-800">
                {off.practiceVersionId}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div>
                Semester: <strong className="text-slate-200">{off.semester}</strong>
              </div>
              <div>
                Rentang Tanggal: <strong className="text-white">{off.dateRangeText}</strong>
              </div>
              <div>
                Peserta Terdaftar:{' '}
                <strong className="text-indigo-300">
                  {(off.studentIds || []).length} Mahasiswa
                </strong>
              </div>
              <div>
                Instruktur:{' '}
                <span className="text-slate-400 font-medium">{off.instructorName}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleRosterVerification(off.id)}
                  className="w-full py-1.5 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition-colors bg-slate-950 text-slate-300 border-slate-800 hover:text-white"
                >
                  {off.isRosterVerified ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Roster OK</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Verifikasi</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleDatesVerification(off.id)}
                  className="w-full py-1.5 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition-colors bg-slate-950 text-slate-300 border-slate-800 hover:text-white"
                >
                  {off.areDatesVerified ? (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>5 Sesi OK</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Verifikasi Sesi</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => handleDeleteOffering(off.id)}
                className="w-full py-1 rounded-lg text-slate-500 hover:text-rose-400 text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus Offering Ini</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Offering Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                Tambah Pelaksanaan Pekan Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOffering} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Mata Kuliah Praktik
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(courses || []).map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Pekan Semester
                  </label>
                  <input
                    type="number"
                    value={semesterWeek}
                    onChange={(e) => setSemesterWeek(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Minggu Kalender
                  </label>
                  <input
                    type="number"
                    value={calendarWeek}
                    onChange={(e) => setCalendarWeek(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Rentang Tanggal Teks
                </label>
                <input
                  type="text"
                  value={dateRangeText}
                  onChange={(e) => setDateRangeText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Format Penilaian (Blueprint)
                </label>
                <select
                  value={formatId}
                  onChange={(e) => setFormatId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                >
                  {(practiceVersions || []).map((pv) => (
                    <option key={pv.id} value={pv.id}>
                      {pv.id} — {pv.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pelaksanaan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
