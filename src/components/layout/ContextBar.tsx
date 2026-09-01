import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ContextBar: React.FC = () => {
  const {
    activeOffering,
    activeOfferingId,
    setActiveOfferingId,
    offerings,
    activePracticeVersion,
    offeringStudents,
    saveStatus,
    lastSavedTime,
    toggleRosterVerification,
  } = useApp();

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Practice, Semester, Class, Week Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
          {/* Practice Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-700/50 text-indigo-200 font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            {activeOffering?.practiceCode || activePracticeVersion?.courseCode || 'Praktikum'}
          </div>

          {/* Semester & Class */}
          <div className="flex items-center gap-1 text-slate-300 text-xs bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Semester:</span>
            <span className="font-semibold text-slate-200">Ganjil 2026/2027</span>
            <span className="text-slate-600 mx-1">•</span>
            <span className="text-slate-400">Kelas:</span>
            <span className="font-bold text-indigo-300">1C</span>
          </div>

          {/* Week Selector Dropdown */}
          <div className="relative inline-flex items-center">
            <label htmlFor="week-select" className="sr-only">Pilih Pekan</label>
            <select
              id="week-select"
              value={activeOfferingId}
              onChange={(e) => setActiveOfferingId(e.target.value)}
              className="appearance-none bg-slate-950 border border-indigo-500/40 text-slate-100 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400 transition-colors cursor-pointer shadow-sm"
            >
              {offerings.map((off) => (
                <option key={off.id} value={off.id} className="bg-slate-900 text-slate-100">
                  {off.practiceCode} • Pekan {off.semesterWeek} ({off.dateRangeText})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Roster Badge */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">
              <strong className="text-white">{offeringStudents.length}</strong> mahasiswa
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{activePracticeVersion?.name.split('—')[1]?.trim() || 'CAD11-R1'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">Nilai 0–100</span>
          </div>

          {/* Roster Verified Indicator / Toggle */}
          {activeOffering && (
            <button
              onClick={() => toggleRosterVerification(activeOffering.id)}
              className={cn(
                'flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors',
                activeOffering.isRosterVerified
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-700/50 hover:bg-amber-900/60'
              )}
              title="Klik untuk mengubah status verifikasi roster"
            >
              {activeOffering.isRosterVerified ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Roster Terverifikasi</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>Roster Belum Diverifikasi</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Auto-Save Status Indicator */}
        <div className="flex items-center gap-2 self-end md:self-auto text-xs">
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all duration-200',
              saveStatus === 'saved'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40'
                : saveStatus === 'saving'
                ? 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60 animate-pulse'
                : saveStatus === 'draft'
                ? 'bg-amber-950/40 text-amber-300 border-amber-700/40'
                : 'bg-rose-950/40 text-rose-300 border-rose-700/40'
            )}
          >
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersimpan • {lastSavedTime}</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            )}
            {saveStatus === 'draft' && (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Draf di Perangkat</span>
              </>
            )}
            {saveStatus === 'conflict' && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Konflik Revisi Terdeteksi</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
