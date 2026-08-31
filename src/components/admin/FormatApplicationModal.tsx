import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../lib/db';
import { PracticeVersion } from '../../types/assessment';
import { ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormatApplicationModalProps {
  version: PracticeVersion;
  onClose: () => void;
}

export const FormatApplicationModal: React.FC<FormatApplicationModalProps> = ({
  version,
  onClose,
}) => {
  const { offerings, showToast } = useApp();
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(
    offerings[2]?.id || offerings[0]?.id || ''
  );
  const [reason, setReason] = useState<string>(
    'Penerapan versi format baru R2 untuk pengayaan materi praktik CAD 1.1.'
  );
  const [isApplying, setIsApplying] = useState(false);

  const selectedOffering = offerings.find((o) => o.id === selectedOfferingId);

  const handleApply = async () => {
    if (!selectedOffering) return;
    try {
      setIsApplying(true);

      // Check if offering already has final snapshot
      const existingSnaps = await db.snapshots
        .where('offeringId')
        .equals(selectedOffering.id)
        .toArray();

      const hasFinal = existingSnaps.some((s) => s.status === 'final');
      if (hasFinal) {
        showToast(
          'Gagal: Pelaksanaan memiliki nilai final. Buka revisi terlebih dahulu!',
          'error'
        );
        setIsApplying(false);
        return;
      }

      // Update offering's practiceVersionId
      await db.offerings.update(selectedOffering.id, {
        practiceVersionId: version.id,
      });

      // Log audit
      await db.auditEvents.add({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Admin Unit CAD',
        action: 'APPLY_FORMAT_VERSION',
        targetType: 'OFFERING',
        targetId: selectedOffering.id,
        details: `Penerapan versi ${version.name} ke ${selectedOffering.id}. Alasan: ${reason}`,
      });

      showToast(
        `Versi ${version.id} berhasil diterapkan ke Pekan ${selectedOffering.semesterWeek}!`,
        'success'
      );
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Gagal menerapkan format ke pekan.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm">
              Tinjauan Dampak Penerapan Format Versi
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Version info */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Versi Format yang Akan Diterapkan:</div>
          <div className="font-bold text-indigo-300 text-sm">{version.name}</div>
          <div className="text-[11px] text-slate-500">
            {(version.exercises || []).length} Latihan • {(version.exerciseCriteria || []).length} Kriteria Latihan • {version.attendancePolicy?.sessionsCount || 5} Sesi Absensi
          </div>
        </div>

        {/* Offering Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Pilih Pelaksanaan Pekan Tujuan:
          </label>
          <select
            value={selectedOfferingId}
            onChange={(e) => setSelectedOfferingId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {offerings.map((off) => (
              <option key={off.id} value={off.id}>
                {off.id} — Pekan {off.semesterWeek} ({off.dateRangeText}) • Versi saat ini: {off.practiceVersionId}
              </option>
            ))}
          </select>
        </div>

        {/* Impact Analysis Warning */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/50 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4" />
            <span>Analisis Dampak Nilai & Kelengkapan</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Penerapan format hanya berdampak pada pelaksanaan yang dipilih. Pekan lain <strong>tetap menggunakan format asalnya</strong>. Jika terdapat penambahan latihan/kriteria baru, data tersebut mulai kosong (belum dinilai) dan tidak merusak riwayat skor terdahulu.
          </p>
        </div>

        {/* Mandatory Reason */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Alasan Penerapan Format (Audit Trail):
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Batal
          </button>
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/50 transition-all"
          >
            <span>{isApplying ? 'Menerapkan...' : 'Terapkan Format ke Pekan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
