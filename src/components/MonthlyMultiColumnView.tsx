import React, { useState, useMemo } from 'react';
import { TakwimEntry, HolidayRecord, BidangType, PanitiaConfig, SchoolSettings } from '../types/takwim';
import { MONTH_NAMES_MS, DAY_NAMES_MS, getAcademicWeekForDate, getDayStatus } from '../constants/calendar2027';
import { ProgramSuggestion } from '../constants/bankProgram';
import { 
  printTakwimDocument, 
  downloadPrintableHTML, 
  exportMultiColumnExcel,
  downloadMonthlyTakwimPDF,
  downloadYearlyTakwimPDF,
  downloadPanitiaTakwimPDF,
  downloadBidangTakwimPDF
} from '../utils/exportUtils';
import { ProgramBankModal } from './ProgramBankModal';
import { TakwimPrintModal } from './TakwimPrintModal';
import { 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Users, 
  HeartHandshake, 
  Type, 
  GraduationCap, 
  Award,
  Download,
  Upload,
  Layers,
  Check
} from 'lucide-react';

interface MonthlyMultiColumnViewProps {
  entries: TakwimEntry[];
  holidays: HolidayRecord[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
  onViewEntry: (entry: TakwimEntry) => void;
  onEditEntry: (entry: TakwimEntry) => void;
  onDeleteEntry?: (id: string) => void;
  onOpenCreateModal: (initialDate?: string, initialBidang?: BidangType, initialSuggestion?: ProgramSuggestion, initialUnit?: string) => void;
  onGenerateTuesdayAssemblies?: () => void;
  panitiaList?: PanitiaConfig[];
  settings?: SchoolSettings;
  onOpenCivicModal?: () => void;
  onOpenBulkUploadModal?: () => void;
  onOpenPLCKitModal?: (initialPanitia?: string) => void;
  onOpenSKASModal?: () => void;
}

export const MonthlyMultiColumnView: React.FC<MonthlyMultiColumnViewProps> = ({
  entries,
  holidays,
  selectedMonth,
  onSelectMonth,
  onViewEntry,
  onEditEntry,
  onDeleteEntry,
  onOpenCreateModal,
  onGenerateTuesdayAssemblies,
  panitiaList = [],
  settings,
  onOpenCivicModal,
  onOpenBulkUploadModal,
  onOpenPLCKitModal,
  onOpenSKASModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPanitiaFilter, setSelectedPanitiaFilter] = useState<string>('Semua');
  const [activeBidangTab, setActiveBidangTab] = useState<BidangType | 'Semua'>('Semua');
  const [activePanitiaTab, setActivePanitiaTab] = useState<string>('Bahasa Melayu');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TakwimEntry | null>(null);
  const [bankTargetDate, setBankTargetDate] = useState<string | undefined>(undefined);
  const [bankTargetBidang, setBankTargetBidang] = useState<BidangType | 'Semua'>('Semua');
  const [bankTargetPanitia, setBankTargetPanitia] = useState<string | undefined>(undefined);

  // Font size scale: Standard, Besar, Sangat Besar
  const [fontSizeMode, setFontSizeMode] = useState<'standard' | 'besar' | 'terbesar'>('besar');

  const year = 2027;
  const monthName = MONTH_NAMES_MS[selectedMonth - 1];

  // Civic value for current month
  const currentCivicValue = useMemo(() => {
    return settings?.civicValues?.find(c => c.month === selectedMonth);
  }, [settings, selectedMonth]);

  // Salary date for current month
  const currentSalaryDate = useMemo(() => {
    return settings?.salaryDates?.find(s => s.month === selectedMonth);
  }, [settings, selectedMonth]);

  // Compute all calendar days in this month (1 to 28/30/31)
  const daysInMonth = useMemo(() => {
    const totalDays = new Date(year, selectedMonth, 0).getDate();
    const days: {
      dateStr: string;
      dayNum: number;
      dayOfWeek: number;
      dayName: string;
      isTuesday: boolean;
      weekInfo: ReturnType<typeof getAcademicWeekForDate>;
      statusInfo: ReturnType<typeof getDayStatus>;
      isSalaryDay: boolean;
    }[] = [];

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();
      const isTuesday = dayOfWeek === 2; // 2 = Tuesday
      const weekInfo = getAcademicWeekForDate(dateStr);
      const statusInfo = getDayStatus(dateStr, holidays);
      const isSalaryDay = currentSalaryDate ? currentSalaryDate.date === dateStr : false;

      days.push({
        dateStr,
        dayNum: d,
        dayOfWeek,
        dayName: DAY_NAMES_MS[dayOfWeek],
        isTuesday,
        weekInfo,
        statusInfo,
        isSalaryDay,
      });
    }
    return days;
  }, [selectedMonth, holidays, currentSalaryDate]);

  // Map entries by date and bidang
  const entriesByDateAndBidang = useMemo(() => {
    const map = new Map<string, { [key in BidangType]?: TakwimEntry[] }>();

    for (const e of entries) {
      if (e.isDeleted) continue;
      const start = e.tarikhMula;
      const end = e.tarikhAkhir || start;

      // Match each day in range
      for (const day of daysInMonth) {
        if (day.dateStr >= start && day.dateStr <= end) {
          if (!map.has(day.dateStr)) {
            map.set(day.dateStr, {});
          }
          const dayObj = map.get(day.dateStr)!;
          if (!dayObj[e.bidangUtama]) {
            dayObj[e.bidangUtama] = [];
          }
          dayObj[e.bidangUtama]!.push(e);
        }
      }
    }
    return map;
  }, [entries, daysInMonth]);

  // Filter days by search query and committee focus if any
  const filteredDays = useMemo(() => {
    let result = daysInMonth;

    if (isFocusMode && activeBidangTab !== 'Semua') {
      result = result.filter((d) => {
        // Keep salary day and tuesdays if pdp day
        if (d.isSalaryDay || (d.isTuesday && d.statusInfo.isPdPDay)) return true;
        const dayEvents = entriesByDateAndBidang.get(d.dateStr);
        if (!dayEvents) return false;

        if (activeBidangTab === 'Panitia Mata Pelajaran') {
          const pList = dayEvents['Panitia Mata Pelajaran'] || [];
          return pList.some(
            (e) =>
              e.unitUtama.toLowerCase().includes(activePanitiaTab.toLowerCase()) ||
              e.tajuk.toLowerCase().includes(activePanitiaTab.toLowerCase())
          );
        } else {
          const bList = dayEvents[activeBidangTab] || [];
          return bList.length > 0;
        }
      });
    }

    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();

    return result.filter((d) => {
      if (d.dayName.toLowerCase().includes(q) || d.dateStr.includes(q)) return true;
      if (d.statusInfo.reason && d.statusInfo.reason.toLowerCase().includes(q)) return true;
      if (d.weekInfo.code.toLowerCase().includes(q)) return true;

      const dayEvents = entriesByDateAndBidang.get(d.dateStr);
      if (dayEvents) {
        for (const list of Object.values(dayEvents)) {
          for (const item of list || []) {
            if (
              item.tajuk.toLowerCase().includes(q) ||
              item.unitUtama.toLowerCase().includes(q) ||
              item.penyelaras.toLowerCase().includes(q)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    });
  }, [daysInMonth, searchQuery, entriesByDateAndBidang, isFocusMode, activeBidangTab, activePanitiaTab]);

  // Compute list of all available panitia names
  const allPanitias = useMemo(() => {
    if (panitiaList && panitiaList.length > 0) {
      return panitiaList.filter(p => p.aktif !== false).map(p => p.nama);
    }
    return [
      'Bahasa Melayu',
      'Bahasa Inggeris',
      'Matematik',
      'Sains',
      'Pendidikan Islam',
      'Pendidikan Moral',
      'Bahasa Arab',
      'Bahasa Iban',
      'Bahasa Cina',
      'Pendidikan Jasmani dan Pendidikan Kesihatan',
      'Pendidikan Seni Visual',
      'Pendidikan Muzik',
      'Reka Bentuk dan Teknologi',
      'Sejarah'
    ];
  }, [panitiaList]);

  // Open bank catalog for specific date, bidang, and optional panitia
  const openBankForCell = (dateStr: string, bidang: BidangType, panitia?: string) => {
    setBankTargetDate(dateStr);
    setBankTargetBidang(bidang);
    setBankTargetPanitia(panitia);
    setIsBankModalOpen(true);
  };

  // Font size classes based on font size selection
  const titleFontClass = fontSizeMode === 'terbesar' ? 'text-xs font-bold' : fontSizeMode === 'besar' ? 'text-[11.5px] font-bold' : 'text-[11px] font-semibold';
  const metaFontClass = fontSizeMode === 'terbesar' ? 'text-[11px]' : fontSizeMode === 'besar' ? 'text-[10px]' : 'text-[9.5px]';

  // Render Activity Card with word-wrapping and compact action buttons
  const renderActivityCard = (entry: TakwimEntry, borderColor: string, bgColor: string, textColor: string) => {
    const isTuesdayAssembly = entry.id.startsWith('t-tue-') || entry.tajuk.toLowerCase().includes('perhimpunan rasmi');

    return (
      <div
        key={entry.id}
        className={`p-2 rounded-lg ${bgColor} ${textColor} border ${borderColor} hover:shadow-xs transition-all group relative space-y-1 overflow-hidden break-words`}
      >
        <div className="flex items-start justify-between gap-1">
          <div 
            onClick={() => onViewEntry(entry)}
            className={`${titleFontClass} leading-snug cursor-pointer hover:underline text-slate-900 break-words flex-1 min-w-0`}
            title={entry.tajuk}
          >
            {entry.tajuk}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                onEditEntry(entry);
              }}
              className="p-0.5 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-100 transition-colors"
              title="Sunting program"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                onViewEntry(entry);
              }}
              className="p-0.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Lihat butiran"
            >
              <Eye className="w-3 h-3" />
            </button>
            {onDeleteEntry && !isTuesdayAssembly && (
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setEntryToDelete(entry);
                }}
                className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                title="Padam program"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Time, Unit, and Coordinator */}
        <div className={`${metaFontClass} text-slate-600 flex flex-wrap items-center justify-between gap-0.5 pt-1 border-t border-slate-200/60 leading-tight`}>
          <span className="font-semibold text-slate-800 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5 text-slate-400 inline shrink-0" />
            <span>{entry.sepanjangHari ? 'Sepanjang Hari' : `${entry.masaMula} - ${entry.masaAkhir}`}</span>
          </span>
          <span className="text-slate-700 font-medium truncate max-w-full">
            {entry.unitUtama}
          </span>
        </div>

        {entry.penyelaras && (
          <div className="text-[10px] text-slate-500 truncate">
            Penyelaras: {entry.penyelaras}
          </div>
        )}

        {entry.catatan && (
          <div className="text-[9px] text-slate-500 italic bg-white/70 p-0.5 rounded">
            {entry.catatan}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">


      {/* Top Toolbar */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Month Selector Carousel (1-12) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Bulan Takwim Persekolahan 2027:
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              ★ Setiap Hari Selasa: Sesi Pagi (07:00 – 07:30 pagi) & Sesi Petang (12:40 – 01:10 pm)
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {MONTH_NAMES_MS.map((name, idx) => {
              const mNum = idx + 1;
              const isSelected = selectedMonth === mNum;
              return (
                <button
                  key={mNum}
                  onClick={() => onSelectMonth(mNum)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls, Font Size & Export Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Search bar & Font Size Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari program, tarikh, panitia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Font Size Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <Type className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <span className="text-[11px] font-semibold text-slate-600 mr-1">Saiz Tulisan:</span>
              <button
                type="button"
                onClick={() => setFontSizeMode('standard')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                  fontSizeMode === 'standard' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Saiz Standard (Kecil)"
              >
                A Standard
              </button>
              <button
                type="button"
                onClick={() => setFontSizeMode('besar')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                  fontSizeMode === 'besar' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Saiz Sederhana Besar"
              >
                A+ Besar
              </button>
              <button
                type="button"
                onClick={() => setFontSizeMode('terbesar')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                  fontSizeMode === 'terbesar' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Saiz Sangat Besar (Terang)"
              >
                A++ Terang
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Catalog Button to pick program by bidang */}
            <button
              onClick={() => {
                setBankTargetDate(undefined);
                setBankTargetBidang('Semua');
                setIsBankModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Cadangan Program</span>
              <span className="bg-purple-200 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                60+
              </span>
            </button>

            {/* Quick Kit PLC Button */}
            {onOpenPLCKitModal && (
              <button
                type="button"
                onClick={() => onOpenPLCKitModal(selectedPanitiaFilter !== 'Semua' ? selectedPanitiaFilter : undefined)}
                className="px-3 py-2 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Buka Kit PLC & jana aktiviti mengikut kesesuaian panitia"
              >
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>Kit PLC Panitia</span>
              </button>
            )}

            {/* Quick SK@S Instrument Button */}
            {onOpenSKASModal && (
              <button
                type="button"
                onClick={onOpenSKASModal}
                className="px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Buka instrumen SK@S & jana cadangan aktiviti mengikut item TUMS"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>Instrumen SK@S</span>
              </button>
            )}

            {onGenerateTuesdayAssemblies && (
              <button
                onClick={onGenerateTuesdayAssemblies}
                className="px-3 py-2 text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                title="Selaraskan waktu Perhimpunan Dwisesi Selasa (Pagi 07:00-07:30, Petang 12:40-01:10)"
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span>Selaras Perhimpunan</span>
              </button>
            )}

            {/* Civic Schedule & 5-Min Activity Modal Button */}
            {onOpenCivicModal && (
              <button
                type="button"
                onClick={onOpenCivicModal}
                className="px-3 py-2 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Buka dan muat turun jadual amalan nilai sivik mingguan dan cadangan aktiviti 5 minit (Excel / Cetak)"
              >
                <HeartHandshake className="w-4 h-4 text-teal-600" />
                <span>Jadual Sivik & 5 Minit</span>
              </button>
            )}

            {/* Direct Official PDF Exports */}
            <button
              onClick={() => downloadMonthlyTakwimPDF(entries, holidays, selectedMonth, settings)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-rose-700/25"
              title="Muat turun fail dokumen PDF Takwim Bulanan rasmi"
            >
              <FileText className="w-4 h-4" />
              <span>Muat Turun PDF ({monthName})</span>
            </button>

            <button
              onClick={() => downloadYearlyTakwimPDF(entries, holidays, settings)}
              className="px-3 py-2 text-xs font-bold text-indigo-900 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Muat turun buku PDF Takwim Penuh 12 Bulan 2027"
            >
              <FileText className="w-4 h-4 text-indigo-700" />
              <span>PDF 12 Bulan</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={() => exportMultiColumnExcel(entries, holidays, selectedMonth, settings)}
              className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Muat turun fail Excel Takwim"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel</span>
            </button>

            {/* Standalone HTML Report Download */}
            <button
              onClick={() => downloadPrintableHTML(entries, holidays, selectedMonth, settings)}
              className="px-3 py-2 text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Muat turun fail dokumen bercetak HTML untuk dibuka dan dicetak di mana-mana peranti"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Dokumen HTML</span>
            </button>

            {/* Print Direct & Official Preview Modal */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-black transition-colors flex items-center gap-1.5 shadow-md shadow-slate-900/20"
              title="Cetak Takwim A4 Landskap dengan Pengesahan Pentadbir"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Landskap</span>
            </button>

            {/* Bulk Upload Takwim Button */}
            {onOpenBulkUploadModal && (
              <button
                type="button"
                onClick={onOpenBulkUploadModal}
                className="px-3.5 py-2 text-xs font-bold text-purple-900 bg-purple-50 border border-purple-300 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Muat naik fail takwim keseluruhan tahun 2027 secara pukal (Excel / CSV / Teks)"
              >
                <Upload className="w-4 h-4 text-purple-600" />
                <span>Muat Naik Pukal</span>
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
          <span className="font-bold text-slate-700">Lajur Pengurusan:</span>
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block"></span>
            Staf & Pentadbiran
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>
            Kurikulum
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>
            Hal Ehwal Murid (HEM)
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
            Kokurikulum
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="w-3 h-3 rounded-sm bg-teal-500 inline-block"></span>
            Panitia Mata Pelajaran
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
            💰 Tarikh Gaji Penjawat Awam
          </span>
        </div>
      </div>

      {/* PUSAT PENGISIAN GURU MENGIKUT BIDANG & PANITIA (SUSUN ATUR KEMAS UNTUK GURU) */}
      <div className="no-print bg-white rounded-2xl border-2 border-indigo-200/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Pusat Pengisian Guru Mengikut Bidang & Panitia</span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Tindakan Pantas
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Pilih bidang atau panitia anda di bawah untuk mengisi program, menapis paparan dan memuat turun PDF takwim rasmi.
              </p>
            </div>
          </div>
        </div>

        {/* Level 1: Bidang Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {([
            { id: 'Semua', label: '🌟 Semua Bidang', color: 'bg-slate-900 text-white' },
            { id: 'Pengurusan dan Staf', label: '🟣 Pengurusan & Staf', color: 'bg-purple-700 text-white' },
            { id: 'Kurikulum', label: '🔵 Kurikulum', color: 'bg-blue-700 text-white' },
            { id: 'Hal Ehwal Murid', label: '🟠 Hal Ehwal Murid (HEM)', color: 'bg-amber-600 text-white' },
            { id: 'Kokurikulum', label: '🟢 Kokurikulum', color: 'bg-emerald-700 text-white' },
            { id: 'Panitia Mata Pelajaran', label: '🔴 Panitia Mata Pelajaran', color: 'bg-teal-700 text-white' },
          ] as const).map((b) => {
            const isSelected = activeBidangTab === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setActiveBidangTab(b.id as any);
                  if (b.id !== 'Panitia Mata Pelajaran') {
                    setIsFocusMode(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? `${b.color} shadow-xs scale-102`
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>

        {/* Level 2: Sub-selector for Panitia Mata Pelajaran */}
        {activeBidangTab === 'Panitia Mata Pelajaran' && (
          <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-[11px] font-bold text-teal-950 uppercase tracking-wider">
                1. Pilih Panitia Mata Pelajaran Anda:
              </span>
              <label className="text-[11px] font-semibold text-teal-900 flex items-center gap-1.5 cursor-pointer bg-white px-2 py-0.5 rounded-md border border-teal-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={isFocusMode}
                  onChange={(e) => setIsFocusMode(e.target.checked)}
                  className="rounded text-teal-700 focus:ring-teal-500 w-3.5 h-3.5"
                />
                <span>Tapis Takwim: Panitia Ini Sahaja</span>
              </label>
            </div>

            {/* Panitia Pill Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {allPanitias.map((pName) => {
                const isSelected = activePanitiaTab === pName;
                return (
                  <button
                    key={pName}
                    type="button"
                    onClick={() => setActivePanitiaTab(pName)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-xs font-bold'
                        : 'bg-white text-teal-900 hover:bg-teal-100/80 border border-teal-200'
                    }`}
                  >
                    {pName}
                  </button>
                );
              })}
            </div>

            {/* Action Bar for the chosen Panitia */}
            <div className="pt-2 border-t border-teal-200 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-teal-950 font-bold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Panitia Aktif: <strong className="text-teal-900 text-sm font-extrabold">{activePanitiaTab}</strong></span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onOpenCreateModal(undefined, 'Panitia Mata Pelajaran', undefined, activePanitiaTab)}
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Program Panitia {activePanitiaTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadPanitiaTakwimPDF(entries, activePanitiaTab, settings, holidays)}
                  className="px-3 py-1.5 bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                  title={`Muat turun fail rasmi PDF Takwim Panitia ${activePanitiaTab} 2027`}
                >
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                  <span>Muat Turun PDF Panitia</span>
                </button>
                {onOpenPLCKitModal && (
                  <button
                    type="button"
                    onClick={() => onOpenPLCKitModal(activePanitiaTab)}
                    className="px-3 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    <span>Kit PLC {activePanitiaTab}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sub-selector for other Bidang (Kurikulum / HEM / Kokurikulum / Pengurusan & Staf) */}
        {activeBidangTab !== 'Semua' && activeBidangTab !== 'Panitia Mata Pelajaran' && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
            <div className="text-xs text-slate-800 font-bold flex items-center gap-2">
              <span>Bidang Aktif:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 text-sm font-extrabold border border-blue-200">
                {activeBidangTab}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer bg-white px-2 py-0.5 rounded-md border border-slate-300 shadow-2xs mr-1">
                <input
                  type="checkbox"
                  checked={isFocusMode}
                  onChange={(e) => setIsFocusMode(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Tapis Takwim: Bidang Ini Sahaja</span>
              </label>
              <button
                type="button"
                onClick={() => onOpenCreateModal(undefined, activeBidangTab)}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Program {activeBidangTab}</span>
              </button>
              <button
                type="button"
                onClick={() => downloadBidangTakwimPDF(entries, activeBidangTab, settings, holidays)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                title={`Muat turun fail rasmi PDF Takwim Bidang ${activeBidangTab} 2027`}
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Muat Turun PDF {activeBidangTab}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Multi-Column Table: Tarikh Persekolahan Mengikut Bulan & 5 Lajur Bidang (Fit 100% Zero-Scroll) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="w-full overflow-x-auto lg:overflow-x-visible">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold sticky top-0 z-10 text-xs">
              <tr>
                <th className="py-2.5 px-2 border-r border-slate-200 w-[8.5%] bg-slate-100 text-slate-800 font-bold text-center">
                  Tarikh & Minggu
                </th>
                <th className="py-2.5 px-2 border-r border-slate-200 w-[9%] bg-slate-100 text-slate-800 font-bold">
                  Status / Cuti
                </th>
                <th className="py-2.5 px-2 border-r border-slate-200 w-[16.5%] bg-purple-50/90 text-purple-950 font-bold align-top">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block shrink-0"></span>
                    <span className="truncate">Pengurusan & Staf</span>
                  </div>
                </th>
                <th className="py-2.5 px-2 border-r border-slate-200 w-[16.5%] bg-blue-50/90 text-blue-950 font-bold align-top">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0"></span>
                    <span className="truncate">Kurikulum</span>
                  </div>
                </th>
                <th className="py-2.5 px-2 border-r border-slate-200 w-[16.5%] bg-amber-50/90 text-amber-950 font-bold align-top">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block shrink-0"></span>
                    <span className="truncate">Hal Ehwal Murid (HEM)</span>
                  </div>
                </th>
                <th className="py-2.5 px-2 border-r border-slate-200 w-[16.5%] bg-emerald-50/90 text-emerald-950 font-bold align-top">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shrink-0"></span>
                    <span className="truncate">Kokurikulum</span>
                  </div>
                </th>
                <th className="py-2 px-2 border-r border-slate-200 w-[16.5%] bg-teal-50/90 text-teal-950 font-bold align-top">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1 truncate">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block shrink-0"></span>
                        <span className="truncate">Panitia</span>
                      </span>
                      {selectedPanitiaFilter !== 'Semua' && (
                        <button
                          type="button"
                          onClick={() => setSelectedPanitiaFilter('Semua')}
                          className="text-[10px] text-teal-800 hover:underline font-normal shrink-0"
                          title="Tunjuk semua panitia semula"
                        >
                          (Reset)
                        </button>
                      )}
                    </div>
                    {/* Panitia Quick Filter */}
                    <select
                      value={selectedPanitiaFilter}
                      onChange={(e) => setSelectedPanitiaFilter(e.target.value)}
                      className="w-full text-[10.5px] py-0.5 px-1 bg-white border border-teal-300 rounded-md font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-500 shadow-2xs"
                      title="Tapis mengikut panitia khusus. Hanya mesyuarat dan program panitia dipilih akan dipaparkan."
                    >
                      <option value="Semua">Semua Panitia</option>
                      {allPanitias.map((pName) => (
                        <option key={pName} value={pName}>
                          {pName}
                        </option>
                      ))}
                    </select>

                    {/* Quick Button to open Kit PLC for currently selected panitia */}
                    {onOpenPLCKitModal && (
                      <button
                        type="button"
                        onClick={() => onOpenPLCKitModal(selectedPanitiaFilter !== 'Semua' ? selectedPanitiaFilter : undefined)}
                        className="w-full text-[9.5px] font-bold text-teal-900 bg-teal-100/90 hover:bg-teal-200 border border-teal-300/80 rounded px-1 py-0.5 flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        title={selectedPanitiaFilter !== 'Semua' ? `Buka Kit PLC dan aktiviti khusus untuk ${selectedPanitiaFilter}` : 'Buka Kit PLC dan pilih aktiviti mengikut panitia'}
                      >
                        <GraduationCap className="w-2.5 h-2.5 text-teal-700 shrink-0" />
                        <span className="truncate">
                          {selectedPanitiaFilter !== 'Semua' 
                            ? `Kit PLC: ${selectedPanitiaFilter.replace('Panitia ', '')}` 
                            : 'Kit PLC Panitia'}
                        </span>
                      </button>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDays.map((day) => {
                const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;
                const isHoliday = day.statusInfo.isHoliday || day.statusInfo.isSchoolHoliday;
                const dayMap = entriesByDateAndBidang.get(day.dateStr) || {};

                // Row background styling
                let rowBg = 'bg-white hover:bg-slate-50/90';
                if (isHoliday) {
                  rowBg = 'bg-slate-100/80 hover:bg-slate-100';
                } else if (isWeekend) {
                  rowBg = 'bg-slate-50/50 hover:bg-slate-50';
                } else if (day.isTuesday) {
                  rowBg = 'bg-blue-50/30 hover:bg-blue-50/50';
                }

                // Tuesday Assembly Entry
                const showTuesdayAssembly = day.isTuesday && day.statusInfo.isPdPDay;
                const tuesdayAssemblyEntry = (dayMap['Pengurusan dan Staf'] || []).find(
                  (e) => e.tajuk.toLowerCase().includes('perhimpunan rasmi') || e.id.startsWith('t-tue-')
                );
                const regularStafEntries = (dayMap['Pengurusan dan Staf'] || []).filter(
                  (e) => !e.tajuk.toLowerCase().includes('perhimpunan rasmi') && !e.id.startsWith('t-tue-')
                );

                // Filter Panitia items based on selectedPanitiaFilter
                const rawPanitiaEntries = dayMap['Panitia Mata Pelajaran'] || [];
                const panitiaEntries = selectedPanitiaFilter === 'Semua'
                  ? rawPanitiaEntries
                  : rawPanitiaEntries.filter(e => 
                      e.unitUtama.toLowerCase().includes(selectedPanitiaFilter.toLowerCase()) ||
                      e.tajuk.toLowerCase().includes(selectedPanitiaFilter.toLowerCase())
                    );

                return (
                  <tr key={day.dateStr} className={`${rowBg} transition-colors group`}>
                    
                    {/* 1. Tarikh & Minggu (Compact & Fit) */}
                    <td className="py-2 px-1.5 border-r border-slate-200 align-top text-center">
                      <div className={`font-mono tabular-nums font-bold text-xs ${
                        isWeekend ? 'text-rose-600' : isHoliday ? 'text-amber-800' : 'text-slate-900'
                      }`}>
                        {day.dateStr.slice(8)}/{day.dateStr.slice(5, 7)}
                      </div>
                      <div className={`text-[11px] font-semibold ${
                        day.isTuesday ? 'text-blue-700 font-bold' : isWeekend ? 'text-rose-600' : 'text-slate-600'
                      }`}>
                        ({day.dayName})
                      </div>

                      {/* Academic Week Badge */}
                      {day.weekInfo.code !== 'Tiada Slot' && (
                        <div className="mt-0.5 inline-block text-[10px] font-bold px-1 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                          {day.weekInfo.code}
                        </div>
                      )}

                      {/* Tuesday Assembly Note */}
                      {day.isTuesday && day.statusInfo.isPdPDay && (
                        <div className="text-[9px] text-blue-700 font-bold mt-0.5 leading-tight flex items-center justify-center gap-0.5">
                          <Users className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                          <span>Perhimpunan</span>
                        </div>
                      )}

                      {/* Civil Service Salary Day Badge */}
                      {day.isSalaryDay && (
                        <div className="mt-1 p-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-[9px] font-bold leading-tight">
                          💰 GAJI
                        </div>
                      )}
                    </td>

                    {/* 2. Status / Cuti */}
                    <td className="py-2 px-1.5 border-r border-slate-200 align-top">
                      <div className="text-[11px] font-bold text-slate-800 leading-snug break-words">
                        {day.statusInfo.statusLabel}
                      </div>
                      {day.statusInfo.reason && (
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-tight break-words">
                          {day.statusInfo.reason}
                        </div>
                      )}
                    </td>

                    {/* 3. Column: Pengurusan & Staf */}
                    <td className="py-2 px-1.5 border-r border-slate-200 align-top">
                      <div className="space-y-1.5">
                        {/* Tuesday Official Assembly Card */}
                        {showTuesdayAssembly && (
                          <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-950 text-xs shadow-2xs group/card relative space-y-1 break-words">
                            <div className="flex items-start justify-between gap-1">
                              <div className="font-bold flex items-center gap-1 text-purple-950 text-[11px] leading-tight">
                                <Users className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                                <span>Perhimpunan Rasmi</span>
                              </div>
                              {tuesdayAssemblyEntry && (
                                <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover/card:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => onEditEntry(tuesdayAssemblyEntry)}
                                    className="p-0.5 rounded text-purple-700 hover:text-purple-950 hover:bg-purple-200/60 transition-colors"
                                    title="Sunting perhimpunan ini"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onViewEntry(tuesdayAssemblyEntry)}
                                    className="p-0.5 rounded text-purple-700 hover:text-purple-950 hover:bg-purple-200/60 transition-colors"
                                    title="Lihat butiran"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="text-[10px] text-purple-900 font-semibold bg-purple-100 px-1.5 py-0.5 rounded">
                              Pagi: 07:00-07:30 | Petang: 12:40-01:10
                            </div>
                          </div>
                        )}

                        {/* Holiday Tuesday Notice (No assembly, subtheme not carried forward) */}
                        {day.isTuesday && !day.statusInfo.isPdPDay && (
                          <div className="p-1.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-[10px] space-y-0.5">
                            <div className="font-bold flex items-center gap-1 text-amber-950">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Tiada Perhimpunan (Cuti)</span>
                            </div>
                            <div className="text-[9px] text-amber-800 leading-tight">
                              Nilai Sivik: Subtema minggu ini dibatalkan & tidak di-carry forward.
                            </div>
                          </div>
                        )}

                        {regularStafEntries.map((e) =>
                          renderActivityCard(e, 'border-purple-200', 'bg-purple-50/90', 'text-purple-950')
                        )}

                        {/* Quick Add Button directly for Staf */}
                        <div className="pt-0.5 flex items-center gap-1 no-print">
                          <button
                            type="button"
                            onClick={() => onOpenCreateModal(day.dateStr, 'Pengurusan dan Staf')}
                            className="flex-1 py-0.5 px-1.5 rounded-md text-[10px] font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-dashed border-purple-300 flex items-center justify-center gap-0.5 transition-colors"
                            title={`Tambah aktiviti Staf pada ${day.dateStr}`}
                          >
                            <Plus className="w-3 h-3 text-purple-600 shrink-0" />
                            <span>+ Staf</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openBankForCell(day.dateStr, 'Pengurusan dan Staf')}
                            className="p-1 rounded-md text-purple-600 hover:text-purple-900 hover:bg-purple-100 border border-purple-200 transition-colors shrink-0"
                            title="Bank Cadangan Pengurusan & Staf"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* 4. Column: Kurikulum */}
                    <td className="py-2 px-1.5 border-r border-slate-200 align-top">
                      <div className="space-y-1.5">
                        {(dayMap['Kurikulum'] || []).map((e) =>
                          renderActivityCard(e, 'border-blue-200', 'bg-blue-50/90', 'text-blue-950')
                        )}

                        {/* Quick Add Button directly for Kurikulum */}
                        <div className="pt-0.5 flex items-center gap-1 no-print">
                          <button
                            type="button"
                            onClick={() => onOpenCreateModal(day.dateStr, 'Kurikulum')}
                            className="flex-1 py-0.5 px-1.5 rounded-md text-[10px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-dashed border-blue-300 flex items-center justify-center gap-0.5 transition-colors"
                            title={`Tambah program Kurikulum pada ${day.dateStr}`}
                          >
                            <Plus className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>+ Kurikulum</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openBankForCell(day.dateStr, 'Kurikulum')}
                            className="p-1 rounded-md text-blue-600 hover:text-blue-900 hover:bg-blue-100 border border-blue-200 transition-colors shrink-0"
                            title="Bank Cadangan Kurikulum"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* 5. Column: Hal Ehwal Murid (HEM) */}
                    <td className="py-2 px-1.5 border-r border-slate-200 align-top">
                      <div className="space-y-1.5">
                        {(dayMap['Hal Ehwal Murid'] || []).map((e) =>
                          renderActivityCard(e, 'border-amber-200', 'bg-amber-50/90', 'text-amber-950')
                        )}

                        {/* Quick Add Button directly for HEM */}
                        <div className="pt-0.5 flex items-center gap-1 no-print">
                          <button
                            type="button"
                            onClick={() => onOpenCreateModal(day.dateStr, 'Hal Ehwal Murid')}
                            className="flex-1 py-0.5 px-1.5 rounded-md text-[10px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-dashed border-amber-300 flex items-center justify-center gap-0.5 transition-colors"
                            title={`Tambah program HEM pada ${day.dateStr}`}
                          >
                            <Plus className="w-3 h-3 text-amber-700 shrink-0" />
                            <span>+ HEM</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openBankForCell(day.dateStr, 'Hal Ehwal Murid')}
                            className="p-1 rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-100 border border-amber-200 transition-colors shrink-0"
                            title="Bank Cadangan HEM"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* 6. Column: Kokurikulum */}
                    <td className="py-2 px-1.5 border-r border-slate-200 align-top">
                      <div className="space-y-1.5">
                        {(dayMap['Kokurikulum'] || []).map((e) =>
                          renderActivityCard(e, 'border-emerald-200', 'bg-emerald-50/90', 'text-emerald-950')
                        )}

                        {/* Quick Add Button directly for Kokurikulum */}
                        <div className="pt-0.5 flex items-center gap-1 no-print">
                          <button
                            type="button"
                            onClick={() => onOpenCreateModal(day.dateStr, 'Kokurikulum')}
                            className="flex-1 py-0.5 px-1.5 rounded-md text-[10px] font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-dashed border-emerald-300 flex items-center justify-center gap-0.5 transition-colors"
                            title={`Tambah aktiviti Kokurikulum pada ${day.dateStr}`}
                          >
                            <Plus className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span>+ Koko</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openBankForCell(day.dateStr, 'Kokurikulum')}
                            className="p-1 rounded-md text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 border border-emerald-200 transition-colors shrink-0"
                            title="Bank Cadangan Kokurikulum"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* 7. Column: Panitia Mata Pelajaran (Filtered by selected Panitia) */}
                    <td className="py-2 px-1.5 border-r border-slate-200 align-top">
                      <div className="space-y-1.5">
                        {panitiaEntries.map((e) =>
                          renderActivityCard(e, 'border-teal-200', 'bg-teal-50/90', 'text-teal-950')
                        )}

                        {/* Quick Add Button directly for Panitia (Pre-selects active panitia filter) */}
                        <div className="pt-0.5 flex items-center gap-1 no-print">
                          <button
                            type="button"
                            onClick={() => onOpenCreateModal(
                              day.dateStr, 
                              'Panitia Mata Pelajaran', 
                              undefined, 
                              selectedPanitiaFilter !== 'Semua' ? selectedPanitiaFilter : undefined
                            )}
                            className="flex-1 py-0.5 px-1.5 rounded-md text-[10px] font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-dashed border-teal-300 flex items-center justify-center gap-0.5 transition-colors truncate"
                            title={selectedPanitiaFilter !== 'Semua' ? `Tambah program Panitia ${selectedPanitiaFilter} pada ${day.dateStr}` : `Tambah program Panitia pada ${day.dateStr}`}
                          >
                            <Plus className="w-3 h-3 text-teal-700 shrink-0" />
                            <span className="truncate">{selectedPanitiaFilter !== 'Semua' ? `+ ${selectedPanitiaFilter}` : '+ Panitia'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openBankForCell(
                              day.dateStr, 
                              'Panitia Mata Pelajaran', 
                              selectedPanitiaFilter !== 'Semua' ? selectedPanitiaFilter : undefined
                            )}
                            className="p-1 rounded-md text-teal-700 hover:text-teal-900 hover:bg-teal-100 border border-teal-200 transition-colors shrink-0"
                            title={selectedPanitiaFilter !== 'Semua' ? `Bank Cadangan Panitia ${selectedPanitiaFilter}` : 'Bank Cadangan Panitia'}
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Program Bank Modal */}
      <ProgramBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        selectedMonth={selectedMonth}
        initialBidang={bankTargetBidang}
        initialPanitia={bankTargetPanitia}
        panitiaList={panitiaList}
        onSelectProgram={(suggestion) => {
          setIsBankModalOpen(false);
          onOpenCreateModal(bankTargetDate, suggestion.bidang, suggestion, bankTargetPanitia);
        }}
      />

      {/* Official A4 Landscape Print Modal with live preview */}
      {isPrintModalOpen && (
        <TakwimPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          entries={entries}
          holidays={holidays}
          selectedMonth={selectedMonth}
          settings={settings}
        />
      )}

      {/* In-App Delete Confirmation Modal (Foolproof, avoids iframe browser blocking) */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Sahkan Padam Program</h3>
                <p className="text-xs text-slate-500">Program akan dialihkan ke tong sampah dan boleh dipulihkan semula.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{entryToDelete.tajuk}</div>
              <div className="text-slate-600">
                Tarikh: <span className="font-semibold text-slate-800">{entryToDelete.tarikhMula}</span> · Bidang: <span className="font-semibold text-slate-800">{entryToDelete.bidangUtama}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteEntry) onDeleteEntry(entryToDelete.id);
                  setEntryToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-sm transition-colors"
              >
                Ya, Sahkan Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
