import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  Student,
  Offering,
  PracticeVersion,
  ExerciseGradeRecord,
  PdfGradeRecord,
  SoftSkillGradeRecord,
  AttendanceRecord,
  StudentCalculatedGrade,
} from '../types/assessment';
import { formatScore, formatPercent, getLetterGrade, getAcademicStatus } from './calcEngine';

export interface ExportDataPayload {
  offering: Offering;
  practiceVersion: PracticeVersion;
  students: Student[];
  grades: Record<string, StudentCalculatedGrade>;
  exerciseRecords: ExerciseGradeRecord[];
  pdfRecords: PdfGradeRecord[];
  softSkillRecords: SoftSkillGradeRecord[];
  attendanceRecords: AttendanceRecord[];
  isFinal: boolean;
}

export async function exportAssessmentToExcel(payload: ExportDataPayload): Promise<void> {
  const {
    offering,
    practiceVersion,
    students,
    grades,
    exerciseRecords,
    pdfRecords,
    softSkillRecords,
    attendanceRecords,
    isFinal,
  } = payload;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CAD 1.1 e-KAMPUS Web App';
  workbook.created = new Date();

  const brandFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const titleFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 14,
    bold: true,
    color: { argb: 'FF0F172A' },
  };

  // ==========================================
  // SHEET 1: RINGKASAN
  // ==========================================
  const ws1 = workbook.addWorksheet('Ringkasan');
  ws1.views = [{ showGridLines: true }];

  ws1.addRow(['LAPORAN PENILAIAN PRAKTIK CAD 1.1']).font = titleFont;
  ws1.addRow([`Status: ${isFinal ? 'RESMI / FINAL' : 'DRAF — BELUM DISAHKAN'}`]).font = {
    bold: true,
    color: { argb: isFinal ? 'FF059669' : 'FFD97706' },
  };
  ws1.addRow([]);

  ws1.addRow(['Semester', offering.semester]);
  ws1.addRow(['Kelas', offering.class]);
  ws1.addRow(['Pelaksanaan', offering.id]);
  ws1.addRow(['Pekan Semester', `Pekan ${offering.semesterWeek} (Minggu Kalender ${offering.calendarWeek})`]);
  ws1.addRow(['Rentang Tanggal', offering.dateRangeText]);
  ws1.addRow(['Instruktur', offering.instructorName]);
  ws1.addRow(['Versi Format', practiceVersion.name]);
  ws1.addRow(['Ambang Kelulusan', `${practiceVersion.passingThreshold},00 / 100`]);
  ws1.addRow(['Waktu Ekspor', new Date().toLocaleString('id-ID')]);
  ws1.addRow([]);

  // Stats summary
  const totalStudents = students.length;
  const passedCount = Object.values(grades).filter((g) => g.isPassed).length;
  const completeCount = Object.values(grades).filter((g) => g.isComplete).length;
  const validGrades = Object.values(grades)
    .map((g) => g.finalGrade)
    .filter((g): g is number => g !== null);
  const classAvg =
    validGrades.length > 0
      ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
      : null;

  ws1.addRow(['STATISTIK PENILAIAN']).font = { bold: true };
  ws1.addRow(['Jumlah Mahasiswa', `${totalStudents} Mahasiswa`]);
  ws1.addRow(['Penilaian Lengkap', `${completeCount} / ${totalStudents}`]);
  ws1.addRow(['Tingkat Kelulusan (≥ 75 & PDF Diterima)', `${passedCount} / ${totalStudents} (${formatPercent((passedCount / totalStudents) * 100)})`]);
  ws1.addRow(['Rata-rata Nilai Akhir Kelas', formatScore(classAvg)]);

  ws1.getColumn(1).width = 30;
  ws1.getColumn(2).width = 45;

  // ==========================================
  // SHEET 2: REKAP NILAI RESMI INSTITUSI (4 PILAR)
  // ==========================================
  const ws2 = workbook.addWorksheet('Rekap Nilai Institusi');
  ws2.views = [{ showGridLines: true }];

  // Row 1: Group Headers
  ws2.addRow(['No', 'NIM', 'Nama Mahasiswa', 'Nilai Latihan (L01–L10)', '', '', '', '', '', '', '', '', '', 'Nilai Institusi', '', '', '', 'Nilai Akhir', 'Status', 'Keterangan']);
  ws2.mergeCells('D1:M1');
  ws2.mergeCells('N1:Q1');

  const rekapHeaders = [
    'No',
    'NIM',
    'Nama Mahasiswa',
    ...practiceVersion.exercises.map((e) => e.code),
    'Kualitas* (70%)',
    'Kreativitas (5%)',
    'Sikap (10%)',
    'Laporan Kerja (15%)',
    'Nilai Akhir /100',
    'Huruf Mutu',
    'Bobot IP',
    'Status Kelulusan',
    'Keterangan',
  ];

  const hRow2 = ws2.addRow(rekapHeaders);
  hRow2.font = headerFont;
  hRow2.fill = brandFill;
  hRow2.height = 24;

  students.forEach((st, idx) => {
    const g = grades[st.id];
    const gradeInfo = getLetterGrade(g?.finalGrade);
    const academicStatus = getAcademicStatus(g?.finalGrade);
    const exScores = practiceVersion.exercises.map((e) =>
      g?.exerciseScores[e.id] !== null && g?.exerciseScores[e.id] !== undefined
        ? formatScore(g.exerciseScores[e.id])
        : ''
    );

    const row = ws2.addRow([
      idx + 1,
      st.nim, // Strictly text
      st.name,
      ...exScores,
      formatScore(g?.pillars?.kualitas),
      formatScore(g?.pillars?.kreativitas),
      formatScore(g?.pillars?.sikap),
      formatScore(g?.pillars?.laporanKerja),
      formatScore(g?.finalGrade),
      gradeInfo ? gradeInfo.letter : '',
      gradeInfo ? gradeInfo.gpa.toFixed(2) : '',
      academicStatus.label,
      g?.incompletionReasons?.join('; ') || academicStatus.description,
    ]);

    if (!g?.isComplete || academicStatus.status === 'draft') {
      row.getCell(rekapHeaders.length).font = { color: { argb: 'FFD97706' } };
    } else if (academicStatus.isPassed) {
      row.getCell(rekapHeaders.length).font = { color: { argb: 'FF059669' }, bold: true };
    } else {
      row.getCell(rekapHeaders.length).font = { color: { argb: 'FFDC2626' } };
    }
  });

  ws2.columns.forEach((col) => {
    col.width = 15;
  });
  ws2.getColumn(2).width = 16;
  ws2.getColumn(3).width = 30;
  ws2.getColumn(rekapHeaders.length).width = 35;

  // ==========================================
  // SHEET 3: DETAIL KRITERIA 0-4
  // ==========================================
  const ws3 = workbook.addWorksheet('Detail Kriteria 0-4');
  ws3.views = [{ showGridLines: true }];

  const detailHeaders: string[] = ['No', 'NIM', 'Nama Mahasiswa'];
  // Add Exercise criteria headers
  practiceVersion.exercises.forEach((ex) => {
    practiceVersion.exerciseCriteria.forEach((crit) => {
      detailHeaders.push(`${ex.code}-${crit.code}`);
    });
  });
  const pdfCritList = practiceVersion.pdfCriteria || [];
  const softCritList = practiceVersion.softSkillCriteria || [];
  const sessCount = practiceVersion.attendancePolicy?.sessionsCount || 5;

  // Add PDF criteria
  pdfCritList.forEach((crit) => {
    detailHeaders.push(`PDF-${crit.code}`);
  });
  // Add Soft Skill criteria for H1..H5
  for (let ord = 1; ord <= sessCount; ord++) {
    softCritList.forEach((crit) => {
      detailHeaders.push(`H${ord}-${crit.code}`);
    });
  }

  const hRow3 = ws3.addRow(detailHeaders);
  hRow3.font = headerFont;
  hRow3.fill = brandFill;
  hRow3.height = 24;

  students.forEach((st, idx) => {
    const rowValues: (string | number)[] = [idx + 1, st.nim, st.name];

    // Exercises raw scores
    practiceVersion.exercises.forEach((ex) => {
      const rec = exerciseRecords.find(
        (r) => r.studentId === st.id && r.exerciseId === ex.id
      );
      (practiceVersion.exerciseCriteria || []).forEach((crit) => {
        const sc = rec?.scores[crit.id];
        rowValues.push(sc !== null && sc !== undefined ? sc : '');
      });
    });

    // PDF raw scores
    const pdfRec = pdfRecords.find((r) => r.studentId === st.id);
    pdfCritList.forEach((crit) => {
      const sc = pdfRec?.scores[crit.id];
      rowValues.push(sc !== null && sc !== undefined ? sc : '');
    });

    // Soft Skill raw scores
    for (let ord = 1; ord <= sessCount; ord++) {
      const softRec = softSkillRecords.find(
        (r) => r.studentId === st.id && r.sessionOrdinal === ord
      );
      softCritList.forEach((crit) => {
        const sc = softRec?.scores[crit.id];
        rowValues.push(sc !== null && sc !== undefined ? sc : '');
      });
    }

    ws3.addRow(rowValues);
  });

  ws3.getColumn(1).width = 6;
  ws3.getColumn(2).width = 16;
  ws3.getColumn(3).width = 28;

  // ==========================================
  // SHEET 4: KEHADIRAN
  // ==========================================
  const ws4 = workbook.addWorksheet('Kehadiran');
  ws4.views = [{ showGridLines: true }];

  const attHeaders = [
    'No',
    'NIM',
    'Nama Mahasiswa',
    'H1 (Senin)',
    'H2 (Selasa)',
    'H3 (Rabu)',
    'H4 (Kamis)',
    'H5 (Jumat)',
    'Total Hadir',
    'Persentase Hadir',
    'Nilai Kehadiran /100',
  ];

  const hRow4 = ws4.addRow(attHeaders);
  hRow4.font = headerFont;
  hRow4.fill = brandFill;
  hRow4.height = 24;

  students.forEach((st, idx) => {
    const g = grades[st.id];
    let hadirCount = 0;
    const dayStatuses: string[] = [];

    for (let ord = 1; ord <= 5; ord++) {
      const rec = attendanceRecords.find(
        (r) => r.studentId === st.id && r.sessionOrdinal === ord
      );
      const stText = rec?.status ? rec.status.toUpperCase() : '—';
      if (rec?.status === 'hadir') hadirCount++;
      dayStatuses.push(stText);
    }

    ws4.addRow([
      idx + 1,
      st.nim,
      st.name,
      ...dayStatuses,
      `${hadirCount}/5`,
      formatPercent(g?.attendancePercentage),
      formatScore(g?.attendanceScore),
    ]);
  });

  ws4.columns.forEach((col) => {
    col.width = 16;
  });
  ws4.getColumn(1).width = 6;
  ws4.getColumn(3).width = 28;

  // ==========================================
  // SHEET 5: RUBRIK & BOBOT
  // ==========================================
  const ws5 = workbook.addWorksheet('Rubrik & Bobot');
  ws5.views = [{ showGridLines: true }];

  ws5.addRow(['STRUKTUR BOBOT & RUBRIK PENILAIAN']).font = titleFont;
  ws5.addRow([]);

  ws5.addRow(['Komponen Penilaian', 'Bobot (%)']).font = { bold: true };
  ws5.addRow(['10 Latihan Teknis CAD', `${practiceVersion.componentWeights.exercises}%`]);
  ws5.addRow(['Output PDF Hasil Praktik', `${practiceVersion.componentWeights.pdf}%`]);
  ws5.addRow(['Soft Skill & Sikap Kerja', `${practiceVersion.componentWeights.softskill}%`]);
  ws5.addRow(['Kehadiran 5 Hari', `${practiceVersion.componentWeights.attendance}%`]);
  ws5.addRow(['TOTAL BOBOT', '100%']).font = { bold: true };
  ws5.addRow([]);

  ws5.addRow(['RUBRIK KRITERIA LATIHAN']).font = { bold: true };
  practiceVersion.exerciseCriteria.forEach((crit) => {
    ws5.addRow([`${crit.code}: ${crit.name} (Bobot: ${crit.weight}%)`]).font = { bold: true };
    ws5.addRow(['Skor 4', crit.descriptors[4]]);
    ws5.addRow(['Skor 3', crit.descriptors[3]]);
    ws5.addRow(['Skor 2', crit.descriptors[2]]);
    ws5.addRow(['Skor 1', crit.descriptors[1]]);
    ws5.addRow(['Skor 0', crit.descriptors[0]]);
    ws5.addRow([]);
  });

  ws5.getColumn(1).width = 30;
  ws5.getColumn(2).width = 60;

  // Write and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const fileName = `Rekap_Nilai_CAD1.1_${offering.class}_Pekan${offering.semesterWeek}_${isFinal ? 'FINAL' : 'DRAF'}.xlsx`;
  saveAs(blob, fileName);
}
