import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Layers,
  FileText,
  HeartHandshake,
  CalendarCheck2,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { cn, formatScore, getLetterGrade, GRADE_CONVERSION_TABLE, getAcademicStatus } from '../../lib/utils';

export const RubricRulesView: React.FC = () => {
  const { activePracticeVersion } = useApp();
  const [activeTab, setActiveTab] = useState<'latihan' | 'pdf' | 'softskill' | 'kehadiran' | 'rumus'>('latihan');

  // Test Calculator State for Tab 5
  const [calcLatihan, setCalcLatihan] = useState<number>(85);
  const [calcPdf, setCalcPdf] = useState<number>(80);
  const [calcSoft, setCalcSoft] = useState<number>(90);
  const [calcHadir, setCalcHadir] = useState<number>(100);

  if (!activePracticeVersion) return null;

  // 4 Institutional Pillars Calculation for Interactive Calculator
  const pKualitas = (calcLatihan * 60 + calcHadir * 10) / 70;
  const pKreativitas = calcSoft;
  const pSikap = calcSoft;
  const pLaporan = calcPdf;

  const finalScore =
    pKualitas * 0.7 + pKreativitas * 0.05 + pSikap * 0.1 + pLaporan * 0.15;

  const gradeInfo = getLetterGrade(finalScore);

  const isPassed = finalScore >= (activePracticeVersion.passingThreshold || 75);

  const tabs = [
    { id: 'latihan', label: `1. ReDrawn 2D (${activePracticeVersion.componentWeights.exercises}%)`, icon: Layers },
    { id: 'pdf', label: `2. Layout & Plot (${activePracticeVersion.componentWeights.pdf}%)`, icon: FileText },
    { id: 'softskill', label: `3. Soft Skill (${activePracticeVersion.componentWeights.softskill}%)`, icon: HeartHandshake },
    { id: 'kehadiran', label: `4. Kehadiran (${activePracticeVersion.componentWeights.attendance}%)`, icon: CalendarCheck2 },
    { id: 'rumus', label: '5. Rumus 4 Pilar & Verifikasi', icon: Calculator },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      {/* Top Main Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-400 border border-indigo-700/60 flex items-center justify-center shadow-lg shadow-indigo-950/50 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">
                Panduan Rubrik, Pembobotan & Aturan Penilaian
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-800">
                {activePracticeVersion.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Skala input kriteria 0–4 • Dikonversi otomatis ke skala 0–100 • Ambang Kelulusan Minimal: <strong className="text-indigo-300 font-mono">{activePracticeVersion.passingThreshold}.00</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Total Latihan: <strong className="text-white">{activePracticeVersion.exercises.length} Jobsheet</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-semibold">
            Standar Kurikulum 2026
          </span>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 rounded-2xl px-4 pt-2 gap-2 overflow-x-auto shadow-sm">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
                isActive
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-950/30 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Display */}
      <div className="space-y-6">
        {/* TAB 1: REDRAWN 2D */}
        {activeTab === 'latihan' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Bobot Komponen ReDrawn 2D: {activePracticeVersion.componentWeights.exercises}%
                </h3>
                <p className="text-xs text-slate-400">
                  Total {activePracticeVersion.exercises.length} Latihan Gambar 2D (L01–L10). Setiap latihan dinilai berdasarkan 4 kriteria teknis berikut:
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-indigo-950 text-indigo-300 text-xs font-bold border border-indigo-800 font-mono shrink-0">
                Nilai Latihan = Skor Berbobot × 25
              </div>
            </div>

            <div className="space-y-4">
              {activePracticeVersion.exerciseCriteria.map((crit) => (
                <div key={crit.id} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 text-xs font-mono font-black border border-indigo-800">
                        {crit.code}
                      </span>
                      <span className="font-bold text-white text-sm">{crit.name}</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-3 py-1 rounded-xl border border-indigo-900 font-mono">
                      Bobot: {crit.weight}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    {[4, 3, 2, 1, 0].map((sc) => (
                      <div
                        key={sc}
                        className={cn(
                          'p-3.5 rounded-xl border flex flex-col justify-between space-y-2',
                          sc === 4
                            ? 'bg-emerald-950/30 border-emerald-800/50'
                            : sc === 3
                            ? 'bg-indigo-950/30 border-indigo-800/50'
                            : sc === 2
                            ? 'bg-amber-950/30 border-amber-800/50'
                            : sc === 1
                            ? 'bg-orange-950/30 border-orange-800/50'
                            : 'bg-rose-950/30 border-rose-800/50'
                        )}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className={sc === 4 ? 'text-emerald-300' : sc === 3 ? 'text-indigo-300' : sc === 2 ? 'text-amber-300' : sc === 1 ? 'text-orange-300' : 'text-rose-300'}>
                            Skor {sc}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{(sc / 4) * 100}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {crit.descriptors[sc as 0 | 1 | 2 | 3 | 4]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LAYOUT & PLOT */}
        {activeTab === 'pdf' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Bobot Komponen Layout & Plot (PDF): {activePracticeVersion.componentWeights.pdf}%
                </h3>
                <p className="text-xs text-slate-400">
                  1 Berkas PDF gabungan L01–L10 per mahasiswa (maksimal {activePracticeVersion.maxPdfSizeMb}MB). Syarat lulus: Skor ≥75 dan Status Pemeriksaan "Diterima".
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-indigo-950 text-indigo-300 text-xs font-bold border border-indigo-800 font-mono shrink-0">
                Nilai PDF = Skor Berbobot × 25
              </div>
            </div>

            <div className="space-y-4">
              {activePracticeVersion.pdfCriteria.map((crit) => (
                <div key={crit.id} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 text-xs font-mono font-black border border-indigo-800">
                        {crit.code}
                      </span>
                      <span className="font-bold text-white text-sm">{crit.name}</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-3 py-1 rounded-xl border border-indigo-900 font-mono">
                      Bobot: {crit.weight}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    {[4, 3, 2, 1, 0].map((sc) => (
                      <div
                        key={sc}
                        className={cn(
                          'p-3.5 rounded-xl border flex flex-col justify-between space-y-2',
                          sc === 4
                            ? 'bg-emerald-950/30 border-emerald-800/50'
                            : sc === 3
                            ? 'bg-indigo-950/30 border-indigo-800/50'
                            : sc === 2
                            ? 'bg-amber-950/30 border-amber-800/50'
                            : sc === 1
                            ? 'bg-orange-950/30 border-orange-800/50'
                            : 'bg-rose-950/30 border-rose-800/50'
                        )}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className={sc === 4 ? 'text-emerald-300' : sc === 3 ? 'text-indigo-300' : sc === 2 ? 'text-amber-300' : sc === 1 ? 'text-orange-300' : 'text-rose-300'}>
                            Skor {sc}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{(sc / 4) * 100}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {crit.descriptors[sc as 0 | 1 | 2 | 3 | 4]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SOFT SKILL */}
        {activeTab === 'softskill' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Bobot Komponen Soft Skill: {activePracticeVersion.componentWeights.softskill}%
                </h3>
                <p className="text-xs text-slate-400">
                  Observasi harian (H1–H5). Nilai akhir = Rata-rata dari hari yang dinilai. Minimal {activePracticeVersion.minimumSoftSkillObservations} hari observasi.
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-950 text-amber-300 text-xs font-bold border border-amber-800 font-mono shrink-0">
                Catatan Wajib jika Skor 0 / 1
              </div>
            </div>

            <div className="space-y-4">
              {activePracticeVersion.softSkillCriteria.map((crit) => (
                <div key={crit.id} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 text-xs font-mono font-black border border-amber-800">
                        {crit.code}
                      </span>
                      <span className="font-bold text-white text-sm">{crit.name}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-950 px-3 py-1 rounded-xl border border-amber-900 font-mono">
                      Bobot: {crit.weight}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    {[4, 3, 2, 1, 0].map((sc) => (
                      <div
                        key={sc}
                        className={cn(
                          'p-3.5 rounded-xl border flex flex-col justify-between space-y-2',
                          sc === 4
                            ? 'bg-emerald-950/30 border-emerald-800/50'
                            : sc === 3
                            ? 'bg-indigo-950/30 border-indigo-800/50'
                            : sc === 2
                            ? 'bg-amber-950/30 border-amber-800/50'
                            : sc === 1
                            ? 'bg-orange-950/30 border-orange-800/50'
                            : 'bg-rose-950/30 border-rose-800/50'
                        )}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className={sc === 4 ? 'text-emerald-300' : sc === 3 ? 'text-indigo-300' : sc === 2 ? 'text-amber-300' : sc === 1 ? 'text-orange-300' : 'text-rose-300'}>
                            Skor {sc}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{(sc / 4) * 100}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {crit.descriptors[sc as 0 | 1 | 2 | 3 | 4]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: KEHADIRAN */}
        {activeTab === 'kehadiran' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Kebijakan Kehadiran Praktik: {activePracticeVersion.componentWeights.attendance}%
                </h3>
                <p className="text-xs text-slate-400">
                  Total 5 Hari Sesi Praktik (H1–H5). Menggunakan sistem 2 opsi praktis: Hadir (+20%) atau Tidak Hadir (-20%).
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800 font-mono shrink-0">
                Formula: (Hari Hadir / 5) × 100
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-800/50 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Opsi 1: Hadir (+20% per Sesi)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mahasiswa hadir di laboratorium CAD tepat waktu dan mengikuti sesi pembelajaran praktik hingga selesai. Setiap kehadiran bernilai 20 poin (5 hari = 100 poin penuh).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/90 border border-rose-800/50 space-y-3">
                <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Opsi 2: Tidak Hadir (-20% per Hari)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mahasiswa tidak hadir pada sesi praktik. Skor berkurang 20% secara proporsional. Instruktur dapat mencatat keterangan izin/sakit pada tombol Catatan di baris mahasiswa.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RUMUS 4 PILAR & VERIFIKASI KALKULATOR */}
        {activeTab === 'rumus' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 4 Pillars Institutional Formula Cards */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/40 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">
                  Rumus Standar Institusi: 4 Pilar Mutu Mahasiswa (100%)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-indigo-400 font-bold">
                    <span>1. Kualitas (Teknis + Hadir)</span>
                    <span>70%</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    (Latihan×60 + Hadir×10) / 70
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Penguasaan software CAD 2D & kedisiplinan lab.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                    <span>2. Kreativitas (Soft Skill K3)</span>
                    <span>5%</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Kemandirian Geometri (0–100)
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Penalaran & pemecahan kendala gambar secara mandiri.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-yellow-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-yellow-400 font-bold">
                    <span>3. Sikap (Soft Skill K1, K2, K4)</span>
                    <span>10%</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Disiplin, Tanggung Jawab & Etika
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Sikap kerja, etika komunikasi, dan kerapian ruang praktik.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-cyan-400 font-bold">
                    <span>4. Laporan Kerja (Layout & Plot)</span>
                    <span>15%</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Output PDF L01–L10 (0–100)
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Kerapian berkas, etiket gambar, dan standardisasi layer.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Live Calculation Tester */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                  <span>Simulator & Uji Hitung Nilai Akhir</span>
                </div>
                <span className="text-xs text-slate-400">
                  Ubah slider di bawah untuk menguji kalkulasi rumus
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sliders Input */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-indigo-300">ReDrawn 2D (Skala 0–100):</span>
                      <strong className="font-mono text-white">{calcLatihan}</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={calcLatihan}
                      onChange={(e) => setCalcLatihan(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-cyan-300">Layout & Plot PDF (Skala 0–100):</span>
                      <strong className="font-mono text-white">{calcPdf}</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={calcPdf}
                      onChange={(e) => setCalcPdf(Number(e.target.value))}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-amber-300">Soft Skill (Skala 0–100):</span>
                      <strong className="font-mono text-white">{calcSoft}</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={calcSoft}
                      onChange={(e) => setCalcSoft(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-300">Kehadiran (Skala 0–100):</span>
                      <strong className="font-mono text-white">{calcHadir}%</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={20}
                      value={calcHadir}
                      onChange={(e) => setCalcHadir(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Live Output Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-300">Hasil Konversi 4 Pilar:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500">Kualitas (70%):</span>
                        <div className="font-bold text-indigo-300 text-sm mt-0.5">
                          {formatScore(pKualitas)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500">Kreativitas (5%):</span>
                        <div className="font-bold text-amber-300 text-sm mt-0.5">
                          {formatScore(pKreativitas)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500">Sikap (10%):</span>
                        <div className="font-bold text-yellow-300 text-sm mt-0.5">
                          {formatScore(pSikap)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500">Laporan (15%):</span>
                        <div className="font-bold text-cyan-300 text-sm mt-0.5">
                          {formatScore(pLaporan)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        Nilai Akhir Mahasiswa
                      </div>
                      <div className="text-3xl font-black font-mono text-white">
                        {formatScore(finalScore)}
                      </div>
                    </div>

                    <div className="text-right">
                      {gradeInfo && (
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className="px-2.5 py-0.5 rounded-lg text-lg font-black font-mono border"
                            style={{
                              backgroundColor: `${gradeInfo.color}20`,
                              borderColor: `${gradeInfo.color}60`,
                              color: gradeInfo.color,
                            }}
                          >
                            {gradeInfo.letter}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300">
                            IP: {gradeInfo.gpa.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {(() => {
                        const status = getAcademicStatus(finalScore);
                        return (
                          <div className="mt-1.5 flex items-center justify-end">
                            <span
                              className={cn(
                                'px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block tracking-tight',
                                status.badgeClass
                              )}
                            >
                              {status.badgeLabel} • {status.label}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official 10-Level Grade Conversion Table */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Tabel Standar Indeks Huruf Mutu & Bobot IP</span>
                </div>
                <span className="text-xs text-slate-400">
                  Pedoman Resmi Konversi Nilai Akademik
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-4 text-center">Huruf Mutu</th>
                      <th className="py-2.5 px-4 text-center">Bobot IP</th>
                      <th className="py-2.5 px-4">Rentang Nilai Akhir (0–100)</th>
                      <th className="py-2.5 px-4 text-center">Status Kelulusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {GRADE_CONVERSION_TABLE.map((row) => (
                      <tr key={row.letter} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className="px-2.5 py-0.5 rounded-md text-xs font-black border inline-block min-w-[32px]"
                            style={{
                              backgroundColor: `${row.color}15`,
                              borderColor: `${row.color}60`,
                              color: row.color,
                            }}
                          >
                            {row.letter}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-white text-xs">
                          {row.gpa.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans text-xs">
                          {row.rangeText}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {row.minScore >= 75 ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                              Lulus
                            </span>
                          ) : row.minScore >= 60 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800">
                              Bersyarat
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-800">
                              Remedial
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
