import React, { useState, useEffect, useMemo } from 'react';
import { 
  TakwimEntry, 
  HolidayRecord, 
  PanitiaConfig, 
  UserProfile, 
  BidangType, 
  JenisPengisian, 
  KelulusanStatus, 
  PelaksanaanStatus,
  ExtractedProgramRecord
} from '../types/takwim';
import { 
  BANK_PROGRAM_SUGGESTIONS, 
  VENUES_LIST
} from '../constants/bankProgram';
import { 
  getAcademicWeekForDate, 
  getDayStatus, 
  detectConflicts, 
  MONTH_NAMES_MS 
} from '../constants/calendar2027';
import { DEFAULT_TEACHERS_LIST } from '../constants/schoolSettingsDefaults';
import { api } from '../services/api';

const DEFAULT_PANITIA_LIST = [
  'Bahasa Melayu',
  'Bahasa Inggeris',
  'Matematik',
  'Sains',
  'Pendidikan Islam',
  'Pendidikan Moral',
  'Sejarah',
  'Reka Bentuk & Teknologi (RBT)',
  'Pendidikan Jasmani & Kesihatan (PJPK)',
  'Pendidikan Seni Visual (PSV)',
  'Pendidikan Muzik',
  'Bahasa Arab',
  'Bahasa Iban',
  'Bahasa Cina',
];
import { 
  X, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Save, 
  Send, 
  Sparkles, 
  Layers, 
  MapPin,
  UserCheck,
  FileText,
  BookmarkCheck
} from 'lucide-react';
import { ProgramSuggestion } from '../constants/bankProgram';

interface ProgramFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (entry: TakwimEntry) => void;
  editingEntry?: TakwimEntry | null;
  existingEntries: TakwimEntry[];
  holidays: HolidayRecord[];
  panitiaList: PanitiaConfig[];
  currentUser: UserProfile;
  initialDate?: string;
  initialMonth?: number;
  initialBidang?: BidangType;
  initialSuggestion?: ProgramSuggestion | null;
  initialUnit?: string;
  initialCustomTitle?: string;
  initialNotes?: string;
  initialJenis?: JenisPengisian;
  teachersList?: string[];
  extractedPrograms?: ExtractedProgramRecord[];
}

export const ProgramFormModal: React.FC<ProgramFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editingEntry,
  existingEntries,
  holidays,
  panitiaList,
  currentUser,
  initialDate,
  initialMonth,
  initialBidang,
  initialSuggestion,
  initialUnit,
  initialCustomTitle,
  initialNotes,
  initialJenis,
  teachersList = DEFAULT_TEACHERS_LIST,
  extractedPrograms = [],
}) => {
  const defaultMonth = initialMonth || (initialDate ? new Date(initialDate).getMonth() + 1 : 1);
  const defaultDate = initialDate || `2027-${String(defaultMonth).padStart(2, '0')}-04`;

  const getInitialUnitForBidang = (b: BidangType) => {
    if (b === 'Kurikulum') return 'Pengurusan Kurikulum';
    if (b === 'Pengurusan dan Staf') return 'Pentadbiran Sekolah';
    if (b === 'Hal Ehwal Murid') return 'Disiplin & Pengawas';
    if (b === 'Kokurikulum') return 'Pengurusan Kokurikulum';
    return initialUnit || 'Bahasa Melayu';
  };

  const chosenInitialBidang = editingEntry?.bidangUtama || initialBidang || 'Kurikulum';

  // Form States
  const [tahun] = useState<2027>(2027);
  const [bulan, setBulan] = useState<number>(editingEntry?.bulan || defaultMonth);
  const [bidangUtama, setBidangUtama] = useState<BidangType>(chosenInitialBidang);
  const [unitUtama, setUnitUtama] = useState<string>(
    editingEntry?.unitUtama || initialUnit || getInitialUnitForBidang(chosenInitialBidang)
  );
  const [jenisPengisian, setJenisPengisian] = useState<JenisPengisian>(
    editingEntry?.jenisPengisian || initialJenis || 'Program'
  );

  // Title Selection: Bank / Past Management Book or Custom
  const [pilihanBank, setPilihanBank] = useState<string>(editingEntry?.tajukPilihanBank || '');
  const [adalahTajukSendiri, setAdalahTajukSendiri] = useState<boolean>(
    editingEntry?.adalahTajukSendiri ?? Boolean(initialCustomTitle)
  );
  const [tajukSendiri, setTajukSendiri] = useState<string>(
    editingEntry?.adalahTajukSendiri ? editingEntry.tajuk : (initialCustomTitle || '')
  );
  const [bilanganMesyuarat, setBilanganMesyuarat] = useState<string>(editingEntry?.bilanganMesyuarat || '');

  // Dates & Times
  const [tarikhMula, setTarikhMula] = useState<string>(editingEntry?.tarikhMula || defaultDate);
  const [tarikhAkhir, setTarikhAkhir] = useState<string>(editingEntry?.tarikhAkhir || defaultDate);
  const [masaMula, setMasaMula] = useState<string>(editingEntry?.masaMula || '08:00');
  const [masaAkhir, setMasaAkhir] = useState<string>(editingEntry?.masaAkhir || '12:00');
  const [sepanjangHari, setSepanjangHari] = useState<boolean>(editingEntry?.sepanjangHari ?? false);

  // Venue & Coordinator
  const [tempat, setTempat] = useState<string>(editingEntry?.tempat || 'Dewan Sri Tudan');
  const [penyelaras, setPenyelaras] = useState<string>(editingEntry?.penyelaras || currentUser.name || teachersList[0] || 'Guru Penyelaras');
  const [catatan, setCatatan] = useState<string>(editingEntry?.catatan || initialNotes || '');

  // Status
  const [statusKelulusan, setStatusKelulusan] = useState<KelulusanStatus>(editingEntry?.statusKelulusan || 'Draf');
  const [statusPelaksanaan, setStatusPelaksanaan] = useState<PelaksanaanStatus>(editingEntry?.statusPelaksanaan || 'Belum Bermula');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Clean title helper to completely eliminate "bank cadangan takwim" or "cadangan" text
  const cleanTitle = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/\[\s*bank\s*cadangan\s*takwim\s*\]/gi, '')
      .replace(/bank\s*cadangan\s*takwim\s*[:-]?/gi, '')
      .replace(/^cadangan\s*takwim\s*[:-]?/gi, '')
      .replace(/^cadangan\s*[:-]?/gi, '')
      .trim();
  };

  // Track modal open state and active editing entry ID with refs to NEVER wipe user input during background polling
  const prevIsOpenRef = React.useRef(false);
  const prevEditingIdRef = React.useRef<string | null>(null);

  // Synchronize ONLY when modal opens (transition from closed -> open) or when editing target entry ID changes
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    const editingChanged = (editingEntry?.id || null) !== prevEditingIdRef.current;

    prevIsOpenRef.current = isOpen;
    prevEditingIdRef.current = editingEntry?.id || null;

    if (!isOpen) return;

    // Only reset/populate when opening afresh or switching to another editing entry
    if (justOpened || editingChanged) {
      if (editingEntry) {
        setBulan(editingEntry.bulan);
        setBidangUtama(editingEntry.bidangUtama);
        setUnitUtama(editingEntry.unitUtama);
        setJenisPengisian(editingEntry.jenisPengisian);
        setPilihanBank(cleanTitle(editingEntry.tajukPilihanBank || ''));
        setAdalahTajukSendiri(editingEntry.adalahTajukSendiri);
        setTajukSendiri(editingEntry.adalahTajukSendiri ? cleanTitle(editingEntry.tajuk) : '');
        setBilanganMesyuarat(editingEntry.bilanganMesyuarat || '');
        setTarikhMula(editingEntry.tarikhMula);
        setTarikhAkhir(editingEntry.tarikhAkhir);
        setMasaMula(editingEntry.masaMula);
        setMasaAkhir(editingEntry.masaAkhir);
        setSepanjangHari(editingEntry.sepanjangHari);
        setTempat(editingEntry.tempat);
        setPenyelaras(editingEntry.penyelaras);
        setCatatan(editingEntry.catatan || '');
        setStatusKelulusan(editingEntry.statusKelulusan);
        setStatusPelaksanaan(editingEntry.statusPelaksanaan);
      } else {
        const initB = initialBidang || 'Kurikulum';
        setBidangUtama(initB);
        setUnitUtama(initialUnit || (initialSuggestion?.unit) || getInitialUnitForBidang(initB));
        if (initialDate) {
          setTarikhMula(initialDate);
          setTarikhAkhir(initialDate);
          setBulan(new Date(initialDate + 'T00:00:00').getMonth() + 1);
        }
        if (initialCustomTitle) {
          setAdalahTajukSendiri(true);
          setTajukSendiri(cleanTitle(initialCustomTitle));
          setPilihanBank('');
        } else if (initialSuggestion) {
          setPilihanBank(cleanTitle(initialSuggestion.tajuk));
          setAdalahTajukSendiri(false);
          setTajukSendiri('');
          if (initialSuggestion.tempatLalai) setTempat(initialSuggestion.tempatLalai);
          if (initialSuggestion.jenis) setJenisPengisian(initialSuggestion.jenis);
          if (initialSuggestion.unit) setUnitUtama(initialSuggestion.unit);
        } else {
          setPilihanBank('');
          setAdalahTajukSendiri(false);
          setTajukSendiri('');
        }
        if (initialNotes) {
          setCatatan(initialNotes);
        }
        if (initialJenis) {
          setJenisPengisian(initialJenis);
        }
        setPenyelaras(currentUser.name || teachersList[0] || 'Guru Penyelaras');
      }
    }
  }, [isOpen, editingEntry?.id, initialDate, initialBidang, initialSuggestion, initialUnit, initialCustomTitle, initialNotes, initialJenis]);

  // Sync Month when Tarikh Mula changes
  useEffect(() => {
    if (tarikhMula) {
      const m = new Date(tarikhMula + 'T00:00:00').getMonth() + 1;
      setBulan(m);
      if (!editingEntry && tarikhAkhir < tarikhMula) {
        setTarikhAkhir(tarikhMula);
      }
    }
  }, [tarikhMula]);

  // Compute Academic Week and Day Status
  const weekInfo = useMemo(() => getAcademicWeekForDate(tarikhMula), [tarikhMula]);
  const dayStatusInfo = useMemo(() => getDayStatus(tarikhMula, holidays), [tarikhMula, holidays]);

  // Combined program suggestions: If Panitia Mata Pelajaran, ONLY list meetings, activities & programs for that specific panitia!
  const availableSuggestions = useMemo(() => {
    const list: { tajuk: string; source: string; jenis?: JenisPengisian; unit?: string }[] = [];

    if (bidangUtama === 'Panitia Mata Pelajaran') {
      const currentPanitia = unitUtama || 'Bahasa Melayu';

      // 1. Dedicated Standardized Suite for the selected panitia
      const standardPanitiaSuite: { tajuk: string; jenis: JenisPengisian }[] = [
        { tajuk: `Mesyuarat Panitia ${currentPanitia} Bil. 1/2027`, jenis: 'Mesyuarat' },
        { tajuk: `Mesyuarat Panitia ${currentPanitia} Bil. 2/2027`, jenis: 'Mesyuarat' },
        { tajuk: `Mesyuarat Panitia ${currentPanitia} Bil. 3/2027`, jenis: 'Mesyuarat' },
        { tajuk: `Mesyuarat Panitia ${currentPanitia} Bil. 4/2027`, jenis: 'Mesyuarat' },
        { tajuk: `Minggu / Bulan Akademik Panitia ${currentPanitia}`, jenis: 'Program' },
        { tajuk: `PLC 1: Penyelarasan DSKP & Penetapan Sasaran PBD ${currentPanitia}`, jenis: 'Aktiviti' },
        { tajuk: `PLC 2: Bengkel Pedagogi & Inovasi PdP Digital ${currentPanitia}`, jenis: 'Aktiviti' },
        { tajuk: `PLC 3: Analisis Pentaksiran PBD & Intervensi ${currentPanitia}`, jenis: 'Aktiviti' },
        { tajuk: `Program Bimbingan & Intervensi Berfokus ${currentPanitia}`, jenis: 'Program' },
        { tajuk: `Program Pengayaan & Peningkatan Prestasi Murid ${currentPanitia}`, jenis: 'Program' },
        { tajuk: `Ujian Pengesanan & Diagnostik Pembelajaran ${currentPanitia}`, jenis: 'Aktiviti' },
        { tajuk: `Semakan Hasil Kerja, Buku Nota & Latihan Murid ${currentPanitia}`, jenis: 'Aktiviti' },
        { tajuk: `Bimbingan Klinikal / Pencerapan Kendiri PdP ${currentPanitia}`, jenis: 'Aktiviti' },
      ];

      standardPanitiaSuite.forEach((p) => {
        list.push({
          tajuk: p.tajuk,
          source: `Panitia ${currentPanitia}`,
          jenis: p.jenis,
          unit: currentPanitia,
        });
      });

      // 2. Custom Bank Suggestions that match THIS panitia ONLY
      const panitiaKey = currentPanitia.toLowerCase();
      BANK_PROGRAM_SUGGESTIONS.forEach((s) => {
        if (s.bidang === 'Panitia Mata Pelajaran') {
          const sUnit = (s.unit || '').toLowerCase();
          const sTajuk = s.tajuk.toLowerCase();
          // Check matching unit or subject keywords
          const isMatch = sUnit.includes(panitiaKey) || 
                          panitiaKey.includes(sUnit) || 
                          (panitiaKey === 'bahasa melayu' && (sUnit.includes('bm') || sTajuk.includes('bahasa melayu') || sTajuk.includes('bm '))) ||
                          (panitiaKey === 'bahasa inggeris' && (sUnit.includes('bi') || sTajuk.includes('english') || sTajuk.includes('bi '))) ||
                          (panitiaKey === 'matematik' && (sUnit.includes('mat') || sTajuk.includes('matematik') || sTajuk.includes('math'))) ||
                          (panitiaKey === 'sains' && (sUnit.includes('sn') || sTajuk.includes('sains') || sTajuk.includes('science'))) ||
                          (panitiaKey === 'pendidikan islam' && (sUnit.includes('islam') || sTajuk.includes('islam') || sTajuk.includes('surau') || sTajuk.includes('solat')));

          if (isMatch) {
            list.push({
              tajuk: cleanTitle(s.tajuk),
              source: `Panitia ${currentPanitia}`,
              jenis: s.jenis,
              unit: s.unit,
            });
          }
        }
      });

      // 3. Extracted Programs matching THIS panitia only
      extractedPrograms.forEach((p) => {
        if (p.bidang === 'Panitia Mata Pelajaran') {
          const pUnit = (p.unit || '').toLowerCase();
          const pTajuk = p.tajuk.toLowerCase();
          if (pUnit.includes(panitiaKey) || panitiaKey.includes(pUnit) || pTajuk.includes(panitiaKey)) {
            list.push({
              tajuk: cleanTitle(p.tajuk),
              source: p.source || 'Buku Pengurusan Sekolah',
              unit: p.unit,
            });
          }
        }
      });
    } else {
      // 1. Suggestions for other Bidang (Kurikulum, HEM, Kokurikulum, Staf)
      BANK_PROGRAM_SUGGESTIONS.forEach((s) => {
        if (s.bidang === bidangUtama) {
          list.push({
            tajuk: cleanTitle(s.tajuk),
            source: s.unit || bidangUtama,
            jenis: s.jenis,
            unit: s.unit,
          });
        }
      });

      // 2. From Extracted Management Book
      extractedPrograms.forEach((p) => {
        if (p.bidang === bidangUtama) {
          list.push({
            tajuk: cleanTitle(p.tajuk),
            source: p.source || 'Buku Pengurusan Sekolah',
            unit: p.unit,
          });
        }
      });
    }

    // Deduplicate by tajuk
    const uniqueMap = new Map<string, typeof list[0]>();
    list.forEach((item) => {
      const cleaned = cleanTitle(item.tajuk);
      if (!uniqueMap.has(cleaned)) {
        uniqueMap.set(cleaned, { ...item, tajuk: cleaned });
      }
    });

    return Array.from(uniqueMap.values());
  }, [bidangUtama, unitUtama, extractedPrograms]);

  // Compute Title cleanly
  const computedTitle = useMemo(() => {
    let t = cleanTitle(adalahTajukSendiri ? tajukSendiri : pilihanBank);
    if (jenisPengisian === 'Mesyuarat' && bilanganMesyuarat) {
      if (!t.includes(bilanganMesyuarat)) {
        t = `${t} (${bilanganMesyuarat})`;
      }
    }
    return t || 'Program Tanpa Tajuk';
  }, [adalahTajukSendiri, tajukSendiri, pilihanBank, jenisPengisian, bilanganMesyuarat]);

  // Conflict Detection
  const tempEntry: TakwimEntry = useMemo(() => ({
    id: editingEntry?.id || 'temp-id',
    tahun: 2027,
    bulan,
    bidangUtama,
    unitUtama,
    unitBersama: [],
    jenisPengisian,
    tajuk: computedTitle,
    tajukPilihanBank: pilihanBank,
    adalahTajukSendiri,
    bilanganMesyuarat,
    tarikhMula,
    tarikhAkhir,
    masaMula,
    masaAkhir,
    sepanjangHari,
    mingguAkademik: weekInfo.code,
    statusHari: dayStatusInfo.statusLabel,
    tempat,
    penyelaras,
    statusKelulusan,
    statusPelaksanaan,
    createdBy: editingEntry?.createdBy || currentUser.id,
    createdByName: editingEntry?.createdByName || currentUser.name,
    createdAt: editingEntry?.createdAt || new Date().toISOString(),
    updatedBy: currentUser.id,
    updatedByName: currentUser.name,
    updatedAt: new Date().toISOString(),
    revisionHistory: [],
  }), [
    editingEntry,
    bulan,
    bidangUtama,
    unitUtama,
    jenisPengisian,
    computedTitle,
    pilihanBank,
    adalahTajukSendiri,
    bilanganMesyuarat,
    tarikhMula,
    tarikhAkhir,
    masaMula,
    masaAkhir,
    sepanjangHari,
    weekInfo,
    dayStatusInfo,
    tempat,
    penyelaras,
    statusKelulusan,
    statusPelaksanaan,
    currentUser,
  ]);

  const conflictResult = useMemo(
    () => detectConflicts(tempEntry, existingEntries, holidays),
    [tempEntry, existingEntries, holidays]
  );

  if (!isOpen) return null;

  const handleSubmit = async (submitType: 'Draf' | 'Dihantar') => {
    setErrorMessage('');

    if (!computedTitle.trim() || computedTitle === 'Program Tanpa Tajuk') {
      setErrorMessage('Sila pilih tajuk program daripada senarai atau taip tajuk baharu.');
      return;
    }

    if (!tarikhMula) {
      setErrorMessage('Sila tetapkan tarikh mula program.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Partial<TakwimEntry> = {
        tahun: 2027,
        bulan: Number(bulan),
        bidangUtama,
        unitUtama,
        jenisPengisian,
        tajuk: computedTitle,
        tajukPilihanBank: adalahTajukSendiri ? undefined : pilihanBank,
        adalahTajukSendiri,
        bilanganMesyuarat: jenisPengisian === 'Mesyuarat' ? bilanganMesyuarat : undefined,
        tarikhMula,
        tarikhAkhir: tarikhAkhir || tarikhMula,
        masaMula: sepanjangHari ? '00:00' : masaMula,
        masaAkhir: sepanjangHari ? '23:59' : masaAkhir,
        sepanjangHari,
        mingguAkademik: weekInfo.code,
        statusHari: dayStatusInfo.statusLabel,
        tempat,
        penyelaras: penyelaras.trim(),
        catatan: catatan.trim(),
        statusKelulusan: currentUser.role === 'Pentadbir' ? 'Diluluskan' : submitType,
        statusPelaksanaan: editingEntry?.statusPelaksanaan || 'Belum Bermula',
        createdBy: editingEntry?.createdBy || currentUser.id,
        createdByName: editingEntry?.createdByName || currentUser.name,
      };

      let saved: TakwimEntry;
      if (editingEntry) {
        const res = await api.updateEntry(editingEntry.id, payload);
        saved = res.data;
      } else {
        const res = await api.createEntry(payload);
        saved = res.data;
      }

      onSaved(saved);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ralat semasa menyimpan maklumat program.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Calendar className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                {editingEntry ? 'Kemaskini Program Takwim Sekolah' : 'Pendaftaran Program / Aktiviti Takwim 2027'}
              </h2>
              <p className="text-xs text-blue-200/90">
                Pilih bidang, tajuk cadangan atau taip sendiri. Tersimpan serta-merta ke semua peranti warga sekolah.
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

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Conflict Warning */}
          {conflictResult.hasConflict && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Peringatan Pertindihan Tarikh / Tempat:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-amber-800 pl-1 space-y-0.5">
                {conflictResult.conflicts.map((c, i) => (
                  <li key={i}>{c.description}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Bidang & Unit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>1. Bidang & Unit Pengurusan:</span>
            </label>
            
            {/* Bidang selector buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Pengurusan dan Staf', 'Kurikulum', 'Hal Ehwal Murid', 'Kokurikulum', 'Panitia Mata Pelajaran'] as BidangType[]).map((b) => {
                const isSelected = bidangUtama === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setBidangUtama(b);
                      setUnitUtama(getInitialUnitForBidang(b));
                      setPilihanBank('');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">{b}</div>
                  </button>
                );
              })}
            </div>

            {/* Unit under selected bidang */}
            <div className="pt-2">
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Nama Unit / Panitia:
              </label>
              {bidangUtama === 'Panitia Mata Pelajaran' ? (
                <select
                  value={unitUtama}
                  onChange={(e) => setUnitUtama(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {DEFAULT_PANITIA_LIST.map((p: string) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={unitUtama}
                  onChange={(e) => setUnitUtama(e.target.value)}
                  placeholder="Contoh: Unit Disiplin / Unit Bimbingan / Pentadbiran"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              )}
            </div>
          </div>

          {/* Section 2: Program Title (Dropdown Bank + Buku Pengurusan or Custom) */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-purple-600" />
                <span>2. Tajuk Program / Aktiviti:</span>
              </label>

              {/* Mode toggle */}
              <div className="flex items-center gap-1 bg-white p-0.5 border border-slate-300 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setAdalahTajukSendiri(false)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    !adalahTajukSendiri ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pilih Dari Senarai
                </button>
                <button
                  type="button"
                  onClick={() => setAdalahTajukSendiri(true)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    adalahTajukSendiri ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Taip Tajuk Baharu
                </button>
              </div>
            </div>

            {!adalahTajukSendiri ? (
              <div className="space-y-2">
                <select
                  value={pilihanBank}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPilihanBank(val);
                    const found = availableSuggestions.find((s) => s.tajuk === val);
                    if (found?.jenis) setJenisPengisian(found.jenis);
                    if (found?.unit) setUnitUtama(found.unit);
                  }}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium text-slate-800"
                >
                  <option value="">
                    {bidangUtama === 'Panitia Mata Pelajaran'
                      ? `-- Sila Pilih Program / Mesyuarat Panitia ${unitUtama} (${availableSuggestions.length} Pilihan) --`
                      : `-- Sila Pilih Program / Aktiviti Dari Senarai (${availableSuggestions.length} Pilihan) --`}
                  </option>
                  {availableSuggestions.map((item, idx) => (
                    <option key={idx} value={item.tajuk}>
                      {item.tajuk}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-purple-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {bidangUtama === 'Panitia Mata Pelajaran'
                      ? `Menyenaraikan program, PLC dan mesyuarat rasmi Panitia ${unitUtama}.`
                      : 'Menyenaraikan program dan aktiviti rasmi takwim sekolah yang diselaraskan mengikut bidang.'}
                  </span>
                </p>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={tajukSendiri}
                  onChange={(e) => setTajukSendiri(e.target.value)}
                  placeholder="Masukkan tajuk program / aktiviti baharu di sini..."
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-900"
                />
              </div>
            )}

            {/* Jenis Pengisian & Bilangan Mesyuarat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Jenis Pengisian:
                </label>
                <select
                  value={jenisPengisian}
                  onChange={(e) => setJenisPengisian(e.target.value as JenisPengisian)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Program">Program</option>
                  <option value="Aktiviti">Aktiviti</option>
                  <option value="Mesyuarat">Mesyuarat</option>
                  <option value="Pelaksanaan Berkala">Pelaksanaan Berkala</option>
                </select>
              </div>

              {jenisPengisian === 'Mesyuarat' && (
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Bilangan Mesyuarat:
                  </label>
                  <input
                    type="text"
                    value={bilanganMesyuarat}
                    onChange={(e) => setBilanganMesyuarat(e.target.value)}
                    placeholder="Contoh: Bil. 1/2027"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Tarikh & Masa */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>3. Tarikh & Waktu Pelaksanaan:</span>
              </label>

              {/* All day toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={sepanjangHari}
                  onChange={(e) => setSepanjangHari(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600"
                />
                <span>Sepanjang Hari</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Tarikh Mula:
                </label>
                <input
                  type="date"
                  value={tarikhMula}
                  min="2027-01-01"
                  max="2027-12-31"
                  onChange={(e) => setTarikhMula(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Tarikh Akhir:
                </label>
                <input
                  type="date"
                  value={tarikhAkhir}
                  min={tarikhMula}
                  max="2027-12-31"
                  onChange={(e) => setTarikhAkhir(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Academic Week Badge */}
            <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-blue-900 font-medium">
              <span className="font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-md">
                {weekInfo.code !== 'Tiada Slot' ? weekInfo.code : 'Cuti/Luar Slot'}
              </span>
              <span>{weekInfo.name} · Status: <strong>{dayStatusInfo.statusLabel}</strong></span>
              {dayStatusInfo.reason && <span className="text-blue-700">({dayStatusInfo.reason})</span>}
            </div>

            {/* Time Pickers (if not all day) */}
            {!sepanjangHari && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Masa Mula:</span>
                  </label>
                  <input
                    type="time"
                    value={masaMula}
                    onChange={(e) => setMasaMula(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Masa Akhir:</span>
                  </label>
                  <input
                    type="time"
                    value={masaAkhir}
                    onChange={(e) => setMasaAkhir(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Tempat & Penyelaras (Searchable Teachers List) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>4. Tempat & Penyelaras Program:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tempat */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tempat:</span>
                </label>
                <div className="space-y-1.5">
                  <select
                    value={tempat}
                    onChange={(e) => setTempat(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    {VENUES_LIST.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Penyelaras from School Teachers List */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Penyelaras (Pilih Dari Senarai Guru Sekolah):</span>
                </label>
                <select
                  value={penyelaras}
                  onChange={(e) => setPenyelaras(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-emerald-50/50 border border-emerald-300 text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  {teachersList.map((tName, idx) => (
                    <option key={idx} value={tName}>{tName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catatan Ringkas */}
            <div className="pt-1">
              <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Catatan Ringkas (Pilihan):</span>
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Kehadiran semua guru petang & pagi / Bawa buku nota"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('Draf')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Draf</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('Dihantar')}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-700/20 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{editingEntry ? 'Simpan Perubahan' : 'Daftar & Rekodkan Program'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
