import React from 'react';
import { Play } from 'lucide-react';
import { ContinueItem } from '../types/anime';

interface ContinueWatchingProps {
  items: ContinueItem[];
  onPlayEpisode: (item: ContinueItem) => void;
}

export const ContinueWatching: React.FC<ContinueWatchingProps> = ({ items, onPlayEpisode }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
        <h2 className="text-lg font-bold text-white tracking-tight">Continue Watching</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.map((item) => (
          <button
            key={`${item.animeId}_${item.episodeId}`}
            onClick={() => onPlayEpisode(item)}
            className="group relative rounded-xl p-3 glass flex items-center gap-3.5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] text-left cursor-pointer w-full"
          >
            {/* Thumbnail */}
            <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-slate-700/50 relative">
              <img
                src={item.coverImage}
                alt={item.animeTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-bold text-sm text-zinc-100 truncate group-hover:text-sky-300 transition-colors">
                {item.animeTitle}
              </h3>
              <p className="text-xs font-semibold text-sky-400 mt-0.5">
                S{item.seasonNumber} · EP {String(item.episodeNumber).padStart(2, '0')}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 truncate">
                {item.episodeTitle}
              </p>
              <p className="text-[10px] text-zinc-500 tabular-nums mt-0.5">
                {item.timeLabel}
              </p>
            </div>

            {/* Play button circular icon */}
            <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-400/40 flex items-center justify-center text-sky-400 group-hover:bg-sky-400 group-hover:text-slate-950 transition-colors shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>

            {/* Progress Bar along bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
              <div
                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                style={{ width: `${item.progressPct}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
