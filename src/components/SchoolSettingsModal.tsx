import React, { useState, useRef, useMemo } from 'react';
import { 
  SchoolSettings, 
  AdminReviewers, 
  CivicValueRecord, 
  SalaryRecord, 
  ExtractedProgramRecord,
  PanitiaConfig,
  HolidayRecord,
  TakwimEntry
} from '../types/takwim';
import { YearlyTakwimView } from './YearlyTakwimView';
import { WeeklyAgendaView } from './WeeklyAgendaView';
import { 
  DEFAULT_SCHOOL_LOGO, 
  DEFAULT_SALARY_DATES, 
  DEFAULT_CIVIC_VALUES 
} from '../constants/schoolSettingsDefaults';
import { MONTH_NAMES_MS, getAllDefaultHolidays } from '../constants/calendar2027';
import { api } from '../services/api';
import { parseSalarySchedule } from '../utils/salaryParser';
import { 
  exportCivicScheduleToExcel, 
  downloadCivicScheduleHTML, 
  printCivicScheduleDocument,
  downloadBulkTakwimTemplate,
  downloadYearlyTakwimPDF,
  downloadWeeklyAgendaPDF
} from '../utils/exportUtils';
import { downloadPLCToolkitExcel, getPLCActivitiesForPanitia } from '../constants/plcToolkits';
import { downloadSKASInstrumentExcel, SKAS_OFFICIAL_ITEMS } from '../constants/skasStandards';
import { PLCActivityItem, SKASTUMSItem, SKASStandardId } from '../types/plcAndSkas';
import { getCivicTuesdaySchedule } from '../utils/civicScheduleHelper';
import { 
  X, 
  Settings, 
  School, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Upload, 
  DollarSign, 
  HeartHandshake, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  FileText, 
  GraduationCap, 
  Award, 
  Layers, 
  AlertTriangle, 
  Calendar, 
  ShieldAlert, 
  ArrowRight,
  Target,
  Search,
  Filter
} from 'lucide-react';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  onSettingsUpdated: (updated: SchoolSettings) => void;
  onOpenBulkUploadModal?: () => void;
  onOpenPLCKitModal?: (initialPanitia?: string) => void;
  onOpenSKASModal?: () => void;
  onOpenPanitiaModal?: () => void;
  panitiaList?: PanitiaConfig[];
  holidays?: HolidayRecord[];
  onRegisterPLC?: (activity: PLCActivityItem) => void;
  onRegisterSKAS?: (item: SKASTUMSItem) => void;
  entries?: TakwimEntry[];
  onViewEntry?: (entry: TakwimEntry) => void;
  onOpenCreateModal?: () => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsUpdated,
  onOpenBulkUploadModal,
  onOpenPLCKitModal,
  onOpenSKASModal,
  onOpenPanitiaModal,
  panitiaList = [],
  holidays = getAllDefaultHolidays(),
  onRegisterPLC,
  onRegisterSKAS,
  entries = [],
  onViewEntry,
  onOpenCreateModal,
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'pentadbir' | 'muat-naik' | 'sivik' | 'guru' | 'panitia' | 'gaji' | 'ringkasan-12bulan' | 'minggu-pdp'>('profil');

  // Form states initialized with settings
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [schoolCode, setSchoolCode] = useState(settings.schoolCode);
  const [schoolLogo, setSchoolLogo] = useState(settings.schoolLogo);
  const [schoolPhone, setSchoolPhone] = useState(settings.schoolPhone || '');
  const [schoolEmail, setSchoolEmail] = useState(settings.schoolEmail || '');

  // Reviewers
  const [reviewers, setReviewers] = useState<AdminReviewers>({
    guruBesar: settings.adminReviewers?.guruBesar || '',
    pk1: settings.adminReviewers?.pk1 || '',
    pkHem: settings.adminReviewers?.pkHem || '',
    pkKk: settings.adminReviewers?.pkKk || '',
    pkPetang: settings.adminReviewers?.pkPetang || '',
  });

  const prevIsOpenRef = useRef(false);

  // Initialize form fields ONLY when modal opens, preventing background polling from clobbering active edits
  React.useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setSchoolName(settings.schoolName || '');
      setSchoolCode(settings.schoolCode || '');
      setSchoolLogo(settings.schoolLogo || DEFAULT_SCHOOL_LOGO);
      setSchoolPhone(settings.schoolPhone || '');
      setSchoolEmail(settings.schoolEmail || '');
      setReviewers({
        guruBesar: settings.adminReviewers?.guruBesar || '',
        pk1: settings.adminReviewers?.pk1 || '',
        pkHem: settings.adminReviewers?.pkHem || '',
        pkKk: settings.adminReviewers?.pkKk || '',
        pkPetang: settings.adminReviewers?.pkPetang || '',
      });
      setTeachers(settings.teachersList || []);
      setExtractedList(settings.extractedPrograms || []);
      if (settings.civicValues && settings.civicValues.length > 0) {
        setCivicList(settings.civicValues);
      }
      if (settings.salaryDates && settings.salaryDates.length > 0) {
        setSalaryList(settings.salaryDates);
      }
      setStatusMsg(null);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, settings]);

  // Teachers List
  const [teachers, setTeachers] = useState<string[]>(settings.teachersList || []);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [bulkTeachersText, setBulkTeachersText] = useState('');
  const [showBulkTeacherModal, setShowBulkTeacherModal] = useState(false);

  // Management Book / Takwim Upload
  const [bookRawText, setBookRawText] = useState('');
  const [extractedList, setExtractedList] = useState<ExtractedProgramRecord[]>(settings.extractedPrograms || []);
  const [isExtracting, setIsExtracting] = useState(false);

  // Civic Values with 48 weekly activities
  const [civicList, setCivicList] = useState<CivicValueRecord[]>(
    settings.civicValues && settings.civicValues[0]?.weeklyActivities?.length
      ? settings.civicValues
      : DEFAULT_CIVIC_VALUES
  );
  const [expandedCivicMonth, setExpandedCivicMonth] = useState<number | null>(1);
  const [civicTuesdayViewMode, setCivicTuesdayViewMode] = useState<'jadual-selasa' | 'kandungan-sivik'>('jadual-selasa');

  // Salary Dates & Universal Parser States
  const [salaryList, setSalaryList] = useState<SalaryRecord[]>(settings.salaryDates || DEFAULT_SALARY_DATES);
  const [salaryPasteText, setSalaryPasteText] = useState('');
  const [isParsingSalary, setIsParsingSalary] = useState(false);
  const salaryFileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // States for Tab 3 (Pusat Muat Naik & Penjana Takwim)
  const [activeUploadTopic, setActiveUploadTopic] = useState<'semua' | 'takwim' | 'plc' | 'skas' | 'buku' | 'guru' | 'gaji'>('semua');
  const [selectedPanitiaForPLC, setSelectedPanitiaForPLC] = useState<string>('Bahasa Melayu');
  const [plcFilterType, setPlcFilterType] = useState<string>('Semua');
  const [plcSearchQuery, setPlcSearchQuery] = useState<string>('');

  const [selectedStandardForSKAS, setSelectedStandardForSKAS] = useState<SKASStandardId>('Standard 1');
  const [skasSearchQuery, setSkasSearchQuery] = useState<string>('');

  // Available Panitia Names
  const availablePanitiaNames = useMemo(() => {
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
      'Sejarah',
      'Reka Bentuk dan Teknologi',
      'Pendidikan Jasmani dan Pendidikan Kesihatan',
      'Pendidikan Seni Visual',
      'Pendidikan Muzik'
    ];
  }, [panitiaList]);

  // Combined List of Meetings and PLC Activities for Selected Panitia
  const panitiaCombinedItems = useMemo(() => {
    // 4 Official Panitia Meetings
    const meetings: PLCActivityItem[] = [
      {
        id: `mesy-panitia-${selectedPanitiaForPLC}-1`,
        panitia: selectedPanitiaForPLC,
        alatPLC: 'Curriculum Mapping',
        tajukAktiviti: `Mesyuarat Panitia ${selectedPanitiaForPLC} Bil. 1/2027 (Ketetapan Kurikulum, Agihan Tugas & DSKP)`,
        objektif: 'Menyelaraskan perancangan tahunan panitia, pengagihan jadual waktu, penyelarasan RPT dan penetapan sasaran KPI akademik.',
        fokusPedagogi: 'Pengurusan Kurikulum & Penyelarasan DSKP/RPT',
        cadanganMasa: '01:30 pm - 03:30 pm',
        cadanganTempat: 'Bilik Gerakan / Bilik Mesyuarat',
        cadanganBulan: [3],
        tindakan: `Ketua Panitia & Semua Guru ${selectedPanitiaForPLC}`,
        alatToolkit: ['Surat Panggilan Mesyuarat (PK07/1)', 'Borang Kehadiran (PK07/2)', 'Minit Mesyuarat SPSK (PK07/3)'],
        evidens: 'Minit Mesyuarat Panitia Bil. 1/2027 Disahkan, Rekod Kehadiran, Edaran DSKP/RPT'
      },
      {
        id: `mesy-panitia-${selectedPanitiaForPLC}-2`,
        panitia: selectedPanitiaForPLC,
        alatPLC: 'Data Analysis',
        tajukAktiviti: `Mesyuarat Panitia ${selectedPanitiaForPLC} Bil. 2/2027 (Analisis PBD Pertengahan Sesi & Post-Mortem Pentaksiran)`,
        objektif: 'Menganalisis pencapaian Tahap Penguasaan TP1-TP6 murid bagi saringan pertengahan sesi dan merangka pelan intervensi bimbingan.',
        fokusPedagogi: 'Post-Mortem Pentaksiran & Intervensi PBD',
        cadanganMasa: '01:30 pm - 03:30 pm',
        cadanganTempat: 'Bilik Mesyuarat 2',
        cadanganBulan: [6],
        tindakan: `Ketua Panitia & Guru Mata Pelajaran`,
        alatToolkit: ['Borang Analisis TP PBD', 'Pelan Intervensi Murid Galus / Sederhana'],
        evidens: 'Minit Mesyuarat Bil. 2/2027, Graf Taburan TP PBD, Senarai Nama Murid Intervensi'
      },
      {
        id: `mesy-panitia-${selectedPanitiaForPLC}-3`,
        panitia: selectedPanitiaForPLC,
        alatPLC: 'Curriculum Mapping',
        tajukAktiviti: `Mesyuarat Panitia ${selectedPanitiaForPLC} Bil. 3/2027 (Kajian Tindakan, Inovasi & Laporan Bimbingan PLC)`,
        objektif: 'Menilai keberkesanan kitaran PLC (Lesson Study/Peer Coaching) yang telah dijalankan dan membincangkan penambahbaikan BBM digital.',
        fokusPedagogi: 'Perkembangan Profesionalisme Berterusan (CPD) & Inovasi',
        cadanganMasa: '01:30 pm - 03:30 pm',
        cadanganTempat: 'Pusat Sumber Sekolah',
        cadanganBulan: [9],
        tindakan: `Ketua Panitia & Penyelaras PLC Panitia`,
        alatToolkit: ['Borang Pelaporan Kitaran PLC', 'Instrumen Kajian Tindakan'],
        evidens: 'Minit Mesyuarat Bil. 3/2027, Dokumen Laporan PLC Disahkan, Bahan Inovasi'
      },
      {
        id: `mesy-panitia-${selectedPanitiaForPLC}-4`,
        panitia: selectedPanitiaForPLC,
        alatPLC: 'Data Analysis',
        tajukAktiviti: `Mesyuarat Panitia ${selectedPanitiaForPLC} Bil. 4/2027 (Penilaian Akhir Sesi Akademik & Laporan Tahunan Panitia)`,
        objektif: 'Merumus pencapaian Ujian Akhir Sesi Akademik (UASA), mengemas kini fail kurikulum dan merancang penambahbaikan sesi hadapan.',
        fokusPedagogi: 'Penilaian Impak Tahunan & Pengurusan Fail SPSK',
        cadanganMasa: '01:30 pm - 03:30 pm',
        cadanganTempat: 'Bilik Mesyuarat',
        cadanganBulan: [12],
        tindakan: `Ketua Panitia & Semua Guru ${selectedPanitiaForPLC}`,
        alatToolkit: ['Borang Laporan Tahunan Panitia', 'Senarai Semak Pengemaskinian Fail SPSK'],
        evidens: 'Minit Mesyuarat Bil. 4/2027, Laporan Tahunan Panitia 2027, Sijil Penghargaan'
      }
    ];

    // Specialized PLC activities tailored to panitia
    const plcActivities = getPLCActivitiesForPanitia(selectedPanitiaForPLC);
    const combined = [...meetings, ...plcActivities];

    return combined.filter(item => {
      // Type filter
      if (plcFilterType === 'Mesyuarat Panitia') {
        if (!item.tajukAktiviti.toLowerCase().includes('mesyuarat')) return false;
      } else if (plcFilterType !== 'Semua') {
        if (item.alatPLC !== plcFilterType) return false;
      }

      // Search query
      if (plcSearchQuery.trim()) {
        const q = plcSearchQuery.toLowerCase();
        return (
          item.tajukAktiviti.toLowerCase().includes(q) ||
          item.objektif.toLowerCase().includes(q) ||
          item.alatPLC.toLowerCase().includes(q) ||
          item.fokusPedagogi.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedPanitiaForPLC, plcFilterType, plcSearchQuery]);

  // Filtered SK@S TUMS Items for Selected Standard
  const filteredSKASItems = useMemo(() => {
    return SKAS_OFFICIAL_ITEMS.filter(item => {
      if (item.standardId !== selectedStandardForSKAS) return false;
      if (skasSearchQuery.trim()) {
        const q = skasSearchQuery.toLowerCase();
        return (
          item.aspekKod.toLowerCase().includes(q) ||
          item.aspekNama.toLowerCase().includes(q) ||
          item.cadanganTajukProgram.toLowerCase().includes(q) ||
          item.objektifProgram.toLowerCase().includes(q) ||
          item.tindakanPGB.toLowerCase().includes(q) ||
          item.unitCadangan.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedStandardForSKAS, skasSearchQuery]);

  // Action handlers to register directly to Takwim
  const handleRegisterPLCItem = (activity: PLCActivityItem) => {
    if (onRegisterPLC) {
      onClose();
      onRegisterPLC(activity);
    } else if (onOpenPLCKitModal) {
      onOpenPLCKitModal(selectedPanitiaForPLC);
    }
  };

  const handleRegisterSKASItem = (item: SKASTUMSItem) => {
    if (onRegisterSKAS) {
      onClose();
      onRegisterSKAS(item);
    } else if (onOpenSKASModal) {
      onOpenSKASModal();
    }
  };

  // Tuesday Civic Schedule with Non-Carry Forward Rule
  const tuesdaySlots = useMemo(() => {
    return getCivicTuesdaySchedule(civicList, holidays, expandedCivicMonth || undefined);
  }, [civicList, holidays, expandedCivicMonth]);

  const allTuesdaySlotsYear = useMemo(() => {
    return getCivicTuesdaySchedule(civicList, holidays);
  }, [civicList, holidays]);

  if (!isOpen) return null;

  // Handle Logo Upload via FileReader & optimize with HTML5 Canvas (max 200px)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMsg({ text: 'Saiz fail logo melebihi had 5MB.', type: 'error' });
        return;
      }

      if (file.type.includes('svg')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setSchoolLogo(reader.result);
            setStatusMsg({ text: 'Logo sekolah berjaya dimuat naik (format vektor SVG).', type: 'success' });
          }
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const maxDim = 200;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > maxDim) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                }
              } else {
                if (height > maxDim) {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const optimizedDataUrl = canvas.toDataURL('image/png', 0.85);
                setSchoolLogo(optimizedDataUrl);
                setStatusMsg({ text: 'Logo sekolah berjaya dimuat naik dan dioptimumkan.', type: 'success' });
              } else {
                setSchoolLogo(reader.result as string);
                setStatusMsg({ text: 'Logo sekolah berjaya dimuat naik.', type: 'success' });
              }
            };
            img.src = reader.result;
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Add Single Teacher
  const handleAddTeacher = () => {
    const trimmed = newTeacherName.trim();
    if (!trimmed) return;
    if (teachers.includes(trimmed)) {
      setStatusMsg({ text: 'Nama guru ini sudah berada dalam senarai.', type: 'error' });
      return;
    }
    setTeachers([...teachers, trimmed]);
    setNewTeacherName('');
    setStatusMsg({ text: `Cikgu ${trimmed} berjaya ditambah ke senarai guru!`, type: 'success' });
  };

  // Remove Teacher
  const handleRemoveTeacher = (idx: number) => {
    const removed = teachers[idx];
    setTeachers(teachers.filter((_, i) => i !== idx));
    setStatusMsg({ text: `Nama ${removed} dipadam daripada senarai.`, type: 'success' });
  };

  // Bulk Teachers Import
  const handleBulkAddTeachers = () => {
    if (!bulkTeachersText.trim()) return;
    const lines = bulkTeachersText
      .split('\n')
      .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(l => l.length > 2);

    const merged = Array.from(new Set([...teachers, ...lines]));
    setTeachers(merged);
    setBulkTeachersText('');
    setShowBulkTeacherModal(false);
    setStatusMsg({ text: `Berjaya menambah ${merged.length - teachers.length} guru baharu ke senarai!`, type: 'success' });
  };

  // AI & Regex Extraction of Management Book / Program Takwim
  const handleExtractBook = () => {
    if (!bookRawText.trim()) {
      setStatusMsg({ text: 'Sila masukkan teks buku pengurusan terlebih dahulu.', type: 'error' });
      return;
    }

    setIsExtracting(true);
    setTimeout(() => {
      try {
        const lines = bookRawText.split('\n');
        const results: ExtractedProgramRecord[] = [];
        let currentMonth = 1;

        const monthMap: Record<string, number> = {
          'januari': 1, 'jan': 1,
          'februari': 2, 'feb': 2,
          'mac': 3,
          'april': 4, 'apr': 4,
          'mei': 5,
          'jun': 6,
          'julai': 7, 'jul': 7,
          'ogos': 8, 'ogo': 8,
          'september': 9, 'sep': 9,
          'oktober': 10, 'okt': 10,
          'november': 11, 'nov': 11,
          'disember': 12, 'dis': 12,
        };

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const lower = trimmed.toLowerCase();
          for (const [mName, mNum] of Object.entries(monthMap)) {
            if (lower.startsWith(mName) || lower.includes(`bulan ${mName}`)) {
              currentMonth = mNum;
              break;
            }
          }

          if (trimmed.length > 5 && !lower.startsWith('bulan') && !monthMap[lower]) {
            let bidang: 'Pengurusan dan Staf' | 'Kurikulum' | 'Hal Ehwal Murid' | 'Kokurikulum' | 'Panitia Mata Pelajaran' = 'Kurikulum';
            let unit = 'Kurikulum';

            if (lower.includes('staf') || lower.includes('mesyuarat guru') || lower.includes('pentadbiran') || lower.includes('dialog')) {
              bidang = 'Pengurusan dan Staf';
              unit = 'Pentadbiran';
            } else if (lower.includes('hem') || lower.includes('disiplin') || lower.includes('spbt') || lower.includes('bantuan') || lower.includes('orientasi')) {
              bidang = 'Hal Ehwal Murid';
              unit = 'Hal Ehwal Murid';
            } else if (lower.includes('koko') || lower.includes('sukan') || lower.includes('kelab') || lower.includes('persatuan') || lower.includes('merentas desa')) {
              bidang = 'Kokurikulum';
              unit = 'Kokurikulum';
            } else if (lower.includes('panitia') || lower.includes('bahasa') || lower.includes('sains') || lower.includes('matematik') || lower.includes('stem')) {
              bidang = 'Panitia Mata Pelajaran';
              unit = 'Panitia Mata Pelajaran';
            }

            results.push({
              id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              tajuk: trimmed.replace(/^\d+[\.\)]\s*/, ''),
              bidang,
              unit,
              bulan: currentMonth,
              source: 'Buku Pengurusan Sekolah',
            });
          }
        }

        setExtractedList(prev => [...prev, ...results]);
        setBookRawText('');
        setStatusMsg({ text: `Berjaya mengekstrak ${results.length} program ke dalam Bank Program Takwim!`, type: 'success' });
      } catch (err: any) {
        setStatusMsg({ text: 'Ralat mengekstrak dokumen buku pengurusan.', type: 'error' });
      } finally {
        setIsExtracting(false);
      }
    }, 600);
  };

  // Parse Raw Text Salary Dates
  const handleParseSalaryText = async () => {
    if (!salaryPasteText.trim()) return;
    setIsParsingSalary(true);
    try {
      const res = await parseSalarySchedule(salaryPasteText);
      if (res.records.length > 0) {
        setSalaryList(res.records);
        setSalaryPasteText('');
        setStatusMsg({ text: `Berjaya mengekstrak ${res.records.length} tarikh gaji penjawat awam daripada teks!`, type: 'success' });
      } else {
        setStatusMsg({ text: 'Format tidak dapat dikesan. Sila pastikan teks mengandungi bulan dan tarikh penerimaan gaji.', type: 'error' });
      }
    } catch {
      setStatusMsg({ text: 'Ralat memproses jadual gaji.', type: 'error' });
    } finally {
      setIsParsingSalary(false);
    }
  };

  // Parse File Salary Dates (PDF/TXT/DOC/XLSX)
  const handleSalaryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingSalary(true);
    try {
      const res = await parseSalarySchedule(file);
      if (res.records.length > 0) {
        setSalaryList(res.records);
        setStatusMsg({ text: `Berjaya mengekstrak ${res.records.length} tarikh gaji daripada fail ${file.name}!`, type: 'success' });
      } else {
        setStatusMsg({ text: 'Fail dibaca tetapi tiada corak jadual gaji JANM dikesan.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: `Gagal membaca fail gaji: ${err.message}`, type: 'error' });
    } finally {
      setIsParsingSalary(false);
      if (salaryFileInputRef.current) salaryFileInputRef.current.value = '';
    }
  };

  // Save Settings to Backend
  const handleSaveAll = async (closeAfter: boolean = false) => {
    setIsSaving(true);
    setStatusMsg(null);

    const updatedData: SchoolSettings = {
      schoolName: schoolName.trim() || 'SK Tudan, Miri',
      schoolCode: schoolCode.trim() || 'YBB4345',
      schoolLogo: schoolLogo || DEFAULT_SCHOOL_LOGO,
      schoolPhone: schoolPhone.trim(),
      schoolEmail: schoolEmail.trim(),
      adminReviewers: reviewers,
      teachersList: teachers,
      civicValues: civicList,
      salaryDates: salaryList,
      extractedPrograms: extractedList,
    };

    try {
      const res = await api.updateSettings(updatedData);
      onSettingsUpdated(res.data);
      setStatusMsg({ text: 'Semua ketetapan sekolah berjaya disimpan dan disegerakkan!', type: 'success' });
      if (closeAfter) {
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Ralat menyimpan ketetapan sekolah.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Settings className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Pusat Ketetapan & Konfigurasi Sekolah</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/40">
                  Semua Ketetapan & Muat Naik
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Pusat pengurusan profil, pentadbir, ruang muat naik takwim/PLC/SK@S, nilai sivik Selasa (tiada carry forward jika cuti), senarai guru, panitia dan gaji.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveAll(false)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all border border-blue-400/30"
              title="Simpan ketetapan sekarang"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Ketetapan'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (7 Comprehensive Tabs) */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profil')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'profil'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            <span>1. Profil & Identiti</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pentadbir')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'pentadbir'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>2. Barisan Pentadbir</span>
          </button>

          {/* TAB 3: PUSAT MUAT NAIK SEKOLAH (ALL UPLOADS CENTRALIZED) */}
          <button
            type="button"
            onClick={() => setActiveTab('muat-naik')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'muat-naik'
                ? 'border-purple-600 text-purple-700 bg-white shadow-2xs'
                : 'border-transparent text-purple-800 hover:text-purple-950 font-semibold'
            }`}
          >
            <Upload className="w-4 h-4 text-purple-600" />
            <span>3. Pusat Muat Naik Sekolah</span>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              Pukal/PLC/SK@S
            </span>
          </button>

          {/* TAB 4: NILAI SIVIK SETIAP SELASA & TIADA CARRY FORWARD */}
          <button
            type="button"
            onClick={() => setActiveTab('sivik')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'sivik'
                ? 'border-rose-600 text-rose-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-rose-600" />
            <span>4. Nilai Sivik Selasa (Tiada C/F)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guru')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'guru'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>5. Senarai Guru ({teachers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('panitia')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'panitia'
                ? 'border-teal-600 text-teal-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <span>6. Panitia ({panitiaList.length || 15})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gaji')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'gaji'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>7. Jadual Gaji JANM</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ringkasan-12bulan')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'ringkasan-12bulan'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                : 'border-transparent text-indigo-700 hover:text-indigo-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>8. Takwim 12 Bulan 2027</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('minggu-pdp')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'minggu-pdp'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                : 'border-transparent text-indigo-700 hover:text-indigo-900'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>9. Minggu PdP (M01–M44)</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`mx-6 mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: Profil & Logo Sekolah */}
          {activeTab === 'profil' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Logo section */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Logo Sekolah:</span>
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 p-2 shadow-xs flex items-center justify-center overflow-hidden">
                    {schoolLogo ? (
                      <img src={schoolLogo} alt="Logo Sekolah" className="w-full h-full object-contain" />
                    ) : (
                      <School className="w-12 h-12 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full">
                    <label className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Muat Naik Logo Baharu</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setSchoolLogo(DEFAULT_SCHOOL_LOGO)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 underline"
                    >
                      Gunakan Logo Rasmi Lalai
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Format: PNG, JPG, atau SVG (Maks. 2MB). Akan dicetak di atas setiap muka surat takwim rasmi.
                  </span>
                </div>

                {/* Details Section */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nama Penuh Sekolah:
                    </label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Contoh: SK Tudan, Miri"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Kod Sekolah:
                      </label>
                      <input
                        type="text"
                        value={schoolCode}
                        onChange={(e) => setSchoolCode(e.target.value)}
                        placeholder="Contoh: YBB4345"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nombor Telefon Sekolah:
                      </label>
                      <input
                        type="text"
                        value={schoolPhone}
                        onChange={(e) => setSchoolPhone(e.target.value)}
                        placeholder="Contoh: 085-654321"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Emel Rasmi Sekolah:
                    </label>
                    <input
                      type="email"
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                      placeholder="Contoh: ybb4345@moe.edu.my"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Instant Save for Tab 1 */}
              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveAll(false)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil & Logo Sekolah'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Barisan Pentadbir Penyemak & Pengesah */}
          {activeTab === 'pentadbir' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed font-medium">
                Nama-nama pentadbir di bawah disegerakkan secara langsung ke semua peranti. Sebarang pengemaskinian nama di sini akan serta-merta menggantikan nama pentadbir terdahulu di seluruh navigasi sistem, aliran kelulusan, dan cetakan rasmi tanpa memaparkan nama lama.
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center justify-between">
                    <span>1. Guru Besar (Pengesah Mutlak):</span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-sm">Pengesah Utama</span>
                  </label>
                  <input
                    type="text"
                    value={reviewers.guruBesar}
                    onChange={(e) => setReviewers({ ...reviewers, guruBesar: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center justify-between">
                    <span>2. Penolong Kanan Pentadbiran & Kurikulum (PK 1):</span>
                    <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-sm">Penyemak Kurikulum</span>
                  </label>
                  <input
                    type="text"
                    value={reviewers.pk1}
                    onChange={(e) => setReviewers({ ...reviewers, pk1: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center justify-between">
                    <span>3. Penolong Kanan Hal Ehwal Murid (PK HEM):</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-sm">Penyemak HEM</span>
                  </label>
                  <input
                    type="text"
                    value={reviewers.pkHem}
                    onChange={(e) => setReviewers({ ...reviewers, pkHem: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center justify-between">
                    <span>4. Penolong Kanan Kokurikulum (PK KK):</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-sm">Penyemak Kokurikulum</span>
                  </label>
                  <input
                    type="text"
                    value={reviewers.pkKk}
                    onChange={(e) => setReviewers({ ...reviewers, pkKk: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center justify-between">
                    <span>5. Penyelia Petang / PK Petang:</span>
                    <span className="text-[10px] text-teal-700 font-bold bg-teal-100 px-2 py-0.5 rounded-sm">Penyemak Sesi Petang</span>
                  </label>
                  <input
                    type="text"
                    value={reviewers.pkPetang}
                    onChange={(e) => setReviewers({ ...reviewers, pkPetang: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Instant Save for Tab 2 */}
              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveAll(false)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Barisan Pentadbir'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PUSAT MUAT NAIK SEKOLAH (ORGANIZED BY MATERIAL TOPIC WITH LIVE LIST-DOWN) */}
          {activeTab === 'muat-naik' && (
            <div className="space-y-6">
              
              {/* Top Banner */}
              <div className="p-4 bg-linear-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-purple-950">
                          Pusat Muat Naik & Penjanaan Takwim Berpusat
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-200 text-purple-900 rounded-full">
                          6 Tajuk Bahan Lengkap
                        </span>
                      </div>
                      <p className="text-xs text-purple-900/80 mt-0.5 max-w-3xl leading-relaxed">
                        Segala ruang muat naik kini disatukan ke dalam Pusat Ketetapan mengikut tajuk bahan masing-masing. Sistem menyediakan <strong>senarai pilihan (list-down)</strong> bagi aktiviti PLC, mesyuarat panitia dan item instrumen SK@S untuk terus didaftarkan ke Takwim Sekolah 2027 secara efisien dan tepat.
                      </p>
                    </div>
                  </div>

                  {/* Topic Quick Filters */}
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveUploadTopic('semua')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        activeUploadTopic === 'semua'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      Semua Tajuk
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveUploadTopic('takwim')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        activeUploadTopic === 'takwim'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-white text-purple-800 hover:bg-purple-50 border border-purple-200'
                      }`}
                    >
                      Takwim Pukal
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveUploadTopic('plc')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        activeUploadTopic === 'plc'
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-white text-teal-800 hover:bg-teal-50 border border-teal-200'
                      }`}
                    >
                      Kit PLC & Mesyuarat
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveUploadTopic('skas')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        activeUploadTopic === 'skas'
                          ? 'bg-amber-700 text-white shadow-xs'
                          : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                      }`}
                    >
                      Instrumen SK@S
                    </button>
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* TAJUK 1: TAKWIM & PROGRAM SEKOLAH (PUKAL)                      */}
              {/* ============================================================== */}
              {(activeUploadTopic === 'semua' || activeUploadTopic === 'takwim') && (
                <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Tajuk 1: Takwim & Program Sekolah (Pukal)
                          </h4>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            Excel (.xlsx) / CSV / Teks
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Muat naik fail takwim lengkap tahun 2027 sekali gus. Sistem mengekstrak tarikh, 5 lajur bidang, unit dan masa secara automatik.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {onOpenBulkUploadModal && (
                        <button
                          type="button"
                          onClick={onOpenBulkUploadModal}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Muat Naik Fail Takwim</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => downloadBulkTakwimTemplate(schoolName)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Templat Excel Rasmi</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-2.5 bg-purple-50/70 border border-purple-100 rounded-xl">
                      <div className="font-bold text-purple-900 mb-0.5">Sokongan 5 Lajur Bidang:</div>
                      <div className="text-[11px] text-purple-800 leading-snug">
                        Pengurusan & Staf, Kurikulum, Hal Ehwal Murid, Kokurikulum, dan Panitia Mata Pelajaran.
                      </div>
                    </div>
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                      <div className="font-bold text-emerald-900 mb-0.5">Automatik Cuti Hujung Minggu:</div>
                      <div className="text-[11px] text-emerald-800 leading-snug">
                        Sabtu & Ahad dikosongkan secara automatik kecuali program khusus luar waktu (cth: Kem Motivasi).
                      </div>
                    </div>
                    <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                      <div className="font-bold text-blue-900 mb-0.5">Format Fleksibel:</div>
                      <div className="text-[11px] text-blue-800 leading-snug">
                        Menyokong format fail Excel rasmi sekolah, CSV, serta tampalan teks terus dari dokumen Word.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAJUK 2: KIT PLC PANITIA & SENARAI PILIHAN AKTIVITI/MESYUARAT   */}
              {/* ============================================================== */}
              {(activeUploadTopic === 'semua' || activeUploadTopic === 'plc') && (
                <div className="bg-white border border-teal-200 rounded-2xl p-4 shadow-2xs space-y-4">
                  {/* Header of Tajuk 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Tajuk 2: Kit PLC Panitia & Penjana Takwim Panitia
                          </h4>
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                            9 Alat PLC KPM & 4 Sesi Mesyuarat
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Pilih panitia untuk melihat <strong>senarai pilihan (list-down)</strong> aktiviti PLC dan mesyuarat panitia yang berkaitan, serta daftar terus ke Takwim dengan 1 klik.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {onOpenPLCKitModal && (
                        <button
                          type="button"
                          onClick={() => onOpenPLCKitModal(selectedPanitiaForPLC)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pengurus Kit PLC Penuh</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => downloadPLCToolkitExcel(selectedPanitiaForPLC, schoolName)}
                        className="px-3 py-1.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-teal-700" />
                        <span>Sarana PLC (Excel)</span>
                      </button>
                    </div>
                  </div>

                  {/* Panitia Selector Bar & Filter Tabs */}
                  <div className="bg-teal-50/60 border border-teal-200/70 p-3 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Panitia Dropdown Selector */}
                      <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                        <span className="text-xs font-bold text-teal-950 whitespace-nowrap">
                          Pilih Panitia:
                        </span>
                        <select
                          value={selectedPanitiaForPLC}
                          onChange={(e) => setSelectedPanitiaForPLC(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-bold bg-white text-teal-950 border border-teal-300 rounded-xl focus:ring-2 focus:ring-teal-500 shadow-2xs"
                        >
                          {availablePanitiaNames.map((panitia) => (
                            <option key={panitia} value={panitia}>
                              Panitia {panitia}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Search in PLC items */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-teal-600" />
                        <input
                          type="text"
                          value={plcSearchQuery}
                          onChange={(e) => setPlcSearchQuery(e.target.value)}
                          placeholder="Cari aktiviti PLC / mesyuarat..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-teal-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                      {['Semua', 'Mesyuarat Panitia', 'Lesson Study', 'Peer Coaching', 'Learning Walk', 'Teacher Sharing Sessions', 'Data Analysis'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPlcFilterType(type)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                            plcFilterType === type
                              ? 'bg-teal-700 text-white shadow-2xs'
                              : 'bg-white text-teal-800 hover:bg-teal-100 border border-teal-200'
                          }`}
                        >
                          {type === 'Teacher Sharing Sessions' ? 'TSS (Sharing)' : type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LIVE LIST-DOWN: Program, Aktiviti & Mesyuarat Berkaitan Panitia */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-bold text-slate-800">
                        Senarai Pilihan Program & Mesyuarat Panitia {selectedPanitiaForPLC} ({panitiaCombinedItems.length} item berkaitan):
                      </span>
                      <span className="text-[11px] text-teal-700 font-medium">
                        Klik &quot;Daftar ke Takwim&quot; untuk masukkan ke jadual sekolah
                      </span>
                    </div>

                    {panitiaCombinedItems.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        Tiada program dijumpai bagi kriteria carian ini.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                        {panitiaCombinedItems.map((item) => {
                          const isMeeting = item.tajukAktiviti.toLowerCase().includes('mesyuarat');
                          return (
                            <div
                              key={item.id}
                              className={`p-3.5 rounded-xl border transition-all hover:shadow-sm flex flex-col justify-between space-y-2.5 ${
                                isMeeting
                                  ? 'bg-linear-to-br from-indigo-50/60 to-purple-50/40 border-indigo-200'
                                  : 'bg-linear-to-br from-teal-50/60 to-cyan-50/40 border-teal-200'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                        isMeeting
                                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                          : 'bg-teal-100 text-teal-900 border border-teal-300'
                                      }`}
                                    >
                                      {isMeeting ? 'Mesyuarat Panitia' : item.alatPLC}
                                    </span>
                                    {item.cadanganBulan && item.cadanganBulan.length > 0 && (
                                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-white text-slate-700 border border-slate-200 rounded-md">
                                        🗓 Bulan {item.cadanganBulan.map(b => MONTH_NAMES_MS[b - 1]).join(', ')}
                                      </span>
                                    )}
                                  </div>

                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {item.cadanganMasa}
                                  </span>
                                </div>

                                <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                  {item.tajukAktiviti}
                                </h5>

                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                  <strong>Objektif:</strong> {item.objektif}
                                </p>

                                {item.fokusPedagogi && (
                                  <div className="text-[10.5px] text-slate-600 bg-white/70 p-1.5 rounded-lg border border-slate-200/60">
                                    <span className="font-semibold text-slate-800">Fokus: </span>
                                    {item.fokusPedagogi}
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                                <div className="text-[10px] text-slate-500 truncate max-w-[200px]" title={item.evidens}>
                                  Evidens: {item.evidens}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRegisterPLCItem(item)}
                                  className={`px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs shrink-0 ${
                                    isMeeting
                                      ? 'bg-indigo-700 hover:bg-indigo-800'
                                      : 'bg-teal-700 hover:bg-teal-800'
                                  }`}
                                  title="Daftar aktiviti ini terus ke dalam Takwim Sekolah 2027"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Daftar ke Takwim</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAJUK 3: INSTRUMEN PENILAIAN SK@S KPM (SKPM KUALITI @SEKOLAH)  */}
              {/* ============================================================== */}
              {(activeUploadTopic === 'semua' || activeUploadTopic === 'skas') && (
                <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-2xs space-y-4">
                  {/* Header of Tajuk 3 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Tajuk 3: Instrumen SK@S KPM (SKPM Kualiti @Sekolah)
                          </h4>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                            Tindakan Berpandukan Item Standard TUMS
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Pilih Standard SK@S untuk melihat <strong>senarai pilihan (list-down)</strong> cadangan program intervensi berasaskan keperluan instrumen skor SK@S KPM.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {onOpenSKASModal && (
                        <button
                          type="button"
                          onClick={onOpenSKASModal}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Buka Instrumen SK@S Penuh</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => downloadSKASInstrumentExcel(schoolName)}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-700" />
                        <span>Templat SK@S (Excel)</span>
                      </button>
                    </div>
                  </div>

                  {/* Standard Selector Tabs & Search */}
                  <div className="bg-amber-50/60 border border-amber-200/70 p-3 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Standard Selector Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                        {[
                          { id: 'Standard 1', label: 'Std 1: Kepimpinan' },
                          { id: 'Standard 2', label: 'Std 2: Organisasi' },
                          { id: 'Standard 3.1', label: 'Std 3.1: Kurikulum' },
                          { id: 'Standard 3.2', label: 'Std 3.2: Kokurikulum' },
                          { id: 'Standard 3.3', label: 'Std 3.3: HEM' },
                          { id: 'Standard 4', label: 'Std 4: PdPc' },
                        ].map((std) => (
                          <button
                            key={std.id}
                            type="button"
                            onClick={() => setSelectedStandardForSKAS(std.id as SKASStandardId)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                              selectedStandardForSKAS === std.id
                                ? 'bg-amber-700 text-white shadow-2xs'
                                : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-300'
                            }`}
                          >
                            {std.label}
                          </button>
                        ))}
                      </div>

                      {/* Search */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-700" />
                        <input
                          type="text"
                          value={skasSearchQuery}
                          onChange={(e) => setSkasSearchQuery(e.target.value)}
                          placeholder="Cari item TUMS / tajuk program..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* LIVE LIST-DOWN: Program Intervensi SK@S Mengikut TUMS */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-bold text-slate-800">
                        Senarai Pilihan Program Berasaskan {selectedStandardForSKAS} ({filteredSKASItems.length} item TUMS):
                      </span>
                      <span className="text-[11px] text-amber-800 font-medium">
                        Klik &quot;Daftar ke Takwim&quot; untuk masukkan aktiviti TUMS ke takwim
                      </span>
                    </div>

                    {filteredSKASItems.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        Tiada cadangan program dijumpai bagi kriteria carian ini.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                        {filteredSKASItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl border border-amber-200 bg-linear-to-br from-amber-50/50 to-orange-50/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-2.5"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-950 rounded-md border border-amber-300">
                                    TUMS {item.aspekKod}
                                  </span>
                                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-white text-slate-700 border border-slate-200 rounded-md">
                                    {item.bidangTakwim}
                                  </span>
                                  {item.cadanganBulan && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                                      🗓 Bulan {item.cadanganBulan.map(b => MONTH_NAMES_MS[b - 1]).join(', ')}
                                    </span>
                                  )}
                                </div>

                                <span className="text-[10px] text-slate-500 font-medium">
                                  {item.unitCadangan}
                                </span>
                              </div>

                              <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                {item.cadanganTajukProgram}
                              </h5>

                              <div className="text-[11px] text-slate-700 leading-snug bg-white/70 p-2 rounded-lg border border-amber-200/50 space-y-1">
                                <div>
                                  <strong className="text-amber-950">Aspek: </strong>
                                  <span>{item.aspekNama}</span>
                                </div>
                                <div>
                                  <strong className="text-slate-800">Tindakan KPM: </strong>
                                  <span>{item.tindakanPGB}</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                              <div className="text-[10px] text-slate-500 truncate max-w-[200px]" title={item.evidensDiperlukan.join(', ')}>
                                Evidens: {item.evidensDiperlukan.join(', ')}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRegisterSKASItem(item)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-1 shadow-2xs shrink-0"
                                title="Daftar cadangan program ini ke Takwim 2027"
                              >
                                <Target className="w-3.5 h-3.5" />
                                <span>Daftar ke Takwim</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAJUK 4: EKSTRAK TEKS BUKU PENGURUSAN SEKOLAH                   */}
              {/* ============================================================== */}
              {(activeUploadTopic === 'semua' || activeUploadTopic === 'buku') && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-700" />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Tajuk 4: Ekstrak Teks Takwim daripada Buku Pengurusan Sekolah
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Tampal teks daripada fail PDF / Word
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={bookRawText}
                    onChange={(e) => setBookRawText(e.target.value)}
                    placeholder={`Contoh teks:\nJANUARI:\n1. Mesyuarat Guru Bil 1/2027\n2. Program Orientasi Tahun 1 (HEM)\n\nFEBRUARI:\n1. Mesyuarat Panitia Bahasa Melayu Bil 1\n2. PLC Lesson Study Sains`}
                    className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-mono"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Jumlah program diekstrak sedia ada: <strong>{extractedList.length} program</strong>
                    </span>
                    <button
                      type="button"
                      disabled={isExtracting}
                      onClick={handleExtractBook}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isExtracting ? 'Mengekstrak...' : 'Mula Ekstrak ke Bank Program'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAJUK 5 & 6: SENARAI GURU & JADUAL GAJI JANM                   */}
              {/* ============================================================== */}
              {(activeUploadTopic === 'semua' || activeUploadTopic === 'guru' || activeUploadTopic === 'gaji') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tajuk 5: Senarai Guru */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        <h5 className="text-xs font-bold text-slate-900">Tajuk 5: Senarai Guru Sekolah (Pukal)</h5>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {teachers.length} guru telah didaftarkan dalam sistem e-Takwim.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBulkTeacherModal(true)}
                      className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shrink-0"
                    >
                      Muat Naik Guru
                    </button>
                  </div>

                  {/* Tajuk 6: Jadual Gaji */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <h5 className="text-xs font-bold text-slate-900">Tajuk 6: Jadual Gaji JANM 2027</h5>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {salaryList.length} tarikh gaji bulanan rasmi penjawat awam.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('gaji')}
                      className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors shrink-0"
                    >
                      Kemas Kini Gaji
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: NILAI SIVIK SETIAP SELASA & TIADA CARRY FORWARD JIKA CUTI */}
          {activeTab === 'sivik' && (
            <div className="space-y-4">
              
              {/* Mandatory Policy Banner */}
              <div className="p-4 bg-linear-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                    Ketetapan Dasar Sivik: Pelaksanaan Setiap Hari Selasa 2027 & Peraturan Tiada Carry Forward
                  </h4>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Semua pelaksanaan aktiviti sivik 5 minit sekolah dijadualkan tepat pada <strong>setiap hari Selasa</strong> (Sesi Pagi: 07:00–07:30 / Sesi Petang: 12:40–01:10). <strong>Sekiranya hari Selasa jatuh pada cuti umum atau cuti sekolah, nilai subtema minggu tersebut DIBATALKAN dan TIDAK BOLEH DI-CARRY FORWARD</strong> ke minggu berikutnya agar kesinambungan takwim tahunan terpelihara.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-amber-950">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                    <span>Hari Persekolahan: Terlaksana Mengikut Jadual</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
                    <span>Cuti Umum / Sekolah: Dibatalkan (Tiada Carry Forward)</span>
                  </span>
                </div>
              </div>

              {/* View Switcher: Jadual Tarikh Selasa vs Kandungan Teras & Subtema */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCivicTuesdayViewMode('jadual-selasa')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                      civicTuesdayViewMode === 'jadual-selasa'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Jadual Tarikh Setiap Hari Selasa 2027 ({allTuesdaySlotsYear.length} Sesi)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCivicTuesdayViewMode('kandungan-sivik')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                      civicTuesdayViewMode === 'kandungan-sivik'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Sunting Nilai Teras & Subtema (12 Bulan)</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => exportCivicScheduleToExcel(civicList, settings, holidays)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                    title="Muat turun jadual lengkap ke format Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCivicScheduleHTML(civicList, settings, holidays)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                    title="Muat turun dokumen HTML bercetak"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Dokumen</span>
                  </button>
                </div>
              </div>

              {/* View 1: JADUAL TARIKH HARI SELASA 2027 DENGAN PERATURAN CUTI TIADA CARRY FORWARD */}
              {civicTuesdayViewMode === 'jadual-selasa' && (
                <div className="space-y-3">
                  {/* Month filter pill carousel */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setExpandedCivicMonth(null)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                        expandedCivicMonth === null
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Semua Bulan (52 Minggu)
                    </button>
                    {MONTH_NAMES_MS.map((mName, idx) => {
                      const mNum = idx + 1;
                      const isSel = expandedCivicMonth === mNum;
                      return (
                        <button
                          key={mNum}
                          type="button"
                          onClick={() => setExpandedCivicMonth(mNum)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                            isSel
                              ? 'bg-blue-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {mName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Table of Tuesday dates */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 sticky top-0 z-10">
                        <tr>
                          <th className="py-2.5 px-3 w-20 text-center">Bulan</th>
                          <th className="py-2.5 px-2 w-12 text-center">Minggu</th>
                          <th className="py-2.5 px-3 w-44">Tarikh Pelaksanaan (Selasa)</th>
                          <th className="py-2.5 px-3 w-40">Status & Peraturan Dasar</th>
                          <th className="py-2.5 px-3 w-36">Nilai Teras</th>
                          <th className="py-2.5 px-3">Tajuk & Sub-Nilai 5 Minit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {tuesdaySlots.map((slot, idx) => {
                          const isCancelled = slot.isHoliday;
                          return (
                            <tr
                              key={idx}
                              className={`transition-colors ${
                                isCancelled ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center font-bold text-slate-900 bg-slate-50/50">
                                {slot.monthName}
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-700">
                                M{slot.weekIndex}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span>{slot.tuesdayDisplay}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                {isCancelled ? (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                      <span>DIBATALKAN (CUTI)</span>
                                    </span>
                                    <div className="text-[10px] text-amber-800 font-semibold leading-tight">
                                      {slot.holidayReason || 'Cuti'}
                                    </div>
                                    <div className="text-[9px] text-slate-500 italic">
                                      *Tidak di-carry forward
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>TERLAKSANA BERJADUAL</span>
                                    </span>
                                    <div className="text-[10px] text-slate-500">
                                      Dwisesi: Pagi & Petang
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-800 block">{slot.coreValue}</span>
                                <span className="text-[10px] text-slate-500">{slot.subTheme}</span>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className={`font-semibold ${isCancelled ? 'text-slate-600' : 'text-slate-900'}`}>
                                  {slot.tajukAktiviti}
                                </div>
                                <div className="text-[10px] text-emerald-700">
                                  {slot.subNilai}
                                </div>
                                {isCancelled && (
                                  <div className="text-[9.5px] text-amber-900 mt-0.5 bg-amber-100/60 p-1 rounded">
                                    ⚠️ Subtema ini tidak diganti pada tarikh lain; takwim minggu seterusnya meneruskan subtema asalnya.
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 2: KANDUNGAN SIVIK (SUNTTING SUBTEMA 12 BULAN) */}
              {civicTuesdayViewMode === 'kandungan-sivik' && (
                <div className="space-y-2">
                  {civicList.map((monthItem, mIdx) => {
                    const isExpanded = expandedCivicMonth === monthItem.month;
                    const monthNameStr = MONTH_NAMES_MS[monthItem.month - 1];

                    return (
                      <div key={monthItem.month} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setExpandedCivicMonth(isExpanded ? null : monthItem.month)}
                          className="w-full p-3 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center font-mono">
                              {monthItem.month}
                            </span>
                            <div>
                              <div className="font-bold text-xs text-slate-900">
                                Bulan {monthItem.month}: {monthNameStr} 2027
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                                <span className="font-semibold text-rose-700">Teras: {monthItem.coreValue}</span>
                                <span>·</span>
                                <span>{monthItem.subTheme}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              {monthItem.weeklyActivities?.length || 4} Aktiviti 5 Minit
                            </span>
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-3.5 border-t border-slate-200 space-y-3 bg-white">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Nilai Teras Sivik:</label>
                                <input
                                  type="text"
                                  value={monthItem.coreValue}
                                  onChange={(e) => {
                                    const updated = [...civicList];
                                    updated[mIdx].coreValue = e.target.value;
                                    setCivicList(updated);
                                  }}
                                  className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-md font-bold text-rose-900"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Fokus / Sub-Tema Bulanan:</label>
                                <input
                                  type="text"
                                  value={monthItem.subTheme}
                                  onChange={(e) => {
                                    const updated = [...civicList];
                                    updated[mIdx].subTheme = e.target.value;
                                    setCivicList(updated);
                                  }}
                                  className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800"
                                />
                              </div>
                            </div>

                            {/* Weekly Activities */}
                            <div className="space-y-2 pt-1 border-t border-slate-100">
                              <span className="text-[11px] font-bold text-slate-700 block">
                                Perincian Aktiviti Mengikut Minggu & Panduan 5 Minit:
                              </span>

                              {(monthItem.weeklyActivities || []).map((act, actIdx) => (
                                <div key={actIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-mono">
                                      Minggu {act.minggu}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      Sasaran: {act.fokusSasaran || 'Semua Murid'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Tajuk Aktiviti:</label>
                                      <input
                                        type="text"
                                        value={act.tajukAktiviti}
                                        onChange={(e) => {
                                          const updated = [...civicList];
                                          updated[mIdx].weeklyActivities![actIdx].tajukAktiviti = e.target.value;
                                          setCivicList(updated);
                                        }}
                                        className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-md text-slate-900 font-semibold"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Sub-Nilai:</label>
                                      <input
                                        type="text"
                                        value={act.subNilai}
                                        onChange={(e) => {
                                          const updated = [...civicList];
                                          updated[mIdx].weeklyActivities![actIdx].subNilai = e.target.value;
                                          setCivicList(updated);
                                        }}
                                        className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-md text-slate-800"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Panduan Tindakan 5 Minit:</label>
                                    <textarea
                                      rows={2}
                                      value={act.cadanganAktiviti5Minit}
                                      onChange={(e) => {
                                        const updated = [...civicList];
                                        updated[mIdx].weeklyActivities![actIdx].cadanganAktiviti5Minit = e.target.value;
                                        setCivicList(updated);
                                      }}
                                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 5: Senarai Guru Sekolah */}
          {activeTab === 'guru' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-emerald-950">Senarai Guru Berdaftar Sekolah:</span>
                  <p className="text-emerald-800 mt-0.5">
                    Senarai guru ini digunakan terus sebagai pilihan dropdown <strong>Penyelaras Program</strong> dalam borang pendaftaran takwim.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkTeacherModal(true)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shrink-0 flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Muat Naik / Tampal Senarai Ramai</span>
                </button>
              </div>

              {/* Add Single Teacher */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTeacher();
                    }
                  }}
                  placeholder="Masukkan nama guru (contoh: Pn. Siti Sarah Binti Rosli)"
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddTeacher}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Guru</span>
                </button>
              </div>

              {/* Teachers Table / List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-72 overflow-y-auto bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 w-12 text-center">Bil</th>
                      <th className="py-2 px-3">Nama Penuh Guru</th>
                      <th className="py-2 px-3 w-20 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {teachers.map((name, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{name}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveTeacher(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Padam nama guru"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instant Save for Tab 5 */}
              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveAll(false)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Senarai Guru'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: Panitia Mata Pelajaran & Unit Sokongan */}
          {activeTab === 'panitia' && (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-teal-950">Konfigurasi Panitia Mata Pelajaran & Unit Sokongan:</span>
                  <p className="text-teal-800 mt-0.5">
                    Terdapat {panitiaList.length} panitia dan unit sokongan. Setiap panitia mempunyai ruang PLC dan kalendar tersendiri.
                  </p>
                </div>
                {onOpenPanitiaModal && (
                  <button
                    type="button"
                    onClick={onOpenPanitiaModal}
                    className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Urus Panitia & Ketua</span>
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-80 overflow-y-auto bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 w-14 text-center">Kod</th>
                      <th className="py-2 px-3">Nama Panitia / Unit</th>
                      <th className="py-2 px-3 w-36">Bidang</th>
                      <th className="py-2 px-3 w-44">Ketua Panitia</th>
                      <th className="py-2 px-3 w-28 text-center">Tindakan PLC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {panitiaList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-center font-mono font-bold text-teal-700">{p.kod}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{p.nama}</td>
                        <td className="py-2 px-3 text-slate-600">{p.bidang}</td>
                        <td className="py-2 px-3 text-slate-700 font-medium">{p.ketua || 'Belum dilantik'}</td>
                        <td className="py-2 px-3 text-center">
                          {onOpenPLCKitModal && p.bidang === 'Panitia Mata Pelajaran' && (
                            <button
                              type="button"
                              onClick={() => onOpenPLCKitModal(p.nama)}
                              className="px-2 py-0.5 text-[10px] font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 rounded border border-teal-300 transition-colors"
                            >
                              Kit PLC
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: Jadual Gaji JANM */}
          {activeTab === 'gaji' && (
            <div className="space-y-4">
              <div className="p-3 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                <span className="font-bold">Jadual Tarikh Pembayaran Emolumen Penjawat Awam 2027 (JANM):</span>
                <p className="text-emerald-800 mt-0.5">
                  Tarikh-tarikh ini ditandakan terus di dalam kalendar takwim bulanan sekolah dengan ikon khas.
                </p>
              </div>

              {/* Upload or Paste JANM */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Muat Naik / Kemas Kini Jadual Gaji JANM Baharu:</span>
                  <label className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pilih Fail (PDF / Teks)</span>
                    <input
                      ref={salaryFileInputRef}
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleSalaryFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={salaryPasteText}
                    onChange={(e) => setSalaryPasteText(e.target.value)}
                    placeholder="Contoh teks: Januari: 21.01.2027, Februari: 23.02.2027, Mac: 24.03.2027..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    disabled={isParsingSalary}
                    onClick={handleParseSalaryText}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                  >
                    {isParsingSalary ? 'Memproses...' : 'Ekstrak Tarikh'}
                  </button>
                </div>
              </div>

              {/* Salary Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-72 overflow-y-auto bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-20">Bulan</th>
                      <th className="py-2 px-3 w-36">Tarikh Gaji</th>
                      <th className="py-2 px-3 w-24">Hari</th>
                      <th className="py-2 px-3">Catatan Pembayaran (JANM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {salaryList.map((item, idx) => (
                      <tr key={item.month} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">Bulan {item.month}</td>
                        <td className="py-1.5 px-3">
                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) => {
                              const updated = [...salaryList];
                              updated[idx].date = e.target.value;
                              setSalaryList(updated);
                            }}
                            className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-md font-mono font-bold text-emerald-800"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={item.dayName}
                            onChange={(e) => {
                              const updated = [...salaryList];
                              updated[idx].dayName = e.target.value;
                              setSalaryList(updated);
                            }}
                            className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={item.note || ''}
                            onChange={(e) => {
                              const updated = [...salaryList];
                              updated[idx].note = e.target.value;
                              setSalaryList(updated);
                            }}
                            className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-700"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: Takwim 12 Bulan (Diselitkan ke Ketetapan Sekolah) */}
          {activeTab === 'ringkasan-12bulan' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <strong className="block text-sm">Ringkasan Takwim 12 Bulan Sesi 2027</strong>
                  <p className="text-[11px] text-indigo-700">Paparan tahunan lengkap bagi setiap bulan persekolahan untuk rujukan pentadbir dan perancangan awal.</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadYearlyTakwimPDF(entries, holidays, settings)}
                  className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun PDF (12 Bulan)</span>
                </button>
              </div>
              <YearlyTakwimView
                entries={entries}
                holidays={holidays}
                onSelectMonth={() => {}}
                onViewEntry={onViewEntry || (() => {})}
              />
            </div>
          )}

          {/* TAB 9: Minggu PdP M01-M44 (Diselitkan ke Ketetapan Sekolah) */}
          {activeTab === 'minggu-pdp' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <strong className="block text-sm">Jadual Minggu Persekolahan PdP (M01 – M44) 2027</strong>
                  <p className="text-[11px] text-indigo-700">Kalendar akademik Kumpulan B rasmi dengan perincian hari PdP, cuti penggal dan cuti umum.</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadWeeklyAgendaPDF(settings, holidays)}
                  className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun PDF (Minggu PdP)</span>
                </button>
              </div>
              <WeeklyAgendaView
                entries={entries}
                holidays={holidays}
                onViewEntry={onViewEntry || (() => {})}
                onOpenCreateModal={onOpenCreateModal || (() => {})}
              />
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveAll(false)}
              className="px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-300 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-4 h-4 text-blue-700" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveAll(true)}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-700/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua & Tutup'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Teacher Modal */}
      {showBulkTeacherModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Muat Naik / Tampal Senarai Ramai Guru</span>
            </h3>
            <p className="text-xs text-slate-600">
              Tampal nama-nama guru sekolah (satu baris bagi setiap guru). Boleh salin terus daripada fail Excel atau senarai kakitangan:
            </p>
            <textarea
              rows={8}
              value={bulkTeachersText}
              onChange={(e) => setBulkTeachersText(e.target.value)}
              placeholder={`Pn. Faridah Binti Razak\nEn. Mohd Hafiz Bin Zain\nPn. Siti Aminah Binti Ahmad\nEn. Raymond Ak George`}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkTeacherModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkAddTeachers}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
              >
                Masukkan ke Senarai Guru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
