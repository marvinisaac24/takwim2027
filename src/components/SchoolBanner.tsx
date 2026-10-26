import React from 'react';
import { Database, ShieldCheck, AlertCircle, Building2, MapPin, Settings } from 'lucide-react';
import { HolidayRecord, SchoolSettings } from '../types/takwim';
import { DEFAULT_SCHOOL_SETTINGS } from '../constants/schoolSettingsDefaults';

interface SchoolBannerProps {
  dbConnected: boolean;
  holidays: HolidayRecord[];
  onOpenHolidaysModal: () => void;
  onOpenPanitiaModal: () => void;
  settings?: SchoolSettings;
  onOpenSettingsModal?: () => void;
}

export const SchoolBanner: React.FC<SchoolBannerProps> = ({
  dbConnected,
  holidays,
  onOpenHolidaysModal,
  onOpenPanitiaModal,
  settings = DEFAULT_SCHOOL_SETTINGS,
  onOpenSettingsModal,
}) => {
  const unverifiedHolidays = holidays.filter((h) => h.statusPengesahan === 'Belum Disahkan');
  const isAllVerified = unverifiedHolidays.length === 0 && holidays.length > 0;

  const schoolName = settings.schoolName || 'SK Tudan, Miri';
  const schoolCode = settings.schoolCode || 'YBB4345';
  const schoolLogo = settings.schoolLogo || DEFAULT_SCHOOL_SETTINGS.schoolLogo;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* School Emblem & Info */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
              {schoolLogo ? (
                <img src={schoolLogo} alt="Logo Sekolah" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs rounded-xl">
                  SKT
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                  {schoolName}
                </h1>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md font-mono">
                  {schoolCode}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                  Kumpulan B (Sarawak)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Miri, Sarawak
                </span>
                <span aria-hidden="true">·</span>
                <span>Tahun Persekolahan: <strong>2027</strong></span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Diselaraskan Langsung (Semua Peranti)
                </span>
              </div>
            </div>
          </div>

          {/* Status Badges & Quick Action Triggers */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            
            {/* School Settings Button */}
            {onOpenSettingsModal && (
              <button
                type="button"
                onClick={onOpenSettingsModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs"
                title="Buka tetapan sekolah: nama, logo, pentadbir pengesah, senarai guru, buku pengurusan, nilai sivik & jadual gaji"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ketetapan Sekolah</span>
              </button>
            )}

            {/* Database Sync Status */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                dbConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
              title="Pangkalan data perkongsian fail JSON berterusan pelayan aktif"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{dbConnected ? 'Pangkalan Data: Berhubung' : 'Mod Luar Talian'}</span>
            </div>

            {/* Holiday Gazette Status */}
            <button
              onClick={onOpenHolidaysModal}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                isAllVerified
                  ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              {isAllVerified ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Cuti Rasmi KPM: Disahkan</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Semak Cuti Rasmi</span>
                </>
              )}
            </button>

            {/* Panitia Management Trigger */}
            <button
              onClick={onOpenPanitiaModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Panitia & Unit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
