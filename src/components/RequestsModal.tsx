import React, { useState, useEffect } from 'react';
import { X, Bell, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { AnimeRequest } from '../types/anime';

interface RequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestsModal: React.FC<RequestsModalProps> = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState<AnimeRequest[]>([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeTitle: title.trim(), notes: notes.trim() }),
      });

      if (res.ok) {
        const newReq = await res.json();
        setRequests((prev) => [newReq, ...prev]);
        setTitle('');
        setNotes('');
        setSuccessNotice(true);
        setTimeout(() => setSuccessNotice(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl glass-heavy border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">Request an Anime</h2>
              <p className="text-[11px] text-zinc-400">Submit series for the admin to index into Sogenime</p>
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl glass border border-slate-800/80 space-y-3">
            {successNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Request submitted to admin for review!</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                Anime Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dandadan, Bleach TYBW, Solo Leveling S2"
                className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                Notes / Preferred Quality / Season
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. 1080p dual audio, Blu-ray rip preferred"
                className="w-full bg-zinc-950 border border-slate-800 rounded-xl p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!title.trim() || submitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.3)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>

          {/* Past Requests Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Your Request History</h3>
            {requests.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No requests submitted yet.</p>
            ) : (
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-950/80 text-[11px] text-zinc-500 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Anime Title</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-zinc-950/40">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-3 font-bold text-zinc-200">{r.animeTitle}</td>
                        <td className="p-3 text-zinc-400 max-w-[200px] truncate">{r.notes || '—'}</td>
                        <td className="p-3 text-zinc-500 font-mono text-[11px]">{r.createdAt}</td>
                        <td className="p-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              r.status === 'Added'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                                : r.status === 'Rejected'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                                : 'bg-orange-950/80 text-orange-300 border border-orange-500/30'
                            }`}
                          >
                            {r.status === 'Added' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : r.status === 'Rejected' ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
