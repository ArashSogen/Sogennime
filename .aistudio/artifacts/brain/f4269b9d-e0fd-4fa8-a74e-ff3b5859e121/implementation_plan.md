# Sogenime — Anime Hub with Google Drive & Gemini Intelligence

Sogenime is an OLED-optimized, glassmorphism streaming platform and anime catalog inspired by self-hosted media servers. It seamlessly bridges Google Drive media streaming with a preloaded sample library, watch-history synchronization, user ratings, community comments, anime requests, and server-side Gemini 3.8 Flash intelligence for automated episode recaps and smart recommendations.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction has been synthesized based on your clarifying answers and original Go codebase:

- **Confirmed Decision 1 (Storage & Media)**: Hybrid Google Drive integration alongside a preloaded anime sample library. Users can sign in with Google Workspace OAuth to browse and stream anime video files directly from Google Drive (mimicking `/mnt/gdrive`), as well as explore pre-indexed series with active video playback.
- **Confirmed Decision 2 (Theme & Language)**: High-contrast OLED dark glassmorphism theme (`#000000` deep black, icy blue `#38bdf8` glow, vibrant orange `#f97316` badges) formatted in English, maintaining strict typographic hierarchy, responsive layout, and anti-clutter principles.
- **Confirmed Decision 3 (Gemini Intelligence)**: Server-side integration with `gemini-3.8-flash` offering three features:
  1. **AI Episode Catch-Up / Recap**: Generates a spoiler-free recap of previous episodes before continuing.
  2. **AI Anime Taste Matcher & Recommender**: Analyzes watch history and 1–10 star ratings to suggest similar anime.
  3. **Auto-Metadata & Synopsis Generator**: Automatically retrieves rich synopses, character highlights, and genre tags for newly imported Drive files.

---

### 1. Overview & Core Concept

- **What It Does**: A complete web-based anime hub allowing anime enthusiasts and personal collectors to organize, rate, review, request, and stream their anime collections from Google Drive and built-in libraries with automatic progress saving, resume timestamps, and auto-play next episode.
- **Target Audience / Persona**: Anime fans and media server owners wanting a fast, responsive streaming UI with Google Drive integration, zero setup friction, and AI-assisted cataloging.
- **Key Value**: Recreates the power of the original Go/Docker Sogenime system in a modern full-stack web application, eliminating manual rclone VPS mounts by connecting Google Drive directly, while enhancing the viewing experience with Gemini AI recaps.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Catalog & Hero Showcase**:
   - Hero banner showcasing featured anime with high-impact cover art, episode count, star rating, and a 1-click "Watch Now" action.
   - "Continue Watching" tray with saved progress bars and resume timestamps.
   - Comprehensive anime grid with instant search, watchlist filter (`My List`), and status tags.
2. **Watch & Video Player View**:
   - High-fidelity HTML5 video player with custom glassmorphism controls, playback speed selector (0.5x to 2x), theater mode toggle, and download affordance.
   - Season tabs and episode list with saved progress percentages and "Watched" indicators.
   - Auto-Play Next Episode toggle with automatic countdown on episode completion.
   - AI Episode Recap modal powered by Gemini 3.8 Flash.
   - Rating widget (1 to 10 stars) and community discussion comments.
3. **Google Drive Integration**:
   - "Connect Google Drive" action in header/admin panel.
   - Google Drive Picker and folder browser to select anime video files (`.mp4`, `.mkv`, `.webm`) and assign them to series or seasons.
4. **Anime Requests & Profile**:
   - User request submission form with admin review status (Pending / Added / Rejected).
   - User profile customization with avatar upload and watched episode counters.
5. **Admin Panel**:
   - Media manager, dead-file cleanup, user role permissions, password resets, and custom cover image uploads.

#### Visual Identity & Theme
- **Aesthetic Direction**: Sleek, immersive OLED glassmorphism. Deep true blacks with subtle ambient radial gradients in icy cyan and emerald, crisp frosted glass panels (`backdrop-blur-xl`), and glowing accent lines.
- **Color Palette**:
  - Neutral Canvas: OLED Black (`#000000`, `bg-black`)
  - Glass Surfaces: Dark Slate Acrylic (`rgba(14, 18, 25, 0.75)`, `border-slate-800/60`)
  - Primary Accent: Icy Cyan (`#38bdf8`, hover glow `#7dd3fc`)
  - Warm Highlight: Radiant Orange (`#f97316`)
  - Success / Watched: Emerald Green (`#10b981`)
- **Typography**:
  - Display / Headings: `Plus Jakarta Sans`, font-weight 700–800, tight tracking.
  - Body Prose: `DM Sans` / `Inter`, font-weight 400–500, line-height 1.6.
  - Metrics / Timestamps: `tabular-nums` for playback timers and ratings.
- **Zero-Pill Discipline**: Metadata displayed with clean typographic dots (`S01 · Ep 04 · 24 min`) rather than cluttered capsule badges. Single-line controls throughout.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Express + React Architecture**
  - *Chosen Approach*: Express server backend with Vite React frontend in a unified workspace. Express serves static assets, handles server-side Gemini API calls (`@google/genai`), and proxies Google Drive streaming tokens when necessary.
  - *Why*: Meets security guidelines (Gemini API keys stay strictly server-side) while providing instant reactive client-side navigation.
  - *Alternatives Considered*: Client-only app — rejected because Gemini API keys cannot be exposed to the browser.
- **Decision 2: Hybrid Media Engine (Drive API + Sample Collection)**
  - *Chosen Approach*: Bundled sample library with real playable anime streams and posters, complemented by client-side Google Workspace OAuth and Drive API file browser to index and play files from user Google Drives.
  - *Why*: Allows immediate out-of-the-box exploration while giving Google Drive users full access to their private libraries.
- **Decision 3: Server-Authoritative State & In-Memory Persistence with Local Storage Fallback**
  - *Chosen Approach*: Server-side in-memory JSON store matching the original `db.json` structure, paired with browser local storage for instant progress persistence and offline resilience.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client (React 19)                             │
│                                                                        │
│  ┌───────────────┐  ┌───────────────────┐  ┌────────────────────────┐  │
│  │ Top Bar & Nav │  │ Watch Player View │  │ Catalog & Hero Carousel│  │
│  │ Google Auth   │  │ Plyr/HTML5 + Rest │  │ Search & Watchlist     │  │
│  └───────┬───────┘  └─────────┬─────────┘  └───────────┬────────────┘  │
│          │                    │                        │               │
│          ▼                    ▼                        ▼               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                Client State & Local Progress Store               │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │ HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend (Express 4 Server)                      │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │   /api/anime, /stream │  │  /api/progress  │  │ /api/gemini/*     │  │
│  │   Catalog & File Data │  │  User Progress  │  │ Recaps & AI Match │  │
│  └───────────┬───────────┘  └────────┬───────┘  └─────────┬─────────┘  │
│              │                       │                    │            │
│              ▼                       ▼                    ▼            │
│  ┌───────────────────────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │ Sample Media & Covers │  │ Sogenime Store │  │  @google/genai    │  │
│  │ JSON Storage Engine   │  │   db.json      │  │ (gemini-3.8-flash)│  │
│  └───────────────────────┘  └────────────────┘  └───────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities
- **Anime**: ID, title, originalTitle, synopsis, coverImage, bannerImage, genres, seasonCount, episodeCount, avgRating, isFavorite.
- **Season**: ID, animeID, seasonNumber, coverImage, episodeCount.
- **Episode**: ID, seasonID, episodeNumber, title, synopsis, videoUrl, duration, savedPosition, watched.
- **UserSession & Profile**: ID, username, avatar, isAdmin, watchlist, ratings map (`animeId -> 1..10`).
- **AnimeRequest**: ID, userId, username, animeTitle, notes, status (`Pending`, `Added`, `Rejected`), createdAt.
- **Comment**: ID, animeId, userId, username, avatar, content, createdAt.

#### Interactive Component & State Mapping
- `PlayerBox`: HTML5 video with timeupdate debounced sync to `/api/progress`, auto-play next countdown, and theater mode toggle.
- `GoogleDriveBrowserModal`: Google Workspace OAuth connect button, folder listing, and "Add to Sogenime Library" handler.
- `GeminiRecapModal`: Asynchronously queries `/api/gemini/recap` for the current episode and renders structured spoiler-free key points.
- `AdminPanel`: Modals for editing anime titles, uploading covers, changing request status, and scanning storage.
