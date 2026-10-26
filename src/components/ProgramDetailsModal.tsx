import React from 'react';
import { TakwimEntry } from '../types/takwim';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Target, 
  DollarSign, 
  Users, 
  FileText, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Trash2,
  ExternalLink
} from 'lucide-react';

interface ProgramDetailsModalProps {
  entry: TakwimEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: TakwimEntry) => void;
  onDelete: (id: string) => void;
}

export const ProgramDetailsModal: React.FC<ProgramDetailsModalProps> = ({
  entry,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-sm">
                {entry.mingguAkademik} · {entry.statusHari}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded-sm">
                {entry.bidangUtama}
              </span>
              <span className="text-xs font-medium text-slate-600">
                {entry.unitUtama}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                  entry.statusKelulusan === 'Diluluskan'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {entry.statusKelulusan}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {entry.tajuk}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {/* Conflict Alert Banner if any */}
          {entry.hasConflictWarning && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Amaran Pertindihan Jadual:</span>
              </div>
              <div className="text-[11px]">
                {entry.conflictDetails?.join(', ') || 'Terdapat pertindihan pada tarikh atau tempat.'}
              </div>
              {entry.conflictApproved && (
                <div className="text-emerald-700 font-semibold pt-1">
                  ✓ Diluluskan dengan justifikasi khas oleh: {entry.conflictApprovedBy} ({entry.conflictApprovedReason})
                </div>
              )}
            </div>
          )}

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">Tarikh:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {entry.tarikhMula} {entry.tarikhAkhir !== entry.tarikhMula ? `hingga ${entry.tarikhAkhir}` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">Masa:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {entry.sepanjangHari ? 'Sepanjang Hari' : `${entry.masaMula} - ${entry.masaAkhir}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">Lokasi / Tempat:</span>
                <span className="font-semibold text-slate-900">{entry.tempat}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">Penyelaras:</span>
                <span className="font-semibold text-slate-900">{entry.penyelaras}</span>
              </div>
            </div>
          </div>

          {/* Objective */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs mb-1">Objektif Program:</h4>
            <p className="text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
              {entry.objektif || 'Tiada objektif khusus direkodkan.'}
            </p>
          </div>

          {/* Target Group & Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span>Kumpulan Sasaran:</span>
              </h4>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                {entry.sasaran?.join(', ') || '-'}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Anggaran Peserta & Kos:</span>
              </h4>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-mono">
                {entry.anggaranPeserta ? `${entry.anggaranPeserta} orang` : 'Tiada sasaran angka'} ·{' '}
                {entry.anggaranKos ? `RM ${entry.anggaranKos}` : 'Tanpa kos'} ({entry.sumberKewangan || 'Tiada peruntukan'})
              </div>
            </div>
          </div>

          {/* Implementation Result if Completed */}
          {entry.statusPelaksanaan === 'Selesai' && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Laporan Pelaksanaan Program:</span>
              </div>
              <div className="text-emerald-800">
                Tarikh Selesai: <strong>{entry.tarikhSebenarPelaksanaan || entry.tarikhMula}</strong>
              </div>
              {entry.ringkasanHasil && (
                <div className="text-slate-700 mt-1">
                  Hasil: {entry.ringkasanHasil}
                </div>
              )}
              {entry.laporanPautan && (
                <div className="pt-1">
                  <a
                    href={entry.laporanPautan}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Buka Pautan Dokumentasi / Laporan Penuh</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Audit Trail & Revisions */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Jejak Audit & Sejarah Pindaan:</span>
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 max-h-32 overflow-y-auto">
              <div className="text-slate-500 text-[11px]">
                Dicipta oleh <strong>{entry.createdByName}</strong> pada{' '}
                {new Date(entry.createdAt).toLocaleString('ms-MY')}
              </div>
              {entry.diluluskanOleh && (
                <div className="text-emerald-700 text-[11px]">
                  Diluluskan oleh <strong>{entry.diluluskanOleh}</strong> ({entry.tarikhKelulusan})
                  {entry.komenKelulusan && ` - "${entry.komenKelulusan}"`}
                </div>
              )}
              {entry.revisionHistory?.map((rev) => (
                <div key={rev.id} className="text-slate-500 text-[11px] border-t border-slate-200 pt-1">
                  {rev.action} oleh {rev.userName} ({new Date(rev.timestamp).toLocaleDateString('ms-MY')}):{' '}
                  {rev.details}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-700">Pasti padam program ini?</span>
              <button
                type="button"
                onClick={() => {
                  onDelete(entry.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
              >
                Ya, Padam
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1 border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Padam Program</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              className="px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 border border-blue-200"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Kemaskini Program</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
