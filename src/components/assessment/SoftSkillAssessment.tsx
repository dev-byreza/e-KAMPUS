import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAssessmentData } from '../../hooks/useAssessmentData';
import {
  HeartHandshake,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  EyeOff,
  Info,
} from 'lucide-react';
import { ScorePillSelector } from '../common/ScorePillSelector';
import { formatScore, cn } from '../../lib/utils';
import { calculateDailySoftSkillScore } from '../../lib/calcEngine';

interface SoftSkillAssessmentProps {
  searchQuery: string;
}

export const SoftSkillAssessment: React.FC<SoftSkillAssessmentProps> = ({ searchQuery }) => {
  const {
    activeOffering,
    activePracticeVersion,
    activeSessionOrdinal,
    setActiveSessionOrdinal,
    offeringStudents,
  } = useApp();

  const {
    softSkillRecords,
    updateSoftSkillScore,
    setSoftSkillUnobserved,
    updateSoftSkillNote,
  } = useAssessmentData();

  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  const [unobservedModalStudent, setUnobservedModalStudent] = useState<{ id: string; name: string } | null>(null);
  const [unobservedReason, setUnobservedReason] = useState<string>('Izin dispensasi resmi / tidak teramati dalam sesi ini.');

  if (!activePracticeVersion || !activeOffering) return null;

  const criteria = activePracticeVersion.softSkillCriteria || [];
  const sessionsCount = activePracticeVersion.attendancePolicy?.sessionsCount || 5;

  const filteredStudents = offeringStudents.filter((st) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return st.name.toLowerCase().includes(q) || st.nim.includes(q);
  });

  const sessionDays = [
    { ord: 1, label: 'H1', dayName: 'Senin' },
    { ord: 2, label: 'H2', dayName: 'Selasa' },
    { ord: 3, label: 'H3', dayName: 'Rabu' },
    { ord: 4, label: 'H4', dayName: 'Kamis' },
    { ord: 5, label: 'H5', dayName: 'Jumat' },
  ].slice(0, sessionsCount);

  // Count how many students reviewed for active day
  const reviewedCount = offeringStudents.filter((st) => {
    const rec = softSkillRecords.find(
      (r) => r.studentId === st.id && r.sessionOrdinal === activeSessionOrdinal
    );
    return rec?.status === 'dinilai' || rec?.status === 'tidak_teramati';
  }).length;

  return (
    <div className="space-y-4">
      {/* Day Selector & Context Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {sessionDays.map((sd) => {
            const isSelected = activeSessionOrdinal === sd.ord;
            return (
              <button
                key={sd.ord}
                onClick={() => setActiveSessionOrdinal(sd.ord)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border',
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {sd.label} • {sd.dayName}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-medium text-slate-300">
            Observasi {sessionDays.find((d) => d.ord === activeSessionOrdinal)?.label}:{' '}
            <strong className="text-emerald-400 font-bold">{reviewedCount}</strong> /{' '}
            {offeringStudents.length} Mahasiswa Ditinjau
          </div>
        </div>
      </div>

      {/* Main Soft Skill Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-28">NIM</th>
                <th className="py-3.5 px-4 min-w-[180px]">Nama Mahasiswa</th>
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
                <th className="py-3.5 px-4 w-24 text-center">Nilai Harian</th>
                <th className="py-3.5 px-4 w-28 text-center">Status</th>
                <th className="py-3.5 px-4 min-w-[140px] text-right">Catatan & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredStudents.map((st, idx) => {
                const rec = softSkillRecords.find(
                  (r) => r.studentId === st.id && r.sessionOrdinal === activeSessionOrdinal
                );
                const scores = rec?.scores || {};
                const calc = calculateDailySoftSkillScore(scores, criteria);
                const isUnobserved = rec?.status === 'tidak_teramati';

                // Check if any score is 0 or 1, which mandates notes
                const hasLowScore = Object.values(scores).some((sc) => sc === 0 || sc === 1);
                const isMissingMandatoryNote = hasLowScore && !rec?.notes?.trim();

                return (
                  <tr
                    key={st.id}
                    className={cn(
                      'hover:bg-slate-800/40 transition-colors',
                      isUnobserved && 'bg-slate-950/60 opacity-80',
                      isMissingMandatoryNote && 'bg-amber-950/20'
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
                      {isMissingMandatoryNote ? (
                        <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" /> Catatan wajib untuk skor 0/1!
                        </div>
                      ) : rec?.notes ? (
                        <div className="text-[11px] text-slate-400 italic flex items-center gap-1 mt-0.5">
                          <MessageSquare className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{rec.notes}</span>
                        </div>
                      ) : null}
                    </td>

                    {/* Criteria 0-4 Selectors */}
                    {criteria.map((crit) => (
                      <td key={crit.id} className="py-3 px-2 text-center">
                        <ScorePillSelector
                          value={isUnobserved ? null : scores[crit.id]}
                          onChange={(score) => {
                            if (isUnobserved) return;
                            updateSoftSkillScore(st.id, activeSessionOrdinal, crit.id, score);
                          }}
                          descriptors={crit.descriptors}
                          criterionName={`Soft-${crit.code}: ${crit.name}`}
                          disabled={isUnobserved}
                        />
                      </td>
                    ))}

                    {/* Converted 0-100 Daily Score */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      {isUnobserved ? (
                        <span className="text-slate-500 text-xs italic">Tidak Dihitung</span>
                      ) : calc.score !== null ? (
                        <span
                          className={cn(
                            calc.score >= 75
                              ? 'text-emerald-400 font-bold'
                              : calc.score > 0
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          )}
                        >
                          {formatScore(calc.score)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {isUnobserved ? (
                        <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                          Tidak Teramati
                        </span>
                      ) : rec?.status === 'dinilai' ? (
                        <span className="px-2 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Dinilai
                        </span>
                      ) : rec?.status === 'draf' ? (
                        <span className="px-2 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-semibold flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" /> Draf
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-slate-950 text-slate-500 border border-slate-800 text-[10px]">
                          Belum Ditinjau
                        </span>
                      )}
                    </td>

                    {/* Actions: Notes & Tidak Teramati */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setActiveNoteStudentId(st.id);
                            setTempNoteText(rec?.notes || '');
                          }}
                          className={cn(
                            'p-1.5 rounded-lg border text-xs transition-colors',
                            isMissingMandatoryNote
                              ? 'bg-amber-950 text-amber-300 border-amber-600 animate-pulse'
                              : rec?.notes
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          )}
                          title="Tambah Catatan Observasi"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (isUnobserved) {
                              // Reset to draf
                              updateSoftSkillScore(st.id, activeSessionOrdinal, criteria[0].id, null);
                            } else {
                              setUnobservedModalStudent({ id: st.id, name: st.name });
                            }
                          }}
                          className={cn(
                            'px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors',
                            isUnobserved
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          )}
                          title="Tandai Tidak Teramati pada hari ini"
                        >
                          {isUnobserved ? 'Amati Kembali' : 'Tidak Teramati'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Keterangan: Status <strong>Tidak Teramati</strong> mengecualikan hari ini dari pembagi rata-rata soft skill.
            </span>
          </div>
          <div className="text-slate-500">
            Minimal {activePracticeVersion.minimumSoftSkillObservations} hari observasi untuk kelulusan soft skill.
          </div>
        </div>
      </div>

      {/* Note Editing Modal */}
      {activeNoteStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">
                Catatan Observasi Soft Skill (H{activeSessionOrdinal})
              </h3>
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <textarea
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              placeholder="Tuliskan catatan konkret sikap kerja, kepatuhan SOP lab, komunikasi atau inisiatif..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  updateSoftSkillNote(activeNoteStudentId, activeSessionOrdinal, tempNoteText);
                  setActiveNoteStudentId(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Tidak Teramati" Confirmation Modal */}
      {unobservedModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-indigo-400 border-b border-slate-800 pb-3">
              <EyeOff className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-white text-sm">
                  Konfirmasi Status Tidak Teramati
                </h3>
                <p className="text-xs text-slate-400">
                  Mahasiswa: <strong className="text-white">{unobservedModalStudent.name}</strong> (H{activeSessionOrdinal})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Status ini mengosongkan seluruh skor kriteria soft skill hari ini dan <strong>tidak dihitung sebagai nol</strong>, melainkan dikecualikan dari pembagi rata-rata. Alasan konkret wajib dicatat.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Alasan Tidak Teramati:</label>
              <textarea
                value={unobservedReason}
                onChange={(e) => setUnobservedReason(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setUnobservedModalStudent(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setSoftSkillUnobserved(unobservedModalStudent.id, activeSessionOrdinal, unobservedReason);
                  setUnobservedModalStudent(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Tandai Tidak Teramati
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
