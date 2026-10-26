import React, { useState, useMemo } from 'react';
import { CivicValueRecord, SchoolSettings, HolidayRecord } from '../types/takwim';
import { MONTH_NAMES_MS, getAllDefaultHolidays } from '../constants/calendar2027';
import { getCivicTuesdaySchedule, CivicTuesdaySlot } from '../utils/civicScheduleHelper';
import { 
  exportCivicScheduleToExcel, 
  downloadCivicScheduleHTML, 
  printCivicScheduleDocument,
  downloadCivicSchedulePDF 
} from '../utils/exportUtils';
import { FileText } from 'lucide-react';
import { 
  X, 
  HeartHandshake, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Search, 
  Clock, 
  Sparkles, 
  Filter,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  Info
} from 'lucide-react';

interface CivicScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  civicValues: CivicValueRecord[];
  settings?: SchoolSettings;
  holidays?: HolidayRecord[];
}

export const CivicScheduleModal: React.FC<CivicScheduleModalProps> = ({
  isOpen,
  onClose,
  civicValues,
  settings,
  holidays = getAllDefaultHolidays(),
}) => {
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | 'all'>('all');
  const [selectedCoreFilter, setSelectedCoreFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'terlaksana' | 'cuti'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Generate all Tuesday slots across 2027 enforcing non-carry forward rule
  const allTuesdaySlots = useMemo(() => {
    return getCivicTuesdaySchedule(civicValues, holidays);
  }, [civicValues, holidays]);

  // Filter slots
  const filteredSlots = useMemo(() => {
    return allTuesdaySlots.filter((slot) => {
      if (selectedMonthFilter !== 'all' && slot.month !== selectedMonthFilter) return false;
      if (selectedCoreFilter !== 'all' && slot.coreValue !== selectedCoreFilter) return false;
      if (selectedStatusFilter === 'terlaksana' && slot.isHoliday) return false;
      if (selectedStatusFilter === 'cuti' && !slot.isHoliday) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = slot.tajukAktiviti.toLowerCase().includes(q);
        const matchGuide = slot.cadanganAktiviti5Minit.toLowerCase().includes(q);
        const matchSub = slot.subNilai.toLowerCase().includes(q);
        const matchCore = slot.coreValue.toLowerCase().includes(q);
        const matchMonth = slot.monthName.toLowerCase().includes(q);
        const matchDate = slot.tuesdayDisplay.toLowerCase().includes(q);
        if (!matchTitle && !matchGuide && !matchSub && !matchCore && !matchMonth && !matchDate) return false;
      }
      return true;
    });
  }, [allTuesdaySlots, selectedMonthFilter, selectedCoreFilter, selectedStatusFilter, searchQuery]);

  if (!isOpen) return null;

  const totalSlots = allTuesdaySlots.length;
  const activeSlots = allTuesdaySlots.filter(s => !s.isHoliday).length;
  const holidaySlots = allTuesdaySlots.filter(s => s.isHoliday).length;

  const getCoreColorBadge = (val: string) => {
    if (val.includes('Kasih Sayang')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (val.includes('Hormat')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (val.includes('Bertanggungjawab')) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <HeartHandshake className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  Jadual Pelaksanaan Nilai Sivik & Aktiviti 5 Minit Mingguan 2027
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/40">
                  Setiap Hari Selasa
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Diselaraskan mengikut setiap hari Selasa Takwim Persekolahan 2027 · Sesi Pagi (07:00–07:30) & Sesi Petang (12:40–01:10).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Policy Banner: Tarikh Hari Selasa & Peraturan Tiada Carry Forward */}
        <div className="bg-linear-to-r from-amber-50 via-yellow-50 to-orange-50 border-b border-amber-200 px-6 py-3 shrink-0">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-amber-900 text-[12.5px]">
                  Ketetapan Dasar Pelaksanaan: Setiap Hari Selasa & Peraturan Tiada Carry Forward Jika Cuti
                </strong>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded-md">
                  Ketetapan Sekolah KPM 2027
                </span>
              </div>
              <p className="text-amber-900/90 text-[11.5px] leading-relaxed">
                Pelaksanaan nilai sivik dwisesi SK Tudan dijadualkan tepat pada <strong>setiap hari Selasa</strong> tahun 2027. <strong>Sekiranya hari Selasa jatuh pada cuti umum, cuti tambahan KPM atau cuti penggal persekolahan, nilai subtema minggu berkenaan TIDAK AKAN DI-CARRY FORWARD (dibatalkan untuk minggu tersebut)</strong>. Minggu berikutnya tetap meneruskan subtema asal yang telah dijadualkan bagi mengekalkan keharmonian takwim tahunan.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Counter Stats */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Jumlah Hari Selasa 2027: <strong>{totalSlots} Sesi</strong></span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Hari Persekolahan (PdP Terlaksana): <strong>{activeSlots} Sesi</strong></span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Cuti / Dibatalkan (Tiada Carry Forward): <strong>{holidaySlots} Sesi</strong></span>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
            ★ Sesi Pagi: 07:00 – 07:30 pagi | Sesi Petang: 12:40 – 01:10 pm
          </span>
        </div>

        {/* Toolbar with Filters & Export Buttons */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Search & Filters */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {/* Search */}
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari aktiviti, tarikh, tajuk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Month Filter */}
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Bulan (Jan - Dis)</option>
                {MONTH_NAMES_MS.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>Bulan {idx + 1}: {m}</option>
                ))}
              </select>

              {/* Core Value Filter */}
              <select
                value={selectedCoreFilter}
                onChange={(e) => setSelectedCoreFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Nilai Teras</option>
                <option value="Kasih Sayang">Kasih Sayang</option>
                <option value="Hormat-menghormati">Hormat-menghormati</option>
                <option value="Bertanggungjawab">Bertanggungjawab</option>
                <option value="Kegembiraan">Kegembiraan</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Status Pelaksanaan</option>
                <option value="terlaksana">Hanya Terlaksana ({activeSlots})</option>
                <option value="cuti">Hanya Cuti / Dibatalkan ({holidaySlots})</option>
              </select>
            </div>

            {/* Export & Download Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => downloadCivicSchedulePDF(civicValues, settings, holidays)}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                title="Muat turun fail rasmi PDF Jadual Penerapan Nilai Sivik & 5 Minit"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Muat Turun PDF</span>
              </button>

              <button
                type="button"
                onClick={() => exportCivicScheduleToExcel(civicValues, settings, holidays)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                title="Muat turun jadual lengkap ke fail Excel (.xlsx) dengan tarikh setiap hari Selasa"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              <button
                type="button"
                onClick={() => downloadCivicScheduleHTML(civicValues, settings, holidays)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                title="Muat turun dokumen HTML bercetak untuk dibuka bila-bila masa"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Dokumen HTML</span>
              </button>

              <button
                type="button"
                onClick={() => printCivicScheduleDocument(civicValues, settings)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                title="Cetak jadual A4 Landskap lengkap"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak A4</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Menunjukkan <strong>{filteredSlots.length}</strong> slot hari Selasa bagi tahun 2027.</span>
            <span className="font-medium text-emerald-800">⏱ Setiap aktiviti dirangka ringkas tepat 5 minit untuk pelaksanaan pantas guru.</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-24 text-center">Bulan</th>
                  <th className="py-2.5 px-2 w-14 text-center">Minggu</th>
                  <th className="py-2.5 px-3 w-48">Tarikh Pelaksanaan (Selasa) & Status</th>
                  <th className="py-2.5 px-3 w-36">Nilai Teras Sivik</th>
                  <th className="py-2.5 px-3 w-44">Tajuk & Sub-Nilai</th>
                  <th className="py-2.5 px-3 min-w-[280px]">Cadangan Aktiviti 5 Minit Ringkas (Panduan Guru)</th>
                  <th className="py-2.5 px-3 w-28">Sasaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSlots.map((slot, idx) => {
                  const isCancelled = slot.isHoliday;

                  return (
                    <tr 
                      key={idx} 
                      className={`transition-colors ${isCancelled ? 'bg-amber-50/40 hover:bg-amber-50/80' : 'hover:bg-slate-50'}`}
                    >
                      {/* Bulan */}
                      <td className="py-3 px-3 font-bold text-slate-900 text-center align-top bg-slate-50/50">
                        {slot.monthName}
                        <div className="text-[10px] text-slate-400 font-normal">Bulan {slot.month}</div>
                      </td>

                      {/* Minggu */}
                      <td className="py-3 px-2 text-center align-top font-bold text-blue-700 bg-blue-50/30 font-mono">
                        M{slot.weekIndex}
                      </td>

                      {/* Tarikh Pelaksanaan (Selasa) & Status Tiada Carry Forward */}
                      <td className="py-3 px-3 align-top space-y-1.5">
                        <div className="font-bold text-slate-900 text-[11.5px] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{slot.tuesdayDisplay}</span>
                        </div>
                        
                        {isCancelled ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>DIBATALKAN (CUTI)</span>
                            </span>
                            <div className="text-[10px] font-semibold text-amber-800 leading-tight">
                              {slot.holidayReason || 'Cuti Persekolahan'}
                            </div>
                            <div className="text-[9.5px] text-slate-500 italic bg-white/80 p-1 rounded border border-amber-200/80">
                              ⚠️ Dasar Sekolah: Subtema TIDAK di-carry forward. Minggu depan terus dengan subtema asalnya.
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>TERLAKSANA BERJADUAL</span>
                            </span>
                            <div className="text-[10px] text-slate-600">
                              Dwisesi: Pagi & Petang
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Nilai Teras */}
                      <td className="py-3 px-3 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${getCoreColorBadge(slot.coreValue)}`}>
                          {slot.coreValue}
                        </span>
                        <div className="text-[11px] text-slate-600 mt-1 font-medium leading-tight">
                          {slot.subTheme}
                        </div>
                      </td>

                      {/* Tajuk & Sub-Nilai */}
                      <td className="py-3 px-3 align-top">
                        <div className={`font-bold leading-snug ${isCancelled ? 'text-slate-600' : 'text-slate-900'}`}>
                          {slot.tajukAktiviti}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {slot.subNilai}
                        </div>
                      </td>

                      {/* Cadangan Aktiviti 5 Minit Ringkas */}
                      <td className="py-3 px-3 align-top leading-relaxed text-slate-800">
                        <div className={`p-2.5 rounded-lg space-y-1 ${isCancelled ? 'bg-amber-100/40 border border-amber-300/60' : 'bg-emerald-50/60 border border-emerald-200'}`}>
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-900">
                            <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Panduan Tindakan 5 Minit:</span>
                          </div>
                          <p className="text-[11.5px] text-slate-800">
                            {slot.cadanganAktiviti5Minit}
                          </p>
                          {isCancelled && (
                            <div className="text-[10px] text-amber-900 font-medium pt-1 border-t border-amber-200/60">
                              📌 Tiada penggantian masa pada hari lain untuk aktiviti minggu ini.
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Sasaran */}
                      <td className="py-3 px-3 align-top text-slate-600 text-[11px]">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md inline-block">
                          {slot.fokusSasaran || 'Semua Murid'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600">
            Kementerian Pendidikan Malaysia (KPM) · e-Takwim {settings?.schoolName || 'SK Tudan'} 2027
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
