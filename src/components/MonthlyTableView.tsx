import React, { useState } from 'react';
import { TakwimEntry, HolidayRecord, BidangType } from '../types/takwim';
import { MONTH_NAMES_MS, DAY_NAMES_MS, getDayStatus } from '../constants/calendar2027';
import { exportTakwimToExcel, exportTakwimToCSV, exportTakwimToICS, printTakwim, downloadMonthlyTakwimPDF } from '../utils/exportUtils';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Edit3, 
  CalendarCheck,
  FileText
} from 'lucide-react';

interface MonthlyTableViewProps {
  entries: TakwimEntry[];
  holidays: HolidayRecord[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
  onViewEntry: (entry: TakwimEntry) => void;
  onEditEntry: (entry: TakwimEntry) => void;
  onOpenCreateModal: () => void;
  selectedBidangFilter?: string;
}

export const MonthlyTableView: React.FC<MonthlyTableViewProps> = ({
  entries,
  holidays,
  selectedMonth,
  onSelectMonth,
  onViewEntry,
  onEditEntry,
  onOpenCreateModal,
  selectedBidangFilter = 'Semua',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bidangFilter, setBidangFilter] = useState<string>(selectedBidangFilter);
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Month navigation: 1 - 12
  const monthName = MONTH_NAMES_MS[selectedMonth - 1];

  // Filter entries for the selected month (or overlapping multi-month events)
  const monthEntries = entries.filter((e) => {
    if (e.isDeleted) return false;

    // Multi-month range matching
    const startM = new Date(e.tarikhMula + 'T00:00:00').getMonth() + 1;
    const endM = new Date((e.tarikhAkhir || e.tarikhMula) + 'T00:00:00').getMonth() + 1;
    const isInMonth = (selectedMonth >= startM && selectedMonth <= endM);

    if (!isInMonth) return false;

    if (bidangFilter !== 'Semua' && e.bidangUtama !== bidangFilter) return false;
    if (statusFilter !== 'Semua' && e.statusKelulusan !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        e.tajuk.toLowerCase().includes(q) ||
        e.unitUtama.toLowerCase().includes(q) ||
        e.penyelaras.toLowerCase().includes(q) ||
        e.tempat.toLowerCase().includes(q) ||
        e.mingguAkademik.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Sort by date, then time
  monthEntries.sort(
    (a, b) => a.tarikhMula.localeCompare(b.tarikhMula) || a.masaMula.localeCompare(b.masaMula)
  );

  // Helper for color coding required by Section 7:
  // Kurikulum: biru, Staf: ungu, HEM: jingga, Kokurikulum: hijau, Panitia: turkuois, Pertindihan: merah
  const getBidangBadge = (bidang: BidangType, hasConflict?: boolean) => {
    if (hasConflict) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>Pertindihan</span>
        </span>
      );
    }

    switch (bidang) {
      case 'Kurikulum':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
            <span>Kurikulum (Biru)</span>
          </span>
        );
      case 'Pengurusan dan Staf':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200">
            <span>Staf (Ungu)</span>
          </span>
        );
      case 'Hal Ehwal Murid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span>HEM (Jingga)</span>
          </span>
        );
      case 'Kokurikulum':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span>Koko (Hijau)</span>
          </span>
        );
      case 'Panitia Mata Pelajaran':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
            <span>Panitia (Turkuois)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium bg-slate-100 text-slate-800">
            <span>{bidang}</span>
          </span>
        );
    }
  };

  const getDayName = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return DAY_NAMES_MS[d.getDay()];
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print-only mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">
              Sekolah Kebangsaan Tudan, Miri, Sarawak
            </h1>
            <h2 className="text-sm font-semibold">
              Takwim Pengurusan Sekolah Tahun 2027 · Bulan {monthName} 2027 (Kumpulan B)
            </h2>
            <div className="text-xs text-slate-600 mt-1">
              Kod Sekolah: YBA4103 · Zon Masa: Asia/Kuala_Lumpur · Tarikh Cetakan: {new Date().toLocaleDateString('ms-MY')}
            </div>
          </div>
          <div className="text-right text-xs">
            <div>Legenda Bidang:</div>
            <div className="font-medium text-slate-700">
              Biru: Kurikulum · Ungu: Staf · Jingga: HEM · Hijau: Koko · Turkuois: Panitia · Kelabu: Cuti
            </div>
          </div>
        </div>
      </div>

      {/* Top Toolbar: Month Picker Tabs, Filter & Export Actions */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Month Selector Carousel (1-12) */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Pilih Bulan Takwim 2027:
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {MONTH_NAMES_MS.map((name, idx) => {
              const mNum = idx + 1;
              const isSelected = selectedMonth === mNum;
              return (
                <button
                  key={mNum}
                  onClick={() => onSelectMonth(mNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter bar, Search & Export Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari program, tempat, penyelaras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bidang Filter */}
            <select
              aria-label="Tapis mengikut Bidang"
              value={bidangFilter}
              onChange={(e) => setBidangFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Semua">Semua Bidang</option>
              <option value="Kurikulum">Kurikulum</option>
              <option value="Pengurusan dan Staf">Pengurusan dan Staf</option>
              <option value="Hal Ehwal Murid">Hal Ehwal Murid</option>
              <option value="Kokurikulum">Kokurikulum</option>
              <option value="Panitia Mata Pelajaran">Panitia Mata Pelajaran</option>
            </select>

            {/* Status Filter */}
            <select
              aria-label="Tapis mengikut Status Kelulusan"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Semua">Semua Status Kelulusan</option>
              <option value="Diluluskan">Diluluskan</option>
              <option value="Dihantar">Dihantar (Menunggu)</option>
              <option value="Perlu Pindaan">Perlu Pindaan</option>
              <option value="Draf">Draf</option>
            </select>
          </div>

          {/* Export & Print Actions */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button
              onClick={() => downloadMonthlyTakwimPDF(entries, holidays, selectedMonth)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-rose-700 rounded-lg hover:bg-rose-800 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Muat turun dokumen PDF rasmi Takwim Bulanan"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Muat Turun PDF</span>
            </button>

            <button
              onClick={() => exportTakwimToExcel(monthEntries, monthName)}
              className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
              title="Eksport ke fail Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => exportTakwimToCSV(monthEntries, `takwim_sk_tudan_${monthName}_2027.csv`)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
              title="Eksport fail sandaran CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => exportTakwimToICS(monthEntries)}
              className="px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
              title="Eksport acara diluluskan ke Kalendar Google / Apple / Outlook"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Kalendar (.ics)</span>
            </button>

            <button
              onClick={printTakwim}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Cetak Takwim A4 Landskap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Landskap</span>
            </button>
          </div>
        </div>

        {/* Color Legend Bar */}
        <div className="no-print pt-2 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
          <span className="font-semibold text-slate-700">Petunjuk Warna:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            Kurikulum (Biru)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
            Staf (Ungu)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            HEM (Jingga)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Koko (Hijau)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
            Panitia (Turkuois)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
            Cuti (Kelabu)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            Pertindihan (Merah)
          </span>
        </div>
      </div>

      {/* Official 11-Column Monthly Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Repeatable Thead for Printing and Desktop */}
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">Tarikh</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap border-r border-slate-200">Hari</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap border-r border-slate-200">Minggu</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap border-r border-slate-200">Masa</th>
                <th className="py-2.5 px-3 min-w-[220px] border-r border-slate-200">Program / Aktiviti</th>
                <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">Bidang / Panitia</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[140px]">Sasaran</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[120px]">Tempat</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[140px]">Penyelaras</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap border-r border-slate-200">Kelulusan</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap border-r border-slate-200">Pelaksanaan</th>
                <th className="no-print py-2.5 px-2.5 text-center whitespace-nowrap">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {monthEntries.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">
                      Tiada program direkodkan bagi bulan {monthName} 2027.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik butang "Tambah Program" di atas untuk mendaftarkan aktiviti baharu.
                    </p>
                  </td>
                </tr>
              ) : (
                monthEntries.map((entry) => {
                  const hasConflict = entry.hasConflictWarning && !entry.conflictApproved;
                  const rowBg = hasConflict
                    ? 'bg-rose-50/40 hover:bg-rose-50'
                    : 'hover:bg-slate-50/80';

                  return (
                    <tr key={entry.id} className={`${rowBg} transition-colors group`}>
                      {/* 1. Tarikh */}
                      <td className="py-2 px-3 font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap border-r border-slate-200">
                        {entry.tarikhMula}
                        {entry.tarikhAkhir && entry.tarikhAkhir !== entry.tarikhMula && (
                          <div className="text-[11px] font-normal text-slate-500">
                            hingga {entry.tarikhAkhir}
                          </div>
                        )}
                      </td>

                      {/* 2. Hari */}
                      <td className="py-2 px-2.5 text-slate-700 font-medium whitespace-nowrap border-r border-slate-200">
                        {getDayName(entry.tarikhMula)}
                      </td>

                      {/* 3. Minggu */}
                      <td className="py-2 px-2.5 font-mono tabular-nums text-blue-700 font-semibold whitespace-nowrap border-r border-slate-200">
                        {entry.mingguAkademik}
                      </td>

                      {/* 4. Masa */}
                      <td className="py-2 px-2.5 font-mono tabular-nums text-slate-600 whitespace-nowrap border-r border-slate-200">
                        {entry.sepanjangHari ? (
                          <span className="text-slate-500 italic">Sepanjang Hari</span>
                        ) : (
                          `${entry.masaMula} - ${entry.masaAkhir}`
                        )}
                      </td>

                      {/* 5. Program */}
                      <td className="py-2 px-3 border-r border-slate-200">
                        <div className="font-semibold text-slate-900 line-clamp-2">
                          {entry.tajuk}
                        </div>
                        {entry.bilanganMesyuarat && (
                          <span className="text-[11px] text-slate-500 font-medium block">
                            {entry.bilanganMesyuarat}
                          </span>
                        )}
                        {entry.objektif && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {entry.objektif}
                          </div>
                        )}
                        {hasConflict && (
                          <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Pertindihan dikesan</span>
                          </div>
                        )}
                      </td>

                      {/* 6. Bidang / Panitia */}
                      <td className="py-2 px-3 border-r border-slate-200">
                        <div className="mb-1">{getBidangBadge(entry.bidangUtama, hasConflict)}</div>
                        <div className="font-medium text-slate-800 text-[11px]">
                          {entry.unitUtama}
                        </div>
                        {Boolean(entry.unitBersama && entry.unitBersama.length > 0) && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            + {entry.unitBersama.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* 7. Sasaran */}
                      <td className="py-2 px-3 text-slate-700 text-[11px] border-r border-slate-200">
                        {entry.sasaran?.join(', ') || '-'}
                      </td>

                      {/* 8. Tempat */}
                      <td className="py-2 px-3 text-slate-700 text-[11px] font-medium border-r border-slate-200">
                        {entry.tempat}
                      </td>

                      {/* 9. Penyelaras */}
                      <td className="py-2 px-3 text-slate-700 text-[11px] border-r border-slate-200">
                        <div className="font-medium text-slate-900">{entry.penyelaras}</div>
                        {entry.ajk && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            AJK: {entry.ajk}
                          </div>
                        )}
                      </td>

                      {/* 10. Kelulusan */}
                      <td className="py-2 px-2.5 whitespace-nowrap border-r border-slate-200">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-sm text-[11px] font-semibold ${
                            entry.statusKelulusan === 'Diluluskan'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : entry.statusKelulusan === 'Dihantar'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : entry.statusKelulusan === 'Perlu Pindaan'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : entry.statusKelulusan === 'Ditolak'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {entry.statusKelulusan}
                        </span>
                      </td>

                      {/* 11. Pelaksanaan */}
                      <td className="py-2 px-2.5 whitespace-nowrap border-r border-slate-200">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-sm text-[11px] font-medium ${
                            entry.statusPelaksanaan === 'Selesai'
                              ? 'bg-blue-50 text-blue-800'
                              : entry.statusPelaksanaan === 'Sedang Dilaksanakan'
                              ? 'bg-teal-50 text-teal-800 font-semibold'
                              : entry.statusPelaksanaan === 'Ditangguhkan'
                              ? 'bg-amber-50 text-amber-800'
                              : entry.statusPelaksanaan === 'Dibatalkan'
                              ? 'bg-slate-100 text-slate-500 line-through'
                              : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          {entry.statusPelaksanaan}
                        </span>
                      </td>

                      {/* Tindakan (No Print) */}
                      <td className="no-print py-2 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewEntry(entry)}
                            className="p-1 rounded-md text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Lihat Perincian"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditEntry(entry)}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Kemaskini Program"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
