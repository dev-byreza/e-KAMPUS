import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileCode2,
  Users,
  Calendar,
  History,
  ShieldCheck,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { MasterCoursesView } from './MasterCoursesView';
import { FormatEditor } from './FormatEditor';
import { MasterStudentsView } from './MasterStudentsView';
import { MasterOfferingsView } from './MasterOfferingsView';
import { AuditLogView } from './AuditLogView';
import { Course } from '../../types/assessment';

type AdminMenu = 'courses' | 'formats' | 'students' | 'offerings' | 'audit' | 'ringkasan';

export const AdminDashboard: React.FC = () => {
  const { setRole, setView, courses, practiceVersions, offerings, students } = useApp();
  const [adminMenu, setAdminMenu] = useState<AdminMenu>('courses');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | undefined>(undefined);

  const draftCount = practiceVersions.filter((v) => v.status === 'draft').length;
  const unverifiedOfferings = offerings.filter((o) => !o.isRosterVerified).length;

  const handleSelectCourseForFormat = (course: Course) => {
    setSelectedCourseCode(course.code);
    setAdminMenu('formats');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      {/* Admin Top Header & Exit Button */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-800/40 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30 font-black">
            e-K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">DASHBOARD ADMIN e-KAMPUS</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-mono text-[10px] font-bold border border-amber-800">
                ADMIN ACCESS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sistem Manajemen Praktikum: Master Mata Kuliah, Arsitektur Format Penilaian, Master Mahasiswa, dan Audit.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setRole('instructor');
            setView('penilaian');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors self-start md:self-auto"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          <span>Kembali ke Workspace Penilaian</span>
        </button>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'courses', label: '1. Master Mata Kuliah', icon: BookOpen },
          { id: 'formats', label: '2. Format Penilaian (Utama)', icon: FileCode2 },
          { id: 'students', label: '3. Mahasiswa & Kelas', icon: Users },
          { id: 'offerings', label: '4. Pekan & Pelaksanaan', icon: Calendar },
          { id: 'audit', label: '5. Riwayat Konfigurasi & Audit', icon: History },
          { id: 'ringkasan', label: 'Ringkasan & Metrik', icon: LayoutDashboard },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = adminMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAdminMenu(item.id as AdminMenu)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ADMIN VIEW 1: MASTER MATA KULIAH */}
      {adminMenu === 'courses' && (
        <MasterCoursesView onSelectCourseForFormat={handleSelectCourseForFormat} />
      )}

      {/* ADMIN VIEW 2: FORMAT EDITOR */}
      {adminMenu === 'formats' && (
        <FormatEditor initialCourseCode={selectedCourseCode} />
      )}

      {/* ADMIN VIEW 3: MASTER STUDENTS */}
      {adminMenu === 'students' && <MasterStudentsView />}

      {/* ADMIN VIEW 4: MASTER OFFERINGS */}
      {adminMenu === 'offerings' && <MasterOfferingsView />}

      {/* ADMIN VIEW 5: AUDIT LOG */}
      {adminMenu === 'audit' && <AuditLogView />}

      {/* ADMIN VIEW 6: RINGKASAN */}
      {adminMenu === 'ringkasan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400">Total Mata Kuliah</span>
              <div className="text-3xl font-black text-white">{courses.length}</div>
              <div className="text-xs text-indigo-400 font-medium">Terdaftar di e-Kampus</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400">Total Versi Format</span>
              <div className="text-3xl font-black text-white">{practiceVersions.length}</div>
              <div className="text-xs text-amber-400 font-medium">
                {draftCount} Draf belum diterbitkan
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400">Total Offering Pekan</span>
              <div className="text-3xl font-black text-white">{offerings.length}</div>
              <div className="text-xs text-slate-400">
                {unverifiedOfferings > 0 ? (
                  <span className="text-amber-400 font-semibold">{unverifiedOfferings} Roster menunggu verifikasi</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Seluruh roster terverifikasi</span>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400">Total Mahasiswa Master</span>
              <div className="text-3xl font-black text-white">{students.length}</div>
              <div className="text-xs text-emerald-400">Terdaftar dalam sistem</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
