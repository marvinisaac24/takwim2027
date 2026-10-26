import { BidangType } from './takwim';

export type PLCToolType = 
  | 'Lesson Study'
  | 'Peer Coaching'
  | 'Learning Walk'
  | 'Teacher Sharing Sessions'
  | 'Video Critique'
  | 'Data Analysis'
  | 'Book Club'
  | 'Curriculum Mapping'
  | 'Item Construction';

export interface PLCActivityItem {
  id: string;
  panitia: string; // e.g. "Bahasa Melayu", "Bahasa Inggeris", "Matematik"
  alatPLC: PLCToolType;
  tajukAktiviti: string;
  objektif: string;
  fokusPedagogi: string; // e.g. "Pembezaan (Differentiated Learning), KBAT, PBD"
  cadanganMasa: string; // e.g. "01:30 pm - 03:00 pm"
  cadanganTempat: string;
  cadanganBulan: number[]; // 1 - 12
  tindakan: string; // e.g. "Ketua Panitia & Guru Kanan"
  alatToolkit: string[]; // e.g. ["Toolkit 1: Borang Pemerhatian", "Toolkit 2: RPH Kolaboratif"]
  evidens: string; // e.g. "Laporan PLC, Gambar Aktiviti, RPH Terpinda"
}

export interface PLCUploadedKit {
  id: string;
  fileName: string;
  fileType: string;
  fileSize?: string;
  panitia: string;
  uploadedAt: string;
  uploadedBy: string;
  tajukKit: string;
  alatPLC: PLCToolType[];
  penerangan: string;
  dokumenData?: string;
}

export type SKASStandardId = 
  | 'Standard 1'
  | 'Standard 2'
  | 'Standard 3.1'
  | 'Standard 3.2'
  | 'Standard 3.3'
  | 'Standard 4';

export interface SKASTUMSItem {
  id: string;
  standardId: SKASStandardId;
  aspekKod: string; // e.g. "3.1.2.2"
  aspekNama: string; // e.g. "Peningkatan Kualiti Pengajaran Guru"
  tindakanPGB: string; // Deskripsi tindakan KPM
  tahapTindakan: string; // Tahap 1 - 4
  evidensDiperlukan: string[]; // Bukti pelaksanaan wajib (Fail panitia, Minit mesyuarat, Laporan)
  bidangTakwim: BidangType; // Bidang dalam takwim
  unitCadangan: string; // Unit yang bertanggungjawab
  cadanganTajukProgram: string; // Program berimpak tinggi yang dicadangkan
  objektifProgram: string;
  cadanganBulan: number[];
  cadanganTempat: string;
  penyelarasCadangan: string;
  skorLalai?: number; // 1 - 4
  statusLalai?: 'Cemerlang' | 'Baik' | 'Sederhana' | 'Perlu Intervensi';
}

export interface SKASEvaluationScore {
  aspekKod: string;
  skor: number; // 1 - 4
  status: 'Cemerlang' | 'Baik' | 'Sederhana' | 'Perlu Intervensi';
  catatanPenilai?: string;
  tarikhPenilaian?: string;
}

export interface SKASUploadedInstrument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  tahun: number;
  totalItemsScored: number;
  skorPurata: number;
}
