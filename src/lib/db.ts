import Dexie, { type Table } from 'dexie';
import {
  Student,
  Offering,
  PracticeVersion,
  ExerciseGradeRecord,
  PdfGradeRecord,
  SoftSkillGradeRecord,
  AttendanceRecord,
  GradeSnapshot,
  AuditEvent,
} from '../types/assessment';

export class CADAssessmentDB extends Dexie {
  students!: Table<Student, string>;
  offerings!: Table<Offering, string>;
  practiceVersions!: Table<PracticeVersion, string>;
  exerciseRecords!: Table<ExerciseGradeRecord, string>;
  pdfRecords!: Table<PdfGradeRecord, string>;
  softSkillRecords!: Table<SoftSkillGradeRecord, string>;
  attendanceRecords!: Table<AttendanceRecord, string>;
  snapshots!: Table<GradeSnapshot, string>;
  auditEvents!: Table<AuditEvent, string>;

  constructor() {
    super('CAD11AssessmentDB');
    this.version(1).stores({
      students: 'id, nim, class',
      offerings: 'id, practiceCode, semesterWeek, practiceVersionId',
      practiceVersions: 'id, status',
      exerciseRecords: 'id, [studentId+exerciseId], offeringId, studentId, exerciseId',
      pdfRecords: 'id, [studentId+offeringId], studentId, offeringId',
      softSkillRecords: 'id, [studentId+sessionOrdinal], offeringId, studentId, sessionOrdinal',
      attendanceRecords: 'id, [studentId+sessionOrdinal], offeringId, studentId, sessionOrdinal',
      snapshots: 'id, offeringId, studentId',
      auditEvents: 'id, timestamp, actor',
    });
  }
}

export const db = new CADAssessmentDB();

// --- INITIAL SEED DATA (Lampiran A PRD) ---

export const INITIAL_STUDENTS: Student[] = [
  // Pekan 3 (12 mahasiswa)
  { id: 'std-22603003', nim: '22603003', name: 'Affan Farsyah', class: '1C' },
  { id: 'std-22603004', nim: '22603004', name: 'Afiqah Azwa Safrina', class: '1C' },
  { id: 'std-22603006', nim: '22603006', name: 'Anesya Nurhawizah', class: '1C' },
  { id: 'std-22603010', nim: '22603010', name: 'Daniel Adlan Sura Parinding', class: '1C' },
  { id: 'std-22603012', nim: '22603012', name: 'Falya Aisyah Naswah', class: '1C' },
  { id: 'std-22603015', nim: '22603015', name: 'Khumaira Khaerunnisa', class: '1C' },
  { id: 'std-22603020', nim: '22603020', name: 'Muh.Raihan Aryan', class: '1C' },
  { id: 'std-22603021', nim: '22603021', name: 'Muhammad Abyan Zaky', class: '1C' },
  { id: 'std-22603025', nim: '22603025', name: 'Ranita Rosa Putri', class: '1C' },
  { id: 'std-22603027', nim: '22603027', name: 'Rizky Ramadhani A.', class: '1C' },
  { id: 'std-22603030', nim: '22603030', name: 'Saskia Uhti Ramadhani', class: '1C' },
  { id: 'std-22603035', nim: '22603035', name: 'Winda Tri Lestari', class: '1C' },

  // Pekan 5 (12 mahasiswa)
  { id: 'std-22603001', nim: '22603001', name: 'Achmad Fawzan', class: '1C' },
  { id: 'std-22603005', nim: '22603005', name: 'Andika Azis', class: '1C' },
  { id: 'std-22603007', nim: '22603007', name: 'Ayu Anugrah', class: '1C' },
  { id: 'std-22603011', nim: '22603011', name: 'Dede Irawan', class: '1C' },
  { id: 'std-22603013', nim: '22603013', name: 'Haura Hafizhah', class: '1C' },
  { id: 'std-22603016', nim: '22603016', name: 'M. Fauzan Adhitya Pratama H', class: '1C' },
  { id: 'std-22603018', nim: '22603018', name: 'Muh.Diaz Raditya B.', class: '1C' },
  { id: 'std-22603024', nim: '22603024', name: 'Nadya Zalzabila', class: '1C' },
  { id: 'std-22603028', nim: '22603028', name: 'Rudhi Adhana Zet', class: '1C' },
  { id: 'std-22603031', nim: '22603031', name: 'Sayyef Al Islam', class: '1C' },
  { id: 'std-22603032', nim: '22603032', name: 'Tazkia Kausara', class: '1C' },
  { id: 'std-22603036', nim: '22603036', name: 'Yulfikatrin Yuyun', class: '1C' },

  // Pekan 7 (12 mahasiswa)
  { id: 'std-22603002', nim: '22603002', name: 'Ade Meilan Alifia Sulaeman', class: '1C' },
  { id: 'std-22603008', nim: '22603008', name: 'Ayu Irmayanti', class: '1C' },
  { id: 'std-22603009', nim: '22603009', name: 'Bunga Cahya Putri Jenal', class: '1C' },
  { id: 'std-22603014', nim: '22603014', name: 'Juan Farand', class: '1C' },
  { id: 'std-22603017', nim: '22603017', name: 'Muh. Anugrah Sesar', class: '1C' },
  { id: 'std-22603019', nim: '22603019', name: 'Muh. Fakhrul Al Farezqy Rozadin', class: '1C' },
  { id: 'std-22603022', nim: '22603022', name: 'Muhammad Agam Haq', class: '1C' },
  { id: 'std-22603023', nim: '22603023', name: 'Muhammad Aidil Ahmadi', class: '1C' },
  { id: 'std-22603026', nim: '22603026', name: 'Rausyan Fikran', class: '1C' },
  { id: 'std-22603029', nim: '22603029', name: 'Salsabila Aprilia Sukardi', class: '1C' },
  { id: 'std-22603033', nim: '22603033', name: 'Wahidatul Hasanah', class: '1C' },
  { id: 'std-22603034', nim: '22603034', name: 'William Gredi Sidwel Alinsky', class: '1C' },
];

export const INITIAL_OFFERINGS: Offering[] = [
  {
    id: 'CAD11-2026G-1C-P03',
    practiceCode: 'CAD 1.1',
    semester: 'Ganjil 2026/2027',
    class: '1C',
    semesterWeek: 3,
    calendarWeek: 34,
    dateRangeText: '17–21 Agustus 2026',
    startDate: '2026-08-17',
    endDate: '2026-08-21',
    studentIds: [
      'std-22603003', 'std-22603004', 'std-22603006', 'std-22603010',
      'std-22603012', 'std-22603015', 'std-22603020', 'std-22603021',
      'std-22603025', 'std-22603027', 'std-22603030', 'std-22603035',
    ],
    practiceVersionId: 'CAD11-R1',
    instructorName: 'Reza Febriadi Rauf, A.Md.T',
    isRosterVerified: true,
    areDatesVerified: true,
  },
  {
    id: 'CAD11-2026G-1C-P05',
    practiceCode: 'CAD 1.1',
    semester: 'Ganjil 2026/2027',
    class: '1C',
    semesterWeek: 5,
    calendarWeek: 36,
    dateRangeText: '31 Agustus–4 September 2026',
    startDate: '2026-08-31',
    endDate: '2026-09-04',
    studentIds: [
      'std-22603001', 'std-22603005', 'std-22603007', 'std-22603011',
      'std-22603013', 'std-22603016', 'std-22603018', 'std-22603024',
      'std-22603028', 'std-22603031', 'std-22603032', 'std-22603036',
    ],
    practiceVersionId: 'CAD11-R1',
    instructorName: 'Reza Febriadi Rauf, A.Md.T',
    isRosterVerified: true,
    areDatesVerified: true,
  },
  {
    id: 'CAD11-2026G-1C-P07',
    practiceCode: 'CAD 1.1',
    semester: 'Ganjil 2026/2027',
    class: '1C',
    semesterWeek: 7,
    calendarWeek: 38,
    dateRangeText: '14–18 September 2026',
    startDate: '2026-09-14',
    endDate: '2026-09-18',
    studentIds: [
      'std-22603002', 'std-22603008', 'std-22603009', 'std-22603014',
      'std-22603017', 'std-22603019', 'std-22603022', 'std-22603023',
      'std-22603026', 'std-22603029', 'std-22603033', 'std-22603034',
    ],
    practiceVersionId: 'CAD11-R1',
    instructorName: 'Reza Febriadi Rauf, A.Md.T',
    isRosterVerified: false,
    areDatesVerified: false,
  },
];

export const INITIAL_PRACTICE_VERSIONS: PracticeVersion[] = [
  {
    id: 'CAD11-R1',
    name: 'CAD 1.1 — Versi R1 (Standar 10 Latihan)',
    description: 'Format baku praktik CAD 1.1: 10 Latihan, 1 PDF Gabungan, 4 Aspek Soft Skill, 5 Sesi Absensi.',
    status: 'published',
    publishedAt: '2026-08-15T08:00:00Z',
    publishedBy: 'Admin Unit CAD',
    componentWeights: {
      exercises: 60,
      pdf: 15,
      softskill: 15,
      attendance: 10,
    },
    sections: [
      { id: 'exercises', buttonLabel: 'ReDrawn 2D', order: 1, weight: 60 },
      { id: 'pdf', buttonLabel: 'Layout & Plot', order: 2, weight: 15 },
      { id: 'softskill', buttonLabel: 'Soft Skill', order: 3, weight: 15 },
      { id: 'attendance', buttonLabel: 'Kehadiran 5 Hari', order: 4, weight: 10 },
    ],
    exercises: [
      {
        id: 'ex-l01',
        code: 'L01',
        title: 'Garis & Koordinat Relatif',
        topic: 'Dasar LINE, koordinat polar & kartesian',
        weight: 10,
        instructions: 'Buat geometri kontur dasar menggunakan koordinat absolut dan relatif sesuai dimensi.',
        isReady: true,
      },
      {
        id: 'ex-l02',
        code: 'L02',
        title: 'Kontur & Fitur Kotak',
        topic: 'RECTANG, OFFSET dasar, OSNAP Endpoint',
        weight: 10,
        instructions: 'Konstruksi gambar kotak bertingkat dengan batas snap presisi.',
        isReady: true,
      },
      {
        id: 'ex-l03',
        code: 'L03',
        title: 'Lingkaran, TRIM & EXTEND',
        topic: 'CIRCLE, TRIM, EXTEND, Center OSNAP',
        weight: 10,
        instructions: 'Gambar lubang bor dan radius dalam dengan pemotongan garis TRIM.',
        isReady: true,
      },
      {
        id: 'ex-l04',
        code: 'L04',
        title: 'ARC, CHAMFER & FILLET',
        topic: 'Modifikasi sudut dan busur radius',
        weight: 10,
        instructions: 'Terapkan chamfer 2x45° dan fillet R5 pada seluruh sudut part.',
        isReady: true,
      },
      {
        id: 'ex-l05',
        code: 'L05',
        title: 'Tangen & Multi-OFFSET',
        topic: 'Tangen lingkaran, OFFSET bertingkat',
        weight: 10,
        instructions: 'Sambungkan dua lingkaran tidak sepusat dengan garis singgung tangen presisi.',
        isReady: true,
      },
      {
        id: 'ex-l06',
        code: 'L06',
        title: 'Profil Lingkaran & Tangen Kompleks',
        topic: 'Kombinasi CIRCLE TTR & fillet bertumpuk',
        weight: 10,
        instructions: 'Buat profil cam mekanik dengan radius busur multi-tangen.',
        isReady: true,
      },
      {
        id: 'ex-l07',
        code: 'L07',
        title: 'Profil Simetris & MIRROR',
        topic: 'MIRROR, sumbu simetri, centerline',
        weight: 10,
        instructions: 'Gambar separuh kontur braket lalu duplikasi menggunakan perintah MIRROR.',
        isReady: true,
      },
      {
        id: 'ex-l08',
        code: 'L08',
        title: 'Profil Poros Bertingkat & ARC',
        topic: 'Poros silindris, alur pasak, detail chamfer',
        weight: 10,
        instructions: 'Konstruksi poros transmisi dengan 4 diameter bertingkat dan alur snap-ring.',
        isReady: true,
      },
      {
        id: 'ex-l09',
        code: 'L09',
        title: 'Roda Gigi Sederhana / Flens',
        topic: 'POLAR ARRAY, profil gigi involute',
        weight: 10,
        instructions: 'Soal pengayaan: Duplikasi gigi flens melingkar dengan Polar Array.',
        isReady: true,
      },
      {
        id: 'ex-l10',
        code: 'L10',
        title: 'Assembly 2D & Penomoran Bagian',
        topic: 'Perakitan komponen 2D, Balon teks & Etiket',
        weight: 10,
        instructions: 'Soal pengayaan: Rakit L01-L08 dalam satu file assembly dengan etiket lengkap.',
        isReady: true,
      },
    ],
    exerciseCriteria: [
      {
        id: 'crit-ex-k1',
        code: 'K1',
        name: 'Kelengkapan bentuk & kontur',
        weight: 30,
        descriptors: {
          4: 'Seluruh geometri, lubang, dan kontur terbentuk lengkap tanpa bagian hilang.',
          3: 'Bentuk utama lengkap; terdapat kelalaian kecil pada detail minor.',
          2: 'Sebagian fitur/kontur utama belum terselesaikan (60-80%).',
          1: 'Banyak bentuk tidak lengkap atau salah konstruksi.',
          0: 'Belum ada bukti ketercapaian bentuk geometri sama sekali.',
        },
      },
      {
        id: 'crit-ex-k2',
        code: 'K2',
        name: 'Presisi ukuran, posisi & tangen',
        weight: 40,
        descriptors: {
          4: 'Ukuran, posisi, sudut, dan hubungan tangen presisi 100% sesuai acuan.',
          3: 'Presisi tinggi dengan deviasi kecil pada 1-2 dimensi tidak kritis.',
          2: 'Beberapa dimensi atau titik tangen meleset dari acuan gambar.',
          1: 'Banyak ukuran salah dan sambungan garis patah/overlap.',
          0: 'Dimensi tidak terukur atau meleset total dari soal.',
        },
      },
      {
        id: 'crit-ex-k3',
        code: 'K3',
        name: 'Pemakaian perintah CAD & efisiensi layer',
        weight: 20,
        descriptors: {
          4: 'Menggunakan perintah yang tepat (Trim, Fillet, Mirror) dan manajemen layer rapi.',
          3: 'Perintah efektif namun manajemen layer atau warna kurang konsisten.',
          2: 'Menggambar manual tanpa memanfaatkan perintah modifikasi cepat CAD.',
          1: 'Penggunaan tools dasar sangat terbatas dan lambat.',
          0: 'Tidak menunjukkan pemahaman perintah CAD.',
        },
      },
      {
        id: 'crit-ex-k4',
        code: 'K4',
        name: 'Persiapan & kebersihan kerja CAD',
        weight: 10,
        descriptors: {
          4: 'Drawing limits, grid, snap, units diatur standar dan bebas garis sampah.',
          3: 'Pengaturan standar lengkap dengan sedikit garis bantu tak terpakai.',
          2: 'Pengaturan unit/limits default tanpa penyesuaian gambar.',
          1: 'Gambar kotor dan banyak objek duplikat tumpang tindih.',
          0: 'File tidak tertata atau berantakan.',
        },
      },
    ],
    pdfCriteria: [
      {
        id: 'crit-pdf-k1',
        code: 'K1',
        name: 'Standardisasi Layer, Lineweight & Tipe Garis',
        weight: 30,
        descriptors: {
          4: 'Layer terdefinisi standar (Garis Utama, Sumbu, Dimensi, Arsir, Etiket), lineweight kontras tajam saat plot.',
          3: 'Layer dan tipe garis sesuai standar, ada 1 objek minor pada layer default.',
          2: 'Sebagian objek tidak pada layer standar atau lineweight saat plot seragam tanpa diferensiasi.',
          1: 'Tidak menggunakan layer secara konsisten, tampilan garis hasil plot berantakan.',
          0: 'Tanpa pembagian layer sama sekali.',
        },
      },
      {
        id: 'crit-pdf-k2',
        code: 'K2',
        name: 'Pengaturan Kertas, Orientasi & Skala Plot',
        weight: 30,
        descriptors: {
          4: 'Kertas A4/A3 standar, orientasi Landscape, skala tepat (1:1 / 1:2) dan terpusat (Center the plot).',
          3: 'Skala tepat namun margin kertas sedikit tidak simetris.',
          2: 'Skala Fit to Paper tanpa perbandingan angka skala teknik standar.',
          1: 'Gambar terpotong tepi kertas atau salah orientasi.',
          0: 'Kertas dan skala acak-acakan.',
        },
      },
      {
        id: 'crit-pdf-k3',
        code: 'K3',
        name: 'Keterbacaan Garis, Anotasi & Dimensi',
        weight: 25,
        descriptors: {
          4: 'Ketebalan garis, ukuran teks dimensi, panah dan font terbaca sangat jelas & kontras.',
          3: 'Teks dimensi terbaca jelas dengan sedikit tumpang tindih teks minor.',
          2: 'Beberapa dimensi terlalu kecil atau garis gambar terlalu tipis saat dicetak.',
          1: 'Sulit dibaca, garis buram atau teks dimensi terpotong.',
          0: 'Hasil plot kosong atau rusak.',
        },
      },
      {
        id: 'crit-pdf-k4',
        code: 'K4',
        name: 'Kelengkapan Etiket & Format Berkas PDF',
        weight: 15,
        descriptors: {
          4: 'Etiket lengkap standar (Nama, NIM, Kelas, Judul L01-L10, Skala), berkas gabungan <20MB sesuai aturan nama.',
          3: 'Etiket lengkap dengan 1 atribut kecil terlewat, nama berkas rapi.',
          2: 'Etiket tidak lengkap atau posisi nomor latihan membingungkan.',
          1: 'Etiket tidak standar atau ukuran file melebihi kapasitas tanpa optimasi.',
          0: 'Tidak menyertakan etiket atau berkas tidak dapat dibuka.',
        },
      },
    ],
    softSkillCriteria: [
      {
        id: 'crit-soft-k1',
        code: 'K1',
        name: 'Disiplin prosedur K3 & lab komputer',
        weight: 25,
        descriptors: {
          4: 'Mematuhi tata tertib lab, posisi duduk ergonomis, merawat perangkat dengan teladan.',
          3: 'Disiplin baik, hanya perlu 1 pengingat kecil.',
          2: 'Sesekali melanggar SOP lab (membawa makanan/minum dekat CPU, posisi ceroboh).',
          1: 'Berulang kali mengabaikan SOP lab dan perlu teguran langsung.',
          0: 'Melakukan pelanggaran berat tata tertib lab.',
        },
      },
      {
        id: 'crit-soft-k2',
        code: 'K2',
        name: 'Tanggung jawab & manajemen waktu tugas',
        weight: 25,
        descriptors: {
          4: 'Menyelesaikan checkpoint latihan tepat waktu dan menjaga kebersihan workstation.',
          3: 'Menyelesaikan tugas dengan sedikit keterlambatan minor.',
          2: 'Sering menunda pengerjaan latihan di jam sesi.',
          1: 'Tidak bertanggung jawab terhadap target sesi harian.',
          0: 'Meninggalkan sesi tanpa penyelesaian.',
        },
      },
      {
        id: 'crit-soft-k3',
        code: 'K3',
        name: 'Kemandirian kerja & inisiatif pemecahan masalah',
        weight: 25,
        descriptors: {
          4: 'Menganalisis soal secara mandiri, aktif mengeksplorasi perintah CAD secara efektif.',
          3: 'Mandiri dalam mayoritas soal, sesekali bertanya kendala spesifik.',
          2: 'Ketergantungan tinggi pada instruktur/rekan untuk setiap langkah dasar.',
          1: 'Hanya menunggu instruksi disalin tanpa inisiatif berpikir.',
          0: 'Pasif total selama jam praktik.',
        },
      },
      {
        id: 'crit-soft-k4',
        code: 'K4',
        name: 'Komunikasi & etika kerja sama',
        weight: 25,
        descriptors: {
          4: 'Berkomunikasi santun, bertanya konstruktif, dan mendukung suasana belajar kondusif.',
          3: 'Komunikasi baik dan sopan.',
          2: 'Kurang komunikatif saat menghadapi kendala teknis gambar.',
          1: 'Mengganggu ketenangan peserta lain di lab.',
          0: 'Berperilaku tidak sopan kepada instruktur atau rekan.',
        },
      },
    ],
    attendancePolicy: {
      sessionsCount: 5,
      scores: {
        hadir: 4,
        izin: null,
        sakit: null,
        alpa: 0,
      },
    },
    passingThreshold: 75.0,
    minimumSoftSkillObservations: 1,
    maxPdfSizeMb: 20,
  },
];

// Helper to generate seed assessment records (Clean state: empty arrays)
export function generateSeedRecords() {
  return {
    exRecords: [] as ExerciseGradeRecord[],
    pdfRecords: [] as PdfGradeRecord[],
    softRecords: [] as SoftSkillGradeRecord[],
    attRecords: [] as AttendanceRecord[],
  };
}

/**
 * Clears all assessment records from database to start fresh.
 */
export async function clearAllGradeData(): Promise<void> {
  await db.exerciseRecords.clear();
  await db.pdfRecords.clear();
  await db.softSkillRecords.clear();
  await db.attendanceRecords.clear();
  await db.snapshots.clear();
}

/**
 * Resets entire database to clean initial state with 36 students.
 */
export async function resetDatabase(): Promise<void> {
  await db.students.clear();
  await db.offerings.clear();
  await db.practiceVersions.clear();
  await clearAllGradeData();

  await db.students.bulkAdd(INITIAL_STUDENTS);
  await db.offerings.bulkAdd(INITIAL_OFFERINGS);
  await db.practiceVersions.bulkAdd(INITIAL_PRACTICE_VERSIONS);
}

/**
 * Initializes and seeds the database if empty.
 */
export async function initializeDatabase(): Promise<void> {
  const studentCount = await db.students.count();
  if (studentCount === 0) {
    await db.students.bulkAdd(INITIAL_STUDENTS);
    await db.offerings.bulkAdd(INITIAL_OFFERINGS);
    await db.practiceVersions.bulkAdd(INITIAL_PRACTICE_VERSIONS);

    // Initial audit event
    await db.auditEvents.add({
      id: 'aud-001',
      timestamp: new Date().toISOString(),
      actor: 'System / Setup',
      action: 'INITIALIZE_ROSTER',
      targetType: 'OFFERINGS',
      targetId: 'CAD11-2026G-1C',
      details: 'Inisialisasi 36 mahasiswa kelas 1C untuk Pekan 3, 5, dan 7.',
    });
  } else {
    // Synchronize instructorName on existing offerings
    await db.offerings.toCollection().modify({ instructorName: 'Reza Febriadi Rauf, A.Md.T' });
  }
}
