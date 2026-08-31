import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { AssessmentPanel } from './components/assessment/AssessmentPanel';
import { InstructorDashboard } from './components/dashboard/InstructorDashboard';
import { RosterScheduleView } from './components/roster/RosterScheduleView';
import { RekapExportView } from './components/rekap/RekapExportView';
import { SnapshotHistoryView } from './components/history/SnapshotHistoryView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentSubmissionPortal } from './components/portal/StudentSubmissionPortal';
import { RubricRulesView } from './components/rubric/RubricRulesView';
import { RubricModal } from './components/rubric/RubricModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from './lib/utils';

const MainContent: React.FC = () => {
  const { role, view, setView, toastMessage, clearToast } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync and listen for #kumpul-tugas URL hash
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('kumpul-tugas') || hash.includes('portal')) {
        setView('portal_mahasiswa');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setView]);

  // If viewing student portal, provide a clean dedicated layout
  if (view === 'portal_mahasiswa') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        <StudentSubmissionPortal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-indigo-500 selection:text-white">
      {/* Left Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area (Offset by sidebar width) */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'pl-20' : 'pl-72'
        )}
      >
        {/* Top Sticky Header */}
        <TopHeader />

        {/* Dynamic View Router */}
        <main className="flex-1 pb-16">
          {view === 'penilaian' && <AssessmentPanel />}
          {view === 'dashboard_nilai' && <InstructorDashboard />}
          {view === 'peserta_jadwal' && <RosterScheduleView />}
          {view === 'rubrik_aturan' && <RubricRulesView />}
          {view === 'rekap_ekspor' && <RekapExportView />}
          {view === 'riwayat_snapshot' && <SnapshotHistoryView />}
          {view === 'dashboard_admin' && <AdminDashboard />}
        </main>
      </div>

      {/* Interactive Global Rubric Modal */}
      <RubricModal />

      {/* Toast Notification Floating Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md',
              toastMessage.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-200 border-emerald-700/80 shadow-emerald-950/50'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/95 text-rose-200 border-rose-700/80 shadow-rose-950/50'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950/95 text-amber-200 border-amber-700/80 shadow-amber-950/50'
                : 'bg-indigo-950/95 text-indigo-200 border-indigo-700/80 shadow-indigo-950/50'
            )}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}

            <span>{toastMessage.text}</span>

            <button
              onClick={clearToast}
              className="ml-2 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CAD 1.1 Uncaught Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-white">Terjadi Kendala Memuat Tampilan</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {this.state.error?.message || 'Aplikasi sedang memperbarui cache data.'}
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
