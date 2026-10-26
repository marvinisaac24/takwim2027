import { PLCActivityItem, PLCToolType, PLCUploadedKit } from '../types/plcAndSkas';
import * as XLSX from 'xlsx';

export interface PLCToolDefinition {
  type: PLCToolType;
  nama: string;
  deskripsi: string;
  langkahPelaksanaan: string[];
  kumpulanSasaran: string;
  faedahUtama: string;
}

export const KPM_PLC_TOOL_DEFINITIONS: PLCToolDefinition[] = [
  {
    type: 'Lesson Study',
    nama: 'Kajian Pengajaran (Lesson Study)',
    deskripsi: 'Model kolaboratif guru untuk mereka bentuk RPH secara bersama, memerhati pelaksanaan PdPc dalam kelas sebenar, dan membuat refleksi mendalam bagi penambahbaikan berterusan.',
    langkahPelaksanaan: [
      'Langkah 1: Perjumpaan awal untuk mengenal pasti isu pembelajaran murid & bina RPH bersama.',
      'Langkah 2: Seorang guru mengajar (Guru Model) manakala guru panitia lain memerhati & mencatat bukti pembelajaran murid.',
      'Langkah 3: Sesi pasca-pengajaran (Refleksi & Post-Mortem) membincangkan respon murid, bukan mengkritik guru.',
      'Langkah 4: Pengubahsuaian RPH untuk diuji semula atau didokumentasikan dalam fail panitia.'
    ],
    kumpulanSasaran: 'Semua guru dalam panitia yang sama atau merentas tahap.',
    faedahUtama: 'Meningkatkan pemahaman mendalam tentang cara murid belajar serta menghasilkan RPH yang terbukti berkesan.'
  },
  {
    type: 'Peer Coaching',
    nama: 'Bimbingan Rakan Sebaya (Peer Coaching)',
    deskripsi: 'Proses bimbingan profesional secara berpasangan (Coach & Coachee) untuk mengasah kemahiran pedagogi khusus tanpa unsur penilaian prestasi.',
    langkahPelaksanaan: [
      'Pra-Konferens: Berbincang fokus kemahiran pedagogi (cth: teknik penyoalan KBAT, pengurusan masa).',
      'Pemerhatian: Coach duduk dalam kelas merekod data spesifik mengikut persetujuan.',
      'Pasca-Konferens: Coachee membuat refleksi kendiri berpandukan data dan bimbingan Coach.'
    ],
    kumpulanSasaran: 'Pasangan guru novis & guru berpengalaman / Guru Cemerlang.',
    faedahUtama: 'Membina keyakinan dan kemahiran pedagogi spesifik dalam suasana selamat dan menyokong.'
  },
  {
    type: 'Learning Walk',
    nama: 'Jelajah Pembelajaran (Learning Walk)',
    deskripsi: 'Pemerhatian amalan bilik darjah secara pantas (10-15 minit bagi setiap kelas) oleh kumpulan guru untuk melihat amalan terbaik pedagogi secara holistik.',
    langkahPelaksanaan: [
      'Penetapan Fokus: Memilih 1 fokus jelas (cth: penggunaan Traffic Light PAK-21, sudut ganjaran).',
      'Jelajah Kelas: Melawat 3-4 buah bilik darjah selama 10-15 minit setiap kelas.',
      'Perbincangan Koridor / Refleksi Pantas: Merumus pola amalan terbaik yang boleh dicontohi seluruh sekolah.'
    ],
    kumpulanSasaran: 'Ketua Panitia & guru mata pelajaran.',
    faedahUtama: 'Menyebarluaskan idea pedagogi kreatif dan budaya bilik darjah yang hidup.'
  },
  {
    type: 'Teacher Sharing Sessions',
    nama: 'Sesi Perkongsian Guru (Teacher Sharing Sessions / TSS)',
    deskripsi: 'Platform pembentangan santai namun profesional bagi guru berkongsi BBM, aplikasi digital (DELIMa/Canva/Quizziz), atau modul intervensi yang berkesan.',
    langkahPelaksanaan: [
      'Penyediaan Bahan: Guru pembentang menyediakan modul/kaedah yang terbukti berjaya.',
      'Sesi Perkongsian: Sesi 30-45 minit pembentangan dan demonstrasi amali.',
      'Penyebaran Bahan: Modul dikongsi dalam Google Drive panitia untuk diguna pakai rakan guru lain.'
    ],
    kumpulanSasaran: 'Semua guru panitia.',
    faedahUtama: 'Memperkaya bank sumber pengajaran dan mempercepatkan penyebaran amalan terbaik.'
  },
  {
    type: 'Data Analysis',
    nama: 'Analisis Data Prestasi (Data Analysis / Analisis Jurang)',
    deskripsi: 'Pemeriksaan berstruktur terhadap data Pentaksiran Bilik Darjah (PBD), ujian bulanan, atau UASA untuk mengenal pasti topik sukar dan kumpulan murid bimbingan.',
    langkahPelaksanaan: [
      'Pengumpulan Data: Memuat turun laporan analisis PBD (TP1 - TP6) dan markah ujian.',
      'Analisis Item & Jurang: Menentukan standard kandungan yang mencatat peratusan gagal tertinggi.',
      'Pelan Intervensi: Menetapkan strategi intervensi dan tarikh penilaian susulan.'
    ],
    kumpulanSasaran: 'Ketua Panitia dan guru mata pelajaran.',
    faedahUtama: 'Menjadikan perancangan pengajaran berlandaskan data sebenar (Data-Driven Instruction).'
  },
  {
    type: 'Video Critique',
    nama: 'Kritikan Video Pengajaran (Video Critique)',
    deskripsi: 'Menonton dan menganalisis rakaman video PdPc bilik darjah secara kolaboratif untuk memperhalusi gaya penyampaian, respon murid dan pengurusan masa.',
    langkahPelaksanaan: [
      'Rakaman Klip: Merakam 10-15 minit bahagian pengajaran penting (cth: set induksi atau fasa bimbingan).',
      'Tontonan Kolaboratif: Guru menonton bersama dengan instrumen senarai semak.',
      'Sumbang Saran: Mengutarakan cadangan alternatif untuk meningkatkan impak pengajaran.'
    ],
    kumpulanSasaran: 'Guru panitia yang ingin menambah baik kemahiran pengajaran spesifik.',
    faedahUtama: 'Melihat perspektif murid terhadap pengajaran guru secara objektif.'
  },
  {
    type: 'Book Club',
    nama: 'Kelab Buku / Pembacaan Profesional (Book Club)',
    deskripsi: 'Perbincangan ilmiah mengenai artikel pedagogi terkini, buku rujukan pendidikan, atau pekeliling kurikulum untuk memantapkan pengetahuan profesional.',
    langkahPelaksanaan: [
      'Pemilihan Bahan: Memilih satu artikel atau bab buku yang relevan dengan fokus panitia.',
      'Pembacaan Kendiri: Guru membaca dan menandakan poin penting sebelum sesi.',
      'Sesi Wacana: Perbincangan bagaimana teori atau dapatan kajian boleh diaplikasikan di SK Tudan.'
    ],
    kumpulanSasaran: 'Guru panitia untuk peningkatan profesionalisme berterusan (CPD).',
    faedahUtama: 'Meningkatkan literasi profesional dan memupuk budaya ilmu dalam kalangan guru.'
  },
  {
    type: 'Curriculum Mapping',
    nama: 'Pemetaan Kurikulum & Penguraian DSKP (Curriculum Mapping)',
    deskripsi: 'Penyelarasan menyeluruh antara Dokumen Standard Kurikulum dan Pentaksiran (DSKP), Rancangan Pengajaran Tahunan (RPT), dan jadual pentaksiran sekolah.',
    langkahPelaksanaan: [
      'Pemetaan Tahunan: Memadankan standard kandungan dengan minggu persekolahan 2027.',
      'Unpacking DSKP: Menguraikan kata kerja kemahiran dan pengetahuan murid.',
      'Penetapan Evidens: Menentukan instrumen pentaksiran bagi setiap tahap penguasaan (TP).'
    ],
    kumpulanSasaran: 'Semua guru mengikut tahun / aliran.',
    faedahUtama: 'Memastikan liputan kurikulum lengkap tanpa ada topik yang tertinggal atau tergesa-gesa.'
  },
  {
    type: 'Item Construction',
    nama: 'Pembinaan Item & Modul Intervensi (Item Construction)',
    deskripsi: 'Bengkel mereka bentuk soalan pentaksiran berkualiti berasaskan JSU (Jadual Spesifikasi Ujian), rubrik pemarkahan, dan modul latih tubi berfokus.',
    langkahPelaksanaan: [
      'Analisis DSKP: Memilih standard pembelajaran yang menjadi fokus ujian/modul.',
      'Penggubalan Item: Membina item aneka pilihan dan subjektif mengikut aras kesukaran Rendah, Sederhana, Tinggi (R:S:T).',
      'Moderasi Item: Menyemak ketepatan stimulus, bahasa, dan skema jawapan secara berpasukan.'
    ],
    kumpulanSasaran: 'Penggubal soalan peperiksaan dalaman dan guru mata pelajaran.',
    faedahUtama: 'Menghasilkan instrumen pentaksiran bilik darjah yang sah, boleh dipercayai, dan adil.'
  }
];

/**
 * Generate customized PLC activities tailored specifically to any given Panitia
 */
export function getPLCActivitiesForPanitia(panitiaName: string): PLCActivityItem[] {
  const p = panitiaName || 'Bahasa Melayu';

  // Specific content mapping by subject
  if (p === 'Bahasa Melayu') {
    return [
      {
        id: `plc-bm-1`,
        panitia: p,
        alatPLC: 'Lesson Study',
        tajukAktiviti: 'PLC Lesson Study: Teknik Membina Ayat & Karangan Pendek Tahap 1',
        objektif: 'Membina RPH kolaboratif dan menguji keberkesanan teknik peta alir dalam penulisan ayat mudah murid Tahun 2 & 3.',
        fokusPedagogi: 'Pendekatan Terbeza & Kemahiran Menulis Asas',
        cadanganMasa: '01:30 pm - 03:00 pm',
        cadanganTempat: 'Bilik Mesyuarat 2 / Bilik Gerakan',
        cadanganBulan: [2, 3],
        tindakan: 'Ketua Panitia BM & Guru Tahap 1',
        alatToolkit: ['Toolkit 1: Borang RPH Kolaboratif', 'Toolkit 2: Borang Pemerhatian Murid', 'Toolkit 3: Laporan Refleksi'],
        evidens: 'RPH Model, Catatan Pemerhati, Foto Pelaksanaan, Hasil Lembaran Murid'
      },
      {
        id: `plc-bm-2`,
        panitia: p,
        alatPLC: 'Peer Coaching',
        tajukAktiviti: 'PLC Peer Coaching: Bimbingan Fonik & Sukukata Murid Pemulihan Khas',
        objektif: 'Membimbing guru mata pelajaran menggunakan kit kad imbasan interaktif bagi membantu murid lambat membaca.',
        fokusPedagogi: 'Literasi Asas & Intervensi Berfokus',
        cadanganMasa: '01:30 pm - 02:45 pm',
        cadanganTempat: 'Bilik Pemulihan Khas SK Tudan',
        cadanganBulan: [3, 4],
        tindakan: 'Guru Pemulihan & Pasangan Coach/Coachee BM',
        alatToolkit: ['Borang Pra-Konferens', 'Instrumen Pemantauan Sebutan', 'Borang Pasca-Konferens'],
        evidens: 'Borang Rekod Bimbingan, Senarai Semak Penguasaan Sukukata Murid'
      },
      {
        id: `plc-bm-3`,
        panitia: p,
        alatPLC: 'Data Analysis',
        tajukAktiviti: 'PLC Analisis Data: Pembedahan Tahap Penguasaan TP1 & TP2 PBD BM',
        objektif: 'Mengenal pasti punca kelemahan murid TP1 & TP2 dalam aspek tatabahasa dan kefahaman serta merangka modul intervensi.',
        fokusPedagogi: 'Pentaksiran Bilik Darjah (PBD) & Modul Intervensi',
        cadanganMasa: '01:30 pm - 03:30 pm',
        cadanganTempat: 'Pusat Sumber Sekolah',
        cadanganBulan: [5, 8],
        tindakan: 'Ketua Panitia & Semua Guru BM',
        alatToolkit: ['Templat Analisis Jurang PBD', 'Borang Agihan Murid Sasaran'],
        evidens: 'Jadual Data PBD, Pelan Tindakan Intervensi Fasa 1 & 2'
      },
      {
        id: `plc-bm-4`,
        panitia: p,
        alatPLC: 'Teacher Sharing Sessions',
        tajukAktiviti: 'PLC TSS: Perkongsian Penggunaan Aplikasi DELIMa & Peta Pemikiran I-Think dalam Karangan',
        objektif: 'Mendedahkan guru kepada templat peta i-Think digital dan Google Classroom bagi pengajaran karangan berformat.',
        fokusPedagogi: 'Digital Learning & PAK-21',
        cadanganMasa: '01:30 pm - 03:00 pm',
        cadanganTempat: 'Makmal Komputer / Bilik Akses',
        cadanganBulan: [4, 7],
        tindakan: 'Guru Penyelaras ICT Panitia BM',
        alatToolkit: ['Slaid Pembentangan TSS', 'Borang Perkongsian Amalan Baik'],
        evidens: 'Bahan Edaran Digital, Senarai Kehadiran SPLKPM, Contoh Hasil Murid'
      },
      {
        id: `plc-bm-5`,
        panitia: p,
        alatPLC: 'Learning Walk',
        tajukAktiviti: 'PLC Learning Walk: Pemantauan Sudut Bacaan & Sudut Ganjaran PAK-21 Kelas',
        objektif: 'Menilai keberkesanan sudut Nilam BM dan paparan bahan bantu belajar dalam memupuk minat membaca murid.',
        fokusPedagogi: 'Iklim Bilik Darjah & Pembudayaan Nilam',
        cadanganMasa: '10:00 am - 11:00 am',
        cadanganTempat: 'Bilik-Bilik Darjah Tahun 1 - 6',
        cadanganBulan: [6, 9],
        tindakan: 'Ketua Panitia BM & Guru Kanan',
        alatToolkit: ['Instrumen Jelajah Pembelajaran (Learning Walk)', 'Borang Rumusan Pola'],
        evidens: 'Instrumen Bertanda, Gambar Sudut Kelas Terbaik, Rumusan Dapatan'
      }
    ];
  }

  if (p === 'Bahasa Inggeris') {
    return [
      {
        id: `plc-bi-1`,
        panitia: p,
        alatPLC: 'Lesson Study',
        tajukAktiviti: 'PLC Lesson Study: CEFR-Aligned Speaking Tasks & Differentiated Role-Play',
        objektif: 'Co-plan and implement interactive speaking scenarios to boost communicative confidence among Year 4 & 5 students.',
        fokusPedagogi: 'CEFR English Curriculum, Oral Proficiency & Differentiation',
        cadanganMasa: '01:30 pm - 03:00 pm',
        cadanganTempat: 'English Language Room / Meeting Room 2',
        cadanganBulan: [2, 3],
        tindakan: 'Head of English Panel & Level 2 Teachers',
        alatToolkit: ['Collaborative Lesson Plan Form', 'Student Observation Checklist', 'Post-Lesson Reflection Sheet'],
        evidens: 'Co-Planned Lesson Plan, Observation Notes, Video Excerpts, Assessment Rubrics'
      },
      {
        id: `plc-bi-2`,
        panitia: p,
        alatPLC: 'Teacher Sharing Sessions',
        tajukAktiviti: 'PLC TSS: Gamified Vocabulary & Interactive Reading via Wordwall & Canva',
        objektif: 'Equip teachers with digital literacy tools to enhance student engagement during reading comprehension sessions.',
        fokusPedagogi: 'Digital Pedagogy, Gamification & Formative Assessment',
        cadanganMasa: '01:30 pm - 02:45 pm',
        cadanganTempat: 'Computer Lab / PSS',
        cadanganBulan: [4, 7],
        tindakan: 'English Panel ICT Coordinator',
        alatToolkit: ['Presentation Slides', 'Ready-to-Use Wordwall Template Links'],
        evidens: 'Attendance Log, Shared Digital Resources, Student Quiz Scores'
      },
      {
        id: `plc-bi-3`,
        panitia: p,
        alatPLC: 'Peer Coaching',
        tajukAktiviti: 'PLC Peer Coaching: Scaffolding Phonics & Guided Reading for Struggling Learners',
        objektif: 'Pair experienced English teachers with beginning teachers to refine blending and segmenting techniques.',
        fokusPedagogi: 'Early Literacy (Linus/Pemulihan) & Phonics',
        cadanganMasa: '01:30 pm - 03:00 pm',
        cadanganTempat: 'Year 1 & 2 Classrooms',
        cadanganBulan: [3, 5],
        tindakan: 'Panel Mentor & Mentee Teachers',
        alatToolkit: ['Pre-Conference Form', 'Phonics Observation Guide', 'Post-Conference Coaching Form'],
        evidens: 'Completed Coaching Forms, Action Points Log, Phonics Diagnostic Checklist'
      },
      {
        id: `plc-bi-4`,
        panitia: p,
        alatPLC: 'Data Analysis',
        tajukAktiviti: 'PLC Data Analysis: Mid-Term PBD Analysis for Reading & Writing Strands',
        objektif: 'Breakdown Year 1 to 6 PBD indicators to detect learning barriers in reading comprehension and sentence structure.',
        fokusPedagogi: 'PBD Performance Analysis & Targeted Intervention Strategy',
        cadanganMasa: '01:30 pm - 03:30 pm',
        cadanganTempat: 'Meeting Room 2',
        cadanganBulan: [6, 10],
        tindakan: 'Head of English Panel & All English Teachers',
        alatToolkit: ['PBD Gap Analysis Matrix', 'Remedial Grouping Sheet'],
        evidens: 'Panel Data Summary, Remedial Action Plan, Target Pupil Progress Sheet'
      },
      {
        id: `plc-bi-5`,
        panitia: p,
        alatPLC: 'Learning Walk',
        tajukAktiviti: 'PLC Learning Walk: Highly Immersive Programme (HIP) Environmental Print & English Corner',
        objektif: 'Observe classroom print environments to ensure active usage of bilingual signage, vocabulary walls, and HIP reading areas.',
        fokusPedagogi: 'HIP Culture & Immersive English Learning Environment',
        cadanganMasa: '10:00 am - 11:00 am',
        cadanganTempat: 'Primary Classrooms (Year 1 to 6)',
        cadanganBulan: [5, 8],
        tindakan: 'HIP Coordinator & English Panel Committee',
        alatToolkit: ['HIP Learning Walk Checklist', 'Pattern Summary Form'],
        evidens: 'Observation Rubrics, Classroom Corner Photographs, Recommendation Report'
      }
    ];
  }

  if (p === 'Matematik') {
    return [
      {
        id: `plc-mat-1`,
        panitia: p,
        alatPLC: 'Lesson Study',
        tajukAktiviti: 'PLC Lesson Study: Kaedah Bar Model dalam Menyelesaikan Masalah Berayat Operasi Bergabung',
        objektif: 'Merangka RPH bersepadu menggunakan pendekatan visual Bar Model bagi membantu murid Tahun 4-6 menyelesaikan soalan KBAT.',
        fokusPedagogi: 'Penyelesaian Masalah KBAT & Visualisasi Konsep',
        cadanganMasa: '01:30 pm - 03:00 pm',
        cadanganTempat: 'Bilik Matematik / Bilik Gerakan',
        cadanganBulan: [2, 4],
        tindakan: 'Ketua Panitia Matematik & Guru Tahap 2',
        alatToolkit: ['Toolkit RPH Kolaboratif Bar Model', 'Borang Catatan Bukti Kefahaman Murid'],
        evidens: 'RPH Terperinci, Foto Pengajaran, Skor Pra/Pasca Ujian Murid'
      },
      {
        id: `plc-mat-2`,
        panitia: p,
        alatPLC: 'Peer Coaching',
        tajukAktiviti: 'PLC Peer Coaching: Penggunaan Bahan Maujud & Garis Nombor bagi Asas Fakta Asas Tambah/Tolak',
        objektif: 'Membimbing guru novis mengendalikan sesi pemulihan numerasi menggunakan blok Dienes dan garis nombor visual.',
        fokusPedagogi: 'Penguasaan Numerasi Asas & Konkrit-Bergambar-Abstrak (CPA)',
        cadanganMasa: '01:30 pm - 02:45 pm',
        cadanganTempat: 'Kelas Tahun 1 & 2',
        cadanganBulan: [3, 5],
        tindakan: 'Guru Cemerlang/Kanan & Guru Rakan Bimbingan',
        alatToolkit: ['Borang Pra-Pemerhatian', 'Instrumen Kaedah CPA', 'Borang Maklum Balas Refleksi'],
        evidens: 'Log Bimbingan Berpasangan, Catatan Perubahan Tingkah Laku Murid'
      },
      {
        id: `plc-mat-3`,
        panitia: p,
        alatPLC: 'Data Analysis',
        tajukAktiviti: 'PLC Data Analysis: Analisis Prestasi Ujian Diagnostik Sifir & Fakta Asas Darab/Bahagi',
        objektif: 'Menganalisis keputusan saringan hafalan sifir dan mereka bentuk program intervensi 5 Minit Sifir Harian.',
        fokusPedagogi: 'Kefasihan Pengiraan Asas & PBD Berterusan',
        cadanganMasa: '01:30 pm - 03:00 pm',
        cadanganTempat: 'Bilik Mesyuarat 2',
        cadanganBulan: [4, 8],
        tindakan: 'Semua Guru Matematik SK Tudan',
        alatToolkit: ['Templat Analisis Sifir', 'Borang Kumpulan Sasaran Intervensi'],
        evidens: 'Graf Penguasaan Sifir Murid, Modul Intervensi 5 Minit Sifir'
      },
      {
        id: `plc-mat-4`,
        panitia: p,
        alatPLC: 'Teacher Sharing Sessions',
        tajukAktiviti: 'PLC TSS: Eksplorasi Permainan Matematik Interaktif & Kuiz Plickers/Kahoot',
        objektif: 'Berkongsi teknik pentaksiran formatif pantas tanpa kertas bagi menilai kefahaman konsep secara serentak.',
        fokusPedagogi: 'Pentaksiran Tanpa Kertas & Pembelajaran Menyeronokkan',
        cadanganMasa: '01:30 pm - 02:45 pm',
        cadanganTempat: 'Pusat Sumber Sekolah',
        cadanganBulan: [6, 9],
        tindakan: 'Penyelaras Inovasi Matematik',
        alatToolkit: ['Set Kad Plickers Panitia', 'Buku Panduan Ringkas TSS'],
        evidens: 'Laporan Perkongsian, Gambar Sesi Pengajaran Menggunakan Plickers'
      }
    ];
  }

  if (p === 'Sains') {
    return [
      {
        id: `plc-sn-1`,
        panitia: p,
        alatPLC: 'Lesson Study',
        tajukAktiviti: 'PLC Lesson Study: Amali Hands-On Kemahiran Proses Sains (KPS) & Model 5E Inquiry',
        objektif: 'Merekabentuk modul amali berasaskan inkuiri 5E (Engage, Explore, Explain, Elaborate, Evaluate) bagi topik Tenaga & Litar Elektrik.',
        fokusPedagogi: 'Pembelajaran Berasaskan Inkuiri & Kemahiran Proses Sains',
        cadanganMasa: '01:30 pm - 03:00 pm',
        cadanganTempat: 'Makmal Sains SK Tudan',
        cadanganBulan: [3, 4],
        tindakan: 'Ketua Panitia Sains & Guru Sains Tahap 2',
        alatToolkit: ['Borang RPH Model 5E', 'Senarai Semak Kemahiran Manipulatif'],
        evidens: 'RPH Inkuiri, Gambar Murid Menjalankan Ujikaji, Laporan Amali Sains Murid'
      },
      {
        id: `plc-sn-2`,
        panitia: p,
        alatPLC: 'Peer Coaching',
        tajukAktiviti: 'PLC Peer Coaching: Teknik Bimbingan Menulis Hipotesis & Pemboleh Ubah Sains',
        objektif: 'Melatih guru menggunakan teknik mnemonik dan kata kunci tetap dalam membimbing murid merangka pemboleh ubah.',
        fokusPedagogi: 'Penulisan Laporan Saintifik & KBAT Sains',
        cadanganMasa: '01:30 pm - 02:45 pm',
        cadanganTempat: 'Makmal Sains',
        cadanganBulan: [4, 6],
        tindakan: 'Guru Kanan Sains & Guru Coachee',
        alatToolkit: ['Borang Bimbingan Rakan Sekerja', 'Rubrik Penskoran Pemboleh Ubah'],
        evidens: 'Borang Bimbingan, Hasil Kerja Murid Sebelum & Selepas Intervensi'
      },
      {
        id: `plc-sn-3`,
        panitia: p,
        alatPLC: 'Learning Walk',
        tajukAktiviti: 'PLC Learning Walk: Audit Keselamatan & Pengurusan Bahan Bantu Belajar di Makmal Sains',
        objektif: 'Memeriksa amalan SOP keselamatan, pelabelan radas, dan sudut STEM kelas bagi memastikan keselamatan optimum.',
        fokusPedagogi: 'Keselamatan Makmal & Iklim Pembelajaran Kondusif',
        cadanganMasa: '10:00 am - 11:00 am',
        cadanganTempat: 'Makmal Sains 1, 2 dan Sudut Sains Kelas',
        cadanganBulan: [2, 7],
        tindakan: 'Penyelaras Makmal & Ahli Panitia Sains',
        alatToolkit: ['Instrumen Audit Keselamatan Makmal KPM', 'Borang Tindakan Susulan'],
        evidens: 'Senarai Semak Keselamatan, Gambar Penambahbaikan Radas'
      },
      {
        id: `plc-sn-4`,
        panitia: p,
        alatPLC: 'Data Analysis',
        tajukAktiviti: 'PLC Data Analysis: Analisis Tahap Penguasaan TP1-TP6 PBD Sains & Ujian Akhir Sesi',
        objektif: 'Memetakan data pencapaian kemahiran proses sains dan merangka bengkel teknik menjawab soalan struktur.',
        fokusPedagogi: 'Analisis Jurang Kemahiran Berfikir Kritis',
        cadanganMasa: '01:30 pm - 03:00 pm',
        cadanganTempat: 'Bilik Mesyuarat 2',
        cadanganBulan: [5, 10],
        tindakan: 'Semua Guru Sains',
        alatToolkit: ['Templat Matriks Analisis PBD Sains', 'Pelan Intervensi Murid Galus'],
        evidens: 'Laporan Data PBD, Senarai Nama Murid Program Gilap Sains'
      }
    ];
  }

  // Generic robust suite for all other subjects (P. Islam, Moral, Sejarah, RBT, PJPK, PSV, Muzik, Bahasa Arab, Iban, Cina)
  return [
    {
      id: `plc-${p.toLowerCase().replace(/\s+/g, '-')}-1`,
      panitia: p,
      alatPLC: 'Lesson Study',
      tajukAktiviti: `PLC Lesson Study: Pelaksanaan Pedagogi Bermakna & PAK-21 Panitia ${p}`,
      objektif: `Merancang RPH kolaboratif, melaksanakan pengajaran bersama, dan menganalisis penglibatan aktif murid dalam mata pelajaran ${p}.`,
      fokusPedagogi: 'Pembelajaran Aktif, Pembezaan & Kriteria Kejayaan (Success Criteria)',
      cadanganMasa: '01:30 pm - 03:00 pm',
      cadanganTempat: 'Bilik Panitia / Kelas Terpilih',
      cadanganBulan: [2, 3],
      tindakan: `Ketua Panitia ${p} & Guru Mata Pelajaran`,
      alatToolkit: ['Borang RPH Kolaboratif', 'Borang Pemerhatian Pengajaran', 'Borang Refleksi Lesson Study'],
      evidens: `RPH Terkini, Catatan Pemerhati, Foto Pelaksanaan, Lembaran Murid ${p}`
    },
    {
      id: `plc-${p.toLowerCase().replace(/\s+/g, '-')}-2`,
      panitia: p,
      alatPLC: 'Peer Coaching',
      tajukAktiviti: `PLC Peer Coaching: Bimbingan Kaedah Pentaksiran Berterusan (PBD) ${p}`,
      objektif: `Memantapkan pertimbangan profesional guru dalam menetapkan Tahap Penguasaan (TP1-TP6) berpandukan rubrik DSKP ${p}.`,
      fokusPedagogi: 'Moderasi PBD, Rubrik Pentaksiran & Penyoalan Berkesan',
      cadanganMasa: '01:30 pm - 02:45 pm',
      cadanganTempat: 'Bilik Mesyuarat 2',
      cadanganBulan: [4, 5],
      tindakan: `Ketua Panitia & Pasangan Bimbingan ${p}`,
      alatToolkit: ['Borang Pra-Konferens', 'Instrumen Semakan Evidens PBD', 'Borang Pasca-Konferens'],
      evidens: `Borang Maklum Balas Bimbingan, Rekod Perkembangan Murid`
    },
    {
      id: `plc-${p.toLowerCase().replace(/\s+/g, '-')}-3`,
      panitia: p,
      alatPLC: 'Data Analysis',
      tajukAktiviti: `PLC Data Analysis: Analisis Jurang Pencapaian & Intervensi ${p}`,
      objektif: `Menilai data pentaksiran pertengahan dan akhir tahun bagi menentukan standard pembelajaran yang memerlukan pengukuhan.`,
      fokusPedagogi: 'Penyelaras Skor, Intervensi Murid Lemah & Pengayaan',
      cadanganMasa: '01:30 pm - 03:00 pm',
      cadanganTempat: 'Pusat Sumber Sekolah',
      cadanganBulan: [6, 10],
      tindakan: `Semua Guru Mata Pelajaran ${p}`,
      alatToolkit: ['Borang Analisis Jurang (Gap Analysis)', 'Templat Pelan Tindakan Panitia'],
      evidens: `Jadual Taburan TP PBD, Senarai Tindakan Intervensi ${p}`
    },
    {
      id: `plc-${p.toLowerCase().replace(/\s+/g, '-')}-4`,
      panitia: p,
      alatPLC: 'Teacher Sharing Sessions',
      tajukAktiviti: `PLC TSS: Perkongsian Bahan Bantu Mengajar (BBM) & Inovasi Digital ${p}`,
      objektif: `Berkongsi kaedah kreatif penyampaian kandungan ${p} menggunakan platform digital, modul amali atau bahan kitar semula.`,
      fokusPedagogi: 'Inovasi Pedagogi & Bahan Bantu Belajar Interaktif',
      cadanganMasa: '01:30 pm - 02:45 pm',
      cadanganTempat: 'Bilik Akses / Makmal Komputer',
      cadanganBulan: [7, 8],
      tindakan: `Penyelaras Bahan Panitia ${p}`,
      alatToolkit: ['Templat Catatan TSS', 'Pautan Sumber Digital'],
      evidens: `Laporan Ringkas Sesi Perkongsian, Foto Bahan Inovasi`
    },
    {
      id: `plc-${p.toLowerCase().replace(/\s+/g, '-')}-5`,
      panitia: p,
      alatPLC: 'Curriculum Mapping',
      tajukAktiviti: `PLC Curriculum Mapping: Penguraian DSKP & Penyelarasan RPT 2027 ${p}`,
      objektif: `Menyelaras standard kandungan, peruntukan jam kredit tahunan dan penetapan sasaran minimum PBD ${p}.`,
      fokusPedagogi: 'Pemetaan DSKP & Kalendar Persekolahan 2027',
      cadanganMasa: '01:30 pm - 03:00 pm',
      cadanganTempat: 'Bilik Gerakan',
      cadanganBulan: [1, 11],
      tindakan: `Ketua Panitia & Setiausaha ${p}`,
      alatToolkit: ['Templat Pemetaan RPT-DSKP', 'Borang Kalendar Akademik Panitia'],
      evidens: `RPT Lengkap 2027, Dokumen Penjajaran DSKP Panitia ${p}`
    }
  ];
}

/**
 * Download sample official KPM PLC Toolkit (Excel spreadsheet)
 */
export function downloadPLCToolkitExcel(panitiaName = 'Bahasa Melayu', schoolName = 'SK Tudan, Miri') {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Sarana Pengenalan PLC
  const introData = [
    { 'PERKARA': 'SEKOLAH', 'KETERANGAN': schoolName },
    { 'PERKARA': 'PANITIA', 'KETERANGAN': panitiaName },
    { 'PERKARA': 'TAHUN TAKWIM', 'KETERANGAN': '2027' },
    { 'PERKARA': 'FOKUS PLC', 'KETERANGAN': 'Peningkatan Kualiti PdPc Guru & Pencapaian Murid Berasaskan DSKP' },
    { 'PERKARA': 'RUJUKAN KPM', 'KETERANGAN': 'Buku Panduan Komuniti Pembelajaran Profesional (PLC) Edisi KPM' },
  ];
  const wsIntro = XLSX.utils.json_to_sheet(introData);
  XLSX.utils.book_append_sheet(wb, wsIntro, 'Maklumat_Panitia');

  // Sheet 2: Borang Lesson Study
  const lessonStudyData = [
    {
      'FASA': 'Fasa 1: Perancangan',
      'LANGKAH': 'Bina RPH Kolaboratif',
      'TINDAKAN': 'Guru Model dan ahli panitia menentukan objektif eksplisit dan kriteria kejayaan',
      'TARIKH_CADANGAN': '2027-02-16',
      'STATUS': 'Belum Selesai',
      'CATATAN': 'Fokus kepada teknik pembezaan'
    },
    {
      'FASA': 'Fasa 2: Pengajaran',
      'LANGKAH': 'Pelaksanaan & Pemerhatian',
      'TINDAKAN': 'Guru Model mengajar; pemerhati mencatat tingkah laku dan respon pemahaman murid',
      'TARIKH_CADANGAN': '2027-02-23',
      'STATUS': 'Belum Selesai',
      'CATATAN': 'Pemerhati tidak dibenarkan mengganggu murid'
    },
    {
      'FASA': 'Fasa 3: Refleksi',
      'LANGKAH': 'Sesi Pasca-Pengajaran',
      'TINDAKAN': 'Membincangkan bukti pembelajaran murid dan kelemahan RPH',
      'TARIKH_CADANGAN': '2027-02-23',
      'STATUS': 'Belum Selesai',
      'CATATAN': 'Fokus kepada pembelajaran murid, bukan peribadi guru'
    },
    {
      'FASA': 'Fasa 4: Pengubahsuaian',
      'LANGKAH': 'Pemurnian RPH & Dokumentasi',
      'TINDAKAN': 'Mengemaskini RPH dan memfailkan dalam fail panitia sebagai evidens SK@S',
      'TARIKH_CADANGAN': '2027-03-02',
      'STATUS': 'Belum Selesai',
      'CATATAN': 'Disimpan dalam Fail Panitia & SPLKPM'
    }
  ];
  const wsLS = XLSX.utils.json_to_sheet(lessonStudyData);
  XLSX.utils.book_append_sheet(wb, wsLS, 'Borang_Lesson_Study');

  // Sheet 3: Senarai 9 Alat PLC KPM
  const toolsData = KPM_PLC_TOOL_DEFINITIONS.map((t, idx) => ({
    'BIL': idx + 1,
    'ALAT_PLC': t.nama,
    'KOD': t.type,
    'DESKRIPSI': t.deskripsi,
    'KUMPULAN_SASARAN': t.kumpulanSasaran,
    'FAEDAH_UTAMA': t.faedahUtama
  }));
  const wsTools = XLSX.utils.json_to_sheet(toolsData);
  XLSX.utils.book_append_sheet(wb, wsTools, 'Katalog_9_Alat_PLC');

  XLSX.writeFile(wb, `Kit_PLC_Sarana_KPM_${panitiaName.replace(/\s+/g, '_')}_2027.xlsx`);
}
