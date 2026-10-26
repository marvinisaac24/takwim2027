import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { BidangType, SchoolSettings } from '../types/takwim';
import { SKASTUMSItem, SKASStandardId } from '../types/plcAndSkas';
import { 
  SKAS_OFFICIAL_ITEMS, 
  downloadSKASInstrumentExcel, 
  downloadSKASMappingReportExcel 
} from '../constants/skasStandards';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  AlertTriangle, 
  Check, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  FileText, 
  BarChart3, 
  Clock, 
  BookOpen, 
  ShieldCheck 
} from 'lucide-react';

interface SKASInstrumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterProgram: (item: SKASTUMSItem) => void;
  settings?: SchoolSettings;
}

export const SKASInstrumentModal: React.FC<SKASInstrumentModalProps> = ({
  isOpen,
  onClose,
  onRegisterProgram,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'analisis' | 'muat-naik' | 'rubrik'>('analisis');
  const [selectedStandard, setSelectedStandard] = useState<SKASStandardId | 'Semua'>('Semua');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'Semua' | 'Perlu Intervensi' | 'Baik' | 'Cemerlang'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive score map per item ID
  const [scoresMap, setScoresMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const item of SKAS_OFFICIAL_ITEMS) {
      map[item.aspekKod] = item.skorLalai || 3;
    }
    return map;
  });

  const [uploadedInstruments, setUploadedInstruments] = useState<{
    id: string;
    fileName: string;
    uploadedAt: string;
    itemCount: number;
    skorPurata: number;
  }[]>([
    {
      id: 'skas-inst-initial',
      fileName: 'Instrumen_Penilaian_Kendiri_SKAS_SKPM_SK_Tudan_2026_2027.xlsx',
      uploadedAt: '2026-10-18',
      itemCount: SKAS_OFFICIAL_ITEMS.length,
      skorPurata: 3.4
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const standardsList: (SKASStandardId | 'Semua')[] = [
    'Semua',
    'Standard 1',
    'Standard 2',
    'Standard 3.1',
    'Standard 3.2',
    'Standard 3.3',
    'Standard 4'
  ];

  // Set score for specific aspect
  const handleSetScore = (aspekKod: string, newScore: number) => {
    setScoresMap(prev => ({
      ...prev,
      [aspekKod]: newScore
    }));
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return SKAS_OFFICIAL_ITEMS.filter((item) => {
      // 1. Standard filter
      if (selectedStandard !== 'Semua' && item.standardId !== selectedStandard) {
        return false;
      }

      // 2. Status filter based on current score
      const score = scoresMap[item.aspekKod] !== undefined ? scoresMap[item.aspekKod] : (item.skorLalai || 3);
      const status = score >= 4 ? 'Cemerlang' : score === 3 ? 'Baik' : 'Perlu Intervensi';
      if (selectedStatusFilter !== 'Semua' && status !== selectedStatusFilter) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mKod = item.aspekKod.toLowerCase().includes(q);
        const mNama = item.aspekNama.toLowerCase().includes(q);
        const mTindakan = item.tindakanPGB.toLowerCase().includes(q);
        const mProg = item.cadanganTajukProgram.toLowerCase().includes(q);
        const mBidang = item.bidangTakwim.toLowerCase().includes(q);
        if (!mKod && !mNama && !mTindakan && !mProg && !mBidang) return false;
      }

      return true;
    });
  }, [selectedStandard, selectedStatusFilter, searchQuery, scoresMap]);

  // Overall Statistics
  const stats = useMemo(() => {
    const scores = Object.values(scoresMap);
    const total = scores.length || 1;
    const sum = scores.reduce((acc, s) => acc + s, 0);
    const avg = (sum / total).toFixed(2);
    const perluIntervensiCount = scores.filter(s => s <= 2).length;
    const baikCount = scores.filter(s => s === 3).length;
    const cemerlangCount = scores.filter(s => s >= 4).length;

    return {
      avg,
      perluIntervensiCount,
      baikCount,
      cemerlangCount,
      totalItems: SKAS_OFFICIAL_ITEMS.length
    };
  }, [scoresMap]);

  // Handle Upload of SK@S Assessment File
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
            for (const item of json) {
              const kod = item.kod || item.aspekKod || item.item;
              const skor = Number(item.skor || item.score);
              if (kod && !isNaN(skor)) {
                setScoresMap(prev => ({ ...prev, [kod]: skor }));
              }
            }
          }
        } else {
          const workbook = XLSX.read(data, { type: 'binary', cellDates: false });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

          // Parse rows looking for aspect codes and scores
          let updatedCount = 0;
          const newMap = { ...scoresMap };

          for (const row of rows) {
            if (!Array.isArray(row)) continue;
            for (let i = 0; i < row.length; i++) {
              const cell = String(row[i] || '').trim();
              // Check if cell looks like aspect code (e.g. 1.1.1, 3.1.2.3, 4.1.1)
              const match = cell.match(/\b([1-4]\.[0-9]+(\.[0-9]+(\.[0-9]+)?)?)\b/);
              if (match) {
                const kod = match[1];
                // Look for adjacent number 1-4 in row
                for (let j = 0; j < row.length; j++) {
                  const val = Number(row[j]);
                  if (!isNaN(val) && val >= 1 && val <= 4 && j !== i) {
                    newMap[kod] = val;
                    updatedCount++;
                    break;
                  }
                }
              }
            }
          }

          if (updatedCount > 0) {
            setScoresMap(newMap);
          }
        }

        const newInst = {
          id: `skas-${Date.now()}`,
          fileName: file.name,
          uploadedAt: new Date().toISOString().split('T')[0],
          itemCount: SKAS_OFFICIAL_ITEMS.length,
          skorPurata: Number(stats.avg)
        };
        setUploadedInstruments(prev => [newInst, ...prev]);

        setStatusMsg({
          text: `Fail "${file.name}" berjaya diproses! Skor instrumen SK@S telah dikemas kini dan menjana cadangan program takwim terkini.`,
          type: 'success'
        });
      } catch (err: any) {
        setStatusMsg({ text: `Ralat semasa memproses fail instrumen SK@S: ${err.message}`, type: 'error' });
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setStatusMsg({ text: 'Gagal membaca fail yang dimuat naik.', type: 'error' });
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md text-amber-300 flex items-center justify-center shrink-0 border border-white/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Ruang Instrumen Penilaian SK@S (SKPM Kualiti @Sekolah KPM)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded-full">
                  Standard Kualiti Sekolah 2027
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Merujuk item Standard 1 hingga 4 SK@S bagi mencadangkan program dan aktiviti takwim yang tepat, berimpak tinggi dan memenuhi evidens wajib
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Action Buttons */}
        <div className="px-6 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('analisis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'analisis'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Analisis Skor & Cadangan Program Takwim</span>
            </button>

            <button
              onClick={() => setActiveTab('muat-naik')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'muat-naik'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ruang Muat Naik Instrumen SK@S</span>
            </button>

            <button
              onClick={() => setActiveTab('rubrik')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'rubrik'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Rubrik Tindakan & Evidens KPM</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Mapping Report Button */}
            <button
              type="button"
              onClick={() => downloadSKASMappingReportExcel(SKAS_OFFICIAL_ITEMS, scoresMap, settings?.schoolName || 'SK Tudan, Miri')}
              className="px-3 py-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Muat turun fail Excel pemetaan lengkap item SK@S kepada aktiviti Takwim 2027"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-700" />
              <span>Eksport Pemetaan SK@S & Takwim</span>
            </button>

            {/* Download Blank Instrument */}
            <button
              type="button"
              onClick={() => downloadSKASInstrumentExcel(settings?.schoolName || 'SK Tudan, Miri')}
              className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Muat turun templat instrumen penilaian SK@S kosong untuk diisi"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Templat Skor SK@S</span>
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className={`mx-6 mt-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
            <button onClick={() => setStatusMsg(null)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 1: ANALISIS SKOR & CADANGAN PROGRAM TAKWIM */}
        {activeTab === 'analisis' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* Top Diagnostic KPI Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Skor Purata SK@S</div>
                <div className="text-xl font-bold text-blue-950 mt-1">{stats.avg} / 4.00</div>
                <div className="text-[10px] text-blue-800/80 mt-0.5">Tahap: {Number(stats.avg) >= 3.5 ? 'Taraf Cemerlang' : 'Taraf Harapan'}</div>
              </div>

              <div className="p-3.5 bg-linear-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-2xl">
                <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Perlu Intervensi (Skor ≤ 2)</div>
                <div className="text-xl font-bold text-rose-950 mt-1">{stats.perluIntervensiCount} Item</div>
                <div className="text-[10px] text-rose-800/80 mt-0.5">Program pemulihan/intervensi dijana</div>
              </div>

              <div className="p-3.5 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Tahap Cemerlang (Skor 4)</div>
                <div className="text-xl font-bold text-emerald-950 mt-1">{stats.cemerlangCount} Item</div>
                <div className="text-[10px] text-emerald-800/80 mt-0.5">Evidens penuh disahkan</div>
              </div>

              <div className="p-3.5 bg-linear-to-r from-slate-50 to-purple-50 border border-slate-200 rounded-2xl">
                <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Jumlah Aspek Dinilai</div>
                <div className="text-xl font-bold text-purple-950 mt-1">{stats.totalItems} Aspek KPM</div>
                <div className="text-[10px] text-purple-800/80 mt-0.5">Standard 1 hingga Standard 4</div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari aspek SK@S, kod TUMS, atau program..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600 shrink-0">Status Skor:</span>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Perlu Intervensi">Perlu Intervensi (Skor ≤ 2)</option>
                    <option value="Baik">Tahap Baik (Skor 3)</option>
                    <option value="Cemerlang">Tahap Cemerlang (Skor 4)</option>
                  </select>
                </div>
              </div>

              {/* Standard Filter Pills */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Standard:</span>
                {standardsList.map((std) => (
                  <button
                    key={std}
                    onClick={() => setSelectedStandard(std)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      selectedStandard === std
                        ? 'bg-blue-800 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    {std}
                  </button>
                ))}
              </div>
            </div>

            {/* List of SK@S Items with Recommended Programs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Menemui <strong className="text-slate-800">{filteredItems.length}</strong> item SK@S berserta padanan cadangan program takwim
                </span>
                <span className="text-[11px] text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                  ★ Anda boleh mengubah skor 1-4 secara langsung pada setiap kad
                </span>
              </div>

              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const currentScore = scoresMap[item.aspekKod] !== undefined ? scoresMap[item.aspekKod] : (item.skorLalai || 3);
                  const isIntervention = currentScore <= 2;
                  const isExcellent = currentScore >= 4;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isIntervention 
                          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400' 
                          : isExcellent 
                          ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-400' 
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      } shadow-2xs space-y-3`}
                    >
                      {/* Item Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-white rounded-md font-mono">
                              {item.aspekKod}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-900 rounded-md">
                              {item.standardId}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {item.aspekNama}
                            </span>
                            {isIntervention && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Perlu Intervensi Segera</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                            <strong>Tindakan PGB/Sekolah:</strong> {item.tindakanPGB}
                          </p>
                        </div>

                        {/* Interactive Score Selector */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-white p-1.5 rounded-xl border border-slate-200 self-start">
                          <span className="text-[10px] font-bold text-slate-500 mr-1">Skor:</span>
                          {[1, 2, 3, 4].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleSetScore(item.aspekKod, s)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                currentScore === s
                                  ? s <= 2
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : s === 3
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title={`Tetapkan Skor ${s} (${s <= 2 ? 'Perlu Intervensi' : s === 3 ? 'Tahap Baik' : 'Tahap Cemerlang'})`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Required Evidence */}
                      <div className="text-[11px] text-slate-600 bg-slate-100/70 p-2 rounded-xl flex items-start gap-1.5 border border-slate-200/70">
                        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Evidens Pelaksanaan Wajib:</strong>{' '}
                          {item.evidensDiperlukan.join(' · ')}
                        </div>
                      </div>

                      {/* Recommended Takwim Program Box */}
                      <div className="p-3 bg-linear-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-300">
                              Cadangan Program Takwim Tepat:
                            </span>
                            <span className="text-[10px] font-semibold text-slate-600">
                              Lajur: <strong className="text-slate-800">{item.bidangTakwim}</strong> · Unit: <strong className="text-slate-800">{item.unitCadangan}</strong>
                            </span>
                          </div>
                          
                          <div className="text-xs font-bold text-blue-950">
                            {item.cadanganTajukProgram}
                          </div>

                          <div className="text-[11px] text-slate-600">
                            {item.objektifProgram}
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center gap-3 pt-0.5">
                            <span>Bulan Cadangan: <strong>Bulan {item.cadanganBulan.join(', ')}</strong></span>
                            <span>Penyelaras: <strong>{item.penyelarasCadangan}</strong></span>
                            <span>Tempat: <strong>{item.cadanganTempat}</strong></span>
                          </div>
                        </div>

                        {/* Direct Register Button */}
                        <button
                          type="button"
                          onClick={() => {
                            onRegisterProgram(item);
                            onClose();
                          }}
                          className="px-3.5 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-center"
                          title="Daftar program ini terus ke Takwim Persekolahan 2027"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Daftar ke Takwim</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: RUANG MUAT NAIK INSTRUMEN SK@S */}
        {activeTab === 'muat-naik' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* Upload Box */}
            <div className="p-6 bg-linear-to-br from-blue-50 via-slate-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-6 h-6" />
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Muat Naik Fail Instrumen Penilaian SK@S (SKPM Kualiti @Sekolah)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Muat naik fail Excel (.xlsx/.xls), CSV, JSON, atau teks skor SK@S yang telah diisi. Sistem mengekstrak markah setiap aspek secara automatik dan memetakan kepada program takwim yang tepat.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv,.json,.txt"
                  className="hidden"
                  id="skas-upload-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-800/20 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isProcessing ? 'Memproses Instrumen...' : 'Pilih Fail Instrumen SK@S Dari Komputer'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadSKASInstrumentExcel(settings?.schoolName || 'SK Tudan, Miri')}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-all inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Muat Turun Templat Excel Rasmi</span>
                </button>
              </div>
            </div>

            {/* List of Uploaded Instruments History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rekod Instrumen SK@S yang Telah Diproses ({uploadedInstruments.length}):
                </h4>
                <span className="text-[11px] text-slate-500">
                  Skor terkini aktif memandu penjanaan program takwim
                </span>
              </div>

              <div className="space-y-2.5">
                {uploadedInstruments.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{inst.fileName}</div>
                        <div className="text-[10px] text-slate-500">
                          Tarikh: {inst.uploadedAt} · Bilangan Aspek: {inst.itemCount} · Skor Purata: {inst.skorPurata}/4.00
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300">
                      Aktif & Digunakan
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: RUBRIK TINDAKAN & EVIDENS KPM */}
        {activeTab === 'rubrik' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
              <strong>Garis Panduan Instrumen SK@S (SKPM Kualiti @Sekolah):</strong> Setiap item dinilai berasaskan 4 Tahap Tindakan. Sekolah disyorkan merancang program takwim berfokus bagi setiap aspek untuk memastikan evidens lengkap dan skor mencapai <strong>Tahap Cemerlang (Skor 4)</strong>.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">4</span>
                  <span>Skor 4: Tahap Tindakan Cemerlang</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tindakan dilaksanakan secara menyeluruh, mematuhi ketetapan pekeliling KPM, didokumentasikan dengan evidens lengkap, dan disemak secara berkala untuk penambahbaikan berterusan.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                  <span>Skor 3: Tahap Tindakan Baik</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tindakan dilaksanakan dengan mematuhi sebahagian besar ketetapan dan didokumentasikan, namun memerlukan pemantauan berterusan dan pemantapan evidens.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                  <span>Skor 2: Tahap Tindakan Sederhana</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tindakan hanya dilaksanakan sebahagian kecil atau bersifat ad-hoc tanpa perancangan strategik berstruktur. <strong>Perlu intervensi terancang dalam takwim</strong>.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                  <span>Skor 1: Tahap Tindakan Sangat Lemah</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tiada tindakan diambil atau tiada bukti evidens pelaksanaan. Memerlukan pelan tindakan pemulihan segera oleh pentadbir dan panitia.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            SK Tudan Miri · Penjajaran Takwim Sekolah dengan SK@S KPM Sesi 2027
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
