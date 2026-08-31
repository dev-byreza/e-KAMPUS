// Strict Calculation Engine for CAD 1.1 based on PRD v1.1 Section 10 & 11

import {
  PracticeVersion,
  ExerciseGradeRecord,
  PdfGradeRecord,
  SoftSkillGradeRecord,
  AttendanceRecord,
  StudentCalculatedGrade,
} from '../types/assessment';

/**
 * Calculates the 0..100 score for a single exercise given criterion scores and criteria definitions.
 * Formula: Skor_berbobot_4 = Σ(score_k × weight_k/100)
 * Nilai_100 = Skor_berbobot_4 × 25
 */
export function calculateExerciseScore(
  scores: Record<string, number | null>,
  criteria: PracticeVersion['exerciseCriteria']
): { score: number | null; isComplete: boolean } {
  if (!criteria || criteria.length === 0) return { score: null, isComplete: false };

  let weightedSum4 = 0;
  let totalWeight = 0;
  let allPresent = true;

  for (const crit of criteria) {
    const s = scores[crit.id];
    totalWeight += crit.weight;
    if (s === null || s === undefined) {
      allPresent = false;
    } else {
      weightedSum4 += s * (crit.weight / 100);
    }
  }

  if (!allPresent || totalWeight === 0) {
    return { score: null, isComplete: false };
  }

  const score100 = weightedSum4 * 25;
  return { score: score100, isComplete: true };
}

/**
 * Calculates the 0..100 score for PDF output.
 */
export function calculatePdfScore(
  scores: Record<string, number | null>,
  criteria: PracticeVersion['pdfCriteria']
): { score: number | null; isComplete: boolean } {
  if (!criteria || criteria.length === 0) return { score: null, isComplete: false };

  let weightedSum4 = 0;
  let allPresent = true;

  for (const crit of criteria) {
    const s = scores[crit.id];
    if (s === null || s === undefined) {
      allPresent = false;
    } else {
      weightedSum4 += s * (crit.weight / 100);
    }
  }

  if (!allPresent) {
    return { score: null, isComplete: false };
  }

  const score100 = weightedSum4 * 25;
  return { score: score100, isComplete: true };
}

/**
 * Calculates daily 0..100 score for a single soft skill session.
 */
export function calculateDailySoftSkillScore(
  scores: Record<string, number | null>,
  criteria: PracticeVersion['softSkillCriteria']
): { score: number | null; isComplete: boolean } {
  if (!criteria || criteria.length === 0) return { score: null, isComplete: false };

  let weightedSum4 = 0;
  let allPresent = true;

  for (const crit of criteria) {
    const s = scores[crit.id];
    if (s === null || s === undefined) {
      allPresent = false;
    } else {
      weightedSum4 += s * (crit.weight / 100);
    }
  }

  if (!allPresent) {
    return { score: null, isComplete: false };
  }

  return { score: weightedSum4 * 25, isComplete: true };
}

/**
 * Master calculation of a student's comprehensive grades, components, and final grade.
 */
export function calculateStudentGrade(
  studentId: string,
  practiceVersion: PracticeVersion,
  exerciseRecords: ExerciseGradeRecord[],
  pdfRecord: PdfGradeRecord | undefined,
  softSkillRecords: SoftSkillGradeRecord[],
  attendanceRecords: AttendanceRecord[]
): StudentCalculatedGrade {
  const incompletionReasons: string[] = [];

  // --- 1. LATIHAN (Technical Component) ---
  const exerciseScores: Record<string, number | null> = {};
  let totalValidExerciseScore = 0;
  let totalValidExerciseWeight = 0;
  let exercisesGradedCount = 0;
  let allExercisesComplete = true;

  for (const ex of practiceVersion.exercises) {
    const record = exerciseRecords.find(
      (r) => r.studentId === studentId && r.exerciseId === ex.id
    );

    if (!record) {
      exerciseScores[ex.id] = null;
      allExercisesComplete = false;
      continue;
    }

    if (record.status === 'tidak_mengumpulkan') {
      exerciseScores[ex.id] = 0;
      totalValidExerciseScore += 0 * (ex.weight / 100);
      totalValidExerciseWeight += ex.weight;
      exercisesGradedCount++;
    } else {
      const calc = calculateExerciseScore(record.scores, practiceVersion.exerciseCriteria);
      exerciseScores[ex.id] = calc.score;
      if (calc.isComplete && calc.score !== null) {
        totalValidExerciseScore += calc.score * (ex.weight / 100);
        totalValidExerciseWeight += ex.weight;
        exercisesGradedCount++;
      } else {
        allExercisesComplete = false;
      }
    }
  }

  if (practiceVersion.exercises.length === 0) {
    allExercisesComplete = false;
  }

  let exerciseAverage: number | null = null;
  if (allExercisesComplete && totalValidExerciseWeight > 0) {
    exerciseAverage = totalValidExerciseScore;
  } else if (totalValidExerciseWeight > 0) {
    // Temporary technical average
    exerciseAverage = totalValidExerciseScore / (totalValidExerciseWeight / 100);
  }

  if (!allExercisesComplete) {
    incompletionReasons.push(
      `Latihan belum lengkap (${exercisesGradedCount}/${practiceVersion.exercises.length} dinilai)`
    );
  }

  // --- 2. OUTPUT PDF ---
  let pdfScore: number | null = null;
  let pdfComplete = false;
  let pdfAccepted = false;

  if (pdfRecord) {
    if (pdfRecord.submissionStatus === 'tidak_dikumpulkan') {
      pdfScore = 0;
      pdfComplete = true;
      pdfAccepted = false;
    } else if (pdfRecord.submissionStatus === 'dikumpulkan') {
      const calc = calculatePdfScore(pdfRecord.scores, practiceVersion.pdfCriteria);
      pdfScore = calc.score;
      pdfComplete = calc.isComplete;
      pdfAccepted = pdfRecord.inspectionStatus === 'diterima';
    }
  }

  if (!pdfComplete) {
    incompletionReasons.push('Output PDF belum selesai dinilai/diperiksa');
  } else if (!pdfAccepted && pdfRecord?.submissionStatus !== 'tidak_dikumpulkan') {
    incompletionReasons.push('Pemeriksaan PDF belum berstatus Diterima');
  }

  // --- 3. SOFT SKILL ---
  const softSkillDailyScores: Record<number, number | null> = {};
  let totalSoftScore = 0;
  let softSkillDaysScored = 0;
  let softSkillDaysUnobserved = 0;

  const totalSessions = practiceVersion.attendancePolicy?.sessionsCount || 5;

  for (let ord = 1; ord <= totalSessions; ord++) {
    const record = softSkillRecords.find(
      (r) => r.studentId === studentId && r.sessionOrdinal === ord
    );

    if (!record || record.status === 'belum_ditinjau') {
      softSkillDailyScores[ord] = null;
    } else if (record.status === 'tidak_teramati') {
      softSkillDailyScores[ord] = null;
      softSkillDaysUnobserved++;
    } else {
      const calc = calculateDailySoftSkillScore(
        record.scores,
        practiceVersion.softSkillCriteria || []
      );
      softSkillDailyScores[ord] = calc.score;
      if (calc.isComplete && calc.score !== null) {
        totalSoftScore += calc.score;
        softSkillDaysScored++;
      }
    }
  }

  let softSkillAverage: number | null = null;
  if (softSkillDaysScored > 0) {
    softSkillAverage = totalSoftScore / softSkillDaysScored;
  }

  const minObservations = practiceVersion.minimumSoftSkillObservations || 1;
  const softSkillComplete =
    softSkillDaysScored >= minObservations &&
    softSkillDaysScored + softSkillDaysUnobserved === totalSessions;

  if (!softSkillComplete) {
    incompletionReasons.push(
      `Soft skill belum lengkap (${softSkillDaysScored + softSkillDaysUnobserved}/${totalSessions} hari ditinjau)`
    );
  }

  // --- 4. KEHADIRAN (Attendance) ---
  // Model 2 Opsi: Hadir (+20%) / Tidak Hadir (0%, berkurang 20% per ketidakhadiran dari total 100%)
  let hadirCount = 0;
  let attendanceDaysRecorded = 0;

  for (let ord = 1; ord <= totalSessions; ord++) {
    const record = attendanceRecords.find(
      (r) => r.studentId === studentId && r.sessionOrdinal === ord
    );

    if (record && record.status) {
      attendanceDaysRecorded++;
      if (record.status === 'hadir') {
        hadirCount++;
      }
    }
  }

  let attendanceScore: number | null = null;
  const attendanceComplete = attendanceDaysRecorded === totalSessions;

  if (attendanceDaysRecorded > 0) {
    // Setiap 1 hari tidak hadir mengurangi 20% (100% / totalSessions)
    attendanceScore = (hadirCount / totalSessions) * 100;
  }

  const attendancePercentage = (hadirCount / totalSessions) * 100;

  if (!attendanceComplete) {
    incompletionReasons.push(
      `Absensi belum lengkap (${attendanceDaysRecorded}/${totalSessions} hari tercatat)`
    );
  }

  // --- 5. EMPAT PILAR INSTITUSI (Kualitas 70%, Kreativitas 5%, Sikap 10%, Laporan Kerja 15%) ---
  // 1) Kualitas (70%): Gabungan Latihan Teknis CAD (60%) dan Kehadiran 5 Hari (10%)
  let kualitas: number | null = null;
  if (exerciseAverage !== null && attendanceScore !== null) {
    kualitas = (exerciseAverage * 60 + attendanceScore * 10) / 70;
  } else if (exerciseAverage !== null) {
    kualitas = exerciseAverage;
  }

  // 2) Kreativitas (5%): Aspek Kemandirian & Solusi CAD (K3)
  // 3) Sikap (10%): Aspek Disiplin, SOP, Ketuntasan & Etika (K1, K2, K4)
  let sumKreativitas = 0;
  let countKreativitas = 0;
  let sumSikap = 0;
  let countSikap = 0;

  for (let ord = 1; ord <= totalSessions; ord++) {
    const record = softSkillRecords.find(
      (r) => r.studentId === studentId && r.sessionOrdinal === ord
    );
    if (record && record.status !== 'tidak_teramati' && record.scores) {
      // Find K3 (Kemandirian / Kreativitas)
      const k3Key = Object.keys(record.scores).find((k) => k.toLowerCase().includes('k3'));
      if (k3Key && record.scores[k3Key] !== null && record.scores[k3Key] !== undefined) {
        sumKreativitas += (record.scores[k3Key]! / 4) * 100;
        countKreativitas++;
      }

      // Find K1, K2, K4 (Sikap, Disiplin, Etika)
      const otherKeys = Object.keys(record.scores).filter(
        (k) => !k.toLowerCase().includes('k3') && record.scores[k] !== null && record.scores[k] !== undefined
      );
      if (otherKeys.length > 0) {
        const daySikapSum = otherKeys.reduce((acc, k) => acc + (record.scores[k]! / 4) * 100, 0);
        sumSikap += daySikapSum / otherKeys.length;
        countSikap++;
      }
    }
  }

  const kreativitas: number | null = countKreativitas > 0 ? sumKreativitas / countKreativitas : softSkillAverage;
  const sikap: number | null = countSikap > 0 ? sumSikap / countSikap : softSkillAverage;

  // 4) Laporan Kerja (15%): Nilai Output PDF Gabungan
  const laporanKerja: number | null = pdfScore;

  // --- 6. NILAI AKHIR (Final Composite Grade) ---
  const isComplete =
    allExercisesComplete &&
    pdfComplete &&
    softSkillComplete &&
    attendanceComplete &&
    exerciseAverage !== null &&
    pdfScore !== null &&
    softSkillAverage !== null &&
    attendanceScore !== null;

  let finalGrade: number | null = null;
  if (isComplete && kualitas !== null && kreativitas !== null && sikap !== null && laporanKerja !== null) {
    finalGrade =
      kualitas * 0.70 +
      kreativitas * 0.05 +
      sikap * 0.10 +
      laporanKerja * 0.15;
  }

  // Passing criteria:
  // 1. isComplete is true
  // 2. finalGrade >= 60.0 (Ambang remedial adalah nilai di bawah 60)
  const isPassed =
    isComplete &&
    finalGrade !== null &&
    finalGrade >= 60.0;

  return {
    studentId,
    pillars: {
      kualitas,
      kreativitas,
      sikap,
      laporanKerja,
    },
    exerciseScores,
    exerciseAverage,
    exercisesComplete: allExercisesComplete,
    exercisesGradedCount,
    pdfScore,
    pdfComplete,
    pdfAccepted,
    softSkillDailyScores,
    softSkillAverage,
    softSkillDaysScored,
    softSkillDaysUnobserved,
    softSkillComplete,
    attendanceScore,
    attendancePercentage,
    attendanceDaysRecorded,
    attendanceComplete,
    finalGrade,
    isComplete,
    isPassed,
    incompletionReasons,
  };
}

/**
 * Formats a number with Indonesian decimal standard (comma) with 2 decimal places.
 * e.g., 87.625 -> "87,63", 100 -> "100,00", null -> "—"
 */
export function formatScore(num: number | null | undefined, placeholder: string = '—'): string {
  if (num === null || num === undefined || isNaN(num)) return placeholder;
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a percentage number.
 */
export function formatPercent(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return `${Math.round(num)}%`;
}

export interface LetterGradeInfo {
  letter: string;
  gpa: number;
  rangeText: string;
  minScore: number;
  maxScore: number;
  color: string;
}

export const GRADE_CONVERSION_TABLE: LetterGradeInfo[] = [
  { letter: 'A', gpa: 4.0, rangeText: 'poin 85 ke atas', minScore: 85, maxScore: 100, color: '#10b981' },
  { letter: 'A-', gpa: 3.7, rangeText: 'poin 80–84', minScore: 80, maxScore: 84.99, color: '#34d399' },
  { letter: 'B+', gpa: 3.3, rangeText: 'poin 75–79', minScore: 75, maxScore: 79.99, color: '#6366f1' },
  { letter: 'B', gpa: 3.0, rangeText: 'poin 70–74', minScore: 70, maxScore: 74.99, color: '#818cf8' },
  { letter: 'B-', gpa: 2.7, rangeText: 'poin 65–69', minScore: 65, maxScore: 69.99, color: '#a5b4fc' },
  { letter: 'C+', gpa: 2.3, rangeText: 'poin 60–64', minScore: 60, maxScore: 64.99, color: '#f59e0b' },
  { letter: 'C', gpa: 2.0, rangeText: 'poin 55–59', minScore: 55, maxScore: 59.99, color: '#fbbf24' },
  { letter: 'C-', gpa: 1.7, rangeText: 'poin 50–54', minScore: 50, maxScore: 54.99, color: '#fde047' },
  { letter: 'D', gpa: 1.0, rangeText: 'poin 40–50', minScore: 40, maxScore: 49.99, color: '#f87171' },
  { letter: 'E', gpa: 0.0, rangeText: 'poin di bawah 40', minScore: 0, maxScore: 39.99, color: '#ef4444' },
];

/**
 * Returns letter grade, GPA, range, and color based on standard score (0–100).
 */
export function getLetterGrade(score: number | null | undefined): LetterGradeInfo | null {
  if (score === null || score === undefined || isNaN(score)) return null;

  if (score >= 85) return GRADE_CONVERSION_TABLE[0]; // A
  if (score >= 80) return GRADE_CONVERSION_TABLE[1]; // A-
  if (score >= 75) return GRADE_CONVERSION_TABLE[2]; // B+
  if (score >= 70) return GRADE_CONVERSION_TABLE[3]; // B
  if (score >= 65) return GRADE_CONVERSION_TABLE[4]; // B-
  if (score >= 60) return GRADE_CONVERSION_TABLE[5]; // C+
  if (score >= 55) return GRADE_CONVERSION_TABLE[6]; // C
  if (score >= 50) return GRADE_CONVERSION_TABLE[7]; // C-
  if (score >= 40) return GRADE_CONVERSION_TABLE[8]; // D
  return GRADE_CONVERSION_TABLE[9]; // E
}

export interface AcademicStatusInfo {
  status: 'pujian' | 'memuaskan' | 'kompeten' | 'standar' | 'remedial' | 'draft';
  label: string;
  badgeLabel: string;
  badgeClass: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  isPassed: boolean;
}

/**
 * Returns dynamic academic status based on official thresholds:
 * - Nilai Tinggi: >= 85 (Lulus Pujian), 80-84 (Lulus Memuaskan)
 * - Nilai Menengah: 70-79 (Kompeten), 60-69 (Lulus Standar)
 * - Nilai Di Bawah 60 (<60): REMEDIAL
 */
export function getAcademicStatus(score: number | null | undefined): AcademicStatusInfo {
  if (score === null || score === undefined || isNaN(score)) {
    return {
      status: 'draft',
      label: 'Belum Lengkap',
      badgeLabel: 'DRAF',
      badgeClass: 'bg-slate-900/90 text-slate-400 border-slate-700/60',
      color: '#94a3b8',
      bgColor: '#0f172a',
      borderColor: '#334155',
      description: 'Penilaian masih dalam proses pengisian',
      isPassed: false,
    };
  }

  // NILAI TINGGI
  if (score >= 85) {
    return {
      status: 'pujian',
      label: 'Lulus Pujian (Sangat Memuaskan)',
      badgeLabel: '★ LULUS PUJIAN',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-900/50',
      color: '#10b981',
      bgColor: '#064e3b',
      borderColor: '#059669',
      description: 'Prestasi istimewa melampaui seluruh indikator kompetensi CAD',
      isPassed: true,
    };
  }

  if (score >= 80) {
    return {
      status: 'memuaskan',
      label: 'Lulus Memuaskan',
      badgeLabel: 'MEMUASKAN',
      badgeClass: 'bg-teal-950 text-teal-300 border-teal-600 shadow-sm shadow-teal-950/40',
      color: '#14b8a6',
      bgColor: '#134e4a',
      borderColor: '#0d9488',
      description: 'Pencapaian sangat baik dengan penguasaan gambar presisi',
      isPassed: true,
    };
  }

  // NILAI MENENGAH
  if (score >= 70) {
    return {
      status: 'kompeten',
      label: 'Lulus Kompeten',
      badgeLabel: 'KOMPETEN',
      badgeClass: 'bg-indigo-950 text-indigo-300 border-indigo-600 shadow-sm shadow-indigo-950/40',
      color: '#6366f1',
      bgColor: '#1e1b4b',
      borderColor: '#4f46e5',
      description: 'Tuntas memenuhi seluruh standar praktik industri',
      isPassed: true,
    };
  }

  if (score >= 60) {
    return {
      status: 'standar',
      label: 'Lulus Standar',
      badgeLabel: 'STANDAR',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-600 shadow-sm shadow-amber-950/40',
      color: '#f59e0b',
      bgColor: '#451a03',
      borderColor: '#d97706',
      description: 'Memenuhi batas minimum kelulusan',
      isPassed: true,
    };
  }

  // REMEDIAL (DI BAWAH 60)
  return {
    status: 'remedial',
    label: 'Perlu Remedial (<60)',
    badgeLabel: 'REMEDIAL',
    badgeClass: 'bg-rose-950 text-rose-300 border-rose-600 shadow-sm shadow-rose-950/50',
    color: '#f43f5e',
    bgColor: '#4c0519',
    borderColor: '#e11d48',
    description: 'Nilai di bawah 60, wajib mengikuti bimbingan perbaikan',
    isPassed: false,
  };
}


