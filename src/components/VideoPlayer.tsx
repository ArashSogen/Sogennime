import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  SkipBack,
  SkipForward,
  Tv,
} from 'lucide-react';
import { Episode, Season } from '../types/anime';

interface VideoPlayerProps {
  episode: Episode;
  season?: Season;
  animeTitle: string;
  prevEpisodeId?: number;
  nextEpisodeId?: number;
  onSelectEpisodeId: (epId: number) => void;
  isTheaterMode: boolean;
  onToggleTheater: () => void;
  autoPlayNext: boolean;
  onToggleAutoPlay: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  episode,
  season,
  animeTitle,
  prevEpisodeId,
  nextEpisodeId,
  onSelectEpisodeId,
  isTheaterMode,
  onToggleTheater,
  autoPlayNext,
  onToggleAutoPlay,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Resume position logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startPos = episode.savedPosition && episode.savedPosition > 5 ? episode.savedPosition : 0;

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      if (startPos > 5 && (video.duration === 0 || startPos < video.duration - 15)) {
        video.currentTime = startPos;
        const m = Math.floor(startPos / 60);
        const s = Math.floor(startPos % 60);
        setResumeNotice(`Resumed at ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        setTimeout(() => setResumeNotice(null), 4000);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [episode.id, episode.savedPosition]);

  // Periodic progress sync to backend
  useEffect(() => {
    let lastSent = 0;
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const now = Date.now();
      if (now - lastSent >= 5000 && video.currentTime > 2) {
        lastSent = now;
        syncProgress(false);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      syncProgress(true);

      if (autoPlayNext && nextEpisodeId) {
        setCountdown(3);
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              onSelectEpisodeId(nextEpisodeId);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [episode.id, nextEpisodeId, autoPlayNext]);

  const syncProgress = (forceWatched: boolean) => {
    const video = videoRef.current;
    if (!video) return;

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeId: episode.id,
        position: video.currentTime || 0,
        duration: video.duration || 0,
        watched: forceWatched,
      }),
    }).catch(() => {});
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      syncProgress(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isGoogleDriveEmbed = episode.videoUrl?.includes('drive.google.com/file/d/') && episode.videoUrl?.includes('/preview');

  return (
    <div className="rounded-2xl overflow-hidden glass border border-sky-500/20 shadow-[0_12px_45px_rgba(0,0,0,0.9)] flex flex-col">
      {/* Video Container (16:9 ratio) */}
      <div className="relative aspect-video bg-black overflow-hidden group/video flex items-center justify-center">
        {isGoogleDriveEmbed ? (
          <iframe
            src={episode.videoUrl}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
            title={episode.title}
          />
        ) : (
          <video
            ref={videoRef}
            src={episode.videoUrl}
            onClick={togglePlay}
            playsInline
            preload="metadata"
            className="w-full h-full object-contain cursor-pointer"
          />
        )}

        {/* Play overlay button on pause */}
        {!isGoogleDriveEmbed && !isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.8)] transform hover:scale-110 transition-transform">
              <Play className="w-7 h-7 fill-slate-950 ml-1" />
            </div>
          </button>
        )}

        {/* Resume notification banner */}
        {resumeNotice && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-orange-500/90 text-slate-950 text-xs font-bold shadow-lg animate-fade-in flex items-center gap-1.5">
            <span>●</span>
            <span>{resumeNotice}</span>
          </div>
        )}

        {/* Auto-play next countdown prompt */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center gap-3">
            <p className="text-zinc-300 text-sm">Next episode in</p>
            <span className="text-4xl font-extrabold text-sky-400">{countdown}s</span>
            <div className="flex gap-2">
              <button
                onClick={() => nextEpisodeId && onSelectEpisodeId(nextEpisodeId)}
                className="px-4 py-2 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 cursor-pointer"
              >
                Play Now
              </button>
              <button
                onClick={() => setCountdown(null)}
                className="px-4 py-2 rounded-lg glass text-zinc-300 text-xs hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Custom Scrubber on Video Hover (HTML5 video) */}
        {!isGoogleDriveEmbed && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity flex flex-col gap-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="hover:text-sky-300 transition-colors cursor-pointer">
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <div className="flex items-center gap-1.5">
                  <button onClick={toggleMute} className="hover:text-sky-300 transition-colors cursor-pointer">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
                <span className="font-mono text-[11px] tabular-nums text-zinc-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="bg-black/60 border border-slate-700 text-zinc-300 text-[11px] rounded px-1.5 py-0.5 focus:outline-none"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2.0x</option>
                </select>
                <button onClick={handleFullscreen} className="hover:text-sky-300 transition-colors cursor-pointer">
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Player Toolbar */}
      <div className="p-3.5 glass-heavy border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30">
            S{season?.seasonNumber || 1} · EP {String(episode.episodeNumber).padStart(2, '0')}
          </span>
          <span className="font-semibold text-zinc-100">{episode.title}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Download direct link */}
          <a
            href={episode.videoUrl}
            download={`${animeTitle} - S01E${episode.episodeNumber}.mp4`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/40 hover:bg-orange-500/25 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>

          {/* Theater Mode */}
          <button
            onClick={onToggleTheater}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              isTheaterMode
                ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                : 'glass text-zinc-300 hover:text-white border-slate-700'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Theater</span>
          </button>

          {/* Auto-Play Next Toggle */}
          <button
            onClick={onToggleAutoPlay}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              autoPlayNext
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                : 'glass text-zinc-500 border-slate-800'
            }`}
          >
            Auto-Play: {autoPlayNext ? 'ON' : 'OFF'}
          </button>

          {/* Prev / Next Episode Buttons */}
          {prevEpisodeId && (
            <button
              onClick={() => onSelectEpisodeId(prevEpisodeId)}
              className="p-1.5 rounded-lg glass text-zinc-300 hover:text-sky-300 transition-colors cursor-pointer"
              title="Previous Episode"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          {nextEpisodeId && (
            <button
              onClick={() => onSelectEpisodeId(nextEpisodeId)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold hover:brightness-110 transition-colors cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.3)]"
              title="Next Episode"
            >
              <span>Next</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
