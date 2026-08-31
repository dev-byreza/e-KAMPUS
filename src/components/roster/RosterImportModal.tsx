import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { db } from '../../lib/db';
import { Student, Offering } from '../../types/assessment';
import {
  ParsedRosterRow,
  parseRosterExcel,
  downloadRosterTemplate,
} from '../../lib/rosterExcel';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface RosterImportModalProps {
  onClose: () => void;
}

export const RosterImportModal: React.FC<RosterImportModalProps> = ({ onClose }) => {
  const { offerings, showToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRosterRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const rows = await parseRosterExcel(selectedFile);
      if (rows.length === 0) {
        setErrorMessage('Tidak ada data baris mahasiswa yang ditemukan dalam file.');
      }
      setParsedRows(rows);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membaca file Excel. Pastikan format file sesuai.');
    } finally {
      setIsLoading(false);
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleApplyImport = async () => {
    if (validRows.length === 0) return;

    try {
      // 1. Upsert students to db.students
      const newStudents: Student[] = validRows.map((r) => ({
        id: `std-${r.nim}`,
        nim: r.nim,
        name: r.nama,
        class: r.kelas || '1C',
      }));

      await db.students.bulkPut(newStudents);

      // 2. Group students by pekan_semester and update offerings
      const weekGroups: { [week: number]: string[] } = {};
      validRows.forEach((r) => {
        const w = r.pekanSemester || 5;
        if (!weekGroups[w]) weekGroups[w] = [];
        const stdId = `std-${r.nim}`;
        if (!weekGroups[w].includes(stdId)) {
          weekGroups[w].push(stdId);
        }
      });

      // Update existing offerings or create new offering if needed
      for (const [weekStr, stdIds] of Object.entries(weekGroups)) {
        const weekNum = Number(weekStr);
        const existingOff = offerings.find((o) => o.semesterWeek === weekNum);

        if (existingOff) {
          // Merge unique student IDs
          const mergedIds = Array.from(new Set([...existingOff.studentIds, ...stdIds]));
          await db.offerings.update(existingOff.id, {
            studentIds: mergedIds,
            isRosterVerified: false, // Reset verification flag on roster mutation
          });
        }
      }

      // 3. Log audit event
      await db.auditEvents.add({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Instruktur / Admin',
        action: 'import_roster_excel',
        targetType: 'roster',
        targetId: file?.name || 'Roster Excel',
        details: `Berhasil mengimpor ${validRows.length} data mahasiswa dari file ${file?.name}.`,
      });

      showToast(`Sukses mengimpor ${validRows.length} mahasiswa ke jadwal praktik!`, 'success');
      onClose();
    } catch (err: any) {
      showToast(`Gagal menyimpan data impor: ${err.message}`, 'error');
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Impor Data Peserta & Jadwal dari Excel (.xlsx)
              </h3>
              <p className="text-xs text-slate-400">
                Unggah file Excel berisi daftar mahasiswa dan pembagian pekan praktik CAD 1.1.
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
          {/* Top Info Banner & Download Template Button */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/50 border border-indigo-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                Format Kolom Template Excel Resmi
              </span>
              <p className="text-xs text-slate-300">
                Gunakan template resmi untuk memastikan struktur kolom <code className="font-mono text-amber-300">semester, kelas, kode_praktik, pekan_semester, minggu_kalender, nim, nama</code> terbaca sempurna.
              </p>
            </div>

            <button
              onClick={() => downloadRosterTemplate()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 shadow-lg shadow-indigo-950/50 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div className="relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              id="roster-excel-input"
              className="sr-only"
            />
            <label
              htmlFor="roster-excel-input"
              className={cn(
                'flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center',
                file
                  ? 'border-emerald-500/60 bg-emerald-950/10'
                  : 'border-slate-700 hover:border-indigo-500 bg-slate-950/60 hover:bg-slate-900/60'
              )}
            >
              <Upload className={cn('w-10 h-10 mb-3', file ? 'text-emerald-400' : 'text-slate-500')} />
              <div className="font-bold text-sm text-white">
                {file ? file.name : 'Klik untuk Pilih File Excel (.xlsx) atau Tarik ke Sini'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB • File siap diproses`
                  : 'Mendukung format Microsoft Excel .xlsx'}
              </p>
            </label>
          </div>

          {/* Parsing Errors Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview Table If Rows Exist */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">Pratinjau Data Impor</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-xs font-bold border border-emerald-800">
                    {validRows.length} Baris Valid
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 font-mono text-xs font-bold border border-rose-800">
                      {invalidRows.length} Bermasalah
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">No</th>
                      <th className="py-2.5 px-3 w-28">NIM</th>
                      <th className="py-2.5 px-3">Nama Mahasiswa</th>
                      <th className="py-2.5 px-3 w-24 text-center">Pekan</th>
                      <th className="py-2.5 px-3 w-20 text-center">Kelas</th>
                      <th className="py-2.5 px-3 w-28 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={cn('hover:bg-slate-900/60', !row.isValid && 'bg-rose-950/20')}>
                        <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-indigo-300">{row.nim}</td>
                        <td className="py-2 px-3 font-medium text-white">{row.nama}</td>
                        <td className="py-2 px-3 text-center font-bold text-slate-300">
                          Pekan {row.pekanSemester}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-400">{row.kelas}</td>
                        <td className="py-2 px-3 text-center">
                          {row.isValid ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                              ✓ Valid
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                              {row.validationError || 'Error'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
          >
            Batal
          </button>

          <button
            onClick={handleApplyImport}
            disabled={validRows.length === 0 || isLoading}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all',
              validRows.length > 0 && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            )}
          >
            <span>Terapkan & Simpan ke Jadwal ({validRows.length} Mahasiswa)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
