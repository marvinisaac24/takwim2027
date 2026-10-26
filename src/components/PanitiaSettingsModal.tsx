import React, { useState } from 'react';
import { PanitiaConfig } from '../types/takwim';
import { api } from '../services/api';
import { X, Check, Building2, Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

interface PanitiaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  panitiaList: PanitiaConfig[];
  onUpdated: () => void;
}

export const PanitiaSettingsModal: React.FC<PanitiaSettingsModalProps> = ({
  isOpen,
  onClose,
  panitiaList,
  onUpdated,
}) => {
  const [editingPanitia, setEditingPanitia] = useState<PanitiaConfig | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newNama, setNewNama] = useState('');
  const [newKod, setNewKod] = useState('');
  const [newJenis, setNewJenis] = useState<'Panitia Mata Pelajaran' | 'Unit Sokongan'>('Panitia Mata Pelajaran');
  const [newKetua, setNewKetua] = useState('');

  const handleToggleAktif = async (p: PanitiaConfig) => {
    try {
      await api.updatePanitia(p.id, { aktif: !p.aktif });
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPanitia) return;
    try {
      await api.updatePanitia(editingPanitia.id, {
        nama: editingPanitia.nama,
        kod: editingPanitia.kod,
        ketua: editingPanitia.ketua,
      });
      setEditingPanitia(null);
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama) return;
    try {
      await api.addPanitia({
        nama: newNama,
        kod: newKod || newNama.substring(0, 4).toUpperCase(),
        jenis: newJenis,
        bidang: newJenis === 'Panitia Mata Pelajaran' ? 'Panitia Mata Pelajaran' : 'Kurikulum',
        ketua: newKetua,
      });
      setShowAddForm(false);
      setNewNama('');
      setNewKod('');
      setNewKetua('');
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              <span>Tetapan Panitia Mata Pelajaran & Unit Sokongan SK Tudan</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aktifkan mengikut penawaran sebenar sekolah (cth: Bahasa Iban, Cina, Tamil, Prasekolah, PPKI).
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {panitiaList.filter((p) => p.aktif).length} aktif daripada {panitiaList.length} jumlah unit
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Panitia / Unit</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddUnit} className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-3">
            <div className="font-bold text-slate-900">Daftar Panitia / Unit Sokongan Baharu:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Nama Panitia / Unit:</label>
                <input
                  type="text"
                  placeholder="Contoh: Kelab Robotik & STEM"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Kod Ringkas:</label>
                <input
                  type="text"
                  placeholder="Contoh: STEM"
                  value={newKod}
                  onChange={(e) => setNewKod(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Jenis Kategori:</label>
                <select
                  value={newJenis}
                  onChange={(e) => setNewJenis(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Panitia Mata Pelajaran">Panitia Mata Pelajaran</option>
                  <option value="Unit Sokongan">Unit Sokongan Sekolah (Pra/PPKI/PSS/ICT)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Ketua Panitia / Penyelaras:</label>
                <input
                  type="text"
                  placeholder="Nama pegawai..."
                  value={newKetua}
                  onChange={(e) => setNewKetua(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 bg-white border border-slate-300 rounded-md"
              >
                Batal
              </button>
              <button type="submit" className="px-4 py-1 bg-blue-700 text-white rounded-md font-semibold">
                Simpan Unit
              </button>
            </div>
          </form>
        )}

        {/* Panitia List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2 text-xs">
          {panitiaList.map((p) => {
            const isEditing = editingPanitia?.id === p.id;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  p.aktif
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {isEditing ? (
                  <form onSubmit={handleSaveEdit} className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingPanitia.nama}
                      onChange={(e) =>
                        setEditingPanitia({ ...editingPanitia, nama: e.target.value })
                      }
                      className="p-1.5 border border-blue-400 rounded-md flex-1 bg-white font-medium"
                    />
                    <input
                      type="text"
                      value={editingPanitia.ketua || ''}
                      placeholder="Ketua Panitia..."
                      onChange={(e) =>
                        setEditingPanitia({ ...editingPanitia, ketua: e.target.value })
                      }
                      className="p-1.5 border border-slate-300 rounded-md max-w-[180px] bg-white"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-blue-700 text-white rounded-md"
                      title="Simpan"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPanitia(null)}
                      className="p-1.5 bg-slate-200 text-slate-700 rounded-md"
                      title="Batal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{p.nama}</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                          {p.kod}
                        </span>
                        <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-sm">
                          {p.jenis}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Ketua: <strong>{p.ketua || 'Belum Dilantik'}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPanitia(p)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                        title="Sunting Nama & Ketua"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleAktif(p)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                          p.aktif
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {p.aktif ? 'Ditawarkan (Aktif)' : 'Dinyahaktif'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
