import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Eye,
  ZoomIn,
  ZoomOut,
  Grid,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  FileQuestion,
  ExternalLink,
} from 'lucide-react';
import { Student, PdfInspectionStatus, PdfSubmissionStatus } from '../../types/assessment';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import { useApp } from '../../context/AppContext';
import { calculatePdfScore } from '../../lib/calcEngine';
import { formatScore, getAcademicStatus, cn } from '../../lib/utils';
import { ScorePillSelector } from '../common/ScorePillSelector';
import { db } from '../../lib/db';

interface PdfSplitScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSelectStudent: (student: Student) => void;
  allStudents: Student[];
}

export const PdfSplitScreenModal: React.FC<PdfSplitScreenModalProps> = ({
  isOpen,
  onClose,
  student,
  onSelectStudent,
  allStudents,
}) => {
  const { activeOffering, activePracticeVersion } = useApp();
  const { pdfRecords, updatePdfScore, updatePdfStatus } = useAssessmentData();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [notesInput, setNotesInput] = useState<string>('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const currentStudent = student || allStudents[0];
  const currentIndex = allStudents.findIndex((s) => s.id === currentStudent?.id);

  const rec = pdfRecords.find((r) => r.studentId === currentStudent?.id);
  const scores = rec?.scores || {};
  const criteria = activePracticeVersion?.pdfCriteria || [];
  const calc = calculatePdfScore(scores, criteria);
  const finalPdfScore = calc.score;
  const statusInfo = getAcademicStatus(finalPdfScore);

  const activeArtifact = rec?.artifacts?.find(
    (a) => a.version === rec.activeArtifactVersion
  );

  // Load PDF: prioritize Supabase Storage URL, fallback to IndexedDB blob
  useEffect(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPdfBlobUrl(null);

    if (!activeArtifact?.id) return;

    // Priority 1: Supabase Storage URL (cross-device, cloud)
    if (activeArtifact.fileUrl && activeArtifact.fileUrl !== '#') {
      setPdfBlobUrl(activeArtifact.fileUrl);
      return;
    }

    // Priority 2: IndexedDB blob (local browser only, fallback)
    let revoked = false;
    (async () => {
      try {
        const blobRecord = await db.pdfBlobs.get(activeArtifact.id);
        if (blobRecord?.blob && !revoked) {
          const url = URL.createObjectURL(blobRecord.blob);
          blobUrlRef.current = url;
          setPdfBlobUrl(url);
        }
      } catch {
        // no blob stored
      }
    })();
    return () => { revoked = true; };
  }, [activeArtifact?.id, activeArtifact?.fileUrl]);


  useEffect(() => {
    if (rec?.notes) {
      setNotesInput(rec.notes);
    } else {
      setNotesInput('');
    }
  }, [currentStudent?.id, rec?.notes]);

  if (!isOpen || !currentStudent || !activePracticeVersion) return null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectStudent(allStudents[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < allStudents.length - 1) {
      onSelectStudent(allStudents[currentIndex + 1]);
    }
  };

  const handleInspectionChange = (inspStatus: PdfInspectionStatus) => {
    const subStatus: PdfSubmissionStatus = rec?.submissionStatus || 'dikumpulkan';
    updatePdfStatus(currentStudent.id, subStatus, inspStatus, notesInput);
  };

  const handleNotesBlur = () => {
    const subStatus: PdfSubmissionStatus = rec?.submissionStatus || 'dikumpulkan';
    const inspStatus: PdfInspectionStatus = rec?.inspectionStatus || 'belum_diperiksa';
    updatePdfStatus(currentStudent.id, subStatus, inspStatus, notesInput);
  };

  const handleApplyPresetNote = (preset: string) => {
    const newNotes = notesInput ? `${notesInput}. ${preset}` : preset;
    setNotesInput(newNotes);
    const subStatus: PdfSubmissionStatus = rec?.submissionStatus || 'dikumpulkan';
    const inspStatus: PdfInspectionStatus = rec?.inspectionStatus || 'belum_diperiksa';
    updatePdfStatus(currentStudent.id, subStatus, inspStatus, newNotes);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-[96vw] xl:max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-700/50 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                  <span>Split-Screen Pemeriksaan & Penilaian PDF CAD 1.1</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[10px] font-mono">
                    ISO A4 LANDSCAPE
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Instruktur: <strong className="text-slate-300">Reza Febriadi Rauf, A.Md.T</strong> • Kelas {activeOffering?.class} ({activeOffering?.dateRangeText})
              </p>
            </div>
          </div>

          {/* Student Switcher & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 text-xs">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
                title="Mahasiswa Sebelumnya (Prev)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-2 text-[11px] font-medium text-slate-300 font-mono">
                <span className="font-bold text-white">{currentIndex + 1}</span> / {allStudents.length} Mhs
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === allStudents.length - 1}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
                title="Mahasiswa Selanjutnya (Next)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
              title="Tutup Mode Split Screen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Student Banner */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-md">
              {currentStudent.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>{currentStudent.name}</span>
                <span className="text-xs text-indigo-300 font-mono">({currentStudent.nim})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <span className="text-slate-500">Berkas:</span>
              <span className="font-mono text-indigo-300 font-semibold truncate max-w-[220px]">
                {activeArtifact?.fileName || `CAD1.1_1C_${currentStudent.nim}_${currentStudent.name.replace(/\s+/g, '_')}.pdf`}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono text-[10px]">
                v{rec?.activeArtifactVersion || 1}
              </span>
            </div>
          </div>
        </div>

        {/* Main Body: 2-Column Split Screen */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-0">
          {/* ================= LEFT COLUMN: CAD BLUEPRINT / PDF PREVIEW (7 COLS / ~58%) ================= */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-800 bg-slate-950/90 overflow-hidden">
            {/* PDF Info Bar */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-mono text-indigo-300 font-semibold truncate max-w-[300px]">
                  {activeArtifact?.fileName || `Belum ada berkas PDF`}
                </span>
                {activeArtifact && (
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono text-[10px] shrink-0">
                    v{rec?.activeArtifactVersion}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {pdfBlobUrl ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                    <Eye className="w-3 h-3" /> Preview Aktif
                  </span>
                ) : (
                  <span className="text-slate-500 text-[11px]">Tidak ada preview</span>
                )}
              </div>
            </div>


            {/* Viewport: Real PDF Viewer or Fallback Mock */}
            <div className="flex-1 overflow-auto bg-slate-950 flex flex-col">
              {pdfBlobUrl ? (
                /* ====== REAL PDF FILE VIEWER ====== */
                <div
                  className="flex-1 flex flex-col overflow-hidden relative"
                  style={{ height: '100%' }}
                >
                  {/* Zoom overlay bar */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 rounded-xl px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
                    <button
                      onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono text-indigo-300 font-bold px-1">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(100)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-700 mx-0.5" />
                    <a
                      href={pdfBlobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                      title="Buka PDF di Tab Baru"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <iframe
                    src={`${pdfBlobUrl}#zoom=${zoomLevel}`}
                    className="flex-1 w-full border-0"
                    style={{ height: '100%', minHeight: '400px' }}
                    title={`PDF: ${activeArtifact?.fileName || currentStudent.name}`}
                  />
                </div>
              ) : (
                /* ====== FALLBACK MOCK VIEW (no real file uploaded yet) ====== */
                <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                  <div className="w-full max-w-[680px] aspect-[1.414/1] bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-center select-none">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                      <FileQuestion className="w-10 h-10 text-slate-600" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-slate-400">
                        Belum Ada Berkas PDF yang Diunggah
                      </p>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        Gunakan tombol <strong className="text-indigo-300">Upload (↑)</strong> pada baris mahasiswa ini di tabel penilaian,
                        lalu pilih file PDF nyata dari komputer Anda.
                        Setelah diunggah, file PDF asli akan ditampilkan di sini secara langsung.
                      </p>
                    </div>
                    <div className="font-mono text-[11px] text-slate-600 flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 rounded-lg border border-slate-800">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>CAD1.1_1C_{currentStudent.nim}_{currentStudent.name.replace(/\s+/g, '_')}.pdf</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: INTEGRATED GRADING & ASSESSMENT PANEL (5 COLS / ~42%) ================= */}
          <div className="lg:col-span-5 flex flex-col bg-slate-900/95 overflow-y-auto">
            <div className="p-5 space-y-4 flex-1">
              {/* Score Header Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between shadow-lg">
                <div>
                  <div className="text-[11px] uppercase font-mono text-slate-400 font-bold">
                    Nilai Komponen PDF (15%)
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className={cn(
                      'text-3xl font-black font-mono',
                      finalPdfScore !== null && finalPdfScore >= 75 && rec?.inspectionStatus === 'diterima'
                        ? 'text-emerald-400'
                        : finalPdfScore !== null && finalPdfScore > 0
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    )}>
                      {finalPdfScore !== null ? formatScore(finalPdfScore) : '0,00'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/ 100</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className={cn(
                    'px-3 py-1 rounded-xl text-xs font-bold font-mono border inline-flex items-center gap-1.5',
                    statusInfo.badgeClass
                  )}>
                    <span>{statusInfo.badgeLabel}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Syarat: Nilai ≥ 75 & Status Diterima
                  </div>
                </div>
              </div>

              {/* Status Pemeriksaan Quick Radio Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Keputusan Status Pemeriksaan:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleInspectionChange('diterima')}
                    className={cn(
                      'py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1',
                      rec?.inspectionStatus === 'diterima'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500 ring-1 ring-emerald-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Diterima (Lulus)</span>
                  </button>

                  <button
                    onClick={() => handleInspectionChange('perlu_revisi')}
                    className={cn(
                      'py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1',
                      rec?.inspectionStatus === 'perlu_revisi'
                        ? 'bg-amber-950 text-amber-300 border-amber-500 ring-1 ring-amber-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    )}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Perlu Revisi</span>
                  </button>

                  <button
                    onClick={() => handleInspectionChange('belum_diperiksa')}
                    className={cn(
                      'py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1',
                      !rec?.inspectionStatus || rec.inspectionStatus === 'belum_diperiksa'
                        ? 'bg-slate-800 text-slate-200 border-slate-600 ring-1 ring-slate-500 shadow-md'
                        : 'bg-slate-950 text-slate-500 hover:text-white border-slate-800'
                    )}
                  >
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Belum Diperiksa</span>
                  </button>
                </div>
              </div>

              {/* 4 Rubric Criteria Scoring */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Rubrik Penilaian Layout & Plot (Skala 0–4):</span>
                  <span className="text-[11px] text-indigo-400 font-mono">Bobot 15%</span>
                </div>

                <div className="space-y-2.5">
                  {criteria.map((crit) => {
                    const currentScore = scores[crit.id];
                    return (
                      <div
                        key={crit.id}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800/60 mr-1.5">
                              {crit.code}
                            </span>
                            <span className="text-xs font-bold text-slate-200">
                              {crit.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            Bobot {crit.weight}%
                          </span>
                        </div>

                        {/* Interactive Pill Selector */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <ScorePillSelector
                            value={currentScore}
                            onChange={(sc) => updatePdfScore(currentStudent.id, crit.id, sc)}
                            descriptors={crit.descriptors}
                            criterionName={crit.name}
                          />
                        </div>

                        {/* Descriptor hint text */}
                        <div className="text-[10px] text-slate-400 italic bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/60">
                          {currentScore !== undefined && currentScore !== null
                            ? crit.descriptors[currentScore as 0 | 1 | 2 | 3 | 4] || 'Belum dinilai'
                            : 'Pilih nilai 0–4 sesuai kualitas gambar'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Catatan & Feedback Instruktur */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Catatan Koreksi & Feedback Instruktur:</span>
                </label>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetNote('Etiket dan dimensi standar ISO sangat rapi')}
                    className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-indigo-300 transition-colors"
                  >
                    + Etiket & dimensi rapi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetNote('Skala teks dan etiket belum terdefinisi')}
                    className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-amber-300 transition-colors"
                  >
                    + Perbaiki skala teks
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetNote('Lengkapi lembar gambar L08–L10')}
                    className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-rose-300 transition-colors"
                  >
                    + Lengkapi L08–L10
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Ketik catatan evaluasi spesifik untuk mahasiswa ini..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-800 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                Selesai & Tutup
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === allStudents.length - 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-md transition-all"
              >
                <span>Lanjut Mahasiswa Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
