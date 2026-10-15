import React from 'react';
import { Season, Episode } from '../types/anime';
import { CheckCircle2, Play } from 'lucide-react';

interface EpisodeListProps {
  seasons: Season[];
  activeSeasonId: number;
  onSelectSeasonId: (seasonId: number) => void;
  episodes: Episode[];
  activeEpisodeId: number;
  onSelectEpisodeId: (epId: number) => void;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  seasons,
  activeSeasonId,
  onSelectSeasonId,
  episodes,
  activeEpisodeId,
  onSelectEpisodeId,
}) => {
  return (
    <aside className="rounded-2xl glass border border-slate-800 flex flex-col h-[560px] overflow-hidden">
      {/* Season Selector Tabs */}
      {seasons.length > 0 && (
        <div className="flex items-center gap-1.5 p-3 border-b border-slate-800/80 overflow-x-auto shrink-0">
          {seasons.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSeasonId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                s.id === activeSeasonId
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                  : 'bg-zinc-900/60 text-zinc-400 border border-slate-800 hover:text-zinc-200'
              }`}
            >
              Season {s.seasonNumber}
            </button>
          ))}
        </div>
      )}

      {/* Episode Rows List */}
      <div className="p-3 overflow-y-auto space-y-2 flex-1">
        {episodes.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs">
            No episodes found in this season.
          </div>
        ) : (
          episodes.map((ep) => {
            const isActive = ep.id === activeEpisodeId;
            return (
              <button
                key={ep.id}
                onClick={() => onSelectEpisodeId(ep.id)}
                className={`relative w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between gap-3 overflow-hidden cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/15 border border-sky-400/60 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                    : ep.watched
                    ? 'bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-zinc-950/70 border border-slate-800/60 hover:border-slate-700 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span
                    className={`font-mono text-xs font-bold shrink-0 ${
                      isActive ? 'text-sky-300' : 'text-zinc-500'
                    }`}
                  >
                    {String(ep.episodeNumber).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-white' : 'text-zinc-200'
                      }`}
                    >
                      {ep.title}
                    </p>
                    {ep.synopsis && (
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {ep.synopsis}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)]" />
                  ) : ep.watched ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Watched
                    </span>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400">
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    </div>
                  )}
                </div>

                {/* Saved Progress Bar on bottom of episode row */}
                {ep.progressPct !== undefined && ep.progressPct > 0 && !ep.watched && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800">
                    <div
                      className="h-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                      style={{ width: `${ep.progressPct}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
