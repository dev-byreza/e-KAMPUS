import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { db, INITIAL_PRACTICE_VERSIONS } from '../../lib/db';
import { api } from '../../services/api';
import { PracticeVersion, Exercise, RubricCriterion } from '../../types/assessment';
import {
  Settings2,
  Plus,
  Trash2,
  Copy,
  Save,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  FileText,
  HeartHandshake,
  CalendarCheck2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Eye,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { FormatSimulator } from './FormatSimulator';
import { FormatApplicationModal } from './FormatApplicationModal';

const normalizeVersion = (v?: Partial<PracticeVersion>): PracticeVersion => {
  const fallback = INITIAL_PRACTICE_VERSIONS[0];
  if (!v) return fallback;
  return {
    id: v.id || fallback.id,
    name: v.name || fallback.name,
    courseCode: v.courseCode || fallback.courseCode || 'CAD 1.1',
    courseName: v.courseName || fallback.courseName || 'Praktik CAD 1.1 — Pemodelan 2D & Dasar 3D',
    description: v.description || fallback.description,
    status: v.status || 'published',
    publishedAt: v.publishedAt,
    publishedBy: v.publishedBy,
    componentWeights: v.componentWeights || fallback.componentWeights,
    sections: Array.isArray(v.sections) && v.sections.length > 0 ? v.sections : fallback.sections,
    exercises: Array.isArray(v.exercises) && v.exercises.length > 0 ? v.exercises : fallback.exercises,
    exerciseCriteria: Array.isArray(v.exerciseCriteria) && v.exerciseCriteria.length > 0 ? v.exerciseCriteria : fallback.exerciseCriteria,
    pdfCriteria: Array.isArray(v.pdfCriteria) && v.pdfCriteria.length > 0 ? v.pdfCriteria : fallback.pdfCriteria,
    softSkillCriteria: Array.isArray(v.softSkillCriteria) && v.softSkillCriteria.length > 0 ? v.softSkillCriteria : fallback.softSkillCriteria,
    attendancePolicy: v.attendancePolicy || fallback.attendancePolicy,
    passingThreshold: v.passingThreshold ?? fallback.passingThreshold,
    minimumSoftSkillObservations: v.minimumSoftSkillObservations ?? fallback.minimumSoftSkillObservations,
    maxPdfSizeMb: v.maxPdfSizeMb ?? fallback.maxPdfSizeMb,
  };
};

export const FormatEditor: React.FC = () => {
  const { practiceVersions, showToast } = useApp();

  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    practiceVersions[0]?.id || 'CAD11-R1'
  );

  const activeRawVersion = practiceVersions.find((v) => v.id === selectedVersionId) || practiceVersions[0];

  // Local draft state for editing
  const [draft, setDraft] = useState<PracticeVersion>(() => normalizeVersion(activeRawVersion));
  const [editorSubTab, setEditorSubTab] = useState<'weights' | 'exercises' | 'criteria' | 'pdf' | 'soft' | 'attendance'>('weights');
  const [showSimulator, setShowSimulator] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Sync draft when switching version
  const handleSelectVersion = (id: string) => {
    setSelectedVersionId(id);
    const found = practiceVersions.find((v) => v.id === id);
    setDraft(normalizeVersion(found));
  };

  // Update draft when active version changes from server/IndexedDB
  useEffect(() => {
    if (activeRawVersion) {
      setDraft(normalizeVersion(activeRawVersion));
    }
  }, [activeRawVersion?.id]);

  // Clone active version to new draft
  const handleCloneVersion = async () => {
    const nextVerNum = (practiceVersions || []).length + 1;
    const newVersion: PracticeVersion = {
      ...normalizeVersion(draft),
      id: `CAD11-R${nextVerNum}`,
      name: `${draft.courseCode || 'CAD 1.1'} — Versi R${nextVerNum} (Draf Baru)`,
      status: 'draft',
      publishedAt: undefined,
      publishedBy: undefined,
    };

    await db.practiceVersions.put(newVersion);
    api.createPracticeVersion(newVersion).catch((e) => {
      console.warn('[FormatEditor] Backend clone sync note:', e.message);
    });

    setSelectedVersionId(newVersion.id);
    setDraft(newVersion);
    showToast(`Draf versi ${newVersion.id} berhasil dibuat!`, 'success');
  };

  // Save Draft changes to DB & Backend
  const handleSaveDraft = async () => {
    const validDraft = normalizeVersion(draft);
    await db.practiceVersions.put(validDraft);

    // Sync with backend API
    api.updatePracticeVersion(validDraft.id, validDraft).catch((err) => {
      console.warn('[FormatEditor] Backend update failed, trying create...', err.message);
      api.createPracticeVersion(validDraft).catch((e) => {
        console.warn('[FormatEditor] Backend create failed:', e.message);
      });
    });

    showToast(`Perubahan versi ${validDraft.id} (${validDraft.name}) berhasil disimpan ke database & backend!`, 'success');
  };

  // Publish Draft to DB & Backend
  const handlePublish = async () => {
    const totalWeight =
      draft.componentWeights.exercises +
      draft.componentWeights.pdf +
      draft.componentWeights.softskill +
      draft.componentWeights.attendance;

    if (totalWeight !== 100) {
      showToast(`Total bobot komponen harus tepat 100% (saat ini: ${totalWeight}%).`, 'error');
      return;
    }

    const publishedVersion: PracticeVersion = {
      ...normalizeVersion(draft),
      status: 'published',
      publishedAt: new Date().toISOString(),
      publishedBy: 'Admin Unit CAD',
    };

    await db.practiceVersions.put(publishedVersion);
    api.publishPracticeVersion(publishedVersion.id).catch((err) => {
      console.warn('[FormatEditor] Backend publish error:', err.message);
      api.updatePracticeVersion(publishedVersion.id, publishedVersion).catch(() => {});
    });

    setDraft(publishedVersion);
    showToast(`Versi ${draft.id} RESMI DITERBITKAN & disinkronkan ke backend!`, 'success');
  };

  // Component weights total check
  const totalComponentWeight =
    (draft.componentWeights?.exercises || 0) +
    (draft.componentWeights?.pdf || 0) +
    (draft.componentWeights?.softskill || 0) +
    (draft.componentWeights?.attendance || 0);

  const exercisesList = draft.exercises || [];
  const exerciseCriteriaList = draft.exerciseCriteria || [];
  const pdfCriteriaList = draft.pdfCriteria || [];
  const softSkillCriteriaList = draft.softSkillCriteria || [];
  const sectionsList = draft.sections || [];

  return (
    <div className="space-y-6">
      {/* Version Selector & Header Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Pilih Versi Format:
            </label>
            <select
              value={draft.id}
              onChange={(e) => handleSelectVersion(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {(practiceVersions || []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} — {v.name} ({v.status?.toUpperCase() || 'PUBLISHED'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCloneVersion}
            className="flex items-center gap-1.5 px-3 py-2 mt-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>Salin Versi (Buat Draf)</span>
          </button>
        </div>

        {/* Action Buttons: Save, Simulator, Publish, Apply */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-indigo-700/50 text-indigo-300 text-xs font-bold transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showSimulator ? 'Tutup Simulator' : 'Uji di Simulator'}</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-300" />
            <span>Simpan Draf</span>
          </button>

          {draft.status === 'draft' ? (
            <button
              onClick={handlePublish}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-950/50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Terbitkan Versi</span>
            </button>
          ) : (
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Terapkan ke Pekan...</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Simulator View (if opened) */}
      {showSimulator && <FormatSimulator version={draft} />}

      {/* Sub-Tabs for Format Configuration */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 rounded-xl p-1 gap-1 overflow-x-auto">
        {[
          { id: 'weights', label: '1. Bobot & Tab Tombol' },
          { id: 'exercises', label: `2. Daftar Latihan (${exercisesList.length})` },
          { id: 'criteria', label: `3. Kriteria Latihan (${exerciseCriteriaList.length})` },
          { id: 'pdf', label: `4. Kriteria PDF (${pdfCriteriaList.length})` },
          { id: 'soft', label: `5. Soft Skill (${softSkillCriteriaList.length})` },
          { id: 'attendance', label: '6. Kebijakan Absensi' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setEditorSubTab(t.id as any)}
            className={cn(
              'px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
              editorSubTab === t.id
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: COURSE IDENTITY, COMPONENT WEIGHTS & BUTTON LABELS */}
      {editorSubTab === 'weights' && (
        <div className="space-y-6">
          {/* Card 1: Identitas Mata Kuliah & Kurikulum Format */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center font-bold border border-amber-800/60">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Identitas Mata Kuliah & Versi Format</h3>
                <p className="text-xs text-slate-400">
                  Sesuaikan format penilaian ini ke mata kuliah atau kurikulum praktikum tertentu.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Course Code */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <label className="text-[11px] font-semibold text-amber-300">
                  Kode Mata Kuliah / Praktik:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: CAD 1.1, CAD 1.2, BIM 1.0"
                  value={draft.courseCode || 'CAD 1.1'}
                  onChange={(e) => setDraft({ ...draft, courseCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Course Name */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-semibold text-amber-300">
                  Nama Mata Kuliah / Praktik Lengkap:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Praktik CAD 1.1 — Pemodelan 2D & Dasar 3D"
                  value={draft.courseName || ''}
                  onChange={(e) => setDraft({ ...draft, courseName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Passing Threshold */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <label className="text-[11px] font-semibold text-amber-300">
                  Batas Nilai Kelulusan (Passing Grade):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.passingThreshold ?? 75}
                  onChange={(e) => setDraft({ ...draft, passingThreshold: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Version Name */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300">
                  Judul Label Versi Format:
                </label>
                <input
                  type="text"
                  value={draft.name || ''}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Version Description */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300">
                  Deskripsi Format & Kurikulum:
                </label>
                <input
                  type="text"
                  value={draft.description || ''}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Bobot 4 Komponen Penilaian Utama */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Bobot 4 Komponen Penilaian Utama</h3>
                <p className="text-xs text-slate-400">Total seluruh bobot harus berjumlah tepat 100%.</p>
              </div>
              <div
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold border',
                  totalComponentWeight === 100
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                )}
              >
                Total: {totalComponentWeight}% {totalComponentWeight === 100 ? '✓ Valid (100%)' : '✗ Harus 100%'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Latihan Weight */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-indigo-300">1. Latihan Teknis (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.componentWeights?.exercises ?? 60}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updatedWeights = { ...draft.componentWeights, exercises: val };
                    const updatedSections = (draft.sections || []).map((sec) =>
                      sec.id === 'exercises' ? { ...sec, weight: val } : sec
                    );
                    setDraft({ ...draft, componentWeights: updatedWeights, sections: updatedSections });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* PDF Weight */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-cyan-300">2. Output PDF / Gambar (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.componentWeights?.pdf ?? 15}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updatedWeights = { ...draft.componentWeights, pdf: val };
                    const updatedSections = (draft.sections || []).map((sec) =>
                      sec.id === 'pdf' ? { ...sec, weight: val } : sec
                    );
                    setDraft({ ...draft, componentWeights: updatedWeights, sections: updatedSections });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Soft Skill Weight */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-amber-300">3. Soft Skill / Sikap (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.componentWeights?.softskill ?? 15}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updatedWeights = { ...draft.componentWeights, softskill: val };
                    const updatedSections = (draft.sections || []).map((sec) =>
                      sec.id === 'softskill' ? { ...sec, weight: val } : sec
                    );
                    setDraft({ ...draft, componentWeights: updatedWeights, sections: updatedSections });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Attendance Weight */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-emerald-300">4. Kehadiran / Presensi (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.componentWeights?.attendance ?? 10}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updatedWeights = { ...draft.componentWeights, attendance: val };
                    const updatedSections = (draft.sections || []).map((sec) =>
                      sec.id === 'attendance' ? { ...sec, weight: val } : sec
                    );
                    setDraft({ ...draft, componentWeights: updatedWeights, sections: updatedSections });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Kustomisasi Label Tombol Tab Penilaian & Live Preview */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">
                Kustomisasi Label Tombol Tab Penilaian
              </h4>
              <p className="text-xs text-slate-400">
                Ubah teks nama tombol yang tampil pada navigasi penilaian instruktur untuk mata kuliah ini.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sectionsList.map((sec, idx) => {
                const componentKey = sec.id as 'exercises' | 'pdf' | 'softskill' | 'attendance';
                const currentWeight = draft.componentWeights?.[componentKey] ?? sec.weight ?? 0;
                return (
                  <div key={sec.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">
                        Tombol {idx + 1} ({sec.id})
                      </label>
                      <span className="text-[10px] font-mono text-indigo-300 font-bold">
                        Bobot: {currentWeight}%
                      </span>
                    </div>
                    <input
                      type="text"
                      value={sec.buttonLabel}
                      placeholder={sec.id}
                      onChange={(e) => {
                        const updated = [...sectionsList];
                        updated[idx].buttonLabel = e.target.value;
                        setDraft({ ...draft, sections: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                );
              })}
            </div>

            {/* Live Visual Preview of Tab Buttons */}
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/40 space-y-2 mt-4">
              <div className="flex items-center gap-2 text-xs text-indigo-300 font-bold">
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Langsung (Live Preview) Tombol di Lembar Penilaian Instruktur:</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {sectionsList.map((sec, idx) => {
                  const componentKey = sec.id as 'exercises' | 'pdf' | 'softskill' | 'attendance';
                  const currentWeight = draft.componentWeights?.[componentKey] ?? sec.weight ?? 0;
                  const icons = [Layers, FileText, HeartHandshake, CalendarCheck2];
                  const Icon = icons[idx] || Layers;
                  return (
                    <div
                      key={sec.id}
                      className={cn(
                        'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border shadow-sm',
                        idx === 0
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-500 shadow-indigo-600/20'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sec.buttonLabel || sec.id}</span>
                      <span
                        className={cn(
                          'px-1.5 py-0.2 rounded text-[10px] font-mono',
                          idx === 0 ? 'bg-indigo-900/80 text-indigo-200' : 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {currentWeight}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EXERCISES LIST */}
      {editorSubTab === 'exercises' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Daftar Latihan Praktik CAD</h3>
              <p className="text-xs text-slate-400">Kelola soal, topik instruksi, bobot, dan status kesiapan soal.</p>
            </div>
            <button
              onClick={() => {
                const nextNum = exercisesList.length + 1;
                const nextCode = `L${nextNum < 10 ? '0' + nextNum : nextNum}`;
                const newEx: Exercise = {
                  id: `ex-l${nextNum}`,
                  code: nextCode,
                  title: `Latihan Baru ${nextCode}`,
                  topic: 'Materi Pengayaan Tambahan',
                  weight: 10,
                  instructions: 'Instruksi pengerjaan gambar CAD...',
                  isReady: true,
                };
                setDraft({ ...draft, exercises: [...exercisesList, newEx] });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Latihan</span>
            </button>
          </div>

          <div className="space-y-3">
            {exercisesList.map((ex, idx) => (
              <div
                key={ex.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-8 rounded-lg bg-indigo-950 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center border border-indigo-800">
                      {ex.code}
                    </span>
                    <input
                      type="text"
                      value={ex.title}
                      onChange={(e) => {
                        const updated = [...exercisesList];
                        updated[idx].title = e.target.value;
                        setDraft({ ...draft, exercises: updated });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500 min-w-[200px]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ex.isReady}
                        onChange={(e) => {
                          const updated = [...exercisesList];
                          updated[idx].isReady = e.target.checked;
                          setDraft({ ...draft, exercises: updated });
                        }}
                        className="rounded border-slate-700 text-amber-600 focus:ring-amber-500"
                      />
                      <span>Soal Siap Dinilai</span>
                    </label>

                    <button
                      onClick={() => {
                        const updated = exercisesList.filter((_, i) => i !== idx);
                        setDraft({ ...draft, exercises: updated });
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                      title="Hapus Latihan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Topik Perintah CAD:</label>
                    <input
                      type="text"
                      value={ex.topic}
                      onChange={(e) => {
                        const updated = [...exercisesList];
                        updated[idx].topic = e.target.value;
                        setDraft({ ...draft, exercises: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Instruksi Soal:</label>
                    <input
                      type="text"
                      value={ex.instructions}
                      onChange={(e) => {
                        const updated = [...exercisesList];
                        updated[idx].instructions = e.target.value;
                        setDraft({ ...draft, exercises: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EXERCISE CRITERIA & DESCRIPTORS */}
      {editorSubTab === 'criteria' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Kriteria & Deskriptor Rubrik Latihan</h3>
              <p className="text-xs text-slate-400">Atur deskripsi rubrik untuk skor 0, 1, 2, 3, dan 4.</p>
            </div>
          </div>

          <div className="space-y-6">
            {exerciseCriteriaList.map((crit, cIdx) => (
              <div key={crit.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-xs font-bold">
                      {crit.code}
                    </span>
                    <input
                      type="text"
                      value={crit.name}
                      onChange={(e) => {
                        const updated = [...exerciseCriteriaList];
                        updated[cIdx].name = e.target.value;
                        setDraft({ ...draft, exerciseCriteria: updated });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Bobot:</span>
                    <input
                      type="number"
                      value={crit.weight}
                      onChange={(e) => {
                        const updated = [...exerciseCriteriaList];
                        updated[cIdx].weight = Number(e.target.value);
                        setDraft({ ...draft, exerciseCriteria: updated });
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-indigo-300"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>

                {/* 0..4 Descriptors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                  {[4, 3, 2, 1, 0].map((sc) => (
                    <div key={sc} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Skor {sc} ({(sc / 4) * 100})</label>
                      <textarea
                        rows={3}
                        value={crit.descriptors?.[sc as 0 | 1 | 2 | 3 | 4] || ''}
                        onChange={(e) => {
                          const updated = [...exerciseCriteriaList];
                          updated[cIdx].descriptors = {
                            ...updated[cIdx].descriptors,
                            [sc]: e.target.value,
                          };
                          setDraft({ ...draft, exerciseCriteria: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PDF CRITERIA */}
      {editorSubTab === 'pdf' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Kriteria & Deskriptor Output PDF Gabungan</h3>
              <p className="text-xs text-slate-400">Kelola rubrik pemeriksaan berkas PDF 10 Latihan.</p>
            </div>
          </div>

          <div className="space-y-6">
            {pdfCriteriaList.map((crit, cIdx) => (
              <div key={crit.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs font-bold">
                      {crit.code}
                    </span>
                    <input
                      type="text"
                      value={crit.name}
                      onChange={(e) => {
                        const updated = [...pdfCriteriaList];
                        updated[cIdx].name = e.target.value;
                        setDraft({ ...draft, pdfCriteria: updated });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Bobot:</span>
                    <input
                      type="number"
                      value={crit.weight}
                      onChange={(e) => {
                        const updated = [...pdfCriteriaList];
                        updated[cIdx].weight = Number(e.target.value);
                        setDraft({ ...draft, pdfCriteria: updated });
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-cyan-300"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>

                {/* 0..4 Descriptors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                  {[4, 3, 2, 1, 0].map((sc) => (
                    <div key={sc} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Skor {sc} ({(sc / 4) * 100})</label>
                      <textarea
                        rows={3}
                        value={crit.descriptors?.[sc as 0 | 1 | 2 | 3 | 4] || ''}
                        onChange={(e) => {
                          const updated = [...pdfCriteriaList];
                          updated[cIdx].descriptors = {
                            ...updated[cIdx].descriptors,
                            [sc]: e.target.value,
                          };
                          setDraft({ ...draft, pdfCriteria: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SOFT SKILL CRITERIA */}
      {editorSubTab === 'soft' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Kriteria & Deskriptor Soft Skill Harian</h3>
              <p className="text-xs text-slate-400">Kelola 4 aspek observasi sikap kerja, kedisiplinan, dan tanggung jawab.</p>
            </div>
          </div>

          <div className="space-y-6">
            {softSkillCriteriaList.map((crit, cIdx) => (
              <div key={crit.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-xs font-bold">
                      {crit.code}
                    </span>
                    <input
                      type="text"
                      value={crit.name}
                      onChange={(e) => {
                        const updated = [...softSkillCriteriaList];
                        updated[cIdx].name = e.target.value;
                        setDraft({ ...draft, softSkillCriteria: updated });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Bobot:</span>
                    <input
                      type="number"
                      value={crit.weight}
                      onChange={(e) => {
                        const updated = [...softSkillCriteriaList];
                        updated[cIdx].weight = Number(e.target.value);
                        setDraft({ ...draft, softSkillCriteria: updated });
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-300"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>

                {/* 0..4 Descriptors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                  {[4, 3, 2, 1, 0].map((sc) => (
                    <div key={sc} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Skor {sc} ({(sc / 4) * 100})</label>
                      <textarea
                        rows={3}
                        value={crit.descriptors?.[sc as 0 | 1 | 2 | 3 | 4] || ''}
                        onChange={(e) => {
                          const updated = [...softSkillCriteriaList];
                          updated[cIdx].descriptors = {
                            ...updated[cIdx].descriptors,
                            [sc]: e.target.value,
                          };
                          setDraft({ ...draft, softSkillCriteria: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: ATTENDANCE POLICY */}
      {editorSubTab === 'attendance' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Kebijakan Absensi & Sesi Pelaksanaan</h3>
            <p className="text-xs text-slate-400">Atur jumlah hari pelaksanaan dan skor status kehadiran.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-emerald-300">Jumlah Sesi Praktik per Pekan:</label>
              <input
                type="number"
                value={draft.attendancePolicy?.sessionsCount ?? 5}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    attendancePolicy: {
                      ...draft.attendancePolicy,
                      sessionsCount: Number(e.target.value) || 5,
                      scores: draft.attendancePolicy?.scores || { hadir: 4, izin: null, sakit: null, alpa: 0 },
                    },
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-amber-300">Batas Nilai Kelulusan (Passing Threshold):</label>
              <input
                type="number"
                value={draft.passingThreshold ?? 75}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    passingThreshold: Number(e.target.value) || 75,
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <FormatApplicationModal
          version={draft}
          onClose={() => setShowApplyModal(false)}
        />
      )}
    </div>
  );
};
