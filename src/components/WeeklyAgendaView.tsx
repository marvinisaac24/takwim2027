import React, { useState } from 'react';
import { TakwimEntry, HolidayRecord } from '../types/takwim';
import { 
  ACADEMIC_WEEK_DEFINITIONS, 
  getSlotPdPDetails, 
  DAY_NAMES_MS, 
  MONTH_NAMES_MS 
} from '../constants/calendar2027';
import { Calendar, AlertCircle, Clock, MapPin, User, ChevronLeft, ChevronRight, AlertTriangle, FileText } from 'lucide-react';
import { downloadWeeklyAgendaPDF } from '../utils/exportUtils';

interface WeeklyAgendaViewProps {
  entries: TakwimEntry[];
  holidays: HolidayRecord[];
  onViewEntry: (entry: TakwimEntry) => void;
  onOpenCreateModal: () => void;
}

export const WeeklyAgendaView: React.FC<WeeklyAgendaViewProps> = ({
  entries,
  holidays,
  onViewEntry,
  onOpenCreateModal,
}) => {
  const [selectedSlotCode, setSelectedSlotCode] = useState<string>('M01');

  const currentIndex = ACADEMIC_WEEK_DEFINITIONS.findIndex((s) => s.code === selectedSlotCode);
  const currentSlot = ACADEMIC_WEEK_DEFINITIONS[currentIndex] || ACADEMIC_WEEK_DEFINITIONS[0];

  // Calculate PdP details for the slot
  const slotDetails = getSlotPdPDetails(currentSlot.code, holidays);

  // Entries matching this slot
  const slotEntries = entries.filter((e) => {
    if (e.isDeleted) return false;
    // Check if entry's date falls within this week or explicitly assigned
    const entryStart = e.tarikhMula;
    const entryEnd = e.tarikhAkhir || entryStart;
    const weekStart = currentSlot.startDate;
    const weekEnd = currentSlot.endDate;

    const overlaps = entryStart <= weekEnd && entryEnd >= weekStart;
    return overlaps || e.mingguAkademik === currentSlot.code;
  });

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedSlotCode(ACADEMIC_WEEK_DEFINITIONS[currentIndex - 1].code);
    }
  };

  const handleNext = () => {
    if (currentIndex < ACADEMIC_WEEK_DEFINITIONS.length - 1) {
      setSelectedSlotCode(ACADEMIC_WEEK_DEFINITIONS[currentIndex + 1].code);
    }
  };

  return (
    <div className="space-y-6">
      {/* Week Selector Bar & Academic Slot Navigator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Slot Minggu Akademik Kumpulan B: {currentSlot.code}
              </h2>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-sm">
                {currentSlot.startDate} hingga {currentSlot.endDate}
              </span>
              {currentSlot.notes && (
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm">
                  {currentSlot.notes}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span>
                Jumlah Hari PdP Berjadual:{' '}
                <strong className="font-mono text-slate-900">{slotDetails.totalPdPDays} hari</strong>
              </span>
              {slotDetails.pdpStatusNote && (
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200">
                  ⚠️ {slotDetails.pdpStatusNote}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => downloadWeeklyAgendaPDF()}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Muat turun dokumen PDF rasmi Jadual 44 Minggu Persekolahan PdP 2027"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Muat Turun PDF (Minggu PdP)</span>
            </button>

            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Slot Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Dropdown Picker for all 44 Slots */}
            <select
              aria-label="Pilih Slot Minggu M01-M44"
              value={selectedSlotCode}
              onChange={(e) => setSelectedSlotCode(e.target.value)}
              className="bg-slate-100 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-bold font-mono focus:ring-2 focus:ring-blue-500"
            >
              {ACADEMIC_WEEK_DEFINITIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code}: {s.startDate} - {s.endDate} {s.notes ? `(${s.notes})` : ''}
                </option>
              ))}
            </select>

            <button
              onClick={handleNext}
              disabled={currentIndex === ACADEMIC_WEEK_DEFINITIONS.length - 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Slot Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Day School Week Overview (Isnin - Jumaat) */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-slate-100">
          {slotDetails.days.map((day) => {
            const dayName = DAY_NAMES_MS[day.dayOfWeek];
            return (
              <div
                key={day.date}
                className={`p-2.5 rounded-lg border ${
                  day.isPdP
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">{dayName}</span>
                  <span className="font-mono text-[11px] text-slate-500">{day.date.slice(5)}</span>
                </div>
                <div className="text-[11px]">
                  {day.isPdP ? (
                    <span className="text-emerald-700 font-medium">Hari PdP Rasmi</span>
                  ) : (
                    <span className="text-amber-800 font-semibold line-clamp-1" title={day.holidayReason}>
                      Cuti: {day.holidayReason || 'Kelepasan Am'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda Items Scheduled for This Week */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Aktiviti & Program Berjadual ({currentSlot.code})
          </h3>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {slotEntries.length} program direkodkan
          </span>
        </div>

        {slotEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-medium text-slate-600">
              Tiada program direkodkan untuk slot minggu {currentSlot.code}.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Guru boleh mendaftarkan aktiviti atau PLC melalui borang pengisian.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {slotEntries.map((entry) => {
              const hasConflict = entry.hasConflictWarning && !entry.conflictApproved;
              return (
                <div
                  key={entry.id}
                  onClick={() => onViewEntry(entry)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    hasConflict
                      ? 'bg-rose-50/40 border-rose-300 hover:border-rose-400'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                        {entry.tarikhMula} {entry.sepanjangHari ? '(Sepanjang Hari)' : `(${entry.masaMula} - ${entry.masaAkhir})`}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-sm">
                        {entry.bidangUtama}
                      </span>
                      <span className="text-xs font-medium text-slate-600">
                        {entry.unitUtama}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                          entry.statusKelulusan === 'Diluluskan'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {entry.statusKelulusan}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {entry.statusPelaksanaan}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    {entry.tajuk}
                  </h4>
                  {entry.objektif && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {entry.objektif}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {entry.tempat}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {entry.penyelaras}
                    </span>
                    <span>Sasaran: {entry.sasaran?.join(', ') || '-'}</span>
                    {hasConflict && (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Pertindihan dikesan
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
