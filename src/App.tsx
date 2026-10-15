import React, { useState, useEffect } from 'react';
import { Anime, ContinueItem, Season, Episode, Comment } from './types/anime';
import { initAuth } from './lib/firebase';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ContinueWatching } from './components/ContinueWatching';
import { AnimeGrid } from './components/AnimeGrid';
import { WatchView } from './components/WatchView';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { RequestsModal } from './components/RequestsModal';
import { AdminPanelModal } from './components/AdminPanelModal';

export default function App() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [continueList, setContinueList] = useState<ContinueItem[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [animeSeasons, setAnimeSeasons] = useState<Season[]>([]);
  const [animeEpisodes, setAnimeEpisodes] = useState<Episode[]>([]);
  const [animeComments, setAnimeComments] = useState<Comment[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<number>(1);
  const [activeEpisodeId, setActiveEpisodeId] = useState<number>(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mylist'>('all');
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(() => {
    return localStorage.getItem('sogenime_autoplay') !== 'off';
  });

  // Modals state
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Google User auth state (accessible to admin for Drive operations)
  const [googleUser, setGoogleUser] = useState<any>(null);

  useEffect(() => {
    loadCatalog();
    loadContinueWatching();

    // Initialize Firebase Auth listener
    const unsubscribe = initAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadCatalog = async () => {
    try {
      const res = await fetch('/api/anime');
      if (res.ok) {
        const data = await res.json();
        setAnimes(data);
      }
    } catch (err) {
      console.error('Failed to load anime catalog:', err);
    }
  };

  const loadContinueWatching = async () => {
    try {
      const res = await fetch('/api/progress/continue');
      if (res.ok) {
        const data = await res.json();
        setContinueList(data);
      }
    } catch (err) {
      console.error('Failed to load continue watching:', err);
    }
  };

  const handleSelectAnime = async (anime: Anime, preferredEpId?: number) => {
    try {
      const res = await fetch(`/api/anime/${anime.id}`);
      if (!res.ok) throw new Error('Failed to load anime details');

      const data = await res.json();
      setSelectedAnime(data);
      setAnimeSeasons(data.seasons || []);
      setAnimeEpisodes(data.episodes || []);
      setAnimeComments(data.comments || []);

      const firstSeason = (data.seasons && data.seasons[0]) || { id: 1 };
      setActiveSeasonId(firstSeason.id);

      if (preferredEpId) {
        setActiveEpisodeId(preferredEpId);
      } else if (data.episodes && data.episodes.length > 0) {
        // Find first unwatched or first episode
        const resumeEp = data.episodes.find((e: Episode) => !e.watched && e.savedPosition && e.savedPosition > 5);
        setActiveEpisodeId(resumeEp ? resumeEp.id : data.episodes[0].id);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayContinue = (item: ContinueItem) => {
    const matched = animes.find((a) => a.id === item.animeId);
    if (matched) {
      handleSelectAnime(matched, item.episodeId);
    }
  };

  const handleToggleFavorite = async (animeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/anime/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnimes((prev) =>
          prev.map((a) => (a.id === animeId ? { ...a, isFavorite: data.isFavorite } : a))
        );
        if (selectedAnime && selectedAnime.id === animeId) {
          setSelectedAnime({ ...selectedAnime, isFavorite: data.isFavorite });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateAnime = async (animeId: number, score: number) => {
    try {
      const res = await fetch('/api/anime/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, score }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnimes((prev) =>
          prev.map((a) =>
            a.id === animeId
              ? { ...a, userRating: data.userRating, avgRating: data.avgRating, ratingCount: data.ratingCount }
              : a
          )
        );
        if (selectedAnime && selectedAnime.id === animeId) {
          setSelectedAnime({
            ...selectedAnime,
            userRating: data.userRating,
            avgRating: data.avgRating,
            ratingCount: data.ratingCount,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (animeId: number, content: string) => {
    try {
      const res = await fetch('/api/anime/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, content }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setAnimeComments((prev) => [newComment, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await fetch(`/api/anime/comment/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAnimeComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAutoPlay = () => {
    const nextVal = !autoPlayNext;
    setAutoPlayNext(nextVal);
    localStorage.setItem('sogenime_autoplay', nextVal ? 'on' : 'off');
  };

  const filteredAnimes = animes.filter((anime) => {
    if (activeFilter === 'mylist' && !anime.isFavorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        anime.title.toLowerCase().includes(q) ||
        (anime.originalTitle && anime.originalTitle.toLowerCase().includes(q)) ||
        anime.genres.some((g) => g.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const featuredAnimes = animes.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-100">
      {/* Top 3-Zone Navigation (Drive & Admin restricted to Admin Panel) */}
      <Navbar
        activeTab={activeFilter}
        setActiveTab={setActiveFilter}
        onOpenRequests={() => setIsRequestsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onHomeClick={() => setSelectedAnime(null)}
        unreadCount={1}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 w-full">
        {selectedAnime ? (
          <WatchView
            anime={selectedAnime}
            seasons={animeSeasons}
            episodes={animeEpisodes}
            activeSeasonId={activeSeasonId}
            setActiveSeasonId={setActiveSeasonId}
            activeEpisodeId={activeEpisodeId}
            setActiveEpisodeId={setActiveEpisodeId}
            comments={animeComments}
            onBackToCatalog={() => {
              setSelectedAnime(null);
              loadContinueWatching();
            }}
            onToggleFavorite={handleToggleFavorite}
            onRateAnime={handleRateAnime}
            onPostComment={handlePostComment}
            onDeleteComment={handleDeleteComment}
            autoPlayNext={autoPlayNext}
            onToggleAutoPlay={toggleAutoPlay}
          />
        ) : (
          <>
            {/* Featured Hero Carousel */}
            {activeFilter !== 'mylist' && !searchQuery && (
              <HeroBanner
                featured={featuredAnimes}
                onSelectAnime={handleSelectAnime}
              />
            )}

            {/* Continue Watching Section */}
            {activeFilter !== 'mylist' && !searchQuery && (
              <ContinueWatching
                items={continueList}
                onPlayEpisode={handlePlayContinue}
              />
            )}

            {/* Full Anime Catalog Grid */}
            <AnimeGrid
              animes={filteredAnimes}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              onSelectAnime={handleSelectAnime}
              onToggleFavorite={handleToggleFavorite}
              onOpenDrive={() => setIsAdminOpen(true)}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 glass-heavy py-6 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="font-bold text-zinc-300">Sogenime</span>
            <span>— OLED Anime Hub with Google Drive Media Integration</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span>Server: Express 4 + Vite</span>
            <span>·</span>
            <button onClick={() => setIsAdminOpen(true)} className="hover:text-orange-400 cursor-pointer">
              Admin Panel
            </button>
          </div>
        </div>
      </footer>

      {/* Google Drive Import Modal (Admin Only) */}
      <GoogleDriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        googleUser={googleUser}
        onDriveImportSuccess={(importedAnime) => {
          loadCatalog();
          handleSelectAnime(importedAnime);
        }}
      />

      {/* Anime Requests Modal */}
      <RequestsModal
        isOpen={isRequestsOpen}
        onClose={() => setIsRequestsOpen(false)}
      />

      {/* Admin Panel Modal (Houses Google Drive & Catalog Management) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        animes={animes}
        onRefreshCatalog={loadCatalog}
        googleUser={googleUser}
        onOpenDrive={() => setIsDriveOpen(true)}
      />
    </div>
  );
}
