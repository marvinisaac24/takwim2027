import React, { useState, useMemo } from 'react';
import { BidangType, PanitiaConfig } from '../types/takwim';
import { BANK_PROGRAM_SUGGESTIONS, ProgramSuggestion } from '../constants/bankProgram';
import { MONTH_NAMES_MS } from '../constants/calendar2027';
import { getPLCActivitiesForPanitia } from '../constants/plcToolkits';
import { SKAS_OFFICIAL_ITEMS } from '../constants/skasStandards';
import { 
  X, 
  Search, 
  Filter, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Check, 
  ArrowRight,
  Layers,
  Users,
  MapPin,
  Tag,
  Award,
  GraduationCap
} from 'lucide-react';

interface ProgramBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProgram: (suggestion: ProgramSuggestion, preferredDate?: string) => void;
  selectedMonth?: number;
  initialBidang?: BidangType | 'Semua';
  panitiaList?: PanitiaConfig[];
  initialPanitia?: string;
}

export const ProgramBankModal: React.FC<ProgramBankModalProps> = ({
  isOpen,
  onClose,
  onSelectProgram,
  selectedMonth = 1,
  initialBidang = 'Semua',
  panitiaList = [],
  initialPanitia,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidang, setSelectedBidang] = useState<BidangType | 'Semua'>(initialBidang);
  const [selectedPanitia, setSelectedPanitia] = useState<string>(initialPanitia || 'Semua');
  const [filterMonth, setFilterMonth] = useState<number | 'Semua'>(selectedMonth);
  const [selectedJenis, setSelectedJenis] = useState<string>('Semua');

  // Reset or initialize when opened
  React.useEffect(() => {
    if (isOpen) {
      if (initialBidang && initialBidang !== 'Semua') {
        setSelectedBidang(initialBidang);
      }
      if (initialPanitia) {
        setSelectedPanitia(initialPanitia);
      }
      if (selectedMonth) {
        setFilterMonth(selectedMonth);
      }
    }
  }, [isOpen, initialBidang, initialPanitia, selectedMonth]);

  const bidangList: (BidangType | 'Semua')[] = [
    'Semua',
    'Pengurusan dan Staf',
    'Kurikulum',
    'Hal Ehwal Murid',
    'Kokurikulum',
    'Panitia Mata Pelajaran',
  ];

  const getBidangBadgeColor = (bidang: BidangType) => {
    switch (bidang) {
      case 'Pengurusan dan Staf':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Kurikulum':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Hal Ehwal Murid':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Kokurikulum':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Panitia Mata Pelajaran':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredSuggestions = useMemo(() => {
    let baseList = [...BANK_PROGRAM_SUGGESTIONS];

    // If a specific Panitia is chosen under Panitia Mata Pelajaran, generate dedicated suite
    if (selectedBidang === 'Panitia Mata Pelajaran' && selectedPanitia !== 'Semua') {
      const p = selectedPanitia;
      const dedicatedSuite: ProgramSuggestion[] = [
        {
          id: `p-${p}-mesy-1`,
          tajuk: `Mesyuarat Panitia ${p} Bil. 1/2027`,
          bidang: 'Panitia Mata Pelajaran',
          unit: p,
          jenis: 'Mesyuarat',
          objektifLalai: `Penyelarasan rancangan pengajaran tahunan (RPT), DSKP, agihan tugas guru dan penetapan sasaran akademik ${p} 2027.`,
          bulanCadangan: [1],
          tempatLalai: 'Bilik Mesyuarat 2',
          sasaranLalai: [`Semua Guru Mata Pelajaran ${p}`],
          tindakan: `Ketua Panitia & Setiausaha ${p}`
        },
        {
          id: `p-${p}-mesy-2`,
          tajuk: `Mesyuarat Panitia ${p} Bil. 2/2027`,
          bidang: 'Panitia Mata Pelajaran',
          unit: p,
          jenis: 'Mesyuarat',
          objektifLalai: `Kajian pertengahan tahun, semakan laporan PBD fasa 1 dan penilaian program intervensi ${p}.`,
          bulanCadangan: [5],
          tempatLalai: 'Bilik Mesyuarat 2',
          sasaranLalai: [`Semua Guru Mata Pelajaran ${p}`],
          tindakan: `Ketua Panitia & Setiausaha ${p}`
        },
        {
          id: `p-${p}-mesy-3`,
          tajuk: `Mesyuarat Panitia ${p} Bil. 3/2027`,
          bidang: 'Panitia Mata Pelajaran',
          unit: p,
          jenis: 'Mesyuarat',
          objektifLalai: `Analisis kemajuan murid penggal kedua, penyelarasan moderasi PBD dan pemantauan buku latihan murid ${p}.`,
          bulanCadangan: [8],
          tempatLalai: 'Bilik Mesyuarat 2',
          sasaranLalai: [`Semua Guru Mata Pelajaran ${p}`],
          tindakan: `Ketua Panitia & Setiausaha ${p}`
        },
        {
          id: `p-${p}-mesy-4`,
          tajuk: `Mesyuarat Panitia ${p} Bil. 4/2027`,
          bidang: 'Panitia Mata Pelajaran',
          unit: p,
          jenis: 'Mesyuarat',
          objektifLalai: `Post-mortem pencapaian akhir sesi, pelaporan PBD lengkap dan perancangan awal takwim ${p} 2028.`,
          bulanCadangan: [11],
          tempatLalai: 'Bilik Mesyuarat 2',
          sasaranLalai: [`Semua Guru Mata Pelajaran ${p}`],
          tindakan: `Ketua Panitia & Setiausaha ${p}`
        },
        {
          id: `p-${p}-minggu`,
          tajuk: `Minggu / Bulan Akademik ${p}`,
          bidang: 'Panitia Mata Pelajaran',
          unit: p,
          jenis: 'Program',
          objektifLalai: `Meningkatkan minat, penguasaan dan penghayatan murid terhadap mata pelajaran ${p} melalui aktiviti interaktif.`,
          bulanCadangan: [3, 4, 7, 9],
          tempatLalai: 'Dewan Sri Tudan / Dataran Perhimpunan',
          sasaranLalai: ['Semua Murid SK Tudan'],
          tindakan: `Jawatankuasa Panitia ${p}`
        },
        {
          id: `p-${p}-bengkel`,
          tajuk: `Bengkel Peningkatan Prestasi & Intervensi ${p}`,
          bidang: 'Panitia Mata Pelajaran',
          unit: p,
          jenis: 'Aktiviti',
          objektifLalai: `Bimbingan berfokus kemahiran asas dan teknik menjawab bagi meningkatkan pencapaian murid dalam ${p}.`,
          bulanCadangan: [2, 6, 10],
          tempatLalai: 'Bilik Akses / Kelas Terlibat',
          sasaranLalai: [`Murid Tahap 1 & Tahap 2 yang Dikenal Pasti`],
          tindakan: `Guru Matapelajaran ${p}`
        },
        {
          id: `p-${p}-plc-1`,
          tajuk: `PLC Panitia ${p} Sesi 1 (Penyelarasan DSKP & Pedagogi)`,
          bidang: 'Panitia Mata Pelajaran',
          unit: p,
          jenis: 'Pelaksanaan Berkala',
          objektifLalai: `Perkongsian amalan terbaik dan perancangan PdP bermakna bagi mata pelajaran ${p}.`,
          bulanCadangan: [2, 3],
          tempatLalai: 'Bilik Panitia / Pusat Sumber',
          sasaranLalai: [`Semua Guru ${p}`],
          tindakan: `Penyelaras PLC ${p}`
        },
        {
          id: `p-${p}-plc-2`,
          tajuk: `PLC Panitia ${p} Sesi 2 (Analisis PBD & Moderasi)`,
          bidang: 'Panitia Mata Pelajaran',
          unit: p,
          jenis: 'Pelaksanaan Berkala',
          objektifLalai: `Moderasi pertimbangan profesional guru bagi memastikan ketepatan tahap penguasaan murid dalam ${p}.`,
          bulanCadangan: [7, 8],
          tempatLalai: 'Bilik Panitia / Pusat Sumber',
          sasaranLalai: [`Semua Guru ${p}`],
          tindakan: `Penyelaras PLC ${p}`
        },
        {
          id: `p-${p}-semakan`,
          tajuk: `Semakan Hasil Kerja & Buku Latihan Murid ${p}`,
          bidang: 'Panitia Mata Pelajaran',
          unit: p,
          jenis: 'Pelaksanaan Berkala',
          objektifLalai: `Pemantauan kualiti latihan, ketepatan penyemakan guru dan pembetulan murid mengikut jadual ketetapan.`,
          bulanCadangan: [3, 4, 8, 9],
          tempatLalai: 'Bilik Pentadbir / Bilik Gerakan',
          sasaranLalai: [`Semua Buku Murid Tahap 1 & 2`],
          tindakan: `Ketua Panitia & Barisan Pentadbir`
        },
        {
          id: `p-${p}-intervensi`,
          tajuk: `Program Intervensi Berfokus Murid Bimbingan ${p}`,
          bidang: 'Panitia Mata Pelajaran',
          unit: p,
          jenis: 'Aktiviti',
          objektifLalai: `Membimbing murid TP1 dan TP2 agar mencapai tahap penguasaan minimum TP3 ke atas.`,
          bulanCadangan: [2, 4, 6, 8, 10],
          tempatLalai: 'Bilik Pemulihan / Kelas',
          sasaranLalai: [`Murid Sasaran Intervensi ${p}`],
          tindakan: `Guru Mata Pelajaran & Guru Pemulihan`
        }
      ];

      // Also inject official PLC toolkit items for this specific panitia
      const plcItems = getPLCActivitiesForPanitia(p);
      const plcMapped: ProgramSuggestion[] = plcItems.map(item => ({
        id: `plc-${item.id}`,
        tajuk: item.tajukAktiviti,
        bidang: 'Panitia Mata Pelajaran',
        unit: p,
        jenis: 'Pelaksanaan Berkala',
        objektifLalai: `${item.objektif} (Fokus: ${item.fokusPedagogi})`,
        bulanCadangan: item.cadanganBulan || [2, 4],
        tempatLalai: item.cadanganTempat || 'Bilik Panitia / Pusat Sumber',
        sasaranLalai: [`Semua Guru ${p}`],
        tindakan: item.tindakan,
        catatan: `[Kit PLC KPM - ${item.alatPLC}] Evidens: ${item.evidens}`
      }));

      // Filter existing items from BANK_PROGRAM_SUGGESTIONS that explicitly belong to this panitia
      const existingPanitiaItems = baseList.filter(
        item => item.bidang === 'Panitia Mata Pelajaran' && item.unit.toLowerCase().includes(p.toLowerCase())
      );

      // Combine dedicated suite, PLC items and existing items, deduplicating by tajuk
      const seen = new Set<string>();
      baseList = [];
      for (const item of [...dedicatedSuite, ...plcMapped, ...existingPanitiaItems]) {
        if (!seen.has(item.tajuk)) {
          seen.add(item.tajuk);
          baseList.push(item);
        }
      }
    }

    // Inject SK@S Standards based on selectedBidang
    const skasItems = SKAS_OFFICIAL_ITEMS.filter(item => {
      if (selectedBidang === 'Semua') return true;
      return item.bidangTakwim === selectedBidang;
    }).map(item => ({
      id: `skas-${item.id}`,
      tajuk: `[SK@S ${item.aspekKod}] ${item.cadanganTajukProgram}`,
      bidang: item.bidangTakwim,
      unit: item.unitCadangan || 'Pentadbiran Sekolah',
      jenis: 'Program' as const,
      objektifLalai: `${item.objektifProgram} (TUMS: ${item.tindakanPGB})`,
      bulanCadangan: item.cadanganBulan || [1],
      tempatLalai: item.cadanganTempat || 'Bilik Gerakan',
      sasaranLalai: ['Warga Sekolah / Sasaran Standard SK@S'],
      tindakan: item.penyelarasCadangan,
      catatan: `[SK@S Kualiti @Sekolah - ${item.standardId} Aspek ${item.aspekKod}] Evidens: ${item.evidensDiperlukan.join(', ')}`
    }));

    // Deduplicate and append SK@S items
    const existingTitles = new Set(baseList.map(b => b.tajuk));
    for (const sk of skasItems) {
      if (!existingTitles.has(sk.tajuk)) {
        existingTitles.add(sk.tajuk);
        baseList.push(sk);
      }
    }

    return baseList.filter((item) => {
      // 1. Bidang filter
      if (selectedBidang !== 'Semua' && item.bidang !== selectedBidang) {
        return false;
      }

      // 2. Panitia sub-filter
      if (selectedBidang === 'Panitia Mata Pelajaran' && selectedPanitia !== 'Semua') {
        if (!item.unit.toLowerCase().includes(selectedPanitia.toLowerCase())) {
          return false;
        }
      }

      // 3. Month filter
      if (filterMonth !== 'Semua' && !item.bulanCadangan.includes(filterMonth as number)) {
        return false;
      }

      // 4. Jenis filter
      if (selectedJenis !== 'Semua' && item.jenis !== selectedJenis) {
        return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.tajuk.toLowerCase().includes(q);
        const matchesUnit = item.unit.toLowerCase().includes(q);
        const matchesObj = item.objektifLalai.toLowerCase().includes(q);
        const matchesTindakan = (item.tindakan || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesUnit && !matchesObj && !matchesTindakan) {
          return false;
        }
      }

      return true;
    });
  }, [selectedBidang, selectedPanitia, filterMonth, selectedJenis, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Katalog Program & Aktiviti Mengikut Bidang & Panitia
              </h2>
              <p className="text-xs text-slate-500">
                Pilih program dan aktiviti rasmi SK Tudan untuk didaftarkan secara terus ke takwim sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          {/* Search & Month Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari program (cth: PLC, Karnival, Fire Drill, Transisi, Mesyuarat)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value === 'Semua' ? 'Semua' : Number(e.target.value))}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Semua Bulan (1 - 12)</option>
                {MONTH_NAMES_MS.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    Bulan {idx + 1}: {m} 2027
                  </option>
                ))}
              </select>

              <select
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Semua Jenis</option>
                <option value="Program">Program</option>
                <option value="Aktiviti">Aktiviti</option>
                <option value="Mesyuarat">Mesyuarat</option>
                <option value="Pelaksanaan Berkala">Pelaksanaan Berkala</option>
              </select>
            </div>
          </div>

          {/* Bidang Pills */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Pilih Bidang Pengurusan:
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {bidangList.map((bidang) => {
                const isActive = selectedBidang === bidang;
                return (
                  <button
                    key={bidang}
                    onClick={() => {
                      setSelectedBidang(bidang);
                      if (bidang !== 'Panitia Mata Pelajaran') {
                        setSelectedPanitia('Semua');
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bidang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-pills for Panitia Mata Pelajaran */}
          {selectedBidang === 'Panitia Mata Pelajaran' && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-[11px] font-semibold text-teal-800 shrink-0">Panitia:</span>
              {[
                'Semua',
                'Bahasa Melayu',
                'Bahasa Inggeris',
                'Matematik',
                'Sains',
                'Pendidikan Islam',
                'Pendidikan Moral',
                'PJPK',
                'Pendidikan Seni Visual',
                'Pendidikan Muzik',
                'Reka Bentuk dan Teknologi',
                'Sejarah',
              ].map((pan) => (
                <button
                  key={pan}
                  onClick={() => setSelectedPanitia(pan)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                    selectedPanitia === pan
                      ? 'bg-teal-700 text-white'
                      : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                  }`}
                >
                  {pan}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>
              Menemui <strong className="text-slate-800">{filteredSuggestions.length}</strong> cadangan program
            </span>
            {filterMonth !== 'Semua' && (
              <span className="text-blue-700 font-medium">
                Cadangan untuk Bulan {MONTH_NAMES_MS[(filterMonth as number) - 1]}
              </span>
            )}
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-dashed border-slate-300 p-8">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Tiada cadangan program padan ditemui</p>
              <p className="text-xs text-slate-500 mt-1">
                Cuba ubah kata kunci carian atau tetapkan bidang ke "Semua Bidang".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBidang('Semua');
                  setFilterMonth('Semua');
                  setSelectedJenis('Semua');
                }}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                Set Semula Penapis
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSuggestions.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-4 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBidangBadgeColor(
                              item.bidang
                            )}`}
                          >
                            {item.bidang}
                          </span>
                          {(item.id.startsWith('plc-') || item.catatan?.includes('Kit PLC')) && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-teal-600" />
                              Kit PLC KPM
                            </span>
                          )}
                          {(item.id.startsWith('skas-') || item.catatan?.includes('SK@S')) && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-600" />
                              SK@S SKPM
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {item.jenis}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-xs border border-slate-200">
                            {item.unit}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {item.tajuk}
                      </h3>

                      {/* Objective */}
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                        {item.objektifLalai}
                      </p>

                      {/* Target & Venue */}
                      <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1 truncate" title={item.tempatLalai}>
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.tempatLalai || 'Dewan Sri Tudan'}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate" title={item.sasaranLalai.join(', ')}>
                          <Users className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.sasaranLalai.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>

                      {/* Suggested Months */}
                      <div className="mt-2 flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-slate-400">Bulan Cadangan:</span>
                        {item.bulanCadangan.map((m) => (
                          <span
                            key={m}
                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded-xs ${
                              filterMonth === m
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {MONTH_NAMES_MS[m - 1].slice(0, 3)}
                          </span>
                        ))}
                      </div>

                      {item.sumberAsal && (
                        <div className="mt-1.5 text-[10px] text-slate-400 italic">
                          Sumber: {item.sumberAsal}
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">
                        {item.tindakan ? `Tindakan: ${item.tindakan}` : 'Sedia untuk didaftar'}
                      </span>
                      <button
                        onClick={() => {
                          onSelectProgram(item);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Pilih & Daftar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Takwim Pengurusan & Persekolahan SK Tudan 2027</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
