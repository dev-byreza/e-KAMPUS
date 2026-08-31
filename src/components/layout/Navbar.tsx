import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Layers,
  BarChart3,
  Users,
  BookOpen,
  FileSpreadsheet,
  History,
  Settings2,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { getCurrentWitaTime, cn } from '../../lib/utils';
import { AppView } from '../../types/assessment';

export const Navbar: React.FC = () => {
  const {
    role,
    setRole,
    view,
    setView,
    openRubricModal,
    resetDatabase,
    saveStatus,
    lastSavedTime,
  } = useApp();

  const [timeText, setTimeText] = useState(getCurrentWitaTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeText(getCurrentWitaTime());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'penilaian', label: 'Penilaian', icon: Layers },
    { id: 'dashboard_nilai', label: 'Dashboard Nilai', icon: BarChart3 },
    { id: 'peserta_jadwal', label: 'Peserta & Jadwal', icon: Users },
    { id: 'rubrik_aturan', label: 'Rubrik & Aturan', icon: BookOpen },
    { id: 'rekap_ekspor', label: 'Rekap & Ekspor', icon: FileSpreadsheet },
    { id: 'riwayat_snapshot', label: 'Riwayat & Snapshot', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-lg tracking-wider border border-indigo-400/30">
              CAD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  CAD 1.1
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 uppercase tracking-wide">
                  v1.1 React+Vite
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Web App Penilaian Praktik & Dashboard Admin
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Instructor Workspace) */}
          {role === 'instructor' && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Header: WITA Clock, Quick Rubric, Reset, Role Switch */}
          <div className="flex items-center gap-3">
            {/* Quick Rubric Button */}
            <button
              onClick={() => openRubricModal()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors"
              title="Buka panduan rubrik skor 0-4"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Lihat Rubrik</span>
            </button>

            {/* Reset Database Trigger */}
            <button
              onClick={() => {
                if (window.confirm('Reset database ke data awal Lampiran A?')) {
                  resetDatabase();
                }
              }}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs border border-slate-800 transition-colors"
              title="Reset Data ke Konfigurasi Awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Role Switcher Pill (Instructor <-> Admin Dashboard) */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => {
                  setRole('instructor');
                  if (view === 'dashboard_admin') setView('penilaian');
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  role === 'instructor'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instruktur</span>
              </button>
              <button
                onClick={() => {
                  setRole('admin');
                  setView('dashboard_admin');
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  role === 'admin'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
