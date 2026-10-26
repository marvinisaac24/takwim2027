import React from 'react';
import { UserProfile, SchoolSettings } from '../types/takwim';
import { getDynamicUserProfiles } from '../constants/bankProgram';
import { 
  Calendar, 
  FileCheck2, 
  Settings, 
  Plus,
  HeartHandshake,
  Upload,
  GraduationCap,
  Award
} from 'lucide-react';
import { FirebaseAuthButton } from './FirebaseAuthButton';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  pendingCount: number;
  onOpenCreateModal: () => void;
  settings?: SchoolSettings;
  onOpenSettingsModal?: () => void;
  onOpenCivicModal?: () => void;
  onOpenBulkUploadModal?: () => void;
  onOpenPLCKitModal?: () => void;
  onOpenSKASModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  pendingCount,
  onOpenCreateModal,
  settings,
  onOpenSettingsModal,
  onOpenCivicModal,
  onOpenBulkUploadModal,
  onOpenPLCKitModal,
  onOpenSKASModal,
}) => {
  const dynamicUsers = React.useMemo(() => getDynamicUserProfiles(settings), [settings]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark & School Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                {settings?.schoolName ? `e-Takwim ${settings.schoolName}` : 'e-Takwim Sekolah 2027'}
              </span>
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                {settings?.schoolCode ? `${settings.schoolCode} · Sesi Persekolahan 2027` : 'Kumpulan B · Malaysia'}
              </span>
            </div>
          </div>

          {/* Zone 2: Streamlined Navigation Links (12 Bulan & Minggu PdP moved to Ketetapan) */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('takwim-bulanan')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                activeTab === 'takwim-bulanan' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Takwim & Jadual</span>
            </button>

            <button
              onClick={() => setActiveTab('kelulusan')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'kelulusan' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Semakan</span>
              {pendingCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 bg-amber-500 text-white text-[11px] font-bold rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ujian-sistem')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'ujian-sistem' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>17 Ujian Wajib</span>
            </button>
          </nav>

          {/* Zone 3: Actions, Tools, Settings & Dynamic User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* SK@S Kualiti @Sekolah Tool Button */}
            {onOpenSKASModal && (
              <button
                type="button"
                onClick={onOpenSKASModal}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors shadow-2xs"
                title="Instrumen SK@S SKPM Kualiti @Sekolah & cadangan program mengikut item TUMS"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>SK@S Kualiti</span>
              </button>
            )}

            {/* Kit PLC Button */}
            {onOpenPLCKitModal && (
              <button
                type="button"
                onClick={onOpenPLCKitModal}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors shadow-2xs"
                title="Buka Kit PLC & jana aktiviti mengikut panitia masing-masing"
              >
                <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                <span>Kit PLC</span>
              </button>
            )}

            {/* Civic Schedule */}
            {onOpenCivicModal && (
              <button
                type="button"
                onClick={onOpenCivicModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors shadow-2xs"
                title="Jadual Nilai Sivik Mingguan & Panduan Aktiviti 5 Minit"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                <span>Jadual Sivik</span>
              </button>
            )}

            {/* Bulk Upload Takwim */}
            {onOpenBulkUploadModal && (
              <button
                type="button"
                onClick={onOpenBulkUploadModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-800 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors shadow-2xs"
                title="Muat naik fail takwim tahun 2027 secara pukal (Excel / CSV)"
              >
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                <span>Muat Naik Pukal</span>
              </button>
            )}

            {/* School Settings button (Ketetapan: includes 12 Bulan & Minggu PdP) */}
            {onOpenSettingsModal && (
              <button
                type="button"
                onClick={onOpenSettingsModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors border border-slate-200"
                title="Ketetapan Sekolah (Pentadbir, Buku Pengurusan, 12 Bulan & Jadual Minggu PdP)"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline font-semibold">Ketetapan</span>
              </button>
            )}

            {/* Firebase Google Auth button */}
            <FirebaseAuthButton />

            {/* Dynamic Role Switcher (strictly derived from Ketetapan) */}
            <div className="relative">
              <select
                aria-label="Pilih Peranan Pengguna"
                value={currentUser.id}
                onChange={(e) => {
                  const found = dynamicUsers.find((u) => u.id === e.target.value);
                  if (found) setCurrentUser(found);
                }}
                className="bg-slate-100 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium max-w-[140px] sm:max-w-[190px] truncate"
              >
                {dynamicUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.role}: {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Program</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('takwim-bulanan')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'takwim-bulanan' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Takwim & Jadual
          </button>
          <button
            onClick={() => setActiveTab('kelulusan')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-1 ${
              activeTab === 'kelulusan' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            <span>Semakan</span>
            {pendingCount > 0 && <span className="bg-amber-500 text-white text-[10px] px-1 rounded-full">{pendingCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab('ujian-sistem')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'ujian-sistem' ? 'bg-emerald-600 text-white' : 'text-emerald-700 bg-emerald-50'
            }`}
          >
            17 Ujian
          </button>
          {onOpenSettingsModal && (
            <button
              onClick={onOpenSettingsModal}
              className="px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 font-medium text-slate-700 bg-slate-100 border border-slate-200"
            >
              Ketetapan
            </button>
          )}
          {onOpenPLCKitModal && (
            <button
              onClick={onOpenPLCKitModal}
              className="px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 font-medium text-teal-800 bg-teal-50 border border-teal-200"
            >
              Kit PLC
            </button>
          )}
          {onOpenSKASModal && (
            <button
              onClick={onOpenSKASModal}
              className="px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 font-medium text-amber-800 bg-amber-50 border border-amber-200"
            >
              SK@S Kualiti
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
