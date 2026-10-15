import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

interface StoreProgress {
  position: number;
  duration: number;
  watched: boolean;
  updatedAt: string;
}

interface ServerStore {
  storagePath: string;
  nextAnimeId: number;
  nextSeasonId: number;
  nextEpId: number;
  nextReqId: number;
  nextCommentId: number;
  users: Array<{ id: number; username: string; avatar: string; isAdmin: boolean }>;
  animes: Array<{
    id: number;
    title: string;
    originalTitle?: string;
    synopsis: string;
    coverImage: string;
    bannerImage: string;
    genres: string[];
    year: number;
    status: 'Airing' | 'Completed' | 'Upcoming';
    folderPath: string;
    isFromDrive?: boolean;
    driveFileId?: string;
  }>;
  seasons: Array<{
    id: number;
    animeId: number;
    seasonNumber: number;
    coverImage: string;
    folderPath: string;
  }>;
  episodes: Array<{
    id: number;
    seasonId: number;
    episodeNumber: number;
    title: string;
    synopsis: string;
    filePath: string;
    videoUrl: string;
    duration: number;
    driveFileId?: string;
  }>;
  requests: Array<{
    id: number;
    userId: number;
    username: string;
    animeTitle: string;
    notes: string;
    status: 'Pending' | 'Added' | 'Rejected';
    unread: boolean;
    createdAt: string;
  }>;
  comments: Array<{
    id: number;
    animeId: number;
    userId: number;
    username: string;
    avatar: string;
    content: string;
    createdAt: string;
  }>;
  progress: Record<string, StoreProgress>;
  ratings: Record<string, number>;
  favorites: Record<string, boolean>;
}

// Initial seed matching the user's Go app anime library
const store: ServerStore = {
  storagePath: '/mnt/gdrive/anime',
  nextAnimeId: 6,
  nextSeasonId: 8,
  nextEpId: 18,
  nextReqId: 4,
  nextCommentId: 5,
  users: [
    { id: 1, username: 'Admin', avatar: '', isAdmin: true },
    { id: 2, username: 'OtakuRider', avatar: '', isAdmin: false },
    { id: 3, username: 'Kagami', avatar: '', isAdmin: false },
  ],
  animes: [
    {
      id: 1,
      title: 'Cyber Horizon 2099',
      originalTitle: 'サイバーホライズン 2099',
      synopsis:
        'In the neon-drenched megacity of Neo-Shinjuku, a rogue neural runner uncovers a classified quantum construct that controls humanity’s augmented consciousness.',
      coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      genres: ['Cyberpunk', 'Sci-Fi', 'Action', 'Psychological'],
      year: 2026,
      status: 'Airing',
      folderPath: '/mnt/gdrive/anime/Cyber Horizon 2099',
    },
    {
      id: 2,
      title: 'Shadow of the Shogun: Blood & Steel',
      originalTitle: '将軍の影',
      synopsis:
        'During an alternate Edo era shadowed by demonic spirits and cursed obsidian blades, an exile samurai seeks redemption by guarding the last descendant of the imperial line.',
      coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&auto=format&fit=crop&q=80',
      genres: ['Historical', 'Supernatural', 'Martial Arts', 'Seinen'],
      year: 2025,
      status: 'Completed',
      folderPath: '/mnt/gdrive/anime/Shadow of the Shogun',
    },
    {
      id: 3,
      title: 'Aetherial Alchemist: Starlight Arc',
      originalTitle: '星光のエーテル錬金術師',
      synopsis:
        'A young prodigy discovers an ancient star map encoded in alchemical scrolls, sparking an expedition across floating sky isles to awaken the legendary celestial engine.',
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
      genres: ['Fantasy', 'Adventure', 'Mystery', 'Magic'],
      year: 2026,
      status: 'Airing',
      folderPath: '/mnt/gdrive/anime/Aetherial Alchemist',
    },
    {
      id: 4,
      title: 'Solo Void Hunter: Genesis',
      originalTitle: '虚空の狩人',
      synopsis:
        'When dimensional fissures erupt worldwide spilling catastrophic void beasts, an outcast low-rank scout awakens a singular sovereign levelling ability.',
      coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80',
      genres: ['Action', 'Fantasy', 'Supernatural', 'Urban Fantasy'],
      year: 2025,
      status: 'Completed',
      folderPath: '/mnt/gdrive/anime/Solo Void Hunter',
    },
    {
      id: 5,
      title: 'Neon Ronin: Zero Protocol',
      originalTitle: 'ネオン浪人',
      synopsis:
        'An ex-corporate bodyguard operating in the subterranean alleyways takes on a suicide retrieval mission against an army of synthetics.',
      coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      genres: ['Cyberpunk', 'Action', 'Thriller'],
      year: 2024,
      status: 'Completed',
      folderPath: '/mnt/gdrive/anime/Neon Ronin',
    },
  ],
  seasons: [
    { id: 1, animeId: 1, seasonNumber: 1, coverImage: '', folderPath: '/mnt/gdrive/anime/Cyber Horizon 2099/Season 1' },
    { id: 2, animeId: 1, seasonNumber: 2, coverImage: '', folderPath: '/mnt/gdrive/anime/Cyber Horizon 2099/Season 2' },
    { id: 3, animeId: 2, seasonNumber: 1, coverImage: '', folderPath: '/mnt/gdrive/anime/Shadow of the Shogun/Season 1' },
    { id: 4, animeId: 3, seasonNumber: 1, coverImage: '', folderPath: '/mnt/gdrive/anime/Aetherial Alchemist/Season 1' },
    { id: 5, animeId: 4, seasonNumber: 1, coverImage: '', folderPath: '/mnt/gdrive/anime/Solo Void Hunter/Season 1' },
    { id: 6, animeId: 5, seasonNumber: 1, coverImage: '', folderPath: '/mnt/gdrive/anime/Neon Ronin/Season 1' },
  ],
  episodes: [
    // Cyber Horizon S1
    {
      id: 1,
      seasonId: 1,
      episodeNumber: 1,
      title: 'Neon Awakening',
      synopsis: 'Ren awakens in an abandoned mainframe ward with neural augments overclocked and corporate enforcers closing in.',
      filePath: '/mnt/gdrive/anime/Cyber Horizon 2099/Season 1/S01E01.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: 734,
    },
    {
      id: 2,
      seasonId: 1,
      episodeNumber: 2,
      title: 'Quantum Ghost in Shinjuku',
      synopsis: 'Tracking an encrypted sub-frequency leads to an underground hacker den under the water district.',
      filePath: '/mnt/gdrive/anime/Cyber Horizon 2099/Season 1/S01E02.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      duration: 653,
    },
    {
      id: 3,
      seasonId: 1,
      episodeNumber: 3,
      title: 'Neural Override',
      synopsis: 'A high-speed mag-rail pursuit through Sector 4 forces Ren to test his newly unlocked synthetic reflexes.',
      filePath: '/mnt/gdrive/anime/Cyber Horizon 2099/Season 1/S01E03.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      duration: 888,
    },
    {
      id: 4,
      seasonId: 1,
      episodeNumber: 4,
      title: 'Synthetic Dawn',
      synopsis: 'The truth behind the Archangel Protocol is broadcasted to the outer sectors, igniting a rebellion.',
      filePath: '/mnt/gdrive/anime/Cyber Horizon 2099/Season 1/S01E04.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: 596,
    },
    // Cyber Horizon S2
    {
      id: 5,
      seasonId: 2,
      episodeNumber: 1,
      title: 'Zero Latency',
      synopsis: 'Six months after the blackout, a mysterious ghost entity infiltrates orbital satellite relays.',
      filePath: '/mnt/gdrive/anime/Cyber Horizon 2099/Season 2/S02E01.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: 734,
    },
    // Shadow of the Shogun
    {
      id: 6,
      seasonId: 3,
      episodeNumber: 1,
      title: 'The Cursed Katana',
      synopsis: 'A midnight duel at the bamboo grove triggers ancient seal marks on Jin’s scarred arm.',
      filePath: '/mnt/gdrive/anime/Shadow of the Shogun/Season 1/S01E01.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      duration: 888,
    },
    {
      id: 7,
      seasonId: 3,
      episodeNumber: 2,
      title: 'Crimson River Crossing',
      synopsis: 'Imperial bounty hunters ambush the mountain shrine as night falls.',
      filePath: '/mnt/gdrive/anime/Shadow of the Shogun/Season 1/S01E02.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: 734,
    },
    // Aetherial Alchemist
    {
      id: 8,
      seasonId: 4,
      episodeNumber: 1,
      title: 'The Starlight Manuscript',
      synopsis: 'A forgotten library vault opens during the solar conjunction.',
      filePath: '/mnt/gdrive/anime/Aetherial Alchemist/Season 1/S01E01.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      duration: 653,
    },
    {
      id: 9,
      seasonId: 4,
      episodeNumber: 2,
      title: 'Island in the Clouds',
      synopsis: 'The crew’s skyship navigates through an electrostatic tempest toward Celestia.',
      filePath: '/mnt/gdrive/anime/Aetherial Alchemist/Season 1/S01E02.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: 596,
    },
    // Solo Void Hunter
    {
      id: 10,
      seasonId: 5,
      episodeNumber: 1,
      title: 'Rift Gate Incident',
      synopsis: 'A standard survey dungeon turns catastrophic when a double-gate materializes.',
      filePath: '/mnt/gdrive/anime/Solo Void Hunter/Season 1/S01E01.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: 734,
    },
    {
      id: 11,
      seasonId: 5,
      episodeNumber: 2,
      title: 'Sovereign Awakening',
      synopsis: 'Left for dead, Leo hears the ominous chime of an eternal quest system.',
      filePath: '/mnt/gdrive/anime/Solo Void Hunter/Season 1/S01E02.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      duration: 888,
    },
    // Neon Ronin
    {
      id: 12,
      seasonId: 6,
      episodeNumber: 1,
      title: 'Contract in Sector 9',
      synopsis: 'A high-profile rescue turns into an assassination setup in the smog district.',
      filePath: '/mnt/gdrive/anime/Neon Ronin/Season 1/S01E01.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: 596,
    },
  ],
  requests: [
    {
      id: 1,
      userId: 2,
      username: 'OtakuRider',
      animeTitle: 'Dandadan',
      notes: 'Season 1 1080p dual audio if possible, loving the occult battles!',
      status: 'Added',
      unread: false,
      createdAt: '2026-10-12 18:22',
    },
    {
      id: 2,
      userId: 3,
      username: 'Kagami',
      animeTitle: 'Frieren: Beyond Journey’s End',
      notes: 'High quality bluray rip for S01',
      status: 'Added',
      unread: false,
      createdAt: '2026-10-14 09:15',
    },
    {
      id: 3,
      userId: 1,
      username: 'Admin',
      animeTitle: 'Chainsaw Man: Reze Arc',
      notes: 'When movie releases in digital format',
      status: 'Pending',
      unread: true,
      createdAt: '2026-10-15 11:30',
    },
  ],
  comments: [
    {
      id: 1,
      animeId: 1,
      userId: 2,
      username: 'OtakuRider',
      avatar: '',
      content: 'The animation in episode 3 is mind-blowing! Studio really outdid themselves with the combat choreo.',
      createdAt: '2026-10-14 20:41',
    },
    {
      id: 2,
      animeId: 1,
      userId: 3,
      username: 'Kagami',
      avatar: '',
      content: 'OST gives huge Ghost in the Shell vibes. 10/10 recommendation.',
      createdAt: '2026-10-15 02:14',
    },
    {
      id: 3,
      animeId: 2,
      userId: 1,
      username: 'Admin',
      avatar: '',
      content: 'Added the full S01 bluray encode directly from Google Drive. Enjoy the crystal clear 1080p!',
      createdAt: '2026-10-13 15:30',
    },
  ],
  progress: {
    '1_1': { position: 420, duration: 734, watched: false, updatedAt: '2026-10-15 13:40:12' },
    '1_6': { position: 310, duration: 888, watched: false, updatedAt: '2026-10-14 19:22:05' },
    '1_10': { position: 710, duration: 734, watched: true, updatedAt: '2026-10-13 11:05:00' },
  },
  ratings: {
    '1_1': 9,
    '2_1': 10,
    '1_2': 9,
    '3_2': 8,
    '1_4': 9,
  },
  favorites: {
    '1_1': true,
    '1_2': true,
  },
};

// Helper: Calculate average ratings
function computeAnimeRating(animeId: number) {
  const suffix = `_${animeId}`;
  let sum = 0;
  let count = 0;
  for (const [key, score] of Object.entries(store.ratings)) {
    if (key.endsWith(suffix) && score >= 1 && score <= 10) {
      sum += score;
      count++;
    }
  }
  if (count === 0) return { avg: '', count: 0 };
  return { avg: (sum / count).toFixed(1), count };
}

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// 1. Get Anime Catalog
app.get('/api/anime', (req, res) => {
  const userId = 1; // Default current user
  const favOnly = req.query.fav === '1';
  const q = String(req.query.q || '').toLowerCase().trim();

  const seasonMap = new Map<number, number[]>();
  for (const s of store.seasons) {
    if (!seasonMap.has(s.animeId)) seasonMap.set(s.animeId, []);
    seasonMap.get(s.animeId)!.push(s.id);
  }

  const epMap = new Map<number, number>();
  for (const ep of store.episodes) {
    epMap.set(ep.seasonId, (epMap.get(ep.seasonId) || 0) + 1);
  }

  let list = store.animes.map((a) => {
    const sIds = seasonMap.get(a.id) || [];
    let epCount = 0;
    for (const sid of sIds) {
      epCount += epMap.get(sid) || 0;
    }
    const { avg, count } = computeAnimeRating(a.id);
    const isFav = !!store.favorites[`${userId}_${a.id}`];
    const userRating = store.ratings[`${userId}_${a.id}`] || 0;

    return {
      ...a,
      seasonCount: sIds.length,
      episodeCount: epCount,
      avgRating: avg,
      ratingCount: count,
      isFavorite: isFav,
      userRating,
    };
  });

  if (favOnly) {
    list = list.filter((a) => a.isFavorite);
  }
  if (q) {
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.originalTitle && a.originalTitle.toLowerCase().includes(q)) ||
        a.genres.some((g) => g.toLowerCase().includes(q))
    );
  }

  res.json(list);
});

// 2. Get Single Anime Details with Seasons, Episodes, Comments
app.get('/api/anime/:id', (req, res) => {
  const animeId = parseInt(req.params.id, 10);
  const userId = 1;
  const anime = store.animes.find((a) => a.id === animeId);
  if (!anime) {
    return res.status(404).json({ error: 'Anime not found' });
  }

  const { avg, count } = computeAnimeRating(anime.id);
  const isFav = !!store.favorites[`${userId}_${anime.id}`];
  const userRating = store.ratings[`${userId}_${anime.id}`] || 0;

  const seasons = store.seasons
    .filter((s) => s.animeId === animeId)
    .sort((a, b) => a.seasonNumber - b.seasonNumber);

  const episodes = store.episodes
    .filter((e) => seasons.some((s) => s.id === e.seasonId))
    .map((e) => {
      const prog = store.progress[`${userId}_${e.id}`];
      let pct = 0;
      if (prog && prog.duration > 0) {
        pct = Math.min(100, Math.round((prog.position / prog.duration) * 100));
      }
      return {
        ...e,
        savedPosition: prog ? prog.position : 0,
        progressPct: pct,
        watched: prog ? prog.watched : false,
      };
    })
    .sort((a, b) => a.episodeNumber - b.episodeNumber);

  const comments = store.comments
    .filter((c) => c.animeId === animeId)
    .sort((a, b) => b.id - a.id);

  res.json({
    ...anime,
    avgRating: avg,
    ratingCount: count,
    isFavorite: isFav,
    userRating,
    seasons,
    episodes,
    comments,
  });
});

// 3. Continue Watching List
app.get('/api/progress/continue', (req, res) => {
  const userId = 1;
  const continueList = [];

  const animeMap = new Map(store.animes.map((a) => [a.id, a]));
  const seasonMap = new Map(store.seasons.map((s) => [s.id, s]));

  for (const ep of store.episodes) {
    const prog = store.progress[`${userId}_${ep.id}`];
    if (!prog || prog.position <= 5 || prog.watched) continue;

    const season = seasonMap.get(ep.seasonId);
    if (!season) continue;
    const anime = animeMap.get(season.animeId);
    if (!anime) continue;

    let pct = 15;
    if (prog.duration > 0) {
      pct = Math.min(98, Math.round((prog.position / prog.duration) * 100));
    }

    const m = Math.floor(prog.position / 60);
    const s = Math.floor(prog.position % 60);
    const timeLabel = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    continueList.push({
      animeId: anime.id,
      animeTitle: anime.title,
      coverImage: season.coverImage || anime.coverImage,
      seasonId: season.id,
      seasonNumber: season.seasonNumber,
      episodeId: ep.id,
      episodeNumber: ep.episodeNumber,
      episodeTitle: ep.title,
      progressPct: pct,
      timeLabel,
      updatedAt: prog.updatedAt,
    });
  }

  continueList.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json(continueList.slice(0, 6));
});

// 4. Update Playback Progress
app.post('/api/progress', (req, res) => {
  const userId = 1;
  const { episodeId, position, duration, watched } = req.body;
  if (!episodeId) {
    return res.status(400).json({ error: 'Missing episodeId' });
  }

  const key = `${userId}_${episodeId}`;
  const existing = store.progress[key];
  const isWatched = watched || (duration > 0 && position / duration >= 0.88) || (existing && existing.watched);

  store.progress[key] = {
    position: Number(position) || 0,
    duration: Number(duration) || 0,
    watched: !!isWatched,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  res.json({ ok: true, progress: store.progress[key] });
});

// 5. Rate Anime (1-10)
app.post('/api/anime/rate', (req, res) => {
  const userId = 1;
  const { animeId, score } = req.body;
  const numScore = parseInt(score, 10);
  if (!animeId || numScore < 1 || numScore > 10) {
    return res.status(400).json({ error: 'Invalid animeId or score' });
  }

  store.ratings[`${userId}_${animeId}`] = numScore;
  const stats = computeAnimeRating(animeId);
  res.json({ ok: true, userRating: numScore, avgRating: stats.avg, ratingCount: stats.count });
});

// 6. Toggle Favorite
app.post('/api/anime/favorite', (req, res) => {
  const userId = 1;
  const { animeId } = req.body;
  if (!animeId) {
    return res.status(400).json({ error: 'Missing animeId' });
  }

  const key = `${userId}_${animeId}`;
  store.favorites[key] = !store.favorites[key];
  res.json({ ok: true, isFavorite: store.favorites[key] });
});

// 7. Post Comment
app.post('/api/anime/comment', (req, res) => {
  const userId = 1;
  const { animeId, content } = req.body;
  if (!animeId || !content || !content.trim()) {
    return res.status(400).json({ error: 'AnimeId and content are required' });
  }

  const user = store.users.find((u) => u.id === userId) || store.users[0];
  const newComment = {
    id: store.nextCommentId++,
    animeId: parseInt(animeId, 10),
    userId: user.id,
    username: user.username,
    avatar: user.avatar,
    content: content.trim(),
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  store.comments.push(newComment);
  res.json(newComment);
});

// 8. Delete Comment
app.delete('/api/anime/comment/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.comments.findIndex((c) => c.id === id);
  if (idx !== -1) {
    store.comments.splice(idx, 1);
  }
  res.json({ ok: true });
});

// 9. Anime Requests
app.get('/api/requests', (req, res) => {
  const userRequests = [...store.requests].sort((a, b) => b.id - a.id);
  res.json(userRequests);
});

app.post('/api/requests', (req, res) => {
  const userId = 1;
  const user = store.users.find((u) => u.id === userId) || store.users[0];
  const { animeTitle, notes } = req.body;
  if (!animeTitle || !animeTitle.trim()) {
    return res.status(400).json({ error: 'Anime title is required' });
  }

  const newReq = {
    id: store.nextReqId++,
    userId: user.id,
    username: user.username,
    animeTitle: animeTitle.trim(),
    notes: (notes || '').trim(),
    status: 'Pending' as const,
    unread: true,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  store.requests.push(newReq);
  res.json(newReq);
});

app.patch('/api/requests/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const reqItem = store.requests.find((r) => r.id === id);
  if (!reqItem) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (status === 'Delete') {
    store.requests = store.requests.filter((r) => r.id !== id);
    return res.json({ ok: true, deleted: true });
  }

  reqItem.status = status;
  res.json(reqItem);
});

// 10. Import Anime from Google Drive
app.post('/api/drive/import', (req, res) => {
  const { title, files, folderName } = req.body;
  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files provided for Google Drive import' });
  }

  const seriesTitle = title || folderName || files[0].name.replace(/\.[^/.]+$/, '');
  const animeId = store.nextAnimeId++;
  const seasonId = store.nextSeasonId++;

  const newAnime = {
    id: animeId,
    title: seriesTitle,
    synopsis: `Imported directly from Google Drive (${files.length} episode files found). Ready for playback in Sogenime.`,
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    genres: ['Google Drive', 'Personal Cloud'],
    year: new Date().getFullYear(),
    status: 'Completed' as const,
    folderPath: `Google Drive/${folderName || seriesTitle}`,
    isFromDrive: true,
  };

  store.animes.unshift(newAnime);

  store.seasons.push({
    id: seasonId,
    animeId,
    seasonNumber: 1,
    coverImage: '',
    folderPath: `Google Drive/${folderName || seriesTitle}/Season 1`,
  });

  files.forEach((f: any, idx: number) => {
    store.episodes.push({
      id: store.nextEpId++,
      seasonId,
      episodeNumber: idx + 1,
      title: f.name.replace(/\.[^/.]+$/, ''),
      synopsis: `Streamable video file from Google Drive (ID: ${f.id}).`,
      filePath: `gdrive://${f.id}`,
      videoUrl: f.webContentLink || `https://drive.google.com/file/d/${f.id}/preview`,
      duration: 1440,
      driveFileId: f.id,
    });
  });

  res.json({ ok: true, anime: newAnime, episodeCount: files.length });
});

// -------------------------------------------------------------
// Catalog Management & Admin Routes
// -------------------------------------------------------------

// Delete Anime by ID
app.delete('/api/anime/:id', (req, res) => {
  const animeId = parseInt(req.params.id, 10);
  const animeIndex = store.animes.findIndex((a) => a.id === animeId);
  if (animeIndex === -1) {
    return res.status(404).json({ error: 'Anime not found' });
  }

  // Remove anime
  store.animes.splice(animeIndex, 1);

  // Remove related seasons and episodes
  const seasonIds = store.seasons.filter((s) => s.animeId === animeId).map((s) => s.id);
  store.seasons = store.seasons.filter((s) => s.animeId !== animeId);
  store.episodes = store.episodes.filter((e) => !seasonIds.includes(e.seasonId));

  // Remove related comments
  store.comments = store.comments.filter((c) => c.animeId !== animeId);

  res.json({ ok: true, deletedAnimeId: animeId });
});

// Clear Sample Anime (leaves only user-imported / Google Drive anime)
app.post('/api/admin/anime/clear-samples', (req, res) => {
  const driveAnime = store.animes.filter((a) => a.isFromDrive);
  const driveAnimeIds = new Set(driveAnime.map((a) => a.id));

  store.animes = driveAnime;
  const driveSeasons = store.seasons.filter((s) => driveAnimeIds.has(s.animeId));
  const driveSeasonIds = new Set(driveSeasons.map((s) => s.id));
  store.seasons = driveSeasons;
  store.episodes = store.episodes.filter((e) => driveSeasonIds.has(e.seasonId));
  store.comments = store.comments.filter((c) => driveAnimeIds.has(c.animeId));

  res.json({ ok: true, remainingCount: store.animes.length });
});

// Restore Initial Sample Anime
app.post('/api/admin/anime/restore-samples', (req, res) => {
  // If sample series 1 already exists, skip
  if (!store.animes.some((a) => a.id === 1)) {
    store.animes.push({
      id: 1,
      title: 'Cyber Horizon 2099',
      originalTitle: 'サイバーホライズン 2099',
      synopsis:
        'In the neon-drenched megacity of Neo-Shinjuku, a rogue neural runner uncovers a classified quantum construct that controls humanity’s augmented consciousness.',
      coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      genres: ['Cyberpunk', 'Sci-Fi', 'Action'],
      year: 2026,
      status: 'Airing',
      folderPath: '/mnt/gdrive/anime/Cyber Horizon 2099',
    });

    store.seasons.push({
      id: 1,
      animeId: 1,
      seasonNumber: 1,
      coverImage: '',
      folderPath: '/mnt/gdrive/anime/Cyber Horizon 2099/Season 1',
    });

    store.episodes.push({
      id: 1,
      seasonId: 1,
      episodeNumber: 1,
      title: 'Neon Awakening',
      synopsis: 'Ren awakens in an abandoned mainframe ward.',
      filePath: '/mnt/gdrive/anime/Cyber Horizon 2099/Season 1/S01E01.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: 734,
    });
  }

  res.json({ ok: true, count: store.animes.length });
});

// -------------------------------------------------------------
// Vite middleware mounting & Static serving
// -------------------------------------------------------------
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Sogenime server running on http://localhost:${port}`);
});
