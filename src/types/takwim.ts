export type BidangType = 
  | 'Kurikulum' 
  | 'Pengurusan dan Staf' 
  | 'Hal Ehwal Murid' 
  | 'Kokurikulum' 
  | 'Panitia Mata Pelajaran';

export type JenisPengisian = 
  | 'Aktiviti' 
  | 'Program' 
  | 'Mesyuarat' 
  | 'Pelaksanaan Berkala';

export type KelulusanStatus = 
  | 'Draf' 
  | 'Dihantar' 
  | 'Perlu Pindaan' 
  | 'Diluluskan' 
  | 'Ditolak';

export type PelaksanaanStatus = 
  | 'Belum Bermula' 
  | 'Sedang Dilaksanakan' 
  | 'Selesai' 
  | 'Ditangguhkan' 
  | 'Dibatalkan';

export type UserRole = 
  | 'Pentadbir' 
  | 'Penyelaras Bidang' 
  | 'Ketua Panitia' 
  | 'Guru' 
  | 'Pembaca';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  jawatan: string;
  bidangAssigned?: string[];
  panitiaAssigned?: string[];
}

export type HolidayCategory = 
  | 'Cuti Penggal Persekolahan'
  | 'Cuti Tambahan KPM' 
  | 'Cuti Umum Persekutuan' 
  | 'Cuti Umum Sarawak' 
  | 'Cuti Gantian';

export type VerificationStatus = 'Disahkan' | 'Belum Disahkan';

export interface HolidayRecord {
  id: string;
  nama: string;
  tarikhMula: string; // YYYY-MM-DD
  tarikhAkhir: string; // YYYY-MM-DD
  negeri: string; // Sarawak / Persekutuan
  kategori: HolidayCategory;
  sumber: string; // e.g. "Lampiran B & C Surat Pekeliling Ikhtisas KPM Bil. 3/2026" / "Warta Kerajaan Sarawak"
  statusPengesahan: VerificationStatus;
  catatan?: string;
}

export interface RevisionRecord {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  details?: string;
}

export interface TakwimEntry {
  id: string;
  tahun: 2027;
  bulan: number; // 1 - 12
  bidangUtama: BidangType;
  unitUtama: string; // e.g. "Bahasa Melayu", "Unit Disiplin & Pengawas", etc.
  unitBersama: string[]; // joint units
  jenisPengisian: JenisPengisian;
  tajuk: string;
  tajukPilihanBank?: string;
  adalahTajukSendiri: boolean;
  bilanganMesyuarat?: string; // e.g. "Bil. 1/2027"
  objektif?: string; // Optional - user requested to remove mandatory requirement
  tarikhMula: string; // YYYY-MM-DD
  tarikhAkhir: string; // YYYY-MM-DD
  masaMula: string; // HH:mm
  masaAkhir: string; // HH:mm
  sepanjangHari: boolean;
  mingguAkademik: string; // e.g. "M01", "M12", "Cuti Penggal", "Pra-Persekolahan"
  mingguRPHSekolah?: string; // Optional custom approved school RPH week
  statusHari: 'Hari Persekolahan' | 'Cuti Penggal Sekolah' | 'Cuti Tambahan KPM' | 'Cuti Umum' | 'Hujung Minggu' | 'Belum Disahkan';
  tempat: string;
  sasaran?: string[]; // Optional
  penyelaras: string;
  ajk?: string;
  anggaranPeserta?: number;
  anggaranKos?: number;
  sumberKewangan?: string;
  catatan?: string;
  lampiran?: string; // URL or file description
  statusKelulusan: KelulusanStatus;
  komenKelulusan?: string;
  diluluskanOleh?: string;
  tarikhKelulusan?: string;
  statusPelaksanaan: PelaksanaanStatus;
  tarikhSebenarPelaksanaan?: string;
  ringkasanHasil?: string;
  laporanPautan?: string;
  
  // Recurring support
  isRecurring?: boolean;
  recurringPattern?: 'Mingguan' | 'Dua Minggu Sekali' | 'Bulanan' | 'Tarikh Terpilih';
  recurringDates?: string[];
  recurringParentId?: string;

  // Conflict management
  hasConflictWarning?: boolean;
  conflictDetails?: string[];
  conflictApproved?: boolean;
  conflictApprovedReason?: string;
  conflictApprovedBy?: string;

  // Metadata & Audit Trail
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
  revisionHistory: RevisionRecord[];
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface PanitiaConfig {
  id: string;
  nama: string;
  kod: string;
  bidang: BidangType;
  jenis: 'Panitia Mata Pelajaran' | 'Unit Sokongan';
  aktif: boolean;
  urutan: number;
  ketua?: string;
}

export interface ConflictDetectionResult {
  hasConflict: boolean;
  conflicts: {
    type: 'Masa' | 'Tempat' | 'Penyelaras' | 'Kumpulan Sasaran' | 'Cuti/Hujung Minggu';
    description: string;
    conflictingEntry?: {
      id: string;
      tajuk: string;
      tarikh: string;
      masa: string;
      tempat: string;
      penyelaras: string;
      sasaran: string[];
    };
  }[];
}

export interface SchoolWeekSlot {
  code: string; // e.g. "M01", "M12"
  label: string; // e.g. "Minggu 01"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  month: number;
  part?: string; // e.g. "M12 bersambung"
  isContinued?: boolean;
  days: {
    date: string;
    dayOfWeek: number; // 1 = Monday, 5 = Friday
    isPdP: boolean;
    holidayReason?: string;
  }[];
  totalPdPDays: number;
  pdpStatusNote?: string; // "Tiada hari PdP" if 0
}

export interface AdminReviewers {
  guruBesar: string;
  pk1: string; // Pentadbiran & Kurikulum
  pkHem: string; // Hal Ehwal Murid
  pkKk: string; // Kokurikulum
  pkPetang: string; // Penyelia Petang
}

export interface WeeklyCivicActivity {
  minggu: number; // 1 - 4/5
  tajukAktiviti: string;
  subNilai: string;
  cadanganAktiviti5Minit: string;
  fokusSasaran?: string;
}

export interface CivicValueRecord {
  month: number; // 1 - 12
  coreValue: string; // Kasih Sayang, Hormat-menghormati, Bertanggungjawab, Kegembiraan
  subTheme: string;
  note?: string;
  weeklyActivities?: WeeklyCivicActivity[];
}

export interface SalaryRecord {
  month: number; // 1 - 12
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. Isnin, Selasa, etc.
  note?: string;
}

export interface ExtractedProgramRecord {
  id: string;
  tajuk: string;
  bidang: BidangType;
  unit?: string;
  bulan?: number;
  source?: string;
}

export interface SchoolSettings {
  schoolName: string;
  schoolCode: string;
  schoolLogo: string; // Base64 data URL or SVG
  schoolPhone?: string;
  schoolEmail?: string;
  adminReviewers: AdminReviewers;
  teachersList: string[];
  civicValues: CivicValueRecord[];
  salaryDates: SalaryRecord[];
  extractedPrograms: ExtractedProgramRecord[];
}

