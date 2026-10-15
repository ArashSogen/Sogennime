import React from 'react';
import { Search, Film, Heart, X, HardDrive } from 'lucide-react';
import { Anime } from '../types/anime';
import { AnimeCard } from './AnimeCard';

interface AnimeGridProps {
  animes: Anime[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFilter: 'all' | 'mylist';
  setActiveFilter: (f: 'all' | 'mylist') => void;
  onSelectAnime: (anime: Anime) => void;
  onToggleFavorite: (animeId: number, e: React.MouseEvent) => void;
  onOpenDrive: () => void;
}

export const AnimeGrid: React.FC<AnimeGridProps> = ({
  animes,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  onSelectAnime,
  onToggleFavorite,
  onOpenDrive,
}) => {
  return (
    <section>
      {/* Header controls toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Left: Filter tabs & title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl glass">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>All Anime</span>
            </button>

            <button
              onClick={() => setActiveFilter('mylist')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeFilter === 'mylist'
                  ? 'bg-orange-500 text-slate-950 shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>My List</span>
            </button>
          </div>

          <span className="text-xs text-zinc-500 font-medium hidden md:inline">
            {animes.length} titles
          </span>
        </div>

        {/* Right: Search bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anime library..."
            className="w-full bg-zinc-950/80 border border-slate-800 text-zinc-200 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-sky-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all placeholder:text-zinc-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Anime cards grid */}
      {animes.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-slate-800">
          <p className="text-zinc-400 text-sm mb-4">
            {activeFilter === 'mylist'
              ? 'No anime in your list yet. Click the heart on any anime to add it!'
              : searchQuery
              ? `No anime matching "${searchQuery}" found.`
              : 'No anime currently indexed.'}
          </p>
          {activeFilter === 'mylist' ? (
            <button
              onClick={() => setActiveFilter('all')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-colors cursor-pointer"
            >
              Browse Catalog
            </button>
          ) : (
            <button
              onClick={onOpenDrive}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500 text-slate-950 hover:brightness-110 transition-all cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Import Anime via Admin Panel</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {animes.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onSelect={onSelectAnime}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
};
