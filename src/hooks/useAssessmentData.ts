import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useApp } from '../context/AppContext';
import {
  StudentCalculatedGrade,
  ExerciseGradeRecord,
  PdfGradeRecord,
  SoftSkillGradeRecord,
  AttendanceRecord,
  GradeSnapshot,
  ExerciseStatus,
  PdfSubmissionStatus,
  PdfInspectionStatus,
  SoftSkillStatus,
  AttendanceStatus,
} from '../types/assessment';
import { calculateStudentGrade } from '../lib/calcEngine';
import { api } from '../services/api';

export function useAssessmentData() {
  const {
    activeOfferingId,
    activePracticeVersion,
    offeringStudents,
    students,
    activeOffering,
    triggerAutoSave,
    showToast,
  } = useApp();

  // Query records for active offering
  const exerciseRecords =
    useLiveQuery(
      () =>
        db.exerciseRecords
          .where('offeringId')
          .equals(activeOfferingId)
          .toArray(),
      [activeOfferingId]
    ) || [];

  const pdfRecords =
    useLiveQuery(
      () =>
        db.pdfRecords
          .where('offeringId')
          .equals(activeOfferingId)
          .toArray(),
      [activeOfferingId]
    ) || [];

  const softSkillRecords =
    useLiveQuery(
      () =>
        db.softSkillRecords
          .where('offeringId')
          .equals(activeOfferingId)
          .toArray(),
      [activeOfferingId]
    ) || [];

  const attendanceRecords =
    useLiveQuery(
      () =>
        db.attendanceRecords
          .where('offeringId')
          .equals(activeOfferingId)
          .toArray(),
      [activeOfferingId]
    ) || [];

  const snapshots =
    useLiveQuery(
      () =>
        db.snapshots
          .where('offeringId')
          .equals(activeOfferingId)
          .toArray(),
      [activeOfferingId]
    ) || [];

  // All records across all offerings for All-Week Dashboard
  const allExerciseRecords = useLiveQuery(() => db.exerciseRecords.toArray(), []) || [];
  const allPdfRecords = useLiveQuery(() => db.pdfRecords.toArray(), []) || [];
  const allSoftSkillRecords = useLiveQuery(() => db.softSkillRecords.toArray(), []) || [];
  const allAttendanceRecords = useLiveQuery(() => db.attendanceRecords.toArray(), []) || [];

  // Compute live calculated grades for all students in active offering
  const studentGrades = useMemo<Record<string, StudentCalculatedGrade>>(() => {
    if (!activePracticeVersion) return {};
    const res: Record<string, StudentCalculatedGrade> = {};

    offeringStudents.forEach((student) => {
      const pdfRec = pdfRecords.find((r) => r.studentId === student.id);
      res[student.id] = calculateStudentGrade(
        student.id,
        activePracticeVersion,
        exerciseRecords,
        pdfRec,
        softSkillRecords,
        attendanceRecords
      );
    });

    return res;
  }, [
    activePracticeVersion,
    offeringStudents,
    exerciseRecords,
    pdfRecords,
    softSkillRecords,
    attendanceRecords,
  ]);

  // Compute live calculated grades for all 36 students across all offerings
  const allStudentGrades = useMemo<Record<string, StudentCalculatedGrade>>(() => {
    if (!activePracticeVersion) return {};
    const res: Record<string, StudentCalculatedGrade> = {};

    students.forEach((student) => {
      const pdfRec = allPdfRecords.find((r) => r.studentId === student.id);
      res[student.id] = calculateStudentGrade(
        student.id,
        activePracticeVersion,
        allExerciseRecords,
        pdfRec,
        allSoftSkillRecords,
        allAttendanceRecords
      );
    });

    return res;
  }, [
    activePracticeVersion,
    students,
    allExerciseRecords,
    allPdfRecords,
    allSoftSkillRecords,
    allAttendanceRecords,
  ]);

  // --- MUTATION ACTIONS ---

  // Update a single exercise criterion score or status
  const updateExerciseScore = async (
    studentId: string,
    exerciseId: string,
    criterionId: string,
    score: number | null
  ) => {
    const recordId = `rec-ex-${studentId}-${exerciseId}`;
    const existing = await db.exerciseRecords.get(recordId);

    const scores = existing ? { ...existing.scores } : {};
    scores[criterionId] = score;

    // Check completeness of exercise
    const allCriteria = activePracticeVersion?.exerciseCriteria || [];
    let isComplete = true;
    for (const crit of allCriteria) {
      if (scores[crit.id] === null || scores[crit.id] === undefined) {
        isComplete = false;
        break;
      }
    }

    const status: ExerciseStatus = isComplete ? 'dinilai' : 'draf';

    const exerciseData: ExerciseGradeRecord = {
      id: recordId,
      studentId,
      offeringId: activeOfferingId,
      exerciseId,
      scores,
      status,
      notes: existing?.notes || '',
      updatedAt: new Date().toISOString(),
      revision: (existing?.revision || 0) + 1,
    };

    await db.exerciseRecords.put(exerciseData);
    api.saveExerciseGrade(exerciseData).catch(() => {});
    triggerAutoSave();
  };

  // Update exercise notes
  const updateExerciseNote = async (
    studentId: string,
    exerciseId: string,
    notes: string
  ) => {
    const recordId = `rec-ex-${studentId}-${exerciseId}`;
    const existing = await db.exerciseRecords.get(recordId);

    await db.exerciseRecords.put({
      id: recordId,
      studentId,
      offeringId: activeOfferingId,
      exerciseId,
      scores: existing?.scores || {},
      status: existing?.status || 'draf',
      notes,
      updatedAt: new Date().toISOString(),
      revision: (existing?.revision || 0) + 1,
    });

    triggerAutoSave();
  };

  // Mark exercise as "Tidak Mengumpulkan" (scores 0 for all criteria, explicit reason required)
  const markExerciseNotSubmitted = async (
    studentId: string,
    exerciseId: string,
    reason: string
  ) => {
    const recordId = `rec-ex-${studentId}-${exerciseId}`;
    const existing = await db.exerciseRecords.get(recordId);

    const scores: Record<string, number | null> = {};
    (activePracticeVersion?.exerciseCriteria || []).forEach((c) => {
      scores[c.id] = 0;
    });

    await db.exerciseRecords.put({
      id: recordId,
      studentId,
      offeringId: activeOfferingId,
      exerciseId,
      scores,
      status: 'tidak_mengumpulkan',
      reasonNotSubmitted: reason,
      notes: `Tidak mengumpulkan: ${reason}`,
      updatedAt: new Date().toISOString(),
      revision: (existing?.revision || 0) + 1,
    });

    triggerAutoSave();
    showToast('Tugas ditandai Tidak Mengumpulkan (skor 0).', 'info');
  };

  // Update PDF criterion score
  const updatePdfScore = async (
    studentId: string,
    criterionId: string,
    score: number | null
  ) => {
    const recordId = `rec-pdf-${studentId}`;
    const existing = await db.pdfRecords.get(recordId);

    const scores = existing ? { ...existing.scores } : {};
    scores[criterionId] = score;

    const pdfData: PdfGradeRecord = {
      id: recordId,
      studentId,
      offeringId: activeOfferingId,
      artifacts: existing?.artifacts || [],
      activeArtifactVersion: existing?.activeArtifactVersion || null,
      submissionStatus: existing?.submissionStatus || 'belum_dikumpulkan',
      inspectionStatus: existing?.inspectionStatus || 'belum_diperiksa',
      scores,
      notes: existing?.notes || '',
      updatedAt: new Date().toISOString(),
      revision: (existing?.revision || 0) + 1,
    };

    await db.pdfRecords.put(pdfData);
    api.savePdfGrade(pdfData).catch(() => {});
    triggerAutoSave();
  };

  // Update PDF status (Submission & Inspection)
  const updatePdfStatus = async (
    studentId: string,
    submissionStatus: PdfSubmissionStatus,
    inspectionStatus: PdfInspectionStatus,
    notes?: string
  ) => {
    const recordId = `rec-pdf-${studentId}`;
    const existing = await db.pdfRecords.get(recordId);

    const pdfData: PdfGradeRecord = {
      id: recordId,
      studentId,
      offeringId: activeOfferingId,
      artifacts: existing?.artifacts || [],
      activeArtifactVersion: existing?.activeArtifactVersion || null,
      submissionStatus,
      inspectionStatus,
      scores: existing?.scores || {},
      notes: notes !== undefined ? notes : existing?.notes || '',
      updatedAt: new Date().toISOString(),
      revision: (existing?.revision || 0) + 1,
    };

    await db.pdfRecords.put(pdfData);
    api.savePdfGrade(pdfData).catch(() => {});
    triggerAutoSave();
  };

  // Upload/Simulate PDF File
  const uploadPdfFile = async (
    studentId: string,
    fileName: string,
    fileSize: number
  ) => {
    const recordId = `rec-pdf-${studentId}`;
    const existing = await db.pdfRecords.get(recordId);

    const currentVersion = (existing?.activeArtifactVersion || 0) + 1;
    const newArtifact = {
      id: `art-${studentId}-v${currentVersion}`,
      version: currentVersion,
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Instruktur',
      fileUrl: '#',
    };

    const artifacts = [...(existing?.artifacts || []), newArtifact];

    await db.pdfRecords.put({
      id: recordId,
      studentId,
      offeringId: activeOfferingId,
      artifacts,
      activeArtifactVersion: currentVersion,
      submissionStatus: 'dikumpulkan',
      inspectionStatus: 'belum_diperiksa',
      scores: existing?.scores || {},
      notes: existing?.notes || '',
      updatedAt: new Date().toISOString(),
      revision: (existing?.revision || 0) + 1,
    });

    triggerAutoSave();
    showToast(`Berkas PDF v${currentVersion} berhasil diunggah!`, 'success');
  };

  // Update Soft Skill criterion score
  const updateSoftSkillScore = async (
    studentId: string,
    sessionOrdinal: number,
    criterionId: string,
    score: number | null
  ) => {
    const recordId = `rec-soft-${studentId}-h${sessionOrdinal}`;
    const existing = await db.softSkillRecords.get(recordId);

    const scores = existing ? { ...existing.scores } : {};
    scores[criterionId] = score;

    // Check completeness
    const allCriteria = activePracticeVersion?.softSkillCriteria || [];
    let isComplete = true;
    for (const crit of allCriteria) {
      if (scores[crit.id] === null || scores[crit.id] === undefined) {
        isComplete = false;
        break;
      }
    }

    const status: SoftSkillStatus = isComplete ? 'dinilai' : 'draf';

    const softSkillData: SoftSkillGradeRecord = {
      id: recordId,
      studentId,
      offeringId: activeOfferingId,
      sessionOrdinal,
      scores,
      status,
      notes: existing?.notes || '',
      updatedAt: new Date().toISOString(),
      revision: (existing?.revision || 0) + 1,
    };

    await db.softSkillRecords.put(softSkillData);
    api.saveSoftSkillGrade(softSkillData).catch(() => {});
    triggerAutoSave();
  };

  // Set Soft Skill "Tidak Teramati"
  const setSoftSkillUnobserved = async (
    studentId: string,
    sessionOrdinal: number,
    reason: string
  ) => {
    const recordId = `rec-soft-${studentId}-h${sessionOrdinal}`;
    const existing = await db.softSkillRecords.get(recordId);

    const softSkillData: SoftSkillGradeRecord = {
      id: recordId,
      studentId,
      offeringId: activeOfferingId,
      sessionOrdinal,
      scores: {},
      status: 'tidak_teramati',
      reasonUnobserved: reason,
      notes: `Tidak teramati: ${reason}`,
      updatedAt: new Date().toISOString(),
      revision: (existing?.revision || 0) + 1,
    };

    await db.softSkillRecords.put(softSkillData);
    api.saveSoftSkillGrade(softSkillData).catch(() => {});
    triggerAutoSave();
    showToast('Observasi soft skill ditandai Tidak Teramati.', 'info');
  };

  // Update Soft Skill Note
  const updateSoftSkillNote = async (
    studentId: string,
    sessionOrdinal: number,
    notes: string
  ) => {
    const recordId = `rec-soft-${studentId}-h${sessionOrdinal}`;
    const existing = await db.softSkillRecords.get(recordId);

    const softSkillData: SoftSkillGradeRecord = {
      id: recordId,
      studentId,
      offeringId: activeOfferingId,
      sessionOrdinal,
      scores: existing?.scores || {},
      status: existing?.status || 'draf',
      notes,
      updatedAt: new Date().toISOString(),
      revision: (existing?.revision || 0) + 1,
    };

    await db.softSkillRecords.put(softSkillData);
    api.saveSoftSkillGrade(softSkillData).catch(() => {});
    triggerAutoSave();
  };

  // Update Attendance Status
  const updateAttendanceStatus = async (
    studentId: string,
    sessionOrdinal: number,
    status: AttendanceStatus | null,
    notes?: string
  ) => {
    const recordId = `rec-att-${studentId}-h${sessionOrdinal}`;
    const existing = await db.attendanceRecords.get(recordId);

    const attData: AttendanceRecord = {
      id: recordId,
      studentId,
      offeringId: activeOfferingId,
      sessionOrdinal,
      status,
      notes: notes !== undefined ? notes : existing?.notes || '',
      updatedAt: new Date().toISOString(),
      revision: (existing?.revision || 0) + 1,
    };

    await db.attendanceRecords.put(attData);
    api.saveAttendanceGrade(attData).catch(() => {});
    triggerAutoSave();
  };

  // Bulk mark empty attendance as "hadir"
  const bulkMarkPresentForEmpty = async (sessionOrdinal: number) => {
    let affectedCount = 0;
    const updates: AttendanceRecord[] = [];

    for (const student of offeringStudents) {
      const recordId = `rec-att-${student.id}-h${sessionOrdinal}`;
      const existing = await db.attendanceRecords.get(recordId);

      if (!existing || !existing.status) {
        affectedCount++;
        updates.push({
          id: recordId,
          studentId: student.id,
          offeringId: activeOfferingId,
          sessionOrdinal,
          status: 'hadir',
          notes: 'Tercatat otomatis (Hadir untuk Semua)',
          updatedAt: new Date().toISOString(),
          revision: (existing?.revision || 0) + 1,
        });
      }
    }

    if (updates.length > 0) {
      await db.attendanceRecords.bulkPut(updates);
      triggerAutoSave();
      showToast(
        `${affectedCount} mahasiswa berhasil ditandai Hadir untuk H${sessionOrdinal}!`,
        'success'
      );
    } else {
      showToast('Seluruh mahasiswa pada hari ini sudah memiliki catatan absensi.', 'info');
    }
  };

  // Finalize Grade Snapshot
  const finalizeGrades = async (finalizedBy: string) => {
    if (!activeOffering || !activePracticeVersion) return;

    const newSnapshots: GradeSnapshot[] = offeringStudents.map((st) => {
      const g = studentGrades[st.id];
      return {
        id: `snap-${activeOfferingId}-${st.id}-v1`,
        offeringId: activeOfferingId,
        studentId: st.id,
        snapshotNumber: 1,
        finalizedAt: new Date().toISOString(),
        finalizedBy,
        practiceVersionId: activePracticeVersion.id,
        calculatedGrade: g,
        status: 'final',
      };
    });

    await db.snapshots.bulkPut(newSnapshots);
    api.finalizeGrades({
      offeringId: activeOfferingId,
      snapshots: newSnapshots,
      instructorName: finalizedBy,
    }).catch(() => {});

    await db.auditEvents.add({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: finalizedBy,
      action: 'FINALIZE_GRADES',
      targetType: 'OFFERING',
      targetId: activeOfferingId,
      details: `Pengesahan nilai final untuk ${offeringStudents.length} mahasiswa Pekan ${activeOffering.semesterWeek}.`,
    });

    showToast('Nilai Pekan ini BERHASIL DIFINALISASI & DISAHKAN!', 'success');
  };

  // Reopen Grade Revision
  const reopenGrades = async (reason: string, actor: string) => {
    const existingSnaps = await db.snapshots
      .where('offeringId')
      .equals(activeOfferingId)
      .toArray();

    for (const snap of existingSnaps) {
      await db.snapshots.update(snap.id, {
        status: 'reopened',
        reopenReason: reason,
        reopenedAt: new Date().toISOString(),
        reopenedBy: actor,
      });
    }

    api.reopenGrades({
      offeringId: activeOfferingId,
      reason,
      actor,
    }).catch(() => {});

    await db.auditEvents.add({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action: 'REOPEN_GRADES',
      targetType: 'OFFERING',
      targetId: activeOfferingId,
      details: `Pembukaan revisi nilai Pekan ${activeOffering?.semesterWeek}. Alasan: ${reason}`,
    });

    showToast('Revisi nilai dibuka. Perubahan sekarang dapat disimpan.', 'info');
  };

  return {
    exerciseRecords,
    pdfRecords,
    softSkillRecords,
    attendanceRecords,
    snapshots,
    studentGrades,
    allExerciseRecords,
    allPdfRecords,
    allSoftSkillRecords,
    allAttendanceRecords,
    allStudentGrades,
    updateExerciseScore,
    updateExerciseNote,
    markExerciseNotSubmitted,
    updatePdfScore,
    updatePdfStatus,
    uploadPdfFile,
    updateSoftSkillScore,
    setSoftSkillUnobserved,
    updateSoftSkillNote,
    updateAttendanceStatus,
    bulkMarkPresentForEmpty,
    finalizeGrades,
    reopenGrades,
  };
}
