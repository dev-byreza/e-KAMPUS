import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Settings2,
  Share2,
  FileUp,
} from 'lucide-react';
import { getCurrentWitaTime, cn } from '../../lib/utils';
import { SharePortalModal } from '../portal/SharePortalModal';

export const TopHeader: React.FC = () => {
  const {
    role,
    setRole,
    view,
    setView,
    activeOffering,
    activeOfferingId,
    setActiveOfferingId,
    offerings,
    activePracticeVersion,
    offeringStudents,
    saveStatus,
    lastSavedTime,
    openRubricModal,
    toggleRosterVerification,
  } = useApp();

  const [timeText, setTimeText] = useState(getCurrentWitaTime());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeText(getCurrentWitaTime());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Context Breadcrumb & Offering Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Practice Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 font-black text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            CAD 1.1
          </div>

          {/* Offering info */}
          {activeOffering && (
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-medium">
              <span className="text-slate-400">Kelas:</span>
              <strong className="text-white">{activeOffering.class}</strong>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Pekan:</span>
              <strong className="text-indigo-300">Pekan {activeOffering.semesterWeek}</strong>
              <span className="text-slate-400 text-[11px]">({activeOffering.dateRangeText})</span>
            </div>
          )}

          {/* Roster count */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              <strong className="text-white">{offeringStudents.length}</strong> Mahasiswa
            </span>
          </div>

          {/* Verified Badge */}
          {activeOffering && (
            <button
              onClick={() => toggleRosterVerification(activeOffering.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-colors',
                activeOffering.isRosterVerified
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-700/50 hover:bg-amber-900/60'
              )}
            >
              {activeOffering.isRosterVerified ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Roster Terverifikasi</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verifikasi Roster</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Quick Rubric Trigger, Portal Mahasiswa & Clock */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold border border-indigo-700/60 transition-colors shadow-sm"
            title="Bagikan / Buka Portal Mahasiswa"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Portal Mahasiswa</span>
          </button>

          <button
            onClick={() => openRubricModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Panduan Rubrik 0–4</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeText}</span>
          </div>
        </div>
      </div>

      {/* Share Portal Modal */}
      <SharePortalModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </header>
  );
};
