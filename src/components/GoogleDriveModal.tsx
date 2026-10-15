import React, { useState, useEffect } from 'react';
import { X, HardDrive, Folder, Film, Check, Loader2, RefreshCw } from 'lucide-react';
import { googleSignIn, getAccessToken, logout } from '../lib/firebase';
import { searchDriveVideos, listDriveFolders, DriveItem, formatFileSize } from '../lib/drive';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: any;
  onDriveImportSuccess: (anime: any) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  onDriveImportSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [seriesTitle, setSeriesTitle] = useState('');
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && googleUser) {
      loadDriveData();
    }
  }, [isOpen, googleUser, selectedFolderId]);

  const loadDriveData = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) return;

      const [folderList, fileList] = await Promise.all([
        listDriveFolders(token),
        searchDriveVideos(token, selectedFolderId || undefined),
      ]);

      setFolders(folderList);
      setFiles(fileList);

      // Pre-select all found video files by default
      setSelectedFileIds(new Set(fileList.map((f) => f.id)));
    } catch (err: any) {
      console.error('Error loading Google Drive files:', err);
      setStatusMessage('Failed to load Google Drive items: ' + (err.message || 'Check permissions'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        await loadDriveData();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFile = (fileId: string) => {
    const next = new Set(selectedFileIds);
    if (next.has(fileId)) {
      next.delete(fileId);
    } else {
      next.add(fileId);
    }
    setSelectedFileIds(next);
  };

  const handleImport = async () => {
    if (selectedFileIds.size === 0) {
      setStatusMessage('Please select at least one video file to import.');
      return;
    }

    setImporting(true);
    setStatusMessage('Importing files into Sogenime catalog...');

    try {
      const chosenFiles = files.filter((f) => selectedFileIds.has(f.id));
      const chosenFolder = folders.find((f) => f.id === selectedFolderId);

      const title = seriesTitle.trim() || chosenFolder?.name || chosenFiles[0].name.replace(/\.[^/.]+$/, '');

      // 1. Post to import endpoint
      const res = await fetch('/api/drive/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          folderName: chosenFolder?.name || 'Google Drive',
          files: chosenFiles,
        }),
      });

      if (!res.ok) {
        throw new Error('Import failed on server');
      }

      const data = await res.json();
      onDriveImportSuccess(data.anime);
      onClose();
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Error importing from Drive: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl glass-heavy border border-sky-500/30 shadow-[0_0_50px_rgba(56,189,248,0.2)] overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">Google Drive Integration</h2>
              <p className="text-[11px] text-zinc-400">Stream anime directly from your cloud storage</p>
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {!googleUser ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                <HardDrive className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Connect Your Google Drive</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Access your personal anime video files (.mp4, .mkv, .webm) and seamlessly stream them with Sogenime's player, watch progress tracking, and AI recaps.
                </p>
              </div>
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-slate-950 font-bold text-xs hover:brightness-110 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Account summary bar */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-zinc-300">Connected:</span>
                  <span className="font-bold text-white">{googleUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadDriveData}
                    className="p-1 text-zinc-400 hover:text-sky-300 cursor-pointer"
                    title="Refresh Drive files"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => logout()}
                    className="text-[11px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Title and options */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Anime Series Name
                  </label>
                  <input
                    type="text"
                    value={seriesTitle}
                    onChange={(e) => setSeriesTitle(e.target.value)}
                    placeholder="e.g. Dandadan, Chainsaw Man (or auto-detect from folder)"
                    className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Folder Selector Filter */}
              {folders.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Filter by Folder
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedFolderId('')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                        selectedFolderId === ''
                          ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                          : 'bg-zinc-900 text-zinc-400 border-slate-800 hover:text-zinc-200'
                      }`}
                    >
                      <span>Root / All</span>
                    </button>
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFolderId(f.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                          selectedFolderId === f.id
                            ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                            : 'bg-zinc-900 text-zinc-400 border-slate-800 hover:text-zinc-200'
                        }`}
                      >
                        <Folder className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Files Picker List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Found Video Files ({files.length})</span>
                  <span className="text-sky-400 font-semibold">{selectedFileIds.size} selected</span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-zinc-500 flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                    <span className="text-xs">Querying Google Drive files...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs rounded-xl border border-dashed border-slate-800">
                    No video files (.mp4, .mkv, .webm) found in this Google Drive folder.
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 p-1">
                    {files.map((file) => {
                      const isSelected = selectedFileIds.has(file.id);
                      return (
                        <div
                          key={file.id}
                          onClick={() => handleToggleFile(file.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-sky-500/15 border-sky-400/50 text-white'
                              : 'bg-zinc-950/60 border-slate-800/80 text-zinc-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <Film className="w-4 h-4 text-sky-400 shrink-0" />
                            <span className="truncate font-medium">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {file.size && (
                              <span className="text-[10px] text-zinc-500">{formatFileSize(file.size)}</span>
                            )}
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                isSelected ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-zinc-700'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {statusMessage && (
                <p className="text-xs font-medium text-sky-300 bg-sky-950/30 p-2.5 rounded-lg border border-sky-500/30">
                  {statusMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {googleUser && (
          <div className="p-3.5 bg-zinc-950/90 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              Files will be mapped directly to Sogenime seasons and episodes.
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg glass text-zinc-300 text-xs font-semibold hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || selectedFileIds.size === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              >
                {importing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Import Anime Series</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
