import { SKASTUMSItem, SKASEvaluationScore } from '../types/plcAndSkas';
import * as XLSX from 'xlsx';

export const SKAS_OFFICIAL_ITEMS: SKASTUMSItem[] = [
  // ==========================================
  // STANDARD 1: KEPIMPINAN
  // ==========================================
  {
    id: 'skas-1-1-1',
    standardId: 'Standard 1',
    aspekKod: '1.1.1',
    aspekNama: 'PGB Sebagai Peneraju: Hala Tuju Sekolah',
    tindakanPGB: 'Menetapkan, menyebarluas dan memantau hala tuju sekolah secara terancang berlandaskan visi dan misi KPM.',
    tahapTindakan: 'Skor 4: Menyebarluaskan hala tuju kepada semua warga sekolah, ibu bapa, dan pemegang taruh secara menyeluruh dan berterusan.',
    evidensDiperlukan: ['Buku Pengurusan Sekolah 2027', 'Minit Mesyuarat Guru Bil. 1/2027', 'Laman Web / Papan Kenyataan Sekolah', 'Taklimat Awal Tahun'],
    bidangTakwim: 'Pengurusan dan Staf',
    unitCadangan: 'Pentadbiran Sekolah',
    cadanganTajukProgram: 'Mesyuarat Guru & Taklimat Penetapan Hala Tuju Sekolah Sesi 2027',
    objektifProgram: 'Menyebarluaskan visi, misi, sasaran akademik dan perancangan strategik TS25 sekolah kepada seluruh guru dan AKP.',
    cadanganBulan: [1],
    cadanganTempat: 'Bilik Gerakan SK Tudan',
    penyelarasCadangan: 'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
    skorLalai: 4,
    statusLalai: 'Cemerlang'
  },
  {
    id: 'skas-1-1-2',
    standardId: 'Standard 1',
    aspekKod: '1.1.2',
    aspekNama: 'PGB Sebagai Peneraju: Pemajuan Sekolah',
    tindakanPGB: 'Menyediakan Pelan Strategik Organisasi (PSO), Pelan Taktikal, dan Pelan Operasi secara sistematik dan berfokus.',
    tahapTindakan: 'Skor 4: Mengkaji dan mengemas kini perancangan strategik berdasarkan analisis SWOT dan data pencapaian terkini.',
    evidensDiperlukan: ['Dokumen PSO 2026-2028', 'Minit Mesyuarat Perancangan Strategik', 'Laporan Prestasi Suku Tahun'],
    bidangTakwim: 'Pengurusan dan Staf',
    unitCadangan: 'Pentadbiran Sekolah',
    cadanganTajukProgram: 'Bengkel Pemurnian Pelan Strategik Organisasi (PSO) & Dialog Prestasi Pengurusan',
    objektifProgram: 'Mengkaji semula sasaran KPI sekolah, pelan taktikal kurikulum, HEM dan kokurikulum bersama semua Penolong Kanan.',
    cadanganBulan: [2, 7],
    cadanganTempat: 'Bilik Wawasan SK Tudan',
    penyelarasCadangan: 'PK Pentadbiran',
    skorLalai: 3,
    statusLalai: 'Baik'
  },
  {
    id: 'skas-1-2-1',
    standardId: 'Standard 1',
    aspekKod: '1.2.1',
    aspekNama: 'PGB Sebagai Pembimbing: Bimbingan Guru (Instruksional)',
    tindakanPGB: 'Membimbing guru dalam merancang, melaksana, dan menilai PdPc secara berkala melalui pencerapan klinikal.',
    tahapTindakan: 'Skor 4: Memberi bimbingan instruksional kepada semua guru dengan maklum balas bertulis dan sesi refleksi berkesan.',
    evidensDiperlukan: ['Borang Pencerapan PdPc Standard 4', 'Jadual Pencerapan Guru Fasa 1 & 2', 'Buku Rekod Mengajar (e-RPH)'],
    bidangTakwim: 'Kurikulum',
    unitCadangan: 'Pengurusan Kurikulum',
    cadanganTajukProgram: 'Pencerapan Pembelajaran & Pemudahcaraan (PdPc) Guru Fasa 1 (Standard 4)',
    objektifProgram: 'Menilai kualiti PdPc guru, memberi bimbingan pedagogi berfokus, dan memantau amalan PAK-21 bilik darjah.',
    cadanganBulan: [3, 4],
    cadanganTempat: 'Bilik-Bilik Darjah SK Tudan',
    penyelarasCadangan: 'Guru Besar & Barisan Penolong Kanan',
    skorLalai: 3,
    statusLalai: 'Baik'
  },
  {
    id: 'skas-1-3-1',
    standardId: 'Standard 1',
    aspekKod: '1.3.1',
    aspekNama: 'PGB Sebagai Pendorong: Penghargaan & Motivasi Warga',
    tindakanPGB: 'Mendorong dan memberi penghargaan kepada warga sekolah atas komitmen, kecemerlangan dan sumbangan bakti.',
    tahapTindakan: 'Skor 4: Memberi penghargaan material dan bukan material secara telus, konsisten dan berimpak tinggi.',
    evidensDiperlukan: ['Kertas Kerja Hari Anugerah Cemerlang', 'Sijil Penghargaan APC / Staf Cemerlang', 'Minit Mesyuarat Sambutan'],
    bidangTakwim: 'Pengurusan dan Staf',
    unitCadangan: 'Kelab Kebajikan Staf & Guru',
    cadanganTajukProgram: 'Majlis Apresiasi Kecemerlangan & Sambutan Hari Guru Peringkat Sekolah 2027',
    objektifProgram: 'Memberi pengiktirafan kepada guru dan staf atas kecemerlangan tugas serta memperkukuh ukhuwah warga sekolah.',
    cadanganBulan: [5],
    cadanganTempat: 'Dewan Sri Tudan',
    penyelarasCadangan: 'Pengerusi Kelab Guru & Staf',
    skorLalai: 4,
    statusLalai: 'Cemerlang'
  },

  // ==========================================
  // STANDARD 2: PENGURUSAN ORGANISASI
  // ==========================================
  {
    id: 'skas-2-1-1',
    standardId: 'Standard 2',
    aspekKod: '2.1.1',
    aspekNama: 'Pengurusan Sumber Manusia: Pembangunan Staf (LDP / SPLKPM)',
    tindakanPGB: 'Merancang dan melaksanakan latihan dalam perkhidmatan (LDP/CPD) sekurang-kurangnya 5 hari berkredit bagi setiap warga sekolah.',
    tahapTindakan: 'Skor 4: Memastikan 100% guru dan AKP mencapai sasaran mata kredit SPLKPM dan 5 hari kursus setahun.',
    evidensDiperlukan: ['Analisis Keperluan Latihan (TNA)', 'Kertas Kerja LDP', 'Laporan SPLKPM Sekolah', 'Senarai Kehadiran'],
    bidangTakwim: 'Pengurusan dan Staf',
    unitCadangan: 'Penyelaras LDP & SPLKPM',
    cadanganTajukProgram: 'Kursus Latihan Dalam Perkhidmatan (LDP Siri 1): Pedagogi Terbeza & Pentaksiran Autentik',
    objektifProgram: 'Meningkatkan kompetensi guru dalam merancang PdPc mengikut aras kecerdasan murid pelbagai.',
    cadanganBulan: [2],
    cadanganTempat: 'Bilik Mesyuarat Utama',
    penyelarasCadangan: 'Penyelaras LDP / Penolong Kanan',
    skorLalai: 3,
    statusLalai: 'Baik'
  },
  {
    id: 'skas-2-3-1',
    standardId: 'Standard 2',
    aspekKod: '2.3.1',
    aspekNama: 'Pengurusan Kewangan: Perbelanjaan Berhemah & Pengurusan PCG',
    tindakanPGB: 'Menyediakan Anggaran Belanja Mengurus (ABM) dan mengurus perbelanjaan Bantuan Per Kapita (PCG) mengikut tatacara kewangan.',
    tahapTindakan: 'Skor 4: Pengurusan kewangan mencapai taraf Cemerlang / Tanpa Teguran dalam audit sekolah.',
    evidensDiperlukan: ['Buku Tunai Kerajaan / SUWA', 'Minit Mesyuarat Kewangan Sekolah Bil. 1-4', 'Nota Minta & Baucar Bayaran'],
    bidangTakwim: 'Pengurusan dan Staf',
    unitCadangan: 'Jawatankuasa Pengurusan Kewangan Sekolah (JPKS)',
    cadanganTajukProgram: 'Mesyuarat Jawatankuasa Pengurusan Kewangan & Akaun Sekolah (JPKA) Bil. 1/2027',
    objektifProgram: 'Membentangkan agihan PCG setiap panitia, peruntukan BAP/KWAPM, dan memastikan perbelanjaan menepati pekeliling kewangan KPM.',
    cadanganBulan: [1, 4, 7, 10],
    cadanganTempat: 'Bilik Gerakan',
    penyelarasCadangan: 'Pembantu Tadbir Kewangan & Guru Besar',
    skorLalai: 4,
    statusLalai: 'Cemerlang'
  },
  {
    id: 'skas-2-5-1',
    standardId: 'Standard 2',
    aspekKod: '2.5.1',
    aspekNama: 'Iklim Pembelajaran: Keselamatan, Kesihatan & Keceriaan (3K)',
    tindakanPGB: 'Membersih, mengindahkan dan memastikan persekitaran fizikal sekolah selamat dan kondusif untuk proses PdPc.',
    tahapTindakan: 'Skor 4: Sekolah bebas ancaman bahaya, sifar denggi, persekitaran ceria dan mendapat penilaian keselamatan tertinggi.',
    evidensDiperlukan: ['Laporan Audit Keselamatan Sekolah', 'Gambar Gotong-Royong', 'Pelan Laluan Kecemasan', 'Buku Laporan 3K'],
    bidangTakwim: 'Hal Ehwal Murid',
    unitCadangan: 'Jawatankuasa 3K & Kebersihan',
    cadanganTajukProgram: 'Program Gotong-Royong Perdana Sekolah Selamat & Kempen 3K (Kebersihan, Kesihatan, Keselamatan)',
    objektifProgram: 'Membersihkan kawasan pembiakan aedes, mengecat laluan pejalan kaki, dan menceriakan taman herba sekolah bersama PIBG.',
    cadanganBulan: [3, 8],
    cadanganTempat: 'Seluruh Kawasan Sekolah SK Tudan',
    penyelarasCadangan: 'Penyelaras 3K & YDP PIBG',
    skorLalai: 3,
    statusLalai: 'Baik'
  },

  // ==========================================
  // STANDARD 3.1: PENGURUSAN KURIKULUM
  // ==========================================
  {
    id: 'skas-3-1-1-1',
    standardId: 'Standard 3.1',
    aspekKod: '3.1.1.1',
    aspekNama: 'Ketetapan Kurikulum: Pelaksanaan Dasar Kurikulum Kebangsaan',
    tindakanPGB: 'Mengurus pelaksanaan kurikulum secara sistematik berasaskan ketetapan KPM, DSKP, dan arahan JPN/PPD.',
    tahapTindakan: 'Skor 4: Ketetapan didokumentasikan, disebarluaskan, dipatuhi sepenuhnya, dan disemak secara berkala.',
    evidensDiperlukan: ['Buku Ketetapan Kurikulum 2027', 'Minit Mesyuarat Kurikulum Bil. 1-4', 'Jadual Waktu Induk Sekolah'],
    bidangTakwim: 'Kurikulum',
    unitCadangan: 'Pengurusan Kurikulum',
    cadanganTajukProgram: 'Mesyuarat Jawatankuasa Kurikulum Sekolah (JKS) Bil. 1/2027',
    objektifProgram: 'Menetapkan dasar kurikulum sekolah, pengurusan e-RPH, jadual waktu, dan sasaran PBD sekolah tahun 2027.',
    cadanganBulan: [1],
    cadanganTempat: 'Bilik Gerakan',
    penyelarasCadangan: 'PK Pentadbiran & Kurikulum',
    skorLalai: 4,
    statusLalai: 'Cemerlang'
  },
  {
    id: 'skas-3-1-2-1',
    standardId: 'Standard 3.1',
    aspekKod: '3.1.2.1',
    aspekNama: 'Pengurusan Mata Pelajaran: Pelaksanaan Kurikulum DSKP',
    tindakanPGB: 'Memastikan semua panitia mata pelajaran merancang dan melaksanakan pengajaran berlandaskan DSKP dan RPT terkini.',
    tahapTindakan: 'Skor 4: 100% guru memiliki RPT lengkap, menyelaraskan DSKP, dan fail panitia diselenggara secara sistematik.',
    evidensDiperlukan: ['Fail Panitia Mata Pelajaran (Fail 1-6)', 'RPT Disahkan Pentadbir', 'Buku Rekod Semakan RPH'],
    bidangTakwim: 'Panitia Mata Pelajaran',
    unitCadangan: 'Semua Ketua Panitia',
    cadanganTajukProgram: 'Mesyuarat Panitia Mata Pelajaran Bil. 1/2027 (Penyelarasan DSKP & RPT)',
    objektifProgram: 'Menyelaraskan perancangan tahunan, agihan topik, buku teks, dan standard pembelajaran bagi setiap aliran.',
    cadanganBulan: [1],
    cadanganTempat: 'Bilik Mesyuarat 2 / Bilik Panitia',
    penyelarasCadangan: 'Semua Ketua Panitia Mata Pelajaran',
    skorLalai: 4,
    statusLalai: 'Cemerlang'
  },
  {
    id: 'skas-3-1-2-2',
    standardId: 'Standard 3.1',
    aspekKod: '3.1.2.2',
    aspekNama: 'Pengurusan Mata Pelajaran: Peningkatan Kualiti Pengajaran Guru (PLC)',
    tindakanPGB: 'Merancang dan melaksanakan program peningkatan kompetensi pedagogi guru panitia melalui PLC sekurang-kurangnya 3 pusingan.',
    tahapTindakan: 'Skor 4: Melaksanakan PLC berimpak tinggi merangkumi Lesson Study, Peer Coaching, dan Learning Walk secara berterusan.',
    evidensDiperlukan: ['Laporan PLC Panitia', 'Borang Sarana PLC KPM', 'Foto Sesi Kolaborasi Guru', 'Pelaporan SPLKPM'],
    bidangTakwim: 'Panitia Mata Pelajaran',
    unitCadangan: 'Penyelaras PLC & Ketua Panitia',
    cadanganTajukProgram: 'Program Komuniti Pembelajaran Profesional (PLC): Lesson Study & Bimbingan Pedagogi PAK-21',
    objektifProgram: 'Meningkatkan kemahiran guru dalam mereka bentuk PdPc bermakna dan pentaksiran formatif bilik darjah.',
    cadanganBulan: [2, 4, 7, 9],
    cadanganTempat: 'Bilik Gerakan / Bilik Darjah',
    penyelarasCadangan: 'Penyelaras PLC Sekolah',
    skorLalai: 3,
    statusLalai: 'Baik'
  },
  {
    id: 'skas-3-1-2-3',
    standardId: 'Standard 3.1',
    aspekKod: '3.1.2.3',
    aspekNama: 'Pengurusan Mata Pelajaran: Program Peningkatan Pencapaian Murid (Intervensi & Pengayaan)',
    tindakanPGB: 'Merancang dan melaksanakan program intervensi murid lemah (TP1 & TP2) serta program pengayaan murid cemerlang.',
    tahapTindakan: 'Skor 4: Memastikan peningkatan peratusan murid mencapai TP3 ke atas dan sifar buta huruf/buta numerasi.',
    evidensDiperlukan: ['Kertas Kerja Intervensi Panitia', 'Rekod Kemajuan Murid', 'Analisis Pra & Pasca Ujian', 'Bahan Modul Terbeza'],
    bidangTakwim: 'Panitia Mata Pelajaran',
    unitCadangan: 'Panitia Teras (BM, BI, Matematik, Sains)',
    cadanganTajukProgram: 'Program Intervensi Berfokus Literasi & Numerasi (Celik 3M & Lonjakan PBD) Fasa 1',
    objektifProgram: 'Membimbing murid yang belum menguasai kemahiran asas membaca, menulis, dan mengira agar mencapai tahap minimum TP3.',
    cadanganBulan: [3, 4, 8, 10],
    cadanganTempat: 'Bilik Pemulihan Khas & Kelas Bimbingan',
    penyelarasCadangan: 'Ketua Panitia BM/Matematik & Guru Pemulihan',
    skorLalai: 2,
    statusLalai: 'Perlu Intervensi'
  },
  {
    id: 'skas-3-1-4-1',
    standardId: 'Standard 3.1',
    aspekKod: '3.1.4.1',
    aspekNama: 'Pengurusan Penilaian Murid: Pelaksanaan PBD & UASA',
    tindakanPGB: 'Merancang, menyelaras dan melaksanakan pentaksiran bilik darjah (PBD), moderasi skor, dan pelaporan rasmi kepada ibu bapa.',
    tahapTindakan: 'Skor 4: Moderasi dilaksanakan dengan adil, data direkod dalam portal SPPB KPM, dan dialog prestasi diadakan berkala.',
    evidensDiperlukan: ['Jadual UASA / Pentaksiran Bilik Darjah', 'Borang Moderasi Panitia', 'Laporan PBD SPPB', 'Minit Dialog Prestasi'],
    bidangTakwim: 'Kurikulum',
    unitCadangan: 'Penyelaras PBD & Peperiksaan',
    cadanganTajukProgram: 'Moderasi Pentaksiran Bilik Darjah (PBD) & Sesi Dialog Prestasi Akademik Pertengahan Sesi',
    objektifProgram: 'Menyelaras standard pertimbangan profesional guru, mengesahkan skor TP murid, dan merangka intervensi penggal kedua.',
    cadanganBulan: [6, 11],
    cadanganTempat: 'Bilik Gerakan SK Tudan',
    penyelarasCadangan: 'Penyelaras PBD Sekolah',
    skorLalai: 3,
    statusLalai: 'Baik'
  },

  // ==========================================
  // STANDARD 3.2: PENGURUSAN KOKURIKULUM
  // ==========================================
  {
    id: 'skas-3-2-1-1',
    standardId: 'Standard 3.2',
    aspekKod: '3.2.1.1',
    aspekNama: 'Ketetapan Kokurikulum: Pelaksanaan Dasar Kokurikulum',
    tindakanPGB: 'Menetapkan dasar perjumpaan mingguan kokurikulum sekurang-kurangnya 12 kali perjumpaan bagi setiap unit.',
    tahapTindakan: 'Skor 4: Jadual perjumpaan dipatuhi 100%, penglibatan murid melebihi 95%, dan buku log disemak berkala.',
    evidensDiperlukan: ['Buku Panduan Kokurikulum 2027', 'Buku Log Kehadiran Murid', 'Jadual Perjumpaan Rabu Kokurikulum'],
    bidangTakwim: 'Kokurikulum',
    unitCadangan: 'Pengurusan Kokurikulum',
    cadanganTajukProgram: 'Mesyuarat Pengurusan Kokurikulum Bil. 1/2027 & Pendaftaran 1M1S/Unit Beruniform',
    objektifProgram: 'Menyelaras agihan guru penasihat, pendaftaran ahli unit beruniform, kelab persatuan, sukan permainan, dan jadual perjumpaan.',
    cadanganBulan: [1],
    cadanganTempat: 'Dewan Sri Tudan',
    penyelarasCadangan: 'PK Kokurikulum',
    skorLalai: 4,
    statusLalai: 'Cemerlang'
  },
  {
    id: 'skas-3-2-5-1',
    standardId: 'Standard 3.2',
    aspekKod: '3.2.5.1',
    aspekNama: 'Program Kecemerlangan Kokurikulum: Perkhemahan & Kepimpinan',
    tindakanPGB: 'Merancang dan melaksanakan aktiviti perkhemahan perdana dan kem kepimpinan kokurikulum bagi membina jati diri murid.',
    tahapTindakan: 'Skor 4: Penyertaan menyeluruh murid Tahap 2, mematuhi SOP keselamatan, dan mencapai objektif kepimpinan.',
    evidensDiperlukan: ['Kertas Kerja Perkhemahan', 'Surat Kebenaran Ibu Bapa', 'Laporan Dokumentasi Bergambar', 'Sijil Penyertaan'],
    bidangTakwim: 'Kokurikulum',
    unitCadangan: 'Unit Beruniform',
    cadanganTajukProgram: 'Perkhemahan Perdana Unit Beruniform SK Tudan 2027 (Kem Jati Diri & Kepimpinan)',
    objektifProgram: 'Melatih disiplin, ikhtiar hidup, kemahiran kawad kaki, dan semangat kerjasama murid Tahap 2.',
    cadanganBulan: [9],
    cadanganTempat: 'Padang Sekolah SK Tudan',
    penyelarasCadangan: 'Penyelaras Unit Beruniform',
    skorLalai: 3,
    statusLalai: 'Baik'
  },
  {
    id: 'skas-3-2-6-1',
    standardId: 'Standard 3.2',
    aspekKod: '3.2.6.1',
    aspekNama: 'Sukan Untuk Semua: Kejohanan Sukan Tahunan / Olahraga',
    tindakanPGB: 'Mengelolakan kejohanan olahraga tahunan dan aktiviti 1 Murid 1 Sukan (1M1S) yang melibatkan 100% murid.',
    tahapTindakan: 'Skor 4: Melibatkan semua murid daripada pelbagai tahap kebolehan, penyertaan aktif ibu bapa dan sifar insiden.',
    evidensDiperlukan: ['Buku Program Kejohanan Olahraga', 'Keputusan Pemarkahan Rumah Sukan', 'Laporan Perubatan & PBSM'],
    bidangTakwim: 'Kokurikulum',
    unitCadangan: 'Majlis Sukan Sekolah',
    cadanganTajukProgram: 'Kejohanan Sukan Tahunan & Balapan Padang SK Tudan Kali Ke-28',
    objektifProgram: 'Mencungkil bakat sukan murid, memupuk semangat kesukanan, dan menggalakkan gaya hidup sihat sepanjang hayat.',
    cadanganBulan: [8],
    cadanganTempat: 'Stadium Terbuka Miri / Padang SK Tudan',
    penyelarasCadangan: 'Setiausaha Sukan Sekolah',
    skorLalai: 4,
    statusLalai: 'Cemerlang'
  },
  {
    id: 'skas-3-2-7-1',
    standardId: 'Standard 3.2',
    aspekKod: '3.2.7.1',
    aspekNama: 'Pentaksiran Kokurikulum: Pengisian PAJSK & Ujian SEGAK',
    tindakanPGB: 'Merekod, memverifikasi dan menganalisis skor Pentaksiran Aktiviti Jasmani, Sukan dan Kokurikulum (PAJSK) serta SEGAK murid.',
    tahapTindakan: 'Skor 4: 100% data PAJSK dan SEGAK Penggal 1 & 2 diisi dalam sistem KPM sebelum tarikh tutup rasmi.',
    evidensDiperlukan: ['Analisis Markah PAJSK Sekolah', 'Buku Rekod SEGAK Murid', 'Slip Keputusan PAJSK Tahun 6'],
    bidangTakwim: 'Kokurikulum',
    unitCadangan: 'Penyelaras PAJSK & Panitia PJPK',
    cadanganTajukProgram: 'Ujian Standard Kecergasan Fizikal Kebangsaan (SEGAK) Penggal 1 & Bengkel Verifikasi PAJSK',
    objektifProgram: 'Mengukur tahap kecergasan fizikal murid Tahap 2 dan mengesahkan kehadiran serta penglibatan kokurikulum.',
    cadanganBulan: [5, 10],
    cadanganTempat: 'Dewan Sri Tudan',
    penyelarasCadangan: 'Ketua Panitia PJPK & Guru PAJSK',
    skorLalai: 3,
    statusLalai: 'Baik'
  },

  // ==========================================
  // STANDARD 3.3: PENGURUSAN HAL EHWAL MURID (HEM)
  // ==========================================
  {
    id: 'skas-3-3-2-1',
    standardId: 'Standard 3.3',
    aspekKod: '3.3.2.1',
    aspekNama: 'Pengurusan Disiplin: Penguatkuasaan Peraturan & Sistem Sahsiah (SSDM)',
    tindakanPGB: 'Memupuk sahsiah terpuji, memantau kehadiran murid (APDM), dan merekod amalan baik murid dalam portal SSDM KPM.',
    tahapTindakan: 'Skor 4: Kadar kehadiran murid mencapai KPI 95% ke atas, kadar salah laku disiplin menurun bawah 1%, dan amalan baik meningkat.',
    evidensDiperlukan: ['Laporan Bulanan APDM', 'Pangkalan Data SSDM Amalan Baik', 'Buku Kawalan Kelas', 'Laporan Lembaga Disiplin'],
    bidangTakwim: 'Hal Ehwal Murid',
    unitCadangan: 'Lembaga Disiplin & Pengawas',
    cadanganTajukProgram: 'Kempen Sifar Ponteng & Pelancaran Amalan Baik SSDM (Murid Teladan SK Tudan)',
    objektifProgram: 'Meningkatkan peratusan kehadiran tahunan murid, menghargai murid berkehadiran penuh, dan membudayakan amalan sopan.',
    cadanganBulan: [2],
    cadanganTempat: 'Dataran Perhimpunan SK Tudan',
    penyelarasCadangan: 'Ketua Guru Disiplin',
    skorLalai: 3,
    statusLalai: 'Baik'
  },
  {
    id: 'skas-3-3-3-1',
    standardId: 'Standard 3.3',
    aspekKod: '3.3.3.1',
    aspekNama: 'Pengurusan Keselamatan Murid: Latihan Pengungsian Bangunan (Fire Drill)',
    tindakanPGB: 'Melaksanakan latihan kebakaran dan pengungsian bangunan sekurang-kurangnya dua kali setahun dengan kerjasama Bomba.',
    tahapTindakan: 'Skor 4: Pengosongan bangunan berjaya diselesaikan bawah tempoh masa standard (bawah 4 minit) secara tertib.',
    evidensDiperlukan: ['Laporan Latihan Kebakaran', 'Surat Kerjasama Balai Bomba', 'Gambar Evakuasi Padang', 'Peta Laluan Kecemasan'],
    bidangTakwim: 'Hal Ehwal Murid',
    unitCadangan: 'Unit Keselamatan Sekolah',
    cadanganTajukProgram: 'Latihan Pengungsian Bangunan & Demonstrasi Memadam Kebakaran (Fire Drill Siri 1)',
    objektifProgram: 'Mendedahkan murid dan warga sekolah kepada laluan kecemasan pantas serta cara bertindak balas sekiranya berlaku kebakaran.',
    cadanganBulan: [3, 8],
    cadanganTempat: 'Blok Pentadbiran, Bilik Darjah & Padang Sekolah',
    penyelarasCadangan: 'Penyelaras Keselamatan & Balai Bomba Lutong/Miri',
    skorLalai: 4,
    statusLalai: 'Cemerlang'
  },
  {
    id: 'skas-3-3-4-1',
    standardId: 'Standard 3.3',
    aspekKod: '3.3.4.1',
    aspekNama: 'Pengurusan Kesihatan Murid: Rancangan Makanan Tambahan (RMT) & Imunisasi',
    tindakanPGB: 'Memastikan pematuhan menu RMT KPM, kebersihan kantin sekolah, dan pelaksanaan rawatan kesihatan/pergigian berkala.',
    tahapTindakan: 'Skor 4: Kebersihan kantin gred A, makanan RMT berkhasiat tepat jam, dan rekod kesihatan 100% murid diselenggara rapi.',
    evidensDiperlukan: ['Buku Laporan Harian RMT', 'Sijil Gred Kantin Sekolah', 'Buku Rekod Kesihatan Murid (RKM)'],
    bidangTakwim: 'Hal Ehwal Murid',
    unitCadangan: 'Unit RMT & Kesihatan',
    cadanganTajukProgram: 'Taklimat Penyeliaan RMT, Program Susu Sekolah & Rawatan Kesihatan/Imunisasi Murid Tahun 1',
    objektifProgram: 'Memantau pemakanan murid B40 yang layak, menjaga nutrisi murid, dan melengkapkan jadual imunisasi klinik kesihatan.',
    cadanganBulan: [1, 7],
    cadanganTempat: 'Kantin Sekolah & Bilik Rawatan',
    penyelarasCadangan: 'Penyelaras RMT & Guru Kesihatan',
    skorLalai: 4,
    statusLalai: 'Cemerlang'
  },
  {
    id: 'skas-3-3-6-1',
    standardId: 'Standard 3.3',
    aspekKod: '3.3.6.1',
    aspekNama: 'Bimbingan & Kaunseling: Amalan Guru Penyayang & Ziarah Cakna',
    tindakanPGB: 'Melaksanakan program menyambut kehadiran murid di pintu pagar, sesi kaunseling berfokus, dan program Ziarah Cakna keluarga murid.',
    tahapTindakan: 'Skor 4: Suasana penyayang terbukti dirasai murid, sifar keciciran murid, dan hubungan erat dengan ibu bapa terbina.',
    evidensDiperlukan: ['Jadual Guru Penyayang Pintu Pagar', 'Laporan Program Ziarah Cakna', 'Buku Rekod Sesi Kaunseling'],
    bidangTakwim: 'Hal Ehwal Murid',
    unitCadangan: 'Unit Bimbingan dan Kaunseling (UBK)',
    cadanganTajukProgram: 'Pelancaran Amalan Guru Penyayang, Sambutan Murid di Pintu Pagar & Program Ziarah Cakna',
    objektifProgram: 'Menyambut murid dengan senyuman dan sapaan mesra setiap pagi, serta menziarahi keluarga murid yang memerlukan sokongan.',
    cadanganBulan: [1, 4, 9],
    cadanganTempat: 'Pintu Pagar Utama & Kediaman Murid Sasaran',
    penyelarasCadangan: 'Guru Bimbingan dan Kaunseling (GBK)',
    skorLalai: 4,
    statusLalai: 'Cemerlang'
  },

  // ==========================================
  // STANDARD 4: PEMBELAJARAN DAN PEMUDAHCARAAN (PDPC)
  // ==========================================
  {
    id: 'skas-4-1-1',
    standardId: 'Standard 4',
    aspekKod: '4.1.1',
    aspekNama: 'Guru Sebagai Perancang: RPH Eksplisit & Kriteria Kejayaan',
    tindakanPGB: 'Guru merancang pelaksanaan PdPc secara profesional dengan objektif eksplisit dan kriteria kejayaan yang boleh diukur.',
    tahapTindakan: 'Skor 4: RPH menepati DSKP, mengandungi aktiviti pembezaan, peruntukan masa tepat, dan instrumen PBD yang jelas.',
    evidensDiperlukan: ['Penghantaran e-RPH Mingguan', 'Semakan Pentadbir terhadap RPH', 'Lembaran Aktiviti Terbeza'],
    bidangTakwim: 'Kurikulum',
    unitCadangan: 'Pengurusan Kurikulum & Panitia',
    cadanganTajukProgram: 'Bengkel Pembinaan Rancangan Pengajaran Harian (RPH) Bermakna & Penetapan Kriteria Kejayaan (Success Criteria)',
    objektifProgram: 'Membimbing guru merangka objektif pembelajaran yang eksplisit berteraskan Taksonomi Bloom dan pendekatan terbeza.',
    cadanganBulan: [1, 6],
    cadanganTempat: 'Bilik Mesyuarat 2',
    penyelarasCadangan: 'Guru Cemerlang / Penolong Kanan Pentadbiran',
    skorLalai: 3,
    statusLalai: 'Baik'
  },
  {
    id: 'skas-4-6-1',
    standardId: 'Standard 4',
    aspekKod: '4.6.1',
    aspekNama: 'Murid Sebagai Pembelajar Aktif: Pembudayaan PAK-21 & KBAT',
    tindakanPGB: 'Memastikan murid terlibat aktif, bekerjasama secara kolaboratif, berkomunikasi, dan berfikir secara kritis semasa PdPc.',
    tahapTindakan: 'Skor 4: Murid mempamerkan kemahiran berfikir aras tinggi (KBAT), aktif dalam aktiviti kumpulan, dan berani membentang idea.',
    evidensDiperlukan: ['Rakaman Video PdPc PAK-21', 'Hasil Kerja Gallery Walk Murid', 'Catatan Borang Pencerapan Standard 4'],
    bidangTakwim: 'Panitia Mata Pelajaran',
    unitCadangan: 'Penyelaras PAK-21 & Semua Panitia',
    cadanganTajukProgram: 'Karnival Pembelajaran Abad Ke-21 (PAK-21) & Pembentangan Hasil Inovasi Murid',
    objektifProgram: 'Memberi ruang kepada murid mempersembahkan projek bilik darjah melalui kaedah Gallery Walk, Hot Seat, dan Deklamasi.',
    cadanganBulan: [7],
    cadanganTempat: 'Dewan Sri Tudan',
    penyelarasCadangan: 'Penyelaras PAK-21 Sekolah',
    skorLalai: 3,
    statusLalai: 'Baik'
  }
];

export function getAllSKASItems(): SKASTUMSItem[] {
  return SKAS_OFFICIAL_ITEMS;
}

/**
 * Download sample official SK@S instrument spreadsheet for upload or grading
 */
export function downloadSKASInstrumentExcel(schoolName = 'SK Tudan, Miri') {
  const wb = XLSX.utils.book_new();

  const data = SKAS_OFFICIAL_ITEMS.map((item, idx) => ({
    'BIL': idx + 1,
    'STANDARD': item.standardId,
    'KOD_ASPEK': item.aspekKod,
    'NAMA_ASPEK': item.aspekNama,
    'TINDAKAN_KPM': item.tindakanPGB,
    'SKOR_PENILAIAN (1-4)': item.skorLalai || 3,
    'STATUS': item.statusLalai || 'Baik',
    'EVIDENS_WAJIB': item.evidensDiperlukan.join('; '),
    'CADANGAN_PROGRAM_TAKWIM': item.cadanganTajukProgram,
    'BIDANG_TAKWIM': item.bidangTakwim,
    'PENYELARAS': item.penyelarasCadangan,
    'BULAN_CADANGAN': item.cadanganBulan.join(', ')
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Instrumen_SKAS_SKPM');
  XLSX.writeFile(wb, `Instrumen_Penilaian_SKAS_SKPM_${schoolName.replace(/[\s,]+/g, '_')}_2027.xlsx`);
}

/**
 * Export full mapping report linking SK@S scores to the Takwim program implementation
 */
export function downloadSKASMappingReportExcel(
  items: SKASTUMSItem[],
  scoresMap: Record<string, number>,
  schoolName = 'SK Tudan, Miri'
) {
  const wb = XLSX.utils.book_new();

  const reportData = items.map((item, idx) => {
    const currentScore = scoresMap[item.aspekKod] !== undefined ? scoresMap[item.aspekKod] : (item.skorLalai || 3);
    const status = currentScore >= 4 ? 'Cemerlang' : currentScore === 3 ? 'Baik' : currentScore === 2 ? 'Sederhana' : 'Perlu Intervensi';
    const perlukanTindakanSegera = currentScore <= 2 ? 'YA (Tindakan Segera)' : 'TIDAK (Pemantapan)';

    return {
      'BIL': idx + 1,
      'STANDARD': item.standardId,
      'KOD_TUMS': item.aspekKod,
      'ASPEK_SK@S': item.aspekNama,
      'SKOR_TERKINI': currentScore,
      'STATUS_PENCAPAIAN': status,
      'KEPERLUAN_INTERVENSI': perlukanTindakanSegera,
      'PROGRAM_TAKWIM_DICADANGKAN': item.cadanganTajukProgram,
      'BIDANG_TAKWIM': item.bidangTakwim,
      'PENYELARAS_BERTANGGUNGJAWAB': item.penyelarasCadangan,
      'CADANGAN_BULAN': item.cadanganBulan.map(b => `Bulan ${b}`).join(', '),
      'BUKTI_EVIDENS_WAJIB': item.evidensDiperlukan.join(', ')
    };
  });

  const ws = XLSX.utils.json_to_sheet(reportData);
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Pemetaan_SKAS_Takwim');
  XLSX.writeFile(wb, `Laporan_Pemetaan_SKAS_dan_Takwim_${schoolName.replace(/[\s,]+/g, '_')}_2027.xlsx`);
}
