import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import { Student } from '../../types/assessment';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HeartHandshake,
  CalendarCheck2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Trophy,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Eye,
  Award,
  Flame,
  ShieldAlert,
  Calendar,
  BarChart3,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import { formatScore, formatPercent, cn, getLetterGrade, GRADE_CONVERSION_TABLE, getAcademicStatus } from '../../lib/utils';
import { StudentDetailModal } from './StudentDetailModal';

export const InstructorDashboard: React.FC = () => {
  const {
    offerings,
    students,
    activeOffering,
    setActiveOfferingId,
    activePracticeVersion,
    offeringStudents,
    setView,
    setActiveTab,
  } = useApp();

  const {
    exerciseRecords,
    pdfRecords,
    studentGrades,
    allExerciseRecords,
    allPdfRecords,
    allStudentGrades,
  } = useAssessmentData();

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | 'p03' | 'p05' | 'p07' | 'top' | 'at_risk'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!activePracticeVersion) return null;

  // Always All-Week Dataset (36 Students across all weeks)
  const isAllWeek = true;
  const targetStudents: Student[] = students;
  const targetGrades = allStudentGrades;
  const targetExerciseRecords = allExerciseRecords;

  // Helper to find student's offering / week
  const getStudentOffering = (studentId: string) => {
    return offerings.find((o) => o.studentIds?.includes(studentId));
  };

  const totalStudents = targetStudents.length;

  // Compute sorted student list by Final Grade (highest to lowest)
  const studentsWithGrades = targetStudents.map((st) => ({
    student: st,
    grade: targetGrades[st.id],
    offering: getStudentOffering(st.id),
  }));

  // Sort descending by score (nulls last)
  const sortedStudents = [...studentsWithGrades].sort((a, b) => {
    const scoreA = a.grade?.finalGrade ?? -1;
    const scoreB = b.grade?.finalGrade ?? -1;
    return scoreB - scoreA;
  });

  // Top Student
  const topStudent = sortedStudents.find((s) => s.grade?.finalGrade !== null && s.grade?.finalGrade !== undefined);

  // Lowest Student (who has recorded grades)
  const validScoredStudents = sortedStudents.filter((s) => s.grade?.finalGrade !== null && s.grade?.finalGrade !== undefined);
  const lowestStudent = validScoredStudents.length > 0 ? validScoredStudents[validScoredStudents.length - 1] : null;

  // Attention condition: score < 60
  const isLowestUnder60 = lowestStudent?.grade?.finalGrade !== null && (lowestStudent?.grade?.finalGrade ?? 100) < 60;

  // At-Risk / Remedial Students (Score < 60)
  const atRiskStudents = sortedStudents.filter(
    (s) => s.grade?.finalGrade !== null && (s.grade?.finalGrade || 0) < 60
  );

  // Top Achievers (Score >= 85)
  const topAchievers = sortedStudents.filter(
    (s) => s.grade?.finalGrade !== null && (s.grade?.finalGrade || 0) >= 85
  );

  // 1. KPI Stats
  const completedGradesCount = Object.values(targetGrades).filter((g) => g.isComplete).length;
  const passedCount = Object.values(targetGrades).filter((g) => g.isPassed).length;

  const validFinalGrades = Object.values(targetGrades)
    .map((g) => g.finalGrade)
    .filter((g): g is number => g !== null && g !== undefined);

  const classAvg =
    validFinalGrades.length > 0
      ? validFinalGrades.reduce((a, b) => a + b, 0) / validFinalGrades.length
      : null;

  // Score distribution brackets based on official 10-level institutional scale
  const gradeBrackets = GRADE_CONVERSION_TABLE.map((item) => ({
    name: item.letter,
    fullName: `${item.letter} (IP ${item.gpa.toFixed(2)}) • ${item.rangeText}`,
    count: 0,
    color: item.color,
    gpa: item.gpa,
  }));

  validFinalGrades.forEach((score) => {
    const info = getLetterGrade(score);
    if (info) {
      const idx = gradeBrackets.findIndex((b) => b.name === info.letter);
      if (idx !== -1) gradeBrackets[idx].count++;
    }
  });

  // Cross-Week Comparison Data (Pekan 3 vs Pekan 5 vs Pekan 7)
  const weekComparisonData = offerings.map((off) => {
    const offStudents = (off.studentIds || [])
      .map((sId) => students.find((s) => s.id === sId))
      .filter((s): s is Student => s !== undefined);

    const offFinalGrades = offStudents
      .map((st) => allStudentGrades[st.id]?.finalGrade)
      .filter((g): g is number => g !== null && g !== undefined);

    const offAvg =
      offFinalGrades.length > 0
        ? offFinalGrades.reduce((a, b) => a + b, 0) / offFinalGrades.length
        : 0;

    const offPassed = offStudents.filter((st) => allStudentGrades[st.id]?.isPassed).length;

    return {
      id: off.id,
      weekName: `Pekan ${off.semesterWeek}`,
      dateRange: off.dateRangeText,
      avg: Math.round(offAvg * 100) / 100,
      totalStudents: offStudents.length,
      passed: offPassed,
      passRate: Math.round((offPassed / (offStudents.length || 1)) * 100),
    };
  });

  // Exercise completion breakdown (L01..L10)
  const exerciseChartData = activePracticeVersion.exercises.map((ex) => {
    const graded = targetStudents.filter((st) => {
      const rec = targetExerciseRecords.find(
        (r) => r.studentId === st.id && r.exerciseId === ex.id
      );
      return rec?.status === 'dinilai' || rec?.status === 'tidak_mengumpulkan';
    }).length;

    return {
      code: ex.code,
      title: ex.title,
      graded,
      total: totalStudents,
      percent: Math.round((graded / (totalStudents || 1)) * 100),
    };
  });

  // Filtered leaderboard rows
  const filteredLeaderboard = sortedStudents.filter((item) => {
    const { student, grade, offering } = item;
    const matchSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nim.includes(searchTerm);

    if (!matchSearch) return false;

    if (leaderboardFilter === 'p03') return offering?.semesterWeek === 3;
    if (leaderboardFilter === 'p05') return offering?.semesterWeek === 5;
    if (leaderboardFilter === 'p07') return offering?.semesterWeek === 7;
    if (leaderboardFilter === 'top') return (grade?.finalGrade || 0) >= 85;
    if (leaderboardFilter === 'at_risk') return (grade?.finalGrade || 0) < 60;
    return true;
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      {/* Top Header Banner with All-Week Scope Selector */}
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-xs font-bold font-mono">
                ALL-WEEK EXECUTIVE KPI DASHBOARD
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Gabungan Seluruh Pekan (Pekan 3, 5, 7) • Total {students.length} Mahasiswa
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Dashboard Pemantauan & Tracking Kinerja Seluruh Pekan
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Komparasi antar kelompok pekan, peringkat nilai tertinggi global, dan deteksi mahasiswa perlu perhatian (at-risk).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('exercises');
                setView('penilaian');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 transition-all shrink-0"
            >
              <span>Buka Lembar Penilaian</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 HIGHLIGHT TRACKING KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Nilai Tertinggi */}
        <div
          onClick={() => topStudent && setSelectedStudentForDetail(topStudent.student)}
          className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-700/50 shadow-xl space-y-3 cursor-pointer hover:border-emerald-500 transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Nilai Tertinggi {isAllWeek ? 'Global' : ''}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-800">
              RANK #1
            </span>
          </div>

          {topStudent ? (
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black font-mono text-emerald-300">
                  {formatScore(topStudent.grade?.finalGrade)}
                </span>
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <div className="mt-1">
                <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                  {topStudent.student.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                  <span>NIM {topStudent.student.nim}</span>
                  {topStudent.offering && (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[9px] font-bold">
                      Pekan {topStudent.offering.semesterWeek}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-2">Belum ada data nilai</div>
          )}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Klik untuk inspeksi profil</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Nilai Terendah */}
        <div
          onClick={() => lowestStudent && setSelectedStudentForDetail(lowestStudent.student)}
          className={cn(
            'p-5 rounded-3xl border shadow-xl space-y-3 cursor-pointer transition-all group relative overflow-hidden',
            isLowestUnder60
              ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border-rose-800/50 hover:border-rose-600'
              : 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border-slate-800 hover:border-indigo-600'
          )}
        >
          <div className="flex items-center justify-between">
            <span className={cn(
              'text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5',
              isLowestUnder60 ? 'text-rose-400' : 'text-indigo-300'
            )}>
              <AlertOctagon className={cn('w-4 h-4', isLowestUnder60 ? 'text-rose-400' : 'text-indigo-400')} />
              Nilai Terendah {isAllWeek ? 'Global' : ''}
            </span>
            <span className={cn(
              'px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border',
              isLowestUnder60
                ? 'bg-rose-950 text-rose-300 border-rose-800'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            )}>
              {isLowestUnder60 ? 'PERLU ATENSI (<60)' : 'AMAN (≥60)'}
            </span>
          </div>

          {lowestStudent ? (
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={cn(
                  'text-3xl font-black font-mono',
                  isLowestUnder60 ? 'text-rose-400' : 'text-white'
                )}>
                  {formatScore(lowestStudent.grade?.finalGrade)}
                </span>
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <div className="mt-1">
                <div className={cn(
                  'text-sm font-bold transition-colors truncate',
                  isLowestUnder60 ? 'text-white group-hover:text-rose-300' : 'text-white group-hover:text-indigo-300'
                )}>
                  {lowestStudent.student.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                  <span>NIM {lowestStudent.student.nim}</span>
                  {lowestStudent.offering && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[9px] font-bold">
                      Pekan {lowestStudent.offering.semesterWeek}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-2">Belum ada data nilai</div>
          )}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{isLowestUnder60 ? 'Lihat kendala & remedial' : 'Seluruh nilai memenuhi batas aman'}</span>
            <ArrowDownRight className={cn(
              'w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform',
              isLowestUnder60 ? 'text-rose-400' : 'text-indigo-400'
            )} />
          </div>
        </div>

        {/* Card 3: Rata-Rata */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Rata-Rata {isAllWeek ? 'Seluruh Pekan' : 'Kelas'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-800">
              AMBANG: 75
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-white">
                {formatScore(classAvg)}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Dari {validFinalGrades.length} / {totalStudents} mahasiswa terisi
            </div>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (classAvg || 0))}%` }}
            />
          </div>
        </div>

        {/* Card 4: Tingkat Kelulusan */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Kelulusan {isAllWeek ? 'Global' : ''}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-mono text-[10px] font-bold border border-amber-800">
              {passedCount}/{totalStudents} LULUS
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-amber-300">
                {formatPercent((passedCount / (totalStudents || 1)) * 100)}
              </span>
              <span className="text-xs text-slate-400 font-normal">Tingkat Lulus</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {atRiskStudents.length > 0 ? (
                <span className="text-rose-400 font-semibold">{atRiskStudents.length} Mahasiswa perlu tindak lanjut</span>
              ) : (
                <span className="text-emerald-400 font-semibold">100% Memenuhi Standar</span>
              )}
            </div>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(passedCount / (totalStudents || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* CHARTS SECTION (CROSS-WEEK COMPARISON & DISTRIBUTIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Score Brackets Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">
                Distribusi Nilai Mutu {isAllWeek ? '(36 Mahasiswa)' : ''}
              </h3>
              <p className="text-xs text-slate-400">Sebaran nilai berdasarkan rentang huruf mutu</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeBrackets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} Mahasiswa`, 'Jumlah']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {gradeBrackets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cross-Week Comparison Chart (When All-Week is active) OR Exercise Chart */}
        {isAllWeek ? (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Komparasi Rata-Rata Antar Pekan
                </h3>
                <p className="text-xs text-slate-400">Perbandingan capaian Pekan 3 vs 5 vs 7</p>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-800 font-mono">
                3 Kelompok
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="weekName" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} / 100`, 'Rata-Rata']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]} fill="#6366f1">
                    {weekComparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-week-${index}`}
                        fill={entry.avg >= 85 ? '#10b981' : entry.avg >= 75 ? '#6366f1' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Ketuntasan Komponen Penilaian</h3>
                <p className="text-xs text-slate-400">Status 4 Pilar Institusi</p>
              </div>
            </div>
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold">Kualitas (70%)</span>
                <span className="text-indigo-400 font-mono font-bold">ReDrawn 2D + Hadir</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold">Kreativitas (5%)</span>
                <span className="text-amber-400 font-mono font-bold">Soft Skill K3</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold">Sikap (10%)</span>
                <span className="text-yellow-400 font-mono font-bold">Soft Skill K1, K2, K4</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold">Laporan Kerja (15%)</span>
                <span className="text-cyan-400 font-mono font-bold">Layout & Plot PDF</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart 3: ReDrawn 2D Completion Bar Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">
                Progres Jobsheet L01–L10
              </h3>
              <p className="text-xs text-slate-400">
                Dinilai dari total {totalStudents} peserta
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-800 font-mono">
              ReDrawn 2D
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exerciseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, totalStudents]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} / ${totalStudents} Selesai`, 'Progres']}
                  labelFormatter={(label) => `Latihan ${label}`}
                />
                <Bar dataKey="graded" radius={[6, 6, 0, 0]}>
                  {exerciseChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.graded === totalStudents ? '#10b981' : entry.graded > 0 ? '#6366f1' : '#475569'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE LEADERBOARD & CROSS-WEEK TRACKING TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold border border-indigo-800 shadow-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Leaderboard & Peringkat Nilai Seluruh Mahasiswa (36 Mahasiswa)
              </h3>
              <p className="text-xs text-slate-400">
                Peringkat terintegrasi 4 Pilar Institusi: Kualitas (70%), Kreativitas (5%), Sikap (10%), Laporan Kerja (15%)
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Nama / NIM..."
                className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40 sm:w-48"
              />
            </div>

            {isAllWeek && (
              <>
                <button
                  onClick={() => setLeaderboardFilter('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                    leaderboardFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  )}
                >
                  Semua ({sortedStudents.length})
                </button>

                <button
                  onClick={() => setLeaderboardFilter('p03')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                    leaderboardFilter === 'p03'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  )}
                >
                  Pekan 3
                </button>

                <button
                  onClick={() => setLeaderboardFilter('p05')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                    leaderboardFilter === 'p05'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  )}
                >
                  Pekan 5
                </button>

                <button
                  onClick={() => setLeaderboardFilter('p07')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                    leaderboardFilter === 'p07'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  )}
                >
                  Pekan 7
                </button>
              </>
            )}

            <button
              onClick={() => setLeaderboardFilter('top')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                leaderboardFilter === 'top'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              )}
            >
              Top A (≥85)
            </button>

            <button
              onClick={() => setLeaderboardFilter('at_risk')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                leaderboardFilter === 'at_risk'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              )}
            >
              Atensi (&lt;60)
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">Rank</th>
                <th className="py-3 px-3">Mahasiswa & NIM</th>
                {isAllWeek && <th className="py-3 px-3">Kelompok Pekan</th>}
                <th className="py-3 px-3 text-center" title="ReDrawn 2D + Kehadiran">Kualitas (70%)</th>
                <th className="py-3 px-3 text-center" title="Soft Skill K3">Kreativitas (5%)</th>
                <th className="py-3 px-3 text-center" title="Soft Skill K1, K2, K4">Sikap (10%)</th>
                <th className="py-3 px-3 text-center" title="Layout & Plot PDF">Laporan (15%)</th>
                <th className="py-3 px-3 text-center">Nilai Akhir</th>
                <th className="py-3 px-3 text-center">Predikat</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeaderboard.map((item, idx) => {
                const { student, grade, offering } = item;
                const score = grade?.finalGrade ?? null;
                const gradeInfo = getLetterGrade(score);
                const academicStatus = getAcademicStatus(score);

                return (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudentForDetail(student)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black',
                          idx === 0
                            ? 'bg-amber-500 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'text-slate-400'
                        )}
                      >
                        {idx + 1}
                      </span>
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        NIM {student.nim} • Kelas {student.class}
                      </div>
                    </td>

                    {/* Week Badge */}
                    {isAllWeek && (
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800 font-mono text-[10px] font-semibold">
                          Pekan {offering?.semesterWeek || '-'}
                        </span>
                      </td>
                    )}

                    {/* Kualitas (70%) */}
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {formatScore(grade?.pillars?.kualitas)}
                    </td>

                    {/* Kreativitas (5%) */}
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {formatScore(grade?.pillars?.kreativitas)}
                    </td>

                    {/* Sikap (10%) */}
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {formatScore(grade?.pillars?.sikap)}
                    </td>

                    {/* Laporan (15%) */}
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {formatScore(grade?.pillars?.laporanKerja)}
                    </td>

                    {/* Final Grade */}
                    <td className="py-3 px-3 text-center font-mono font-black text-sm text-indigo-300">
                      {formatScore(score)}
                    </td>

                    {/* Letter Grade & GPA */}
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {gradeInfo ? (
                        <div className="inline-flex flex-col items-center">
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-bold border"
                            style={{
                              backgroundColor: `${gradeInfo.color}15`,
                              borderColor: `${gradeInfo.color}60`,
                              color: gradeInfo.color,
                            }}
                          >
                            {gradeInfo.letter}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                            IP {gradeInfo.gpa.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block tracking-tight',
                          academicStatus.badgeClass
                        )}
                        title={academicStatus.description}
                      >
                        {academicStatus.badgeLabel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentForDetail(student);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-bold transition-all"
                      >
                        Inspeksi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Drill-down Performance Modal */}
      {selectedStudentForDetail && (
        <StudentDetailModal
          student={selectedStudentForDetail}
          onClose={() => setSelectedStudentForDetail(null)}
        />
      )}
    </div>
  );
};
