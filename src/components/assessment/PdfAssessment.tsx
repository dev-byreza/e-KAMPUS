import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import {
  FileText,
  Upload,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  History,
  MessageSquare,
  FileCheck2,
  Info,
  Share2,
} from 'lucide-react';
import { ScorePillSelector } from '../common/ScorePillSelector';
import { formatScore, cn } from '../../lib/utils';
import { calculatePdfScore } from '../../lib/calcEngine';
import {
  PdfSubmissionStatus,
  PdfInspectionStatus,
} from '../../types/assessment';
import { SharePortalModal } from '../portal/SharePortalModal';

interface PdfAssessmentProps {
  searchQuery: string;
}

export const PdfAssessment: React.FC<PdfAssessmentProps> = ({ searchQuery }) => {
  const { activeOffering, activePracticeVersion, offeringStudents } = useApp();
  const {
    pdfRecords,
    updatePdfScore,
    updatePdfStatus,
    uploadPdfFile,
  } = useAssessmentData();

  const [previewStudent, setPreviewStudent] = useState<{ id: string; name: string; nim: string } | null>(null);
  const [uploadModalStudent, setUploadModalStudent] = useState<{ id: string; name: string; nim: string } | null>(null);
  const [simulatedFileName, setSimulatedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState<number>(4400000);
  const [isSharePortalOpen, setIsSharePortalOpen] = useState(false);

  if (!activePracticeVersion || !activeOffering) return null;

  const criteria = activePracticeVersion.pdfCriteria || [];

  const filteredStudents = offeringStudents.filter((st) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return st.name.toLowerCase().includes(q) || st.nim.includes(q);
  });

  const checkedCount = offeringStudents.filter((st) => {
    const rec = pdfRecords.find((r) => r.studentId === st.id);
    return rec?.inspectionStatus === 'diterima' || rec?.submissionStatus === 'tidak_dikumpulkan';
  }).length;

  return (
    <div className="space-y-4">
      {/* Top Banner Info */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-700/50">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Penilaian Layout & Plot (PDF Final L01–L10)
            </h3>
            <p className="text-xs text-slate-400">
              Bobot Komponen: <strong className="text-indigo-300">{activePracticeVersion.componentWeights.pdf}%</strong> • Batas Berkas: <span className="text-slate-300 font-mono">{activePracticeVersion.maxPdfSizeMb}MB</span> • Syarat Lulus: Skor ≥75 & Pemeriksaan "Diterima"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSharePortalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/50 transition-all shrink-0"
            title="Buka / Bagikan Link & QR Code Pengumpulan Mandiri Mahasiswa"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan Portal Mahasiswa</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 shrink-0">
            Status Diperiksa:{' '}
            <strong className="text-emerald-400 font-bold">{checkedCount}</strong> /{' '}
            {offeringStudents.length} Mahasiswa
          </div>
        </div>
      </div>

      {/* Main Student PDF Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-28">NIM</th>
                <th className="py-3.5 px-4 min-w-[180px]">Nama Mahasiswa</th>
                <th className="py-3.5 px-4 min-w-[160px]">Berkas & Versi</th>
                <th className="py-3.5 px-4 w-32 text-center">Pengumpulan</th>
                <th className="py-3.5 px-4 w-32 text-center">Pemeriksaan</th>
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
                <th className="py-3.5 px-4 min-w-[120px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredStudents.map((st, idx) => {
                const rec = pdfRecords.find((r) => r.studentId === st.id);
                const scores = rec?.scores || {};
                const calc = calculatePdfScore(scores, criteria);
                const isNotSubmitted = rec?.submissionStatus === 'tidak_dikumpulkan';
                const finalPdfScore = isNotSubmitted ? 0 : calc.score;

                const activeArtifact = rec?.artifacts?.find(
                  (a) => a.version === rec.activeArtifactVersion
                );

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
                          <span className="truncate max-w-[180px]">{rec.notes}</span>
                        </div>
                      )}
                    </td>

                    {/* Berkas & Versi */}
                    <td className="py-3 px-4">
                      {activeArtifact ? (
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate max-w-[140px]">
                            <div className="font-semibold text-slate-200 truncate text-[11px]" title={activeArtifact.fileName}>
                              {activeArtifact.fileName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              v{activeArtifact.version} • {(activeArtifact.fileSize / (1024 * 1024)).toFixed(1)}MB
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Belum ada berkas</span>
                      )}
                    </td>

                    {/* Status Pengumpulan Select */}
                    <td className="py-3 px-4 text-center">
                      <select
                        value={rec?.submissionStatus || 'belum_dikumpulkan'}
                        onChange={(e) => {
                          const val = e.target.value as PdfSubmissionStatus;
                          const insp: PdfInspectionStatus =
                            val === 'dikumpulkan'
                              ? 'belum_diperiksa'
                              : val === 'tidak_dikumpulkan'
                              ? 'tidak_ada_berkas'
                              : 'belum_diperiksa';
                          updatePdfStatus(st.id, val, insp);
                        }}
                        className={cn(
                          'text-[11px] font-semibold rounded-lg px-2 py-1 border bg-slate-950 cursor-pointer focus:outline-none focus:ring-1',
                          rec?.submissionStatus === 'dikumpulkan'
                            ? 'text-emerald-300 border-emerald-800/80 focus:ring-emerald-500'
                            : rec?.submissionStatus === 'tidak_dikumpulkan'
                            ? 'text-rose-300 border-rose-800/80 focus:ring-rose-500'
                            : 'text-slate-400 border-slate-800 focus:ring-slate-600'
                        )}
                      >
                        <option value="belum_dikumpulkan">Belum Dikumpulkan</option>
                        <option value="dikumpulkan">Dikumpulkan</option>
                        <option value="tidak_dikumpulkan">Tidak Mengumpulkan</option>
                      </select>
                    </td>

                    {/* Status Pemeriksaan Select */}
                    <td className="py-3 px-4 text-center">
                      <select
                        value={rec?.inspectionStatus || 'belum_diperiksa'}
                        disabled={rec?.submissionStatus !== 'dikumpulkan'}
                        onChange={(e) => {
                          updatePdfStatus(
                            st.id,
                            rec?.submissionStatus || 'dikumpulkan',
                            e.target.value as PdfInspectionStatus
                          );
                        }}
                        className={cn(
                          'text-[11px] font-semibold rounded-lg px-2 py-1 border bg-slate-950 cursor-pointer focus:outline-none focus:ring-1',
                          rec?.inspectionStatus === 'diterima'
                            ? 'text-emerald-300 border-emerald-800/80 focus:ring-emerald-500'
                            : rec?.inspectionStatus === 'perlu_revisi'
                            ? 'text-amber-300 border-amber-800/80 focus:ring-amber-500'
                            : rec?.inspectionStatus === 'tidak_ada_berkas'
                            ? 'text-rose-400 border-rose-900/80'
                            : 'text-slate-400 border-slate-800 focus:ring-slate-600',
                          rec?.submissionStatus !== 'dikumpulkan' && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <option value="belum_diperiksa">Belum Diperiksa</option>
                        <option value="diterima">Diterima (Lulus)</option>
                        <option value="perlu_revisi">Perlu Revisi</option>
                        <option value="tidak_ada_berkas">Tidak Ada Berkas</option>
                      </select>
                    </td>

                    {/* Criteria 0-4 Selectors */}
                    {criteria.map((crit) => (
                      <td key={crit.id} className="py-3 px-2 text-center">
                        <ScorePillSelector
                          value={isNotSubmitted ? 0 : scores[crit.id]}
                          onChange={(score) => {
                            if (isNotSubmitted) return;
                            updatePdfScore(st.id, crit.id, score);
                          }}
                          descriptors={crit.descriptors}
                          criterionName={`PDF-${crit.code}: ${crit.name}`}
                          disabled={isNotSubmitted}
                        />
                      </td>
                    ))}

                    {/* Converted 0-100 Score */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      {finalPdfScore !== null ? (
                        <span
                          className={cn(
                            finalPdfScore >= 75 && rec?.inspectionStatus === 'diterima'
                              ? 'text-emerald-400 font-bold'
                              : finalPdfScore > 0
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          )}
                        >
                          {formatScore(finalPdfScore)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Actions: Upload & Preview */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setUploadModalStudent({ id: st.id, name: st.name, nim: st.nim });
                            setSimulatedFileName(`CAD1.1_1C_${st.nim}_${st.name.replace(/\s+/g, '_')}.pdf`);
                          }}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
                          title="Unggah Berkas PDF Mahasiswa"
                        >
                          <Upload className="w-3.5 h-3.5 text-indigo-400" />
                        </button>

                        <button
                          onClick={() => setPreviewStudent({ id: st.id, name: st.name, nim: st.nim })}
                          className={cn(
                            'p-1.5 rounded-lg border text-xs transition-colors',
                            activeArtifact
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-800 hover:bg-indigo-900'
                              : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
                          )}
                          disabled={!activeArtifact}
                          title={activeArtifact ? 'Pratinjau PDF' : 'Belum ada PDF untuk dipratinjau'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom explanation */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Catatan: Mengganti file PDF akan menaikkan versi (v1 → v2). Skor dinilai ulang terhadap versi aktif.
            </span>
          </div>
          <div className="text-slate-500">Maksimal 20 MB / Berkas PDF</div>
        </div>
      </div>

      {/* Upload PDF Modal Simulation */}
      {uploadModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Upload className="w-5 h-5" />
                <h3 className="font-bold text-white text-sm">Unggah Hasil PDF Mahasiswa</h3>
              </div>
              <button
                onClick={() => setUploadModalStudent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Mahasiswa: <strong className="text-white">{uploadModalStudent.name}</strong> ({uploadModalStudent.nim})
            </div>

            <label className="p-6 rounded-xl border-2 border-dashed border-indigo-500/50 hover:border-indigo-400 bg-slate-950/80 hover:bg-slate-950 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-all">
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSimulatedFileName(file.name);
                    setSelectedFileSize(file.size);
                  }
                }}
              />
              <div className="p-3 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/80">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-300">Pilih Berkas PDF dari Komputer</span>
                <p className="text-[11px] text-slate-400 mt-0.5">atau drag & drop berkas PDF di sini</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Format: .PDF • Maksimal 20 MB</span>
            </label>

            <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400">
                Nama Berkas:
              </div>
              <input
                type="text"
                value={simulatedFileName}
                onChange={(e) => setSimulatedFileName(e.target.value)}
                placeholder="CAD1.1_1C_NIM_Nama.pdf"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-mono text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Ukuran: <strong className="text-slate-200">{(selectedFileSize / (1024 * 1024)).toFixed(2)} MB</strong></span>
                <span className="text-emerald-400 font-medium">✓ Format PDF Valid</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setUploadModalStudent(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  uploadPdfFile(uploadModalStudent.id, simulatedFileName, selectedFileSize);
                  setUploadModalStudent(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Konfirmasi & Simpan PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Inspection / Mock Viewer Drawer */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Pemeriksaan Hasil Plot PDF CAD 1.1
                  </h3>
                  <p className="text-xs text-slate-400">
                    {previewStudent.name} ({previewStudent.nim}) • Kelas 1C
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Simulated Technical Blueprint Sheet Preview */}
              <div className="w-full aspect-[16/10] bg-slate-950 rounded-xl border-2 border-indigo-500/40 p-6 flex flex-col justify-between shadow-inner relative overflow-hidden">
                {/* Technical Drawing CAD Grid Simulation */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                {/* Drawing Sheet Content Mock */}
                <div className="relative z-10 flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider">
                      LEMBAR KERJA PRAKTIK CAD 1.1 (L01–L10)
                    </span>
                    <h4 className="text-base font-black text-slate-100">
                      GABUNGAN PROFIL MEKANIK 2D & DIMENSI
                    </h4>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-400">
                    <div>SKALA 1:1</div>
                    <div>A4 LANDSCAPE</div>
                  </div>
                </div>

                {/* Simulated Geometries */}
                <div className="relative z-10 flex items-center justify-around py-4">
                  <div className="w-28 h-28 border-2 border-indigo-400 rounded-lg flex items-center justify-center text-[10px] font-mono text-indigo-300 bg-indigo-950/40">
                    L01-L04 Part
                  </div>
                  <div className="w-36 h-28 border-2 border-cyan-400 rounded-full flex items-center justify-center text-[10px] font-mono text-cyan-300 bg-cyan-950/40">
                    L05-L07 Cam
                  </div>
                  <div className="w-32 h-24 border-2 border-emerald-400 flex items-center justify-center text-[10px] font-mono text-emerald-300 bg-emerald-950/40">
                    L08 Poros
                  </div>
                </div>

                {/* Title Block / Etiket */}
                <div className="relative z-10 border-2 border-slate-700 bg-slate-900/90 rounded p-2 grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-300">
                  <div>
                    <div className="text-slate-500">DIGAMBAR:</div>
                    <div className="font-bold text-white truncate">{previewStudent.name}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">NIM:</div>
                    <div className="font-bold text-indigo-300">{previewStudent.nim}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">KELAS / TGL:</div>
                    <div className="font-bold">1C / {activeOffering.dateRangeText}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">STATUS PLOT:</div>
                    <div className="font-bold text-emerald-400">VERIFIED CAD</div>
                  </div>
                </div>
              </div>

              {/* Quick Assessment in Drawer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-xs">Penilaian Kriteria PDF Mahasiswa:</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {criteria.map((crit) => {
                    const rec = pdfRecords.find((r) => r.studentId === previewStudent.id);
                    return (
                      <div key={crit.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="text-[11px] font-semibold text-indigo-300 truncate" title={crit.name}>
                          {crit.code}: {crit.name}
                        </div>
                        <ScorePillSelector
                          value={rec?.scores[crit.id]}
                          onChange={(sc) => updatePdfScore(previewStudent.id, crit.id, sc)}
                          descriptors={crit.descriptors}
                          criterionName={crit.name}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
              <div className="text-xs text-slate-400">
                Gunakan dropdown di tabel untuk menandai status <strong className="text-emerald-400">Diterima</strong> setelah kriteria lengkap.
              </div>
              <button
                onClick={() => setPreviewStudent(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Selesai Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Portal Modal */}
      <SharePortalModal
        isOpen={isSharePortalOpen}
        onClose={() => setIsSharePortalOpen(false)}
      />
    </div>
  );
};
