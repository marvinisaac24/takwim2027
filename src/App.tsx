import React, { useState, useEffect, useCallback } from 'react';
import { TakwimEntry, HolidayRecord, PanitiaConfig, UserProfile, BidangType, SchoolSettings, JenisPengisian } from './types/takwim';
import { SAMPLE_USERS, INITIAL_PANITIA_CONFIGS, getDynamicUserProfiles } from './constants/bankProgram';
import { getAllDefaultHolidays, MONTH_NAMES_MS } from './constants/calendar2027';
import { DEFAULT_SCHOOL_SETTINGS } from './constants/schoolSettingsDefaults';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { SchoolBanner } from './components/SchoolBanner';
import { DashboardView } from './components/DashboardView';
import { MonthlyMultiColumnView } from './components/MonthlyMultiColumnView';
import { MonthlyTableView } from './components/MonthlyTableView';
import { MonthlyCalendarView } from './components/MonthlyCalendarView';
import { YearlyTakwimView } from './components/YearlyTakwimView';
import { WeeklyAgendaView } from './components/WeeklyAgendaView';
import { ApprovalQueueView } from './components/ApprovalQueueView';
import { SystemVerificationSuite } from './components/SystemVerificationSuite';
import { ProgramFormModal } from './components/ProgramFormModal';
import { ProgramDetailsModal } from './components/ProgramDetailsModal';
import { HolidaysModal } from './components/HolidaysModal';
import { PanitiaSettingsModal } from './components/PanitiaSettingsModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { CivicScheduleModal } from './components/CivicScheduleModal';
import { BulkTakwimUploadModal } from './components/BulkTakwimUploadModal';
import { PLCKitModal } from './components/PLCKitModal';
import { SKASInstrumentModal } from './components/SKASInstrumentModal';
import { PLCActivityItem, SKASTUMSItem } from './types/plcAndSkas';
import { Calendar, Table, RefreshCw, CheckCircle2, AlertCircle, Columns3, Sparkles, Upload, Trash2 } from 'lucide-react';
import { ProgramSuggestion } from './constants/bankProgram';
import { firebaseSync } from './services/firebaseSync';

export default function App() {
  // Core Data States
  const [entries, setEntries] = useState<TakwimEntry[]>([]);
  const [holidays, setHolidays] = useState<HolidayRecord[]>(getAllDefaultHolidays());
  const [panitiaList, setPanitiaList] = useState<PanitiaConfig[]>(INITIAL_PANITIA_CONFIGS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(SAMPLE_USERS[0]); // Pn. Hajah Fatimah (Guru Besar)
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [monthlyViewMode, setMonthlyViewMode] = useState<'lajur-bidang' | 'jadual' | 'kalendar'>('lajur-bidang');
  const [selectedBidangFilter, setSelectedBidangFilter] = useState<string>('Semua');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<TakwimEntry | null>(null);
  const [detailsEntry, setDetailsEntry] = useState<TakwimEntry | null>(null);
  const [isHolidaysModalOpen, setIsHolidaysModalOpen] = useState<boolean>(false);
  const [isPanitiaModalOpen, setIsPanitiaModalOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const isSettingsModalOpenRef = React.useRef(isSettingsModalOpen);
  isSettingsModalOpenRef.current = isSettingsModalOpen;
  const [isCivicModalOpen, setIsCivicModalOpen] = useState<boolean>(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState<boolean>(false);

  // PLC & SK@S Modals
  const [isPLCKitModalOpen, setIsPLCKitModalOpen] = useState<boolean>(false);
  const [plcInitialPanitia, setPlcInitialPanitia] = useState<string | undefined>(undefined);
  const [isSKASModalOpen, setIsSKASModalOpen] = useState<boolean>(false);

  // Program form initial states
  const [createInitialDate, setCreateInitialDate] = useState<string | undefined>(undefined);
  const [createInitialBidang, setCreateInitialBidang] = useState<BidangType | undefined>(undefined);
  const [createInitialSuggestion, setCreateInitialSuggestion] = useState<ProgramSuggestion | null>(null);
  const [createInitialUnit, setCreateInitialUnit] = useState<string | undefined>(undefined);
  const [createInitialCustomTitle, setCreateInitialCustomTitle] = useState<string | undefined>(undefined);
  const [createInitialNotes, setCreateInitialNotes] = useState<string | undefined>(undefined);
  const [createInitialJenis, setCreateInitialJenis] = useState<JenisPengisian | undefined>(undefined);

  // Toast message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch all shared records from server
  const loadData = useCallback(async () => {
    try {
      const [statusRes, entriesRes, holidaysRes, panitiaRes, settingsRes] = await Promise.all([
        api.getStatus().catch(() => ({ connected: false })),
        api.getEntries().catch(() => ({ data: [] })),
        api.getHolidays().catch(() => ({ data: getAllDefaultHolidays() })),
        api.getPanitia().catch(() => ({ data: INITIAL_PANITIA_CONFIGS })),
        api.getSettings().catch(() => ({ success: true, data: DEFAULT_SCHOOL_SETTINGS })),
      ]);

      setDbConnected(!!statusRes.connected);
      if (entriesRes?.data) setEntries(entriesRes.data);
      if (holidaysRes?.data) setHolidays(holidaysRes.data);
      if (panitiaRes?.data) setPanitiaList(panitiaRes.data);
      if (settingsRes?.data) {
        if (!isSettingsModalOpenRef.current) {
          setSettings(settingsRes.data);
          const dynamicProfiles = getDynamicUserProfiles(settingsRes.data);
          setCurrentUser((prevUser) => {
            const updated = dynamicProfiles.find((u) => u.id === prevUser.id);
            return updated || prevUser;
          });
        }
      }
    } catch (err) {
      console.error('Error fetching data from server:', err);
      setDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Test & initialize Firebase Firestore connection
    firebaseSync.initConnection().catch((err) => {
      console.warn('Firebase initial connection check:', err);
    });

    // Live multi-device synchronization: poll every 4 seconds so all teachers immediately see updates
    const interval = setInterval(loadData, 4000);
    const handleFocus = () => loadData();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadData]);

  // Pending approval count
  const pendingCount = entries.filter(
    (e) => !e.isDeleted && (e.statusKelulusan === 'Dihantar' || e.statusKelulusan === 'Perlu Pindaan')
  ).length;

  // Handlers
  const handleOpenCreateModal = (
    initialDateStr?: string, 
    initialBidang?: BidangType, 
    initialSuggestion?: ProgramSuggestion,
    initialUnit?: string,
    initialCustomTitle?: string,
    initialNotes?: string,
    initialJenis?: JenisPengisian
  ) => {
    setEditingEntry(null);
    setCreateInitialDate(initialDateStr);
    setCreateInitialBidang(initialBidang);
    setCreateInitialSuggestion(initialSuggestion || null);
    setCreateInitialUnit(initialUnit);
    setCreateInitialCustomTitle(initialCustomTitle);
    setCreateInitialNotes(initialNotes);
    setCreateInitialJenis(initialJenis);
    setIsFormModalOpen(true);
  };

  const handleEditEntry = (entry: TakwimEntry) => {
    setEditingEntry(entry);
    setCreateInitialDate(undefined);
    setCreateInitialBidang(undefined);
    setCreateInitialSuggestion(null);
    setCreateInitialUnit(undefined);
    setCreateInitialCustomTitle(undefined);
    setCreateInitialNotes(undefined);
    setCreateInitialJenis(undefined);
    setIsFormModalOpen(true);
  };

  // Register PLC Activity directly into Takwim
  const handleRegisterPLCActivity = (activity: PLCActivityItem) => {
    setIsPLCKitModalOpen(false);
    const cleanPanitiaUnit = activity.panitia.replace(/^Panitia\s+/, '');
    const targetMonth = (activity.cadanganBulan && activity.cadanganBulan[0]) || selectedMonth || 2;
    // Set default day 9 of the month
    const targetDate = `2027-${String(targetMonth).padStart(2, '0')}-09`;

    handleOpenCreateModal(
      targetDate,
      'Panitia Mata Pelajaran',
      undefined,
      cleanPanitiaUnit,
      `[PLC - ${activity.alatPLC}] ${activity.tajukAktiviti}`,
      `Alat PLC: ${activity.alatPLC}\nObjektif: ${activity.objektif}\nFokus Pedagogi: ${activity.fokusPedagogi}\nCadangan Toolkit: ${activity.alatToolkit.join(', ')}\nEvidens: ${activity.evidens}`,
      'Aktiviti'
    );
  };

  // Register SK@S Program directly into Takwim
  const handleRegisterSKASProgram = (item: SKASTUMSItem) => {
    setIsSKASModalOpen(false);
    const targetMonth = (item.cadanganBulan && item.cadanganBulan[0]) || selectedMonth || 3;
    const targetDate = `2027-${String(targetMonth).padStart(2, '0')}-16`;

    handleOpenCreateModal(
      targetDate,
      item.bidangTakwim,
      undefined,
      item.unitCadangan,
      `[SK@S ${item.aspekKod}] ${item.cadanganTajukProgram}`,
      `Rujukan Standard SK@S: ${item.standardId} - ${item.aspekNama}\nTindakan KPM (TUMS ${item.aspekKod}): ${item.tindakanPGB}\nObjektif: ${item.objektifProgram}\nEvidens Diperlukan: ${item.evidensDiperlukan.join(', ')}`,
      'Program'
    );
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await api.deleteEntry(id);
      firebaseSync.deleteTakwimEntry(id).catch((e) => console.warn('Firebase entry deletion sync:', e));
      showToast('Program telah dipadamkan dan disimpan ke tong sampah.', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal memadam program.', 'error');
    }
  };

  const handleEntrySaved = (saved: TakwimEntry) => {
    firebaseSync.saveTakwimEntry(saved).catch((e) => console.warn('Firebase entry save sync:', e));
    showToast(`Program "${saved.tajuk}" berjaya disimpan ke pangkalan data sekolah!`, 'success');
    loadData();
  };

  const handleGenerateTuesdayAssemblies = async () => {
    try {
      const res = await api.generateTuesdayAssemblies();
      showToast(res.message || 'Perhimpunan rasmi dwisesi Selasa berjaya diselaraskan!', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyelaraskan perhimpunan Selasa', 'error');
    }
  };

  const handleSeedFullTakwim = async () => {
    try {
      const res = await api.seedFullTakwim();
      showToast(res.message || 'Semua program takwim SK Tudan 2027 berjaya didaftarkan!', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal memuatkan takwim penuh', 'error');
    }
  };

  const handleClearTakwim = async () => {
    try {
      const res = await api.clearTakwim();
      showToast(res.message || 'Semua program dalam takwim telah dikosongkan. Sedia untuk pengisian guru.', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengosongkan takwim', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-2xl transition-all">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Bar Navigation (Zone 1, 2, 3 Contract) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        pendingCount={pendingCount}
        onOpenCreateModal={() => handleOpenCreateModal()}
        settings={settings}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenCivicModal={() => setIsCivicModalOpen(true)}
        onOpenBulkUploadModal={() => setIsBulkUploadModalOpen(true)}
        onOpenPLCKitModal={() => {
          setPlcInitialPanitia(undefined);
          setIsPLCKitModalOpen(true);
        }}
        onOpenSKASModal={() => setIsSKASModalOpen(true)}
      />

      {/* Official School Heraldry & Status Banner */}
      <SchoolBanner
        dbConnected={dbConnected}
        holidays={holidays}
        settings={settings}
        onOpenHolidaysModal={() => setIsHolidaysModalOpen(true)}
        onOpenPanitiaModal={() => setIsPanitiaModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-4">
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              Menghubungkan ke Pangkalan Data e-Takwim SK Tudan 2027...
            </p>
          </div>
        ) : (
          <>
            {/* Tab: Dashboard */}
            {activeTab === 'dashboard' && (
              <DashboardView
                entries={entries}
                panitiaList={panitiaList}
                onSelectMonth={(m) => {
                  setSelectedMonth(m);
                  setActiveTab('takwim-bulanan');
                }}
                onOpenCreateModal={() => handleOpenCreateModal()}
                onSelectBidang={(b) => {
                  setSelectedBidangFilter(b);
                  setActiveTab('takwim-bulanan');
                }}
                onViewEntry={(e) => setDetailsEntry(e)}
                onGoToApprovals={() => setActiveTab('kelulusan')}
              />
            )}

            {/* Tab: Takwim & Jadual Bulanan (Toggle between Multi-Column Bidang, 11-column table & visual calendar) */}
            {activeTab === 'takwim-bulanan' && (
              <div className="space-y-4">
                {/* View Switcher Bar */}
                <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setMonthlyViewMode('lajur-bidang')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                        monthlyViewMode === 'lajur-bidang'
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Columns3 className="w-3.5 h-3.5" />
                      <span>Format Lajur Bidang (SK Tudan)</span>
                    </button>

                    <button
                      onClick={() => setMonthlyViewMode('jadual')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                        monthlyViewMode === 'jadual'
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Jadual 11 Lajur Rasmi</span>
                    </button>

                    <button
                      onClick={() => setMonthlyViewMode('kalendar')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                        monthlyViewMode === 'kalendar'
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Grid Kalendar</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setIsBulkUploadModalOpen(true)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1 shadow-2xs"
                      title="Muat naik fail takwim keseluruhan tahun 2027 secara pukal (Excel / CSV)"
                    >
                      <Upload className="w-3 h-3 text-purple-600" />
                      <span>Muat Naik Pukal</span>
                    </button>
                    {entries.length > 0 && (
                      <button
                        onClick={handleClearTakwim}
                        className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Kosongkan semua rekod takwim untuk memulakan pengisian bersih"
                      >
                        <Trash2 className="w-3 h-3 text-rose-500" />
                        <span>Kosongkan Takwim</span>
                      </button>
                    )}
                    <button
                      onClick={handleGenerateTuesdayAssemblies}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Sahkan dan selaras perhimpunan rasmi dwisesi bagi setiap hari Selasa"
                    >
                      Perhimpunan Selasa (Pagi & Petang)
                    </button>
                    <span className="text-xs text-slate-500 font-mono hidden md:inline pl-2 border-l border-slate-200">
                      {MONTH_NAMES_MS[selectedMonth - 1]} 2027
                    </span>
                  </div>
                </div>

                {monthlyViewMode === 'lajur-bidang' ? (
                  <MonthlyMultiColumnView
                    entries={entries}
                    holidays={holidays}
                    selectedMonth={selectedMonth}
                    onSelectMonth={setSelectedMonth}
                    onViewEntry={(e) => setDetailsEntry(e)}
                    onEditEntry={handleEditEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onOpenCreateModal={handleOpenCreateModal}
                    onGenerateTuesdayAssemblies={handleGenerateTuesdayAssemblies}
                    panitiaList={panitiaList}
                    settings={settings}
                    onOpenCivicModal={() => setIsCivicModalOpen(true)}
                    onOpenBulkUploadModal={() => setIsBulkUploadModalOpen(true)}
                    onOpenPLCKitModal={(initialPanitia) => {
                      setPlcInitialPanitia(initialPanitia);
                      setIsPLCKitModalOpen(true);
                    }}
                    onOpenSKASModal={() => setIsSKASModalOpen(true)}
                  />
                ) : monthlyViewMode === 'jadual' ? (
                  <MonthlyTableView
                    entries={entries}
                    holidays={holidays}
                    selectedMonth={selectedMonth}
                    onSelectMonth={setSelectedMonth}
                    onViewEntry={(e) => setDetailsEntry(e)}
                    onEditEntry={handleEditEntry}
                    onOpenCreateModal={() => handleOpenCreateModal()}
                    selectedBidangFilter={selectedBidangFilter}
                  />
                ) : (
                  <MonthlyCalendarView
                    entries={entries}
                    holidays={holidays}
                    selectedMonth={selectedMonth}
                    onSelectMonth={setSelectedMonth}
                    onViewEntry={(e) => setDetailsEntry(e)}
                    onDateClick={(dateStr) => handleOpenCreateModal(dateStr)}
                  />
                )}
              </div>
            )}

            {/* Tab: 12 Bulan (Yearly Overview) */}
            {activeTab === 'takwim-tahunan' && (
              <YearlyTakwimView
                entries={entries}
                holidays={holidays}
                onSelectMonth={(m) => {
                  setSelectedMonth(m);
                  setActiveTab('takwim-bulanan');
                }}
                onViewEntry={(e) => setDetailsEntry(e)}
              />
            )}

            {/* Tab: Minggu PdP (Weekly Agenda M01-M44) */}
            {activeTab === 'agenda-mingguan' && (
              <WeeklyAgendaView
                entries={entries}
                holidays={holidays}
                onViewEntry={(e) => setDetailsEntry(e)}
                onOpenCreateModal={() => handleOpenCreateModal()}
              />
            )}

            {/* Tab: Semakan & Kelulusan */}
            {activeTab === 'kelulusan' && (
              <ApprovalQueueView
                entries={entries}
                currentUser={currentUser}
                onRefresh={loadData}
                onViewEntry={(e) => setDetailsEntry(e)}
              />
            )}

            {/* Tab: 17 Ujian Wajib Sistem */}
            {activeTab === 'ujian-sistem' && (
              <SystemVerificationSuite entries={entries} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>e-Takwim Pengurusan {settings.schoolName || 'SK Tudan'} 2027</strong> · Kod Sekolah: {settings.schoolCode || 'YBB4345'}.
          </div>
          <div>
            Kalendar Akademik Kumpulan B · Diselaraskan Langsung (Semua Peranti)
          </div>
        </div>
      </footer>

      {/* Program Creation & Editing Modal */}
      {isFormModalOpen && (
        <ProgramFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingEntry(null);
          }}
          onSaved={handleEntrySaved}
          editingEntry={editingEntry}
          existingEntries={entries}
          holidays={holidays}
          panitiaList={panitiaList}
          currentUser={currentUser}
          initialDate={createInitialDate}
          initialMonth={selectedMonth}
          initialBidang={createInitialBidang}
          initialSuggestion={createInitialSuggestion}
          initialUnit={createInitialUnit}
          initialCustomTitle={createInitialCustomTitle}
          initialNotes={createInitialNotes}
          initialJenis={createInitialJenis}
          teachersList={settings.teachersList}
          extractedPrograms={settings.extractedPrograms}
        />
      )}

      {/* Program Details Modal */}
      {Boolean(detailsEntry) && (
        <ProgramDetailsModal
          isOpen={Boolean(detailsEntry)}
          entry={detailsEntry}
          onClose={() => setDetailsEntry(null)}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      )}

      {/* Holidays & Gazette Modal */}
      {isHolidaysModalOpen && (
        <HolidaysModal
          isOpen={isHolidaysModalOpen}
          onClose={() => setIsHolidaysModalOpen(false)}
          holidays={holidays}
          onHolidaysUpdated={loadData}
        />
      )}

      {/* Panitia Settings Modal */}
      {isPanitiaModalOpen && (
        <PanitiaSettingsModal
          isOpen={isPanitiaModalOpen}
          onClose={() => setIsPanitiaModalOpen(false)}
          panitiaList={panitiaList}
          onUpdated={loadData}
        />
      )}

      {/* School Settings Modal */}
      {isSettingsModalOpen && (
        <SchoolSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onSettingsUpdated={(updated) => {
            setSettings(updated);
            firebaseSync.saveSchoolSettings(updated).catch((e) => console.warn('Firebase settings sync:', e));
            showToast('Ketetapan sekolah berjaya disimpan.', 'success');
            loadData();
          }}
          onOpenBulkUploadModal={() => setIsBulkUploadModalOpen(true)}
          onOpenPLCKitModal={(initialPanitia) => {
            setPlcInitialPanitia(initialPanitia);
            setIsPLCKitModalOpen(true);
          }}
          onOpenSKASModal={() => setIsSKASModalOpen(true)}
          onOpenPanitiaModal={() => setIsPanitiaModalOpen(true)}
          panitiaList={panitiaList}
          holidays={holidays}
          entries={entries}
          onViewEntry={(e) => setDetailsEntry(e)}
          onOpenCreateModal={() => handleOpenCreateModal()}
          onRegisterPLC={(activity) => {
            setIsSettingsModalOpen(false);
            handleRegisterPLCActivity(activity);
          }}
          onRegisterSKAS={(item) => {
            setIsSettingsModalOpen(false);
            handleRegisterSKASProgram(item);
          }}
        />
      )}

      {/* Weekly Civic Values & 5-Min Activity Schedule Modal */}
      {isCivicModalOpen && (
        <CivicScheduleModal
          isOpen={isCivicModalOpen}
          onClose={() => setIsCivicModalOpen(false)}
          civicValues={settings.civicValues || []}
          settings={settings}
          holidays={holidays}
        />
      )}

      {/* Bulk Takwim Upload Modal */}
      {isBulkUploadModalOpen && (
        <BulkTakwimUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => setIsBulkUploadModalOpen(false)}
          settings={settings}
          onSuccess={(count) => {
            showToast(`Berjaya memuat naik ${count} program takwim ke pangkalan data sekolah!`, 'success');
            loadData();
          }}
        />
      )}

      {/* Kit PLC Panitia Modal */}
      {isPLCKitModalOpen && (
        <PLCKitModal
          isOpen={isPLCKitModalOpen}
          onClose={() => {
            setIsPLCKitModalOpen(false);
            setPlcInitialPanitia(undefined);
          }}
          initialPanitia={plcInitialPanitia}
          panitiaList={panitiaList}
          onRegisterPLC={handleRegisterPLCActivity}
          settings={settings}
        />
      )}

      {/* Instrumen Penilaian SK@S (SKPM Kualiti @Sekolah) Modal */}
      {isSKASModalOpen && (
        <SKASInstrumentModal
          isOpen={isSKASModalOpen}
          onClose={() => setIsSKASModalOpen(false)}
          onRegisterProgram={handleRegisterSKASProgram}
          settings={settings}
        />
      )}
    </div>
  );
}
