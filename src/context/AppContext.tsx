import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Role,
  AppView,
  ActiveTab,
  Offering,
  PracticeVersion,
  Student,
} from '../types/assessment';
import {
  db,
  initializeDatabase,
  INITIAL_STUDENTS,
  INITIAL_OFFERINGS,
  INITIAL_PRACTICE_VERSIONS,
} from '../lib/db';
import { api } from '../services/api';
import { useLiveQuery } from 'dexie-react-hooks';
import { getCurrentWitaTime } from '../lib/utils';

export type SaveState = 'saved' | 'saving' | 'draft' | 'conflict' | 'offline';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  view: AppView;
  setView: (view: AppView) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeOfferingId: string;
  setActiveOfferingId: (id: string) => void;
  activeExerciseId: string;
  setActiveExerciseId: (id: string) => void;
  activeSessionOrdinal: number;
  setActiveSessionOrdinal: (ord: number) => void;

  // Data from Dexie
  offerings: Offering[];
  activeOffering: Offering | undefined;
  practiceVersions: PracticeVersion[];
  activePracticeVersion: PracticeVersion | undefined;
  students: Student[];
  offeringStudents: Student[];

  // Server Connection Status
  isServerConnected: boolean;

  // Auto-save & Status
  saveStatus: SaveState;
  lastSavedTime: string;
  setSaveStatus: (status: SaveState) => void;
  triggerAutoSave: () => void;

  // Modals & Drawers
  isRubricModalOpen: boolean;
  setIsRubricModalOpen: (open: boolean) => void;
  rubricModalFocusSection?: ActiveTab;
  openRubricModal: (section?: ActiveTab) => void;
  isConflictModalOpen: boolean;
  setIsConflictModalOpen: (open: boolean) => void;

  // Notifications
  toastMessage: { text: string; type: 'success' | 'info' | 'error' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  clearToast: () => void;

  // Offering verification toggle
  toggleRosterVerification: (offeringId: string) => Promise<void>;
  toggleDatesVerification: (offeringId: string) => Promise<void>;

  // Reload database
  resetDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('instructor');
  const [view, setView] = useState<AppView>('penilaian');
  const [activeTab, setActiveTab] = useState<ActiveTab>('exercises');
  const [activeOfferingId, setActiveOfferingId] = useState<string>('CAD11-2026G-1C-P05');
  const [activeExerciseId, setActiveExerciseId] = useState<string>('ex-l01');
  const [activeSessionOrdinal, setActiveSessionOrdinal] = useState<number>(1);

  const [isServerConnected, setIsServerConnected] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<SaveState>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>(getCurrentWitaTime());

  const [isRubricModalOpen, setIsRubricModalOpen] = useState<boolean>(false);
  const [rubricModalFocusSection, setRubricModalFocusSection] = useState<ActiveTab | undefined>();
  const [isConflictModalOpen, setIsConflictModalOpen] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error' | 'warning';
  } | null>(null);

  // Initialize Dexie and Check Backend Sync
  useEffect(() => {
    const initApp = async () => {
      await initializeDatabase().catch(console.error);

      // Check backend server connection
      try {
        const health = await api.checkHealth();
        if (health.status === 'ok') {
          setIsServerConnected(true);
          console.log('[Sync] Connected to CAD 1.1 Backend Server (v' + health.version + ')');

          // Sync server data to Dexie
          const [stdRes, offRes, verRes] = await Promise.all([
            api.getStudents(),
            api.getOfferings(),
            api.getPracticeVersions(),
          ]);

          if (stdRes.data?.length > 0) {
            await db.students.bulkPut(stdRes.data);
          }
          if (offRes.data?.length > 0) {
            await db.offerings.bulkPut(offRes.data);
          }
          if (verRes.data?.length > 0) {
            await db.practiceVersions.bulkPut(verRes.data);
          }
        }
      } catch (err) {
        console.info('[Sync] Running in local offline-first mode with Dexie IndexedDB.');
        setIsServerConnected(false);
        // Clear dummy assessment data if present from previous sessions
        const dummyCleanupKey = 'cad11_dummy_data_cleaned_v2';
        if (!localStorage.getItem(dummyCleanupKey)) {
          await db.exerciseRecords.clear().catch(() => {});
          await db.pdfRecords.clear().catch(() => {});
          await db.softSkillRecords.clear().catch(() => {});
          await db.attendanceRecords.clear().catch(() => {});
          await db.snapshots.clear().catch(() => {});
          localStorage.setItem(dummyCleanupKey, 'true');
          console.info('[Init] Data dummy nilai berhasil dibersihkan.');
        }

        // Force sync instructorName in local Dexie
        await db.offerings.toCollection().modify((off) => {
          if (!off.instructorName || off.instructorName.includes('Fahlevi')) {
            off.instructorName = 'Reza Febriadi Rauf, A.Md.T';
          }
        }).catch(() => {});
      }
    };

    initApp();
  }, []);

  // Live queries from Dexie with fallback to initial seed
  const dexieOfferings = useLiveQuery(() => db.offerings.toArray()) || [];
  const dexiePracticeVersions = useLiveQuery(() => db.practiceVersions.toArray()) || [];
  const dexieStudents = useLiveQuery(() => db.students.toArray()) || [];

  const offerings = dexieOfferings.length > 0 ? dexieOfferings : INITIAL_OFFERINGS;
  const practiceVersions = dexiePracticeVersions.length > 0 ? dexiePracticeVersions : INITIAL_PRACTICE_VERSIONS;
  const students = dexieStudents.length > 0 ? dexieStudents : INITIAL_STUDENTS;

  const activeOffering = offerings.find((o) => o.id === activeOfferingId) || offerings[0];
  const fallbackVersion = INITIAL_PRACTICE_VERSIONS[0];
  const rawActiveVersion =
    practiceVersions.find((pv) => pv.id === (activeOffering?.practiceVersionId || 'CAD11-R1')) ||
    practiceVersions[0] ||
    fallbackVersion;

  const activePracticeVersion: PracticeVersion = {
    ...fallbackVersion,
    ...rawActiveVersion,
    componentWeights: rawActiveVersion.componentWeights || fallbackVersion.componentWeights,
    sections: Array.isArray(rawActiveVersion.sections) && rawActiveVersion.sections.length > 0 ? rawActiveVersion.sections : fallbackVersion.sections,
    exercises: Array.isArray(rawActiveVersion.exercises) && rawActiveVersion.exercises.length > 0 ? rawActiveVersion.exercises : fallbackVersion.exercises,
    exerciseCriteria: Array.isArray(rawActiveVersion.exerciseCriteria) && rawActiveVersion.exerciseCriteria.length > 0 ? rawActiveVersion.exerciseCriteria : fallbackVersion.exerciseCriteria,
    pdfCriteria: Array.isArray(rawActiveVersion.pdfCriteria) && rawActiveVersion.pdfCriteria.length > 0 ? rawActiveVersion.pdfCriteria : fallbackVersion.pdfCriteria,
    softSkillCriteria: Array.isArray(rawActiveVersion.softSkillCriteria) && rawActiveVersion.softSkillCriteria.length > 0 ? rawActiveVersion.softSkillCriteria : fallbackVersion.softSkillCriteria,
    attendancePolicy: rawActiveVersion.attendancePolicy || fallbackVersion.attendancePolicy,
  };

  const offeringStudents = (activeOffering?.studentIds || [])
    .map((sId) => students.find((s) => s.id === sId))
    .filter((s): s is Student => s !== undefined);

  const showToast = (
    text: string,
    type: 'success' | 'info' | 'error' | 'warning' = 'info'
  ) => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const clearToast = () => setToastMessage(null);

  const triggerAutoSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSavedTime(getCurrentWitaTime());
    }, 600);
  };

  const openRubricModal = (section?: ActiveTab) => {
    setRubricModalFocusSection(section || activeTab);
    setIsRubricModalOpen(true);
  };

  const toggleRosterVerification = async (offeringId: string) => {
    const off = await db.offerings.get(offeringId);
    if (off) {
      const nextStatus = !off.isRosterVerified;
      await db.offerings.update(offeringId, {
        isRosterVerified: nextStatus,
      });

      // Sync with server if connected
      if (isServerConnected) {
        api.toggleRosterVerification(offeringId).catch(console.error);
      }

      showToast(
        `Status verifikasi roster Pekan ${off.semesterWeek} ${
          nextStatus ? 'DIVERIFIKASI' : 'DIBATALKAN'
        }`,
        'success'
      );
    }
  };

  const toggleDatesVerification = async (offeringId: string) => {
    const off = await db.offerings.get(offeringId);
    if (off) {
      const nextStatus = !off.areDatesVerified;
      await db.offerings.update(offeringId, {
        areDatesVerified: nextStatus,
      });

      // Sync with server if connected
      if (isServerConnected) {
        api.toggleDatesVerification(offeringId).catch(console.error);
      }

      showToast(
        `Status verifikasi tanggal sesi Pekan ${off.semesterWeek} ${
          nextStatus ? 'DIVERIFIKASI' : 'DIBATALKAN'
        }`,
        'success'
      );
    }
  };

  const resetDatabase = async () => {
    if (isServerConnected) {
      await api.resetServerDatabase().catch(console.error);
    }
    await db.delete();
    await db.open();
    await initializeDatabase();
    showToast('Database berhasil direset ke konfigurasi awal!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        view,
        setView,
        activeTab,
        setActiveTab,
        activeOfferingId,
        setActiveOfferingId,
        activeExerciseId,
        setActiveExerciseId,
        activeSessionOrdinal,
        setActiveSessionOrdinal,
        offerings,
        activeOffering,
        practiceVersions,
        activePracticeVersion,
        students,
        offeringStudents,
        isServerConnected,
        saveStatus,
        lastSavedTime,
        setSaveStatus,
        triggerAutoSave,
        isRubricModalOpen,
        setIsRubricModalOpen,
        rubricModalFocusSection,
        openRubricModal,
        isConflictModalOpen,
        setIsConflictModalOpen,
        toastMessage,
        showToast,
        clearToast,
        toggleRosterVerification,
        toggleDatesVerification,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
