import React, { useState } from 'react';
import { HolidayRecord } from '../types/takwim';
import { api } from '../services/api';
import { X, ShieldCheck, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

interface HolidaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: HolidayRecord[];
  onHolidaysUpdated: () => void;
}

export const HolidaysModal: React.FC<HolidaysModalProps> = ({
  isOpen,
  onClose,
  holidays,
  onHolidaysUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'KPM' | 'Umum' | 'Penggal'>('KPM');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newNama, setNewNama] = useState('');
  const [newTarikhMula, setNewTarikhMula] = useState('2027-01-01');
  const [newTarikhAkhir, setNewTarikhAkhir] = useState('2027-01-01');
  const [newKategori, setNewKategori] = useState<any>('Cuti Umum Sarawak');
  const [newSumber, setNewSumber] = useState('Warta Kerajaan Sarawak 2027');
  const [newStatus, setNewStatus] = useState<any>('Disahkan');
  const [isSaving, setIsSaving] = useState(false);

  const kpmHolidays = holidays.filter((h) => h.kategori === 'Cuti Tambahan KPM');
  const termHolidays = holidays.filter((h) => h.kategori === 'Cuti Penggal Persekolahan');
  const publicHolidays = holidays.filter(
    (h) => h.kategori === 'Cuti Umum Persekutuan' || h.kategori === 'Cuti Umum Sarawak' || h.kategori === 'Cuti Gantian'
  );

  const handleVerifyAll = async () => {
    try {
      await api.verifyAllHolidays();
      onHolidaysUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newTarikhMula) return;
    setIsSaving(true);
    try {
      await api.addHoliday({
        nama: newNama,
        tarikhMula: newTarikhMula,
        tarikhAkhir: newTarikhAkhir,
        kategori: newKategori,
        negeri: 'Sarawak',
        sumber: newSumber,
        statusPengesahan: newStatus,
      });
      setShowAddForm(false);
      setNewNama('');
      onHolidaysUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              <span>Pengurusan & Pengesahan Cuti Persekolahan / Cuti Umum 2027</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rujukan Kalendar Akademik Kumpulan B (Sarawak) & Warta Kelepasan Am.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons & Actions */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('KPM')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                activeTab === 'KPM' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Cuti Tambahan KPM ({kpmHolidays.length})
            </button>
            <button
              onClick={() => setActiveTab('Penggal')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                activeTab === 'Penggal' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Cuti Penggal ({termHolidays.length})
            </button>
            <button
              onClick={() => setActiveTab('Umum')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                activeTab === 'Umum' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Cuti Umum & Gantian ({publicHolidays.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleVerifyAll}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold rounded-lg hover:bg-emerald-100 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sahkan Semua Cuti</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Daftar Cuti Rasmi</span>
            </button>
          </div>
        </div>

        {/* Add Holiday Form */}
        {showAddForm && (
          <form onSubmit={handleAddHoliday} className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-900">Pendaftaran Cuti Umum / Kelepasan Am Baharu:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1">Nama Cuti:</label>
                <input
                  type="text"
                  placeholder="Contoh: Hari Nuzul Al-Quran"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Tarikh Mula (2027):</label>
                <input
                  type="date"
                  value={newTarikhMula}
                  onChange={(e) => setNewTarikhMula(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Tarikh Akhir (2027):</label>
                <input
                  type="date"
                  value={newTarikhAkhir}
                  onChange={(e) => setNewTarikhAkhir(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Kategori Cuti:</label>
                <select
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Cuti Umum Sarawak">Cuti Umum Sarawak</option>
                  <option value="Cuti Umum Persekutuan">Cuti Umum Persekutuan</option>
                  <option value="Cuti Gantian">Cuti Gantian</option>
                  <option value="Cuti Tambahan KPM">Cuti Tambahan KPM</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Sumber Rasmi Warta / Surat:</label>
                <input
                  type="text"
                  placeholder="Contoh: Warta Sarawak No. 12/2026"
                  value={newSumber}
                  onChange={(e) => setNewSumber(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Status Pengesahan:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="Disahkan">Disahkan</option>
                  <option value="Belum Disahkan">Belum Disahkan</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 bg-white border border-slate-300 rounded-md"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1 bg-blue-700 text-white rounded-md font-semibold"
              >
                Simpan Cuti
              </button>
            </div>
          </form>
        )}

        {/* Content List */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-3">
          {(activeTab === 'KPM' ? kpmHolidays : activeTab === 'Penggal' ? termHolidays : publicHolidays).map((h) => (
            <div
              key={h.id}
              className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{h.nama}</span>
                  <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-sm">
                    {h.tarikhMula} {h.tarikhAkhir !== h.tarikhMula ? `hingga ${h.tarikhAkhir}` : ''}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] flex items-center gap-2">
                  <span>Negeri: <strong>{h.negeri}</strong></span>
                  <span>·</span>
                  <span>Sumber: <strong>{h.sumber}</strong></span>
                </div>
                {h.catatan && <div className="text-slate-400 text-[11px] italic">{h.catatan}</div>}
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                    h.statusPengesahan === 'Disahkan'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {h.statusPengesahan === 'Disahkan' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Disahkan</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Belum Disahkan</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
