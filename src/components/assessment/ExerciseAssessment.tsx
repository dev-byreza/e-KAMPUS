import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileQuestion,
  ChevronDown,
  Info,
  XCircle,
  MessageSquare,
  HelpCircle,
  Check,
} from 'lucide-react';
import { ScorePillSelector } from '../common/ScorePillSelector';
import { formatScore, cn } from '../../lib/utils';
import { calculateExerciseScore } from '../../lib/calcEngine';

interface ExerciseAssessmentProps {
  searchQuery: string;
}

export const ExerciseAssessment: React.FC<ExerciseAssessmentProps> = ({ searchQuery }) => {
  const {
    activeOffering,
    activePracticeVersion,
    activeExerciseId,
    setActiveExerciseId,
    offeringStudents,
    openRubricModal,
  } = useApp();

  const {
    exerciseRecords,
    updateExerciseScore,
    updateExerciseNote,
    markExerciseNotSubmitted,
  } = useAssessmentData();

  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');
  
  const [notSubmittedModalStudent, setNotSubmittedModalStudent] = useState<{ id: string; name: string } | null>(null);
  const [notSubmittedReason, setNotSubmittedReason] = useState<string>('Mahasiswa tidak hadir / tidak menyerahkan lembar kerja latihan.');

  const [showProblemDetail, setShowProblemDetail] = useState(false);

  if (!activePracticeVersion || !activeOffering) return null;

  const exercises = activePracticeVersion.exercises;
  const activeExercise = exercises.find((e) => e.id === activeExerciseId) || exercises[0];
  const criteria = activePracticeVersion.exerciseCriteria || [];

  // Filter students based on search
  const filteredStudents = offeringStudents.filter((st) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return st.name.toLowerCase().includes(q) || st.nim.includes(q);
  });

  // Calculate exercise progress (how many students graded out of total enrolled)
  const gradedCount = offeringStudents.filter((st) => {
    const rec = exerciseRecords.find(
      (r) => r.studentId === st.id && r.exerciseId === activeExercise.id
    );
    return rec?.status === 'dinilai' || rec?.status === 'tidak_mengumpulkan';
  }).length;

  return (
    <div className="space-y-4">
      {/* Exercise Selector Bar & Details */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: L01..L10 Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {exercises.map((ex) => {
            const isSelected = ex.id === activeExercise.id;
            const isCompleteForActiveOffering =
              offeringStudents.every((st) => {
                const rec = exerciseRecords.find(
                  (r) => r.studentId === st.id && r.exerciseId === ex.id
                );
                return rec?.status === 'dinilai' || rec?.status === 'tidak_mengumpulkan';
              }) && offeringStudents.length > 0;

            return (
              <button
                key={ex.id}
                onClick={() => setActiveExerciseId(ex.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border',
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                )}
              >
                <span>{ex.code}</span>
                {isCompleteForActiveOffering && (
                  <Check className="w-3 h-3 text-emerald-400" />
                )}
                {!ex.isReady && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Soal Belum Ditetapkan" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Active Exercise Title, Readiness, Reference Trigger & Progress */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">
              {activeExercise.code}: {activeExercise.title}
            </span>
            {activeExercise.isReady ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                Siap Dinilai
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Soal Belum Ditetapkan
              </span>
            )}
          </div>

          <button
            onClick={() => setShowProblemDetail(!showProblemDetail)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-300 text-xs font-medium transition-colors"
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>{showProblemDetail ? 'Sembunyikan Petunjuk' : 'Petunjuk Soal'}</span>
          </button>

          <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 font-medium text-slate-300">
            Progres:{' '}
            <strong className="text-emerald-400 font-bold">{gradedCount}</strong> /{' '}
            {offeringStudents.length} Mahasiswa
          </div>
        </div>
      </div>

      {/* Expanded Exercise Reference Details Drawer */}
      {showProblemDetail && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/50 space-y-2 text-xs text-slate-300 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-indigo-300">
            <span>Deskripsi & Indikator Soal {activeExercise.code}</span>
            <span>Bobot Teknis: {activeExercise.weight}%</span>
          </div>
          <p className="text-slate-200">{activeExercise.instructions}</p>
          <div className="text-[11px] text-slate-400">
            Topik: <span className="text-slate-300">{activeExercise.topic}</span>
          </div>
        </div>
      )}

      {/* Main Student Assessment Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-28">NIM</th>
                <th className="py-3.5 px-4 min-w-[180px]">Nama Mahasiswa</th>
                {criteria.map((crit) => (
                  <th key={crit.id} className="py-3 px-3 text-center min-w-[200px]">
                    <div className="flex flex-col items-center justify-center text-center space-y-1">
                      <span className="text-indigo-400 font-mono font-bold text-xs">{crit.code}</span>
                      <span className="font-semibold text-slate-100 text-[11px] normal-case leading-snug break-words max-w-[190px]">
                        {crit.name}
                      </span>
                      <span className="text-[10px] text-indigo-300 font-mono font-medium bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                        Bobot {crit.weight}%
                      </span>
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-4 w-24 text-center">Nilai /100</th>
                <th className="py-3.5 px-4 w-28 text-center">Status</th>
                <th className="py-3.5 px-4 min-w-[140px] text-right">Catatan & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredStudents.map((st, idx) => {
                const rec = exerciseRecords.find(
                  (r) => r.studentId === st.id && r.exerciseId === activeExercise.id
                );
                const scores = rec?.scores || {};
                const calc = calculateExerciseScore(scores, criteria);
                const isNotSubmitted = rec?.status === 'tidak_mengumpulkan';
                const finalExerciseScore = isNotSubmitted ? 0 : calc.score;

                return (
                  <tr
                    key={st.id}
                    className={cn(
                      'hover:bg-slate-800/40 transition-colors',
                      isNotSubmitted && 'bg-rose-950/10'
                    )}
                  >
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

                    {/* Criteria 0-4 Selectors */}
                    {criteria.map((crit) => (
                      <td key={crit.id} className="py-3 px-2 text-center">
                        <ScorePillSelector
                          value={isNotSubmitted ? 0 : scores[crit.id]}
                          onChange={(score) => {
                            if (isNotSubmitted) return;
                            updateExerciseScore(st.id, activeExercise.id, crit.id, score);
                          }}
                          descriptors={crit.descriptors}
                          criterionName={`${crit.code}: ${crit.name}`}
                          disabled={isNotSubmitted}
                        />
                      </td>
                    ))}

                    {/* Converted 0-100 Score */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      {finalExerciseScore !== null ? (
                        <span
                          className={cn(
                            finalExerciseScore >= 75
                              ? 'text-emerald-400 font-bold'
                              : finalExerciseScore > 0
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          )}
                        >
                          {formatScore(finalExerciseScore)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {isNotSubmitted ? (
                        <span className="px-2 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                          Tidak Mengumpulkan
                        </span>
                      ) : rec?.status === 'dinilai' ? (
                        <span className="px-2 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Dinilai
                        </span>
                      ) : rec?.status === 'draf' ? (
                        <span className="px-2 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-semibold flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" /> Draf
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-slate-950 text-slate-500 border border-slate-800 text-[10px]">
                          Belum Dinilai
                        </span>
                      )}
                    </td>

                    {/* Actions: Notes & Tidak Mengumpulkan */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
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
                          title="Tambah / Ubah Catatan"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (isNotSubmitted) {
                              // Reset to draf
                              updateExerciseScore(st.id, activeExercise.id, criteria[0].id, null);
                            } else {
                              setNotSubmittedModalStudent({ id: st.id, name: st.name });
                            }
                          }}
                          className={cn(
                            'px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors',
                            isNotSubmitted
                              ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              : 'bg-rose-950/40 text-rose-400 border-rose-800/40 hover:bg-rose-900/60'
                          )}
                          title="Tandai tidak mengumpulkan tugas"
                        >
                          {isNotSubmitted ? 'Batalkan' : 'Tidak Mengumpulkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer explanation banner */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Keterangan: Input kriteria <strong>0–4</strong>; Skor berbobot dikonversi otomatis <strong>×25</strong> menjadi nilai <strong>0–100</strong>.
            </span>
          </div>
          <div className="text-slate-500">
            Perubahan tersimpan otomatis secara real-time ke IndexedDB.
          </div>
        </div>
      </div>

      {/* Note Editing Modal */}
      {activeNoteStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">
                Catatan Penilaian {activeExercise.code}
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
              placeholder="Tuliskan catatan teknis gambar, kelemahan dimensi, atau apresiasi..."
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
                  updateExerciseNote(activeNoteStudentId, activeExercise.id, tempNoteText);
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

      {/* "Tidak Mengumpulkan" Confirmation Modal */}
      {notSubmittedModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <XCircle className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-white text-sm">
                  Konfirmasi Tidak Mengumpulkan Tugas
                </h3>
                <p className="text-xs text-slate-400">
                  Mahasiswa: <strong className="text-white">{notSubmittedModalStudent.name}</strong> ({activeExercise.code})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini memerlukan alasan eksplisit dan akan memberikan <strong>skor 0 pada seluruh kriteria</strong> {activeExercise.code}. Status akan ditandai Selesai Dicatat tetapi Nilai Latihan bernilai 0.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Alasan Tidak Mengumpulkan:</label>
              <textarea
                value={notSubmittedReason}
                onChange={(e) => setNotSubmittedReason(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setNotSubmittedModalStudent(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  markExerciseNotSubmitted(notSubmittedModalStudent.id, activeExercise.id, notSubmittedReason);
                  setNotSubmittedModalStudent(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Tetapkan Skor 0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
