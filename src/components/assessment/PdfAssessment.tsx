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
  Columns,
} from 'lucide-react';
import { ScorePillSelector } from '../common/ScorePillSelector';
import { formatScore, cn } from '../../lib/utils';
import { calculatePdfScore } from '../../lib/calcEngine';
import {
  Student,
  PdfSubmissionStatus,
  PdfInspectionStatus,
} from '../../types/assessment';
import { SharePortalModal } from '../portal/SharePortalModal';
import { PdfSplitScreenModal } from './PdfSplitScreenModal';

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

  const [selectedSplitStudent, setSelectedSplitStudent] = useState<Student | null>(null);
  const [uploadModalStudent, setUploadModalStudent] = useState<{ id: string; name: string; nim: string } | null>(null);
  const [simulatedFileName, setSimulatedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState<number>(4400000);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setSelectedSplitStudent(offeringStudents[0] || null)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-950/90 hover:bg-indigo-900 text-indigo-300 text-xs font-bold border border-indigo-700/80 shadow-md transition-all shrink-0"
            title="Buka Mode Split-Screen: Tampilkan Gambar CAD & Panel Penilaian Sekaligus"
          >
            <Columns className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mode Split-Screen Penilaian</span>
          </button>

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
                <th className="py-3.5 px-4 min-w-[140px] text-right">Aksi</th>
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
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {st.nim}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-bold text-white">
                      {st.name}
                    </td>

                    {/* File Artifact and Version */}
                    <td className="py-3 px-4">
                      {activeArtifact ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-indigo-300 font-mono font-medium truncate max-w-[180px]">
                            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate" title={activeArtifact.fileName}>
                              {activeArtifact.fileName}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>v{activeArtifact.version}</span>
                            <span>•</span>
                            <span>{(activeArtifact.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">
                          Belum ada berkas
                        </span>
                      )}
                    </td>

                    {/* Submission Status */}
                    <td className="py-3 px-4 text-center">
                      <select
                        value={rec?.submissionStatus || 'belum_dikumpulkan'}
                        onChange={(e) => {
                          const val = e.target.value as PdfSubmissionStatus;
                          const insp = rec?.inspectionStatus || 'belum_diperiksa';
                          updatePdfStatus(st.id, val, insp);
                        }}
                        className={cn(
                          'w-full text-[11px] font-semibold py-1.5 px-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer',
                          rec?.submissionStatus === 'dikumpulkan'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : rec?.submissionStatus === 'tidak_dikumpulkan'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        )}
                      >
                        <option value="belum_dikumpulkan">Belum Kumpul</option>
                        <option value="dikumpulkan">Dikumpulkan</option>
                        <option value="tidak_dikumpulkan">Tidak Kumpul</option>
                      </select>
                    </td>

                    {/* Inspection Status */}
                    <td className="py-3 px-4 text-center">
                      <select
                        value={rec?.inspectionStatus || 'belum_diperiksa'}
                        onChange={(e) => {
                          const val = e.target.value as PdfInspectionStatus;
                          const sub = rec?.submissionStatus || 'dikumpulkan';
                          updatePdfStatus(st.id, sub, val);
                        }}
                        className={cn(
                          'w-full text-[11px] font-semibold py-1.5 px-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer',
                          rec?.inspectionStatus === 'diterima'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : rec?.inspectionStatus === 'perlu_revisi'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        )}
                      >
                        <option value="belum_diperiksa">Belum Diperiksa</option>
                        <option value="diterima">Diterima</option>
                        <option value="perlu_revisi">Perlu Revisi</option>
                      </select>
                    </td>

                    {/* Criteria Scoring 0-4 */}
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

                    {/* Actions: Upload & Split-Screen Inspection */}
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
                          onClick={() => setSelectedSplitStudent(st)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 hover:text-white text-xs font-bold shadow-sm transition-all"
                          title="Buka Split-Screen: Lihat Gambar CAD & Nilai Sekaligus"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="hidden sm:inline">Periksa</span>
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
              Tekan tombol <strong className="text-indigo-300">Periksa</strong> pada baris mahasiswa untuk membuka tampilan Split-Screen (lihat gambar teknis dan input nilai sekaligus).
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
                    setSelectedFile(file);
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
                  uploadPdfFile(uploadModalStudent.id, simulatedFileName, selectedFileSize, selectedFile || undefined);
                  setUploadModalStudent(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Konfirmasi & Simpan PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split-Screen Inspection & Assessment Modal */}
      {selectedSplitStudent && (
        <PdfSplitScreenModal
          isOpen={Boolean(selectedSplitStudent)}
          onClose={() => setSelectedSplitStudent(null)}
          student={selectedSplitStudent}
          onSelectStudent={(st) => setSelectedSplitStudent(st)}
          allStudents={offeringStudents}
        />
      )}

      {/* Share Portal Modal */}
      <SharePortalModal
        isOpen={isSharePortalOpen}
        onClose={() => setIsSharePortalOpen(false)}
      />
    </div>
  );
};
