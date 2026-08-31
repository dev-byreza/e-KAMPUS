import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Search,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  HelpCircle,
  FileCheck2,
  Calendar,
  Check,
  DownloadCloud,
} from 'lucide-react';
import { cn, formatScore } from '../../lib/utils';
import { Student } from '../../types/assessment';

export const StudentSubmissionPortal: React.FC = () => {
  const {
    offerings,
    students,
    activeOffering,
    setActiveOfferingId,
    activePracticeVersion,
    setView,
    showToast,
  } = useApp();

  const { pdfRecords, uploadPdfFile } = useAssessmentData();

  // Step 1: Selected Offering & Student
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(
    activeOffering?.id || offerings[0]?.id || 'CAD11-2026G-1C-P03'
  );
  const [searchNim, setSearchNim] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Step 2: Upload File State
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    ticketId: string;
    studentName: string;
    nim: string;
    fileName: string;
    fileSize: number;
    version: number;
    timestamp: string;
  } | null>(null);

  // Students in selected offering
  const currentOffering =
    offerings.find((o) => o.id === selectedOfferingId) || offerings[0];
  const enrolledStudents = (currentOffering?.studentIds || [])
    .map((sId) => students.find((s) => s.id === sId))
    .filter((s): s is Student => s !== undefined);

  // Filtered by NIM/Name
  const filteredStudents = enrolledStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchNim.toLowerCase()) ||
      s.nim.includes(searchNim)
  );

  // Current PDF Record of selected student
  const currentPdfRecord = selectedStudent
    ? pdfRecords.find((r) => r.studentId === selectedStudent.id)
    : null;

  // Class submission count
  const submittedCount = enrolledStudents.filter((st) => {
    const rec = pdfRecords.find((r) => r.studentId === st.id);
    return (rec?.artifacts?.length || 0) > 0;
  }).length;

  const handleSelectStudent = (st: Student) => {
    setSelectedStudent(st);
    setFile(null);
    setSubmittedReceipt(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        showToast('Hanya berkas format .PDF yang diperbolehkan!', 'error');
        return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) {
        showToast('Ukuran berkas melebihi batas 20 MB!', 'error');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !file) return;

    setIsSubmitting(true);
    try {
      const standardName = `CAD1.1_1C_${selectedStudent.nim}_${selectedStudent.name.replace(/\s+/g, '_')}.pdf`;
      const currentVer = currentPdfRecord?.activeArtifactVersion || 0;
      const nextVer = currentVer + 1;

      await uploadPdfFile(selectedStudent.id, standardName, file.size);

      // Generate Ticket Receipt
      const receipt = {
        ticketId: `CAD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        studentName: selectedStudent.name,
        nim: selectedStudent.nim,
        fileName: standardName,
        fileSize: file.size,
        version: nextVer,
        timestamp: new Date().toLocaleString('id-ID', {
          dateStyle: 'full',
          timeStyle: 'medium',
        }),
      };

      setSubmittedReceipt(receipt);
      showToast('Berkas gambar PDF berhasil dikumpulkan!', 'success');
    } catch (err) {
      showToast('Terjadi kendala saat mengunggah berkas.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col justify-start space-y-6">
      {/* Top Header Navbar Banner */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30 shrink-0">
            CAD
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                Portal Pengumpulan Mandiri Mahasiswa
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-800">
                CAD 1.1 • Kelas 1C
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pengumpulan Berkas Hasil Plot PDF Jobsheet L01–L10 • Format Standar & Verifikasi Otomatis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Progres Pengumpulan:</span>
            <strong className="text-emerald-400 font-bold">{submittedCount}</strong>
            <span className="text-slate-500">/ {enrolledStudents.length} Peserta</span>
          </div>

          <button
            onClick={() => {
              window.location.hash = '';
              setView('penilaian');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembali ke Mode Instruktur</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {submittedReceipt ? (
        /* Receipt View after submission */
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/60">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 font-mono text-xs font-bold border border-emerald-800">
              PENGUMPULAN BERHASIL DISIMPAN
            </span>
            <h2 className="text-xl font-bold text-white mt-2">
              Tanda Terima Berkas PDF Mahasiswa
            </h2>
            <p className="text-xs text-slate-400">
              Berkas telah tercatat dalam sistem penilaian instruktur.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">No. Tiket:</span>
              <strong className="text-indigo-400">{submittedReceipt.ticketId}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Mahasiswa:</span>
              <strong className="text-white">{submittedReceipt.studentName}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">NIM:</span>
              <strong className="text-indigo-300">{submittedReceipt.nim}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Nama Berkas:</span>
              <strong className="text-slate-200 truncate max-w-[240px]" title={submittedReceipt.fileName}>
                {submittedReceipt.fileName}
              </strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Ukuran:</span>
              <strong className="text-slate-200">
                {(submittedReceipt.fileSize / (1024 * 1024)).toFixed(2)} MB
              </strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Versi Berkas:</span>
              <strong className="text-emerald-400 font-bold">v{submittedReceipt.version}</strong>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Waktu Kirim:</span>
              <span className="text-slate-300 text-[11px]">{submittedReceipt.timestamp}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSubmittedReceipt(null);
                setFile(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
            >
              Kirim Revisi / Unggah Ulang
            </button>

            <button
              onClick={() => {
                window.location.hash = '';
                setView('penilaian');
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all"
            >
              Lihat di Lembar Penilaian Instruktur
            </button>
          </div>
        </div>
      ) : (
        /* 2-Row Aligned Grid */
        <div className="space-y-6 w-full">
          {/* ROW 1: TOP MAIN INTERACTION (IDENTIFIKASI & UNGGAH BERKAS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
            {/* TOP LEFT (5 COLS): IDENTIFIKASI & PILIH MAHASISWA */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-800">
                        1
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          Identifikasi Peserta Praktik
                        </h3>
                        <p className="text-xs text-slate-400">
                          Pilih kelompok dan cari nama / NIM Anda
                        </p>
                      </div>
                    </div>

                    {/* Offering Selector with Full Date */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Pekan:</span>
                      <select
                        value={selectedOfferingId}
                        onChange={(e) => {
                          setSelectedOfferingId(e.target.value);
                          setSelectedStudent(null);
                        }}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-indigo-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[220px] truncate"
                      >
                        {offerings.map((off) => (
                          <option key={off.id} value={off.id}>
                            Pekan {off.semesterWeek} ({off.dateRangeText})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchNim}
                      onChange={(e) => setSearchNim(e.target.value)}
                      placeholder="Ketik Nama atau NIM Anda..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Student Cards Grid (All 12 Students Displayed without scrollbar) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {filteredStudents.map((st) => {
                      const isSelected = selectedStudent?.id === st.id;
                      const rec = pdfRecords.find((r) => r.studentId === st.id);
                      const hasPdf = (rec?.artifacts?.length || 0) > 0;

                      return (
                        <button
                          key={st.id}
                          onClick={() => handleSelectStudent(st)}
                          className={cn(
                            'p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-1.5',
                            isSelected
                              ? 'bg-indigo-950/90 border-indigo-500 text-white shadow-md ring-1 ring-indigo-400'
                              : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                          )}
                        >
                          <div className="truncate min-w-0">
                            <div className="font-bold text-xs truncate leading-tight">{st.name}</div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              {st.nim}
                            </div>
                          </div>

                          {hasPdf ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-800 shrink-0">
                              v{rec?.activeArtifactVersion || 1} ADA
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 font-mono text-[9px] border border-slate-800 shrink-0">
                              KOSONG
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Student Active Card */}
                {selectedStudent ? (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-indigo-500/40 flex items-center justify-between gap-3 animate-in fade-in mt-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shrink-0">
                        {selectedStudent.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-white text-xs truncate">
                          {selectedStudent.name}
                        </div>
                        <span className="text-[10px] text-indigo-300 font-mono font-semibold">
                          NIM {selectedStudent.nim} • Kelas 1C
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-xs shrink-0">
                      <span className="text-slate-400 block text-[9px]">Status Berkas:</span>
                      {currentPdfRecord?.submissionStatus === 'dikumpulkan' ? (
                        <strong className="text-emerald-400 font-bold text-xs">
                          v{currentPdfRecord.activeArtifactVersion} Terkumpul
                        </strong>
                      ) : (
                        <strong className="text-amber-400 font-bold text-xs">Belum Ada</strong>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-500 italic mt-2">
                    Silakan klik kartu nama mahasiswa di atas untuk memulai pengumpulan.
                  </div>
                )}
              </div>
            </div>

            {/* TOP RIGHT (7 COLS): AREA UNGGAH BERKAS PDF */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-800">
                        2
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          Unggah Berkas Gambar PDF (L01–L10)
                        </h3>
                        <p className="text-xs text-slate-400">
                          {selectedStudent
                            ? `Mengunggah untuk: ${selectedStudent.name} (${selectedStudent.nim})`
                            : 'Pilih nama mahasiswa di kolom sebelah kiri terlebih dahulu'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-800">
                      Maks. 20 MB
                    </span>
                  </div>

                  {/* Drag & Drop File Zone */}
                  <label
                    className={cn(
                      'p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-2.5 transition-all',
                      selectedStudent
                        ? 'border-indigo-500/50 hover:border-indigo-400 bg-slate-950/80 hover:bg-slate-950 cursor-pointer group'
                        : 'border-slate-800 bg-slate-950/40 opacity-60 cursor-not-allowed'
                    )}
                  >
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      disabled={!selectedStudent}
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-2xl bg-indigo-950 text-indigo-400 border border-indigo-800 group-hover:scale-105 transition-transform flex items-center justify-center shadow-lg shadow-indigo-950/60">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {file
                          ? file.name
                          : selectedStudent
                          ? 'Klik untuk Memilih Berkas PDF dari Komputer / HP'
                          : 'Pilih Mahasiswa Terlebih Dahulu'}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        atau seret & jatuhkan (drag and drop) file PDF lembar kerja Anda di sini
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                      <span>1 Berkas .PDF Gabungan</span>
                      <span>•</span>
                      <span>Maksimal 20 MB</span>
                      <span>•</span>
                      <span>Skala 1:1 Terpusat</span>
                    </div>
                  </label>

                  {/* Selected File Details Preview */}
                  {file && selectedStudent && (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="font-bold text-white truncate max-w-sm">{file.name}</span>
                        </div>
                        <span className="text-indigo-300 font-mono font-bold">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>

                      <div className="pt-1.5 border-t border-slate-900 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Format Nama Standar:</span>
                        <strong className="text-indigo-300 font-mono">
                          CAD1.1_1C_{selectedStudent.nim}_{selectedStudent.name.replace(/\s+/g, '_')}.pdf
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={!file || !selectedStudent || isSubmitting}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold shadow-xl transition-all',
                      file && selectedStudent && !isSubmitting
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-indigo-950/60 ring-1 ring-indigo-400/50'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Mengunggah & Menyimpan...'
                        : 'Kirimkan Berkas PDF Gambar CAD (L01–L10)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: BOTTOM METRICS & KETENTUAN (SEJAJAR SECARA HORIZONTAL) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
            {/* BOTTOM LEFT (5 COLS): PROGRES PENGUMPULAN PEKAN INI */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2.5 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-300 font-bold">Pengumpulan Pekan Ini:</span>
                  </div>
                  <strong className="text-indigo-300 font-mono text-sm">
                    {submittedCount} dari {enrolledStudents.length} Mahasiswa
                  </strong>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${enrolledStudents.length > 0 ? (submittedCount / enrolledStudents.length) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{currentOffering.dateRangeText}</span>
                  <span className="text-emerald-400 font-bold">
                    {((submittedCount / (enrolledStudents.length || 1)) * 100).toFixed(0)}% Terkumpul
                  </span>
                </div>
              </div>
            </div>

            {/* BOTTOM RIGHT (7 COLS): KETENTUAN PEMERIKSAAN LAYOUT & PLOT */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2.5 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Ketentuan Standardisasi Layout & Plot PDF (Bobot 15%)</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono">Syarat Lulus: Skor ≥75.00</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-0.5">
                    <span className="font-bold text-indigo-300 text-[11px]">K1: Layer (30%)</span>
                    <p className="text-[10px] text-slate-400 leading-tight">Garis, sumbu, arsir & lineweight kontras.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-0.5">
                    <span className="font-bold text-indigo-300 text-[11px]">K2: Kertas & Skala (30%)</span>
                    <p className="text-[10px] text-slate-400 leading-tight">A4/A3 landscape skala 1:1 terpusat.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-0.5">
                    <span className="font-bold text-indigo-300 text-[11px]">K3: Dimensi (25%)</span>
                    <p className="text-[10px] text-slate-400 leading-tight">Teks dimensi & panah terbaca tajam.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-0.5">
                    <span className="font-bold text-indigo-300 text-[11px]">K4: Etiket (15%)</span>
                    <p className="text-[10px] text-slate-400 leading-tight">Etiket lengkap & ukuran file &lt;20MB.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
