# 🎓 CAD 1.1 e-KAMPUS — Platform Penilaian Praktik & Evaluasi Akademik

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
</p>

---

## 📌 Sekilas Tentang Proyek

**CAD 1.1 e-KAMPUS** adalah platform evaluasi dan manajemen penilaian terpadu untuk mata kuliah/praktik **Computer-Aided Design (CAD 1.1)** berbasis kurikulum pendidikan vokasi teknik. 

Aplikasi ini mengintegrasikan standar baku **4 Pilar Mutu Mahasiswa Institusi (100%)**, konversi **10 Tingkat Huruf Mutu & Bobot IP**, Dashboard Eksekutif Lintas Pekan (*All-Week Analytics*), serta Portal Pengumpulan Mandiri Mahasiswa (*Student Submission Portal*) secara real-time.

---

## 🏛️ Standar Formula 4 Pilar Mutu Institusi (100%)

Perhitungan nilai akhir komposit mahasiswa dihitung otomatis berdasarkan pembobotan resmi:

$$\text{Nilai Akhir (100\%)} = (\text{Kualitas} \times 0{,}70) + (\text{Kreativitas} \times 0{,}05) + (\text{Sikap} \times 0{,}10) + (\text{Laporan Kerja} \times 0{,}15)$$

| No | Pilar Institusi | Bobot | Formula Dasar | Indikator Kompetensi |
|:---:|:---|:---:|:---|:---|
| **1** | **Kualitas\*** | **70%** | $\frac{(\text{ReDrawn 2D} \times 60) + (\text{Kehadiran} \times 10)}{70}$ | Penguasaan teknis software AutoCAD 2D (L01–L10) dan presisi gambar serta kedisiplinan hadir. |
| **2** | **Kreativitas** | **5%** | Rata-rata Skor Soft Skill **K3** | Kemandirian penalaran geometri dan pemecahan kendala gambar secara mandiri. |
| **3** | **Sikap** | **10%** | Rata-rata Skor Soft Skill **K1, K2, K4** | Disiplin waktu, penerapan SOP lab, etika komunikasi, dan kepatuhan standar kerja. |
| **4** | **Laporan Kerja**| **15%** | Skor Output Gabungan PDF L01–L10 | Standarisasi etiket gambar, kerapian layout lembar kerja, dan standardisasi layer/garis. |

---

## 🎯 Tabel Standar 10 Tingkat Huruf Mutu & Bobot IP

Aplikasi menerapkan rentang nilai mutu resmi secara konsisten di seluruh dashboard, lembar rekap, dan file ekspor:

| Huruf Mutu | Bobot IP | Rentang Nilai Akhir (0–100) | Kategori Status | Badge Status Akademik |
|:---:|:---:|:---|:---:|:---|
| **A** | **4.00** | Poin 85 ke atas ($\ge 85.00$) | Nilai Tinggi | `★ LULUS PUJIAN` |
| **A-** | **3.70** | Poin 80–84 ($80.00 \le \text{Skor} < 85.00$) | Nilai Tinggi | `MEMUASKAN` |
| **B+** | **3.30** | Poin 75–79 ($75.00 \le \text{Skor} < 80.00$) | Nilai Menengah | `KOMPETEN` |
| **B** | **3.00** | Poin 70–74 ($70.00 \le \text{Skor} < 75.00$) | Nilai Menengah | `KOMPETEN` |
| **B-** | **2.70** | Poin 65–69 ($65.00 \le \text{Skor} < 70.00$) | Nilai Menengah | `STANDAR` |
| **C+** | **2.30** | Poin 60–64 ($60.00 \le \text{Skor} < 65.00$) | Nilai Menengah | `STANDAR` |
| **C** | **2.00** | Poin 55–59 ($55.00 \le \text{Skor} < 60.00$) | Di Bawah 60 | `REMEDIAL` |
| **C-** | **1.70** | Poin 50–54 ($50.00 \le \text{Skor} < 55.00$) | Di Bawah 60 | `REMEDIAL` |
| **D** | **1.00** | Poin 40–50 ($40.00 \le \text{Skor} < 50.00$) | Di Bawah 60 | `REMEDIAL` |
| **E** | **0.00** | Poin di bawah 40 ($< 40.00$) | Di Bawah 60 | `REMEDIAL` |

---

## ✨ Fitur-Fitur Unggulan

### 1. ⚡ Lembar Penilaian Praktik Interaktif
- Input skor berbasis rubrik deskriptif skala **0 s/d 4** dengan konversi otomatis ke skala **0 s/d 100**.
- Mendukung 4 tab komponen: **Latihan Teknis (L01–L10)**, **Layout & Plot PDF**, **Soft Skill Harian**, dan **Presensi Kehadiran**.
- Validasi instan status kelengkapan data sebelum nilai akhir dikunci.

### 2. 📊 All-Week Executive KPI Dashboard
- Pemantauan performa kelas global mencakup **36 Mahasiswa** lintas kelompok (Pekan 3, Pekan 5, dan Pekan 7).
- Grafik komparasi performa antar-pekan dan visualisasi radar kompetensi individual.
- Deteksi dini mahasiswa berisiko (*At-Risk Detection*) dengan skor di bawah ambang batas ($\text{Nilai} < 60$).

### 3. 📤 Portal Pengumpulan Mandiri Mahasiswa (`/#kumpul-tugas`)
- Halaman portal mandiri dengan URL hash routing `http://localhost:3000/#kumpul-tugas` tanpa perlu autentikasi login.
- Tampilan 3 kolom responsif full-width menampilkan seluruh mahasiswa secara ringkas tanpa scrollbar berlebih.
- Terbuka otomatis di tab peramban baru saat diakses instruktur.

### 4. 📖 Panduan Rubrik & Simulator Nilai Live
- Tampilan digital kriteria penilaian 4 tingkat kemahiran (Mahir, Terampil, Berkembang, Pemula).
- Simulator interaktif dengan slider uji hitung rumus 4 pilar.

### 5. 📑 Rekap Nilai & Ekspor Berkas Excel Resmi (.xlsx)
- Ekspor lembar penilaian multi-sheet resmi berformat Excel menggunakan pustaka **ExcelJS**.
- Menyertakan rincian nilai teknis, konversi 4 pilar, huruf mutu, IP, dan keterangan status kelulusan.

### 6. 👥 Manajemen Roster & Impor Jadwal Excel
- Fitur impor data roster peserta kelas dari file template Excel (`.xlsx`).
- Sinkronisasi otomatis data NIM, Nama, Kelas, dan penugasan pekan praktik.

---

## 🛠️ Arsitektur Teknologi

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Visualisasi Data**: Recharts (Bar Charts, Radar Charts, Line Charts)
- **Pengolahan Berkas**: ExcelJS, FileSaver
- **Backend / Database API**: Node.js, Express, TSX, JSON Database Server

---

## 🚀 Panduan Menjalankan Proyek (Getting Started)

### Prasyarat:
- Node.js (versi 18.0.0 ke atas disarankan)
- npm atau yarn

### Langkah Instalasi:

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/dev-byreza/e-KAMPUS.git
   cd e-KAMPUS
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Menjalankan Server Backend**:
   ```bash
   npm run server
   ```
   *Backend API aktif di: `http://localhost:5000`*

4. **Menjalankan Aplikasi Frontend**:
   ```bash
   npm run dev
   ```
   *Frontend aktif di: `http://localhost:3000`*

5. **Membangun Bundle Produksi**:
   ```bash
   npm run build
   ```

---

## 👤 Profil Instruktur

- **Nama Instruktur**: `Reza Febriadi Rauf, A.Md.T`
- **Jabatan**: `Instruktur CAD 1.1`
- **Unit Pelaksana**: Laboratorium Komputer CAD / Studio Gambar Teknik

---

## 📄 Lisensi

Proyek ini dilindungi di bawah lisensi [MIT License](LICENSE).
