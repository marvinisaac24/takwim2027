import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { TakwimEntry, HolidayRecord, PanitiaConfig, RevisionRecord, SchoolSettings, BidangType } from './src/types/takwim';
import { getAllDefaultHolidays, getAcademicWeekForDate, getDayStatus } from './src/constants/calendar2027';
import { INITIAL_PANITIA_CONFIGS, BANK_PROGRAM_SUGGESTIONS } from './src/constants/bankProgram';
import { getFullTakwimSeed, generateTuesdayAssemblies, generateFullPdfTakwimEntries } from './src/constants/seedTakwimData';
import { DEFAULT_SCHOOL_SETTINGS } from './src/constants/schoolSettingsDefaults';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enforce real-time freshness & prevent stale device caching across all /api routes
app.use('/api', (req: Request, res: Response, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Path for persistent database
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'takwim-db.json');

interface DatabaseSchema {
  entries: TakwimEntry[];
  deletedEntries: TakwimEntry[];
  holidays: HolidayRecord[];
  panitia: PanitiaConfig[];
  drafts: Record<string, Partial<TakwimEntry>>;
  settings: SchoolSettings;
  lastUpdated: string;
}

// Generate comprehensive seed entries for SK Tudan 2027 including all Tuesday assemblies and PDF takwim
function getSeedEntries(): TakwimEntry[] {
  return getFullTakwimSeed(getAllDefaultHolidays());
}

function _legacySeedEntries(): TakwimEntry[] {
  const now = new Date().toISOString();
  const seedList: TakwimEntry[] = [];

  // 1. Mesyuarat Guru Bil. 1/2027
  seedList.push({
    id: 't-2027-01-01',
    tahun: 2027,
    bulan: 1,
    bidangUtama: 'Pengurusan dan Staf',
    unitUtama: 'Pentadbiran Sekolah',
    unitBersama: ['Semua Unit'],
    jenisPengisian: 'Mesyuarat',
    tajuk: 'Mesyuarat Guru dan Staf Pengurusan Bil. 1/2027',
    adalahTajukSendiri: false,
    tajukPilihanBank: 'Mesyuarat Guru dan Staf Bil. 1/2027',
    bilanganMesyuarat: 'Bil. 1/2027',
    objektif: 'Menyampaikan amanat Guru Besar, taklimat pembukaan sesi 2027 dan pengagihan tugas tahunan.',
    tarikhMula: '2027-01-04',
    tarikhAkhir: '2027-01-04',
    masaMula: '08:00',
    masaAkhir: '12:30',
    sepanjangHari: false,
    mingguAkademik: 'M01',
    statusHari: 'Hari Persekolahan',
    tempat: 'Bilik Gerakan SK Tudan',
    sasaran: ['Semua Guru & Staf', 'AKP (Anggota Kumpulan Pelaksana)'],
    penyelaras: 'Pn. Hajah Fatimah Binti Ismail',
    ajk: 'PK Pentadbiran, PK HEM, PK Kokurikulum',
    anggaranPeserta: 55,
    anggaranKos: 450,
    sumberKewangan: 'LPK Sekolah',
    catatan: 'Kehadiran wajib semua guru dan AKP.',
    statusKelulusan: 'Diluluskan',
    diluluskanOleh: 'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
    tarikhKelulusan: '2026-12-28',
    statusPelaksanaan: 'Selesai',
    tarikhSebenarPelaksanaan: '2027-01-04',
    ringkasanHasil: 'Semua jawatankuasa menerima fail pengurusan dan buku panduan tugas rasmi 2027.',
    createdBy: 'u-gb',
    createdByName: 'Pn. Hajah Fatimah Binti Ismail',
    createdAt: now,
    updatedBy: 'u-gb',
    updatedByName: 'Pn. Hajah Fatimah Binti Ismail',
    updatedAt: now,
    revisionHistory: [
      {
        id: 'rev-1',
        timestamp: now,
        action: 'Penciptaan Asal',
        userId: 'u-gb',
        userName: 'Pn. Hajah Fatimah Binti Ismail',
        details: 'Draf asal diluluskan sebagai takwim rasmi pembukaan.',
      },
    ],
  });

  // 2. Program Transisi Tahun 1
  seedList.push({
    id: 't-2027-01-02',
    tahun: 2027,
    bulan: 1,
    bidangUtama: 'Hal Ehwal Murid',
    unitUtama: 'Bimbingan & Kaunseling',
    unitBersama: ['Prasekolah', 'Bahasa Melayu', 'Matematik'],
    jenisPengisian: 'Program',
    tajuk: 'Program Transisi dan Orientasi Murid Tahun 1 Sesi 2027',
    adalahTajukSendiri: false,
    tajukPilihanBank: 'Program Transisi dan Orientasi Murid Tahun 1',
    objektif: 'Membina keyakinan dan keselesaan murid baharu menyesuaikan diri dengan persekitaran sekolah rendah.',
    tarikhMula: '2027-01-05',
    tarikhAkhir: '2027-01-22',
    masaMula: '07:30',
    masaAkhir: '12:00',
    sepanjangHari: false,
    mingguAkademik: 'M01',
    statusHari: 'Hari Persekolahan',
    tempat: 'Dewan Sri Tudan & Kelas Tahun 1',
    sasaran: ['Murid Tahun 1', 'Ibu Bapa / PIBG'],
    penyelaras: 'Pn. Dayang Norliza Binti Awang',
    ajk: 'Guru Kelas Tahun 1, Guru Bimbingan Kaunseling',
    anggaranPeserta: 180,
    anggaranKos: 800,
    sumberKewangan: 'Peruntukan Bimbingan & Kaunseling',
    catatan: 'Kerjasama erat bersama ibu bapa murid Tahun 1.',
    statusKelulusan: 'Diluluskan',
    diluluskanOleh: 'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
    tarikhKelulusan: '2026-12-29',
    statusPelaksanaan: 'Selesai',
    tarikhSebenarPelaksanaan: '2027-01-22',
    ringkasanHasil: '100% murid Tahun 1 telah selesai menjalani modul transisi fasa penyesuaian dan fasa kesediaan.',
    createdBy: 'u-pkhem',
    createdByName: 'Pn. Dayang Norliza Binti Awang',
    createdAt: now,
    updatedBy: 'u-pkhem',
    updatedByName: 'Pn. Dayang Norliza Binti Awang',
    updatedAt: now,
    revisionHistory: [],
  });

  // 3. Mesyuarat Kurikulum Bil. 1
  seedList.push({
    id: 't-2027-01-03',
    tahun: 2027,
    bulan: 1,
    bidangUtama: 'Kurikulum',
    unitUtama: 'Pengurusan Kurikulum',
    unitBersama: ['Semua Panitia'],
    jenisPengisian: 'Mesyuarat',
    tajuk: 'Mesyuarat Jawatankuasa Kurikulum Bil. 1/2027',
    adalahTajukSendiri: false,
    tajukPilihanBank: 'Mesyuarat Jawatankuasa Kurikulum Bil. 1/2027',
    bilanganMesyuarat: 'Bil. 1/2027',
    objektif: 'Menetapkan garis panduan penyelarasan DSKP, ketetapan PBD, semakan RPT dan sasaran akademik sekolah.',
    tarikhMula: '2027-01-08',
    tarikhAkhir: '2027-01-08',
    masaMula: '14:00',
    masaAkhir: '16:30',
    sepanjangHari: false,
    mingguAkademik: 'M01',
    statusHari: 'Hari Persekolahan',
    tempat: 'Bilik Gerakan SK Tudan',
    sasaran: ['Semua Guru & Staf', 'Ketua Panitia'],
    penyelaras: 'En. Awangku Azman Bin Pg. Mahmud',
    ajk: 'Setiausaha Kurikulum & Semua Ketua Panitia',
    anggaranPeserta: 52,
    anggaranKos: 200,
    sumberKewangan: 'Bantuan Geran Perkapita (PCG)',
    statusKelulusan: 'Diluluskan',
    diluluskanOleh: 'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
    tarikhKelulusan: '2026-12-30',
    statusPelaksanaan: 'Selesai',
    createdBy: 'u-pk1',
    createdByName: 'En. Awangku Azman Bin Pg. Mahmud',
    createdAt: now,
    updatedBy: 'u-pk1',
    updatedByName: 'En. Awangku Azman Bin Pg. Mahmud',
    updatedAt: now,
    revisionHistory: [],
  });

  // 4. Watikah Pelantikan Pemimpin Murid (Februari)
  seedList.push({
    id: 't-2027-02-01',
    tahun: 2027,
    bulan: 2,
    bidangUtama: 'Hal Ehwal Murid',
    unitUtama: 'Disiplin & Pengawas',
    unitBersama: ['Pusat Sumber Sekolah (PSS)', 'Bimbingan & Kaunseling'],
    jenisPengisian: 'Program',
    tajuk: 'Majlis Watikah Pelantikan Pemimpin Cilik SK Tudan 2027',
    adalahTajukSendiri: false,
    tajukPilihanBank: 'Majlis Watikah Pelantikan Pemimpin Cilik SK Tudan',
    objektif: 'Menganugerahkan watikah pelantikan kepada pengawas sekolah, pengawas PSS, PRS, dan ketua kelas.',
    tarikhMula: '2027-02-15',
    tarikhAkhir: '2027-02-15',
    masaMula: '07:30',
    masaAkhir: '09:00',
    sepanjangHari: false,
    mingguAkademik: 'M07',
    statusHari: 'Hari Persekolahan',
    tempat: 'Dataran Perhimpunan',
    sasaran: ['Pemimpin Murid / Pengawas', 'Semua Murid', 'Ibu Bapa / PIBG'],
    penyelaras: 'Pn. Dayang Norliza Binti Awang',
    ajk: 'AJK Lembaga Pengawas Sekolah & Guru Disiplin',
    anggaranPeserta: 120,
    anggaranKos: 350,
    statusKelulusan: 'Diluluskan',
    diluluskanOleh: 'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
    tarikhKelulusan: '2027-01-15',
    statusPelaksanaan: 'Selesai',
    createdBy: 'u-pkhem',
    createdByName: 'Pn. Dayang Norliza Binti Awang',
    createdAt: now,
    updatedBy: 'u-pkhem',
    updatedByName: 'Pn. Dayang Norliza Binti Awang',
    updatedAt: now,
    revisionHistory: [],
  });

  // 5. Bengkel Pembinaan BBM & PLC Bahasa Melayu
  seedList.push({
    id: 't-2027-02-02',
    tahun: 2027,
    bulan: 2,
    bidangUtama: 'Panitia Mata Pelajaran',
    unitUtama: 'Bahasa Melayu',
    unitBersama: ['Pemulihan Khas'],
    jenisPengisian: 'Aktiviti',
    tajuk: 'PLC Panitia Bahasa Melayu: Teknik Bimbingan Membaca Pantas',
    adalahTajukSendiri: true,
    objektif: 'Membina kit intervensi fonik dan silibus membaca bagi murid belum menguasai konstruk asas.',
    tarikhMula: '2027-02-23',
    tarikhAkhir: '2027-02-23',
    masaMula: '13:30',
    masaAkhir: '15:30',
    sepanjangHari: false,
    mingguAkademik: 'M08',
    statusHari: 'Hari Persekolahan',
    tempat: 'Pusat Sumber / Perpustakaan',
    sasaran: ['Semua Guru & Staf'],
    penyelaras: 'Pn. Rosmini Salleh',
    ajk: 'Semua Guru Bahasa Melayu & Guru Pemulihan Khas',
    anggaranPeserta: 14,
    anggaranKos: 100,
    statusKelulusan: 'Diluluskan',
    diluluskanOleh: 'En. Awangku Azman Bin Pg. Mahmud (PK1)',
    tarikhKelulusan: '2027-02-10',
    statusPelaksanaan: 'Selesai',
    createdBy: 'u-kp-bm',
    createdByName: 'Pn. Rosmini Salleh',
    createdAt: now,
    updatedBy: 'u-kp-bm',
    updatedByName: 'Pn. Rosmini Salleh',
    updatedAt: now,
    revisionHistory: [],
  });

  // 6. Latihan Kebakaran Fire Drill (Mac)
  seedList.push({
    id: 't-2027-03-01',
    tahun: 2027,
    bulan: 3,
    bidangUtama: 'Hal Ehwal Murid',
    unitUtama: 'Keselamatan & 3K',
    unitBersama: ['Semua Unit'],
    jenisPengisian: 'Aktiviti',
    tajuk: 'Latihan Pengungsian Bangunan (Fire Drill) Siri 1 Bersama Bomba Lutong',
    adalahTajukSendiri: false,
    tajukPilihanBank: 'Latihan Pengungsian Bangunan (Fire Drill) Bersama Bomba',
    objektif: 'Memastikan warga sekolah mampu mengosongkan bangunan dalam tempoh bawah 3 minit secara teratur.',
    tarikhMula: '2027-03-03',
    tarikhAkhir: '2027-03-03',
    masaMula: '09:00',
    masaAkhir: '10:30',
    sepanjangHari: false,
    mingguAkademik: 'M09',
    statusHari: 'Hari Persekolahan',
    tempat: 'Padang Sekolah',
    sasaran: ['Semua Murid', 'Semua Guru & Staf', 'AKP (Anggota Kumpulan Pelaksana)'],
    penyelaras: 'Pn. Dayang Norliza Binti Awang',
    ajk: 'AJK 3K dan Balai Bomba dan Penyelamat Lutong Miri',
    anggaranPeserta: 680,
    anggaranKos: 250,
    statusKelulusan: 'Diluluskan',
    diluluskanOleh: 'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
    tarikhKelulusan: '2027-02-20',
    statusPelaksanaan: 'Selesai',
    createdBy: 'u-pkhem',
    createdByName: 'Pn. Dayang Norliza Binti Awang',
    createdAt: now,
    updatedBy: 'u-pkhem',
    updatedByName: 'Pn. Dayang Norliza Binti Awang',
    updatedAt: now,
    revisionHistory: [],
  });

  // 7. Penyelarasan RPT & Moderasi PBD (Mac) - M10
  seedList.push({
    id: 't-2027-03-02',
    tahun: 2027,
    bulan: 3,
    bidangUtama: 'Kurikulum',
    unitUtama: 'Pengurusan Kurikulum',
    unitBersama: ['Semua Panitia'],
    jenisPengisian: 'Aktiviti',
    tajuk: 'Penyelarasan dan Moderasi PBD Penggal Pertama',
    adalahTajukSendiri: false,
    tajukPilihanBank: 'Penyelarasan dan Moderasi PBD Bil. 1/2027',
    objektif: 'Menyelaraskan instrumen pertimbangan profesional guru bagi pentaksiran bilik darjah awal sesi.',
    tarikhMula: '2027-03-15',
    tarikhAkhir: '2027-03-15',
    masaMula: '14:00',
    masaAkhir: '16:00',
    sepanjangHari: false,
    mingguAkademik: 'M10',
    statusHari: 'Hari Persekolahan',
    tempat: 'Bilik Gerakan SK Tudan',
    sasaran: ['Semua Guru & Staf'],
    penyelaras: 'En. Awangku Azman Bin Pg. Mahmud',
    ajk: 'Penyelaras PBD Sekolah',
    anggaranPeserta: 52,
    statusKelulusan: 'Diluluskan',
    diluluskanOleh: 'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
    tarikhKelulusan: '2027-03-01',
    statusPelaksanaan: 'Selesai',
    createdBy: 'u-pk1',
    createdByName: 'En. Awangku Azman Bin Pg. Mahmud',
    createdAt: now,
    updatedBy: 'u-pk1',
    updatedByName: 'En. Awangku Azman Bin Pg. Mahmud',
    updatedAt: now,
    revisionHistory: [],
  });

  // 8. Program Menunggu Semakan (April - Dihantar)
  seedList.push({
    id: 't-2027-04-01',
    tahun: 2027,
    bulan: 4,
    bidangUtama: 'Panitia Mata Pelajaran',
    unitUtama: 'Sains',
    unitBersama: ['Matematik', 'Reka Bentuk dan Teknologi'],
    jenisPengisian: 'Program',
    tajuk: 'Karnival Minggu STEM & Pameran Sains Cilik SK Tudan',
    adalahTajukSendiri: false,
    tajukPilihanBank: 'Minggu STEM & Pameran Eksperimen Sains Cilik',
    objektif: 'Membudayakan inkuiri sains, reka cipta STEM dan pemikiran kritis murid secara praktikal.',
    tarikhMula: '2027-04-14',
    tarikhAkhir: '2027-04-16',
    masaMula: '08:00',
    masaAkhir: '12:30',
    sepanjangHari: false,
    mingguAkademik: 'M14',
    statusHari: 'Hari Persekolahan',
    tempat: 'Dewan Sri Tudan',
    sasaran: ['Semua Murid', 'Ibu Bapa / PIBG'],
    penyelaras: 'En. Wong Siong Hock',
    ajk: 'Semua Guru Sains, Matematik dan RBT',
    anggaranPeserta: 650,
    anggaranKos: 1200,
    sumberKewangan: 'PCG Sains & Sumbangan PIBG',
    catatan: 'Termasuk pertandingan roket air dan pameran interaktif.',
    statusKelulusan: 'Dihantar',
    statusPelaksanaan: 'Belum Bermula',
    createdBy: 'u-guru1',
    createdByName: 'Cik Siti Nurhaliza Binti Ramli',
    createdAt: now,
    updatedBy: 'u-guru1',
    updatedByName: 'Cik Siti Nurhaliza Binti Ramli',
    updatedAt: now,
    revisionHistory: [],
  });

  // 9. Kejohanan Sukan Olahraga (Ogos) - M31
  seedList.push({
    id: 't-2027-08-01',
    tahun: 2027,
    bulan: 8,
    bidangUtama: 'Kokurikulum',
    unitUtama: 'Unit Sukan & Permainan',
    unitBersama: ['Semua Unit'],
    jenisPengisian: 'Program',
    tajuk: 'Kejohanan Sukan Olahraga Tahunan SK Tudan Ke-24',
    adalahTajukSendiri: false,
    tajukPilihanBank: 'Kejohanan Sukan Olahraga Tahunan SK Tudan Kali Ke-24',
    objektif: 'Mencungkil bakat sukan dan memupuk perpaduan serta disiplin tinggi melalui olahraga padang dan balapan.',
    tarikhMula: '2027-08-25',
    tarikhAkhir: '2027-08-27',
    masaMula: '07:30',
    masaAkhir: '12:30',
    sepanjangHari: false,
    mingguAkademik: 'M31',
    statusHari: 'Hari Persekolahan',
    tempat: 'Padang Sekolah',
    sasaran: ['Semua Murid', 'Semua Guru & Staf', 'Ibu Bapa / PIBG'],
    penyelaras: 'En. Mohd Ridzuan Bin Abdullah',
    ajk: 'Semua Ketua Rumah Sukan & Pegawai Teknikal Sukan',
    anggaranPeserta: 750,
    anggaranKos: 3500,
    sumberKewangan: 'Bantuan Sukan Sekolah (BSS) & PIBG',
    statusKelulusan: 'Diluluskan',
    diluluskanOleh: 'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
    tarikhKelulusan: '2027-01-20',
    statusPelaksanaan: 'Belum Bermula',
    createdBy: 'u-pkkoko',
    createdByName: 'En. Mohd Ridzuan Bin Abdullah',
    createdAt: now,
    updatedBy: 'u-pkkoko',
    updatedByName: 'En. Mohd Ridzuan Bin Abdullah',
    updatedAt: now,
    revisionHistory: [],
  });

  // 10. Sambutan Bulan Kemerdekaan (Ogos - M30)
  seedList.push({
    id: 't-2027-08-02',
    tahun: 2027,
    bulan: 8,
    bidangUtama: 'Kokurikulum',
    unitUtama: 'Sejarah',
    unitBersama: ['Bahasa Melayu', 'Pendidikan Muzik', 'Pendidikan Seni Visual'],
    jenisPengisian: 'Program',
    tajuk: 'Pelancaran Sambutan Bulan Kemerdekaan & Hari Kebangsaan 2027',
    adalahTajukSendiri: true,
    objektif: 'Menyemarakkan semangat patriotisme dan perpaduan kaum dalam kalangan murid dan warga sekolah.',
    tarikhMula: '2027-08-16',
    tarikhAkhir: '2027-08-16',
    masaMula: '07:30',
    masaAkhir: '09:00',
    sepanjangHari: false,
    mingguAkademik: 'M30',
    statusHari: 'Hari Persekolahan',
    tempat: 'Dataran Perhimpunan',
    sasaran: ['Semua Murid', 'Semua Guru & Staf'],
    penyelaras: 'Pn. Zubaidah Hashim',
    ajk: 'Panitia Sejarah & Panitia Muzik',
    anggaranPeserta: 720,
    anggaranKos: 500,
    statusKelulusan: 'Diluluskan',
    diluluskanOleh: 'Pn. Hajah Fatimah Binti Ismail (Guru Besar)',
    tarikhKelulusan: '2027-02-12',
    statusPelaksanaan: 'Belum Bermula',
    createdBy: 'u-guru1',
    createdByName: 'Cik Siti Nurhaliza Binti Ramli',
    createdAt: now,
    updatedBy: 'u-guru1',
    updatedByName: 'Cik Siti Nurhaliza Binti Ramli',
    updatedAt: now,
    revisionHistory: [],
  });

  return seedList;
}

// Ensure database file exists
function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content) as DatabaseSchema;
      let needsSave = false;

      // Ensure holidays exist
      if (!parsed.holidays || parsed.holidays.length === 0) {
        parsed.holidays = getAllDefaultHolidays();
        needsSave = true;
      }

      // Enforce exact timing if Tuesday assemblies exist: Sesi Pagi 07:00 - 07:30, Sesi Petang 12:40 - 01:10 (13:10)
      for (const entry of parsed.entries) {
        if (entry.id.startsWith('t-tue-') || entry.tajuk.toLowerCase().includes('perhimpunan rasmi')) {
          if (entry.masaMula !== '07:00' || entry.masaAkhir !== '13:10') {
            entry.masaMula = '07:00';
            entry.masaAkhir = '13:10';
            entry.tajuk = 'Perhimpunan Rasmi Mingguan (Pagi: 07:00 - 07:30 | Petang: 12:40 - 01:10)';
            entry.catatan = 'Wajib dihadiri semua murid dan guru: Sesi Pagi (07:00 - 07:30 pagi) & Sesi Petang (12:40 - 01:10 pm).';
            needsSave = true;
          }
        }
      }

      if (!parsed.settings) {
        parsed.settings = DEFAULT_SCHOOL_SETTINGS;
        needsSave = true;
      }

      if (needsSave) {
        parsed.entries.sort(
          (a, b) => a.tarikhMula.localeCompare(b.tarikhMula) || a.masaMula.localeCompare(b.masaMula)
        );
        parsed.lastUpdated = new Date().toISOString();
        saveDatabase(parsed);
      }

      return parsed;
    } catch (err) {
      console.error('Error reading takwim-db.json, creating fallback fresh schema', err);
    }
  }

  const initialDb: DatabaseSchema = {
    entries: [], // Empty initially as requested by user
    deletedEntries: [],
    holidays: getAllDefaultHolidays(),
    panitia: INITIAL_PANITIA_CONFIGS,
    drafts: {},
    settings: DEFAULT_SCHOOL_SETTINGS,
    lastUpdated: new Date().toISOString(),
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database to disk:', err);
  }
}

// In-memory reference synced to disk
let currentDb = loadDatabase();

// In-memory cache for double-submission protection (prevent duplicate posts within 5 seconds)
const recentSubmissions = new Map<string, number>();

// Clean submissions cache every 30 seconds
setInterval(() => {
  const cutoff = Date.now() - 10000;
  for (const [key, ts] of recentSubmissions.entries()) {
    if (ts < cutoff) recentSubmissions.delete(key);
  }
}, 30000);

// ======================== API ROUTES ========================

// 1. Status & Database Health
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    connected: true,
    storageType: 'Pangkalan Data Fail JSON Berterusan (data/takwim-db.json)',
    school: 'SK Tudan, Miri, Sarawak (Kumpulan B)',
    academicYear: 2027,
    recordCount: currentDb.entries.length,
    deletedCount: currentDb.deletedEntries.length,
    holidaysCount: currentDb.holidays.length,
    lastSaved: currentDb.lastUpdated,
    serverTime: new Date().toISOString(),
  });
});

// 2. Takwim Entries (GET with filter & search)
app.get('/api/takwim', (req: Request, res: Response) => {
  const { bulan, bidang, panitia, statusKelulusan, statusPelaksanaan, search, userRole, userId } = req.query;

  let results = [...currentDb.entries];

  if (bulan) {
    const bNum = Number(bulan);
    results = results.filter(e => e.bulan === bNum);
  }

  if (bidang && bidang !== 'Semua') {
    results = results.filter(e => e.bidangUtama === bidang);
  }

  if (panitia && panitia !== 'Semua') {
    results = results.filter(e => e.unitUtama === panitia || e.unitBersama?.includes(String(panitia)));
  }

  if (statusKelulusan && statusKelulusan !== 'Semua') {
    results = results.filter(e => e.statusKelulusan === statusKelulusan);
  }

  if (statusPelaksanaan && statusPelaksanaan !== 'Semua') {
    results = results.filter(e => e.statusPelaksanaan === statusPelaksanaan);
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(e => 
      e.tajuk.toLowerCase().includes(q) ||
      e.unitUtama.toLowerCase().includes(q) ||
      e.penyelaras.toLowerCase().includes(q) ||
      e.tempat.toLowerCase().includes(q) ||
      (e.objektif || '').toLowerCase().includes(q)
    );
  }

  // Sort by date ascending
  results.sort((a, b) => a.tarikhMula.localeCompare(b.tarikhMula) || a.masaMula.localeCompare(b.masaMula));

  res.json({
    success: true,
    data: results,
    total: results.length,
  });
});

// 3. Get single takwim entry
app.get('/api/takwim/:id', (req: Request, res: Response) => {
  const entry = currentDb.entries.find(e => e.id === req.params.id);
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Program tidak dijumpai.' });
  }
  res.json({ success: true, data: entry });
});

// 4. Create new Takwim entry (with double-submit protection)
app.post('/api/takwim', (req: Request, res: Response) => {
  const entryData: Partial<TakwimEntry> = req.body;

  if (!entryData.tajuk || !entryData.tarikhMula || !entryData.bidangUtama || !entryData.unitUtama) {
    return res.status(400).json({
      success: false,
      message: 'Sila lengkapkan maklumat wajib: Tajuk, Bidang, Unit, dan Tarikh Mula.',
    });
  }

  // Double submission key
  const submitKey = `${entryData.createdBy || 'anon'}_${entryData.tajuk}_${entryData.tarikhMula}`;
  const lastSubmitTime = recentSubmissions.get(submitKey);
  if (lastSubmitTime && Date.now() - lastSubmitTime < 5000) {
    return res.status(429).json({
      success: false,
      message: 'Penghantaran berganda dikesan. Rekod yang sama telah diproses sebentar tadi.',
    });
  }
  recentSubmissions.set(submitKey, Date.now());

  const now = new Date().toISOString();
  const id = `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Compute Academic Week and Day Status automatically
  const weekInfo = getAcademicWeekForDate(entryData.tarikhMula);
  const dayStatusInfo = getDayStatus(entryData.tarikhMula, currentDb.holidays);

  const startMonth = new Date(entryData.tarikhMula + 'T00:00:00').getMonth() + 1;

  const newEntry: TakwimEntry = {
    id,
    tahun: 2027,
    bulan: entryData.bulan || startMonth,
    bidangUtama: entryData.bidangUtama,
    unitUtama: entryData.unitUtama,
    unitBersama: entryData.unitBersama || [],
    jenisPengisian: entryData.jenisPengisian || 'Program',
    tajuk: entryData.tajuk.trim(),
    tajukPilihanBank: entryData.tajukPilihanBank,
    adalahTajukSendiri: !!entryData.adalahTajukSendiri,
    bilanganMesyuarat: entryData.bilanganMesyuarat,
    objektif: entryData.objektif || '',
    tarikhMula: entryData.tarikhMula,
    tarikhAkhir: entryData.tarikhAkhir || entryData.tarikhMula,
    masaMula: entryData.masaMula || '08:00',
    masaAkhir: entryData.masaAkhir || '12:00',
    sepanjangHari: !!entryData.sepanjangHari,
    mingguAkademik: weekInfo.code,
    mingguRPHSekolah: entryData.mingguRPHSekolah,
    statusHari: dayStatusInfo.statusLabel,
    tempat: entryData.tempat || 'Kawasan Sekolah',
    sasaran: entryData.sasaran || ['Semua Guru & Staf'],
    penyelaras: entryData.penyelaras || 'Penyelaras Unit',
    ajk: entryData.ajk || '',
    anggaranPeserta: Number(entryData.anggaranPeserta) || undefined,
    anggaranKos: Number(entryData.anggaranKos) || undefined,
    sumberKewangan: entryData.sumberKewangan || '',
    catatan: entryData.catatan || '',
    lampiran: entryData.lampiran || '',
    statusKelulusan: entryData.statusKelulusan || 'Draf',
    statusPelaksanaan: entryData.statusPelaksanaan || 'Belum Bermula',
    isRecurring: entryData.isRecurring,
    recurringPattern: entryData.recurringPattern,
    recurringDates: entryData.recurringDates,
    conflictApproved: entryData.conflictApproved,
    conflictApprovedReason: entryData.conflictApprovedReason,
    conflictApprovedBy: entryData.conflictApprovedBy,
    createdBy: entryData.createdBy || 'u-guru1',
    createdByName: entryData.createdByName || 'Guru SK Tudan',
    createdAt: now,
    updatedBy: entryData.createdBy || 'u-guru1',
    updatedByName: entryData.createdByName || 'Guru SK Tudan',
    updatedAt: now,
    revisionHistory: [
      {
        id: `rev-${Date.now()}`,
        timestamp: now,
        action: entryData.statusKelulusan === 'Dihantar' ? 'Dihantar untuk Semakan' : 'Simpan Draf',
        userId: entryData.createdBy || 'u-guru1',
        userName: entryData.createdByName || 'Guru SK Tudan',
        details: 'Rekod program baharu didaftarkan.',
      },
    ],
  };

  currentDb.entries.unshift(newEntry);
  saveDatabase(currentDb);

  res.status(201).json({
    success: true,
    message: 'Pengisian program berjaya disimpan ke pangkalan data sekolah.',
    data: newEntry,
  });
});

// 5. Update Takwim entry
app.put('/api/takwim/:id', (req: Request, res: Response) => {
  const index = currentDb.entries.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Program tidak dijumpai.' });
  }

  const existing = currentDb.entries[index];
  const updateData: Partial<TakwimEntry> = req.body;

  const now = new Date().toISOString();
  const weekInfo = updateData.tarikhMula ? getAcademicWeekForDate(updateData.tarikhMula) : { code: existing.mingguAkademik };
  const dayStatusInfo = updateData.tarikhMula ? getDayStatus(updateData.tarikhMula, currentDb.holidays) : { statusLabel: existing.statusHari };
  const month = updateData.tarikhMula ? (new Date(updateData.tarikhMula + 'T00:00:00').getMonth() + 1) : existing.bulan;

  const updatedEntry: TakwimEntry = {
    ...existing,
    ...updateData,
    bulan: month,
    mingguAkademik: weekInfo.code,
    statusHari: dayStatusInfo.statusLabel,
    updatedBy: updateData.updatedBy || existing.updatedBy,
    updatedByName: updateData.updatedByName || existing.updatedByName,
    updatedAt: now,
    revisionHistory: [
      {
        id: `rev-${Date.now()}`,
        timestamp: now,
        action: 'Kemaskini Maklumat',
        userId: updateData.updatedBy || 'u-user',
        userName: updateData.updatedByName || 'Pengguna',
        details: `Pindaan program pada ${new Date().toLocaleDateString('ms-MY')}`,
      },
      ...existing.revisionHistory,
    ],
  };

  currentDb.entries[index] = updatedEntry;
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: 'Maklumat program berjaya dikemas kini.',
    data: updatedEntry,
  });
});

// 6. Approval Route with Server-Side RBAC validation
app.post('/api/takwim/:id/approval', (req: Request, res: Response) => {
  const { status, komen, approverId, approverName, approverRole } = req.body;

  const index = currentDb.entries.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Program tidak dijumpai.' });
  }

  const existing = currentDb.entries[index];

  // RBAC Enforcement: Standard Guru or Reader cannot approve!
  if (approverRole === 'Guru' || approverRole === 'Pembaca') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak: Guru atau Pembaca tidak mempunyai kebenaran untuk meluluskan permohonan.',
    });
  }

  // Teacher cannot approve their own submission if not Pentadbir
  if (approverRole !== 'Pentadbir' && existing.createdBy === approverId) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak: Pegawai tidak boleh meluluskan permohonan sendiri tanpa peranan Pentadbir.',
    });
  }

  const now = new Date().toISOString();
  existing.statusKelulusan = status;
  existing.komenKelulusan = komen || '';
  existing.diluluskanOleh = `${approverName} (${approverRole})`;
  existing.tarikhKelulusan = now.split('T')[0];
  existing.updatedAt = now;
  existing.updatedBy = approverId;
  existing.updatedByName = approverName;

  existing.revisionHistory.unshift({
    id: `rev-${Date.now()}`,
    timestamp: now,
    action: `Kelulusan: ${status}`,
    userId: approverId,
    userName: approverName,
    details: komen ? `Komen: ${komen}` : `Status diubah kepada ${status}`,
  });

  currentDb.entries[index] = existing;
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: `Status kelulusan dikemas kini kepada "${status}".`,
    data: existing,
  });
});

// 7. Implementation Status Route
app.post('/api/takwim/:id/implementation', (req: Request, res: Response) => {
  const { status, tarikhSebenar, ringkasanHasil, laporanPautan, userId, userName } = req.body;

  const index = currentDb.entries.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Program tidak dijumpai.' });
  }

  const existing = currentDb.entries[index];
  const now = new Date().toISOString();

  existing.statusPelaksanaan = status;
  if (tarikhSebenar) existing.tarikhSebenarPelaksanaan = tarikhSebenar;
  if (ringkasanHasil) existing.ringkasanHasil = ringkasanHasil;
  if (laporanPautan) existing.laporanPautan = laporanPautan;
  existing.updatedAt = now;
  existing.updatedBy = userId || existing.updatedBy;
  existing.updatedByName = userName || existing.updatedByName;

  existing.revisionHistory.unshift({
    id: `rev-${Date.now()}`,
    timestamp: now,
    action: `Pelaksanaan: ${status}`,
    userId: userId || 'u-user',
    userName: userName || 'Pengguna',
    details: ringkasanHasil ? `Hasil: ${ringkasanHasil}` : `Status pelaksanaan dikemas kini kepada ${status}`,
  });

  currentDb.entries[index] = existing;
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: 'Status pelaksanaan dan pelaporan berjaya dikemas kini.',
    data: existing,
  });
});

// 8. Soft Delete with Recovery Tracking
app.delete('/api/takwim/:id', (req: Request, res: Response) => {
  const index = currentDb.entries.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Program tidak dijumpai.' });
  }

  const removed = currentDb.entries.splice(index, 1)[0];
  removed.isDeleted = true;
  removed.deletedAt = new Date().toISOString();
  currentDb.deletedEntries.unshift(removed);

  saveDatabase(currentDb);

  res.json({
    success: true,
    message: 'Program dipadam dan dipindahkan ke tong sampah (boleh dipulihkan).',
    data: removed,
  });
});

// 8b. Bulk Upload Takwim Entries
app.post('/api/takwim/bulk-upload', (req: Request, res: Response) => {
  const { entries: incomingEntries, mode, excludeWeekends } = req.body;
  if (!Array.isArray(incomingEntries)) {
    return res.status(400).json({ success: false, message: 'Senarai program tidak sah.' });
  }

  // Filter weekends if excludeWeekends is true (default true)
  const shouldExcludeWeekends = excludeWeekends !== false;
  const filtered = incomingEntries.filter((e: any) => {
    if (!e || !e.tarikhMula) return false;
    if (shouldExcludeWeekends) {
      const d = new Date(e.tarikhMula + 'T00:00:00');
      const day = d.getDay();
      if (day === 0 || day === 6) {
        return false; // Exclude Saturday & Sunday
      }
    }
    return true;
  });

  const now = new Date().toISOString();
  const prepared = filtered.map((e: any, idx: number) => ({
    id: e.id || `bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    tahun: 2027 as const,
    bulan: Number(e.bulan) || (e.tarikhMula ? new Date(e.tarikhMula + 'T00:00:00').getMonth() + 1 : 1),
    bidangUtama: e.bidangUtama || 'Pengurusan dan Staf',
    unitUtama: e.unitUtama || 'Pentadbiran Sekolah',
    unitBersama: Array.isArray(e.unitBersama) ? e.unitBersama : [],
    jenisPengisian: e.jenisPengisian || 'Program',
    tajuk: String(e.tajuk || 'Program Takwim').trim(),
    adalahTajukSendiri: true,
    objektif: e.objektif || '',
    tarikhMula: e.tarikhMula,
    tarikhAkhir: e.tarikhAkhir || e.tarikhMula,
    masaMula: e.masaMula || '08:00',
    masaAkhir: e.masaAkhir || '13:00',
    sepanjangHari: Boolean(e.sepanjangHari),
    mingguAkademik: e.mingguAkademik || getAcademicWeekForDate(e.tarikhMula).code,
    statusHari: getDayStatus(e.tarikhMula, currentDb.holidays).statusLabel,
    tempat: e.tempat || 'SK Tudan, Miri',
    sasaran: Array.isArray(e.sasaran) ? e.sasaran : [],
    penyelaras: e.penyelaras || 'Penyelaras',
    statusKelulusan: e.statusKelulusan || 'Diluluskan',
    statusPelaksanaan: (e.statusPelaksanaan || 'Belum Bermula') as any,
    catatan: e.catatan || '',
    createdBy: e.createdBy || 'u-gb',
    createdByName: e.createdByName || 'Pentadbir Sekolah',
    createdAt: now,
    updatedBy: e.updatedBy || 'u-gb',
    updatedByName: e.updatedByName || 'Pentadbir Sekolah',
    updatedAt: now,
    revisionHistory: [],
  }));

  if (mode === 'replace') {
    currentDb.entries = prepared;
  } else {
    // Append / merge
    const existingIds = new Set(currentDb.entries.map((x) => x.id));
    for (const p of prepared) {
      if (!existingIds.has(p.id)) {
        currentDb.entries.push(p);
      }
    }
  }

  currentDb.entries.sort(
    (a, b) => a.tarikhMula.localeCompare(b.tarikhMula) || a.masaMula.localeCompare(b.masaMula)
  );
  currentDb.lastUpdated = now;
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: `${prepared.length} program berjaya dimuat naik secara pukal ke dalam takwim.`,
    totalEntries: currentDb.entries.length,
    data: currentDb.entries,
  });
});

// 8c. Clear all takwim entries (Reset to empty takwim)
app.post('/api/takwim/clear', (req: Request, res: Response) => {
  const previousCount = currentDb.entries.length;
  currentDb.entries = [];
  currentDb.lastUpdated = new Date().toISOString();
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: `Pangkalan data takwim berjaya dikosongkan (${previousCount} rekod dibersihkan). Guru kini boleh mengisi dan mendaftar program bulanan.`,
    totalEntries: 0,
  });
});

// 9. Restore soft-deleted entry
app.post('/api/trash/:id/restore', (req: Request, res: Response) => {
  const index = currentDb.deletedEntries.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Rekod tong sampah tidak dijumpai.' });
  }

  const restored = currentDb.deletedEntries.splice(index, 1)[0];
  restored.isDeleted = false;
  delete restored.deletedAt;
  restored.updatedAt = new Date().toISOString();

  currentDb.entries.unshift(restored);
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: 'Program berjaya dipulihkan kembali ke takwim sekolah.',
    data: restored,
  });
});

// 10. Get Trash
app.get('/api/trash', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: currentDb.deletedEntries,
  });
});

// 11. Auto-save Draft API
app.get('/api/drafts/:userId', (req: Request, res: Response) => {
  const draft = currentDb.drafts[req.params.userId] || null;
  res.json({ success: true, data: draft });
});

app.post('/api/drafts/:userId', (req: Request, res: Response) => {
  currentDb.drafts[req.params.userId] = req.body;
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Draf disimpan secara automatik di pelayan.' });
});

app.delete('/api/drafts/:userId', (req: Request, res: Response) => {
  delete currentDb.drafts[req.params.userId];
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Draf dipadam.' });
});

// 12. Holidays Management API
app.get('/api/holidays', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: currentDb.holidays,
    total: currentDb.holidays.length,
  });
});

app.post('/api/holidays', (req: Request, res: Response) => {
  const newHoliday: HolidayRecord = {
    id: `hol-${Date.now()}`,
    nama: req.body.nama,
    tarikhMula: req.body.tarikhMula,
    tarikhAkhir: req.body.tarikhAkhir || req.body.tarikhMula,
    negeri: req.body.negeri || 'Sarawak',
    kategori: req.body.kategori || 'Cuti Umum Sarawak',
    sumber: req.body.sumber || 'Warta Kerajaan Sarawak',
    statusPengesahan: req.body.statusPengesahan || 'Disahkan',
    catatan: req.body.catatan,
  };

  currentDb.holidays.push(newHoliday);
  saveDatabase(currentDb);

  res.status(201).json({
    success: true,
    message: 'Cuti baharu berjaya didaftarkan.',
    data: newHoliday,
  });
});

app.put('/api/holidays/:id', (req: Request, res: Response) => {
  const index = currentDb.holidays.findIndex(h => h.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Cuti tidak dijumpai.' });
  }

  currentDb.holidays[index] = {
    ...currentDb.holidays[index],
    ...req.body,
  };
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: 'Maklumat cuti berjaya dikemas kini.',
    data: currentDb.holidays[index],
  });
});

app.post('/api/holidays/verify-all', (req: Request, res: Response) => {
  currentDb.holidays = currentDb.holidays.map(h => ({
    ...h,
    statusPengesahan: 'Disahkan',
  }));
  saveDatabase(currentDb);
  res.json({
    success: true,
    message: 'Semua cuti telah disahkan statusnya.',
  });
});

// 13. Panitia Settings API
app.get('/api/panitia', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: currentDb.panitia,
  });
});

app.put('/api/panitia/:id', (req: Request, res: Response) => {
  const index = currentDb.panitia.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Panitia tidak dijumpai.' });
  }

  currentDb.panitia[index] = {
    ...currentDb.panitia[index],
    ...req.body,
  };
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: 'Tetapan panitia dikemas kini.',
    data: currentDb.panitia[index],
  });
});

app.post('/api/panitia', (req: Request, res: Response) => {
  const newPanitia: PanitiaConfig = {
    id: `pan-${Date.now()}`,
    nama: req.body.nama,
    kod: req.body.kod || req.body.nama.substring(0, 4).toUpperCase(),
    bidang: req.body.bidang || 'Panitia Mata Pelajaran',
    jenis: req.body.jenis || 'Panitia Mata Pelajaran',
    aktif: true,
    urutan: currentDb.panitia.length + 1,
    ketua: req.body.ketua || '',
  };

  currentDb.panitia.push(newPanitia);
  saveDatabase(currentDb);

  res.status(201).json({
    success: true,
    message: 'Panitia / unit sokongan baharu berjaya ditambah.',
    data: newPanitia,
  });
});

// 14. Reset Seed Data Route (Useful for testing & clean demonstration)
app.post('/api/reset-seed', (req: Request, res: Response) => {
  currentDb = {
    entries: getSeedEntries(),
    deletedEntries: [],
    holidays: getAllDefaultHolidays(),
    panitia: INITIAL_PANITIA_CONFIGS,
    drafts: {},
    settings: DEFAULT_SCHOOL_SETTINGS,
    lastUpdated: new Date().toISOString(),
  };
  saveDatabase(currentDb);
  res.json({
    success: true,
    message: 'Pangkalan data telah diset semula ke konfigurasi asal SK Tudan 2027.',
  });
});

// 15. Generate Tuesday Assemblies Route
app.post('/api/generate-tuesday-assemblies', (req: Request, res: Response) => {
  const existingMap = new Map<string, TakwimEntry>();
  currentDb.entries.forEach((e) => {
    if (!e.isDeleted && (e.tajuk.toLowerCase().includes('perhimpunan rasmi') || e.id.startsWith('t-tue-'))) {
      existingMap.set(e.tarikhMula, e);
    }
  });

  const assemblies = generateTuesdayAssemblies(currentDb.holidays);
  let addedCount = 0;
  let updatedCount = 0;

  for (const item of assemblies) {
    if (!existingMap.has(item.tarikhMula)) {
      currentDb.entries.push(item);
      existingMap.set(item.tarikhMula, item);
      addedCount++;
    } else {
      const existing = existingMap.get(item.tarikhMula)!;
      existing.masaMula = '07:00';
      existing.masaAkhir = '13:10';
      existing.tajuk = 'Perhimpunan Rasmi Mingguan (Pagi: 07:00 - 07:30 | Petang: 12:40 - 01:10)';
      existing.catatan = 'Wajib dihadiri semua murid dan guru: Sesi Pagi (07:00 - 07:30 pagi) & Sesi Petang (12:40 - 01:10 pm).';
      updatedCount++;
    }
  }

  currentDb.entries.sort(
    (a, b) => a.tarikhMula.localeCompare(b.tarikhMula) || a.masaMula.localeCompare(b.masaMula)
  );
  currentDb.lastUpdated = new Date().toISOString();
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: `${addedCount} perhimpunan baharu ditambah, ${updatedCount} perhimpunan sedia ada dikemas kini (Pagi: 07:00-07:30, Petang: 12:40-01:10).`,
    totalAssemblies: existingMap.size,
  });
});

// 16. Seed Full PDF Takwim Route
app.post('/api/seed-full-takwim', (req: Request, res: Response) => {
  const fullSeed = getFullTakwimSeed(currentDb.holidays);
  const existingIds = new Set(currentDb.entries.map((e) => e.id));
  let addedCount = 0;

  for (const item of fullSeed) {
    if (!existingIds.has(item.id)) {
      currentDb.entries.push(item);
      existingIds.add(item.id);
      addedCount++;
    }
  }

  currentDb.entries.sort(
    (a, b) => a.tarikhMula.localeCompare(b.tarikhMula) || a.masaMula.localeCompare(b.masaMula)
  );
  currentDb.lastUpdated = new Date().toISOString();
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: `${addedCount} program takwim rasmi SK Tudan 2027 telah didaftarkan.`,
    totalEntries: currentDb.entries.length,
  });
});

// 17. School Settings API
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: currentDb.settings || DEFAULT_SCHOOL_SETTINGS,
  });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const incoming = req.body || {};
  const current = currentDb.settings || DEFAULT_SCHOOL_SETTINGS;

  const mergedReviewers = incoming.adminReviewers ? {
    guruBesar: incoming.adminReviewers.guruBesar !== undefined ? String(incoming.adminReviewers.guruBesar).trim() : (current.adminReviewers?.guruBesar || ''),
    pk1: incoming.adminReviewers.pk1 !== undefined ? String(incoming.adminReviewers.pk1).trim() : (current.adminReviewers?.pk1 || ''),
    pkHem: incoming.adminReviewers.pkHem !== undefined ? String(incoming.adminReviewers.pkHem).trim() : (current.adminReviewers?.pkHem || ''),
    pkKk: incoming.adminReviewers.pkKk !== undefined ? String(incoming.adminReviewers.pkKk).trim() : (current.adminReviewers?.pkKk || ''),
    pkPetang: incoming.adminReviewers.pkPetang !== undefined ? String(incoming.adminReviewers.pkPetang).trim() : (current.adminReviewers?.pkPetang || ''),
  } : (current.adminReviewers || DEFAULT_SCHOOL_SETTINGS.adminReviewers);

  currentDb.settings = {
    ...DEFAULT_SCHOOL_SETTINGS,
    ...current,
    ...incoming,
    adminReviewers: mergedReviewers,
  };
  currentDb.lastUpdated = new Date().toISOString();
  saveDatabase(currentDb);
  res.json({
    success: true,
    message: 'Ketetapan sekolah berjaya disimpan.',
    data: currentDb.settings,
  });
});

app.post('/api/settings/upload-teachers', (req: Request, res: Response) => {
  const { teachers, replace } = req.body;
  if (!Array.isArray(teachers) || teachers.length === 0) {
    return res.status(400).json({ success: false, message: 'Senarai nama guru tidak sah.' });
  }

  const cleanTeachers = teachers.map((t: string) => String(t).trim()).filter((t: string) => t.length > 0);
  
  if (replace) {
    currentDb.settings.teachersList = cleanTeachers;
  } else {
    const existing = new Set(currentDb.settings.teachersList || []);
    cleanTeachers.forEach((t: string) => existing.add(t));
    currentDb.settings.teachersList = Array.from(existing);
  }

  currentDb.lastUpdated = new Date().toISOString();
  saveDatabase(currentDb);
  res.json({
    success: true,
    message: `Senarai guru berjaya dikemas kini (${currentDb.settings.teachersList.length} orang guru didaftarkan).`,
    data: currentDb.settings.teachersList,
  });
});

app.post('/api/settings/upload-book', (req: Request, res: Response) => {
  const { rawText, sourceName } = req.body;
  if (!rawText || typeof rawText !== 'string') {
    return res.status(400).json({ success: false, message: 'Teks buku pengurusan tidak disediakan.' });
  }

  // Parse lines from uploaded text / CSV
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 3);
  const extracted: { id: string; tajuk: string; bidang: BidangType; unit?: string; bulan?: number; source?: string }[] = [];

  const monthNamesMs = ['januari', 'februari', 'mac', 'april', 'mei', 'jun', 'julai', 'ogos', 'september', 'oktober', 'november', 'disember'];

  let currentDetectedMonth = 1;

  for (const line of lines) {
    // Check if line indicates a month
    const lower = line.toLowerCase();
    for (let m = 0; m < 12; m++) {
      if (lower.includes(monthNamesMs[m])) {
        currentDetectedMonth = m + 1;
        break;
      }
    }

    // Determine bidang
    let bidang: BidangType = 'Pengurusan dan Staf';
    if (lower.includes('kurikulum') || lower.includes('pbd') || lower.includes('peperiksaan') || lower.includes('rph') || lower.includes('ujian') || lower.includes('akademik')) {
      bidang = 'Kurikulum';
    } else if (lower.includes('hem') || lower.includes('disiplin') || lower.includes('spbt') || lower.includes('kaunseling') || lower.includes('kebajikan') || lower.includes('kesihatan') || lower.includes('rmt')) {
      bidang = 'Hal Ehwal Murid';
    } else if (lower.includes('kokurikulum') || lower.includes('koko') || lower.includes('sukan') || lower.includes('merentas') || lower.includes('unit beruniform') || lower.includes('kelab') || lower.includes('1m1s')) {
      bidang = 'Kokurikulum';
    } else if (lower.includes('panitia') || lower.includes('bengkel') || lower.includes('mata pelajaran') || lower.includes('minggu bahasa') || lower.includes('stem')) {
      bidang = 'Panitia Mata Pelajaran';
    } else if (lower.includes('mesyuarat guru') || lower.includes('staf') || lower.includes('pibg') || lower.includes('ladap') || lower.includes('cpd') || lower.includes('takwim')) {
      bidang = 'Pengurusan dan Staf';
    }

    // Clean up title (remove numbering like "1. ", bullets, leading hyphens)
    const cleanedTitle = line.replace(/^[\d\.\-\*\•\)\s]+/, '').replace(/^program\s+/i, 'Program ').trim();

    if (cleanedTitle.length >= 5 && !cleanedTitle.toLowerCase().startsWith('takwim persekolahan') && !cleanedTitle.toLowerCase().startsWith('buku pengurusan')) {
      extracted.push({
        id: `ext-${Date.now()}-${extracted.length + 1}`,
        tajuk: cleanedTitle,
        bidang,
        bulan: currentDetectedMonth,
        source: sourceName || 'Buku Pengurusan Sekolah',
      });
    }
  }

  // Deduplicate against existing extracted programs
  const existingTitles = new Set(((currentDb.settings && currentDb.settings.extractedPrograms) || []).map(p => p.tajuk.toLowerCase()));
  const newPrograms = extracted.filter(p => !existingTitles.has(p.tajuk.toLowerCase()));

  currentDb.settings.extractedPrograms = [
    ...((currentDb.settings && currentDb.settings.extractedPrograms) || []),
    ...newPrograms,
  ];

  currentDb.lastUpdated = new Date().toISOString();
  saveDatabase(currentDb);

  res.json({
    success: true,
    message: `${newPrograms.length} program berjaya diekstrak daripada buku pengurusan dan dimasukkan ke bank program!`,
    totalExtracted: currentDb.settings.extractedPrograms.length,
    newCount: newPrograms.length,
    data: currentDb.settings.extractedPrograms,
  });
});

app.post('/api/settings/upload-civic', (req: Request, res: Response) => {
  const { civicValues } = req.body;
  if (!Array.isArray(civicValues)) {
    return res.status(400).json({ success: false, message: 'Data nilai sivik tidak sah.' });
  }
  currentDb.settings.civicValues = civicValues;
  currentDb.lastUpdated = new Date().toISOString();
  saveDatabase(currentDb);
  res.json({
    success: true,
    message: 'Jadual Nilai Sivik Bulanan KPM 2027 dikemas kini.',
    data: currentDb.settings.civicValues,
  });
});

app.post('/api/settings/upload-salary', (req: Request, res: Response) => {
  const { salaryDates } = req.body;
  if (!Array.isArray(salaryDates)) {
    return res.status(400).json({ success: false, message: 'Data jadual gaji tidak sah.' });
  }
  currentDb.settings.salaryDates = salaryDates;
  currentDb.lastUpdated = new Date().toISOString();
  saveDatabase(currentDb);
  res.json({
    success: true,
    message: 'Jadual Pembayaran Gaji Penjawat Awam 2027 dikemas kini.',
    data: currentDb.settings.salaryDates,
  });
});

// ======================== VITE INTEGRATION ========================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`e-Takwim SK Tudan Server berjalan pada http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Gagal memulakan pelayan:', err);
  process.exit(1);
});
