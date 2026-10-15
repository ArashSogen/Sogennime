import React, { useState } from 'react';
import { ArrowLeft, Star, Heart, MessageSquare, Trash2, Send } from 'lucide-react';
import { Anime, Season, Episode, Comment } from '../types/anime';
import { VideoPlayer } from './VideoPlayer';
import { EpisodeList } from './EpisodeList';

interface WatchViewProps {
  anime: Anime;
  seasons: Season[];
  episodes: Episode[];
  activeSeasonId: number;
  setActiveSeasonId: (id: number) => void;
  activeEpisodeId: number;
  setActiveEpisodeId: (id: number) => void;
  comments: Comment[];
  onBackToCatalog: () => void;
  onToggleFavorite: (animeId: number, e: React.MouseEvent) => void;
  onRateAnime: (animeId: number, score: number) => void;
  onPostComment: (animeId: number, content: string) => Promise<void>;
  onDeleteComment: (commentId: number) => void;
  autoPlayNext: boolean;
  onToggleAutoPlay: () => void;
}

export const WatchView: React.FC<WatchViewProps> = ({
  anime,
  seasons,
  episodes,
  activeSeasonId,
  setActiveSeasonId,
  activeEpisodeId,
  setActiveEpisodeId,
  comments,
  onBackToCatalog,
  onToggleFavorite,
  onRateAnime,
  onPostComment,
  onDeleteComment,
  autoPlayNext,
  onToggleAutoPlay,
}) => {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const activeSeason = seasons.find((s) => s.id === activeSeasonId) || seasons[0];
  const seasonEpisodes = episodes.filter((e) => e.seasonId === activeSeason?.id);
  const activeEpisode = seasonEpisodes.find((e) => e.id === activeEpisodeId) || seasonEpisodes[0] || episodes[0];

  const currentEpIndex = seasonEpisodes.findIndex((e) => e.id === activeEpisode?.id);
  const prevEpId = currentEpIndex > 0 ? seasonEpisodes[currentEpIndex - 1].id : undefined;
  const nextEpId = currentEpIndex >= 0 && currentEpIndex + 1 < seasonEpisodes.length ? seasonEpisodes[currentEpIndex + 1].id : undefined;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isPostingComment) return;
    setIsPostingComment(true);
    try {
      await onPostComment(anime.id, commentInput);
      setCommentInput('');
    } finally {
      setIsPostingComment(false);
    }
  };

  if (!activeEpisode) {
    return (
      <div className="p-12 text-center glass rounded-2xl">
        <p className="text-zinc-400 mb-4">No episodes available for this series.</p>
        <button onClick={onBackToCatalog} className="px-4 py-2 bg-sky-500 text-slate-950 font-bold rounded-lg">
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top back navigation */}
      <button
        onClick={onBackToCatalog}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-sky-300 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Catalog</span>
      </button>

      {/* Main Watch Layout */}
      <div className={`grid gap-6 items-start ${isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        {/* Left Column: Player & Series Details */}
        <div className={`space-y-6 ${isTheaterMode ? 'w-full' : 'lg:col-span-8'}`}>
          <VideoPlayer
            episode={activeEpisode}
            season={activeSeason}
            animeTitle={anime.title}
            prevEpisodeId={prevEpId}
            nextEpisodeId={nextEpId}
            onSelectEpisodeId={setActiveEpisodeId}
            isTheaterMode={isTheaterMode}
            onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
            autoPlayNext={autoPlayNext}
            onToggleAutoPlay={onToggleAutoPlay}
          />

          {/* Anime Overview Box */}
          <div className="p-6 rounded-2xl glass border border-slate-800 flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-28 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden border border-sky-500/30 shrink-0 bg-zinc-900 shadow-xl">
              <img
                src={activeSeason?.coverImage || anime.coverImage}
                alt={anime.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">{anime.title}</h1>
                  {anime.originalTitle && (
                    <p className="text-xs font-semibold text-sky-400">{anime.originalTitle}</p>
                  )}
                  <p className="text-xs text-zinc-400 mt-1">
                    Season {activeSeason?.seasonNumber || 1} · {seasonEpisodes.length} Episodes · {anime.year}
                  </p>
                </div>

                {/* My List / Favorite Button */}
                <button
                  onClick={(e) => onToggleFavorite(anime.id, e)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    anime.isFavorite
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                      : 'glass text-zinc-300 hover:text-white border-slate-700'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${anime.isFavorite ? 'fill-orange-400' : ''}`} />
                  <span>{anime.isFavorite ? 'In My List' : '+ Add to My List'}</span>
                </button>
              </div>

              {/* 1-10 Star Rating Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      onClick={() => onRateAnime(anime.id, star)}
                      className={`w-6 h-6 rounded text-[11px] font-extrabold transition-all cursor-pointer border ${
                        (anime.userRating || 0) >= star
                          ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                          : 'glass text-zinc-500 border-slate-800 hover:text-zinc-200 hover:border-slate-700'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
                {anime.avgRating && (
                  <span className="text-xs font-bold text-amber-300 ml-2">
                    ★ {anime.avgRating} / 10 ({anime.ratingCount} reviews)
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed pt-1">{anime.synopsis}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {anime.genres.map((g) => (
                  <span key={g} className="text-[11px] font-medium text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-slate-800">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Comments Discussion Section */}
          <div className="p-6 rounded-2xl glass border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>Discussion ({comments.length})</span>
              </h2>
            </div>

            <form onSubmit={handleCommentSubmit} className="space-y-2">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your thoughts on this episode or series..."
                rows={3}
                className="w-full bg-zinc-950/80 border border-slate-800 rounded-xl p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.2)]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentInput.trim() || isPostingComment}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPostingComment ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {comments.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No comments yet. Start the conversation!</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-xl bg-zinc-950/60 border border-slate-800/80 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-900 border border-teal-500/40 flex items-center justify-center font-bold text-teal-300 text-xs shrink-0">
                      {comment.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-sky-300">{comment.username}</span>
                          <span className="text-[10px] text-zinc-500">{comment.createdAt}</span>
                        </div>
                        <button
                          onClick={() => onDeleteComment(comment.id)}
                          className="text-zinc-600 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-200 mt-1 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Episodes Sidebar */}
        <div className={isTheaterMode ? 'w-full' : 'lg:col-span-4'}>
          <EpisodeList
            seasons={seasons}
            activeSeasonId={activeSeason?.id || 1}
            onSelectSeasonId={setActiveSeasonId}
            episodes={seasonEpisodes}
            activeEpisodeId={activeEpisode.id}
            onSelectEpisodeId={setActiveEpisodeId}
          />
        </div>
      </div>
    </div>
  );
};
