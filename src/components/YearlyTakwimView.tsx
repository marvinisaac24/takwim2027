import React, { useState } from 'react';
import { TakwimEntry, HolidayRecord } from '../types/takwim';
import { MONTH_NAMES_MS, SCHOOL_TERM_HOLIDAYS } from '../constants/calendar2027';
import { MONTHLY_FOCUS_SUGGESTIONS } from '../constants/bankProgram';
import { Calendar, Filter, ArrowRight, ShieldAlert, Sparkles, BookOpen, FileText } from 'lucide-react';
import { downloadYearlyTakwimPDF } from '../utils/exportUtils';

interface YearlyTakwimViewProps {
  entries: TakwimEntry[];
  holidays: HolidayRecord[];
  onSelectMonth: (month: number) => void;
  onViewEntry: (entry: TakwimEntry) => void;
}

export const YearlyTakwimView: React.FC<YearlyTakwimViewProps> = ({
  entries,
  holidays,
  onSelectMonth,
  onViewEntry,
}) => {
  const [filterBidang, setFilterBidang] = useState<string>('Semua');

  const filteredEntries = entries.filter((e) => {
    if (e.isDeleted) return false;
    if (filterBidang !== 'Semua' && e.bidangUtama !== filterBidang) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Takwim Tahunan Lengkap Sesi Persekolahan 2027
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Paparan menyeluruh 12 bulan merangkumi sesi persekolahan Kumpulan B dan cuti penggal.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => downloadYearlyTakwimPDF(entries, holidays)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Muat turun dokumen PDF rasmi Takwim Penuh 12 Bulan 2027"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Muat Turun PDF (12 Bulan)</span>
          </button>

          <label className="text-xs font-semibold text-slate-600 ml-2">Tapis Bidang:</label>
          <select
            aria-label="Tapis mengikut bidang pengurusan"
            value={filterBidang}
            onChange={(e) => setFilterBidang(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 font-medium"
          >
            <option value="Semua">Semua Bidang</option>
            <option value="Kurikulum">Kurikulum</option>
            <option value="Pengurusan dan Staf">Pengurusan dan Staf</option>
            <option value="Hal Ehwal Murid">Hal Ehwal Murid</option>
            <option value="Kokurikulum">Kokurikulum</option>
            <option value="Panitia Mata Pelajaran">Panitia Mata Pelajaran</option>
          </select>
        </div>
      </div>

      {/* 12-Month Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MONTH_NAMES_MS.map((monthName, idx) => {
          const monthNum = idx + 1;
          const focus = MONTHLY_FOCUS_SUGGESTIONS.find((f) => f.month === monthNum);
          
          // Entries in this month
          const monthList = filteredEntries.filter((e) => {
            const startM = new Date(e.tarikhMula + 'T00:00:00').getMonth() + 1;
            const endM = new Date((e.tarikhAkhir || e.tarikhMula) + 'T00:00:00').getMonth() + 1;
            return monthNum >= startM && monthNum <= endM;
          });

          // Check holidays falling in this month
          const monthHolidays = holidays.filter((h) => {
            const startM = new Date(h.tarikhMula + 'T00:00:00').getMonth() + 1;
            const endM = new Date(h.tarikhAkhir + 'T00:00:00').getMonth() + 1;
            return monthNum >= startM && monthNum <= endM;
          });

          return (
            <div
              key={monthNum}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-400 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Month Card Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {monthName} 2027
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {monthList.length} aktiviti direkodkan
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectMonth(monthNum)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 group"
                  >
                    <span>Buka</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Cadangan Fokus Bulanan */}
                {focus && (
                  <div className="px-4 py-2.5 bg-blue-50/40 border-b border-blue-100 text-xs text-slate-700">
                    <div className="font-semibold text-blue-900 flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>Fokus: {focus.focusTitle}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                      {focus.focusDescription}
                    </p>
                  </div>
                )}

                {/* Key Term Holidays */}
                {monthHolidays.length > 0 && (
                  <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex flex-wrap gap-1">
                    {monthHolidays.map((h) => (
                      <span
                        key={h.id}
                        className="text-[10px] bg-white text-slate-700 px-1.5 py-0.5 rounded-sm border border-slate-200 font-medium"
                      >
                        {h.nama} ({h.tarikhMula.slice(8)}/{h.tarikhMula.slice(5, 7)})
                      </span>
                    ))}
                  </div>
                )}

                {/* Program Items Preview */}
                <div className="p-4 space-y-2">
                  {monthList.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center italic">
                      Tiada program direkodkan
                    </p>
                  ) : (
                    monthList.slice(0, 4).map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => onViewEntry(entry)}
                        className="p-2 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                          <span className="font-mono text-blue-700 font-semibold">
                            {entry.tarikhMula} · {entry.mingguAkademik}
                          </span>
                          <span className="truncate max-w-[100px]">{entry.unitUtama}</span>
                        </div>
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {entry.tajuk}
                        </div>
                      </div>
                    ))
                  )}

                  {monthList.length > 4 && (
                    <button
                      onClick={() => onSelectMonth(monthNum)}
                      className="text-xs text-blue-600 font-medium block w-full text-center py-1 hover:underline"
                    >
                      + {monthList.length - 4} program lagi &rarr;
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => onSelectMonth(monthNum)}
                  className="text-xs font-semibold text-slate-700 hover:text-blue-700 w-full"
                >
                  Lihat Jadual Penuh {monthName}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
