import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  BarChart3,
  Users,
  BookOpen,
  FileSpreadsheet,
  History,
  Settings2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Calendar,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  FileUp,
} from 'lucide-react';
import { cn, getCurrentWitaTime } from '../../lib/utils';
import { AppView } from '../../types/assessment';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
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
    saveStatus,
    lastSavedTime,
    openRubricModal,
    resetDatabase,
  } = useApp();

  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'penilaian', label: 'Penilaian Praktik', icon: Layers },
    { id: 'dashboard_nilai', label: 'Dashboard Nilai & KPI', icon: BarChart3 },
    { id: 'peserta_jadwal', label: 'Peserta & Jadwal', icon: Users },
    { id: 'rubrik_aturan', label: 'Rubrik & Aturan', icon: BookOpen },
    { id: 'rekap_ekspor', label: 'Rekap & Ekspor', icon: FileSpreadsheet },
    { id: 'riwayat_snapshot', label: 'Riwayat & Snapshot', icon: History },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 shadow-2xl flex flex-col justify-between transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Top Header / Branding */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-lg tracking-wider border border-indigo-400/30 shrink-0">
              CAD
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white tracking-tight">
                    CAD 1.1 e-KAMPUS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Kelas 1C • Ganjil 2026/2027
                </p>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors shrink-0"
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Offering Week Selector (If not collapsed) */}
        {!isCollapsed && role === 'instructor' && (
          <div className="mt-4 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <label htmlFor="sidebar-week-select" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pekan Praktik Aktif:
            </label>
            <div className="relative">
              <select
                id="sidebar-week-select"
                value={activeOfferingId}
                onChange={(e) => setActiveOfferingId(e.target.value)}
                className="w-full appearance-none bg-slate-950 border border-indigo-500/40 text-slate-100 text-xs font-bold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {offerings.map((off) => (
                  <option key={off.id} value={off.id}>
                    Pekan {off.semesterWeek} • {off.dateRangeText}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Center Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {/* Role Toggle Pill in Sidebar */}
        {!isCollapsed ? (
          <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
            <button
              onClick={() => {
                setRole('instructor');
                if (view === 'dashboard_admin') setView('penilaian');
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all',
                role === 'instructor'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Instruktur</span>
            </button>
            <button
              onClick={() => {
                setRole('admin');
                setView('dashboard_admin');
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all',
                role === 'admin'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => {
                const nextRole = role === 'instructor' ? 'admin' : 'instructor';
                setRole(nextRole);
                if (nextRole === 'admin') setView('dashboard_admin');
                else setView('penilaian');
              }}
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold transition-all shadow-md',
                role === 'instructor' ? 'bg-indigo-600' : 'bg-amber-600'
              )}
              title={`Beralih ke mode ${role === 'instructor' ? 'Admin' : 'Instruktur'}`}
            >
              {role === 'instructor' ? <GraduationCap className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* Main Nav Items */}
        {role === 'instructor' ? (
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-400/50'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900',
                    isCollapsed && 'justify-center px-0'
                  )}
                  title={item.label}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="space-y-1">
            <button
              onClick={() => setView('dashboard_admin')}
              className={cn(
                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-amber-600 text-white shadow-md',
                isCollapsed && 'justify-center px-0'
              )}
            >
              <Settings2 className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Dashboard Admin</span>}
            </button>
          </div>
        )}

        {/* Quick Tools */}
        <div className="pt-4 border-t border-slate-800/80 space-y-1">
          <button
            onClick={() => openRubricModal()}
            className={cn(
              'w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-400 hover:text-indigo-300 hover:bg-slate-900 transition-colors',
              isCollapsed && 'justify-center px-0'
            )}
            title="Lihat Rubrik Skor 0-4"
          >
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            {!isCollapsed && <span>Panduan Rubrik</span>}
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset database ke data awal Lampiran A?')) {
                resetDatabase();
              }
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors',
              isCollapsed && 'justify-center px-0'
            )}
            title="Reset Database Awal"
          >
            <RotateCcw className="w-4 h-4 text-slate-500 shrink-0" />
            {!isCollapsed && <span>Reset Data Awal</span>}
          </button>
        </div>
      </div>

      {/* Bottom Footer: Auto-Save Status & Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
        {/* Auto-Save Badge */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Tersimpan</span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">{lastSavedTime}</span>
          </div>
        ) : (
          <div className="flex justify-center" title={`Tersimpan: ${lastSavedTime}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        {/* Instructor Profile Card */}
        {!isCollapsed && activeOffering && (
          <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
              RF
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {activeOffering.instructorName}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Instruktur
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
