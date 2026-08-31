import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import {
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { formatScore, formatPercent, getSessionDate, cn, getAcademicStatus } from '../../lib/utils';
import { downloadRosterTemplate } from '../../lib/rosterExcel';
import { RosterImportModal } from './RosterImportModal';

export const RosterScheduleView: React.FC = () => {
  const {
    activeOffering,
    activePracticeVersion,
    offeringStudents,
    toggleRosterVerification,
    toggleDatesVerification,
  } = useApp();

  const { studentGrades } = useAssessmentData();
  const [showImportModal, setShowImportModal] = useState(false);

  if (!activeOffering || !activePracticeVersion) return null;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      {/* Top Banner: Schedule & Verification Actions */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-xs font-bold font-mono">
              {activeOffering.id}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Kelas {activeOffering.class} • Semester {activeOffering.semester}
            </span>
          </div>
          <h2 className="text-lg font-black text-white">
            Jadwal Praktik & Daftar Peserta Pekan {activeOffering.semesterWeek}
          </h2>
          <p className="text-xs text-slate-400">
            Rentang Pelaksanaan: <strong className="text-slate-200">{activeOffering.dateRangeText}</strong> (Minggu Kalender {activeOffering.calendarWeek}) • Instruktur: <span className="text-indigo-300 font-medium">{activeOffering.instructorName}</span>
          </p>
        </div>

        {/* Verification & Excel Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Download Template Button */}
          <button
            onClick={() => downloadRosterTemplate()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-sm transition-all"
            title="Unduh Template Excel (.xlsx) untuk Roster & Jadwal"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Unduh Template Excel</span>
          </button>

          {/* Import Excel Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 transition-all"
            title="Impor Peserta & Jadwal dari file Excel (.xlsx)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor Data Excel</span>
          </button>

          {/* Roster Verification Toggle */}
          <button
            onClick={() => toggleRosterVerification(activeOffering.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm',
              activeOffering.isRosterVerified
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/80'
                : 'bg-amber-950/80 text-amber-300 border-amber-700/60 hover:bg-amber-900/80'
            )}
          >
            {activeOffering.isRosterVerified ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Roster Terverifikasi</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Verifikasi Roster</span>
              </>
            )}
          </button>

          {/* Dates Verification Toggle */}
          <button
            onClick={() => toggleDatesVerification(activeOffering.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm',
              activeOffering.areDatesVerified
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/80'
                : 'bg-amber-950/80 text-amber-300 border-amber-700/60 hover:bg-amber-900/80'
            )}
          >
            {activeOffering.areDatesVerified ? (
              <>
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>5 Sesi Terverifikasi</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Verifikasi Tanggal Sesi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5-Day Session Calendar Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-sm">Kalender 5 Sesi Pelaksanaan Praktik</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { ord: 1, dayName: 'Senin', label: 'H1' },
            { ord: 2, dayName: 'Selasa', label: 'H2' },
            { ord: 3, dayName: 'Rabu', label: 'H3' },
            { ord: 4, dayName: 'Kamis', label: 'H4' },
            { ord: 5, dayName: 'Jumat', label: 'H5' },
          ].map((sess) => (
            <div
              key={sess.ord}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-400 text-xs">
                  Sesi {sess.label} ({sess.dayName})
                </span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <div className="text-sm font-black text-white font-mono">
                {getSessionDate(activeOffering.startDate, sess.ord - 1)}
              </div>
              <div className="text-[11px] text-slate-400">
                08:00 – 16:00 WITA • Sesi Harian
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrolled Students Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">
              Daftar Peserta Praktik Terdaftar ({offeringStudents.length} Mahasiswa)
            </h3>
            <p className="text-xs text-slate-400">
              Mahasiswa kelas {activeOffering.class} yang dialokasikan untuk Pekan {activeOffering.semesterWeek}.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-900 text-indigo-300 font-mono text-xs font-bold border border-slate-800">
            Kapasitas: 12 / 12 Mahasiswa
          </span>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-32">NIM</th>
                <th className="py-3 px-4">Nama Mahasiswa</th>
                <th className="py-3 px-4 w-20 text-center">Kelas</th>
                <th className="py-3 px-4 w-36 text-center">Latihan Selesai</th>
                <th className="py-3 px-4 w-28 text-center">Kehadiran</th>
                <th className="py-3 px-4 w-28 text-center">Nilai Akhir</th>
                <th className="py-3 px-4 w-32 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {offeringStudents.map((st, idx) => {
                const grade = studentGrades[st.id];
                return (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-300">{st.nim}</td>
                    <td className="py-3 px-4 font-medium text-slate-100">{st.name}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-300">{st.class}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-indigo-300 font-mono text-[11px] border border-slate-800">
                        {grade?.exercisesGradedCount || 0} / 10
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {formatPercent(grade?.attendancePercentage)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white">
                      {formatScore(grade?.finalGrade)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {(() => {
                        const status = getAcademicStatus(grade?.finalGrade);
                        return (
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block tracking-tight',
                              status.badgeClass
                            )}
                            title={status.description}
                          >
                            {status.badgeLabel}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roster Excel Import Modal */}
      {showImportModal && (
        <RosterImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
};
