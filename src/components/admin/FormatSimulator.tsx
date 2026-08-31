import React, { useState } from 'react';
import { PracticeVersion } from '../../types/assessment';
import { ScorePillSelector } from '../common/ScorePillSelector';
import { formatScore, cn } from '../../lib/utils';
import {
  calculateExerciseScore,
  calculatePdfScore,
  calculateDailySoftSkillScore,
} from '../../lib/calcEngine';
import { Play, Sparkles, RefreshCw } from 'lucide-react';

interface FormatSimulatorProps {
  version: PracticeVersion;
}

export const FormatSimulator: React.FC<FormatSimulatorProps> = ({ version }) => {
  // Synthetic students for live simulation
  const [exScores, setExScores] = useState<Record<string, number | null>>({
    [version.exerciseCriteria[0]?.id || 'k1']: 4,
    [version.exerciseCriteria[1]?.id || 'k2']: 3,
    [version.exerciseCriteria[2]?.id || 'k3']: 3,
    [version.exerciseCriteria[3]?.id || 'k4']: 4,
  });

  const [pdfScores, setPdfScores] = useState<Record<string, number | null>>({
    [version.pdfCriteria[0]?.id || 'pk1']: 4,
    [version.pdfCriteria[1]?.id || 'pk2']: 3,
    [version.pdfCriteria[2]?.id || 'pk3']: 4,
    [version.pdfCriteria[3]?.id || 'pk4']: 3,
  });

  const [softScores, setSoftScores] = useState<Record<string, number | null>>({
    [version.softSkillCriteria[0]?.id || 'sk1']: 4,
    [version.softSkillCriteria[1]?.id || 'sk2']: 4,
    [version.softSkillCriteria[2]?.id || 'sk3']: 3,
    [version.softSkillCriteria[3]?.id || 'sk4']: 3,
  });

  const [attDays, setAttDays] = useState<number>(5); // 5 days hadir

  // Quick preset buttons
  const setAllScores = (val: 0 | 4) => {
    const newEx: Record<string, number> = {};
    version.exerciseCriteria.forEach((c) => (newEx[c.id] = val));
    setExScores(newEx);

    const newPdf: Record<string, number> = {};
    version.pdfCriteria.forEach((c) => (newPdf[c.id] = val));
    setPdfScores(newPdf);

    const newSoft: Record<string, number> = {};
    version.softSkillCriteria.forEach((c) => (newSoft[c.id] = val));
    setSoftScores(newSoft);

    setAttDays(val === 4 ? 5 : 0);
  };

  const calcEx = calculateExerciseScore(exScores, version.exerciseCriteria || []);
  const calcPdf = calculatePdfScore(pdfScores, version.pdfCriteria || []);
  const calcSoft = calculateDailySoftSkillScore(softScores, version.softSkillCriteria || []);
  const totalSess = version.attendancePolicy?.sessionsCount || 5;
  const attScore = (attDays / totalSess) * 4 * 25;

  const w = version.componentWeights;
  const isComplete =
    calcEx.score !== null &&
    calcPdf.score !== null &&
    calcSoft.score !== null;

  const finalGrade = isComplete
    ? (calcEx.score || 0) * (w.exercises / 100) +
      (calcPdf.score || 0) * (w.pdf / 100) +
      (calcSoft.score || 0) * (w.softskill / 100) +
      attScore * (w.attendance / 100)
    : null;

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
            <Play className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Simulator Live Format (Mahasiswa Sintetis)
            </h3>
            <p className="text-xs text-slate-400">
              Uji coba skor 0–4 secara langsung untuk memverifikasi nilai 0–100 sebelum diterbitkan.
            </p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAllScores(4)}
            className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-xs font-semibold"
          >
            Simulasi Semua Skor 4 (Nilai 100)
          </button>
          <button
            onClick={() => setAllScores(0)}
            className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 text-xs font-semibold"
          >
            Simulasi Semua Skor 0 (Nilai 0)
          </button>
        </div>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Latihan Component */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs">
            <span className="text-indigo-400">Latihan ({w.exercises}%)</span>
            <span className="font-mono text-white text-sm">
              {formatScore(calcEx.score)}
            </span>
          </div>
          <div className="space-y-2">
            {version.exerciseCriteria.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-[11px]">
                <span className="truncate max-w-[90px] text-slate-400" title={c.name}>
                  {c.code} ({c.weight}%)
                </span>
                <ScorePillSelector
                  value={exScores[c.id]}
                  onChange={(sc) => setExScores({ ...exScores, [c.id]: sc })}
                  descriptors={c.descriptors}
                  criterionName={c.name}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 2. PDF Component */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs">
            <span className="text-cyan-400">PDF ({w.pdf}%)</span>
            <span className="font-mono text-white text-sm">
              {formatScore(calcPdf.score)}
            </span>
          </div>
          <div className="space-y-2">
            {version.pdfCriteria.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-[11px]">
                <span className="truncate max-w-[90px] text-slate-400" title={c.name}>
                  {c.code} ({c.weight}%)
                </span>
                <ScorePillSelector
                  value={pdfScores[c.id]}
                  onChange={(sc) => setPdfScores({ ...pdfScores, [c.id]: sc })}
                  descriptors={c.descriptors}
                  criterionName={c.name}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Soft Skill Component */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs">
            <span className="text-amber-400">Soft Skill ({w.softskill}%)</span>
            <span className="font-mono text-white text-sm">
              {formatScore(calcSoft.score)}
            </span>
          </div>
          <div className="space-y-2">
            {version.softSkillCriteria.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-[11px]">
                <span className="truncate max-w-[90px] text-slate-400" title={c.name}>
                  {c.code} ({c.weight}%)
                </span>
                <ScorePillSelector
                  value={softScores[c.id]}
                  onChange={(sc) => setSoftScores({ ...softScores, [c.id]: sc })}
                  descriptors={c.descriptors}
                  criterionName={c.name}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. Kehadiran Component */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs">
            <span className="text-emerald-400">Kehadiran ({w.attendance}%)</span>
            <span className="font-mono text-white text-sm">
              {formatScore(attScore)}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <label className="text-[11px] text-slate-400">Jumlah Hari Hadir (Skor 4):</label>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setAttDays(d)}
                  className={cn(
                    'w-7 h-7 rounded text-xs font-bold border',
                    attDays === d
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Output Outcome */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-950/60 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400">Hasil Simulasi Nilai Akhir Komposit:</div>
          <div className="text-2xl font-black font-mono text-white mt-0.5">
            {finalGrade !== null ? formatScore(finalGrade) : '—'} / 100
          </div>
        </div>
        <div className="text-right text-xs">
          <span
            className={cn(
              'px-3 py-1 rounded-full font-bold text-xs border',
              finalGrade !== null && finalGrade >= version.passingThreshold
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-rose-950 text-rose-300 border-rose-800'
            )}
          >
            {finalGrade !== null && finalGrade >= version.passingThreshold
              ? 'LULUS MEMENUHI STANDAR'
              : 'TIDAK LULUS / PERLU PERBAIKAN'}
          </span>
        </div>
      </div>
    </div>
  );
};
