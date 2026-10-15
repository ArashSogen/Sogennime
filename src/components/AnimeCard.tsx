import React from 'react';
import { Play, Star, Heart, HardDrive } from 'lucide-react';
import { Anime } from '../types/anime';

interface AnimeCardProps {
  anime: Anime;
  onSelect: (anime: Anime) => void;
  onToggleFavorite: (animeId: number, e: React.MouseEvent) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onSelect, onToggleFavorite }) => {
  return (
    <div
      onClick={() => onSelect(anime)}
      className="group relative rounded-xl overflow-hidden glass transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/60 hover:shadow-[0_0_25px_rgba(56,189,248,0.25)] flex flex-col cursor-pointer bg-zinc-950/70"
    >
      {/* Poster area (2:3 aspect ratio) */}
      <div className="aspect-[2/3] w-full bg-zinc-900 relative overflow-hidden">
        <img
          src={anime.coverImage}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          referrerPolicy="no-referrer"
        />

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.8)] transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-500/30">
            {anime.episodeCount} EP
          </span>
          {anime.isFromDrive && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-sky-950/90 text-sky-300 border border-sky-500/40 flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              Drive
            </span>
          )}
        </div>

        {anime.avgRating && (
          <span className="absolute top-2.5 right-2.5 text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-zinc-950/90 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
            {anime.avgRating}
          </span>
        )}

        <span className="absolute bottom-2.5 right-2.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/80 text-sky-300 border border-sky-400/20">
          {anime.seasonCount} {anime.seasonCount === 1 ? 'Season' : 'Seasons'}
        </span>
      </div>

      {/* Card Info */}
      <div className="p-3.5 flex items-center justify-between gap-2 border-t border-slate-800/60">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm text-zinc-100 truncate group-hover:text-sky-300 transition-colors">
            {anime.title}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
            {anime.genres.slice(0, 2).join(' · ')}
          </p>
        </div>

        {/* Favorite heart button */}
        <button
          onClick={(e) => onToggleFavorite(anime.id, e)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
            anime.isFavorite
              ? 'text-orange-400 hover:text-orange-300'
              : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50'
          }`}
          title={anime.isFavorite ? 'Remove from My List' : 'Add to My List'}
        >
          <Heart className={`w-4 h-4 ${anime.isFavorite ? 'fill-orange-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
