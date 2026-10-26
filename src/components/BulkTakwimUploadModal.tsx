import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { TakwimEntry, BidangType, SchoolSettings } from '../types/takwim';
import { getAcademicWeekForDate, MONTH_NAMES_MS } from '../constants/calendar2027';
import { api } from '../services/api';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Filter, 
  Layers, 
  Trash2,
  Calendar,
  FileText
} from 'lucide-react';

interface BulkTakwimUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  settings?: SchoolSettings;
}

interface ParsedBulkItem {
  id: string;
  tarikhMula: string;
  tarikhAkhir: string;
  tajuk: string;
  bidangUtama: BidangType;
  unitUtama: string;
  masaMula: string;
  masaAkhir: string;
  tempat: string;
  penyelaras: string;
  catatan: string;
  isWeekend: boolean;
  isValid: boolean;
  validationError?: string;
}

export const BulkTakwimUploadModal: React.FC<BulkTakwimUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText] = useState('');
  const [parsedList, setParsedList] = useState<ParsedBulkItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMode, setUploadMode] = useState<'replace' | 'append'>('replace');
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Map arbitrary text to standard BidangType
  const normalizeBidang = (str: string): BidangType => {
    const s = (str || '').toLowerCase();
    if (s.includes('kurikulum') || s.includes('akademik') || s.includes('pbd') || s.includes('peperiksaan')) {
      return 'Kurikulum';
    }
    if (s.includes('hem') || s.includes('hal ehwal') || s.includes('disiplin') || s.includes('spbt') || s.includes('bimbingan')) {
      return 'Hal Ehwal Murid';
    }
    if (s.includes('koko') || s.includes('kokurikulum') || s.includes('sukan') || s.includes('kelab') || s.includes('uniform') || s.includes('1m1s')) {
      return 'Kokurikulum';
    }
    if (s.includes('panitia')) {
      return 'Panitia Mata Pelajaran';
    }
    return 'Pengurusan dan Staf';
  };

  // Normalize date string into YYYY-MM-DD
  const normalizeDate = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'number') {
      // Excel serial date number
      try {
        const dateObj = XLSX.SSF.parse_date_code(val);
        if (dateObj) {
          const y = dateObj.y || 2027;
          const m = String(dateObj.m).padStart(2, '0');
          const d = String(dateObj.d).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      } catch {
        // pass
      }
    }
    const str = String(val).trim();
    // Match YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
    }
    // Match DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmyMatch) {
      return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    }
    return '';
  };

  // Parse raw 2D array of rows
  const parseRows = (rows: any[][]) => {
    if (!rows || rows.length === 0) {
      setStatusMsg({ text: 'Fail atau teks tidak mengandungi data.', type: 'error' });
      return;
    }

    // Try finding header row index
    let headerIdx = -1;
    let colMap: { [key: string]: number } = {};

    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const row = rows[i].map(c => String(c).toLowerCase());
      const hasDate = row.some(c => c.includes('tarikh') || c.includes('date'));
      const hasTitle = row.some(c => c.includes('tajuk') || c.includes('program') || c.includes('aktiviti'));
      if (hasDate && hasTitle) {
        headerIdx = i;
        row.forEach((cell, idx) => {
          if (cell.includes('tarikh mula') || cell === 'tarikh' || cell === 'tarikh_mula' || cell.includes('mula')) {
            if (colMap['tarikhMula'] === undefined) colMap['tarikhMula'] = idx;
          }
          if (cell.includes('tarikh akhir') || cell === 'tarikh_akhir' || cell.includes('hingga') || cell.includes('akhir')) {
            if (colMap['tarikhAkhir'] === undefined) colMap['tarikhAkhir'] = idx;
          }
          if (cell.includes('tajuk') || cell.includes('program') || cell.includes('aktiviti') || cell.includes('nama program')) {
            if (colMap['tajuk'] === undefined) colMap['tajuk'] = idx;
          }
          if (cell.includes('bidang') || cell.includes('kategori')) {
            if (colMap['bidang'] === undefined) colMap['bidang'] = idx;
          }
          if (cell.includes('unit') || cell.includes('panitia') || cell.includes('bahagian')) {
            if (colMap['unit'] === undefined) colMap['unit'] = idx;
          }
          if (cell.includes('masa mula') || cell === 'masa' || cell.includes('waktu')) {
            if (colMap['masaMula'] === undefined) colMap['masaMula'] = idx;
          }
          if (cell.includes('masa akhir')) {
            if (colMap['masaAkhir'] === undefined) colMap['masaAkhir'] = idx;
          }
          if (cell.includes('tempat') || cell.includes('lokasi')) {
            if (colMap['tempat'] === undefined) colMap['tempat'] = idx;
          }
          if (cell.includes('penyelaras') || cell.includes('guru') || cell.includes('tindakan')) {
            if (colMap['penyelaras'] === undefined) colMap['penyelaras'] = idx;
          }
          if (cell.includes('catatan') || cell.includes('nota')) {
            if (colMap['catatan'] === undefined) colMap['catatan'] = idx;
          }
        });
        break;
      }
    }

    const dataStartIdx = headerIdx !== -1 ? headerIdx + 1 : 0;
    const items: ParsedBulkItem[] = [];

    for (let r = dataStartIdx; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0 || row.every(c => c === '' || c === null || c === undefined)) continue;

      let rawDateMula = headerIdx !== -1 && colMap['tarikhMula'] !== undefined ? row[colMap['tarikhMula']] : row[0];
      let rawDateAkhir = headerIdx !== -1 && colMap['tarikhAkhir'] !== undefined ? row[colMap['tarikhAkhir']] : row[1];
      let rawTajuk = headerIdx !== -1 && colMap['tajuk'] !== undefined ? row[colMap['tajuk']] : (row[2] || row[1]);
      let rawBidang = headerIdx !== -1 && colMap['bidang'] !== undefined ? row[colMap['bidang']] : (row[3] || '');
      let rawUnit = headerIdx !== -1 && colMap['unit'] !== undefined ? row[colMap['unit']] : (row[4] || '');
      let rawMasaMula = headerIdx !== -1 && colMap['masaMula'] !== undefined ? row[colMap['masaMula']] : '08:00';
      let rawMasaAkhir = headerIdx !== -1 && colMap['masaAkhir'] !== undefined ? row[colMap['masaAkhir']] : '13:00';
      let rawTempat = headerIdx !== -1 && colMap['tempat'] !== undefined ? row[colMap['tempat']] : 'SK Tudan, Miri';
      let rawPenyelaras = headerIdx !== -1 && colMap['penyelaras'] !== undefined ? row[colMap['penyelaras']] : '';
      let rawCatatan = headerIdx !== -1 && colMap['catatan'] !== undefined ? row[colMap['catatan']] : '';

      const tarikhMula = normalizeDate(rawDateMula);
      const tarikhAkhir = normalizeDate(rawDateAkhir) || tarikhMula;
      const tajuk = String(rawTajuk || '').trim();

      if (!tajuk) continue;

      let isWeekend = false;
      let isValid = true;
      let validationError = '';

      if (!tarikhMula) {
        isValid = false;
        validationError = 'Tarikh mula tidak sah';
      } else {
        const dObj = new Date(tarikhMula + 'T00:00:00');
        const dayOfWeek = dObj.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          isWeekend = true;
        }
      }

      items.push({
        id: `bulk-${Date.now()}-${r}-${Math.random().toString(36).substring(2, 6)}`,
        tarikhMula,
        tarikhAkhir,
        tajuk,
        bidangUtama: normalizeBidang(String(rawBidang)),
        unitUtama: String(rawUnit || 'Pentadbiran Sekolah').trim(),
        masaMula: String(rawMasaMula || '08:00').trim().substring(0, 5),
        masaAkhir: String(rawMasaAkhir || '13:00').trim().substring(0, 5),
        tempat: String(rawTempat || 'SK Tudan, Miri').trim(),
        penyelaras: String(rawPenyelaras || 'Penyelaras Program').trim(),
        catatan: String(rawCatatan || '').trim(),
        isWeekend,
        isValid,
        validationError,
      });
    }

    setParsedList(items);
    setStatusMsg({
      text: `Berjaya membaca ${items.length} program dari fail/teks. Sila semak sebelum mengesahkan kemasukan ke takwim.`,
      type: 'success',
    });
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        let rows: any[][] = [];

        if (file.name.endsWith('.json')) {
          const json = JSON.parse(data as string);
          if (Array.isArray(json)) {
            rows = json.map(item => [
              item.tarikhMula || item.tarikh || item.date,
              item.tarikhAkhir || item.tarikhMula || item.tarikh,
              item.tajuk || item.program || item.title,
              item.bidangUtama || item.bidang || item.category,
              item.unitUtama || item.unit,
              item.masaMula || item.masa,
              item.masaAkhir,
              item.tempat || item.location,
              item.penyelaras || item.coordinator,
              item.catatan || item.notes,
            ]);
            // Prepend synthetic header
            rows.unshift(['Tarikh Mula', 'Tarikh Akhir', 'Tajuk', 'Bidang', 'Unit', 'Masa Mula', 'Masa Akhir', 'Tempat', 'Penyelaras', 'Catatan']);
          }
        } else {
          // XLSX, XLS, CSV
          const workbook = XLSX.read(data, { type: 'binary', cellDates: false });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
        }

        parseRows(rows);
      } catch (err: any) {
        setStatusMsg({ text: `Ralat semasa memproses fail: ${err.message}`, type: 'error' });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setStatusMsg({ text: 'Gagal membaca fail yang dimuat naik.', type: 'error' });
      setIsProcessing(false);
    };

    if (file.name.endsWith('.json') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // Handle pasted text parsing
  const handleParsePastedText = () => {
    if (!rawText.trim()) {
      setStatusMsg({ text: 'Sila masukkan teks jadual program terlebih dahulu.', type: 'error' });
      return;
    }

    try {
      // Check if JSON
      if (rawText.trim().startsWith('[') || rawText.trim().startsWith('{')) {
        try {
          const json = JSON.parse(rawText.trim());
          const arr = Array.isArray(json) ? json : [json];
          const rows = arr.map(item => [
            item.tarikhMula || item.tarikh,
            item.tarikhAkhir || item.tarikhMula,
            item.tajuk || item.program,
            item.bidangUtama || item.bidang,
            item.unitUtama || item.unit,
            item.masaMula || '08:00',
            item.masaAkhir || '13:00',
            item.tempat,
            item.penyelaras,
            item.catatan,
          ]);
          rows.unshift(['Tarikh Mula', 'Tarikh Akhir', 'Tajuk', 'Bidang', 'Unit', 'Masa Mula', 'Masa Akhir', 'Tempat', 'Penyelaras', 'Catatan']);
          parseRows(rows);
          return;
        } catch {
          // Not json, continue with delimiter parse
        }
      }

      // Line by line
      const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
      const rows = lines.map(line => {
        if (line.includes('\t')) return line.split('\t');
        if (line.includes(';')) return line.split(';');
        if (line.includes(',')) return line.split(',');
        return line.split(/\s{2,}/); // 2 or more spaces
      });

      parseRows(rows);
    } catch (err: any) {
      setStatusMsg({ text: `Ralat parsing teks: ${err.message}`, type: 'error' });
    }
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Tarikh Mula': '2027-01-08',
        'Tarikh Akhir': '2027-01-08',
        'Tajuk Program': 'Mesyuarat Kurikulum Bil. 1/2027',
        'Bidang Utama': 'Kurikulum',
        'Unit': 'Pengurusan Kurikulum',
        'Masa Mula': '08:00',
        'Masa Akhir': '12:30',
        'Tempat': 'Bilik Gerakan SK Tudan',
        'Penyelaras': 'En. Awangku Azman (PK 1)',
        'Catatan': 'Kehadiran wajib semua guru'
      },
      {
        'Tarikh Mula': '2027-01-15',
        'Tarikh Akhir': '2027-01-15',
        'Tajuk Program': 'Gotong-Royong Perdana Sekolah Sejahtera',
        'Bidang Utama': 'Hal Ehwal Murid',
        'Unit': '3K (Kebersihan)',
        'Masa Mula': '07:30',
        'Masa Akhir': '11:30',
        'Tempat': 'Kawasan Sekolah SK Tudan',
        'Penyelaras': 'Pn. Dayang Norliza (PK HEM)',
        'Catatan': 'Bersama PIBG dan komuniti'
      },
      {
        'Tarikh Mula': '2027-01-20',
        'Tarikh Akhir': '2027-01-20',
        'Tajuk Program': 'Latihan Rumah Sukan & Merentas Desa',
        'Bidang Utama': 'Kokurikulum',
        'Unit': 'Sukan & Permainan',
        'Masa Mula': '15:00',
        'Masa Akhir': '17:00',
        'Tempat': 'Padang SK Tudan',
        'Penyelaras': 'En. Mohamad Rizal (PK KK)',
        'Catatan': 'Pakaian sukan lengkap'
      },
      {
        'Tarikh Mula': '2027-02-05',
        'Tarikh Akhir': '2027-02-05',
        'Tajuk Program': 'PLC & Bengkel DSKP Bahasa Melayu',
        'Bidang Utama': 'Panitia Mata Pelajaran',
        'Unit': 'Panitia Bahasa Melayu',
        'Masa Mula': '14:00',
        'Masa Akhir': '16:00',
        'Tempat': 'Pusat Sumber Sekolah',
        'Penyelaras': 'Ketua Panitia BM',
        'Catatan': 'Semua guru opsyen BM'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Takwim_Template');
    XLSX.writeFile(wb, 'Templat_Muat_Naik_Takwim_SK_Tudan_2027.xlsx');
  };

  // Submit to Server
  const handleSaveToTakwim = async () => {
    if (parsedList.length === 0) {
      setStatusMsg({ text: 'Tiada program untuk dimuat naik.', type: 'error' });
      return;
    }

    // Filter valid
    let toSubmit = parsedList.filter(item => item.isValid);
    if (excludeWeekends) {
      toSubmit = toSubmit.filter(item => !item.isWeekend);
    }

    if (toSubmit.length === 0) {
      setStatusMsg({
        text: 'Tiada program yang memenuhi syarat (semua rekod tidak sah atau jatuh pada hujung minggu yang dikecualikan).',
        type: 'error',
      });
      return;
    }

    setIsProcessing(true);
    setStatusMsg(null);

    try {
      const payloadEntries: Partial<TakwimEntry>[] = toSubmit.map(p => ({
        id: p.id,
        tarikhMula: p.tarikhMula,
        tarikhAkhir: p.tarikhAkhir,
        tajuk: p.tajuk,
        bidangUtama: p.bidangUtama,
        unitUtama: p.unitUtama,
        masaMula: p.masaMula,
        masaAkhir: p.masaAkhir,
        tempat: p.tempat,
        penyelaras: p.penyelaras,
        catatan: p.catatan,
        statusKelulusan: 'Diluluskan',
        statusPelaksanaan: 'Belum Bermula',
        tahun: 2027,
      }));

      const res = await api.bulkUploadEntries({
        entries: payloadEntries,
        mode: uploadMode,
        excludeWeekends,
      });

      onSuccess(toSubmit.length);
      onClose();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Gagal memuat naik takwim pukal', type: 'error' });
      setIsProcessing(false);
    }
  };

  const filteredPreview = parsedList.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.tajuk.toLowerCase().includes(q) ||
      item.tarikhMula.includes(q) ||
      item.bidangUtama.toLowerCase().includes(q) ||
      item.unitUtama.toLowerCase().includes(q) ||
      item.penyelaras.toLowerCase().includes(q)
    );
  });

  const validCount = parsedList.filter(i => i.isValid && (!excludeWeekends || !i.isWeekend)).length;
  const weekendCount = parsedList.filter(i => i.isWeekend).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Muat Naik Takwim Keseluruhan Secara Pukal</span>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                  SK Tudan 2027
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Sokongan fail Excel (.xlsx, .xls), CSV, JSON, atau tampal terus jadual program teks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              title="Muat turun templat fail Excel rasmi"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Templat Excel</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab & Status Message */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Mode Tabs: Fail vs Teks */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Muat Naik Fail (Excel / CSV / JSON)</span>
            </button>

            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tampal Teks / Salinan Jadual</span>
            </button>
          </div>

          {activeTab === 'upload' ? (
            /* Upload Zone */
            <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 rounded-2xl p-6 text-center transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Pilih atau Tarik Fail Takwim ke Sini
              </h3>
              <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
                Menyokong fail lembaran kerja Excel (.xlsx, .xls), CSV, atau JSON. Sistem akan mengekstrak tajuk, tarikh, bidang, unit, dan masa secara pintar.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all inline-flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Fail...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Pilih Fail Dari Komputer / Peranti</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Paste Zone */
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Tampal Teks Jadual (Daripada Excel, Word, atau Format Teks Tab/Comma):
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Contoh salinan lajur: Tarikh Mula [TAB] Tarikh Akhir [TAB] Tajuk Program [TAB] Bidang [TAB] Penyelaras..."
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Proses Teks & Jana Senarai Program</span>
                </button>
              </div>
            </div>
          )}

          {/* Import Configuration Options */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-800 block mb-1">
                Ketetapan Hujung Minggu (Sabtu & Ahad):
              </span>
              <label className="flex items-start gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={excludeWeekends}
                  onChange={(e) => setExcludeWeekends(e.target.checked)}
                  className="mt-0.5 rounded-sm text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-bold text-purple-900">
                    Kecualikan Hari Sabtu & Ahad (Biarkan Kosong)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Sebarang aktiviti pada hari Sabtu dan Ahad dibiarkan kosong dahulu. Jika ada nanti pihak berkenaan akan mendaftar sendiri.
                  </p>
                </div>
              </label>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">
                Mod Kemasukan Takwim:
              </span>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="replace"
                    checked={uploadMode === 'replace'}
                    onChange={() => setUploadMode('replace')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>
                    <strong>Gantikan Keseluruhan Takwim</strong> (Kemasukan bersih / Fresh Reset)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="append"
                    checked={uploadMode === 'append'}
                    onChange={() => setUploadMode('append')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>
                    <strong>Gabungkan Bersama Takwim Sedia Ada</strong> (Tambah rekod baharu)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Parsed Results Section */}
          {parsedList.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-slate-900">
                    Jumlah Dibaca: <span className="text-purple-700">{parsedList.length}</span> program
                  </span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Sedia Dimuat Naik: {validCount}
                  </span>
                  {excludeWeekends && weekendCount > 0 && (
                    <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Dikecualikan (Sabtu/Ahad): {weekendCount}
                    </span>
                  )}
                </div>

                <div className="w-56">
                  <input
                    type="text"
                    placeholder="Tapis pratonton program..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 text-[11px] sticky top-0 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-2 px-3">Tarikh</th>
                      <th className="py-2 px-3">Program / Aktiviti</th>
                      <th className="py-2 px-3">Bidang</th>
                      <th className="py-2 px-3">Unit</th>
                      <th className="py-2 px-3">Waktu</th>
                      <th className="py-2 px-3">Penyelaras</th>
                      <th className="py-2 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPreview.map((item, idx) => {
                      const isExcluded = excludeWeekends && item.isWeekend;
                      return (
                        <tr
                          key={item.id || idx}
                          className={`hover:bg-slate-50 transition-colors ${
                            isExcluded ? 'opacity-40 bg-amber-50/30' : ''
                          }`}
                        >
                          <td className="py-1.5 px-3 font-mono font-semibold whitespace-nowrap">
                            {item.tarikhMula}
                            {item.isWeekend && (
                              <span className="ml-1 text-[10px] text-amber-600 font-bold block">
                                (Hujung Minggu)
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-3 font-medium text-slate-900">
                            {item.tajuk}
                          </td>
                          <td className="py-1.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {item.bidangUtama}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-slate-600">
                            {item.unitUtama}
                          </td>
                          <td className="py-1.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                            {item.masaMula} - {item.masaAkhir}
                          </td>
                          <td className="py-1.5 px-3 text-slate-700">
                            {item.penyelaras || '-'}
                          </td>
                          <td className="py-1.5 px-2 text-center whitespace-nowrap">
                            {isExcluded ? (
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded-md">
                                Dikecualikan
                              </span>
                            ) : item.isValid ? (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                Sah
                              </span>
                            ) : (
                              <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-1.5 py-0.5 rounded-md">
                                {item.validationError || 'Ralat'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {parsedList.length > 0 ? (
              <span>
                <strong>{validCount} program</strong> akan disimpan ke dalam pangkalan data sekolah (Kumpulan B).
              </span>
            ) : (
              <span>Muat naik fail takwim atau tampal jadual untuk memulakan pengekstrakan.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleSaveToTakwim}
              className={`px-5 py-2 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                validCount > 0 && !isProcessing
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Takwim...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sahkan & Muat Naik ke Takwim ({validCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
