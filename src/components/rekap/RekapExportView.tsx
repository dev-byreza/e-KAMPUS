import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import {
  FileSpreadsheet,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Info,
} from 'lucide-react';
import { formatScore, formatPercent, cn, getLetterGrade, getAcademicStatus } from '../../lib/utils';
import { exportAssessmentToExcel } from '../../lib/excelExport';

export const RekapExportView: React.FC = () => {
  const { activeOffering, activePracticeVersion, offeringStudents, showToast } = useApp();
  const {
    exerciseRecords,
    pdfRecords,
    softSkillRecords,
    attendanceRecords,
    snapshots,
    studentGrades,
  } = useAssessmentData();

  const [isExporting, setIsExporting] = useState(false);

  if (!activePracticeVersion || !activeOffering) return null;

  const isFinalized = snapshots.some((s) => s.status === 'final');

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportAssessmentToExcel({
        offering: activeOffering,
        practiceVersion: activePracticeVersion,
        students: offeringStudents,
        grades: studentGrades,
        exerciseRecords,
        pdfRecords,
        softSkillRecords,
        attendanceRecords,
        isFinal: isFinalized,
      });
      showToast('File Excel Rekap Nilai 5-Sheet berhasil diunduh!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menghasilkan file Excel.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      {/* Top Banner: Export & Print Triggers */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border',
                isFinalized
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              )}
            >
              {isFinalized ? 'STATUS: RESMI / FINAL' : 'STATUS: DRAF — BELUM DISAHKAN'}
            </span>
          </div>
          <h2 className="text-lg font-black text-white">
            Rekap Lengkap Nilai Praktik CAD 1.1 — Kelas {activeOffering.class}
          </h2>
          <p className="text-xs text-slate-400">
            Pekan {activeOffering.semesterWeek} • {activeOffering.dateRangeText} • Format {activePracticeVersion.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Memproses XLSX...' : 'Unduh XLSX (5 Sheet)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 border border-indigo-400/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF Laporan</span>
          </button>
        </div>
      </div>

      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="hidden print:block mb-6 text-black border-b-2 border-black pb-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold uppercase tracking-wider">
            POLITEKNIK / INSTITUSI PENDIDIKAN VOKASI
          </h1>
          <h2 className="text-base font-bold">
            LEMBAR HASIL PENILAIAN PRAKTIK CAD DASAR 1.1
          </h2>
          <p className="text-xs text-gray-700">
            Semester: {activeOffering.semester} | Kelas: {activeOffering.class} | Pekan {activeOffering.semesterWeek} ({activeOffering.dateRangeText})
          </p>
          <p className="text-[10px] text-gray-600">
            Format Rubrik: {activePracticeVersion.name} | Status: {isFinalized ? 'DISAHKAN' : 'DRAF'}
          </p>
        </div>
      </div>

      {/* Main Unified Grade Matrix Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden print-page">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-2 w-8 text-center">No</th>
                <th className="py-3 px-3 w-24">NIM</th>
                <th className="py-3 px-3 min-w-[150px]">Nama Mahasiswa</th>
                {activePracticeVersion.exercises.map((ex) => (
                  <th key={ex.id} className="py-3 px-1 text-center w-11 font-mono" title={ex.title}>
                    {ex.code}
                  </th>
                ))}
                {/* Institutional 4 Pillars Columns */}
                <th className="py-3 px-2 text-center w-24 bg-indigo-950/60 text-indigo-300 font-bold border-l border-slate-800">
                  Kualitas* (70%)
                </th>
                <th className="py-3 px-2 text-center w-20 bg-amber-950/60 text-amber-300 font-bold">
                  Kreativitas (5%)
                </th>
                <th className="py-3 px-2 text-center w-20 bg-yellow-950/60 text-yellow-300 font-bold">
                  Sikap (10%)
                </th>
                <th className="py-3 px-2 text-center w-24 bg-cyan-950/60 text-cyan-300 font-bold">
                  Laporan Kerja (15%)
                </th>
                <th className="py-3 px-3 text-center w-20 font-bold text-white bg-slate-950 border-l border-slate-800">
                  Nilai Akhir
                </th>
                <th className="py-3 px-2 text-center w-24 font-bold text-indigo-300">
                  Huruf (IP)
                </th>
                <th className="py-3 px-3 text-center w-24">Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {offeringStudents.map((st, idx) => {
                const g = studentGrades[st.id];
                const gradeInfo = getLetterGrade(g?.finalGrade);

                return (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-2 text-center font-mono text-slate-500 font-medium">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-300">
                      {st.nim}
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-100 truncate max-w-[180px]">
                      {st.name}
                    </td>

                    {/* L01..L10 Scores */}
                    {activePracticeVersion.exercises.map((ex) => {
                      const sc = g?.exerciseScores[ex.id];
                      return (
                        <td key={ex.id} className="py-2.5 px-1 text-center font-mono text-[11px]">
                          {sc !== null && sc !== undefined ? (
                            <span className={sc >= 75 ? 'text-slate-200' : 'text-rose-400 font-semibold'}>
                              {Math.round(sc)}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* 4 Official Institutional Pillars */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-300 bg-indigo-950/30 border-l border-slate-800">
                      {formatScore(g?.pillars?.kualitas)}
                    </td>

                    <td className="py-2.5 px-2 text-center font-mono font-bold text-amber-300 bg-amber-950/30">
                      {formatScore(g?.pillars?.kreativitas)}
                    </td>

                    <td className="py-2.5 px-2 text-center font-mono font-bold text-yellow-300 bg-yellow-950/30">
                      {formatScore(g?.pillars?.sikap)}
                    </td>

                    <td className="py-2.5 px-2 text-center font-mono font-bold text-cyan-300 bg-cyan-950/30">
                      {formatScore(g?.pillars?.laporanKerja)}
                    </td>

                    {/* Composite Final Grade /100 */}
                    <td className="py-2.5 px-3 text-center font-mono font-black text-sm bg-slate-950 border-l border-slate-800">
                      {g?.finalGrade !== null ? (
                        <span
                          className={cn(
                            g.isPassed
                              ? 'text-emerald-400 font-bold'
                              : 'text-amber-400 font-bold'
                          )}
                        >
                          {formatScore(g.finalGrade)}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-normal">—</span>
                      )}
                    </td>

                    {/* Letter Grade & GPA */}
                    <td className="py-2.5 px-2 text-center font-mono text-xs">
                      {gradeInfo ? (
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold border inline-block"
                          style={{
                            backgroundColor: `${gradeInfo.color}15`,
                            borderColor: `${gradeInfo.color}60`,
                            color: gradeInfo.color,
                          }}
                        >
                          {gradeInfo.letter} ({gradeInfo.gpa.toFixed(2)})
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3 text-center">
                      {(() => {
                        const status = getAcademicStatus(g?.finalGrade);
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

        {/* Footer info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Ambang Lulus: Nilai Akhir ≥ 75,00 & Pemeriksaan PDF Berstatus Diterima.
            </span>
          </div>
          <div className="font-mono text-slate-500">
            Total {offeringStudents.length} Mahasiswa • 10 Latihan • 1 PDF • 5 Soft • 5 Absensi
          </div>
        </div>
      </div>

      {/* PRINT-ONLY SIGNATURE BLOCK */}
      <div className="hidden print:block mt-12 text-black">
        <div className="flex justify-between items-end px-8 text-xs">
          <div className="space-y-16 text-center">
            <div>Mengetahui, Ketua Jurusan / Unit</div>
            <div className="font-bold border-t border-black pt-1">( .................................................... )</div>
          </div>
          <div className="space-y-16 text-center">
            <div>Makassar, 31 Agustus 2026<br />Instruktur Praktik CAD 1.1</div>
            <div className="font-bold border-t border-black pt-1">
              <strong>{activeOffering.instructorName}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
