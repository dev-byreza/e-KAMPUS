import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Grid,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  Sparkles,
  Check,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Student, PracticeVersion, PdfGradeRecord, PdfInspectionStatus, PdfSubmissionStatus } from '../../types/assessment';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import { useApp } from '../../context/AppContext';
import { calculatePdfScore } from '../../lib/calcEngine';
import { formatScore, getAcademicStatus, cn } from '../../lib/utils';
import { ScorePillSelector } from '../common/ScorePillSelector';

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

  const [activeSheetTab, setActiveSheetTab] = useState<'all' | 'sheet1' | 'sheet2' | 'sheet3'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [notesInput, setNotesInput] = useState<string>('');

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
            {/* Canvas Toolbar */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 text-xs shrink-0">
              {/* Sheet Tabs */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveSheetTab('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                    activeSheetTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  )}
                >
                  Semua L01–L10
                </button>
                <button
                  onClick={() => setActiveSheetTab('sheet1')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                    activeSheetTab === 'sheet1'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  )}
                >
                  L01–L04 (Dasar)
                </button>
                <button
                  onClick={() => setActiveSheetTab('sheet2')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                    activeSheetTab === 'sheet2'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  )}
                >
                  L05–L07 (Cam)
                </button>
                <button
                  onClick={() => setActiveSheetTab('sheet3')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                    activeSheetTab === 'sheet3'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  )}
                >
                  L08–L10 (Poros)
                </button>
              </div>

              {/* Zoom & Grid Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={cn(
                    'p-1.5 rounded-lg border text-xs transition-colors',
                    showGrid
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  )}
                  title="Toggle Grid CAD"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setZoomLevel(Math.max(75, zoomLevel - 25))}
                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <span className="px-2 font-mono text-[11px] text-indigo-300 font-bold">
                  {zoomLevel}%
                </span>

                <button
                  onClick={() => setZoomLevel(Math.min(150, zoomLevel + 25))}
                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Viewport Canvas Drawing Area */}
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-slate-950">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                className="transition-transform duration-150 ease-out w-full max-w-[780px]"
              >
                {/* Simulated ISO A4 Landscape Engineering Drawing Blueprint */}
                <div className="w-full aspect-[1.414/1] bg-slate-950 border-2 border-indigo-500/60 rounded-xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between select-none">
                  {/* Technical CAD Grid Background */}
                  {showGrid && (
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-60 pointer-events-none" />
                  )}

                  {/* Top Sheet Header */}
                  <div className="relative z-10 flex items-center justify-between border-b border-indigo-900/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="font-mono text-xs font-bold text-indigo-300 tracking-wider">
                        e-KAMPUS • PRAKTIK CAD 1.1 (ISO A4 LANDSCAPE)
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 flex items-center gap-3">
                      <span>PROYEKSI EROPA</span>
                      <span>SKALA 1:1</span>
                      <span className="text-emerald-400 font-bold">PLOT OK</span>
                    </div>
                  </div>

                  {/* Center CAD Drawing Schematics View */}
                  <div className="relative z-10 flex-1 flex items-center justify-center my-3">
                    {/* Active Sheet Drawings */}
                    {activeSheetTab === 'all' && (
                      <div className="w-full grid grid-cols-3 gap-3 items-center justify-items-center">
                        {/* Part 1: L01-L04 */}
                        <div className="w-full p-2.5 rounded-lg border border-indigo-500/40 bg-indigo-950/20 text-center space-y-1">
                          <svg className="w-full h-24 mx-auto text-indigo-400" viewBox="0 0 120 70" fill="none" stroke="currentColor">
                            <rect x="10" y="10" width="100" height="50" strokeWidth="2" />
                            <circle cx="60" cy="35" r="14" strokeWidth="1.5" strokeDasharray="3 2" />
                            <line x1="60" y1="5" x2="60" y2="65" strokeWidth="1" strokeDasharray="4 2" stroke="#6366f1" />
                            <line x1="5" y1="35" x2="115" y2="35" strokeWidth="1" strokeDasharray="4 2" stroke="#6366f1" />
                          </svg>
                          <div className="font-mono text-[9px] text-indigo-300 font-bold">L01–L04: Geometri Kontur</div>
                        </div>

                        {/* Part 2: L05-L07 */}
                        <div className="w-full p-2.5 rounded-lg border border-cyan-500/40 bg-cyan-950/20 text-center space-y-1">
                          <svg className="w-full h-24 mx-auto text-cyan-400" viewBox="0 0 120 70" fill="none" stroke="currentColor">
                            <polygon points="60,10 100,55 20,55" strokeWidth="2" />
                            <circle cx="60" cy="40" r="10" strokeWidth="1.5" />
                            <line x1="60" y1="5" x2="60" y2="65" strokeWidth="1" strokeDasharray="4 2" stroke="#06b6d4" />
                          </svg>
                          <div className="font-mono text-[9px] text-cyan-300 font-bold">L05–L07: Cam & Profil Polar</div>
                        </div>

                        {/* Part 3: L08-L10 */}
                        <div className="w-full p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-center space-y-1">
                          <svg className="w-full h-24 mx-auto text-emerald-400" viewBox="0 0 120 70" fill="none" stroke="currentColor">
                            <rect x="15" y="20" width="30" height="30" strokeWidth="2" />
                            <rect x="45" y="15" width="40" height="40" strokeWidth="2" />
                            <rect x="85" y="25" width="25" height="20" strokeWidth="2" />
                            <line x1="5" y1="35" x2="115" y2="35" strokeWidth="1" strokeDasharray="4 2" stroke="#10b981" />
                          </svg>
                          <div className="font-mono text-[9px] text-emerald-300 font-bold">L08–L10: Poros Bertingkat</div>
                        </div>
                      </div>
                    )}

                    {activeSheetTab === 'sheet1' && (
                      <div className="w-full flex items-center justify-center p-4">
                        <svg className="w-full max-w-[420px] h-40 text-indigo-400" viewBox="0 0 200 100" fill="none" stroke="currentColor">
                          <rect x="20" y="15" width="160" height="70" strokeWidth="2.5" />
                          <circle cx="70" cy="50" r="20" strokeWidth="2" />
                          <circle cx="130" cy="50" r="12" strokeWidth="2" />
                          <line x1="20" y1="50" x2="180" y2="50" strokeWidth="1" strokeDasharray="6 3" stroke="#818cf8" />
                          <line x1="70" y1="10" x2="70" y2="90" strokeWidth="1" strokeDasharray="6 3" stroke="#818cf8" />
                          <line x1="130" y1="20" x2="130" y2="80" strokeWidth="1" strokeDasharray="6 3" stroke="#818cf8" />
                          {/* Dimension Annotations */}
                          <line x1="20" y1="92" x2="180" y2="92" strokeWidth="1" stroke="#a5b4fc" />
                          <text x="95" y="97" fill="#a5b4fc" fontSize="7" fontFamily="monospace">160.00 mm</text>
                        </svg>
                      </div>
                    )}

                    {activeSheetTab === 'sheet2' && (
                      <div className="w-full flex items-center justify-center p-4">
                        <svg className="w-full max-w-[420px] h-40 text-cyan-400" viewBox="0 0 200 100" fill="none" stroke="currentColor">
                          <ellipse cx="100" cy="50" rx="60" ry="35" strokeWidth="2.5" />
                          <circle cx="100" cy="50" r="16" strokeWidth="2" />
                          <circle cx="70" cy="50" r="6" strokeWidth="1.5" />
                          <circle cx="130" cy="50" r="6" strokeWidth="1.5" />
                          <line x1="30" y1="50" x2="170" y2="50" strokeWidth="1" strokeDasharray="6 3" stroke="#67e8f9" />
                          <line x1="100" y1="10" x2="100" y2="90" strokeWidth="1" strokeDasharray="6 3" stroke="#67e8f9" />
                        </svg>
                      </div>
                    )}

                    {activeSheetTab === 'sheet3' && (
                      <div className="w-full flex items-center justify-center p-4">
                        <svg className="w-full max-w-[420px] h-40 text-emerald-400" viewBox="0 0 200 100" fill="none" stroke="currentColor">
                          <rect x="20" y="30" width="35" height="40" strokeWidth="2" />
                          <rect x="55" y="20" width="60" height="60" strokeWidth="2" />
                          <rect x="115" y="25" width="45" height="50" strokeWidth="2" />
                          <rect x="160" y="35" width="25" height="30" strokeWidth="2" />
                          <line x1="10" y1="50" x2="190" y2="50" strokeWidth="1" strokeDasharray="6 3" stroke="#6ee7b7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Standard ISO Title Block (Etiket Gambar Teknik) */}
                  <div className="relative z-10 border-2 border-indigo-700/80 bg-slate-900/95 rounded-lg p-2.5 grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-300 shadow-lg">
                    <div className="border-r border-slate-800 pr-2">
                      <div className="text-[9px] text-slate-500 uppercase font-bold">DIGAMBAR OLEH:</div>
                      <div className="font-bold text-white truncate text-[11px]">{currentStudent.name}</div>
                      <div className="text-indigo-300 font-semibold">{currentStudent.nim}</div>
                    </div>
                    <div className="border-r border-slate-800 pr-2">
                      <div className="text-[9px] text-slate-500 uppercase font-bold">JUDUL LEMBAR:</div>
                      <div className="font-bold text-slate-100 truncate">LAYOUT & PLOT L01–L10</div>
                      <div className="text-slate-400">KELAS {currentStudent.class || '1C'} • PEKAN {activeOffering?.semesterWeek}</div>
                    </div>
                    <div className="border-r border-slate-800 pr-2">
                      <div className="text-[9px] text-slate-500 uppercase font-bold">INSTRUKTUR:</div>
                      <div className="font-bold text-indigo-300 truncate">Reza Febriadi Rauf, A.Md.T</div>
                      <div className="text-slate-400">{activeOffering?.dateRangeText}</div>
                    </div>
                    <div className="flex flex-col justify-center items-center text-center pl-1">
                      <div className="text-[9px] text-slate-500 uppercase font-bold">STATUS PLOT:</div>
                      <div className={cn(
                        'font-bold text-[11px] px-2 py-0.5 rounded',
                        rec?.inspectionStatus === 'diterima'
                          ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'
                          : rec?.inspectionStatus === 'perlu_revisi'
                          ? 'text-amber-400 bg-amber-950/80 border border-amber-800'
                          : 'text-slate-400 bg-slate-800 border border-slate-700'
                      )}>
                        {rec?.inspectionStatus === 'diterima' ? '✓ DITERIMA' : rec?.inspectionStatus === 'perlu_revisi' ? '⚠ PERLU REVISI' : '⏳ BELUM DIPERIKSA'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
