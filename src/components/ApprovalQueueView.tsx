import React, { useState } from 'react';
import { TakwimEntry, UserProfile } from '../types/takwim';
import { api } from '../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Edit, 
  MessageSquare, 
  FileText, 
  ShieldCheck,
  Send
} from 'lucide-react';

interface ApprovalQueueViewProps {
  entries: TakwimEntry[];
  currentUser: UserProfile;
  onRefresh: () => void;
  onViewEntry: (entry: TakwimEntry) => void;
}

export const ApprovalQueueView: React.FC<ApprovalQueueViewProps> = ({
  entries,
  currentUser,
  onRefresh,
  onViewEntry,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<TakwimEntry | null>(null);
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Submissions requiring review (Dihantar, Perlu Pindaan)
  const pendingEntries = entries.filter(
    (e) => !e.isDeleted && (e.statusKelulusan === 'Dihantar' || e.statusKelulusan === 'Perlu Pindaan')
  );

  const canApprove = currentUser.role === 'Pentadbir' || currentUser.role === 'Penyelaras Bidang' || currentUser.role === 'Ketua Panitia';

  const handleDecision = async (decision: 'Diluluskan' | 'Perlu Pindaan' | 'Ditolak') => {
    if (!selectedEntry) return;
    setActionError('');
    setActionSuccess('');
    setIsProcessing(true);

    try {
      const res = await api.updateApproval(selectedEntry.id, {
        status: decision,
        komen: approvalNotes,
        approverId: currentUser.id,
        approverName: currentUser.name,
        approverRole: currentUser.role,
      });

      setActionSuccess(`Permohonan program "${selectedEntry.tajuk}" berjaya dikemas kini kepada "${decision}".`);
      setSelectedEntry(null);
      setApprovalNotes('');
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Ralat semasa meluluskan permohonan.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Pusat Semakan & Kelulusan Takwim Pengurusan 2027
            </h2>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold font-mono text-xs rounded-full">
              {pendingEntries.length} Menunggu
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penolong Kanan dan Guru Besar boleh menyemak perincian aktiviti, mengesahkan pertindihan dan meluluskan cadangan takwim.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Peranan Anda:</span>
          <span className="font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {!canApprove && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Akses Terhad (Peranan: {currentUser.role})</div>
            <p className="mt-0.5">
              Anda kini berada dalam mod Guru / Pembaca. Hanya Pentadbir (Guru Besar) atau Penyelaras Bidang (PKP / PK HEM / PK Koko) yang mempunyai kuasa menyemak dan meluluskan permohonan. Anda boleh menukar peranan di bar atas untuk tujuan pengujian.
            </p>
          </div>
        </div>
      )}

      {/* Pending Items List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Senarai Menunggu Tindakan Semakan
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {pendingEntries.length} permohonan
          </span>
        </div>

        {pendingEntries.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
            <p className="font-semibold text-slate-700">Semua permohonan telah selesai disemak!</p>
            <p className="text-xs text-slate-400 mt-1">
              Tiada program dalam barisan menunggu kelulusan pada masa ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingEntries.map((entry) => {
              const isOwnSubmission = entry.createdBy === currentUser.id;
              const hasConflict = entry.hasConflictWarning && !entry.conflictApproved;

              return (
                <div
                  key={entry.id}
                  className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                        {entry.tarikhMula} · {entry.mingguAkademik}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-sm">
                        {entry.bidangUtama}
                      </span>
                      <span className="text-xs font-medium text-slate-600">
                        {entry.unitUtama}
                      </span>
                      <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-sm">
                        Status: {entry.statusKelulusan}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {entry.tajuk}
                    </h4>

                    {entry.objektif && (
                      <p className="text-xs text-slate-600 line-clamp-1">
                        Objektif: {entry.objektif}
                      </p>
                    )}

                    <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                      <span>Dihantar oleh: <strong>{entry.createdByName}</strong></span>
                      <span>·</span>
                      <span>Tempat: {entry.tempat}</span>
                      <span>·</span>
                      <span>Penyelaras: {entry.penyelaras}</span>
                      {hasConflict && (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Pertindihan dikesan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for this item */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onViewEntry(entry)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                    >
                      Perincian
                    </button>

                    <button
                      disabled={!canApprove}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setApprovalNotes('');
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                    >
                      Semak & Buat Keputusan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Keputusan Semakan Pengurusan
              </h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">{selectedEntry.tajuk}</div>
              <div className="text-slate-600">
                Tarikh: {selectedEntry.tarikhMula} ({selectedEntry.mingguAkademik}) · Tempat: {selectedEntry.tempat}
              </div>
              <div className="text-slate-600">
                Unit: {selectedEntry.unitUtama} · Penyelaras: {selectedEntry.penyelaras}
              </div>
              {selectedEntry.hasConflictWarning && (
                <div className="text-rose-700 font-semibold pt-1">
                  ⚠️ Program ini mempunyai amaran pertindihan.
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Ulasan / Komen / Arahan Pindaan (Jika ada):
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Diluluskan dengan pindaan tempat ke Bilik Gerakan..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 flex-wrap">
              <button
                disabled={isProcessing}
                onClick={() => handleDecision('Perlu Pindaan')}
                className="px-3 py-1.5 text-xs font-semibold text-purple-800 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
              >
                Minta Pindaan
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleDecision('Ditolak')}
                className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
              >
                Tolak
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleDecision('Diluluskan')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 shadow-xs"
              >
                {isProcessing ? 'Memproses...' : 'Luluskan Program'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
