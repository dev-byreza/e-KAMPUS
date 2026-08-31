import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, FileText, HeartHandshake, CalendarCheck2, Search, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ActiveTab } from '../../types/assessment';
import { ExerciseAssessment } from './ExerciseAssessment';
import { PdfAssessment } from './PdfAssessment';
import { SoftSkillAssessment } from './SoftSkillAssessment';
import { AttendanceAssessment } from './AttendanceAssessment';

export const AssessmentPanel: React.FC = () => {
  const { activeTab, setActiveTab, activePracticeVersion, openRubricModal } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!activePracticeVersion) return null;

  const sections = (activePracticeVersion.sections || []).map((s) => ({
    ...s,
    buttonLabel:
      s.id === 'exercises' && (s.buttonLabel === '10 Latihan' || !s.buttonLabel)
        ? 'ReDrawn 2D'
        : s.id === 'pdf' && (s.buttonLabel === 'Output PDF' || !s.buttonLabel)
        ? 'Layout & Plot'
        : s.buttonLabel || (s.id === 'exercises' ? 'ReDrawn 2D' : s.id === 'pdf' ? 'Layout & Plot' : s.id),
  }));

  const getTabIcon = (id: string) => {
    switch (id) {
      case 'exercises':
        return Layers;
      case 'pdf':
        return FileText;
      case 'softskill':
        return HeartHandshake;
      case 'attendance':
        return CalendarCheck2;
      default:
        return Layers;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-5">
      {/* 4 Main Assessment Buttons (tablist) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div
          role="tablist"
          aria-label="Bagian Penilaian CAD 1.1"
          className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex-wrap gap-1"
        >
          {sections.map((sec) => {
            const Icon = getTabIcon(sec.id);
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${sec.id}`}
                id={`tab-${sec.id}`}
                onClick={() => setActiveTab(sec.id as ActiveTab)}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shadow-sm',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-600/30 shadow-md ring-1 ring-indigo-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{sec.buttonLabel}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded text-[10px] font-mono',
                    isActive ? 'bg-indigo-900/80 text-indigo-200' : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {sec.weight}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Search within active week */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama / NIM mahasiswa..."
              className="bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56 sm:w-64 transition-all"
            />
          </div>

          <button
            onClick={() => openRubricModal(activeTab)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            title="Lihat kriteria rubrik untuk bagian aktif"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Rubrik</span>
          </button>
        </div>
      </div>

      {/* Dynamic Single-Panel Replacement Container */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="transition-all duration-150 animate-in fade-in"
      >
        {activeTab === 'exercises' && <ExerciseAssessment searchQuery={searchQuery} />}
        {activeTab === 'pdf' && <PdfAssessment searchQuery={searchQuery} />}
        {activeTab === 'softskill' && <SoftSkillAssessment searchQuery={searchQuery} />}
        {activeTab === 'attendance' && <AttendanceAssessment searchQuery={searchQuery} />}
      </div>
    </div>
  );
};
