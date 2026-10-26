import React from 'react';
import { TakwimEntry, PanitiaConfig, BidangType } from '../types/takwim';
import { MONTH_NAMES_MS } from '../constants/calendar2027';
import { 
  CalendarCheck2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  CalendarDays, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Building,
  UserCheck
} from 'lucide-react';

interface DashboardViewProps {
  entries: TakwimEntry[];
  panitiaList: PanitiaConfig[];
  onSelectMonth: (month: number) => void;
  onOpenCreateModal: () => void;
  onSelectBidang: (bidang: string) => void;
  onViewEntry: (entry: TakwimEntry) => void;
  onGoToApprovals: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  entries,
  panitiaList,
  onSelectMonth,
  onOpenCreateModal,
  onSelectBidang,
  onViewEntry,
  onGoToApprovals,
}) => {
  const activeEntries = entries.filter((e) => !e.isDeleted);

  // De-duplicate multi-unit shared programs: Count unique event IDs
  const uniqueApprovedEvents = activeEntries.filter((e) => e.statusKelulusan === 'Diluluskan');
  const pendingApprovals = activeEntries.filter(
    (e) => e.statusKelulusan === 'Dihantar' || e.statusKelulusan === 'Perlu Pindaan'
  );
  const completedEntries = activeEntries.filter((e) => e.statusPelaksanaan === 'Selesai');
  const postponedOrCancelled = activeEntries.filter(
    (e) => e.statusPelaksanaan === 'Ditangguhkan' || e.statusPelaksanaan === 'Dibatalkan'
  );

  // Conflict count (entries with conflict warning that have NOT been approved with override)
  const unresolvedConflicts = activeEntries.filter(
    (e) => e.hasConflictWarning && !e.conflictApproved
  );

  // Current date reference (using 2027-01-04 as the school session start date for demo projection, or system date)
  const baseDateStr = '2027-01-04';
  const baseDate = new Date(baseDateStr + 'T00:00:00');

  // Next 7 days and 30 days upcoming programs
  const next7Days = activeEntries.filter((e) => {
    const d = new Date(e.tarikhMula + 'T00:00:00');
    const diff = (d.getTime() - baseDate.getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 7;
  });

  const next30Days = activeEntries.filter((e) => {
    const d = new Date(e.tarikhMula + 'T00:00:00');
    const diff = (d.getTime() - baseDate.getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 30;
  });

  // Panitia that have not yet submitted any program
  const activePanitias = panitiaList.filter((p) => p.aktif && p.jenis === 'Panitia Mata Pelajaran');
  const missingSubmissionPanitias = activePanitias.filter((pan) => {
    const hasSubmitted = activeEntries.some(
      (e) => e.unitUtama.toLowerCase() === pan.nama.toLowerCase() || e.unitBersama?.includes(pan.nama)
    );
    return !hasSubmitted;
  });

  // Breakdown by Bidang
  const bidangList: BidangType[] = [
    'Kurikulum',
    'Pengurusan dan Staf',
    'Hal Ehwal Murid',
    'Kokurikulum',
    'Panitia Mata Pelajaran',
  ];

  const bidangBreakdown = bidangList.map((bidang) => {
    const count = uniqueApprovedEvents.filter((e) => e.bidangUtama === bidang).length;
    return { bidang, count };
  });

  // Monthly breakdown
  const monthlyCounts = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const count = uniqueApprovedEvents.filter((e) => e.bulan === month).length;
    return { month, name: MONTH_NAMES_MS[i], count };
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Papan Pemuka e-Takwim Sekolah Kebangsaan Tudan 2027
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Pengurusan bersepadu takwim akademik, program panitia, semakan bertindih, dan pemantauan pelaksanaan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>+ Cipta Pengisian Baharu</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (60-30-10 discipline) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Approved Programs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Program Diluluskan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {uniqueApprovedEvents.length}
            </span>
            <span className="text-xs text-slate-500">acara rasmi</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Acara bersama dikira sekali sahaja
          </div>
        </div>

        {/* Pending Approvals */}
        <div 
          onClick={onGoToApprovals}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Menunggu Semakan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-600">
              {pendingApprovals.length}
            </span>
            <span className="text-xs text-slate-500">permohonan</span>
          </div>
          <div className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1">
            <span>Klik untuk semak & luluskan</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Completed vs Pending Execution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Status Pelaksanaan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {completedEntries.length}
            </span>
            <span className="text-xs text-slate-500">selesai</span>
            <span className="text-xs text-slate-400">· {postponedOrCancelled.length} tertangguh</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {activeEntries.filter((e) => e.statusPelaksanaan === 'Belum Bermula').length} belum bermula
          </div>
        </div>

        {/* Unresolved Conflicts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pertindihan Jadual</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              unresolvedConflicts.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${
              unresolvedConflicts.length > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {unresolvedConflicts.length}
            </span>
            <span className="text-xs text-slate-500">konflik dikesan</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Masa, tempat, pegawai atau sasaran
          </div>
        </div>
      </div>

      {/* 2-Column Split: Monthly Distribution & Upcoming 7/30 Days */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Monthly Grid & Bidang Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Program Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Agihan Program Mengikut Bulan (2027)
                </h3>
                <span className="text-xs text-slate-500">
                  Klik mana-mana bulan untuk membuka takwim lengkap
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {monthlyCounts.map((m) => (
                <button
                  key={m.month}
                  onClick={() => onSelectMonth(m.month)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-colors flex flex-col justify-between group"
                >
                  <span className="text-xs font-medium text-slate-700 group-hover:text-blue-700">
                    {m.name}
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-bold font-mono tabular-nums text-slate-900 group-hover:text-blue-700">
                      {m.count}
                    </span>
                    <span className="text-[11px] text-slate-400">program</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown by Bidang */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Agihan Program Mengikut Bidang Pengurusan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bidangBreakdown.map((b) => (
                <div
                  key={b.bidang}
                  onClick={() => onSelectBidang(b.bidang)}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/50"
                >
                  <span className="text-xs font-semibold text-slate-800 block truncate">
                    {b.bidang}
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                      {b.count}
                    </span>
                    <span className="text-xs text-blue-600 hover:underline">Papar rekod &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Panitia Submission Alert */}
          {missingSubmissionPanitias.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Peringatan: Panitia Belum Menghantar Perancangan Takwim
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Terdapat {missingSubmissionPanitias.length} panitia mata pelajaran belum mendaftarkan sebarang program atau mesyuarat awal sesi:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {missingSubmissionPanitias.map((p) => (
                      <span
                        key={p.id}
                        className="text-[11px] bg-white text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-medium"
                      >
                        {p.nama} {p.ketua ? `(${p.ketua})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 span): Upcoming 7 & 30 Days Agenda */}
        <div className="space-y-6">
          {/* Upcoming 7 Days */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>Program 7 Hari Akan Datang</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {next7Days.length} acara
              </span>
            </div>

            {next7Days.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Tiada program dijadualkan dalam tempoh 7 hari ini.
              </p>
            ) : (
              <div className="space-y-2.5">
                {next7Days.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => onViewEntry(entry)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-mono tabular-nums text-blue-700 font-semibold">
                        {entry.tarikhMula} · {entry.mingguAkademik}
                      </span>
                      <span>{entry.sepanjangHari ? 'Sepanjang Hari' : entry.masaMula}</span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-900 line-clamp-1">
                      {entry.tajuk}
                    </h5>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span className="truncate">{entry.unitUtama}</span>
                      <span>·</span>
                      <span className="truncate">{entry.tempat}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming 30 Days Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>Program 30 Hari Akan Datang</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {next30Days.length} acara
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {next30Days.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => onViewEntry(entry)}
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                    <span className="font-mono tabular-nums font-medium">{entry.tarikhMula}</span>
                    <span className="text-blue-600 font-medium">{entry.unitUtama}</span>
                  </div>
                  <div className="font-medium text-slate-800 line-clamp-1">
                    {entry.tajuk}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
