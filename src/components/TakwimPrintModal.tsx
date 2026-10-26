import React, { useMemo } from 'react';
import { TakwimEntry, HolidayRecord, SchoolSettings } from '../types/takwim';
import { MONTH_NAMES_MS } from '../constants/calendar2027';
import { 
  generateTakwimHTML, 
  printTakwimDocument, 
  downloadPrintableHTML, 
  exportMultiColumnExcel,
  downloadMonthlyTakwimPDF,
  downloadYearlyTakwimPDF
} from '../utils/exportUtils';
import { X, Printer, Download, FileSpreadsheet, Eye, Info, CheckCircle2, FileText } from 'lucide-react';

interface TakwimPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TakwimEntry[];
  holidays: HolidayRecord[];
  selectedMonth: number;
  settings?: SchoolSettings;
}

export const TakwimPrintModal: React.FC<TakwimPrintModalProps> = ({
  isOpen,
  onClose,
  entries,
  holidays,
  selectedMonth,
  settings,
}) => {
  const monthName = MONTH_NAMES_MS[selectedMonth - 1] || 'Bulan';

  const previewHTML = useMemo(() => {
    if (!isOpen) return '';
    return generateTakwimHTML(entries, holidays, selectedMonth, settings);
  }, [isOpen, entries, holidays, selectedMonth, settings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Cetak Takwim Persekolahan A4 Landskap</span>
                <span className="bg-blue-500/30 text-blue-200 text-xs px-2 py-0.5 rounded-full font-mono">
                  {monthName} 2027
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Format Rasmi Kementerian Pendidikan Malaysia · SK Tudan ({settings?.schoolCode || 'YBB4345'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => downloadMonthlyTakwimPDF(entries, holidays, selectedMonth, settings)}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-700/30 transition-colors"
              title="Muat turun fail dokumen PDF Takwim Bulanan rasmi"
            >
              <FileText className="w-4 h-4" />
              <span>Muat Turun PDF (Bulan Ini)</span>
            </button>
            <button
              onClick={() => downloadYearlyTakwimPDF(entries, holidays, settings)}
              className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-700/30 transition-colors"
              title="Muat turun buku PDF Takwim Penuh 12 Bulan 2027"
            >
              <FileText className="w-4 h-4" />
              <span>PDF 12 Bulan</span>
            </button>
            <button
              onClick={() => printTakwimDocument(entries, holidays, selectedMonth, settings)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-colors"
              title="Hantar arahan cetak ke pencetak komputer atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>
            <button
              onClick={() => downloadPrintableHTML(entries, holidays, selectedMonth, settings)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              title="Muat turun fail dokumen HTML bercetak untuk dibuka dan dicetak pada bila-bila masa"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>HTML</span>
            </button>
            <button
              onClick={() => exportMultiColumnExcel(entries, holidays, selectedMonth, settings)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              title="Muat turun fail lembaran kerja Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-2"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printer Setup Guidelines Bar */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <strong>Panduan Cetakan Pencetak:</strong> Pada tetingkap cetakan, pilih <strong>Saiz Kertas: A4</strong>, <strong>Orientasi: Landscape (Melintang)</strong>, dan tandakan <strong>"Background graphics" / "Grafik latar belakang"</strong> untuk warna penuh.
            </div>
          </div>
          <span className="hidden sm:inline text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg">
            5 Ruang Tandatangan Pentadbir Disertakan
          </span>
        </div>

        {/* Document Preview Frame */}
        <div className="flex-1 bg-slate-100 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-slate-300 p-6 overflow-x-auto">
            <div
              dangerouslySetInnerHTML={{ __html: previewHTML }}
              className="takwim-preview-content"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            Jika fungsi cetak disekat oleh pelayar peranti, gunakan butang <strong>"Muat Turun HTML"</strong> untuk membuka fail di tab baharu dan tekan <strong>Ctrl + P</strong>.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100"
          >
            Tutup Pratonton
          </button>
        </div>
      </div>
    </div>
  );
};
