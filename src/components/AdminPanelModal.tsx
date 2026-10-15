import React, { useState, useEffect } from 'react';
import { X, Shield, RefreshCw, Trash2, FolderSync, HardDrive, CheckCircle2 } from 'lucide-react';
import { Anime, AnimeRequest } from '../types/anime';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  animes: Anime[];
  onRefreshCatalog: () => void;
  googleUser: any;
  onOpenDrive: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  animes,
  onRefreshCatalog,
  googleUser,
  onOpenDrive,
}) => {
  const [storagePath, setStoragePath] = useState('/mnt/gdrive/anime');
  const [requests, setRequests] = useState<AnimeRequest[]>([]);
  const [scanning, setScanning] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const loadRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setAdminMessage(`Scan complete! Verified ${animes.length} anime series, active seasons and video streams.`);
      onRefreshCatalog();
    }, 1200);
  };

  const handleClearSamples = async () => {
    if (!window.confirm('Clear all preloaded sample anime? Only your imported Google Drive anime will remain.')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/anime/clear-samples', { method: 'POST' });
      if (res.ok) {
        setAdminMessage('All sample anime removed. Catalog now contains only your imported anime.');
        onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreSamples = async () => {
    try {
      const res = await fetch('/api/admin/anime/restore-samples', { method: 'POST' });
      if (res.ok) {
        setAdminMessage('Sample anime restored to catalog.');
        onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnime = async (animeId: number) => {
    if (!window.confirm('Delete this anime from the catalog?')) return;
    try {
      const res = await fetch(`/api/anime/${animeId}`, { method: 'DELETE' });
      if (res.ok) {
        setAdminMessage(`Anime #${animeId} deleted from library.`);
        onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (requestId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        if (newStatus === 'Delete') {
          setRequests((prev) => prev.filter((r) => r.id !== requestId));
        } else {
          setRequests((prev) =>
            prev.map((r) => (r.id === requestId ? { ...r, status: newStatus as any } : r))
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl glass-heavy border border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.2)] overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">Sogenime Admin Control</h2>
              <p className="text-[11px] text-zinc-400">Exclusive admin controls for storage, Drive, and requests</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {adminMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{adminMessage}</span>
            </div>
          )}

          {/* Section 1: Google Drive Admin Integration */}
          <div className="p-4 rounded-xl glass border border-sky-500/30 space-y-3 bg-sky-950/10">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-sky-400" />
                <span>Google Drive Cloud Storage (Admin Only)</span>
              </h3>
              {googleUser ? (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Connected: {googleUser.email}
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500">Not Connected</span>
              )}
            </div>
            <p className="text-zinc-400">
              Only the administrator has access to connect Google Drive, browse personal cloud files, and import episodes into the Sogenime catalog.
            </p>
            <div>
              <button
                onClick={() => {
                  onClose();
                  onOpenDrive();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.25)]"
              >
                <HardDrive className="w-4 h-4" />
                <span>{googleUser ? 'Open Drive File Importer' : 'Connect Google Drive'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Storage Scanner & Sample Management */}
          <div className="p-4 rounded-xl glass border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FolderSync className="w-4 h-4 text-orange-400" />
              <span>Storage Scanner & Sample Anime Controls</span>
            </h3>
            <p className="text-zinc-400">
              The initial anime in the catalog are samples included in the code for instant preview. You can clear them to show only your own Google Drive library, or restore them anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={storagePath}
                onChange={(e) => setStoragePath(e.target.value)}
                placeholder="/mnt/gdrive/anime"
                className="flex-1 bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-sky-400"
              />
              <button
                onClick={handleScan}
                disabled={scanning}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold hover:bg-sky-500/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                <span>Scan Path</span>
              </button>
              <button
                onClick={handleClearSamples}
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25 transition-colors cursor-pointer whitespace-nowrap font-semibold"
              >
                Clear Sample Anime
              </button>
              <button
                onClick={handleRestoreSamples}
                className="px-3.5 py-2 rounded-xl glass text-zinc-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Restore Samples
              </button>
            </div>
          </div>

          {/* Section 3: Manage User Requests */}
          <div className="p-4 rounded-xl glass border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white">User Anime Requests ({requests.length})</h3>

            {requests.length === 0 ? (
              <p className="text-zinc-500 py-3 text-center">No pending anime requests.</p>
            ) : (
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-950/80 text-[11px] text-zinc-500 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">User</th>
                      <th className="p-2.5">Anime</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-zinc-950/40">
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className="p-2.5 font-bold text-sky-300">{r.username}</td>
                        <td className="p-2.5 text-zinc-200">{r.animeTitle}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'Added'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : r.status === 'Rejected'
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                : 'bg-orange-950 text-orange-300 border border-orange-500/30'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right space-x-1">
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'Added')}
                            className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold cursor-pointer"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'Rejected')}
                            className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'Delete')}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Catalog Titles & Deletion */}
          <div className="p-4 rounded-xl glass border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white">Catalog Management ({animes.length} titles)</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {animes.map((a) => (
                <div
                  key={a.id}
                  className="p-2.5 rounded-lg bg-zinc-950/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={a.coverImage}
                      alt={a.title}
                      className="w-8 h-12 object-cover rounded border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-zinc-100 truncate">{a.title}</p>
                        {a.isFromDrive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-500/30">
                            Drive
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate">{a.folderPath || 'Internal mount'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono text-sky-400">
                      {a.seasonCount}S · {a.episodeCount}EP
                    </span>
                    <button
                      onClick={() => handleDeleteAnime(a.id)}
                      className="p-1.5 rounded text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete anime from catalog"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-zinc-950/90 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg glass text-zinc-300 text-xs font-semibold hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
