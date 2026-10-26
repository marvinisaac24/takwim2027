import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { BidangType, PanitiaConfig, SchoolSettings } from '../types/takwim';
import { PLCActivityItem, PLCToolType, PLCUploadedKit } from '../types/plcAndSkas';
import { KPM_PLC_TOOL_DEFINITIONS, getPLCActivitiesForPanitia, downloadPLCToolkitExcel } from '../constants/plcToolkits';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  BookOpen, 
  Calendar, 
  Search, 
  Filter, 
  Layers, 
  Check, 
  Plus,
  FileText,
  Trash2,
  ExternalLink,
  Award,
  Clock,
  MapPin
} from 'lucide-react';

interface PLCKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterPLC: (activity: PLCActivityItem) => void;
  initialPanitia?: string;
  panitiaList?: PanitiaConfig[];
  settings?: SchoolSettings;
}

export const PLCKitModal: React.FC<PLCKitModalProps> = ({
  isOpen,
  onClose,
  onRegisterPLC,
  initialPanitia = 'Bahasa Melayu',
  panitiaList = [],
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'katalog' | 'muat-naik' | 'definisi'>('katalog');
  const [selectedPanitia, setSelectedPanitia] = useState<string>(initialPanitia);
  const [selectedToolFilter, setSelectedToolFilter] = useState<PLCToolType | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload states
  const [uploadedKits, setUploadedKits] = useState<PLCUploadedKit[]>([
    {
      id: 'kit-kpm-1',
      fileName: 'Buku_Panduan_Pelaksanaan_PLC_KPM_Edisi_3.pdf',
      fileType: 'PDF Document',
      fileSize: '2.4 MB',
      panitia: 'Semua Panitia',
      uploadedAt: '2026-10-20',
      uploadedBy: 'Pn. Hajah Fatimah (Guru Besar)',
      tajukKit: 'Panduan Rasmi Pelaksanaan Komuniti Pembelajaran Profesional KPM',
      alatPLC: ['Lesson Study', 'Peer Coaching', 'Learning Walk', 'Teacher Sharing Sessions'],
      penerangan: 'Kit rujukan komprehensif memuatkan sarana dan borang instrumen PLC untuk kegunaan semua ketua panitia.'
    },
    {
      id: 'kit-bm-1',
      fileName: 'Modul_Lesson_Study_Karangan_Tahap2_BM.docx',
      fileType: 'Word Document',
      fileSize: '840 KB',
      panitia: 'Bahasa Melayu',
      uploadedAt: '2026-10-22',
      uploadedBy: 'Pn. Dayang Norliza (KP BM)',
      tajukKit: 'Kit Lesson Study Penulisan Karangan Tahap 2 SK Tudan',
      alatPLC: ['Lesson Study', 'Teacher Sharing Sessions'],
      penerangan: 'Mengandungi 3 templat RPH kolaboratif dan rubrik bimbingan murid pemulihan dan aras sederhana.'
    }
  ]);
  const [uploadPanitia, setUploadPanitia] = useState<string>(initialPanitia);
  const [uploadTajuk, setUploadTajuk] = useState('');
  const [uploadPenerangan, setUploadPenerangan] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync panitia when initialPanitia changes
  React.useEffect(() => {
    if (initialPanitia) {
      setSelectedPanitia(initialPanitia);
      setUploadPanitia(initialPanitia);
    }
  }, [initialPanitia, isOpen]);

  // List of all panitias
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

  // Fetch activities for selected panitia
  const activities = useMemo(() => {
    const list = getPLCActivitiesForPanitia(selectedPanitia);
    return list.filter((item) => {
      if (selectedToolFilter !== 'Semua' && item.alatPLC !== selectedToolFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = item.tajukAktiviti.toLowerCase().includes(q);
        const mObj = item.objektif.toLowerCase().includes(q);
        const mFocus = item.fokusPedagogi.toLowerCase().includes(q);
        const mTool = item.alatPLC.toLowerCase().includes(q);
        if (!mTitle && !mObj && !mFocus && !mTool) return false;
      }
      return true;
    });
  }, [selectedPanitia, selectedToolFilter, searchQuery]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMsg(null);

    setTimeout(() => {
      const newKit: PLCUploadedKit = {
        id: `kit-${Date.now()}`,
        fileName: file.name,
        fileType: file.name.split('.').pop()?.toUpperCase() || 'File',
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        panitia: uploadPanitia,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'Ketua Panitia / Guru SK Tudan',
        tajukKit: uploadTajuk.trim() || `Kit PLC ${uploadPanitia}: ${file.name.replace(/\.[^/.]+$/, '')}`,
        alatPLC: ['Lesson Study', 'Teacher Sharing Sessions'],
        penerangan: uploadPenerangan.trim() || `Bahan rujukan dan kit bimbingan PLC yang dimuat naik bagi kegunaan Panitia ${uploadPanitia}.`
      };

      setUploadedKits(prev => [newKit, ...prev]);
      setStatusMsg({ text: `Fail "${file.name}" berjaya dimuat naik ke repositori Kit PLC Panitia ${uploadPanitia}!`, type: 'success' });
      setUploadTajuk('');
      setUploadPenerangan('');
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 600);
  };

  const handleDeleteKit = (id: string) => {
    setUploadedKits(prev => prev.filter(k => k.id !== id));
    setStatusMsg({ text: 'Kit PLC telah dipadamkan daripada repositori.', type: 'success' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-linear-to-r from-teal-700 via-teal-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md text-amber-300 flex items-center justify-center shrink-0 border border-white/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Ruang Kit PLC (Komuniti Pembelajaran Profesional)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded-full">
                  KPM SK Tudan 2027
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Pilih dan jadualkan aktiviti PLC khusus mengikut panitia masing-masing berlandaskan 9 Alat Rasmi PLC KPM
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

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('katalog')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'katalog'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Katalog Aktiviti PLC Mengikut Panitia</span>
            </button>

            <button
              onClick={() => setActiveTab('muat-naik')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'muat-naik'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ruang Muat Naik Kit PLC</span>
              {uploadedKits.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'muat-naik' ? 'bg-white text-teal-800' : 'bg-teal-100 text-teal-800'
                }`}>
                  {uploadedKits.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('definisi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'definisi'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan 9 Alat PLC KPM</span>
            </button>
          </div>

          {/* Download Sarana Template Button */}
          <button
            type="button"
            onClick={() => downloadPLCToolkitExcel(selectedPanitia, settings?.schoolName || 'SK Tudan, Miri')}
            className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs"
            title={`Muat turun fail templat Excel instrumen & sarana PLC untuk Panitia ${selectedPanitia}`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Muat Turun Templat PLC ({selectedPanitia})</span>
          </button>
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

        {/* TAB 1: KATALOG AKTIVITI PLC MENGIKUT PANITIA */}
        {activeTab === 'katalog' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* Filter Bar: Panitia Selector & Tool Filters */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              
              {/* Panitia Selector Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pilih Panitia Mata Pelajaran:
                  </span>
                  <select
                    value={selectedPanitia}
                    onChange={(e) => setSelectedPanitia(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs font-bold text-teal-950 focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  >
                    {allPanitias.map((pName) => (
                      <option key={pName} value={pName}>
                        Panitia {pName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari aktiviti PLC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* 9 Tools Pill Filter */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Alat PLC:</span>
                {[
                  'Semua',
                  'Lesson Study',
                  'Peer Coaching',
                  'Learning Walk',
                  'Teacher Sharing Sessions',
                  'Data Analysis',
                  'Video Critique',
                  'Curriculum Mapping'
                ].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedToolFilter(tool as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      selectedToolFilter === tool
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Activities for this Panitia */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Menemui <strong className="text-slate-800">{activities.length}</strong> cadangan aktiviti PLC bagi <strong>Panitia {selectedPanitia}</strong>
                </span>
                <span className="text-[11px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-md border border-teal-200">
                  Klik "Daftar ke Takwim" untuk menjadualkan terus
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activities.map((act) => {
                  return (
                    <div
                      key={act.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-2">
                        {/* Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="px-2.5 py-1 text-[10px] font-bold bg-teal-100 text-teal-900 rounded-lg border border-teal-200">
                            {act.alatPLC}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Bulan Cadangan: {act.cadanganBulan.map(b => `${b}`).join(', ')}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                          {act.tajukAktiviti}
                        </h4>

                        {/* Objective */}
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {act.objektif}
                        </p>

                        {/* Pedagogical Focus */}
                        <div className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-700 border border-slate-200/80 space-y-1">
                          <div>
                            <span className="font-bold text-teal-900">Fokus Pedagogi: </span>
                            <span>{act.fokusPedagogi}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">Instrumen/Toolkit: </span>
                            <span className="text-slate-600">{act.alatToolkit.join(' · ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-slate-500">
                          Tindakan: <span className="font-semibold text-slate-700">{act.tindakan}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onRegisterPLC(act);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                          title="Daftar aktiviti PLC ini terus ke Takwim Persekolahan 2027"
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

        {/* TAB 2: RUANG MUAT NAIK KIT PLC */}
        {activeTab === 'muat-naik' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* Upload Area Card */}
            <div className="p-5 bg-linear-to-br from-teal-50 via-slate-50 to-indigo-50 border-2 border-dashed border-teal-300 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-6 h-6" />
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Muat Naik Modul, Borang Sarana, atau Panduan Kit PLC
                </h3>
                <p className="text-xs text-slate-500">
                  Sokongan fail: <strong>PDF, Word (.docx), Excel (.xlsx/.csv), PowerPoint, atau Teks</strong>.
                </p>
              </div>

              {/* Form inputs for Upload */}
              <div className="max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Panitia Sasaran:
                  </label>
                  <select
                    value={uploadPanitia}
                    onChange={(e) => setUploadPanitia(e.target.value)}
                    className="w-full text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Semua Panitia">Semua Panitia (Umum)</option>
                    {allPanitias.map((p) => (
                      <option key={p} value={p}>Panitia {p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tajuk Kit PLC (Pilihan):
                  </label>
                  <input
                    type="text"
                    placeholder="cth: Kit Lesson Study Matematik"
                    value={uploadTajuk}
                    onChange={(e) => setUploadTajuk(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.txt,.json"
                  className="hidden"
                  id="plc-file-upload-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-700/20 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Memproses Fail...' : 'Pilih Fail Kit PLC Dari Komputer'}</span>
                </button>
              </div>
            </div>

            {/* List of Uploaded Kits */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Repositori Kit PLC Sekolah ({uploadedKits.length} Bahan Tersimpan):
                </h4>
                <span className="text-[11px] text-slate-500">
                  Boleh diakses dan dimuat turun oleh semua ketua panitia
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uploadedKits.map((kit) => (
                  <div
                    key={kit.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-snug">
                            {kit.tajukKit}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Fail: <span className="font-mono">{kit.fileName}</span> ({kit.fileSize || 'Dokumen'})
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteKit(kit.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Padam fail ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg">
                      {kit.penerangan}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Panitia: <strong className="text-teal-800">{kit.panitia}</strong></span>
                      <span>Dimuat naik: {kit.uploadedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PANDUAN 9 ALAT PLC KPM */}
        {activeTab === 'definisi' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="text-xs text-slate-600 bg-blue-50 border border-blue-200 rounded-xl p-3">
              Kementerian Pendidikan Malaysia (KPM) menggariskan <strong>9 Alat Utama Komuniti Pembelajaran Profesional (PLC)</strong> sebagai instrumen terbukti untuk meningkatkan kualiti pengajaran guru dan kemenjadian murid.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KPM_PLC_TOOL_DEFINITIONS.map((def, idx) => (
                <div key={def.type} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">
                      {def.nama}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {def.deskripsi}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
                    <div className="font-bold text-slate-800">Langkah Pelaksanaan Rasmi:</div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[10.5px]">
                      {def.langkahPelaksanaan.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-2 py-1 rounded-md border border-teal-200">
                    Faedah: {def.faedahUtama}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            SK Tudan Miri · Pelan Pembangunan Profesionalisme Guru 2027
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
