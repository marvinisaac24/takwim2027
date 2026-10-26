import React from 'react';
import { TakwimEntry, HolidayRecord } from '../types/takwim';
import { MONTH_NAMES_MS, DAY_NAMES_MS, getAcademicWeekForDate, getDayStatus } from '../constants/calendar2027';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface MonthlyCalendarViewProps {
  entries: TakwimEntry[];
  holidays: HolidayRecord[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
  onViewEntry: (entry: TakwimEntry) => void;
  onDateClick: (dateStr: string) => void;
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  entries,
  holidays,
  selectedMonth,
  onSelectMonth,
  onViewEntry,
  onDateClick,
}) => {
  const year = 2027;
  const monthIdx = selectedMonth - 1;
  const monthName = MONTH_NAMES_MS[monthIdx];

  // Days in month
  const firstDayOfMonth = new Date(year, monthIdx, 1);
  const lastDayOfMonth = new Date(year, monthIdx + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Calendar starts on Sunday (day 0) to Saturday (day 6)
  const startDayOfWeek = firstDayOfMonth.getDay();

  // Compute weeks array
  const calendarCells: {
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    weekCode: string;
    dayStatus: ReturnType<typeof getDayStatus>;
  }[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, monthIdx, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevMonthNum = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const week = getAcademicWeekForDate(dateStr);
    const status = getDayStatus(dateStr, holidays);
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      weekCode: week.code,
      dayStatus: status,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const week = getAcademicWeekForDate(dateStr);
    const status = getDayStatus(dateStr, holidays);
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      weekCode: week.code,
      dayStatus: status,
    });
  }

  // Next month leading days to complete full 7-day grid rows
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthNum = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const nextYear = selectedMonth === 12 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const week = getAcademicWeekForDate(dateStr);
    const status = getDayStatus(dateStr, holidays);
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      weekCode: week.code,
      dayStatus: status,
    });
  }

  // Group into weeks of 7 days
  const weeks: (typeof calendarCells)[] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  // Helper to get events for a date
  const getEventsForDate = (dateStr: string) => {
    return entries.filter((e) => {
      if (e.isDeleted) return false;
      const start = e.tarikhMula;
      const end = e.tarikhAkhir || start;
      return dateStr >= start && dateStr <= end;
    });
  };

  const getEventBadgeClass = (e: TakwimEntry) => {
    if (e.hasConflictWarning && !e.conflictApproved) {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    switch (e.bidangUtama) {
      case 'Kurikulum':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Pengurusan dan Staf':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Hal Ehwal Murid':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Kokurikulum':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'Panitia Mata Pelajaran':
        return 'bg-teal-100 text-teal-900 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Month Navigation Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-slate-900">
            Kalendar Bulanan: {monthName} {year}
          </h3>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Kalendar Akademik Kumpulan B (Isnin – Jumaat)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectMonth(selectedMonth === 1 ? 12 : selectedMonth - 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 text-slate-700 font-mono">
            {monthName} 2027
          </span>
          <button
            onClick={() => onSelectMonth(selectedMonth === 12 ? 1 : selectedMonth + 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Columns Header (Ahad - Sabtu) */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-700 py-2">
        <div className="text-rose-600">Ahad</div>
        <div>Isnin</div>
        <div>Selasa</div>
        <div>Rabu</div>
        <div>Khamis</div>
        <div>Jumaat</div>
        <div className="text-rose-600">Sabtu</div>
      </div>

      {/* Calendar Grid Rows */}
      <div className="divide-y divide-slate-200">
        {weeks.map((week, wIdx) => {
          // Identify school week slot from the Wednesday or Thursday of this week
          const midDay = week[3] || week[0];
          const weekSlotCode = midDay.weekCode;

          return (
            <div key={wIdx} className="grid grid-cols-7 min-h-[110px] divide-x divide-slate-100">
              {week.map((cell) => {
                const dayEvents = getEventsForDate(cell.dateStr);
                const isHoliday = cell.dayStatus.isHoliday || cell.dayStatus.isSchoolHoliday;
                const isWeekend = cell.dayStatus.statusLabel === 'Hujung Minggu';

                let cellBg = cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 opacity-60';
                if (isHoliday && cell.isCurrentMonth) {
                  cellBg = 'bg-slate-50';
                }

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => onDateClick(cell.dateStr)}
                    className={`${cellBg} p-1.5 flex flex-col justify-between hover:bg-blue-50/30 transition-colors cursor-pointer group`}
                  >
                    {/* Top Row in Cell: Date Number & Slot Tag */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-mono tabular-nums font-bold px-1 rounded-sm ${
                          isWeekend || isHoliday
                            ? 'text-rose-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Week code badge on Monday */}
                      {(cell.dateStr.endsWith('-01') || cell.dayStatus.isWorkingDay) && (
                        <span className="text-[10px] font-mono text-blue-700 font-medium">
                          {cell.weekCode !== 'Tiada Slot' && cell.weekCode !== 'Cuti Penggal' ? cell.weekCode : ''}
                        </span>
                      )}
                    </div>

                    {/* Holiday Indicator */}
                    {cell.dayStatus.holiday && (
                      <div className="text-[10px] bg-slate-200 text-slate-800 px-1 py-0.5 rounded-sm line-clamp-1 mb-1 font-medium">
                        {cell.dayStatus.holiday.nama}
                      </div>
                    )}

                    {/* Events List in Cell */}
                    <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] no-scrollbar">
                      {dayEvents.slice(0, 3).map((event) => {
                        const badgeStyle = getEventBadgeClass(event);
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewEntry(event);
                            }}
                            className={`text-[11px] p-1 rounded-sm border truncate font-medium ${badgeStyle} hover:opacity-80 transition-opacity`}
                            title={`${event.tajuk} (${event.unitUtama})`}
                          >
                            <span className="truncate">{event.tajuk}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-blue-600 font-semibold block px-1">
                          + {dayEvents.length - 3} lagi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
