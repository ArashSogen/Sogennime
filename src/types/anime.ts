export interface Episode {
  id: number;
  seasonId: number;
  episodeNumber: number;
  title: string;
  synopsis?: string;
  videoUrl: string;
  duration?: number;
  savedPosition?: number;
  progressPct?: number;
  watched?: boolean;
  driveFileId?: string;
}

export interface Season {
  id: number;
  animeId: number;
  seasonNumber: number;
  title?: string;
  coverImage?: string;
  episodeCount?: number;
  folderPath?: string;
}

export interface Anime {
  id: number;
  title: string;
  originalTitle?: string;
  synopsis: string;
  coverImage: string;
  bannerImage: string;
  genres: string[];
  year: number;
  status: 'Airing' | 'Completed' | 'Upcoming';
  folderPath?: string;
  seasonCount: number;
  episodeCount: number;
  avgRating?: string;
  ratingCount: number;
  isFavorite?: boolean;
  userRating?: number;
  seasons?: Season[];
  isFromDrive?: boolean;
}

export interface Comment {
  id: number;
  animeId: number;
  userId: number;
  username: string;
  avatar?: string;
  content: string;
  createdAt: string;
}

export interface AnimeRequest {
  id: number;
  userId: number;
  username: string;
  animeTitle: string;
  notes: string;
  status: 'Pending' | 'Added' | 'Rejected';
  unread?: boolean;
  createdAt: string;
}

export interface WatchProgress {
  episodeId: number;
  position: number;
  duration: number;
  watched: boolean;
  updatedAt: string;
}

export interface ContinueItem {
  animeId: number;
  animeTitle: string;
  coverImage: string;
  seasonId: number;
  seasonNumber: number;
  episodeId: number;
  episodeNumber: number;
  episodeTitle: string;
  progressPct: number;
  timeLabel: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: string;
  unreadNotifs?: number;
  watchedCount?: number;
}
