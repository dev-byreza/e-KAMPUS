import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import {
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  FileCheck2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatScore, cn } from '../../lib/utils';

export const SnapshotHistoryView: React.FC = () => {
  const { activeOffering, activePracticeVersion, offeringStudents, showToast } = useApp();
  const { snapshots, studentGrades, finalizeGrades, reopenGrades } = useAssessmentData();

  const [instructorNameInput, setInstructorNameInput] = useState(
    activeOffering?.instructorName || 'Reza Febriadi Rauf, A.Md.T'
  );

  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState(
    'Koreksi presisi latihan L04 dan penggantian lembar PDF revisi mahasiswa.'
  );

  if (!activePracticeVersion || !activeOffering) return null;

  const isFinalized = snapshots.some((s) => s.status === 'final');
  const activeSnapshot = snapshots.find((s) => s.status === 'final');

  // Pre-requisites Checklist verification
  const checkRosterVerified = activeOffering.isRosterVerified;
  const checkDatesVerified = activeOffering.areDatesVerified;
  const checkAllExercisesReady = activePracticeVersion.exercises.every((e) => e.isReady);
  const checkAllStudentsComplete =
    offeringStudents.length > 0 &&
    offeringStudents.every((st) => studentGrades[st.id]?.isComplete);

  const allChecksPass =
    checkRosterVerified &&
    checkDatesVerified &&
    checkAllExercisesReady &&
    checkAllStudentsComplete;

  const handleFinalize = async () => {
    if (!allChecksPass) return;
    await finalizeGrades(instructorNameInput);

    // Confetti celebration
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleReopen = async () => {
    if (!reopenReason.trim()) return;
    await reopenGrades(reopenReason, instructorNameInput);
    setReopenModalOpen(false);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      {/* Top Banner Status */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border flex items-center gap-1',
                isFinalized
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              )}
            >
              {isFinalized ? (
                <>
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>TERKUNCI / RESMI DISAHKAN</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>DRAF PENILAIAN DALAM PROSES</span>
                </>
              )}
            </span>
          </div>
          <h2 className="text-lg font-black text-white">
            Pengesahan & Snapshot Finalisasi Nilai Pekan {activeOffering.semesterWeek}
          </h2>
          <p className="text-xs text-slate-400">
            Pekan {activeOffering.semesterWeek} ({activeOffering.dateRangeText}) • Kelas {activeOffering.class} • {offeringStudents.length} Mahasiswa
          </p>
        </div>

        {isFinalized ? (
          <button
            onClick={() => setReopenModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/50 border border-amber-400/30 transition-all"
          >
            <Unlock className="w-4 h-4" />
            <span>Buka Revisi Nilai Resmi</span>
          </button>
        ) : (
          <button
            onClick={handleFinalize}
            disabled={!allChecksPass}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all',
              allChecksPass
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 border border-emerald-400/30 ring-2 ring-emerald-500/50'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sahkan & Finalisasi Nilai Sekarang</span>
          </button>
        )}
      </div>

      {/* Finalization Checklist Card */}
      {!isFinalized && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">
                Daftar Periksa Persyaratan Finalisasi Nilai (Audit Compliance)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              PRD Bagian 11 & Kontrak Operasi `finalize_grade`
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Check 1 */}
            <div
              className={cn(
                'p-3.5 rounded-xl border flex items-center justify-between',
                checkRosterVerified
                  ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-200'
                  : 'bg-rose-950/20 border-rose-800/50 text-slate-300'
              )}
            >
              <div className="flex items-center gap-2.5">
                {checkRosterVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>1. Roster 12 Mahasiswa Terverifikasi</span>
              </div>
              <span className="font-bold font-mono text-[10px]">
                {checkRosterVerified ? 'OK' : 'BELUM'}
              </span>
            </div>

            {/* Check 2 */}
            <div
              className={cn(
                'p-3.5 rounded-xl border flex items-center justify-between',
                checkDatesVerified
                  ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-200'
                  : 'bg-rose-950/20 border-rose-800/50 text-slate-300'
              )}
            >
              <div className="flex items-center gap-2.5">
                {checkDatesVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>2. 5 Sesi Tanggal Efektif Terverifikasi</span>
              </div>
              <span className="font-bold font-mono text-[10px]">
                {checkDatesVerified ? 'OK' : 'BELUM'}
              </span>
            </div>

            {/* Check 3 */}
            <div
              className={cn(
                'p-3.5 rounded-xl border flex items-center justify-between',
                checkAllExercisesReady
                  ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-200'
                  : 'bg-rose-950/20 border-rose-800/50 text-slate-300'
              )}
            >
              <div className="flex items-center gap-2.5">
                {checkAllExercisesReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>3. Seluruh 10 Soal Latihan Siap & Ditetapkan</span>
              </div>
              <span className="font-bold font-mono text-[10px]">
                {checkAllExercisesReady ? 'OK' : 'BELUM'}
              </span>
            </div>

            {/* Check 4 */}
            <div
              className={cn(
                'p-3.5 rounded-xl border flex items-center justify-between',
                checkAllStudentsComplete
                  ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-200'
                  : 'bg-rose-950/20 border-rose-800/50 text-slate-300'
              )}
            >
              <div className="flex items-center gap-2.5">
                {checkAllStudentsComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>4. Seluruh Mahasiswa Selesai Dinilai (Latihan/PDF/Soft/Absen)</span>
              </div>
              <span className="font-bold font-mono text-[10px]">
                {checkAllStudentsComplete ? 'OK' : 'BELUM'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Details Card */}
      {isFinalized && activeSnapshot && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-800/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">
                Informasi Arsip Snapshot Nilai Final (Snapshot #1)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-xs font-bold border border-emerald-800">
              IMMUTABLE SNAPSHOT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Instruktur Penandatangan:</div>
              <div className="font-bold text-white text-sm mt-0.5">{activeSnapshot.finalizedBy}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Waktu Finalisasi:</div>
              <div className="font-bold text-indigo-300 text-sm mt-0.5 font-mono">
                {new Date(activeSnapshot.finalizedAt).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Versi Kebijakan Rubrik:</div>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">{activeSnapshot.practiceVersionId}</div>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Revision Modal */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 border-b border-slate-800 pb-3">
              <Unlock className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-white text-sm">
                  Konfirmasi Buka Revisi Nilai Resmi
                </h3>
                <p className="text-xs text-slate-400">
                  Pelaksanaan: <strong className="text-white">{activeOffering.id}</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Membuka revisi akan membuat draf kerja baru dengan mempertahankan jejak audit dan snapshot arsip lama. Alasan pembukaan revisi wajib dicatat untuk audit akademik.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">
                Alasan Pembukaan Revisi (Wajib):
              </label>
              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setReopenModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleReopen}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
              >
                Buka Revisi Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
