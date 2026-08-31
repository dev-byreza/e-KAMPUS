import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import { Student } from '../../types/assessment';
import {
  X,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HeartHandshake,
  CalendarCheck2,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { formatScore, formatPercent, cn, getLetterGrade, getAcademicStatus } from '../../lib/utils';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  const {
    activeOffering,
    activePracticeVersion,
    setView,
    setActiveTab,
    setActiveExerciseId,
  } = useApp();

  const {
    studentGrades,
    exerciseRecords,
    pdfRecords,
    softSkillRecords,
    attendanceRecords,
  } = useAssessmentData();

  if (!activePracticeVersion || !activeOffering) return null;

  const grade = studentGrades[student.id];
  const pdfRec = pdfRecords.find((r) => r.studentId === student.id);

  // Radar data for 4 components
  const radarData = [
    { subject: '10 Latihan (60%)', score: Math.round(grade?.exerciseAverage || 0), fullMark: 100 },
    { subject: 'Output PDF (15%)', score: Math.round(grade?.pdfScore || 0), fullMark: 100 },
    { subject: 'Soft Skill (15%)', score: Math.round(grade?.softSkillAverage || 0), fullMark: 100 },
    { subject: 'Kehadiran (10%)', score: Math.round(grade?.attendanceScore || 0), fullMark: 100 },
  ];

  const handleJumpToGrading = (tab: 'exercises' | 'pdf' | 'softskill' | 'attendance') => {
    setActiveTab(tab);
    setView('penilaian');
    onClose();
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              {student.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{student.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-xs font-bold border border-indigo-700/50">
                  {student.nim}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                  Kelas {student.class}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pekan {activeOffering.semesterWeek} • {activeOffering.dateRangeText} • Roster CAD 1.1
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Final Grade Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950/60 border border-indigo-500/40 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Nilai Akhir Komposit
              </span>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-black font-mono text-white">
                  {grade?.finalGrade !== null ? (
                    <span className={grade.isPassed ? 'text-emerald-400' : 'text-amber-400'}>
                      {formatScore(grade.finalGrade)}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                  <span className="text-xs text-slate-400 font-normal ml-1">/ 100</span>
                </div>

                {(() => {
                  const gradeInfo = getLetterGrade(grade?.finalGrade);
                  if (!gradeInfo) return null;
                  return (
                    <div className="text-right">
                      <span
                        className="px-2.5 py-0.5 rounded-lg font-black font-mono text-sm border inline-block"
                        style={{
                          backgroundColor: `${gradeInfo.color}20`,
                          borderColor: `${gradeInfo.color}60`,
                          color: gradeInfo.color,
                        }}
                      >
                        {gradeInfo.letter}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        IP {gradeInfo.gpa.toFixed(2)}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-1">
                {(() => {
                  const status = getAcademicStatus(grade?.finalGrade);
                  return (
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block tracking-tight',
                        status.badgeClass
                      )}
                    >
                      {status.badgeLabel} • {status.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Incompletion Reasons or Kudos */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 md:col-span-2 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Status Kelengkapan & Rekomendasi
                </span>
                {grade?.incompletionReasons && grade.incompletionReasons.length > 0 ? (
                  <div className="space-y-1 mt-2">
                    {grade.incompletionReasons.map((r, i) => (
                      <div key={i} className="text-xs text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Seluruh komponen lengkap dan memenuhi ambang kelulusan (≥75).</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-900 mt-2">
                <button
                  onClick={() => handleJumpToGrading('exercises')}
                  className="px-3 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 text-xs font-semibold"
                >
                  Buka Latihan
                </button>
                <button
                  onClick={() => handleJumpToGrading('pdf')}
                  className="px-3 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 text-xs font-semibold"
                >
                  Buka PDF
                </button>
                <button
                  onClick={() => handleJumpToGrading('softskill')}
                  className="px-3 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 text-xs font-semibold"
                >
                  Buka Soft Skill
                </button>
              </div>
            </div>
          </div>

          {/* 4 Official Institutional Pillars (Kualitas 70%, Kreativitas 5%, Sikap 10%, Laporan Kerja 15%) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Nilai Konversi 4 Pilar Institusi</span>
              <span className="text-[10px] text-indigo-400 font-mono">Bobot Total: 100%</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Pilar 1: Kualitas */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-1">
                <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                  <span>Kualitas*</span>
                  <span>70%</span>
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {formatScore(grade?.pillars?.kualitas)}
                </div>
                <div className="text-[10px] text-indigo-300/80 truncate">
                  Latihan (60%) + Absensi (10%)
                </div>
              </div>

              {/* Pilar 2: Kreativitas */}
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-1">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span>Kreativitas</span>
                  <span>5%</span>
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {formatScore(grade?.pillars?.kreativitas)}
                </div>
                <div className="text-[10px] text-amber-300/80 truncate">
                  Kemandirian & Solusi CAD
                </div>
              </div>

              {/* Pilar 3: Sikap */}
              <div className="p-3.5 rounded-2xl bg-yellow-950/30 border border-yellow-500/40 space-y-1">
                <div className="flex items-center justify-between text-xs text-yellow-300 font-bold">
                  <span>Sikap</span>
                  <span>10%</span>
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {formatScore(grade?.pillars?.sikap)}
                </div>
                <div className="text-[10px] text-yellow-300/80 truncate">
                  Disiplin, SOP & Etika Kerja
                </div>
              </div>

              {/* Pilar 4: Laporan Kerja */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-1">
                <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                  <span>Laporan Kerja</span>
                  <span>15%</span>
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {formatScore(grade?.pillars?.laporanKerja)}
                </div>
                <div className="text-[10px] text-cyan-300/80 truncate">
                  Output PDF Berkas Gambar
                </div>
              </div>
            </div>
          </div>

          {/* 4 Component Raw Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Latihan */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
                <span>ReDrawn 2D</span>
                <span>60%</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {formatScore(grade?.exerciseAverage)}
              </div>
              <div className="text-[10px] text-slate-400">
                {grade?.exercisesGradedCount} / 10 Dinilai
              </div>
            </div>

            {/* PDF */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
                <span>Layout & Plot</span>
                <span>15%</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {formatScore(grade?.pdfScore)}
              </div>
              <div className="text-[10px] text-slate-400">
                {pdfRec?.inspectionStatus ? pdfRec.inspectionStatus.toUpperCase() : 'BELUM'}
              </div>
            </div>

            {/* Soft Skill */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                <span>Soft Skill</span>
                <span>15%</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {formatScore(grade?.softSkillAverage)}
              </div>
              <div className="text-[10px] text-slate-400">
                {grade?.softSkillDaysScored} / 5 Hari Diamati
              </div>
            </div>

            {/* Kehadiran */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>Kehadiran</span>
                <span>10%</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {formatScore(grade?.attendanceScore)}
              </div>
              <div className="text-[10px] text-slate-400">
                {formatPercent(grade?.attendancePercentage)} Hadir
              </div>
            </div>
          </div>

          {/* Exercise-by-Exercise Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Rincian Nilai 10 Latihan Teknis CAD
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {activePracticeVersion.exercises.map((ex) => {
                const sc = grade?.exerciseScores[ex.id];
                const isPassEx = sc !== null && sc !== undefined && sc >= 75;
                return (
                  <div
                    key={ex.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-300 text-[11px]">
                      <span>{ex.code}</span>
                      <span className={sc !== null && sc !== undefined ? (isPassEx ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-600'}>
                        {formatScore(sc)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-1" title={ex.title}>
                      {ex.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
          <div className="text-xs text-slate-400">
            Tekan tombol untuk menuju baris penilaian mahasiswa ini di lembar kerja.
          </div>
          <button
            onClick={() => handleJumpToGrading('exercises')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
          >
            <span>Buka Lembar Penilaian</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
