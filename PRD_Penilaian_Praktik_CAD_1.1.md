# PRD — Penilaian Praktik CAD 1.1 per Pekan

Versi: 2.0 | Tanggal: 31 Agustus 2026  
Status: Draf pengembangan kebutuhan; belum merupakan aplikasi/workbook yang sudah diimplementasikan.  
Nama praktik: **CAD 1.1**. Alias pada jadwal: `CAD1.1`.  
Konteks awal: kelas **1C**, semester **Ganjil 2026/2027**.

## 1. Tujuan dan perubahan dari versi sebelumnya

Instruktur dapat memilih pekan praktik CAD 1.1, melihat hanya mahasiswa yang terjadwal pada pekan tersebut, lalu mengisi nilai masing-masing latihan, output PDF, soft skill, dan kehadiran selama lima hari. Nama dan NIM diambil dari daftar peserta, bukan diketik ulang saat menilai.

Permintaan terbaru menggantikan cakupan lama delapan latihan tanpa pengelompokan pekan dengan skenario **10 latihan + output PDF + soft skill + kehadiran lima hari**. Sepuluh latihan merupakan contoh konfigurasi yang diminta; sistem sebaiknya dapat menerima jumlah lain melalui pengaturan praktik. PRD ini memakai 10 sebagai konfigurasi kerja.

| Aspek | Rancangan sebelumnya | Target versi 2 |
|---|---|---|
| Identitas praktik | Praktik CAD Dasar 1.1 | Nama tampilan CAD 1.1 |
| Peserta | 40 slot tetap tanpa rotasi pekan | Peserta terikat pelaksanaan praktik, kelas, semester dan pekan |
| Latihan | 8 latihan | 10 latihan yang dinilai satu per satu |
| PDF | Tidak menjadi komponen tersendiri | Output wajib dan komponen nilai tersendiri |
| Soft skill | Unsur kecil dalam rubrik latihan | Penilaian harian yang terpisah dari nilai teknis |
| Kehadiran | Dicatat per latihan, tanpa bobot | Dicatat sekali per mahasiswa per hari, selama 5 hari |
| Dashboard | Gabungan semua mahasiswa | Mengikuti semester, praktik, kelas dan pekan yang dipilih |
| Hubungan data | Posisi baris/slot | ID tetap; urut/filter tidak memindahkan kepemilikan nilai |
| Finalisasi | Ada perbedaan panduan dengan rumus lama | Nilai sementara dan nilai akhir dibedakan secara eksplisit |

PRD ini tidak mengubah file Excel yang sudah ada dan tidak memigrasikan nilai mahasiswa. Pelaksanaan implementasi dan migrasi merupakan pekerjaan berikutnya.

## 2. Sumber, fakta, dan usulan

| Sumber | Pemakaian |
|---|---|
| Permintaan pengguna terbaru | Nama praktik CAD 1.1; penilaian per latihan; contoh 10 latihan, PDF, soft skill dan kehadiran 5 hari; peserta harus sesuai pekan |
| Gambar jadwal `codex-clipboard-c0f41e92-6f7f-4d2a-ab27-c1d9b698100a.png` | Transkripsi peserta kelas 1C, NIM, kode praktik, pekan dan rentang tanggal |
| `02-WORKSHEET CAD DASAR 1.1.pdf`, halaman 1–11 | Acuan Sub-CPMK, persiapan, checkpoint, dan materi delapan latihan awal |
| PRD v1 dan workbook sebelumnya | Identifikasi kebutuhan yang dipertahankan, diubah, atau perlu dimigrasikan |

Bobot, ambang nilai, pembagian dua latihan per hari, satu PDF gabungan, rubrik baru, serta kebijakan absensi di bawah adalah **usulan desain**, bukan ketentuan resmi pada jadwal atau worksheet. Persentase bobot perlu ditetapkan instruktur sebelum penilaian resmi.

Nama/NIM di lampiran ditranskripsi dari gambar dan telah diperiksa secara visual, tetapi belum dicocokkan dengan daftar induk institusi. Data pada bagian kelas berikutnya yang terpotong tidak dimasukkan. Instruksi yang tertulis pada dokumen sumber hanya diperlakukan sebagai konteks tugas praktik.

## 3. Pekan praktik dan peserta

Pekan semester dan minggu kalender adalah dua kolom berbeda. Nomor pekan praktik mengikuti baris nomor pekan semester pada jadwal, bukan nomor urutan kelompok CAD atau nomor minggu kalender.

| Pelaksanaan | Pekan semester | Minggu kalender | Rentang tanggal menurut jadwal | Peserta terlihat |
|---|---:|---:|---|---:|
| CAD11-2026G-1C-P03 | 3 | 34 | 17–21 Agustus 2026 | 12 |
| CAD11-2026G-1C-P05 | 5 | 36 | 31 Agustus–4 September 2026 | 12 |
| CAD11-2026G-1C-P07 | 7 | 38 | 14–18 September 2026 | 12 |
| Total pada potongan kelas 1C | | | Tiga kelompok berbeda | 36 |

ID pelaksanaan di atas merupakan ID rancangan, bukan kode yang tercetak pada gambar. Daftar nama dan NIM lengkap per pekan terdapat pada Lampiran A.

Aturan peserta:

1. Pilih semester → praktik CAD 1.1 → kelas → pekan. Rentang tanggal dan nama peserta muncul otomatis dari jadwal.
2. Peserta muncul hanya jika terdaftar pada pelaksanaan yang dipilih. Mahasiswa yang menjalani PP1, GT1.1, DOK, MI-MS, atau CAD1.2 pada pekan itu tidak masuk daftar CAD 1.1.
3. Alias `CAD1.1` dan `CAD 1.1` boleh dinormalisasi menjadi satu praktik. Jangan menggunakan pencocokan awalan yang ikut mengambil CAD 1.2.
4. NIM disimpan sebagai teks. Nama bersumber dari master mahasiswa; perubahan ejaan tidak membuat mahasiswa baru atau memindahkan nilainya.
5. Satu pasangan pelaksanaan–mahasiswa tidak boleh duplikat. NIM boleh muncul pada pelaksanaan lain jika memang dijadwalkan, termasuk pengulangan praktik yang tercatat.
6. Koreksi atau pindah pekan menggunakan perubahan pendaftaran yang tercatat, bukan menukar baris nama. Jika sudah ada nilai, pemindahan harus ditinjau instruktur dengan alasan dan tanpa menimpa riwayat asal.
7. Saat tidak ada peserta terjadwal, tampilkan “Tidak ada peserta CAD 1.1 pada pekan ini”. Jangan menampilkan semua mahasiswa sebagai pengganti.

Tanggal pada gambar adalah jadwal rencana. Lima hari efektif harus disimpan sebagai lima sesi nyata dengan tanggal masing-masing. Jika ada libur atau penggantian hari, pindahkan tanggal sesi secara eksplisit; jangan memberi Alpa pada hari yang tidak dilaksanakan. PRD tidak menganggap semua rentang Senin–Jumat pada gambar sudah terverifikasi sebagai hari efektif.

## 4. Alur input yang disarankan

Bagian atas layar/lembar selalu menampilkan **CAD 1.1 · kelas · pekan · tanggal · jumlah peserta**. Nama dan NIM tetap terlihat saat menggulir atau berpindah bagian penilaian.

### 4.1 Latihan

Instruktur memilih L01–L10. Tabel menampilkan seluruh peserta pekan itu dengan kolom NIM, Nama, Nilai 0–100, Status penilaian, Catatan, dan Bukti opsional. Memilih latihan lain mengganti nilai yang ditampilkan, bukan daftar peserta.

Tersedia tampilan rekap lebar: `NIM | Nama | L01 | L02 | ... | L10 | Rerata teknis | Progres`. Tampilan per latihan menjadi cara input utama agar tidak harus menggulir sepuluh kolom nilai pada layar kecil. NIM dan nama tidak dapat diedit dari tabel nilai.

Input cepat memakai nilai 0–100 dengan maksimal dua desimal. Rubrik menjadi acuan skor. Bila mode rubrik diaktifkan, instruktur mengisi skor kriteria 0–4 dan nilai latihan dihitung otomatis. Satu versi praktik harus memilih mode langsung atau rubrik secara jelas; jangan menjadikan kedua cara sebagai sumber nilai yang saling menimpa.

### 4.2 Output PDF

Tampilan berisi NIM, Nama, lokasi/tautan/nama PDF, versi berkas, tanggal pengumpulan, status pengumpulan, status pemeriksaan, nilai PDF 0–100, dan catatan revisi.

Konfigurasi awal yang diusulkan: **satu PDF final gabungan per mahasiswa**, berisi hasil L01–L10. Jumlah halaman tidak harus tepat sepuluh; semua latihan harus dapat ditelusuri melalui label L01–L10. Jika dipilih satu PDF per latihan, jumlah bukti wajib dan rumus agregasi harus diubah pada konfigurasi; sistem tidak boleh menuntut kedua model sekaligus tanpa penugasan.

“PDF” di sini adalah hasil praktik yang dinilai, bukan format ekspor laporan nilai. Menambahkan tautan PDF tidak otomatis memberi nilai atau menandainya diterima; instruktur tetap memeriksa berkas.

### 4.3 Soft skill

Instruktur memilih H1–H5 dengan tanggal sesi. Daftar peserta sama dengan kelompok aktif. Setiap peserta mempunyai empat skor perilaku 0–4, catatan observasi, dan nilai harian otomatis.

Pilihan “Tidak teramati” dipisahkan dari skor nol dan wajib disertai alasan. Mahasiswa yang tidak hadir tidak otomatis diberi nol soft skill; ketidakhadiran sudah ditangani dalam komponen kehadiran. Peserta hadir tetapi belum dinilai tetap ditandai belum diobservasi, bukan otomatis disamakan dengan tidak teramati yang sudah ditinjau.

### 4.4 Kehadiran

Matriks `NIM | Nama | H1/tanggal | H2/tanggal | H3/tanggal | H4/tanggal | H5/tanggal | Hadir/5 | Nilai kehadiran`.

Pilihan harian: Hadir, Izin, Sakit, Alpa. Kosong berarti belum dicatat. Keterlambatan, jika dibutuhkan, dicatat terpisah sebagai menit/catatan; tidak menghasilkan penalti otomatis yang belum ditetapkan.

Satu mahasiswa yang mengerjakan dua latihan pada satu hari tetap memiliki **satu** catatan kehadiran hari tersebut. Tombol pengisian massal hanya boleh berlaku pada peserta dan tanggal aktif, menampilkan jumlah yang terpengaruh, serta dapat dibatalkan.

### 4.5 Rekap dan finalisasi

Tampilkan per mahasiswa: 10 nilai latihan, nilai teknis, PDF, soft skill, kehadiran, kelengkapan, calon nilai akhir, status finalisasi, dan tindak lanjut. Perubahan skor disimpan dengan ID mahasiswa/pelaksanaan/tugas atau sesi, bukan nomor baris tampilan.

Jika data wajib belum lengkap, tampilkan komponen yang sudah terhitung beserta progres, misalnya “8/10 latihan; PDF belum dinilai; absensi 4/5”. Jangan menampilkan rata-rata parsial sebagai nilai akhir. Setelah lengkap, instruktur dapat meninjau dan memfinalisasi. Koreksi sesudah finalisasi harus membuka revisi dan mencatat alasan.

## 5. Rencana lima hari

Pembagian berikut adalah usulan beban kerja, bukan urutan wajib yang ditentukan gambar jadwal. Hari pengumpulan dan penilaian dapat berbeda; skor tetap terikat latihan, sedangkan absensi/soft skill terikat sesi.

| Hari | Latihan utama | Catatan lain |
|---|---|---|
| H1 | L01–L02 | Persiapan workspace, kehadiran dan observasi soft skill |
| H2 | L03–L04 | Kehadiran dan observasi soft skill |
| H3 | L05–L06 | Kehadiran dan observasi soft skill |
| H4 | L07–L08 | Kehadiran dan observasi soft skill |
| H5 | L09–L10 | Pemeriksaan akhir, PDF, refleksi dan rekap |

L01–L08 bersumber dari delapan latihan pada worksheet sebelumnya. **Materi L09 dan L10 belum diberikan**; instruktur perlu menambahkan judul, instruksi, gambar acuan, dimensi/toleransi bila relevan, serta indikator penilaian. Jangan memberi label seolah dua soal tambahan sudah berasal dari worksheet. PDF merupakan penugasan tambahan yang diminta pengguna, sehingga kriteria tata letak dan ekspornya harus dijelaskan kepada mahasiswa.

## 6. Struktur bobot dan rubrik

### 6.1 Bobot komponen — usulan

| Komponen | Cara diperoleh | Bobot nilai akhir |
|---|---|---:|
| Latihan teknis | Agregasi nilai L01–L10 | 60% |
| Output PDF | Nilai pemeriksaan PDF final | 15% |
| Soft skill | Agregasi observasi harian | 15% |
| Kehadiran | Konversi status lima sesi sesuai kebijakan | 10% |
| Total | | 100% |

Sepuluh latihan berbobot sama secara default: masing-masing 10% dari komponen teknis atau 6% dari nilai akhir. Bobot per latihan boleh diubah, dengan jumlah tetap 100% dalam komponen teknis. Seluruh pekan untuk versi praktik yang sama menggunakan rubrik dan bobot yang sama agar dapat dibandingkan.

### 6.2 Rubrik teknis — usulan pemisahan dari soft skill/PDF

| Kriteria | Bobot dalam setiap latihan | Fokus bukti |
|---|---:|---|
| Kelengkapan bentuk | 30% | Kontur, fitur, lubang, slot dan busur sesuai soal |
| Presisi ukuran dan posisi | 40% | Ukuran, koordinat, sambungan dan hubungan tangen |
| Pemakaian perintah | 20% | Pemilihan dan hasil operasi CAD yang relevan dengan latihan |
| Persiapan dan organisasi kerja CAD | 10% | Unit, workspace, bantuan gambar dan pengelolaan kerja |

Skala acuan: 4 = seluruh indikator terpenuhi secara mandiri; 3 = terdapat kekurangan kecil; 2 = sebagian indikator terpenuhi dan memerlukan koreksi; 1 = banyak indikator belum terpenuhi dan perlu bimbingan; 0 = sudah dinilai tetapi tidak ada bukti ketercapaian. Jumlah kesalahan yang membedakan kategori dan toleransi ukuran harus dirinci per soal, bukan diasumsikan dari tampilan gambar.

Rubrik teknis tidak lagi memasukkan nilai perilaku umum atau kualitas plot PDF, agar komponen yang sama tidak dihitung dua kali. Rubrik enam kriteria pada workbook lama tidak dapat langsung dipakai tanpa penyesuaian bobot.

### 6.3 Rubrik output PDF — usulan

| Kriteria | Bobot dalam nilai PDF |
|---|---:|
| Keterbacaan garis, teks dan dimensi pada hasil plot | 40% |
| Ukuran kertas, orientasi, area plot dan skala sesuai penugasan | 30% |
| Kelengkapan hasil dan identifikasi L01–L10 | 20% |
| Penamaan, format, dan berkas dapat dibuka | 10% |

Nilai bentuk/presisi tidak dinilai ulang penuh dalam komponen PDF. Status pemeriksaan: Belum diperiksa, Perlu revisi, Diterima. Status pengumpulan: Belum dikumpulkan, Dikumpulkan, Tidak dikumpulkan setelah penilaian ditutup. Status terakhir memerlukan keputusan instruktur dan alasan; dapat diberi nilai 0 tanpa memalsukan tautan berkas. Nilai 0 dengan keputusan tersebut menyelesaikan pencatatan nilai PDF, tetapi tidak memenuhi syarat kelulusan PDF pada usulan di bagian 8.

### 6.4 Rubrik soft skill — usulan

| Kriteria harian | Bobot | Contoh perilaku yang diamati |
|---|---:|---|
| Disiplin menjalankan prosedur kerja | 25% | Mengikuti instruksi penggunaan perangkat dan urutan kerja |
| Tanggung jawab | 25% | Menjaga perangkat, mengelola berkas dan menuntaskan tindak lanjut |
| Kemandirian dan inisiatif | 25% | Mencoba penyelesaian yang relevan sebelum meminta bantuan |
| Komunikasi dan kerja sama | 25% | Bertanya dengan jelas, menghargai rekan, bekerja sama tanpa menyalin hasil |

Skor 0–4: 4 = konsisten mandiri; 3 = baik dengan pengingat sesekali; 2 = memerlukan beberapa pengingat; 1 = memerlukan pendampingan berulang; 0 = perilaku yang diminta tidak ditunjukkan setelah ada kesempatan observasi. Catatan konkret diperlukan untuk skor 0–1. Kriteria disiplin di sini tidak menghitung ulang hadir/tidak hadir atau menit keterlambatan.

Soft skill dihitung dari hari yang benar-benar diobservasi. Setiap H1–H5 harus memiliki observasi lengkap atau penanda Tidak teramati yang telah ditinjau dan diberi alasan. Hari tanpa observasi tidak diperlakukan sebagai 0 dan tidak diberi nilai 100 otomatis. Jika seluruh hari tidak teramati, komponen belum dapat dihitung. Jumlah minimum hari observasi perlu ditetapkan instruktur; usulan operasional awal adalah minimal satu hari valid, disertai tampilan jumlah hari observasi dan peringatan jika kurang dari lima. Tidak ada penggantian bobot diam-diam.

### 6.5 Kebijakan kehadiran

Pisahkan **persentase kehadiran faktual** dengan **nilai kehadiran**.

| Status | Hitungan hadir aktual | Koefisien nilai yang diusulkan |
|---|---:|---|
| Hadir | 1 | 1 |
| Izin | 0 | Belum ditetapkan; harus dapat dikonfigurasi |
| Sakit | 0 | Belum ditetapkan; harus dapat dikonfigurasi |
| Alpa | 0 | 0 |

Koefisien berada pada rentang 0–1. Nilai kehadiran ditahan jika ada status yang dipakai tetapi koefisiennya belum ditetapkan. Hal ini menghindari asumsi bahwa Izin/Sakit otomatis sama dengan Alpa atau otomatis sama dengan Hadir. Tidak perlu meminta keputusan koefisien yang belum digunakan untuk menghitung data lain yang sudah sah.

## 7. Rumus dan perlakuan data kosong

Dengan seluruh nilai komponen pada skala 0–100 dan bobot berupa pecahan yang totalnya 1:

`Teknis = Σ(nilai latihan_i × bobot latihan_i)`

Jika bobot latihan sama: `Teknis = (L01 + L02 + ... + L10) / 10`.

`Soft_skill_harian = 100 × Σ((skor_kriteria / 4) × bobot_kriteria)`

`Soft_skill = rata-rata nilai harian yang benar-benar diobservasi dan lengkap`

`Persentase_hadir = jumlah status Hadir / 5 × 100`

`Nilai_kehadiran = Σ(koefisien lima status sesi) / 5 × 100`

`Nilai_akhir = Teknis × 60% + PDF × 15% + Soft_skill × 15% + Kehadiran × 10%`

Rumus memakai bobot yang tersimpan pada konfigurasi, bukan konstanta tersembunyi. Tampilkan dua desimal; gunakan presisi perhitungan penuh untuk penentuan ambang, baru bulatkan tampilan hasil. Contoh hitung, bukan nilai mahasiswa nyata: Teknis 80, PDF 85, Soft skill 90, Kehadiran 100 menghasilkan **85,25**.

Nilai kosong tidak berarti 0. Tugas belum dikumpulkan tetap belum dinilai sampai instruktur secara eksplisit menutup penilaian tugas tersebut, memasukkan nilai 0 dan mencatat alasan. Nilai nol yang sah tetap ikut jumlah latihan dinilai dan perhitungan rata-rata.

Rata-rata sementara teknis = rata-rata berbobot dari latihan yang sudah dinilai, dinormalisasi dengan jumlah bobot latihan yang sudah dinilai. Tampilkan selalu sebagai “Sementara — x/10 latihan”; jangan menggunakan nama Nilai akhir. Tidak ada nilai gabungan resmi sebelum empat komponen lengkap.

## 8. Kelengkapan, ketuntasan, dan finalisasi

Tiga hal berikut dibedakan:

- **Kelengkapan:** apakah semua penilaian wajib sudah dicatat, termasuk keputusan nilai 0 yang sah.
- **Ketuntasan:** apakah hasil memenuhi ambang dan persyaratan praktik.
- **Finalisasi:** apakah instruktur sudah meninjau dan menetapkan hasil lengkap.

Syarat calon nilai akhir dapat dihitung:

1. Identitas dan pendaftaran peserta valid untuk pelaksanaan aktif.
2. Sepuluh tugas sudah terdefinisi dan semua nilainya lengkap/valid.
3. Nilai PDF dan hasil pemeriksaan/pengumpulan sudah diputuskan, termasuk kasus tidak menyerahkan yang sudah ditutup.
4. Lima sesi kehadiran terisi; semua koefisien status yang digunakan tersedia.
5. Lima sesi soft skill sudah ditinjau sebagai observasi lengkap atau Tidak teramati beralasan, dan jumlah hari observasi memenuhi minimum.
6. Bobot serta aturan penilaian versi pelaksanaan valid.

Usulan ambang awal: nilai akhir ≥75, setiap latihan ≥75, dan PDF diterima dengan nilai ≥75 untuk status **Tuntas**. Soft skill dan kehadiran berkontribusi melalui bobot; syarat minimum terpisah pada dua komponen tersebut belum ditetapkan. Semua ambang dapat dikonfigurasi sebelum penilaian. Pengguna belum menetapkan aturan kelulusan ini sebagai kebijakan resmi.

Status kerja: Belum mulai, Sedang dinilai, Belum lengkap, Siap finalisasi, Final–Tuntas, Final–Perlu perbaikan. Data tidak valid menunjukkan alasan khusus, misalnya NIM duplikat, peserta di luar pekan, bobot tidak valid, atau kebijakan Izin belum ditetapkan. Status input dan ketuntasan tidak boleh disatukan menjadi label ambigu.

Mengubah bobot setelah ada nilai harus menampilkan dampak dan mencatat versi aturan. Nilai final tidak ditimpa diam-diam; revisi resmi harus membuka kembali finalisasi. Remedial menyimpan nilai sebelumnya, nilai revisi, waktu dan alasan. Kebijakan apakah nilai revisi, nilai tertinggi, atau batas remedial yang digunakan harus dinyatakan; usulan awal menggunakan nilai revisi yang disahkan instruktur, tanpa batas tambahan yang belum disetujui.

## 9. Dashboard per pekan

Semua tabel, angka dan grafik mengikuti filter semester–praktik–kelas–pekan yang sama. Tampilan seluruh pekan merupakan pilihan terpisah dan harus dilabeli jelas; jangan mencampurkannya dengan kelompok aktif.

| Indikator | Definisi |
|---|---|
| Peserta terjadwal | Jumlah pendaftaran peserta aktif dalam filter |
| Progres latihan | Nilai latihan valid / (peserta terjadwal × jumlah tugas wajib) |
| PDF masuk / dinilai / diterima | Tiga jumlah terpisah berdasarkan status, bukan semua dianggap sama |
| Soft skill ditinjau | Jumlah status hari yang sudah diputuskan / (peserta × 5) |
| Hari soft skill diobservasi | Jumlah observasi valid; pisahkan dari Tidak teramati |
| Kelengkapan absensi | Jumlah status absensi yang tercatat / (peserta × 5) |
| Kehadiran aktual | Jumlah Hadir / jumlah sesi peserta yang sudah berlangsung; tampilkan cakupan pencatatannya |
| Kehadiran akhir pekan | Jumlah Hadir / (peserta × 5), hanya sebagai angka akhir setelah lima sesi selesai |
| Rata-rata komponen | Rata-rata nilai komponen yang lengkap; sertakan n/jumlah peserta |
| Siap finalisasi / sudah final | Jumlah peserta dengan data lengkap / hasil yang sudah disahkan |
| Ketuntasan final | Peserta Final–Tuntas / peserta yang sudah final; tanpa peserta final tampilkan “Belum ada hasil final” |
| Cakupan hasil final | Peserta yang sudah final / peserta terjadwal |

Sebelum seluruh absensi sesi yang sudah berlangsung tercatat, persentase kehadiran aktual berstatus sementara atau ditahan; kekosongan tidak otomatis diperlakukan sebagai Alpa. Peserta yang tidak terjadwal tidak masuk penyebut.

Visual utama: matriks peserta × L01–L10, grafik rata-rata per latihan, matriks absensi H1–H5, perbandingan empat komponen dan daftar yang perlu tindak lanjut. Warna disertai label. Klik/filter pada kategori Perlu perbaikan menampilkan peserta terkait dalam pekan yang sama.

Untuk satu kelompok 12 mahasiswa: **120 nilai latihan**, **12 PDF final** pada model gabungan, **60 catatan kehadiran**, dan **60 status observasi soft skill harian**. Untuk tiga kelompok yang terlihat: 360 nilai latihan, 36 PDF, 180 catatan kehadiran, dan 180 status observasi soft skill. Ini adalah kapasitas pencatatan, bukan jumlah yang sudah selesai.

## 10. Model data logis

Model ini dapat diterapkan sebagai tabel Excel atau basis data aplikasi; belum memilih teknologi tertentu.

| Entitas | Data utama | Kunci / aturan |
|---|---|---|
| Mahasiswa | student_id, NIM, nama, kelas | student_id tetap; NIM unik dalam master |
| Praktik | practice_id, nama CAD 1.1, alias, kode mata kuliah bila digunakan | Terpisah dari CAD 1.2 |
| Versi penilaian | assessment_version_id, bobot, rubrik, ambang, mode input, kebijakan absensi/PDF | Satu versi jelas untuk kelompok yang dibandingkan |
| Pelaksanaan | offering_id, semester, kelas, pekan semester, minggu kalender, rentang tanggal, practice_id, assessment_version_id | Mewakili satu praktik pada satu kelompok pekan |
| Peserta | enrollment_id, offering_id, student_id, status pendaftaran | Unik offering_id + student_id |
| Sesi harian | session_id, offering_id, H1–H5, tanggal aktual, status dilaksanakan/dijadwal ulang | Lima sesi efektif; tanggal dapat diganti dengan riwayat |
| Tugas | assignment_id, versi praktik, L01–L10, judul, acuan, bobot, hari target | Jumlah tugas dan bobot dapat dikonfigurasi |
| Nilai latihan | enrollment_id, assignment_id, nilai, skor rubrik jika mode rubrik, status, catatan, waktu penilaian | Unik peserta + tugas + versi penilaian yang aktif |
| Output PDF | submission_id, enrollment_id, lokasi/tautan, versi, status, nilai/rubrik, catatan | Satu keluaran final aktif; versi terdahulu dipertahankan |
| Soft skill | enrollment_id, session_id, empat skor, status observasi, alasan, catatan | Unik peserta + sesi |
| Kehadiran | enrollment_id, session_id, status, menit terlambat/catatan opsional | Unik peserta + sesi, tidak per latihan |
| Hasil final | enrollment_id, snapshot komponen/bobot, nilai akhir, ketuntasan, waktu finalisasi | Terikat versi aturan dan keputusan instruktur |
| Riwayat perubahan | entitas, ID, nilai sebelum/sesudah, waktu, pencatat, alasan | Koreksi dan migrasi dapat ditelusuri |

Nama dan NIM pada tabel input diambil melalui hubungan ID. Tampilan boleh diurutkan berdasarkan nama, NIM atau nilai tanpa mengubah kaitan catatan. Jika diwujudkan di Excel, mengedit hasil FILTER dinamis bukan mekanisme penyimpanan: perubahan harus ditulis ke tabel sumber yang memiliki kunci ID, atau melalui formulir yang melakukan pemetaan tersebut. Jangan mengandalkan letak baris dari hasil filter sebagai identitas mahasiswa.

## 11. Kebutuhan fungsional dan prioritas

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Memilih semester, CAD 1.1, kelas, pekan dan menampilkan peserta otomatis | Wajib |
| FR-02 | Memvalidasi jadwal, NIM, duplikasi peserta dan kesesuaian praktik | Wajib |
| FR-03 | Memasukkan dan merevisi nilai L01–L10 satu per satu atau melalui matriks | Wajib |
| FR-04 | Mencatat dan menilai PDF tanpa menganggap tautan sebagai bukti sudah diperiksa | Wajib |
| FR-05 | Mengisi empat indikator soft skill per hari selama lima hari | Wajib |
| FR-06 | Mencatat absensi sekali per mahasiswa per hari | Wajib |
| FR-07 | Menghitung komponen, kelengkapan dan ketuntasan dengan bobot dapat dikonfigurasi | Wajib |
| FR-08 | Menampilkan dashboard yang mengikuti filter kelompok aktif | Wajib |
| FR-09 | Menyimpan perubahan dan mempertahankan data ketika berpindah pekan/tugas | Wajib pada implementasi; simulasi tampilan bukan penyimpanan resmi |
| FR-10 | Memisahkan nilai sementara, siap finalisasi, final dan revisi | Wajib |
| FR-11 | Mempertahankan kepemilikan nilai saat sorting atau koreksi nama | Wajib |
| FR-12 | Menyimpan riwayat revisi nilai final dan perpindahan jadwal | Wajib sebelum pemakaian resmi |
| FR-13 | Impor daftar induk dan jadwal dari Excel/CSV dengan pratinjau kecocokan | Pengembangan lanjutan |
| FR-14 | Mode kalkulator rubrik terstruktur selain input nilai langsung | Pengembangan lanjutan jika input cepat dipilih sebagai versi awal |
| FR-15 | Ekspor rekap nilai per pekan untuk administrasi | Pengembangan lanjutan |

Masukan ditolak jika di luar rentang, tidak sesuai jenis data, atau terikat peserta di luar pelaksanaan. Pesan harus menjelaskan sel/data yang perlu dikoreksi. Pengisian massal tidak boleh menimpa nilai yang sudah ada tanpa memperlihatkan dampaknya. Simpan draf dan finalisasi hasil adalah tindakan berbeda.

## 12. Migrasi dari workbook lama

1. Bekukan salinan workbook lama sebagai sumber migrasi; jangan menimpanya saat mengembangkan PRD.
2. Cocokkan NIM dan nama terhadap master dan jadwal. Nilai lama yang tidak memiliki informasi pekan tidak boleh otomatis ditempelkan pada semua kelompok; tempatkan pada daftar yang perlu dipetakan.
3. Salin nilai L01–L08 hanya setelah peserta, pekan, tugas dan rubrik asal diketahui. L09–L10 tetap kosong sampai tugas dan nilai tersedia.
4. Nilai latihan lama memakai enam kriteria termasuk unsur berkas/refleksi, berbeda dari pembagian komponen baru. Jangan menganggap nilai tersebut langsung setara dengan rubrik teknis v2. Pertahankan label versi rubrik atau lakukan penilaian ulang/pemetaan yang disetujui instruktur; jangan membuat nilai soft skill/PDF dari perkiraan.
5. Catatan kehadiran lama per latihan tidak boleh dijumlahkan sebagai hari hadir. Gabungkan berdasarkan tanggal hanya jika bukti tanggal cukup dan tidak bertentangan; sisanya perlu ditinjau.
6. Pertahankan informasi perbedaan rumus nilai akhir yang ditemukan di v1. Rancangan v2 menggunakan syarat semua komponen lengkap, sehingga nilai parsial lama diberi label sementara saat migrasi.
7. Simpan jumlah data cocok, duplikat, konflik, dan belum terpetakan sebelum migrasi disahkan.

## 13. Kriteria penerimaan

| ID | Skenario | Hasil yang diperlukan |
|---|---|---|
| AC-01 | Pilih CAD 1.1, 1C, pekan 3 | Muncul tepat 12 peserta Lampiran A.1 |
| AC-02 | Pilih pekan 5 | Muncul tepat 12 peserta Lampiran A.2; NIM 22603001 ada, 22603003 tidak ada |
| AC-03 | Pilih pekan 7 | Muncul tepat 12 peserta Lampiran A.3; tidak mengambil peserta CAD 1.2 |
| AC-04 | Input nilai NIM 22603001, pekan 5, L01 lalu pindah ke L02/pekan lain dan kembali | Nilai L01 tetap milik peserta/tugas asal; tidak menyalin ke L02 atau pekan lain |
| AC-05 | Urutkan daftar atau koreksi ejaan nama | Nilai tetap terikat student_id/enrollment_id yang sama |
| AC-06 | Dua latihan dikerjakan pada H1 | Tetap hanya satu catatan absensi dan satu observasi soft skill H1 per peserta |
| AC-07 | Nilai latihan kosong versus nilai 0 sah | Kosong belum dinilai; 0 ikut hitungan dinilai dan rata-rata |
| AC-08 | Input nilai −1, 101 atau teks pada nilai langsung | Ditolak; input 0–100 dengan maksimal dua desimal diterima |
| AC-09 | Baru 9/10 latihan lengkap atau PDF belum dinilai | Nilai akhir belum tersedia; kekurangan ditampilkan |
| AC-10 | Bobot komponen atau bobot latihan tidak berjumlah 100% | Perhitungan/finalisasi ditahan dengan alasan |
| AC-11 | Lima hari Hadir | Persentase hadir 100%; nilai kehadiran 100 pada koefisien H=1 |
| AC-12 | Empat Hadir dan satu Alpa | Persentase hadir dan nilai kehadiran 80 pada koefisien H=1, A=0 |
| AC-13 | Ada Izin/Sakit yang koefisien nilainya belum ditetapkan | Status absensi tetap tersimpan; nilai kehadiran belum dihitung |
| AC-14 | Empat Hadir dan satu hari masih kosong | Tidak dianggap empat Hadir + satu Alpa; belum lengkap 4/5 |
| AC-15 | Tidak hadir dan soft skill ditandai Tidak teramati dengan alasan | Tidak otomatis memberi skor soft skill 0; agregasi memakai observasi yang sah |
| AC-16 | Tidak ada observasi soft skill yang sah | Komponen belum dapat dihitung; tidak otomatis 0/100 atau menggeser bobot |
| AC-17 | Teknis 80, PDF 85, soft skill 90, kehadiran 100 dan bobot usulan | Calon nilai akhir 85,25 |
| AC-18 | Nilai lengkap tetapi satu latihan di bawah ambang atau PDF belum diterima | Tidak Tuntas pada aturan ketuntasan usulan |
| AC-19 | Jadwal sesi dipindahkan | Catatan tetap terikat sesi yang benar; tidak membuat Alpa pada tanggal lama |
| AC-20 | Rerata dashboard menampilkan peserta yang hanya sebagian lengkap | Rerata komponen disertai n; tidak diberi label rerata nilai akhir final |
| AC-21 | Finalisasi lalu revisi nilai | Nilai lama, perubahan, alasan dan versi aturan dapat ditelusuri |
| AC-22 | Tugas L09/L10 belum didefinisikan | Konfigurasi ditandai belum siap; tidak mengarang judul/bukti dari PDF lama |

## 14. Batasan dan keputusan yang masih terbuka

| Keputusan | Usulan kerja / kebutuhan keputusan |
|---|---|
| Platform implementasi | Belum ditentukan. PRD dapat diterapkan sebagai workbook terstruktur atau aplikasi; belum memilih teknologi/hosting |
| Bobot komponen | Teknis 60%, PDF 15%, soft skill 15%, kehadiran 10% |
| Mode input latihan | Input cepat 0–100, rubrik sebagai acuan; kalkulator rubrik dapat diaktifkan sebagai mode terpisah |
| Materi dua soal tambahan | L09 dan L10 harus disediakan instruktur |
| Model output PDF | Satu PDF final gabungan L01–L10 per mahasiswa |
| Koefisien Izin/Sakit | Belum ditetapkan; tidak boleh disamakan secara diam-diam dengan Hadir/Alpa |
| Minimum observasi soft skill | Usulan minimal satu hari valid dan semua lima hari ditinjau; jumlah minimum perlu ditetapkan sebelum pemakaian resmi |
| Ambang dan ketuntasan | Usulan 75 untuk nilai akhir, setiap latihan, dan PDF; PDF juga harus diterima |
| Lima hari efektif | Tanggal mengikuti jadwal rencana, tetapi libur/penggantian sesi harus dikonfirmasi melalui jadwal pelaksanaan yang benar |
| Daftar induk mahasiswa | Transkripsi gambar sudah tersedia; ejaan/NIM perlu dicocokkan dengan sumber institusi sebelum menjadi master resmi |

Tidak termasuk penilaian geometri otomatis, akses akun mahasiswa, pengiriman nilai ke pihak lain, atau penerbitan dashboard publik. Identitas dan nilai hanya digunakan dalam ruang kerja pengguna. Jika dibuat aplikasi multi-pengguna, autentikasi, hak akses, cadangan data dan riwayat perubahan menjadi persyaratan sebelum digunakan untuk nilai resmi.

---

# Lampiran A — Peserta CAD 1.1 menurut pekan pada gambar

Seluruh entri berikut berasal dari potongan kelas 1C yang terlihat. “No. sumber” mempertahankan nomor urut pada gambar untuk memudahkan pencocokan. Pengelompokan didasarkan pada sel CAD1.1, bukan kedekatan nomor mahasiswa. Penulisan nama merupakan transkripsi visual, bukan koreksi ejaan dari daftar induk.

## A.1. Pekan 3 — 2026-08-17 s.d. 2026-08-21

Kelas 1C · CAD 1.1 · Minggu kalender 34 · 12 mahasiswa.

| No. sumber | NIM | Nama mahasiswa |
|---:|---|---|
| 3 | 22603003 | Affan Farsyah |
| 4 | 22603004 | Afiqah Azwa Safrina |
| 6 | 22603006 | Anesya Nurhawizah |
| 10 | 22603010 | Daniel Adlan Sura Parinding |
| 12 | 22603012 | Falya Aisyah Naswah |
| 15 | 22603015 | Khumaira Khaerunnisa |
| 20 | 22603020 | Muh.Raihan Aryan |
| 21 | 22603021 | Muhammad Abyan Zaky |
| 25 | 22603025 | Ranita Rosa Putri |
| 27 | 22603027 | Rizky Ramadhani A. |
| 30 | 22603030 | Saskia Uhti Ramadhani |
| 35 | 22603035 | Winda Tri Lestari |

Sesi rencana: H1 = 2026-08-17, H2 = 2026-08-18, H3 = 2026-08-19, H4 = 2026-08-20, H5 = 2026-08-21.

## A.2. Pekan 5 — 2026-08-31 s.d. 2026-09-04

Kelas 1C · CAD 1.1 · Minggu kalender 36 · 12 mahasiswa.

| No. sumber | NIM | Nama mahasiswa |
|---:|---|---|
| 1 | 22603001 | Achmad Fawzan |
| 5 | 22603005 | Andika Azis |
| 7 | 22603007 | Ayu Anugrah |
| 11 | 22603011 | Dede Irawan |
| 13 | 22603013 | Haura Hafizhah |
| 16 | 22603016 | M. Fauzan Adhitya Pratama H |
| 18 | 22603018 | Muh.Diaz Raditya B. |
| 24 | 22603024 | Nadya Zalzabila |
| 28 | 22603028 | Rudhi Adhana Zet |
| 31 | 22603031 | Sayyef Al Islam |
| 32 | 22603032 | Tazkia Kausara |
| 36 | 22603036 | Yulfikatrin Yuyun |

Sesi rencana: H1 = 2026-08-31, H2 = 2026-09-01, H3 = 2026-09-02, H4 = 2026-09-03, H5 = 2026-09-04.

## A.3. Pekan 7 — 2026-09-14 s.d. 2026-09-18

Kelas 1C · CAD 1.1 · Minggu kalender 38 · 12 mahasiswa.

| No. sumber | NIM | Nama mahasiswa |
|---:|---|---|
| 2 | 22603002 | Ade Meilan Alifia Sulaeman |
| 8 | 22603008 | Ayu Irmayanti |
| 9 | 22603009 | Bunga Cahya Putri Jenal |
| 14 | 22603014 | Juan Farand |
| 17 | 22603017 | Muh. Anugrah Sesar |
| 19 | 22603019 | Muh. Fakhrul Al Farezqy Rozadin |
| 22 | 22603022 | Muhammad Agam Haq |
| 23 | 22603023 | Muhammad Aidil Ahmadi |
| 26 | 22603026 | Rausyan Fikran |
| 29 | 22603029 | Salsabila Aprilia Sukardi |
| 33 | 22603033 | Wahidatul Hasanah |
| 34 | 22603034 | William Gredi Sidwel Alinsky |

Sesi rencana: H1 = 2026-09-14, H2 = 2026-09-15, H3 = 2026-09-16, H4 = 2026-09-17, H5 = 2026-09-18.

## A.4. Pemeriksaan konsistensi transkripsi

- 36 NIM unik, terbagi tepat 12 peserta pada masing-masing pekan 3, 5, dan 7.
- Setiap baris mahasiswa kelas 1C yang terlihat muncul tepat sekali pada kelompok CAD 1.1.
- Nomor pekan semester 3/5/7 dipisahkan dari minggu kalender 34/36/38.
- Tidak menambahkan mahasiswa dari bagian kelas berikutnya yang terpotong.
- Pemeriksaan ini memastikan konsistensi transkripsi, bukan pengesahan administratif jadwal atau ejaan nama.
