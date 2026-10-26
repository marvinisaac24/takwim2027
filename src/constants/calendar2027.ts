import { HolidayRecord, SchoolWeekSlot, ConflictDetectionResult, TakwimEntry } from '../types/takwim';

export const SCHOOL_INFO = {
  name: 'Sekolah Kebangsaan Tudan',
  shortName: 'SK Tudan',
  district: 'Miri',
  state: 'Sarawak',
  kodSekolah: 'YBA4103',
  group: 'Kumpulan B',
  academicYear: 2027,
  timezone: 'Asia/Kuala_Lumpur',
  alamat: 'Jalan Tudan, 98000 Miri, Sarawak',
};

// Cuti Penggal Persekolahan Kumpulan B (2027)
export const SCHOOL_TERM_HOLIDAYS: HolidayRecord[] = [
  {
    id: 'term-cuti-penggal-1',
    nama: 'Cuti Penggal 1',
    tarikhMula: '2027-03-06',
    tarikhAkhir: '2027-03-14',
    negeri: 'Sarawak / Kumpulan B',
    kategori: 'Cuti Penggal Persekolahan',
    sumber: 'Kalendar Akademik Sesi 2027 KPM (Lampiran B)',
    statusPengesahan: 'Disahkan',
    catatan: 'Tempoh cuti 9 hari merentasi hujung minggu.',
  },
  {
    id: 'term-cuti-pertengahan-tahun',
    nama: 'Cuti Pertengahan Tahun',
    tarikhMula: '2027-05-22',
    tarikhAkhir: '2027-06-06',
    negeri: 'Sarawak / Kumpulan B',
    kategori: 'Cuti Penggal Persekolahan',
    sumber: 'Kalendar Akademik Sesi 2027 KPM (Lampiran B)',
    statusPengesahan: 'Disahkan',
    catatan: 'Tempoh cuti 16 hari merentasi Hari Gawai Dayak.',
  },
  {
    id: 'term-cuti-penggal-2',
    nama: 'Cuti Penggal 2',
    tarikhMula: '2027-08-28',
    tarikhAkhir: '2027-09-05',
    negeri: 'Sarawak / Kumpulan B',
    kategori: 'Cuti Penggal Persekolahan',
    sumber: 'Kalendar Akademik Sesi 2027 KPM (Lampiran B)',
    statusPengesahan: 'Disahkan',
    catatan: 'Tempoh cuti 9 hari merentasi Hari Kebangsaan 31 Ogos.',
  },
  {
    id: 'term-cuti-akhir-tahun',
    nama: 'Cuti Akhir Persekolahan',
    tarikhMula: '2027-12-04',
    tarikhAkhir: '2027-12-31',
    negeri: 'Sarawak / Kumpulan B',
    kategori: 'Cuti Penggal Persekolahan',
    sumber: 'Kalendar Akademik Sesi 2027 KPM (Lampiran B)',
    statusPengesahan: 'Disahkan',
    catatan: 'Cuti Akhir Tahun 28 hari. 4 Disember ialah hari pertama cuti akhir.',
  },
];

// Cuti Tambahan KPM Kumpulan B bagi Negeri Sarawak (Lampiran C SPI KPM)
export const KPM_ADDITIONAL_HOLIDAYS: HolidayRecord[] = [
  // Tahun Baharu Cina: 5, 9, 10, 11 dan 12 Februari 2027
  {
    id: 'kpm-cny-1',
    nama: 'Cuti Tambahan KPM - Tahun Baharu Cina',
    tarikhMula: '2027-02-05',
    tarikhAkhir: '2027-02-05',
    negeri: 'Sarawak / Kumpulan B',
    kategori: 'Cuti Tambahan KPM',
    sumber: 'Lampiran C Kalendar Akademik 2027 KPM',
    statusPengesahan: 'Disahkan',
    catatan: 'Jumaat sebelum hujung minggu Tahun Baharu Cina.',
  },
  {
    id: 'kpm-cny-2',
    nama: 'Cuti Tambahan KPM - Tahun Baharu Cina',
    tarikhMula: '2027-02-09',
    tarikhAkhir: '2027-02-12',
    negeri: 'Sarawak / Kumpulan B',
    kategori: 'Cuti Tambahan KPM',
    sumber: 'Lampiran C Kalendar Akademik 2027 KPM',
    statusPengesahan: 'Disahkan',
    catatan: 'Selasa hingga Jumaat (9, 10, 11, 12 Februari). M06 tiada hari PdP.',
  },
  // Hari Raya Korban: 18 dan 19 Mei 2027
  {
    id: 'kpm-aidiladha-1',
    nama: 'Cuti Tambahan KPM - Hari Raya Korban (Aidiladha)',
    tarikhMula: '2027-05-18',
    tarikhAkhir: '2027-05-19',
    negeri: 'Sarawak / Kumpulan B',
    kategori: 'Cuti Tambahan KPM',
    sumber: 'Lampiran C Kalendar Akademik 2027 KPM',
    statusPengesahan: 'Disahkan',
    catatan: 'Selasa dan Rabu selepas Hari Raya Qurban 17 Mei.',
  },
  // Hari Wesak: 21 Mei 2027
  {
    id: 'kpm-wesak-1',
    nama: 'Cuti Tambahan KPM - Hari Wesak',
    tarikhMula: '2027-05-21',
    tarikhAkhir: '2027-05-21',
    negeri: 'Sarawak / Kumpulan B',
    kategori: 'Cuti Tambahan KPM',
    sumber: 'Lampiran C Kalendar Akademik 2027 KPM',
    statusPengesahan: 'Disahkan',
    catatan: 'Jumaat selepas Hari Wesak 20 Mei.',
  },
  // Deepavali Sarawak: 28 Oktober 2027 SAHAJA!
  // PENTING: 27 dan 29 Oktober TIDAK ditandakan untuk Sarawak
  {
    id: 'kpm-deepavali-sarawak',
    nama: 'Cuti Perayaan Deepavali (Sarawak)',
    tarikhMula: '2027-10-28',
    tarikhAkhir: '2027-10-28',
    negeri: 'Sarawak',
    kategori: 'Cuti Tambahan KPM',
    sumber: 'Lampiran C Kalendar Akademik 2027 KPM (Ketetapan Khusus Sarawak)',
    statusPengesahan: 'Disahkan',
    catatan: 'Bagi Sarawak, 28 Oktober 2027 sahaja. 27 & 29 Oktober bukan cuti tambahan Sarawak.',
  },
];

// Cuti Umum Persekutuan & Cuti Umum Negeri Sarawak
export const INITIAL_PUBLIC_HOLIDAYS: HolidayRecord[] = [
  {
    id: 'pub-new-year',
    nama: 'Tahun Baharu 2027',
    tarikhMula: '2027-01-01',
    tarikhAkhir: '2027-01-01',
    negeri: 'Sarawak',
    kategori: 'Cuti Umum Sarawak',
    sumber: 'Hari Kelepasan Am Sarawak 2027',
    statusPengesahan: 'Disahkan',
    catatan: 'Sebelum sesi persekolahan bermula.',
  },
  {
    id: 'pub-cny-day1',
    nama: 'Tahun Baharu Cina (Hari Pertama)',
    tarikhMula: '2027-02-06',
    tarikhAkhir: '2027-02-06',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Kalendar Rasmi Kerajaan Persekutuan & Warta Sarawak',
    statusPengesahan: 'Disahkan',
    catatan: 'Sabtu.',
  },
  {
    id: 'pub-cny-day2',
    nama: 'Tahun Baharu Cina (Hari Kedua)',
    tarikhMula: '2027-02-07',
    tarikhAkhir: '2027-02-07',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Kalendar Rasmi Kerajaan Persekutuan & Warta Sarawak',
    statusPengesahan: 'Disahkan',
    catatan: 'Ahad.',
  },
  {
    id: 'pub-cny-gantian',
    nama: 'Cuti Gantian Tahun Baharu Cina',
    tarikhMula: '2027-02-08',
    tarikhAkhir: '2027-02-08',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Gantian',
    sumber: 'Warta Kerajaan Persekutuan & Sarawak (Akta Hari Kelepasan Am)',
    statusPengesahan: 'Disahkan',
    catatan: 'Isnin (Cuti gantian kerana Tahun Baharu Cina jatuh pada hari Ahad).',
  },
  {
    id: 'pub-raya-day1',
    nama: 'Hari Raya Aidilfitri (Hari Pertama)',
    tarikhMula: '2027-03-10',
    tarikhAkhir: '2027-03-10',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Kalendar Rasmi JAKIM & Warta Sarawak',
    statusPengesahan: 'Disahkan',
    catatan: 'Jatuh dalam Cuti Penggal 1 Persekolahan.',
  },
  {
    id: 'pub-raya-day2',
    nama: 'Hari Raya Aidilfitri (Hari Kedua)',
    tarikhMula: '2027-03-11',
    tarikhAkhir: '2027-03-11',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Kalendar Rasmi JAKIM & Warta Sarawak',
    statusPengesahan: 'Disahkan',
    catatan: 'Jatuh dalam Cuti Penggal 1 Persekolahan.',
  },
  {
    id: 'pub-good-friday',
    nama: 'Good Friday (Hari Jumaat Agung)',
    tarikhMula: '2027-03-26',
    tarikhAkhir: '2027-03-26',
    negeri: 'Sarawak',
    kategori: 'Cuti Umum Sarawak',
    sumber: 'Warta Kerajaan Negeri Sarawak',
    statusPengesahan: 'Disahkan',
    catatan: 'Cuti umum rasmi negeri Sarawak.',
  },
  {
    id: 'pub-labour-day',
    nama: 'Hari Pekerja',
    tarikhMula: '2027-05-01',
    tarikhAkhir: '2027-05-01',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Akta Hari Kelepasan Am 1951',
    statusPengesahan: 'Disahkan',
    catatan: 'Sabtu.',
  },
  {
    id: 'pub-aidiladha',
    nama: 'Hari Raya Haji / Aidiladha',
    tarikhMula: '2027-05-17',
    tarikhAkhir: '2027-05-17',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Kalendar Rasmi JAKIM',
    statusPengesahan: 'Disahkan',
    catatan: 'Isnin.',
  },
  {
    id: 'pub-wesak',
    nama: 'Hari Wesak',
    tarikhMula: '2027-05-20',
    tarikhAkhir: '2027-05-20',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Kalendar Rasmi Kerajaan Persekutuan',
    statusPengesahan: 'Disahkan',
    catatan: 'Khamis.',
  },
  {
    id: 'pub-gawai-day1',
    nama: 'Hari Gawai Dayak (Hari Pertama)',
    tarikhMula: '2027-06-01',
    tarikhAkhir: '2027-06-01',
    negeri: 'Sarawak',
    kategori: 'Cuti Umum Sarawak',
    sumber: 'Warta Kerajaan Negeri Sarawak',
    statusPengesahan: 'Disahkan',
    catatan: 'Jatuh dalam Cuti Pertengahan Tahun Persekolahan.',
  },
  {
    id: 'pub-gawai-day2',
    nama: 'Hari Gawai Dayak (Hari Kedua)',
    tarikhMula: '2027-06-02',
    tarikhAkhir: '2027-06-02',
    negeri: 'Sarawak',
    kategori: 'Cuti Umum Sarawak',
    sumber: 'Warta Kerajaan Negeri Sarawak',
    statusPengesahan: 'Disahkan',
    catatan: 'Jatuh dalam Cuti Pertengahan Tahun Persekolahan.',
  },
  {
    id: 'pub-agong-birthday',
    nama: 'Hari Keputeraan Seri Paduka Baginda Yang di-Pertuan Agong',
    tarikhMula: '2027-06-07',
    tarikhAkhir: '2027-06-07',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Warta Kerajaan Persekutuan (Hari Isnin Pertama Bulan Jun)',
    statusPengesahan: 'Disahkan',
    catatan: 'Isnin pertama permulaan Penggal 2.',
  },
  {
    id: 'pub-awal-muharram',
    nama: 'Awal Muharram (Maal Hijrah)',
    tarikhMula: '2027-07-06',
    tarikhAkhir: '2027-07-06',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Kalendar Rasmi JAKIM',
    statusPengesahan: 'Disahkan',
    catatan: 'Selasa.',
  },
  {
    id: 'pub-hari-sarawak',
    nama: 'Hari Sarawak',
    tarikhMula: '2027-07-22',
    tarikhAkhir: '2027-07-22',
    negeri: 'Sarawak',
    kategori: 'Cuti Umum Sarawak',
    sumber: 'Warta Kerajaan Negeri Sarawak (Hari Kemerdekaan Sarawak)',
    statusPengesahan: 'Disahkan',
    catatan: 'Khamis.',
  },
  {
    id: 'pub-merdeka',
    nama: 'Hari Kebangsaan',
    tarikhMula: '2027-08-31',
    tarikhAkhir: '2027-08-31',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Akta Hari Kelepasan Am 1951',
    statusPengesahan: 'Disahkan',
    catatan: 'Jatuh dalam Cuti Penggal 2 Persekolahan.',
  },
  {
    id: 'pub-maulidur-rasul',
    nama: 'Maulidur Rasul',
    tarikhMula: '2027-09-15',
    tarikhAkhir: '2027-09-15',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Kalendar Rasmi JAKIM',
    statusPengesahan: 'Disahkan',
    catatan: 'Rabu.',
  },
  {
    id: 'pub-hari-malaysia',
    nama: 'Hari Malaysia',
    tarikhMula: '2027-09-16',
    tarikhAkhir: '2027-09-16',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Akta Hari Kelepasan Am 1951',
    statusPengesahan: 'Disahkan',
    catatan: 'Khamis.',
  },
  {
    id: 'pub-tyt-sarawak',
    nama: 'Hari Jadi Yang di-Pertua Negeri Sarawak',
    tarikhMula: '2027-10-09',
    tarikhAkhir: '2027-10-09',
    negeri: 'Sarawak',
    kategori: 'Cuti Umum Sarawak',
    sumber: 'Warta Kerajaan Negeri Sarawak',
    statusPengesahan: 'Disahkan',
    catatan: 'Sabtu (Hari Sabtu kedua bulan Oktober).',
  },
  {
    id: 'pub-deepavali',
    nama: 'Hari Deepavali',
    tarikhMula: '2027-10-28',
    tarikhAkhir: '2027-10-28',
    negeri: 'Sarawak',
    kategori: 'Cuti Tambahan KPM',
    sumber: 'Lampiran C Kalendar Akademik 2027 KPM',
    statusPengesahan: 'Disahkan',
    catatan: 'Cuti KPM Sarawak pada 28 Oktober 2027.',
  },
  {
    id: 'pub-krismas',
    nama: 'Hari Krismas',
    tarikhMula: '2027-12-25',
    tarikhAkhir: '2027-12-25',
    negeri: 'Persekutuan & Sarawak',
    kategori: 'Cuti Umum Persekutuan',
    sumber: 'Akta Hari Kelepasan Am 1951',
    statusPengesahan: 'Disahkan',
    catatan: 'Jatuh dalam Cuti Akhir Persekolahan.',
  },
];

// Raw definition of 44 continuous academic week slots
export const ACADEMIC_WEEK_DEFINITIONS: {
  code: string;
  startDate: string;
  endDate: string;
  notes?: string;
}[] = [
  // Januari
  { code: 'M01', startDate: '2027-01-04', endDate: '2027-01-08' },
  { code: 'M02', startDate: '2027-01-11', endDate: '2027-01-15' },
  { code: 'M03', startDate: '2027-01-18', endDate: '2027-01-22' },
  { code: 'M04', startDate: '2027-01-25', endDate: '2027-01-29' },
  
  // Februari
  { code: 'M05', startDate: '2027-02-01', endDate: '2027-02-05' },
  { code: 'M06', startDate: '2027-02-08', endDate: '2027-02-12', notes: 'Tahun Baharu Cina + Cuti Tambahan KPM' },
  { code: 'M07', startDate: '2027-02-15', endDate: '2027-02-19' },
  { code: 'M08', startDate: '2027-02-22', endDate: '2027-02-26' },
  
  // Mac (06/03 - 14/03 adalah Cuti Penggal 1)
  { code: 'M09', startDate: '2027-03-01', endDate: '2027-03-05' },
  { code: 'M10', startDate: '2027-03-15', endDate: '2027-03-19' },
  { code: 'M11', startDate: '2027-03-22', endDate: '2027-03-26' },
  // M12 merentasi Mac dan April: 29 Mac – 2 April 2027
  { code: 'M12', startDate: '2027-03-29', endDate: '2027-04-02', notes: 'Merentasi Mac (29-31 Mac) dan April (1-2 April)' },
  
  // April
  { code: 'M13', startDate: '2027-04-05', endDate: '2027-04-09' },
  { code: 'M14', startDate: '2027-04-12', endDate: '2027-04-16' },
  { code: 'M15', startDate: '2027-04-19', endDate: '2027-04-23' },
  { code: 'M16', startDate: '2027-04-26', endDate: '2027-04-30' },
  
  // Mei (22/05 - 06/06 adalah Cuti Pertengahan Tahun)
  { code: 'M17', startDate: '2027-05-03', endDate: '2027-05-07' },
  { code: 'M18', startDate: '2027-05-10', endDate: '2027-05-14' },
  { code: 'M19', startDate: '2027-05-17', endDate: '2027-05-21' },
  
  // Jun
  { code: 'M20', startDate: '2027-06-07', endDate: '2027-06-11' },
  { code: 'M21', startDate: '2027-06-14', endDate: '2027-06-18' },
  { code: 'M22', startDate: '2027-06-21', endDate: '2027-06-25' },
  // M23 merentasi Jun dan Julai: 28 Jun – 2 Julai 2027
  { code: 'M23', startDate: '2027-06-28', endDate: '2027-07-02', notes: 'Merentasi Jun (28-30 Jun) dan Julai (1-2 Julai)' },
  
  // Julai
  { code: 'M24', startDate: '2027-07-05', endDate: '2027-07-09' },
  { code: 'M25', startDate: '2027-07-12', endDate: '2027-07-16' },
  { code: 'M26', startDate: '2027-07-19', endDate: '2027-07-23' },
  { code: 'M27', startDate: '2027-07-26', endDate: '2027-07-30' },
  
  // Ogos (28/08 - 05/09 adalah Cuti Penggal 2)
  { code: 'M28', startDate: '2027-08-02', endDate: '2027-08-06' },
  { code: 'M29', startDate: '2027-08-09', endDate: '2027-08-13' },
  { code: 'M30', startDate: '2027-08-16', endDate: '2027-08-20' },
  { code: 'M31', startDate: '2027-08-23', endDate: '2027-08-27' },
  
  // September
  { code: 'M32', startDate: '2027-09-06', endDate: '2027-09-10' },
  { code: 'M33', startDate: '2027-09-13', endDate: '2027-09-17' },
  { code: 'M34', startDate: '2027-09-20', endDate: '2027-09-24' },
  // M35 merentasi September dan Oktober: 27 September – 1 Oktober 2027
  { code: 'M35', startDate: '2027-09-27', endDate: '2027-10-01', notes: 'Merentasi September (27-30 Sep) dan Oktober (1 Okt)' },
  
  // Oktober
  { code: 'M36', startDate: '2027-10-04', endDate: '2027-10-08' },
  { code: 'M37', startDate: '2027-10-11', endDate: '2027-10-15' },
  { code: 'M38', startDate: '2027-10-18', endDate: '2027-10-22' },
  { code: 'M39', startDate: '2027-10-25', endDate: '2027-10-29' },
  
  // November
  { code: 'M40', startDate: '2027-11-01', endDate: '2027-11-05' },
  { code: 'M41', startDate: '2027-11-08', endDate: '2027-11-12' },
  { code: 'M42', startDate: '2027-11-15', endDate: '2027-11-19' },
  { code: 'M43', startDate: '2027-11-22', endDate: '2027-11-26' },
  // M44 merentasi November dan Disember: 29 November – 3 Disember 2027
  { code: 'M44', startDate: '2027-11-29', endDate: '2027-12-03', notes: 'Merentasi November (29-30 Nov) dan Disember (1-3 Dis)' },
];

export const MONTH_NAMES_MS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

export const DAY_NAMES_MS = [
  'Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'
];

/**
 * Checks whether a date string (YYYY-MM-DD) falls in a holiday range.
 */
export function isDateInHoliday(dateStr: string, holidays: HolidayRecord[]): HolidayRecord | null {
  for (const h of holidays) {
    if (dateStr >= h.tarikhMula && dateStr <= h.tarikhAkhir) {
      return h;
    }
  }
  return null;
}

/**
 * Get all active holidays (combined unique records)
 */
export function getAllDefaultHolidays(): HolidayRecord[] {
  return [
    ...SCHOOL_TERM_HOLIDAYS,
    ...KPM_ADDITIONAL_HOLIDAYS,
    ...INITIAL_PUBLIC_HOLIDAYS,
  ];
}

/**
 * Maps any date in 2027 to its Academic Week code, or term holiday / pre-session
 */
export function getAcademicWeekForDate(dateStr: string): {
  code: string;
  name: string;
  isTermHoliday: boolean;
  holidayName?: string;
  block: string;
} {
  // Pre-session: 1-3 Jan 2027
  if (dateStr >= '2027-01-01' && dateStr <= '2027-01-03') {
    return {
      code: 'Pra-Sesi',
      name: 'Sebelum Sesi Persekolahan Bermula',
      isTermHoliday: false,
      block: 'Pra-Sesi',
    };
  }

  // Check Cuti Penggal Persekolahan
  for (const term of SCHOOL_TERM_HOLIDAYS) {
    if (dateStr >= term.tarikhMula && dateStr <= term.tarikhAkhir) {
      return {
        code: 'Cuti Penggal',
        name: term.nama,
        isTermHoliday: true,
        holidayName: term.nama,
        block: term.nama,
      };
    }
  }

  // Check the 44 Academic Week slots
  for (const slot of ACADEMIC_WEEK_DEFINITIONS) {
    // If the date is strictly within Monday to Friday of this slot, or weekend immediately following this slot
    // We check Monday to Sunday of that academic week
    const monday = slot.startDate;
    const friday = slot.endDate;
    
    // Calculate Sunday after friday
    const fridayDate = new Date(friday);
    const sundayDate = new Date(fridayDate);
    sundayDate.setDate(fridayDate.getDate() + 2);
    const sunday = sundayDate.toISOString().split('T')[0];

    if (dateStr >= monday && dateStr <= sunday) {
      // Determine block
      let block = 'Penggal 1';
      if (dateStr >= '2027-06-07' && dateStr <= '2027-08-27') block = 'Penggal 2';
      else if (dateStr >= '2027-09-06' && dateStr <= '2027-12-03') block = 'Penggal 3';

      return {
        code: slot.code,
        name: `Minggu ${slot.code.replace('M', '')}`,
        isTermHoliday: false,
        block,
      };
    }
  }

  return {
    code: 'Tiada Slot',
    name: 'Di Luar Kalendar Akademik 2027',
    isTermHoliday: false,
    block: '-',
  };
}

/**
 * Calculate accurate daily PdP status for a date (YYYY-MM-DD)
 */
export function getDayStatus(
  dateStr: string,
  holidays: HolidayRecord[] = getAllDefaultHolidays()
): {
  isWorkingDay: boolean; // Monday-Friday
  isSchoolHoliday: boolean; // Term holiday
  isHoliday: boolean; // Gazetted public or KPM holiday
  isPdPDay: boolean; // Actual teaching day
  statusLabel: 'Hari Persekolahan' | 'Cuti Penggal Sekolah' | 'Cuti Tambahan KPM' | 'Cuti Umum' | 'Hujung Minggu' | 'Belum Disahkan';
  reason?: string;
  holiday?: HolidayRecord;
} {
  const d = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = d.getDay(); // 0 = Ahad, 6 = Sabtu
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // 1-3 Jan check
  if (dateStr >= '2027-01-01' && dateStr <= '2027-01-03') {
    return {
      isWorkingDay: !isWeekend,
      isSchoolHoliday: true,
      isHoliday: false,
      isPdPDay: false,
      statusLabel: 'Cuti Penggal Sekolah',
      reason: 'Sebelum Sesi Persekolahan Bermula 2027',
    };
  }

  // Check Cuti Penggal Sekolah
  const termHoliday = isDateInHoliday(dateStr, SCHOOL_TERM_HOLIDAYS);
  if (termHoliday) {
    return {
      isWorkingDay: !isWeekend,
      isSchoolHoliday: true,
      isHoliday: true,
      isPdPDay: false,
      statusLabel: 'Cuti Penggal Sekolah',
      reason: termHoliday.nama,
      holiday: termHoliday,
    };
  }

  // Check Cuti Tambahan KPM or Cuti Umum
  const matchingHoliday = isDateInHoliday(dateStr, holidays);

  if (isWeekend) {
    return {
      isWorkingDay: false,
      isSchoolHoliday: false,
      isHoliday: !!matchingHoliday,
      isPdPDay: false,
      statusLabel: 'Hujung Minggu',
      reason: matchingHoliday ? matchingHoliday.nama : (dayOfWeek === 0 ? 'Hari Ahad' : 'Hari Sabtu'),
      holiday: matchingHoliday || undefined,
    };
  }

  if (matchingHoliday) {
    const isKpm = matchingHoliday.kategori === 'Cuti Tambahan KPM';
    return {
      isWorkingDay: true,
      isSchoolHoliday: false,
      isHoliday: true,
      isPdPDay: false,
      statusLabel: isKpm ? 'Cuti Tambahan KPM' : 'Cuti Umum',
      reason: matchingHoliday.nama,
      holiday: matchingHoliday,
    };
  }

  // Working school day with PdP
  return {
    isWorkingDay: true,
    isSchoolHoliday: false,
    isHoliday: false,
    isPdPDay: true,
    statusLabel: 'Hari Persekolahan',
    reason: 'Hari Persekolahan Berjadual (PdP)',
  };
}

/**
 * Calculate accurate PdP days for an academic week slot (M01 to M44)
 * Crucial: deductions are computed without double-counting overlapping holidays!
 */
export function getSlotPdPDetails(
  slotCode: string,
  holidays: HolidayRecord[] = getAllDefaultHolidays()
): SchoolWeekSlot {
  const slotDef = ACADEMIC_WEEK_DEFINITIONS.find(s => s.code === slotCode);
  if (!slotDef) {
    throw new Error(`Slot ${slotCode} tidak dijumpai.`);
  }

  const days: {
    date: string;
    dayOfWeek: number;
    isPdP: boolean;
    holidayReason?: string;
  }[] = [];

  const start = new Date(slotDef.startDate + 'T00:00:00');
  const end = new Date(slotDef.endDate + 'T00:00:00');
  
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Isnin hingga Jumaat
      const dayStatus = getDayStatus(dateStr, holidays);
      days.push({
        date: dateStr,
        dayOfWeek,
        isPdP: dayStatus.isPdPDay,
        holidayReason: dayStatus.reason,
      });
    }

    current.setDate(current.getDate() + 1);
  }

  const totalPdPDays = days.filter(d => d.isPdP).length;
  const startMonth = new Date(slotDef.startDate).getMonth() + 1;

  return {
    code: slotDef.code,
    label: `Minggu ${slotDef.code.replace('M', '')}`,
    startDate: slotDef.startDate,
    endDate: slotDef.endDate,
    month: startMonth,
    days,
    totalPdPDays,
    pdpStatusNote: totalPdPDays === 0 ? 'Tiada hari PdP' : undefined,
  };
}

/**
 * Intelligent Conflict Detection Engine
 * Checks: Masa, Tempat, Penyelaras, Kumpulan Sasaran, and Cuti/Hujung Minggu warnings
 */
export function detectConflicts(
  newEntry: Partial<TakwimEntry>,
  existingEntries: TakwimEntry[],
  holidays: HolidayRecord[] = getAllDefaultHolidays()
): ConflictDetectionResult {
  const conflicts: ConflictDetectionResult['conflicts'] = [];

  if (!newEntry.tarikhMula) {
    return { hasConflict: false, conflicts: [] };
  }

  const newStart = newEntry.tarikhMula;
  const newEnd = newEntry.tarikhAkhir || newStart;

  // 1. Check if dates fall on Holiday / Weekend for staff or pupils
  const targetArray = newEntry.sasaran || [];
  const isMuridTarget = targetArray.some(s => 
    s.toLowerCase().includes('murid') || 
    s.toLowerCase().includes('tahun') || 
    s.toLowerCase().includes('prasekolah') ||
    s.toLowerCase().includes('ppki')
  );

  // Check each day in range
  const cur = new Date(newStart + 'T00:00:00');
  const stop = new Date(newEnd + 'T00:00:00');
  while (cur <= stop) {
    const dStr = cur.toISOString().split('T')[0];
    const status = getDayStatus(dStr, holidays);
    
    if (status.isHoliday || !status.isWorkingDay || status.isSchoolHoliday) {
      if (isMuridTarget) {
        conflicts.push({
          type: 'Cuti/Hujung Minggu',
          description: `Tarikh ${dStr} ialah ${status.statusLabel} (${status.reason || ''}). Aktiviti murid tidak dibenarkan semasa cuti tanpa kelulusan khas pentadbir.`,
        });
      } else {
        // Staff meeting warning
        conflicts.push({
          type: 'Cuti/Hujung Minggu',
          description: `Tarikh ${dStr} jatuh pada ${status.statusLabel} (${status.reason || ''}). Memerlukan pengesahan pentadbir berserta justifikasi.`,
        });
      }
    }
    cur.setDate(cur.getDate() + 1);
  }

  // 2. Cross-check against other scheduled entries
  const validEntries = existingEntries.filter(
    e => !e.isDeleted && e.id !== newEntry.id && e.statusKelulusan !== 'Ditolak'
  );

  for (const existing of validEntries) {
    // Check Date Range Overlap
    const exStart = existing.tarikhMula;
    const exEnd = existing.tarikhAkhir || exStart;

    const datesOverlap = (newStart <= exEnd && newEnd >= exStart);
    if (!datesOverlap) continue;

    // Check Time Overlap
    let timesOverlap = true;
    if (!newEntry.sepanjangHari && !existing.sepanjangHari) {
      const nStart = newEntry.masaMula || '08:00';
      const nEnd = newEntry.masaAkhir || '17:00';
      const eStart = existing.masaMula || '08:00';
      const eEnd = existing.masaAkhir || '17:00';

      timesOverlap = (nStart < eEnd && nEnd > eStart);
    }

    if (!timesOverlap) continue;

    // Check Venue Conflict
    if (
      newEntry.tempat &&
      existing.tempat &&
      newEntry.tempat.trim().toLowerCase() === existing.tempat.trim().toLowerCase() &&
      newEntry.tempat.trim().toLowerCase() !== 'luar sekolah'
    ) {
      conflicts.push({
        type: 'Tempat',
        description: `Pertindihan TEMPAT di "${existing.tempat}" dengan program "${existing.tajuk}" pada ${existing.tarikhMula} (${existing.masaMula}-${existing.masaAkhir}).`,
        conflictingEntry: {
          id: existing.id,
          tajuk: existing.tajuk,
          tarikh: existing.tarikhMula,
          masa: `${existing.masaMula} - ${existing.masaAkhir}`,
          tempat: existing.tempat,
          penyelaras: existing.penyelaras,
          sasaran: existing.sasaran || [],
        },
      });
    }

    // Check Coordinator Conflict
    if (
      newEntry.penyelaras &&
      existing.penyelaras &&
      newEntry.penyelaras.trim().toLowerCase() === existing.penyelaras.trim().toLowerCase()
    ) {
      conflicts.push({
        type: 'Penyelaras',
        description: `Pertindihan PENYELARAS (${existing.penyelaras}) dengan program "${existing.tajuk}" pada tarikh dan masa yang sama.`,
        conflictingEntry: {
          id: existing.id,
          tajuk: existing.tajuk,
          tarikh: existing.tarikhMula,
          masa: `${existing.masaMula} - ${existing.masaAkhir}`,
          tempat: existing.tempat,
          penyelaras: existing.penyelaras,
          sasaran: existing.sasaran || [],
        },
      });
    }

    // Check Target Group Overlap
    const overlapSasaran = (newEntry.sasaran || []).filter(s => 
      (existing.sasaran || []).includes(s)
    );
    if (overlapSasaran.length > 0) {
      conflicts.push({
        type: 'Kumpulan Sasaran',
        description: `Pertindihan SASARAN [${overlapSasaran.join(', ')}] dengan program "${existing.tajuk}" pada tarikh dan masa yang sama.`,
        conflictingEntry: {
          id: existing.id,
          tajuk: existing.tajuk,
          tarikh: existing.tarikhMula,
          masa: `${existing.masaMula} - ${existing.masaAkhir}`,
          tempat: existing.tempat,
          penyelaras: existing.penyelaras,
          sasaran: existing.sasaran || [],
        },
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}
