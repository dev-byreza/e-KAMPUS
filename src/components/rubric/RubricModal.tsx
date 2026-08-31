import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, BookOpen, Layers, FileText, HeartHandshake, CalendarCheck2, Calculator } from 'lucide-react';
import { cn } from '../../lib/utils';

export const RubricModal: React.FC = () => {
  const {
    isRubricModalOpen,
    setIsRubricModalOpen,
    rubricModalFocusSection,
    activePracticeVersion,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'latihan' | 'pdf' | 'softskill' | 'kehadiran' | 'rumus'>(
    rubricModalFocusSection === 'pdf'
      ? 'pdf'
      : rubricModalFocusSection === 'softskill'
      ? 'softskill'
      : rubricModalFocusSection === 'attendance'
      ? 'kehadiran'
      : 'latihan'
  );

  if (!isRubricModalOpen || !activePracticeVersion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-700/50">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Panduan Rubrik Penilaian CAD 1.1
              </h2>
              <p className="text-xs text-slate-400">
                Format: <span className="text-indigo-300 font-semibold">{activePracticeVersion.name}</span> • Skala Input 0–4 → Hasil 0–100
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRubricModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'latihan', label: `1. ReDrawn 2D (${activePracticeVersion.componentWeights.exercises}%)`, icon: Layers },
            { id: 'pdf', label: `2. Layout & Plot (${activePracticeVersion.componentWeights.pdf}%)`, icon: FileText },
            { id: 'softskill', label: `3. Soft Skill (${activePracticeVersion.componentWeights.softskill}%)`, icon: HeartHandshake },
            { id: 'kehadiran', label: `4. Kehadiran (${activePracticeVersion.componentWeights.attendance}%)`, icon: CalendarCheck2 },
            { id: 'rumus', label: '5. Rumus & Verifikasi', icon: Calculator },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap',
                  isActive
                    ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {activeTab === 'latihan' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Bobot Komponen Latihan: {activePracticeVersion.componentWeights.exercises}%</h3>
                  <p className="text-xs text-slate-400">Total {activePracticeVersion.exercises.length} Latihan (masing-masing 10% dari teknis). Menggunakan 4 kriteria rubrik dinamis.</p>
                </div>
                <div className="px-3 py-1 rounded bg-indigo-950 text-indigo-300 text-xs font-bold border border-indigo-800">
                  Nilai = Skor Berbobot × 25
                </div>
              </div>

              <div className="space-y-4">
                {activePracticeVersion.exerciseCriteria.map((crit) => (
                  <div key={crit.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 text-xs font-bold font-mono">
                          {crit.code}
                        </span>
                        <span className="font-semibold text-white text-sm">{crit.name}</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-1 rounded border border-indigo-900">
                        Bobot: {crit.weight}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                      {[4, 3, 2, 1, 0].map((sc) => (
                        <div
                          key={sc}
                          className={cn(
                            'p-2.5 rounded-lg border flex flex-col justify-between space-y-1.5',
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
                            <span className="text-[10px] text-slate-500 font-mono">{(sc / 4) * 100}</span>
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

          {activeTab === 'pdf' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Bobot Output PDF: {activePracticeVersion.componentWeights.pdf}%</h3>
                  <p className="text-xs text-slate-400">1 PDF gabungan L01–L10 per peserta (maksimal {activePracticeVersion.maxPdfSizeMb}MB). Syarat lulus: Skor ≥75 dan Status Pemeriksaan "Diterima".</p>
                </div>
                <div className="px-3 py-1 rounded bg-indigo-950 text-indigo-300 text-xs font-bold border border-indigo-800">
                  Nilai = Skor Berbobot × 25
                </div>
              </div>

              <div className="space-y-4">
                {activePracticeVersion.pdfCriteria.map((crit) => (
                  <div key={crit.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 text-xs font-bold font-mono">
                          {crit.code}
                        </span>
                        <span className="font-semibold text-white text-sm">{crit.name}</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-1 rounded border border-indigo-900">
                        Bobot: {crit.weight}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                      {[4, 3, 2, 1, 0].map((sc) => (
                        <div
                          key={sc}
                          className={cn(
                            'p-2.5 rounded-lg border flex flex-col justify-between space-y-1.5',
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
                            <span className="text-[10px] text-slate-500 font-mono">{(sc / 4) * 100}</span>
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

          {activeTab === 'softskill' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Bobot Soft Skill: {activePracticeVersion.componentWeights.softskill}%</h3>
                  <p className="text-xs text-slate-400">Observasi harian (H1–H5). Nilai akhir = Rata-rata dari hari yang dinilai. Minimal {activePracticeVersion.minimumSoftSkillObservations} hari observasi.</p>
                </div>
                <div className="px-3 py-1 rounded bg-indigo-950 text-indigo-300 text-xs font-bold border border-indigo-800">
                  Catatan Wajib jika Skor 0 / 1
                </div>
              </div>

              <div className="space-y-4">
                {activePracticeVersion.softSkillCriteria.map((crit) => (
                  <div key={crit.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 text-xs font-bold font-mono">
                          {crit.code}
                        </span>
                        <span className="font-semibold text-white text-sm">{crit.name}</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-1 rounded border border-indigo-900">
                        Bobot: {crit.weight}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                      {[4, 3, 2, 1, 0].map((sc) => (
                        <div
                          key={sc}
                          className={cn(
                            'p-2.5 rounded-lg border flex flex-col justify-between space-y-1.5',
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
                            <span className="text-[10px] text-slate-500 font-mono">{(sc / 4) * 100}</span>
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

          {activeTab === 'kehadiran' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-white text-sm">Bobot Kehadiran: {activePracticeVersion.componentWeights.attendance}%</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sistem penilaian kehadiran 2 opsi: setiap 1 hari kehadiran bernilai 20%. Setiap 1 hari tidak hadir mengurangi nilai sebesar 20% (Total: 100% untuk 5 hari hadir penuh).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 text-sm">1. Hadir</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-xs font-bold">
                      +20% (Skor 100 / 4)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Mahasiswa hadir di laboratorium komputer tepat waktu dan mengikuti sesi praktik penuh.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-rose-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300 text-sm">2. Tidak Hadir</span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-xs font-bold">
                      -20% (Skor 0)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Mahasiswa tidak hadir pada sesi harian. Alasan ketidakhadiran (Sakit / Izin / Kendala) dapat dicatat pada tombol catatan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rumus' && (
            <div className="space-y-6">
              {/* Institutional 4 Pillars Mapping */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-sm">
                  Struktur 4 Pilar Nilai Resmi Institusi
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Nilai praktik CAD 1.1 dikonversikan secara otomatis ke dalam 4 pilar penilaian standar institusi:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-700/50 space-y-1">
                    <div className="font-bold text-indigo-300">1. Kualitas* (70%)</div>
                    <div className="text-slate-300 text-[11px]">
                      Gabungan Latihan Teknis CAD (bobot 60%) dan Kehadiran 5 Hari (bobot 10%).
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 space-y-1">
                    <div className="font-bold text-amber-300">2. Kreativitas (5%)</div>
                    <div className="text-slate-300 text-[11px]">
                      Aspek Soft Skill K3: Kemandirian, pemecahan masalah & solusi geometri CAD.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-yellow-950/40 border border-yellow-700/50 space-y-1">
                    <div className="font-bold text-yellow-300">3. Sikap (10%)</div>
                    <div className="text-slate-300 text-[11px]">
                      Aspek Soft Skill K1 (Disiplin), K2 (Tanggung Jawab), K4 (Etika Kerja Sama).
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-700/50 space-y-1">
                    <div className="font-bold text-cyan-300">4. Laporan Kerja (15%)</div>
                    <div className="text-slate-300 text-[11px]">
                      Output PDF Gabungan 10 Gambar Latihan dengan etiket & standardisasi.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/50">
                <h3 className="font-bold text-white text-sm mb-2">Contoh Verifikasi Resmi PRD Bagian 10.3</h3>
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-indigo-800/50 text-indigo-300">
                        <th className="py-2">Komponen</th>
                        <th className="py-2">Pilar Institusi</th>
                        <th className="py-2">Skor 0–4</th>
                        <th className="py-2">Hasil 0–100</th>
                        <th className="py-2">Bobot</th>
                        <th className="py-2">Kontribusi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-900/40 text-slate-300">
                      <tr>
                        <td className="py-2 font-sans font-semibold">10 Latihan</td>
                        <td className="py-2 font-sans text-indigo-300">Kualitas</td>
                        <td className="py-2">K1=4, K2=3, K3=3, K4=4 → 3,40</td>
                        <td className="py-2 text-white font-bold">85,00</td>
                        <td className="py-2">60%</td>
                        <td className="py-2 font-bold text-emerald-400">51,00</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-sans font-semibold">Output PDF</td>
                        <td className="py-2 font-sans text-cyan-300">Laporan Kerja</td>
                        <td className="py-2">K1=4, K2=3, K3=4, K4=3 → 3,60</td>
                        <td className="py-2 text-white font-bold">90,00</td>
                        <td className="py-2">15%</td>
                        <td className="py-2 font-bold text-emerald-400">13,50</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-sans font-semibold">Soft Skill K1, K2, K4</td>
                        <td className="py-2 font-sans text-yellow-300">Sikap</td>
                        <td className="py-2">Rata-rata 5 hari</td>
                        <td className="py-2 text-white font-bold">88,00</td>
                        <td className="py-2">10%</td>
                        <td className="py-2 font-bold text-emerald-400">8,80</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-sans font-semibold">Soft Skill K3</td>
                        <td className="py-2 font-sans text-amber-300">Kreativitas</td>
                        <td className="py-2">Rata-rata 5 hari</td>
                        <td className="py-2 text-white font-bold">86,50</td>
                        <td className="py-2">5%</td>
                        <td className="py-2 font-bold text-emerald-400">4,325</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-sans font-semibold">Kehadiran</td>
                        <td className="py-2 font-sans text-indigo-300">Kualitas</td>
                        <td className="py-2">5 hari Hadir (Skor 4)</td>
                        <td className="py-2 text-white font-bold">100,00</td>
                        <td className="py-2">10%</td>
                        <td className="py-2 font-bold text-emerald-400">10,00</td>
                      </tr>
                      <tr className="border-t-2 border-indigo-700/80 bg-indigo-950/60 font-bold text-white">
                        <td className="py-2.5 font-sans" colSpan={2}>NILAI AKHIR RESMI</td>
                        <td className="py-2.5">—</td>
                        <td className="py-2.5 text-indigo-300 text-sm">87,625</td>
                        <td className="py-2.5">100%</td>
                        <td className="py-2.5 text-emerald-300 text-sm">Tampil 87,63 (LULUS)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={() => setIsRubricModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
