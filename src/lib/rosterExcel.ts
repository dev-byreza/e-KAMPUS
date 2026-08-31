import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Student } from '../types/assessment';

export interface ParsedRosterRow {
  rowNumber: number;
  semester: string;
  kelas: string;
  kodePraktik: string;
  pekanSemester: number;
  mingguKalender: number;
  nim: string;
  nama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  isValid: boolean;
  validationError?: string;
}

/**
 * Generates and downloads an official Excel template (.xlsx) for Roster & Schedule import.
 */
export async function downloadRosterTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CAD 1.1 e-KAMPUS';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Master Peserta & Jadwal');
  ws.views = [{ showGridLines: true }];

  // Title block
  const titleRow = ws.addRow(['TEMPLAT IMPOR MASTER PESERTA & JADWAL PRAKTIK CAD 1.1']);
  titleRow.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF1E293B' } };

  const subRow = ws.addRow([
    'Petunjuk: Isi data mahasiswa dan jadwal sesuai kolom di bawah. Kolom NIM wajib diawali tanda petik tunggal (\') agar terbaca sebagai teks.',
  ]);
  subRow.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
  ws.addRow([]);

  // Headers matching PRD Section 19
  const headers = [
    'semester',
    'kelas',
    'kode_praktik',
    'pekan_semester',
    'minggu_kalender',
    'nim',
    'nama',
    'tanggal_mulai',
    'tanggal_selesai',
  ];

  const headerRow = ws.addRow(headers);
  headerRow.height = 24;
  headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }, // Indigo-600
  };

  // Sample data rows
  const sampleData = [
    ['Ganjil 2026/2027', '1C', 'CAD 1.1', 3, 34, '22603003', 'Affan Farsyah', '2026-08-17', '2026-08-21'],
    ['Ganjil 2026/2027', '1C', 'CAD 1.1', 3, 34, '22603004', 'Afiqah Azwa Safrina', '2026-08-17', '2026-08-21'],
    ['Ganjil 2026/2027', '1C', 'CAD 1.1', 5, 36, '22603001', 'Achmad Fawzan', '2026-08-31', '2026-09-04'],
    ['Ganjil 2026/2027', '1C', 'CAD 1.1', 5, 36, '22603005', 'Andika Azis', '2026-08-31', '2026-09-04'],
    ['Ganjil 2026/2027', '1C', 'CAD 1.1', 7, 38, '22603002', 'Ade Meilan Alifia Sulaeman', '2026-09-14', '2026-09-18'],
  ];

  sampleData.forEach((row) => {
    const r = ws.addRow(row);
    // Explicitly set NIM cell to string format
    r.getCell(6).numFmt = '@';
  });

  // Set column widths
  ws.getColumn(1).width = 18;
  ws.getColumn(2).width = 10;
  ws.getColumn(3).width = 14;
  ws.getColumn(4).width = 16;
  ws.getColumn(5).width = 16;
  ws.getColumn(6).width = 16;
  ws.getColumn(7).width = 30;
  ws.getColumn(8).width = 16;
  ws.getColumn(9).width = 16;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, 'Template_Import_Peserta_Jadwal_CAD1.1.xlsx');
}

/**
 * Parses an uploaded Excel file (.xlsx) into structured roster rows.
 */
export async function parseRosterExcel(file: File): Promise<ParsedRosterRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Lembar kerja (worksheet) tidak ditemukan dalam file Excel.');
  }

  const rows: ParsedRosterRow[] = [];
  let headerRowIndex = -1;

  // Find header row by checking for 'nim' and 'nama'
  worksheet.eachRow((row, rowNumber) => {
    const values = row.values as any[];
    if (headerRowIndex === -1 && Array.isArray(values)) {
      const lowerValues = values.map((v) => String(v || '').toLowerCase().trim());
      if (lowerValues.includes('nim') && lowerValues.includes('nama')) {
        headerRowIndex = rowNumber;
      }
    } else if (headerRowIndex !== -1 && rowNumber > headerRowIndex) {
      const semester = String(row.getCell(1).value || 'Ganjil 2026/2027').trim();
      const kelas = String(row.getCell(2).value || '1C').trim();
      const kodePraktik = String(row.getCell(3).value || 'CAD 1.1').trim();
      const pekanSemester = Number(row.getCell(4).value) || 5;
      const mingguKalender = Number(row.getCell(5).value) || 36;
      const nim = String(row.getCell(6).value || '').trim();
      const nama = String(row.getCell(7).value || '').trim();
      const tanggalMulai = String(row.getCell(8).value || '').trim();
      const tanggalSelesai = String(row.getCell(9).value || '').trim();

      if (nim || nama) {
        const isValid = Boolean(nim && nama && nim.length >= 4);
        let validationError: string | undefined;

        if (!nim) validationError = 'NIM kosong';
        else if (!nama) validationError = 'Nama mahasiswa kosong';
        else if (nim.length < 4) validationError = 'Format NIM tidak valid';

        rows.push({
          rowNumber,
          semester,
          kelas,
          kodePraktik,
          pekanSemester,
          mingguKalender,
          nim,
          nama,
          tanggalMulai,
          tanggalSelesai,
          isValid,
          validationError,
        });
      }
    }
  });

  return rows;
}
