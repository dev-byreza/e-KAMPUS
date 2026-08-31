import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import {
  CalendarCheck2,
  Calendar,
  CheckCircle2,
  Users,
  Grid,
  List,
  Sparkles,
  Info,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { formatScore, formatPercent, cn } from '../../lib/utils';
import { AttendanceStatus } from '../../types/assessment';

interface AttendanceAssessmentProps {
  searchQuery: string;
}

export const AttendanceAssessment: React.FC<AttendanceAssessmentProps> = ({ searchQuery }) => {
  const {
    activeOffering,
    activePracticeVersion,
    activeSessionOrdinal,
    setActiveSessionOrdinal,
    offeringStudents,
  } = useApp();

  const {
    attendanceRecords,
    studentGrades,
    updateAttendanceStatus,
    bulkMarkPresentForEmpty,
  } = useAssessmentData();

  const [viewMode, setViewMode] = useState<'daily' | 'matrix'>('daily');
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  if (!activePracticeVersion || !activeOffering) return null;

  const sessionsCount = activePracticeVersion.attendancePolicy?.sessionsCount || 5;

  const sessionDays = [
    { ord: 1, label: 'H1', dayName: 'Senin' },
    { ord: 2, label: 'H2', dayName: 'Selasa' },
    { ord: 3, label: 'H3', dayName: 'Rabu' },
    { ord: 4, label: 'H4', dayName: 'Kamis' },
    { ord: 5, label: 'H5', dayName: 'Jumat' },
  ].slice(0, sessionsCount);

  const filteredStudents = offeringStudents.filter((st) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return st.name.toLowerCase().includes(q) || st.nim.includes(q);
  });

  // Calculate unrecorded count for active day
  const unrecordedCountForDay = offeringStudents.filter((st) => {
    const rec = attendanceRecords.find(
      (r) => r.studentId === st.id && r.sessionOrdinal === activeSessionOrdinal
    );
    return !rec || !rec.status;
  }).length;

  return (
    <div className="space-y-4">
      {/* Top Header: Day Selector, Matrix View Toggle, and Bulk Fill Tool */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Daily Selector vs Matrix Toggle */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center">
            <button
              onClick={() => setViewMode('daily')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'daily'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>Input Harian</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Matriks 5 Hari</span>
            </button>
          </div>

          {viewMode === 'daily' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pl-2 border-l border-slate-800">
              {sessionDays.map((sd) => {
                const isSelected = activeSessionOrdinal === sd.ord;
                return (
                  <button
                    key={sd.ord}
                    onClick={() => setActiveSessionOrdinal(sd.ord)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border',
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    )}
                  >
                    <span>
                      {sd.label} • {sd.dayName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Bulk "Hadir untuk Semua" Action */}
        <div className="flex items-center gap-3">
          {viewMode === 'daily' && (
            <button
              onClick={() => setShowBulkConfirmModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 border border-emerald-400/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hadirkan Seluruh Kosong ({unrecordedCountForDay})</span>
            </button>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300">
            Bobot Absensi: <strong className="text-indigo-300">{activePracticeVersion.componentWeights.attendance}%</strong>
          </div>
        </div>
      </div>

      {/* VIEW 1: DAILY VIEW */}
      {viewMode === 'daily' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 w-28">NIM</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Nama Mahasiswa</th>
                  <th className="py-3.5 px-4 min-w-[300px] text-center">
                    Status Kehadiran (H{activeSessionOrdinal})
                  </th>
                  <th className="py-3.5 px-4 w-24 text-center">Skor Harian</th>
                  <th className="py-3.5 px-4 min-w-[140px] text-right">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStudents.map((st, idx) => {
                  const rec = attendanceRecords.find(
                    (r) => r.studentId === st.id && r.sessionOrdinal === activeSessionOrdinal
                  );
                  const status = rec?.status || null;

                  // Score for this status
                  let score4: number | null = null;
                  if (status === 'hadir') score4 = 4;
                  else if (status === 'alpa') score4 = 0;
                  else if (status === 'izin') score4 = activePracticeVersion.attendancePolicy.scores.izin;
                  else if (status === 'sakit') score4 = activePracticeVersion.attendancePolicy.scores.sakit;

                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Index */}
                      <td className="py-3 px-4 text-center font-mono text-slate-500 font-medium">
                        {idx + 1}
                      </td>

                      {/* NIM */}
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-300">
                        {st.nim}
                      </td>

                      {/* Nama */}
                      <td className="py-3 px-4 font-medium text-slate-100">
                        <div>{st.name}</div>
                        {rec?.notes && (
                          <div className="text-[11px] text-slate-400 italic flex items-center gap-1 mt-0.5">
                            <MessageSquare className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[200px]">{rec.notes}</span>
                          </div>
                        )}
                      </td>

                      {/* 2 Status Options: Hadir (+20%) / Tidak Hadir (-20%) */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1.5 shadow-inner">
                          <button
                            onClick={() => {
                              updateAttendanceStatus(
                                st.id,
                                activeSessionOrdinal,
                                status === 'hadir' ? null : 'hadir'
                              );
                            }}
                            className={cn(
                              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                              status === 'hadir'
                                ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
                            )}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Hadir (+20%)</span>
                          </button>

                          <button
                            onClick={() => {
                              updateAttendanceStatus(
                                st.id,
                                activeSessionOrdinal,
                                status === 'tidak_hadir' || status === 'alpa' || status === 'izin' || status === 'sakit'
                                  ? null
                                  : 'tidak_hadir'
                              );
                            }}
                            className={cn(
                              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                              status && status !== 'hadir'
                                ? 'bg-rose-600 text-white shadow-md ring-1 ring-rose-400'
                                : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900'
                            )}
                          >
                            <span>Tidak Hadir (-20%)</span>
                          </button>
                        </div>
                      </td>

                      {/* Daily Score /100 */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                        {status === 'hadir' ? (
                          <span className="text-emerald-400 font-bold">100,00</span>
                        ) : status ? (
                          <span className="text-rose-400 font-bold">0,00</span>
                        ) : (
                          <span className="text-slate-600 font-normal">—</span>
                        )}
                      </td>

                      {/* Notes Trigger */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setActiveNoteStudentId(st.id);
                            setTempNoteText(rec?.notes || '');
                          }}
                          className={cn(
                            'p-1.5 rounded-lg border text-xs transition-colors',
                            rec?.notes
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          )}
                          title="Tambah Catatan Absensi"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: 5-DAY SUMMARY MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 w-28">NIM</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Nama Mahasiswa</th>
                  {sessionDays.map((sd) => (
                    <th key={sd.ord} className="py-3.5 px-3 text-center w-24">
                      {sd.label} ({sd.dayName})
                    </th>
                  ))}
                  <th className="py-3.5 px-4 w-24 text-center">Total Hadir</th>
                  <th className="py-3.5 px-4 w-24 text-center">Persentase</th>
                  <th className="py-3.5 px-4 w-28 text-center">Nilai Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStudents.map((st, idx) => {
                  const g = studentGrades[st.id];
                  let hadirCount = 0;

                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-300">
                        {st.nim}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-100">
                        {st.name}
                      </td>
                      {sessionDays.map((sd) => {
                        const rec = attendanceRecords.find(
                          (r) => r.studentId === st.id && r.sessionOrdinal === sd.ord
                        );
                        if (rec?.status === 'hadir') hadirCount++;

                        return (
                          <td key={sd.ord} className="py-3 px-3 text-center">
                            {rec?.status === 'hadir' ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 font-bold border border-emerald-800 text-[10px]">
                                HADIR
                              </span>
                            ) : rec?.status ? (
                              <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 font-bold border border-rose-800 text-[10px]" title={rec?.notes || 'Tidak Hadir'}>
                                TIDAK HADIR
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                        {hadirCount} / {sessionsCount}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-indigo-300 font-bold">
                        {formatPercent(g?.attendancePercentage)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-sm text-emerald-400">
                        {formatScore(g?.attendanceScore)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note Editing Modal */}
      {activeNoteStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">
                Catatan Absensi (H{activeSessionOrdinal})
              </h3>
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <textarea
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              placeholder="Catat keterangan izin, dispensasi lomba, surat dokter, atau keterlambatan..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const rec = attendanceRecords.find(
                    (r) => r.studentId === activeNoteStudentId && r.sessionOrdinal === activeSessionOrdinal
                  );
                  updateAttendanceStatus(
                    activeNoteStudentId,
                    activeSessionOrdinal,
                    rec?.status || null,
                    tempNoteText
                  );
                  setActiveNoteStudentId(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Fill Confirmation Modal */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-800/80 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400 border-b border-slate-800 pb-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-white text-sm">
                  Konfirmasi Hadirkan Seluruh Kosong
                </h3>
                <p className="text-xs text-slate-400">
                  Hari: <strong className="text-white">H{activeSessionOrdinal} ({sessionDays.find((d) => d.ord === activeSessionOrdinal)?.dayName})</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan mengisi status <strong>Hadir (Skor 4)</strong> untuk tepat <strong className="text-emerald-300 font-bold">{unrecordedCountForDay} mahasiswa</strong> yang belum memiliki catatan pada hari ini. Status yang sudah terisi (Izin/Sakit/Alpa) <strong>tidak akan ditimpa</strong>.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowBulkConfirmModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  bulkMarkPresentForEmpty(activeSessionOrdinal);
                  setShowBulkConfirmModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Tandai {unrecordedCountForDay} Mahasiswa Hadir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
