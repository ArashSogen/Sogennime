import React, { useState, useEffect } from 'react';
import { Play, Star } from 'lucide-react';
import { Anime } from '../types/anime';

interface HeroBannerProps {
  featured: Anime[];
  onSelectAnime: (anime: Anime) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ featured, onSelectAnime }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (!featured.length) return null;
  const current = featured[currentIndex];

  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[380px] md:min-h-[420px] mb-8 border border-sky-500/20 glass shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-end">
      {/* Background with cinematic darken scrim */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-md brightness-[0.28] scale-105 transition-all duration-1000"
        style={{
          backgroundImage: current.bannerImage ? `url('${current.bannerImage}')` : undefined,
          backgroundColor: '#0a0f18',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      {/* Hero content */}
      <div className="relative z-10 w-full p-6 md:p-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
        <div className="max-w-2xl space-y-4">
          {/* Metadata line (clean typographic separators, zero-pill discipline) */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <span className="text-orange-400 font-bold uppercase tracking-wider">Featured Anime</span>
            <span aria-hidden="true">·</span>
            <span>{current.seasonCount} Seasons</span>
            <span aria-hidden="true">·</span>
            <span>{current.episodeCount} Episodes</span>
            {current.avgRating && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  {current.avgRating}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="text-zinc-500">{current.year}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {current.title}
          </h1>

          {current.originalTitle && (
            <p className="text-sm font-semibold text-sky-400/80 tracking-wide">
              {current.originalTitle}
            </p>
          )}

          <p className="text-sm text-zinc-300 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl">
            {current.synopsis}
          </p>

          {/* Action CTA */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onSelectAnime(current)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-sky-400 text-slate-950 hover:brightness-110 transition-all shadow-[0_0_25px_rgba(56,189,248,0.4)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Watch Now</span>
            </button>
          </div>

          {/* Slide Navigation Dots */}
          {featured.length > 1 && (
            <div className="flex gap-1.5 pt-4">
              {featured.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex ? 'w-8 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'w-3 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Poster showcase */}
        <div className="hidden md:block w-44 aspect-[2/3] rounded-xl overflow-hidden border border-sky-400/30 shrink-0 shadow-2xl relative bg-zinc-900 group">
          <img
            src={current.coverImage}
            alt={current.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
